const http = require('http');
const assert = require('assert');

async function request(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:4000/api/v1' + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'mac-web',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(cookie ? { 'Cookie': cookie } : {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let setCookie = res.headers['set-cookie'];
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, data: parsed, setCookie });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('--- BẮT ĐẦU KIỂM THỬ: Chỉ Định May Đo Từ Kho Vải Di Sản (Fabric-to-Bespoke Commission) ---');

  // 1. Đăng nhập Buyer, Seller, Admin
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  assert.strictEqual(buyerLogin.status, 201, 'Buyer login status phải là 201');
  const buyerCookie = buyerLogin.setCookie[0];

  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  assert.strictEqual(sellerLogin.status, 201, 'Seller login status phải là 201');
  const sellerCookie = sellerLogin.setCookie[0];

  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@mac.local', password: 'MacLocal2026!' });
  assert.strictEqual(adminLogin.status, 201, 'Admin login status phải là 201');
  const adminCookie = adminLogin.setCookie[0];
  console.log('[1/7] Xác thực người dùng (Buyer, Seller, Admin): OK');

  // 2. Buyer lấy danh sách vải quý và ký quỹ cắt giữ 3.0 mét
  const fabricsRes = await request('/fabrics', 'GET');
  assert.strictEqual(fabricsRes.status, 200);
  assert(fabricsRes.data.fabrics?.length > 0, 'Phải có danh sách vải di sản');
  const bolt = fabricsRes.data.fabrics.find(f => f.availableMeterage >= 2.0) || fabricsRes.data.fabrics[0];
  const metersToReserve = Math.min(2.0, bolt.availableMeterage);

  const reserveRes = await request(`/fabrics/${bolt.id}/reserve`, 'POST', {
    meters: metersToReserve,
    purpose: 'May Áo Dài Di Sản Tơ Tằm Cổ',
    recipientName: 'Minh Anh',
    phone: '0912345678',
    notes: 'Bảo lưu canh sợi dệt thủ công làng nghề'
  }, buyerCookie);

  assert.strictEqual(reserveRes.status, 201, 'Đặt chỗ vải phải trả về 201');
  const reservation = reserveRes.data.reservation;
  assert(reservation && reservation.certificateCode, 'Phải sinh mã chứng thư đặt chỗ');
  const reserveCertificate = reservation.certificateCode;
  const reserveDeposit = reservation.depositAmount;
  console.log(`[2/7] Đặt chỗ vải di sản: OK (Mã: ${reserveCertificate}, Cọc 30%: ${reserveDeposit}đ)`);

  // 3. Buyer kiểm tra kho vải cá nhân (Buyer Vault)
  const myReservesRes = await request('/vault/fabric-reserves', 'GET', null, buyerCookie);
  assert.strictEqual(myReservesRes.status, 200);
  const myReserve = myReservesRes.data.find(r => r.certificateCode === reserveCertificate || r.certificate === reserveCertificate);
  assert(myReserve, 'Phải tìm thấy súc vải đã đặt trong kho cá nhân');
  const reserveEntityId = myReserve.id;
  console.log(`[3/7] Xác nhận súc vải trong Vault: OK (EntityId: ${reserveEntityId})`);

  // 4. Buyer chỉ định may đo từ súc vải di sản
  const commissionRes = await request(`/vault/fabric-reserves/${reserveEntityId}/commission`, 'POST', {
    productName: 'Áo Dài Di Sản Tơ Tằm Cổ Dáng Suông',
    shopId: 'shop-nep',
    shopName: 'NÉP Studio',
    monogram: 'N.X.T',
    lining: 'Lụa Habotai cùng tông màu',
    notes: 'Cổ đứng 3cm, xẻ tà cao vừa phải, may đo chuẩn nhân trắc',
    passport: {
      height: 172,
      weight: 58,
      chest: 88,
      waist: 66,
      hips: 92,
    }
  }, buyerCookie);

  assert.strictEqual(commissionRes.status, 201, 'Khởi tạo may đo phải trả về 201');
  assert(commissionRes.data.ok, 'Kết quả phải trả về ok = true');
  const bespoke = commissionRes.data.bespoke;
  assert.strictEqual(bespoke.isHeritageFabric, true, 'Đơn may đo phải gắn cờ isHeritageFabric = true');
  assert.strictEqual(bespoke.fabricReserveId, reserveEntityId, 'Đơn may đo phải gắn fabricReserveId');
  assert(bespoke.fabricCertificate, 'Đơn may đo phải lưu chứng thư vải');
  console.log(`[4/7] Chỉ định may đo thành công: OK (Mã đơn: ${bespoke.id}, Chứng thư: ${bespoke.fabricCertificate})`);

  // 5. Kiểm tra súc vải đã cập nhật trạng thái COMMISSIONED
  const updatedReservesRes = await request('/vault/fabric-reserves', 'GET', null, buyerCookie);
  const updatedReserve = updatedReservesRes.data.find(r => r.id === reserveEntityId);
  assert(updatedReserve, 'Phải tìm thấy súc vải sau khi cập nhật');
  assert.strictEqual(updatedReserve.allocationStatus, 'COMMISSIONED', 'Trạng thái súc vải phải là COMMISSIONED');
  assert.strictEqual(updatedReserve.allocatedToBespokeId, bespoke.id, 'Phải liên kết đúng mã đơn may đo');
  console.log('[5/7] Trạng thái súc vải trong kho: OK (COMMISSIONED -> ' + bespoke.id + ')');

  // 6. Xưởng may (Seller Workbench) nhận đơn may đo từ vải di sản
  const sellerBespokeRes = await request('/seller/shops/shop-nep/bespoke', 'GET', null, sellerCookie);
  assert.strictEqual(sellerBespokeRes.status, 200);
  const foundOrder = sellerBespokeRes.data.find(b => b.id === bespoke.id);
  assert(foundOrder, 'Xưởng may phải thấy đơn may đo từ vải di sản trong danh sách');
  assert.strictEqual(foundOrder.isHeritageFabric, true, 'Xưởng may thấy cờ isHeritageFabric = true');
  assert.strictEqual(foundOrder.fabricCertificate, reserveCertificate, 'Chứng thư vải khớp tuyệt đối');

  // Xưởng may cập nhật tiến trình sang PATTERNING
  const advanceStageRes = await request(`/seller/shops/shop-nep/bespoke/${bespoke.id}/stage`, 'POST', {
    stage: 'PATTERNING',
    tailorNote: 'Đã nhận súc vải di sản từ kho bảo quản, nghệ nhân tiến hành phóng rập mộc.',
    masterTailor: 'Master Tailor Hoàng Nam',
  }, sellerCookie);
  assert.strictEqual(advanceStageRes.status, 201);
  assert.strictEqual(advanceStageRes.data.bespoke.stage, 'PATTERNING');
  console.log('[6/7] Bàn làm việc nghệ nhân may đo: OK (Đã tiếp nhận súc vải di sản & chuyển bước PATTERNING)');

  // 7. Giám sát toàn mạng lưới Admin Portal
  const adminBespokeRes = await request('/admin/bespoke', 'GET', null, adminCookie);
  assert.strictEqual(adminBespokeRes.status, 200);
  assert(adminBespokeRes.data.kpis.heritageFabricCount >= 1, 'KPI Admin phải ghi nhận đơn từ vải di sản');
  const adminOrder = adminBespokeRes.data.orders.find(o => o.id === bespoke.id);
  assert(adminOrder, 'Admin phải thấy đơn may đo vải di sản');
  assert.strictEqual(adminOrder.isHeritageFabric, true);
  console.log(`[7/7] Giám sát Admin Portal: OK (Tổng đơn từ Vải Di Sản: ${adminBespokeRes.data.kpis.heritageFabricCount})`);

  console.log('--- HOÀN TẤT KIỂM THỬ: CHỈ ĐỊNH MAY ĐO TỪ VẢI DI SẢN THÀNH CÔNG 100%! ---');
}

run().catch(err => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
