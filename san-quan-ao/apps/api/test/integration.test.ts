import 'reflect-metadata';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient, expirePendingOrders } from '@mac/database';
import type { INestApplication } from '@nestjs/common';
import { bootstrap } from '../src/main';
import { hash } from '../src/common';
import { passwordHash } from '../src/auth';

const testUrl = process.env.TEST_DATABASE_URL ?? 'postgresql://mac:mac_local_only@127.0.0.1:54329/mac_test?schema=public';
if (new URL(testUrl).pathname !== '/mac_test') throw new Error('Integration suite requires isolated database named mac_test');
process.env.DATABASE_URL = testUrl;
process.env.SHIPPING_PROVIDER = 'mock';
const db = new PrismaClient({ datasourceUrl: testUrl });
let app: INestApplication, base: string;
type Client = (path: string, method?: string, data?: unknown) => Promise<{ status: number; body: any; headers: Headers }>;
function client(token?: string): Client {
  return async (path, method = 'GET', data) => {
    const response = await fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'mac-web', ...(token ? { Cookie: `mac_session=${token}` } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    return { status: response.status, body: await response.json(), headers: response.headers };
  };
}
async function account(role: 'USER' | 'ADMIN' = 'USER') {
  const suffix = randomUUID(), token = randomUUID();
  const user = await db.user.create({ data: { email: `${suffix}@test.local`, name: 'Test user', passwordHash: await passwordHash('Integration123!'), role } });
  await db.session.create({ data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + 3600000) } });
  const address = await db.address.create({ data: { userId: user.id, recipient: 'Khách test', phone: '0900000000', line: '123 phố kiểm thử', province: 'Hà Nội' } });
  return { user, token, address, call: client(token) };
}
async function fixture(stock = 5) {
  const seller = await account(), buyer = await account(), suffix = randomUUID();
  const category = await db.category.upsert({ where: { slug: 'test-ao' }, create: { slug: 'test-ao', name: 'Áo kiểm thử' }, update: {} });
  const shop = await db.shop.create({ data: { name: `Shop ${suffix}`, slug: suffix, origin: 'Địa chỉ kiểm thử', status: 'APPROVED', members: { create: { userId: seller.user.id } } } });
  const product = await db.product.create({ data: { name: `Áo ${suffix}`, slug: `ao-${suffix}`, shopId: shop.id, categoryId: category.id, material: 'Linen', fit: 'Regular', description: 'Sản phẩm kiểm thử', status: 'ACTIVE', sizeCharts: { create: { version: 1, kind: 'GARMENT', rows: [{ size: 'M', nguc: 98 }], guide: 'Đo vòng ngực' } }, variants: { create: { shopId: shop.id, sku: `SKU-${suffix}`, color: 'Đen', colorHex: '#222222', size: 'M', price: 200001, inventory: { create: { onHand: stock } } } } }, include: { variants: true } });
  return { seller, buyer, shop, product, variant: product.variants[0] };
}
async function quote(buyer: Awaited<ReturnType<typeof account>>, variantId: string, vouchers: Record<string,string> = {}) {
  const added = await buyer.call('/cart', 'POST', { variantId, quantity: 1 });
  assert.equal(added.status, 201, JSON.stringify(added.body));
  const result = await buyer.call('/checkout/quote', 'POST', { addressId: buyer.address.id, vouchers });
  assert.equal(result.status, 201, JSON.stringify(result.body));
  return result.body;
}
async function place(buyer: Awaited<ReturnType<typeof account>>, quoteId: string, key = randomUUID()) {
  return buyer.call('/orders', 'POST', { quoteId, idempotencyKey: key });
}
before(async () => {
  await db.$connect();
  app = await bootstrap(0);
  base = `${await app.getUrl()}/api/v1`;
});
after(async () => { await app?.close(); await db.$disconnect(); });

test('session login, HttpOnly cookie, logout and CSRF boundary', async () => {
  const user = await account();
  assert.equal((await client()('/orders')).status, 401);
  const result = await client()('/auth/login', 'POST', { email: user.user.email, password: 'Integration123!' });
  assert.equal(result.status, 201);
  assert.match(result.headers.get('set-cookie') ?? '', /HttpOnly/);
  assert.equal(result.body.passwordHash, undefined);
  const csrf = await fetch(`${base}/auth/logout`, { method: 'POST', headers: { Cookie: `mac_session=${user.token}` } });
  assert.equal(csrf.status, 403);
  await user.call('/auth/logout', 'POST');
  assert.equal((await user.call('/auth/me')).status, 401);
});

test('black + M + available all constrain the same SKU', async () => {
  const f = await fixture(0);
  await db.variant.createMany({ data: [
    { id: `${f.variant.id}-white`, productId: f.product.id, shopId: f.shop.id, sku: 'WHITE-M', color: 'Trắng', colorHex: '#ffffff', size: 'M', price: 200001 },
    { id: `${f.variant.id}-large`, productId: f.product.id, shopId: f.shop.id, sku: 'BLACK-L', color: 'Đen', colorHex: '#222222', size: 'L', price: 200001 },
  ] });
  await db.inventoryBalance.createMany({ data: [{ variantId: `${f.variant.id}-white`, onHand: 3 }, { variantId: `${f.variant.id}-large`, onHand: 1 }] });
  const query = `/products?q=${encodeURIComponent(f.product.name)}&color=${encodeURIComponent('Đen')}&size=M&inStock=true`;
  assert.equal((await client()(query)).body.total, 0);
  assert.equal((await client()(query.replace('size=M','size=L'))).body.total, 1);
});

test('repeated and concurrent checkout creates one order, one hold and one voucher use', async () => {
  const f = await fixture();
  const voucher = await db.voucher.create({ data: { shopId: f.shop.id, code: 'TEST', amount: 12345, minimum: 0, maxUses: 10, expiresAt: new Date(Date.now()+86400000) } });
  const q = await quote(f.buyer, f.variant.id, { [f.shop.id]: 'TEST' }), key = randomUUID();
  const responses = await Promise.all([place(f.buyer, q.id, key), place(f.buyer, q.id, key)]);
  responses.forEach(r => assert.equal(r.status, 201, JSON.stringify(r.body)));
  assert.equal(responses[0].body.id, responses[1].body.id);
  assert.equal(await db.order.count({ where: { userId: f.buyer.user.id } }), 1);
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({ where: { variantId: f.variant.id } })).reserved, 1);
  assert.equal((await db.voucher.findUniqueOrThrow({ where: { id: voucher.id } })).uses, 1);
  assert.equal((await place(f.buyer, q.id)).body.id, responses[0].body.id);
});

test('two customers compete for last SKU with no negative inventory', async () => {
  const f = await fixture(1), second = await account();
  const q1 = await quote(f.buyer, f.variant.id), q2 = await quote(second, f.variant.id);
  const results = await Promise.all([place(f.buyer, q1.id), place(second, q2.id)]);
  assert.deepEqual(results.map(r => r.status).sort(), [201,409]);
  const inventory = await db.inventoryBalance.findUniqueOrThrow({ where: { variantId: f.variant.id } });
  assert.equal(inventory.onHand, 1); assert.equal(inventory.reserved, 1);
});

test('price change and expired quote require explicit reconfirmation', async () => {
  const f = await fixture(); const q = await quote(f.buyer, f.variant.id);
  await db.variant.update({ where: { id: f.variant.id }, data: { price: 299999 } });
  const changed = await place(f.buyer, q.id);
  assert.equal(changed.status, 409); assert.equal(changed.body.code, 'QUOTE_CHANGED');
  assert.equal(await db.order.count({ where: { userId: f.buyer.user.id } }), 0);
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({ where: { variantId: f.variant.id } })).reserved, 0);
  await db.checkoutQuote.update({ where: { id: q.id }, data: { expiresAt: new Date(0) } });
  assert.equal((await place(f.buyer,q.id)).body.code, 'QUOTE_EXPIRED');
});

test('multi-shop orders isolate cancellation, ownership and immutable snapshots', async () => {
  const a = await fixture(), b = await fixture();
  await a.buyer.call('/cart', 'POST', { variantId: a.variant.id, quantity: 1 });
  const q = await quote(a.buyer, b.variant.id), result = await place(a.buyer,q.id);
  assert.equal(result.status,201); assert.equal(result.body.shops.length,2);
  const oa = result.body.shops.find((s:any)=>s.shopId===a.shop.id), ob = result.body.shops.find((s:any)=>s.shopId===b.shop.id);
  assert.equal((await a.seller.call(`/seller/shops/${b.shop.id}/orders`)).status,403);
  assert.equal((await a.seller.call(`/seller/shops/${a.shop.id}/orders/${ob.id}/transition`,'POST',{status:'CONFIRMED'})).status,404);
  assert.equal((await b.buyer.call(`/orders/shops/${oa.id}/cancel`,'POST')).status,404);
  await db.product.update({where:{id:a.product.id},data:{name:'Đã đổi tên',status:'HIDDEN'}});
  assert.equal((await a.buyer.call('/orders')).body[0].shops.find((s:any)=>s.id===oa.id).items[0].snapshot.name,a.product.name);
  await a.buyer.call(`/orders/shops/${oa.id}/cancel`,'POST');
  await a.buyer.call(`/orders/shops/${oa.id}/cancel`,'POST');
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({where:{variantId:a.variant.id}})).reserved,0);
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({where:{variantId:b.variant.id}})).reserved,1);
  assert.equal((await db.shopOrder.findUniqueOrThrow({where:{id:ob.id}})).status,'PENDING');
});

test('dispatch and duplicate/out-of-order shipping events never double stock or COD', async () => {
  const f = await fixture(), admin = await account('ADMIN');
  const q = await quote(f.buyer,f.variant.id), placed = await place(f.buyer,q.id), so = placed.body.shops[0];
  for (const status of ['CONFIRMED','PACKED','SHIPPED','SHIPPED']) assert.equal((await f.seller.call(`/seller/shops/${f.shop.id}/orders/${so.id}/transition`,'POST',{status})).status,201);
  const stock = await db.inventoryBalance.findUniqueOrThrow({where:{variantId:f.variant.id}});
  assert.equal(stock.onHand,4); assert.equal(stock.reserved,0);
  const shipment = await db.shipment.findUniqueOrThrow({where:{shopOrderId:so.id}}), externalId=randomUUID();
  const url=`/admin/mock/shipments/${shipment.id}/event`;
  assert.equal((await f.seller.call(url,'POST',{externalId,status:'DELIVERED'})).status,403);
  await admin.call(url,'POST',{externalId,status:'DELIVERED'});
  const duplicate = await admin.call(url,'POST',{externalId,status:'DELIVERED'});
  assert.equal(duplicate.body.duplicate,true);
  const late = await admin.call(url,'POST',{externalId:randomUUID(),status:'DELIVERY_FAILED'});
  assert.equal(late.body.ignored,true);
  assert.equal((await db.shopOrder.findUniqueOrThrow({where:{id:so.id}})).status,'DELIVERED');
  assert.equal(await db.sellerLedgerEntry.count({where:{shopOrderId:so.id}}),3);
});

test('moderated posts disappear from feed and saves without deleting purchased items', async () => {
  const f=await fixture(), admin=await account('ADMIN');
  const post=await f.buyer.call('/community/posts','POST',{caption:'Bộ đồ kiểm thử cộng đồng',images:['http://localhost:3000/products/outfit.svg'],tags:[{productId:f.product.id,mediaPosition:0,x:0.5,y:0.5}]});
  assert.equal(post.status,201); const postId=post.body.id;
  await f.buyer.call(`/community/posts/${postId}/save`,'POST');
  await f.buyer.call(`/community/posts/${postId}/like`,'POST'); await f.buyer.call(`/community/posts/${postId}/like`,'POST');
  assert.equal(await db.reaction.count({where:{postId}}),1);
  const q=await quote(f.buyer,f.variant.id); await place(f.buyer,q.id);
  await admin.call(`/admin/posts/${postId}/moderate`,'POST',{status:'HIDDEN',reason:'Kiểm thử loại khỏi công khai'});
  assert.ok(!(await client()('/community/posts')).body.some((p:any)=>p.id===postId));
  assert.ok(!(await f.buyer.call('/community/saved')).body.some((p:any)=>p.postId===postId));
  assert.equal((await f.buyer.call(`/community/posts/${postId}/comments`,'POST',{body:'Không được đăng'})).status,404);
  assert.equal((await f.buyer.call('/orders')).body.length,1);
});

test('database-driven expiration is idempotent and preserves confirmed orders', async () => {
  const f=await fixture(), q=await quote(f.buyer,f.variant.id), result=await place(f.buyer,q.id), so=result.body.shops[0];
  await db.shopOrder.update({where:{id:so.id},data:{holdUntil:new Date(0)}});
  await expirePendingOrders(db); await expirePendingOrders(db);
  assert.equal((await db.shopOrder.findUniqueOrThrow({where:{id:so.id}})).status,'CANCELLED');
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({where:{variantId:f.variant.id}})).reserved,0);
  const g=await fixture(), q2=await quote(g.buyer,g.variant.id), r2=await place(g.buyer,q2.id), so2=r2.body.shops[0];
  await g.seller.call(`/seller/shops/${g.shop.id}/orders/${so2.id}/transition`,'POST',{status:'CONFIRMED'});
  await db.shopOrder.update({where:{id:so2.id},data:{holdUntil:new Date(0)}});
  await expirePendingOrders(db);
  assert.equal((await db.shopOrder.findUniqueOrThrow({where:{id:so2.id}})).status,'CONFIRMED');
  assert.equal((await db.inventoryBalance.findUniqueOrThrow({where:{variantId:g.variant.id}})).reserved,1);
});
test('reviews, return/refund flow and seller vouchers/ledger enforce rules end-to-end', async () => {
  const f = await fixture(), admin = await account('ADMIN'), koc = await account();
  const q = await quote(f.buyer, f.variant.id);
  const placed = await f.buyer.call('/orders', 'POST', { quoteId: q.id, idempotencyKey: randomUUID(), refUserId: koc.user.id });
  const so = placed.body.shops[0];
  const itemId = so.items[0].id;
  // Cannot review before DELIVERED
  assert.equal((await f.buyer.call('/reviews', 'POST', { orderItemId: itemId, rating: 5, body: 'Đẹp lắm nha' })).status, 409);
  await f.seller.call(`/seller/shops/${f.shop.id}/orders/${so.id}/transition`, 'POST', { status: 'CONFIRMED' });
  await f.seller.call(`/seller/shops/${f.shop.id}/orders/${so.id}/transition`, 'POST', { status: 'PACKED' });
  await f.seller.call(`/seller/shops/${f.shop.id}/orders/${so.id}/transition`, 'POST', { status: 'SHIPPED' });
  const shipment = await db.shipment.findUniqueOrThrow({ where: { shopOrderId: so.id } });
  await admin.call(`/admin/mock/shipments/${shipment.id}/event`, 'POST', { externalId: randomUUID(), status: 'DELIVERED' });
  // Verify KOC Affiliate earning is HELD and PDPD waybill is masked for seller
  const affHeld = await koc.call('/affiliate/summary');
  assert.equal(affHeld.status, 200);
  assert.ok(affHeld.body.held > 0);
  const sellerOrders = await f.seller.call(`/seller/shops/${f.shop.id}/orders`);
  assert.match(sellerOrders.body[0].order.address.line, /PDPD/);
  // Review succeeds once delivered, duplicate blocked
  assert.equal((await f.buyer.call('/reviews', 'POST', { orderItemId: itemId, rating: 5, body: 'Vải linen rất mát và đứng phom' })).status, 201);
  assert.equal((await f.buyer.call('/reviews', 'POST', { orderItemId: itemId, rating: 4, body: 'Đánh giá lặp' })).status, 409);
  // Buyer requests refund, seller approves & completes -> ledger debited, status RETURNED, affiliate CANCELLED
  const ret = await f.buyer.call(`/orders/shops/${so.id}/returns`, 'POST', { kind: 'REFUND', reason: 'Không vừa vai áo', items: [{ orderItemId: itemId, quantity: 1 }] });
  assert.equal(ret.status, 201);
  assert.equal((await f.seller.call(`/seller/shops/${f.shop.id}/returns/${ret.body.id}/decision`, 'POST', { status: 'APPROVED' })).status, 201);
  assert.equal((await f.seller.call(`/seller/shops/${f.shop.id}/returns/${ret.body.id}/decision`, 'POST', { status: 'COMPLETED' })).status, 201);
  assert.equal((await db.shopOrder.findUniqueOrThrow({ where: { id: so.id } })).status, 'RETURNED');
  const ledger = await f.seller.call(`/seller/shops/${f.shop.id}/ledger`);
  assert.equal(ledger.status, 200);
  assert.ok(ledger.body.entries.some((e: { kind: string }) => e.kind === 'REFUND_DEBIT'));
  assert.ok(ledger.body.entries.some((e: { kind: string }) => e.kind === 'TAX_WITHHOLDING_VAT_PIT'));
  assert.equal((await koc.call('/affiliate/summary')).body.held, 0);
  // Seller creates voucher
  const vRes = await f.seller.call(`/seller/shops/${f.shop.id}/vouchers`, 'POST', { code: `NX${randomUUID().slice(0, 6).toUpperCase()}`, amount: 30000, minimum: 200000, maxUses: 10, daysValid: 15 });
  assert.equal(vRes.status, 201);
});
test('trade-in 2-round appraisal and vas-care zip-seal booking work end-to-end', async () => {
  const f = await fixture(), admin = await account('ADMIN');
  // Trade-In Vòng 1 (AI Preliminary) -> Vòng 2 (Admin Hub Inspection) -> Voucher issued
  const ti = await f.buyer.call('/trade-in', 'POST', { brand: 'NÉP Studio', itemName: 'Áo khoác Trench', category: 'Áo khoác', conditionNote: 'Mới 95%, còn nguyên tem' });
  assert.equal(ti.status, 201);
  assert.equal(ti.body.status, 'AI_PRELIMINARY');
  assert.ok(ti.body.estimatedValue > 0);
  const inspected = await admin.call(`/admin/services/trade-ins/${ti.body.id}/inspect`, 'POST', { grade: 'A', finalValue: 1100000, status: 'APPROVED' });
  assert.equal(inspected.status, 201);
  assert.equal(inspected.body.status, 'APPROVED');
  assert.ok(String(inspected.body.voucherCode).startsWith('NXTI-'));
  // Redeem Trade-In voucher at checkout, then verify second use fails
  await f.buyer.call('/cart', 'POST', { variantId: f.variant.id, quantity: 1 });
  const tiQuote = await f.buyer.call('/checkout/quote', 'POST', { addressId: f.buyer.address.id, vouchers: {}, tradeInCode: inspected.body.voucherCode });
  assert.equal(tiQuote.status, 201);
  assert.ok(tiQuote.body.data.platformDiscount > 0);
  assert.equal((await place(f.buyer, tiQuote.body.id)).status, 201);
  await f.buyer.call('/cart', 'POST', { variantId: f.variant.id, quantity: 1 });
  assert.equal((await f.buyer.call('/checkout/quote', 'POST', { addressId: f.buyer.address.id, vouchers: {}, tradeInCode: inspected.body.voucherCode })).status, 409);
  // VAS Care booking -> Zip-seal code generated -> Admin updates White-glove status
  const care = await f.buyer.call('/vas-care', 'POST', { itemName: 'Túi da bê mini', serviceType: 'LEATHER_RESTORE', insuredValue: 20000000, notes: 'Dưỡng ẩm da' });
  assert.equal(care.status, 201);
  assert.ok(String(care.body.zipSealCode).startsWith('NX-SEAL-'));
  const updated = await admin.call(`/admin/services/care/${care.body.id}/status`, 'POST', { status: 'OPTICAL_CHECK' });
  assert.equal(updated.status, 201);
  assert.equal(updated.body.status, 'OPTICAL_CHECK');
});
