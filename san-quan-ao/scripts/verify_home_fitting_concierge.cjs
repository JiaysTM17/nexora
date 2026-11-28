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
  console.log('Testing VIP Home-Fitting & Personal Concierge Service End-to-End...');

  // 1. Login Buyer
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  console.log('Buyer login status:', buyerLogin.status);
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) throw new Error('Buyer login failed');

  // 2. Login Seller
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  console.log('Seller login status:', sellerLogin.status);
  if (sellerLogin.status !== 200 && sellerLogin.status !== 201) throw new Error('Seller login failed');

  const shopsRes = await request('/seller/shops', 'GET', null, sellerCookie);
  const shop = shopsRes.data[0];
  console.log('Target workshop:', shop.name, shop.id);

  // 3. Login Admin
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@mac.local', password: 'MacLocal2026!' });
  const adminCookie = adminLogin.setCookie ? adminLogin.setCookie[0] : '';
  console.log('Admin login status:', adminLogin.status);
  if (adminLogin.status !== 200 && adminLogin.status !== 201) throw new Error('Admin login failed');

  // 4. Buyer books VIP Home-Fitting
  const bookRes = await request('/concierge/fitting', 'POST', {
    productName: 'Bộ Suit Sartorial Dạ Len Loro Piana Super 150s',
    shopId: shop.id,
    appointmentDate: '27/11/2026',
    timeSlot: 'AFTERNOON_14_16',
    address: 'Căn hộ Penthouse 4502, Landmark 81, Q. Bình Thạnh, TP.HCM',
    phone: '0901234567',
    recipientName: 'Đặng Quốc Huy',
    fabricSuitcaseRequested: true,
    specialNotes: 'Mang theo vali mẫu len Ý 150s và lụa Bảo Lộc, chuẩn bị thước dây đo lại vai.',
  }, buyerCookie);

  console.log('Buyer booked Home-Fitting status:', bookRes.status);
  console.log('Fitting ID:', bookRes.data.fitting?.id, 'Status:', bookRes.data.fitting?.status);
  if (bookRes.status !== 200 && bookRes.status !== 201) {
    throw new Error('Booking failed: ' + JSON.stringify(bookRes.data));
  }
  const fittingId = bookRes.data.fitting.id;

  // 5. Buyer retrieves fittings ledger
  const buyerFittings = await request('/concierge/fittings', 'GET', null, buyerCookie);
  console.log('Buyer fittings count:', buyerFittings.data.length);
  const foundBuyerFit = buyerFittings.data.find(f => f.id === fittingId);
  if (!foundBuyerFit) throw new Error('Created fitting not found in buyer list');
  console.log('Found fitting in buyer ledger:', foundBuyerFit.id, foundBuyerFit.status);

  // 6. Seller retrieves fittings in workshop workbench
  const sellerFittings = await request(`/seller/shops/${shop.id}/fittings`, 'GET', null, sellerCookie);
  console.log('Seller fittings count:', sellerFittings.data.length);
  const foundSellerFit = sellerFittings.data.find(f => f.id === fittingId);
  if (!foundSellerFit) throw new Error('Created fitting not found in seller list');
  console.log('Found fitting in seller workbench:', foundSellerFit.id, foundSellerFit.customerName);

  // 7. Seller dispatches Senior Stylist & Suitcase
  const dispatchRes1 = await request(`/seller/shops/${shop.id}/fittings/${fittingId}/dispatch`, 'POST', {
    status: 'VALET_ASSIGNED',
    stylistName: 'Trần Hoàng My (Senior Stylist)',
    stylistPhone: '0988776655',
    valetNotes: 'Đã chuẩn bị hoàn tất Vali 40+ mẫu Len Loro Piana và gương soi di động.',
  }, sellerCookie);
  console.log('Seller dispatch status (VALET_ASSIGNED):', dispatchRes1.status, dispatchRes1.data.fitting.status);

  // 8. Stylist En-Route
  const dispatchRes2 = await request(`/seller/shops/${shop.id}/fittings/${fittingId}/dispatch`, 'POST', {
    status: 'EN_ROUTE',
    stylistName: 'Trần Hoàng My (Senior Stylist)',
    stylistPhone: '0988776655',
    valetNotes: 'Chuyên viên đang di chuyển trên xe điện VinFast, dự kiến đến lúc 14:15.',
  }, sellerCookie);
  console.log('Seller dispatch status (EN_ROUTE):', dispatchRes2.status, dispatchRes2.data.fitting.status);

  // 9. Completed & Order Converted at home
  const convertRes = await request(`/seller/shops/${shop.id}/fittings/${fittingId}/dispatch`, 'POST', {
    status: 'ORDER_CONVERTED',
    stylistName: 'Trần Hoàng My (Senior Stylist)',
    stylistPhone: '0988776655',
    valetNotes: 'Khách hàng thử áo mẫu rất ưng ý. Đã đo lại vòng ngực 98cm và chốt hợp đồng may đo bộ suit cao cấp.',
    conversionAmount: 4200000,
  }, sellerCookie);
  console.log('Seller convert status (ORDER_CONVERTED):', convertRes.status, 'Revenue:', convertRes.data.fitting.conversionAmount);

  // 10. Admin retrieves network-wide concierge fittings & conversion KPIs
  const adminRes = await request('/admin/concierge/fittings', 'GET', null, adminCookie);
  console.log('Admin concierge fittings status:', adminRes.status);
  console.log('Admin KPIs:', adminRes.data.kpis);
  if (adminRes.status !== 200) throw new Error('Admin concierge API failed');

  const { totalFittings, convertedFittings, totalConvertedRevenue, conversionRatePct } = adminRes.data.kpis;
  if (totalFittings < 1 || convertedFittings < 1 || totalConvertedRevenue < 4200000) {
    throw new Error('Admin KPI calculations did not reflect converted fitting');
  }

  console.log('🎉 ALL VIP HOME-FITTING & CONCIERGE TESTS PASSED 100%!');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
