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
}
