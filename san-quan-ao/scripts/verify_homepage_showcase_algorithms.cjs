const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

async function makeRequest(path, method = 'GET', body = null) {
  const url = new URL(API_BASE + path);
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'mac-web',
      'Origin': 'http://localhost:3000',
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function verifyHomepageShowcaseAlgorithms() {
  console.log('=== BẮT ĐẦU KIỂM ĐỊNH MODULE 13: HOMEPAGE CURATED SHOWCASE & EDITORIAL TRENDS ===\n');

  // 1. Kiểm tra Thuật toán 62: Phối trộn trưng bày trang chủ Thompson Sampling
  console.log('--- 1. THUẬT TOÁN 62: CURATED SHOWCASE THOMPSON SAMPLING RANKER ---');
  const showcaseRes = await makeRequest('/homepage/curated-showcase');
  console.log('   Status:', showcaseRes.status);
  console.log('   Curated Products Count:', showcaseRes.data.curatedProducts?.length);
  console.log('   Average Thompson Utility:', showcaseRes.data.showcaseMeta?.averageThompsonUtility);
  console.log('   Exploration Share %:', showcaseRes.data.showcaseMeta?.explorationSharePct + '%');
  console.log('   Showcase Breakdown:', showcaseRes.data.showcaseMeta?.selectionBreakdown?.map(b => `${b.name} (${b.selectionReason})`).slice(0, 3));
  if (!showcaseRes.data.curatedProducts || showcaseRes.data.curatedProducts.length === 0) {
    throw new Error('Curated showcase không trả về sản phẩm nào!');
  }

  // 2. Kiểm tra Thuật toán 59: Dự báo động lượng xu hướng sàn diễn Holt-Winters
  console.log('\n--- 2. THUẬT TOÁN 59: EDITORIAL TREND MOMENTUM FORECASTER ---');
  console.log('   [2.1 Live Trends từ /homepage/curated-showcase]');
  const liveTrends = showcaseRes.data.trends || [];
  liveTrends.forEach((t, i) => {
    console.log(`   Xu hướng ${i + 1}: ${t.trendName} -> Tăng trưởng dự kiến: +${t.projectedGrowthPct}% (${t.editorialTag} - ${t.trendRankTier})`);
  });

  console.log('\n   [2.2 Custom Trend Simulation POST /homepage/trend-forecast]');
  const trendSimRes = await makeRequest('/homepage/trend-forecast', 'POST', {
    trendId: 'trend-quiet-luxury',
    trendName: 'Quiet Luxury & Phom Rộng Phóng Khoáng',
    historicalSearchesPerWeek: [120, 160, 215, 305],
    runwayMentionCount: 19,
    seasonPeriod: 'SS_2026',
  });
  console.log('   Status:', trendSimRes.status);
  console.log('   Projected Growth:', trendSimRes.data.result?.projectedGrowthPct + '%');
  console.log('   Rank Tier:', trendSimRes.data.result?.trendRankTier);
  console.log('   Advisory:', trendSimRes.data.result?.advisory);
  if (!trendSimRes.data.result?.isHotTrending) {
    throw new Error('Thuật toán 59 không xác nhận xu hướng Quiet Luxury là Hot Trending!');
  }

  // 3. Kiểm tra Thuật toán 60: Đo lường độ hòa sắc Capsule Tone-sur-Tone & Phân bổ giá Combo
  console.log('\n--- 3. THUẬT TOÁN 60: CAPSULE HARMONY SCORE & BUNDLE PRICING OPTIMIZER ---');
  const capsuleRes = await makeRequest('/homepage/capsule-harmony', 'POST', {
    capsuleId: 'capsule-normandy-summer',
    capsuleName: 'The Normandy Summer Edit',
    pieces: [
      {
        category: 'TOP',
        name: 'Áo sơ mi cổ trụ Premium Linen',
        material: '100% Linen',
        hexColor: '#dfd4bd',
        originalPriceVnd: 420000,
      },
      {
        category: 'BOTTOM',
        name: 'Quần short linen mộc tự nhiên',
        material: '100% Linen',
        hexColor: '#b89f82',
        originalPriceVnd: 390000,
      },
      {
        category: 'OUTER',
        name: 'Áo khoác safari kaki đũi',
        material: 'Kaki Đũi',
        hexColor: '#a7654b',
        originalPriceVnd: 650000,
      },
    ],
    bundleDiscountRatePct: 10.0,
  });

  console.log('   Status:', capsuleRes.status);
  const cap = capsuleRes.data.result;
  console.log('   Composite Harmony Score:', cap?.compositeHarmonyScore + '/100');
  console.log('   Harmony Grade:', cap?.harmonyGrade);
  console.log('   Original Total:', cap?.originalTotalVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Discount 10%:', cap?.discountAmountVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Combo Bundle Total:', cap?.comboBundleTotalVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Itemized Allocations:', cap?.itemizedAllocations?.map(v => v.toLocaleString('vi-VN') + '₫'));
  console.log('   Exact Dong Preservation:', cap?.exactDongPreservation);
  if (!cap?.exactDongPreservation) {
    throw new Error('Thuật toán 60 phân bổ làm lệch tổng tiền combo!');
  }

  // 4. Kiểm tra Thuật toán 61: Chỉ số nguồn gốc di sản thủ công & Độ tinh khiết sợi
  console.log('\n--- 4. THUẬT TOÁN 61: HERITAGE PROVENANCE INDEX & PURITY CERTIFICATION ---');
  const provRes = await makeRequest('/homepage/heritage-provenance', 'POST', {
    productId: 'prod-bao-loc-silk-01',
    productName: 'Áo Dài Lụa Tơ Tằm Cung Đình Bảo Lộc',
    geographicalOrigin: 'BAO_LOC_VIETNAM',
    naturalFiberPurityPct: 100,
    handcraftedAtelierHours: 26,
    fairWageRatio: 3.4,
    botanicalOrEcoDye: true,
  });

  console.log('   Status:', provRes.status);
  const prov = provRes.data.result;
  console.log('   Provenance Index Score:', prov?.provenanceIndexScore + '/100');
  console.log('   Authenticity Tier:', prov?.authenticityTier);
  console.log('   Slow Fashion Purity Certified:', prov?.slowFashionPurityCertified);
  console.log('   Eco Provenance Hash:', prov?.ecoProvenanceHash);
  if (!prov?.ecoProvenanceHash?.startsWith('#PROV-NX-')) {
    throw new Error('Thuật toán 61 không xuất mã con dấu số di sản hợp lệ!');
  }

  console.log('\n================================================================================');
  console.log('>>> TOÀN BỘ 4 THUẬT TOÁN MODULE 13 (ALGS 59-62) ĐÃ XÁC MINH VẬN HÀNH HOÀN HẢO! <<<');
  console.log('================================================================================\n');
}

verifyHomepageShowcaseAlgorithms().catch(err => {
  console.error('LỖI KIỂM ĐỊNH MODULE 13:', err);
  process.exit(1);
});
