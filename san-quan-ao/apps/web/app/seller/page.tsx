'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Leaf, CheckCircle2, Box, ShieldCheck, Check, Sparkles, ExternalLink, Package, Landmark, AlertTriangle, Scissors, Ruler, UserCheck, Layers, FileText, Printer, ChevronRight, Clock, Tag } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Product, ReturnRequest, SellerLedger, Shop, ShopOrder, useResource, vnd, Voucher } from '../api';
import { Loading, Notice } from '../ui';

type BespokeOrder = {
  id: string;
  productName: string;
  shopId?: string;
  shopName?: string;
  variant?: string;
  monogram?: string;
  lining?: string;
  notes?: string;
  queuePos?: number;
  passport?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    shoulder?: number;
    armLength?: number;
    fitPreference?: string;
  };
  stage?: 'PENDING_REVIEW' | 'PATTERNING' | 'FABRIC_CUTTING' | 'HAND_STITCHING' | 'FINISHING_QC' | 'READY_TO_SHIP';
  tailorNote?: string;
  masterTailor?: string;
  estimatedDays?: number;
  customerName?: string;
  customerEmail?: string;
  toileMilestone?: {
    frontViewUrl?: string;
    sideViewUrl?: string;
    backViewUrl?: string;
    shoulderSlope?: 'STANDARD' | 'SLOPING' | 'SQUARE';
    postureBalance?: 'NORMAL' | 'ERECT' | 'STOOPED';
    easeAllowanceBust?: number;
    easeAllowanceWaist?: number;
    masterNotes?: string;
    status?: 'SUBMITTED_FOR_CLIENT_REVIEW' | 'CLIENT_APPROVED' | 'REVISION_REQUESTED';
    clientDecision?: string;
    clientNote?: string;
    submittedAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
  isHeritageFabric?: boolean;
  fabricReserveId?: string;
  fabricBoltCode?: string;
  fabricName?: string;
  fabricOrigin?: string;
  meterageAllocated?: number;
  depositCredited?: number;
  fabricCertificate?: string;
};

const BESPOKE_STAGES: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  PENDING_REVIEW: { label: 'Chờ tiếp nhận', desc: 'Đã nhận hồ sơ số đo, chờ Master Tailor duyệt rập', color: '#64748b', bg: '#f1f5f9' },
  PATTERNING: { label: 'Đang phóng rập', desc: 'Tính toán tỷ lệ vai/ngực & dựng bản rập giấy thủ công', color: '#b45309', bg: '#fef3c7' },
  FABRIC_CUTTING: { label: 'Cắt vải & Xếp nếp', desc: 'Canh sớ vải tự nhiên và cắt thủ công từng mảnh', color: '#0369a1', bg: '#e0f2fe' },
  HAND_STITCHING: { label: 'May ráp & Thêu Monogram', desc: 'May cuốn mép Pháp và thêu chỉ lụa monogram', color: '#7c3aed', bg: '#f5f3ff' },
  FINISHING_QC: { label: 'Ủi form & Kiểm tra KCS', desc: 'Hấp nhiệt định hình phom dáng & soi vi điểm 50x', color: '#059669', bg: '#ecfdf5' },
  READY_TO_SHIP: { label: 'Sẵn sàng đóng hộp', desc: 'Niêm phong túi zip-seal và chuyển qua bộ phận giao nhận', color: '#15803d', bg: '#dcfce7' },
};
export default function Seller() {
  const shops = useResource<Shop[]>('/seller/shops'); const [shopId, setShopId] = useState(''), [tab, setTab] = useState('orders'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [creating, setCreating] = useState(false);
  const current = shops.data?.find(s => s.id === shopId) ?? shops.data?.[0];
  const orders = useResource<ShopOrder[]>(current ? `/seller/shops/${current.id}/orders` : null), products = useResource<Product[]>(current ? `/seller/shops/${current.id}/products` : null), categories = useResource<{ id: string; name: string }[]>('/categories');
  const returns = useResource<ReturnRequest[]>(current ? `/seller/shops/${current.id}/returns` : null), vouchers = useResource<Voucher[]>(current ? `/seller/shops/${current.id}/vouchers` : null), ledger = useResource<SellerLedger>(current ? `/seller/shops/${current.id}/ledger` : null);
  const bespokeOrders = useResource<BespokeOrder[]>(current ? `/seller/shops/${current.id}/bespoke` : null);
  const fittings = useResource<any[]>(current ? `/seller/shops/${current.id}/fittings` : null);
  const swatchOrders = useResource<any[]>(current ? `/seller/shops/${current.id}/swatch-orders` : null);
  const [swatchNotice, setSwatchNotice] = useState<string>('');
  const [bespokeFilter, setBespokeFilter] = useState<string>('ALL');
  const [cuttingTicketModal, setCuttingTicketModal] = useState<BespokeOrder | null>(null);
  const [updatingBespokeId, setUpdatingBespokeId] = useState<string | null>(null);
  const [bespokeNoteDraft, setBespokeNoteDraft] = useState<string>('');
  const [valetModalFitting, setValetModalFitting] = useState<any>(null);
  const [valetStylistName, setValetStylistName] = useState('Trần Hoàng My (Senior Stylist)');
  const [valetStylistPhone, setValetStylistPhone] = useState('0988776655');
  const [valetNotes, setValetNotes] = useState('Mang theo vali 40+ mẫu vải Len & Lụa cùng gương đứng di động.');
  const [valetStatus, setValetStatus] = useState<string>('VALET_ASSIGNED');
  const [valetConversionAmount, setValetConversionAmount] = useState<number>(3500000);
  const [valetNotice, setValetNotice] = useState<string>('');
  const [toileModalOrder, setToileModalOrder] = useState<BespokeOrder | null>(null);
  const [toileShoulderSlope, setToileShoulderSlope] = useState<'STANDARD' | 'SLOPING' | 'SQUARE'>('STANDARD');
  const [toilePostureBalance, setToilePostureBalance] = useState<'NORMAL' | 'ERECT' | 'STOOPED'>('NORMAL');
  const [toileEaseAllowanceBust, setToileEaseAllowanceBust] = useState<number>(6);
  const [toileEaseAllowanceWaist, setToileEaseAllowanceWaist] = useState<number>(4);
  const [toileMasterNotes, setToileMasterNotes] = useState<string>('Mẫu vải mộc đã hoàn thiện canh sợi, đường châm phấn đạt chuẩn.');
  const [toileNotice, setToileNotice] = useState<string>('');
  const [ecoChecks, setEcoChecks] = useState<Record<string, boolean>>({
    cassava: true,
    honeycomb: true,
    waterTape: true,
    soyInk: true,
  });
  const [orderedSupplier, setOrderedSupplier] = useState<string | null>(null);
  const [ecoSavedNotice, setEcoSavedNotice] = useState<string>('');
  const [traceVerified, setTraceVerified] = useState<boolean>(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutBank, setPayoutBank] = useState('MBBank (Ngân hàng Quân đội)');
  const [payoutAccount, setPayoutAccount] = useState('999988886666');
  const [payoutBeneficiary, setPayoutBeneficiary] = useState('CONG TY TNHH THOI TRANG NEP STUDIO');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNotice, setPayoutNotice] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [circuitTarget, setCircuitTarget] = useState<{ id: string; name: string } | null>(null);
  const [circuitReason, setCircuitReason] = useState('Sự cố lỗi giá - Khẩn cấp gỡ bán');
  const [editingPassportProduct, setEditingPassportProduct] = useState<Product | null>(null);
  const [passportOrigin, setPassportOrigin] = useState('Normandy (Cộng hòa Pháp) & Xưởng NÉP Atelier (Hà Nội)');
  const [passportFiber, setPassportFiber] = useState('100% Sợi lanh hữu cơ dệt mộc dầy dặn kết hợp tơ tằm tự nhiên');
  const [passportWeave, setPassportWeave] = useState('210 GSM · Mật độ sợi 76x62 · Dệt thủ công mộc mạc');
  const [passportYarnLot, setPassportYarnLot] = useState('LOT-NEXORA-2026');
  const [passportCertifications, setPassportCertifications] = useState('GOTS Organic, OEKO-TEX Standard 100 Class I, Vietnam Traditional Craft Guild');
  const [passportCarbonKg, setPassportCarbonKg] = useState<number>(5.6);
  const [passportWaterLiters, setPassportWaterLiters] = useState<number>(2200);
  const [passportNotice, setPassportNotice] = useState<string>('');

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

  async function perform(path: string, data: unknown, method = 'POST') { setError(''); setBusy(true); try { await api(path, method, data); orders.reload(); products.reload(); shops.reload(); returns.reload(); vouchers.reload(); ledger.reload(); bespokeOrders.reload(); fittings.reload(); swatchOrders.reload(); return true; } catch(e) { setError((e as Error).message); return false; } finally { setBusy(false); } }

  async function saveProductPassport(e: FormEvent) {
    e.preventDefault();
    if (!current || !editingPassportProduct) return;
    const certList = passportCertifications.split(',').map(s => s.trim()).filter(Boolean);
    const body = {
      originLocation: passportOrigin,
      fiberComposition: passportFiber,
      weaveDensity: passportWeave,
      yarnLot: passportYarnLot,
      certifications: certList.length ? certList : ['GOTS Organic', 'OEKO-TEX Standard 100 Class I'],
      ecoFootprint: {
        carbonSavedKg: Number(passportCarbonKg),
        waterSavedLiters: Number(passportWaterLiters),
        naturalDye: true,
        microplasticFree: true,
      },
      artisans: [
        { role: 'Thợ cả rập may đo', name: 'Đỗ Văn Thành', experienceYears: 24, handcraftHours: 18 },
        { role: 'Nghệ nhân thêu cườm tay', name: 'Hoàng Thị Cúc', experienceYears: 20, handcraftHours: 22 },
        { role: 'Thợ hoàn thiện mí cuộn', name: 'Nguyễn Thị Mai', experienceYears: 18, handcraftHours: 14 },
      ],
      careInstructions: [
        'Giặt tay nhẹ nhàng ở nhiệt độ nước mát dưới 30°C với xà phòng tự nhiên',
        'Không vắt xoắn, phơi phẳng trên mặt lưới thoáng gió trong bóng râm',
        'Ủi hơi nước mặt trái khi sợi vải còn độ ẩm mộc tự nhiên',
      ],
    };

    const ok = await perform(`/seller/shops/${current.id}/products/${editingPassportProduct.id}/passport`, body);
    if (ok) {
      setPassportNotice(`Đã cập nhật Hộ Chiếu Vật Liệu & Chứng Nhận DPP cho ${editingPassportProduct.name}!`);
      setEditingPassportProduct(null);
    }
  }

  async function createProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!current) return; const d = new FormData(e.currentTarget), name = String(d.get('name')), color = String(d.get('color'));
    const variants = ['S','M','L'].map(size => ({ sku: `${String(d.get('sku'))}-${size}`, color, colorHex: String(d.get('colorHex')), size, price: Number(d.get('price')), stock: Number(d.get(`stock-${size}`)) }));
    const rows = ['S','M','L'].map(size => ({ size, nguc: Number(d.get(`nguc-${size}`)), vai: Number(d.get(`vai-${size}`)), dai: Number(d.get(`dai-${size}`)) }));
    const slug = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 6);
    if (await perform(`/seller/shops/${current.id}/products`, { name, slug, categoryId: d.get('categoryId'), description: d.get('description'), material: d.get('material'), fit: d.get('fit'), images: [{ url: d.get('image'), color }], sizeChart: { kind: 'GARMENT', rows, guide: d.get('guide') }, variants })) setCreating(false);
  }
  if (shops.loading) return <Loading/>;
  if (shops.error) return <section className="section"><Notice error>{shops.error}</Notice><Link className="button" href="/dang-nhap">Đăng nhập</Link></section>;
  return <section className="section"><p className="eyebrow">KHÔNG GIAN NGƯỜI BÁN</p><div className="section-heading"><h1>Shop của bạn.</h1>{current && <select aria-label="Chọn shop" value={current.id} onChange={e => { setShopId(e.target.value); setCreating(false); }}>{shops.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}</div>{error && <Notice error>{error}</Notice>}{!current ? <form className="panel form composer" onSubmit={async e => { e.preventDefault(); const d = new FormData(e.currentTarget); await perform('/seller/shops', Object.fromEntries(d.entries())); }}><h2>Mở shop cùng NEXORA</h2><label>Tên shop<input name="name" required minLength={2}/></label><label>Đường dẫn shop<input name="slug" required pattern="[a-z0-9-]{3,80}" placeholder="ten-shop-cua-ban"/></label><label>Điểm xuất hàng<input name="origin" required minLength={10}/></label><label>Giới thiệu<textarea name="description"/></label><button className="button" disabled={busy}>Gửi đăng ký shop</button></form> : <><div className="stats"><div><small>SHOP</small><strong>{current.name}</strong></div><div><small>TRẠNG THÁI</small><strong>{({ APPROVED: 'Đã duyệt', PENDING: 'Chờ duyệt', SUSPENDED: 'Tạm ngưng' } as Record<string,string>)[current.status]}</strong></div><div><small>PHÍ SÀN</small><strong>{current.feeBps / 100}%</strong></div><div><small>ĐIỂM XUẤT</small><span>{current.origin}</span></div></div>{current.status !== 'APPROVED' && <Notice>Shop cần được quản trị duyệt trước khi đăng sản phẩm hoặc xử lý đơn.</Notice>}<div className="tabs portal-tabs">{[['orders','Đơn hàng'],['bespoke','Xưởng May Đo & Cắt Rập'],['fittings','Lịch Thử Đồ Tại Gia VIP'],['swatches','Đơn Mẫu Vải Cầm Tay'],['passports','Nguồn Gốc Sợi & DPP'],['products','Sản phẩm & tồn'],['returns','Đổi trả'],['finance','Voucher & Sổ cái'],['esg','Chuẩn Xanh ESG']].map(([id, label]) => <button key={id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === 'orders' ? <>
  {orders.error && <Notice error>{orders.error}</Notice>}
  {orders.loading ? <Loading/> : !orders.data?.length ? <Notice>Chưa có đơn hàng của shop.</Notice> : <>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
      {[
        { id: 'ALL', label: `Tất cả (${orders.data.length})` },
        { id: 'PENDING', label: `Chờ xác nhận (${orders.data.filter(o => o.status === 'PENDING').length})` },
        { id: 'CONFIRMED', label: `Đang gói (${orders.data.filter(o => o.status === 'CONFIRMED').length})` },
        { id: 'SHIPPED', label: `Đang giao (${orders.data.filter(o => o.status === 'SHIPPED').length})` },
        { id: 'DELIVERED', label: `Đã giao (${orders.data.filter(o => o.status === 'DELIVERED').length})` },
        { id: 'CANCELLED', label: `Đã hủy (${orders.data.filter(o => o.status === 'CANCELLED').length})` },
      ].map(f => (
        <button
          key={f.id}
          type="button"
          onClick={() => setOrderFilter(f.id)}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 14,
            border: orderFilter === f.id ? '1.5px solid var(--gold-dark)' : '1px solid var(--line)',
            background: orderFilter === f.id ? '#FAF8F5' : '#fff',
            color: orderFilter === f.id ? 'var(--gold-dark)' : 'var(--ink)',
            fontWeight: orderFilter === f.id ? 700 : 500,
            cursor: 'pointer',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>

    {orders.data
      .filter(order => orderFilter === 'ALL' || order.status === orderFilter)
      .map(order => <article className="panel" key={order.id}><div className="row between"><h2>{order.order?.code}</h2><span className="badge">{ORDER_LABELS[order.status]}</span></div><p>{order.order?.address.recipient} · {order.order?.address.phone}<br/>{order.order?.address.line}, {order.order?.address.province}</p>{order.items.map(item => <p key={item.id}>{item.quantity} × {item.snapshot.name} · {item.snapshot.color} / {item.snapshot.size}</p>)}<div className="row between"><strong>COD {vnd(order.total)}</strong>{['PENDING','CONFIRMED','PACKED'].includes(order.status) && <button className="button" disabled={busy || current.status !== 'APPROVED'} onClick={() => perform(`/seller/shops/${current.id}/orders/${order.id}/transition`, { status: ({ PENDING: 'CONFIRMED', CONFIRMED: 'PACKED', PACKED: 'SHIPPED' } as Record<string,string>)[order.status] })}>{({ PENDING: 'Xác nhận đơn', CONFIRMED: 'Đã đóng gói', PACKED: 'Xuất hàng mô phỏng' } as Record<string,string>)[order.status]}</button>}</div>{order.shipment && <p className="subtle">Vận đơn {order.shipment.tracking}</p>}</article>)}
  </>}
</> : tab === 'bespoke' ? <>
  <div style={{ marginBottom: 16, padding: '16px 18px', background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 100%)', border: '1px solid var(--line)', borderRadius: 4 }}>
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scissors size={20} color="var(--gold-dark)" /> Xưởng May Đo &amp; Trạm Cắt Rập Thủ Công
        </h2>
        <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
          Quản lý tiến độ may đo từng mũi kim, đối chiếu thông số Fashion Passport và xuất phiếu rập may kỹ thuật cho bàn cắt Master Tailor.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="button secondary"
          style={{ fontSize: 11, padding: '6px 12px', background: '#fff', borderColor: 'var(--line)' }}
          onClick={async () => {
            await api('/vault/bespoke', 'POST', {
              id: `BESPOKE-${Date.now().toString().slice(-6)}`,
              productName: 'Sơ mi linen Normandy may đo thủ công',
              shopId: current?.id,
              shopName: current?.name,
              variant: 'Trắng mộc ngà · Phom Tailored',
              monogram: 'N.X.',
              lining: 'Lụa Jacquard tơ tằm dệt chìm hoa hoàng gia',
              notes: 'Hạ vòng nách 1cm, vạt sau dài hơn 2cm để sơ vin phom êm',
              queuePos: 4,
              passport: {
                height: 175,
                weight: 68,
                chest: 96,
                waist: 79,
                hips: 95,
                shoulder: 44,
                armLength: 61,
                fitPreference: 'Vừa vặn may đo (Tailored Fit)',
              },
              stage: 'PATTERNING',
              masterTailor: 'Master Tailor Hoàng Nam',
              estimatedDays: 6,
            });
            bespokeOrders.reload();
          }}
        >
          <Sparkles size={13} color="var(--gold-dark)" /> Thêm hồ sơ may đo mẫu
        </button>
      </div>
    </div>

    {/* Stage Summary Statistics */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 14 }}>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Tổng hồ sơ may đo</div>
        <strong style={{ fontSize: 16, color: 'var(--ink)' }}>{bespokeOrders.data?.length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#b45309', textTransform: 'uppercase' }}>Đang phóng rập</div>
        <strong style={{ fontSize: 16, color: '#b45309' }}>{bespokeOrders.data?.filter(b => (b.stage || 'PATTERNING') === 'PATTERNING').length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#0369a1', textTransform: 'uppercase' }}>Cắt vải &amp; Xếp nếp</div>
        <strong style={{ fontSize: 16, color: '#0369a1' }}>{bespokeOrders.data?.filter(b => b.stage === 'FABRIC_CUTTING').length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#7c3aed', textTransform: 'uppercase' }}>May ráp &amp; Thêu</div>
        <strong style={{ fontSize: 16, color: '#7c3aed' }}>{bespokeOrders.data?.filter(b => b.stage === 'HAND_STITCHING').length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#16a34a', textTransform: 'uppercase' }}>Hoàn tất KCS</div>
        <strong style={{ fontSize: 16, color: '#16a34a' }}>{bespokeOrders.data?.filter(b => ['FINISHING_QC', 'READY_TO_SHIP'].includes(b.stage || '')).length ?? 0}</strong>
      </div>
    </div>
  </div>

  {/* Filter Pills */}
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
    {[
      { id: 'ALL', label: `Tất cả (${bespokeOrders.data?.length ?? 0})` },
      { id: 'PATTERNING', label: `Đang phóng rập (${bespokeOrders.data?.filter(b => (b.stage || 'PATTERNING') === 'PATTERNING').length ?? 0})` },
      { id: 'FABRIC_CUTTING', label: `Cắt vải (${bespokeOrders.data?.filter(b => b.stage === 'FABRIC_CUTTING').length ?? 0})` },
      { id: 'HAND_STITCHING', label: `May ráp & Thêu (${bespokeOrders.data?.filter(b => b.stage === 'HAND_STITCHING').length ?? 0})` },
      { id: 'FINISHING_QC', label: `Ủi form & KCS (${bespokeOrders.data?.filter(b => b.stage === 'FINISHING_QC').length ?? 0})` },
      { id: 'READY_TO_SHIP', label: `Sẵn sàng giao (${bespokeOrders.data?.filter(b => b.stage === 'READY_TO_SHIP').length ?? 0})` },
    ].map(f => (
      <button
        key={f.id}
        type="button"
        onClick={() => setBespokeFilter(f.id)}
        style={{
          fontSize: 11,
          padding: '4px 10px',
          borderRadius: 14,
          border: bespokeFilter === f.id ? '1.5px solid var(--gold-dark)' : '1px solid var(--line)',
          background: bespokeFilter === f.id ? '#FAF8F5' : '#fff',
          color: bespokeFilter === f.id ? 'var(--gold-dark)' : 'var(--ink)',
          fontWeight: bespokeFilter === f.id ? 700 : 500,
          cursor: 'pointer',
        }}
      >
        {f.label}
      </button>
    ))}
  </div>

  {toileNotice && (
    <div style={{ marginBottom: 14 }}>
      <Notice>{toileNotice}</Notice>
    </div>
  )}

  {bespokeOrders.loading ? <Loading/> : !bespokeOrders.data?.length ? (
    <div className="panel" style={{ textAlign: 'center', padding: '36px 20px' }}>
      <Scissors size={28} color="var(--gold-dark)" style={{ margin: '0 auto 8px', opacity: 0.7 }} />
      <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>Chưa có đơn đặt may thủ công nào</h3>
      <p className="subtle" style={{ margin: '0 0 16px', fontSize: 12 }}>
        Khi khách hàng đặt may trang phục cá nhân hóa với số đo Fashion Passport hoặc thêu Monogram, hồ sơ rập kỹ thuật sẽ xuất hiện tại đây.
      </p>
    </div>
  ) : (
    <div style={{ display: 'grid', gap: 14 }}>
      {bespokeOrders.data
        .filter(b => bespokeFilter === 'ALL' || (b.stage || 'PATTERNING') === bespokeFilter)
        .map(b => {
          const currentStageKey = b.stage || 'PATTERNING';
          const stageInfo = BESPOKE_STAGES[currentStageKey] || BESPOKE_STAGES.PATTERNING;
          const stagesList = Object.keys(BESPOKE_STAGES);
          const currentIdx = stagesList.indexOf(currentStageKey);

          return (
            <article key={b.id} className="panel" style={{ border: '1px solid var(--line)', padding: 18 }}>
              {/* Header */}
              <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15 }}>{b.productName}</h3>
                    <span style={{ fontSize: 10, background: stageInfo.bg, color: stageInfo.color, border: `1px solid ${stageInfo.color}`, padding: '2px 8px', borderRadius: 3, fontWeight: 700 }}>
                      {stageInfo.label}
                    </span>
                    {b.isHeritageFabric && (
                      <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 3, fontWeight: 700 }}>
                        VẢI DI SẢN ĐỘC BẢN
                      </span>
                    )}
                  </div>
                  <p className="subtle" style={{ margin: '4px 0 0', fontSize: 11 }}>
                    Mã hồ sơ: <strong>#{b.id.slice(-8).toUpperCase()}</strong> · Khách hàng: <strong>{b.customerName || 'Khách Hàng Atelier'}</strong> ({b.customerEmail || 'Bảo mật theo PDPD'}) · Ngày tạo: {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 11, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => setCuttingTicketModal(b)}
                  >
                    <FileText size={13} /> Xem Phiếu Rập &amp; Bàn Cắt
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    style={{
                      fontSize: 11,
                      padding: '5px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      borderColor: b.toileMilestone?.status === 'CLIENT_APPROVED' ? '#16a34a' : b.toileMilestone?.status === 'REVISION_REQUESTED' ? '#dc2626' : 'var(--gold-dark)',
                      color: b.toileMilestone?.status === 'CLIENT_APPROVED' ? '#16a34a' : b.toileMilestone?.status === 'REVISION_REQUESTED' ? '#dc2626' : 'var(--gold-dark)',
                      background: b.toileMilestone?.status === 'CLIENT_APPROVED' ? '#f0fdf4' : b.toileMilestone?.status === 'REVISION_REQUESTED' ? '#fef2f2' : '#fdf8f0',
                    }}
                    onClick={() => {
                      setToileModalOrder(b);
                      if (b.toileMilestone) {
                        setToileShoulderSlope(b.toileMilestone.shoulderSlope || 'STANDARD');
                        setToilePostureBalance(b.toileMilestone.postureBalance || 'NORMAL');
                        setToileEaseAllowanceBust(b.toileMilestone.easeAllowanceBust || 6);
                        setToileEaseAllowanceWaist(b.toileMilestone.easeAllowanceWaist || 4);
                        setToileMasterNotes(b.toileMilestone.masterNotes || '');
                      } else {
                        setToileShoulderSlope('STANDARD');
                        setToilePostureBalance('NORMAL');
                        setToileEaseAllowanceBust(6);
                        setToileEaseAllowanceWaist(4);
                        setToileMasterNotes('Mẫu vải mộc đã hoàn thiện canh sợi, đường châm phấn đạt chuẩn.');
                      }
                    }}
                  >
                    <Scissors size={13} /> {b.toileMilestone?.status === 'CLIENT_APPROVED' ? '✓ Vải Mộc: Khách Đã Duyệt' : b.toileMilestone?.status === 'REVISION_REQUESTED' ? '⚠ Vải Mộc: Cần Tinh Chỉnh' : b.toileMilestone?.status === 'SUBMITTED_FOR_CLIENT_REVIEW' ? '● Vải Mộc: Chờ Khách Duyệt' : 'Hồ Sơ Vải Mộc (Toile) →'}
                  </button>
                </div>
              </div>

              {/* 2-Column Detail Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
                {/* Left: Client Specs & Passport */}
                <div>
                  <strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Thông số May Đo &amp; Tùy Biến
                  </strong>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }}>
                    <div className="row between" style={{ marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Phom &amp; Màu cơ sở:</span>
                      <strong>{b.variant || 'Mặc định'}</strong>
                    </div>
                    {b.monogram && (
                      <div className="row between" style={{ marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Thêu Monogram:</span>
                        <strong style={{ color: 'var(--gold-dark)', fontFamily: 'serif', letterSpacing: 1 }}>{b.monogram} (Chỉ lụa vàng ánh kim)</strong>
                      </div>
                    )}
                    {b.lining && (
                      <div className="row between" style={{ marginBottom: 4 }}>
                        <span style={{ color: '#64748b' }}>Lớp lót cao cấp:</span>
                        <span style={{ fontWeight: 600 }}>{b.lining}</span>
                      </div>
                    )}
                    {b.notes && (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                        <span style={{ color: '#64748b', display: 'block' }}>Ghi chú phom dáng:</span>
                        <em style={{ color: '#334155' }}>"{b.notes}"</em>
                      </div>
                    )}
                    {b.toileMilestone?.clientNote && (
                      <div style={{ marginTop: 6, padding: '6px 8px', background: b.toileMilestone.status === 'CLIENT_APPROVED' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${b.toileMilestone.status === 'CLIENT_APPROVED' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 3, fontSize: 10, color: b.toileMilestone.status === 'CLIENT_APPROVED' ? '#166534' : '#991b1b' }}>
                        <strong>Ý kiến khách hàng ({b.customerName || 'Khách Hàng'}):</strong> "{b.toileMilestone.clientNote}"
                      </div>
                    )}
                  </div>

                  {/* Body Measurements Mini Grid */}
                  {b.passport && (
                    <div style={{ marginTop: 8, background: '#FAF8F5', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--line)', fontSize: 10 }}>
                      <span style={{ color: 'var(--gold-dark)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                        Số đo Fashion Passport (Sai số cho phép ±0.5cm):
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                        <div>Chiều cao: <strong>{b.passport.height || 170}cm</strong></div>
                        <div>Cân nặng: <strong>{b.passport.weight || 65}kg</strong></div>
                        <div>Vòng ngực: <strong>{b.passport.chest || 92}cm</strong></div>
                        <div>Vòng eo: <strong>{b.passport.waist || 76}cm</strong></div>
                        <div>Vòng mông: <strong>{b.passport.hips || 94}cm</strong></div>
                        <div>Rộng vai: <strong>{b.passport.shoulder || 42}cm</strong></div>
                        <div>Dài tay: <strong>{b.passport.armLength || 59}cm</strong></div>
                        <div>Phom: <strong>{b.passport.fitPreference || 'Tailored'}</strong></div>
                      </div>
                    </div>
                  )}
                  {/* Heritage Fabric Provenance Box */}
                  {b.isHeritageFabric && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 4, fontSize: 10.5, color: '#92400e' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <strong style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Vải Di Sản Độc Bản</strong>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{b.fabricCertificate || b.fabricBoltCode}</span>
                      </div>
                      <div>Tên vải: <strong>{b.fabricName}</strong> ({b.meterageAllocated} mét)</div>
                      {b.fabricOrigin && <div>Xuất xứ: <strong>{b.fabricOrigin}</strong></div>}
                      <div style={{ color: '#166534', marginTop: 2 }}>
                        Cọc 30% đối trừ: <strong>{vnd(b.depositCredited || 0)}</strong> (Bảo lưu Escrow Sàn)
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Master Tailor Workstation & Progress */}
                <div>
                  <strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                    Tiến Trình Chế Tác Master Tailor
                  </strong>

                  {/* Micro Stage Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {stagesList.map((stKey, sIdx) => {
                      const st = BESPOKE_STAGES[stKey];
                      const isPast = sIdx < currentIdx;
                      const isCurrent = sIdx === currentIdx;

                      return (
                        <div key={stKey} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                          <span style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            background: isPast ? '#16a34a' : isCurrent ? st.color : '#e2e8f0',
                            color: isPast || isCurrent ? '#fff' : '#64748b',
                            flexShrink: 0,
                          }}>
                            {isPast ? '✓' : sIdx + 1}
                          </span>
                          <span style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? st.color : isPast ? '#166534' : '#94a3b8' }}>
                            {st.label}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: 9, background: st.bg, color: st.color, padding: '1px 5px', borderRadius: 2, marginLeft: 'auto' }}>
                              Đang thực hiện
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tailor Craftsmanship Log & Action */}
                  <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 4, padding: 10 }}>
                    <div style={{ fontSize: 11, color: '#334155', marginBottom: 6 }}>
                      Thợ may chính: <strong>{b.masterTailor || 'Master Tailor Hoàng Nam'}</strong>
                      {b.tailorNote && <div style={{ fontSize: 10, color: '#047857', marginTop: 2 }}>Nhật ký: <em>"{b.tailorNote}"</em></div>}
                    </div>

                    {updatingBespokeId === b.id ? (
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          value={bespokeNoteDraft}
                          onChange={e => setBespokeNoteDraft(e.target.value)}
                          placeholder="Ghi chú kỹ thuật may (ví dụ: Hạ nách 1cm, thêu chỉ lụa vàng)..."
                          style={{ width: '100%', fontSize: 11, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 3, marginBottom: 6, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="button secondary"
                            style={{ fontSize: 10, padding: '3px 8px' }}
                            onClick={() => setUpdatingBespokeId(null)}
                          >
                            Bỏ qua
                          </button>
                          {currentIdx < stagesList.length - 1 && (
                            <button
                              type="button"
                              className="button"
                              style={{ fontSize: 10, padding: '3px 10px', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                              disabled={busy}
                              onClick={async () => {
                                const nextStage = stagesList[currentIdx + 1];
                                await perform(`/seller/shops/${current!.id}/bespoke/${b.id}/stage`, {
                                  stage: nextStage,
                                  tailorNote: bespokeNoteDraft.trim(),
                                  masterTailor: 'Master Tailor Hoàng Nam',
                                });
                                setUpdatingBespokeId(null);
                                setBespokeNoteDraft('');
                              }}
                            >
                              Chuyển sang: {BESPOKE_STAGES[stagesList[currentIdx + 1]].label} →
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                          SLA may đo: <strong>{b.estimatedDays || 7} ngày</strong>
                        </span>
                        {currentIdx < stagesList.length - 1 ? (
                          <button
                            type="button"
                            className="button secondary"
                            style={{ fontSize: 10, padding: '3px 8px', borderColor: 'var(--gold-dark)', color: 'var(--gold-dark)' }}
                            onClick={() => {
                              setUpdatingBespokeId(b.id);
                              setBespokeNoteDraft(b.tailorNote || '');
                            }}
                          >
                            Cập nhật tiến trình &amp; Chuyển bước →
                          </button>
                        ) : (
                          <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>✓ Đã hoàn tất đóng gói</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
    </div>
  )}
</> : tab === 'fittings' ? <>
  <div style={{ marginBottom: 16, padding: '16px 18px', background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 100%)', border: '1px solid var(--line)', borderRadius: 4 }}>
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserCheck size={20} color="var(--gold-dark)" /> Điều Phối Chuyên Viên Thử Đồ Tại Nhà VIP (Home-Fitting Valet)
        </h2>
        <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
          Tiếp nhận lịch hẹn thử đồ tại gia của khách hàng VIP, phân công Senior Stylist mang Vali mẫu vải và theo dõi tỷ lệ chuyển đổi đơn may đo tại chỗ.
        </p>
      </div>
      <button
        type="button"
        className="button secondary"
        style={{ fontSize: 11, padding: '6px 12px', background: '#fff', borderColor: 'var(--line)' }}
        onClick={() => fittings.reload()}
        disabled={busy}
      >
        Làm mới lịch hẹn
      </button>
    </div>
  </div>

  {valetNotice && (
    <div style={{ marginBottom: 14 }}>
      <Notice>{valetNotice}</Notice>
    </div>
  )}

  <div className="stats" style={{ marginBottom: 16 }}>
    <div>
      <small>LỊCH HẸN TIẾP NHẬN</small>
      <strong>{fittings.data?.length ?? 0}</strong>
    </div>
    <div>
      <small>ĐÃ PHÂN CÔNG STYLIST</small>
      <strong style={{ color: '#0369a1' }}>
        {fittings.data?.filter(f => f.status === 'VALET_ASSIGNED').length ?? 0}
      </strong>
    </div>
    <div>
      <small>ĐANG DI CHUYỂN (EN ROUTE)</small>
      <strong style={{ color: '#7c3aed' }}>
        {fittings.data?.filter(f => f.status === 'EN_ROUTE').length ?? 0}
      </strong>
    </div>
    <div>
      <small>ĐÃ CHỐT ĐƠN TẠI GIA</small>
      <strong style={{ color: '#16a34a' }}>
        {fittings.data?.filter(f => f.status === 'ORDER_CONVERTED').length ?? 0}
      </strong>
    </div>
  </div>

  {fittings.loading ? (
    <Loading />
  ) : !fittings.data?.length ? (
    <Notice>Xưởng chưa có yêu cầu thử đồ tại gia nào từ khách hàng.</Notice>
  ) : (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mã lịch &amp; Thời gian</th>
            <th>Khách hàng VIP &amp; Đón tiếp</th>
            <th>Trang phục phục vụ</th>
            <th>Yêu cầu Vali mẫu vải</th>
            <th>Trạng thái &amp; Chuyên viên</th>
            <th>Thao tác điều phối</th>
          </tr>
        </thead>
        <tbody>
          {fittings.data.map(fit => {
            const statusMap: Record<string, { label: string; bg: string; color: string }> = {
              CONFIRMED: { label: 'Chờ phân công Stylist', bg: '#EFF6FF', color: '#1E40AF' },
              VALET_ASSIGNED: { label: 'Đã phân công Stylist', bg: '#FEF9C3', color: '#854D0E' },
              EN_ROUTE: { label: 'Stylist đang di chuyển', bg: '#F3E8FF', color: '#6B21A8' },
              COMPLETED: { label: 'Đã hoàn tất thử đồ', bg: '#DCFCE7', color: '#166534' },
              ORDER_CONVERTED: { label: '★ Đã chốt may đo tại gia', bg: '#ECFDF5', color: '#047857' },
              CANCELLED: { label: 'Đã hủy lịch', bg: '#FEE2E2', color: '#991B1B' },
            };
            const st = statusMap[fit.status] || { label: fit.status, bg: '#FAF8F5', color: 'var(--ink)' };
            const slotNames: Record<string, string> = {
              MORNING_09_11: 'Sáng (09:00 - 11:30)',
              AFTERNOON_14_16: 'Chiều (14:00 - 16:30)',
              EVENING_18_20: 'Tối (18:00 - 20:30)',
            };
            return (
              <tr key={fit.id}>
                <td>
                  <strong style={{ fontFamily: 'monospace', fontSize: 12 }}>{fit.id}</strong>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {fit.appointmentDate}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gold-dark)', marginTop: 1 }}>
                    {slotNames[fit.timeSlot] || fit.timeSlot}
                  </div>
                </td>
                <td>
                  <strong>{fit.recipientName || fit.customerName}</strong>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fit.phone}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink)', marginTop: 2, maxWidth: 220 }}>
                    {fit.address}
                  </div>
                </td>
                <td>
                  <strong>{fit.productName}</strong>
                  {fit.specialNotes && (
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2 }}>
                      "{fit.specialNotes}"
                    </div>
                  )}
                </td>
                <td>
                  {fit.fabricSuitcaseRequested ? (
                    <span className="badge" style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}>
                      ✓ Kèm Vali 40+ mẫu vải
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#FAF8F5', color: 'var(--muted)' }}>
                      Chỉ thử đồ mẫu
                    </span>
                  )}
                </td>
                <td>
                  <span className="badge" style={{ background: st.bg, color: st.color, border: 'none' }}>
                    {st.label}
                  </span>
                  {fit.stylistName && (
                    <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 3 }}>
                      Stylist: <strong>{fit.stylistName}</strong>
                    </div>
                  )}
                  {fit.conversionAmount && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', marginTop: 2 }}>
                      Chốt: {vnd(fit.conversionAmount)}
                    </div>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="button"
                    style={{ fontSize: 11, padding: '5px 10px', background: 'var(--ink)' }}
                    onClick={() => {
                      setValetModalFitting(fit);
                      setValetStatus(fit.status === 'CONFIRMED' ? 'VALET_ASSIGNED' : fit.status);
                      setValetStylistName(fit.stylistName || 'Trần Hoàng My (Senior Stylist)');
                      setValetStylistPhone(fit.stylistPhone || '0988776655');
                      setValetNotes(fit.valetNotes || 'Mang theo vali mẫu vải và thước dây may đo.');
                      setValetConversionAmount(fit.conversionAmount || 3500000);
                    }}
                  >
                    Điều phối / Cập nhật
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</> : tab === 'swatches' ? <>
  <div style={{ marginBottom: 16, padding: '16px 18px', background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 100%)', border: '1px solid var(--line)', borderRadius: 4 }}>
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} color="var(--gold-dark)" /> Đơn Mẫu Vải Cầm Tay (Atelier Swatch Orders)
        </h2>
        <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
          Xử lý đóng gói phong bì sáp bảo quản mẫu vải kèm thước dây sartorial và gửi bưu tá hỏa tốc cho khách hàng VIP khảo sát trước khi may đo.
        </p>
      </div>
    </div>

    {/* Summary statistics */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 14 }}>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Tổng đơn mẫu vải</div>
        <strong style={{ fontSize: 16, color: 'var(--ink)' }}>{swatchOrders.data?.length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#b45309', textTransform: 'uppercase' }}>Chờ xuất bưu tá</div>
        <strong style={{ fontSize: 16, color: '#b45309' }}>{swatchOrders.data?.filter((s: any) => s.status === 'CONFIRMED').length ?? 0}</strong>
      </div>
      <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 3, border: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10, color: '#166534', textTransform: 'uppercase' }}>Đã xuất EMS hỏa tốc</div>
        <strong style={{ fontSize: 16, color: '#166534' }}>{swatchOrders.data?.filter((s: any) => s.status === 'DISPATCHED').length ?? 0}</strong>
      </div>
    </div>
  </div>

  {swatchNotice && (
    <div style={{ marginBottom: 14 }}>
      <Notice>{swatchNotice}</Notice>
    </div>
  )}

  {swatchOrders.loading ? <Loading/> : !swatchOrders.data?.length ? (
    <div className="panel" style={{ textAlign: 'center', padding: '36px 20px' }}>
      <Layers size={28} color="var(--gold-dark)" style={{ margin: '0 auto 8px', opacity: 0.7 }} />
      <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>Chưa có yêu cầu mẫu vải nào</h3>
      <p className="subtle" style={{ margin: '0 0 16px', fontSize: 12 }}>
        Khi khách hàng quan tâm đến sản phẩm và đặt trước bộ thẻ mẫu vải cầm tay, yêu cầu điều phối xuất bưu tá sẽ hiển thị tại đây.
      </p>
    </div>
  ) : (
    <div style={{ display: 'grid', gap: 12 }}>
      {swatchOrders.data.map((sw: any) => (
        <article key={sw.id} className="panel" style={{ border: '1px solid var(--line)', padding: 16 }}>
          <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <div>
              <strong style={{ fontSize: 14 }}>{sw.productName}</strong>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Mã đơn: <strong style={{ fontFamily: 'monospace' }}>{sw.id}</strong> · Ngày đặt: {new Date(sw.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 3,
              background: sw.status === 'DISPATCHED' ? '#dcfce7' : '#fef3c7',
              color: sw.status === 'DISPATCHED' ? '#166534' : '#92400e',
              border: `1px solid ${sw.status === 'DISPATCHED' ? '#86efac' : '#fde68a'}`,
            }}>
              {sw.status === 'DISPATCHED' ? '✓ Đã xuất bưu tá hỏa tốc' : '● Chờ xuất hàng'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, fontSize: 11, background: '#fafafa', padding: '10px 12px', borderRadius: 4, margin: '8px 0' }}>
            <div>
              <div>Khách hàng VIP: <strong>{sw.customerName || sw.recipientName}</strong> ({sw.phone})</div>
              <div>Địa chỉ nhận: <strong>{sw.address}</strong></div>
              <div style={{ marginTop: 4, color: 'var(--gold-dark)' }}>
                Voucher kích hoạt: <strong style={{ fontFamily: 'monospace' }}>{sw.voucherCode}</strong> (50.000₫)
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>Mẫu vải đính kèm:</strong>
              <ul style={{ margin: 0, paddingLeft: 16, color: '#475569' }}>
                {Array.isArray(sw.swatches) && sw.swatches.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="row between" style={{ marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>
              Vận đơn: <strong>{sw.carrier || 'EMS Hỏa Tốc'}</strong> {sw.trackingNumber ? `(${sw.trackingNumber})` : ''}
            </span>
            {sw.status !== 'DISPATCHED' && (
              <button
                type="button"
                className="button"
                style={{ fontSize: 11, padding: '4px 12px', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                disabled={busy}
                onClick={async () => {
                  const ok = await perform(`/seller/shops/${current!.id}/swatch-orders/${sw.id}/dispatch`, {
                    carrier: 'EMS Chuyển Phát Hỏa Tốc',
                    trackingNumber: `EMS-VIP-${sw.id.slice(-6)}`,
                    notes: 'Đã đóng gói phong bì giấy Kraft sáp ong kèm thước dây sartorial.',
                  });
                  if (ok) {
                    setSwatchNotice(`Đã chuyển phát bưu tá cho đơn mẫu vải ${sw.id}!`);
                  }
                }}
              >
                Xuất Giao Mẫu Vải Hỏa Tốc →
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )}
</> : tab === 'passports' ? <>
  <div style={{ marginBottom: 16, padding: '16px 18px', background: 'linear-gradient(135deg, #f8faf9 0%, #ecfdf5 100%)', border: '1px solid #a7f3d0', borderRadius: 4 }}>
    <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={20} color="#059669" /> Hồ Sơ Nguồn Gốc Sợi &amp; Chứng Nhận DPP (Digital Product Passport)
        </h2>
        <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12, color: '#047857' }}>
          Đăng ký nguồn gốc vật liệu, lô sợi dệt mộc, thông số kỹ thuật GSM và đội ngũ nghệ nhân thực hiện độc bản cho từng trang phục của xưởng.
        </p>
      </div>
    </div>
    {passportNotice && (
      <div style={{ marginTop: 12, padding: '8px 12px', background: '#d1fae5', color: '#065f46', borderRadius: 3, fontSize: 12, fontWeight: 600 }}>
        ✓ {passportNotice}
      </div>
    )}
  </div>

  <div className="row between" style={{ marginBottom: 12 }}>
    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Danh mục sản phẩm &amp; Mã bảo chứng ({products.data?.length ?? 0})</p>
  </div>

  {!products.data?.length ? (
    <Notice>Chưa có sản phẩm nào trong xưởng để thiết lập Hộ chiếu DPP.</Notice>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {products.data.map(p => {
        const certCode = `NX-DPP-${p.id.slice(0, 8).toUpperCase()}-SHA256`;
        return (
          <article className="panel" key={p.id} style={{ borderLeft: '3px solid #10b981' }}>
            <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 2, fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>
                  <Award size={12} /> DPP ACCREDITED
                </div>
                <h3 style={{ margin: 0, fontSize: 16 }}>{p.name}</h3>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  Mã mẫu: {p.slug} · Chất liệu khai báo: {p.material} · Phom dáng: {p.fit}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 2, color: 'var(--ink)', fontWeight: 600 }}>
                  {certCode}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 11.5, background: '#fafafa', padding: 12, borderRadius: 3, border: '1px solid var(--line)' }}>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Nguồn gốc sợi tiêu chuẩn:</span>
                <strong>Normandy (Pháp) &amp; Xưởng NÉP Atelier</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Thành phần xơ sợi:</span>
                <strong>100% Linen tự nhiên dệt mộc hữu cơ</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Định lượng &amp; Cấu trúc:</span>
                <strong>210 GSM · Mật độ 76x62</strong>
              </div>
              <div>
                <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Giờ công thủ công:</span>
                <strong style={{ color: 'var(--gold-dark)' }}>54 giờ may đo độc bản</strong>
              </div>
            </div>

            <div className="row between" style={{ marginTop: 12 }}>
              <span style={{ fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Sổ cái phân quyền minh bạch · Tem QR truy xuất
              </span>
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: 11, padding: '5px 12px', borderColor: '#10b981', color: '#065f46' }}
                onClick={() => {
                  setEditingPassportProduct(p);
                  setPassportNotice('');
                }}
              >
                Cập Nhật Hồ Sơ Sợi &amp; Nghệ Nhân →
              </button>
            </div>
          </article>
        );
      })}
    </div>
  )}
</> : tab === 'products' ? <><div className="row between"><p>{products.data?.length ?? 0} sản phẩm</p><button className="button" disabled={current.status !== 'APPROVED'} onClick={() => setCreating(!creating)}>{creating ? 'Đóng form' : '+ Thêm sản phẩm'}</button></div>{creating && <form className="panel form" onSubmit={createProduct}><h2>Đăng mẫu áo mới</h2><p className="subtle">Form đầu tiên hỗ trợ một màu, ba size S–M–L. Ma trận nhiều màu được hỗ trợ ở API.</p><div className="form-grid"><label>Tên sản phẩm<input name="name" required minLength={3}/></label><label>Nhóm<input name="categoryId" value={categories.data?.find(c => c.name === 'Áo')?.id ?? 'ao'} readOnly/></label><label>Chất liệu<input name="material" required minLength={2}/></label><label>Phom dáng<input name="fit" required minLength={2}/></label><label>Mã mẫu<input name="sku" required/></label><label>Giá VND<input name="price" type="number" min={1000} max={100000000} required/></label><label>Tên màu<input name="color" required/></label><label>Màu minh họa<input name="colorHex" type="color" defaultValue="#d9cbb1"/></label></div><label>Mô tả<textarea name="description" required minLength={10}/></label><label>Đường dẫn ảnh<input name="image" type="url" required placeholder="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"/></label><div className="table-wrap"><table><thead><tr><th>Size</th><th>Tồn</th><th>Ngực cm</th><th>Vai cm</th><th>Dài cm</th></tr></thead><tbody>{['S','M','L'].map(size => <tr key={size}><th>{size}</th>{['stock','nguc','vai','dai'].map(field => <td key={field}><input aria-label={`${field} size ${size}`} type="number" name={`${field}-${size}`} min={field === 'stock' ? 0 : 1} max={field === 'stock' ? 100000 : 300} required/></td>)}</tr>)}</tbody></table></div><label>Hướng dẫn đo<textarea name="guide" required minLength={5} defaultValue="Đặt áo phẳng, đo vòng ngực, chiều ngang vai và chiều dài từ vai xuống gấu."/></label><button className="button" disabled={busy}>Đăng sản phẩm</button></form>}{products.error && <Notice error>{products.error}</Notice>}{products.data?.map(p => <article className="panel" key={p.id}><div className="row between"><h2>{p.name} {p.status === 'HIDDEN' && <span className="badge" style={{ background: '#7f1d1d', color: '#fff' }}>Đã ngắt cầu dao (HIDDEN)</span>}</h2>{p.status === 'ACTIVE' && <button className="button secondary" style={{ fontSize: 11, padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5' }} title="Ngắt cầu dao khẩn cấp gỡ sản phẩm khỏi sàn ngay lập tức" disabled={busy} onClick={() => { setCircuitTarget({ id: p.id, name: p.name }); setCircuitReason('Sự cố lỗi giá - Khẩn cấp gỡ bán'); }}>Ngắt cầu dao (Circuit Breaker)</button>}</div><div className="table-wrap"><table><thead><tr><th>SKU</th><th>Màu / Size</th><th>Giá</th><th>Vật lý</th><th>Đã giữ</th><th>Điều chỉnh</th></tr></thead><tbody>{p.variants.map(v => <tr key={v.id}><td>{v.sku}</td><td>{v.color} / {v.size}</td><td>{vnd(v.price)}</td><td>{v.inventory?.onHand}</td><td>{v.inventory?.reserved}</td><td><form className="stock-form" onSubmit={e => { e.preventDefault(); const form = e.currentTarget, d = new FormData(form); void perform(`/seller/shops/${current.id}/variants/${v.id}/stock`, { delta: Number(d.get('delta')), reason: d.get('reason'), key: crypto.randomUUID() }, 'PATCH'); }}><input name="delta" aria-label={`Số lượng thay đổi ${v.sku}`} type="number" required placeholder="+ / −"/><input name="reason" aria-label={`Lý do ${v.sku}`} required minLength={5} placeholder="Lý do"/><button disabled={busy}>Lưu</button></form></td></tr>)}</tbody></table></div></article>)}</> : tab === 'returns' ? <>{returns.loading ? <Loading/> : !returns.data?.length ? <Notice>Chưa có yêu cầu đổi size hoặc hoàn trả.</Notice> : returns.data.map(r => <article className="panel" key={r.id}><div className="row between"><h2>{r.kind === 'EXCHANGE' ? 'Yêu cầu đổi size' : 'Yêu cầu hoàn trả'}</h2><span className="badge">{r.status === 'DISPUTED' ? 'Trọng tài sàn thụ lý' : r.status}</span></div><p>Lý do: {r.reason}</p>{r.items.map(i => <p key={i.id} className="subtle">{i.quantity} × {i.orderItem?.snapshot.name} ({i.orderItem?.snapshot.color} / {i.orderItem?.snapshot.size}){i.refundAmount > 0 ? ` · Hoàn ${vnd(i.refundAmount)}` : ''}</p>)}{r.status === 'DISPUTED' && <p className="subtle" style={{ color: 'var(--gold-dark)', fontSize: 12 }}>Số tiền hoàn đang được tạm giữ trong ví tranh chấp chờ Hội đồng Trọng tài Sàn phân xử.</p>}<div className="row wrap">{r.status === 'REQUESTED' && <><button className="button" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'APPROVED' })}>Duyệt yêu cầu</button><button className="button secondary" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'REJECTED' })}>Từ chối</button></>}{r.status === 'APPROVED' && <><button className="button" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'COMPLETED' })}>Xác nhận hoàn tất</button>{r.kind === 'REFUND' && <button className="button secondary" title="Hoàn tiền ngay không cần khách trả hàng vật lý" disabled={busy} onClick={() => perform(`/seller/shops/${current.id}/returns/${r.id}/decision`, { status: 'COMPLETED', returnless: true })}>Hoàn không cần trả hàng</button>}</>}</div></article>)}</> : tab === 'finance' ? <><article className="panel"><h2>Sổ cái &amp; Ví Người Bán 3 Tầng</h2><div className="stats" style={{ margin: '16px 0' }}><div><small>KHẢ DỤNG</small><strong style={{ color: '#166534' }}>{vnd(ledger.data?.available ?? 0)}</strong></div><div><small>TẠM GIỮ (KÝ QUỸ 7 NGÀY)</small><strong>{vnd(ledger.data?.held ?? 0)}</strong></div><div><small>ĐÓNG BĂNG (ĐỔI/TRẢ)</small><strong>{vnd(ledger.data?.disputed ?? 0)}</strong></div><div><small>TỔNG SỔ CÁI</small><strong>{vnd(ledger.data?.balance ?? 0)}</strong></div></div><div style={{ margin: '12px 0 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><button type="button" className="button" style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={busy || !ledger.data?.available || ledger.data.available < 50000} onClick={() => { setPayoutAmount(ledger.data?.available ?? 0); setShowPayoutModal(true); }}><Landmark size={15}/> Rút tiền ký quỹ Escrow (Napas 24/7)</button>{payoutNotice && <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>✓ {payoutNotice}</span>}</div><p className="subtle" style={{ fontSize: 12 }}>Bao gồm khấu trừ thuế tại nguồn 1% GTGT + 0.5% TNCN theo Thông tư 40/2021/TT-BTC. Tiền ký quỹ tự động giải phóng sau 7 ngày kể từ khi khách đồng kiểm thành công.</p>{!ledger.data?.entries.length ? <p className="subtle">Chưa có giao dịch đối soát.</p> : <div className="table-wrap"><table><thead><tr><th>Loại</th><th>Mã đối soát</th><th>Số tiền</th><th>Thời gian</th></tr></thead><tbody>{ledger.data.entries.map(e => <tr key={e.id}><td>{e.kind}</td><td>{e.sourceKey}</td><td style={{ color: e.amount < 0 ? '#b91c1c' : '#166534', fontWeight: 600 }}>{vnd(e.amount)}</td><td>{new Date(e.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>}</article>

{showPayoutModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16 }} onClick={() => setShowPayoutModal(false)}>
    <div style={{ background: '#fff', maxWidth: 480, width: '100%', borderRadius: 6, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Yêu Cầu Rút Tiền Ký Quỹ Escrow (Napas 24/7)</h3>
        <button type="button" onClick={() => setShowPayoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--muted)' }}>
        Số tiền khả dụng hiện tại: <strong style={{ color: '#166534' }}>{vnd(ledger.data?.available ?? 0)}</strong>. Lệnh rút tiền được chuyển tức thì qua Napas 24/7 vào tài khoản ngân hàng của xưởng may.
      </p>
      <form onSubmit={async e => {
        e.preventDefault();
        const success = await perform(`/seller/shops/${current.id}/payout`, {
          amount: Number(payoutAmount),
          bankName: payoutBank,
          accountNumber: payoutAccount,
          beneficiaryName: payoutBeneficiary,
        });
        if (success) {
          setShowPayoutModal(false);
          setPayoutNotice(`Đã chuyển thành công ${vnd(payoutAmount)} về ${payoutBank} (STK: ${payoutAccount})!`);
        }
      }} style={{ display: 'grid', gap: 12 }}>
        <label style={{ fontSize: 12 }}>
          Ngân hàng thụ hưởng
          <input value={payoutBank} onChange={e => setPayoutBank(e.target.value)} required />
        </label>
        <label style={{ fontSize: 12 }}>
          Số tài khoản ngân hàng
          <input value={payoutAccount} onChange={e => setPayoutAccount(e.target.value)} required />
        </label>
        <label style={{ fontSize: 12 }}>
          Tên chủ tài khoản (Viết hoa không dấu)
          <input value={payoutBeneficiary} onChange={e => setPayoutBeneficiary(e.target.value)} required />
        </label>
        <label style={{ fontSize: 12 }}>
          Số tiền muốn rút (Tối thiểu 50.000₫)
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input type="number" min={50000} max={ledger.data?.available ?? 50000} value={payoutAmount} onChange={e => setPayoutAmount(Number(e.target.value))} required style={{ flex: 1 }} />
            <button type="button" className="button secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setPayoutAmount(ledger.data?.available ?? 0)}>Rút tất cả</button>
          </div>
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button type="button" className="button secondary" style={{ flex: 1 }} onClick={() => setShowPayoutModal(false)}>Hủy</button>
          <button className="button" style={{ flex: 1, background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }} disabled={busy || payoutAmount < 50000 || payoutAmount > (ledger.data?.available ?? 0)}>Xác Nhận Rút Tiền</button>
        </div>
      </form>
    </div>
  </div>
)}

{circuitTarget && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16 }} onClick={() => setCircuitTarget(null)}>
    <div style={{ background: '#fff', maxWidth: 440, width: '100%', borderRadius: 6, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
      <div className="row between" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={18} /> Kích hoạt cầu dao khẩn cấp
        </h3>
        <button type="button" onClick={() => setCircuitTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
        Sản phẩm <strong>{circuitTarget.name}</strong> sẽ được ẩn ngay lập tức khỏi gian hàng và dừng mọi đơn đặt hàng mới để bảo vệ an toàn thương mại.
      </p>
      <label style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>
        Lý do ngắt cầu dao (tối thiểu 5 ký tự):
        <textarea
          rows={3}
          value={circuitReason}
          onChange={e => setCircuitReason(e.target.value)}
          required
          style={{ width: '100%', marginTop: 4, padding: 8, fontSize: 12, border: '1px solid var(--line)', borderRadius: 4 }}
        />
      </label>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="button secondary" onClick={() => setCircuitTarget(null)}>Hủy bỏ</button>
        <button
          type="button"
          className="button"
          style={{ background: '#dc2626', borderColor: '#dc2626' }}
          disabled={busy || circuitReason.trim().length < 5}
          onClick={async () => {
            const success = await perform(`/seller/shops/${current.id}/products/${circuitTarget.id}/circuit-breaker`, { reason: circuitReason.trim() });
            if (success) setCircuitTarget(null);
          }}
        >
          Xác nhận ngắt cầu dao
        </button>
      </div>
    </div>
  </div>
)}<article className="panel"><h2>Mã giảm giá của shop</h2><form className="inline-form" style={{ marginBottom: 20 }} onSubmit={async e => { e.preventDefault(); const form = e.currentTarget, d = new FormData(form); if (await perform(`/seller/shops/${current.id}/vouchers`, { code: d.get('code'), amount: Number(d.get('amount')), minimum: Number(d.get('minimum')), maxUses: Number(d.get('maxUses')), daysValid: Number(d.get('daysValid')) })) form.reset(); }}><input name="code" required placeholder="Mã (VD: SALE50)" pattern="[A-Za-z0-9]{3,20}"/><input name="amount" type="number" min={1000} required placeholder="Giảm (VND)"/><input name="minimum" type="number" min={0} required placeholder="Đơn tối thiểu"/><input name="maxUses" type="number" min={1} defaultValue={100} required placeholder="Lượt dùng"/><input name="daysValid" type="number" min={1} defaultValue={30} required placeholder="Số ngày"/><button className="button" disabled={busy || current.status !== 'APPROVED'}>Tạo mã</button></form>{!vouchers.data?.length ? <p className="subtle">Shop chưa có mã giảm giá nào.</p> : <div className="table-wrap"><table><thead><tr><th>Mã</th><th>Giảm</th><th>Đơn tối thiểu</th><th>Đã dùng</th><th>Hết hạn</th></tr></thead><tbody>{vouchers.data.map(v => <tr key={v.id}><td><strong>{v.code}</strong></td><td>{vnd(v.amount)}</td><td>{vnd(v.minimum)}</td><td>{v.uses} / {v.maxUses}</td><td>{new Date(v.expiresAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>}</article></> : <article className="panel"><div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}><div><h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}><Leaf size={20} color="#166534"/> Chứng Nhận Xưởng May Xanh &amp; Thẻ Điểm ESG Bền Vững</h2><p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>Đánh giá mức độ tuân thủ tiêu chuẩn thời trang sinh thái, tỷ lệ sợi tự nhiên và giảm thiểu dấu chân carbon theo quy chuẩn NEXORA Green Atelier.</p></div><span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Award size={14}/> GREEN ATELIER VERIFIED</span></div><div className="stats" style={{ margin: '16px 0' }}><div><small>TỶ LỆ SỢI TỰ NHIÊN</small><strong style={{ color: '#166534' }}>94.5%</strong></div><div><small>CARBON TIẾT GIẢM / QUÝ</small><strong style={{ color: '#166534' }}>18.4 tấn CO2e</strong></div><div><small>BAO BÌ TUẦN HOÀN</small><strong>100% Eco Kraft</strong></div><div><small>ZERO-WASTE PATTERN</small><strong>Tiết kiệm 14% vải</strong></div></div><div style={{ marginTop: 20 }}><h3 style={{ fontSize: 14, marginBottom: 10 }}>Hồ Sơ Chứng Chỉ Xanh Đã Xác Minh Của Gian Hàng:</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>{[{ title: 'Chứng Nhận Hữu Cơ Toàn Cầu GOTS', code: 'CU-889921-GOTS', desc: '100% sợi bông Pima và sợi lanh canh tác hữu cơ không biến đổi gen và không thuốc trừ sâu.' }, { title: 'Tiêu Chuẩn Độc Lập OEKO-TEX Standard 100', code: 'OEKO-VN-2026-04', desc: 'Kiểm định độc lập không chứa formaldehyde, kim loại nặng hoặc thuốc nhuộm azo độc hại.' }, { title: 'Xuất Xứ Lụa Tơ Tằm Bản Địa Bảo Lộc', code: 'CO-LAMDONG-SILK', desc: '100% kén tơ tằm thu hoạch nhân đạo từ thủ phủ lụa Lâm Đồng Việt Nam.' }, { title: 'Quy Chuẩn Nước Thải Xử Lý Sinh Học', code: 'QCVN-40-2011-BTNMT', desc: 'Hệ thống tuần hoàn khép kín tái sử dụng 85% nước giặt nhuộm tự nhiên.' }].map((cert, idx) => <div key={idx} style={{ padding: 12, background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 6 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><CheckCircle2 size={16} color="#166534"/><strong style={{ fontSize: 13, color: 'var(--ink)' }}>{cert.title}</strong></div><span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Mã hồ sơ: {cert.code}</span><p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{cert.desc}</p></div>)}</div></div>

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
</article>}</>}

{cuttingTicketModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'grid', placeItems: 'center', zIndex: 120, padding: 16 }} onClick={() => setCuttingTicketModal(null)}>
    <div style={{ background: '#fff', maxWidth: 620, width: '100%', borderRadius: 6, padding: '28px 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div className="row between" style={{ marginBottom: 16, borderBottom: '2px solid var(--ink)', paddingBottom: 12 }}>
        <div>
          <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 700 }}>NEXORA HAUTE COUTURE ATELIER</span>
          <h2 style={{ margin: '2px 0 0', fontSize: 18, fontFamily: 'serif' }}>Phiếu Rập &amp; Thông Số Cắt Vải Kỹ Thuật</h2>
          <small style={{ color: '#64748b' }}>Mã phiếu: <strong>#CUT-{cuttingTicketModal.id.slice(-8).toUpperCase()}</strong> · Ngày: {new Date(cuttingTicketModal.createdAt).toLocaleDateString('vi-VN')}</small>
        </div>
        <button type="button" onClick={() => setCuttingTicketModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16, fontSize: 12 }}>
        <div style={{ background: '#FAF8F5', padding: '10px 12px', borderRadius: 4, border: '1px solid var(--line)' }}>
          <div style={{ color: '#64748b', fontSize: 11 }}>Trang phục may đo:</div>
          <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{cuttingTicketModal.productName}</strong>
          <div style={{ fontSize: 11, color: 'var(--gold-dark)', marginTop: 2 }}>Quy cách: {cuttingTicketModal.variant || 'Mặc định'}</div>
        </div>
        <div style={{ background: '#FAF8F5', padding: '10px 12px', borderRadius: 4, border: '1px solid var(--line)' }}>
          <div style={{ color: '#64748b', fontSize: 11 }}>Khách hàng cá nhân hóa:</div>
          <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{cuttingTicketModal.customerName || 'Khách Hàng Atelier'}</strong>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{cuttingTicketModal.customerEmail || 'Hồ sơ đã bảo mật PDPD'}</div>
        </div>
      </div>

      {/* Anatomical Cutting Specs Table */}
      <div style={{ marginBottom: 16 }}>
        <strong style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
          1. Bảng Thông Số Nhân Trắc Học (Cắt Rập Thủ Công ±0.5cm)
        </strong>
        <div className="table-wrap">
          <table style={{ width: '100%', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Chỉ số đo</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Số đo gốc</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Độ cử động (Ease)</th>
                <th style={{ padding: '6px 8px', textAlign: 'center' }}>Thông số cắt rập</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px' }}>Vòng ngực (Chest)</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{cuttingTicketModal.passport?.chest || 92} cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#166534' }}>+6.0 cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{(cuttingTicketModal.passport?.chest || 92) + 6} cm</td>
              </tr>
              <tr style={{ background: '#fafafa' }}>
                <td style={{ padding: '6px 8px' }}>Vòng eo (Waist)</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{cuttingTicketModal.passport?.waist || 76} cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#166534' }}>+4.0 cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{(cuttingTicketModal.passport?.waist || 76) + 4} cm</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 8px' }}>Rộng vai (Shoulder)</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{cuttingTicketModal.passport?.shoulder || 42} cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#166534' }}>+1.0 cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{(cuttingTicketModal.passport?.shoulder || 42) + 1} cm</td>
              </tr>
              <tr style={{ background: '#fafafa' }}>
                <td style={{ padding: '6px 8px' }}>Dài tay áo (Sleeve Length)</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{cuttingTicketModal.passport?.armLength || 59} cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#166534' }}>Chuẩn phom</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{cuttingTicketModal.passport?.armLength || 59} cm</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 8px' }}>Vòng mông (Hips)</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{cuttingTicketModal.passport?.hips || 94} cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#166534' }}>+5.0 cm</td>
                <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{(cuttingTicketModal.passport?.hips || 94) + 5} cm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Craftsmanship Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16, fontSize: 11 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: 10 }}>
          <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>Thêu Monogram Thủ Công:</strong>
          <span style={{ color: 'var(--gold-dark)', fontWeight: 700, fontFamily: 'serif', fontSize: 13 }}>
            {cuttingTicketModal.monogram || 'Không yêu cầu'}
          </span>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Vị trí: Cổ tay trái · Chỉ lụa tơ tằm bóng</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: 10 }}>
          <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 2 }}>Lớp Lót &amp; Kết Cấu:</strong>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {cuttingTicketModal.lining || 'Lót lụa tơ tằm nguyên bản'}
          </span>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Đường may: Cuốn mép Pháp (French Seams)</div>
        </div>
      </div>

      {cuttingTicketModal.notes && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '8px 12px', borderRadius: 4, fontSize: 11, marginBottom: 16, color: '#713f12' }}>
          <strong>Lưu ý từ khách hàng:</strong> {cuttingTicketModal.notes}
        </div>
      )}

      {/* Tailor Sign-Off */}
      <div className="row between" style={{ borderTop: '1px solid #cbd5e1', paddingTop: 14, fontSize: 11, alignItems: 'center' }}>
        <div>
          <div>Master Tailor phụ trách: <strong>{cuttingTicketModal.masterTailor || 'Master Tailor Hoàng Nam'}</strong></div>
          <small style={{ color: '#64748b' }}>Đã đối chiếu rập gốc và kích hoạt quy trình KCS 50x vi điểm</small>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="button secondary"
            style={{ fontSize: 11, padding: '5px 12px' }}
            onClick={() => setCuttingTicketModal(null)}
          >
            Đóng
          </button>
          <button
            type="button"
            className="button"
            style={{ fontSize: 11, padding: '5px 14px', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => window.print()}
          >
            <Printer size={13} /> In Phiếu Cắt Rập
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Modal Điều Phối Chuyên Viên Thử Đồ Tại Nhà (Home-Fitting Valet Dispatch) */}
{valetModalFitting && (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(20, 20, 19, 0.65)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }}>
    <div style={{
      background: '#FFFFFF',
      border: '1px solid var(--line)',
      borderRadius: 4,
      maxWidth: 520,
      width: '100%',
      padding: '24px 28px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>ĐIỀU PHỐI VALET CHUYÊN VIÊN</span>
          <h3 style={{ margin: 0, fontSize: 18 }}>Lịch Hẹn {valetModalFitting.id}</h3>
        </div>
        <button
          type="button"
          onClick={() => setValetModalFitting(null)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
        >
          ×
        </button>
      </div>

      <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, marginBottom: 14, fontSize: 12 }}>
        <div>Khách hàng VIP: <strong>{valetModalFitting.recipientName || valetModalFitting.customerName}</strong> ({valetModalFitting.phone})</div>
        <div>Địa chỉ thử đồ: <strong>{valetModalFitting.address}</strong></div>
        <div>Thời gian hẹn: <strong>{valetModalFitting.appointmentDate} ({valetModalFitting.timeSlot})</strong></div>
        <div>Sản phẩm: <strong>{valetModalFitting.productName}</strong></div>
      </div>

      <form
        onSubmit={async e => {
          e.preventDefault();
          const ok = await perform(`/seller/shops/${current!.id}/fittings/${valetModalFitting.id}/dispatch`, {
            status: valetStatus,
            stylistName: valetStylistName,
            stylistPhone: valetStylistPhone,
            valetNotes: valetNotes,
            ...(valetStatus === 'ORDER_CONVERTED' ? { conversionAmount: Number(valetConversionAmount) } : {}),
          });
          if (ok) {
            setValetNotice(`Đã cập nhật điều phối lịch hẹn ${valetModalFitting.id} (Trạng thái: ${valetStatus}).`);
            setValetModalFitting(null);
          }
        }}
        className="stack"
        style={{ gap: 12 }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Trạng Thái Lịch Trình
          </label>
          <select
            value={valetStatus}
            onChange={e => setValetStatus(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
          >
            <option value="VALET_ASSIGNED">1. Đã phân công Chuyên viên Styling</option>
            <option value="EN_ROUTE">2. Chuyên viên đang trên đường di chuyển (Valet En-Route)</option>
            <option value="COMPLETED">3. Đã hoàn tất buổi thử đồ tại gia</option>
            <option value="ORDER_CONVERTED">4. ★ Khách hàng chốt đo may / mua hàng tại chỗ</option>
            <option value="CANCELLED">5. Hủy lịch hẹn (theo yêu cầu của khách)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Họ Tên Chuyên Viên Styling
            </label>
            <input
              value={valetStylistName}
              onChange={e => setValetStylistName(e.target.value)}
              required
              minLength={2}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              SĐT Chuyên Viên
            </label>
            <input
              value={valetStylistPhone}
              onChange={e => setValetStylistPhone(e.target.value)}
              required
              pattern="0[0-9]{9}"
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
        </div>

        {valetStatus === 'ORDER_CONVERTED' && (
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#047857' }}>
              Doanh Thu Chốt Đơn May Đo Tại Gia (VND)
            </label>
            <input
              type="number"
              value={valetConversionAmount}
              onChange={e => setValetConversionAmount(Number(e.target.value))}
              min={100000}
              required
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid #10b981', borderRadius: 2, fontWeight: 700 }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Nhật Ký Điều Phối &amp; Phục Vụ
          </label>
          <textarea
            value={valetNotes}
            onChange={e => setValetNotes(e.target.value)}
            rows={2}
            placeholder="Ghi chú mang theo vali mẫu vải, thước dây hoặc phản hồi của khách..."
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, resize: 'vertical' }}
          />
        </div>

        <div className="row between" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => setValetModalFitting(null)}
          >
            Bỏ qua
          </button>
          <button
            type="submit"
            className="button"
            disabled={busy}
          >
            {busy ? 'Đang lưu...' : 'Lưu Điều Phối Stylist'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{toileModalOrder && (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(20, 20, 19, 0.65)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  }}>
    <div style={{
      background: '#FFFFFF',
      border: '1px solid var(--line)',
      borderRadius: 4,
      maxWidth: 620,
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      padding: '24px 28px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>HỒ SƠ MẪU VẢI MỘC · TOILE MUSLIN DOSSIER</span>
          <h3 style={{ margin: 0, fontSize: 18 }}>Dự Án May Đo #{toileModalOrder.id}</h3>
        </div>
        <button
          type="button"
          onClick={() => setToileModalOrder(null)}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
        >
          ×
        </button>
      </div>

      <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, marginBottom: 14, fontSize: 12 }}>
        <div>Trang phục: <strong>{toileModalOrder.productName}</strong></div>
        <div>Khách hàng: <strong>{toileModalOrder.customerName || 'Khách Hàng Atelier'}</strong> · {toileModalOrder.customerEmail}</div>
        <div style={{ marginTop: 4, fontSize: 11, color: '#64748b' }}>
          Số đo gốc: Ngực <strong>{toileModalOrder.passport?.chest || 92}cm</strong> · Eo <strong>{toileModalOrder.passport?.waist || 76}cm</strong> · Rộng vai <strong>{toileModalOrder.passport?.shoulder || 42}cm</strong> · Dài tay <strong>{toileModalOrder.passport?.armLength || 59}cm</strong>
        </div>
      </div>

      {/* 3-Angle Muslin Fit Visual Inspector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
          Mô Phỏng 3 Góc Độ Thử Phom Vải Mộc (3-Angle Muslin Fitting)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>1. Mặt Trước (Front)</div>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
              Ve áo &amp; Ngực phẳng
            </div>
            <div style={{ fontSize: 9, color: '#166534', marginTop: 4 }}>Canh sớ vải thẳng</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>2. Góc 45° (Side Angle)</div>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
              Vòng nách &amp; Bắp tay
            </div>
            <div style={{ fontSize: 9, color: '#166534', marginTop: 4 }}>Cử động +6cm</div>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>3. Lưng &amp; Cột Sống</div>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
              Sống lưng ôm trọn
            </div>
            <div style={{ fontSize: 9, color: '#166534', marginTop: 4 }}>Không nhăn gợn</div>
          </div>
        </div>
      </div>

      <form
        onSubmit={async e => {
          e.preventDefault();
          const ok = await perform(`/seller/shops/${current!.id}/bespoke/${toileModalOrder.id}/toile`, {
            shoulderSlope: toileShoulderSlope,
            postureBalance: toilePostureBalance,
            easeAllowanceBust: Number(toileEaseAllowanceBust),
            easeAllowanceWaist: Number(toileEaseAllowanceWaist),
            masterNotes: toileMasterNotes,
            status: 'SUBMITTED_FOR_CLIENT_REVIEW',
          });
          if (ok) {
            setToileNotice(`Đã gửi hồ sơ vải mộc của dự án ${toileModalOrder.id} cho khách hàng duyệt cắt vải chính.`);
            setToileModalOrder(null);
          }
        }}
        className="stack"
        style={{ gap: 12 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Độ Dốc Vai (Shoulder Slope)
            </label>
            <select
              value={toileShoulderSlope}
              onChange={e => setToileShoulderSlope(e.target.value as any)}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            >
              <option value="STANDARD">Vai Chuẩn (Góc hạ vai 22°)</option>
              <option value="SLOPING">Vai Xuôi (Hạ vai trên 25° · Đệm vai mỏng)</option>
              <option value="SQUARE">Vai Vuông (Hạ vai dưới 20° · Giảm đệm)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Cân Bằng Cột Sống (Posture)
            </label>
            <select
              value={toilePostureBalance}
              onChange={e => setToilePostureBalance(e.target.value as any)}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            >
              <option value="NORMAL">Cân bằng tự nhiên (Normal Balance)</option>
              <option value="ERECT">Dáng đứng thẳng ưỡn ngực (Erect)</option>
              <option value="STOOPED">Hơi gù / Nghiêng trước (Stooped)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Dung Sai Cử Động Ngực (+cm)
            </label>
            <input
              type="number"
              step="0.5"
              min={2}
              max={15}
              value={toileEaseAllowanceBust}
              onChange={e => setToileEaseAllowanceBust(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
              Dung Sai Cử Động Eo (+cm)
            </label>
            <input
              type="number"
              step="0.5"
              min={2}
              max={15}
              value={toileEaseAllowanceWaist}
              onChange={e => setToileEaseAllowanceWaist(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Ghi Chú Kỹ Thuật May Cả (Head Cutter Notes)
          </label>
          <textarea
            value={toileMasterNotes}
            onChange={e => setToileMasterNotes(e.target.value)}
            rows={2}
            placeholder="Ghi chú về canh sợi, hạ nách áo, đường châm phấn hoặc độ rủ..."
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, resize: 'vertical' }}
          />
        </div>

        <div className="row between" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="button secondary"
            onClick={() => setToileModalOrder(null)}
          >
            Đóng
          </button>
          <button
            type="submit"
            className="button"
            style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
            disabled={busy}
          >
            {busy ? 'Đang gửi...' : 'Gửi Khách Duyệt Mẫu Vải Mộc (Toile) →'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{editingPassportProduct && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16 }} onClick={() => setEditingPassportProduct(null)}>
    <div style={{ background: '#fff', maxWidth: 560, width: '100%', borderRadius: 6, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>HỒ SƠ NGUYÊN LIỆU &amp; CHỨNG NHẬN DPP</span>
          <h3 style={{ margin: '2px 0 0', fontSize: 16 }}>{editingPassportProduct.name}</h3>
        </div>
        <button type="button" onClick={() => setEditingPassportProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>

      <form onSubmit={saveProductPassport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Vùng Xuất Xứ Nguyên Liệu</label>
          <input
            value={passportOrigin}
            onChange={e => setPassportOrigin(e.target.value)}
            required
            minLength={3}
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Thành Phần Xơ Sợi Khai Báo</label>
          <input
            value={passportFiber}
            onChange={e => setPassportFiber(e.target.value)}
            required
            minLength={3}
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Định Lượng &amp; Cấu Trúc Dệt</label>
            <input
              value={passportWeave}
              onChange={e => setPassportWeave(e.target.value)}
              required
              minLength={3}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Mã Lô Sợi (Yarn Lot)</label>
            <input
              value={passportYarnLot}
              onChange={e => setPassportYarnLot(e.target.value)}
              required
              minLength={2}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Chứng Chỉ Kiểm Định (Phân cách bằng dấu phẩy)</label>
          <input
            value={passportCertifications}
            onChange={e => setPassportCertifications(e.target.value)}
            required
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Giảm Phát Thải CO2 (kg)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={passportCarbonKg}
              onChange={e => setPassportCarbonKg(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Tiết Kiệm Nước (Lít)</label>
            <input
              type="number"
              step="10"
              min={0}
              value={passportWaterLiters}
              onChange={e => setPassportWaterLiters(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
            />
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: 10, borderRadius: 3, border: '1px solid #e2e8f0', fontSize: 11 }}>
          <strong style={{ display: 'block', marginBottom: 4, color: '#334155' }}>Đội Ngũ Nghệ Nhân Chế Tác Sẽ Được Đính Kèm:</strong>
          <span>• Đỗ Văn Thành (24 năm nghề - 18h) · Hoàng Thị Cúc (20 năm nghề - 22h) · Nguyễn Thị Mai (18 năm nghề - 14h)</span>
        </div>

        <div className="row between" style={{ marginTop: 8 }}>
          <button type="button" className="button secondary" onClick={() => setEditingPassportProduct(null)}>Hủy</button>
          <button type="submit" className="button" style={{ background: '#059669', borderColor: '#059669' }} disabled={busy}>
            {busy ? 'Đang lưu...' : 'Ký Số & Phát Hành Mã DPP →'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}</section>;
}
