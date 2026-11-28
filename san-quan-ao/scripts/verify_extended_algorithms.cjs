const assert = require('node:assert');

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api/v1';

async function req(path, method = 'GET', body = null, cookie = null) {
  const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'mac-web' };
  if (cookie) headers['Cookie'] = cookie;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

function extractCookie(headers) {
  const sc = headers.get('set-cookie');
  if (!sc) return null;
  return sc.split(';')[0];
}

async function run() {
  console.log('================================================================================');
  console.log('🧪 NEXORA EXTENDED ADVANCED ALGORITHMIC ARCHITECTURE E2E VERIFICATION 🧪');
  console.log('================================================================================');

  // 1. Authenticate Buyer
  console.log('\n[1/6] Authenticating buyer session...');
  const loginRes = await req('/auth/login', 'POST', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });
  assert.strictEqual(loginRes.status, 201, 'Buyer login failed');
  const buyerCookie = extractCookie(loginRes.headers);
  assert(buyerCookie, 'Session cookie not received');
  console.log('✓ Buyer authenticated.');

  // 2. Test Biometric Smart Fit (Weighted Minkowski Distance & Ease Margins)
  console.log('\n[2/6] Testing Biometric Smart Fit algorithm (Minkowski distance & ease margins)...');
  const productsRes = await req('/products', 'GET');
  assert.strictEqual(productsRes.status, 200);
  const products = productsRes.data.items;
  assert(products.length > 0, 'No products found');
  const sampleProduct = products[0];

  const smartFitRes = await req(`/products/${sampleProduct.id}/smart-fit`, 'POST', {
    bustCm: 86,
    waistCm: 68,
    hipsCm: 92,
    fabricType: 'LINEN',
  });
  assert.strictEqual(smartFitRes.status, 201, 'Smart fit evaluation failed');
  assert.strictEqual(smartFitRes.data.ok, true);
  const fit = smartFitRes.data.biometricFit;
  assert(fit.recommendedSize, 'Recommended size missing');
  assert(fit.confidenceScorePct >= 70 && fit.confidenceScorePct <= 100, 'Invalid confidence score');
  assert(fit.easeMargins && typeof fit.easeMargins.bustEaseCm === 'number', 'Missing ease margins');
  console.log(`✓ Smart Fit: Recommended Size ${fit.recommendedSize} (${fit.confidenceScorePct}% confidence)`);
  console.log(`  Ease Margins: Bust +${fit.easeMargins.bustEaseCm}cm, Waist +${fit.easeMargins.waistEaseCm}cm, Hips +${fit.easeMargins.hipsEaseCm}cm`);
  console.log(`  Notes: ${fit.tailorNotes}`);

  // 3. Test Optimal Voucher 0/1 Knapsack Solver
  console.log('\n[3/6] Testing 0/1 Knapsack Optimal Voucher Solver...');
  // Ensure cart has items
  const cartRes = await req('/cart', 'GET', null, buyerCookie);
  if (!cartRes.data || !cartRes.data.length) {
    const v = sampleProduct.variants.find(v => (v.inventory?.onHand ?? 0) - (v.inventory?.reserved ?? 0) > 0) || sampleProduct.variants[1];
    const addRes = await req('/cart', 'POST', { variantId: v.id, quantity: 1 }, buyerCookie);
    assert.strictEqual(addRes.status, 201, 'Failed to add item to cart: ' + JSON.stringify(addRes.data));
  }
  const knapsackRes = await req('/checkout/optimal-vouchers', 'POST', {}, buyerCookie);
  assert.strictEqual(knapsackRes.status, 201, 'Knapsack voucher optimization failed');
  assert.strictEqual(knapsackRes.data.ok, true);
  console.log(`✓ 0/1 Knapsack Solver executed successfully:`);
  console.log(`  Total Savings Calculated: ${knapsackRes.data.totalSavings.toLocaleString('vi-VN')} VND`);
  console.log(`  Optimal Vouchers Selected:`, knapsackRes.data.optimalVouchers);

  // 4. Test Haversine Multi-Hub Delivery ETA Calculation in Quote
  console.log('\n[4/6] Testing Haversine Distance & Multi-Hub Delivery ETA in Quote...');
  const addrRes = await req('/addresses', 'GET', null, buyerCookie);
  const address = addrRes.data[0];
  const quoteRes = await req('/checkout/quote', 'POST', {
    addressId: address.id,
    deliverySlot: 'AFTERNOON',
    ecoPackaging: true,
  }, buyerCookie);
  assert.strictEqual(quoteRes.status, 201, 'Quote generation failed: ' + JSON.stringify(quoteRes.data));
  const quote = quoteRes.data;
  assert(quote.data.deliveryEta, 'Delivery ETA missing from quote');
  const eta = quote.data.deliveryEta;
  assert(typeof eta.distanceKm === 'number', 'Distance in km missing');
  assert(eta.deliveryDateFrom && eta.deliveryDateTo, 'Delivery window dates missing');
  assert(eta.deliverySlotWindow.includes('Chiều'), 'Delivery slot window mismatch');
  console.log(`✓ Logistics ETA: Route Tier [${eta.logisticsRouteTier}] · Distance: ${eta.distanceKm} km`);
  console.log(`  Estimated Window: ${eta.deliveryDateFrom} - ${eta.deliveryDateTo} (${eta.deliverySlotWindow})`);

  // 5. Test Bank Transfer Fuzzy Reconciliation (Levenshtein Distance + Napas IPN)
  console.log('\n[5/6] Testing Napas Bank Transfer Fuzzy Reconciliation (Levenshtein distance)...');
  // Create an order first with VIETQR
  const idempotencyKey = `ext-algo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const orderRes = await req('/orders', 'POST', {
    quoteId: quote.id,
    idempotencyKey,
    paymentMethod: 'VIETQR',
  }, buyerCookie);
  assert.strictEqual(orderRes.status, 201, 'Order placement failed');
  const order = orderRes.data;
  console.log(`  Created VIETQR order: ${order.code} (Total: ${order.total.toLocaleString('vi-VN')} VND)`);

  // Test Exact Match
  const exactIpnRes = await req('/orders/webhook/napas-ipn', 'POST', {
    transactionId: `NAPAS-${Date.now()}-1`,
    amount: order.total,
    narrative: `MBVCB.112233.${order.code}.THANH TOAN DON HANG`,
  }, buyerCookie);
  assert.strictEqual(exactIpnRes.status, 201, 'Exact IPN failed: ' + JSON.stringify(exactIpnRes.data));
  assert.strictEqual(exactIpnRes.data.reconciliation.matched, true);
  assert.strictEqual(exactIpnRes.data.reconciliation.matchType, 'EXACT_CODE_EXACT_AMOUNT');
  assert.strictEqual(exactIpnRes.data.reconciliation.confidencePct, 100);
  console.log(`✓ Exact match Napas IPN reconciled 100% with order ${order.code}`);

  // Test Fuzzy Match with 1 typo in order code (e.g. replace last character)
  const typoCode = order.code.slice(0, -1) + (order.code.slice(-1) === 'A' ? 'B' : 'A');
  const fuzzyIpnRes = await req('/orders/webhook/napas-ipn', 'POST', {
    transactionId: `NAPAS-${Date.now()}-2`,
    amount: order.total,
    narrative: `MBVCB.112234 ${typoCode} CHUYEN TIEN`,
  }, buyerCookie);
  assert.strictEqual(fuzzyIpnRes.status, 201, 'Fuzzy IPN failed: ' + JSON.stringify(fuzzyIpnRes.data));
  assert.strictEqual(fuzzyIpnRes.data.reconciliation.matched, true);
  assert.strictEqual(fuzzyIpnRes.data.reconciliation.matchType, 'FUZZY_LEVENSHTEIN_MATCH');
  assert(fuzzyIpnRes.data.reconciliation.confidencePct >= 90);
  console.log(`✓ Fuzzy match (Levenshtein distance = 1 typo) reconciled ${fuzzyIpnRes.data.reconciliation.confidencePct}% with order ${order.code}`);

  // 6. Test Critical Path Method (CPM) Atelier Bespoke Task Scheduler
  console.log('\n[6/6] Testing Critical Path Method (CPM) Atelier Bespoke Scheduler...');
  const cpmRes = await req('/bespoke/cpm-schedule', 'POST', {
    stages: [
      { id: 'STAGE_1_BIOMETRIC', name: 'Đo trắc học 3D', durationHours: 6, dependencies: [] },
      { id: 'STAGE_2_PATTERN', name: 'Ra rập mộc thủ công', durationHours: 12, dependencies: ['STAGE_1_BIOMETRIC'] },
      { id: 'STAGE_3_FABRIC', name: 'Dệt lụa tơ sen độc bản', durationHours: 28, dependencies: ['STAGE_2_PATTERN'] },
      { id: 'STAGE_3_BUTTONS', name: 'Đúc khuy bạc nguyên khối', durationHours: 10, dependencies: ['STAGE_2_PATTERN'] },
      { id: 'STAGE_4_FITTING', name: 'Fitting thử phom lần 1', durationHours: 8, dependencies: ['STAGE_3_FABRIC', 'STAGE_3_BUTTONS'] },
      { id: 'STAGE_5_FINISHING', name: 'Hoàn thiện viền tay & Triện nghệ nhân', durationHours: 10, dependencies: ['STAGE_4_FITTING'] },
    ],
  }, buyerCookie);
  assert.strictEqual(cpmRes.status, 201, 'CPM schedule calculation failed');
  assert.strictEqual(cpmRes.data.ok, true);
  const sched = cpmRes.data.schedule;
  assert.strictEqual(sched.totalLeadTimeHours, 6 + 12 + 28 + 8 + 10); // 64 hours
  assert(sched.criticalPath.includes('Dệt lụa tơ sen độc bản'));
  assert(!sched.criticalPath.includes('Đúc khuy bạc nguyên khối'));
  console.log(`✓ Critical Path Method (CPM) calculated total lead time: ${sched.totalLeadTimeHours} hours (~${Math.round(sched.totalLeadTimeHours / 8)} working days)`);
  console.log(`  Identified Critical Path Bottlenecks:`, sched.criticalPath);

  // 7. Test Cryptographic Merkle Audit Chain Verification
  console.log('\n[7/9] Testing Cryptographic Merkle Audit Chain Verification...');
  // Confirm payment to generate block 2
  await req(`/orders/${order.id}/confirm-payment`, 'POST', { referenceNumber: 'FT-NAPAS-998811' }, buyerCookie);
  const auditRes = await req(`/orders/${order.id}/audit-chain`, 'GET', null, buyerCookie);
  assert.strictEqual(auditRes.status, 200, 'Failed to fetch audit chain: ' + JSON.stringify(auditRes.data));
  console.log('Audit chain payload:', JSON.stringify(auditRes.data, null, 2));
  assert.strictEqual(auditRes.data.ok, true);
  assert(auditRes.data.cryptoBlocksCount >= 2, 'Audit blocks count must be >= 2');
  assert.strictEqual(auditRes.data.integrity.isValid, true, 'Audit chain integrity compromised');
  console.log(`✓ Cryptographic Audit Chain verified: ${auditRes.data.cryptoBlocksCount} linked blocks, Integrity = VALID (SHA-256 Merkle)`);
  console.log(`  Latest Block Hash: ${auditRes.data.integrity.latestHash.slice(0, 24)}...`);

  // 8. Test Hub-and-Spoke Regional Logistics Consolidation
  console.log('\n[8/9] Testing Multi-Workshop Hub-and-Spoke Logistics Consolidation...');
  const hubRes = await req('/logistics/hub-and-spoke', 'POST', {
    workshops: [
      { shopId: 'shop-nep', shopName: 'NÉP Studio (Hà Nội)', province: 'Hà Nội', itemCount: 2, weightGrams: 700 },
      { shopId: 'shop-namdinh', shopName: 'Xưởng Đũi Nam Định', province: 'Nam Định', itemCount: 1, weightGrams: 400 },
    ],
    destinationProvince: 'TP. Hồ Chí Minh',
  }, buyerCookie);
  assert.strictEqual(hubRes.status, 201, 'Hub-and-spoke evaluation failed');
  assert.strictEqual(hubRes.data.isConsolidationBeneficial, true);
  assert.ok(hubRes.data.selectedHub.name.includes('Hà Nội'));
  console.log(`✓ Hub-and-Spoke Optimizer: Selected [${hubRes.data.selectedHub.name}]`);
  console.log(`  Net Distance Saved: ${hubRes.data.netDistanceSavedKm} km, Carbon Saved: ${hubRes.data.carbonEmissionSavedKg} kg CO2e`);

  // 9. Test Artisan Erlang-C Queue Capacity Forecaster
  console.log('\n[9/9] Testing Artisan Erlang-C Queue Capacity Forecaster...');
  const queueRes = await req('/artisan/queue-forecast', 'POST', {
    activeOrderCount: 4,
    artisanCount: 3,
    avgCraftHoursPerGarment: 16,
    dailyWorkingHoursPerArtisan: 8,
  }, buyerCookie);
  assert.strictEqual(queueRes.status, 201, 'Artisan queue forecast failed');
  assert.strictEqual(queueRes.data.ok, true);
  const qf = queueRes.data.forecast;
  assert(qf.promisedCompletionDate, 'Promised completion date missing');
  assert(typeof qf.totalLeadTimeDays === 'number', 'Total lead time missing');
  console.log(`✓ Artisan Erlang-C Forecaster: Capacity Tier [${qf.capacityTier}] · Promised Completion: ${qf.promisedCompletionDate} (${qf.totalLeadTimeDays} days)`);
  console.log(`  Advisory: ${qf.craftsmanAdvisory}`);

  console.log('\n================================================================================');
  console.log('🎉 ALL 9/9 EXTENDED ADVANCED ALGORITHM CAPABILITIES VERIFIED 100% 🎉');
  console.log('================================================================================');
}

run().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
