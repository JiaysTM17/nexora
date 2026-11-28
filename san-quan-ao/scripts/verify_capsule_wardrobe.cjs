const http = require('http');

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

async function main() {
  console.log('--- Testing Curated Capsule Wardrobe & Cost-Per-Wear Planner ---');

  // 1. Authenticate Buyer
  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) throw new Error('Buyer login failed');
  console.log('✓ Buyer authenticated');

  // 2. Save Capsule Wardrobe
  const capsulePayload = {
    title: 'Tủ Đồ Nhộng Thu Đông Quiet Luxury (5 Món · 12 Bộ Phối)',
    pieces: [
      { id: 'linen-shirt', name: 'Sơ mi linen thong thả', color: 'Kem', price: 425000 },
      { id: 'everyday-tee', name: 'Áo thun ngày thường', color: 'Trắng', price: 245000 },
      { id: 'wide-trousers', name: 'Quần suông nếp nhẹ', color: 'Nâu', price: 495000 },
      { id: 'weekend-dress', name: 'Đầm dạo cuối tuần', color: 'Nâu', price: 685000 },
      { id: 'linen-blazer', name: 'Áo khoác Blazer Linen', color: 'Kem', price: 1350000 },
    ],
    outfitsCount: 12,
    estimatedCostPerWear: 18400,
    totalInvestment: 2720000,
    bundleDiscount: 480000,
    palette: 'Kem Mộc / Nâu Cát / Trắng Tơ / Đen Tuyển',
    notes: 'Tủ đồ tối giản may đo từ sợi lanh hữu cơ và tơ tằm, phù hợp môi trường công sở và du lịch.',
  };

  const saveRes = await request('/vault/capsule', 'POST', capsulePayload, buyerCookie);
  if (saveRes.status !== 200 && saveRes.status !== 201) {
    throw new Error(`Save capsule failed: status ${saveRes.status} data: ${JSON.stringify(saveRes.data)}`);
  }
  const savedCapsule = saveRes.data?.capsule;
  console.log(`✓ Capsule saved successfully: ID [${savedCapsule.id}], Outfits: ${savedCapsule.outfitsCount}`);

  // 3. Query Saved Capsules
  const listRes = await request('/vault/capsules', 'GET', null, buyerCookie);
  if (listRes.status !== 200 || !Array.isArray(listRes.data)) {
    throw new Error(`List capsules failed: status ${listRes.status}`);
  }
  console.log(`✓ Buyer saved capsules count: ${listRes.data.length}`);

  const found = listRes.data.find(c => c.id === savedCapsule.id);
  if (!found) throw new Error('Created capsule not found in buyer list');
  console.log(`✓ Verified capsule persistence in buyer vault: Cost-Per-Wear = ${found.estimatedCostPerWear}₫/lần`);

  // 4. Test Swatch Kit order for the lookbook / capsule palette
  const swatchRes = await request('/swatch-orders', 'POST', {
    productId: 'linen-shirt',
    shopId: 'shop-nep',
    productName: 'Set 3 Mẫu Vải Bảng Màu Capsule Tủ Đồ Nhộng',
    swatches: ['Linen Kem Mộc Tự Nhiên', 'Cotton Nâu Cát Compact', 'Wool Lụa Dạ Mỏng'],
    recipientName: 'Minh Anh (Capsule VIP)',
    phone: '0901234567',
    address: 'Quận 1, TP. Hồ Chí Minh',
    depositFee: 50000,
  }, buyerCookie);

  if (swatchRes.status !== 200 && swatchRes.status !== 201) {
    throw new Error(`Capsule Swatch order failed: status ${swatchRes.status}`);
  }
  console.log(`✓ Capsule Swatch kit ordered directly: ID [${swatchRes.data.swatchOrder.id}], Voucher: ${swatchRes.data.swatchOrder.voucherCode}`);

  console.log('=== Curated Capsule Wardrobe & Cost-Per-Wear Planner Verification 100% SUCCESS ===');
}

main().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
