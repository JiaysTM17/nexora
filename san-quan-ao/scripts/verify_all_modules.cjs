const http = require('http');
const fs = require('fs');
const path = require('path');
let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require(path.resolve(__dirname, '../packages/database/node_modules/@prisma/client')).PrismaClient;
}

// Load environment variables if not present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const prisma = new PrismaClient();

function request(url, options = {}, body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      ...(options.headers || {})
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers,
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    'http://localhost:4000/api/v1/auth/login',
    { method: 'POST' },
    { email, password }
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  const setCookies = res.headers['set-cookie'];
  if (!setCookies || !setCookies.length) {
    throw new Error(`No cookie returned for ${email}`);
  }
  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

async function run() {
  console.log('================================================================================');
  console.log('🏛️  NEXORA HAUTE COUTURE MARKETPLACE - COMPREHENSIVE ECOSYSTEM VERIFICATION  🏛️');
  console.log('================================================================================\n');

  // Login as buyer-demo
  console.log('[Auth] Authenticating buyer session (buyer@mac.local)...');
  const sessionCookie = await login('buyer@mac.local', 'MacLocal2026!');
  console.log('✓ Buyer authenticated successfully.\n');

  // MODULE 1: VAS Care & Restoration
  console.log('▶ [MODULE 1] VAS Atelier Care & Garment Restoration (/vas-care)');
  const vasWeb = await request('http://localhost:3000/vas-care');
  if (vasWeb.status !== 200) throw new Error('VAS Care web page failed');
  const vasBook = await request('http://localhost:4000/api/v1/vas-care', { method: 'POST' }, {
    itemName: 'Áo Khoác Blazer Linen Normandy',
    serviceType: 'SPA_CLEANING',
    insuredValue: 5000000,
    notes: 'Khử ố sinh học và dưỡng sợi tự nhiên',
  }, sessionCookie);
  if (vasBook.status !== 201 && vasBook.status !== 200) {
    throw new Error(`VAS booking failed: ${vasBook.status} ${JSON.stringify(vasBook.data)}`);
  }
  console.log(`  ✓ Web HTTP 200, Booking created: #${vasBook.data.id} (${vasBook.data.serviceType}, ZipSeal: ${vasBook.data.zipSealCode})\n`);

  // MODULE 2: Circular Trade-In & LCA Passport
  console.log('▶ [MODULE 2] Circular Trade-In & LCA Passport (/trade-in)');
  const tradeWeb = await request('http://localhost:3000/trade-in');
  if (tradeWeb.status !== 200) throw new Error('Trade-in web page failed');
  const tradeReq = await request('http://localhost:4000/api/v1/trade-in', { method: 'POST' }, {
    brand: 'Lụa & Co',
    category: 'Đầm / Váy',
    itemName: 'Váy Lụa Cắt Xéo Hà Đông',
    conditionNote: 'Vải lụa như mới nguyên tem, không vết xước hay sờn chỉ',
  }, sessionCookie);
  if (tradeReq.status !== 201 && tradeReq.status !== 200) {
    throw new Error(`Trade-in submission failed: ${tradeReq.status} ${JSON.stringify(tradeReq.data)}`);
  }
  console.log(`  ✓ Web HTTP 200, Trade-In created: #${tradeReq.data.id} (Grade: ${tradeReq.data.grade}, Est: ${tradeReq.data.estimatedValue}₫)\n`);

  // MODULE 3: Lookbook & Stylist Engine
  console.log('▶ [MODULE 3] Lookbook & Stylist Engine (/phoi-do)');
  const lookbookWeb = await request('http://localhost:3000/phoi-do');
  if (lookbookWeb.status !== 200) throw new Error('Lookbook web page failed');
  await prisma.inventoryBalance.updateMany({
    where: { variantId: { in: ['linen-shirt-0-M', 'wide-trousers-0-M'] } },
    data: { onHand: 100, reserved: 0 }
  });
  const batchCart = await request('http://localhost:4000/api/v1/cart/batch', { method: 'POST' }, {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 }
    ]
  }, sessionCookie);
  if (batchCart.status !== 201 && batchCart.status !== 200) throw new Error('Batch add to cart failed');
  console.log(`  ✓ Web HTTP 200, Lookbook atomic batch cart add verified: ${batchCart.data.addedCount} items\n`);

  // MODULE 4: Live Runway & VIP Stylist Consultation
  console.log('▶ [MODULE 4] Live Runway & VIP Stylist Engine (/live)');
  const liveWeb = await request('http://localhost:3000/live');
  if (liveWeb.status !== 200) throw new Error('Live runway web page failed');
  const vipBook = await request('http://localhost:4000/api/v1/vault/booking', { method: 'POST' }, {
    id: `STYLIST-RUN-${Date.now().toString().slice(-4)}`,
    flagship: 'Tư Vấn VIP · Elena Vũ (Senior Stylist)',
    service: 'Phòng Thử Đồ Trực Tuyến 1:1 (Video HD)',
    date: '2026-11-28',
    timeSlot: '19:00 - 20:30',
    vipPass: `VIP-STYLIST-${Math.floor(100000 + Math.random() * 900000)}`,
  }, sessionCookie);
  if (vipBook.status !== 201 && vipBook.status !== 200) throw new Error('VIP booking failed');
  console.log(`  ✓ Web HTTP 200, VIP Stylist pass created: #${vipBook.data.booking.vipPass}\n`);

  // MODULE 5: Community OOTD & P2P Garment Swap
  console.log('▶ [MODULE 5] Community OOTD, Patronage & P2P Swap (/cong-dong)');
  const commWeb = await request('http://localhost:3000/cong-dong');
  if (commWeb.status !== 200) throw new Error('Community web page failed');
  const swapId = `SWAP-FINAL-${Date.now().toString().slice(-4)}`;
  const swapRes = await request('http://localhost:4000/api/v1/vault/swap', { method: 'POST' }, {
    id: swapId,
    myItem: 'Blazer Linen Khuy Sừng Tự Nhiên (Size M)',
    myVal: 1850000,
    targetItem: 'Váy Lụa Hà Đông Cắt Xéo (Size S)',
    targetVal: 1950000,
    escrowLocked: true,
  }, sessionCookie);
  if (swapRes.status !== 201 && swapRes.status !== 200) throw new Error('Swap creation failed');
  console.log(`  ✓ Web HTTP 200, P2P Swap Escrow contract created: #${swapId}\n`);

  // MODULE 6: VIP Fashion Passport & Atelier Vault
  console.log('▶ [MODULE 6] VIP Fashion Passport & Atelier Vault (/tai-khoan)');
  const accWeb = await request('http://localhost:3000/tai-khoan');
  if (accWeb.status !== 200) throw new Error('Account web page failed');
  const fullVault = await request('http://localhost:4000/api/v1/vault', { method: 'GET' }, null, sessionCookie);
  if (fullVault.status !== 200) throw new Error('Get full vault failed');
  console.log(`  ✓ Web HTTP 200, Full Vault retrieved (${Object.keys(fullVault.data).length} feature domains synchronized)\n`);

  // MODULE 7: Cart & VietQR Multi-Tier Escrow Checkout
  console.log('▶ [MODULE 7] Multi-Workshop Cart & VietQR Escrow Checkout (/gio-hang)');
  const cartWeb = await request('http://localhost:3000/gio-hang');
  if (cartWeb.status !== 200) throw new Error('Cart web page failed');
  const addrRes = await request('http://localhost:4000/api/v1/addresses', { method: 'GET' }, null, sessionCookie);
  const addressId = addrRes.data[0].id;
  const quoteRes = await request('http://localhost:4000/api/v1/checkout/quote', { method: 'POST' }, {
    addressId,
    vouchers: { 'shop-nep': 'RUNWAY20', 'shop-moc': 'RUNWAY20' },
    deliverySlot: 'AFTERNOON',
    ecoPackaging: true,
  }, sessionCookie);
  if (quoteRes.status !== 200 && quoteRes.status !== 201) throw new Error('Checkout quote calculation failed');
  console.log(`  ✓ Web HTTP 200, Quote calculated: #${quoteRes.data.id}, Total: ${quoteRes.data.data.total.toLocaleString()}₫\n`);

  // MODULE 8: Order Lifecycle & White-Glove Receipt
  console.log('▶ [MODULE 8] Order Lifecycle & White-Glove Delivery (/don-hang)');
  const ordersWeb = await request('http://localhost:3000/don-hang');
  if (ordersWeb.status !== 200) throw new Error('Orders listing web page failed');
  const orderRes = await request('http://localhost:4000/api/v1/orders', { method: 'POST' }, {
    quoteId: quoteRes.data.id,
    idempotencyKey: crypto.randomUUID(),
    paymentMethod: 'VIETQR'
  }, sessionCookie);
  if (orderRes.status !== 200 && orderRes.status !== 201) throw new Error('Order creation failed');
  const freshOrder = orderRes.data;
  console.log(`  ✓ Web HTTP 200, Multi-workshop order created: #${freshOrder.code} (${freshOrder.shops.length} suborders)\n`);

  // MODULE 9: Product Detail, Smart Fit & Verified Reviews
  console.log('▶ [MODULE 9] Product Detail, Smart Fit & Verified Reviews (/san-pham/linen-shirt)');
  const prodWeb = await request('http://localhost:3000/san-pham/linen-shirt');
  if (prodWeb.status !== 200) throw new Error('Product detail web page failed');
  const prodApi = await request('http://localhost:4000/api/v1/products/linen-shirt');
  if (prodApi.status !== 200) throw new Error('Product API detail failed');
  console.log(`  ✓ Web HTTP 200, Product "${prodApi.data.name}" retrieved with ${prodApi.data.variants.length} active variants & ${prodApi.data.reviews?.length ?? 0} verified reviews\n`);

  // MODULE 10: Workshop Seller Portal & Napas 24/7 Escrow Payout
  console.log('▶ [MODULE 10] Workshop Seller Portal & Napas 24/7 Escrow Payout (/seller)');
  const sellerWeb = await request('http://localhost:3000/seller');
  if (sellerWeb.status !== 200) throw new Error('Seller portal web page failed');
  const sellerCookie = await login('seller.a@mac.local', 'MacLocal2026!');
  const sellerLedger = await request('http://localhost:4000/api/v1/seller/shops/shop-nep/ledger', { method: 'GET' }, null, sellerCookie);
  if (sellerLedger.status !== 200) throw new Error('Seller ledger fetch failed');
  console.log(`  ✓ Web HTTP 200, 3-Tier Ledger: Balance ${sellerLedger.data.balance.toLocaleString()}₫, Available: ${sellerLedger.data.available.toLocaleString()}₫, Held: ${sellerLedger.data.held.toLocaleString()}₫\n`);

  console.log('================================================================================');
  console.log('🎉 ALL 10 HAUTE COUTURE CORE MODULES PASSED 100% PRODUCTION E2E VERIFICATION! 🎉');
  console.log('================================================================================\n');
}

run()
  .catch((err) => {
    console.error('❌ Ecosystem verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
