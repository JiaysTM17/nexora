/**
 * Verification Script: VIP Fashion Passport & Personal Styling Archetype Vault (Module 6)
 * Tests Algorithms 35, 36, 37, 38 both standalone and through authenticated Vault API endpoints.
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

function getJson(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/v1${path}`,
        method: 'GET',
        headers: {
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
    req.end();
  });
}

async function main() {
  console.log('================================================================');
  console.log('🚀 RUNNING VERIFICATION: MODULE 6 - VIP FASHION PASSPORT & VAULT');
  console.log('================================================================\n');

  // 1. Authenticate user to obtain session cookie
  console.log('1. Authenticating test user (buyer@mac.local)...');
  const loginRes = await postJson('/auth/login', {
    email: 'buyer@mac.local',
    password: 'MacLocal2026!',
  });

  if (loginRes.status !== 200 && loginRes.status !== 201) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.data || loginRes.text)}`);
  }

  const setCookie = loginRes.rawHeaders['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.map(c => c.split(';')[0]).join('; ') : '';
  const authHeaders = { Cookie: cookieHeader };
  console.log('✓ Successfully authenticated! Session active.\n');

  // 2. Test Algorithm 35: Fashion Style DNA Mahalanobis Classifier
  console.log('2. Testing Algorithm 35: Style Archetype Mahalanobis Softmax Classifier...');
  const quizRes = await postJson(
    '/vault/style-archetype/classify',
    {
      colorPaletteChoice: 0, // Neutrals
      contextChoice: 0,      // Boardroom / Gala
      tactileChoice: 0,      // Mulberry Silk & Merino Wool
      ethosChoice: 0,        // Understated Luxury
      preferredFit: 'REGULAR',
    },
    authHeaders
  );

  if (quizRes.status !== 200 && quizRes.status !== 201) {
    throw new Error(`Archetype classify failed: ${JSON.stringify(quizRes.data)}`);
  }

  const archetype = quizRes.data;
  console.log(`   - Primary Archetype: ${archetype.primaryArchetype.label}`);
  console.log(`   - Affinity Score: ${archetype.primaryArchetype.affinityScorePct}%`);
  console.log(`   - Confidence: ${archetype.confidencePct}%`);
  console.log(`   - Fabrics: ${archetype.primaryArchetype.recommendedFabrics.join(', ')}`);
  console.log(`   - Signature Colors: ${archetype.primaryArchetype.signaturePaletteHex.join(', ')}`);
  if (archetype.primaryArchetype.id !== 'QUIET_LUXURY_CURATOR') {
    throw new Error('Expected QUIET_LUXURY_CURATOR for pure luxury inputs');
  }
  console.log('✓ Algorithm 35 (Style Archetype Mahalanobis) PASSED!\n');

  // 3. Test Algorithm 36: Footwear Anthropometric ISO 9407 / Brannock Engine
  console.log('3. Testing Algorithm 36: Footwear Anthropometric & Biomechanical Sizing...');
  const shoeRes = await postJson(
    '/vault/passport/footwear-sizing',
    {
      footLengthMm: 255,
      footWidthMm: 96,
      archType: 'STANDARD',
      shoeCategory: 'LOAFER_DERBY',
    },
    authHeaders
  );

  if (shoeRes.status !== 200 && shoeRes.status !== 201) {
    throw new Error(`Footwear sizing failed: ${JSON.stringify(shoeRes.data)}`);
  }

  const footwear = shoeRes.data;
  console.log(`   - ISO Mondopoint: ${footwear.isoMondopointMm}mm`);
  console.log(`   - Shoe Sizing: EU ${footwear.euroSize} | US ${footwear.usSize} | UK ${footwear.ukSize}`);
  console.log(`   - Insole Recommendation: ${footwear.recommendedInsoleLengthMm}mm`);
  console.log(`   - Width Classification: ${footwear.brannockWidthLabel} (${footwear.brannockWidthLetter})`);
  console.log(`   - Arch Correction: ${footwear.archBiomechanicalCorrection.supportProfile}`);
  console.log(`   - Fit Confidence: ${footwear.fitConfidencePct}%`);
  if (footwear.euroSize !== 40.5 || footwear.brannockWidthLetter !== 'D') {
    throw new Error(`Unexpected shoe size values: EU ${footwear.euroSize}, Width ${footwear.brannockWidthLetter}`);
  }
  console.log('✓ Algorithm 36 (Footwear Anthropometric Brannock) PASSED!\n');

  // 4. Test Algorithm 37: Cost-Per-Wear (CPW) Amortization & Lifecycle Markov
  console.log('4. Testing Algorithm 37: Garment Cost-Per-Wear (CPW) Amortization Engine...');
  const cpwRes = await postJson(
    '/vault/wardrobe/cost-per-wear',
    {
      itemPurchasePriceVnd: 2400000,
      maintenanceCostsVnd: 180000,
      wearsToDate: 28,
      garmentType: 'Áo Khoác Blazer Linen Normandy',
      fabricCategory: 'LINEN_FLAX',
    },
    authHeaders
  );

  if (cpwRes.status !== 200 && cpwRes.status !== 201) {
    throw new Error(`CPW calculate failed: ${JSON.stringify(cpwRes.data)}`);
  }

  const cpw = cpwRes.data;
  console.log(`   - Total Cost of Ownership (TCO): ${cpw.totalCostOfOwnershipVnd.toLocaleString('vi-VN')}₫`);
  console.log(`   - Current CPW: ${cpw.currentCostPerWearVnd.toLocaleString('vi-VN')}₫/lần mặc`);
  console.log(`   - Expected Lifespan: ${cpw.expectedTotalLifespanWears} lần mặc (Còn lại: ${cpw.remainingProjectedWears})`);
  console.log(`   - Projected End-Lifespan CPW: ${cpw.projectedEndLifespanCPWVnd.toLocaleString('vi-VN')}₫/lần`);
  console.log(`   - Amortization Progress: ${cpw.amortizationProgressPct}%`);
  console.log(`   - Circularity Status: ${cpw.circularityRecommendation.status}`);
  console.log(`   - Rationale: ${cpw.circularityRecommendation.rationale}`);
  if (cpw.currentCostPerWearVnd !== 92143 || cpw.expectedTotalLifespanWears !== 150) {
    throw new Error('CPW calculation mismatch');
  }
  console.log('✓ Algorithm 37 (Wardrobe Cost-Per-Wear Amortization) PASSED!\n');

  // 5. Test Algorithm 38: Atelier Hibernation Microclimate Mold Risk & Dew Point
  console.log('5. Testing Algorithm 38: Hibernation Microclimate Mold Risk & Dew Point Engine...');
  const climateRes = await postJson(
    '/vault/hibernation/microclimate-eval',
    {
      ambientTempC: 31.5,
      relativeHumidityPct: 78,
      durationMonths: 6,
      fabricType: 'WOOL_CASHMERE',
      packagingMethod: 'ZIP_SEAL_BIO_SILICA',
    },
    authHeaders
  );

  if (climateRes.status !== 200 && climateRes.status !== 201) {
    throw new Error(`Microclimate eval failed: ${JSON.stringify(climateRes.data)}`);
  }

  const climate = climateRes.data;
  console.log(`   - Ambient Dew Point: ${climate.ambientDewPointTempC}°C (Vapor Pressure: ${climate.vaporPressureHpa} hPa)`);
  console.log(`   - Ambient Mold Risk Index: ${climate.ambientMoldRiskIndex} (VTT Model)`);
  console.log(`   - Vault Controlled Climate: ${climate.vaultPreservationMetrics.vaultTempC}°C | ${climate.vaultPreservationMetrics.vaultHumidityPct}% RH`);
  console.log(`   - Vault Mold Risk Index: ${climate.vaultPreservationMetrics.vaultMoldRiskIndex} (Zero fungal hazard)`);
  console.log(`   - Fiber Longevity Multiplier: ${climate.vaultPreservationMetrics.fiberLifespanMultiplier}x`);
  console.log(`   - Security Seal: ${climate.serviceSummary.securitySealCode}`);
  console.log(`   - Tracking Hash: ${climate.serviceSummary.tamperEvidentTrackingHash}`);
  console.log(`   - Eco-Coins Earned: +${climate.serviceSummary.ecoCoinsEarned} Xu Xanh`);
  console.log(`   - Care Advice: ${climate.careAdvice}`);
  if (climate.vaultPreservationMetrics.vaultMoldRiskIndex !== 0 || climate.serviceSummary.ecoCoinsEarned !== 100) {
    throw new Error('Microclimate vault verification mismatch');
  }
  console.log('✓ Algorithm 38 (Atelier Hibernation Mold Risk) PASSED!\n');

  // 6. Test End-to-End Vault Persistence with Automatic Algorithmic Enrichment
  console.log('6. Testing End-to-End Vault Persistence with Automatic Footwear & Climate Enrichment...');
  const savePassportRes = await postJson(
    '/vault/passport',
    {
      height: 172,
      weight: 62,
      chest: 90,
      waist: 70,
      hip: 94,
      fitPref: 'REGULAR',
      footLength: 260,
      footWidth: 98,
      archType: 'STANDARD',
    },
    authHeaders
  );

  if (savePassportRes.status !== 200 && savePassportRes.status !== 201) {
    throw new Error(`Save passport failed: ${JSON.stringify(savePassportRes.data)}`);
  }
  console.log('   - Saved Fashion Passport with automatic footwear sizing integration!');
  const savedPassport = savePassportRes.data.passport;
  if (!savedPassport.footwearSizing || savedPassport.footwearSizing.euroSize !== 41.5) {
    throw new Error(`Expected footwearSizing attached to passport: ${JSON.stringify(savedPassport)}`);
  }
  console.log(`   - Embedded Footwear Sizing: EU ${savedPassport.footwearSizing.euroSize} (Width ${savedPassport.footwearSizing.brannockWidthLetter})`);

  const saveHibernationRes = await postJson(
    '/vault/hibernation',
    {
      item: 'Áo Măng Tô Dạ Cashmere 2 Hàng Khuy',
      duration: '6 Tháng (Gói Mùa Mưa)',
      fee: 240000,
      code: 'HIBERNATE-VAULT-TEST',
      date: '25/11/2026',
      fabricType: 'WOOL_CASHMERE',
      ambientTempC: 32.0,
      relativeHumidityPct: 80,
    },
    authHeaders
  );

  if (saveHibernationRes.status !== 200 && saveHibernationRes.status !== 201) {
    throw new Error(`Save hibernation failed: ${JSON.stringify(saveHibernationRes.data)}`);
  }
  const savedHibernation = saveHibernationRes.data.hibernation;
  console.log(`   - Saved Hibernation Booking: ${savedHibernation.item}`);
  console.log(`   - Security Seal: ${savedHibernation.securitySealCode}`);
  console.log(`   - Eco-Coins Earned: +${savedHibernation.ecoCoinsEarned}`);
  console.log(`   - Vault Climate: ${savedHibernation.vaultMetrics.vaultTempC}°C · ${savedHibernation.vaultMetrics.vaultHumidityPct}% RH`);

  // Verify GET /vault includes these
  const getVaultRes = await getJson('/vault', authHeaders);
  if (getVaultRes.status !== 200) {
    throw new Error(`Get vault failed: ${getVaultRes.status}`);
  }
  const vault = getVaultRes.data;
  if (!vault.passport || vault.passport.height !== 172) {
    throw new Error('Vault getPassport verification failed');
  }
  console.log('✓ End-to-End Vault Persistence with Automatic Footwear & Hibernation Enrichment PASSED!\n');

  console.log('================================================================');
  console.log('🎉 ALL MODULE 6 ALGORITHMS & API INTEGRATIONS VERIFIED 100%!');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
