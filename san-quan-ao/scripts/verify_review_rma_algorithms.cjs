/**
 * Verification Script: Module 15 - Post-Purchase Trust, Bayesian Review Credibility & Reverse Logistics Circular RMA
 * Tests Algorithms 67, 68, 69, 70 against live NestJS API endpoints.
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
  console.log('🧪 MODULE 15 E2E VERIFICATION: REVIEW CREDIBILITY & REVERSE LOGISTICS (ALGS 67-70)');
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
  // 1. Algorithm 67: Bayesian Review Credibility & Wilson Score 95%
  // ----------------------------------------------------------------------------
  console.log('--- 1. Testing Algorithm 67: Bayesian Review Credibility (/reviews/credibility-audit) ---');

  const testReviews = [
    { rating: 5, body: 'Sơ mi linen dệt thoi Normandy mặc vào rất thoáng mát, phom dáng chuẩn chỉ từng đường kim mũi chỉ.', isVerifiedPurchase: true, hasImages: true, userOrderCount: 4 },
    { rating: 5, body: 'Đường may mí Pháp sạch sẽ không một sợi chỉ thừa, khuy xà cừ tự nhiên óng ánh cao cấp.', isVerifiedPurchase: true, hasImages: true, userOrderCount: 5 },
    { rating: 4, body: 'Màu cát mộc rất nhã nhặn, hơi nhăn nhẹ đặc trưng của sợi lanh tự nhiên nhưng ủi hơi nước là phẳng.', isVerifiedPurchase: true, hasImages: false },
    { rating: 5, body: 'Giao hàng bao bì nilon sinh học sắn chu đáo, bưu tá lịch sự.', isVerifiedPurchase: true, hasImages: true },
    { rating: 5, body: 'Mặc lên phom ve đứng rất sang trọng, tôn dáng.', isVerifiedPurchase: true, hasImages: false },
    { rating: 5, body: 'Áo đẹp, chất lượng hoàn thiện tuyệt hảo, đúng tinh thần slow fashion.', isVerifiedPurchase: true, hasImages: false },
  ];

  const auditRes = await request('/reviews/credibility-audit', 'POST', {
    reviews: testReviews,
    priorMean: 4.5,
    priorWeight: 5.0,
  }, {}, sessionCookie);
  assert.equal(auditRes.status, 201);
  console.log('Bayesian Review Audit Result:', {
    sampleSize: auditRes.body.sampleSize,
    arithmeticMeanRating: auditRes.body.arithmeticMeanRating,
    bayesianMeanRating: auditRes.body.bayesianMeanRating,
    wilsonLowerBound95Pct: auditRes.body.wilsonLowerBound95Pct,
    credibilityTier: auditRes.body.credibilityTier,
  });
  assert.equal(auditRes.body.sampleSize, 6);
  assert.equal(auditRes.body.credibilityTier, 'HAUTE_VERIFIED_EXCELLENCE');
  assert.ok(auditRes.body.bayesianMeanRating >= 4.6);
  assert.ok(auditRes.body.wilsonLowerBound95Pct > 60.0);
  console.log('✅ Algorithm 67 Verified: Empirical Bayes M-Estimate and Wilson 95% Lower Bound active!\n');

  // ----------------------------------------------------------------------------
  // 2. Algorithm 68: Anti-Astroturfing & Collusion Review Detection
  // ----------------------------------------------------------------------------
  console.log('--- 2. Testing Algorithm 68: Anti-Astroturfing Detection (/reviews/anti-astroturfing) ---');

  const astroturfingBatch = [
    { id: 'rev-01', userId: 'bot-1', body: 'Áo đẹp tuyệt vời mọi người ơi chất lượng đỉnh cao nên mua ngay nhé', rating: 5, ip: '118.69.182.50', createdAt: new Date() },
    { id: 'rev-02', userId: 'bot-2', body: 'Áo đẹp tuyệt vời mọi người ơi chất lượng đỉnh cao nên mua ngay nhé', rating: 5, ip: '118.69.182.50', createdAt: new Date() },
    { id: 'rev-03', userId: 'bot-3', body: 'Áo đẹp tuyệt vời mọi người ơi chất lượng đỉnh cao nên mua ngay nhé', rating: 5, ip: '118.69.182.50', createdAt: new Date() },
  ];

  const astroRes = await request('/reviews/anti-astroturfing', 'POST', {
    candidateReviews: astroturfingBatch,
  }, {}, sessionCookie);
  assert.equal(astroRes.status, 201);
  console.log('Astroturfing Detection Result:', {
    astroturfingSuspected: astroRes.body.astroturfingSuspected,
    collusionRiskScore: astroRes.body.collusionRiskScore,
    fraudReason: astroRes.body.fraudReason,
    flaggedReviewIds: astroRes.body.flaggedReviewIds,
  });
  assert.equal(astroRes.body.astroturfingSuspected, true);
  assert.ok(astroRes.body.collusionRiskScore >= 50);
  assert.ok(astroRes.body.flaggedReviewIds.length >= 2);
  console.log('✅ Algorithm 68 Verified: Sybil IP and text template collusion ring caught!\n');

  // ----------------------------------------------------------------------------
  // 3. Algorithm 69: Reverse Logistics Carbon Routing Optimization
  // ----------------------------------------------------------------------------
  console.log('--- 3. Testing Algorithm 69: Reverse Logistics Doorstep Routing (/returns/reverse-logistics) ---');

  const routingRes = await request('/returns/reverse-logistics', 'POST', {
    customerLocation: { latitude: 21.0285, longitude: 105.8542, district: 'Hoàn Kiếm, Hà Nội' },
    primaryWorkshop: { workshopId: 'ws-nep', name: 'NÉP Studio Ba Đình', latitude: 21.0333, longitude: 105.8200, canRestoreFabric: true },
    centralHub: { hubId: 'hub-gl', name: 'NEXORA Central Sorting Hub', latitude: 21.0500, longitude: 105.9000 },
    requestKind: 'DOORSTEP_EXCHANGE',
    itemWeightKg: 0.65,
  }, {}, sessionCookie);
  assert.equal(routingRes.status, 201);
  console.log('Reverse Logistics Routing Result:', {
    recommendedDestination: routingRes.body.recommendedDestination,
    destinationName: routingRes.body.destinationName,
    transitDistanceKm: routingRes.body.transitDistanceKm,
    carbonAbatementKgCo2e: routingRes.body.carbonAbatementKgCo2e,
    isDoorstepConsolidated: routingRes.body.isDoorstepConsolidated,
    reverseLogisticsCode: routingRes.body.reverseLogisticsCode,
  });
  assert.equal(routingRes.body.recommendedDestination, 'WORKSHOP_DIRECT');
  assert.equal(routingRes.body.destinationName, 'NÉP Studio Ba Đình');
  assert.equal(routingRes.body.isDoorstepConsolidated, true);
  assert.ok(routingRes.body.carbonAbatementKgCo2e > 0);
  assert.ok(routingRes.body.reverseLogisticsCode.startsWith('#REV-LOG-VN-'));
  console.log('✅ Algorithm 69 Verified: Single-stop doorstep exchange carbon abatement computed!\n');

  // ----------------------------------------------------------------------------
  // 4. Algorithm 70: RMA Wear-and-Tear Condition & Reconditioning Restitution
  // ----------------------------------------------------------------------------
  console.log('--- 4. Testing Algorithm 70: RMA Condition Restitution (/returns/rma-restitution) ---');

  // 4a. Pristine return (100% refund)
  const pristineRma = await request('/returns/rma-restitution', 'POST', {
    originalItemPriceVnd: 1850000,
    condition: 'SEAL_INTACT_UNWORN',
    fabricType: 'SILK',
  }, {}, sessionCookie);
  assert.equal(pristineRma.status, 201);
  console.log('Pristine Seal Restitution:', {
    originalPriceVnd: pristineRma.body.originalPriceVnd,
    deductionVnd: pristineRma.body.deductionVnd,
    netRefundVnd: pristineRma.body.netRefundVnd,
    circularStream: pristineRma.body.circularStream,
  });
  assert.equal(pristineRma.body.deductionVnd, 0);
  assert.equal(pristineRma.body.netRefundVnd, 1850000);
  assert.equal(pristineRma.body.circularStream, 'PRIMARY_LUXURY_STOCK');
  assert.equal(pristineRma.body.exactDongPreserved, true);

  // 4b. Perfume odor return (Supercritical ozone neutralization deduction)
  const perfumeRma = await request('/returns/rma-restitution', 'POST', {
    originalItemPriceVnd: 1850000,
    condition: 'PERFUME_ODOR',
    fabricType: 'SILK',
  }, {}, sessionCookie);
  assert.equal(perfumeRma.status, 201);
  console.log('Perfume Odor Restitution:', {
    deductionVnd: perfumeRma.body.deductionVnd,
    netRefundVnd: perfumeRma.body.netRefundVnd,
    reconditioningMethod: perfumeRma.body.reconditioningMethod,
    rmaCertificateCode: perfumeRma.body.rmaCertificateCode,
  });
  assert.equal(perfumeRma.body.deductionVnd, 75000);
  assert.equal(perfumeRma.body.netRefundVnd, 1850000 - 75000);
  assert.equal(perfumeRma.body.exactDongPreserved, true);
  assert.ok(perfumeRma.body.rmaCertificateCode.startsWith('#RMA-KCS-'));
  console.log('✅ Algorithm 70 Verified: Exact Dong invariant preserved with physical reconditioning!\n');

  console.log('==============================================================================');
  console.log('🎉 ALL MODULE 15 VERIFICATIONS PASSED (100% INVARIANTS SATISFIED)!');
  console.log('==============================================================================');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
