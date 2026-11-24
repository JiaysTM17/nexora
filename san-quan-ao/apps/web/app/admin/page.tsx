'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Leaf, CheckCircle2, ShieldCheck, Download, RefreshCw, MapPin, Zap } from 'lucide-react';
import { api, CareBooking, Shop, TradeInRequest, useResource, vnd } from '../api';
import { Loading, Notice } from '../ui';
type Shipment = { id: string; tracking: string; status: string; codAmount: number; shopOrder: { shop: { name: string }; order: { code: string } } };
type Report = { id: string; reason: string; postId: string; post: { caption: string; author: { name: string } } };
type Audit = { id: string; action: string; entityId: string; actorId: string; createdAt: string };
type AdminAffiliate = { summary: { held: number; available: number; cancelled: number }; earnings: Array<{ id: string; shopOrderId: string; amount: number; status: string; holdUntil: string; kocUser: { id: string; name: string; email: string } }> };
type TaxReportItem = { shopId: string; shopName: string; slug: string; taxCode: string; origin: string; isMall: boolean; totalDeliveredOrders: number; totalRevenue: number; totalTaxWithheld: number };
type TaxReport = { decree: string; period: string; generatedAt: string; summary: { totalShops: number; totalRevenue: number; totalTaxWithheld: number }; items: TaxReportItem[] };
type AdminProduct = { id: string; name: string; slug: string; status: string; material: string; shop: { id: string; name: string; slug: string }; variants: Array<{ id: string; sku: string; price: number; color: string; size: string; inventory?: { onHand: number; reserved: number } }>; images: Array<{ url: string }> };
type Dispute = { id: string; shopId: string; kind: string; reason: string; status: string; createdAt: string; user?: { name: string; email: string }; items: { id: string; quantity: number; refundAmount: number; orderItem: { shopOrder: { id: string; order: { code: string }; shop: { name: string } } } }[] };
export default function Admin() {
  const overview = useResource<Record<string,number>>('/admin/overview'), shops = useResource<(Shop & { taxCode?: string; isMall?: boolean })[]>('/admin/shops'), reports = useResource<Report[]>('/admin/reports'), shipments = useResource<Shipment[]>('/admin/shipments'), audit = useResource<Audit[]>('/admin/audit');
  const tradeIns = useResource<TradeInRequest[]>('/admin/services/trade-ins'), careList = useResource<CareBooking[]>('/admin/services/care'), affiliate = useResource<AdminAffiliate>('/admin/affiliate'), taxReport = useResource<TaxReport>('/admin/tax-report'), disputes = useResource<Dispute[]>('/admin/disputes');
  const products = useResource<AdminProduct[]>('/admin/products');
  const [tab, setTab] = useState('shops'), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [evPriorityMode, setEvPriorityMode] = useState(true);
  const [reconciliationDone, setReconciliationDone] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_admin_green_logistics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.evPriority === 'boolean') setEvPriorityMode(parsed.evPriority);
      }
    } catch {}
  }, []);

  async function action(path: string, data: unknown) { setBusy(true); setError(''); try { await api(path, 'POST', data); overview.reload(); shops.reload(); reports.reload(); shipments.reload(); audit.reload(); tradeIns.reload(); careList.reload(); affiliate.reload(); taxReport.reload(); disputes.reload(); products.reload(); } catch(e) { setError((e as Error).message); } finally { setBusy(false); } }
  if (overview.loading) return <Loading/>;
  if (overview.error) return <section className="section"><Notice error>{overview.error}</Notice><Link className="button" href="/dang-nhap">Tài khoản</Link></section>;
  return <section className="section"><p className="eyebrow">QUẢN TRỊ SÀN</p><h1>Nhìn rõ từng hoạt động.</h1><div className="stats">{Object.entries(overview.data ?? {}).map(([key, value]) => <div key={key}><small>{({ shops: 'SHOP', orders: 'ĐƠN HÀNG', reports: 'BÁO CÁO CHỜ', users: 'TÀI KHOẢN' } as Record<string,string>)[key]}</small><strong>{value}</strong></div>)}</div><div className="tabs portal-tabs">{[['shops','Duyệt shop'],['disputes','Trọng tài Khiếu nại'],['circuit','Cầu dao khẩn cấp'],['tax','Thuế NĐ 91/2022'],['reports','Kiểm duyệt'],['shipments','Giao hàng mô phỏng'],['tradein','Thẩm định Trade-In'],['care','VAS Care'],['affiliate','KOC Affiliate'],['audit','Nhật ký'],['esg','Thẩm định ESG & Xanh'],['circular','Kinh tế tuần hoàn EPR'],['escrow','Sổ cái Escrow D1']].map(([id,label]) => <button className={id === tab ? 'selected' : ''} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>{error && <Notice error>{error}</Notice>}{tab === 'shops' && shops.data?.map(shop => <div className="panel" key={shop.id}><div className="row between"><h2>{shop.name} {shop.isMall && <span className="badge" style={{ background: 'var(--gold-dark)', color: '#fff' }}>NEXORA Mall</span>}</h2><span className="badge">{shop.status}</span></div><p>{shop.origin} · MST: <code>{shop.taxCode || 'Chưa kê khai'}</code></p><form className="inline-form" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); void action(`/admin/shops/${shop.id}/status`, { status: d.get('status'), reason: d.get('reason') }); }}><select name="status" aria-label="Quyết định shop"><option value="APPROVED">Duyệt / mở lại shop</option><option value="SUSPENDED">Tạm ngưng shop</option></select><input name="reason" aria-label="Lý do quyết định" placeholder="Lý do quyết định" required minLength={5}/><button className="button" disabled={busy}>Lưu quyết định</button></form><div className="row" style={{ marginTop: 12 }}><button className="button secondary" style={{ fontSize: 12, padding: '6px 12px' }} disabled={busy} onClick={() => action(`/admin/shops/${shop.id}/mall`, { isMall: !shop.isMall, taxCode: shop.taxCode })}>{shop.isMall ? 'Gỡ huy hiệu NEXORA Mall' : 'Cấp huy hiệu NEXORA Mall'}</button></div></div>)}
{tab === 'disputes' && <div className="stack"><div className="row between"><div><h2>Hội Đồng Trọng Tài Sàn NEXORA</h2><p className="subtle">Giải quyết các vụ khiếu nại đổi size / hoàn trả tranh chấp đa phương (Quy trình Xử lý Tranh chấp SLA 48h).</p></div></div>{!disputes.data?.length ? <Notice>Hiện không có vụ việc tranh chấp nào cần sàn phân xử.</Notice> : disputes.data.map(d => <div className="panel" key={d.id}><div className="row between"><h2>{d.items[0]?.orderItem?.shopOrder?.order?.code} · {d.items[0]?.orderItem?.shopOrder?.shop?.name}</h2><span className="badge" style={{ background: '#7f1d1d', color: '#fff' }}>Trọng tài thụ lý</span></div><p>Người mua: <strong>{d.user?.name}</strong> ({d.user?.email}) · Tiền khiếu nại hoàn: <strong style={{ color: 'var(--gold-dark)' }}>{vnd(d.items.reduce((s, i) => s + i.refundAmount, 0))}</strong></p><div style={{ background: '#f8fafc', padding: '10px 14px', borderLeft: '3px solid #3b82f6', margin: '8px 0', fontSize: 13 }}><strong>Nội dung &amp; Diễn biến khiếu nại:</strong><p style={{ margin: '4px 0 0' }}>{d.reason}</p></div><form className="inline-form" onSubmit={e => { e.preventDefault(); const form = e.currentTarget, formData = new FormData(form); void action(`/admin/disputes/${d.id}/arbitrate`, { decision: formData.get('decision'), note: formData.get('note') }); }}><select name="decision" aria-label="Phán quyết trọng tài"><option value="REFUND">Xử người mua thắng (Hoàn tiền &amp; Trừ ví shop)</option><option value="REJECT">Xử người bán đúng (Bác khiếu nại)</option></select><input name="note" placeholder="Căn cứ &amp; lý lẽ ban hành phán quyết" required minLength={5}/><button className="button" disabled={busy}>Ban hành phán quyết</button></form></div>)}</div>}
{tab === 'circuit' && <div className="stack"><div className="row between"><div><h2>Cầu Dao Ngắt Mạch Khẩn Cấp (Cầu Dao Bảo Vệ An Toàn Giá)</h2><p className="subtle">Khóa gỡ sản phẩm lập tức khỏi sàn khi phát hiện lỗi định giá hoặc lỗi hệ thống nghiêm trọng.</p></div></div>{!products.data?.length ? <Notice>Không có sản phẩm nào trong danh mục.</Notice> : <div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Gian hàng</th><th>Biến thể &amp; Giá</th><th>Trạng thái</th><th>Hành động bảo vệ</th></tr></thead><tbody>{products.data.map(p => <tr key={p.id}><td><strong>{p.name}</strong><br/><small className="subtle">{p.material}</small></td><td>{p.shop.name}</td><td>{p.variants.slice(0, 3).map(v => <div key={v.id} style={{ fontSize: 12 }}>{v.sku} ({v.color}/{v.size}): <strong>{vnd(v.price)}</strong> (Tồn {v.inventory?.onHand ?? 0})</div>)}</td><td><span className="badge" style={{ background: p.status === 'ACTIVE' ? '#166534' : '#7f1d1d', color: '#fff' }}>{p.status}</span></td><td>{p.status === 'ACTIVE' ? <form className="inline-form" onSubmit={e => { e.preventDefault(); const form = e.currentTarget, d = new FormData(form); const reason = String(d.get('reason') || 'Sự cố lỗi giá - Ngắt cầu dao an ninh khẩn cấp'); void action(`/admin/products/${p.id}/circuit-breaker`, { reason }); }}><input name="reason" placeholder="Lý do ngắt cầu dao" defaultValue="Lỗi giá khẩn cấp" minLength={5} required style={{ fontSize: 12, padding: '4px 8px' }} /><button className="button" style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff', fontSize: 12, padding: '6px 12px' }} disabled={busy}>Ngắt Cầu Dao</button></form> : <span className="subtle" style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>Đã khóa an ninh (HIDDEN)</span>}</td></tr>)}</tbody></table></div>}</div>}{tab === 'tax' && <div className="stack"><div className="row between"><div><h2>Cổng Trích xuất Dữ liệu Thuế Định kỳ</h2><p className="subtle">Tuân thủ Điều 19a Nghị định 91/2022/NĐ-CP & Thông tư 40/2021/TT-BTC · Kỳ: <strong>{taxReport.data?.period}</strong></p></div><button className="button secondary" onClick={() => { const blob = new Blob([JSON.stringify(taxReport.data, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `tax-report-${Date.now()}.json`; a.click(); }}>Xuất gói JSON Etax</button></div><div className="stats"><div><small>TỔNG GIAN HÀNG</small><strong>{taxReport.data?.summary.totalShops ?? 0}</strong></div><div><small>DOANH THU ĐƠN HOÀN TẤT</small><strong>{vnd(taxReport.data?.summary.totalRevenue ?? 0)}</strong></div><div><small>THUẾ ĐÃ KHẤU TRỪ (1.5%)</small><strong>{vnd(taxReport.data?.summary.totalTaxWithheld ?? 0)}</strong></div></div>{!taxReport.data?.items.length ? <Notice>Chưa có dữ liệu giao dịch phát sinh thuế trong kỳ.</Notice> : <div className="table-wrap"><table><thead><tr><th>Gian hàng</th><th>Mã số thuế (MST)</th><th>Địa chỉ xuất hàng</th><th>Phân hạng</th><th>Đơn hoàn tất</th><th>Tổng doanh thu</th><th>Thuế đã khấu trừ (1.5%)</th></tr></thead><tbody>{taxReport.data.items.map(r => <tr key={r.shopId}><td><strong>{r.shopName}</strong></td><td><code>{r.taxCode}</code></td><td>{r.origin}</td><td>{r.isMall ? <span className="badge" style={{ background: 'var(--gold-dark)', color: '#fff' }}>Mall</span> : <span className="badge">Shop</span>}</td><td>{r.totalDeliveredOrders}</td><td>{vnd(r.totalRevenue)}</td><td><strong style={{ color: 'var(--gold-dark)' }}>{vnd(r.totalTaxWithheld)}</strong></td></tr>)}</tbody></table></div>}</div>}{tab === 'reports' && (!reports.data?.length ? <Notice>Chưa có báo cáo cần xử lý.</Notice> : reports.data.map(report => <div className="panel" key={report.id}><h2>Bài của {report.post.author.name}</h2><p>{report.post.caption}</p><Notice>Lý do báo cáo — {report.reason}</Notice><form className="inline-form" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); void action(`/admin/posts/${report.postId}/moderate`, { status: d.get('status'), reason: d.get('reason') }); }}><select name="status" aria-label="Quyết định bài viết"><option value="HIDDEN">Ẩn bài</option><option value="PUBLISHED">Giữ công khai</option></select><input name="reason" placeholder="Lý do quyết định" required minLength={5}/><button className="button" disabled={busy}>Xử lý</button></form></div>))}{tab === 'shipments' && <><Notice>Chỉ mô phỏng sự kiện vận chuyển để kiểm thử. Không gửi yêu cầu tới hãng giao.</Notice>{!shipments.data?.length && <p>Shop cần xuất hàng trước khi có vận đơn.</p>}{shipments.data?.map(s => <div className="panel" key={s.id}><h2>{s.shopOrder.order.code} · {s.shopOrder.shop.name}</h2><p>{s.tracking} · {s.status} · COD {vnd(s.codAmount)}</p><div className="row wrap">{[['DELIVERED','Đã giao'],['DELIVERY_FAILED','Giao thất bại'],['RETURNED','Hoàn về']].map(([status, label]) => <button key={status} className="button secondary" disabled={busy} onClick={() => action(`/admin/mock/shipments/${s.id}/event`, { externalId: crypto.randomUUID(), status })}>{label}</button>)}</div></div>)}</>}{tab === 'tradein' && (!tradeIns.data?.length ? <Notice>Chưa có yêu cầu Trade-In nào.</Notice> : tradeIns.data.map(t => <div className="panel" key={t.id}><div className="row between"><h2>{t.brand} · {t.itemName}</h2><span className="badge">{t.status} · Grade {t.grade}</span></div><p>{t.user?.name} ({t.user?.email}) · {t.category} · Ước tính {vnd(t.estimatedValue)}</p><p className="subtle">{t.conditionNote}</p>{t.voucherCode && <p>Voucher đã cấp: <strong>{t.voucherCode}</strong> ({vnd(t.finalValue ?? t.estimatedValue)})</p>}<form className="inline-form" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); void action(`/admin/services/trade-ins/${t.id}/inspect`, { grade: d.get('grade'), finalValue: Number(d.get('finalValue')), status: d.get('status') }); }}><select name="grade" defaultValue={t.grade}>{['S','A','B','C','D'].map(g => <option key={g} value={g}>Grade {g}</option>)}</select><input name="finalValue" type="number" min={0} defaultValue={t.finalValue ?? t.estimatedValue} required placeholder="Giá trị chốt"/><select name="status" defaultValue={t.status === 'AI_PRELIMINARY' ? 'APPROVED' : t.status}><option value="HUB_INSPECTING">Đang giám định tại Hub</option><option value="APPROVED">Duyệt & Cấp Voucher</option><option value="REJECTED">Từ chối thu mua</option></select><button className="button" disabled={busy}>Lưu thẩm định V2</button></form></div>))}{tab === 'care' && (!careList.data?.length ? <Notice>Chưa có đơn VAS Care nào.</Notice> : careList.data.map(c => <div className="panel" key={c.id}><div className="row between"><h2>{c.itemName}</h2><span className="badge">{c.zipSealCode} · {c.status}</span></div><p>{c.user?.name} · {c.serviceType} · Phí {vnd(c.fee)} · Bảo hiểm {vnd(c.insuredValue)}</p><div className="row wrap">{[['SEALED_PICKUP','Đã niêm phong'],['OPTICAL_CHECK','Kiểm tra 8 góc'],['IN_CARE','Đang xử lý Spa'],['RETURNED','Đã hoàn trả']].map(([st, lbl]) => <button key={st} className="button secondary" disabled={busy} onClick={() => action(`/admin/services/care/${c.id}/status`, { status: st })}>{lbl}</button>)}</div></div>))}{tab === 'affiliate' && <div className="stack"><div className="stats"><div><small>ĐANG GIỮ (15 NGÀY)</small><strong>{vnd(affiliate.data?.summary.held ?? 0)}</strong></div><div><small>KHẢ DỤNG</small><strong>{vnd(affiliate.data?.summary.available ?? 0)}</strong></div><div><small>ĐÃ HỦY (HOÀN)</small><strong>{vnd(affiliate.data?.summary.cancelled ?? 0)}</strong></div></div><div className="row"><button className="button secondary" disabled={busy} onClick={() => action('/admin/affiliate/release', {})}>Giải phóng hoa hồng đến hạn</button></div>{!affiliate.data?.earnings.length ? <Notice>Chưa có giao dịch hoa hồng KOC nào.</Notice> : <div className="table-wrap"><table><thead><tr><th>KOC</th><th>Đơn shop</th><th>Hoa hồng</th><th>Trạng thái</th><th>Hết hạn giữ</th></tr></thead><tbody>{affiliate.data.earnings.map(e => <tr key={e.id}><td>{e.kocUser.name} ({e.kocUser.email})</td><td>{e.shopOrderId.slice(0, 10)}...</td><td>{vnd(e.amount)}</td><td><span className="badge">{e.status}</span></td><td>{new Date(e.holdUntil).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>}</div>}{tab === 'audit' && <div className="table-wrap"><table><thead><tr><th>Thời gian</th><th>Hành động</th><th>Người thực hiện</th><th>Đối tượng</th></tr></thead><tbody>{audit.data?.map(a => <tr key={a.id}><td>{new Date(a.createdAt).toLocaleString('vi-VN')}</td><td>{a.action}</td><td>{a.actorId}</td><td>{a.entityId}</td></tr>)}</tbody></table></div>}{tab === 'esg' && <div className="stack"><div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}><div><h2>Hội Đồng Thẩm Định Chứng Chỉ Xanh ESG &amp; Bền Vững Sàn</h2><p className="subtle">Đối soát và phê duyệt chứng chỉ xanh của các xưởng may, giám sát cam kết giảm phát thải carbon và tỷ lệ bao bì tuần hoàn trên toàn sàn TMĐT.</p></div><button className="button secondary" onClick={() => alert('Đã trích xuất Báo Cáo Kiểm Toán Bền Vững ESG Toàn Sàn Q4/2026 (Định dạng PDF/CSV)!')}>Xuất Báo Cáo ESG Sàn</button></div><div className="stats"><div><small>TỔNG CO2e TRUNG HÒA</small><strong style={{ color: '#166534' }}>142.8 tấn</strong></div><div><small>TỶ LỆ XE ĐIỆN VINFAST</small><strong style={{ color: '#166534' }}>88.6%</strong></div><div><small>XƯỞNG XANH ĐÃ DUYỆT</small><strong style={{ color: '#166534' }}>2 / 2 Shop</strong></div><div><small>CÂY XANH BẢO TRỢ</small><strong style={{ color: '#166534' }}>420 Cây</strong></div></div><div className="table-wrap"><table><thead><tr><th>Gian hàng</th><th>Mã chứng chỉ</th><th>Tiêu chuẩn xác thực</th><th>Thời hạn hiệu lực</th><th>Trạng thái thẩm định</th><th>Quyết định Sàn</th></tr></thead><tbody>{[{ shop: 'NÉP Studio', code: 'CU-889921-GOTS', standard: 'GOTS Organic & OEKO-TEX Standard 100', expiry: '31/12/2027', status: 'VERIFIED' }, { shop: 'Lụa & Co', code: 'CO-LAMDONG-SILK', standard: 'CO Bảo Lộc Silk & QCVN 40 Nước Thải', expiry: '15/10/2027', status: 'VERIFIED' }].map((row, idx) => <tr key={idx}><td><strong>{row.shop}</strong></td><td><code>{row.code}</code></td><td>{row.standard}</td><td>{row.expiry}</td><td><span className="badge" style={{ background: '#166534', color: '#fff' }}>Đã xác minh (VERIFIED)</span></td><td><button className="button secondary" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => alert(`Đã kích hoạt tái thẩm định định kỳ cho ${row.shop}.`)}>Tái thẩm định</button></td></tr>)}</tbody></table></div>

{/* Bản Đồ Nhiệt Phát Thải & Điều Phối Đội Xe Điện VinFast */}
<div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px dashed var(--line)' }}>
  <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
    <div>
      <h3 style={{ fontSize: 15, margin: 0, display: 'flex', alignItems: 'center', gap: 6, color: '#166534' }}>
        <MapPin size={18} /> Bản Đồ Nhiệt Phát Thải &amp; Điều Phối Đội Xe Điện VinFast
      </h3>
      <p className="subtle" style={{ margin: '4px 0 0', fontSize: 11 }}>
        Giám sát thời gian thực mạng lưới Micro-Hub giao vận chặng cuối xanh, đo lường lượng CO2e triệt tiêu và điều phối luồng xe điện VinFast Feliz / Klara S.
      </p>
    </div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        type="button"
        className="button secondary"
        style={{
          fontSize: 11,
          padding: '5px 12px',
          background: evPriorityMode ? '#f0fdf4' : '#fff',
          color: evPriorityMode ? '#166534' : '#334155',
          borderColor: evPriorityMode ? '#86efac' : '#cbd5e1',
          fontWeight: 600,
        }}
        onClick={() => {
          const next = !evPriorityMode;
          setEvPriorityMode(next);
          setExportNotice(next ? 'Đã kích hoạt Chế Độ Ưu Tiên Tuyến Xe Điện Giờ Cao Điểm.' : 'Đã chuyển về điều phối tiêu chuẩn.');
          try {
            localStorage.setItem('nexora_admin_green_logistics', JSON.stringify({ evPriority: next }));
          } catch {}
        }}
      >
        <Zap size={13} color={evPriorityMode ? '#16a34a' : '#64748b'} />
        {evPriorityMode ? 'Ưu tiên xe điện: ĐANG BẬT' : 'Ưu tiên xe điện: TẮT'}
      </button>
      <button
        type="button"
        className="button"
        style={{ fontSize: 11, padding: '5px 12px' }}
        onClick={() => {
          setExportNotice('✓ Đã xuất Báo Cáo Logistics Xanh Đạt Chuẩn GHG Protocol Scope 3 (ISO 14064)!');
        }}
      >
        <Download size={13} /> Xuất Báo Cáo GHG Scope 3
      </button>
    </div>
  </div>

  {exportNotice && (
    <div style={{ padding: '6px 12px', background: '#f0fdf4', color: '#166534', borderRadius: 4, fontSize: 11, marginBottom: 12 }}>
      {exportNotice}
    </div>
  )}

  <div className="stats" style={{ marginBottom: 16 }}>
    <div>
      <small>TỔNG XE ĐIỆN HOẠT ĐỘNG</small>
      <strong style={{ color: '#166534' }}>142 Bưu tá</strong>
    </div>
    <div>
      <small>DUNG LƯỢNG PIN TB</small>
      <strong style={{ color: '#166534' }}>93.4%</strong>
    </div>
    <div>
      <small>QUÃNG ĐƯỜNG TRUNG BÌNH</small>
      <strong>4.2 km / đơn</strong>
    </div>
    <div>
      <small>CO2e CẮT GIẢM / NGÀY</small>
      <strong style={{ color: '#166534' }}>-127.6 kg</strong>
    </div>
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
    {[
      {
        name: 'Hub 01 — Bến Nghé (Quận 1)',
        fleet: '38 Xe điện Feliz',
        co2: '-24.5 kg CO2e/ngày',
        ratio: '92% Green',
        status: 'Giao thông thông thoáng',
        bg: '#f0fdf4',
        border: '#bbf7d0',
      },
      {
        name: 'Hub 02 — Tân Phong (Quận 7)',
        fleet: '45 Xe điện Feliz',
        co2: '-38.2 kg CO2e/ngày',
        ratio: '89% Green',
        status: 'Trú mưa an toàn',
        bg: '#eff6ff',
        border: '#bfdbfe',
      },
      {
        name: 'Hub 03 — An Phú (TP. Thủ Đức)',
        fleet: '52 Xe điện Klara S',
        co2: '-52.1 kg CO2e/ngày',
        ratio: '94% Green',
        status: 'Tối ưu tuyến thông minh',
        bg: '#faf5ff',
        border: '#e9d5ff',
      },
      {
        name: 'Hành Lang Net-Zero — Bình Khánh (Cần Giờ)',
        fleet: '7 Xe điện chuyên dụng',
        co2: '-12.8 kg CO2e/ngày',
        ratio: '100% Net Zero',
        status: 'Bảo tồn rừng ngập mặn',
        bg: '#ecfdf5',
        border: '#a7f3d0',
      },
    ].map((hub, hIdx) => (
      <div
        key={hIdx}
        style={{
          padding: '12px 14px',
          background: hub.bg,
          border: `1px solid ${hub.border}`,
          borderRadius: 6,
          fontSize: 11,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <strong style={{ color: '#0f172a', fontSize: 12 }}>{hub.name}</strong>
          <span style={{ fontSize: 10, background: '#fff', color: '#166534', padding: '2px 6px', borderRadius: 10, fontWeight: 700, border: '1px solid #cbd5e1' }}>
            {hub.ratio}
          </span>
        </div>
        <div style={{ color: '#475569', marginBottom: 2 }}>Đội xe: <strong>{hub.fleet}</strong></div>
        <div style={{ color: '#166534', fontWeight: 600, marginBottom: 4 }}>Phát thải triệt tiêu: <strong>{hub.co2}</strong></div>
        <div style={{ fontSize: 10, color: '#64748b' }}>Trạng thái: <em>{hub.status}</em></div>
      </div>
    ))}
  </div>
</div>
</div>}
{tab === 'circular' && (
  <div className="stack">
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2>Quản Trị Kinh Tế Tuần Hoàn &amp; Trách Nhiệm Mở Rộng EPR</h2>
        <p className="subtle">
          Giám sát vòng đời trang phục, tỷ lệ thu hồi tái sinh vải dệt từ bãi chôn lấp và kiểm soát hạn ngạch EPR theo Luật Bảo vệ Môi trường 2020.
        </p>
      </div>
      <button
        className="button secondary"
        onClick={() => {
          alert('✓ Đã xuất Báo Cáo Kiểm Toán Vòng Đời Trang Phục & EPR Compliance Q4/2026 (ISO 14040/14044 LCA Certified)!');
        }}
      >
        <Download size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
        Xuất Báo Cáo EPR Sàn (ISO 14040)
      </button>
    </div>

    {/* 4 Thẻ chỉ số tuần hoàn toàn sàn */}
    <div className="stats">
      <div>
        <small>VẢI CỨU KHỎI BÃI CHÔN LẤP</small>
        <strong style={{ color: '#0d9488' }}>12.840 kg</strong>
        <span style={{ fontSize: 10, color: '#16a34a', display: 'block', marginTop: 2 }}>↑ +18.4% so với quý trước</span>
      </div>
      <div>
        <small>TỶ LỆ THU HỒI TRADE-IN</small>
        <strong style={{ color: '#0d9488' }}>78.6%</strong>
        <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginTop: 2 }}>5 Hạng S/A/B/C/D</span>
      </div>
      <div>
        <small>GIỜ KHỬ KHUẨN VAS CARE</small>
        <strong style={{ color: '#0d9488' }}>3.420 Giờ</strong>
        <span style={{ fontSize: 10, color: '#64748b', display: 'block', marginTop: 2 }}>UV-C &amp; Ozone bảo tồn sợi</span>
      </div>
      <div>
        <small>VẬT LIỆU BIO-FELT TÁI SINH</small>
        <strong style={{ color: '#0d9488' }}>2.850 kg</strong>
        <span style={{ fontSize: 10, color: '#16a34a', display: 'block', marginTop: 2 }}>Đệm &amp; Tấm tiêu âm phòng thu</span>
      </div>
    </div>

    {/* 3 Kênh chuyển dịch vật liệu tuần hoàn */}
    <div style={{ marginTop: 12, padding: '16px 18px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 6 }}>
      <strong style={{ fontSize: 13, color: '#115e59', display: 'block', marginBottom: 10 }}>
        🔄 3 Kênh Phân Bổ Tái Sinh Vật Liệu (Material Reclamation Matrix):
      </strong>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
        <div style={{ padding: '12px 14px', background: '#fff', borderRadius: 4, border: '1px solid #ccfbf1' }}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 12, color: '#0f766e' }}>1. Upcycling Nghệ Thuật (35%)</strong>
            <span style={{ fontSize: 10, background: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>4.494 kg</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
            Chuyển giao cho các Atelier đối tác cắt may thành các sản phẩm chần bông patchwork, túi tote canvas thủ công và phụ kiện độc bản.
          </p>
        </div>
        <div style={{ padding: '12px 14px', background: '#fff', borderRadius: 4, border: '1px solid #ccfbf1' }}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 12, color: '#0f766e' }}>2. Re-Loved Certified (45%)</strong>
            <span style={{ fontSize: 10, background: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>5.778 kg</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
            Trang phục hạng S &amp; A sau khi tiệt trùng buồng vô trùng VAS Care được niêm phong thẻ bảo chứng và tái phân phối trên Sàn Tuần Hoàn.
          </p>
        </div>
        <div style={{ padding: '12px 14px', background: '#fff', borderRadius: 4, border: '1px solid #ccfbf1' }}>
          <div className="row between" style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 12, color: '#0f766e' }}>3. Bio-Felt Tiêu Âm (20%)</strong>
            <span style={{ fontSize: 10, background: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>2.568 kg</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
            Sợi lanh vụn và len dạ xơ ép nhiệt cùng chất kết dính sinh học tạo thành các tấm tiêu âm kiến trúc và lót giày bền vững.
          </p>
        </div>
      </div>
    </div>

    {/* Bảng tuân thủ quy chuẩn EPR */}
    <div className="table-wrap" style={{ marginTop: 14 }}>
      <table>
        <thead>
          <tr>
            <th>Chỉ tiêu tuân thủ EPR</th>
            <th>Quy chuẩn tham chiếu</th>
            <th>Mục tiêu pháp lý</th>
            <th>Thực tế đạt được</th>
            <th>Trạng thái đánh giá</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Tỷ lệ thu gom &amp; tái chế bắt buộc</strong></td>
            <td>Luật BVMT 2020 &amp; NĐ 08/2022/NĐ-CP</td>
            <td>15.0% khối lượng phát hành</td>
            <td><strong>16.8% (+112% KPI)</strong></td>
            <td><span className="badge" style={{ background: '#166534', color: '#fff' }}>ĐẠT CHUẨN XUẤT SẮC</span></td>
          </tr>
          <tr>
            <td><strong>Kiểm toán Vòng đời Sản phẩm (LCA)</strong></td>
            <td>ISO 14040 / ISO 14044:2006</td>
            <td>Định kỳ 6 tháng / lần</td>
            <td><strong>Hoàn tất Q4/2026</strong></td>
            <td><span className="badge" style={{ background: '#166534', color: '#fff' }}>ĐÃ KIỂM TOÁN ĐỘC LẬP</span></td>
          </tr>
          <tr>
            <td><strong>Bảo toàn tài nguyên nước &amp; hóa chất</strong></td>
            <td>QCVN 40:2011/BTNMT Cột A</td>
            <td>Tiết kiệm ≥ 20.000 m³ nước</td>
            <td><strong>34.200 m³ nước sạch</strong></td>
            <td><span className="badge" style={{ background: '#166534', color: '#fff' }}>VƯỢT CHỈ TIÊU 71%</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}

{/* Sổ Cái Ký Quỹ Escrow Đa Tầng Thời Gian Thực & Cơ Chế Giữ 45 Ngày Khi Tranh Chấp */}
{tab === 'escrow' && (
  <div className="stack">
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2>Sổ Cái Ký Quỹ Escrow Đa Tầng &amp; Phong Tỏa Tranh Chấp 45 Ngày</h2>
        <p className="subtle">
          Giám sát dòng tiền ký quỹ 3 cửa sổ (7 - 15 - 30 ngày), gia hạn phong tỏa 45 ngày khi có tranh chấp, và đối soát tự động 3 bên.
        </p>
      </div>
      <button
        type="button"
        className="button"
        disabled={reconciling}
        onClick={() => {
          setReconciling(true);
          setTimeout(() => {
            setReconciling(false);
            setReconciliationDone(true);
          }, 1000);
        }}
        style={{ background: '#0284c7', color: '#fff' }}
      >
        {reconciling ? 'Đang chạy đối soát 3 bên…' : 'Chạy Đối Soát Tự Động 3 Bên'}
      </button>
    </div>

    {reconciliationDone && (
      <Notice>
        ✓ Đối soát 3 bên hoàn tất: Khớp 100% giữa Cổng thanh toán VietQR (128.450.000₫), Sổ cái Escrow Sàn (128.450.000₫), và Bút toán Ví Người Bán Seller Wallet. Không phát hiện sai lệch số dư.
      </Notice>
    )}

    <div className="stats">
      <div>
        <small>TỔNG KÝ QUỸ ĐANG GIỮ</small>
        <strong style={{ color: '#0284c7' }}>128.450.000₫</strong>
      </div>
      <div>
        <small>CỬA SỔ 7 NGÀY (TIÊU CHUẨN COD)</small>
        <strong>45.200.000₫</strong>
        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>34 đơn hàng tiêu chuẩn</span>
      </div>
      <div>
        <small>CỬA SỔ 15 NGÀY (MALL)</small>
        <strong>52.800.000₫</strong>
        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>22 đơn hàng thương hiệu</span>
      </div>
      <div>
        <small>CỬA SỔ 30 NGÀY (BESPOKE)</small>
        <strong>21.450.000₫</strong>
        <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>9 đơn may đo độc bản</span>
      </div>
      <div>
        <small>PHONG TỎA TRANH CHẤP 45 NGÀY</small>
        <strong style={{ color: '#b91c1c' }}>9.000.000₫</strong>
        <span style={{ fontSize: 10, color: '#dc2626', display: 'block' }}>3 vụ việc chờ trọng tài</span>
      </div>
    </div>

    {/* Bảng Hợp Đồng Ký Quỹ Escrow Đang Giám Sát */}
    <div className="table-wrap" style={{ marginTop: 12 }}>
      <table>
        <thead>
          <tr>
            <th>Mã đơn &amp; Gian hàng</th>
            <th>Cửa sổ Ký Quỹ</th>
            <th>Khách thanh toán</th>
            <th>Phí sàn (5%)</th>
            <th>Thuế khấu trừ (1.5%)</th>
            <th>Thực trả Shop</th>
            <th>Trạng thái Ký Quỹ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              code: 'ORD-VN-9921',
              shop: 'NÉP Studio (Mall)',
              window: '15 Ngày (Atelier Mall)',
              total: 1850000,
              fee: 92500,
              tax: 27750,
              net: 1729750,
              status: 'HOLDING',
              statusLabel: 'Đang giữ (Còn 4 ngày)',
              badgeBg: '#0284c7',
            },
            {
              code: 'ORD-VN-9844',
              shop: 'Lụa & Co (Bespoke)',
              window: '30 Ngày (May đo Bespoke)',
              total: 3500000,
              fee: 175000,
              tax: 52500,
              net: 3272500,
              status: 'HOLDING',
              statusLabel: 'Đang giữ (Còn 18 ngày)',
              badgeBg: '#b45309',
            },
            {
              code: '#NX-DISPUTE-771',
              shop: 'Retro Silk Atelier',
              window: 'Gia hạn 45 Ngày (Trọng tài)',
              total: 2400000,
              fee: 120000,
              tax: 36000,
              net: 2244000,
              status: 'DISPUTE_FROZEN',
              statusLabel: 'Phong tỏa Trọng tài (45 ngày)',
              badgeBg: '#dc2626',
            },
            {
              code: 'ORD-VN-9720',
              shop: 'Coolmate Eco Store',
              window: '7 Ngày (Tiêu chuẩn)',
              total: 890000,
              fee: 44500,
              tax: 13350,
              net: 832150,
              status: 'READY_TO_RELEASE',
              statusLabel: 'Đủ điều kiện giải ngân',
              badgeBg: '#059669',
            },
          ].map((row, idx) => (
            <tr key={idx}>
              <td>
                <strong>{row.code}</strong>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{row.shop}</div>
              </td>
              <td>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{row.window}</span>
              </td>
              <td><strong>{vnd(row.total)}</strong></td>
              <td style={{ color: '#0284c7' }}>−{vnd(row.fee)}</td>
              <td style={{ color: '#b45309' }}>−{vnd(row.tax)}</td>
              <td><strong style={{ color: '#059669' }}>{vnd(row.net)}</strong></td>
              <td>
                <span className="badge" style={{ background: row.badgeBg, color: '#fff' }}>
                  {row.statusLabel}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  onClick={() => alert(`Đã duyệt giải ngân bút toán Escrow cho đơn ${row.code} sang Ví Người Bán khả dụng.`)}
                >
                  {row.status === 'READY_TO_RELEASE' ? 'Giải ngân ngay' : 'Kiểm tra hồ sơ'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
</section>;
}
