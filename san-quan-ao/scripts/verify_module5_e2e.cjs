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
  console.log('--- START VERIFYING MODULE 5: COMMUNITY OOTD, PATRONAGE & P2P GARMENT SWAP ---');

  // Step 1: Verify Web /cong-dong returns 200
  console.log('[Step 1] Checking GET http://localhost:3000/cong-dong...');
  const communityRes = await request('http://localhost:3000/cong-dong');
  if (communityRes.status !== 200) {
    throw new Error(`Web /cong-dong returned status ${communityRes.status}`);
  }
  console.log('✓ /cong-dong community page is online and returning 200 OK');

  // Step 2: Login as buyer-demo
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

  // Step 3: Propose P2P Garment Swap Contract
  console.log('[Step 3] Proposing P2P Swap Contract via POST /api/v1/vault/swap...');
  const swapId = `SWAP-TEST-${Date.now().toString().slice(-4)}`;
  const swapPayload = {
    id: swapId,
    myItem: 'Blazer Linen Khuy Sừng Tự Nhiên (Size M, Mới 95%)',
    myVal: 1850000,
    targetItem: 'Váy Lụa Hà Đông Cắt Xéo (Size S, Mới 98%)',
    targetVal: 1950000,
    escrowLocked: true,
  };
  const swapRes = await request('http://localhost:4000/api/v1/vault/swap', { method: 'POST' }, swapPayload, sessionCookie);
  if (swapRes.status !== 201 && swapRes.status !== 200) {
    throw new Error(`Failed to propose swap: ${swapRes.status} ${JSON.stringify(swapRes.data)}`);
  }
  console.log(`✓ P2P Swap proposed successfully: #${swapId}`);

  // Step 4: Fetch swaps via GET /api/v1/vault/swaps
  console.log('[Step 4] Fetching swaps via GET /api/v1/vault/swaps...');
  const swapsListRes = await request('http://localhost:4000/api/v1/vault/swaps', { method: 'GET' }, null, sessionCookie);
  if (swapsListRes.status !== 200) {
    throw new Error(`Failed to list swaps: ${swapsListRes.status}`);
  }
  const foundSwap = (swapsListRes.data || []).find(s => s.id === swapId);
  if (!foundSwap) {
    throw new Error(`Swap ${swapId} not found in user swaps`);
  }
  console.log(`✓ Verified swap in list: ${foundSwap.myItem} <-> ${foundSwap.targetItem}`);

  // Step 5: Send Creator Patronage via POST /api/v1/vault/patronage
  console.log('[Step 5] Sending Creator Patronage via POST /api/v1/vault/patronage...');
  const patronId = `PATRON-TEST-${Date.now().toString().slice(-4)}`;
  const patronPayload = {
    id: patronId,
    creator: 'Elena Vũ (@elenavu)',
    amount: 50000,
    msg: 'Cảm ơn Elena vì gợi ý cách phối màu Linen và Lụa tuyệt vời!',
    at: '19:45'
  };
  const patronRes = await request('http://localhost:4000/api/v1/vault/patronage', { method: 'POST' }, patronPayload, sessionCookie);
  if (patronRes.status !== 201 && patronRes.status !== 200) {
    throw new Error(`Failed to send patronage: ${patronRes.status} ${JSON.stringify(patronRes.data)}`);
  }
  console.log(`✓ Patronage sent: ${patronPayload.amount}₫ to ${patronPayload.creator}`);

  // Step 6: Fetch patronages via GET /api/v1/vault/patronages
  console.log('[Step 6] Fetching patronages via GET /api/v1/vault/patronages...');
  const patronListRes = await request('http://localhost:4000/api/v1/vault/patronages', { method: 'GET' }, null, sessionCookie);
  if (patronListRes.status !== 200) {
    throw new Error(`Failed to list patronages: ${patronListRes.status}`);
  }
  const foundPatron = (patronListRes.data || []).find(p => p.id === patronId);
  if (!foundPatron) {
    throw new Error(`Patronage ${patronId} not found in user patronages`);
  }
  console.log(`✓ Verified patronage in list: ${foundPatron.amount}₫ for ${foundPatron.creator}`);

  // Step 7: Shop the Look atomic batch add to cart
  console.log('[Step 7] Testing Shop the Look batch add via POST /api/v1/cart/batch...');
  const batchRes = await request('http://localhost:4000/api/v1/cart/batch', { method: 'POST' }, {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 }
    ]
  }, sessionCookie);
  if (batchRes.status !== 201 && batchRes.status !== 200) {
    throw new Error(`Batch add failed: ${batchRes.status} ${JSON.stringify(batchRes.data)}`);
  }
  console.log('✓ Shop the Look added items atomically to cart.');

  // Step 8: Complete P2P Swap via POST /api/v1/vault/swaps/:id/complete
  console.log(`[Step 8] Completing P2P Swap #${swapId}...`);
  const compRes = await request(`http://localhost:4000/api/v1/vault/swaps/${swapId}/complete`, { method: 'POST' }, null, sessionCookie);
  if (compRes.status !== 201 && compRes.status !== 200) {
    throw new Error(`Failed to complete swap: ${compRes.status} ${JSON.stringify(compRes.data)}`);
  }
  console.log(`✓ Swap completed successfully: +${compRes.data.completed.ecoPoints} Green Points, ${compRes.data.completed.co2SavedKg}kg CO2 saved.`);

  console.log('\n========================================================================');
  console.log('🎉 ALL 8 CHECKS FOR MODULE 5 (COMMUNITY & P2P SWAP) PASSED 100%!');
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
