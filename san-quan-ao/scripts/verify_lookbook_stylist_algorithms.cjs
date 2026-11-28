// verify_lookbook_stylist_algorithms.cjs
// Comprehensive E2E Verification of Module 3: Lookbook, Mix & Match Studio & Color Harmony Stylist Engine
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
  console.log('🏛️  NEXORA LOOKBOOK, MIX & MATCH & COLOR HARMONY E2E VERIFICATION  🏛️');
  console.log('================================================================================\n');

  // 1. Authenticate buyer session
  console.log('[1] Authenticating customer session...');
  const userLogin = await request('/auth/login', 'POST', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });
  if (userLogin.status !== 200 && userLogin.status !== 201) {
    throw new Error(`Customer login failed: ${JSON.stringify(userLogin)}`);
  }
  const userCookie = extractCookie(userLogin.headers);
  console.log('✔ Customer authenticated successfully.\n');

  // 2. Test CIELAB Delta-E00 Color Harmony Stylist Engine
  console.log('[2] Testing CIELAB ΔE00 Color Harmony Stylist Engine (Quiet Luxury Tonal)...');
  const harmonyRes = await request('/vault/lookbook/color-harmony', 'POST', {
    hexColors: ['#dfd4bd', '#b89f82', '#f4ede1'], // Kem Mộc, Nâu Cát, Kem Sáng
  }, userCookie);

  if (harmonyRes.status !== 200 && harmonyRes.status !== 201) {
    throw new Error(`Color harmony failed: ${JSON.stringify(harmonyRes)}`);
  }
  const h = harmonyRes.data;
  console.log('  Color Harmony Results:');
  console.log(`  - Overall Harmony Score: ${h.overallHarmonyScore}/100`);
  console.log(`  - Harmony Classification: ${h.harmonyTier}`);
  console.log(`  - Pairwise ΔE00: ${h.pairwiseDeltaE.map(p => `${p.pair} (ΔE=${p.deltaE})`).join(', ')}`);
  console.log(`  - Stylist Advisory: ${h.aestheticRecommendation}`);

  if (h.overallHarmonyScore < 90 || !h.pairwiseDeltaE.length) {
    throw new Error('Color harmony produced substandard scores for quiet luxury palette');
  }
  console.log('✔ CIELAB ΔE00 color harmony engine mathematically verified.\n');

  // 3. Test ISO 9920 / ASHRAE 55 Garment Thermal Comfort Insulation (Clo)
  console.log('[3] Testing ISO 9920 / ASHRAE 55 Ensemble Insulation (Clo) & Weather Comfort...');
  const comfortRes = await request('/vault/lookbook/thermal-comfort', 'POST', {
    pieces: [
      { id: 'linen-shirt', category: 'top', material: 'Linen 100% thoáng khí' },
      { id: 'wide-trousers', category: 'bottom', material: 'Cotton 97%, spandex 3%' },
      { id: 'linen-blazer', category: 'outer', material: 'Linen 100% phom Relaxed Tailored' },
    ],
    ambientTempC: 22,
    windSpeedMps: 1.2,
  }, userCookie);

  if (comfortRes.status !== 200 && comfortRes.status !== 201) {
    throw new Error(`Thermal comfort failed: ${JSON.stringify(comfortRes)}`);
  }
  const c = comfortRes.data;
  console.log('  Thermal Comfort Results:');
  console.log(`  - Total Ensemble Insulation: ${c.totalEnsembleClo} Clo`);
  console.log(`  - Comfort Target: ${c.requiredComfortClo} Clo (ΔClo = ${c.thermalDeltaClo})`);
  console.log(`  - Comfort Status: ${c.comfortStatus}`);
  console.log(`  - Breathability Index: ${c.breathabilityIndex}`);
  console.log(`  - Weather Advisory: ${c.weatherAdvisory}`);

  if (c.totalEnsembleClo <= 0 || c.comfortStatus !== 'THERMALLY_OPTIMAL') {
    throw new Error('Garment thermal insulation calculation produced unexpected comfort status');
  }
  console.log('✔ ISO 9920 thermal insulation model validated.\n');

  // 4. Test Capsule Wardrobe Combinatorial Graph Optimizer
  console.log('[4] Testing Capsule Wardrobe Combinatorial Graph Optimizer (5 Pieces · 8 Outfits)...');
  const capsuleRes = await request('/vault/lookbook/capsule-optimizer', 'POST', {
    pieces: [
      { id: 'linen-shirt', name: 'Sơ mi linen thong thả', category: 'top', price: 425000, material: 'Linen' },
      { id: 'everyday-tee', name: 'Áo thun ngày thường', category: 'top', price: 245000, material: 'Cotton' },
      { id: 'wide-trousers', name: 'Quần suông nếp nhẹ', category: 'bottom', price: 495000, material: 'Cotton' },
      { id: 'weekend-dress', name: 'Đầm dạo cuối tuần', category: 'bottom', price: 685000, material: 'Linen' },
      { id: 'linen-blazer', name: 'Áo khoác Blazer Linen', category: 'outer', price: 1350000, material: 'Linen' },
    ],
  }, userCookie);

  if (capsuleRes.status !== 200 && capsuleRes.status !== 201) {
    throw new Error(`Capsule optimizer failed: ${JSON.stringify(capsuleRes)}`);
  }
  const cap = capsuleRes.data;
  console.log('  Capsule Wardrobe Combinatorics Results:');
  console.log(`  - Total Pieces: ${cap.totalPieces} pieces`);
  console.log(`  - Total Outfits Generated: ${cap.totalOutfitsCount} unique combinations`);
  console.log(`  - Total Investment: ${cap.totalInvestmentVnd.toLocaleString('vi-VN')} VND`);
  console.log(`  - Bundle Savings (15%): -${cap.bundleSavingsVnd.toLocaleString('vi-VN')} VND`);
  console.log(`  - Discounted Total: ${cap.discountedTotalVnd.toLocaleString('vi-VN')} VND`);
  console.log(`  - Cost-Per-Wear (180 Days): ${cap.costPerWear180Days.toLocaleString('vi-VN')} VND / ngày diện`);
  console.log(`  - Cost-Per-Wear (365 Days): ${cap.costPerWear365Days.toLocaleString('vi-VN')} VND / ngày diện`);
  console.log(`  - Shannon Diversity Index: ${cap.diversityIndexShannon}`);

  if (cap.totalOutfitsCount !== 8 || cap.bundleSavingsVnd <= 0) {
    throw new Error('Capsule combinatorics did not produce expected outfit permutations');
  }
  console.log('✔ Capsule wardrobe combinatorial graph optimization validated.\n');

  // 5. Test Combo Style Saver Pricing & Exact Dong Preservation
  console.log('[5] Testing Combo Style Saver Bundled Pricing & Hamilton-Hare Allocation...');
  const comboRes = await request('/vault/lookbook/combo-pricing', 'POST', {
    items: [
      { id: 'linen-shirt', price: 425000, category: 'top' },
      { id: 'wide-trousers', price: 495000, category: 'bottom' },
      { id: 'linen-blazer', price: 1350000, category: 'outer' },
    ],
    discountTierPct: 10,
  }, userCookie);

  if (comboRes.status !== 200 && comboRes.status !== 201) {
    throw new Error(`Combo pricing failed: ${JSON.stringify(comboRes)}`);
  }
  const cmb = comboRes.data;
  console.log('  Combo Pricing Results:');
  console.log(`  - Original Subtotal: ${cmb.subtotal.toLocaleString('vi-VN')} VND`);
  console.log(`  - Bundle Discount (-10%): -${cmb.discountAmount.toLocaleString('vi-VN')} VND`);
  console.log(`  - Final Bundle Total: ${cmb.finalTotal.toLocaleString('vi-VN')} VND`);
  console.log(`  - Loyalty Eco-Coins Earned: +${cmb.loyaltyEcoCoinsEarned} coins`);
  console.log('  - Line Allocations:');
  cmb.allocatedLines.forEach(l => {
    console.log(`    • ${l.id}: ${l.originalPrice.toLocaleString('vi-VN')}đ - ${l.discountPortion.toLocaleString('vi-VN')}đ = ${l.discountedPrice.toLocaleString('vi-VN')}đ`);
  });

  const checkSum = cmb.allocatedLines.reduce((s, l) => s + l.discountPortion, 0);
  if (checkSum !== cmb.discountAmount) {
    throw new Error('Hamilton-Hare allocation broke exact Dong preservation invariant');
  }
  console.log('✔ Combo bundle pricing and exact remainder preservation verified.\n');

  // 6. Save Lookbook and Capsule with Embedded Algorithms into Vault
  console.log('[6] Saving Lookbook & Capsule into Vault with Algorithmic Metadata...');
  const saveLookRes = await request('/vault/lookbook', 'POST', {
    title: 'Lookbook Mùa Thu Quiet Luxury - Nắng Ấm Sài Gòn',
    items: [
      { id: 'linen-shirt', name: 'Sơ mi linen', colorHex: '#dfd4bd' },
      { id: 'wide-trousers', name: 'Quần suông', colorHex: '#b89f82' },
      { id: 'linen-blazer', name: 'Áo khoác Blazer', colorHex: '#f4ede1' },
    ],
    hexColors: ['#dfd4bd', '#b89f82', '#f4ede1'],
    palette: 'Autumn Quiet Luxury',
  }, userCookie);

  if (saveLookRes.status !== 200 && saveLookRes.status !== 201) {
    throw new Error(`Save lookbook failed: ${JSON.stringify(saveLookRes)}`);
  }
  console.log(`✔ Lookbook saved to Vault: ID = ${saveLookRes.data.lookbook.id} (Harmony Score: ${saveLookRes.data.lookbook.harmonyScore})`);

  const saveCapRes = await request('/vault/capsule', 'POST', {
    title: 'Tủ Đồ Nhộng Thu Đông Tinh Gọn (5 Món)',
    pieces: [
      { id: 'linen-shirt', name: 'Sơ mi linen', category: 'top', price: 425000, material: 'Linen' },
      { id: 'everyday-tee', name: 'Áo thun cotton', category: 'top', price: 245000, material: 'Cotton' },
      { id: 'wide-trousers', name: 'Quần suông', category: 'bottom', price: 495000, material: 'Cotton' },
      { id: 'weekend-dress', name: 'Đầm dạo phố', category: 'bottom', price: 685000, material: 'Linen' },
      { id: 'linen-blazer', name: 'Blazer linen', category: 'outer', price: 1350000, material: 'Linen' },
    ],
    totalInvestment: 3200000,
  }, userCookie);

  if (saveCapRes.status !== 200 && saveCapRes.status !== 201) {
    throw new Error(`Save capsule failed: ${JSON.stringify(saveCapRes)}`);
  }
  console.log(`✔ Capsule saved to Vault: ID = ${saveCapRes.data.capsule.id} (${saveCapRes.data.capsule.outfitsCount} outfits, CPW: ${saveCapRes.data.capsule.costPerWear180Days}đ)\n`);

  // 7. Atomic Batch Cart Addition with Style Saver Discount
  console.log('[7] Testing Atomic Batch Cart Addition (/cart/batch)...');
  const batchRes = await request('/cart/batch', 'POST', {
    items: [
      { variantId: 'linen-shirt-0-M', quantity: 1 },
      { variantId: 'wide-trousers-0-M', quantity: 1 },
    ],
  }, userCookie);

  if (batchRes.status !== 200 && batchRes.status !== 201) {
    throw new Error(`Cart batch addition failed: ${JSON.stringify(batchRes)}`);
  }
  console.log(`✔ Atomic batch cart addition verified: ${batchRes.data.addedCount} items added to cart.\n`);

  console.log('======================================================');
  console.log('✔ ALL MODULE 3 LOOKBOOK & STYLIST ALGORITHMS VERIFIED');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n✖ VERIFICATION FAILED:', err);
  process.exit(1);
});
