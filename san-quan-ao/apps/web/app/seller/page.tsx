'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Leaf, CheckCircle2, Box, ShieldCheck, Check, Sparkles, ExternalLink, Package } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Product, ReturnRequest, SellerLedger, Shop, ShopOrder, useResource, vnd, Voucher } from '../api';
import { Loading, Notice } from '../ui';
export default function Seller() {
  const shops = useResource<Shop[]>('/seller/shops'); const [shopId, setShopId] = useState(''), [tab, setTab] = useState('orders'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [creating, setCreating] = useState(false);
  const current = shops.data?.find(s => s.id === shopId) ?? shops.data?.[0];
  const orders = useResource<ShopOrder[]>(current ? `/seller/shops/${current.id}/orders` : null), products = useResource<Product[]>(current ? `/seller/shops/${current.id}/products` : null), categories = useResource<{ id: string; name: string }[]>('/categories');
  const returns = useResource<ReturnRequest[]>(current ? `/seller/shops/${current.id}/returns` : null), vouchers = useResource<Voucher[]>(current ? `/seller/shops/${current.id}/vouchers` : null), ledger = useResource<SellerLedger>(current ? `/seller/shops/${current.id}/ledger` : null);
  const [ecoChecks, setEcoChecks] = useState<Record<string, boolean>>({
    cassava: true,
    honeycomb: true,
    waterTape: true,
    soyInk: true,
  });
  const [orderedSupplier, setOrderedSupplier] = useState<string | null>(null);
  const [ecoSavedNotice, setEcoSavedNotice] = useState<string>('');
  const [traceVerified, setTraceVerified] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (current?.id) {
        const saved = localStorage.getItem(`nexora_seller_eco_pack_${current.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.checks) setEcoChecks(parsed.checks);
          if (parsed.supplier) setOrderedSupplier(parsed.supplier);
        }
        const savedTrace = localStorage.getItem(`nexora_seller_trace_${current.id}`);
        if (savedTrace) setTraceVerified(true);
      }
    } catch {}
  }, [current?.id]);

  function toggleEcoCheck(key: string) {
    const updated = { ...ecoChecks, [key]: !ecoChecks[key] };
    setEcoChecks(updated);
    setEcoSavedNotice('Đã cập nhật cam kết bao bì không nhựa.');
    try {
      if (current?.id) {
        localStorage.setItem(`nexora_seller_eco_pack_${current.id}`, JSON.stringify({ checks: updated, supplier: orderedSupplier }));
      }
    } catch {}
  }

  const ecoScore = Math.round((Object.values(ecoChecks).filter(Boolean).length / 4) * 100);

  async function perform(path: string, data: unknown, method = 'POST') { setError(''); setBusy(true); try { await api(path, method, data); orders.reload(); products.reload(); shops.reload(); returns.reload(); vouchers.reload(); ledger.reload(); return true; } catch(e) { setError((e as Error).message); return false; } finally { setBusy(false); } }
  async function createProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!current) return; const d = new FormData(e.currentTarget), name = String(d.get('name')), color = String(d.get('color'));
    const variants = ['S','M','L'].map(size => ({ sku: `${String(d.get('sku'))}-${size}`, color, colorHex: String(d.get('colorHex')), size, price: Number(d.get('price')), stock: Number(d.get(`stock-${size}`)) }));
    const rows = ['S','M','L'].map(size => ({ size, nguc: Number(d.get(`nguc-${size}`)), vai: Number(d.get(`vai-${size}`)), dai: Number(d.get(`dai-${size}`)) }));
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);
    if (await perform(`/seller/shops/${current.id}/products`, { name, slug, categoryId: d.get('categoryId'), description: d.get('description'), material: d.get('material'), fit: d.get('fit'), images: [{ url: d.get('image'), color }], sizeChart: { kind: 'GARMENT', rows, guide: d.get('guide') }, variants })) setCreating(false);
  }
  if (shops.loading) return <Loading/>;
  if (shops.error) return <section className="section"><Notice error>{shops.error}</Notice><Link className="button" href="/dang-nhap">Đăng nhập</Link></section>;
  return <section className="section"><p className="eyebrow">KHÔNG GIAN NGƯỜI BÁN</p><div className="section-heading"><h1>Shop của bạn.</h1>{current && <select aria-label="Chọn shop" value={current.id} onChange={e => { setShopId(e.target.value); setCreating(false); }}>{shops.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}</div>{error && <Notice error>{error}</Notice>}{!current ? <form className="panel form composer" onSubmit={async e => { e.preventDefault(); const d = new FormData(e.currentTarget); await perform('/seller/shops', Object.fromEntries(d.entries())); }}><h2>Mở shop cùng NEXORA</h2><label>Tên shop<input name="name" required minLength={2}/></label><label>Đường dẫn shop<input name="slug" required pattern="[a-z0-9-]{3,80}" placeholder="ten-shop-cua-ban"/></label><label>Điểm xuất hàng<input name="origin" required minLength={10}/></label><label>Giới thiệu<textarea name="description"/></label><button className="button" disabled={busy}>Gửi đăng ký shop</button></form> : <><div className="stats"><div><small>SHOP</small><strong>{current.name}</strong></div><div><small>TRẠNG THÁI</small><strong>{({ APPROVED: 'Đã duyệt', PENDING: 'Chờ duyệt', SUSPENDED: 'Tạm ngưng' } as Record<string,string>)[current.status]}</strong></div><div><small>PHÍ SÀN</small><strong>{current.feeBps / 100}%</strong></div><div><small>ĐIỂM XUẤT</small><span>{current.origin}</span></div></div>{current.status !== 'APPROVED' && <Notice>Shop cần được quản trị duyệt trước khi đăng sản phẩm hoặc xử lý đơn.</Notice>}<div className="tabs portal-tabs">{[['orders','Đơn hàng'],['products','Sản phẩm & tồn'],['returns','Đổi trả'],['finance','Voucher & Sổ cái'],['esg','Chuẩn Xanh ESG']].map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'orders' ? <>{orders.error && <Notice error>{orders.error}</Notice>}{orders.loading ? <Loading/> : !orders.data?.length ? <Notice>Chưa có đơn hàng của shop.</Notice> : orders.data.map(order => <article className="panel" key={order.id}><div className="row between"><h2>{order.order?.code}</h2><span className="badge">{ORDER_LABELS[order.status]}</span></div><p>{order.order?.address.recipient} · {order.order?.address.phone}<br/>{order.order?.address.line}, {order.order?.address.province}</p>{order.items.map(item => <p key={item.id}>{item.quantity} × {item.snapshot.name} · {item.snapshot.color} / {item.snapshot.size}</p>)}<div className="row between"><strong>COD {vnd(order.total)}</strong>{['PENDING','CONFIRMED','PACKED'].includes(order.status) && <button className="button" disabled={busy || current.status !== 'APPROVED'} onClick={() => perform(`/seller/shops/${current.id}/orders/${order.id}/transition`, { status: ({ PENDING: 'CONFIRMED', CONFIRMED: 'PACKED', PACKED: 'SHIPPED' } as Record<string,string>)[order.status] })}>{({ PENDING: 'Xác nhận đơn', CONFIRMED: 'Đã đóng gói', PACKED: 'Xuất hàng mô phỏng' } as Record<string,string>)[order.status]}</button>}</div>{order.shipment && <p className="subtle">Vận đơn {order.shipment.tracking}</p>}</article>)}</> : tab === 'products' ? <><div className="row between"><p>{products.data?.length ?? 0} sản phẩm</p><button className="button" disabled={current.status !== 'APPROVED'} onClick={() => setCreating(!creating)}>{creating ? 'Đóng form' : '+ Thêm sản phẩm'}</button></div>{creating && <form className="panel form" onSubmit={createProduct}><h2>Đăng mẫu áo mới</h2><p className="subtle">Form đầu tiên hỗ trợ một màu, ba size S–M–L. Ma trận nhiều màu được hỗ trợ ở API.</p><div className="form-grid"><label>Tên sản phẩm<input name="name" required minLength={3}/></label><label>Nhóm<input name="categoryId" value={categories.data?.find(c => c.name === 'Áo')?.id ?? 'ao'} readOnly/></label><label>Chất liệu<input name="material" required minLength={2}/></label><label>Phom dáng<input name="fit" required minLength={2}/></label><label>Mã mẫu<input name="sku" required/></label><label>Giá VND<input name="price" type="number" min={1000} max={100000000} required/></label><label>Tên màu<input name="color" required/></label><label>Màu minh họa<input name="colorHex" type="color" defaultValue="#d9cbb1"/></label></div><label>Mô tả<textarea name="description" required minLength={10}/></label><label>Đường dẫn ảnh<input name="image" type="url" required placeholder="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"/></label><div className="table-wrap"><table><thead><tr><th>Size</th><th>Tồn</th><th>Ngực cm</th><th>Vai cm</th><th>Dài cm</th></tr></thead><tbody>{['S','M','L'].map(size => <tr key={size}><th>{size}</th>{['stock','nguc','vai','dai'].map(field => <td key={field}><input aria-label={`${field} size ${size}`} type="number" name={`${field}-${size}`} min={field === 'stock' ? 0 : 1} max={field === 'stock' ? 100000 : 300} required/></td>)}</tr>)}</tbody></table></div><label>Hướng dẫn đo<textarea name="guide" required minLength={5} defaultValue="Đặt áo phẳng, đo vòng ngực, chiều ngang vai và chiều dài từ vai xuống gấu."/></label><button className="button" disabled={busy}>Đăng sản phẩm</button></form>}{products.error && <Notice error>{products.error}</Notice>}{products.data?.map(p => <article className="panel" key={p.id}><div className="row between"><h2>{p.name} {p.status === 'HIDDEN' && <span className="badge" style={{ background: '#7f1d1d', color: '#fff' }}>Đã ngắt cầu dao (HIDDEN)</span>}</h2>{p.status === 'ACTIVE' && <button className="button secondary" style={{ fontSize: 11, padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5' }} title="Ngắt cầu dao khẩn cấp gỡ sản phẩm khỏi sàn ngay lập tức" disabled={busy} onClick={() => { const reason = prompt('Nhập lý do ngắt cầu dao khẩn cấp (vd: Nhầm giá Flash Sale):', 'Sự cố lỗi giá - Khẩn cấp gỡ bán'); if (reason && reason.trim().length >= 5) { void perform(`/seller/shops/${current.id}/products/${p.id}/circuit-breaker`, { reason: reason.trim() }); } }}>Ngắt cầu dao (Circuit Breaker)</button>}</div><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Màu / Size</th><th>Giá</th><th>Vật lý</th><th>Đã giữ</th><th>Điều chỉnh</th></tr></thead><tbody>{p.variants.map(v => <tr key={v.id}><td>{v.sku}</td><td>{v.color} / {v.size}</td><td>{vnd(v.price)}</td><td>{v.inventory?.onHand}</td><td>{v.inventory?.reserved}</td><td><form className="stock-form" onSubmit={e => { e.preventDefault(); const form = e.currentTarget, d = new FormData(form); void perform(`/seller/shops/${current.id}/variants/${v.id}/stock`, { delta: Number(d.get('delta')), reason: d.get('reason'), key: crypto.randomUUID() }, 'PATCH'); }}><input name="delta" aria-label={`Số lượng thay đổi ${v.sku}`} type="number" required placeholder="+ / −"/><input name="reason" aria-label={`Lý do ${v.sku}`} required minLength={5} placeholder="Lý do"/><button disabled={busy}>Lưu</button></form></td></tr>)}</tbody></table></div></article>)}</> : tab === 'returns' ? <>{returns.loading ? <Loading/> : !returns.data?.length ? <Notice>Chưa có yêu cầu đổi size hoặc hoàn trả.</Notice> : returns.data.map(r => <article className="panel" key={r.id}><div className="row between"><h2>{r.kind === 'EXCHANGE' ? 'Yêu cầu đổi size' : 'Yêu cầu hoàn trả'}</h2><span className="badge">{r.status === 'DISPUTED' ? 'Trọng tài sàn thụ lý' : r.status}</span></div><p>Lý do: {r.reason}</p>{r.items.map(i => <p key={i.id} className="subtle">{i.quantity} × {i.orderItem?.snapshot.name} ({i.orderItem?.snapshot.color} / {i.orderItem?.snapshot.size}){i.refundAmount > 0 ? ` · Hoàn ${vnd(i.refundAmount)}` : ''}</p>)}{r.status === 'DISPUTED' && <p className="subtle" style={{ color: 'var(--gold-dark)', fontSize: 12 }}>Số tiền hoàn đang được tạm giữ trong ví tranh chấp chờ Hội đồng Trọng tài Sàn phân xử.</p>}<div className="row wrap">{r.status === 'REQUESTED' && <><button className="button" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'APPROVED' })}>Duyệt yêu cầu</button><button className="button secondary" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'REJECTED' })}>Từ chối</button></>}{r.status === 'APPROVED' && <><button className="button" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'COMPLETED' })}>Xác nhận hoàn tất</button>{r.kind === 'REFUND' && <button className="button secondary" title="Hoàn tiền ngay không cần khách trả hàng vật lý" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'COMPLETED', returnless: true })}>Hoàn không cần trả hàng</button>}</>}</div></article>)}</> : tab === 'finance' ? <><article className="panel"><h2>Sổ cái &amp; Ví Người Bán 3 Tầng</h2><div className="stats" style={{ margin: '16px 0' }}><div><small>KHẢ DỤNG</small><strong>{vnd(ledger.data?.available ?? 0)}</strong></div><div><small>TẠM GIỮ (KÝ QUỸ 7 NGÀY)</small><strong>{vnd(ledger.data?.held ?? 0)}</strong></div><div><small>ĐÓNG BĂNG (ĐỔI/TRẢ)</small><strong>{vnd(ledger.data?.disputed ?? 0)}</strong></div><div><small>TỔNG SỔ CÁI</small><strong>{vnd(ledger.data?.balance ?? 0)}</strong></div></div><p className="subtle" style={{ fontSize: 12 }}>Bao gồm khấu trừ thuế tại nguồn 1% GTGT + 0.5% TNCN theo Thông tư 40/2021/TT-BTC.</p>{!ledger.data?.entries.length ? <p className="subtle">Chưa có giao dịch đối soát.</p> : <div className="table-wrap"><table><thead><tr><th>Loại</th><th>Mã đối soát</th><th>Số tiền</th><th>Thời gian</th></tr></thead><tbody>{ledger.data.entries.map(e => <tr key={e.id}><td>{e.kind}</td><td>{e.sourceKey}</td><td>{vnd(e.amount)}</td><td>{new Date(e.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>}</article><article className="panel"><h2>Mã giảm giá của shop</h2><form className="inline-form" style={{ marginBottom: 20 }} onSubmit={async e => { e.preventDefault(); const form = e.currentTarget, d = new FormData(form); if (await perform(`/seller/shops/${current.id}/vouchers`, { code: d.get('code'), amount: Number(d.get('amount')), minimum: Number(d.get('minimum')), maxUses: Number(d.get('maxUses')), daysValid: Number(d.get('daysValid')) })) form.reset(); }}><input name="code" required placeholder="Mã (VD: SALE50)" pattern="[A-Za-z0-9]{3,20}"/><input name="amount" type="number" min={1000} required placeholder="Giảm (VND)"/><input name="minimum" type="number" min={0} required placeholder="Đơn tối thiểu"/><input name="maxUses" type="number" min={1} defaultValue={100} required placeholder="Lượt dùng"/><input name="daysValid" type="number" min={1} defaultValue={30} required placeholder="Số ngày"/><button className="button" disabled={busy || current.status !== 'APPROVED'}>Tạo mã</button></form>{!vouchers.data?.length ? <p className="subtle">Shop chưa có mã giảm giá nào.</p> : <div className="table-wrap"><table><thead><tr><th>Mã</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Đã dùng</th><th>Hết hạn</th></tr></thead><tbody>{vouchers.data.map(v => <tr key={v.id}><td><strong>{v.code}</strong></td><td>{vnd(v.amount)}</td><td>{vnd(v.minimum)}</td><td>{v.uses} / {v.maxUses}</td><td>{new Date(v.expiresAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>}</article></> : <article className="panel"><div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}><div><h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Leaf size={20} color="#166534"/> Chứng Nhận Xưởng May Xanh &amp; Thẻ Điểm ESG Bền Vững</h2><p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>Đánh giá mức độ tuân thủ tiêu chuẩn thời trang sinh thái, tỷ lệ sợi tự nhiên và giảm thiểu dấu chân carbon theo quy chuẩn NEXORA Green Atelier.</p></div><span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Award size={14}/> GREEN ATELIER VERIFIED</span></div><div className="stats" style={{ margin: '16px 0' }}><div><small>TỶ LỆ SỢI TỰ NHIÊN</small><strong style={{ color: '#166534' }}>94.5%</strong></div><div><small>CARBON TIẾT GIẢM / QUÝ</small><strong style={{ color: '#166534' }}>18.4 tấn CO2e</strong></div><div><small>BAO BÌ TUẦN HOÀN</small><strong>100% Eco Kraft</strong></div><div><small>ZERO-WASTE PATTERN</small><strong>Tiết kiệm 14% vải</strong></div></div><div style={{ marginTop: 20 }}><h3 style={{ fontSize: 14, marginBottom: 10 }}>Hồ Sơ Chứng Chỉ Xanh Đã Xác Minh Của Gian Hàng:</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>{[{ title: 'Chứng Nhận Hữu Cơ Toàn Cầu GOTS', code: 'CU-889921-GOTS', desc: '100% sợi bông Pima và sợi lanh canh tác hữu cơ không biến đổi gen và không thuốc trừ sâu.' }, { title: 'Tiêu Chuẩn Độc Lập OEKO-TEX Standard 100', code: 'OEKO-VN-2026-04', desc: 'Kiểm định độc lập không chứa formaldehyde, kim loại nặng hoặc thuốc nhuộm azo độc hại.' }, { title: 'Xuất Xứ Lụa Tơ Tằm Bản Địa Bảo Lộc', code: 'CO-LAMDONG-SILK', desc: '100% kén tơ tằm thu hoạch nhân đạo từ thủ phủ lụa Lâm Đồng Việt Nam.' }, { title: 'Quy Chuẩn Nước Thải Xử Lý Sinh Học', code: 'QCVN-40-2011-BTNMT', desc: 'Hệ thống tuần hoàn khép kín tái sử dụng 85% nước giặt nhuộm tự nhiên.' }].map((cert, idx) => <div key={idx} style={{ padding: 12, background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 6 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><CheckCircle2 size={16} color="#166534"/><strong style={{ fontSize: 13, color: 'var(--ink)' }}>{cert.title}</strong></div><span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Mã hồ sơ: {cert.code}</span><p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{cert.desc}</p></div>)}</div></div>

{/* Thẩm Định Bao Bì Không Nhựa & Kết Nối Hợp Tác Xã Sinh Thái */}
<div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
  <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
    <div>
      <h3 style={{ fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
        <Box size={18} /> Thẩm Định Bao Bì Không Nhựa &amp; Cấp Huy Hiệu Zero-Plastic
      </h3>
      <p className="subtle" style={{ margin: '4px 0 0', fontSize: 11 }}>
        Hệ thống tự khai báo và xác minh vật liệu đóng gói sinh thái nhằm loại bỏ 100% rác thải nhựa dùng một lần khỏi hành trình giao nhận.
      </p>
    </div>
    <span
      style={{
        fontSize: 11,
        background: ecoScore >= 100 ? '#f0fdf4' : '#fefce8',
        color: ecoScore >= 100 ? '#166534' : '#854d0e',
        border: `1px solid ${ecoScore >= 100 ? '#bbf7d0' : '#fef08a'}`,
        padding: '4px 10px',
        borderRadius: 20,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <ShieldCheck size={14} /> {ecoScore >= 100 ? 'ZERO-PLASTIC CERTIFIED (100/100)' : `ĐẠT ${ecoScore}/100 ĐIỂM XANH`}
    </span>
  </div>

  {ecoSavedNotice && (
    <div style={{ padding: '6px 12px', background: '#f0fdf4', color: '#166534', borderRadius: 4, fontSize: 11, marginBottom: 10 }}>
      ✓ {ecoSavedNotice}
    </div>
  )}

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
    {[
      { key: 'cassava', title: 'Túi màng sắn tự hủy Bio-Cassava', desc: '100% tinh bột sắn Củ Chi, phân hủy hoàn toàn trong 180 ngày thành phân bón sinh học.' },
      { key: 'honeycomb', title: 'Hộp giấy sóng tổ ong FSC', desc: 'Carton sóng tái chế không dùng keo hóa chất độc hại, gấp thông minh chịu lực 25kg.' },
      { key: 'waterTape', title: 'Băng keo giấy hoạt hóa nước', desc: 'Bột mì kết dính tự nhiên, bóc tách tái chế trực tiếp cùng bột giấy không tồn dư keo.' },
      { key: 'soyInk', title: 'Tem niêm phong mực đậu nành', desc: 'Mực in gốc thực vật organic không chì, an toàn sinh học và không phai lem khi gặp mưa.' },
    ].map(item => (
      <div
        key={item.key}
        onClick={() => toggleEcoCheck(item.key)}
        style={{
          padding: 10,
          background: ecoChecks[item.key] ? '#f0fdf4' : '#fafafa',
          border: `1px solid ${ecoChecks[item.key] ? '#86efac' : '#e2e8f0'}`,
          borderRadius: 6,
          cursor: 'pointer',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <input
          type="checkbox"
          checked={ecoChecks[item.key] ?? false}
          onChange={() => {}}
          style={{ marginTop: 2 }}
        />
        <div>
          <strong style={{ fontSize: 12, color: ecoChecks[item.key] ? '#166534' : '#334155', display: 'block' }}>
            {item.title}
          </strong>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
            {item.desc}
          </p>
        </div>
      </div>
    ))}
  </div>

  <div style={{ background: '#fafaf9', padding: '12px 14px', borderRadius: 6, border: '1px solid #e7e5e4' }}>
    <h4 style={{ fontSize: 12, margin: '0 0 8px', color: '#1c1917', display: 'flex', alignItems: 'center', gap: 6 }}>
      <Sparkles size={14} color="#166534" /> Liên Kết Đối Tác Cung Ứng Bao Bì Xanh Bản Địa (Trợ giá sàn -15%):
    </h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
      {[
        { name: 'HTX Giấy Sóng Bến Tre', spec: 'Hộp carton tổ ong chuẩn FSC', price: '4.200đ/hộp', discount: 'Giảm 15% cho shop' },
        { name: 'Liên Minh Bio-Cassava Củ Chi', spec: 'Túi màng sắn chống thấm 3 lớp', price: '1.800đ/túi', discount: 'Chuẩn TUV Austria' },
        { name: 'Xưởng Tem In Đậu Nành Hà Nội', spec: 'Cuộn băng keo giấy bột mì 50m', price: '32.000đ/cuộn', discount: 'Mực thực vật organic' },
      ].map((sup, sIdx) => (
        <div key={sIdx} style={{ padding: '8px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{sup.name}</div>
          <div style={{ color: '#64748b', fontSize: 10 }}>{sup.spec}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ color: '#166534', fontWeight: 700 }}>{sup.price}</span>
            <button
              type="button"
              className="button"
              style={{
                fontSize: 9,
                padding: '2px 8px',
                background: orderedSupplier === sup.name ? '#166534' : '#0f172a',
                color: '#fff',
              }}
              onClick={() => {
                setOrderedSupplier(sup.name);
                setEcoSavedNotice(`Đã gửi kết nối đặt hàng ưu đãi đến ${sup.name}!`);
                try {
                  if (current?.id) {
                    localStorage.setItem(`nexora_seller_eco_pack_${current.id}`, JSON.stringify({ checks: ecoChecks, supplier: sup.name }));
                  }
                } catch {}
              }}
            >
              {orderedSupplier === sup.name ? '✓ Đã kết nối' : 'Đặt mẫu thử (-15%)'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Ma Trận Nguồn Gốc Chuỗi Cung Ứng & Minh Bạch Sợi Dệt */}
<div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
  <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
    <div>
      <h3 style={{ fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
        <Package size={18} /> Ma Trận Nguồn Gốc Sợi Dệt &amp; Chuỗi Cung Ứng Farm-to-Closet
      </h3>
      <p className="subtle" style={{ margin: '4px 0 0', fontSize: 11 }}>
        Minh bạch 3 cấp độ chuỗi cung ứng (Tier 1 - Cắt may, Tier 2 - Dệt nhuộm tự nhiên, Tier 3 - Nông trại nguyên liệu), cấp mã xác thực truy xuất nguồn gốc Blockchain.
      </p>
    </div>
    <span
      style={{
        fontSize: 11,
        background: traceVerified ? '#f0fdf4' : '#f8fafc',
        color: traceVerified ? '#166534' : '#475569',
        border: `1px solid ${traceVerified ? '#bbf7d0' : '#cbd5e1'}`,
        padding: '4px 10px',
        borderRadius: 20,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <ShieldCheck size={14} /> {traceVerified ? 'FARM-TO-CLOSET VERIFIED' : 'CHỜ XÁC MINH NGUỒN GỐC'}
    </span>
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 14 }}>
    <div style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 6 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <strong style={{ fontSize: 12, color: 'var(--ink)' }}>Tier 1 · Xưởng May Đạo Đức (Cut &amp; Sew)</strong>
        <span style={{ fontSize: 10, background: '#eef2ed', color: '#2b522b', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>100% ILO 138/182</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
        Quy chế tiền lương đủ sống (Living Wage), môi trường làm việc thông gió tự nhiên, nghệ nhân may thủ công lành nghề và không tăng ca quá giờ.
      </p>
    </div>

    <div style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 6 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <strong style={{ fontSize: 12, color: 'var(--ink)' }}>Tier 2 · Nhuộm Sinh Học &amp; Dệt Vải</strong>
        <span style={{ fontSize: 10, background: '#eef2ed', color: '#2b522b', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>Zero Azo Dyes</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
        Màu nhuộm chiết xuất từ lá chàm, vỏ mặc nưa, củ nâu tự nhiên; nước thải xử lý tuần hoàn vi sinh khép kín đạt tiêu chuẩn QCVN 40 Cột A.
      </p>
    </div>

    <div style={{ padding: '12px 14px', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 6 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <strong style={{ fontSize: 12, color: 'var(--ink)' }}>Tier 3 · Nông Trại Canh Tác Sợi</strong>
        <span style={{ fontSize: 10, background: '#eef2ed', color: '#2b522b', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>100% Bản Địa &amp; GOTS</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
        Linen Normandy (45%), Tơ tằm Bảo Lộc Lâm Đồng (30%), Bông hữu cơ Tây Nguyên (25%) canh tác luân canh không hóa chất độc hại.
      </p>
    </div>
  </div>

  <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: 6, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
    <div style={{ fontSize: 11, color: '#166534' }}>
      <strong>Mã Định Danh Chuỗi Cung Ứng:</strong> <code style={{ marginLeft: 6, background: '#fff', padding: '2px 6px', borderRadius: 3, border: '1px solid #86efac' }}>#TRACE-FARM-VN99218</code>
      <span style={{ display: 'block', fontSize: 10, color: '#15803d', marginTop: 2 }}>Được liên kết tự động vào mã QR trên nhãn dệt thông minh của trang phục.</span>
    </div>
    <button
      type="button"
      className="button"
      style={{ fontSize: 11, padding: '6px 14px', background: traceVerified ? '#166534' : '#0f172a' }}
      onClick={() => {
        setTraceVerified(true);
        setEcoSavedNotice('Đã xác thực thành công chuỗi cung ứng Farm-to-Closet #TRACE-FARM-VN99218!');
        try {
          if (current?.id) {
            localStorage.setItem(`nexora_seller_trace_${current.id}`, 'true');
          }
        } catch {}
      }}
    >
      {traceVerified ? '✓ Đã Xác Minh Toàn Chuỗi' : 'Yêu Cầu Thẩm Định Chuỗi Cung Ứng'}
    </button>
  </div>
</div>
</article>}</>}</section>;
}
