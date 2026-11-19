import { Body, ConflictException, Controller, Get, Inject, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { releaseHeldAffiliateEarnings } from '@mac/database';
import { z } from 'zod';
import { AdminOnly, Authed, SignedIn } from './auth';
import { Db, serial } from './db';
import { json } from './common';

@Controller('admin')
@UseGuards(SignedIn, AdminOnly)
export class AdminController {
  constructor(@Inject(Db) private db: Db) {}
  @Get('overview') async overview() {
    const [shops, orders, reports, users] = await Promise.all([this.db.shop.count(), this.db.order.count(), this.db.report.count({ where: { status: 'OPEN' } }), this.db.user.count()]);
    return { shops, orders, reports, users };
  }
  @Get('shops') shops() { return this.db.shop.findMany({ orderBy: { createdAt: 'desc' } }); }
  @Post('shops/:id/status') async shopStatus(@Req() req: Authed, @Param('id') shopId: string, @Body() body: unknown) {
    const data = z.object({ status: z.enum(['APPROVED', 'SUSPENDED']), reason: z.string().min(5).max(1000) }).strict().parse(body);
    return this.db.$transaction(async tx => {
      const shop = await tx.shop.update({ where: { id: shopId }, data: { status: data.status } });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `SHOP_${data.status}`, entityId: shopId, data: json(data) } });
      return shop;
    });
  }
  @Get('reports') reports() { return this.db.report.findMany({ where: { status: 'OPEN' }, include: { post: { include: { media: true, author: { select: { name: true } } } } }, orderBy: { createdAt: 'asc' }, take: 100 }); }
  @Post('posts/:id/moderate') async moderate(@Req() req: Authed, @Param('id') postId: string, @Body() body: unknown) {
    const data = z.object({ status: z.enum(['PUBLISHED', 'HIDDEN']), reason: z.string().min(5).max(1000) }).strict().parse(body);
    return this.db.$transaction(async tx => {
      const post = await tx.post.update({ where: { id: postId }, data: { status: data.status } });
      await tx.report.updateMany({ where: { postId, status: 'OPEN' }, data: { status: 'RESOLVED' } });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `POST_${data.status}`, entityId: postId, data: json(data) } });
      return post;
    });
  }
  @Get('audit') audit() { return this.db.auditLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } }); }
  @Get('shipments') shipments() { return this.db.shipment.findMany({ include: { shopOrder: { select: { shop: { select: { name: true } }, order: { select: { code: true } } } } }, take: 100, orderBy: { createdAt: 'desc' } }); }
  // This simulator is deliberately admin-only. It is not a public provider webhook.
  @Post('mock/shipments/:id/event') async mockEvent(@Req() req: Authed, @Param('id') shipmentId: string, @Body() body: unknown) {
    if (process.env.SHIPPING_PROVIDER !== 'mock') throw new NotFoundException();
    const data = z.object({ externalId: z.string().min(10).max(100), status: z.enum(['DELIVERED', 'DELIVERY_FAILED', 'RETURNED']) }).strict().parse(body);
    return serial(this.db, async tx => {
      const shipment = await tx.shipment.findUnique({ where: { id: shipmentId }, include: { shopOrder: { include: { order: { select: { affiliateUserId: true } } } } } });
      if (!shipment || shipment.provider !== 'mock') throw new NotFoundException();
      const duplicate = await tx.providerEvent.findUnique({ where: { provider_externalId: { provider: 'mock', externalId: data.externalId } } });
      if (duplicate) {
        const payload = duplicate.payload as Record<string, string>;
        if (payload.shipmentId !== shipmentId || payload.status !== data.status) throw new ConflictException('Event ID đã có nội dung khác');
        return { duplicate: true };
      }
      const allowed: Record<string, string[]> = { SHIPPED: ['DELIVERED', 'DELIVERY_FAILED'], DELIVERY_FAILED: ['DELIVERED', 'RETURNED'] };
      const ignored = !(allowed[shipment.status] ?? []).includes(data.status);
      await tx.providerEvent.create({ data: { provider: 'mock', externalId: data.externalId, payload: { shipmentId, status: data.status, ignored } } });
      if (ignored) return { ignored: true };
      await tx.shipment.update({ where: { id: shipmentId }, data: { status: data.status } });
      await tx.shopOrder.update({ where: { id: shipment.shopOrderId }, data: { status: data.status, ...(data.status === 'DELIVERED' ? { deliveredAt: new Date() } : {}) } });
      if (data.status === 'DELIVERED') {
        const order = shipment.shopOrder;
        const netSales = Math.max(0, order.subtotal - order.discount);
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'COD_COLLECTED_BY_CARRIER', amount: order.total, sourceKey: `cod:${order.id}` } });
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'PLATFORM_FEE_RECEIVABLE', amount: Math.round(netSales * order.feeBps / 10000), sourceKey: `fee:${order.id}` } });
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'TAX_WITHHOLDING_VAT_PIT', amount: -Math.round(netSales * 150 / 10000), sourceKey: `tax:${order.id}` } });
        if (order.order.affiliateUserId && netSales > 0) {
          await tx.affiliateEarning.create({
            data: {
              kocUserId: order.order.affiliateUserId,
              shopOrderId: order.id,
              amount: Math.round(netSales * 500 / 10000),
              status: 'HELD',
              holdUntil: new Date(Date.now() + 15 * 86400000),
            },
          });
        }
      }
      if (data.status === 'RETURNED') {
        await tx.affiliateEarning.updateMany({ where: { shopOrderId: shipment.shopOrderId, status: 'HELD' }, data: { status: 'CANCELLED' } });
      }
      // RETURNED goods await inspection; no automatic restock.
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `MOCK_${data.status}`, entityId: shipmentId, data: json(data) } });
      return { applied: true };
    });
  }
  @Get('affiliate') async affiliate() {
    const earnings = await this.db.affiliateEarning.findMany({
      include: { kocUser: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const summary = earnings.reduce(
      (acc, e) => {
        if (e.status === 'HELD') acc.held += e.amount;
        else if (e.status === 'AVAILABLE') acc.available += e.amount;
        else if (e.status === 'CANCELLED') acc.cancelled += e.amount;
        return acc;
      },
      { held: 0, available: 0, cancelled: 0 },
    );
    return { summary, earnings };
  }
  @Post('affiliate/release') async releaseAffiliate(@Req() req: Authed) {
    const released = await releaseHeldAffiliateEarnings(this.db);
    await this.db.auditLog.create({ data: { actorId: req.user.id, action: 'ADMIN_AFFILIATE_RELEASE', entityId: 'affiliate', data: { released } } });
    return { released };
  }
  @Get('tax-report') async getTaxReport() {
    const shops = await this.db.shop.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        slug: true,
        taxCode: true,
        origin: true,
        isMall: true,
        orders: {
          where: { status: 'DELIVERED' },
          select: { id: true, total: true, subtotal: true, discount: true, deliveredAt: true },
        },
        ledger: {
          where: { kind: 'TAX_WITHHOLDING_VAT_PIT' },
          select: { id: true, amount: true, createdAt: true },
        },
      },
    });

    const reportData = shops.map(s => {
      const totalDeliveredOrders = s.orders.length;
      const totalRevenue = s.orders.reduce((sum, o) => sum + o.total, 0);
      const totalTaxWithheld = Math.abs(s.ledger.reduce((sum, l) => sum + l.amount, 0));
      return {
        shopId: s.id,
        shopName: s.name,
        slug: s.slug,
        taxCode: s.taxCode || 'CHƯA_KÊ_KHAI',
        origin: s.origin,
        isMall: s.isMall,
        totalDeliveredOrders,
        totalRevenue,
        totalTaxWithheld,
      };
    });

    const totalSystemRevenue = reportData.reduce((s, r) => s + r.totalRevenue, 0);
    const totalSystemTaxWithheld = reportData.reduce((s, r) => s + r.totalTaxWithheld, 0);

    return {
      decree: 'Nghị định 91/2022/NĐ-CP & Thông tư 40/2021/TT-BTC',
      period: `Quý ${Math.floor(new Date().getMonth() / 3) + 1}/${new Date().getFullYear()}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalShops: reportData.length,
        totalRevenue: totalSystemRevenue,
        totalTaxWithheld: totalSystemTaxWithheld,
      },
      items: reportData,
    };
  }
  @Post('shops/:id/mall') async setMallStatus(@Req() req: Authed, @Param('id') shopId: string, @Body() body: unknown) {
    const data = z.object({ isMall: z.boolean(), taxCode: z.string().trim().max(30).optional() }).strict().parse(body);
    const shop = await this.db.shop.update({
      where: { id: shopId },
      data: { isMall: data.isMall, ...(data.taxCode !== undefined ? { taxCode: data.taxCode } : {}) },
    });
    await this.db.auditLog.create({
      data: { actorId: req.user.id, action: `SHOP_MALL_${data.isMall ? 'VERIFIED' : 'REVOKED'}`, entityId: shopId, data: json(data) },
    });
    return shop;
  }
  @Get('disputes') async getDisputes() {
    const disputes = await this.db.returnRequest.findMany({
      where: { status: 'DISPUTED' },
      include: {
        items: {
          include: {
            orderItem: {
              include: {
                shopOrder: {
                  select: { id: true, order: { select: { code: true } }, shop: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const userIds = [...new Set(disputes.map(d => d.userId))];
    const users = await this.db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } });
    const userMap = new Map(users.map(u => [u.id, u]));
    return disputes.map(d => ({ ...d, user: userMap.get(d.userId) }));
  }
  @Post('disputes/:id/arbitrate') async arbitrateDispute(
    @Req() req: Authed,
    @Param('id') returnId: string,
    @Body() body: unknown,
  ) {
    const data = z.object({
      decision: z.enum(['REFUND', 'REJECT']),
      note: z.string().trim().min(5).max(1000),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const rr = await tx.returnRequest.findUnique({
        where: { id: returnId },
        include: { items: { include: { orderItem: true } } },
      });
      if (!rr) throw new NotFoundException('Không tìm thấy khiếu nại');
      if (rr.status !== 'DISPUTED') throw new ConflictException('Yêu cầu không trong trạng thái tranh chấp cần trọng tài');
      if (data.decision === 'REFUND') {
        const totalRefund = rr.items.reduce((s, i) => s + i.refundAmount, 0);
        const shopOrderId = rr.items[0]?.orderItem.shopOrderId;
        if (totalRefund > 0) {
          await tx.sellerLedgerEntry.create({
            data: {
              shopId: rr.shopId,
              shopOrderId,
              kind: 'DISPUTE_REFUND_DEBIT',
              amount: -totalRefund,
              sourceKey: `dispute:${rr.id}`,
            },
          });
        }
        if (shopOrderId) {
          await tx.shopOrder.update({ where: { id: shopOrderId }, data: { status: 'RETURNED' } });
          await tx.affiliateEarning.updateMany({ where: { shopOrderId, status: 'HELD' }, data: { status: 'CANCELLED' } });
        }
        await tx.auditLog.create({
          data: { actorId: req.user.id, action: 'DISPUTE_ARBITRATE_REFUND', entityId: rr.id, data: { note: data.note, totalRefund } },
        });
        return tx.returnRequest.update({
          where: { id: rr.id },
          data: { status: 'COMPLETED' },
          include: { items: true },
        });
      } else {
        await tx.auditLog.create({
          data: { actorId: req.user.id, action: 'DISPUTE_ARBITRATE_REJECT', entityId: rr.id, data: { note: data.note } },
        });
        return tx.returnRequest.update({
          where: { id: rr.id },
          data: { status: 'REJECTED' },
          include: { items: true },
        });
      }
    });
  }
  @Get('products') async products() {
    return this.db.product.findMany({
      include: {
        shop: { select: { id: true, name: true, slug: true } },
        variants: { include: { inventory: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  @Post('products/:id/circuit-breaker') async circuitBreaker(
    @Req() req: Authed,
    @Param('id') productId: string,
    @Body() body: unknown,
  ) {
    const data = z.object({
      reason: z.string().trim().min(5).max(1000),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
      const updated = await tx.product.update({
        where: { id: productId },
        data: { status: 'HIDDEN' },
      });
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'ADMIN_CIRCUIT_BREAKER_TRIGGER',
          entityId: productId,
          data: {
            reason: data.reason,
            productName: product.name,
            timestamp: new Date().toISOString(),
          },
        },
      });
      return { success: true, product: updated };
    });
  }
}
