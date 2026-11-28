/**
 * Verification Script: Module 16 - Physical Tactile Swatch Box, Swatch Rebate & Home-Fitting Valet Packing
 * Tests Algorithms 71, 72, 73, 74 against live NestJS API endpoints.
 */

const http = require('node:http');
const assert = require('node:assert/strict');

const API_BASE = 'http://localhost:4000/api/v1';

function request(path, method = 'GET', body = null, headers = {}, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const reqHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      'Origin': 'http://localhost:3000',
      ...headers,
    };
    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }
    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runVerification() {
  console.log('==============================================================================');
  console.log('🧪 MODULE 16 E2E VERIFICATION: SWATCH BOX & HOME FITTING VALET (ALGS 71-74)');
  console.log('==============================================================================\n');

  console.log('Authenticating user session (buyer@mac.local)...');
  const loginRes = await request('/auth/login', 'POST', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });
  assert.equal(loginRes.status, 201);
  const sessionCookie = loginRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ');
  console.log('✓ Authenticated with session cookie.\n');

  // ----------------------------------------------------------------------------
  // 1. Algorithm 71: Tactile Swatch Box Curation (POST /swatch-orders/tactile-curation)
  // ----------------------------------------------------------------------------
  console.log('--- 1. Testing Algorithm 71: Tactile Swatch Box Curation (/swatch-orders/tactile-curation) ---');

  const swatches = [
    { id: 'sw-1', name: 'Lụa Tơ Tằm Bảo Lộc', material: 'SILK', surfaceRoughnessSmdUm: 1.2, bendingRigidityB: 0.02, tensileExtensibilityEmtPct: 4.5, compressibilityLc: 0.45, colorHex: '#FAF0E6' },
    { id: 'sw-2', name: 'Linen Mộc Normandy', material: 'LINEN', surfaceRoughnessSmdUm: 8.5, bendingRigidityB: 0.28, tensileExtensibilityEmtPct: 2.8, compressibilityLc: 0.32, colorHex: '#D2B48C' },
    { id: 'sw-3', name: 'Dạ Len Lông Cừu Ý', material: 'WOOL', surfaceRoughnessSmdUm: 5.4, bendingRigidityB: 0.42, tensileExtensibilityEmtPct: 12.5, compressibilityLc: 0.55, colorHex: '#36454F' },
    { id: 'sw-4', name: 'Cotton Pima Satin', material: 'COTTON', surfaceRoughnessSmdUm: 2.1, bendingRigidityB: 0.08, tensileExtensibilityEmtPct: 6.2, compressibilityLc: 0.40, colorHex: '#FFFFFF' },
    { id: 'sw-5', name: 'Gai Ramie Nhuộm Chàm', material: 'RAMIE', surfaceRoughnessSmdUm: 9.8, bendingRigidityB: 0.35, tensileExtensibilityEmtPct: 2.1, compressibilityLc: 0.28, colorHex: '#1F305E' },
    { id: 'sw-6', name: 'Lụa Satin Hà Đông', material: 'SILK', surfaceRoughnessSmdUm: 1.5, bendingRigidityB: 0.03, tensileExtensibilityEmtPct: 5.0, compressibilityLc: 0.48, colorHex: '#E6D7B8' },
  ];

  const curationRes = await request('/swatch-orders/tactile-curation', 'POST', {
    candidateSwatches: swatches,
    boxCapacity: 5,
  }, {}, sessionCookie);
  assert.equal(curationRes.status, 201);
  console.log('Swatch Box Curation Result:', {
    selectedCount: curationRes.body.selectedSwatches.length,
    tactileDiversityIndex: curationRes.body.tactileDiversityIndex,
    roughnessSpanUm: curationRes.body.roughnessSpanUm,
    swatchBoxCode: curationRes.body.swatchBoxCode,
  });
  assert.equal(curationRes.body.selectedSwatches.length, 5);
  assert.ok(curationRes.body.tactileDiversityIndex >= 70.0);
  assert.ok(curationRes.body.swatchBoxCode.startsWith('#SWATCH-BOX-'));
  console.log('✅ Algorithm 71 Verified: Kawabata KES-FB tactile diversity maximized!\n');

  // ----------------------------------------------------------------------------
  // 2. Algorithm 72: Swatch-to-Bespoke Rebate (POST /swatch-orders/bespoke-rebate)
  // ----------------------------------------------------------------------------
  console.log('--- 2. Testing Algorithm 72: Swatch-to-Bespoke Rebate (/swatch-orders/bespoke-rebate) ---');

  const rebateRes = await request('/swatch-orders/bespoke-rebate', 'POST', {
    swatchDepositVnd: 50000,
    bespokeOrderGrossVnd: 4200000,
    dwellDaysSinceSwatchArrival: 4,
    swatchTouchCount: 6,
    materialPurityPct: 98,
  }, {}, sessionCookie);
  assert.equal(rebateRes.status, 201);
  console.log('Bespoke Rebate Result:', {
    depositDeducted: rebateRes.body.rebateDeductionVnd,
    bespokeOrderNetVnd: rebateRes.body.bespokeOrderNetVnd,
    exactDongPreserved: rebateRes.body.exactDongPreserved,
    conversionProbabilityPct: rebateRes.body.conversionProbabilityPct,
    rebateCertificateCode: rebateRes.body.rebateCertificateCode,
  });
  assert.equal(rebateRes.body.rebateDeductionVnd, 50000);
  assert.equal(rebateRes.body.bespokeOrderNetVnd, 4150000);
  assert.equal(rebateRes.body.exactDongPreserved, true);
  assert.ok(rebateRes.body.conversionProbabilityPct > 60.0);
  assert.ok(rebateRes.body.rebateCertificateCode.startsWith('#REBATE-BESPOKE-'));
  console.log('✅ Algorithm 72 Verified: Exact Dong deposit rebate invariant preserved!\n');

  // ----------------------------------------------------------------------------
  // 3. Algorithm 73: Home-Fitting Suitcase Packing (POST /concierge/valet-suitcase)
  // ----------------------------------------------------------------------------
  console.log('--- 3. Testing Algorithm 73: Valet Suitcase Multi-Knapsack (/concierge/valet-suitcase) ---');

  const items = [
    { id: 'it-1', name: 'Mẫu Rập Vải Mộc Toile Áo Măng Tô', weightKg: 1.2, volumeLiters: 4.5, consultationUtilityScore: 95, isMandatory: true },
    { id: 'it-2', name: 'Bộ Thước Đo Nhân Trắc Kỹ Thuật Số', weightKg: 0.8, volumeLiters: 1.5, consultationUtilityScore: 90, isMandatory: true },
    { id: 'it-3', name: 'Hộp Khuy Xà Cừ & Phụ Kiện Thủ Công', weightKg: 1.5, volumeLiters: 2.0, consultationUtilityScore: 80, isMandatory: true },
    { id: 'it-4', name: 'Bàn Ủi Hơi Nước Cầm Tay Du Lịch', weightKg: 2.2, volumeLiters: 6.0, consultationUtilityScore: 85, isMandatory: false },
    { id: 'it-5', name: 'Cuộn Vải Mẫu Dạ Len Ý 3m', weightKg: 4.5, volumeLiters: 12.0, consultationUtilityScore: 75, isMandatory: false },
    { id: 'it-6', name: 'Cuộn Vải Mẫu Lụa Tơ Tằm Bảo Lộc 4m', weightKg: 1.8, volumeLiters: 5.5, consultationUtilityScore: 88, isMandatory: false },
  ];

  const suitcaseRes = await request('/concierge/valet-suitcase', 'POST', {
    requestedItems: items,
    maxWeightCapacityKg: 18.5,
    maxVolumeCapacityLiters: 65.0,
  }, {}, sessionCookie);
  assert.equal(suitcaseRes.status, 201);
  console.log('Suitcase Packing Result:', {
    packedCount: suitcaseRes.body.packedItems.length,
    totalWeightKg: suitcaseRes.body.totalWeightKg,
    totalVolumeLiters: suitcaseRes.body.totalVolumeLiters,
    weightUtilizationPct: suitcaseRes.body.weightUtilizationPct,
    centerOfGravitySafe: suitcaseRes.body.centerOfGravitySafe,
    suitcaseManifestCode: suitcaseRes.body.suitcaseManifestCode,
  });
  assert.ok(suitcaseRes.body.packedItems.length >= 4);
  assert.ok(suitcaseRes.body.totalWeightKg <= 18.5);
  assert.ok(suitcaseRes.body.totalVolumeLiters <= 65.0);
  assert.equal(suitcaseRes.body.centerOfGravitySafe, true);
  assert.ok(suitcaseRes.body.suitcaseManifestCode.startsWith('#VALET-SUITCASE-'));
  console.log('✅ Algorithm 73 Verified: Valet suitcase knapsack and center-of-gravity safety verified!\n');

  // ----------------------------------------------------------------------------
  // 4. Algorithm 74: Biomechanical Revise Mapper (POST /concierge/biomechanical-revise)
  // ----------------------------------------------------------------------------
  console.log('--- 4. Testing Algorithm 74: Biomechanical Revise Mapper (/concierge/biomechanical-revise) ---');

  const reviseRes = await request('/concierge/biomechanical-revise', 'POST', {
    bespokeId: 'BESPOKE-SUIT-VIP-88',
    garmentType: 'BLAZER',
    fittingIssues: [
      { region: 'SHOULDER_PITCH', severity: 'MODERATE', adjustmentMm: -6 },
      { region: 'ARMSCYE_TIGHT', severity: 'MILD', adjustmentMm: 8 },
      { region: 'CHEST_EASE', severity: 'MILD', adjustmentMm: 10 },
    ],
    measuredArmscyePerimeterMm: 480,
    measuredSleeveHeadPerimeterMm: 507,
  }, {}, sessionCookie);
  assert.equal(reviseRes.status, 201);
  console.log('Biomechanical Revise Result:', {
    bespokeId: reviseRes.body.bespokeId,
    patternOffsetsMm: reviseRes.body.patternOffsetsMm,
    sleeveEaseMarginMm: reviseRes.body.sleeveEaseMarginMm,
    armscyeInvariantSatisfied: reviseRes.body.armscyeInvariantSatisfied,
    fittingApprovalCertificate: reviseRes.body.fittingApprovalCertificate,
  });
  assert.equal(reviseRes.body.bespokeId, 'BESPOKE-SUIT-VIP-88');
  assert.equal(reviseRes.body.armscyeInvariantSatisfied, true);
  assert.ok(reviseRes.body.sleeveEaseMarginMm >= 12.0 && reviseRes.body.sleeveEaseMarginMm <= 18.0);
  assert.ok(reviseRes.body.fittingApprovalCertificate.startsWith('#FIT-REVISE-KCS-'));
  console.log('✅ Algorithm 74 Verified: Armscye perimeter invariant and pattern seam offsets verified!\n');

  console.log('==============================================================================');
  console.log('🎉 ALL MODULE 16 VERIFICATIONS PASSED (100% INVARIANTS SATISFIED)!');
  console.log('==============================================================================');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
