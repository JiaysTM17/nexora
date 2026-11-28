/**
 * Verification Script: Module 18 - Atelier Remnant Upcycling, Deadstock Markdown & Fair Wage Circularity
 * Tests Algorithms 79, 80, 81, 82 against live NestJS API endpoints with session authentication and invariant validation.
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
      },
    );
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function loginAsCustomer() {
  const res = await request('/auth/login', 'POST', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });
  assert.equal(res.status, 201, `Login failed: ${JSON.stringify(res.body)}`);
  const setCookie = res.headers['set-cookie'];
  assert.ok(setCookie, 'No set-cookie in login response');
  const sessionCookie = setCookie.find((c) => c.startsWith('mac_session='));
  assert.ok(sessionCookie, 'No mac_session cookie');
  return sessionCookie.split(';')[0];
}

async function runVerification() {
  console.log('=== VERIFYING MODULE 18: ATELIER REMNANT UPCYCLING & FAIR WAGE CIRCULARITY ===\n');

  const cookie = await loginAsCustomer();
  console.log('1. [AUTH] Logged in successfully with session cookie.');

  // --------------------------------------------------------------------------
  // TEST 1: Algorithm 79 - Deadstock Fabric Degradation & Dynamic Markdown
  // --------------------------------------------------------------------------
  console.log('\n2. [ALG 79] Testing POST /inventory/deadstock-markdown...');
  const deadstockPayload = {
    fabricRollId: 'ROLL-LINEN-RAW-NORMANDY-05',
    fabricName: 'Vải Linen Mộc Hữu Cơ Normandy Cuộn Dài 50m',
    fiberComposition: 'ORGANIC_LINEN',
    originalCostPerMeterVnd: 520000,
    storageDurationMonths: 10,
    storageConditions: {
      avgTemperatureC: 24,
      relativeHumidityPct: 62,
      isClimateControlled: true,
    },
    rawMaterialFloorPriceVnd: 350000,
  };

  const res79 = await request('/inventory/deadstock-markdown', 'POST', deadstockPayload, {}, cookie);
  assert.equal(res79.status, 201, `Failed to evaluate deadstock markdown: ${JSON.stringify(res79.body)}`);
  assert.equal(res79.body.ok, true);
  assert.equal(res79.body.fabricRollId, 'ROLL-LINEN-RAW-NORMANDY-05');
  assert.ok(res79.body.tensileStrengthRetentionPercent > 85.0);
  assert.ok(res79.body.clearanceDiscountPercent > 0);
  assert.ok(res79.body.recommendedMarkdownPricePerMeterVnd >= 350000);
  assert.equal(typeof res79.body.floorPriceProtected, 'boolean');
  assert.ok(['PRISTINE_VINTAGE', 'STABLE_MATURE', 'UPCYCLE_GRADE'].includes(res79.body.preservationGrade));
  assert.ok(res79.body.deadstockCertificate.startsWith('#DEADSTOCK-MARKDOWN-'));
  console.log(`   -> OK: Tensile Retention = ${res79.body.tensileStrengthRetentionPercent}% | Grade: ${res79.body.preservationGrade}`);
  console.log(`   -> Original: ${res79.body.originalCostPerMeterVnd.toLocaleString('vi-VN')} đ -> Markdown: ${res79.body.recommendedMarkdownPricePerMeterVnd.toLocaleString('vi-VN')} đ (Discount: ${res79.body.clearanceDiscountPercent}%)`);
  console.log(`   -> Certificate: ${res79.body.deadstockCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 2: Algorithm 80 - 2D Remnant Bounded Knapsack Upcycling Nest
  // --------------------------------------------------------------------------
  console.log('\n3. [ALG 80] Testing POST /inventory/remnant-upcycle-nest...');
  const upcyclePayload = {
    remnantLotId: 'LOT-REMNANT-SILK-SEN-09',
    fabricName: 'Vải Lụa Tơ Sen Dệt Thủ Cung Sau Khi Cắt Áo Dài',
    remnantLengthCm: 180,
    remnantWidthCm: 90, // 16,200 cm2
    candidatePatterns: [
      { patternId: 'PAT-POCKET-SQ', patternName: 'Khăn Cài Túi Áo Blazer', lengthCm: 30, widthCm: 30, targetSalePriceVnd: 195000, virginCo2AvoidedKg: 0.5, priorityScore: 1.3 },
      { patternId: 'PAT-SILK-TIE', patternName: 'Cà Vạt Lụa Tơ Tằm Cổ Điển', lengthCm: 45, widthCm: 15, targetSalePriceVnd: 280000, virginCo2AvoidedKg: 0.65, priorityScore: 1.5 },
      { patternId: 'PAT-HAIR-RIBBON', patternName: 'Dải Ruy Băng Lụa Tóc Nữ', lengthCm: 50, widthCm: 8, targetSalePriceVnd: 120000, virginCo2AvoidedKg: 0.25, priorityScore: 1.0 },
    ],
    packingEfficiencyFactor: 0.85,
  };

  const res80 = await request('/inventory/remnant-upcycle-nest', 'POST', upcyclePayload, {}, cookie);
  assert.equal(res80.status, 201, `Failed to optimize remnant upcycling nest: ${JSON.stringify(res80.body)}`);
  assert.equal(res80.body.ok, true);
  assert.equal(res80.body.remnantLotId, 'LOT-REMNANT-SILK-SEN-09');
  assert.equal(res80.body.totalRemnantAreaCm2, 16200);
  assert.ok(res80.body.totalAllocatedCount > 0);
  assert.ok(res80.body.totalUpcyclingValueVnd > 0);
  assert.ok(res80.body.totalVirginCo2AvoidedKg > 0);
  assert.ok(res80.body.fabricUtilizationRatePercent > 50.0);
  assert.ok(res80.body.upcyclingCertificate.startsWith('#UPCYCLE-NEST-'));
  console.log(`   -> OK: Remnant Area: ${res80.body.totalRemnantAreaCm2} cm2 | Usable: ${res80.body.usableCuttingAreaCm2} cm2`);
  console.log(`   -> Nested Upcycling: ${res80.body.totalAllocatedCount} items | Value Created: ${res80.body.totalUpcyclingValueVnd.toLocaleString('vi-VN')} đ | CO2e Avoided: ${res80.body.totalVirginCo2AvoidedKg} kg`);
  for (const item of res80.body.allocatedPatterns) {
    console.log(`      * ${item.patternName} (${item.dimensionsCm} cm): ${item.allocatedCount} pieces -> ${item.totalMarketValueVnd.toLocaleString('vi-VN')} đ`);
  }
  console.log(`   -> Certificate: ${res80.body.upcyclingCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 3: Algorithm 81 - Fair Trade Living Wage Floor & Open Costing
  // --------------------------------------------------------------------------
  console.log('\n4. [ALG 81] Testing POST /inventory/fair-trade-floor...');
  const fairTradePayload = {
    garmentId: 'SUIT-BESPOKE-NORMANDY-01',
    garmentName: 'Bộ Suit 3 Mảnh Linen Mộc Thủ Công Nam',
    regionalWageZone: 'ZONE_1',
    craftingHours: 24, // 24 giờ may đo thủ công
    complexityFactors: [
      { factorName: 'Khâu ve áo Hand-stitched Lapel Pick', weightBonusPct: 10 },
      { factorName: 'Lót ngực đệm tóc đuôi ngựa Canvassed Canvas', weightBonusPct: 15 },
    ],
    fabricCostVnd: 1250000,
    trimsCostVnd: 280000,
    packagingAndKcsCostVnd: 150000,
    atelierTargetMarginPct: 20,
    platformFeePct: 5,
  };

  const res81 = await request('/inventory/fair-trade-floor', 'POST', fairTradePayload, {}, cookie);
  assert.equal(res81.status, 201, `Failed to evaluate fair trade price floor: ${JSON.stringify(res81.body)}`);
  assert.equal(res81.body.ok, true);
  assert.equal(res81.body.garmentId, 'SUIT-BESPOKE-NORMANDY-01');
  assert.equal(res81.body.complexityBonusPercent, 25);
  assert.ok(res81.body.effectiveArtisanHourlyRateVnd > 58000);
  assert.ok(res81.body.artisanLaborCostVnd > 0);
  assert.ok(res81.body.fairWageToMinimumRatio >= 1.5);
  assert.equal(res81.body.fairLivingWageSatisfied, true);
  assert.equal(res81.body.exactMoneyConservationPreserved, true);
  assert.ok(res81.body.fairTradeCertificate.startsWith('#FAIR-TRADE-FLOOR-'));
  console.log(`   -> OK: Hourly Rate = ${res81.body.effectiveArtisanHourlyRateVnd.toLocaleString('vi-VN')} đ/h | Total Labor = ${res81.body.artisanLaborCostVnd.toLocaleString('vi-VN')} đ`);
  console.log(`   -> Wage Ratio vs Statutory Minimum: ${res81.body.fairWageToMinimumRatio}x | Anker Living Wage: ${res81.body.fairLivingWageSatisfied}`);
  console.log(`   -> Retail Price: ${res81.body.finalRetailPriceVnd.toLocaleString('vi-VN')} đ (Exact Dong Preserved: ${res81.body.exactMoneyConservationPreserved})`);
  for (const c of res81.body.costBreakdown) {
    console.log(`      * ${c.componentTitle}: ${c.costVnd.toLocaleString('vi-VN')} đ (${c.sharePercent}%)`);
  }
  console.log(`   -> Certificate: ${res81.body.fairTradeCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 4: Algorithm 82 - Ellen MacArthur Material Circularity Indicator & EPR
  // --------------------------------------------------------------------------
  console.log('\n5. [ALG 82] Testing POST /inventory/epr-circularity-audit...');
  const eprPayload = {
    productId: 'PRODUCT-ECO-KIMONO-01',
    productName: 'Áo Khoác Kimono Tơ Tằm Họa Tiết Hoa Sen',
    garmentTotalMassGrams: 750,
    virginFeedstockGrams: 150,
    recycledOrUpcycledFeedstockGrams: 600,
    biodegradableNaturalGrams: 750,
    designedExpectedWears: 280, // May đo di sản bền 280 lần mặc
    takebackRecyclabilityPct: 94.0, // 94% tái chế thu hồi xơ
  };

  const res82 = await request('/inventory/epr-circularity-audit', 'POST', eprPayload, {}, cookie);
  assert.equal(res82.status, 201, `Failed to audit EPR circularity: ${JSON.stringify(res82.body)}`);
  assert.equal(res82.body.ok, true);
  assert.equal(res82.body.productId, 'PRODUCT-ECO-KIMONO-01');
  assert.ok(res82.body.materialCircularityIndicatorMci >= 0.85);
  assert.equal(res82.body.circularityTier, 'REGENERATIVE_HERITAGE');
  assert.equal(res82.body.eprCompliancePassed, true);
  assert.ok(res82.body.circularityCertificate.startsWith('#MCI-CIRCULARITY-'));
  console.log(`   -> OK: MCI = ${res82.body.materialCircularityIndicatorMci} | Circularity Tier: [${res82.body.circularityTier}]`);
  console.log(`   -> Linear Flow Index (LFI): ${res82.body.linearFlowIndex} | Utility Factor: ${res82.body.utilityFactorX}x fast fashion`);
  console.log(`   -> EPR Compliance (NĐ 08/2022/NĐ-CP): ${res82.body.eprCompliancePassed}`);
  console.log(`   -> Certificate: ${res82.body.circularityCertificate}`);

  console.log('\n========================================================================');
  console.log('✅ ALL MODULE 18 ALGORITHMS (79, 80, 81, 82) VERIFIED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
