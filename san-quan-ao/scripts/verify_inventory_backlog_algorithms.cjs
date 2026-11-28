/**
 * Verification Script: Module 17 - Atelier Inventory Safety Stock, Multi-Channel Fair Rationing
 * & Pre-Order Backlog Queueing (Algorithms 75, 76, 77, 78)
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
  console.log('=== VERIFYING MODULE 17: ATELIER INVENTORY SAFETY STOCK & BACKLOG QUEUEING ===\n');

  const cookie = await loginAsCustomer();
  console.log('1. [AUTH] Logged in successfully with session cookie.');

  // --------------------------------------------------------------------------
  // TEST 1: Algorithm 75 - Dual-Uncertainty Safety Stock and ROP Engine
  // --------------------------------------------------------------------------
  console.log('\n2. [ALG 75] Testing POST /inventory/safety-stock...');
  const safetyStockPayload = {
    skuId: 'FABRIC-LINEN-NORMANDY-RAW',
    skuName: 'Vải Linen Mộc Thô Hữu Cơ Normandy 220GSM',
    currentStockQty: 42,
    averageDailyDemand: 12, // D_bar = 12 mét/ngày
    demandStdDev: 3.5, // sigma_D = 3.5
    leadTimeDays: 10, // L_bar = 10 ngày
    leadTimeStdDev: 2.5, // sigma_L = 2.5
    serviceLevelTarget: 0.95, // 95% service level (Z = 1.645)
    holdingCostPerUnitYearVnd: 45000,
    orderingCostPerOrderVnd: 400000,
  };

  const res75 = await request('/inventory/safety-stock', 'POST', safetyStockPayload, {}, cookie);
  assert.equal(res75.status, 201, `Failed to evaluate safety stock: ${JSON.stringify(res75.body)}`);
  assert.equal(res75.body.ok, true);
  assert.equal(res75.body.skuId, 'FABRIC-LINEN-NORMANDY-RAW');
  assert.ok(res75.body.combinedUncertaintyStdDev > 0);
  assert.ok(res75.body.safetyStockQty > 0);
  assert.ok(res75.body.reorderPoint > res75.body.safetyStockQty);
  assert.equal(typeof res75.body.triggerReorder, 'boolean');
  assert.ok(['OUT_OF_STOCK', 'CRITICAL_SAFETY_DEFICIT', 'REORDER_THRESHOLD_REACHED', 'OPTIMAL_SURPLUS'].includes(res75.body.stockStatus));
  assert.ok(res75.body.suggestedReorderQty > 0);
  assert.ok(res75.body.safetyStockCertificate.startsWith('#SAFETY-STOCK-'));
  console.log(`   -> OK: Safety Stock = ${res75.body.safetyStockQty}m | ROP = ${res75.body.reorderPoint}m | Trigger Reorder = ${res75.body.triggerReorder}`);
  console.log(`   -> Certificate: ${res75.body.safetyStockCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 2: Algorithm 76 - Multi-Channel Fair Stock Rationing (Hamilton-Hare)
  // --------------------------------------------------------------------------
  console.log('\n3. [ALG 76] Testing POST /inventory/rationing-allocation...');
  const rationingPayload = {
    allocationBatchId: 'CAPSULE-DROP-AUTUMN-2026',
    availableTotalStock: 50, // Chỉ có 50 áo khoác Dạ thủ công
    channels: [
      { channelId: 'CH-VIP-CONCIERGE', channelName: 'VIP Bespoke Valet', priorityTier: 'VIP', requestedUnits: 30, minGuaranteedUnits: 12 },
      { channelId: 'CH-ONLINE-SHOP', channelName: 'NEXORA Online Flagship', priorityTier: 'ATELIER_DIRECT', requestedUnits: 40, minGuaranteedUnits: 8 },
      { channelId: 'CH-BOUTIQUE-PARTNER', channelName: 'Hanoi Heritage Boutique', priorityTier: 'WHOLESALE', requestedUnits: 25, minGuaranteedUnits: 5 },
      { channelId: 'CH-RUNWAY-GUEST', channelName: 'Runway Live Drop Showcase', priorityTier: 'GUEST', requestedUnits: 15, minGuaranteedUnits: 0 },
    ],
  };

  const res76 = await request('/inventory/rationing-allocation', 'POST', rationingPayload, {}, cookie);
  assert.equal(res76.status, 201, `Failed to allocate multi-channel rationing: ${JSON.stringify(res76.body)}`);
  assert.equal(res76.body.ok, true);
  assert.equal(res76.body.availableTotalStock, 50);
  assert.equal(res76.body.totalRequestedUnits, 110);
  assert.equal(res76.body.totalAllocatedUnits, 50);
  assert.equal(res76.body.unallocatedRemainderUnits, 0);
  assert.equal(res76.body.zeroOversellingInvariantSatisfied, true);
  assert.equal(res76.body.allocations.length, 4);

  // Invariant verification across all allocations
  let sumAllocated = 0;
  for (const a of res76.body.allocations) {
    sumAllocated += a.allocatedUnits;
    assert.ok(a.allocatedUnits <= a.requestedUnits, `Allocated units ${a.allocatedUnits} exceeded requested ${a.requestedUnits}`);
    assert.ok(Number.isInteger(a.allocatedUnits), 'Allocated units must be exact integer');
  }
  assert.equal(sumAllocated, 50, 'Sum of allocated units must equal availableTotalStock');
  assert.ok(res76.body.rationingCertificate.startsWith('#RATIONING-HASH-'));
  console.log(`   -> OK: Total requested: 110 | Total allocated: ${res76.body.totalAllocatedUnits} / 50`);
  console.log(`   -> Zero Overselling Invariant: ${res76.body.zeroOversellingInvariantSatisfied}`);
  for (const a of res76.body.allocations) {
    console.log(`      * [${a.priorityTier}] ${a.channelName}: ${a.allocatedUnits}/${a.requestedUnits} units (${a.fulfillmentRatePercent}%)`);
  }
  console.log(`   -> Certificate: ${res76.body.rationingCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 3: Algorithm 77 - M/M/c Preorder Backlog Queue PDD Forecaster
  // --------------------------------------------------------------------------
  console.log('\n4. [ALG 77] Testing POST /inventory/preorder-queue-pdd...');
  const preorderPayload = {
    preorderId: 'PREORDER-SILK-BLAZER-901',
    customerTier: 'PLATINUM',
    garmentCategory: 'BESPOKE_SUIT',
    backlogQueuePosition: 16,
    activeCraftsmenCount: 3,
    dailyProductionRatePerCraftsman: 0.5,
    serviceVarianceDays: 0.7,
    qualityControlDays: 1.5,
    shippingTransitDays: 2.0,
    orderTimestamp: '2026-06-15T09:00:00.000Z',
  };

  const res77 = await request('/inventory/preorder-queue-pdd', 'POST', preorderPayload, {}, cookie);
  assert.equal(res77.status, 201, `Failed to forecast preorder PDD: ${JSON.stringify(res77.body)}`);
  assert.equal(res77.body.ok, true);
  assert.equal(res77.body.preorderId, 'PREORDER-SILK-BLAZER-901');
  assert.equal(res77.body.originalQueuePosition, 16);
  assert.ok(res77.body.effectiveQueuePosition < 16, 'Platinum customer queue should be accelerated');
  assert.ok(res77.body.expectedLeadTimeDays > 0);
  assert.ok(res77.body.confidenceBuffer95Days >= 1);
  assert.ok(res77.body.pddTargetDateIso);
  assert.ok(res77.body.pddMaxGuaranteedDateIso);
  assert.equal(res77.body.onTimeConfidencePercent, 95.0);
  assert.ok(res77.body.preorderQueueCertificate.startsWith('#PREORDER-QUEUE-'));
  console.log(`   -> OK: Original queue: #${res77.body.originalQueuePosition} -> Accelerated: #${res77.body.effectiveQueuePosition}`);
  console.log(`   -> Expected lead time: ${res77.body.expectedLeadTimeDays} days | 95% Confidence Buffer: +${res77.body.confidenceBuffer95Days} days`);
  console.log(`   -> Target PDD: ${res77.body.pddTargetDateIso.slice(0, 10)} | Max PDD: ${res77.body.pddMaxGuaranteedDateIso.slice(0, 10)}`);
  console.log(`   -> Certificate: ${res77.body.preorderQueueCertificate}`);

  // --------------------------------------------------------------------------
  // TEST 4: Algorithm 78 - Multi-Hub Transshipment vs Split Shipment Optimizer
  // --------------------------------------------------------------------------
  console.log('\n5. [ALG 78] Testing POST /inventory/transshipment-consolidate...');
  const transshipPayload = {
    orderId: 'ORDER-BESPOKE-CONSOLIDATE-555',
    customerDestination: {
      province: 'Hà Nội',
      district: 'Ba Đình',
      isUrban: true,
    },
    items: [
      { itemId: 'ITEM-1', itemName: 'Áo Măng Tô Dạ Len', atelierHubId: 'HUB-DANANG', atelierHubName: 'Xưởng May Đà Nẵng', weightKg: 1.8 },
      { itemId: 'ITEM-2', itemName: 'Quần Âu Tơ Sen', atelierHubId: 'HUB-HUE', atelierHubName: 'Xưởng Dệt Cố Đô Huế', weightKg: 0.8 },
    ],
    consolidationHubId: 'HUB-HANOI',
    ecoPackagingCostPerBoxVnd: 45000,
    carbonPenaltyPerKgCo2Vnd: 50000,
  };

  const res78 = await request('/inventory/transshipment-consolidate', 'POST', transshipPayload, {}, cookie);
  assert.equal(res78.status, 201, `Failed to optimize transshipment: ${JSON.stringify(res78.body)}`);
  assert.equal(res78.body.ok, true);
  assert.equal(res78.body.orderId, 'ORDER-BESPOKE-CONSOLIDATE-555');
  assert.equal(res78.body.originHubCount, 2);
  assert.ok(['SPLIT_SHIPMENT', 'LATERAL_TRANSSHIPMENT'].includes(res78.body.recommendedStrategy));
  assert.equal(res78.body.splitShipmentOption.packageCount, 2);
  assert.equal(res78.body.transshipmentOption.packageCount, 1);
  assert.ok(res78.body.splitShipmentOption.totalShippingCostVnd > 0);
  assert.ok(res78.body.transshipmentOption.totalCostVnd > 0);
  assert.ok(res78.body.transshipmentCertificate.startsWith('#TRANSSHIP-OPT-'));
  console.log(`   -> OK: Recommended Strategy = [${res78.body.recommendedStrategy}]`);
  console.log(`   -> Split Shipment: ${res78.body.splitShipmentOption.packageCount} boxes, ${res78.body.splitShipmentOption.totalShippingCostVnd.toLocaleString('vi-VN')} đ, ${res78.body.splitShipmentOption.carbonFootprintKgCo2} kg CO2e`);
  console.log(`   -> Lateral Transshipment: ${res78.body.transshipmentOption.packageCount} box, ${res78.body.transshipmentOption.totalCostVnd.toLocaleString('vi-VN')} đ, ${res78.body.transshipmentOption.carbonFootprintKgCo2} kg CO2e`);
  console.log(`   -> Net Carbon Saved: ${res78.body.netCarbonSavedKgCo2} kg CO2e | Net Cost Savings: ${res78.body.netCostSavingsVnd.toLocaleString('vi-VN')} đ`);
  console.log(`   -> Certificate: ${res78.body.transshipmentCertificate}`);

  console.log('\n========================================================================');
  console.log('✅ ALL MODULE 17 ALGORITHMS (75, 76, 77, 78) VERIFIED WITH 100% SUCCESS!');
  console.log('========================================================================\n');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
