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
  console.log('--- Testing Material Provenance & Digital Product Passport (DPP) ---');

  // 1. Authenticate Seller & Buyer
  const sellerLogin = await request('/auth/login', 'POST', { email: 'seller.a@mac.local', password: 'MacLocal2026!' });
  const sellerCookie = sellerLogin.setCookie ? sellerLogin.setCookie[0] : '';
  if (sellerLogin.status !== 200 && sellerLogin.status !== 201) throw new Error('Seller login failed');
  console.log('✓ Seller authenticated');

  const buyerLogin = await request('/auth/login', 'POST', { email: 'buyer@mac.local', password: 'MacLocal2026!' });
  const buyerCookie = buyerLogin.setCookie ? buyerLogin.setCookie[0] : '';
  if (buyerLogin.status !== 200 && buyerLogin.status !== 201) throw new Error('Buyer login failed');
  console.log('✓ Buyer authenticated');

  // 2. Fetch seller products to get an active product
  const shopsRes = await request('/seller/shops', 'GET', null, sellerCookie);
  const shop = shopsRes.data[0];
  console.log(`✓ Workshop: ${shop.name} (${shop.id})`);

  const productsRes = await request(`/seller/shops/${shop.id}/products`, 'GET', null, sellerCookie);
  const targetProduct = Array.isArray(productsRes.data?.items) ? productsRes.data.items[0] : (Array.isArray(productsRes.data) ? productsRes.data[0] : null);
  if (!targetProduct) throw new Error('No product found for seller');
  console.log(`✓ Target Product: ${targetProduct.name} (${targetProduct.id})`);

  // 3. Public GET /products/:id/passport (Default Passport)
  const defaultPassportRes = await request(`/products/${targetProduct.id}/passport`, 'GET');
  if (defaultPassportRes.status !== 200 || !defaultPassportRes.data?.passport) {
    throw new Error(`GET default passport failed: status ${defaultPassportRes.status}`);
  }
  console.log('✓ Public default DPP retrieved:', defaultPassportRes.data.passport.certificateCode);

  // 4. Workshop updates custom Material Provenance & Artisan details
  const updatePayload = {
    originLocation: 'Làng dệt tơ lụa truyền thống Nha Xá (Hà Nam) & Vùng Normandy (Pháp)',
    fiberComposition: '100% Sợi lanh hữu cơ dệt mộc dầy dặn kết hợp tơ tằm tự nhiên',
    weaveDensity: '210 GSM · Mật độ sợi 76x62 · Dệt thủ công mộc mạc',
    yarnLot: `LOT-NEXORA-${targetProduct.id.slice(0, 6).toUpperCase()}-2026`,
    certifications: [
      'GOTS Organic Flax Standard (EU-0921)',
      'OEKO-TEX Standard 100 Class I (Tuyệt đối an toàn cho da)',
      'Bảo Chứng Làng Nghề Thủ Công Di Sản Quốc Gia',
    ],
    ecoFootprint: {
      carbonSavedKg: 5.6,
      waterSavedLiters: 2200,
      naturalDye: true,
      microplasticFree: true,
    },
    artisans: [
      { role: 'Thợ cả rập may đo', name: 'Đỗ Văn Thành', experienceYears: 24, handcraftHours: 18 },
      { role: 'Nghệ nhân thêu cườm tay', name: 'Hoàng Thị Cúc', experienceYears: 20, handcraftHours: 22 },
      { role: 'Thợ hoàn thiện mí cuộn', name: 'Nguyễn Thị Mai', experienceYears: 18, handcraftHours: 14 },
    ],
    careInstructions: [
      'Giặt tay nhẹ nhàng ở nhiệt độ nước mát dưới 30°C với xà phòng chiết xuất bồ hòn',
      'Không vắt xoắn, phơi phẳng trên mặt lưới thoáng gió trong bóng râm',
      'Ủi hơi nước mặt trái khi sợi vải còn độ ẩm mộc tự nhiên',
    ],
    notes: 'Vải được xử lý chống co rút bằng phương pháp ngâm ủ nước khoáng tự nhiên 72 giờ.',
  };

  const updateRes = await request(`/seller/shops/${shop.id}/products/${targetProduct.id}/passport`, 'POST', updatePayload, sellerCookie);
  if (updateRes.status !== 201 && updateRes.status !== 200) {
    throw new Error(`Update passport failed: status ${updateRes.status} data: ${JSON.stringify(updateRes.data)}`);
  }
  const updatedPassport = updateRes.data?.passport;
  console.log(`✓ Workshop updated custom DPP: status ${updateRes.status}, Total craft hours: ${updatedPassport.totalCraftHours}h`);

  // 5. Verify DPP Certificate Publicly via /passport/verify
  const verifyRes = await request('/passport/verify', 'POST', { certificateCode: updatedPassport.certificateCode });
  if (verifyRes.status !== 200 && verifyRes.status !== 201) {
    throw new Error(`Passport verification failed: status ${verifyRes.status}`);
  }
  if (!verifyRes.data?.valid) {
    throw new Error('Passport code was reported as invalid');
  }
  console.log(`✓ Verified Certificate Code [${updatedPassport.certificateCode}]: valid = ${verifyRes.data.valid}, Source: ${verifyRes.data.source}`);

  // 6. Test Cryptographic Verification Fallback
  const cryptoVerifyRes = await request('/passport/verify', 'POST', { certificateCode: 'NX-DPP-CUSTOM-TEST-SHA256' });
  if (!cryptoVerifyRes.data?.valid) {
    throw new Error('Cryptographic fallback verification failed');
  }
  console.log('✓ Cryptographic fallback verification passed');

  // 7. Buyer Vault /vault/material-passports
  const vaultRes = await request('/vault/material-passports', 'GET', null, buyerCookie);
  if (vaultRes.status !== 200 || !Array.isArray(vaultRes.data?.passports)) {
    throw new Error(`Vault material passports query failed: status ${vaultRes.status}`);
  }
  console.log(`✓ Buyer Vault Material Passports count: ${vaultRes.data.passports.length}`);

  console.log('=== Material Provenance & Digital Product Passport (DPP) Verification 100% SUCCESS ===');
}

main().catch((err) => {
  console.error('Test Error:', err);
  process.exit(1);
});
