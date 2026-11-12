import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!process.env.DATABASE_URL) {
  const rootEnv = resolve(__dirname, '../../../.env');
  const pkgEnv = resolve(__dirname, '../.env');
  if (existsSync(rootEnv)) {
    process.loadEnvFile(rootEnv);
  } else if (existsSync(pkgEnv)) {
    process.loadEnvFile(pkgEnv);
  }
}

const db = new PrismaClient();
const image = (file: string) => `http://localhost:3000/products/${file}.svg`;
const hash = (pwd: string) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pwd, salt, 64).toString('hex')}`;
};

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production');

  // 1. Users
  const users = [
    ['admin-nexora', 'Quản trị NEXORA', 'admin@nexora.vn', 'ADMIN', 'admin123'],
    ['user-nexora', 'Khách thử nghiệm', 'user@nexora.vn', 'USER', 'user123'],
    ['buyer-demo', 'Minh Anh', 'buyer@mac.local', 'USER', 'MacLocal2026!'],
    ['seller-a', 'Linh · Nếp Studio', 'seller.a@mac.local', 'USER', 'MacLocal2026!'],
    ['seller-b', 'An · Lụa & Co', 'seller.b@mac.local', 'USER', 'MacLocal2026!'],
    ['admin-demo', 'Quản trị Mặc', 'admin@mac.local', 'ADMIN', 'MacLocal2026!'],
  ] as const;

  for (const [id, name, email, role, pwd] of users) {
    const passwordHash = hash(pwd);
    await db.user.upsert({
      where: { email },
      create: { id, name, email, role, passwordHash, verifiedAt: new Date() },
      update: { name, role, passwordHash },
    });
  }

  // 2. Categories
  for (const [id, name] of [['ao', 'Áo'], ['quan', 'Quần'], ['vay', 'Váy & đầm']] as const) {
    await db.category.upsert({
      where: { id },
      create: { id, slug: id, name },
      update: { name },
    });
  }

  // 3. Shops (status: APPROVED)
  const shops = [
    ['shop-nep', 'shop-nep', 'NÉP Studio', 'seller-a', '45 Nguyễn Trãi, Hà Nội', 'Thời trang tối giản, chất liệu tự nhiên.'],
    ['shop-lua', 'shop-lua', 'Lụa & Co', 'seller-b', '12 Lê Lợi, TP.HCM', 'Trang phục lụa và vải nhẹ cao cấp.'],
    ['shop-moc', 'moc-everyday', 'Mộc Everyday', 'seller-b', '36 Trần Phú, Đà Nẵng', 'Trang phục thoải mái cho những ngày bình thường thật đẹp.'],
  ] as const;

  for (const [id, slug, name, userId, origin, description] of shops) {
    await db.shop.upsert({
      where: { id },
      create: { id, slug, name, origin, description, status: 'APPROVED', members: { create: { userId } } },
      update: { name, slug, origin, description, status: 'APPROVED' },
    });
  }

  // Link admin-nexora to manage shops as OWNER
  const adminUser = await db.user.findUnique({ where: { email: 'admin@nexora.vn' } });
  if (adminUser) {
    for (const shopId of ['shop-nep', 'shop-lua']) {
      await db.shopMember.upsert({
        where: { shopId_userId: { shopId, userId: adminUser.id } },
        create: { shopId, userId: adminUser.id, role: 'OWNER' },
        update: {},
      });
    }
  }

  // 4. Products & Variants (2 products per shop, active, S/M/L, 20 stock each)
  const products = [
    {
      id: 'linen-shirt',
      name: 'Sơ mi linen thong thả',
      categoryId: 'ao',
      shopId: 'shop-nep',
      price: 425000,
      material: 'Linen 100%',
      fit: 'Relaxed fit',
      colors: [
        ['Kem', '#dfd4bd', 'shirt-kem'],
        ['Đen', '#30332f', 'shirt-den'],
      ],
    },
    {
      id: 'weekend-dress',
      name: 'Đầm dạo cuối tuần',
      categoryId: 'vay',
      shopId: 'shop-nep',
      price: 685000,
      material: 'Cotton 70%, linen 30%',
      fit: 'Dáng chữ A',
      colors: [
        ['Nâu', '#a7654b', 'dress'],
        ['Kem', '#dfd4bd', 'shirt-kem'],
      ],
    },
    {
      id: 'everyday-tee',
      name: 'Áo thun ngày thường',
      categoryId: 'ao',
      shopId: 'shop-lua',
      price: 245000,
      material: 'Cotton 100%',
      fit: 'Regular fit',
      colors: [
        ['Trắng', '#eeeae1', 'shirt-trang'],
        ['Xanh', '#748774', 'tee'],
      ],
    },
    {
      id: 'wide-trousers',
      name: 'Quần suông nếp nhẹ',
      categoryId: 'quan',
      shopId: 'shop-lua',
      price: 495000,
      material: 'Cotton 97%, spandex 3%',
      fit: 'Ống rộng, cạp cao',
      colors: [
        ['Nâu', '#82644e', 'trousers'],
        ['Đen', '#30332f', 'shirt-den'],
      ],
    },
  ];

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { id: p.id } });
    if (!existing) {
      const variants = p.colors.flatMap(([color, colorHex], ci) =>
        ['S', 'M', 'L'].map((size) => ({
          id: `${p.id}-${ci}-${size}`,
          shopId: p.shopId,
          sku: `${p.id.toUpperCase()}-${ci}-${size}`,
          color,
          colorHex,
          size,
          price: p.price,
          inventory: { create: { onHand: 20, reserved: 0 } },
          movements: {
            create: {
              quantity: 20,
              kind: 'INITIAL',
              sourceKey: `seed:${p.id}:${ci}:${size}`,
            },
          },
        }))
      );

      await db.product.create({
        data: {
          id: p.id,
          slug: p.id,
          shopId: p.shopId,
          categoryId: p.categoryId,
          name: p.name,
          material: p.material,
          fit: p.fit,
          description: 'Một thiết kế dễ mặc, dễ phối, được chọn cho nhịp sống hằng ngày. Dữ liệu và hình minh họa dành cho môi trường phát triển.',
          status: 'ACTIVE',
          images: {
            create: p.colors.map(([color, , file], position) => ({
              color,
              position,
              url: image(file),
            })),
          },
          sizeCharts: {
            create: {
              version: 1,
              kind: 'GARMENT',
              rows:
                p.categoryId === 'quan'
                  ? [
                      { size: 'S', eo: 66, mong: 92, dai: 98 },
                      { size: 'M', eo: 70, mong: 96, dai: 100 },
                      { size: 'L', eo: 74, mong: 100, dai: 102 },
                    ]
                  : [
                      { size: 'S', nguc: 94, vai: 40, dai: 65 },
                      { size: 'M', nguc: 98, vai: 42, dai: 67 },
                      { size: 'L', nguc: 102, vai: 44, dai: 69 },
                    ],
              guide: 'Đặt quần áo phẳng. Đo vòng ngực/eo quanh thân, vai giữa hai đường may, chiều dài từ điểm cao nhất xuống gấu.',
            },
          },
          variants: { create: variants },
        },
      });
    }
  }

  // 5. Addresses
  await db.address.upsert({
    where: { id: 'address-demo' },
    create: {
      id: 'address-demo',
      userId: 'buyer-demo',
      recipient: 'Minh Anh',
      phone: '0900000000',
      line: '123 đường Mẫu, phường Mẫu',
      province: 'TP. Hồ Chí Minh',
    },
    update: {},
  });

  const normalUser = await db.user.findUnique({ where: { email: 'user@nexora.vn' } });
  if (normalUser) {
    await db.address.upsert({
      where: { id: 'address-nexora' },
      create: {
        id: 'address-nexora',
        userId: normalUser.id,
        recipient: 'Khách thử nghiệm',
        phone: '0901234567',
        line: '72 Lê Thánh Tôn, Bến Nghé, Quận 1',
        province: 'TP. Hồ Chí Minh',
      },
      update: {},
    });
  }

  // 6. Voucher for shop-nep
  await db.voucher.upsert({
    where: { shopId_code: { shopId: 'shop-nep', code: 'CHAO50' } },
    create: {
      shopId: 'shop-nep',
      code: 'CHAO50',
      amount: 50000,
      minimum: 400000,
      maxUses: 100,
      expiresAt: new Date('2030-01-01'),
    },
    update: { amount: 50000, minimum: 400000, maxUses: 100 },
  });

  // 7. Community Post in OOTD
  const postAuthor = normalUser ?? (await db.user.findUnique({ where: { id: 'buyer-demo' } }));
  if (postAuthor) {
    await db.post.upsert({
      where: { id: 'outfit-demo' },
      create: {
        id: 'outfit-demo',
        authorId: postAuthor.id,
        caption: 'Một chút linen, một chút nắng. Bộ đôi mình chọn cho một ngày chậm lại. #macmoingay #nexora #linen',
        media: { create: { url: image('outfit'), position: 0 } },
        tags: {
          create: [
            { productId: 'linen-shirt', x: 0.52, y: 0.36 },
            { productId: 'wide-trousers', x: 0.53, y: 0.68 },
          ],
        },
      },
      update: {},
    });
  }

  console.log('Demo seed ready: 2 active shops (NÉP Studio, Lụa & Co), 4 products, 24 SKUs, 1 tagged outfit.');
  console.log('Credentials: admin@nexora.vn / admin123 | user@nexora.vn / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
