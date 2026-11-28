/**
 * Verification Script: Order Lifecycle, Atelier Tracking & White-Glove Escrow Delivery (Module 8)
 * Tests Algorithms 39, 40, 41, 42 through authenticated API endpoints.
 */

const http = require('http');

function postJson(path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1${path}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'X-Requested-With': 'mac-web',
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body), rawHeaders: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode, text: body, rawHeaders: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('================================================================');
  console.log('🚀 RUNNING VERIFICATION: MODULE 8 - ORDER DELIVERY & ESCROW ALGORITHMS');
  console.log('================================================================\n');

  // 1. Authenticate user
  console.log('1. Authenticating test user (buyer@mac.local)...');
  const loginRes = await postJson('/auth/login', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });

  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
  }

  const setCookie = loginRes.rawHeaders['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(';')[0]).join('; ') : '';
  const authHeaders = { Cookie: cookieHeader };
  console.log('✓ Successfully authenticated! Session active.\n');

  // 2. Test Algorithm 39: Proof-of-Delivery Security PIN & 3-Hub Weight Telemetry
  console.log('2. Testing Algorithm 39: POD Security PIN & 3-Hub Weight Telemetry...');
  const podRes = await postJson(
    '/orders/security/pod-verify',
    {
      orderCode: 'NX-6B124663',
      shopId: 'shop-nep',
      dispatchWeightGrams: 450,
      hubWeightGrams: 452,
      handoverWeightGrams: 450,
      enteredSecurityPin: '584144',
      weightToleranceGrams: 50,
    },
    authHeaders
  );

  if (podRes.status !== 200 && podRes.status !== 201) {
    throw new Error(`POD verify endpoint failed: ${JSON.stringify(podRes.data)}`);
  }

  const pod = podRes.data;
  console.log(`   - Order Code: ${pod.orderCode} (Shop: ${pod.shopId})`);
  console.log(`   - Expected Security PIN: ${pod.expectedSecurityPin}`);
  console.log(`   - Max Weight Delta (3-Hubs): ${pod.maxWeightDeltaGrams}g (Ngưỡng dung sai: ${pod.weightToleranceGrams}g)`);
  console.log(`   - Weight Integrity Passed: ${pod.weightIntegrityPassed}`);
  console.log(`   - Anomaly Alert: ${pod.anomalyAlert}`);
  console.log(`   - Proof-of-Delivery Hash: ${pod.proofOfDeliveryHash}`);
  console.log(`   - Advisory: ${pod.advisory}`);
  if (!pod.weightIntegrityPassed || pod.maxWeightDeltaGrams !== 2) {
    throw new Error('POD weight verification failed');
  }
  console.log('✓ Algorithm 39 (POD Security & Weight Telemetry) PASSED!\n');

  // 3. Test Algorithm 40: Weather-Adaptive Route Rerouting & Safety Buffer
  console.log('3. Testing Algorithm 40: Weather-Adaptive Route Rerouting & Safety Buffer...');
  const weatherRes = await postJson(
    '/orders/logistics/weather-reroute',
    {
      precipitationRateMmH: 62,
      windSpeedKmh: 45,
      floodingProbabilityPct: 68,
      baseDistanceKm: 8.4,
      baseEtaMinutes: 35,
    },
    authHeaders
  );

  if (weatherRes.status !== 200 && weatherRes.status !== 201) {
    throw new Error(`Weather reroute endpoint failed: ${JSON.stringify(weatherRes.data)}`);
  }

  const weather = weatherRes.data;
  console.log(`   - Weather Severity: ${weather.weatherSeverityLevel}`);
  console.log(`   - Dynamic Safety Buffer: +${weather.safetyBufferMinutes} minutes`);
  console.log(`   - Adjusted Delivery ETA: ${weather.adjustedEtaMinutes} minutes`);
  console.log(`   - Recommended Reschedule Slot: ${weather.recommendedSlotReschedule}`);
  console.log(`   - Packaging Protection: ${weather.packagingProtectionTier}`);
  console.log(`   - Compensation Bonus: +${weather.rescheduleCompensationCoins} NEX-Green Coins`);
  console.log(`   - Advisory: ${weather.advisory}`);
  if (weather.weatherSeverityLevel !== 'TORRENTIAL_FLOOD' || weather.packagingProtectionTier !== 'BIO_CASSAVA_3_LAYER') {
    throw new Error('Weather reroute verification mismatch');
  }
  console.log('✓ Algorithm 40 (Weather-Adaptive Rerouting) PASSED!\n');

  // 4. Test Algorithm 41: Digital Green-Mile EV Telemetry Passport
  console.log('4. Testing Algorithm 41: Digital Green-Mile EV Telemetry Passport...');
  const greenRes = await postJson(
    '/orders/logistics/green-mile',
    {
      orderCode: 'NX-6B124663',
      routeDistanceKm: 8.4,
      evVehicleModel: 'VinFast Feliz LFP 100% Eco Electric',
      batterySocPct: 84,
      avgSpeedKmh: 28.5,
    },
    authHeaders
  );

  if (greenRes.status !== 200 && greenRes.status !== 201) {
    throw new Error(`Green Mile endpoint failed: ${JSON.stringify(greenRes.data)}`);
  }

  const green = greenRes.data;
  console.log(`   - Route Distance: ${green.routeDistanceKm} km by ${green.evVehicleModel}`);
  console.log(`   - ICE Gasoline Baseline: ${green.iceBaselineEmissionKg} kg CO2e`);
  console.log(`   - EV Actual Emission: ${green.evEmissionKg} kg CO2e`);
  console.log(`   - Net Carbon Abated: ${green.netCarbonAbatedKg} kg CO2e`);
  console.log(`   - Equivalent Tree Absorption Days: ${green.equivalentTreeDays} days`);
  console.log(`   - Eco-Coins Minted: +${green.ecoCoinsMinted} Coins`);
  console.log(`   - Passport Certification: ${green.greenPassportCertificationCode}`);
  console.log(`   - Telemetry Hash: ${green.cryptographicTelemetryHash}`);
  if (green.netCarbonAbatedKg !== 0.574 || green.ecoCoinsMinted !== 100) {
    throw new Error('Green Mile carbon abatement mismatch');
  }
  console.log('✓ Algorithm 41 (Green-Mile EV Telemetry Passport) PASSED!\n');

  // 5. Test Algorithm 42: Online Arbitration Dispute Engine & Escrow Split
  console.log('5. Testing Algorithm 42: Online Arbitration Dispute Engine & Escrow Split...');
  const disputeRes = await postJson(
    '/orders/disputes/arbitrate',
    {
      disputeId: 'DISPUTE-8891',
      shopOrderId: 'shop-order-sample',
      escrowHeldAmountVnd: 1250000,
      disputeReason: 'DEFECTIVE_FABRIC',
      buyerEvidenceProvided: true,
      sellerPreShipmentProof: false,
      transitWeightDiscrepancy: false,
    },
    authHeaders
  );

  if (disputeRes.status !== 200 && disputeRes.status !== 201) {
    throw new Error(`Arbitration endpoint failed: ${JSON.stringify(disputeRes.data)}`);
  }

  const dispute = disputeRes.data;
  console.log(`   - Dispute ID: ${dispute.disputeId} (Escrow: ${dispute.escrowHeldAmountVnd.toLocaleString('vi-VN')}₫)`);
  console.log(`   - Fault Weights: Buyer ${dispute.buyerFaultWeight * 100}% | Seller ${dispute.sellerFaultWeight * 100}% | Logistics ${dispute.logisticsFaultWeight * 100}%`);
  console.log(`   - Refund to Buyer: ${dispute.refundToBuyerVnd.toLocaleString('vi-VN')}₫`);
  console.log(`   - Disburse to Seller: ${dispute.disburseToSellerVnd.toLocaleString('vi-VN')}₫`);
  console.log(`   - Exact Escrow Preservation: ${dispute.exactEscrowPreservation}`);
  console.log(`   - Arbitration Verdict: ${dispute.arbitrationVerdict}`);
  console.log(`   - Legal Basis: ${dispute.legalFrameworkArticle}`);
  console.log(`   - Settlement Contract Code: ${dispute.settlementContractCode}`);
  console.log(`   - Advisory: ${dispute.advisory}`);
  if (!dispute.exactEscrowPreservation || dispute.refundToBuyerVnd + dispute.disburseToSellerVnd !== 1250000) {
    throw new Error('Escrow penny preservation invariant violated!');
  }
  console.log('✓ Algorithm 42 (Online Dispute Arbitration Escrow Split) PASSED!\n');

  console.log('================================================================');
  console.log('🎉 ALL MODULE 8 ALGORITHMS & ENDPOINTS VERIFIED 100% PASSING!');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
