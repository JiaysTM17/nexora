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
  console.log('--- Testing Atelier Fabric Swatch Kit & Touchpoint Order System ---');

  // 1. Login Buyer
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) throw new Error('Buyer login failed');
  console.log('✓ Buyer authenticated');

  // 2. Login Seller
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  if (sellerLogin.status !== 200 && sellerLogin.status !== 201) throw new Error('Seller login failed');
  console.log('✓ Seller authenticated');

  const shopsRes = await request('/seller/shops', 'GET', null, sellerCookie);
  const shop = shopsRes.data[0];
  console.log('✓ Workshop:', shop.name, shop.id);

  // 3. Buyer orders Fabric Swatch Sample Kit
  const orderSwatchRes = await request('/swatch-orders', 'POST', {
    productId: 'linen-shirt',
    productName: 'Sơ mi linen thong thả',
    shopId: shop.id,
    swatches: ['Lanh Normandy Mộc Tự Nhiên', 'Lụa Tơ Tằm Bảo Lộc', 'Dạ Len Loro Piana Super 150s'],
    recipientName: 'Elena Vũ (VIP Client)',
    phone: '0901234567',
    address: 'Căn hộ Penthouse 18B, Quận 1, TP. Hồ Chí Minh',
    depositFee: 50000,
  }, buyerCookie);

  console.log('✓ Swatch Order Status:', orderSwatchRes.status);
  if (orderSwatchRes.status !== 200 && orderSwatchRes.status !== 201) {
    throw new Error('Swatch order failed: ' + JSON.stringify(orderSwatchRes.data));
  }
  const swatchOrder = orderSwatchRes.data.swatchOrder;
  const voucherCode = orderSwatchRes.data.voucherCode;
  console.log('✓ Created Swatch Order ID:', swatchOrder.id, 'Voucher Code:', voucherCode);

  // 4. Buyer retrieves swatch orders
  const buyerSwatches = await request('/swatch-orders', 'GET', null, buyerCookie);
  console.log('✓ Buyer swatch orders count:', buyerSwatches.data?.length);
  const foundInBuyer = buyerSwatches.data?.find(s => s.id === swatchOrder.id);
  if (!foundInBuyer) throw new Error('Swatch order not found in buyer list');

  // 5. Seller retrieves pending swatch orders
  const sellerSwatches = await request(`/seller/shops/${shop.id}/swatch-orders`, 'GET', null, sellerCookie);
  console.log('✓ Seller swatch orders count:', sellerSwatches.data?.length);
  const foundInSeller = sellerSwatches.data?.find(s => s.id === swatchOrder.id);
  if (!foundInSeller) throw new Error('Swatch order not found in seller list');

  // 6. Seller dispatches swatch kit with express courier
  const dispatchRes = await request(`/seller/shops/${shop.id}/swatch-orders/${swatchOrder.id}/dispatch`, 'POST', {
    carrier: 'EMS Chuyển Phát Hỏa Tốc',
    trackingNumber: 'EMS-VIP-889922',
    notes: 'Đã đóng gói phong bì giấy Kraft sáp ong cùng thước dây sartorial và voucher 50.000₫.',
  }, sellerCookie);

  console.log('✓ Dispatch Swatch Status:', dispatchRes.status, 'New status:', dispatchRes.data.swatchOrder?.status);
  if (dispatchRes.data.swatchOrder?.status !== 'DISPATCHED') {
    throw new Error('Expected DISPATCHED status');
  }

  console.log('=== Atelier Fabric Swatch Kit Verification 100% SUCCESS ===');
}

run().catch(err => {
  console.error('Swatch Kit Verification Failed:', err);
  process.exit(1);
});
