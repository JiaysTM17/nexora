const http = require('http');

async function request(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:4000/api/v1' + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'mac-web',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(cookie ? { 'Cookie': cookie } : {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let setCookie = res.headers['set-cookie'];
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, data: parsed, setCookie });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Testing Rare Heritage Fabric Vault & Textile Allocation End-to-End...');

  // 1. Public catalog: GET /fabrics
  const fabricsRes = await request('/fabrics');
  if (fabricsRes.status !== 200 || !fabricsRes.data || !Array.isArray(fabricsRes.data.fabrics)) {
    throw new Error('GET /fabrics failed: ' + JSON.stringify(fabricsRes.data));
  }
  const fabrics = fabricsRes.data.fabrics;
  console.log(`✓ GET /fabrics returned ${fabrics.length} heritage textile bolts`);
  if (fabrics.length < 5) {
    throw new Error(`Expected at least 5 archive bolts, got ${fabrics.length}`);
  }

  const bolt = fabrics.find(f => f.availableMeterage >= 3.0) || fabrics.find(f => f.availableMeterage >= 1.0) || fabrics[0];
  const reserveMeters = Math.min(3.0, bolt.availableMeterage);
  console.log(`  Selected bolt: [${bolt.id}] ${bolt.name} (${bolt.origin}) - Remaining: ${bolt.availableMeterage}m / ${bolt.totalMeterage}m (Reserving: ${reserveMeters}m)`);
  if (!bolt.id || !bolt.name || typeof bolt.availableMeterage !== 'number' || typeof bolt.pricePerMeter !== 'number') {
    throw new Error('Invalid bolt structure in /fabrics response');
  }

  // 2. Buyer authentication
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) {
    throw new Error('Buyer login failed: ' + JSON.stringify(buyerLogin.data));
  }
  console.log('✓ Buyer authenticated');

  // 3. Buyer reserve meterage: POST /fabrics/:id/reserve
  const reserveRes = await request(`/fabrics/${bolt.id}/reserve`, 'POST', {
    meters: reserveMeters,
    purpose: 'May đo áo măng-tô lụa tơ tằm cổ điển phiên bản giới hạn',
  }, buyerCookie);

  if (reserveRes.status !== 200 && reserveRes.status !== 201) {
    throw new Error(`Reserve bolt [${bolt.id}] failed: ` + JSON.stringify(reserveRes.data));
  }
  const reservation = reserveRes.data.reservation;
  console.log(`✓ Reserved ${reservation.meters}m of [${bolt.name}]:`);
  console.log(`  Certificate: ${reservation.certificateCode}`);
  console.log(`  Total: ${reservation.totalAmount} VND | Deposit (30%): ${reservation.depositAmount} VND`);

  if (!reservation.certificateCode || !reservation.certificateCode.startsWith('NX-TEXTILE-VAULT-')) {
    throw new Error('Invalid certificate code format: ' + reservation.certificateCode);
  }
  const expectedDeposit = Math.round(reservation.totalAmount * 0.3);
  if (Math.abs(reservation.depositAmount - expectedDeposit) > 10) {
    throw new Error(`Deposit calculation mismatch: got ${reservation.depositAmount}, expected ${expectedDeposit}`);
  }

  // 4. Buyer verify vault persistence: GET /vault/fabric-reserves
  const vaultRes = await request('/vault/fabric-reserves', 'GET', null, buyerCookie);
  if (vaultRes.status !== 200 || !Array.isArray(vaultRes.data)) {
    throw new Error('GET /vault/fabric-reserves failed: ' + JSON.stringify(vaultRes.data));
  }
  const foundInVault = vaultRes.data.find(r => r.certificateCode === reservation.certificateCode);
  if (!foundInVault) {
    throw new Error(`Created reservation [${reservation.certificateCode}] not found in buyer vault`);
  }
  console.log(`✓ Verified reservation in Buyer Vault (Total reserves in vault: ${vaultRes.data.length})`);

  // 5. Admin authentication & supervision: GET /admin/fabric-vault
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@mac.local', password: 'MacLocal2026!' });
  const adminCookie = adminLogin.setCookie ? adminLogin.setCookie[0] : '';
  if (adminLogin.status !== 200 && adminLogin.status !== 201) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  }
  console.log('✓ Admin authenticated');

  const adminVaultRes = await request('/admin/fabric-vault', 'GET', null, adminCookie);
  if (adminVaultRes.status !== 200) {
    throw new Error('GET /admin/fabric-vault failed: ' + JSON.stringify(adminVaultRes.data));
  }
  const { kpis, reservations } = adminVaultRes.data;
  console.log('Admin Fabric Vault KPIs:', kpis);
  if (!kpis || typeof kpis.totalBolts !== 'number' || typeof kpis.totalMeterageReserved !== 'number') {
    throw new Error('Invalid KPI payload structure in /admin/fabric-vault');
  }
  if (kpis.totalBolts < 5) {
    throw new Error(`Expected at least 5 archive bolts in KPI, got ${kpis.totalBolts}`);
  }
  if (kpis.totalReservations < 1 || kpis.totalMeterageReserved < reserveMeters) {
    throw new Error(`KPI numbers inconsistent with active reservations`);
  }

  const foundInAdmin = reservations.find(r => r.certificateCode === reservation.certificateCode);
  if (!foundInAdmin) {
    throw new Error(`Reservation [${reservation.certificateCode}] not found in Admin audit table`);
  }
  console.log(`✓ Admin audit table contains reservation [${reservation.certificateCode}] for customer [${foundInAdmin.customerName}]`);

  console.log('\n======================================================');
  console.log('  ALL RARE HERITAGE FABRIC VAULT TESTS PASSED (100%)');
  console.log('======================================================');
}

run().catch(err => {
  console.error('\nTest failed:', err);
  process.exit(1);
});
