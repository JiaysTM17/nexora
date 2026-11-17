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
  for (const [id, name] of [['ao', 'Áo'], ['quan', 'Quần'], ['vay', 'Váy & đầm'], ['ao-khoac', 'Áo khoác & Blazer']] as const) {
    await db.category.upsert({
      where: { id },
      create: { id, slug: id, name },
      update: { name },
    });
  }

  // 3. Shops (status: APPROVED)
  const shops = [
    ['shop-nep', 'shop-nep', 'NÉP Studio', 'seller-a', '45 Nguyễn Trãi, Hà Nội', 'Thời trang tối giản, chất liệu tự nhiên.', '0109887766', true],
    ['shop-lua', 'shop-lua', 'Lụa & Co', 'seller-b', '12 Lê Lợi, TP.HCM', 'Trang phục lụa và vải nhẹ cao cấp.', '0312345678', true],
    ['shop-moc', 'moc-everyday', 'Mộc Everyday', 'seller-b', '36 Trần Phú, Đà Nẵng', 'Trang phục thoải mái cho những ngày bình thường thật đẹp.', '0405678912', false],
  ] as const;

  for (const [id, slug, name, userId, origin, description, taxCode, isMall] of shops) {
    await db.shop.upsert({
      where: { id },
      create: { id, slug, name, origin, description, taxCode, isMall, status: 'APPROVED', members: { create: { userId } } },
      update: { name, slug, origin, description, taxCode, isMall, status: 'APPROVED' },
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

  // 4. Products & Variants (Real authentic fashion photography, strictly NO AI, with transparent source attribution links)
  const products = [
    {
      id: 'linen-shirt',
      name: 'Sơ mi linen thong thả',
      categoryId: 'ao',
      shopId: 'shop-nep',
      price: 425000,
      material: 'Linen 100% thoáng khí',
      fit: 'Relaxed fit',
      description: 'Sơ mi chất liệu 100% linen tự nhiên dệt thoáng khí, phom relaxed buông nhẹ thoải mái, thích hợp cho khí hậu nhiệt đới. Đường may cuộn tinh tế, khuy xà cừ tự nhiên.\n\nTham khảo mẫu thiết kế thực tế từ: https://www.uniqlo.com/vn/vi/products/E464939-000 (Bộ sưu tập Premium Linen Uniqlo chính hãng). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Kem', '#dfd4bd', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80'],
        ['Đen', '#30332f', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80'],
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
      description: 'Đầm dạo phố cuối tuần dáng chữ A thanh lịch, dệt từ cotton 70% phối linen 30% tạo độ rủ mềm mại tự nhiên. Thân váy chiết eo nhẹ tôn dáng thoải mái.\n\nTham khảo mẫu thiết kế thực tế từ: https://shop.mango.com/vn/women/dresses (Bộ sưu tập Mango Linen Blend Dress). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Nâu', '#a7654b', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80'],
        ['Kem', '#dfd4bd', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80'],
      ],
    },
    {
      id: 'everyday-tee',
      name: 'Áo thun ngày thường',
      categoryId: 'ao',
      shopId: 'shop-lua',
      price: 245000,
      material: 'Cotton 100% Compact',
      fit: 'Regular fit',
      description: 'Áo thun basic cổ tròn chất liệu 100% Cotton chải kỹ 220gsm dày dặn, thấm hút mồ hôi vượt trội và bền màu sau nhiều lần giặt.\n\nTham khảo mẫu thiết kế thực tế từ: https://www.coolmate.me/product/ao-thun-cotton-compact (Dòng Cotton Compact Coolmate Mall). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Trắng', '#eeeae1', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
        ['Xanh', '#748774', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80'],
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
      description: 'Quần tây ống suông cạp cao xếp ly nhẹ phía trước, tôn chiều cao và tạo cảm giác phóng khoáng khi di chuyển. Chất vải mềm co giãn nhẹ chống nhăn.\n\nTham khảo mẫu thiết kế thực tế từ: https://www.uniqlo.com/vn/vi/products/E460311-000 (Bộ sưu tập Pleated Wide Pants Uniqlo). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Nâu', '#82644e', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80'],
        ['Đen', '#30332f', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80'],
      ],
    },
    {
      id: 'linen-blazer',
      name: 'Áo khoác Blazer Linen cấu trúc nhẹ',
      categoryId: 'ao-khoac',
      shopId: 'shop-nep',
      price: 1350000,
      material: 'Linen 100% xử lý chống nhăn tự nhiên',
      fit: 'Relaxed Tailored Fit',
      description: 'Áo khoác blazer may đo phom relaxed cấu trúc vai nhẹ, chất liệu 100% linen xử lý wash mềm cao cấp. Đem lại phong thái hiện đại, lịch lãm cả khi đi làm hay dạo phố.\n\nTham khảo mẫu thiết kế thực tế từ: https://www.massimodutti.com/vn/ (Bộ sưu tập Massimo Dutti Linen Tailored Blazers). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Kem', '#f4ede1', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80'],
        ['Đen', '#252926', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'],
      ],
    },
    {
      id: 'wool-trench-coat',
      name: 'Áo măng tô Trench Coat dạ mỏng cao cấp',
      categoryId: 'ao-khoac',
      shopId: 'shop-nep',
      price: 2450000,
      material: 'Wool pha lụa dệt chéo',
      fit: 'Dáng dài suông kinh điển',
      description: 'Trench coat kinh điển dáng dài 2 hàng khuy, đai thắt eo và ve áo bản rộng. Chất liệu dạ pha lụa chéo chắn gió tốt, tôn dáng chuẩn mực thượng lưu.\n\nTham khảo mẫu thiết kế thực tế từ: https://www.zara.com/vn/vi/ (Bộ sưu tập Classic Trench Coat Zara Studio). Cam kết hình ảnh thực tế 100%, không sử dụng ảnh AI.',
      colors: [
        ['Nâu cát', '#b89f82', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=80'],
        ['Xanh rêu', '#475345', 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'],
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
          description: p.description,
          status: 'ACTIVE',
          images: {
            create: p.colors.map(([color, , url], position) => ({
              color,
              position,
              url,
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
    } else {
      // Update existing products with real photos, descriptions and source attributions
      await db.product.update({
        where: { id: p.id },
        data: {
          name: p.name,
          material: p.material,
          fit: p.fit,
          description: p.description,
        },
      });
      await db.productImage.deleteMany({ where: { productId: p.id } });
      for (let pos = 0; pos < p.colors.length; pos++) {
        const [color, , url] = p.colors[pos];
        await db.productImage.create({
          data: {
            productId: p.id,
            color,
            position: pos,
            url,
          },
        });
      }
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

  // 7. Community Post in OOTD (Real photography with source attribution)
  const postAuthor = normalUser ?? (await db.user.findUnique({ where: { id: 'buyer-demo' } }));
  if (postAuthor) {
    const post1MediaUrl = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80';
    await db.post.upsert({
      where: { id: 'outfit-demo' },
      create: {
        id: 'outfit-demo',
        authorId: postAuthor.id,
        caption: 'Một chút linen, một chút nắng. Bộ đôi mình chọn cho một ngày chậm lại. (Ảnh thực tế OOTD streetstyle: https://unsplash.com/photos/uwtYdOvK7uA) #macmoingay #nexora #linen',
        media: { create: { url: post1MediaUrl, position: 0 } },
        tags: {
          create: [
            { productId: 'linen-shirt', x: 0.52, y: 0.36 },
            { productId: 'wide-trousers', x: 0.53, y: 0.68 },
          ],
        },
      },
      update: {
        caption: 'Một chút linen, một chút nắng. Bộ đôi mình chọn cho một ngày chậm lại. (Ảnh thực tế OOTD streetstyle: https://unsplash.com/photos/uwtYdOvK7uA) #macmoingay #nexora #linen',
      },
    });
    await db.postMedia.deleteMany({ where: { postId: 'outfit-demo' } });
    await db.postMedia.create({ data: { postId: 'outfit-demo', url: post1MediaUrl, position: 0 } });

    const post2MediaUrl = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80';
    await db.post.upsert({
      where: { id: 'outfit-demo-2' },
      create: {
        id: 'outfit-demo-2',
        authorId: postAuthor.id,
        caption: 'Hôm nay trời vào thu nhẹ, diện chiếc blazer linen nhẹ tênh cùng áo thun thoải mái dạo phố cuối tuần. (Ảnh thực tế Lookbook: https://unsplash.com/photos/pypeCEna0Ag) #ootd #blazer #nexora #autumn',
        media: { create: { url: post2MediaUrl, position: 0 } },
        tags: {
          create: [
            { productId: 'linen-blazer', x: 0.5, y: 0.35 },
            { productId: 'everyday-tee', x: 0.5, y: 0.65 },
          ],
        },
      },
      update: {
        caption: 'Hôm nay trời vào thu nhẹ, diện chiếc blazer linen nhẹ tênh cùng áo thun thoải mái dạo phố cuối tuần. (Ảnh thực tế Lookbook: https://unsplash.com/photos/pypeCEna0Ag) #ootd #blazer #nexora #autumn',
      },
    });
    await db.postMedia.deleteMany({ where: { postId: 'outfit-demo-2' } });
    await db.postMedia.create({ data: { postId: 'outfit-demo-2', url: post2MediaUrl, position: 0 } });
  }

  // 8. Trade-In & VAS Care samples
  if (normalUser) {
    await db.tradeInRequest.upsert({
      where: { id: 'tradein-demo-1' },
      create: {
        id: 'tradein-demo-1',
        userId: normalUser.id,
        brand: 'NÉP Studio',
        itemName: 'Áo khoác Blazer Linen',
        category: 'Áo khoác',
        conditionNote: 'Mới 95%, ít mặc, còn nguyên khuy dự phòng.',
        grade: 'A',
        estimatedValue: 1200000,
        finalValue: 150000,
        voucherCode: 'NXTI-DEMO50',
        status: 'APPROVED',
      },
      update: {},
    });
    await db.careBooking.upsert({
      where: { id: 'care-demo-1' },
      create: {
        id: 'care-demo-1',
        userId: normalUser.id,
        itemName: 'Túi xách da bê tối giản',
        serviceType: 'LEATHER_RESTORE',
        zipSealCode: 'NX-SEAL-DEMO01',
        insuredValue: 15000000,
        fee: 475000,
        status: 'OPTICAL_CHECK',
        notes: 'Dưỡng ẩm bề mặt da và vệ sinh khóa kim loại.',
      },
      update: {},
    });
  }

  console.log('Demo seed ready: Real product photography & source attributions applied to all products.');
  console.log('Credentials: admin@nexora.vn / admin123 | user@nexora.vn / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
