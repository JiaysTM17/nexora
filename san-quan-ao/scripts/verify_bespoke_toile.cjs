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
  console.log('--- Testing Bespoke Muslin Toile Fitting Milestone & Client Co-Creation ---');

  // 1. Login Seller
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  if (sellerLogin.status !== 200 && sellerLogin.status !== 201) throw new Error('Seller login failed');
  console.log('✓ Seller authenticated');

  const shopsRes = await request('/seller/shops', 'GET', null, sellerCookie);
  const shop = shopsRes.data[0];
  console.log('✓ Workshop:', shop.name, shop.id);

  // 2. Fetch bespoke orders for this workshop
  const bespokeRes = await request(`/seller/shops/${shop.id}/bespoke`, 'GET', null, sellerCookie);
  let targetOrder = bespokeRes.data?.[0];

  // If no bespoke order exists for this shop, create a test one
  if (!targetOrder) {
    const testId = `BESPOKE-TOILE-TEST-${Math.floor(Math.random() * 900000 + 100000)}`;
    await request(`/seller/shops/${shop.id}/bespoke/${testId}/stage`, 'POST', {
      stage: 'PATTERNING',
      tailorNote: 'Đang dựng rập 2D và may mẫu vải mộc thử phom.',
      masterTailor: 'Nghệ nhân Nguyễn Văn Cường',
      estimatedDays: 7,
    }, sellerCookie);
    targetOrder = { id: testId };
  }
  console.log('✓ Target Bespoke Order ID:', targetOrder.id);

  // 3. Seller submits Toile Muslin dossier
  const submitToileRes = await request(`/seller/shops/${shop.id}/bespoke/${targetOrder.id}/toile`, 'POST', {
    frontViewUrl: '/images/toile-front-sample.jpg',
    sideViewUrl: '/images/toile-side-sample.jpg',
    backViewUrl: '/images/toile-back-sample.jpg',
    shoulderSlope: 'SLOPING',
    postureBalance: 'ERECT',
    easeAllowanceBust: 6.5,
    easeAllowanceWaist: 4.0,
    masterNotes: 'Đã hiệu chỉnh độ dốc vai xuôi +0.8cm, nách áo thả lỏng để cử động thoải mái.',
    status: 'SUBMITTED_FOR_CLIENT_REVIEW',
  }, sellerCookie);

  console.log('✓ Seller submitted Toile status:', submitToileRes.status);
  if (submitToileRes.status !== 200 && submitToileRes.status !== 201) {
    throw new Error('Submit toile failed: ' + JSON.stringify(submitToileRes.data));
  }

  // 4. Buyer Login & Fetch Toile
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) throw new Error('Buyer login failed');
  console.log('✓ Buyer authenticated');

  const getToileRes = await request(`/bespoke/${targetOrder.id}/toile`, 'GET', null, buyerCookie);
  console.log('✓ Buyer GET Toile status:', getToileRes.status, 'Toile data status:', getToileRes.data.toile?.status);
  if (!getToileRes.data.toile || getToileRes.data.toile.shoulderSlope !== 'SLOPING') {
    throw new Error('Toile dossier mismatch');
  }

  // 5. Buyer requests micro-adjustment first
  const adjustRes = await request(`/bespoke/${targetOrder.id}/toile-decision`, 'POST', {
    decision: 'REQUEST_ADJUSTMENT',
    clientNote: 'Vui lòng hạ đường hạ ngực thêm 0.5cm để ve áo mở thanh thoát hơn.',
    adjustments: { chestEase: '+0.5cm', collarSlope: 'slightly lower' },
  }, buyerCookie);

  console.log('✓ Buyer requested adjustment status:', adjustRes.status, 'Toile status:', adjustRes.data.toile?.status);
  if (adjustRes.data.toile?.status !== 'REVISION_REQUESTED') {
    throw new Error('Expected REVISION_REQUESTED');
  }

  // 6. Buyer approves Toile Muslin for final cloth cutting
  const approveRes = await request(`/bespoke/${targetOrder.id}/toile-decision`, 'POST', {
    decision: 'APPROVE',
    clientNote: 'Đã hoàn toàn ưng ý dáng vải mộc! Cho phép xưởng hạ kéo cắt vải chính.',
  }, buyerCookie);

  console.log('✓ Buyer approved Toile status:', approveRes.status, 'Next stage:', approveRes.data.stage);
  if (approveRes.data.stage !== 'FABRIC_CUTTING' || approveRes.data.toile?.status !== 'CLIENT_APPROVED') {
    throw new Error('Expected FABRIC_CUTTING and CLIENT_APPROVED');
  }

  console.log('=== Bespoke Muslin Toile Fitting Milestone Verification 100% SUCCESS ===');
}

run().catch(err => {
  console.error('Toile Verification Failed:', err);
  process.exit(1);
});
