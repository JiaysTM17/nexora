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
  console.log('Testing Admin Swatch Orders & Voucher Supervision End-to-End...');

  // 1. Authenticate Admin
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@mac.local', password: 'MacLocal2026!' });
  const adminCookie = adminLogin.setCookie ? adminLogin.setCookie[0] : '';
  if (adminLogin.status !== 200 && adminLogin.status !== 201) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  }
  console.log('✓ Admin authenticated');

  // 2. Authenticate Buyer & create a Swatch Order
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) {
    throw new Error('Buyer login failed: ' + JSON.stringify(buyerLogin.data));
  }

  const newSwatch = await request('/swatch-orders', 'POST', {
    productId: 'linen-shirt',
    shopId: 'shop-nep',
    productName: 'Sơ mi linen thong thả (Bản thử mẫu)',
    swatches: ['Linen Normandy Trắng Tơ', 'Lanh Mộc Tự Nhiên', 'Cotton Bông Dệt Mộc'],
    recipientName: 'Võ Thị Mai Phương',
    phone: '0912345678',
    address: 'Toà Nhà Bitexco, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    depositFee: 50000,
  }, buyerCookie);

  if (newSwatch.status !== 200 && newSwatch.status !== 201) {
    throw new Error('Buyer create swatch order failed: ' + JSON.stringify(newSwatch.data));
  }
  const createdSwatchId = newSwatch.data.swatchOrder.id;
  const createdVoucher = newSwatch.data.voucherCode;
  console.log(`✓ Buyer created Swatch Order [${createdSwatchId}] with Voucher [${createdVoucher}]`);

  // 3. Authenticate Seller & Dispatch
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  if (sellerLogin.status !== 200 && sellerLogin.status !== 201) {
    throw new Error('Seller login failed: ' + JSON.stringify(sellerLogin.data));
  }

  const dispatchRes = await request(`/seller/shops/shop-nep/swatch-orders/${createdSwatchId}/dispatch`, 'POST', {
    carrier: 'EMS Hỏa Tốc Sáp Ong',
    trackingNumber: `EMS-NX-${createdSwatchId.slice(-6)}`,
  }, sellerCookie);

  if (dispatchRes.status !== 200 && dispatchRes.status !== 201) {
    throw new Error('Seller dispatch swatch failed: ' + JSON.stringify(dispatchRes.data));
  }
  console.log(`✓ Seller dispatched Swatch Order [${createdSwatchId}]: status = ${dispatchRes.data.swatchOrder?.status}`);

  // 4. Admin query GET /admin/swatch-orders
  const adminRes = await request('/admin/swatch-orders', 'GET', null, adminCookie);
  console.log('GET /admin/swatch-orders status:', adminRes.status);
  if (adminRes.status !== 200) {
    throw new Error('GET /admin/swatch-orders failed: ' + JSON.stringify(adminRes.data));
  }

  const { kpis, swatchOrders } = adminRes.data;
  console.log('Admin KPIs:', kpis);
  console.log(`Total Swatch Orders found in Admin audit: ${swatchOrders.length}`);

  if (!kpis || typeof kpis.totalOrders !== 'number' || typeof kpis.dispatchedCount !== 'number') {
    throw new Error('Invalid KPI payload structure');
  }

  const found = swatchOrders.find(s => s.id === createdSwatchId);
  if (!found) {
    throw new Error(`Target swatch order [${createdSwatchId}] not found in Admin audit log`);
  }

  if (found.status !== 'DISPATCHED') {
    throw new Error(`Expected status DISPATCHED, got ${found.status}`);
  }

  if (found.voucherCode !== createdVoucher) {
    throw new Error(`Voucher mismatch: expected ${createdVoucher}, got ${found.voucherCode}`);
  }

  console.log(`✓ Verified target swatch order in Admin ledger: Voucher = ${found.voucherCode}, Status = ${found.status}`);
  console.log('=== Admin Swatch Orders & Voucher Supervision Verification 100% SUCCESS ===');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
