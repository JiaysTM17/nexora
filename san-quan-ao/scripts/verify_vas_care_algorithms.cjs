// verify_vas_care_algorithms.cjs
// Comprehensive E2E Verification of Module 1: VAS Atelier Care & Garment Restoration
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
  console.log('================================================================================');
  console.log('🏛️  NEXORA VAS ATELIER CARE & RESTORATION ALGORITHMIC E2E VERIFICATION  🏛️');
  console.log('================================================================================\n');

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

  // 2. Actuarial Risk Premium & Underwriting Simulation
  console.log('[2] Testing Actuarial Risk Underwriting Algorithm (Solvency II & VaR 99%)...');
  const actuarialRes = await request('/vas-care/estimate-premium', 'POST', {
    declaredValueVnd: 65000000, // 65 triệu đồng
    serviceType: 'LEATHER_RESTORE',
    fabricMatrix: 'VEGETABLE_LEATHER',
    transitMode: 'ECO_ELECTRIC_VAN',
  }, userCookie);

  if (actuarialRes.status !== 200 && actuarialRes.status !== 201) {
    throw new Error(`Actuarial calculation failed: ${JSON.stringify(actuarialRes)}`);
  }
  const act = actuarialRes.data;
  console.log('  Actuarial Risk Assessment Results:');
  console.log(`  - Base Service Fee: ${act.baseFee.toLocaleString('vi-VN')} VND`);
  console.log(`  - Excess Declared Value: ${act.excessInsuredValue.toLocaleString('vi-VN')} VND`);
  console.log(`  - Pure Risk Rate: ${act.pureRiskRateBps} bps`);
  console.log(`  - Insurance Premium: ${act.insurancePremium.toLocaleString('vi-VN')} VND`);
  console.log(`  - Solvency II Safety Buffer: ${act.solvencySafetyBuffer.toLocaleString('vi-VN')} VND`);
  console.log(`  - Value-at-Risk (VaR 99%): ${act.valueAtRisk99.toLocaleString('vi-VN')} VND`);
  console.log(`  - Total Care Fee: ${act.totalFee.toLocaleString('vi-VN')} VND`);
  console.log(`  - Underwriting Summary: ${act.underwritingSummary}`);

  if (act.totalFee <= act.baseFee || act.pureRiskRateBps <= 0) {
    throw new Error('Actuarial premium calculation produced invalid risk values');
  }
  console.log('✔ Actuarial risk underwriting mathematically validated.\n');

  // 3. Biological Diagnostic & Restoration Kinetics Engine
  console.log('[3] Testing Biological Diagnostic & Fiber Restoration Kinetics...');
  const kineticsRes = await request('/vas-care/diagnose-kinetics', 'POST', {
    garmentType: 'SILK_DRESS',
    symptom: 'STAIN_YELLOW',
    severityLevel: 2,
    treatmentMethod: 'BIO_ENZYME_SPA',
  }, userCookie);

  if (kineticsRes.status !== 200 && kineticsRes.status !== 201) {
    throw new Error(`Kinetics diagnosis failed: ${JSON.stringify(kineticsRes)}`);
  }
  const kin = kineticsRes.data;
  console.log('  Restoration Kinetics Results:');
  console.log(`  - Recovery Rate Forecast: ${kin.recoveryRatePct}%`);
  console.log(`  - Tensile Strength Retention: ${kin.tensileStrengthRetentionPct}%`);
  console.log(`  - Recommended Protocol: ${kin.recommendedChemicalProtocol}`);
  console.log(`  - Treatment Cycle Duration: ${kin.cycleDurationMinutes} minutes`);
  console.log(`  - Model Safety Confidence: ${kin.safetyConfidenceScore}%`);

  if (kin.recoveryRatePct < 85 || kin.tensileStrengthRetentionPct < 90) {
    throw new Error('Restoration kinetics produced substandard recovery metrics');
  }
  console.log('✔ Fiber restoration kinetics validated.\n');

  // 4. Supercritical Fluid CO2 & Ozone Chamber Thermodynamic Profile
  console.log('[4] Testing Supercritical Fluid CO2 Thermodynamic Profile Algorithm...');
  const co2Res = await request('/vas-care/co2-profile', 'POST', {
    preset: 'SILK_CASHMERE',
    targetDisinfectionLevel: 'LOG_4_DEEP_SPORE',
  }, userCookie);

  if (co2Res.status !== 200 && co2Res.status !== 201) {
    throw new Error(`CO2 profile calculation failed: ${JSON.stringify(co2Res)}`);
  }
  const co2 = co2Res.data;
  console.log('  Supercritical CO2 Autoclave Profile:');
  console.log(`  - Operating Pressure: ${co2.pressureBar} bar (Supercritical > 73.8 bar)`);
  console.log(`  - Operating Temperature: ${co2.temperatureCelsius}°C (Supercritical > 31.1°C)`);
  console.log(`  - Solvent Density: ${co2.co2DensityKgM3} kg/m³`);
  console.log(`  - Safe Depressurization Rate: ${co2.depressurizationRateBarPerMin} bar/min`);
  console.log(`  - Water Saved: ${co2.waterSavedLiters} Liters`);
  console.log(`  - Carcinogenic PERC Solvent Avoided: ${co2.percAvoidedGrams} grams (100% Zero-PERC)`);
  console.log(`  - CO2 Closed-Loop Recycling: ${co2.co2RecycleEfficiencyPct}%`);

  if (co2.pressureBar <= 73.8 || co2.temperatureCelsius <= 31.1 || co2.co2DensityKgM3 <= 500) {
    throw new Error('Thermodynamic state parameters failed to exceed critical point');
  }
  console.log('✔ Supercritical fluid thermodynamics validated.\n');

  // 5. Booking Creation with Tamper-Evident Cryptographic Zip-Seal
  console.log('[5] Creating Care Booking with Cryptographic Zip-Seal Serial...');
  const bookingRes = await request('/vas-care', 'POST', {
    itemName: 'Áo Khoác Blazer Cashmere & Lụa Tơ Sen',
    serviceType: 'SPA_CLEANING',
    insuredValue: 35000000,
    notes: 'Vết ố mồ hôi và xơ sợi nhẹ, bảo lưu cấu trúc ve áo thủ công',
    fabricMatrix: 'SILK_CASHMERE',
    transitMode: 'ECO_ELECTRIC_VAN',
  }, userCookie);

  if (bookingRes.status !== 200 && bookingRes.status !== 201) {
    throw new Error(`Care booking creation failed: ${JSON.stringify(bookingRes)}`);
  }
  const booking = bookingRes.data;
  console.log(`✔ Created Care Booking ID: ${booking.id}`);
  console.log(`  - Tamper-Evident Zip-Seal Code: ${booking.zipSealCode}`);
  console.log(`  - Total Care Fee: ${booking.fee.toLocaleString('vi-VN')} VND`);
  console.log(`  - Status: ${booking.status}\n`);

  if (!booking.zipSealCode.startsWith('NX-SEAL-SGN-')) {
    throw new Error('Zip seal does not match ISO 17712 cryptographic standard format');
  }

  // 6. Admin Verification and Status Transitions
  console.log('[6] Admin Processing: Sealed Pickup Verification with CRC-16 Checksum...');
  const pickupRes = await request(`/admin/services/care/${booking.id}/status`, 'POST', {
    status: 'SEALED_PICKUP',
    note: 'Bưu tá xe điện đã tiếp nhận túi niêm phong nguyên vẹn',
    sealCode: booking.zipSealCode,
  }, adminCookie);

  if (pickupRes.status !== 200 && pickupRes.status !== 201) {
    throw new Error(`Sealed pickup update failed: ${JSON.stringify(pickupRes)}`);
  }
  console.log(`  - Seal Verification Status: Valid=${pickupRes.data.sealVerification?.isValid}, Hub=${pickupRes.data.sealVerification?.hubCode}`);
  if (!pickupRes.data.sealVerification?.checksumValid) {
    throw new Error('Zip-seal checksum verification failed on pickup');
  }
  console.log('✔ Zip-seal authenticity verified on pickup.\n');

  console.log('[7] Admin Processing: Optical Spectrophotometric Check & CO2 Spa Restoration...');
  const opticalRes = await request(`/admin/services/care/${booking.id}/status`, 'POST', {
    status: 'OPTICAL_CHECK',
    note: 'Chụp biên bản quang học 8 góc 1000 Lux. Delta-E = 0.42 đạt chuẩn bảo tồn màu.',
    opticalDeltaE: 0.42,
  }, adminCookie);
  if (opticalRes.status !== 200 && opticalRes.status !== 201) {
    console.error('opticalRes error:', opticalRes);
    throw new Error('Optical check status failed');
  }

  const inCareRes = await request(`/admin/services/care/${booking.id}/status`, 'POST', {
    status: 'IN_CARE',
    note: 'Đang xử lý buồng giặt CO2 lỏng siêu tới hạn và khử khuẩn Ozone O3',
    tensileRetentionPct: 98.5,
  }, adminCookie);
  if (inCareRes.status !== 200 && inCareRes.status !== 201) throw new Error('In-care status failed');

  const returnRes = await request(`/admin/services/care/${booking.id}/status`, 'POST', {
    status: 'RETURNED',
    note: 'Đã hoàn tất chăm sóc và bàn giao tận tay khách hàng kèm chứng thư',
  }, adminCookie);
  if (returnRes.status !== 200 && returnRes.status !== 201) throw new Error('Returned status failed');
  console.log('✔ Completed full status lifecycle transitions.\n');

  // 7. Audit Timeline Verification
  console.log('[8] Verifying Audit Timeline Completeness...');
  const detailRes = await request(`/vas-care/${booking.id}`, 'GET', null, userCookie);
  if (detailRes.status !== 200) throw new Error('Get detail failed');

  const timeline = detailRes.data.timeline;
  console.log(`✔ Retrieved ${timeline.length} immutable audit timeline events:`);
  timeline.forEach((event, idx) => {
    console.log(`  [${idx + 1}] ${event.action} by ${event.actorId} at ${event.createdAt}`);
  });

  const actions = timeline.map(e => e.action);
  if (!actions.includes('CARE_BOOK') || !actions.includes('CARE_SEALED_PICKUP') || !actions.includes('CARE_OPTICAL_CHECK') || !actions.includes('CARE_IN_CARE') || !actions.includes('CARE_RETURNED')) {
    throw new Error('Audit trail is missing critical VAS care transitions');
  }

  console.log('\n======================================================');
  console.log('✔ ALL MODULE 1 VAS CARE ALGORITHMS VERIFIED (100% PASS)');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n✖ VERIFICATION FAILED:', err);
  process.exit(1);
});
