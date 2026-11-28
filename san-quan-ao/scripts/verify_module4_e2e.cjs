const http = require('http');
const fs = require('fs');
const path = require('path');
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
  console.log('--- START VERIFYING MODULE 4: LIVE RUNWAY & VIP STYLIST ENGINE ---');

  // Step 1: Verify Web /live returns 200
  console.log('[Step 1] Checking GET http://localhost:3000/live...');
  const liveRes = await request('http://localhost:3000/live');
  if (liveRes.status !== 200) {
    throw new Error(`Web /live returned status ${liveRes.status}`);
  }
  console.log('✓ /live page is online and returning 200 OK');

  // Step 2: Login as buyer-demo to get auth session
  console.log('[Step 2] Authenticating as buyer@mac.local...');
  const loginRes = await request('http://localhost:4000/api/v1/auth/login', { method: 'POST' }, {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!'
  });
  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
  }
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie) throw new Error('No set-cookie returned upon login');
  const sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
  console.log('✓ Successfully authenticated buyer session.');

  // Step 3: Book VIP Stylist
  console.log('[Step 3] Booking VIP Stylist consultation via POST /api/v1/vault/booking...');
  const bookingPayload = {
    id: `STYLIST-TEST-${Date.now().toString().slice(-4)}`,
    flagship: 'Tư Vấn VIP · Elena Vũ (Senior Stylist)',
    service: 'Phòng Thử Đồ Trực Tuyến 1:1 (Video HD)',
    date: '2026-11-28',
    timeSlot: '19:00 - 20:30',
    vipPass: `VIP-STYLIST-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: 'Tư vấn trang phục dạ tiệc Gala Haute Couture Đông Xuân'
  };
  const bookRes = await request('http://localhost:4000/api/v1/vault/booking', { method: 'POST' }, bookingPayload, sessionCookie);
  if (bookRes.status !== 201 && bookRes.status !== 200) {
    throw new Error(`Failed to book stylist: ${bookRes.status} ${JSON.stringify(bookRes.data)}`);
  }
  const appointmentPass = bookRes.data.booking.vipPass;
  const bookingId = bookRes.data.booking.id;
  console.log(`✓ Stylist booked successfully: Pass ${appointmentPass}, ID: ${bookingId}`);

  // Step 4: Fetch all bookings via GET /api/v1/vault/bookings
  console.log('[Step 4] Fetching bookings via GET /api/v1/vault/bookings...');
  const listRes = await request('http://localhost:4000/api/v1/vault/bookings', { method: 'GET' }, null, sessionCookie);
  if (listRes.status !== 200) {
    throw new Error(`Failed to list bookings: ${listRes.status}`);
  }
  const found = (listRes.data || []).find(b => b.id === bookingId);
  if (!found) {
    throw new Error(`Booked appointment ${bookingId} not found in listing`);
  }
  console.log(`✓ Verified appointment found in vault bookings: ${found.flagship} - ${found.service} (${found.vipPass})`);

  // Step 5: Test atomic runway set batch add to cart
  console.log('[Step 5] Testing atomic runway set batch add via POST /api/v1/cart/batch...');
  const batchRes = await request('http://localhost:4000/api/v1/cart/batch', { method: 'POST' }, {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 }
    ]
  }, sessionCookie);
  if (batchRes.status !== 201 && batchRes.status !== 200) {
    throw new Error(`Batch add to cart failed: ${batchRes.status} ${JSON.stringify(batchRes.data)}`);
  }
  console.log(`✓ Runway set added to cart atomically: Total items in cart: ${batchRes.data.totalQuantity}`);

  // Step 6: Check RUNWAY20 voucher in database
  console.log('[Step 6] Checking RUNWAY20 voucher in database...');
  const vouchers = await prisma.voucher.findMany({
    where: { code: 'RUNWAY20' }
  });
  if (!vouchers || vouchers.length === 0) {
    throw new Error('RUNWAY20 voucher not found in database');
  }
  console.log(`✓ RUNWAY20 voucher verified in database across ${vouchers.length} flagship shops.`);

  // Step 7: Cancel booking via DELETE /api/v1/vault/bookings/:id
  console.log('[Step 7] Testing appointment cancellation via DELETE /api/v1/vault/bookings/:id...');
  const delRes = await request(`http://localhost:4000/api/v1/vault/bookings/${bookingId}`, { method: 'DELETE' }, null, sessionCookie);
  if (delRes.status !== 200) {
    throw new Error(`Failed to cancel booking: ${delRes.status}`);
  }
  console.log(`✓ Appointment cancelled cleanly: ${JSON.stringify(delRes.data)}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 7 CHECKS FOR MODULE 4 (LIVE RUNWAY) PASSED 100%!');
  console.log('======================================================\n');
}

run()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
