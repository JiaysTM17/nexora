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
  console.log('Testing Admin Bespoke Supervision & QA Audit End-to-End...');
  
  // 1. Login as Admin
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@mac.local', password: 'MacLocal2026!' });
  const adminCookie = adminLogin.setCookie ? adminLogin.setCookie[0] : '';
  console.log('Admin login status:', adminLogin.status);
  if (adminLogin.status !== 200 && adminLogin.status !== 201) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  }

  // 2. Fetch all bespoke orders and KPIs from /admin/bespoke
  const bespokeRes = await request('/admin/bespoke', 'GET', null, adminCookie);
  console.log('GET /admin/bespoke status:', bespokeRes.status);
  if (bespokeRes.status !== 200) {
    throw new Error('GET /admin/bespoke failed: ' + JSON.stringify(bespokeRes.data));
  }

  const { kpis, orders } = bespokeRes.data;
  console.log('KPIs:', kpis);
  console.log('Total bespoke orders in network:', orders.length);

  if (!kpis || typeof kpis.totalOrders !== 'number' || typeof kpis.capacityLoadPct !== 'number') {
    throw new Error('Invalid KPI payload structure');
  }

  // 3. Ensure we have at least one bespoke order to test QA Audit
  let targetOrderId;
  if (orders.length > 0) {
    targetOrderId = orders[0].id;
  } else {
    // Seed an order as buyer if none exists
    const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
    const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
    targetOrderId = 'BESPOKE-AUDIT-' + Date.now().toString().slice(-6);
    await request('/vault/bespoke', 'POST', {
      id: targetOrderId,
      productName: 'Bộ Suit 2 Khuy Dạ Len Ý Sartorial',
      variant: 'Than chì Midnight · Fit bespoke',
      lining: 'Lụa Tơ Tằm Bảo Lộc',
      notes: 'May đo kỹ thuật cao',
      status: 'HAND_STITCHING',
    }, buyerCookie);
    console.log('Seeded bespoke order for audit:', targetOrderId);
  }

  console.log('Target order for QA Audit:', targetOrderId);

  // 4. Perform QA Audit with PREMIUM_A_PLUS
  const auditRes = await request(`/admin/bespoke/${targetOrderId}/qa-audit`, 'POST', {
    grade: 'PREMIUM_A_PLUS',
    inspector: 'Đặng Quốc Huy (Giám sát Hiệp hội)',
    note: 'Đường may phẳng mịn, canh sợi thẳng tắp, dung sai cử động đạt chuẩn Haute Couture.',
  }, adminCookie);

  console.log('POST QA Audit (PREMIUM_A_PLUS) status:', auditRes.status);
  console.log('QA Audit response:', auditRes.data);
  if (auditRes.status !== 200 && auditRes.status !== 201) {
    throw new Error('QA Audit failed: ' + JSON.stringify(auditRes.data));
  }
  if (!auditRes.data.qaAudit || auditRes.data.qaAudit.certified !== true) {
    throw new Error('QA Audit did not certify order as expected');
  }

  // 5. Test Rework Request (REWORK_REQUIRED)
  const reworkRes = await request(`/admin/bespoke/${targetOrderId}/qa-audit`, 'POST', {
    grade: 'REWORK_REQUIRED',
    inspector: 'Đặng Quốc Huy (Giám sát Hiệp hội)',
    note: 'Độ ôm ve áo bên trái hơi lệch 0.5cm so với rập gốc. Yêu cầu là ép lại và chỉnh nếp.',
  }, adminCookie);

  console.log('POST QA Audit (REWORK_REQUIRED) status:', reworkRes.status);
  console.log('Rework response stage:', reworkRes.data.stage, 'certified:', reworkRes.data.qaAudit.certified);
  if (reworkRes.data.qaAudit.certified !== false || reworkRes.data.stage !== 'FINISHING_QC') {
    throw new Error('Rework audit did not update stage to FINISHING_QC or certified to false');
  }

  // 6. Restore to PREMIUM_A_PLUS to keep system clean and certified
  await request(`/admin/bespoke/${targetOrderId}/qa-audit`, 'POST', {
    grade: 'PREMIUM_A_PLUS',
    inspector: 'Đặng Quốc Huy (Giám sát Hiệp hội)',
    note: 'Đã hoàn tất chỉnh nếp ve áo hoàn mỹ. Đạt tiêu chuẩn xuất xưởng Thượng Hạng A+.',
  }, adminCookie);

  // 7. Verify updated list
  const refreshed = await request('/admin/bespoke', 'GET', null, adminCookie);
  const updatedOrder = refreshed.data.orders.find(o => o.id === targetOrderId);
  console.log('Refreshed order QA Grade:', updatedOrder?.qaAudit?.grade, 'Certified:', updatedOrder?.qaAudit?.certified);
  console.log('Updated KPIs:', refreshed.data.kpis);

  console.log('ALL ADMIN BESPOKE & QA AUDIT CHECKS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
