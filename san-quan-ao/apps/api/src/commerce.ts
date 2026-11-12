import { Body, ConflictException, Controller, Delete, Get, Inject, Injectable, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { QuoteData, QuoteShop } from '@mac/contracts';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial, Tx } from './db';
import { addressInput, allocateDiscount, hash, id, json } from './common';

const orderInclude = { shops: { include: { shop: { select: { name: true } }, items: { include: { reviews: { select: { id: true, rating: true } } } }, shipment: true }, orderBy: { shopId: 'asc' as const } } };
@Injectable()
export class Commerce {
  constructor(@Inject(Db) private db: Db) {}
  async price(tx: Tx, userId: string, addressId: string, codes: Record<string, string>): Promise<QuoteData> {
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ của bạn');
    const lines = await tx.cartLine.findMany({
      where: { userId }, orderBy: { variantId: 'asc' },
      include: { variant: { include: {
        inventory: true,
        product: { include: { shop: true, images: { orderBy: { position: 'asc' } }, sizeCharts: { orderBy: { version: 'desc' }, take: 1 } } },
      } } },
    });
    if (!lines.length) throw new ConflictException('Giỏ hàng đang trống');
    if (lines.length > 50) throw new ConflictException('Mỗi lần đặt tối đa 50 dòng');
    const groups = new Map<string, QuoteShop>();
    for (const line of lines) {
      const v = line.variant, p = v.product, inv = v.inventory;
      if (!v.active || p.status !== 'ACTIVE' || p.shop.status !== 'APPROVED') throw new ConflictException({ code: 'ITEM_UNAVAILABLE', message: `${p.name} đã ngừng bán`, variantId: v.id });
      if (!inv || inv.onHand - inv.reserved < line.quantity) throw new ConflictException({ code: 'OUT_OF_STOCK', message: `${p.name} / ${v.color} / ${v.size} không đủ hàng`, variantId: v.id, available: inv ? inv.onHand - inv.reserved : 0 });
      if (!groups.has(v.shopId)) groups.set(v.shopId, { shopId: v.shopId, shopName: p.shop.name, items: [], subtotal: 0, discount: 0, shipping: 30000, total: 0 });
      const group = groups.get(v.shopId)!;
      group.items.push({ variantId: v.id, productId: p.id, shopId: v.shopId, name: p.name, sku: v.sku, color: v.color, size: v.size, price: v.price, quantity: line.quantity, image: (p.images.find(i => i.color === v.color) ?? p.images[0])?.url ?? '', sizeChart: p.sizeCharts[0] ?? null, policy: p.shop.returnPolicy });
      group.subtotal += v.price * line.quantity;
    }
    for (const group of groups.values()) {
      const code = codes[group.shopId];
      if (code) {
        const voucher = await tx.voucher.findUnique({ where: { shopId_code: { shopId: group.shopId, code } } });
        if (!voucher || voucher.expiresAt <= new Date() || voucher.uses >= voucher.maxUses || group.subtotal < voucher.minimum) throw new ConflictException(`Mã ${code} không áp dụng được cho ${group.shopName}`);
        group.discount = Math.min(voucher.amount, group.subtotal);
      }
      group.total = group.subtotal - group.discount + group.shipping;
    }
    for (const shopId of Object.keys(codes)) if (shopId !== '_tradeIn' && !groups.has(shopId)) throw new ConflictException('Voucher không thuộc shop trong giỏ');
    const shops = [...groups.values()].sort((a, b) => a.shopId.localeCompare(b.shopId));
    const preTotal = shops.reduce((s, g) => s + g.total, 0);
    let platformDiscount = 0;
    const tradeInCode = codes._tradeIn?.trim().toUpperCase();
    if (tradeInCode) {
      const ti = await tx.tradeInRequest.findFirst({ where: { voucherCode: tradeInCode, userId, status: 'APPROVED', redeemedOrderId: null } });
      if (!ti || !ti.finalValue) throw new ConflictException(`Mã Trade-In ${tradeInCode} không hợp lệ hoặc đã sử dụng`);
      platformDiscount = Math.min(ti.finalValue, preTotal);
    }
    return { shops, platformDiscount, ...(tradeInCode ? { tradeInCode } : {}), total: preTotal - platformDiscount, address: { recipient: address.recipient, phone: address.phone, line: address.line, province: address.province }, provider: 'mock' };
  }
  async quote(userId: string, addressId: string, codes: Record<string, string>) {
    return serial(this.db, async tx => {
      const data = await this.price(tx, userId, addressId, codes);
      return tx.checkoutQuote.create({ data: { userId, addressId, voucherCodes: codes, data: json(data), fingerprint: hash(JSON.stringify(data)), expiresAt: new Date(Date.now() + 10 * 60000) } });
    });
  }
  async order(userId: string, quoteId: string, key: string, refUserId?: string) {
    return serial(this.db, async tx => {
      const existing = await tx.order.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey: key } }, include: orderInclude });
      if (existing) {
        if (existing.quoteId !== quoteId) throw new ConflictException('Khóa đặt hàng đã dùng cho một báo giá khác');
        return existing;
      }
      const quote = await tx.checkoutQuote.findFirst({ where: { id: quoteId, userId }, include: { order: true } });
      if (!quote) throw new NotFoundException('Không tìm thấy báo giá');
      if (quote.order) return tx.order.findUniqueOrThrow({ where: { id: quote.order.id }, include: orderInclude });
      if (quote.expiresAt <= new Date()) throw new ConflictException({ code: 'QUOTE_EXPIRED', message: 'Báo giá hết hạn. Vui lòng lấy báo giá mới.' });
      const codes = quote.voucherCodes as Record<string, string>;
      const current = await this.price(tx, userId, quote.addressId, codes);
      if (hash(JSON.stringify(current)) !== quote.fingerprint) throw new ConflictException({ code: 'QUOTE_CHANGED', message: 'Giỏ, giá hoặc địa chỉ đã thay đổi. Vui lòng kiểm tra báo giá mới.', quote: current });
      // Conditional updates run in stable order and are committed with the order.
      const items = current.shops.flatMap(g => g.items).sort((a, b) => a.variantId.localeCompare(b.variantId));
      for (const item of items) {
        const changed = await tx.$executeRaw`UPDATE "InventoryBalance" SET "reserved" = "reserved" + ${item.quantity} WHERE "variantId" = ${item.variantId} AND "onHand" - "reserved" >= ${item.quantity}`;
        if (!changed) throw new ConflictException({ code: 'OUT_OF_STOCK', message: `${item.name} vừa hết hàng`, variantId: item.variantId });
      }
      const validRef = refUserId && refUserId !== userId ? (await tx.user.findUnique({ where: { id: refUserId }, select: { id: true } }))?.id : undefined;
      const order = await tx.order.create({ data: { code: `NX-${randomUUID().slice(0, 8).toUpperCase()}`, userId, quoteId, idempotencyKey: key, total: current.total, platformDiscount: current.platformDiscount ?? 0, ...(validRef ? { affiliateUserId: validRef } : {}), address: json(current.address) } });
      if (current.tradeInCode) {
        const redeemed = await tx.tradeInRequest.updateMany({ where: { voucherCode: current.tradeInCode, userId, status: 'APPROVED', redeemedOrderId: null }, data: { redeemedOrderId: order.id } });
        if (redeemed.count !== 1) throw new ConflictException(`Mã Trade-In ${current.tradeInCode} vừa được sử dụng`);
      }
      for (const group of current.shops) {
        const shop = await tx.shop.findUniqueOrThrow({ where: { id: group.shopId } });
        let voucherId: string | undefined;
        if (codes[group.shopId]) {
          const voucher = await tx.voucher.findUniqueOrThrow({ where: { shopId_code: { shopId: group.shopId, code: codes[group.shopId] } } });
          await tx.voucher.update({ where: { id: voucher.id }, data: { uses: { increment: 1 } } });
          voucherId = voucher.id;
        }
        const discount = allocateDiscount(group.discount, group.items.map(i => i.price * i.quantity));
        const holdUntil = new Date(Date.now() + 24 * 3600000);
        await tx.shopOrder.create({ data: { orderId: order.id, shopId: group.shopId, subtotal: group.subtotal, discount: group.discount, shipping: group.shipping, total: group.total, feeBps: shop.feeBps, voucherId, holdUntil, items: { create: group.items.map((item, i) => ({ variantId: item.variantId, productId: item.productId, quantity: item.quantity, unitPrice: item.price, discount: discount[i], snapshot: json(item), reservation: { create: { variantId: item.variantId, quantity: item.quantity, expiresAt: holdUntil } } })) } } });
      }
      await tx.cartLine.deleteMany({ where: { userId } });
      await tx.outboxEvent.create({ data: { kind: 'ORDER_CREATED', payload: { orderId: order.id, userId } } });
      await tx.auditLog.create({ data: { actorId: userId, action: 'ORDER_CREATE', entityId: order.id, data: { total: order.total } } });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    });
  }
  async cancel(userId: string, shopOrderId: string) {
    return serial(this.db, async tx => {
      const order = await tx.shopOrder.findFirst({ where: { id: shopOrderId, order: { userId } }, include: { items: { include: { reservation: true } } } });
      if (!order) throw new NotFoundException('Không tìm thấy đơn');
      if (order.status === 'CANCELLED') return order;
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) throw new ConflictException('Đơn đã đóng gói hoặc xuất kho, vui lòng liên hệ shop');
      for (const item of [...order.items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
        const changed = await tx.reservation.updateMany({ where: { orderItemId: item.id, status: 'ACTIVE' }, data: { status: 'RELEASED' } });
        if (changed.count) await tx.inventoryBalance.update({ where: { variantId: item.variantId }, data: { reserved: { decrement: item.quantity } } });
      }
      if (order.voucherId) await tx.voucher.update({ where: { id: order.voucherId }, data: { uses: { decrement: 1 } } });
      await tx.auditLog.create({ data: { actorId: userId, action: 'ORDER_CANCEL', entityId: shopOrderId, data: {} } });
      return tx.shopOrder.update({ where: { id: shopOrderId }, data: { status: 'CANCELLED' } });
    });
  }
}
@Controller()
@UseGuards(SignedIn)
export class CommerceController {
  constructor(@Inject(Db) private db: Db, @Inject(Commerce) private commerce: Commerce, @Inject(Auth) private auth: Auth) {}
  @Get('addresses') addresses(@Req() req: Authed) { return this.db.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }); }
  @Post('addresses') address(@Req() req: Authed, @Body() body: unknown) { return this.db.address.create({ data: { ...addressInput.parse(body), userId: req.user.id } }); }
  @Get('cart') cart(@Req() req: Authed) {
    return this.db.cartLine.findMany({ where: { userId: req.user.id }, orderBy: { id: 'asc' }, include: { variant: { include: {
      inventory: true, product: { include: { shop: { select: { id: true, name: true } }, images: { orderBy: { position: 'asc' } } } },
    } } } });
  }
  @Post('cart') async add(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ variantId: id, quantity: z.number().int().min(1).max(20) }).strict().parse(body);
    return serial(this.db, async tx => {
      const variant = await tx.variant.findFirst({ where: { id: data.variantId, active: true, product: { status: 'ACTIVE', shop: { status: 'APPROVED' } } }, include: { inventory: true } });
      if (!variant) throw new NotFoundException('Sản phẩm không còn bán');
      const prior = await tx.cartLine.findUnique({ where: { userId_variantId: { userId: req.user.id, variantId: data.variantId } } });
      const quantity = (prior?.quantity ?? 0) + data.quantity;
      if (quantity > 20 || !variant.inventory || quantity > variant.inventory.onHand - variant.inventory.reserved) throw new ConflictException('Số lượng vượt tồn hiện tại hoặc giới hạn 20 món mỗi SKU');
      return tx.cartLine.upsert({ where: { userId_variantId: { userId: req.user.id, variantId: data.variantId } }, create: { userId: req.user.id, variantId: data.variantId, quantity }, update: { quantity } });
    });
  }
  @Patch('cart/:id') async updateLine(@Req() req: Authed, @Param('id') lineId: string, @Body() body: unknown) {
    const { quantity } = z.object({ quantity: z.number().int().min(1).max(20) }).strict().parse(body);
    const result = await this.db.cartLine.updateMany({ where: { id: lineId, userId: req.user.id }, data: { quantity } });
    if (!result.count) throw new NotFoundException();
    return { ok: true };
  }
  @Delete('cart/:id') async remove(@Req() req: Authed, @Param('id') lineId: string) { await this.db.cartLine.deleteMany({ where: { id: lineId, userId: req.user.id } }); return { ok: true }; }
  @Post('checkout/quote') quote(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ addressId: id, vouchers: z.record(id, z.string().max(30)).default({}), tradeInCode: z.string().trim().max(30).optional() }).strict().parse(body);
    const codes = data.tradeInCode ? { ...data.vouchers, _tradeIn: data.tradeInCode } : data.vouchers;
    return this.commerce.quote(req.user.id, data.addressId, codes);
  }
  @Post('orders') createOrder(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ quoteId: id, idempotencyKey: z.string().min(16).max(100), refUserId: id.optional() }).strict().parse(body);
    return this.commerce.order(req.user.id, data.quoteId, data.idempotencyKey, data.refUserId);
  }
  @Get('orders') orders(@Req() req: Authed) { return this.db.order.findMany({ where: { userId: req.user.id }, include: orderInclude, take: 50, orderBy: { createdAt: 'desc' } }); }
  @Get('orders/:id') async orderDetail(@Req() req: Authed, @Param('id') orderId: string) {
    const order = await this.db.order.findFirst({ where: { id: orderId, userId: req.user.id }, include: orderInclude });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }
  @Post('orders/shops/:id/cancel') cancel(@Req() req: Authed, @Param('id') shopOrderId: string) { return this.commerce.cancel(req.user.id, shopOrderId); }
  @Get('seller/shops/:shopId/orders') async sellerOrders(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const rows = await this.db.shopOrder.findMany({ where: { shopId }, include: { items: true, shipment: true, order: { select: { code: true, address: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map(row => {
      if (!['DELIVERED', 'CANCELLED', 'RETURNED'].includes(row.status)) return row;
      const addr = row.order.address as { recipient: string; phone: string; line: string; province: string };
      return {
        ...row,
        order: {
          ...row.order,
          address: {
            recipient: addr.recipient,
            phone: addr.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
            line: '*** (Đã ẩn theo PDPD NĐ 13/2023)',
            province: addr.province,
          },
        },
      };
    });
  }
  @Post('seller/shops/:shopId/orders/:orderId/transition') async transition(@Req() req: Authed, @Param('shopId') shopId: string, @Param('orderId') orderId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const { status } = z.object({ status: z.enum(['CONFIRMED', 'PACKED', 'SHIPPED']) }).strict().parse(body);
    return serial(this.db, async tx => {
      const order = await tx.shopOrder.findFirst({ where: { id: orderId, shopId }, include: { items: true } });
      if (!order) throw new NotFoundException('Đơn không thuộc shop');
      if (order.status === status) return order;
      const preceding = { CONFIRMED: 'PENDING', PACKED: 'CONFIRMED', SHIPPED: 'PACKED' };
      if (order.status !== preceding[status]) throw new ConflictException('Không thể chuyển trạng thái này');
      if (order.status === 'PENDING' && order.holdUntil <= new Date()) throw new ConflictException('Đơn đã hết thời gian chờ xác nhận');
      if (status === 'SHIPPED') {
        for (const item of [...order.items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
          const changed = await tx.reservation.updateMany({ where: { orderItemId: item.id, status: 'ACTIVE' }, data: { status: 'CONSUMED' } });
          if (changed.count !== 1) throw new ConflictException('Lượt giữ hàng không còn hợp lệ');
          await tx.inventoryBalance.update({ where: { variantId: item.variantId }, data: { onHand: { decrement: item.quantity }, reserved: { decrement: item.quantity } } });
          await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: -item.quantity, kind: 'DISPATCH', sourceKey: `dispatch:${item.id}`, actorId: req.user.id } });
        }
        await tx.shipment.create({ data: { shopOrderId: orderId, provider: 'mock', tracking: `MOCK-${orderId}`, status: 'SHIPPED', codAmount: order.total } });
      }
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `ORDER_${status}`, entityId: orderId, data: { provider: 'mock' } } });
      return tx.shopOrder.update({ where: { id: orderId }, data: { status } });
    });
  }

  @Post('reviews') async createReview(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ orderItemId: id, rating: z.number().int().min(1).max(5), body: z.string().trim().min(5).max(1000) }).strict().parse(body);
    return serial(this.db, async tx => {
      const item = await tx.orderItem.findFirst({
        where: { id: data.orderItemId, shopOrder: { order: { userId: req.user.id } } },
        include: { shopOrder: true, reviews: true },
      });
      if (!item) throw new NotFoundException('Không tìm thấy sản phẩm trong đơn hàng của bạn');
      if (item.shopOrder.status !== 'DELIVERED') throw new ConflictException('Chỉ có thể đánh giá sau khi đơn hàng đã giao');
      if (item.reviews.length) throw new ConflictException('Sản phẩm này đã được đánh giá');
      const review = await tx.review.create({
        data: { userId: req.user.id, productId: item.productId, orderItemId: item.id, rating: data.rating, body: data.body },
      });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'REVIEW_CREATE', entityId: review.id, data: { productId: item.productId, rating: data.rating } } });
      return review;
    });
  }

  @Get('returns') returns(@Req() req: Authed) {
    return this.db.returnRequest.findMany({ where: { userId: req.user.id }, include: { items: { include: { orderItem: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post('orders/shops/:id/returns') async createReturn(@Req() req: Authed, @Param('id') shopOrderId: string, @Body() body: unknown) {
    const data = z.object({
      kind: z.enum(['EXCHANGE', 'REFUND']),
      reason: z.string().trim().min(5).max(500),
      items: z.array(z.object({ orderItemId: id, quantity: z.number().int().min(1).max(20), replacementVariantId: id.optional() }).strict()).min(1).max(20),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const shopOrder = await tx.shopOrder.findFirst({ where: { id: shopOrderId, order: { userId: req.user.id } }, include: { items: true } });
      if (!shopOrder) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (shopOrder.status !== 'DELIVERED') throw new ConflictException('Chỉ hỗ trợ đổi size hoặc hoàn trả sau khi đã nhận hàng');
      if (shopOrder.deliveredAt && Date.now() - shopOrder.deliveredAt.getTime() > 7 * 86400000) throw new ConflictException('Đã quá hạn 7 ngày yêu cầu đổi/trả');
      const itemMap = new Map(shopOrder.items.map(i => [i.id, i]));
      const existingReturns = await tx.returnItem.findMany({
        where: { orderItemId: { in: data.items.map(i => i.orderItemId) }, request: { status: { in: ['REQUESTED', 'APPROVED', 'COMPLETED'] } } },
      });
      const returnedQty = new Map<string, number>();
      for (const r of existingReturns) returnedQty.set(r.orderItemId, (returnedQty.get(r.orderItemId) ?? 0) + r.quantity);
      const returnItems: { orderItemId: string; quantity: number; replacementVariantId?: string; refundAmount: number }[] = [];
      for (const reqItem of data.items) {
        const orderItem = itemMap.get(reqItem.orderItemId);
        if (!orderItem) throw new NotFoundException('Sản phẩm không thuộc đơn hàng này');
        const used = returnedQty.get(orderItem.id) ?? 0;
        if (used + reqItem.quantity > orderItem.quantity) throw new ConflictException('Số lượng đổi/trả vượt quá số lượng đã mua');
        const unitNet = Math.max(0, Math.floor((orderItem.unitPrice * orderItem.quantity - orderItem.discount) / orderItem.quantity));
        returnItems.push({
          orderItemId: orderItem.id,
          quantity: reqItem.quantity,
          replacementVariantId: data.kind === 'EXCHANGE' ? reqItem.replacementVariantId : undefined,
          refundAmount: data.kind === 'REFUND' ? unitNet * reqItem.quantity : 0,
        });
      }
      const created = await tx.returnRequest.create({
        data: { userId: req.user.id, shopId: shopOrder.shopId, reason: data.reason, kind: data.kind, items: { create: returnItems } },
        include: { items: true },
      });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'RETURN_REQUEST', entityId: created.id, data: { shopOrderId, kind: data.kind } } });
      return created;
    });
  }

  @Get('seller/shops/:shopId/returns') async sellerReturns(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.returnRequest.findMany({ where: { shopId }, include: { items: { include: { orderItem: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Post('seller/shops/:shopId/returns/:returnId/decision') async decideReturn(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('returnId') returnId: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId);
    const { status } = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']) }).strict().parse(body);
    return serial(this.db, async tx => {
      const rr = await tx.returnRequest.findFirst({ where: { id: returnId, shopId }, include: { items: { include: { orderItem: true } } } });
      if (!rr) throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả');
      if (rr.status === status) return rr;
      const allowed: Record<string, string[]> = { REQUESTED: ['APPROVED', 'REJECTED'], APPROVED: ['COMPLETED'] };
      if (!(allowed[rr.status] ?? []).includes(status)) throw new ConflictException('Không thể chuyển trạng thái yêu cầu này');
      if (status === 'COMPLETED' && rr.kind === 'REFUND') {
        const totalRefund = rr.items.reduce((s, i) => s + i.refundAmount, 0);
        if (totalRefund > 0) {
          await tx.sellerLedgerEntry.create({
            data: { shopId, shopOrderId: rr.items[0]?.orderItem.shopOrderId, kind: 'REFUND_DEBIT', amount: -totalRefund, sourceKey: `refund:${rr.id}` },
          });
        }
        const shopOrderId = rr.items[0]?.orderItem.shopOrderId;
        if (shopOrderId) {
          await tx.shopOrder.update({ where: { id: shopOrderId }, data: { status: 'RETURNED' } });
          await tx.affiliateEarning.updateMany({ where: { shopOrderId, status: 'HELD' }, data: { status: 'CANCELLED' } });
        }
      }
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `RETURN_${status}`, entityId: rr.id, data: { shopId } } });
      return tx.returnRequest.update({ where: { id: rr.id }, data: { status }, include: { items: true } });
    });
  }

  @Get('seller/shops/:shopId/vouchers') async sellerVouchers(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.voucher.findMany({ where: { shopId }, orderBy: { expiresAt: 'desc' }, take: 50 });
  }

  @Post('seller/shops/:shopId/vouchers') async createVoucher(@Req() req: Authed, @Param('shopId') shopId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const data = z.object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/),
      amount: z.number().int().min(1000).max(50_000_000),
      minimum: z.number().int().min(0).max(100_000_000),
      maxUses: z.number().int().min(1).max(100000),
      daysValid: z.number().int().min(1).max(365).default(30),
    }).strict().parse(body);
    const voucher = await this.db.voucher.create({
      data: { shopId, code: data.code, amount: data.amount, minimum: data.minimum, maxUses: data.maxUses, expiresAt: new Date(Date.now() + data.daysValid * 86400000) },
    });
    await this.db.auditLog.create({ data: { actorId: req.user.id, action: 'VOUCHER_CREATE', entityId: voucher.id, data: { shopId, code: voucher.code } } });
    return voucher;
  }

  @Get('seller/shops/:shopId/ledger') async sellerLedger(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const entries = await this.db.sellerLedgerEntry.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 100 });
    const balance = entries.reduce((s, e) => s + e.amount, 0);
    const escrowCutoff = new Date(Date.now() - 7 * 86400000);
    const recentDelivered = await this.db.shopOrder.findMany({ where: { shopId, status: 'DELIVERED', deliveredAt: { gt: escrowCutoff } }, select: { total: true } });
    const openReturns = await this.db.returnRequest.findMany({ where: { shopId, status: { in: ['REQUESTED', 'APPROVED'] } }, include: { items: true } });
    const held = recentDelivered.reduce((s, o) => s + o.total, 0);
    const disputed = openReturns.reduce((s, r) => s + r.items.reduce((x, i) => x + i.refundAmount, 0), 0);
    const available = Math.max(0, balance - held - disputed);
    return { balance, available, held, disputed, entries };
  }
}
