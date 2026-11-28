/**
 * Verification Script: Module 19 - Atelier Production Capacity Allocation, Multi-Skill Artisan Scheduling
 * & Realtime Bottleneck Detection (Algorithms 83, 84, 85, 86)
 * Tests against live NestJS API endpoints with session authentication and invariant validation.
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
  console.log('=== VERIFYING MODULE 19: ARTISAN CAPACITY ALLOCATION & SCHEDULING ===\n');

  const cookie = await loginAsCustomer();
  console.log('1. [AUTH] Logged in successfully with session cookie.');

  // --------------------------------------------------------------------------
  // TEST 1: Algorithm 83 - Multi-Skill Artisan Workforce Scheduler
  // --------------------------------------------------------------------------
  console.log('\n2. [ALG 83] Testing POST /inventory/artisan-multi-skill-schedule...');
  const schedulePayload = {
    scheduleDate: '2026-06-25',
    artisans: [
      {
        artisanId: 'ART-THO-CA',
        artisanName: 'Bác Thành (Thợ Cả Cắt Rập)',
        maxDailyMinutes: 480,
        skillMatrix: { PATTERN_CUTTING: 1.3, CANVASSING: 1.1, HAND_SEWING: 1.0 },
      },
      {
        artisanId: 'ART-THO-THEU',
        artisanName: 'Chị Mai (Nghệ Nhân Đính Cườm)',
        maxDailyMinutes: 480,
        skillMatrix: { HAND_SEWING: 1.25, EMBROIDERY: 1.35, FINAL_KCS: 1.0 },
      },
      {
        artisanId: 'ART-THO-LA',
        artisanName: 'Anh Huy (Nghệ Nhân Là Định Hình)',
        maxDailyMinutes: 480,
        skillMatrix: { DECATIZING_PRESS: 1.3, FINAL_KCS: 1.25, PATTERN_CUTTING: 0.9 },
      },
    ],
    tasks: [
      { taskId: 'T-VIP-01', orderId: 'ORD-VIP-SUIT', garmentCategory: 'BESPOKE_SUIT', operation: 'PATTERN_CUTTING', baseDurationMinutes: 130, priorityTier: 'VIP_RUSH', deadlineIso: '2026-06-25T12:00:00Z' },
      { taskId: 'T-VIP-02', orderId: 'ORD-VIP-SUIT', garmentCategory: 'BESPOKE_SUIT', operation: 'CANVASSING', baseDurationMinutes: 140, priorityTier: 'VIP_RUSH', deadlineIso: '2026-06-25T15:00:00Z' },
      { taskId: 'T-NORM-03', orderId: 'ORD-SILK-DRESS', garmentCategory: 'SILK_DRESS', operation: 'EMBROIDERY', baseDurationMinutes: 190, priorityTier: 'NORMAL', deadlineIso: '2026-06-25T17:00:00Z' },
      { taskId: 'T-NORM-04', orderId: 'ORD-LINEN-PANTS', garmentCategory: 'LINEN_BLAZER', operation: 'DECATIZING_PRESS', baseDurationMinutes: 80, priorityTier: 'FLEXIBLE', deadlineIso: '2026-06-25T18:00:00Z' },
    ],
  };

  const res83 = await request('/inventory/artisan-multi-skill-schedule', 'POST', schedulePayload, {}, cookie);
  assert.equal(res83.status, 201, `Failed to schedule artisan workforce: ${JSON.stringify(res83.body)}`);
  assert.equal(res83.body.ok, true);
  assert.equal(res83.body.scheduleDate, '2026-06-25');
  assert.equal(res83.body.totalTasksScheduled, 4);
  assert.equal(res83.body.totalBacklogUnscheduled, 0);
  assert.equal(res83.body.zeroOverbookingInvariantSatisfied, true);
  assert.ok(res83.body.makespanMinutes > 0 && res83.body.makespanMinutes <= 480);
  assert.ok(res83.body.scheduleCertificate.startsWith('#ARTISAN-SCHEDULE-'));
  console.log(`   -> OK: Scheduled ${res83.body.totalTasksScheduled} tasks | Makespan: ${res83.body.makespanMinutes} mins (~${(res83.body.makespanMinutes / 60).toFixed(1)}h)`);
  console.log(`   -> Average Atelier Utilization: ${res83.body.averageArtisanUtilizationPercent}% | Zero Overbooking Invariant: ${res83.body.zeroOverbookingInvariantSatisfied}`);
  for (const a of res83.body.scheduledAllocations) {
    console.log(`      * [${a.operation}] -> ${a.assignedArtisanName}: ${a.startMinuteOffset}m -> ${a.endMinuteOffset}m (${a.effectiveDurationMinutes}m)`);
  }
  console.log(`   -> Certificate: ${res83.body.scheduleCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 2: Algorithm 84 - Theory of Constraints Bottleneck Detection & Little Sizing
  // --------------------------------------------------------------------------
  console.log('\n3. [ALG 84] Testing POST /inventory/toc-bottleneck-audit...');
  const tocPayload = {
    atelierLineId: 'LINE-ATELIER-HAUTE-01',
    observationPeriodHours: 8,
    stations: [
      { stationId: 'ST-1-CUT', stationName: 'Trạm Cắt Rập & Pha Canh Sợi', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 1.4, observedArrivalRateUnitsPerHour: 2.2, currentWipUnits: 4 },
      { stationId: 'ST-2-CANVAS', stationName: 'Trạm Dựng Form Ngực Canvas Lông Ngựa', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 0.75, observedArrivalRateUnitsPerHour: 1.4, currentWipUnits: 10 },
      { stationId: 'ST-3-SEW', stationName: 'Trạm Khâu Tay Ráp Áo', activeCraftsmenCount: 3, nominalThroughputUnitsPerHour: 0.9, observedArrivalRateUnitsPerHour: 1.3, currentWipUnits: 5 },
      { stationId: 'ST-4-PRESS', stationName: 'Trạm Là Hơi Decatizing', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 2.0, observedArrivalRateUnitsPerHour: 1.3, currentWipUnits: 2 },
    ],
  };

  const res84 = await request('/inventory/toc-bottleneck-audit', 'POST', tocPayload, {}, cookie);
  assert.equal(res84.status, 201, `Failed to audit TOC bottleneck: ${JSON.stringify(res84.body)}`);
  assert.equal(res84.body.ok, true);
  assert.equal(res84.body.atelierLineId, 'LINE-ATELIER-HAUTE-01');
  assert.equal(res84.body.primaryBottleneckStationId, 'ST-2-CANVAS');
  assert.ok(res84.body.maximumStationUtilizationPercent >= 90.0);
  assert.equal(res84.body.totalLineWipUnits, 21);
  assert.ok(res84.body.drumBufferRopeAction.includes('KÍCH HOẠT DBR'));
  assert.ok(res84.body.tocCertificate.startsWith('#TOC-DRUM-BUFFER-'));
  console.log(`   -> OK: Primary Bottleneck: [${res84.body.primaryBottleneckStationName}] with ${res84.body.maximumStationUtilizationPercent}% load`);
  console.log(`   -> Total Line WIP: ${res84.body.totalLineWipUnits} garments | System Throughput: ${res84.body.systemThroughputUnitsPerHour} units/hour`);
  console.log(`   -> Drum-Buffer-Rope Action: ${res84.body.drumBufferRopeAction}`);
  console.log(`   -> Certificate: ${res84.body.tocCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 3: Algorithm 85 - Ergonomic Fatigue & Stitch Defect Hazard Rate
  // --------------------------------------------------------------------------
  console.log('\n4. [ALG 85] Testing POST /inventory/ergonomic-fatigue-analysis...');
  const fatiguePayload = {
    artisanId: 'ART-THO-THEU-02',
    artisanName: 'Nghệ nhân Phạm Thị Hoa',
    continuousCraftingMinutes: 175, // 175 phút đính cườm liên tục
    craftingPrecisionLevel: 'ULTRA_HIGH_BEADING',
    ambientLuxLevel: 450, // Ánh sáng yếu (< 500 lux)
    breaksTakenCount: 0,
    totalRestMinutes: 0,
  };

  const res85 = await request('/inventory/ergonomic-fatigue-analysis', 'POST', fatiguePayload, {}, cookie);
  assert.equal(res85.status, 201, `Failed to analyze ergonomic fatigue: ${JSON.stringify(res85.body)}`);
  assert.equal(res85.body.ok, true);
  assert.equal(res85.body.artisanId, 'ART-THO-THEU-02');
  assert.ok(res85.body.effectiveFatigueFactor > 1.2);
  assert.ok(res85.body.stitchDefectProbabilityPercent > 1.0);
  assert.ok(res85.body.qualityAssuranceIndexQai < 98);
  assert.equal(res85.body.mandatoryBreakRequired, true);
  assert.ok(res85.body.recommendedBreakDurationMinutes >= 15);
  assert.ok(res85.body.ergonomicCertificate.startsWith('#ERGONOMIC-QAI-'));
  console.log(`   -> OK: Fatigue Factor = ${res85.body.effectiveFatigueFactor} | Defect Prob: ${res85.body.stitchDefectProbabilityPercent}% | QAI: ${res85.body.qualityAssuranceIndexQai}/100`);
  console.log(`   -> Risk Tier: [${res85.body.ergonomicRiskTier}] | Mandatory Rest: ${res85.body.mandatoryBreakRequired} (${res85.body.recommendedBreakDurationMinutes} mins)`);
  console.log(`   -> Certificate: ${res85.body.ergonomicCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 4: Algorithm 86 - Rush Bespoke Disruption Surcharge & Compensation Arbiter
  // --------------------------------------------------------------------------
  console.log('\n5. [ALG 86] Testing POST /inventory/rush-bespoke-arbitrate...');
  const rushPayload = {
    rushOrderId: 'ORD-VIP-RUSH-FESTIVAL-01',
    baseGarmentPriceVnd: 15000000,
    requestedLeadTimeHours: 48,
    standardLeadTimeHours: 240,
    artisanOvertimeHours: 20,
    overtimeHourlyRateVnd: 95000,
    displacedOrders: [
      { orderId: 'ORD-DELAY-A', customerTier: 'PLATINUM', originalDueDateIso: '2026-06-28T10:00:00Z', delayedDays: 2, orderValueVnd: 11000000 },
      { orderId: 'ORD-DELAY-B', customerTier: 'GOLD', originalDueDateIso: '2026-06-29T10:00:00Z', delayedDays: 1, orderValueVnd: 6200000 },
    ],
  };

  const res86 = await request('/inventory/rush-bespoke-arbitrate', 'POST', rushPayload, {}, cookie);
  assert.equal(res86.status, 201, `Failed to arbitrate rush bespoke surcharge: ${JSON.stringify(res86.body)}`);
  assert.equal(res86.body.ok, true);
  assert.equal(res86.body.rushOrderId, 'ORD-VIP-RUSH-FESTIVAL-01');
  assert.equal(res86.body.baseGarmentPriceVnd, 15000000);
  assert.equal(res86.body.leadTimeCompressionRatioPercent, 80.0);
  assert.ok(res86.body.artisanOvertimePayVnd > 0);
  assert.ok(res86.body.totalDisplacedCompensationVnd > 0);
  assert.ok(res86.body.scarcityYieldPremiumVnd > 0);
  assert.equal(res86.body.exactDongConservationPreserved, true);
  assert.equal(res86.body.finalRushGarmentPriceVnd, res86.body.baseGarmentPriceVnd + res86.body.totalRushSurchargeVnd);
  assert.ok(res86.body.rushArbitrationCertificate.startsWith('#RUSH-BESPOKE-ARBITER-'));
  console.log(`   -> OK: Base Price: ${res86.body.baseGarmentPriceVnd.toLocaleString('vi-VN')} đ -> Rush Surcharge: +${res86.body.totalRushSurchargeVnd.toLocaleString('vi-VN')} đ (Final: ${res86.body.finalRushGarmentPriceVnd.toLocaleString('vi-VN')} đ)`);
  console.log(`   -> Overtime Pay: ${res86.body.artisanOvertimePayVnd.toLocaleString('vi-VN')} đ | Compensation Pool: ${res86.body.totalDisplacedCompensationVnd.toLocaleString('vi-VN')} đ`);
  console.log(`   -> Exact Dong Preserved Invariant: ${res86.body.exactDongConservationPreserved}`);
  console.log(`   -> Certificate: ${res86.body.rushArbitrationCertificate}`);

  console.log('\n========================================================================');
  console.log('✅ ALL MODULE 19 ALGORITHMS (83, 84, 85, 86) VERIFIED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
