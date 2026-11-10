import { Body, Controller, Get, Inject, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Prisma } from '@mac/database';
import { z } from 'zod';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial } from './db';
import { id, json, money } from './common';

const productInclude = { shop: { select: { id: true, name: true, slug: true, returnPolicy: true } }, category: true, images: { orderBy: { position: 'asc' as const } }, variants: { where: { active: true }, include: { inventory: true }, orderBy: { sku: 'asc' as const } }, sizeCharts: { orderBy: { version: 'desc' as const }, take: 1 } };
@Controller()
export class CatalogController {
  constructor(@Inject(Db) private db: Db, @Inject(Auth) private auth: Auth) {}
  @Get('categories') categories() { return this.db.category.findMany({ orderBy: { name: 'asc' } }); }
  @Get('products') async products(@Query() input: unknown) {
    const q = z.object({ q: z.string().max(100).optional(), color: z.string().max(60).optional(), size: z.string().max(20).optional(), category: z.string().max(60).optional(), inStock: z.enum(['true', 'false']).optional(), page: z.coerce.number().int().min(1).max(1000).default(1) }).parse(input);
    // A single existential SKU predicate prevents black/L + white/M matching black/M.
    let stockIds: string[] | undefined;
    if (q.inStock === 'true') {
      const rows = await this.db.$queryRaw<{ variantId: string }[]>`SELECT "variantId" FROM "InventoryBalance" WHERE "onHand" > "reserved"`;
      stockIds = rows.map(r => r.variantId);
    }
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE', shop: { status: 'APPROVED' },
      ...(q.q ? { name: { contains: q.q, mode: 'insensitive' } } : {}),
      ...(q.category ? { category: { slug: q.category } } : {}),
      variants: { some: { active: true, ...(q.color ? { color: q.color } : {}), ...(q.size ? { size: q.size } : {}), ...(stockIds ? { id: { in: stockIds } } : {}) } },
    };
    const [items, total] = await this.db.$transaction([this.db.product.findMany({ where, include: productInclude, orderBy: { createdAt: 'desc' }, take: 24, skip: (q.page - 1) * 24 }), this.db.product.count({ where })]);
    return { items, total, page: q.page };
  }
  @Get('products/:id') async product(@Param('id') productId: string) {
    const product = await this.db.product.findFirst({ where: { OR: [{ id: productId }, { slug: productId }], status: 'ACTIVE', shop: { status: 'APPROVED' } }, include: { ...productInclude, reviews: { include: { user: { select: { name: true } } }, take: 20, orderBy: { createdAt: 'desc' } } } });
    if (!product) throw new NotFoundException('Sản phẩm đã ngừng bán hoặc không tồn tại');
    return product;
  }
  @Get('seller/shops') @UseGuards(SignedIn) shops(@Req() req: Authed) { return this.db.shop.findMany({ where: { members: { some: { userId: req.user.id } } } }); }
  @Post('seller/shops') @UseGuards(SignedIn) async createShop(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().regex(/^[a-z0-9-]{3,80}$/), origin: z.string().trim().min(10).max(300), description: z.string().max(2000).default('') }).strict().parse(body);
    return this.db.shop.create({ data: { ...data, members: { create: { userId: req.user.id } } } });
  }
  @Get('seller/shops/:shopId/products') @UseGuards(SignedIn) async sellerProducts(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.product.findMany({ where: { shopId }, include: productInclude });
  }
  @Post('seller/shops/:shopId/products') @UseGuards(SignedIn) async createProduct(@Req() req: Authed, @Param('shopId') shopId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const data = z.object({
      name: z.string().trim().min(3).max(160), slug: z.string().regex(/^[a-z0-9-]{3,120}$/), categoryId: id,
      description: z.string().min(10).max(5000), material: z.string().min(2).max(200), fit: z.string().min(2).max(100),
      images: z.array(z.object({ url: z.url().max(2000), color: z.string().max(60).optional() })).min(1).max(12),
      sizeChart: z.object({ kind: z.enum(['BODY', 'GARMENT']), rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).min(1).max(30), guide: z.string().min(5).max(2000) }),
      variants: z.array(z.object({ sku: z.string().min(1).max(80), color: z.string().min(1).max(60), colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/), size: z.string().min(1).max(20), price: money.min(1000), stock: z.number().int().min(0).max(100000) })).min(1).max(100),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const product = await tx.product.create({ data: { shopId, name: data.name, slug: data.slug, categoryId: data.categoryId, description: data.description, material: data.material, fit: data.fit, status: 'ACTIVE', images: { create: data.images.map((img, position) => ({ ...img, position })) }, sizeCharts: { create: { ...data.sizeChart, rows: json(data.sizeChart.rows), version: 1 } }, variants: { create: data.variants.map(({ stock, ...v }) => ({ ...v, shopId, inventory: { create: { onHand: stock } }, movements: { create: { quantity: stock, kind: 'INITIAL', sourceKey: `initial:${shopId}:${v.sku}`, actorId: req.user.id } } })) } }, include: productInclude });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'PRODUCT_CREATE', entityId: product.id, data: {} } });
      return product;
    });
  }
  @Patch('seller/shops/:shopId/variants/:variantId/stock') @UseGuards(SignedIn) async stock(@Req() req: Authed, @Param('shopId') shopId: string, @Param('variantId') variantId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const data = z.object({ delta: z.number().int().min(-100000).max(100000), reason: z.string().min(5).max(300), key: z.string().min(10).max(100) }).strict().parse(body);
    return serial(this.db, async tx => {
      const variant = await tx.variant.findFirst({ where: { id: variantId, shopId } });
      if (!variant) throw new NotFoundException('Không tìm thấy SKU trong shop');
      const sourceKey = `adjust:${shopId}:${data.key}`;
      const existing = await tx.stockMovement.findUnique({ where: { sourceKey } });
      if (existing) {
        if (existing.variantId !== variantId || existing.quantity !== data.delta) throw new NotFoundException('Khóa điều chỉnh đã được dùng cho nội dung khác');
        return tx.inventoryBalance.findUnique({ where: { variantId } });
      }
      const changed = await tx.$executeRaw`UPDATE "InventoryBalance" SET "onHand" = "onHand" + ${data.delta} WHERE "variantId" = ${variantId} AND "onHand" + ${data.delta} >= "reserved"`;
      if (!changed) throw new NotFoundException('Không thể giảm thấp hơn số lượng đã giữ');
      await tx.stockMovement.create({ data: { variantId, quantity: data.delta, sourceKey, kind: 'ADJUSTMENT', actorId: req.user.id } });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'STOCK_ADJUST', entityId: variantId, data: json(data) } });
      return tx.inventoryBalance.findUnique({ where: { variantId } });
    });
  }
}
