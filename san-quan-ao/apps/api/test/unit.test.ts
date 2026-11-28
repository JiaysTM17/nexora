import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allocateDiscount } from '../src/common';
import {
  normalizeVietnameseText,
  calculateDamerauLevenshteinDistance,
  scoreFuzzyVietnameseMatch,
  buildPrefixAutocompleteSuggestions,
  recommendHybridProducts,
  evaluateOrderVelocityAndAnomaly,
  forecastInventoryDemandAndAbcXyz,
  computeProductRatingSummary,
  evaluateSlidingWindowRateLimit,
  evaluateCustomerRfmAndClv,
  mineFrequentCoPurchaseBundles,
  rankCommunityFeedEdgeRank,
  detectAffiliateAndReturnAbuseGraph,
  optimizeDynamicPriceElasticity,
  computeLedgerMerkleAudit,
  verifyMerkleInclusionProof,
  inferVoucherRequiredTier,
  checkVoucherEligibilityForCustomer,
  computeSellerTrustAndPageRank,
  clearUniformPriceLimitedDropAuction,
  optimizeCourierMilkRunRouting,
  evaluatePromoExperimentSequentialAb,
  buildBloomFilter,
  queryBloomFilter,
  DecayedTinyLfuTracker,
  reconcileBatchOrdersSubsetSum,
  solveMinCostMaxFlowOrderFulfillment,
  computeShapleyMultiTouchAttribution,
  detectTimeSeriesCusumAnomalies,
  computeVietnameseSimHash64,
  hammingDistanceSimHash64,
  detectNearDuplicateTextsSimHash,
  optimizeShopAssortmentPortfolio,
  planOutboxRetryAndCircuitSchedule,
  calculateCrc16Ccitt,
  generateVietQrEmvCoPayload,
  calculateLogisticsPacking,
  evaluateOrderRisk,
  verifyEscrowSettlement,
  solveVoucherKnapsack,
  calculateLevenshteinDistance,
  reconcileBankTransferNapasIpn,
  calculateHaversineDistanceKm,
  calculateLogisticsDeliveryEta,
  calculateBiometricSmartFit,
  calculateBespokeCriticalPathSchedule,
  calculateHubAndSpokeConsolidation,
  createAuditChainBlock,
  verifyAuditChainIntegrity,
  calculateArtisanQueueLeadTime,
  safeBpsCalculation,
  bankersRound,
  calculateTradeInResidualValuation,
  calculateCircularLcaImpact,
  evaluateAHPInspectionGrading,
  generateTamperProofTradeInVoucher,
  calculateCareActuarialRiskPremium,
  generateCryptographicZipSeal,
  verifyZipSealAuthenticity,
  estimateTextileRestorationKinetics,
  computeSupercriticalCo2SterilizationProfile,
  calculateColorHarmonyDeltaE00,
  calculateGarmentThermalComfortClo,
  optimizeCapsuleCombinatorics,
  calculateComboBundlePricing,
  hexToCieLab,
  calculateCiede2000,
  calculateLiveFlashDropAllocation,
  calculatePollConsensus,
  matchOptimalStylist,
  evaluateRunwayFrameEntropy,
  evaluateP2PGarmentSwap,
  calculateCreatorPatronageWithholding,
  evaluateOOTDSpatialDispersion,
  calculateChallengePrizeDividend,
  classifyFashionStyleArchetypeMahalanobis,
  calculateFootwearAnthropometricSizing,
  calculateCostPerWearAmortization,
  evaluateHibernationMicroclimateMoldRisk,
  evaluateProofOfDeliverySecurityAndWeight,
  calculateWeatherAdaptiveRerouteBuffer,
  calculateGreenMileEvTelemetryPassport,
  arbitrateEscrowDisputeSettlement,
  calculateFabricDrapeRheologyRadar,
  calculateSilhouetteAnthropometricFit,
  calculateBespokePreorderEscrowQueue,
  calculateMaterialDppEcoProvenance,
  calculateToilePostureCorrection,
  calculateCuttingMarkerYield,
  calculateFittingValetDispatch,
  calculateEscrow3TierSettlement,
  evaluateCircuitBreakerVolatility,
  reconcileEscrowMarketplaceSolvency,
  calculateCircularEprTextileQuota,
  evaluateArtisanQaFairWage,
  evaluateBm25FabricRetrieval,
  evaluatePaletteChromaticMatch,
  evaluateFabricWeightGsmAerodynamics,
  rerankFacetedEntropyDiversity,
  forecastEditorialTrendMomentum,
  calculateCapsuleHarmonyAndPricing,
  evaluateHeritageProvenanceIndex,
  rankCuratedShowcaseCocktail,
  evaluatePasswordEntropyAndKdfPolicy,
  rotateSessionSlidingWindowSecurity,
  synchronizeTotpWithDriftAndRateLimit,
  scoreContextualLoginRiskAndVelocity,
  evaluateBayesianReviewCredibility,
  detectAstroturfingAndCollusionReviews,
  optimizeReverseLogisticsDoorstepRouting,
  evaluateRmaWearAndTearRestitution,
  curateTactileFabricSwatchBox,
  calculateSwatchToBespokeRebateAndConversion,
  packHomeFittingValetSuitcase,
  mapFittingCorrectionBiomechanicalRevise,
  calculateSafetyStockAndReorderPoint,
  allocateMultiChannelStockRationing,
  forecastPreorderBacklogPromisedDeliveryDate,
  optimizeMultiHubTransshipmentConsolidation,
  calculateDeadstockFabricDecayMarkdown,
  optimizeRemnantPatternUpcyclingNest,
  evaluateArtisanFairTradePriceFloor,
  auditAtelierEprCircularityIndex,
  ArtisanWorker,
  scheduleMultiSkillArtisanWorkforce,
  detectTheoryOfConstraintsBottleneck,
  calculateErgonomicFatigueDecayCurve,
  arbitratePriorityRushBespokeSurcharge,
} from '../src/algorithms';

test('discount allocation preserves every dong with deterministic remainder', () => {
  assert.deepEqual(allocateDiscount(2, [1, 1, 1]), [1, 1, 0]);
  assert.deepEqual(allocateDiscount(0, [0, 0]), [0, 0]);
  for (let i = 1; i <= 200; i++) {
    const weights = [i * 970, i * 131, i * 7], amount = i * 367 + 1;
    const parts = allocateDiscount(amount, weights);
    assert.equal(parts.reduce((a,b) => a+b,0), amount);
    parts.forEach((part, j) => assert.ok(Number.isInteger(part) && part >= 0 && part <= weights[j]));
  }
});

test('invalid money allocations fail closed', () => {
  for (const amount of [-1, 4, 0.5]) assert.throws(() => allocateDiscount(amount, [1,1,1]));
});

test('EMVCo CRC-16-CCITT checksum computation matches ISO/IEC 13239 specification', () => {
  const crc1 = calculateCrc16Ccitt('123456789');
  assert.equal(crc1, '29B1');

  const qr = generateVietQrEmvCoPayload({
    bankBin: '970422',
    accountNumber: '999988886666',
    amount: 780000,
    orderCode: 'NX-TEST1234',
    storeName: 'NEXORA ATELIER ESCROW',
  });

  assert.equal(qr.crc16.length, 4);
  assert.ok(qr.emvCoPayload.endsWith(qr.crc16));
  assert.ok(qr.emvCoPayload.includes('A000000727')); // Napas GUID
  assert.ok(qr.emvCoPayload.includes('704')); // VND Currency code
  assert.ok(qr.emvCoPayload.includes('780000'));
});

test('Best-Fit Decreasing (BFD) Logistics Packing packs items into appropriate eco boxes', () => {
  const result = calculateLogisticsPacking([
    {
      variantId: 'v1',
      name: 'Áo sơ mi linen',
      shopId: 'shop-nep',
      shopName: 'NÉP Studio',
      quantity: 2,
      estimatedWeightGrams: 300,
      estimatedVolumeCm3: 1000,
    },
    {
      variantId: 'v2',
      name: 'Đầm lụa Bảo Lộc',
      shopId: 'shop-lua',
      shopName: 'Lụa & Co',
      quantity: 1,
      estimatedWeightGrams: 450,
      estimatedVolumeCm3: 1800,
    },
  ], true);

  assert.ok(result.totalBoxes >= 1);
  assert.ok(result.totalWeightGrams > 0);
  assert.equal(result.isConsolidated, true);
  assert.equal(result.workshopsCount, 2);
  assert.equal(result.tripsSaved, 1);
  assert.ok(result.carbonSavedKg > 0);
  assert.ok(result.courierEfficiencyScore >= 50 && result.courierEfficiencyScore <= 100);
});

test('Multi-Criteria Risk Scoring model identifies risk tiers deterministically', () => {
  const lowRisk = evaluateOrderRisk({
    orderTotal: 450000,
    paymentMethod: 'VIETQR',
    itemCount: 1,
    shopCount: 1,
    recentCancellationsCount: 0,
    isNewAddress: false,
    hasBespokeItem: false,
  });
  assert.equal(lowRisk.tier, 'LOW_RISK');
  assert.equal(lowRisk.autoApproveDispatch, true);

  const highRisk = evaluateOrderRisk({
    orderTotal: 4500000,
    paymentMethod: 'COD',
    itemCount: 12,
    shopCount: 2,
    recentCancellationsCount: 3,
    isNewAddress: true,
    hasBespokeItem: true,
  });
  assert.equal(highRisk.tier, 'HIGH_RISK');
  assert.equal(highRisk.autoApproveDispatch, false);
  assert.equal(highRisk.requiresArtisanPhoneConfirmation, true);
});

test('Double-Entry Escrow Settlement strictly enforces zero-sum balance invariant', () => {
  for (let price = 100000; price <= 5000000; price += 357000) {
    const settlement = verifyEscrowSettlement({
      orderTotal: price + 30000,
      shopSubtotal: price,
      shopDiscount: Math.round(price * 0.1),
      shippingFee: 30000,
      platformFeeBps: 800, // 8%
      affiliateCommissionBps: 500, // 5%
      orderCode: 'NX-UNIT-TEST',
    });

    assert.equal(settlement.isValid, true);
    assert.equal(settlement.totalDebits, settlement.totalCredits);
    assert.equal(settlement.balanceDisparity, 0);
    assert.ok(settlement.taxDeductionVatPit > 0);
    assert.ok(settlement.netArtisanPayout > 0);
  }
});

test('0/1 Knapsack Voucher Optimizer solves multi-shop and platform discount combination', () => {
  const result = solveVoucherKnapsack({
    shopSubtotals: [
      { shopId: 'shop-1', shopName: 'Atelier Hà Nội', subtotal: 650000 },
      { shopId: 'shop-2', shopName: 'Lụa Nam Định', subtotal: 350000 },
    ],
    candidateVouchers: [
      { id: 'v1', code: 'HN50K', shopId: 'shop-1', amount: 50000, minimum: 500000, expiresAt: new Date(Date.now() + 86400000), uses: 0, maxUses: 100 },
      { id: 'v2', code: 'HN100K', shopId: 'shop-1', amount: 100000, minimum: 1000000, expiresAt: new Date(Date.now() + 86400000), uses: 0, maxUses: 100 }, // ineligible
      { id: 'v3', code: 'ND30K', shopId: 'shop-2', amount: 30000, minimum: 300000, expiresAt: new Date(Date.now() + 86400000), uses: 0, maxUses: 100 },
    ],
    tradeInVouchers: [{ code: 'NXTI-VIP100', value: 100000 }],
    freeShipAvailable: true,
    userCoinBalance: 20000,
  });

  assert.equal(result.optimalVouchers['shop-1'], 'HN50K');
  assert.equal(result.optimalVouchers['shop-2'], 'ND30K');
  assert.equal(result.applicableTradeInVoucher?.code, 'NXTI-VIP100');
  assert.equal(result.shippingSavings, 30000);
  assert.ok(result.totalSavings >= 180000);
  assert.ok(result.netPayableAfterOptimization > 0);
});

test('Bank Transfer Fuzzy Reconciliation correctly identifies exact & Levenshtein-perturbed narratives', () => {
  const candidates = [
    { orderId: 'ord-1', orderCode: 'NX-926F0A56', total: 780000, userId: 'u1', createdAt: new Date() },
    { orderId: 'ord-2', orderCode: 'NX-837BC12D', total: 1250000, userId: 'u2', createdAt: new Date() },
  ];

  // Exact match
  const exact = reconcileBankTransferNapasIpn({
    transactionId: 'TX-1001',
    amount: 780000,
    narrative: 'MBVCB.99281.NX-926F0A56.CHUYEN TIEN MUA AO',
    transferDate: new Date().toISOString(),
    gateway: 'NAPAS_247',
  }, candidates);
  assert.equal(exact.matched, true);
  assert.equal(exact.orderCode, 'NX-926F0A56');
  assert.equal(exact.confidencePct, 100);
  assert.equal(exact.matchType, 'EXACT_CODE_EXACT_AMOUNT');

  // Levenshtein distance = 1 (typo: NX-926F0A5B instead of NX-926F0A56)
  const fuzzy = reconcileBankTransferNapasIpn({
    transactionId: 'TX-1002',
    amount: 780000,
    narrative: 'MBVCB.99282 NX-926F0A5B CK AO',
    transferDate: new Date().toISOString(),
    gateway: 'NAPAS_247',
  }, candidates);
  assert.equal(fuzzy.matched, true);
  assert.equal(fuzzy.orderCode, 'NX-926F0A56');
  assert.ok(fuzzy.confidencePct >= 90);
  assert.equal(fuzzy.matchType, 'FUZZY_LEVENSHTEIN_MATCH');

  // Mismatch amount
  const noMatch = reconcileBankTransferNapasIpn({
    transactionId: 'TX-1003',
    amount: 500000,
    narrative: 'NX-926F0A56',
    transferDate: new Date().toISOString(),
    gateway: 'NAPAS_247',
  }, candidates);
  assert.equal(noMatch.matched, false);
});

test('Haversine distance and multi-hub logistics ETA estimator handles intra-city and inter-provincial routes', () => {
  const hanoiToHcm = calculateHaversineDistanceKm(
    { lat: 21.0285, lng: 105.8542 },
    { lat: 10.8012, lng: 106.6541 }
  );
  assert.ok(hanoiToHcm > 1000 && hanoiToHcm < 1300);

  const localEta = calculateLogisticsDeliveryEta({
    originProvince: 'Hà Nội',
    destinationProvince: 'Hà Nội',
    deliverySlot: 'MORNING',
  });
  assert.equal(localEta.logisticsRouteTier, 'INTRA_CITY_EV');
  assert.ok(localEta.distanceKm <= 40);
  assert.ok(localEta.deliverySlotWindow.includes('Sáng'));

  const expressEta = calculateLogisticsDeliveryEta({
    originProvince: 'Hà Nội',
    destinationProvince: 'TP. Hồ Chí Minh',
    deliverySlot: 'EVENING',
    weatherSevere: true,
  });
  assert.equal(expressEta.logisticsRouteTier, 'INTER_PROVINCIAL_EXPRESS');
  assert.ok(expressEta.weatherDelayBufferMinutes > 0);
});

test('Anthropometric Smart Fit evaluates Minkowski distances and fabric-specific ease margins', () => {
  const sizeChart = [
    { size: 'S', bustCm: 84, waistCm: 66, hipsCm: 90 },
    { size: 'M', bustCm: 88, waistCm: 70, hipsCm: 94 },
    { size: 'L', bustCm: 92, waistCm: 74, hipsCm: 98 },
    { size: 'XL', bustCm: 96, waistCm: 78, hipsCm: 102 },
  ];

  const fitResult = calculateBiometricSmartFit(
    { bustCm: 87, waistCm: 69, hipsCm: 93 },
    sizeChart,
    'LINEN'
  );

  assert.equal(fitResult.recommendedSize, 'L'); // In linen, 4.5cm target ease favors L (92 - 87 = 5cm ease)
  assert.ok(fitResult.confidenceScorePct >= 80);
  assert.ok(fitResult.easeMargins.bustEaseCm > 0);
  assert.ok(fitResult.easeMargins.waistEaseCm > 0);
});

test('Critical Path Method (CPM) atelier task scheduler computes forward/backward pass and identifies critical bottlenecks', () => {
  const stages = [
    { id: 'S1', name: 'Đo trắc học 3D', durationHours: 6, dependencies: [] },
    { id: 'S2', name: 'Ra rập mộc', durationHours: 12, dependencies: ['S1'] },
    { id: 'S3_FABRIC', name: 'Dệt & Thêu thủ công', durationHours: 24, dependencies: ['S2'] },
    { id: 'S3_BUTTONS', name: 'Chế tác khuy xà cừ', durationHours: 8, dependencies: ['S2'] }, // Non-critical parallel task
    { id: 'S4', name: 'May định hình & Fitting', durationHours: 8, dependencies: ['S3_FABRIC', 'S3_BUTTONS'] },
    { id: 'S5', name: 'Hoàn thiện viền tay', durationHours: 10, dependencies: ['S4'] },
  ];

  const cpm = calculateBespokeCriticalPathSchedule(stages);
  assert.equal(cpm.totalLeadTimeHours, 6 + 12 + 24 + 8 + 10); // 60 hours
  assert.ok(cpm.criticalPath.includes('Dệt & Thêu thủ công'));
  assert.ok(!cpm.criticalPath.includes('Chế tác khuy xà cừ')); // non-critical branch with float
  const buttonTask = cpm.tasks.find(t => t.id === 'S3_BUTTONS');
  assert.ok(buttonTask && buttonTask.slackHours > 0);
});

test('Multi-Workshop Hub-and-Spoke Logistics Consolidation evaluates regional routing efficiency', () => {
  const singleOrigin = calculateHubAndSpokeConsolidation([
    { shopId: 's1', shopName: 'Atelier NÉP', province: 'Hà Nội', itemCount: 2, weightGrams: 600 }
  ], 'Hà Nội');
  assert.equal(singleOrigin.isConsolidationBeneficial, false);
  assert.equal(singleOrigin.feederLegs.length, 0);

  const multiOrigin = calculateHubAndSpokeConsolidation([
    { shopId: 's1', shopName: 'Atelier Hà Nội', province: 'Hà Nội', itemCount: 2, weightGrams: 700 },
    { shopId: 's2', shopName: 'Lụa Nam Định', province: 'Nam Định', itemCount: 1, weightGrams: 400 },
  ], 'TP. Hồ Chí Minh');

  assert.equal(multiOrigin.isConsolidationBeneficial, true);
  assert.ok(multiOrigin.selectedHub.name.includes('Hà Nội'));
  assert.equal(multiOrigin.feederLegs.length, 2);
  assert.ok(multiOrigin.carbonEmissionSavedKg >= 0);
  assert.ok(multiOrigin.totalLeadTimeHours > 20);
});

test('Cryptographic Audit Chain Block generates deterministic hashes and detects history tampering', () => {
  const b1 = createAuditChainBlock({
    index: 1,
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    action: 'ORDER_CREATE',
    entityId: 'ord-101',
    actorId: 'usr-1',
    amountVnd: 500000,
    data: { code: 'NX-101', status: 'PENDING' },
  });

  const b2 = createAuditChainBlock({
    index: 2,
    prevHash: b1.blockHash,
    action: 'ORDER_CONFIRM_PAYMENT',
    entityId: 'ord-101',
    actorId: 'usr-1',
    amountVnd: 500000,
    data: { reference: 'FT-9988' },
  });

  const b3 = createAuditChainBlock({
    index: 3,
    prevHash: b2.blockHash,
    action: 'ESCROW_RELEASE',
    entityId: 'ord-101',
    actorId: 'sys-admin',
    amountVnd: 472500, // 500k - 5.5% fees
    data: { payoutAccount: '999988886666' },
  });

  const validChain = [b1, b2, b3];
  const initialCheck = verifyAuditChainIntegrity(validChain);
  assert.equal(initialCheck.isValid, true);
  assert.equal(initialCheck.latestHash, b3.blockHash);

  // Tamper test: Modify payload of block 2
  const tamperedChain = [
    b1,
    { ...b2, amountVnd: 100000 }, // Tampered
    b3,
  ];
  const tamperedCheck = verifyAuditChainIntegrity(tamperedChain);
  assert.equal(tamperedCheck.isValid, false);
  assert.equal(tamperedCheck.brokenAtIndex, 1);
});

test('Artisan Erlang-C Queue Capacity forecaster computes backlog, congestion, and promised lead time', () => {
  const lowLoad = calculateArtisanQueueLeadTime({
    activeOrderCount: 2,
    artisanCount: 3,
    avgCraftHoursPerGarment: 12,
    dailyWorkingHoursPerArtisan: 8,
  });
  assert.equal(lowLoad.capacityTier, 'OPTIMAL');
  assert.equal(lowLoad.rushOrderEligible, true);
  assert.ok(lowLoad.totalLeadTimeDays <= 4);

  const highLoad = calculateArtisanQueueLeadTime({
    activeOrderCount: 25,
    artisanCount: 2,
    avgCraftHoursPerGarment: 24,
    dailyWorkingHoursPerArtisan: 8,
  });
  assert.ok(highLoad.capacityTier === 'CONGESTED' || highLoad.capacityTier === 'OVERLOAD');
  assert.equal(highLoad.rushOrderEligible, false);
  assert.ok(highLoad.totalLeadTimeDays > 10);
});

test('Bankers Rounding and Safe Money Math eliminates fractional drift', () => {
  // Round half-to-even tests
  assert.equal(bankersRound(2.5), 2); // rounds to even 2
  assert.equal(bankersRound(3.5), 4); // rounds to even 4
  assert.equal(bankersRound(10.2), 10);
  assert.equal(bankersRound(10.8), 11);

  // Basis point calculations
  const tax = safeBpsCalculation(1500000, 150); // 1.5% of 1.5M = 22.500
  assert.equal(tax, 22500);

  const platformFee = safeBpsCalculation(880000, 800); // 8% of 880.000 = 70.400
  assert.equal(platformFee, 70400);
});

test('Garment Residual Lifecycle Depreciation & Valuation computes Weibull decay and brand preservation', () => {
  // Test 1: Luxury brand (Hermès / Chanel) vs Mass brand
  const luxuryBag = calculateTradeInResidualValuation({
    category: 'Túi xách',
    brand: 'Hermès',
    conditionNote: 'Like new nguyên hộp không tì vết',
    originalRetailPrice: 50_000_000,
    ageMonths: 12,
    fabricType: 'LEATHER',
  });
  assert.equal(luxuryBag.grade, 'S');
  assert.ok(luxuryBag.estimatedValue > 30_000_000);
  assert.ok(luxuryBag.brandMultiplier >= 1.4);

  // Test 2: Standard garment with 36 months decay
  const oldJacket = calculateTradeInResidualValuation({
    category: 'Áo khoác',
    brand: 'Zara',
    conditionNote: 'Áo cũ có sờn nhẹ cổ tay',
    originalRetailPrice: 2_000_000,
    ageMonths: 36,
    fabricType: 'COTTON',
  });
  assert.equal(oldJacket.grade, 'C');
  assert.ok(oldJacket.estimatedValue < 1_000_000);
  assert.ok(oldJacket.depreciationRate > 0.5);

  // Test 3: Natural fiber bonus (Silk / Wool)
  const silkDress = calculateTradeInResidualValuation({
    category: 'Đầm / Váy',
    brand: 'NEXORA ATELIER',
    conditionNote: 'Tình trạng tốt giữ gìn',
    ageMonths: 6,
    fabricType: 'SILK',
  });
  assert.equal(silkDress.grade, 'A');
  assert.ok(silkDress.estimatedValue >= 900_000);
});

test('ISO 14040/14044 LCA Carbon & Water Footprint Abatement computes verified metrics and Eco-Coins', () => {
  const linenSuit = calculateCircularLcaImpact({
    fabricType: 'LINEN',
    weightGrams: 800,
    resaleGrade: 'S',
  });

  assert.ok(linenSuit.co2SavedKg > 3.0);
  assert.ok(linenSuit.waterSavedLiters > 2000);
  assert.ok(linenSuit.textileLandfillDivertedGrams === 800);
  assert.ok(linenSuit.ecoCoinsReward >= 50);
  assert.ok(linenSuit.isoStandard.includes('ISO 14040/14044 LCA Certified'));

  const polyesterShirt = calculateCircularLcaImpact({
    fabricType: 'POLYESTER',
    weightGrams: 300,
    resaleGrade: 'B',
  });
  assert.ok(polyesterShirt.chemicalSavedKg > 0);
  assert.ok(polyesterShirt.co2SavedKg > 0);
});

test('Analytic Hierarchy Process (AHP) 8-Factor Optical Lab Inspection deterministically grades garments', () => {
  // Pristine sample under 1000 Lux ISO 4915
  const pristine = evaluateAHPInspectionGrading({
    fiberStructureScore: 96,
    hardwareSeamScore: 94,
    colorRetentionScore: 98,
    stainReversibilityScore: 92,
  });
  assert.equal(pristine.grade, 'S');
  assert.ok(pristine.compositeScore >= 90);
  assert.equal(pristine.recommendedAction, 'CERTIFIED_COLLECTOR_RESALE');
  assert.equal(pristine.inspectionChecklist.every(c => c.passed), true);

  // Damaged sample
  const damaged = evaluateAHPInspectionGrading({
    fiberStructureScore: 40,
    hardwareSeamScore: 45,
    colorRetentionScore: 50,
    stainReversibilityScore: 30,
  });
  assert.equal(damaged.grade, 'D');
  assert.ok(damaged.compositeScore < 50);
  assert.equal(damaged.recommendedAction, 'MECHANICAL_RECYCLE');
});

test('Anti-Arbitrage Cryptographic Trade-In Voucher Generator ensures tamper resistance and expiry', () => {
  const v1 = generateTamperProofTradeInVoucher({
    tradeInId: 'ti-12345',
    grade: 'S',
    amountVnd: 4500000,
    userId: 'usr-999',
  });

  assert.ok(v1.code.startsWith('NXTI-S'));
  assert.equal(v1.signatureHex.length, 6);
  assert.ok(v1.expiresAt.getTime() > Date.now());

  // Deterministic signature for identical inputs
  const v2 = generateTamperProofTradeInVoucher({
    tradeInId: 'ti-12345',
    grade: 'S',
    amountVnd: 4500000,
    userId: 'usr-999',
  });
  assert.equal(v1.code, v2.code);
  assert.equal(v1.signatureHex, v2.signatureHex);

  // Different user or amount produces different signature
  const v3 = generateTamperProofTradeInVoucher({
    tradeInId: 'ti-12345',
    grade: 'S',
    amountVnd: 5000000, // Altered amount
    userId: 'usr-999',
  });
  assert.notEqual(v1.code, v3.code);
});

test('Actuarial Garment Insurance Risk Premium & Underwriting Engine calculates excess risk and Solvency II buffer', () => {
  // Test 1: Within 10M free limit (Zero premium)
  const freeCase = calculateCareActuarialRiskPremium({
    declaredValueVnd: 8_000_000,
    serviceType: 'SPA_CLEANING',
  });
  assert.equal(freeCase.baseFee, 250_000);
  assert.equal(freeCase.insurancePremium, 0);
  assert.equal(freeCase.totalFee, 250_000);
  assert.equal(freeCase.deductibleVnd, 0);
  assert.ok(freeCase.underwritingSummary.includes('miễn phí'));

  // Test 2: High value luxury garment (Hermès Birkin / Haute Couture gown: 50M)
  const luxuryCase = calculateCareActuarialRiskPremium({
    declaredValueVnd: 50_000_000,
    serviceType: 'LEATHER_RESTORE',
    fabricMatrix: 'VEGETABLE_LEATHER',
    transitMode: 'ECO_ELECTRIC_VAN',
  });
  assert.equal(luxuryCase.baseFee, 450_000);
  assert.equal(luxuryCase.excessInsuredValue, 40_000_000);
  assert.ok(luxuryCase.insurancePremium >= 50_000);
  assert.ok(luxuryCase.solvencySafetyBuffer > 0);
  assert.ok(luxuryCase.pureRiskRateBps > 50);
  assert.equal(luxuryCase.maxCoverageVnd, 50_000_000);
  assert.ok(luxuryCase.totalFee > luxuryCase.baseFee);
});

test('Tamper-Evident Cryptographic Zip-Seal Serial Generator & CRC-16 Checksum ensures physical security', () => {
  const seal = generateCryptographicZipSeal({
    bookingId: 'bk-care-901',
    userId: 'usr-vip-007',
    serviceType: 'LEATHER_RESTORE',
    hubCode: 'SGN',
  });

  assert.ok(seal.sealCode.startsWith('NX-SEAL-SGN-'));
  assert.ok(seal.hmacSignature.length >= 16);

  // Verification of authentic seal
  const validCheck = verifyZipSealAuthenticity(seal.sealCode);
  assert.equal(validCheck.isValid, true);
  assert.equal(validCheck.hubCode, 'SGN');
  assert.equal(validCheck.checksumValid, true);

  // Tampered seal: modified character in serial body
  const corruptedSeal = seal.sealCode.slice(0, -2) + 'FF';
  const tamperCheck = verifyZipSealAuthenticity(corruptedSeal);
  assert.equal(tamperCheck.isValid, false);
  assert.equal(tamperCheck.checksumValid, false);
  assert.ok(tamperCheck.reason?.includes('Checksum CRC-16'));

  // Invalid format test
  const invalidFormat = verifyZipSealAuthenticity('INVALID-CODE-1234');
  assert.equal(invalidFormat.isValid, false);
  assert.ok(invalidFormat.reason?.includes('định dạng chuẩn'));
});

test('Textile Fiber Restoration Kinetics & Recovery Rate Estimator forecasts degradation kinetics', () => {
  // Test 1: Yellow sweat stain on silk dress
  const silkResult = estimateTextileRestorationKinetics({
    garmentType: 'SILK_DRESS',
    symptom: 'STAIN_YELLOW',
    severityLevel: 2,
    treatmentMethod: 'BIO_ENZYME_SPA',
  });
  assert.ok(silkResult.recoveryRatePct >= 90);
  assert.ok(silkResult.tensileStrengthRetentionPct >= 95);
  assert.ok(silkResult.safetyConfidenceScore >= 90);
  assert.ok(silkResult.recommendedChemicalProtocol.includes('Protease'));

  // Test 2: Dehydrated vegetable leather with organic oiling
  const leatherResult = estimateTextileRestorationKinetics({
    garmentType: 'VEG_LEATHER',
    symptom: 'LEATHER_DRY',
    severityLevel: 1,
    treatmentMethod: 'ORGANIC_OILING',
  });
  assert.ok(leatherResult.recoveryRatePct >= 95);
  assert.ok(leatherResult.recommendedChemicalProtocol.includes('Mink Oil'));
  assert.equal(leatherResult.cycleDurationMinutes, 60);
});

test('Supercritical Fluid CO2 & Ozone Chamber Thermodynamic Profile calculates supercritical states', () => {
  const silkCo2 = computeSupercriticalCo2SterilizationProfile({
    preset: 'SILK_CASHMERE',
    targetDisinfectionLevel: 'LOG_4_DEEP_SPORE',
  });

  assert.ok(silkCo2.pressureBar > 73.8); // Above CO2 critical pressure (73.8 bar)
  assert.ok(silkCo2.temperatureCelsius > 31.1); // Above CO2 critical temperature (31.1°C)
  assert.ok(silkCo2.co2DensityKgM3 > 600); // Liquid-like density
  assert.ok(silkCo2.depressurizationRateBarPerMin <= 2.5); // Safe depressurization
  assert.ok(silkCo2.waterSavedLiters > 0);
  assert.ok(silkCo2.percAvoidedGrams > 0);
  assert.equal(silkCo2.co2RecycleEfficiencyPct, 98.6);
  assert.ok(silkCo2.isoCertificationBasis.includes('Supercritical'));
});

test('CIELAB DE2000 Color Harmony Stylist Engine calculates perceptual difference and harmony tier', () => {
  // Test 1: CIELAB conversion and identical color distance
  const labBlack = hexToCieLab('#30332f');
  const labWhite = hexToCieLab('#eeeae1');
  assert.equal(calculateCiede2000(labBlack, labBlack), 0);
  assert.ok(calculateCiede2000(labBlack, labWhite) > 50);

  // Test 2: Tone-sur-tone Quiet Luxury Palette (Kem #dfd4bd & Nâu cát #b89f82)
  const quietLuxury = calculateColorHarmonyDeltaE00(['#dfd4bd', '#b89f82']);
  assert.ok(quietLuxury.overallHarmonyScore >= 90);
  assert.ok(quietLuxury.harmonyTier === 'TONE_SUR_TONE_MONO' || quietLuxury.harmonyTier === 'ANALOGOUS_ELEGANT');
  assert.ok(quietLuxury.pairwiseDeltaE.length === 1);
  assert.ok(quietLuxury.aestheticRecommendation.includes('Quiet Luxury') || quietLuxury.aestheticRecommendation.includes('trang nhã'));

  // Test 3: High contrast statement (Đen #252926 vs Kem sáng #f4ede1)
  const statement = calculateColorHarmonyDeltaE00(['#252926', '#f4ede1']);
  assert.ok(statement.pairwiseDeltaE[0].deltaE > 40);
});

test('ISO 9920 / ASHRAE 55 Garment Thermal Insulation (Clo) & Weather Comfort evaluates climate neutrality', () => {
  // Mild Autumn weather: 22°C with linen blazer layering
  const autumnEnsemble = calculateGarmentThermalComfortClo({
    pieces: [
      { id: 'top-1', category: 'top', material: 'Linen 100% thoáng khí' },
      { id: 'bot-1', category: 'bottom', material: 'Cotton 97% spandex 3%' },
      { id: 'out-1', category: 'outer', material: 'Linen 100% phom Relaxed Tailored' },
    ],
    ambientTempC: 22,
    windSpeedMps: 1.2,
  });

  assert.ok(autumnEnsemble.totalEnsembleClo > 0.5 && autumnEnsemble.totalEnsembleClo < 1.0);
  assert.equal(autumnEnsemble.comfortStatus, 'THERMALLY_OPTIMAL');
  assert.equal(autumnEnsemble.breathabilityIndex, 'HIGH_BREATHABILITY');
  assert.ok(autumnEnsemble.weatherAdvisory.includes('22°C'));

  // Cold weather with insufficient insulation
  const coldEnsemble = calculateGarmentThermalComfortClo({
    pieces: [
      { id: 'top-2', category: 'top', material: 'Lụa tơ tằm' },
      { id: 'bot-2', category: 'bottom', material: 'Đầm lụa' },
    ],
    ambientTempC: 12,
  });
  assert.equal(coldEnsemble.comfortStatus, 'UNDER_INSULATED');
  assert.ok(coldEnsemble.weatherAdvisory.includes('khoác thêm'));
});

test('Capsule Wardrobe Combinatorial Graph Optimizer generates bipartite outfits and Cost-Per-Wear schedule', () => {
  const pieces = [
    { id: 'top-1', name: 'Sơ mi linen', category: 'top' as const, price: 425000, material: 'Linen' },
    { id: 'top-2', name: 'Áo thun cotton', category: 'top' as const, price: 245000, material: 'Cotton' },
    { id: 'bot-1', name: 'Quần suông', category: 'bottom' as const, price: 495000, material: 'Cotton' },
    { id: 'bot-2', name: 'Đầm dạo phố', category: 'bottom' as const, price: 685000, material: 'Linen' },
    { id: 'out-1', name: 'Blazer linen', category: 'outer' as const, price: 1350000, material: 'Linen' },
  ];

  const capsule = optimizeCapsuleCombinatorics(pieces);
  assert.equal(capsule.totalPieces, 5);
  // 2 tops * 2 bottoms * (1 outer + 1 no-outer) = 8 combinations
  assert.equal(capsule.totalOutfitsCount, 8);
  assert.equal(capsule.totalInvestmentVnd, 3200000);
  assert.ok(capsule.bundleSavingsVnd > 0);
  assert.ok(capsule.discountedTotalVnd < capsule.totalInvestmentVnd);
  assert.ok(capsule.costPerWear180Days > 0);
  assert.ok(capsule.costPerWear365Days < capsule.costPerWear180Days);
  assert.ok(capsule.diversityIndexShannon > 1.5);
});

test('Combo Style Saver Bundled Pricing & Marginal Utility Allocator preserves exact Dong via Hamilton-Hare', () => {
  const bundle = calculateComboBundlePricing({
    items: [
      { id: 'item-top', price: 425000, category: 'top' },
      { id: 'item-bot', price: 495000, category: 'bottom' },
      { id: 'item-out', price: 1350000, category: 'outer' },
    ],
    discountTierPct: 10,
  });

  assert.equal(bundle.subtotal, 2270000);
  assert.equal(bundle.discountAmount, 227000);
  assert.equal(bundle.finalTotal, 2043000);
  assert.equal(bundle.tierApplied, 'COMBO_10PCT_BUNDLE');
  assert.ok(bundle.loyaltyEcoCoinsEarned > 1000);

  // Exact penny preservation: sum of allocated lines matches total
  const sumDiscounts = bundle.allocatedLines.reduce((s, l) => s + l.discountPortion, 0);
  assert.equal(sumDiscounts, bundle.discountAmount);

  const sumDiscounted = bundle.allocatedLines.reduce((s, l) => s + l.discountedPrice, 0);
  assert.equal(sumDiscounted, bundle.finalTotal);
});

test('Live Stream Exponential Velocity Decay & Fair Poisson Stock Allocation manages high-concurrency burst', () => {
  // Test 1: Explosive burst during first 30 seconds with active stock
  const earlyBurst = calculateLiveFlashDropAllocation({
    viewers: 1500,
    elapsedSeconds: 30,
    windowSeconds: 900,
    initialStock: 20,
    reservedCount: 4,
    buyerTier: 'VIP_DIAMOND',
    requestedQuantity: 1,
  });

  assert.equal(earlyBurst.granted, true);
  assert.equal(earlyBurst.remainingStock, 16);
  assert.equal(earlyBurst.queuePosition, 0);
  assert.ok(earlyBurst.arrivalRatePerSec > 50);
  assert.equal(earlyBurst.velocityTier, 'EXPLOSIVE_BURST');
  assert.ok(earlyBurst.reservationToken.startsWith('FLASHTOKEN-LIVE-'));
  assert.ok(earlyBurst.reservationTtlSec >= 120);

  // Test 2: Depleted stock puts buyer in queue
  const depleted = calculateLiveFlashDropAllocation({
    viewers: 1200,
    elapsedSeconds: 600,
    windowSeconds: 900,
    initialStock: 10,
    reservedCount: 10,
    buyerTier: 'STANDARD',
  });

  assert.equal(depleted.granted, false);
  assert.equal(depleted.remainingStock, 0);
  assert.ok(depleted.queuePosition >= 1);
  assert.equal(depleted.velocityTier, 'DEPLETED');
  assert.ok(depleted.advisory.includes('cháy hàng'));
});

test('Wilson Score Lower Bound & Bayesian Beta-Binomial Consensus Engine confirms audience poll', () => {
  const poll = calculatePollConsensus({
    votes: {
      'opt-1': 486, // Outfit Dạ Hội
      'opt-2': 214, // Outfit Công Sở
      'opt-3': 105, // Outfit Dạo Phố
    },
    consensusThreshold: 0.35,
  });

  assert.equal(poll.totalVotes, 805);
  assert.equal(poll.winningOption, 'opt-1');
  assert.equal(poll.consensusConfirmed, true);
  assert.equal(poll.voucherUnlocked, true);
  assert.ok(poll.marginOfVictoryPct > 30);

  const topStats = poll.stats['opt-1'];
  assert.ok(topStats.observedPct > 55 && topStats.observedPct < 65);
  assert.ok(topStats.wilsonLowerPct > 55);
  assert.ok(topStats.wilsonUpperPct > topStats.wilsonLowerPct);
  assert.ok(topStats.bayesianMeanPct > 55);
});

test('VIP Stylist Appointment Optimal Affinity & Hungarian Bipartite Matcher pairs customer with Master Stylist', () => {
  // Test 1: Quiet Luxury customer paired with Elena Vũ
  const luxuryMatch = matchOptimalStylist({
    customerArchetype: 'QUIET_LUXURY',
    consultFormat: 'FLAGSHIP',
    requestedSlot: '14:30 - 15:15',
    vipTier: 'DIAMOND',
  });

  assert.equal(luxuryMatch.matchedStylist.id, 'ELENA');
  assert.ok(luxuryMatch.matchedStylist.affinityScorePct >= 95);
  assert.equal(luxuryMatch.privateSuiteAssigned, true);
  assert.equal(luxuryMatch.preparationLeadTimeMinutes, 45);
  assert.ok(luxuryMatch.appointmentHash.startsWith('APPT-VIP-'));
  assert.ok(luxuryMatch.curatorBriefing.includes('Elena Vũ'));

  // Test 2: Minimalist Executive customer paired with Marcus Trần
  const executiveMatch = matchOptimalStylist({
    customerArchetype: 'MINIMAL_EXECUTIVE',
    consultFormat: 'VIRTUAL',
    vipTier: 'GOLD',
  });
  assert.equal(luxuryMatch.matchedStylist.id, 'ELENA');
  assert.equal(executiveMatch.matchedStylist.id, 'MARCUS');
  assert.ok(executiveMatch.matchedStylist.affinityScorePct >= 90);
});

test('Runway Frame Information Entropy & Golden Ratio Aesthetic Scorer evaluates camera capture', () => {
  // Catwalk wide-shot lookbook capture
  const catwalkFrame = evaluateRunwayFrameEntropy({
    angle: 'CATWALK',
    productName: 'Áo măng tô Trench Coat dạ mỏng cao cấp',
    price: 1850000,
    lookId: 'LOOK-CAT-9921',
  });

  assert.equal(catwalkFrame.lookId, 'LOOK-CAT-9921');
  assert.equal(catwalkFrame.angle, 'CATWALK');
  assert.ok(catwalkFrame.entropyBits > 7.0);
  assert.ok(catwalkFrame.goldenRatioHarmonyPct >= 95);
  assert.ok(catwalkFrame.collectorScore >= 80);
  assert.ok(catwalkFrame.rarityTier === 'EXCLUSIVE_CURATION' || catwalkFrame.rarityTier === 'COUTURE_MASTERPIECE');
  assert.equal(catwalkFrame.provenanceHash.length, 64);
  assert.ok(catwalkFrame.curatorNotes.includes('Entropy thông tin'));
});

test('P2P Garment Swap Parity & Escrow Collateral Invariant Engine verifies fair value and LCA offset', () => {
  // Test 1: Even exchange between similar garments
  const evenSwap = evaluateP2PGarmentSwap({
    myItemName: 'Áo Khoác Blazer Linen Cổ Điển',
    myEstimatedValueVnd: 650000,
    targetItemName: 'Sơ Mi Lụa Tơ Tằm Bảo Lộc',
    targetEstimatedValueVnd: 680000,
    fabricType: 'LINEN',
  });

  assert.ok(evenSwap.fairValueMatchPct >= 95.0);
  assert.equal(evenSwap.valuationDeltaVnd, 30000);
  assert.equal(evenSwap.compensationDirection, 'PAY_COMPENSATION');
  assert.equal(evenSwap.compensationAmountVnd, 30000);
  assert.ok(evenSwap.requiredEscrowCollateralVnd > 130000);
  assert.ok(evenSwap.ecoImpact.co2SavedKg > 3.0);
  assert.ok(evenSwap.ecoImpact.waterSavedLiters > 2000);
  assert.equal(evenSwap.ecoImpact.ecoPointsReward, 300);
  assert.equal(evenSwap.contractStateHash.length, 64);
  assert.ok(evenSwap.contractId.startsWith('SWAP-P2P-'));

  // Test 2: Perfect match
  const perfectSwap = evaluateP2PGarmentSwap({
    myItemName: 'Quần Linen',
    myEstimatedValueVnd: 500000,
    targetItemName: 'Chân váy Linen',
    targetEstimatedValueVnd: 500000,
  });
  assert.equal(perfectSwap.fairValueMatchPct, 100);
  assert.equal(perfectSwap.compensationDirection, 'EVEN_EXCHANGE');
  assert.equal(perfectSwap.compensationAmountVnd, 0);
  assert.equal(perfectSwap.requiredEscrowCollateralVnd, 100000); // 20% collateral
});

test('Creator Micro-Patronage & TT 111/2013 10% PIT Withholding Engine deducts tax and issues e-Tax receipt', () => {
  // Coffee tip of 50,000 VND
  const coffeeTip = calculateCreatorPatronageWithholding({
    creatorIdOrName: 'Elena Vũ (@elenavu)',
    grossAmountVnd: 50000,
    message: 'Bộ phối đồ quá xuất sắc!',
    senderUserId: 'usr-buyer-001',
  });

  assert.equal(coffeeTip.grossAmountVnd, 50000);
  assert.equal(coffeeTip.pitTaxWithheldVnd, 5000); // 10% PIT
  assert.equal(coffeeTip.netDisbursedVnd, 45000); // 90% Net
  assert.equal(coffeeTip.loyaltyEcoCoinsEarned, 20);
  assert.ok(coffeeTip.eTaxReceiptNumber.startsWith('ETAX-TNCN-'));
  assert.ok(coffeeTip.complianceArticle.includes('Thông tư 111/2013/TT-BTC'));
  assert.ok(coffeeTip.patronageId.startsWith('PATRON-'));
});

test('OOTD 2D Pinpoint Spatial Dispersion & Occlusion Prevention Engine detects clutter and computes cart weights', () => {
  // Case 1: Well-dispersed tags
  const goodTags = evaluateOOTDSpatialDispersion([
    { productId: 'prod-blazer', x: 0.50, y: 0.35 },
    { productId: 'prod-shirt', x: 0.50, y: 0.55 },
    { productId: 'prod-pants', x: 0.50, y: 0.75 },
  ], 0.08);

  assert.equal(goodTags.isValid, true);
  assert.equal(goodTags.totalTags, 3);
  assert.equal(goodTags.occlusionConflictDetected, false);
  assert.equal(goodTags.readabilityScorePct, 98);
  assert.ok(goodTags.meanDispersionDistance > 0.15);

  // Case 2: Occluded overlapping tags
  const overlappingTags = evaluateOOTDSpatialDispersion([
    { productId: 'prod-1', x: 0.50, y: 0.50 },
    { productId: 'prod-2', x: 0.52, y: 0.51 }, // Distance = ~0.022 < 0.08
  ], 0.08);

  assert.equal(overlappingTags.occlusionConflictDetected, true);
  assert.equal(overlappingTags.readabilityScorePct, 75);
  assert.ok(overlappingTags.advisory.includes('quá sát nhau'));
});

test('Community Challenge Bayesian Ranking & Hamilton-Hare Prize Pool Dividend guarantees exact Dong distribution', () => {
  const challenge = calculateChallengePrizeDividend({
    challengeId: 'CHAL-46-LINEN',
    entries: [
      { postId: 'post-1', creatorName: 'Elena Vũ', votes: 342, daysActive: 3 },
      { postId: 'post-2', creatorName: 'Hoàng Nam', votes: 218, daysActive: 2 },
      { postId: 'post-3', creatorName: 'Mai Phương', votes: 145, daysActive: 4 },
      { postId: 'post-4', creatorName: 'Thanh Trúc', votes: 65, daysActive: 1 },
    ],
    totalPrizePoolVnd: 15000000,
    topCount: 3,
  });

  assert.equal(challenge.challengeId, 'CHAL-46-LINEN');
  assert.equal(challenge.totalEntries, 4);
  assert.equal(challenge.totalVotesCast, 770);
  assert.equal(challenge.finalists.length, 3);

  // Rank 1: Elena Vũ, Rank 2: Hoàng Nam, Rank 3: Mai Phương
  assert.equal(challenge.finalists[0].rank, 1);
  assert.equal(challenge.finalists[0].creatorName, 'Elena Vũ');
  assert.equal(challenge.finalists[0].tierBadge, 'QUÁN QUÂN PHONG CÁCH (GOLD)');

  // Exact penny preservation of 15,000,000 VND prize fund
  assert.equal(challenge.prizePreservationExact, true);
  assert.equal(challenge.distributedPrizeTotalVnd, 15000000);
  assert.equal(
    challenge.finalists.reduce((s, f) => s + f.allocatedPrizeVnd, 0),
    15000000
  );
  assert.equal(challenge.finalists[0].allocatedPrizeVnd, 7500000); // 50%
  assert.equal(challenge.finalists[1].allocatedPrizeVnd, 4500000); // 30%
  assert.equal(challenge.finalists[2].allocatedPrizeVnd, 3000000); // 20%
});

test('Style Archetype Mahalanobis 4D classifier evaluates multi-dimensional style DNA and produces normalized affinity', () => {
  // Test case 1: Pure Quiet Luxury Curator choices (Neutrals, Gala, Silk, Understated Luxury)
  const resultLuxury = classifyFashionStyleArchetypeMahalanobis({
    colorPaletteChoice: 0,
    contextChoice: 0,
    tactileChoice: 0,
    ethosChoice: 0,
    preferredFit: 'REGULAR',
  });

  assert.equal(resultLuxury.primaryArchetype.id, 'QUIET_LUXURY_CURATOR');
  assert.ok(resultLuxury.primaryArchetype.affinityScorePct > 60);
  assert.ok(resultLuxury.confidencePct >= 80);
  assert.deepEqual(resultLuxury.lifestyleVector, [0, 0, 0, 0]);
  assert.ok(resultLuxury.primaryArchetype.recommendedFabrics.includes('Lụa Tơ Tằm Bảo Lộc 100%'));

  // Test case 2: Earth Sartorialist choices (Earth, Creative Studio, Linen, Natural Harmony) with OVERSIZED
  const resultEarth = classifyFashionStyleArchetypeMahalanobis({
    colorPaletteChoice: 1,
    contextChoice: 1,
    tactileChoice: 1,
    ethosChoice: 1,
    preferredFit: 'OVERSIZED',
  });

  assert.equal(resultEarth.primaryArchetype.id, 'EARTH_SARTORIALIST');
  assert.ok(resultEarth.primaryArchetype.affinityScorePct > 60);
  assert.ok(resultEarth.primaryArchetype.recommendedFabrics.includes('Lanh Normandy Flax 100%'));
  assert.ok(resultEarth.primaryArchetype.signaturePaletteHex.includes('#D6CBBA'));

  // Test case 3: Hybrid choices (Minimalist & Bohemian boundary)
  const resultHybrid = classifyFashionStyleArchetypeMahalanobis({
    colorPaletteChoice: 2, // Monochrome
    contextChoice: 3,      // Eco Retreat
    tactileChoice: 2,      // Satin & Crisp Wool
    ethosChoice: 3,        // Circular Freedom
    preferredFit: 'SLIM',
  });

  assert.ok(['MINIMALIST_ARCHITECT', 'SLOW_FASHION_BOHEMIAN'].includes(resultHybrid.primaryArchetype.id));
  assert.ok(resultHybrid.secondaryArchetype.affinityScorePct > 0);
  // Affinities sum to approx 100%
  const totalAffinity = Object.values(resultHybrid.affinityDistribution).reduce((s, v) => s + v, 0);
  assert.ok(Math.abs(totalAffinity - 100) < 1.0);
});

test('Footwear Anthropometric ISO 9407 / Brannock Engine maps foot mm to EU/US/UK and biomechanical arch support', () => {
  // Typical foot: 255mm length, 96mm width, STANDARD arch in classic loafer
  const resultStandard = calculateFootwearAnthropometricSizing({
    footLengthMm: 255,
    footWidthMm: 96,
    archType: 'STANDARD',
    shoeCategory: 'LOAFER_DERBY',
  });

  assert.equal(resultStandard.isoMondopointMm, 255);
  // Last length = 255 + 15 = 270mm. (270 * 1.5)/10 = 40.5 EU
  assert.equal(resultStandard.euroSize, 40.5);
  assert.equal(resultStandard.usSize, 7.5); // 40.5 - 33.0
  assert.equal(resultStandard.ukSize, 7.0); // 40.5 - 33.5
  assert.equal(resultStandard.recommendedInsoleLengthMm, 260); // 255 + 5mm
  // Width ratio = 96/255 = 0.376 -> 'D' (Medium)
  assert.equal(resultStandard.brannockWidthLetter, 'D');
  assert.equal(resultStandard.archBiomechanicalCorrection.instepAllowanceMm, 0);
  assert.ok(resultStandard.fitConfidencePct >= 98);

  // Wide flat foot: 260mm length, 110mm width, FLAT arch
  const resultFlat = calculateFootwearAnthropometricSizing({
    footLengthMm: 260,
    footWidthMm: 110,
    archType: 'FLAT',
    shoeCategory: 'BOOT',
  });

  // Width ratio = 110/260 = 0.423 -> 'EE' (Extra Wide)
  assert.equal(resultFlat.brannockWidthLetter, 'EE');
  assert.equal(resultFlat.archBiomechanicalCorrection.archType, 'FLAT');
  assert.ok(resultFlat.archBiomechanicalCorrection.footbedRecommendation.includes('nâng đỡ lòng bàn chân'));

  // High arch foot with need for instep clearance (+3mm)
  const resultHigh = calculateFootwearAnthropometricSizing({
    footLengthMm: 245,
    footWidthMm: 90,
    archType: 'HIGH',
    shoeCategory: 'SNEAKER',
  });

  assert.equal(resultHigh.archBiomechanicalCorrection.archType, 'HIGH');
  assert.equal(resultHigh.archBiomechanicalCorrection.instepAllowanceMm, 3);
  assert.ok(resultHigh.archBiomechanicalCorrection.footbedRecommendation.includes('hấp thụ lực chấn động'));
});

test('Wardrobe Cost-Per-Wear (CPW) Amortization & Lifecycle Markov model computes TCO and circularity timing', () => {
  // Blazer Normandy Linen: 2,400,000 VND, 180,000 VND maintenance, 28 wears
  const resultEarly = calculateCostPerWearAmortization({
    itemPurchasePriceVnd: 2400000,
    maintenanceCostsVnd: 180000,
    wearsToDate: 28,
    garmentType: 'Áo Khoác Blazer Linen Normandy',
    fabricCategory: 'LINEN_FLAX',
  });

  assert.equal(resultEarly.totalCostOfOwnershipVnd, 2580000);
  // CPW = 2,580,000 / 28 = 92,143 VND
  assert.equal(resultEarly.currentCostPerWearVnd, 92143);
  assert.equal(resultEarly.expectedTotalLifespanWears, 150); // Linen high tensile strength
  assert.equal(resultEarly.remainingProjectedWears, 122);
  assert.ok(resultEarly.projectedEndLifespanCPWVnd < 25000); // Long-term CPW drops under 25k
  assert.equal(resultEarly.circularityRecommendation.status, 'CONTINUE_WEARING');

  // Heavily worn garment reaching circular trade-in threshold: 95 wears of 120 expected for Merino Wool, low recent intensity
  const resultTradeInCandidate = calculateCostPerWearAmortization({
    itemPurchasePriceVnd: 1800000,
    maintenanceCostsVnd: 200000,
    wearsToDate: 95,
    garmentType: 'Áo Polo Dệt Kim Merino',
    fabricCategory: 'MERINO_WOOL',
    purchaseDateIso: new Date(Date.now() - 365 * 24 * 3600 * 1000 * 9).toISOString(), // 9 years ago -> ~0.8 wears/month
  });

  assert.equal(resultTradeInCandidate.circularityRecommendation.status, 'CIRCULAR_TRADE_IN_CANDIDATE');
  assert.ok(resultTradeInCandidate.circularityRecommendation.estimatedResidualTradeInVnd > 500000);
  assert.ok(resultTradeInCandidate.circularityRecommendation.rationale.includes('Trade-In'));

  // Optimal slow fashion investment: Silk dress worn 75 times with low CPW
  const resultOptimal = calculateCostPerWearAmortization({
    itemPurchasePriceVnd: 1500000,
    maintenanceCostsVnd: 100000,
    wearsToDate: 75,
    garmentType: 'Đầm Lụa Tơ Tằm Bảo Lộc',
    fabricCategory: 'MULBERRY_SILK',
  });

  assert.ok(resultOptimal.currentCostPerWearVnd <= 35000);
  assert.equal(resultOptimal.circularityRecommendation.status, 'OPTIMAL_SLOW_FASHION_INVESTMENT');
});

test('Atelier Hibernation Microclimate Mold Risk & Magnus-Tetens dew point engine verifies vault preservation', () => {
  // Tropical humid ambient: 31.5°C, 78% RH (severe mold risk in Vietnam monsoon)
  const ambientRisk = evaluateHibernationMicroclimateMoldRisk({
    ambientTempC: 31.5,
    relativeHumidityPct: 78,
    durationMonths: 6,
    fabricType: 'WOOL_CASHMERE',
    packagingMethod: 'UNPROTECTED_OPEN',
  });

  assert.ok(ambientRisk.ambientDewPointTempC > 26.0); // High dew point
  assert.ok(ambientRisk.vaporPressureHpa > 30.0);
  assert.ok(ambientRisk.ambientMoldRiskIndex > 0); // Risk detected
  assert.ok(ambientRisk.ambientTimeUntilGerminationDays !== null);

  // Atelier Vault Controlled Climate: 20°C, 48% RH
  assert.equal(ambientRisk.vaultPreservationMetrics.vaultTempC, 20.0);
  assert.equal(ambientRisk.vaultPreservationMetrics.vaultHumidityPct, 48.0);
  assert.equal(ambientRisk.vaultPreservationMetrics.vaultMoldRiskIndex, 0.0); // Zero mold risk
  assert.equal(ambientRisk.vaultPreservationMetrics.fiberLifespanMultiplier, 1.85); // 85% longer lifespan

  // 6 months service package: 240,000 VND fee, +100 Eco-Coins
  assert.equal(ambientRisk.serviceSummary.durationMonths, 6);
  assert.equal(ambientRisk.serviceSummary.preservationFeeVnd, 240000);
  assert.equal(ambientRisk.serviceSummary.ecoCoinsEarned, 100);
  assert.ok(ambientRisk.serviceSummary.securitySealCode.startsWith('HIB-VAULT-'));
  assert.ok(ambientRisk.serviceSummary.tamperEvidentTrackingHash.startsWith('SEAL-'));
  assert.ok(ambientRisk.careAdvice.includes('tuyết tùng'));
});

test('Proof-of-Delivery Security PIN & 3-Hub Weight Telemetry Engine detects package tampering', () => {
  // Case 1: Normal handover with correct PIN and intact weight
  const normalHandover = evaluateProofOfDeliverySecurityAndWeight({
    orderCode: 'NX-6B124663',
    shopId: 'shop-nep',
    dispatchWeightGrams: 450,
    hubWeightGrams: 452,
    handoverWeightGrams: 450,
    enteredSecurityPin: '584144', // Will be verified dynamically
  });

  // Calculate expected PIN
  let hash = 0;
  const str = 'NX-6B124663:shop-nep:NEXORA_PIN';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const expectedPin = ((Math.abs(hash) % 900000) + 100000).toString();

  assert.equal(normalHandover.expectedSecurityPin, expectedPin);
  assert.equal(normalHandover.maxWeightDeltaGrams, 2); // 452 - 450 = 2g <= 50g
  assert.equal(normalHandover.weightIntegrityPassed, true);
  assert.equal(normalHandover.anomalyAlert, 'NORMAL_WEIGHT_INTEGRITY');
  assert.ok(normalHandover.proofOfDeliveryHash.startsWith('POD-NX-6B124663-'));

  // Test with exact expected PIN
  const verifiedHandover = evaluateProofOfDeliverySecurityAndWeight({
    orderCode: 'NX-6B124663',
    shopId: 'shop-nep',
    dispatchWeightGrams: 450,
    hubWeightGrams: 452,
    handoverWeightGrams: 450,
    enteredSecurityPin: expectedPin,
  });
  assert.equal(verifiedHandover.pinVerified, true);

  // Case 2: Tampered package (weight drop of 120g > 50g tolerance)
  const tamperedPackage = evaluateProofOfDeliverySecurityAndWeight({
    orderCode: 'NX-6B124663',
    shopId: 'shop-nep',
    dispatchWeightGrams: 450,
    hubWeightGrams: 448,
    handoverWeightGrams: 320, // 448 - 320 = 128g delta!
    weightToleranceGrams: 50,
  });

  assert.equal(tamperedPackage.weightIntegrityPassed, false);
  assert.equal(tamperedPackage.anomalyAlert, 'TAMPER_SUSPECTED_OVER_TOLERANCE');
  assert.ok(tamperedPackage.advisory.includes('CẢNH BÁO AN NINH'));
});

test('Weather-Adaptive Reroute Buffer Engine calculates dynamic delay, bio-cassava packaging & compensation', () => {
  // Severe weather: 62 mm/h rain, 45 km/h wind, 68% flooding probability, 8.4 km route
  const stormReroute = calculateWeatherAdaptiveRerouteBuffer({
    precipitationRateMmH: 62,
    windSpeedKmh: 45,
    floodingProbabilityPct: 68,
    baseDistanceKm: 8.4,
    baseEtaMinutes: 35,
  });

  assert.equal(stormReroute.weatherSeverityLevel, 'TORRENTIAL_FLOOD');
  // Buffer is computed and bounded [15, 60] mins
  assert.ok(stormReroute.safetyBufferMinutes >= 25 && stormReroute.safetyBufferMinutes <= 55);
  assert.equal(stormReroute.adjustedEtaMinutes, 35 + stormReroute.safetyBufferMinutes);
  assert.equal(stormReroute.packagingProtectionTier, 'BIO_CASSAVA_3_LAYER');
  assert.equal(stormReroute.rescheduleCompensationCoins, 50);
  assert.ok(stormReroute.recommendedSlotReschedule !== null);

  // Favorable mild weather: 0 mm/h rain, 12 km/h wind, 0% flooding, 5 km route
  const clearReroute = calculateWeatherAdaptiveRerouteBuffer({
    precipitationRateMmH: 0,
    windSpeedKmh: 12,
    floodingProbabilityPct: 0,
    baseDistanceKm: 5.0,
    baseEtaMinutes: 25,
  });

  assert.equal(clearReroute.weatherSeverityLevel, 'LOW_FAVORABLE');
  assert.equal(clearReroute.packagingProtectionTier, 'STANDARD_KRAFT_ECO');
  assert.equal(clearReroute.rescheduleCompensationCoins, 0);
  assert.equal(clearReroute.recommendedSlotReschedule, null);
});

test('Digital Green-Mile EV Telemetry Passport calculates carbon abatement and issues cryptographic certificate', () => {
  // Route of 8.4 km by VinFast Feliz LFP
  const greenPassport = calculateGreenMileEvTelemetryPassport({
    orderCode: 'NX-6B124663',
    routeDistanceKm: 8.4,
    batterySocPct: 84,
    avgSpeedKmh: 28.5,
  });

  assert.equal(greenPassport.orderCode, 'NX-6B124663');
  assert.equal(greenPassport.routeDistanceKm, 8.4);
  // Baseline ICE emission: 8.4 * 0.085 = 0.714 kg
  assert.equal(greenPassport.iceBaselineEmissionKg, 0.714);
  // EV emission: 8.4 * (0.032 * 0.52) = 0.14 kg
  assert.equal(greenPassport.evEmissionKg, 0.14);
  // Net abated: 0.714 - 0.14 = 0.574 kg CO2e
  assert.equal(greenPassport.netCarbonAbatedKg, 0.574);
  assert.ok(greenPassport.equivalentTreeDays > 0);
  assert.equal(greenPassport.ecoCoinsMinted, 100);
  assert.ok(greenPassport.greenPassportCertificationCode.startsWith('#GREEN-MILE-VN'));
  assert.ok(greenPassport.cryptographicTelemetryHash.startsWith('EV-TELEMETRY-'));
});

test('Online Arbitration Dispute Engine strictly preserves escrow balance and allocates liability fairly', () => {
  // Case 1: Defective fabric proven by buyer with photo proof
  const defectiveDispute = arbitrateEscrowDisputeSettlement({
    disputeId: 'DISPUTE-8891',
    shopOrderId: 'shop-order-1',
    escrowHeldAmountVnd: 1250000,
    disputeReason: 'DEFECTIVE_FABRIC',
    buyerEvidenceProvided: true,
    sellerPreShipmentProof: false,
    transitWeightDiscrepancy: false,
  });

  assert.equal(defectiveDispute.disputeId, 'DISPUTE-8891');
  assert.equal(defectiveDispute.escrowHeldAmountVnd, 1250000);
  // Seller fault high -> buyer gets refunded majority
  assert.ok(defectiveDispute.refundToBuyerVnd > 1000000);
  assert.equal(defectiveDispute.exactEscrowPreservation, true);
  assert.equal(
    defectiveDispute.refundToBuyerVnd + defectiveDispute.disburseToSellerVnd,
    1250000
  );
  assert.ok(defectiveDispute.legalFrameworkArticle.includes('Luật Thương mại'));
  assert.ok(defectiveDispute.settlementContractCode.startsWith('DISPUTE-ARB-2026-'));

  // Case 2: Change of mind by buyer (buyer bears return and restocking fee)
  const changeOfMindDispute = arbitrateEscrowDisputeSettlement({
    disputeId: 'DISPUTE-8892',
    shopOrderId: 'shop-order-2',
    escrowHeldAmountVnd: 800000,
    disputeReason: 'CHANGE_OF_MIND',
    buyerEvidenceProvided: false,
    sellerPreShipmentProof: true,
    transitWeightDiscrepancy: false,
  });

  // Seller gets majority disbursement
  assert.ok(changeOfMindDispute.disburseToSellerVnd > changeOfMindDispute.refundToBuyerVnd);
  assert.equal(changeOfMindDispute.exactEscrowPreservation, true);
  assert.equal(
    changeOfMindDispute.refundToBuyerVnd + changeOfMindDispute.disburseToSellerVnd,
    800000
  );
});

test('Fabric Drape Rheology Radar calculates Cusick coefficient, Peirce flexural rigidity and dynamic fluidity', () => {
  // Case 1: Normandy Organic Linen (Grade A fluid drape)
  const linenDrape = calculateFabricDrapeRheologyRadar({
    materialName: '100% Linen hữu cơ Normandy',
    specimenDiameterMm: 300,
    supportDiscDiameterMm: 180,
    measuredGsm: 185,
    measuredBendingLengthCm: 2.1,
  });

  assert.equal(linenDrape.materialName, '100% Linen hữu cơ Normandy');
  assert.equal(linenDrape.drapeGrade, 'GRADE_A_FLUID');
  assert.equal(linenDrape.cusickDrapeCoefficientPct, 34.2);
  assert.equal(linenDrape.gsm, 185);
  // w = 18.5 mg/cm^2, c = 2.1 cm -> G = 18.5 * (2.1^3) * 0.001 = 0.17 mg.cm
  assert.equal(linenDrape.bendingRigidityMgCm, 0.17);
  assert.equal(linenDrape.thermalConductivityWmK, 0.038);
  assert.ok(linenDrape.dynamicFluidityScore > 75);
  assert.ok(linenDrape.dynamicWaveParams.nodeCount >= 5);
  assert.ok(linenDrape.advisory.includes('Hệ số rủ Cusick'));

  // Case 2: Heavy Denim (Grade C structured)
  const denimDrape = calculateFabricDrapeRheologyRadar({
    materialName: 'Denim Selvedge Thô 14oz',
    measuredGsm: 380,
    measuredBendingLengthCm: 4.2,
  });

  assert.equal(denimDrape.drapeGrade, 'GRADE_C_STRUCTURED');
  assert.equal(denimDrape.cusickDrapeCoefficientPct, 68.0);
  assert.ok(denimDrape.bendingRigidityMgCm > linenDrape.bendingRigidityMgCm);
  assert.ok(denimDrape.dynamicFluidityScore < linenDrape.dynamicFluidityScore);
});

test('Silhouette Anthropometric 2D Simulator accurately predicts ease margins, sizing and hemline drop', () => {
  // User with Athletic archetype: 166cm, 52kg, 86-66-92
  const fitResult = calculateSilhouetteAnthropometricFit({
    userHeightCm: 166,
    userWeightKg: 52,
    userChestCm: 86,
    userWaistCm: 66,
    userHipCm: 92,
    fitPreference: 'REGULAR',
  });

  assert.equal(fitResult.detectedArchetype, 'ATHLETIC');
  assert.equal(fitResult.recommendedSize, 'M');
  assert.ok(fitResult.overallMatchScore >= 85);
  assert.equal(fitResult.comfortVerdict, 'OPTIMAL_EASE');
  // For size M (chest 94, waist 74, hip 100):
  assert.equal(fitResult.easeClearanceVector.chestEaseCm, 8.0);
  assert.equal(fitResult.easeClearanceVector.waistEaseCm, 8.0);
  assert.equal(fitResult.easeClearanceVector.hipEaseCm, 8.0);
  assert.ok(fitResult.seamStrainRiskIndexPct < 10);
  assert.equal(fitResult.hemlineDropPrediction.predictedHemlinePosition, 'AT_KNEE');

  // Case with tight / negative ease triggering seam bursting risk
  const tightResult = calculateSilhouetteAnthropometricFit({
    userHeightCm: 175,
    userWeightKg: 95,
    userChestCm: 110,
    userWaistCm: 96,
    userHipCm: 118,
    fitPreference: 'REGULAR',
  });

  // User is larger than all standard sizes (max size XL chest 106 < 110)
  assert.equal(tightResult.comfortVerdict, 'SEAM_BURSTING_RISK');
  assert.ok(tightResult.seamStrainRiskIndexPct > 70);
});

test('Bespoke Preorder Escrow Queue validates monograms, enforces 30% deposit and limits weekly capacity', () => {
  const bespoke = calculateBespokePreorderEscrowQueue({
    productId: 'prod-dress-lin-01',
    productName: 'Đầm Maxi Linen Pháp Dáng Rủ',
    basePriceVnd: 2450000,
    selectedSize: 'M',
    monogramInput: 'n.x.',
    selectedLining: 'SILK_JACQUARD',
    currentActiveQueueCount: 6,
    weeklyCap: 15,
  });

  assert.equal(bespoke.sanitizedMonogram, 'N.X.');
  assert.equal(bespoke.liningSurchargeVnd, 150000);
  // Total = 2,450,000 + 150,000 = 2,600,000 VND
  assert.equal(bespoke.totalBespokePriceVnd, 2600000);
  // 30% deposit = 780,000 VND
  assert.equal(bespoke.depositEscrow30PercentVnd, 780000);
  // Remaining = 1,820,000 VND
  assert.equal(bespoke.remainingBalance70PercentVnd, 1820000);
  assert.equal(bespoke.exactEscrowPreservation, true);
  assert.equal(bespoke.depositEscrow30PercentVnd + bespoke.remainingBalance70PercentVnd, bespoke.totalBespokePriceVnd);
  assert.equal(bespoke.assignedQueuePosition, 7);
  assert.equal(bespoke.weeklyCapacityLimit, 15);
  assert.equal(bespoke.queueStatus, 'QUEUE_RESERVED');
  assert.equal(bespoke.artisanalMilestones.length, 5);
  assert.ok(bespoke.bespokeRegistrationCode.startsWith('#ATELIER-BESPOKE-'));
});

test('Material Digital Product Passport (DPP) generates ISO 14040 LCA footprint and SHA-256 seal', () => {
  const dpp = calculateMaterialDppEcoProvenance({
    productId: 'prod-dress-lin-01',
    productName: 'Đầm Maxi Linen Pháp Dáng Rủ',
    productSlug: 'dam-maxi-linen-phap-dang-ru',
    shopId: 'shop-nep',
    shopName: 'NÉP Studio',
    materialString: '100% Linen hữu cơ Normandy dệt mộc',
    garmentWeightGrams: 420,
    originLocation: 'Normandy (Cộng hòa Pháp) & Xưởng thủ công NÉP Atelier (Hà Nội)',
  });

  assert.ok(dpp.certificateCode.startsWith('NX-DPP-'));
  assert.equal(dpp.productSlug, 'dam-maxi-linen-phap-dang-ru');
  // Weight = 0.42kg * 11.4 = 4.8 kg CO2e saved
  assert.equal(dpp.ecoFootprint.carbonSavedKg, 4.8);
  // Water = 0.42kg * 4400 = 1848 -> 1848 L saved
  assert.equal(dpp.ecoFootprint.waterSavedLiters, 1848);
  assert.equal(dpp.ecoFootprint.naturalDye, true);
  assert.equal(dpp.ecoFootprint.microplasticFree, true);
  assert.equal(dpp.ecoFootprint.lcaStandardCompliance, 'ISO 14040/14044');
  assert.equal(dpp.totalCraftHours, 34);
  assert.equal(dpp.artisans.length, 3);
  assert.ok(dpp.digitalSignature.startsWith('0x'));
  assert.equal(dpp.digitalSignature.length, 42);
});

test('Toile Posture Correction calculates biomechanical adjustments and validates French seam ease', () => {
  // Case 1: Sloping shoulders + Stooped posture
  const stoopedSloping = calculateToilePostureCorrection({
    orderId: 'BESPOKE-9901',
    shoulderSlope: 'SLOPING',
    postureBalance: 'STOOPED',
    measuredChestCm: 88,
    measuredWaistCm: 68,
    easeAllowanceBustCm: 5.0,
    easeAllowanceWaistCm: 4.0,
  });

  assert.equal(stoopedSloping.orderId, 'BESPOKE-9901');
  assert.equal(stoopedSloping.shoulderSlope, 'SLOPING');
  assert.equal(stoopedSloping.postureBalance, 'STOOPED');
  // Stooped: back +1.5cm, front -1.0cm, shoulder seam forward +1.0cm
  assert.equal(stoopedSloping.deltaBackLengthCm, 1.5);
  assert.equal(stoopedSloping.deltaFrontLengthCm, -1.0);
  assert.equal(stoopedSloping.deltaShoulderSeamCm, 1.0);
  // Sloping: armhole depth +1.2cm
  assert.equal(stoopedSloping.deltaArmholeDepthCm, 1.2);
  assert.equal(stoopedSloping.frenchSeamSafetyPassed, true);
  assert.ok(stoopedSloping.toileApprovalHash.startsWith('TOILE-POSTURE-SIG-'));

  // Case 2: Insufficient ease failing French seam safety
  const unsafeEase = calculateToilePostureCorrection({
    orderId: 'BESPOKE-9902',
    shoulderSlope: 'STANDARD',
    postureBalance: 'NORMAL',
    measuredChestCm: 88,
    measuredWaistCm: 68,
    easeAllowanceBustCm: 2.5,
    easeAllowanceWaistCm: 2.0,
  });

  assert.equal(unsafeEase.frenchSeamSafetyPassed, false);
});

test('Fabric Cutting Marker Yield Optimizer calculates zero-waste yield, shrinkage buffer and remnant upcycling', () => {
  const pieces = [
    { pieceName: 'Thân trước', widthCm: 65, lengthCm: 110, quantity: 2 },
    { pieceName: 'Thân sau', widthCm: 68, lengthCm: 112, quantity: 1 },
    { pieceName: 'Tay áo', widthCm: 45, lengthCm: 60, quantity: 2 },
    { pieceName: 'Cổ & Ve áo', widthCm: 25, lengthCm: 85, quantity: 2 },
  ];

  const marker = calculateCuttingMarkerYield({
    ticketCode: 'TICKET-CUT-8821',
    fabricBoltWidthCm: 140,
    allocatedBoltLengthMeters: 2.6,
    fabricType: '100% Linen hữu cơ Normandy',
    patternPieces: pieces,
    preshrinkDecatizingWash: true,
  });

  assert.equal(marker.totalBoltAreaM2, 3.64);
  assert.equal(marker.patternNetAreaM2, 3.157);
  assert.equal(marker.markerEfficiencyYieldPct, 86.7);
  assert.equal(marker.shrinkageBufferAllowanceCm, 10.4);
  assert.equal(marker.usableRemnantAreaM2, 0.483);
  assert.equal(marker.remnantUpcyclingRecommendation, 'SCRUNCHIE_OR_POCKET_BAG');
  assert.ok(marker.cuttingSafetyCode.startsWith('#MARKER-'));
});

test('Home Fitting Concierge Valet Dispatcher forecasts travel ETA, EV emission savings and conversion probability', () => {
  const dispatch = calculateFittingValetDispatch({
    fittingId: 'FITTING-VIP-7701',
    customerName: 'Hoàng Kim Yến',
    customerAddress: 'Phố Phan Đình Phùng, Ba Đình, Hà Nội',
    valetStylistName: 'Trần Hoàng My',
    scheduledTimeIso: '2026-11-27T14:00:00.000Z',
    distanceKm: 7.5,
  });

  assert.equal(dispatch.valetStylistName, 'Trần Hoàng My');
  assert.equal(dispatch.distanceKm, 7.5);
  assert.equal(dispatch.travelDurationMinutes, 20);
  assert.equal(dispatch.fittingWindowMinutes, 45);
  assert.equal(dispatch.bufferMinutes, 15);
  assert.equal(dispatch.evEmissionSavedKg, 2.16);
  assert.equal(dispatch.transportMode, 'VINFAST_EV_BIKE');
  assert.equal(dispatch.historicalConversionProbabilityPct, 82);
  assert.ok(dispatch.valetDispatchManifestCode.startsWith('#VALET-'));
});

test('Escrow 3-Tier Settlement preserves balance invariants and automatically withholds 1.5% TT 40/2021 tax', () => {
  const settlement = calculateEscrow3TierSettlement({
    shopId: 'shop-nep',
    shopName: 'NÉP Studio',
    availableBalanceVnd: 2500000,
    heldEscrow7DayVnd: 5000000,
    disputedBalanceVnd: 1200000,
    requestedPayoutAmountVnd: 2000000,
    bankAccount: '0988776655',
    bankCode: 'MBBANK',
    accountHolder: 'NGUYEN THI MAI',
  });

  assert.equal(settlement.totalLedgerBalanceVnd, 8700000);
  assert.equal(settlement.threeTierInvariantPreserved, true);
  assert.equal(settlement.payoutStatus, 'APPROVED_FOR_DISBURSEMENT');
  assert.equal(settlement.payoutAmountVnd, 2000000);
  assert.equal(settlement.statutoryVatWithheld1PctVnd, 20000);
  assert.equal(settlement.statutoryPitWithheldHalfPctVnd, 10000);
  assert.equal(settlement.totalTaxWithheldVnd, 30000);
  assert.equal(settlement.netDisbursedVnd, 1970000);
  assert.equal(settlement.exactPayoutConservation, true);
  assert.equal(settlement.netDisbursedVnd + settlement.totalTaxWithheldVnd, settlement.payoutAmountVnd);
  assert.ok(settlement.eTaxInvoiceCode.startsWith('ETAX-TT40-2026-'));
  assert.ok(settlement.napasTransactionRef.startsWith('#NAPAS-OUT-'));
});

test('Circuit Breaker Volatility Detector identifies price anomalies, flash crashes and trips circuit breaker', () => {
  // Normal stable case: +5% price change
  const normal = evaluateCircuitBreakerVolatility({
    productId: 'prod-001',
    productName: 'Áo Sơ Mi Linen Hữu Cơ',
    categorySlug: 'ao-so-mi',
    currentPriceVnd: 1000000,
    newPriceVnd: 1050000,
    categoryMedianPriceVnd: 1000000,
  });
  assert.equal(normal.circuitBreakerTripped, false);
  assert.equal(normal.decisionVerdict, 'NORMAL_STABLE');
  assert.equal(normal.recommendedAction, 'ALLOW_UPDATE');

  // Flash crash case: -70% price drop
  const crash = evaluateCircuitBreakerVolatility({
    productId: 'prod-002',
    productName: 'Đầm Lụa Tơ Tằm Thêu Tay',
    categorySlug: 'dam-vay',
    currentPriceVnd: 2000000,
    newPriceVnd: 600000,
    categoryMedianPriceVnd: 1850000,
  });
  assert.equal(crash.circuitBreakerTripped, true);
  assert.equal(crash.decisionVerdict, 'CIRCUIT_BREAKER_TRIPPED');
  assert.equal(crash.recommendedAction, 'IMMEDIATE_QUARANTINE_HIDE');
  assert.ok(crash.incidentTrackingCode?.startsWith('#CIRCUIT-HALT-'));

  // Hyper-inflation spike case: +300% price spike
  const spike = evaluateCircuitBreakerVolatility({
    productId: 'prod-003',
    productName: 'Áo Dài Di Sản Tơ Chu',
    categorySlug: 'ao-dai',
    currentPriceVnd: 1000000,
    newPriceVnd: 4000000,
    categoryMedianPriceVnd: 1850000,
  });
  assert.equal(spike.circuitBreakerTripped, true);
  assert.equal(spike.decisionVerdict, 'CIRCUIT_BREAKER_TRIPPED');
  assert.equal(spike.recommendedAction, 'IMMEDIATE_QUARANTINE_HIDE');

  // Warning manual review case: +40% increase
  const warning = evaluateCircuitBreakerVolatility({
    productId: 'prod-004',
    productName: 'Khăn Choàng Đũi Nam Cao',
    categorySlug: 'phu-kien',
    currentPriceVnd: 1000000,
    newPriceVnd: 1400000,
    categoryMedianPriceVnd: 1000000,
  });
  assert.equal(warning.circuitBreakerTripped, false);
  assert.equal(warning.decisionVerdict, 'WARNING_MANUAL_REVIEW');
  assert.equal(warning.recommendedAction, 'FLAG_FOR_AUDIT');
});

test('Escrow Double-Entry Solvency Reconciler validates multi-shop liability solvency with zero fractional drift', () => {
  const shopSummaries = [
    {
      shopId: 'shop-nep',
      shopName: 'NÉP Atelier',
      availableBalanceVnd: 35000000,
      held7DayEscrowVnd: 50000000,
      disputedReserveVnd: 5000000,
    },
    {
      shopId: 'shop-to-chu',
      shopName: 'Tơ Chu Heritage',
      availableBalanceVnd: 20000000,
      held7DayEscrowVnd: 30000000,
      disputedReserveVnd: 0,
    },
  ];

  // Total shop liabilities = 90M + 50M = 140M. Affiliate hold = 5M. Tax = 2.1M. Total = 147.1M.
  // Bank reserve = 150M.
  const audit = reconcileEscrowMarketplaceSolvency({
    bankEscrowReserveBalanceVnd: 150000000,
    shopLedgerSummaries: shopSummaries,
    unreleasedAffiliateHoldVnd: 5000000,
    pendingTaxWithholdingVnd: 2100000,
  });

  assert.equal(audit.totalMarketplaceLiabilitiesVnd, 147100000);
  assert.equal(audit.fractionalDriftVnd, 2900000);
  assert.equal(audit.isFullySolvent, true);
  assert.ok(audit.solvencyRatioPct > 100);
  assert.equal(audit.shopBreakdownCount, 2);
  assert.ok(audit.dailySolvencyAttestationCode.startsWith('#SOLVENCY-AUDIT-'));

  // Insolvent scenario: Bank reserve less than liabilities
  const insolvent = reconcileEscrowMarketplaceSolvency({
    bankEscrowReserveBalanceVnd: 100000000,
    shopLedgerSummaries: shopSummaries,
    unreleasedAffiliateHoldVnd: 5000000,
    pendingTaxWithholdingVnd: 2100000,
  });
  assert.equal(insolvent.isFullySolvent, false);
  assert.ok(insolvent.fractionalDriftVnd < 0);
  assert.ok(insolvent.solvencyRatioPct < 100);
});

test('Circular EPR Textile Quota Auditor computes effective recovery mass and Decree 08/2022/ND-CP compliance', () => {
  // Virgin fabric 10,000 kg. 15% mandated rate = 1,500 kg.
  // Recovered: Upcycling 500kg (*1.2 = 600), Re-Loved 800kg (*1.0 = 800), Bio-Felt 200kg (*0.8 = 160).
  // Total effective = 600 + 800 + 160 = 1,560 kg. Fulfillment = 104.0% >= 100%.
  const eprResult = calculateCircularEprTextileQuota({
    auditYear: 2026,
    totalVirginFabricWeightKg: 10000,
    statutoryMandatedRatePct: 15.0,
    recoveredUpcyclingKg: 500,
    recoveredReLovedKg: 800,
    recoveredBioFeltKg: 200,
  });

  assert.equal(eprResult.auditYear, 2026);
  assert.equal(eprResult.mandatedRecoveryTargetKg, 1500.0);
  assert.equal(eprResult.effectiveCircularRecoveredKg, 1560.0);
  assert.equal(eprResult.realizedEprFulfillmentPct, 104.0);
  assert.equal(eprResult.isCompliant, true);
  assert.equal(eprResult.deficitOrSurplusKg, 60.0);
  assert.ok(eprResult.eprCertificateCode.startsWith('#EPR-VN-2026-'));

  // Deficit scenario: Total effective = 240 + 400 + 80 = 720 kg < 1500 kg
  const deficit = calculateCircularEprTextileQuota({
    auditYear: 2026,
    totalVirginFabricWeightKg: 10000,
    recoveredUpcyclingKg: 200,
    recoveredReLovedKg: 400,
    recoveredBioFeltKg: 100,
  });
  assert.equal(deficit.isCompliant, false);
  assert.ok(deficit.realizedEprFulfillmentPct < 100);
  assert.ok(deficit.deficitOrSurplusKg < 0);
});

test('Artisan QA Fair Wage Index evaluates 8-point physical inspection and living wage threshold ratio', () => {
  const perfectInspection = {
    grainlineAlignmentPassed: true,
    frenchSeamRolledPassed: true,
    shellButtonCrossKnotPassed: true,
    monogramTensionPassed: true,
    steamDecatizingPassed: true,
    liningEasePassed: true,
    collarRollHuggingPassed: true,
    hemDropBalancePassed: true,
  };

  // 8/8 passed, 20 hours, 3,000,000 VND compensation (150,000 VND/h vs 48,000 regional living wage => 3.13x)
  const premium = evaluateArtisanQaFairWage({
    bespokeOrderId: 'BESPOKE-AO-DAI-99',
    inspectorName: 'Đặng Ngọc Lan',
    eightPointInspection: perfectInspection,
    artisanCraftHours: 20,
    artisanCompensationVnd: 3000000,
    regionalLivingWageHourlyVnd: 48000,
  });

  assert.equal(premium.inspectionScore, 8);
  assert.equal(premium.qaGrade, 'PREMIUM_A_PLUS');
  assert.equal(premium.certifiedForDelivery, true);
  assert.equal(premium.artisanHourlyRateVnd, 150000);
  assert.equal(premium.fairWageIndexRatio, 3.13);
  assert.equal(premium.isFairWageCertified, true);
  assert.ok(premium.qualityCertificateSerial.startsWith('NX-QA-BESPOKE-'));

  // Rework required: 4/8 passed
  const rework = evaluateArtisanQaFairWage({
    bespokeOrderId: 'BESPOKE-AO-DAI-101',
    inspectorName: 'Đặng Ngọc Lan',
    eightPointInspection: {
      ...perfectInspection,
      grainlineAlignmentPassed: false,
      frenchSeamRolledPassed: false,
      monogramTensionPassed: false,
      collarRollHuggingPassed: false,
    },
    artisanCraftHours: 12,
    artisanCompensationVnd: 600000, // 50,000 VND/h vs 48,000 => 1.04x (< 2.50x)
  });

  assert.equal(rework.inspectionScore, 4);
  assert.equal(rework.qaGrade, 'REWORK_REQUIRED');
  assert.equal(rework.certifiedForDelivery, false);
  assert.equal(rework.isFairWageCertified, false);
});

test('BM25 Hybrid Fabric Retrieval evaluates weighted Okapi BM25 and natural fiber bonus', () => {
  // Case 1: High relevance match for slow fashion natural linen shirt
  const linenDoc = {
    id: 'prod-linen-01',
    title: 'Áo Sơ Mi Linen Normandy Cổ Trụ',
    material: '100% Linen Hữu Cơ Tự Nhiên Normandy',
    description: 'Dệt thủ công từ sợi lanh mộc nguyên bản, thoáng mát cho khí hậu nhiệt đới.',
  };
  const highMatch = evaluateBm25FabricRetrieval({
    query: 'sơ mi linen thoáng mát',
    document: linenDoc,
  });

  assert.equal(highMatch.documentId, 'prod-linen-01');
  assert.ok(highMatch.bm25Score > 0);
  assert.ok(highMatch.fabricBonusScore >= 12.5);
  assert.ok(highMatch.totalCompositeScore >= 50);
  assert.equal(highMatch.relevanceTier, 'HIGH_RELEVANCE');
  assert.ok(highMatch.matchedTokens.includes('linen') || highMatch.matchedTokens.includes('sơ'));

  // Case 2: Irrelevant query
  const noMatch = evaluateBm25FabricRetrieval({
    query: 'tai nghe bluetooth không dây',
    document: linenDoc,
  });
  assert.equal(noMatch.bm25Score, 0);
  assert.equal(noMatch.fabricBonusScore, 0);
  assert.equal(noMatch.totalCompositeScore, 0);
  assert.equal(noMatch.relevanceTier, 'NO_MATCH');
});

test('Palette Chromatic Distance Matcher calculates CIEDE2000 delta-E distance to artisan color family anchors', () => {
  // Case 1: SAND anchor matching candidate beige/linen hex #dfd4bd
  const sandMatch = evaluatePaletteChromaticMatch({
    targetPaletteFamily: 'SAND',
    candidateHexColors: ['#dfd4bd', '#b89f82'],
  });
  assert.equal(sandMatch.targetPaletteFamily, 'SAND');
  assert.equal(sandMatch.bestMatchedHex, '#dfd4bd');
  assert.ok(sandMatch.minDeltaE00 <= 5.0);
  assert.equal(sandMatch.isChromaticMatch, true);
  assert.ok(sandMatch.chromaticConfidencePct >= 90);

  // Case 2: INDIGO anchor matching deep blue hex #1e3a5f
  const indigoMatch = evaluatePaletteChromaticMatch({
    targetPaletteFamily: 'INDIGO',
    candidateHexColors: ['#1e3a5f', '#0f172a'],
  });
  assert.equal(indigoMatch.targetPaletteFamily, 'INDIGO');
  assert.equal(indigoMatch.bestMatchedHex, '#1e3a5f');
  assert.equal(indigoMatch.isChromaticMatch, true);

  // Case 3: Completely discordant color (Bright Red #ef4444 compared to INDIGO)
  const redMismatch = evaluatePaletteChromaticMatch({
    targetPaletteFamily: 'INDIGO',
    candidateHexColors: ['#ef4444'],
  });
  assert.ok(redMismatch.minDeltaE00 > 30.0);
  assert.equal(redMismatch.isChromaticMatch, false);
});

test('Fabric Weight GSM Aerodynamics classifies surface density, air permeability and insulation', () => {
  // Case 1: Light Tropical Silk (< 150 GSM)
  const lightSilk = evaluateFabricWeightGsmAerodynamics({
    materialName: '100% Lụa Habotai Bảo Lộc',
    targetGsmTier: 'LIGHT',
  });
  assert.equal(lightSilk.assignedGsmTier, 'LIGHT');
  assert.equal(lightSilk.isTierMatched, true);
  assert.equal(lightSilk.breathabilityAirPermeabilityCm3, 145);
  assert.equal(lightSilk.thermalInsulationRctM2KW, 0.035);
  assert.equal(lightSilk.recommendedSeason, 'SUMMER_TROPICAL');

  // Case 2: Heavy Structural Wool (> 260 GSM)
  const heavyWool = evaluateFabricWeightGsmAerodynamics({
    materialName: 'Dạ Len Ý Pha Lụa Cao Cấp',
    targetGsmTier: 'HEAVY',
  });
  assert.equal(heavyWool.assignedGsmTier, 'HEAVY');
  assert.equal(heavyWool.isTierMatched, true);
  assert.equal(heavyWool.breathabilityAirPermeabilityCm3, 25);
  assert.equal(heavyWool.thermalInsulationRctM2KW, 0.145);
  assert.equal(heavyWool.recommendedSeason, 'AUTUMN_WINTER_MONSOON');

  // Case 3: Medium All-Season Linen (150 - 260 GSM)
  const mediumLinen = evaluateFabricWeightGsmAerodynamics({
    materialName: 'Linen Normandy 195 GSM',
    specifiedGsm: 195,
    targetGsmTier: 'MEDIUM',
  });
  assert.equal(mediumLinen.assignedGsmTier, 'MEDIUM');
  assert.equal(mediumLinen.isTierMatched, true);
  assert.equal(mediumLinen.recommendedSeason, 'ALL_SEASON_FOUR_SEASONS');
});

test('Faceted Entropy Diversity Reranker maximizes marginal relevance and shop Shannon entropy', () => {
  // Single shop monopolizing top 4 positions
  const items = [
    { id: 'item-1', title: 'Áo 1', shopId: 'shop-nep', shopName: 'NÉP', categorySlug: 'ao', material: 'Linen', initialScore: 95 },
    { id: 'item-2', title: 'Áo 2', shopId: 'shop-nep', shopName: 'NÉP', categorySlug: 'ao', material: 'Linen', initialScore: 92 },
    { id: 'item-3', title: 'Áo 3', shopId: 'shop-nep', shopName: 'NÉP', categorySlug: 'ao', material: 'Linen', initialScore: 89 },
    { id: 'item-4', title: 'Áo 4', shopId: 'shop-nep', shopName: 'NÉP', categorySlug: 'ao', material: 'Linen', initialScore: 86 },
    { id: 'item-5', title: 'Váy 1', shopId: 'shop-tochu', shopName: 'Tơ Chu', categorySlug: 'vay', material: 'Lụa', initialScore: 85 },
    { id: 'item-6', title: 'Khăn 1', shopId: 'shop-namcao', shopName: 'Đũi Nam Cao', categorySlug: 'phu-kien', material: 'Đũi', initialScore: 82 },
  ];

  const reranked = rerankFacetedEntropyDiversity({
    rankedItems: items,
    diversityLambda: 0.70,
    maxShopMonopolyLimit: 2,
  });

  assert.equal(reranked.rerankedItems.length, 6);
  assert.ok(reranked.shannonShopDiversityEntropy > 1.0);
  assert.ok(reranked.maxShopConcentrationPct <= 70);

  // The 3rd item from shop-nep should be penalized so alternative shops advance
  const top4Shops = reranked.rerankedItems.slice(0, 4).map(i => i.shopId);
  assert.ok(top4Shops.includes('shop-tochu') || top4Shops.includes('shop-namcao'));
});

test('Editorial Trend Momentum Forecaster models Holt exponential smoothing and runway multiplier', () => {
  // Trend 1: Viral Quiet Luxury momentum
  const quietLuxury = forecastEditorialTrendMomentum({
    trendId: 'trend-01',
    trendName: 'Quiet Luxury & Phom Rộng Phóng Khoáng',
    historicalSearchesPerWeek: [120, 160, 210, 290],
    runwayMentionCount: 18,
    seasonPeriod: 'SS_2026',
  });

  assert.equal(quietLuxury.trendId, 'trend-01');
  assert.ok(quietLuxury.smoothedBaseVelocity > 200);
  assert.ok(quietLuxury.projectedGrowthPct >= 100);
  assert.equal(quietLuxury.trendRankTier, 'TOP_VIRAL_MOMENTUM');
  assert.equal(quietLuxury.editorialTag, 'Thịnh hành nhất');
  assert.equal(quietLuxury.isHotTrending, true);

  // Trend 2: Steady favorite (moderate acceleration)
  const earthTone = forecastEditorialTrendMomentum({
    trendId: 'trend-03',
    trendName: 'Tone Màu Đất & Phong Cách Sartorial',
    historicalSearchesPerWeek: [100, 105, 110, 115],
    runwayMentionCount: 3,
  });

  assert.ok(earthTone.projectedGrowthPct > 20);
  assert.ok(['FAST_ACCELERATING', 'STEADY_FAVORITE'].includes(earthTone.trendRankTier));
});

test('Capsule Harmony Score & Bundle Pricing preserves exact Dong via Hamilton-Hare with >= 97% harmony', () => {
  const normandyPieces = [
    {
      category: 'TOP' as const,
      name: 'Áo sơ mi cổ trụ Premium Linen',
      material: '100% Linen',
      hexColor: '#dfd4bd',
      originalPriceVnd: 420000,
    },
    {
      category: 'BOTTOM' as const,
      name: 'Quần short linen mộc tự nhiên',
      material: '100% Linen',
      hexColor: '#b89f82',
      originalPriceVnd: 390000,
    },
    {
      category: 'OUTER' as const,
      name: 'Áo khoác safari kaki đũi',
      material: 'Kaki Đũi',
      hexColor: '#a7654b',
      originalPriceVnd: 650000,
    },
  ];

  const harmony = calculateCapsuleHarmonyAndPricing({
    capsuleId: 'capsule-normandy',
    capsuleName: 'The Normandy Summer Edit',
    pieces: normandyPieces,
    bundleDiscountRatePct: 10.0,
  });

  assert.equal(harmony.capsuleId, 'capsule-normandy');
  assert.ok(harmony.compositeHarmonyScore >= 95.0);
  assert.ok(['PERFECT_TONE_SUR_TONE', 'HIGH_SARTORIAL_HARMONY'].includes(harmony.harmonyGrade));
  assert.equal(harmony.originalTotalVnd, 1460000);
  assert.equal(harmony.discountAmountVnd, 146000);
  assert.equal(harmony.comboBundleTotalVnd, 1314000);
  assert.equal(harmony.exactDongPreservation, true);

  // Check sum of itemized allocations equals bundle total
  const sumAllocated = harmony.itemizedAllocations.reduce((a, b) => a + b, 0);
  assert.equal(sumAllocated, harmony.comboBundleTotalVnd);
});

test('Heritage Artisan Provenance Index evaluates origin prestige, fiber purity and fair wage certification', () => {
  // Masterpiece: 100% Bảo Lộc Silk, 24 hours handcraft, 3.2x fair wage
  const silkGown = evaluateHeritageProvenanceIndex({
    productId: 'prod-silk-gown-01',
    productName: 'Đầm Lụa Tơ Tằm Bảo Lộc Thủ Công',
    geographicalOrigin: 'BAO_LOC_VIETNAM',
    naturalFiberPurityPct: 100,
    handcraftedAtelierHours: 24,
    fairWageRatio: 3.2,
    botanicalOrEcoDye: true,
  });

  assert.ok(silkGown.provenanceIndexScore >= 90);
  assert.equal(silkGown.authenticityTier, 'MASTERPIECE_HERITAGE');
  assert.equal(silkGown.slowFashionPurityCertified, true);
  assert.ok(silkGown.ecoProvenanceHash.startsWith('#PROV-NX-'));

  // Standard craft with blended synthetic (80% purity, 1.5x wage)
  const blendedItem = evaluateHeritageProvenanceIndex({
    productId: 'prod-blend-02',
    productName: 'Áo Khoác Pha Polyester',
    geographicalOrigin: 'Y_ITALY',
    naturalFiberPurityPct: 80,
    handcraftedAtelierHours: 8,
    fairWageRatio: 1.5,
  });

  assert.ok(blendedItem.provenanceIndexScore < 80);
  assert.equal(blendedItem.slowFashionPurityCertified, false);
});

test('Curated Showcase Cocktail Ranker optimizes Thompson Sampling Multi-Armed Bandit discovery feed', () => {
  const candidates = [
    { id: 'prod-1', name: 'Áo Măng Tô Dạ Wool', organicImpressions: 1200, clicks: 150, purchases: 35, isHeritageCraft: true, stockOnHand: 20 },
    { id: 'prod-2', name: 'Sơ Mi Linen Normandy', organicImpressions: 900, clicks: 110, purchases: 28, isHeritageCraft: true, stockOnHand: 15 },
    { id: 'prod-3', name: 'Quần Tây Xếp Ly Ý', organicImpressions: 600, clicks: 65, purchases: 12, isHeritageCraft: false, stockOnHand: 10 },
    { id: 'prod-4', name: 'Áo Choàng Đũi Tơ Tằm Mới', organicImpressions: 150, clicks: 20, purchases: 1, isHeritageCraft: true, stockOnHand: 5 },
    { id: 'prod-5', name: 'Khăn Lụa Vuông Cung Đình', organicImpressions: 300, clicks: 40, purchases: 6, isHeritageCraft: true, stockOnHand: 8 },
  ];

  const cocktail = rankCuratedShowcaseCocktail({
    candidateProducts: candidates,
    explorationEpsilon: 0.15,
    topShowcaseLimit: 4,
  });

  assert.equal(cocktail.curatedShowcaseIds.length, 4);
  assert.ok(cocktail.averageThompsonUtility > 0.5);
  assert.ok(cocktail.selectionBreakdown.some(s => s.selectionReason === 'PROVEN_HERITAGE_LEADER'));
  assert.ok(cocktail.curatedShowcaseIds.includes('prod-1') || cocktail.curatedShowcaseIds.includes('prod-2'));
});

test('Password Entropy & Memory-Hard KDF Policy correctly evaluates Shannon bits and rehash indicators', () => {
  // 1. Weak password
  const weak = evaluatePasswordEntropyAndKdfPolicy({ password: 'pass', minEntropyBits: 50 });
  assert.equal(weak.strengthTier, 'VERY_WEAK');
  assert.equal(weak.isAcceptable, false);
  assert.ok(weak.entropyBits < 30);

  // 2. High entropy slow fashion artisan password
  const strong = evaluatePasswordEntropyAndKdfPolicy({
    password: 'Nexora@HauteCouture2026!Silk',
    existingHash: 'deadbeef16bytesalt:deadbeef64bytekey',
    minEntropyBits: 60,
  });

  assert.equal(strong.strengthTier, 'VERY_STRONG');
  assert.equal(strong.isAcceptable, true);
  assert.ok(strong.entropyBits > 100);
  assert.equal(strong.charsetPoolSize, 95);
  assert.equal(strong.needsRehash, true); // Legacy salt:key needs rehash to modern scrypt/argon2id
  assert.equal(strong.kdfParameters.cost, 16384);
});

test('Cryptographic Session Token Rotation enforces sliding window and revokes family on replay attacks', () => {
  const token1 = 'tok_alpha_random_secret_32bytes_value_1';
  const token2 = 'tok_alpha_random_secret_32bytes_value_2';
  const hash1 = Buffer.from(token1).toString('hex').slice(0, 64);
  const hash2 = Buffer.from(token2).toString('hex').slice(0, 64);

  // We compute actual SHA-256 for test accuracy
  const { createHash } = require('node:crypto');
  const realHash1 = createHash('sha256').update(token1).digest('hex');
  const realHash2 = createHash('sha256').update(token2).digest('hex');

  const family = [
    { sessionId: 'sess-01', tokenHash: realHash1, sequenceNumber: 1, revoked: true, expiresAt: new Date(Date.now() + 86400000) },
    { sessionId: 'sess-02', tokenHash: realHash2, sequenceNumber: 2, revoked: false, expiresAt: new Date(Date.now() + 86400000) },
  ];

  // 1. Legitimate rotation of active token (Seq 2 -> Seq 3)
  const rotationSuccess = rotateSessionSlidingWindowSecurity({
    incomingToken: token2,
    tokenFamily: family,
  });

  assert.equal(rotationSuccess.status, 'ROTATION_SUCCESS');
  assert.equal(rotationSuccess.newSequenceNumber, 3);
  assert.equal(rotationSuccess.replayAttackDetected, false);
  assert.ok(rotationSuccess.newToken);
  assert.ok(rotationSuccess.newExpiresAt);

  // 2. Replay attack: Adversary sends old consumed token1 (Seq 1 < Max Seq 2)
  const replayAttack = rotateSessionSlidingWindowSecurity({
    incomingToken: token1,
    tokenFamily: family,
  });

  assert.equal(replayAttack.status, 'REPLAY_ATTACK_REVOKED');
  assert.equal(replayAttack.replayAttackDetected, true);
  assert.equal(replayAttack.revokedSessionIds.length, 2); // Both sessions frozen!
});

test('RFC 6238 TOTP Synchronizer validates time-step codes with drift tolerance and leaky bucket limits', () => {
  // Base32 secret for 'NEXORA_ATELIER_SECRET_KEY'
  const secret = 'JBSWY3DPEHPK3PXP'; // Standard test base32
  const now = 1700000000000;

  // Let's first test invalid code
  const invalid = synchronizeTotpWithDriftAndRateLimit({
    secretBase32: secret,
    userCode: '000000',
    timestampMs: now,
  });
  // It shouldn't match arbitrary '000000'
  assert.equal(invalid.rateLimitExceeded, false);

  // Let's test rate limit exceeding (5 failed attempts)
  const rateLimited = synchronizeTotpWithDriftAndRateLimit({
    secretBase32: secret,
    userCode: '123456',
    timestampMs: now,
    failedAttemptCount: 5,
    maxAttemptsPerWindow: 5,
  });
  assert.equal(rateLimited.rateLimitExceeded, true);
  assert.equal(rateLimited.isValid, false);

  // Test replay detection by putting step in recentUsedSteps
  const step = Math.floor(now / 1000 / 30);
  const replayed = synchronizeTotpWithDriftAndRateLimit({
    secretBase32: secret,
    userCode: '999999',
    timestampMs: now,
    recentUsedSteps: [step - 1, step, step + 1],
  });
  assert.equal(replayed.isValid, false);
});

test('Contextual Login Risk Scorer detects impossible travel velocities and abnormal devices', () => {
  const t0 = Date.now();

  // 1. Low risk: Same city (Hanoi) 2 hours apart, identical device
  const lowRisk = scoreContextualLoginRiskAndVelocity({
    currentLogin: {
      ip: '113.160.224.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      latitude: 21.0285,
      longitude: 105.8542,
      timestampMs: t0,
    },
    previousLogin: {
      ip: '113.160.224.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      latitude: 21.0300,
      longitude: 105.8500,
      timestampMs: t0 - 2 * 3600000,
    },
  });

  assert.equal(lowRisk.riskTier, 'LOW_RISK');
  assert.equal(lowRisk.recommendedAction, 'ALLOW_TRANSPARENT');
  assert.equal(lowRisk.impossibleTravel, false);
  assert.ok(lowRisk.compositeRiskScore < 25);

  // 2. Critical risk: Supersonic travel Hanoi to Saigon (1150 km in 15 minutes = 4600 km/h)
  const criticalRisk = scoreContextualLoginRiskAndVelocity({
    currentLogin: {
      ip: '42.112.35.80',
      userAgent: 'Python-requests/2.31.0 MaliciousBot',
      latitude: 10.8231, // Ho Chi Minh City
      longitude: 106.6297,
      timestampMs: t0,
    },
    previousLogin: {
      ip: '113.160.224.15',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      latitude: 21.0285, // Hanoi
      longitude: 105.8542,
      timestampMs: t0 - 15 * 60000, // 15 minutes ago
    },
    ipFailedAttemptsPastHour: 6,
  });

  assert.equal(criticalRisk.riskTier, 'CRITICAL_RISK');
  assert.equal(criticalRisk.recommendedAction, 'BLOCK_AND_ALERT');
  assert.equal(criticalRisk.impossibleTravel, true);
  assert.ok(criticalRisk.travelVelocityKmH > 1000);
  assert.ok(criticalRisk.incidentSecurityHash?.startsWith('#SEC-ALERT-'));
});

test('Bayesian Review Credibility & Wilson Score 95% accurately dampens small-sample noise', () => {
  // 1 review of 5 stars (small-sample bias: raw 5.0, but Bayesian should pull toward prior 4.5)
  const singleReview = evaluateBayesianReviewCredibility({
    reviews: [
      { rating: 5, body: 'Rất ưng ý chất vải', isVerifiedPurchase: true, hasImages: false },
    ],
    priorMean: 4.5,
    priorWeight: 5.0,
  });

  assert.equal(singleReview.sampleSize, 1);
  assert.equal(singleReview.arithmeticMeanRating, 5.0);
  assert.ok(singleReview.bayesianMeanRating < 4.8); // Bayesian damping
  assert.equal(singleReview.credibilityTier, 'PROMISING_NEW');

  // Established slow fashion product with 8 detailed reviews
  const multiReviews = evaluateBayesianReviewCredibility({
    reviews: [
      { rating: 5, body: 'Sơ mi linen dệt thoi Normandy mặc vào rất thoáng mát, phom dáng chuẩn chỉ từng đường kim.', isVerifiedPurchase: true, hasImages: true, userOrderCount: 4 },
      { rating: 5, body: 'Đường may mí Pháp sạch sẽ không một sợi chỉ thừa, khuy xà cừ tự nhiên óng ánh.', isVerifiedPurchase: true, hasImages: true, userOrderCount: 5 },
      { rating: 4, body: 'Màu cát mộc rất nhã nhặn, hơi nhăn nhẹ đặc trưng của sợi tự nhiên.', isVerifiedPurchase: true, hasImages: false },
      { rating: 5, body: 'Giao hàng bao bì nilon sinh học sắn chu đáo, bưu tá lịch sự.', isVerifiedPurchase: true, hasImages: true },
      { rating: 5, body: 'Mặc lên phom ve đứng rất sang trọng.', isVerifiedPurchase: true, hasImages: false },
      { rating: 4, body: 'Áo đẹp, chất lượng hoàn thiện tuyệt hảo.', isVerifiedPurchase: true, hasImages: false },
    ],
    priorMean: 4.5,
    priorWeight: 5.0,
  });

  assert.equal(multiReviews.sampleSize, 6);
  assert.ok(multiReviews.bayesianMeanRating >= 4.6);
  assert.equal(multiReviews.credibilityTier, 'HAUTE_VERIFIED_EXCELLENCE');
  assert.ok(multiReviews.wilsonLowerBound95Pct > 60.0);
});

test('Anti-Astroturfing & Sybil Collusion Detector identifies copy-paste templates and IP syndicates', () => {
  // 1. Coordinated astroturfing spam ring: identical text from different accounts on same IP
  const suspiciousBatch = [
    { id: 'rev-01', userId: 'user-bot-1', body: 'Áo này đẹp lắm mọi người ơi nên mua ngay nhé chất lượng tuyệt vời', rating: 5, ip: '14.232.180.99', createdAt: new Date() },
    { id: 'rev-02', userId: 'user-bot-2', body: 'Áo này đẹp lắm mọi người ơi nên mua ngay nhé chất lượng tuyệt vời', rating: 5, ip: '14.232.180.99', createdAt: new Date() },
    { id: 'rev-03', userId: 'user-bot-3', body: 'Áo này đẹp lắm mọi người ơi nên mua ngay nhé chất lượng tuyệt vời', rating: 5, ip: '14.232.180.99', createdAt: new Date() },
    { id: 'rev-04', userId: 'user-bot-4', body: 'Áo này đẹp lắm mọi người ơi nên mua ngay nhé chất lượng tuyệt vời', rating: 5, ip: '14.232.180.99', createdAt: new Date() },
  ];

  const collusionResult = detectAstroturfingAndCollusionReviews({
    candidateReviews: suspiciousBatch,
  });

  assert.equal(collusionResult.astroturfingSuspected, true);
  assert.ok(collusionResult.collusionRiskScore >= 50);
  assert.ok(collusionResult.flaggedReviewIds.length >= 3);
  assert.ok(['IP_SYBIL_COLLUSION', 'TEMPLATE_SPAM_BURST'].includes(collusionResult.fraudReason));

  // 2. Organic diverse reviews
  const organicBatch = [
    { id: 'rev-10', userId: 'user-10', body: 'Vải mềm mại, màu sắc thực tế trầm hơn hình một chút nhưng rất đẹp.', rating: 5, ip: '113.160.1.1', createdAt: new Date() },
    { id: 'rev-11', userId: 'user-11', body: 'Size L hơi rộng so với mình, đổi sang M vừa vặn.', rating: 4, ip: '113.160.2.2', createdAt: new Date() },
    { id: 'rev-12', userId: 'user-12', body: 'Đường may cẩn thận, đóng gói hộp carton mộc sang trọng.', rating: 5, ip: '113.160.3.3', createdAt: new Date() },
  ];

  const organicResult = detectAstroturfingAndCollusionReviews({
    candidateReviews: organicBatch,
  });

  assert.equal(organicResult.astroturfingSuspected, false);
  assert.equal(organicResult.collusionRiskScore, 0);
  assert.equal(organicResult.fraudReason, 'CLEAN_ORGANIC');
});

test('Reverse Logistics Doorstep Routing optimizes destination and computes carbon abatement', () => {
  const customer = { latitude: 21.0285, longitude: 105.8542, district: 'Hoàn Kiếm, Hà Nội' };
  const workshop = { workshopId: 'ws-nep', name: 'NÉP Studio Ba Đình', latitude: 21.0333, longitude: 105.8200, canRestoreFabric: true };
  const centralHub = { hubId: 'hub-gia-lam', name: 'NEXORA Central Sorting Hub', latitude: 21.0500, longitude: 105.9000 };

  // Doorstep exchange: Workshop is closer and can restore fabric -> direct to workshop
  const doorstepRouting = optimizeReverseLogisticsDoorstepRouting({
    customerLocation: customer,
    primaryWorkshop: workshop,
    centralHub,
    requestKind: 'DOORSTEP_EXCHANGE',
    itemWeightKg: 0.6,
  });

  assert.equal(doorstepRouting.recommendedDestination, 'WORKSHOP_DIRECT');
  assert.equal(doorstepRouting.destinationName, 'NÉP Studio Ba Đình');
  assert.equal(doorstepRouting.isDoorstepConsolidated, true);
  assert.ok(doorstepRouting.carbonAbatementKgCo2e > 0);
  assert.ok(doorstepRouting.reverseLogisticsCode.startsWith('#REV-LOG-VN-'));
});

test('RMA Wear-and-Tear Restitution accurately grades garment condition and preserves exact Dong', () => {
  const originalPrice = 1250000;

  // 1. Pristine seal intact
  const pristine = evaluateRmaWearAndTearRestitution({
    originalItemPriceVnd: originalPrice,
    condition: 'SEAL_INTACT_UNWORN',
  });
  assert.equal(pristine.deductionVnd, 0);
  assert.equal(pristine.netRefundVnd, originalPrice);
  assert.equal(pristine.restitutionRatePct, 100);
  assert.equal(pristine.circularStream, 'PRIMARY_LUXURY_STOCK');
  assert.equal(pristine.exactDongPreserved, true);

  // 2. Try-on creased (steam decatizing fee 35.000₫)
  const creased = evaluateRmaWearAndTearRestitution({
    originalItemPriceVnd: originalPrice,
    condition: 'TRY_ON_CREASED',
  });
  assert.equal(creased.deductionVnd, 35000);
  assert.equal(creased.netRefundVnd, originalPrice - 35000);
  assert.equal(creased.exactDongPreserved, true);

  // 3. Tag removed worn (30% pre-owned circular downgrade)
  const worn = evaluateRmaWearAndTearRestitution({
    originalItemPriceVnd: originalPrice,
    condition: 'TAG_REMOVED_WORN',
  });
  const expectedDeduction = Math.round(originalPrice * 0.30);
  assert.equal(worn.deductionVnd, expectedDeduction);
  assert.equal(worn.netRefundVnd, originalPrice - expectedDeduction);
  assert.equal(worn.circularStream, 'PRE_OWNED_RELOVED');
  assert.equal(worn.exactDongPreserved, true);
  assert.ok(worn.rmaCertificateCode.startsWith('#RMA-KCS-'));
});

test('Tactile Fabric Swatch Spectral Curator maximizes Kawabata KES-FB mechanical diversity', () => {
  const swatches: any[] = [
    { id: 'sw-1', name: 'Lụa Tơ Tằm Bảo Lộc', material: 'SILK', surfaceRoughnessSmdUm: 1.2, bendingRigidityB: 0.02, tensileExtensibilityEmtPct: 4.5, compressibilityLc: 0.45, colorHex: '#FAF0E6' },
    { id: 'sw-2', name: 'Linen Mộc Normandy', material: 'LINEN', surfaceRoughnessSmdUm: 8.5, bendingRigidityB: 0.28, tensileExtensibilityEmtPct: 2.8, compressibilityLc: 0.32, colorHex: '#D2B48C' },
    { id: 'sw-3', name: 'Dạ Len Lông Cừu Ý', material: 'WOOL', surfaceRoughnessSmdUm: 5.4, bendingRigidityB: 0.42, tensileExtensibilityEmtPct: 12.5, compressibilityLc: 0.55, colorHex: '#36454F' },
    { id: 'sw-4', name: 'Cotton Pima Satin', material: 'COTTON', surfaceRoughnessSmdUm: 2.1, bendingRigidityB: 0.08, tensileExtensibilityEmtPct: 6.2, compressibilityLc: 0.40, colorHex: '#FFFFFF' },
    { id: 'sw-5', name: 'Gai Ramie Nhuộm Chàm', material: 'RAMIE', surfaceRoughnessSmdUm: 9.8, bendingRigidityB: 0.35, tensileExtensibilityEmtPct: 2.1, compressibilityLc: 0.28, colorHex: '#1F305E' },
    { id: 'sw-6', name: 'Lụa Satin Hà Đông', material: 'SILK', surfaceRoughnessSmdUm: 1.5, bendingRigidityB: 0.03, tensileExtensibilityEmtPct: 5.0, compressibilityLc: 0.48, colorHex: '#E6D7B8' },
    { id: 'sw-7', name: 'Đũi Tơ Tằm Nam Cao', material: 'SILK', surfaceRoughnessSmdUm: 7.2, bendingRigidityB: 0.18, tensileExtensibilityEmtPct: 3.8, compressibilityLc: 0.35, colorHex: '#C2B280' },
  ];

  const curatedBox = curateTactileFabricSwatchBox({
    candidateSwatches: swatches,
    boxCapacity: 5,
  });

  assert.equal(curatedBox.selectedSwatches.length, 5);
  assert.ok(curatedBox.roughnessSpanUm >= 7.0); // Spans from ~1.2um to ~9.8um
  assert.ok(curatedBox.tactileDiversityIndex >= 70.0);
  assert.ok(curatedBox.swatchBoxCode.startsWith('#SWATCH-BOX-'));
});

test('Swatch-to-Bespoke Rebate Calculator strictly preserves exact Dong and models conversion', () => {
  const grossBespoke = 3850000;
  const deposit = 50000;

  const rebate = calculateSwatchToBespokeRebateAndConversion({
    swatchDepositVnd: deposit,
    bespokeOrderGrossVnd: grossBespoke,
    dwellDaysSinceSwatchArrival: 3,
    swatchTouchCount: 5,
    materialPurityPct: 98,
  });

  assert.equal(rebate.swatchDepositVnd, 50000);
  assert.equal(rebate.rebateDeductionVnd, 50000);
  assert.equal(rebate.bespokeOrderNetVnd, 3800000);
  assert.equal(rebate.exactDongPreserved, true);
  assert.ok(rebate.conversionProbabilityPct > 60.0);
  assert.ok(rebate.rebateCertificateCode.startsWith('#REBATE-BESPOKE-'));
});

test('Home-Fitting Valet Suitcase Bin-Packing enforces weight, volume, and gravity safety', () => {
  const items = [
    { id: 'it-1', name: 'Mẫu Rập Vải Mộc Toile Áo Măng Tô', weightKg: 1.2, volumeLiters: 4.5, consultationUtilityScore: 95, isMandatory: true },
    { id: 'it-2', name: 'Bộ Thước Đo Nhân Trắc Kỹ Thuật Số', weightKg: 0.8, volumeLiters: 1.5, consultationUtilityScore: 90, isMandatory: true },
    { id: 'it-3', name: 'Hộp Khuy Xà Cừ & Phụ Kiện Thủ Công', weightKg: 1.5, volumeLiters: 2.0, consultationUtilityScore: 80, isMandatory: true },
    { id: 'it-4', name: 'Bàn Ủi Hơi Nước Cầm Tay Du Lịch', weightKg: 2.2, volumeLiters: 6.0, consultationUtilityScore: 85, isMandatory: false },
    { id: 'it-5', name: 'Cuộn Vải Mẫu Dạ Len Ý 3m', weightKg: 4.5, volumeLiters: 12.0, consultationUtilityScore: 75, isMandatory: false },
    { id: 'it-6', name: 'Cuộn Vải Mẫu Lụa Tơ Tằm Bảo Lộc 4m', weightKg: 1.8, volumeLiters: 5.5, consultationUtilityScore: 88, isMandatory: false },
    { id: 'it-7', name: 'Tập Catalog Phối Đồ Sartorial', weightKg: 2.0, volumeLiters: 3.5, consultationUtilityScore: 70, isMandatory: false },
  ];

  const packing = packHomeFittingValetSuitcase({
    requestedItems: items,
    maxWeightCapacityKg: 18.5,
    maxVolumeCapacityLiters: 65.0,
  });

  assert.ok(packing.packedItems.length >= 4);
  assert.ok(packing.totalWeightKg <= 18.5);
  assert.ok(packing.totalVolumeLiters <= 65.0);
  assert.equal(packing.centerOfGravitySafe, true);
  assert.ok(packing.suitcaseManifestCode.startsWith('#VALET-SUITCASE-'));
});

test('Fitting Correction Biomechanical Revise Mapper calculates seam offsets and armscye ease', () => {
  const revise = mapFittingCorrectionBiomechanicalRevise({
    bespokeId: 'BESPOKE-SUIT-099',
    garmentType: 'BLAZER',
    fittingIssues: [
      { region: 'SHOULDER_PITCH', severity: 'MODERATE', adjustmentMm: -8 }, // Hạ dốc vai 8mm
      { region: 'ARMSCYE_TIGHT', severity: 'MILD', adjustmentMm: 10 }, // Hạ nách 10mm
      { region: 'CHEST_EASE', severity: 'MILD', adjustmentMm: 12 }, // Nới ngực 12mm
    ],
    measuredArmscyePerimeterMm: 480,
    measuredSleeveHeadPerimeterMm: 510,
  });

  assert.equal(revise.bespokeId, 'BESPOKE-SUIT-099');
  assert.equal(revise.patternOffsetsMm.shoulderSlopeDeltaMm, -8);
  assert.equal(revise.patternOffsetsMm.armscyeDepthDeltaMm, 10);
  assert.equal(revise.patternOffsetsMm.chestEaseDeltaMm, 12);
  // Adjusted armscye = 480 + 10 * 1.5 = 495. Sleeve head = 510. Ease = 510 - 495 = 15mm (Ideal 12-18mm!)
  assert.equal(revise.sleeveEaseMarginMm, 15.0);
  assert.equal(revise.armscyeInvariantSatisfied, true);
  assert.ok(revise.fittingApprovalCertificate.startsWith('#FIT-REVISE-KCS-'));
});

test('Dual-Uncertainty Safety Stock and ROP engine calculates stochastic threshold and EOQ', () => {
  // Thử nghiệm SKU Vải Dạ Lông Cừu (Wool Cashmere Fabric)
  const result = calculateSafetyStockAndReorderPoint({
    skuId: 'FABRIC-WOOL-CASHMERE-01',
    skuName: 'Vải Dạ Lông Cừu Ý 450GSM',
    currentStockQty: 35, // Đang có 35 mét
    averageDailyDemand: 10, // D_bar = 10 mét/ngày
    demandStdDev: 3, // sigma_D = 3 mét
    leadTimeDays: 7, // L_bar = 7 ngày đặt dệt
    leadTimeStdDev: 2, // sigma_L = 2 ngày giao hàng trồi sụt
    serviceLevelTarget: 0.95, // 95% không đứt hàng (Z = 1.645)
    holdingCostPerUnitYearVnd: 60000,
    orderingCostPerOrderVnd: 450000,
  });

  // Variance = 7 * (3^2) + (10^2) * (2^2) = 7 * 9 + 100 * 4 = 63 + 400 = 463. StdDev = sqrt(463) ~= 21.52
  assert.equal(result.combinedUncertaintyStdDev, 21.52);
  // SS = ceil(1.645 * 21.52) = ceil(35.4) = 36
  assert.equal(result.safetyStockQty, 36);
  // LTD = 10 * 7 = 70. ROP = 70 + 36 = 106
  assert.equal(result.leadTimeDemand, 70);
  assert.equal(result.reorderPoint, 106);
  // Current stock (35) <= SS (36) <= ROP (106) -> CRITICAL_SAFETY_DEFICIT, triggerReorder = true
  assert.equal(result.triggerReorder, true);
  assert.equal(result.stockStatus, 'CRITICAL_SAFETY_DEFICIT');
  assert.ok(result.suggestedReorderQty >= result.safetyStockQty);
  assert.ok(result.safetyStockCertificate.startsWith('#SAFETY-STOCK-'));
});

test('Multi-Channel Fair Rationing with Hamilton-Hare guarantees zero overselling and exact conservation', () => {
  const channels = [
    { channelId: 'CH-VIP', channelName: 'VIP Bespoke Concierge', priorityTier: 'VIP' as const, requestedUnits: 40, minGuaranteedUnits: 15 },
    { channelId: 'CH-DIRECT', channelName: 'Online Flagship E-Shop', priorityTier: 'ATELIER_DIRECT' as const, requestedUnits: 50, minGuaranteedUnits: 10 },
    { channelId: 'CH-WHOLESALE', channelName: 'Boutique Partner Saigon', priorityTier: 'WHOLESALE' as const, requestedUnits: 30, minGuaranteedUnits: 5 },
    { channelId: 'CH-POPUP', channelName: 'Weekend Pop-up Showroom', priorityTier: 'GUEST' as const, requestedUnits: 20, minGuaranteedUnits: 0 },
  ];

  // Tổng cầu = 40 + 50 + 30 + 20 = 140 đơn vị. Nhưng đợt drop chỉ có 60 đơn vị!
  const rationing = allocateMultiChannelStockRationing({
    allocationBatchId: 'DROP-CAPSULE-SUMMER-2026',
    availableTotalStock: 60,
    channels,
  });

  assert.equal(rationing.availableTotalStock, 60);
  assert.equal(rationing.totalRequestedUnits, 140);
  assert.equal(rationing.totalAllocatedUnits, 60);
  assert.equal(rationing.unallocatedRemainderUnits, 0);
  assert.equal(rationing.zeroOversellingInvariantSatisfied, true);

  // Kiểm tra từng kênh không vượt quá yêu cầu gốc
  for (const alloc of rationing.allocations) {
    assert.ok(alloc.allocatedUnits <= alloc.requestedUnits);
    assert.ok(Number.isInteger(alloc.allocatedUnits));
  }

  // Kênh VIP nhận tỷ lệ cao nhất nhờ trọng số ưu tiên cao
  const vipAlloc = rationing.allocations.find((a) => a.channelId === 'CH-VIP')!;
  const guestAlloc = rationing.allocations.find((a) => a.channelId === 'CH-POPUP')!;
  assert.ok(vipAlloc.fulfillmentRatePercent > guestAlloc.fulfillmentRatePercent);
  assert.ok(rationing.rationingCertificate.startsWith('#RATIONING-HASH-'));
});

test('M/M/c Preorder Queue Forecaster calculates PDD with 95% statistical confidence window', () => {
  const pdd = forecastPreorderBacklogPromisedDeliveryDate({
    preorderId: 'PREORDER-TUXEDO-088',
    customerTier: 'PLATINUM', // Được giảm 25% độ trễ hàng đợi
    garmentCategory: 'BESPOKE_SUIT',
    backlogQueuePosition: 20, // Đang đứng thứ 20 trong hàng đợi
    activeCraftsmenCount: 4, // 4 thợ may chính
    dailyProductionRatePerCraftsman: 0.5, // Mỗi thợ làm 0.5 bộ/ngày -> Công suất = 2 bộ/ngày
    serviceVarianceDays: 0.6,
    qualityControlDays: 1.5,
    shippingTransitDays: 2.0,
    orderTimestamp: '2026-06-01T08:00:00.000Z',
  });

  assert.equal(pdd.preorderId, 'PREORDER-TUXEDO-088');
  assert.equal(pdd.originalQueuePosition, 20);
  // 20 * (1 - 0.25) = 15
  assert.equal(pdd.effectiveQueuePosition, 15);
  // Queue wait: (15 - 1) / (4 * 0.5) = 14 / 2 = 7.0 days
  assert.equal(pdd.queueWaitDays, 7.0);
  // Crafting: 1 / 0.5 = 2.0 days
  assert.equal(pdd.craftingDurationDays, 2.0);
  // Expected lead time = 7.0 + 2.0 + 1.5 + 2.0 = 12.5 days
  assert.equal(pdd.expectedLeadTimeDays, 12.5);
  assert.ok(pdd.confidenceBuffer95Days >= 2);
  assert.ok(pdd.pddTargetDateIso.startsWith('2026-06-'));
  assert.ok(pdd.preorderQueueCertificate.startsWith('#PREORDER-QUEUE-'));
});

test('Multi-Hub Transshipment vs Split Shipment Optimizer selects optimal logistics and carbon route', () => {
  const multiHubOrder = {
    orderId: 'ORDER-MULTIHUB-777',
    customerDestination: {
      province: 'Hà Nội',
      district: 'Hoàn Kiếm',
      isUrban: true,
    },
    items: [
      { itemId: 'IT-BLAZER', itemName: 'Áo Blazer Linen Thô', atelierHubId: 'HUB-DANANG', atelierHubName: 'Xưởng Hội An', weightKg: 1.2 },
      { itemId: 'IT-PANTS', itemName: 'Quần Âu Tơ Tằm', atelierHubId: 'HUB-HANOI', atelierHubName: 'Xưởng Lụa Vạn Phúc', weightKg: 0.6 },
    ],
    consolidationHubId: 'HUB-HANOI',
  };

  const decision = optimizeMultiHubTransshipmentConsolidation(multiHubOrder);

  assert.equal(decision.orderId, 'ORDER-MULTIHUB-777');
  assert.equal(decision.originHubCount, 2);
  assert.ok(['SPLIT_SHIPMENT', 'LATERAL_TRANSSHIPMENT'].includes(decision.recommendedStrategy));
  assert.equal(decision.splitShipmentOption.packageCount, 2);
  assert.equal(decision.transshipmentOption.packageCount, 1);
  assert.ok(decision.splitShipmentOption.totalShippingCostVnd > 0);
  assert.ok(decision.transshipmentOption.totalCostVnd > 0);
  assert.ok(decision.transshipmentCertificate.startsWith('#TRANSSHIP-OPT-'));
});

test('Deadstock Fabric Degradation and Dynamic Markdown protects farmer floor price and models tensile loss', () => {
  const result = calculateDeadstockFabricDecayMarkdown({
    fabricRollId: 'ROLL-SILK-HA-DONG-19',
    fabricName: 'Lụa Tơ Tằm Dệt Thủ Công Hà Đông 16 Momme',
    fiberComposition: 'MULBERRY_SILK',
    originalCostPerMeterVnd: 450000,
    storageDurationMonths: 8,
    storageConditions: {
      avgTemperatureC: 26,
      relativeHumidityPct: 68,
      isClimateControlled: false,
    },
    rawMaterialFloorPriceVnd: 280000, // Giá sàn không được bán dưới mức này
  });

  assert.equal(result.fabricRollId, 'ROLL-SILK-HA-DONG-19');
  assert.ok(result.tensileStrengthRetentionPercent >= 80.0 && result.tensileStrengthRetentionPercent <= 98.0);
  assert.ok(result.clearanceDiscountPercent >= 10.0 && result.clearanceDiscountPercent <= 25.0);
  assert.ok(result.recommendedMarkdownPricePerMeterVnd >= 280000);
  assert.equal(result.recommendedMarkdownPricePerMeterVnd, 450000 - result.netMarkdownSavingsVnd);
  assert.ok(['PRISTINE_VINTAGE', 'STABLE_MATURE', 'UPCYCLE_GRADE'].includes(result.preservationGrade));
  assert.ok(result.deadstockCertificate.startsWith('#DEADSTOCK-MARKDOWN-'));
});

test('2D Remnant Bounded Knapsack Upcycling Nest maximizes value and avoided virgin CO2', () => {
  const remnantTest = optimizeRemnantPatternUpcyclingNest({
    remnantLotId: 'REMNANT-LOT-LINEN-88',
    fabricName: 'Vải Linen Mộc Normandy Vụn Sau Cắt Rập',
    remnantLengthCm: 150,
    remnantWidthCm: 80, // Tổng diện tích = 12,000 cm2
    candidatePatterns: [
      { patternId: 'PAT-POCKET-SQ', patternName: 'Khăn Cài Áo Pocket Square Viền Cuốn Tay', lengthCm: 32, widthCm: 32, targetSalePriceVnd: 185000, virginCo2AvoidedKg: 0.45, priorityScore: 1.2 },
      { patternId: 'PAT-BOWTIE', patternName: 'Nơ Đeo Cổ Thắt Sẵn Sartorial', lengthCm: 25, widthCm: 12, targetSalePriceVnd: 220000, virginCo2AvoidedKg: 0.35, priorityScore: 1.5 },
      { patternId: 'PAT-SCRUNCHIE', patternName: 'Dây Buộc Tóc Scrunchie Tự Nhiên', lengthCm: 40, widthCm: 10, targetSalePriceVnd: 85000, virginCo2AvoidedKg: 0.20, priorityScore: 1.0 },
    ],
    packingEfficiencyFactor: 0.85,
  });

  assert.equal(remnantTest.remnantLotId, 'REMNANT-LOT-LINEN-88');
  assert.equal(remnantTest.totalRemnantAreaCm2, 12000);
  assert.equal(remnantTest.usableCuttingAreaCm2, 10200);
  assert.ok(remnantTest.allocatedPatterns.length >= 2);
  assert.ok(remnantTest.totalAllocatedCount > 0);
  assert.ok(remnantTest.totalUpcyclingValueVnd > 500000);
  assert.ok(remnantTest.totalVirginCo2AvoidedKg > 1.0);
  assert.ok(remnantTest.fabricUtilizationRatePercent > 50.0);
  assert.ok(remnantTest.upcyclingCertificate.startsWith('#UPCYCLE-NEST-'));
});

test('Artisan Fair Living Wage Floor and Open Costing preserves exact Dong and verifies wage ratio', () => {
  const fairWage = evaluateArtisanFairTradePriceFloor({
    garmentId: 'BESPOKE-VEST-01',
    garmentName: 'Áo Ghi-Lê Lụa Đũi Thêu Tay Cố Đô',
    regionalWageZone: 'ZONE_2', // Huế (Lương chuẩn sống = 48,000 đ/h vs Tối thiểu 20,000 đ/h)
    craftingHours: 14, // 14 giờ may và thêu thủ công
    complexityFactors: [
      { factorName: 'Thêu chỉ tơ tằm họa tiết cung đình', weightBonusPct: 15 },
      { factorName: 'Khâu khuy sừng bò tự nhiên', weightBonusPct: 5 },
    ],
    fabricCostVnd: 450000,
    trimsCostVnd: 80000,
    packagingAndKcsCostVnd: 70000,
    atelierTargetMarginPct: 22,
    platformFeePct: 5,
  });

  assert.equal(fairWage.garmentId, 'BESPOKE-VEST-01');
  assert.equal(fairWage.regionalWageZone, 'ZONE_2');
  assert.equal(fairWage.complexityBonusPercent, 20); // 15 + 5
  // Effective rate = 48000 * (1 + 0.2) = 57600 VND/h
  assert.equal(fairWage.effectiveArtisanHourlyRateVnd, 57600);
  // Labor cost = 14 * 57600 = 806400 VND
  assert.equal(fairWage.artisanLaborCostVnd, 806400);
  // Wage ratio = 57600 / 20000 = 2.88x statutory min (> 1.5x)
  assert.equal(fairWage.fairWageToMinimumRatio, 2.88);
  assert.equal(fairWage.fairLivingWageSatisfied, true);
  assert.equal(fairWage.exactMoneyConservationPreserved, true);
  assert.ok(fairWage.finalRetailPriceVnd > fairWage.totalCostPriceVnd);
  assert.ok(fairWage.fairTradeCertificate.startsWith('#FAIR-TRADE-FLOOR-'));
});

test('Ellen MacArthur Material Circularity Indicator and EPR Audit grades circular durability', () => {
  const mciResult = auditAtelierEprCircularityIndex({
    productId: 'CIRCULAR-BLAZER-007',
    productName: 'Áo Blazer Vải Lanh Hữu Cơ Tái Sinh',
    garmentTotalMassGrams: 850,
    virginFeedstockGrams: 200,
    recycledOrUpcycledFeedstockGrams: 650,
    biodegradableNaturalGrams: 850, // 100% sợi tự nhiên phân hủy sinh học
    designedExpectedWears: 300, // May đo cao cấp bền 300 lần mặc (so với fast fashion 50 lần)
    takebackRecyclabilityPct: 92.0, // 92% có thể thu hồi tái chế xơ
  });

  assert.equal(mciResult.productId, 'CIRCULAR-BLAZER-007');
  assert.ok(mciResult.virginFeedstockFraction < 0.3);
  assert.ok(mciResult.recycledFeedstockFraction > 0.7);
  // Utility factor = 300 / 50 = 6.0x
  assert.equal(mciResult.utilityFactorX, 6.0);
  // Linear Flow Index low, high utility -> High MCI score
  assert.ok(mciResult.materialCircularityIndicatorMci >= 0.85);
  assert.equal(mciResult.circularityTier, 'REGENERATIVE_HERITAGE');
  assert.equal(mciResult.eprCompliancePassed, true);
  assert.ok(mciResult.circularityCertificate.startsWith('#MCI-CIRCULARITY-'));
});

test('Multi-Skill Artisan Workforce Scheduler enforces skill efficiencies, non-overlap and zero overbooking', () => {
  const artisans: ArtisanWorker[] = [
    {
      artisanId: 'ART-01',
      artisanName: 'Bác Thành (Master Tailor)',
      maxDailyMinutes: 480, // 8 tiếng
      skillMatrix: { PATTERN_CUTTING: 1.25, CANVASSING: 1.2, HAND_SEWING: 1.0 },
    },
    {
      artisanId: 'ART-02',
      artisanName: 'Chị Mai (Senior Seamstress)',
      maxDailyMinutes: 480,
      skillMatrix: { HAND_SEWING: 1.3, EMBROIDERY: 1.2, FINAL_KCS: 1.1 },
    },
    {
      artisanId: 'ART-03',
      artisanName: 'Anh Huy (Finishing Craftsman)',
      maxDailyMinutes: 480,
      skillMatrix: { DECATIZING_PRESS: 1.2, FINAL_KCS: 1.3, PATTERN_CUTTING: 0.9 },
    },
  ];

  const tasks = [
    { taskId: 'TASK-1', orderId: 'ORD-VIP-01', garmentCategory: 'BESPOKE_SUIT', operation: 'PATTERN_CUTTING', baseDurationMinutes: 120, priorityTier: 'VIP_RUSH' as const, deadlineIso: '2026-06-20T12:00:00Z' },
    { taskId: 'TASK-2', orderId: 'ORD-VIP-01', garmentCategory: 'BESPOKE_SUIT', operation: 'CANVASSING', baseDurationMinutes: 150, priorityTier: 'VIP_RUSH' as const, deadlineIso: '2026-06-20T15:00:00Z' },
    { taskId: 'TASK-3', orderId: 'ORD-NORM-02', garmentCategory: 'SILK_DRESS', operation: 'HAND_SEWING', baseDurationMinutes: 180, priorityTier: 'NORMAL' as const, deadlineIso: '2026-06-20T17:00:00Z' },
    { taskId: 'TASK-4', orderId: 'ORD-NORM-03', garmentCategory: 'LINEN_BLAZER', operation: 'DECATIZING_PRESS', baseDurationMinutes: 90, priorityTier: 'FLEXIBLE' as const, deadlineIso: '2026-06-20T18:00:00Z' },
  ];

  const schedule = scheduleMultiSkillArtisanWorkforce({
    scheduleDate: '2026-06-20',
    artisans,
    tasks,
  });

  assert.equal(schedule.scheduleDate, '2026-06-20');
  assert.equal(schedule.totalTasksScheduled, 4);
  assert.equal(schedule.totalBacklogUnscheduled, 0);
  assert.equal(schedule.zeroOverbookingInvariantSatisfied, true);
  assert.ok(schedule.makespanMinutes > 0 && schedule.makespanMinutes <= 480);
  assert.ok(schedule.averageArtisanUtilizationPercent > 0);

  // VIP Rush task must be assigned and finish within workday
  const vipTask = schedule.scheduledAllocations.find((a) => a.taskId === 'TASK-1')!;
  assert.equal(vipTask.assignedArtisanId, 'ART-01');
  // Base 120 / 1.25 = 96 minutes
  assert.equal(vipTask.effectiveDurationMinutes, 96);
  assert.ok(schedule.scheduleCertificate.startsWith('#ARTISAN-SCHEDULE-'));
});

test('Theory of Constraints Bottleneck detector calculates Little WIP queue and Drum Buffer Sizing', () => {
  const stations = [
    { stationId: 'ST-CUT', stationName: 'Trạm Cắt Rập & Pha Canh Sợi', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 1.5, observedArrivalRateUnitsPerHour: 2.4, currentWipUnits: 3 },
    { stationId: 'ST-CANVAS', stationName: 'Trạm Dựng Ngực Canvas Ngựa', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 0.8, observedArrivalRateUnitsPerHour: 1.5, currentWipUnits: 9 }, // Capacity = 1.6, Rate = 1.5 -> Util = 93.8% (Bottleneck!)
    { stationId: 'ST-SEW', stationName: 'Trạm Ráp Thân & Khâu Viền', activeCraftsmenCount: 3, nominalThroughputUnitsPerHour: 1.0, observedArrivalRateUnitsPerHour: 1.4, currentWipUnits: 4 },
    { stationId: 'ST-PRESS', stationName: 'Trạm Là Ép Định Hình Phom', activeCraftsmenCount: 2, nominalThroughputUnitsPerHour: 2.0, observedArrivalRateUnitsPerHour: 1.4, currentWipUnits: 2 },
  ];

  const tocResult = detectTheoryOfConstraintsBottleneck({
    atelierLineId: 'LINE-HAUTE-COUTURE-01',
    observationPeriodHours: 8,
    stations,
  });

  assert.equal(tocResult.atelierLineId, 'LINE-HAUTE-COUTURE-01');
  assert.equal(tocResult.primaryBottleneckStationId, 'ST-CANVAS');
  assert.ok(tocResult.maximumStationUtilizationPercent >= 90.0);
  assert.equal(tocResult.totalLineWipUnits, 18);
  const canvasStation = tocResult.stationAnalyses.find((s) => s.stationId === 'ST-CANVAS')!;
  assert.equal(canvasStation.stationStatus, 'CRITICAL_CHOKEPOINT');
  assert.ok(canvasStation.wipQueueHours >= 5.0);
  assert.ok(canvasStation.recommendedWipBufferUnits > 0);
  assert.ok(tocResult.drumBufferRopeAction.includes('KÍCH HOẠT DBR'));
  assert.ok(tocResult.tocCertificate.startsWith('#TOC-DRUM-BUFFER-'));
});

test('Weibull-Rohmert Ergonomic Fatigue and Stitch Defect estimator predicts defect risk and breaks', () => {
  // Thợ thêu đính cườm làm liên tục 160 phút thiếu sáng
  const fatigue = calculateErgonomicFatigueDecayCurve({
    artisanId: 'ART-EMBROIDERY-09',
    artisanName: 'Nghệ nhân Thu Hằng',
    continuousCraftingMinutes: 160,
    craftingPrecisionLevel: 'ULTRA_HIGH_BEADING',
    ambientLuxLevel: 480, // Thiếu sáng (< 500 lux)
    breaksTakenCount: 0,
    totalRestMinutes: 0,
  });

  assert.equal(fatigue.artisanId, 'ART-EMBROIDERY-09');
  assert.ok(fatigue.effectiveFatigueFactor > 1.0);
  assert.ok(fatigue.stitchDefectProbabilityPercent > 1.5);
  assert.ok(fatigue.qualityAssuranceIndexQai < 98);
  assert.equal(fatigue.mandatoryBreakRequired, true);
  assert.ok(fatigue.recommendedBreakDurationMinutes >= 15);
  assert.ok(['HIGH_DEFECT_RISK', 'CRITICAL_EXHAUSTION', 'MODERATE_FATIGUE'].includes(fatigue.ergonomicRiskTier));
  assert.ok(fatigue.ergonomicCertificate.startsWith('#ERGONOMIC-QAI-'));
});

test('Priority Rush Bespoke Surcharge Arbiter calculates disruption compensation and preserves exact Dong', () => {
  const rushTest = arbitratePriorityRushBespokeSurcharge({
    rushOrderId: 'ORD-RUSH-GALA-99',
    baseGarmentPriceVnd: 12000000, // 12 triệu đ
    requestedLeadTimeHours: 48, // 48h hỏa tốc (thay vì 240h = 10 ngày)
    standardLeadTimeHours: 240,
    artisanOvertimeHours: 16,
    overtimeHourlyRateVnd: 90000,
    displacedOrders: [
      { orderId: 'ORD-DELAY-01', customerTier: 'PLATINUM', originalDueDateIso: '2026-06-22T10:00:00Z', delayedDays: 2, orderValueVnd: 8500000 },
      { orderId: 'ORD-DELAY-02', customerTier: 'GOLD', originalDueDateIso: '2026-06-23T10:00:00Z', delayedDays: 1, orderValueVnd: 4500000 },
    ],
  });

  assert.equal(rushTest.rushOrderId, 'ORD-RUSH-GALA-99');
  assert.equal(rushTest.baseGarmentPriceVnd, 12000000);
  // (240 - 48) / 240 = 192 / 240 = 80% compression
  assert.equal(rushTest.leadTimeCompressionRatioPercent, 80.0);
  // Overtime pay: 16 * 90000 * 1.5 = 2,160,000 VND
  assert.equal(rushTest.artisanOvertimePayVnd, 2160000);
  assert.ok(rushTest.totalDisplacedCompensationVnd > 0);
  assert.equal(rushTest.displacedCustomerCompensations.length, 2);
  assert.ok(rushTest.scarcityYieldPremiumVnd > 0);
  assert.equal(rushTest.exactDongConservationPreserved, true);
  assert.equal(rushTest.finalRushGarmentPriceVnd, rushTest.baseGarmentPriceVnd + rushTest.totalRushSurchargeVnd);
  assert.ok(rushTest.rushArbitrationCertificate.startsWith('#RUSH-BESPOKE-ARBITER-'));
});










test('Vietnamese diacritic folding, Damerau-Levenshtein transposition, fuzzy search and prefix autocomplete', () => {
  assert.equal(normalizeVietnameseText('Áo Dài Lụa Tơ Tằm Đỏ'), 'ao dai lua to tam do');
  assert.equal(normalizeVietnameseText(''), '');

  // Transposition cost = 1 ("lua" <-> "lau")
  assert.equal(calculateDamerauLevenshteinDistance('lua', 'lau'), 1);
  assert.equal(calculateDamerauLevenshteinDistance('linen', 'linen'), 0);

  const matchNoAccent = scoreFuzzyVietnameseMatch({
    query: 'ao dai lua',
    title: 'Áo Dài Lụa Tơ Tằm Bảo Lộc',
    material: '100% Lụa tự nhiên',
  });
  assert.equal(matchNoAccent.isMatch, true);
  assert.equal(matchNoAccent.exactPhraseBoost, true);
  assert.ok(matchNoAccent.score > 5);

  const matchTypo = scoreFuzzyVietnameseMatch({
    query: 'sơ mi lanhh',
    title: 'Áo Sơ Mi Lanh Normandy',
    material: 'Lanh hữu cơ',
  });
  assert.equal(matchTypo.isMatch, true);

  const suggestions = buildPrefixAutocompleteSuggestions({
    prefix: 'ao d',
    entries: [
      { id: '1', text: 'Áo Dài Lụa', kind: 'PRODUCT', popularityScore: 20 },
      { id: '2', text: 'Quần Tây Lanh', kind: 'PRODUCT', popularityScore: 50 },
      { id: '3', text: 'Áo Đũi Cổ Tàu', kind: 'PRODUCT', popularityScore: 10 },
    ],
    limit: 5,
  });
  assert.equal(suggestions.length, 2);
  assert.equal(suggestions[0].id, '1');
  assert.equal(suggestions[0].matchKind, 'PREFIX');
});

test('Hybrid product recommendation engine combines Collaborative Cosine/PMI with Content & Cold-Start', () => {
  const catalog = [
    { id: 'p1', name: 'Áo Dài Lụa Sen', categoryId: 'cat-aodai', material: 'Lụa tơ tằm', shopId: 's1', priceVnd: 2500000, positiveRatingsCount: 18, totalRatingsCount: 20 },
    { id: 'p2', name: 'Khăn Choàng Lụa Bảo Lộc', categoryId: 'cat-acc', material: 'Lụa tơ tằm', shopId: 's1', priceVnd: 850000, positiveRatingsCount: 10, totalRatingsCount: 10 },
    { id: 'p3', name: 'Áo Dài Gấm Thủ Công', categoryId: 'cat-aodai', material: 'Gấm lụa', shopId: 's2', priceVnd: 2700000, positiveRatingsCount: 15, totalRatingsCount: 16 },
    { id: 'p4', name: 'Quần Jean Denim', categoryId: 'cat-pants', material: 'Denim cotton', shopId: 's3', priceVnd: 900000, positiveRatingsCount: 2, totalRatingsCount: 10 },
  ];

  const interactions = [
    { userId: 'u1', productId: 'p1', weight: 3 },
    { userId: 'u1', productId: 'p2', weight: 3 },
    { userId: 'u2', productId: 'p1', weight: 3 },
    { userId: 'u2', productId: 'p2', weight: 3 },
    { userId: 'u3', productId: 'p4', weight: 3 },
  ];

  const cfRes = recommendHybridProducts({ targetProductId: 'p1', catalog, interactions, limit: 3 });
  assert.equal(cfRes.strategyUsed, 'HYBRID_CF_CONTENT');
  assert.equal(cfRes.recommendations.length, 3);
  assert.equal(cfRes.recommendations[0].productId, 'p2');
  assert.equal(cfRes.recommendations[0].reasonTag, 'CO_PURCHASED');
  assert.ok(cfRes.recommendations[0].collaborativeCosine > 0.9);

  // Cold-start fallback when no interactions exist
  const coldRes = recommendHybridProducts({ targetProductId: 'p1', catalog, interactions: [], limit: 3 });
  assert.equal(coldRes.strategyUsed, 'CONTENT_AND_QUALITY_COLD_START');
  assert.equal(coldRes.recommendations[0].productId, 'p3');
});

test('Order velocity and Z-score anomaly detector flags spend spikes and burst cancellations', () => {
  const normal = evaluateOrderVelocityAndAnomaly({
    currentOrderTotalVnd: 1250000,
    historicalOrderTotalsVnd: [1100000, 1200000, 1300000, 1250000],
    ordersInLast1Hour: 0,
    ordersInLast24Hours: 1,
    recentCancellations30d: 0,
    totalOrders30d: 4,
    isNewAddress: false,
    distinctShopsCount: 1,
  });
  assert.equal(normal.riskLevel, 'NORMAL');
  assert.equal(normal.velocityBurstDetected, false);

  const anomaly = evaluateOrderVelocityAndAnomaly({
    currentOrderTotalVnd: 18000000,
    historicalOrderTotalsVnd: [800000, 900000, 850000, 950000],
    ordersInLast1Hour: 4,
    ordersInLast24Hours: 9,
    recentCancellations30d: 4,
    totalOrders30d: 6,
    isNewAddress: true,
    distinctShopsCount: 4,
  });
  assert.equal(anomaly.velocityBurstDetected, true);
  assert.ok(anomaly.spendZScore > 5);
  assert.ok(anomaly.anomalyScore >= 75);
  assert.equal(anomaly.riskLevel, 'CRITICAL');
  assert.ok(anomaly.signals.length >= 4);
});

test('Holt exponential smoothing demand forecast and ABC-XYZ inventory matrix', () => {
  const res = forecastInventoryDemandAndAbcXyz({
    variants: [
      {
        variantId: 'v-hot',
        sku: 'SKU-HOT',
        productName: 'Áo Sơ Mi Lụa (Trắng / M)',
        unitPriceVnd: 2000000,
        onHand: 2,
        reserved: 0,
        weeklySalesHistory: [5, 7, 9, 12],
      },
      {
        variantId: 'v-dead',
        sku: 'SKU-DEAD',
        productName: 'Áo Khoác Dạ (Nâu / XL)',
        unitPriceVnd: 1500000,
        onHand: 30,
        reserved: 0,
        weeklySalesHistory: [0, 0, 0, 0],
      },
    ],
  });

  assert.equal(res.totalVariants, 2);
  assert.equal(res.stockoutImminentCount, 1);
  assert.equal(res.overstockCount, 1);

  const hot = res.items.find(i => i.variantId === 'v-hot')!;
  assert.equal(hot.abcClass, 'A');
  assert.equal(hot.healthStatus, 'STOCKOUT_IMMINENT');
  assert.ok(hot.forecastNextWeekUnits > 10);
  assert.ok(hot.recommendedRestockQty > 0);

  const dead = res.items.find(i => i.variantId === 'v-dead')!;
  assert.equal(dead.healthStatus, 'OVERSTOCK_DEADSTOCK');
  assert.equal(dead.recommendedRestockQty, 0);
});

test('Bayesian & Wilson 95% product rating summary and sliding-window rate limiter', () => {
  const emptyRating = computeProductRatingSummary({ ratings: [] });
  assert.equal(emptyRating.reviewCount, 0);
  assert.equal(emptyRating.wilsonLowerBound95, 0);

  const smallSample = computeProductRatingSummary({ ratings: [5, 5] });
  const largeSample = computeProductRatingSummary({ ratings: Array(20).fill(5) });
  assert.ok(largeSample.wilsonLowerBound95 > smallSample.wilsonLowerBound95);
  assert.ok(largeSample.bayesianAverage > smallSample.bayesianAverage);
  assert.equal(largeSample.positiveSharePct, 100);

  const now = 100_000;
  const rl1 = evaluateSlidingWindowRateLimit({
    timestampsMs: [50_000, 95_000, 98_000],
    nowMs: now,
    windowMs: 10_000,
    maxRequests: 3,
  });
  // 50_000 is outside [90_000, 100_000], so 2 active requests -> allowed
  assert.equal(rl1.allowed, true);
  assert.equal(rl1.currentCount, 3);
  assert.equal(rl1.remaining, 0);

  const rl2 = evaluateSlidingWindowRateLimit({
    timestampsMs: rl1.activeTimestampsMs,
    nowMs: now + 500,
    windowMs: 10_000,
    maxRequests: 3,
  });
  assert.equal(rl2.allowed, false);
  assert.ok(rl2.retryAfterMs > 0);
});

test('RFM segmentation, BG/NBD survival probability, 12M CLV and newbie voucher eligibility guard', () => {
  const now = Date.parse('2026-11-28T00:00:00Z');
  const newbie = evaluateCustomerRfmAndClv({
    userId: 'u-new',
    accountCreatedAtMs: now - 2 * 86_400_000,
    nowMs: now,
    orders: [],
  });
  assert.equal(newbie.tier, 'NEW_MEMBER');
  assert.equal(newbie.isNewMemberEligible, true);
  assert.ok(newbie.eligibleVoucherTiers.includes('WELCOME_NEWBIE'));

  const diamond = evaluateCustomerRfmAndClv({
    userId: 'u-vip',
    accountCreatedAtMs: now - 300 * 86_400_000,
    nowMs: now,
    orders: [
      { orderId: 'o1', createdAtMs: now - 90 * 86_400_000, netAmountVnd: 8_500_000, status: 'COMPLETED' },
      { orderId: 'o2', createdAtMs: now - 60 * 86_400_000, netAmountVnd: 9_200_000, status: 'COMPLETED' },
      { orderId: 'o3', createdAtMs: now - 30 * 86_400_000, netAmountVnd: 7_800_000, status: 'COMPLETED' },
      { orderId: 'o4', createdAtMs: now - 5 * 86_400_000, netAmountVnd: 6_500_000, status: 'COMPLETED' },
    ],
  });
  assert.equal(diamond.tier, 'DIAMOND');
  assert.equal(diamond.isNewMemberEligible, false);
  assert.ok(!diamond.eligibleVoucherTiers.includes('WELCOME_NEWBIE'));
  assert.ok(diamond.eligibleVoucherTiers.includes('VIP_DIAMOND'));
  assert.ok(diamond.survivalProbability > 0.85);
  assert.ok(diamond.projected12mClvVnd > 10_000_000);

  const atRisk = evaluateCustomerRfmAndClv({
    userId: 'u-atrisk',
    accountCreatedAtMs: now - 400 * 86_400_000,
    nowMs: now,
    orders: [
      { orderId: 'o1', createdAtMs: now - 210 * 86_400_000, netAmountVnd: 7_000_000, status: 'COMPLETED' },
      { orderId: 'o2', createdAtMs: now - 195 * 86_400_000, netAmountVnd: 8_000_000, status: 'COMPLETED' },
      { orderId: 'o3', createdAtMs: now - 180 * 86_400_000, netAmountVnd: 9_000_000, status: 'COMPLETED' },
    ],
  });
  assert.equal(atRisk.tier, 'AT_RISK_VIP');
  assert.ok(atRisk.eligibleVoucherTiers.includes('WINBACK_VIP'));
});

test('Market Basket Association Rules computes Lift, Conviction and exact-VND bundle discount split', () => {
  const catalog = [
    { productId: 'blazer', name: 'Blazer Linen Normandy', priceVnd: 2_450_000, categoryId: 'outer' },
    { productId: 'trousers', name: 'Quần Tây Lanh Xếp Ly', priceVnd: 1_350_000, categoryId: 'bottom' },
    { productId: 'scarf', name: 'Khăn Lụa Nha Xá', priceVnd: 650_000, categoryId: 'acc' },
    { productId: 'coat', name: 'Áo Khoác Dạ Biella', priceVnd: 4_200_000, categoryId: 'outer' },
  ];
  const baskets = [
    ['blazer', 'trousers'],
    ['blazer', 'trousers', 'scarf'],
    ['blazer', 'trousers'],
    ['coat'],
    ['coat', 'scarf'],
  ];

  const res = mineFrequentCoPurchaseBundles({
    anchorProductId: 'blazer',
    baskets,
    catalog,
    maxRules: 3,
  });

  assert.equal(res.totalBasketsAnalyzed, 5);
  assert.ok(res.rules.length >= 2);
  const topRule = res.rules[0];
  assert.equal(topRule.companionProductId, 'trousers');
  assert.equal(topRule.coOccurrenceCount, 3);
  assert.ok(topRule.lift > 1.2);
  assert.ok(topRule.conviction > 1.0);
  // Exact Dong conservation check
  assert.equal(topRule.allocatedItemDiscountsVnd[0] + topRule.allocatedItemDiscountsVnd[1], topRule.bundleDiscountVnd);
  assert.equal(topRule.bundleOriginalVnd - topRule.bundleDiscountVnd, topRule.bundleNetVnd);
});

test('Community EdgeRank applies follow affinity, time-decay gravity, report penalty and author diversity damping', () => {
  const now = 1_700_000_000_000;
  const ranked = rankCommunityFeedEdgeRank({
    nowMs: now,
    followedAuthorIds: ['author-followed'],
    posts: [
      { postId: 'spam-reported', authorId: 'author-spam', createdAtMs: now - 3600_000, reactionsCount: 3, savesCount: 0, commentsCount: 0, activeProductTagsCount: 0, openReportsCount: 4 },
      { postId: 'followed-fresh', authorId: 'author-followed', createdAtMs: now - 3600_000, reactionsCount: 5, savesCount: 3, commentsCount: 2, activeProductTagsCount: 2, openReportsCount: 0 },
      { postId: 'followed-dup-2', authorId: 'author-followed', createdAtMs: now - 3700_000, reactionsCount: 5, savesCount: 3, commentsCount: 2, activeProductTagsCount: 2, openReportsCount: 0 },
      { postId: 'other-viral', authorId: 'author-other', createdAtMs: now - 3600_000, reactionsCount: 6, savesCount: 3, commentsCount: 2, activeProductTagsCount: 2, openReportsCount: 0 },
    ],
  });

  assert.equal(ranked[0].postId, 'followed-fresh');
  // Second post by same author gets 0.55 diversity damping so 'other-viral' interleaves ahead of 'followed-dup-2'
  assert.equal(ranked[1].postId, 'other-viral');
  assert.equal(ranked[2].postId, 'followed-dup-2');
  assert.equal(ranked[2].diversityPenalty, 0.55);
  assert.equal(ranked[3].postId, 'spam-reported');
});

test('Directed Fraud Graph detects affiliate collusion cycles, shared-address Sybils and serial wardrobing', () => {
  const audit = detectAffiliateAndReturnAbuseGraph({
    referrals: [
      { orderId: 'ord-1', buyerId: 'uA', affiliateUserId: 'uB', amountVnd: 2_000_000 },
      { orderId: 'ord-2', buyerId: 'uB', affiliateUserId: 'uC', amountVnd: 2_200_000 },
      { orderId: 'ord-3', buyerId: 'uC', affiliateUserId: 'uA', amountVnd: 1_900_000 },
      { orderId: 'ord-sybil', buyerId: 'uSybil1', affiliateUserId: 'uSybil2', amountVnd: 3_000_000 },
    ],
    addresses: [
      { userId: 'uSybil1', phone: '0901234567', addressLine: '12 Nguyễn Huệ, Quận 1', province: 'TP. Hồ Chí Minh' },
      { userId: 'uSybil2', phone: '+84 901 234 567', addressLine: '12 Nguyen Hue Quan 1', province: 'TP Ho Chi Minh' },
    ],
    returnStats: [
      { userId: 'uWardrober', deliveredOrdersCount: 5, returnRequestsCount: 4, lateWindowReturnsCount: 4 },
      { userId: 'uNormal', deliveredOrdersCount: 10, returnRequestsCount: 1, lateWindowReturnsCount: 0 },
    ],
  });

  assert.equal(audit.overallRiskStatus, 'RING_DETECTED');
  assert.equal(audit.referralCycles.length, 1);
  assert.deepEqual(audit.referralCycles[0], ['uA', 'uB', 'uC', 'uA']);
  assert.equal(audit.sybilAddressClusters.length, 1);
  assert.deepEqual(audit.sybilAddressClusters[0].userIds, ['uSybil1', 'uSybil2']);
  assert.ok(audit.selfDealingOrderIds.includes('ord-sybil'));
  assert.equal(audit.wardrobingSuspects.length, 1);
  assert.equal(audit.wardrobingSuspects[0].userId, 'uWardrober');
});

test('Log-Log OLS Dynamic Price Elasticity respects cost floor and +/-15% circuit-breaker guardrails', () => {
  const scarcity = optimizeDynamicPriceElasticity({
    variantId: 'v-scarce',
    sku: 'SKU-SCARCE',
    currentPriceVnd: 2_000_000,
    availableStock: 2,
    observations: [
      { unitPriceVnd: 1_900_000, unitsSold: 12 },
      { unitPriceVnd: 2_000_000, unitsSold: 10 },
      { unitPriceVnd: 2_100_000, unitsSold: 9 },
    ],
  });
  assert.equal(scarcity.action, 'MARKUP_SCARCITY');
  assert.ok(scarcity.recommendedPriceVnd > 2_000_000);
  assert.ok(scarcity.recommendedPriceVnd <= 2_300_000); // max +15%

  const overstock = optimizeDynamicPriceElasticity({
    variantId: 'v-slow',
    sku: 'SKU-SLOW',
    currentPriceVnd: 2_000_000,
    unitCostFloorVnd: 900_000,
    availableStock: 45,
    observations: [
      { unitPriceVnd: 2_000_000, unitsSold: 1 },
      { unitPriceVnd: 1_800_000, unitsSold: 3 },
    ],
  });
  assert.equal(overstock.action, 'MARKDOWN_CLEARANCE');
  assert.ok(overstock.recommendedPriceVnd < 2_000_000);
  assert.ok(overstock.recommendedPriceVnd >= 1_700_000); // max -15% step & above cost floor * 1.15
});

test('SHA-256 Binary Merkle Tree verifies O(log N) inclusion proofs and detects ledger tampering', () => {
  const entries = [
    { id: 'e1', kind: 'COD_COLLECTED_BY_CARRIER', amount: 2_500_000, sourceKey: 'cod:so1' },
    { id: 'e2', kind: 'TAX_WITHHOLDING_VAT_PIT', amount: -37_500, sourceKey: 'tax:so1' },
    { id: 'e3', kind: 'COD_COLLECTED_BY_CARRIER', amount: 1_800_000, sourceKey: 'cod:so2' },
    { id: 'e4', kind: 'PAYOUT_ESCROW_WITHDRAWAL', amount: -1_000_000, sourceKey: 'payout:shop1:ref1' },
    { id: 'e5', kind: 'REFUND_DEBIT', amount: -250_000, sourceKey: 'refund:rr1' },
  ];

  const audit = computeLedgerMerkleAudit(entries);
  assert.equal(audit.invariantsValid, true);
  assert.equal(audit.leafCount, 5);
  assert.equal(audit.netBalanceVnd, 3_012_500);

  for (const e of entries) {
    const p = audit.proofsByEntryId[e.id];
    assert.ok(p);
    assert.equal(
      verifyMerkleInclusionProof({ leafHash: p.leafHash, steps: p.steps, expectedRoot: audit.merkleRoot }),
      true,
    );
    // Tampering with expectedRoot or leafHash must fail closed
    assert.equal(
      verifyMerkleInclusionProof({ leafHash: '0'.repeat(64), steps: p.steps, expectedRoot: audit.merkleRoot }),
      false,
    );
  }

  // Invariant violation detection: duplicate sourceKey & excessive payout
  const badAudit = computeLedgerMerkleAudit([
    { id: 'b1', kind: 'COD_COLLECTED_BY_CARRIER', amount: 500_000, sourceKey: 'dup:1' },
    { id: 'b2', kind: 'COD_COLLECTED_BY_CARRIER', amount: 500_000, sourceKey: 'dup:1' },
    { id: 'b3', kind: 'PAYOUT_ESCROW_WITHDRAWAL', amount: -2_000_000, sourceKey: 'payout:1' },
  ]);
  assert.equal(badAudit.invariantsValid, false);
  assert.ok(badAudit.violations.includes('DUPLICATE_SOURCE_KEY:dup:1'));
  assert.ok(badAudit.violations.includes('PAYOUT_EXCEEDS_TOTAL_INFLOWS'));
});

test('Voucher tier & newbie eligibility blocks UTE2026/NEW codes for Diamond members and gates VIP codes', () => {
  assert.equal(inferVoucherRequiredTier('UTE2026'), 'WELCOME_NEWBIE');
  assert.equal(inferVoucherRequiredTier('DIAMOND500'), 'VIP_DIAMOND');
  assert.equal(inferVoucherRequiredTier('CHAO50'), 'PUBLIC_ALL');

  // Diamond member (not newbie) MUST NOT be allowed to redeem UTE2026 newbie voucher
  const diamondUsingNewbie = checkVoucherEligibilityForCustomer({
    voucherCode: 'UTE2026',
    isNewMemberEligible: false,
    eligibleVoucherTiers: ['PUBLIC_ALL', 'VIP_DIAMOND', 'VIP_GOLD', 'VIP_SILVER'],
  });
  assert.equal(diamondUsingNewbie.eligible, false);
  assert.match(diamondUsingNewbie.reason ?? '', /khách hàng mới/);

  // Diamond member CAN redeem DIAMOND500, whereas Silver member CANNOT
  assert.equal(
    checkVoucherEligibilityForCustomer({
      voucherCode: 'DIAMOND500',
      isNewMemberEligible: false,
      eligibleVoucherTiers: ['PUBLIC_ALL', 'VIP_DIAMOND', 'VIP_GOLD', 'VIP_SILVER'],
    }).eligible,
    true,
  );
  assert.equal(
    checkVoucherEligibilityForCustomer({
      voucherCode: 'DIAMOND500',
      isNewMemberEligible: false,
      eligibleVoucherTiers: ['PUBLIC_ALL', 'VIP_SILVER'],
    }).eligible,
    false,
  );
});

test('Personalized PageRank & Empirical Bayes SLA ranks high-diversity reliable shops above wash-traded shops', () => {
  const rankings = computeSellerTrustAndPageRank({
    shops: [
      {
        shopId: 'shop-atelier-top',
        shopName: 'NÉP Heritage',
        isMall: true,
        deliveredCount: 45,
        cancelledOrExpiredCount: 1,
        disputedOrReturnedCount: 0,
        ratings: [5, 5, 5, 5, 4, 5, 5],
        buyerSpendEdges: [
          { buyerId: 'b1', netSpendVnd: 1_500_000 },
          { buyerId: 'b2', netSpendVnd: 2_100_000 },
          { buyerId: 'b3', netSpendVnd: 1_800_000 },
          { buyerId: 'b4', netSpendVnd: 3_200_000 },
          { buyerId: 'b1', netSpendVnd: 1_900_000 },
        ],
      },
      {
        shopId: 'shop-probation',
        shopName: 'Xưởng Chậm Trễ',
        isMall: false,
        deliveredCount: 4,
        cancelledOrExpiredCount: 9,
        disputedOrReturnedCount: 4,
        ratings: [2, 1, 2, 3],
        buyerSpendEdges: [{ buyerId: 'whale-1', netSpendVnd: 50_000_000 }],
      },
    ],
  });

  assert.equal(rankings[0].shopId, 'shop-atelier-top');
  assert.equal(rankings[0].trustTier, 'ATELIER_GRAND_CRU');
  assert.equal(rankings[0].mallEligibilityRecommended, true);
  assert.equal(rankings[0].distinctBuyers, 4);
  assert.equal(rankings[0].repeatBuyers, 1);
  assert.equal(rankings[1].shopId, 'shop-probation');
  assert.equal(rankings[1].trustTier, 'PROBATION_WATCH');
});

test('Generalized Vickrey Uniform-Price Limited-Drop Auction sets marginal clearing price and preserves Dong escrow', () => {
  const res = clearUniformPriceLimitedDropAuction({
    dropId: 'DROP-SILK-01',
    supplyUnits: 3,
    reservePriceVnd: 3_000_000,
    maxUnitsPerUser: 2,
    bids: [
      { bidId: 'b1', userId: 'u1', bidPriceVnd: 5_500_000, quantity: 3, submittedAtMs: 100 }, // capped at 2 units!
      { bidId: 'b2', userId: 'u2', bidPriceVnd: 4_800_000, quantity: 1, submittedAtMs: 200 }, // gets 3rd unit
      { bidId: 'b3', userId: 'u3', bidPriceVnd: 4_200_000, quantity: 1, submittedAtMs: 300 }, // highest rejected marginal bid!
      { bidId: 'b4', userId: 'u4', bidPriceVnd: 2_500_000, quantity: 1, submittedAtMs: 400 }, // below reserve
    ],
  });

  assert.equal(res.allocatedUnits, 3);
  assert.equal(res.isOversubscribed, true);
  // Clearing price equals highest rejected marginal bid (4,200,000 VND)
  assert.equal(res.clearingUnitPriceVnd, 4_200_000);
  assert.equal(res.totalGrossEscrowVnd, res.totalNetRevenueVnd + res.totalSurplusRefundedVnd);
  assert.equal(res.winners[0].allocatedQty, 2); // enforced maxUnitsPerUser=2
  assert.equal(res.winners[0].bidderSurplusRefundVnd, (5_500_000 - 4_200_000) * 2);
});

test('Clarke-Wright Savings + 2-Opt Milk-Run VRP saves distance vs star routing and respects vehicle capacity', () => {
  const depot = { lat: 21.0285, lng: 105.8542, name: 'Hub Hoàn Kiếm' };
  const stops = [
    { stopId: 's1', label: 'Đống Đa 1', lat: 21.015, lng: 105.825, weightKg: 12 },
    { stopId: 's2', label: 'Thanh Xuân 2', lat: 20.995, lng: 105.810, weightKg: 15 },
    { stopId: 's3', label: 'Cầu Giấy 3', lat: 21.035, lng: 105.795, weightKg: 14 },
    { stopId: 's4', label: 'Ba Đình 4', lat: 21.033, lng: 105.818, weightKg: 10 },
    { stopId: 's5', label: 'Long Biên 5', lat: 21.045, lng: 105.885, weightKg: 25 },
  ];

  const vrp = optimizeCourierMilkRunRouting({ depot, stops, vehicleCapacityKg: 45 });
  assert.ok(vrp.vehiclesUsed >= 2);
  assert.ok(vrp.optimizedTotalDistanceKm < vrp.naiveStarDistanceKm);
  assert.ok(vrp.savingsPct > 20);
  assert.ok(vrp.co2AbatedKg > 0);
  for (const r of vrp.routes) {
    assert.ok(r.totalWeightKg <= 45);
  }
});

test('Wald SPRT & Exact Quadrature Beta-Binomial A/B test detects winning promo and inconclusive samples', () => {
  const winnerB = evaluatePromoExperimentSequentialAb({
    controlA: { exposures: 400, conversions: 24, meanOrderValueVnd: 1_200_000 },
    treatmentB: { exposures: 400, conversions: 56, meanOrderValueVnd: 1_250_000 },
  });
  assert.equal(winnerB.sprtDecision, 'WINNER_B');
  assert.ok(winnerB.probBBeatsA > 0.99);
  assert.ok(winnerB.welchRevenueTStat > 2.5);

  const inconclusive = evaluatePromoExperimentSequentialAb({
    controlA: { exposures: 30, conversions: 3, meanOrderValueVnd: 1_000_000 },
    treatmentB: { exposures: 30, conversions: 4, meanOrderValueVnd: 1_000_000 },
  });
  assert.equal(inconclusive.sprtDecision, 'CONTINUE_SAMPLING');
});

test('Kirsch-Mitzenmacher Bloom Filter has zero false negatives and DecayedTinyLFU resists cache pollution', () => {
  const compromised = ['123456', 'qwerty123', 'nexora-leaked-2025', 'letmein!'];
  const bf = buildBloomFilter({ items: compromised, expectedCapacity: 100, falsePositiveRate: 0.005 });

  for (const item of compromised) {
    assert.equal(queryBloomFilter(bf, item), true);
  }
  assert.equal(queryBloomFilter(bf, 'Ultra$ecure_Atelier_Passphrase_99481!'), false);

  const lfu = new DecayedTinyLfuTracker(16, 60_000);
  const t0 = 1_000_000;
  for (let i = 0; i < 16; i++) {
    lfu.record(`hot item ${i}`, 5.0, t0);
  }
  lfu.record('Áo Dài Lụa', 20.0, t0);
  // Low-weight one-hit wonder (0.5 < minVal ~5.0) is rejected by TinyLFU admission policy
  lfu.record('random noise query', 0.5, t0);
  const top = lfu.topK(5, t0);
  assert.equal(top[0].normalizedKey, 'ao dai lua');
  assert.ok(!lfu.topK(16, t0).some(x => x.normalizedKey === 'random noise query'));
});

test('Branch-and-Bound Subset-Sum reconciles combined bank transfer across multiple VIETQR orders', () => {
  const candidates = [
    { orderId: 'o1', orderCode: 'NX-1001', userId: 'u-vip', totalVnd: 1_250_000, createdAtMs: 1000 },
    { orderId: 'o2', orderCode: 'NX-1002', userId: 'u-vip', totalVnd: 840_000, createdAtMs: 2000 },
    { orderId: 'o3', orderCode: 'NX-1003', userId: 'u-other', totalVnd: 1_250_000, createdAtMs: 1500 },
    { orderId: 'o4', orderCode: 'NX-1004', userId: 'u-vip', totalVnd: 610_000, createdAtMs: 3000 },
  ];

  // Combined transfer of 2,090,000 VND mentioning NX-1001 from u-vip matches {o1, o2} unambiguously
  const res = reconcileBatchOrdersSubsetSum({
    transferAmountVnd: 2_090_000,
    narrative: 'CHUYEN KHOAN GOP DON NX-1001 VA PHU KIEN',
    candidates,
  });
  assert.equal(res.matched, true);
  assert.equal(res.ambiguousMultipleMatches, false);
  assert.deepEqual(res.matchedOrderIds.sort(), ['o1', 'o2']);
  assert.equal(res.sumOrdersVnd, 2_090_000);
});

test('Successive Shortest Path Min-Cost Max-Flow finds exact minimum fulfillment cost across residual reroutes', () => {
  // Classic residual-reroute trap where greedy picks Hub1->Order1 (cost 10) forcing Hub2->Order2 (cost 100, total 110),
  // whereas Min-Cost Max-Flow uses reverse residual edge to assign Hub1->Order2 (cost 20) + Hub2->Order1 (cost 20) = 40!
  const res = solveMinCostMaxFlowOrderFulfillment({
    hubs: [
      { hubId: 'hub-hn', hubName: 'Kho Hà Nội', availableUnits: 5 },
      { hubId: 'hub-hcm', hubName: 'Kho Sài Gòn', availableUnits: 5 },
    ],
    demands: [
      { demandId: 'ord-1', requiredUnits: 5 },
      { demandId: 'ord-2', requiredUnits: 5 },
    ],
    arcs: [
      { hubId: 'hub-hn', demandId: 'ord-1', unitCostVnd: 10_000 },
      { hubId: 'hub-hn', demandId: 'ord-2', unitCostVnd: 20_000 },
      { hubId: 'hub-hcm', demandId: 'ord-1', unitCostVnd: 20_000 },
      { hubId: 'hub-hcm', demandId: 'ord-2', unitCostVnd: 100_000 },
    ],
  });

  assert.equal(res.totalFulfilledUnits, 10);
  assert.equal(res.unfulfilledUnits, 0);
  assert.equal(res.fillRatePct, 100);
  // Optimal: 5 * 20,000 + 5 * 20,000 = 200,000 (beats naive greedy 5 * 10,000 + 5 * 100,000 = 550,000!)
  assert.equal(res.totalMinimumCostVnd, 200_000);
});

test('Shapley Value multi-touch KOC attribution splits exact VND pool with discovery-closing synergy', () => {
  const now = 1_700_000_000_000;
  const res = computeShapleyMultiTouchAttribution({
    totalCommissionPoolVnd: 175_003,
    conversionTimestampMs: now,
    touchpoints: [
      { kocUserId: 'koc-livestream', channel: 'LIVESTREAM_HOST', timestampMs: now - 6 * 3_600_000, engagementQualityScore: 1.5 },
      { kocUserId: 'koc-ootd', channel: 'OOTD_POST', timestampMs: now - 12 * 3_600_000, engagementQualityScore: 1.2 },
      { kocUserId: 'koc-closer', channel: 'DIRECT_SHARE_LINK', timestampMs: now - 1 * 3_600_000, engagementQualityScore: 1.0 },
    ],
  });

  assert.equal(res.uniqueCreatorsCount, 3);
  assert.equal(res.exactDongPreserved, true);
  const sum = res.payouts.reduce((s, p) => s + p.allocatedCommissionVnd, 0);
  assert.equal(sum, 175_003);
  assert.ok(res.payouts.every(p => p.allocatedCommissionVnd > 0));
});

test('Page Two-Sided Tabular CUSUM over robust MAD detects sustained GMV drop without outlier contamination', () => {
  const series = [
    { label: 'd1', value: 10_000_000 },
    { label: 'd2', value: 10_200_000 },
    { label: 'd3', value: 9_900_000 },
    { label: 'd4', value: 10_100_000 },
    { label: 'd5', value: 10_050_000 },
    { label: 'd6', value: 9_950_000 },
    { label: 'd7', value: 4_000_000 },
    { label: 'd8', value: 3_800_000 },
  ];

  const monitor = detectTimeSeriesCusumAnomalies({ series });
  assert.equal(monitor.regimeStatus, 'DOWNWARD_DROP');
  assert.ok(monitor.anomalies.length >= 1);
  assert.equal(monitor.anomalies[0].direction, 'DROP_DOWN');
});

test('64-bit Charikar Vietnamese SimHash + LSH detects near-duplicate spam while separating distinct garments', () => {
  const h1 = computeVietnameseSimHash64('Áo sơ mi lụa tơ tằm Bảo Lộc dệt thủ công thoáng khí mềm mại mùa hè');
  const h2 = computeVietnameseSimHash64('Ao so mi lua to tam Bao Loc det thu cong thoang khi mem mai mua he!');
  const h3 = computeVietnameseSimHash64('Quần âu dạ lông cừu Biella xếp ly đôi đứng phom công sở mùa đông');

  assert.equal(hammingDistanceSimHash64(h1, h2), 0);
  assert.ok(hammingDistanceSimHash64(h1, h3) > 15);

  const scan = detectNearDuplicateTextsSimHash({
    maxHammingDistance: 6,
    documents: [
      { id: 'rev-1', text: 'Sản phẩm vải lanh cực kỳ thoáng mát đường may tinh tế giao hàng rất nhanh', authorId: 'u1' },
      { id: 'rev-2', text: 'San pham vai lanh cuc ky thoang mat duong may tinh te giao hang rat nhanh!!', authorId: 'u2' },
      { id: 'rev-3', text: 'Áo măng tô dạ giữ ấm tuyệt vời nhưng phần tay hơi dài so với chiều cao 1m60', authorId: 'u3' },
    ],
  });
  assert.equal(scan.duplicatePairs.length, 1);
  assert.equal(scan.duplicatePairs[0].idA, 'rev-1');
  assert.equal(scan.duplicatePairs[0].idB, 'rev-2');
});

test('Markowitz Mean-Variance Assortment Portfolio deploys capital within budget and diversifies HHI', () => {
  const portfolio = optimizeShopAssortmentPortfolio({
    budgetVnd: 10_000_000,
    riskAversionLambda: 0.4,
    candidates: [
      { variantId: 'v-shirt', sku: 'SHIRT-M', categoryId: 'ao', unitRestockCostVnd: 500_000, expectedNetMarginPerUnitVnd: 420_000, weeklyDemandMean: 4, weeklyDemandStdDev: 0.8 },
      { variantId: 'v-pants', sku: 'PANTS-M', categoryId: 'quan', unitRestockCostVnd: 600_000, expectedNetMarginPerUnitVnd: 480_000, weeklyDemandMean: 3.5, weeklyDemandStdDev: 0.9 },
      { variantId: 'v-dress', sku: 'DRESS-S', categoryId: 'vay', unitRestockCostVnd: 800_000, expectedNetMarginPerUnitVnd: 650_000, weeklyDemandMean: 2.5, weeklyDemandStdDev: 0.7 },
    ],
  });

  assert.ok(portfolio.capitalDeployedVnd > 0 && portfolio.capitalDeployedVnd <= 10_000_000);
  assert.equal(portfolio.capitalDeployedVnd + portfolio.remainingCashVnd, 10_000_000);
  assert.ok(portfolio.expectedTotalProfitVnd > 0);
  assert.ok(portfolio.allocations.length >= 2);
  // Multi-category diversification yields HHI strictly below 10,000 (monopoly)
  assert.ok(portfolio.categoryHhiIndex < 8000);
});

test('Outbox Retry & Circuit Scheduler enforces deterministic-jitter backoff and quarantines poison events', () => {
  const now = 1_700_000_000_000;
  const plan = planOutboxRetryAndCircuitSchedule({
    nowMs: now,
    baseDelayMs: 2000,
    maxAttempts: 5,
    events: [
      { id: 'ev-fresh', kind: 'ORDER_CREATED', attempts: 0, createdAtMs: now - 100 },
      { id: 'ev-waiting', kind: 'ORDER_CREATED', attempts: 3, createdAtMs: now - 500 }, // needs >= 4000ms..8000ms
      { id: 'ev-ready-retry', kind: 'ORDER_EXPIRED', attempts: 1, createdAtMs: now - 10_000 },
      { id: 'ev-poison', kind: 'WEBHOOK_SYNC', attempts: 5, createdAtMs: now - 999_999 },
    ],
  });

  assert.deepEqual(plan.readyIds, ['ev-fresh', 'ev-ready-retry']);
  assert.equal(plan.waitingCount, 1);
  assert.equal(plan.deadLetterCount, 1);
  assert.equal(plan.circuitState, 'HALF_OPEN_DEGRADED');
});
