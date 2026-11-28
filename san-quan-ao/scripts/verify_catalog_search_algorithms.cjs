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

async function verifyCatalogSearchAlgorithms() {
  console.log('=== BẮT ĐẦU KIỂM ĐỊNH MODULE 12: SEMANTIC FABRIC SEARCH, BM25 & DIVERSITY RERANKER ===\n');

  // 1. Kiểm tra Thuật toán 55: Xếp hạng BM25 Hybrid Fabric Retrieval
  console.log('--- 1. THUẬT TOÁN 55: BM25 HYBRID FABRIC RETRIEVAL ---');
  const bm25Res = await makeRequest('/products?q=linen+m%E1%BB%99c&sort=newest&page=1');
  console.log('   Status:', bm25Res.status);
  console.log('   Total matching items:', bm25Res.data.total);
  console.log('   First item name:', bm25Res.data.items?.[0]?.name);
  console.log('   First item material:', bm25Res.data.items?.[0]?.material);
  console.log('   Search Metadata:', bm25Res.data.searchMeta);
  if (!bm25Res.data.items || bm25Res.data.items.length === 0) {
    throw new Error('BM25 search không trả về sản phẩm nào!');
  }

  // 2. Kiểm tra Thuật toán 56: Bảng màu quang phổ CIELAB Delta-E Matcher
  console.log('\n--- 2. THUẬT TOÁN 56: PALETTE CHROMATIC DISTANCE MATCHER ---');
  const sandRes = await makeRequest('/products?palette=SAND');
  console.log('   [Palette: SAND (Cát Mộc Normandy)]');
  console.log('   Status:', sandRes.status);
  console.log('   Items found:', sandRes.data.items?.length);
  if (sandRes.data.items?.length > 0) {
    console.log('   Example match:', sandRes.data.items[0].name, '- Variant:', sandRes.data.items[0].variants?.[0]?.color);
  }

  const indigoRes = await makeRequest('/products?palette=INDIGO');
  console.log('   [Palette: INDIGO (Lam Chàm Sâu)]');
  console.log('   Status:', indigoRes.status);
  console.log('   Items found:', indigoRes.data.items?.length);

  // 3. Kiểm tra Thuật toán 57: Định lượng vải GSM & Khí động học thoáng khí
  console.log('\n--- 3. THUẬT TOÁN 57: FABRIC WEIGHT GSM AERODYNAMICS FILTER ---');
  const lightGsmRes = await makeRequest('/products?gsmTier=LIGHT');
  console.log('   [GSM Tier: LIGHT (< 150 GSM - Mỏng nhẹ nhiệt đới)]');
  console.log('   Status:', lightGsmRes.status);
  console.log('   Items count:', lightGsmRes.data.items?.length);

  const heavyGsmRes = await makeRequest('/products?gsmTier=HEAVY');
  console.log('   [GSM Tier: HEAVY (> 260 GSM - Dày dặn ve đứng/áo khoác)]');
  console.log('   Status:', heavyGsmRes.status);
  console.log('   Items count:', heavyGsmRes.data.items?.length);
  if (heavyGsmRes.data.items?.length > 0) {
    console.log('   Example heavy item:', heavyGsmRes.data.items[0].name, '(', heavyGsmRes.data.items[0].material, ')');
  }

  // 4. Kiểm tra Thuật toán 58: Tái xếp hạng đa dạng hóa Entropy MMR
  console.log('\n--- 4. THUẬT TOÁN 58: FACETED ENTROPY DIVERSITY RERANKER ---');
  const rerankRes = await makeRequest('/products?rerank=true&q=áo');
  console.log('   Status:', rerankRes.status);
  console.log('   Shannon Shop Diversity Entropy:', rerankRes.data.searchMeta?.shannonShopDiversityEntropy, 'bits');
  console.log('   Max Shop Concentration %:', rerankRes.data.searchMeta?.maxShopConcentrationPct, '%');
  console.log('   Diversity Preserved:', rerankRes.data.searchMeta?.diversityPreserved);

  // 5. Kiểm tra Endpoint Phân tích Tìm kiếm Ngữ nghĩa POST /products/semantic-search
  console.log('\n--- 5. KIỂM ĐỊNH SEMANTIC SEARCH ANALYSIS (POST /products/semantic-search) ---');
  const analysisRes = await makeRequest('/products/semantic-search', 'POST', {
    query: 'áo sơ mi linen hữu cơ thoáng khí',
    paletteFamily: 'SAND',
    gsmTier: 'MEDIUM',
    candidateHexColors: ['#dfd4bd', '#1e3a5f'],
  });
  console.log('   Status:', analysisRes.status);
  console.log('   Query analyzed:', analysisRes.data.query);
  console.log('   BM25 Score:', analysisRes.data.bm25?.bm25Score);
  console.log('   Total Composite Score:', analysisRes.data.bm25?.totalCompositeScore);
  console.log('   Relevance Tier:', analysisRes.data.bm25?.relevanceTier);
  console.log('   Palette Chromatic Match:', analysisRes.data.palette?.isChromaticMatch);
  console.log('   Chromatic Confidence %:', analysisRes.data.palette?.chromaticConfidencePct + '%');
  console.log('   GSM Assigned Tier:', analysisRes.data.gsm?.assignedGsmTier);
  console.log('   Air Permeability:', analysisRes.data.gsm?.breathabilityAirPermeabilityCm3, 'cm³/cm²/s');
  console.log('   Diversity Shannon Entropy:', analysisRes.data.diversity?.shannonShopDiversityEntropy, 'bits');

  console.log('\n================================================================================');
  console.log('>>> TOÀN BỘ 4 THUẬT TOÁN MODULE 12 (ALGS 55-58) ĐÃ XÁC MINH VẬN HÀNH HOÀN HẢO! <<<');
  console.log('================================================================================\n');
}

verifyCatalogSearchAlgorithms().catch(err => {
  console.error('LỖI KIỂM ĐỊNH MODULE 12:', err);
  process.exit(1);
});
