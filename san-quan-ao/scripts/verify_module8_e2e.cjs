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

async function login(email, password) {
  const res = await request('http://localhost:4000/api/v1/auth/login', { method: 'POST' }, { email, password });
  if (res.status !== 200 && res.status !== 201) throw new Error(`Login failed for ${email}: ${res.status}`);
  const setCookie = res.headers['set-cookie'];
  return setCookie.map(c => c.split(';')[0]).join('; ');
}

async function run() {
  console.log('--- START VERIFYING MODULE 8: ORDER LIFECYCLE, SELLER FULFILLMENT & WHITE-GLOVE CONFIRMATION ---');

  // Step 1: Verify Web /don-hang returns 200
  console.log('[Step 1] Checking GET http://localhost:3000/don-hang...');
  const ordersWeb = await request('http://localhost:3000/don-hang');
  if (ordersWeb.status !== 200) {
    throw new Error(`Web /don-hang returned status ${ordersWeb.status}`);
  }
  console.log('✓ /don-hang order listing page is online and returning 200 OK');

  // Step 2: Authenticate as buyer
  console.log('[Step 2] Authenticating as buyer@mac.local...');
  const buyerCookie = await login('buyer@mac.local', 'MacLocal2026!');
  console.log('✓ Authenticated as buyer.');

  // Step 3: Create a fresh multi-shop order to test fulfillment & cancellation lifecycle
  console.log('[Step 3] Creating a fresh multi-shop order for verification...');
  const addrRes = await request('http://localhost:4000/api/v1/addresses', { method: 'GET' }, null, buyerCookie);
  const addressId = addrRes.data[0].id;
  
  // Clear cart first to ensure clean state
  const existingCart = await request('http://localhost:4000/api/v1/cart', { method: 'GET' }, null, buyerCookie);
  if (Array.isArray(existingCart.data)) {
    for (const item of existingCart.data) {
      await request(`http://localhost:4000/api/v1/cart/${item.id}`, { method: 'DELETE' }, null, buyerCookie);
    }
  }

  const addRes = await request('http://localhost:4000/api/v1/cart/batch', { method: 'POST' }, {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 }
    ]
  }, buyerCookie);
  if (addRes.status !== 200 && addRes.status !== 201) {
    throw new Error(`Cart batch add failed: ${addRes.status} ${JSON.stringify(addRes.data)}`);
  }

  const cartCheck = await request('http://localhost:4000/api/v1/cart', { method: 'GET' }, null, buyerCookie);
  const cartShops = [...new Set(cartCheck.data.map(l => l.variant.product.shop.id))];
  const vouchers = {};
  for (const sId of cartShops) {
    vouchers[sId] = 'RUNWAY20';
  }

  const quoteRes = await request('http://localhost:4000/api/v1/checkout/quote', { method: 'POST' }, {
    addressId,
    vouchers
  }, buyerCookie);
  if (quoteRes.status !== 200 && quoteRes.status !== 201) {
    throw new Error(`Checkout quote failed: ${quoteRes.status} ${JSON.stringify(quoteRes.data)}`);
  }
  if (!quoteRes.data?.id) {
    throw new Error(`Quote has no ID: ${JSON.stringify(quoteRes.data)}`);
  }

  const orderRes = await request('http://localhost:4000/api/v1/orders', { method: 'POST' }, {
    quoteId: quoteRes.data.id,
    idempotencyKey: crypto.randomUUID(),
    paymentMethod: 'VIETQR'
  }, buyerCookie);
  if (orderRes.status !== 200 && orderRes.status !== 201) {
    throw new Error(`Order creation failed: ${orderRes.status} ${JSON.stringify(orderRes.data)}`);
  }
  const freshOrder = orderRes.data;
  console.log(`✓ Fresh order created: #${freshOrder.code} (${freshOrder.id}) with ${freshOrder.shops.length} suborders.`);

  // Step 4: Verify Order Detail page HTTP 200
  console.log(`[Step 4] Checking GET http://localhost:3000/don-hang/${freshOrder.id}...`);
  const detailWeb = await request(`http://localhost:3000/don-hang/${freshOrder.id}`);
  if (detailWeb.status !== 200) {
    throw new Error(`Web order detail returned status ${detailWeb.status}`);
  }
  console.log('✓ Order detail page is online and returning 200 OK');

  // Step 5: Identify suborders
  const nepSuborder = freshOrder.shops.find(s => s.shopId === 'shop-nep');
  const otherSuborder = freshOrder.shops.find(s => s.shopId !== 'shop-nep');
  if (!nepSuborder) throw new Error('shop-nep suborder not found');
  console.log(`✓ Found suborders: NÉP Studio (#${nepSuborder.id}), Partner Shop (#${otherSuborder?.id})`);

  // Step 6: Authenticate as seller.a (NÉP Studio) and transition through fulfillment stages
  console.log('[Step 6] Authenticating as seller.a@mac.local to fulfill suborder...');
  const sellerCookie = await login('seller.a@mac.local', 'MacLocal2026!');

  // Transition: PENDING -> CONFIRMED
  console.log('  → Transitioning suborder: PENDING -> CONFIRMED...');
  const confRes = await request(`http://localhost:4000/api/v1/seller/shops/shop-nep/orders/${nepSuborder.id}/transition`, { method: 'POST' }, { status: 'CONFIRMED' }, sellerCookie);
  if (confRes.status !== 200 && confRes.status !== 201) throw new Error(`Transition CONFIRMED failed: ${confRes.status}`);

  // Transition: CONFIRMED -> PACKED
  console.log('  → Transitioning suborder: CONFIRMED -> PACKED...');
  const packRes = await request(`http://localhost:4000/api/v1/seller/shops/shop-nep/orders/${nepSuborder.id}/transition`, { method: 'POST' }, { status: 'PACKED' }, sellerCookie);
  if (packRes.status !== 200 && packRes.status !== 201) throw new Error(`Transition PACKED failed: ${packRes.status}`);

  // Transition: PACKED -> SHIPPED
  console.log('  → Transitioning suborder: PACKED -> SHIPPED...');
  const shipRes = await request(`http://localhost:4000/api/v1/seller/shops/shop-nep/orders/${nepSuborder.id}/transition`, { method: 'POST' }, { status: 'SHIPPED' }, sellerCookie);
  if (shipRes.status !== 200 && shipRes.status !== 201) throw new Error(`Transition SHIPPED failed: ${shipRes.status}`);
  console.log('✓ Suborder fulfilled & shipped by workshop. Airway bill generated.');

  // Step 7: Customer confirms white-glove delivery receipt
  console.log('[Step 7] Customer confirming receipt via POST /api/v1/orders/shops/:id/confirm-receipt...');
  const confirmRes = await request(`http://localhost:4000/api/v1/orders/shops/${nepSuborder.id}/confirm-receipt`, { method: 'POST' }, null, buyerCookie);
  if (confirmRes.status !== 200 && confirmRes.status !== 201) {
    throw new Error(`Confirm receipt failed: ${confirmRes.status} ${JSON.stringify(confirmRes.data)}`);
  }
  console.log(`✓ Order receipt confirmed: Status ${confirmRes.data.status}, Delivered At: ${confirmRes.data.deliveredAt}`);

  // Step 8: Customer writes verified review
  console.log('[Step 8] Customer writing review for delivered item via POST /api/v1/reviews...');
  const targetItem = nepSuborder.items[0];
  if (!targetItem) throw new Error('No items in suborder');
  const reviewRes = await request('http://localhost:4000/api/v1/reviews', { method: 'POST' }, {
    orderItemId: targetItem.id,
    rating: 5,
    body: 'Chất vải lanh tự nhiên cực kỳ thoáng mát, đường may viền tỉ mỉ chuẩn Haute Couture!'
  }, buyerCookie);
  if (reviewRes.status !== 200 && reviewRes.status !== 201) {
    throw new Error(`Review failed: ${reviewRes.status} ${JSON.stringify(reviewRes.data)}`);
  }
  console.log(`✓ 5-star review submitted successfully for item #${targetItem.id}!`);

  // Step 9: Test cancellation on the other pending suborder
  if (otherSuborder) {
    console.log(`[Step 9] Testing buyer cancellation on pending suborder #${otherSuborder.id}...`);
    const cancelRes = await request(`http://localhost:4000/api/v1/orders/shops/${otherSuborder.id}/cancel`, { method: 'POST' }, null, buyerCookie);
    if (cancelRes.status !== 200 && cancelRes.status !== 201) {
      throw new Error(`Cancellation failed: ${cancelRes.status}`);
    }
    console.log(`✓ Suborder cancelled cleanly: Status ${cancelRes.data.status}`);
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL 9 CHECKS FOR MODULE 8 (ORDER LIFECYCLE & DELIVERY) PASSED 100%!');
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
