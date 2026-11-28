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
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const prisma = new PrismaClient();

function request(url, options = {}, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const headers = {
      ...(options.headers || {}),
      'X-Requested-With': 'mac-web',
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    let data = null;
    if (body) {
      data = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          let parsedData = resBody;
          try {
            parsedData = JSON.parse(resBody);
          } catch {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
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
  console.log('--- START VERIFYING MODULE 10: SELLER PORTAL, ESCROW PAYOUT & INVENTORY ---');

  // Step 1: Web Seller Portal Route
  console.log('[Step 1] Checking GET http://localhost:3000/seller...');
  const webRes = await request('http://localhost:3000/seller');
  if (webRes.status !== 200) {
    throw new Error(`Web /seller returned status ${webRes.status}`);
  }
  console.log('✓ /seller portal is online and returning 200 OK');

  // Step 2: Authenticate as Workshop Seller
  console.log('[Step 2] Authenticating as seller.a@mac.local (NÉP Studio)...');
  const sellerCookie = await login('seller.a@mac.local', 'MacLocal2026!');
  console.log('✓ Authenticated as workshop seller.');

  // Step 3: Query Seller Shops
  console.log('[Step 3] Querying seller shops via GET /api/v1/seller/shops...');
  const shopsRes = await request('http://localhost:4000/api/v1/seller/shops', { method: 'GET' }, null, sellerCookie);
  if (shopsRes.status !== 200 || !shopsRes.data?.length) {
    throw new Error(`Failed to fetch seller shops: ${shopsRes.status}`);
  }
  const shop = shopsRes.data.find((s) => s.id === 'shop-nep') || shopsRes.data[0];
  console.log(`✓ Workshop shop identified: "${shop.name}" (${shop.id}), Status: ${shop.status}, Fee: ${shop.feeBps / 100}%`);

  // Step 4: Query Seller Orders
  console.log(`[Step 4] Querying workshop orders via GET /api/v1/seller/shops/${shop.id}/orders...`);
  const ordersRes = await request(`http://localhost:4000/api/v1/seller/shops/${shop.id}/orders`, { method: 'GET' }, null, sellerCookie);
  if (ordersRes.status !== 200) {
    throw new Error(`Failed to fetch seller orders: ${ordersRes.status}`);
  }
  console.log(`✓ Retrieved ${ordersRes.data.length} suborders for workshop.`);

  // Step 5: Query Seller Products
  console.log(`[Step 5] Querying workshop products via GET /api/v1/seller/shops/${shop.id}/products...`);
  const prodsRes = await request(`http://localhost:4000/api/v1/seller/shops/${shop.id}/products`, { method: 'GET' }, null, sellerCookie);
  if (prodsRes.status !== 200 || !prodsRes.data?.length) {
    throw new Error(`Failed to fetch seller products: ${prodsRes.status}`);
  }
  const sampleVariant = prodsRes.data[0].variants[0];
  console.log(`✓ Retrieved ${prodsRes.data.length} products. Sample SKU: ${sampleVariant.sku} (${sampleVariant.color}/${sampleVariant.size})`);

  // Step 6: Test Physical Inventory Stock Adjustment
  console.log(`[Step 6] Adjusting stock via PATCH /api/v1/seller/shops/${shop.id}/variants/${sampleVariant.id}/stock...`);
  const adjustKey = `test-${Date.now()}`;
  const stockRes = await request(
    `http://localhost:4000/api/v1/seller/shops/${shop.id}/variants/${sampleVariant.id}/stock`,
    { method: 'PATCH' },
    { delta: 2, reason: 'Atelier hand-crafted batch restock', key: adjustKey },
    sellerCookie
  );
  if (stockRes.status !== 200) {
    throw new Error(`Stock adjustment failed: ${stockRes.status} ${JSON.stringify(stockRes.data)}`);
  }
  console.log(`✓ Stock adjustment applied: onHand = ${stockRes.data.onHand}, reserved = ${stockRes.data.reserved}`);

  // Step 7: Query 3-Tier Seller Ledger
  console.log(`[Step 7] Inspecting 3-tier Escrow Ledger via GET /api/v1/seller/shops/${shop.id}/ledger...`);
  const ledgerRes = await request(`http://localhost:4000/api/v1/seller/shops/${shop.id}/ledger`, { method: 'GET' }, null, sellerCookie);
  if (ledgerRes.status !== 200) {
    throw new Error(`Failed to fetch seller ledger: ${ledgerRes.status}`);
  }
  const ledger = ledgerRes.data;
  console.log(`✓ 3-Tier Ledger status:`);
  console.log(`  • Balance (Tổng sổ cái): ${ledger.balance.toLocaleString()}₫`);
  console.log(`  • Available (Khả dụng rút tiền): ${ledger.available.toLocaleString()}₫`);
  console.log(`  • Held (Ký quỹ Escrow 7 ngày): ${ledger.held.toLocaleString()}₫`);
  console.log(`  • Disputed (Đóng băng đổi/trả): ${ledger.disputed.toLocaleString()}₫`);
  console.log(`  • Total ledger entries: ${ledger.entries.length}`);

  // Step 8: Test Shop Voucher Creation
  const newVoucherCode = `ATELIER${Date.now().toString().slice(-4)}`;
  console.log(`[Step 8] Creating new workshop voucher "${newVoucherCode}" via POST /api/v1/seller/shops/${shop.id}/vouchers...`);
  const voucherRes = await request(
    `http://localhost:4000/api/v1/seller/shops/${shop.id}/vouchers`,
    { method: 'POST' },
    {
      code: newVoucherCode,
      amount: 40000,
      minimum: 300000,
      maxUses: 50,
      daysValid: 45,
    },
    sellerCookie
  );
  if (voucherRes.status !== 200 && voucherRes.status !== 201) {
    throw new Error(`Voucher creation failed: ${voucherRes.status} ${JSON.stringify(voucherRes.data)}`);
  }
  console.log(`✓ Workshop voucher created: "${voucherRes.data.code}", discount: ${voucherRes.data.amount}₫, min: ${voucherRes.data.minimum}₫`);

  // Step 9: Test Napas 24/7 Escrow Payout Request
  console.log(`[Step 9] Testing Napas 24/7 Escrow Payout request...`);
  // Ensure workshop has sufficient available balance for withdrawal test
  if (ledger.available < 50000) {
    console.log('  Notice: Available balance < 50.000₫, injecting a test ledger credit entry...');
    await prisma.sellerLedgerEntry.create({
      data: {
        shopId: shop.id,
        kind: 'ESCROW_SETTLEMENT_CREDIT',
        amount: 250000,
        sourceKey: `settle:test:${Date.now()}`,
      },
    });
  }

  const payoutRes = await request(
    `http://localhost:4000/api/v1/seller/shops/${shop.id}/payout`,
    { method: 'POST' },
    {
      amount: 50000,
      bankName: 'MBBank (Ngân hàng Quân đội)',
      accountNumber: '999988886666',
      beneficiaryName: 'CONG TY TNHH THOI TRANG NEP STUDIO',
    },
    sellerCookie
  );
  if (payoutRes.status !== 200 && payoutRes.status !== 201) {
    throw new Error(`Payout request failed: ${payoutRes.status} ${JSON.stringify(payoutRes.data)}`);
  }
  console.log(`✓ Napas 24/7 Payout successfully processed:`);
  console.log(`  • Transfer Ref: ${payoutRes.data.transferRef}`);
  console.log(`  • Withdrawn: ${payoutRes.data.amount.toLocaleString()}₫`);
  console.log(`  • Bank: ${payoutRes.data.bankName} - STK: ${payoutRes.data.accountNumber}`);
  console.log(`  • Beneficiary: ${payoutRes.data.beneficiaryName}`);
  console.log(`  • Status: ${payoutRes.data.estimatedArrival}`);

  console.log('\n========================================================================');
  console.log('🎉 ALL 9 CHECKS FOR MODULE 10 (SELLER PORTAL & ESCROW PAYOUT) PASSED 100%!');
  console.log('========================================================================\n');
}

run()
  .catch((e) => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
