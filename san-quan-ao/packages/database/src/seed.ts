import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { resolve } from 'node:path';

if (!process.env.DATABASE_URL) process.loadEnvFile(resolve(__dirname, '../../../.env'));

const db = new PrismaClient();
const image = (file: string) => `http://localhost:3000/products/${file}.svg`;
async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production');
  const salt = randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${scryptSync('MacLocal2026!', salt, 64).toString('hex')}`;
  for (const [id, name, email, role] of [
    ['buyer-demo', 'Minh Anh', 'buyer@mac.local', 'USER'], ['seller-a', 'Linh · Nếp Studio', 'seller.a@mac.local', 'USER'],
    ['seller-b', 'An · Mộc Everyday', 'seller.b@mac.local', 'USER'], ['admin-demo', 'Quản trị Mặc', 'admin@mac.local', 'ADMIN'],
  ] as const) await db.user.upsert({ where: { id }, create: { id, name, email, role, passwordHash, verifiedAt: new Date() }, update: {} });
  for (const [id, name] of [['ao', 'Áo'], ['quan', 'Quần'], ['vay', 'Váy & đầm']] as const) await db.category.upsert({ where: { id }, create: { id, slug: id, name }, update: {} });
  for (const [id, slug, name, userId, origin] of [
    ['shop-nep', 'nep-studio', 'Nếp Studio', 'seller-a', '12 Nguyễn Trãi, TP. Hồ Chí Minh'],
    ['shop-moc', 'moc-everyday', 'Mộc Everyday', 'seller-b', '36 Trần Phú, Đà Nẵng'],
  ]) await db.shop.upsert({ where: { id }, create: { id, slug, name, origin, description: 'Trang phục thoải mái cho những ngày bình thường thật đẹp.', status: 'APPROVED', members: { create: { userId } } }, update: {} });
  const products = [
    { id: 'linen-shirt', name: 'Sơ mi linen thong thả', categoryId: 'ao', shopId: 'shop-nep', price: 425000, material: 'Linen 100%', fit: 'Relaxed fit', file: 'shirt', colors: [['Kem', '#dfd4bd'], ['Đen', '#30332f']] },
    { id: 'wide-trousers', name: 'Quần suông nếp nhẹ', categoryId: 'quan', shopId: 'shop-moc', price: 495000, material: 'Cotton 97%, spandex 3%', fit: 'Ống rộng, cạp cao', file: 'trousers', colors: [['Nâu', '#82644e'], ['Đen', '#30332f']] },
    { id: 'everyday-tee', name: 'Áo thun ngày thường', categoryId: 'ao', shopId: 'shop-moc', price: 245000, material: 'Cotton 100%', fit: 'Regular fit', file: 'tee', colors: [['Trắng', '#eeeae1'], ['Xanh', '#748774']] },
    { id: 'weekend-dress', name: 'Đầm dạo cuối tuần', categoryId: 'vay', shopId: 'shop-nep', price: 685000, material: 'Cotton 70%, linen 30%', fit: 'Dáng chữ A', file: 'dress', colors: [['Nâu', '#a7654b'], ['Kem', '#dfd4bd']] },
  ];
  for (const p of products) {
    if (await db.product.findUnique({ where: { id: p.id } })) continue;
    const variants = p.colors.flatMap(([color, colorHex], ci) => ['S', 'M', 'L'].map((size, si) => ({ id: `${p.id}-${ci}-${size}`, shopId: p.shopId, sku: `${p.id.toUpperCase()}-${ci}-${size}`, color, colorHex, size, price: p.price, inventory: { create: { onHand: p.id === 'linen-shirt' && color === 'Đen' ? (size === 'L' ? 1 : 0) : 8 + si } }, movements: { create: { quantity: p.id === 'linen-shirt' && color === 'Đen' ? (size === 'L' ? 1 : 0) : 8 + si, kind: 'INITIAL', sourceKey: `seed:${p.id}:${ci}:${size}` } } })));
    await db.product.create({ data: { id: p.id, slug: p.id, shopId: p.shopId, categoryId: p.categoryId, name: p.name, material: p.material, fit: p.fit, description: 'Một thiết kế dễ mặc, dễ phối, được chọn cho nhịp sống hằng ngày. Dữ liệu và hình minh họa dành cho môi trường phát triển.', status: 'ACTIVE', images: { create: p.colors.map(([color], position) => ({ color, position, url: image(p.file) })) }, sizeCharts: { create: { version: 1, kind: 'GARMENT', rows: p.categoryId === 'quan' ? [{ size: 'S', eo: 66, mong: 92, dai: 98 }, { size: 'M', eo: 70, mong: 96, dai: 100 }, { size: 'L', eo: 74, mong: 100, dai: 102 }] : [{ size: 'S', nguc: 94, vai: 40, dai: 65 }, { size: 'M', nguc: 98, vai: 42, dai: 67 }, { size: 'L', nguc: 102, vai: 44, dai: 69 }], guide: 'Đặt quần áo phẳng. Đo vòng ngực/eo quanh thân, vai giữa hai đường may, chiều dài từ điểm cao nhất xuống gấu.' } }, variants: { create: variants } } });
  }
  await db.address.upsert({ where: { id: 'address-demo' }, create: { id: 'address-demo', userId: 'buyer-demo', recipient: 'Minh Anh', phone: '0900000000', line: '123 đường Mẫu, phường Mẫu', province: 'TP. Hồ Chí Minh' }, update: {} });
  await db.voucher.upsert({ where: { shopId_code: { shopId: 'shop-nep', code: 'CHAO50' } }, create: { shopId: 'shop-nep', code: 'CHAO50', amount: 50000, minimum: 400000, maxUses: 100, expiresAt: new Date('2030-01-01') }, update: {} });
  await db.post.upsert({ where: { id: 'outfit-demo' }, create: { id: 'outfit-demo', authorId: 'buyer-demo', caption: 'Một chút linen, một chút nắng. Bộ đôi mình chọn cho một ngày chậm lại. #macmoingay #linen', media: { create: { url: image('outfit'), position: 0 } }, tags: { create: [{ productId: 'linen-shirt', x: 0.52, y: 0.36 }, { productId: 'wide-trousers', x: 0.53, y: 0.68 }] } }, update: {} });
  console.log('Demo seed ready: 2 shops, 4 products, 24 SKUs, 1 tagged outfit. Credentials are in README.md.');
}
main().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
