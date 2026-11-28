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
  console.log('Testing Atelier Bespoke Workbench End-to-End...');
  
  // 1. Login as buyer
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  console.log('Buyer login status:', buyerLogin.status);

  // 2. Login as seller
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  console.log('Seller login status:', sellerLogin.status);

  // Get seller shops
  const shopsRes = await request('/seller/shops', 'GET', null, sellerCookie);
  const shop = shopsRes.data[0];
  console.log('Seller shop:', shop.name, shop.id);

  // 3. Buyer creates a bespoke order
  const bespokeId = 'BESPOKE-TEST-' + Date.now().toString().slice(-6);
  const createRes = await request('/vault/bespoke', 'POST', {
    id: bespokeId,
    productName: 'Áo sơ mi lanh Normandy may rập thủ công',
    shopId: shop.id,
    shopName: shop.name,
    variant: 'Trắng mộc ngà · Tailored Fit',
    monogram: 'N.X.T',
    lining: 'Lụa Jacquard tơ tằm dệt chìm hoa hoàng gia',
    notes: 'Hạ nách 1cm, vạt sau dài hơn 2cm',
    queuePos: 3,
    passport: {
      height: 178,
      weight: 70,
      chest: 98,
      waist: 80,
      hips: 96,
      shoulder: 45,
      armLength: 62,
      fitPreference: 'Tailored Fit'
    },
    stage: 'PATTERNING',
    masterTailor: 'Master Tailor Hoàng Nam',
  }, buyerCookie);
  console.log('Create bespoke status:', createRes.status, 'ID:', createRes.data?.bespoke?.id);

  // 4. Workshop queries bespoke orders
  const listRes = await request(`/seller/shops/${shop.id}/bespoke`, 'GET', null, sellerCookie);
  console.log('Workshop bespoke orders count:', listRes.data?.length);
  const found = listRes.data.find(b => b.id === bespokeId);
  if (!found) throw new Error('Bespoke order not found in seller list!');
  console.log('✓ Found bespoke order in seller workbench:', found.productName, 'Stage:', found.stage);

  // 5. Master Tailor transitions stage to FABRIC_CUTTING
  const stageRes = await request(`/seller/shops/${shop.id}/bespoke/${bespokeId}/stage`, 'POST', {
    stage: 'FABRIC_CUTTING',
    tailorNote: 'Đã phóng rập giấy chuẩn nhân trắc, tiến hành cắt vải mộc.',
    masterTailor: 'Master Tailor Hoàng Nam',
  }, sellerCookie);
  console.log('Stage transition status:', stageRes.status, 'New stage:', stageRes.data?.bespoke?.stage);

  // 6. Buyer checks vault
  const vaultRes = await request('/vault/bespoke', 'GET', null, buyerCookie);
  const buyerBespoke = vaultRes.data.find(b => b.id === bespokeId);
  console.log('Buyer sees updated stage:', buyerBespoke?.stage, 'Tailor note:', buyerBespoke?.tailorNote);

  if (buyerBespoke?.stage === 'FABRIC_CUTTING') {
    console.log('🎉 ALL BESPOKE WORKBENCH TESTS PASSED 100%!');
  } else {
    throw new Error('Buyer does not see updated stage!');
  }
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
