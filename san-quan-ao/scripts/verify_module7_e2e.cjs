const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

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

async function run() {
  console.log('--- START VERIFYING MODULE 7: CART, QUOTE ENGINE & VIETQR ESCROW CHECKOUT ---');

  // Step 1: Verify Web /gio-hang returns 200
  console.log('[Step 1] Checking GET http://localhost:3000/gio-hang...');
  const cartWeb = await request('http://localhost:3000/gio-hang');
  if (cartWeb.status !== 200) {
    throw new Error(`Web /gio-hang returned status ${cartWeb.status}`);
  }
  console.log('✓ /gio-hang cart & checkout page is online and returning 200 OK');

  // Step 2: Login as buyer-demo
  console.log('[Step 2] Authenticating as buyer@mac.local...');
  const loginRes = await request('http://localhost:4000/api/v1/auth/login', { method: 'POST' }, {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!'
  });
  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed with status ${loginRes.status}`);
  }
  const setCookie = loginRes.headers['set-cookie'];
  const sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
  console.log('✓ Successfully authenticated buyer session.');

  // Step 3: Get user address
  console.log('[Step 3] Fetching user delivery address...');
  const addrRes = await request('http://localhost:4000/api/v1/addresses', { method: 'GET' }, null, sessionCookie);
  if (addrRes.status !== 200 || !addrRes.data?.length) {
    throw new Error('No user address found');
  }
  const addressId = addrRes.data[0].id;
  console.log(`✓ Using address: ${addrRes.data[0].recipient} - ${addrRes.data[0].line}, ${addrRes.data[0].province}`);

  // Step 4: Populate Cart with multi-shop items via atomic batch
  console.log('[Step 4] Adding items from multiple shops to cart via POST /api/v1/cart/batch...');
  const batchRes = await request('http://localhost:4000/api/v1/cart/batch', { method: 'POST' }, {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 }
    ]
  }, sessionCookie);
  if (batchRes.status !== 200 && batchRes.status !== 201) {
    throw new Error(`Batch add failed: ${batchRes.status} ${JSON.stringify(batchRes.data)}`);
  }
  console.log(`✓ Added ${batchRes.data.addedCount} items across multiple workshops.`);

  // Step 5: Verify cart lines
  console.log('[Step 5] Checking GET /api/v1/cart...');
  const cartRes = await request('http://localhost:4000/api/v1/cart', { method: 'GET' }, null, sessionCookie);
  if (cartRes.status !== 200 || !cartRes.data?.length) {
    throw new Error('Cart is empty after adding items');
  }
  const cartShops = [...new Set(cartRes.data.map(l => l.variant.product.shop.id))];
  console.log(`✓ Cart has ${cartRes.data.length} line items across shops: ${cartShops.join(', ')}`);

  // Step 6: Request Checkout Quote with Multi-Tier Vouchers
  console.log('[Step 6] Requesting Checkout Quote via POST /api/v1/checkout/quote...');
  const vouchers = {
    _freeship: 'FREESHIP30',
    _coins: '25000'
  };
  for (const sId of cartShops) {
    vouchers[sId] = 'RUNWAY20';
  }
  const quotePayload = {
    addressId,
    vouchers,
    deliverySlot: 'AFTERNOON',
    ecoPackaging: true,
  };
  const quoteRes = await request('http://localhost:4000/api/v1/checkout/quote', { method: 'POST' }, quotePayload, sessionCookie);
  if (quoteRes.status !== 200 && quoteRes.status !== 201) {
    throw new Error(`Quote calculation failed: ${quoteRes.status} ${JSON.stringify(quoteRes.data)}`);
  }
  const quote = quoteRes.data;
  console.log(`✓ Quote generated successfully: ID #${quote.id}`);
  console.log(`  • Workshops involved: ${quote.data.shops.length} (${quote.data.shops.map(s => s.shopName).join(', ')})`);
  console.log(`  • Shipping discount: ${quote.data.shippingDiscount}₫ (Freeship Xtra)`);
  console.log(`  • Coins discount: ${quote.data.coinDiscount}₫`);
  console.log(`  • Total payable: ${quote.data.total}₫ (Original subtotal: ${quote.data.shops.reduce((s, g) => s + g.subtotal, 0)}₫)`);

  // Step 7: Place Order using VIETQR Payment Method
  console.log('[Step 7] Placing Order with VIETQR Escrow via POST /api/v1/orders...');
  const idempotencyKey = crypto.randomUUID();
  const orderPayload = {
    quoteId: quote.id,
    idempotencyKey,
    paymentMethod: 'VIETQR',
  };
  const orderRes = await request('http://localhost:4000/api/v1/orders', { method: 'POST' }, orderPayload, sessionCookie);
  if (orderRes.status !== 200 && orderRes.status !== 201) {
    throw new Error(`Order placement failed: ${orderRes.status} ${JSON.stringify(orderRes.data)}`);
  }
  const order = orderRes.data;
  console.log(`✓ Order placed successfully! Code: ${order.code}, Total: ${order.total}₫, PaymentMethod: ${order.paymentMethod}`);
  console.log(`  • Sub-orders: ${order.shops.length} workshops (${order.shops.map(s => `${s.shop.name}: ${s.total}₫`).join(', ')})`);

  // Step 8: Verify order detail endpoint
  console.log(`[Step 8] Checking GET /api/v1/orders/${order.id}...`);
  const detailRes = await request(`http://localhost:4000/api/v1/orders/${order.id}`, { method: 'GET' }, null, sessionCookie);
  if (detailRes.status !== 200) {
    throw new Error(`Failed to fetch order detail: ${detailRes.status}`);
  }
  if (detailRes.data.code !== order.code || detailRes.data.paymentMethod !== 'VIETQR') {
    throw new Error('Order detail mismatch');
  }
  console.log(`✓ Verified order detail: Code ${detailRes.data.code}, Payment: ${detailRes.data.paymentMethod}, Status: ${detailRes.data.shops[0]?.status}`);

  console.log('\n========================================================================');
  console.log('🎉 ALL 8 CHECKS FOR MODULE 7 (CART & VIETQR CHECKOUT) PASSED 100%!');
  console.log('========================================================================\n');
}

run()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
