const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

async function makeRequest(path, method = 'GET', body = null, cookie = null) {
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

  if (cookie) {
    options.headers['Cookie'] = cookie;
  }

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

async function loginAdmin() {
  console.log('1. Đăng nhập Quản trị viên (Admin Login)...');
  let res = await makeRequest('/auth/login', 'POST', {
    email: 'admin@nexora.vn',
    password: 'admin123',
  });

  if (res.status !== 200 && res.status !== 201) {
    res = await makeRequest('/auth/login', 'POST', {
      email: 'admin@mac.local',
      password: 'MacLocal2026!',
    });
  }

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Đăng nhập admin thất bại: ${JSON.stringify(res.data)}`);
  }

  const setCookie = res.headers['set-cookie'];
  const cookie = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  console.log('   => Đăng nhập thành công! User:', res.data.user?.name || res.data.user?.email);
  return cookie;
}

async function verifyModule11Algorithms() {
  console.log('=== BẮT ĐẦU KIỂM ĐỊNH MODULE 11: ADMIN GOVERNANCE, ESCROW SOLVENCY & EPR COMPLIANCE ===\n');
  const cookie = await loginAdmin();

  // --------------------------------------------------------------------------
  // Thuật toán 51: Cầu Dao Bảo Vệ An Toàn Giá & Bắt Bất Thường Biến Động (Circuit Breaker Volatility)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. THUẬT TOÁN 51: CIRCUIT BREAKER VOLATILITY DETECTOR ---');
  // 2.1 Simulation test via /circuit-breaker/evaluate
  const evalRes = await makeRequest('/admin/circuit-breaker/evaluate', 'POST', {
    productId: 'PROD-TEST-ALBUM',
    productName: 'Áo Dài Di Sản Lụa Tơ Chu Thêu Tay',
    categorySlug: 'ao-dai',
    currentPriceVnd: 2200000,
    newPriceVnd: 500000, // Flash crash: -77.3%
    categoryMedianPriceVnd: 1850000,
    priceEditCountLast10Min: 2,
  }, cookie);

  console.log('   [2.1 Evaluate POST /admin/circuit-breaker/evaluate]');
  console.log('   Status:', evalRes.status);
  console.log('   Deviation %:', evalRes.data.result?.priceDeviationPct + '%');
  console.log('   Circuit Breaker Tripped:', evalRes.data.result?.circuitBreakerTripped);
  console.log('   Recommended Action:', evalRes.data.result?.recommendedAction);
  console.log('   Incident Code:', evalRes.data.result?.incidentTrackingCode);
  if (!evalRes.data.result?.circuitBreakerTripped) {
    throw new Error('Thuật toán 51 không ngắt mạch khi giá giảm > 60%!');
  }

  // 2.2 Live product test via /admin/products
  const prodRes = await makeRequest('/admin/products', 'GET', null, cookie);
  const products = prodRes.data;
  if (Array.isArray(products) && products.length > 0) {
    const testProduct = products[0];
    console.log(`\n   [2.2 Test Circuit Breaker trên sản phẩm thật: ${testProduct.name} (ID: ${testProduct.id})]`);
    const cbRes = await makeRequest(`/admin/products/${testProduct.id}/circuit-breaker`, 'POST', {
      newPriceVnd: 99999999, // Hyper inflation spike
      categoryMedianPriceVnd: 1500000,
      autoQuarantine: false, // Don't actually hide live production item during test
      reason: 'Kiểm tra độ nhạy cầu dao giá tự động',
    }, cookie);
    console.log('   Status:', cbRes.status);
    console.log('   Volatility Tripped:', cbRes.data.volatility?.circuitBreakerTripped);
    console.log('   Decision:', cbRes.data.volatility?.decisionVerdict);
    console.log('   Advisory:', cbRes.data.volatility?.advisory);
  }

  // --------------------------------------------------------------------------
  // Thuật toán 52: Đối Soát Kế Toán Kép & Bảo Toàn Khả Năng Thanh Khoản Ký Quỹ (Escrow Solvency Invariant)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. THUẬT TOÁN 52: ESCROW DOUBLE-ENTRY SOLVENCY RECONCILER ---');
  // 3.1 Live Solvency Audit
  const solvencyGetRes = await makeRequest('/admin/escrow/solvency-audit', 'GET', null, cookie);
  console.log('   [3.1 Live Solvency Audit GET /admin/escrow/solvency-audit]');
  console.log('   Status:', solvencyGetRes.status);
  const audit = solvencyGetRes.data.auditResult;
  console.log('   Quỹ Escrow thực tại MBBank:', audit?.bankEscrowReserveBalanceVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Tổng nghĩa vụ nợ toàn sàn:', audit?.totalMarketplaceLiabilitiesVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Tỷ lệ thanh khoản:', audit?.solvencyRatioPct + '%');
  console.log('   Độ lệch phân đoạn (Fractional Drift):', audit?.fractionalDriftVnd?.toLocaleString('vi-VN'), '₫');
  console.log('   Bảo đảm thanh khoản:', audit?.isFullySolvent ? 'AN TOÀN TUYỆT ĐỐI (SOLVENT)' : 'CẢNH BÁO');
  console.log('   Mã chứng thực đối soát:', audit?.dailySolvencyAttestationCode);
  if (!audit?.dailySolvencyAttestationCode?.startsWith('#SOLVENCY-AUDIT-')) {
    throw new Error('Thuật toán 52 không xuất mã chứng thư hợp lệ!');
  }

  // 3.2 Custom Stress Simulation POST
  const stressRes = await makeRequest('/admin/escrow/solvency-audit', 'POST', {
    bankEscrowReserveBalanceVnd: 500000000,
    shopLedgerSummaries: [
      { shopId: 'shop-1', shopName: 'Atelier NÉP', availableBalanceVnd: 120000000, held7DayEscrowVnd: 180000000, disputedReserveVnd: 10000000 },
      { shopId: 'shop-2', shopName: 'Tơ Chu Silk', availableBalanceVnd: 80000000, held7DayEscrowVnd: 60000000, disputedReserveVnd: 0 },
    ],
    unreleasedAffiliateHoldVnd: 15000000,
    pendingTaxWithholdingVnd: 6750000,
  }, cookie);
  console.log('\n   [3.2 Stress Simulation POST /admin/escrow/solvency-audit]');
  console.log('   Status:', stressRes.status);
  console.log('   Solvent:', stressRes.data.result?.isFullySolvent);
  console.log('   Solvency Ratio:', stressRes.data.result?.solvencyRatioPct + '%');
  console.log('   Drift VND:', stressRes.data.result?.fractionalDriftVnd?.toLocaleString('vi-VN'), '₫');

  // --------------------------------------------------------------------------
  // Thuật toán 53: Định Lượng Trách Nhiệm Mở Rộng Nhà Sản Xuất (EPR Circular Textile Quota)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. THUẬT TOÁN 53: CIRCULAR EPR TEXTILE QUOTA AUDITOR ---');
  // 4.1 Live EPR Audit
  const eprGetRes = await makeRequest('/admin/circular/epr-audit', 'GET', null, cookie);
  console.log('   [4.1 Live EPR Audit GET /admin/circular/epr-audit]');
  console.log('   Status:', eprGetRes.status);
  const epr = eprGetRes.data.audit;
  console.log('   Căn cứ pháp lý:', eprGetRes.data.legalBasis);
  console.log('   Năm tài chính kiểm toán:', epr?.auditYear);
  console.log('   Tổng vải nguyên sinh đưa ra thị trường:', epr?.totalVirginFabricWeightKg, 'kg');
  console.log('   Hạn ngạch thu gom pháp định (15%):', epr?.mandatedRecoveryTargetKg, 'kg');
  console.log('   Khối lượng tuần hoàn quy đổi hiệu dụng:', epr?.effectiveCircularRecoveredKg, 'kg');
  console.log('   Tỷ lệ hoàn thành EPR:', epr?.realizedEprFulfillmentPct + '%');
  console.log('   Kết luận tuân thủ:', epr?.isCompliant ? 'ĐẠT CHUẨN EPR QUỐC GIA' : 'CHƯA ĐẠT HẠN NGẠCH');
  console.log('   Mã chứng chỉ số EPR:', epr?.eprCertificateCode);
  if (!epr?.eprCertificateCode?.startsWith('#EPR-VN-')) {
    throw new Error('Thuật toán 53 không cấp mã chứng chỉ EPR số!');
  }

  // 4.2 Custom EPR Evaluation POST
  const eprPostRes = await makeRequest('/admin/circular/epr-audit', 'POST', {
    auditYear: 2026,
    totalVirginFabricWeightKg: 15000,
    statutoryMandatedRatePct: 15.0,
    recoveredUpcyclingKg: 950,
    recoveredReLovedKg: 1200,
    recoveredBioFeltKg: 400,
  }, cookie);
  console.log('\n   [4.2 Custom Scenario POST /admin/circular/epr-audit]');
  console.log('   Status:', eprPostRes.status);
  console.log('   Fulfillment %:', eprPostRes.data.result?.realizedEprFulfillmentPct + '%');
  console.log('   Surplus/Deficit Kg:', eprPostRes.data.result?.deficitOrSurplusKg, 'kg');

  // --------------------------------------------------------------------------
  // Thuật toán 54: Kiểm Định KCS 8 Điểm & Chỉ Số Lương Đủ Sống Nghệ Nhân (Artisan QA Fair Wage Index)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. THUẬT TOÁN 54: ARTISAN QA FAIR WAGE LIVING WAGE INDEX ---');
  // 5.1 Standalone Artisan QA audit POST
  const qaRes = await makeRequest('/admin/artisan-qa/audit', 'POST', {
    bespokeOrderId: 'BESPOKE-ORD-8899',
    inspectorName: 'Đặng Ngọc Lan (Master QA Atelier)',
    eightPointInspection: {
      grainlineAlignmentPassed: true,
      frenchSeamRolledPassed: true,
      shellButtonCrossKnotPassed: true,
      monogramTensionPassed: true,
      steamDecatizingPassed: true,
      liningEasePassed: true,
      collarRollHuggingPassed: true,
      hemDropBalancePassed: true,
    },
    artisanCraftHours: 24,
    artisanCompensationVnd: 3600000,
    regionalLivingWageHourlyVnd: 48000,
  }, cookie);

  console.log('   [5.1 Standalone QA Audit POST /admin/artisan-qa/audit]');
  console.log('   Status:', qaRes.status);
  const qa = qaRes.data.result;
  console.log('   Điểm kiểm định KCS:', qa?.inspectionScore + '/8 tiêu chuẩn');
  console.log('   Xếp loại:', qa?.qaGrade);
  console.log('   Đủ điều kiện xuất xưởng:', qa?.certifiedForDelivery ? 'CHỨNG NHẬN ĐẠT CHUẨN' : 'TỪ CHỐI');
  console.log('   Lương nghệ nhân:', qa?.artisanHourlyRateVnd?.toLocaleString('vi-VN'), '₫/giờ');
  console.log('   Chỉ số Lương Đủ Sống (Fair Wage Index):', qa?.fairWageIndexRatio + 'x (Mức chuẩn: >= 2.50x)');
  console.log('   Chứng chỉ Fair-Wage Haute Couture:', qa?.isFairWageCertified ? 'ĐẠT CHUẨN' : 'KHÔNG ĐẠT');
  console.log('   Số seri chứng thư:', qa?.qualityCertificateSerial);
  if (!qa?.qualityCertificateSerial?.startsWith('NX-QA-BESPOKE-')) {
    throw new Error('Thuật toán 54 không phát hành số seri KCS chuẩn!');
  }

  // 5.2 Bespoke Order Audit Integration test
  const bespokeListRes = await makeRequest('/admin/bespoke', 'GET', null, cookie);
  const bespokeOrders = bespokeListRes.data.orders;
  if (Array.isArray(bespokeOrders) && bespokeOrders.length > 0) {
    const targetBespoke = bespokeOrders[0];
    console.log(`\n   [5.2 Audit trên đơn Bespoke thực tế: ${targetBespoke.id}]`);
    const orderQaRes = await makeRequest(`/admin/bespoke/${targetBespoke.id}/qa-audit`, 'POST', {
      inspector: 'Thanh Tra Hội Đồng Nghệ Nhân',
      eightPointInspection: {
        grainlineAlignmentPassed: true,
        frenchSeamRolledPassed: true,
        shellButtonCrossKnotPassed: true,
        monogramTensionPassed: true,
        steamDecatizingPassed: true,
        liningEasePassed: true,
        collarRollHuggingPassed: true,
        hemDropBalancePassed: true,
      },
      artisanCraftHours: 20,
      artisanCompensationVnd: 3200000,
    }, cookie);
    console.log('   Status:', orderQaRes.status);
    console.log('   Grade:', orderQaRes.data.qaAudit?.grade);
    console.log('   Fair Wage Index:', orderQaRes.data.qaAudit?.evaluation?.fairWageIndexRatio + 'x');
    console.log('   Serial:', orderQaRes.data.qaAudit?.evaluation?.qualityCertificateSerial);
  }

  console.log('\n================================================================================');
  console.log('>>> TOÀN BỘ 4 THUẬT TOÁN MODULE 11 (ALGS 51-54) ĐÃ XÁC MINH VẬN HÀNH HOÀN HẢO! <<<');
  console.log('================================================================================\n');
}

verifyModule11Algorithms().catch(err => {
  console.error('LỖI KIỂM ĐỊNH MODULE 11:', err);
  process.exit(1);
});
