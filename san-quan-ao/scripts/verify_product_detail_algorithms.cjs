/**
 * Verification script for Module 9: Bespoke Product Detail, Smart Fit Anthropometrics & Handcrafted Provenance
 * Algorithms 43, 44, 45, 46
 */

const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      'Origin': 'http://localhost:3000',
    };
    const reqHeaders = { ...defaultHeaders, ...options.headers };
    const payload = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const finalOptions = {
      ...options,
      headers: reqHeaders,
    };
    const req = http.request(finalOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== [MODULE 9] BESPOKE PRODUCT DETAIL & PROVENANCE VERIFICATION ===\n');

  // 1. Fetch available products
  console.log('1. Querying active product catalog...');
  const catRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/v1/products?page=1',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!catRes.data || !catRes.data.items || catRes.data.items.length === 0) {
    throw new Error('No products found in catalog: ' + JSON.stringify(catRes.data));
  }

  const sampleProduct = catRes.data.items[0];
  console.log(`   Found product: "${sampleProduct.name}" (ID: ${sampleProduct.id}, Slug: ${sampleProduct.slug})\n`);

  // 2. Algorithm 43: Fabric Drape Wave & Viscoelastic Rheology Radar
  console.log('2. Testing Algorithm 43: Fabric Drape Rheology Radar (POST /products/:id/drape-radar)...');
  const drapeRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/v1/products/${sampleProduct.id}/drape-radar`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    materialName: '100% Linen hữu cơ Normandy dệt mộc',
    specimenDiameterMm: 300,
    supportDiscDiameterMm: 180,
    measuredGsm: 185,
    measuredBendingLengthCm: 2.1,
  });

  if (drapeRes.status !== 201 && drapeRes.status !== 200) {
    throw new Error(`Drape radar failed (${drapeRes.status}): ` + JSON.stringify(drapeRes.data));
  }

  const drape = drapeRes.data.drapeRadar;
  console.log(`   Cusick Coefficient: ${drape.cusickDrapeCoefficientPct}% (${drape.drapeGrade})`);
  console.log(`   Peirce Bending Rigidity: ${drape.bendingRigidityMgCm} mg·cm | Dynamic Fluidity: ${drape.dynamicFluidityScore}/100`);
  console.log(`   Wave Parameters: ${drape.dynamicWaveParams.nodeCount} nodes, ${drape.dynamicWaveParams.frequencyHz} Hz, ${drape.dynamicWaveParams.amplitudeMm} mm`);
  if (drape.cusickDrapeCoefficientPct !== 34.2 || drape.drapeGrade !== 'GRADE_A_FLUID') {
    throw new Error('Drape radar output assertion failed');
  }
  console.log('   ✓ Algorithm 43 PASSED\n');

  // 3. Algorithm 44: Smart Fit Morphological Anthropometry & Silhouette 2D Simulator
  console.log('3. Testing Algorithm 44: Silhouette Anthropometric 2D Fit (POST /products/:id/silhouette-fit)...');
  const fitRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/v1/products/${sampleProduct.id}/silhouette-fit`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    archetype: 'ATHLETIC',
    userHeightCm: 166,
    userWeightKg: 52,
    userChestCm: 86,
    userWaistCm: 66,
    userHipCm: 92,
    fitPreference: 'REGULAR',
  });

  if (fitRes.status !== 201 && fitRes.status !== 200) {
    throw new Error(`Silhouette fit failed (${fitRes.status}): ` + JSON.stringify(fitRes.data));
  }

  const fit = fitRes.data.silhouetteFit;
  console.log(`   Detected Archetype: ${fit.detectedArchetype} -> Recommended Size: ${fit.recommendedSize} (Match: ${fit.overallMatchScore}%)`);
  console.log(`   Ease Clearance: Chest +${fit.easeClearanceVector.chestEaseCm}cm, Waist +${fit.easeClearanceVector.waistEaseCm}cm, Hip +${fit.easeClearanceVector.hipEaseCm}cm`);
  console.log(`   Comfort Verdict: ${fit.comfortVerdict} | Seam Strain Risk: ${fit.seamStrainRiskIndexPct}%`);
  console.log(`   Hemline Drop Prediction: ${fit.hemlineDropPrediction.predictedHemlinePosition} (delta ${fit.hemlineDropPrediction.hemlineDropDeltaCm}cm)`);
  if (fit.recommendedSize !== 'M' || fit.comfortVerdict !== 'OPTIMAL_EASE') {
    throw new Error('Silhouette fit assertion failed');
  }
  console.log('   ✓ Algorithm 44 PASSED\n');

  // 4. Algorithm 45: Bespoke Atelier Pre-Order & Monogram Crafting Queue
  console.log('4. Testing Algorithm 45: Bespoke Atelier Pre-Order & Escrow Queue (POST /products/:id/bespoke-preorder)...');
  const bespokeRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/v1/products/${sampleProduct.id}/bespoke-preorder`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    basePriceVnd: 2450000,
    selectedSize: 'M',
    selectedColor: 'Lụa Chàm Cổ Truyền',
    monogramInput: 'N.X.',
    selectedLining: 'SILK_JACQUARD',
    bespokeNotes: 'Hạ eo 1cm, tay áo may lửng qua mắt cá tay',
  });

  if (bespokeRes.status !== 201 && bespokeRes.status !== 200) {
    throw new Error(`Bespoke preorder failed (${bespokeRes.status}): ` + JSON.stringify(bespokeRes.data));
  }

  const bespoke = bespokeRes.data.bespokePreorder;
  console.log(`   Registration Code: ${bespoke.bespokeRegistrationCode}`);
  console.log(`   Sanitized Monogram: "${bespoke.sanitizedMonogram}" | Lining: ${bespoke.selectedLining} (+${bespoke.liningSurchargeVnd.toLocaleString('vi-VN')}₫)`);
  console.log(`   Total Price: ${bespoke.totalBespokePriceVnd.toLocaleString('vi-VN')}₫`);
  console.log(`   30% Escrow Deposit: ${bespoke.depositEscrow30PercentVnd.toLocaleString('vi-VN')}₫ | 70% Balance: ${bespoke.remainingBalance70PercentVnd.toLocaleString('vi-VN')}₫`);
  console.log(`   Exact Escrow Conservation: ${bespoke.exactEscrowPreservation} | Queue Slot: #${bespoke.assignedQueuePosition}/${bespoke.weeklyCapacityLimit}`);
  console.log(`   Artisanal Milestones Count: ${bespoke.artisanalMilestones.length} stages`);
  if (!bespoke.exactEscrowPreservation || bespoke.depositEscrow30PercentVnd !== 780000) {
    throw new Error('Bespoke escrow deposit math assertion failed');
  }
  console.log('   ✓ Algorithm 45 PASSED\n');

  // 5. Algorithm 46: Material Digital Product Passport (DPP) & Eco-Footprint LCA
  console.log('5. Testing Algorithm 46: Material DPP & LCA Provenance (GET /products/:id/passport)...');
  const passportRes = await request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/v1/products/${sampleProduct.id}/passport`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (passportRes.status !== 200) {
    throw new Error(`Product passport failed (${passportRes.status}): ` + JSON.stringify(passportRes.data));
  }

  const passport = passportRes.data.passport;
  console.log(`   Certificate Code: ${passport.certificateCode}`);
  console.log(`   Fiber: ${passport.fiberComposition}`);
  console.log(`   LCA Abatement: Carbon saved ${passport.ecoFootprint.carbonSavedKg} kg CO2e | Water saved ${passport.ecoFootprint.waterSavedLiters} L`);
  console.log(`   Total Artisan Handcraft: ${passport.totalCraftHours} hours across ${passport.artisans.length} master craftspeople`);
  console.log(`   Digital Signature: ${passport.digitalSignature}`);
  if (!passport.certificateCode.startsWith('NX-DPP-') || passport.totalCraftHours !== 34) {
    throw new Error('Material DPP assertion failed');
  }
  console.log('   ✓ Algorithm 46 PASSED\n');

  console.log('================================================================');
  console.log('ALL MODULE 9 BESPOKE PRODUCT DETAIL ALGORITHMS VERIFIED (100%)');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
