import { Body, ConflictException, Controller, Delete, Get, Inject, Injectable, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { QuoteData, QuoteShop } from '@mac/contracts';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial, Tx } from './db';
import { addressInput, allocateDiscount, hash, id, json } from './common';

const orderInclude = { shops: { include: { shop: { select: { name: true } }, items: true, shipment: true }, orderBy: { shopId: 'asc' as const } } };
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
    for (const shopId of Object.keys(codes)) if (!groups.has(shopId)) throw new ConflictException('Voucher không thuộc shop trong giỏ');
    const shops = [...groups.values()].sort((a, b) => a.shopId.localeCompare(b.shopId));
    return { shops, total: shops.reduce((s, g) => s + g.total, 0), address: { recipient: address.recipient, phone: address.phone, line: address.line, province: address.province }, provider: 'mock' };
  }
  async quote(userId: string, addressId: string, codes: Record<string, string>) {
    return serial(this.db, async tx => {
      const data = await this.price(tx, userId, addressId, codes);
      return tx.checkoutQuote.create({ data: { userId, addressId, voucherCodes: codes, data: json(data), fingerprint: hash(JSON.stringify(data)), expiresAt: new Date(Date.now() + 10 * 60000) } });
    });
  }
  async order(userId: string, quoteId: string, key: string) {
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
      const order = await tx.order.create({ data: { code: `MAC-${randomUUID().slice(0, 8).toUpperCase()}`, userId, quoteId, idempotencyKey: key, total: current.total, address: json(current.address) } });
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
    const data = z.object({ addressId: id, vouchers: z.record(id, z.string().max(30)).default({}) }).strict().parse(body);
    return this.commerce.quote(req.user.id, data.addressId, data.vouchers);
  }
  @Post('orders') createOrder(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ quoteId: id, idempotencyKey: z.string().min(16).max(100) }).strict().parse(body);
    return this.commerce.order(req.user.id, data.quoteId, data.idempotencyKey);
  }
  @Get('orders') orders(@Req() req: Authed) { return this.db.order.findMany({ where: { userId: req.user.id }, include: orderInclude, take: 50, orderBy: { createdAt: 'desc' } }); }
  @Post('orders/shops/:id/cancel') cancel(@Req() req: Authed, @Param('id') shopOrderId: string) { return this.commerce.cancel(req.user.id, shopOrderId); }
  @Get('seller/shops/:shopId/orders') async sellerOrders(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.shopOrder.findMany({ where: { shopId }, include: { items: true, shipment: true, order: { select: { code: true, address: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
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
}
