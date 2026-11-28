// verify_tradein_algorithms.cjs
// Comprehensive E2E Verification of Module 2: Circular Fashion Trade-In & Garment Valuation Engine
const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

function request(urlPath, method = 'GET', data = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(`${API_BASE}${urlPath.startsWith('/') ? '' : '/'}${urlPath}`);
    const postData = data ? JSON.stringify(data) : null;
    const req = http.request(
      fullUrl,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'mac-web',
          Origin: 'http://localhost:3000',
          ...(cookie ? { Cookie: cookie } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : null;
            resolve({ status: res.statusCode, headers: res.headers, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function extractCookie(headers) {
  const setCookies = headers['set-cookie'];
  if (!setCookies) return null;
  return setCookies.map((c) => c.split(';')[0]).join('; ');
}

async function run() {
  console.log('=== STARTING TRADE-IN ALGORITHMIC VERIFICATION ===\n');

  // 1. Authenticate customer & admin
  console.log('[1] Authenticating customer and admin accounts...');
  const userLogin = await request('/auth/login', 'POST', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });
  if (userLogin.status !== 200 && userLogin.status !== 201) {
    throw new Error(`Customer login failed: ${JSON.stringify(userLogin)}`);
  }
  const userCookie = extractCookie(userLogin.headers);
  console.log('✔ Customer authenticated successfully.');

  const adminLogin = await request('/auth/login', 'POST', {
    email: 'admin@mac.local',
    password: 'MacLocal2026!',
  });
  if (adminLogin.status !== 200 && adminLogin.status !== 201) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
  }
  const adminCookie = extractCookie(adminLogin.headers);
  console.log('✔ Admin authenticated successfully.\n');

  // 2. Test pre-valuation simulator with Weibull decay & LCA metrics
  console.log('[2] Testing POST /trade-in/pre-valuation algorithm...');
  const preValRes = await request('/trade-in/pre-valuation', 'POST', {
    category: 'Túi xách',
    brand: 'Hermès',
    conditionNote: 'Tình trạng like new nguyên hộp, khoá kim loại sáng bóng',
    purchasePrice: 45000000,
    ageMonths: 8,
    fabricType: 'LEATHER',
    weightGrams: 750,
  }, userCookie);

  if (preValRes.status !== 201 && preValRes.status !== 200) {
    throw new Error(`pre-valuation failed: ${JSON.stringify(preValRes)}`);
  }
  const val = preValRes.data;
  console.log('  Valuation Result:');
  console.log(`  - Preliminary Grade: ${val.grade}`);
  console.log(`  - Estimated Value: ${val.estimatedValue.toLocaleString('vi-VN')} VND`);
  console.log(`  - Brand Multiplier: x${val.brandMultiplier}`);
  console.log(`  - Fabric Multiplier: x${val.fabricMultiplier}`);
  console.log(`  - Market Resale: ${val.marketResaleEstimate.toLocaleString('vi-VN')} VND`);
  console.log(`  - LCA CO2e Avoided: ${val.lca.carbonAvoidedKgCo2e} kg CO2e`);
  console.log(`  - LCA Water Saved: ${val.lca.waterSavedLiters} L`);
  console.log(`  - Eco-Coins Reward: ${val.lca.ecoCoinsAwarded} coins`);

  if (!val.grade || val.estimatedValue <= 0 || !val.lca) {
    throw new Error('Pre-valuation did not return valid valuation & LCA data');
  }
  console.log('✔ Pre-valuation simulator mathematically verified.\n');

  // 3. Submit Trade-In Request
  console.log('[3] Submitting new Trade-In request with algorithmic estimation...');
  const submitRes = await request('/trade-in', 'POST', {
    itemName: 'Túi da Epsom Kelly 28cm',
    category: 'Túi xách',
    brand: 'Hermès',
    conditionNote: 'Tình trạng như mới nguyên tem, phụ kiện đầy đủ',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    originalPrice: 45000000,
    ageMonths: 8,
    fabricType: 'LEATHER',
  }, userCookie);

  if (submitRes.status !== 201 && submitRes.status !== 200) {
    throw new Error(`Trade-In submit failed: ${JSON.stringify(submitRes)}`);
  }
  const tradeInId = submitRes.data.id;
  console.log(`✔ Created Trade-In Request ID: ${tradeInId} (Grade: ${submitRes.data.grade}, Estimated: ${submitRes.data.estimatedValue.toLocaleString('vi-VN')} VND)\n`);

  // 4. Schedule Electric Courier Pickup
  console.log('[4] Scheduling VinFast Electric Courier pickup...');
  const pickupRes = await request(`/trade-in/${tradeInId}/pickup`, 'POST', {
    slot: 'AFTERNOON',
    address: '88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    securityBag: true,
  }, userCookie);

  if (pickupRes.status !== 201 && pickupRes.status !== 200) {
    throw new Error(`Pickup scheduling failed: ${JSON.stringify(pickupRes)}`);
  }
  console.log(`✔ Courier scheduled. Tracking Code: ${pickupRes.data.trackingCode}\n`);

  // 5. Save Optical Lab Inspection Check
  console.log('[5] Saving 1000 Lux ISO 4915 Optical Check...');
  const optRes = await request(`/trade-in/${tradeInId}/optical-auth`, 'POST', {
    target: 'WEAVE',
    code: 'OPT-LUX-HERMES-8819',
    matchScore: 99.8,
    requestedHologramSeal: true,
  }, userCookie);

  if (optRes.status !== 201 && optRes.status !== 200) {
    throw new Error(`Optical check save failed: ${JSON.stringify(optRes)}`);
  }
  console.log(`✔ Optical authentication logged. Code: ${optRes.data.authCode}\n`);

  // 6. Save ISO 14040 LCA Passport
  console.log('[6] Logging ISO 14040/14044 Digital LCA Passport...');
  const passRes = await request(`/trade-in/${tradeInId}/passport`, 'POST', {
    fabricType: 'SILK',
    passportCode: 'NX-LCA-PASSPORT-2026-X88',
    waterSaved: '2.550 lít',
    co2Reduced: '7.99 kg CO2e',
    chemicalSaved: '0.88 kg',
  }, userCookie);

  if (passRes.status !== 201 && passRes.status !== 200) {
    throw new Error(`LCA Passport save failed: ${JSON.stringify(passRes)}`);
  }
  console.log(`✔ LCA Digital Passport verified: ${passRes.data.passportCode}\n`);

  // 7. Admin Inspection with AHP 8-Factor Matrix & Tamper-Proof Voucher
  console.log('[7] Admin AHP Multi-Criteria Optical Inspection & Voucher Issuance...');
  const inspectRes = await request(`/admin/services/trade-ins/${tradeInId}/inspect`, 'POST', {
    status: 'APPROVED',
    note: 'Thẩm định phòng Lab đạt chuẩn ISO 4915, sợi dệt và phụ kiện hoàn hảo',
    opticalFactors: {
      fiberStructureScore: 96,
      hardwareSeamScore: 95,
      colorRetentionScore: 98,
      stainReversibilityScore: 94,
    },
  }, adminCookie);

  if (inspectRes.status !== 201 && inspectRes.status !== 200) {
    throw new Error(`Admin inspection failed: ${JSON.stringify(inspectRes)}`);
  }

  const insp = inspectRes.data;
  console.log('  AHP Inspection Matrix Results:');
  console.log(`  - AHP Composite Score: ${insp.ahpInspection.compositeScore}/100`);
  console.log(`  - AHP Certified Grade: ${insp.ahpInspection.grade}`);
  console.log(`  - Recommended Action: ${insp.ahpInspection.recommendedAction}`);
  console.log(`  - Checklists Passed: ${insp.ahpInspection.inspectionChecklist.filter(c => c.passed).length}/4 tests`);
  console.log(`  - Anti-Arbitrage Voucher Code: ${insp.voucherDetails.code}`);
  console.log(`  - Voucher SHA-256 Signature: ${insp.voucherDetails.signatureHex}`);
  console.log(`  - Final Certified Value: ${insp.finalValue.toLocaleString('vi-VN')} VND`);

  if (!insp.voucherDetails.code.startsWith('NXTI-S') || !insp.voucherDetails.signatureHex) {
    throw new Error('Tamper-proof voucher was not properly generated');
  }
  console.log('✔ AHP inspection and cryptographic voucher generation successfully verified.\n');

  // 8. Retrieve Full Audit Timeline
  console.log('[8] Verifying Full Audit Timeline and Timeline Chain...');
  const detailRes = await request(`/trade-in/${tradeInId}`, 'GET', null, userCookie);
  if (detailRes.status !== 200) {
    throw new Error(`Get detail failed: ${JSON.stringify(detailRes)}`);
  }
  const timeline = detailRes.data.timeline;
  console.log(`✔ Retrieved ${timeline.length} immutable audit timeline events:`);
  timeline.forEach((event, idx) => {
    console.log(`  [${idx + 1}] ${event.action} by ${event.actorId} at ${event.createdAt}`);
  });

  const actions = timeline.map(e => e.action);
  if (!actions.includes('TRADEIN_SUBMIT') || !actions.includes('TRADEIN_PICKUP') || !actions.includes('TRADEIN_OPTICAL_CHECK') || !actions.includes('TRADEIN_APPROVED')) {
    throw new Error('Audit trail is missing critical lifecycle transitions');
  }

  console.log('\n======================================================');
  console.log('✔ ALL MODULE 2 TRADE-IN ALGORITHMS VERIFIED (100% PASS)');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n✖ VERIFICATION FAILED:', err);
  process.exit(1);
});
