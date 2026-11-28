const assert = require('assert');

const API_BASE = 'http://localhost:4000/api/v1';

async function main() {
  console.log('--- BẮT ĐẦU KIỂM THỬ: Multi-Field Catalog Search & Material Matching ---');

  // 1. Kiểm tra API Health
  const healthRes = await fetch(`${API_BASE}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health endpoint phải trả về 200 OK');
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'ok', 'Health status phải là ok');
  console.log('[1/6] API Health Check: OK');

  // 2. Tìm kiếm đa trường (q=linen, q=lụa, q=dạ)
  const linenSearchRes = await fetch(`${API_BASE}/products?q=linen`);
  assert.strictEqual(linenSearchRes.status, 200);
  const linenSearch = await linenSearchRes.json();
  assert(linenSearch.items.length > 0, 'Phải tìm thấy sản phẩm có từ khóa linen');
  const allMatchLinen = linenSearch.items.every(p => 
    p.name.toLowerCase().includes('linen') || 
    p.material.toLowerCase().includes('linen') || 
    (p.description && p.description.toLowerCase().includes('linen'))
  );
  assert(allMatchLinen, 'Mọi sản phẩm trả về từ q=linen phải chứa từ khóa linen ở name, material hoặc description');
  console.log(`[2/6] Multi-Field Search (q=linen): OK (${linenSearch.items.length} sản phẩm khớp)`);

  // 3. Khớp chất liệu thông minh (material synonyms)
  // 3a. Linen / Lanh
  const matLinenRes = await fetch(`${API_BASE}/products?material=linen`);
  const matLinen = await matLinenRes.json();
  assert(matLinen.items.length > 0, 'Phải tìm thấy sản phẩm khi lọc material=linen');
  assert(matLinen.items.every(p => /linen|lanh/i.test(p.material)), 'Tất cả sản phẩm material=linen phải có lanh/linen');
  console.log(`[3a/6] Material Synonym Filter (material=linen): OK (${matLinen.items.length} sản phẩm)`);

  // 3b. Wool / Dạ / Len
  const matWoolRes = await fetch(`${API_BASE}/products?material=wool`);
  const matWool = await matWoolRes.json();
  assert(matWool.items.length > 0, 'Phải tìm thấy sản phẩm khi lọc material=wool');
  assert(matWool.items.every(p => /wool|dạ|len/i.test(p.material)), 'Tất cả sản phẩm material=wool phải có wool/dạ/len');
  console.log(`[3b/6] Material Synonym Filter (material=wool): OK (${matWool.items.length} sản phẩm)`);

  // 3c. Cotton / Bông
  const matCottonRes = await fetch(`${API_BASE}/products?material=cotton`);
  const matCotton = await matCottonRes.json();
  assert(matCotton.items.length > 0, 'Phải tìm thấy sản phẩm khi lọc material=cotton');
  assert(matCotton.items.every(p => /cotton|bông/i.test(p.material)), 'Tất cả sản phẩm material=cotton phải có cotton/bông');
  console.log(`[3c/6] Material Synonym Filter (material=cotton): OK (${matCotton.items.length} sản phẩm)`);

  // 4. Lọc theo xưởng may (shop filter)
  const shopNepRes = await fetch(`${API_BASE}/products?shop=shop-nep`);
  const shopNep = await shopNepRes.json();
  assert(shopNep.items.length > 0, 'Phải có sản phẩm thuộc xưởng NÉP Studio');
  assert(shopNep.items.every(p => p.shop.slug === 'shop-nep' || p.shop.id === 'shop-nep' || p.shop.name.includes('NÉP')), 'Chỉ trả về xưởng NÉP Studio');
  console.log(`[4/6] Workshop Filter (shop=shop-nep): OK (${shopNep.items.length} sản phẩm)`);

  // 5. Lọc hàng chính hãng NEXORA Mall (isMall=true)
  const mallRes = await fetch(`${API_BASE}/products?isMall=true`);
  const mall = await mallRes.json();
  assert(mall.items.length > 0, 'Phải có sản phẩm NEXORA Mall');
  assert(mall.items.every(p => p.shop.isMall === true), 'Mọi sản phẩm phải thuộc xưởng Mall');
  console.log(`[5/6] Mall Certification Filter (isMall=true): OK (${mall.items.length} sản phẩm)`);

  // 6. Sắp xếp kết quả (Sort Order)
  // 6a. Sắp xếp giá tăng dần
  const sortPriceAscRes = await fetch(`${API_BASE}/products?sort=price-asc`);
  const sortPriceAsc = await sortPriceAscRes.json();
  for (let i = 0; i < sortPriceAsc.items.length - 1; i++) {
    const minA = Math.min(...sortPriceAsc.items[i].variants.map(v => v.price));
    const minB = Math.min(...sortPriceAsc.items[i + 1].variants.map(v => v.price));
    assert(minA <= minB, `Giá phải tăng dần: item ${i} (${minA}) <= item ${i+1} (${minB})`);
  }
  console.log(`[6a/6] Sort Order (price-asc): OK`);

  // 6b. Sắp xếp giá giảm dần
  const sortPriceDescRes = await fetch(`${API_BASE}/products?sort=price-desc`);
  const sortPriceDesc = await sortPriceDescRes.json();
  for (let i = 0; i < sortPriceDesc.items.length - 1; i++) {
    const minA = Math.min(...sortPriceDesc.items[i].variants.map(v => v.price));
    const minB = Math.min(...sortPriceDesc.items[i + 1].variants.map(v => v.price));
    assert(minA >= minB, `Giá phải giảm dần: item ${i} (${minA}) >= item ${i+1} (${minB})`);
  }
  console.log(`[6b/6] Sort Order (price-desc): OK`);

  // 6c. Sắp xếp tên A-Z
  const sortNameRes = await fetch(`${API_BASE}/products?sort=name-asc`);
  const sortName = await sortNameRes.json();
  for (let i = 0; i < sortName.items.length - 1; i++) {
    const nameA = sortName.items[i].name;
    const nameB = sortName.items[i + 1].name;
    assert(nameA.localeCompare(nameB, 'vi') <= 0, `Tên phải theo thứ tự A-Z: "${nameA}" <= "${nameB}"`);
  }
  console.log(`[6c/6] Sort Order (name-asc): OK`);

  console.log('--- TẤT CẢ CÁC BƯỚC KIỂM THỬ TÌM KIẾM ĐÃ HOÀN TẤT THÀNH CÔNG (100% PASSED) ---');
}

main().catch(err => {
  console.error('LỖI KIỂM THỬ TÌM KIẾM:', err);
  process.exit(1);
});
