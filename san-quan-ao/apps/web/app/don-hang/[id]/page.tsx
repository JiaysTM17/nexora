'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, FileText, Truck, KeyRound, PackageCheck, CheckCircle2, Clock, Leaf, Printer, Download, CheckCircle, ExternalLink, QrCode, Navigation, PhoneCall, MessageSquare, Compass, X, RotateCcw, Sparkles, Star, ThumbsUp, Coffee, CloudRain, Umbrella, Wind, AlertTriangle, ShieldAlert, Zap, Scale, FileCheck } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Order, ReturnRequest, useResource, vnd } from '../../api';
import { Empty, Loading, Notice } from '../../ui';

const RETURN_LABELS: Record<string, string> = {
  REQUESTED: 'Chờ shop xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Shop từ chối',
  DISPUTED: 'Trọng tài Sàn thụ lý (SLA 48h)',
  COMPLETED: 'Hoàn tất',
};

const SLOT_LABELS: Record<string, string> = {
  MORNING: 'Buổi sáng (08:00 - 12:00)',
  AFTERNOON: 'Buổi chiều (13:30 - 17:30)',
  EVENING: 'Buổi tối (18:00 - 21:00 · Ngoài giờ)',
};

function getSecurityPin(orderCode: string, shopId: string): string {
  let hash = 0;
  const str = `${orderCode}:${shopId}:NEXORA_PIN`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const pin = (Math.abs(hash) % 900000) + 100000;
  return pin.toString();
}

export default function OrderDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: order, error, loading, reload } = useResource<Order>(id ? `/orders/${id}` : null);
  const { data: returns, reload: reloadReturns } = useResource<ReturnRequest[]>(id ? '/returns' : null);
  const [notice, setNotice] = useState(''), [success, setSuccess] = useState(''), [busy, setBusy] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [returningShop, setReturningShop] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState(true);
  // ORD-REALTIME-RETURN-DISPUTE-MEDIATOR-01: Online Arbitration Portal & 45-Day Escrow Dispute Freeze
  const [showDisputeSimulator, setShowDisputeSimulator] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showCarbonCertModal, setShowCarbonCertModal] = useState(false);
  const [showTrackingMap, setShowTrackingMap] = useState<string | null>(null);
  const [courierCallAlert, setCourierCallAlert] = useState(false);
  const [courierMsgSent, setCourierMsgSent] = useState(false);
  const [ecoBoxRequested, setEcoBoxRequested] = useState(false);
  const [ecoBoxCount, setEcoBoxCount] = useState(1);
  const [ecoPickupSlot, setEcoPickupSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING');
  const [ecoMethod, setEcoMethod] = useState<'SHIPPER' | 'BOUTIQUE'>('SHIPPER');
  const [ecoCondition, setEcoCondition] = useState<'INTACT' | 'SLIGHT_CREASE' | 'DAMAGED'>('INTACT');
  const [courierRating, setCourierRating] = useState<number>(5);
  const [courierTags, setCourierTags] = useState<string[]>(['⚡ Giao đúng giờ hẹn', '👗 Bảo quản form trang phục cẩn thận']);
  const [courierTip, setCourierTip] = useState<number>(10000);
  const [courierComment, setCourierComment] = useState<string>('');
  const [courierFeedbackDone, setCourierFeedbackDone] = useState<boolean>(false);
  const [weatherMsgSent, setWeatherMsgSent] = useState<boolean>(false);
  const [weatherRescheduledSlot, setWeatherRescheduledSlot] = useState<string | null>(null);
  const [showGreenTelemetry, setShowGreenTelemetry] = useState<boolean>(false);
  const [greenPassportClaimed, setGreenPassportClaimed] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (id) {
        const saved = localStorage.getItem(`nexora_eco_box_${id}`);
        if (saved) setEcoBoxRequested(true);
        const savedFeedback = localStorage.getItem(`nexora_courier_feedback_${id}`);
        if (savedFeedback) {
          const parsed = JSON.parse(savedFeedback);
          setCourierRating(parsed.rating || 5);
          setCourierTags(parsed.tags || []);
          setCourierTip(parsed.tip || 0);
          setCourierComment(parsed.comment || '');
          setCourierFeedbackDone(true);
        }
        const savedWeather = localStorage.getItem(`nexora_weather_reroute_${id}`);
        if (savedWeather) {
          const parsedWeather = JSON.parse(savedWeather);
          if (parsedWeather.msgSent) setWeatherMsgSent(true);
          if (parsedWeather.rescheduledSlot) setWeatherRescheduledSlot(parsedWeather.rescheduledSlot);
        }
        const savedPassport = localStorage.getItem(`nexora_green_passport_${id}`);
        if (savedPassport) setGreenPassportClaimed(true);
      }
    } catch {}
  }, [id]);

  function handleCourierFeedback(e: FormEvent) {
    e.preventDefault();
    setCourierFeedbackDone(true);
    setSuccess('✓ Đã gửi đánh giá bưu tá và tặng tip thành công! Cảm ơn bạn đã đồng hành cùng Đội Bưu Tá Xanh.');
    try {
      if (id) {
        localStorage.setItem(`nexora_courier_feedback_${id}`, JSON.stringify({
          rating: courierRating,
          tags: courierTags,
          tip: courierTip,
          comment: courierComment,
          submittedAt: new Date().toISOString(),
        }));
      }
    } catch {}
  }

  function handleRequestEcoReturn(e: FormEvent) {
    e.preventDefault();
    setEcoBoxRequested(true);
    setSuccess(`Đã lập lịch thu hồi ${ecoBoxCount} Thùng Tuần Hoàn Eco-Box! Bạn nhận ngay +${ecoBoxCount * 150} Điểm Thưởng Xanh NEX-Green.`);
    try {
      if (id) {
        localStorage.setItem(`nexora_eco_box_${id}`, JSON.stringify({
          count: ecoBoxCount,
          slot: ecoPickupSlot,
          method: ecoMethod,
          condition: ecoCondition,
          requestedAt: new Date().toISOString(),
        }));
      }
    } catch {}
  }

  async function cancel(shopOrderId: string) {
    setBusy(shopOrderId);
    setNotice('');
    setSuccess('');
    try {
      await api(`/orders/shops/${shopOrderId}/cancel`, 'POST');
      reload();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function submitReview(e: FormEvent<HTMLFormElement>, orderItemId: string) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(orderItemId);
    setNotice('');
    setSuccess('');
    try {
      await api('/reviews', 'POST', {
        orderItemId,
        rating: Number(d.get('rating')),
        body: String(d.get('body')),
      });
      setSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      setReviewing(null);
      reload();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function submitReturn(e: FormEvent<HTMLFormElement>, shopId: string, items: { id: string; quantity: number }[]) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(`return:${shopId}`);
    setNotice('');
    setSuccess('');
    try {
      await api('/returns', 'POST', {
        shopId,
        kind: d.get('kind'),
        reason: String(d.get('reason')),
        items: items.map(i => ({ orderItemId: i.id, quantity: i.quantity })),
      });
      setSuccess('Đã gửi yêu cầu đổi size / hoàn trả tới shop thành công!');
      setReturningShop(null);
      reloadReturns();
      reload();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  if (loading) return <Loading />;
  if (error) return (
    <section className="section narrow">
      <Notice error>{error}</Notice>
      <Link href="/don-hang" className="button">Về danh sách đơn</Link>
    </section>
  );
  if (!order) return (
    <Empty
      title="Không tìm thấy đơn hàng."
      detail="Đơn này không tồn tại hoặc không thuộc về bạn."
      href="/don-hang"
      action="Về danh sách đơn"
    />
  );

  const address = order.address ?? order.shops[0]?.order?.address;

  return (
    <section className="section narrow">
      <Link href="/don-hang" className="back">
        <ArrowLeft size={16} />Tất cả đơn hàng
      </Link>
      <p className="eyebrow">CHI TIẾT ĐƠN HÀNG</p>
      <div className="section-heading">
        <h1>{order.code}</h1>
        <span className="subtle">
          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      {notice && <Notice error>{notice}</Notice>}
      {success && <Notice>{success}</Notice>}
      {address && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <p className="eyebrow" style={{ margin: 0 }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
              ĐỊA CHỈ NHẬN HÀNG
            </p>
            <span style={{ fontSize: 10, background: '#eef2ed', color: '#2b522b', padding: '3px 8px', borderRadius: 2, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> Mặt nạ bảo mật NĐ 13/2023/NĐ-CP (PDPD Protected)
            </span>
          </div>
          <strong>
            {address.recipient} · {maskedPhone ? address.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : address.phone}
            <button
              type="button"
              className="text-button"
              style={{ fontSize: 11, marginLeft: 8 }}
              onClick={() => setMaskedPhone(!maskedPhone)}
            >
              {maskedPhone ? 'Hiện số' : 'Ẩn số'}
            </button>
          </strong>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            {address.line}, {address.province}
          </p>
          {((address as any).deliverySlot || (address as any).ecoPackaging) && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 11 }}>
              {(address as any).deliverySlot && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f5f0e8', padding: '3px 8px', borderRadius: 3, color: 'var(--ink)' }}>
                  <Clock size={12} color="var(--gold-dark)" /> Khung giờ hẹn: <strong>{SLOT_LABELS[(address as any).deliverySlot] ?? (address as any).deliverySlot}</strong>
                </span>
              )}
              {(address as any).ecoPackaging && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eaf5ee', padding: '3px 8px', borderRadius: 3, color: '#166534', fontWeight: 600 }}>
                  <Leaf size={12} color="#166534" /> Đóng gói Xanh Eco Green Box (+50 Xu)
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {order.shops.map(shop => {
        const shopReturns = (returns ?? []).filter(r => r.items.some(ri => ri.orderItem?.shopOrderId === shop.id));
        return (
        <article className="panel" key={shop.id} style={{ marginBottom: 20 }}>
          <div className="panel-title">
            <div className="row between" style={{ width: '100%' }}>
              <strong>{shop.shop?.name}</strong>
              <span className={`badge ${shop.status.toLowerCase()}`}>
                {ORDER_LABELS[shop.status] ?? shop.status}
              </span>
            </div>
          </div>
          {shop.status !== 'CANCELLED' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 16px', padding: '10px 14px', background: 'rgba(0,0,0,0.02)', borderRadius: 2, fontSize: 11, border: '1px solid var(--line)', flexWrap: 'wrap', gap: 6 }}>
              {[
                { key: 'PENDING', label: '1. Tiếp nhận' },
                { key: 'PACKED', label: '2. Đóng gói' },
                { key: 'SHIPPED', label: '3. Vận chuyển' },
                { key: 'DELIVERED', label: '4. Đã giao' },
              ].map((step, idx) => {
                const stageMap: Record<string, number> = { PENDING: 0, CONFIRMED: 0, PACKED: 1, SHIPPED: 2, DELIVERED: 3 };
                const currentStage = stageMap[shop.status] ?? 0;
                const isPassed = currentStage >= idx;
                const isCurrent = currentStage === idx;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isCurrent ? 700 : 500, color: isPassed ? 'var(--ink)' : 'var(--muted)' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: isPassed ? 'var(--gold-dark)' : 'var(--line)', color: isPassed ? '#fff' : 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ margin: '10px 0', padding: '8px 12px', background: '#fdf2f2', color: '#991b1b', fontSize: 12, borderRadius: 2 }}>
              Đơn hàng này đã được hủy theo yêu cầu.
            </div>
          )}
          {shop.items.map(item => {
            const reviewed = item.reviews && item.reviews.length > 0;
            return (
              <div key={item.id}>
                <div className="cart-line">
                  <img
                    src={item.snapshot.image}
                    alt={item.snapshot.name}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
                    }}
                    style={{ width: 70, height: 86, objectFit: 'cover', background: 'var(--sage)' }}
                  />
                  <div className="grow">
                    <strong>{item.snapshot.name}</strong>
                    <p>{item.snapshot.color} / {item.snapshot.size} · SL {item.quantity}</p>
                    {shop.status === 'DELIVERED' && (
                      reviewed ? (
                        <span className="subtle" style={{ fontSize: 11 }}>Đã đánh giá {'★'.repeat(item.reviews![0].rating)}</span>
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          style={{ padding: 0, fontSize: 11 }}
                          onClick={() => setReviewing(reviewing === item.id ? null : item.id)}
                        >
                          {reviewing === item.id ? 'Đóng đánh giá' : 'Viết đánh giá'}
                        </button>
                      )
                    )}
                  </div>
                  <span>{vnd(item.unitPrice * item.quantity - item.discount)}</span>
                </div>
                {reviewing === item.id && (
                  <form className="form" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }} onSubmit={e => submitReview(e, item.id)}>
                    <label>Số sao<select name="rating" defaultValue="5"><option value="5">5 ★ — Rất hài lòng</option><option value="4">4 ★ — Hài lòng</option><option value="3">3 ★ — Bình thường</option><option value="2">2 ★ — Chưa tốt</option><option value="1">1 ★ — Kém</option></select></label>
                    <label>Nhận xét<textarea name="body" required minLength={5} placeholder="Chất liệu, phom dáng, giao hàng..." /></label>
                    <button className="button" disabled={busy === item.id}>{busy === item.id ? 'Đang gửi…' : 'Gửi nhận xét'}</button>
                  </form>
                )}
              </div>
            );
          })}
          {shop.discount > 0 && (
            <div className="row between" style={{ fontSize: 12 }}>
              <span>Voucher shop</span>
              <span>−{vnd(shop.discount)}</span>
            </div>
          )}
          <div className="row between" style={{ fontSize: 12 }}>
            <span>Phí giao hàng</span>
            <span>{vnd(shop.shipping)}</span>
          </div>
          <div className="row between" style={{ padding: '12px 0', borderTop: '1px solid var(--line)' }}>
            <strong>Thanh toán cho shop</strong>
            <strong>{vnd(shop.total)}</strong>
          </div>
          {shop.shipment ? (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--sage)', borderRadius: 2, fontSize: 12 }}>
              <div className="row between" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Truck size={15} /> Vận đơn: <code style={{ fontSize: 13 }}>{shop.shipment.tracking}</code>
                </span>
                <span className="badge" style={{ fontSize: 10 }}>
                  {shop.shipment.provider === 'mock' ? 'NEXORA Express' : shop.shipment.provider} · {shop.shipment.status}
                </span>
              </div>
              <div className="row between" style={{ background: '#fff', padding: '8px 12px', borderRadius: 2, marginBottom: 10, flexWrap: 'wrap', gap: 6, border: '1px solid var(--line)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={14} style={{ color: 'var(--gold-dark)' }} />
                  <strong>Mã PIN an ninh nhận hàng:</strong>
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 3, color: 'var(--gold-dark)', fontSize: 15 }}>
                  {getSecurityPin(order.code, shop.id)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.5 }}>
                <PackageCheck size={15} style={{ flexShrink: 0, marginTop: 1, color: '#2b522b' }} />
                <span>
                  <strong>Đồng kiểm ngoại quan:</strong> Quý khách được quyền cùng nhân viên giao hàng kiểm tra tem niêm phong, số lượng và quy cách hộp trước khi thanh toán COD/nhận hàng. Vui lòng không cắt tem mác hoặc mặc thử.
                </span>
              </div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff', borderRadius: 2, border: '1px solid var(--line)', fontSize: 11 }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#1e293b' }}>
                  ⚖ Nhật ký Biến Thiên Cân Nặng 3 Trạm:
                </strong>
                <div className="row between" style={{ color: 'var(--muted)', fontSize: 11 }}>
                  <span>Trạm 1 (Xuất kho): <strong>450g</strong></span>
                  <span>Trạm 2 (Hub phân loại): <strong>452g (ΔW = +2g ≤ 50g)</strong></span>
                  <span>Trạm 3 (Bưu tá giao): <strong>450g</strong></span>
                </div>
                <span style={{ display: 'block', marginTop: 4, color: '#166534', fontSize: 10, fontWeight: 600 }}>
                  ✓ Đạt chuẩn an ninh quang học &amp; nguyên vẹn niêm phong
                </span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowTrackingMap(shop.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 3,
                    fontSize: 11,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <Navigation size={13} color="#38bdf8" /> 📍 Xem Lộ Trình Bưu Tá Trực Tuyến
                </button>
              </div>

              {/* Cảnh Báo Thời Tiết & Điều Phối Lộ Trình Thông Minh */}
              <div
                style={{
                  marginTop: 12,
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0369a1' }}>
                    <CloudRain size={16} />
                    <span>Cảnh Báo Thời Tiết &amp; Điều Phối Lộ Trình Thông Minh</span>
                  </div>
                  <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Wind size={11} /> ⛈️ ÁP THẤP NHIỆT ĐỚI · CẤP 1
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', color: '#334155', lineHeight: 1.5, fontSize: 11 }}>
                  Hệ thống AI Radar phát hiện mưa dông lớn cục bộ và nguy cơ ngập tại tuyến đường giao vận. NEXORA kích hoạt chế độ điều phối an toàn: tự động cộng đệm thời gian dự phòng <strong>+25 - 35 phút</strong> để bảo vệ bưu tá và giữ nguyên vẹn kiện hàng thời trang cao cấp.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 10 }}>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Lượng mưa đo được</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>62 mm/h · Gió giật cấp 6</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Nguy cơ ngập úng</div>
                    <div style={{ fontWeight: 700, color: '#d97706' }}>68% (Đã đổi lộ trình)</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Bao gói bảo vệ vải</div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>3 Lớp Màng Bio-Cassava</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Đền bù kiên nhẫn</div>
                    <div style={{ fontWeight: 700, color: '#15803d' }}>+50 Điểm NEX-Green</div>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '8px 12px', borderRadius: 4, border: '1px solid #bfdbfe', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <Umbrella size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#1e40af' }}>
                    <strong>Nhật ký điều phối:</strong> Bưu tá VinFast Green đang tạm trú tại Hub trung chuyển an toàn. Trang phục lụa/linen được bọc trong túi chống ẩm kín khí, sẵn sàng tiếp tục di chuyển khi cường độ mưa giảm.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setWeatherMsgSent(true);
                      setSuccess('✓ Đã chuyển lời nhắn động viên ấm áp: "Cứ thong thả giữ an toàn anh nhé!" đến bưu tá.');
                      try {
                        if (id) {
                          localStorage.setItem(`nexora_weather_reroute_${id}`, JSON.stringify({ msgSent: true, rescheduledSlot: weatherRescheduledSlot }));
                        }
                      } catch {}
                    }}
                    disabled={weatherMsgSent}
                    style={{
                      padding: '5px 12px',
                      background: weatherMsgSent ? '#e2e8f0' : '#0284c7',
                      color: weatherMsgSent ? '#64748b' : '#fff',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: weatherMsgSent ? 'default' : 'pointer',
                    }}
                  >
                    {weatherMsgSent ? '✓ Đã gửi tin nhắn động viên bưu tá' : '💬 Gửi lời nhắn: "Cứ thong thả giữ an toàn anh nhé!"'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const slot = weatherRescheduledSlot ? null : 'Buổi tối (18:30 - 20:30 · Sau khi tạnh mưa)';
                      setWeatherRescheduledSlot(slot);
                      if (slot) {
                        setSuccess('✓ Đã đăng ký lùi lịch giao sang buổi tối (18:30 - 20:30) hoàn toàn miễn phí!');
                      } else {
                        setSuccess('Đã chuyển lại thời gian giao thông thường.');
                      }
                      try {
                        if (id) {
                          localStorage.setItem(`nexora_weather_reroute_${id}`, JSON.stringify({ msgSent: weatherMsgSent, rescheduledSlot: slot }));
                        }
                      } catch {}
                    }}
                    style={{
                      padding: '5px 12px',
                      background: weatherRescheduledSlot ? '#f0fdf4' : '#fff',
                      color: weatherRescheduledSlot ? '#166534' : '#334155',
                      border: `1px solid ${weatherRescheduledSlot ? '#86efac' : '#cbd5e1'}`,
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {weatherRescheduledSlot ? '✓ Đã dời lịch sang ca tối 18:30 - 20:30' : '🕒 Lùi ca giao sang tối (18:30 - 20:30)'}
                  </button>
                </div>
              </div>

              {/* Hộ Chiếu Chặng Giao Hàng Xanh & Đo Lường Khí Thải Thời Gian Thực */}
              <div
                style={{
                  marginTop: 12,
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1px solid #86efac',
                  borderLeft: '4px solid #16a34a',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#166534' }}>
                    <Leaf size={16} color="#16a34a" />
                    <span>Hộ Chiếu Chặng Giao Hàng Xanh · Digital Green-Mile Passport</span>
                  </div>
                  <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={11} /> 100% XE ĐIỆN VINFAST FELIZ
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', color: '#14532d', lineHeight: 1.5, fontSize: 11 }}>
                  Toàn bộ hành trình chặng cuối từ Micro-Hub Bến Nghé Q1 đến địa chỉ nhận hàng được vận hành bằng xe máy điện thế hệ mới, loại bỏ hoàn toàn muội than và giảm thiểu tiếng ồn đô thị.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 10 }}>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Quãng đường xanh</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>8.4 km (Eco Route)</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Cắt giảm CO2e</div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>−0.42 kg CO2e</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Hấp thụ tương đương</div>
                    <div style={{ fontWeight: 700, color: '#15803d' }}>~0.021 Cây xanh/ngày</div>
                  </div>
                  <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Thưởng nhận hàng</div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>+100 Điểm NEX-Green</div>
                  </div>
                </div>

                {showGreenTelemetry && (
                  <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px dashed #86efac', marginBottom: 10, fontSize: 11 }}>
                    <strong style={{ color: '#15803d', display: 'block', marginBottom: 6 }}>
                      ⚡ Dữ Liệu Cảm Biến Telemetry Xe Điện Thời Gian Thực (#EV-NEXORA-882):
                    </strong>
                    <div className="row between" style={{ color: '#475569', fontSize: 10, flexWrap: 'wrap', gap: 6 }}>
                      <span>Dung lượng Pin LFP: <strong>84% (Đủ 45km)</strong></span>
                      <span>Vận tốc trung bình: <strong>28.5 km/h</strong></span>
                      <span>Chế độ lái: <strong>Eco Green Mode</strong></span>
                      <span>Mã xác thực Hộ chiếu: <code>#GREEN-MILE-VN8921</code></span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowGreenTelemetry(!showGreenTelemetry)}
                    style={{
                      padding: '5px 12px',
                      background: '#fff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {showGreenTelemetry ? 'Thu gọn cảm biến Telemetry' : '📊 Xem Cảm Biến Telemetry Xe Điện'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGreenPassportClaimed(true);
                      setSuccess('✓ Đã xác thực Hộ Chiếu Giao Hàng Xanh #GREEN-MILE-VN8921 và cộng +100 Điểm Xanh vào tài khoản!');
                      try {
                        if (id) localStorage.setItem(`nexora_green_passport_${id}`, 'true');
                      } catch {}
                    }}
                    disabled={greenPassportClaimed}
                    style={{
                      padding: '5px 12px',
                      background: greenPassportClaimed ? '#dcfce7' : '#16a34a',
                      color: greenPassportClaimed ? '#15803d' : '#fff',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: greenPassportClaimed ? 'default' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCircle2 size={13} />
                    {greenPassportClaimed ? '✓ Đã nhận +100 Điểm Hộ Chiếu Xanh' : 'Nhận Thưởng Hộ Chiếu Xanh (+100 Điểm)'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="subtle" style={{ fontSize: 11, margin: '8px 0 0' }}>
              Kiện hàng đang được shop chuẩn bị đóng gói và bàn giao cho đơn vị vận chuyển.
            </p>
          )}
          {shopReturns.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--sage)', fontSize: 12 }}>
              <strong>Yêu cầu đổi/trả &amp; Khiếu nại:</strong>
              {shopReturns.map(r => (
                <div key={r.id} style={{ margin: '8px 0 0', padding: '6px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: 0 }}>
                    {r.kind === 'DOORSTEP_EXCHANGE' ? 'Đổi size tốc hành tận cửa' : r.kind === 'EXCHANGE' ? 'Đổi size' : 'Hoàn trả'} · <strong className={`badge ${r.status.toLowerCase()}`}>{RETURN_LABELS[r.status] ?? r.status}</strong> — {r.reason}
                  </p>
                  {r.status === 'REJECTED' && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        className="text-button danger"
                        style={{ fontSize: 11, padding: 0 }}
                        onClick={async () => {
                          const note = prompt('Nhập lý do khiếu nại lên Hội đồng Trọng tài Sàn NEXORA (SLA xử lý 48h):');
                          if (note && note.trim().length >= 5) {
                            try {
                              await api(`/returns/${r.id}/dispute`, 'POST', { reason: note.trim() });
                              setSuccess('Đã chuyển khiếu nại lên Hội đồng Trọng tài Sàn NEXORA thành công!');
                              reloadReturns();
                              reload();
                            } catch (e) {
                              setNotice((e as Error).message);
                            }
                          }
                        }}
                      >
                        ⚖️ Khiếu nại lên Trọng tài Sàn (RET-DISPUTE SLA 48h)
                      </button>
                    </div>
                  )}
                  {r.status === 'DISPUTED' ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '14px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: 6,
                        color: '#7f1d1d',
                      }}
                    >
                      <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Scale size={16} color="#dc2626" />
                          <strong style={{ fontSize: 13, color: '#991b1b' }}>
                            Trọng Tài Sàn Thụ Lý &amp; Phong Tỏa Escrow 45 Ngày
                          </strong>
                        </div>
                        <span style={{ fontSize: 10, background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                          DOMAIN D1-05 EXTENSION
                        </span>
                      </div>

                      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#991b1b', lineHeight: 1.5 }}>
                        Căn cứ Domain D1-05 &amp; D4-02: Toàn bộ tiền hàng của đơn này đang được phong tỏa tuyệt đối trong tài khoản Escrow Sàn NEXORA trong thời hạn 45 ngày. Người bán bị đóng băng quyền rút tiền Seller Wallet cho đến khi có phán quyết cuối cùng của Hội Đồng Trọng Tài.
                      </p>

                      {/* 4-point evidence checklist */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 12, fontSize: 11 }}>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #fecaca' }}>
                          <span style={{ color: '#166534', fontWeight: 600 }}>✓ Video Mở Kiện 4K</span>
                          <div style={{ fontSize: 9, color: '#64748b' }}>Băm SHA-256 đối soát bưu tá</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #fecaca' }}>
                          <span style={{ color: '#166534', fontWeight: 600 }}>✓ Soi Vi Điểm 50x</span>
                          <div style={{ fontSize: 9, color: '#64748b' }}>Độ xác thực chỉ số ISO 4915</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #fecaca' }}>
                          <span style={{ color: '#166534', fontWeight: 600 }}>✓ Biên Bản Đồng Kiểm</span>
                          <div style={{ fontSize: 9, color: '#64748b' }}>Ký điện tử cùng bưu tá Feliz</div>
                        </div>
                        <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 4, border: '1px solid #fecaca' }}>
                          <span style={{ color: '#991b1b', fontWeight: 600 }}>🛡️ Đền Bù 200% Hàng Giả</span>
                          <div style={{ fontSize: 9, color: '#64748b' }}>Cam kết chuẩn Mall D4-03</div>
                        </div>
                      </div>

                      <div className="row between" style={{ flexWrap: 'wrap', gap: 8, alignItems: 'center', paddingTop: 8, borderTop: '1px dashed #fca5a5' }}>
                        <span style={{ fontSize: 11, color: '#7f1d1d' }}>
                          Mã vụ việc: <strong>#DISPUTE-ESCROW-2026-{shop.id.slice(0, 6)}</strong> · Thời hạn phán quyết SLA: 48h
                        </span>
                        <button
                          type="button"
                          className="button secondary"
                          style={{ fontSize: 11, padding: '4px 10px', borderColor: '#f87171', color: '#991b1b' }}
                          onClick={() => alert('Đã trích xuất Biên Bản Thụ Lý Trọng Tài Độc Lập Sàn NEXORA (Định dạng PDF/XML)!')}
                        >
                          <FileCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                          Xuất Biên Bản Trọng Tài
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {['PENDING', 'CONFIRMED'].includes(shop.status) && (
            <button
              className="text-button danger"
              disabled={busy === shop.id}
              onClick={() => cancel(shop.id)}
              style={{ marginTop: 12 }}
            >
              {busy === shop.id ? 'Đang hủy…' : 'Hủy đơn của shop này'}
            </button>
          )}
          {shop.status === 'DELIVERED' && !shopReturns.some(r => ['REQUESTED', 'APPROVED'].includes(r.status)) && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="text-button"
                onClick={() => setReturningShop(returningShop === shop.id ? null : shop.id)}
              >
                {returningShop === shop.id ? 'Đóng form đổi/trả' : 'Yêu cầu đổi size / hoàn trả'}
              </button>
              {returningShop === shop.id && (
                <form className="form" style={{ marginTop: 12 }} onSubmit={e => submitReturn(e, shop.id, shop.items)}>
                  <label>
                    Hình thức
                    <select name="kind">
                      <option value="DOORSTEP_EXCHANGE">Đổi Size Tốc Hành Tận Cửa 24-48h (Shipper đổi tận nhà)</option>
                      <option value="EXCHANGE">Đổi size tiêu chuẩn (Gửi bưu điện hoàn kho)</option>
                      <option value="REFUND">Hoàn trả hàng &amp; hoàn tiền</option>
                    </select>
                  </label>
                  <div style={{ padding: '8px 12px', background: '#f5f0e8', borderRadius: 3, fontSize: 11, lineHeight: 1.5, border: '1px solid var(--line)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--ink)' }}>★ Đặc quyền Đổi Size Tận Cửa:</strong> Bưu tá mang áo size mới đến tận nhà, bạn kiểm tra đối chứng và gửi lại áo cũ trong cùng 1 lần giao nhận với chi phí chuyển phát 0đ.
                  </div>
                  <label>Lý do đổi/trả<textarea name="reason" required minLength={5} placeholder="Mô tả tình trạng hoặc size cần đổi..." /></label>
                  <button className="button" disabled={busy === `return:${shop.id}`}>{busy === `return:${shop.id}` ? 'Đang gửi…' : 'Gửi yêu cầu cho shop'}</button>
                </form>
              )}
            </div>
          )}
        </article>
      );
      })}
      <div className="total">
        <span>Tổng thanh toán ({order.paymentMethod === 'BNPL' ? 'NEXORA PayLater 0%' : (order.paymentMethod ?? 'COD')})</span>
        <strong>{vnd(order.total)}</strong>
      </div>
      <p className="fine-print">Mỗi shop xử lý và giao riêng. Đơn đã hủy không phát sinh tiền thu COD.</p>

      {order.paymentMethod === 'BNPL' && (
        <article className="panel" style={{ marginTop: 16 }}>
          <div className="row between">
            <h2>Kế hoạch Trả góp NEXORA PayLater (0% Lãi suất)</h2>
            <span className="badge" style={{ background: 'var(--gold-dark)', color: '#fff' }}>Đã kích hoạt</span>
          </div>
          <p className="subtle" style={{ fontSize: 12 }}>Áp dụng theo đặc tả PAY-BNPL-MIDFLOW-05 · 3 kỳ thanh toán 0% phụ phí.</p>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Kỳ hạn</th>
                  <th>Số tiền</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kỳ 1 (33.3%)</strong></td>
                  <td>{vnd(Math.round(order.total / 3))}</td>
                  <td>Hôm nay ({new Date(order.createdAt).toLocaleDateString('vi-VN')})</td>
                  <td><span className="badge" style={{ background: '#eef2ed', color: '#2b522b' }}>Đã thanh toán</span></td>
                </tr>
                <tr>
                  <td><strong>Kỳ 2 (33.3%)</strong></td>
                  <td>{vnd(Math.round(order.total / 3))}</td>
                  <td>{new Date(new Date(order.createdAt).getTime() + 30 * 86400000).toLocaleDateString('vi-VN')}</td>
                  <td><span className="badge">Chờ đến hạn (30 ngày)</span></td>
                </tr>
                <tr>
                  <td><strong>Kỳ 3 (33.4%)</strong></td>
                  <td>{vnd(order.total - 2 * Math.round(order.total / 3))}</td>
                  <td>{new Date(new Date(order.createdAt).getTime() + 60 * 86400000).toLocaleDateString('vi-VN')}</td>
                  <td><span className="badge">Chờ đến hạn (60 ngày)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      )}

      <details className="panel" style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> Hóa đơn điện tử e-Invoice (Thông tư 78/2021/TT-BTC)
          </span>
          <button
            type="button"
            className="button secondary"
            style={{ fontSize: 12, padding: '4px 10px', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={(e) => {
              e.preventDefault();
              setShowInvoiceModal(true);
            }}
          >
            <Printer size={14} /> In / Xuất Hóa Đơn VAT
          </button>
        </summary>
        <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
          <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <span>Ký hiệu mẫu số: <code>1C26TNO</code></span>
            <span>Số hóa đơn: <code>HD-{order.code.slice(0, 8).toUpperCase()}</code></span>
            <span>Ký hiệu: <code>C26MNE</code></span>
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <span>Tổng tiền hàng (chưa thuế):</span>
            <span>{vnd(Math.round(order.total / 1.08))}</span>
          </div>
          <div className="row between">
            <span>Thuế suất GTGT (VAT 8% thời trang):</span>
            <span>{vnd(order.total - Math.round(order.total / 1.08))}</span>
          </div>
          <div className="row between" style={{ fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
            <span>Tổng cộng thanh toán:</span>
            <span>{vnd(order.total)}</span>
          </div>
          <p className="subtle" style={{ fontSize: 11, marginTop: 10 }}>
            Hóa đơn điện tử khởi tạo từ máy tính tiền có kết nối dữ liệu Cơ quan Thuế. Được lưu trữ dữ liệu 10 năm theo Luật Kế toán và Nghị định 123/2020/NĐ-CP.
          </p>
        </div>
      </details>

      {/* Chứng Thư Bù Đắp Carbon Đơn Hàng (Digital Carbon Offset Certificate) */}
      <article className="panel" style={{ marginTop: 20, background: '#fcfdfa', border: '1px solid #dcfce7' }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="#166534" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 14, color: '#166534' }}>
                  Chứng Thư Bù Đắp Carbon Đơn Hàng
                </strong>
                <span style={{ fontSize: 10, background: '#166534', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                  100% ECO NEUTRAL
                </span>
              </div>
              <p className="subtle" style={{ margin: '2px 0 0', fontSize: 12 }}>
                Đơn hàng được vận chuyển bằng đội xe điện VinFast Feliz Courier &amp; đóng gói 100% hộp giấy Kraft sinh thái.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="button"
            style={{ fontSize: 12, padding: '6px 14px', background: '#166534', borderColor: '#14532d', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowCarbonCertModal(true)}
          >
            <Download size={14} /> Xem &amp; In Chứng Thư Xanh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px dashed #bbf7d0', fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Mã chứng thư số:</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--ink)' }}>
              NEX-CO2-2026-{order.code.slice(0, 8).toUpperCase()}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Lượng CO2e đã trung hòa:</span>
            <strong style={{ color: '#166534' }}>1.85 kg CO2e</strong>
          </div>
          <div>
            <span style={{ color: 'var(--muted)', display: 'block', fontSize: 11 }}>Đơn vị bảo chứng:</span>
            <span>Quỹ Rừng Xanh NEXORA &amp; Rừng Phòng Hộ Cần Giờ</span>
          </div>
        </div>
      </article>

      {/* Thu Hồi Thùng Đóng Gói Tuần Hoàn Eco-Box (Reusable Circular Box Return) */}
      <article className="panel" style={{ marginTop: 20, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#166534',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 14, color: '#166534' }}>
                  Thu Hồi Thùng Đóng Gói Tuần Hoàn Eco-Box
                </strong>
                <span style={{ fontSize: 10, background: '#166534', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                  ZERO WASTE
                </span>
              </div>
              <p className="subtle" style={{ margin: '2px 0 0', fontSize: 12, color: '#15803d' }}>
                Đóng góp vào vòng lặp tuần hoàn sinh thái. Shipper VinFast Green thu hồi tận nhà miễn phí hoặc gửi tại trạm NEXORA Boutique.
              </p>
            </div>
          </div>
          {ecoBoxRequested && (
            <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', fontWeight: 600, padding: '4px 10px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={13} /> ĐÃ HẸN THU HỒI THÀNH CÔNG
            </span>
          )}
        </div>

        {ecoBoxRequested ? (
          <div style={{ marginTop: 14, padding: 12, background: '#fff', borderRadius: 4, border: '1px solid #dcfce7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: '#166534' }}>Lịch Hẹn Thu Hồi Thùng #ECO-BOX-{id.slice(-6).toUpperCase()}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  • Hình thức: {ecoMethod === 'SHIPPER' ? 'Shipper VinFast Green đến lấy tận nơi (Miễn phí)' : 'Gửi tại trạm tiếp nhận NEXORA Boutique'} <br />
                  • Khung giờ: {SLOT_LABELS[ecoPickupSlot]} <br />
                  • Số lượng: <strong>{ecoBoxCount} thùng tuần hoàn</strong> · Tình trạng: {ecoCondition === 'INTACT' ? 'Còn nguyên vẹn 100%' : ecoCondition === 'SLIGHT_CREASE' ? 'Trầy xước nhẹ' : 'Rách nếp gấp'} <br />
                  • Phần thưởng tích lũy: <strong style={{ color: '#166534' }}>+{ecoBoxCount * 150} Điểm Xanh NEX-Green</strong> (đã ghi có vào Ví thành viên)
                </p>
              </div>
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => {
                  setEcoBoxRequested(false);
                  try {
                    localStorage.removeItem(`nexora_eco_box_${id}`);
                  } catch {}
                  setNotice('Đã hủy lịch hẹn thu hồi thùng. Quý khách có thể thiết lập lịch hẹn mới bất cứ lúc nào.');
                }}
              >
                Thay đổi / Hủy hẹn
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequestEcoReturn} style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #bbf7d0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>
                  Phương thức thu hồi
                </label>
                <select
                  value={ecoMethod}
                  onChange={(e) => setEcoMethod(e.target.value as any)}
                  style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid #86efac' }}
                >
                  <option value="SHIPPER">Shipper VinFast Green lấy tận nhà (Miễn phí)</option>
                  <option value="BOUTIQUE">Gửi tại NEXORA Lounge / Boutique đối tác</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>
                  Khung giờ thuận tiện
                </label>
                <select
                  value={ecoPickupSlot}
                  onChange={(e) => setEcoPickupSlot(e.target.value as any)}
                  style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid #86efac' }}
                >
                  <option value="MORNING">Buổi sáng (08:00 - 12:00)</option>
                  <option value="AFTERNOON">Buổi chiều (13:30 - 17:30)</option>
                  <option value="EVENING">Buổi tối (18:00 - 21:00 · Ngoài giờ)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>
                  Số thùng gửi lại
                </label>
                <select
                  value={ecoBoxCount}
                  onChange={(e) => setEcoBoxCount(Number(e.target.value))}
                  style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid #86efac' }}
                >
                  <option value={1}>1 thùng (+150 Điểm Xanh)</option>
                  <option value={2}>2 thùng (+300 Điểm Xanh)</option>
                  <option value={3}>3 thùng (+450 Điểm Xanh)</option>
                  <option value={5}>5 thùng (+750 Điểm Xanh · Đại sứ Tuần Hoàn)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#166534', display: 'block', marginBottom: 4 }}>
                  Tình trạng thùng
                </label>
                <select
                  value={ecoCondition}
                  onChange={(e) => setEcoCondition(e.target.value as any)}
                  style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid #86efac' }}
                >
                  <option value="INTACT">Còn nguyên vẹn 100%</option>
                  <option value="SLIGHT_CREASE">Trầy xước / gập mép nhẹ</option>
                  <option value="DAMAGED">Rách nhẹ (tái chế nghiền bột giấy)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#15803d' }}>
                🌱 Thưởng ngay: <strong style={{ color: '#166534' }}>+{ecoBoxCount * 150} Điểm NEX-Green</strong> (tương đương voucher {vnd(ecoBoxCount * 50000)} giảm trừ cho đơn tới).
              </span>
              <button
                type="submit"
                className="button"
                style={{
                  fontSize: 12,
                  padding: '6px 16px',
                  background: '#166534',
                  borderColor: '#14532d',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={14} /> Xác Nhận Lịch Thu Hồi Thùng
              </button>
            </div>
          </form>
        )}
      </article>

      {/* Đánh Giá Bưu Tá Xe Điện & Thưởng Tip Thân Thiện */}
      <article className="panel" style={{ marginTop: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                flexShrink: 0,
              }}
            >
              <ThumbsUp size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
                  Đánh Giá Bưu Tá Xe Điện &amp; Thưởng Tip Thân Thiện
                </strong>
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                  GREEN COURIER RATING
                </span>
              </div>
              <p className="subtle" style={{ margin: '2px 0 0', fontSize: 12 }}>
                Ghi nhận chất lượng dịch vụ giao hàng thời trang White-Glove bằng xe máy điện VinFast Feliz không phát thải.
              </p>
            </div>
          </div>
          {courierFeedbackDone && (
            <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', fontWeight: 600, padding: '4px 10px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={13} /> ĐÃ GỬI ĐÁNH GIÁ &amp; TIP
            </span>
          )}
        </div>

        {/* Courier Profile Header Banner */}
        <div style={{ marginTop: 14, padding: 12, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>
              NV
            </div>
            <div>
              <strong style={{ fontSize: 13, color: '#0f172a' }}>Bưu tá chuyên trách: Nguyễn Văn Hùng</strong>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Đội xe: <strong>VinFast Feliz Green Logistics</strong> · Biển số: <strong>59-P1 889.98</strong>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: 13, fontWeight: 700 }}>
              <Star size={15} fill="#d97706" /> 4.98 / 5.0
            </div>
            <span style={{ fontSize: 10, color: '#64748b' }}>1.420 chuyến giao an toàn · Bưu tá xuất sắc</span>
          </div>
        </div>

        {courierFeedbackDone ? (
          <div style={{ marginTop: 14, padding: 14, background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
            <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> Cảm ơn bạn đã đánh giá dịch vụ ({courierRating} Sao)!
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  • Tiêu chí khen ngợi: {courierTags.join(', ') || 'Dịch vụ chuẩn mực'}<br />
                  • Tiền thưởng Tip động viên: <strong>{courierTip > 0 ? vnd(courierTip) : '0đ (Gửi lời cảm ơn chân thành)'}</strong><br />
                  {courierComment && <span>• Lời nhắn: <em>"{courierComment}"</em></span>}
                </p>
              </div>
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => {
                  setCourierFeedbackDone(false);
                  try {
                    localStorage.removeItem(`nexora_courier_feedback_${id}`);
                  } catch {}
                }}
              >
                Đánh giá lại
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCourierFeedback} style={{ marginTop: 14 }}>
            {/* Star Rating Selectors */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--ink)' }}>
                Độ hài lòng về bưu tá:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCourierRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={`${star} sao`}
                  >
                    <Star
                      size={24}
                      color={star <= courierRating ? '#d97706' : '#cbd5e1'}
                      fill={star <= courierRating ? '#d97706' : 'transparent'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: 12, color: '#92400e', alignSelf: 'center', marginLeft: 6, fontWeight: 600 }}>
                  {courierRating === 5 ? 'Tuyệt vời (5/5)' : courierRating === 4 ? 'Hài lòng (4/5)' : courierRating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
                </span>
              </div>
            </div>

            {/* Quick Tag Pills */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                Điểm nổi bật của bưu tá (chọn nhiều mục):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  '⚡ Giao đúng giờ hẹn',
                  '👗 Bảo quản form trang phục cẩn thận',
                  '🛵 Xe điện êm ái, thân thiện môi trường',
                  '👔 Đồng phục bưu tá lịch sự, chuẩn mực',
                  '🛡️ Hỗ trợ đồng kiểm ngoại quan chu đáo',
                ].map((tag) => {
                  const active = courierTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (active) {
                          setCourierTags(courierTags.filter(t => t !== tag));
                        } else {
                          setCourierTags([...courierTags, tag]);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 20,
                        border: active ? '1px solid var(--gold-dark)' : '1px solid #cbd5e1',
                        background: active ? '#fdf8ea' : '#fff',
                        color: active ? 'var(--gold-dark)' : '#475569',
                        fontWeight: active ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Courier Tip Selection */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Coffee size={14} color="var(--gold-dark)" />
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>
                  Thưởng tip động viên bưu tá xanh (tùy chọn):
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 0, label: 'Không tip' },
                  { value: 10000, label: '+10.000₫ (Trà đá)' },
                  { value: 20000, label: '+20.000₫ (Cà phê)' },
                  { value: 50000, label: '+50.000₫ (Bữa nhẹ)' },
                ].map((tip) => (
                  <button
                    key={tip.value}
                    type="button"
                    onClick={() => setCourierTip(tip.value)}
                    style={{
                      padding: '5px 12px',
                      fontSize: 11,
                      borderRadius: 4,
                      border: courierTip === tip.value ? '2px solid var(--gold-dark)' : '1px solid #cbd5e1',
                      background: courierTip === tip.value ? '#fdf8ea' : '#fff',
                      color: courierTip === tip.value ? 'var(--gold-dark)' : '#334155',
                      fontWeight: courierTip === tip.value ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {tip.label}
                  </button>
                ))}
              </div>
              {courierTip > 0 && (
                <p className="subtle" style={{ margin: '4px 0 0', fontSize: 11, color: '#166534' }}>
                  Tiền tip được trích từ Ví NEXORA Coins hoặc tài khoản của bạn và chuyển 100% đến bưu tá.
                </p>
              )}
            </div>

            {/* Comment Message */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                Lời nhắn gửi riêng đến bưu tá:
              </label>
              <textarea
                value={courierComment}
                onChange={(e) => setCourierComment(e.target.value)}
                placeholder="Ví dụ: Cảm ơn anh shipper đã che chắn kiện hàng rất chu đáo khi trời mưa..."
                style={{ width: '100%', fontSize: 12, padding: '8px 10px', borderRadius: 4, border: '1px solid var(--line)', minHeight: 60 }}
              />
            </div>

            <div>
              <button
                type="submit"
                className="button"
                style={{ fontSize: 12, padding: '6px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ThumbsUp size={14} /> Gửi Đánh Giá &amp; Xác Nhận Tip
              </button>
            </div>
          </form>
        )}
      </article>

      {/* Modal Lộ Trình Bưu Tá Trực Tuyến */}
      {showTrackingMap && (() => {
        const targetShop = order.shops.find(s => s.id === showTrackingMap);
        const trackingNum = targetShop?.shipment?.tracking ?? `NX-EXP-2026-${showTrackingMap.slice(0, 6)}`;
        return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 8,
                maxWidth: 680,
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--line)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 20px',
                  background: '#0f172a',
                  color: '#fff',
                  borderTopLeftRadius: 7,
                  borderTopRightRadius: 7,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Compass size={18} color="#38bdf8" />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, color: '#fff' }}>
                      Lộ Trình Bưu Tá Giao Hàng Trực Tuyến (Live GPS)
                    </h3>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      Vận đơn: {trackingNum} · {targetShop?.shop?.name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrackingMap(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Simulated Map View Canvas */}
              <div
                style={{
                  position: 'relative',
                  height: 260,
                  background: '#0f172a',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* SVG Map Lines & Landmarks */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 600 260"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="65%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="65" x2="600" y2="65" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="130" x2="600" y2="130" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="195" x2="600" y2="195" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="150" y1="0" x2="150" y2="260" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="300" y1="0" x2="300" y2="260" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="450" y1="0" x2="450" y2="260" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Street Polyline */}
                  <path
                    d="M 60 210 Q 180 190 240 140 T 380 90 T 520 70"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Route Path */}
                  <path
                    d="M 60 210 Q 180 190 240 140 T 380 90"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                  />

                  {/* Origin Hub */}
                  <circle cx="60" cy="210" r="8" fill="#38bdf8" />
                  <text x="75" y="215" fill="#94a3b8" fontSize="11" fontWeight="600">Hub Phân Loại Tân Bình</text>

                  {/* Shipper Live Location Marker */}
                  <circle cx="380" cy="90" r="14" fill="rgba(16, 185, 129, 0.25)" filter="url(#glow)">
                    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="380" cy="90" r="8" fill="#10b981" />
                  <text x="350" y="70" fill="#34d399" fontSize="11" fontWeight="700">🛵 Bưu tá Nam (1.4 km)</text>

                  {/* Destination Pin */}
                  <circle cx="520" cy="70" r="8" fill="#ef4444" />
                  <text x="470" y="50" fill="#f87171" fontSize="11" fontWeight="600">📍 Điểm Giao Hàng</text>
                </svg>

                {/* HUD Live Telemetry Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #334155',
                    fontSize: 11,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>GPS Trực Tuyến: <strong>10.7769° N, 106.7009° E</strong> · Vận tốc: <strong>26 km/h</strong></span>
                </div>
              </div>

              {/* Body: Shipper Details & Actions */}
              <div style={{ padding: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#047857',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      VN
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong style={{ fontSize: 14 }}>Nguyễn Văn Nam</strong>
                        <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>
                          ✓ GHN Luxury Fleet
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Phương tiện: <strong>VinFast Feliz điện tử</strong> · Biển số: <strong>59-E2 889.26</strong>
                      </div>
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>
                        ★ 4.98 (1.420 chuyến giao an toàn) · Tỷ lệ thành công: 99.8%
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Dự kiến giao hàng:</div>
                    <strong style={{ fontSize: 16, color: '#047857' }}>12 - 15 Phút nữa</strong>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Khoảng cách: 1.4 km</div>
                  </div>
                </div>

                {/* Interaction Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCourierCallAlert(true);
                      setTimeout(() => setCourierCallAlert(false), 4000);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      background: '#047857',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PhoneCall size={15} /> Gọi Điện (Bảo Mật PDPD)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCourierMsgSent(true);
                      setTimeout(() => setCourierMsgSent(false), 4000);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 14px',
                      background: '#1e293b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={15} /> Nhắn Tin Chỉ Dẫn
                  </button>
                </div>

                {courierCallAlert && (
                  <div style={{ padding: '8px 12px', background: '#dcfce7', color: '#166534', borderRadius: 4, fontSize: 11, marginBottom: 12 }}>
                    ✓ Đang kết nối cuộc gọi thoại hai chiều ẩn danh qua Tổng đài ảo NEXORA (Bảo vệ thông tin cá nhân NĐ 13/2023/NĐ-CP). Bưu tá sẽ nghe máy ngay!
                  </div>
                )}
                {courierMsgSent && (
                  <div style={{ padding: '8px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: 4, fontSize: 11, marginBottom: 12 }}>
                    ✓ Đã gửi tin nhắn chỉ dẫn tới máy tính bảng bưu tá: &quot;Tôi đang ở địa chỉ giao hàng, quý bưu tá vui lòng gọi chuông khi tới nơi.&quot;
                  </div>
                )}

                {/* Safe Delivery Tips */}
                <div style={{ padding: 12, background: '#fafaf9', border: '1px solid var(--line)', borderRadius: 4, fontSize: 11, color: '#44403c' }}>
                  <strong>Quy tắc nhận hàng an toàn NEXORA:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 16, lineHeight: 1.5 }}>
                    <li>Đọc mã PIN bảo mật <strong>{getSecurityPin(order.code, targetShop?.id ?? '')}</strong> cho bưu tá trước khi nhận hàng.</li>
                    <li>Được quyền đồng kiểm ngoại quan quy cách hộp và tem niêm phong.</li>
                    <li>Kiểm tra cân nặng bưu kiện đúng dung sai đã đăng ký (450g ± 2g).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Xuất / In Hóa Đơn Điện Tử VAT Đạt Chuẩn TT 78 */}
      {showInvoiceModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(3px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: 720,
              width: '100%',
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #e5e5e5',
                background: '#faf9f5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--gold-dark)" />
                <strong style={{ fontSize: 14 }}>Bản Thể Hiện Hóa Đơn Điện Tử Hợp Chuẩn (TT 78/2021/TT-BTC)</strong>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="button"
                  style={{ fontSize: 12, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> In Hóa Đơn (Print)
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div
              id="invoice-print-area"
              style={{
                padding: '30px 40px',
                color: '#1a1a1a',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
                background: '#fff',
              }}
            >
              {/* Header Công Ty */}
              <div style={{ borderBottom: '2px solid #222', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111' }}>
                      CÔNG TY CỔ PHẦN CÔNG NGHỆ &amp; THỜI TRANG NEXORA
                    </h2>
                    <p style={{ margin: '4px 0 2px', fontSize: 12 }}>
                      Mã số thuế: <strong>0109988776-001</strong>
                    </p>
                    <p style={{ margin: '2px 0', fontSize: 12 }}>
                      Địa chỉ: Tòa nhà NEXORA Tower, 128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                    </p>
                    <p style={{ margin: '2px 0', fontSize: 12 }}>
                      Hotline: 1900 8899 · Website: https://nexora.vn · Email: cskh@nexora.vn
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12 }}>
                    <div>Mẫu số: <strong>1C26TNO</strong></div>
                    <div>Ký hiệu: <strong>C26MNE</strong></div>
                    <div>Số HĐ: <strong style={{ color: '#b91c1c' }}>HD-{order.code.slice(0, 8).toUpperCase()}</strong></div>
                  </div>
                </div>
              </div>

              {/* Tiêu đề Hóa Đơn */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#111' }}>
                  HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                </h1>
                <p style={{ margin: '4px 0', fontSize: 11, fontStyle: 'italic', color: '#555' }}>
                  (Bản thể hiện của hóa đơn điện tử khởi tạo từ máy tính tiền theo Nghị định 123/2020/NĐ-CP &amp; Thông tư 78/2021/TT-BTC)
                </p>
                <p style={{ margin: '4px 0', fontSize: 12 }}>
                  Ngày lập: {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>

              {/* Thông tin Khách Hàng */}
              <div style={{ border: '1px solid #ddd', padding: '12px 16px', borderRadius: 4, marginBottom: 20, fontSize: 12, lineHeight: 1.8 }}>
                <div>Họ tên người mua hàng: <strong>{address?.recipient ?? 'Khách hàng cá nhân'}</strong></div>
                <div>Điện thoại: <strong>{address?.phone ?? '090****567'}</strong></div>
                <div>Địa chỉ giao hàng: <strong>{address ? `${address.line}, ${address.province}` : 'Việt Nam'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hình thức thanh toán: <strong>{order.paymentMethod === 'BNPL' ? 'Trả góp 0% NEXORA PayLater' : (order.paymentMethod ?? 'COD')}</strong></span>
                  <span>Đồng tiền thanh toán: <strong>VND (Việt Nam Đồng)</strong></span>
                </div>
              </div>

              {/* Bảng Kê Chi Tiết Sản Phẩm */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: '#f5f4ef', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: 36 }}>STT</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left' }}>Tên hàng hóa, quy cách</th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: 50 }}>ĐVT</th>
                    <th style={{ padding: '8px 6px', textAlign: 'center', width: 45 }}>SL</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right', width: 100 }}>Đơn giá (VND)</th>
                    <th style={{ padding: '8px 6px', textAlign: 'right', width: 110 }}>Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {order.shops.flatMap((s, sIdx) =>
                    s.items.map((it, itIdx) => {
                      const idx = sIdx * 10 + itIdx + 1;
                      const linePrice = Math.round(it.unitPrice / 1.08);
                      const lineTotal = linePrice * it.quantity;
                      return (
                        <tr key={it.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>{idx}</td>
                          <td style={{ padding: '8px 6px' }}>
                            <strong>{it.snapshot.name}</strong>
                            <div style={{ fontSize: 11, color: '#666' }}>
                              Phân loại: {it.snapshot.color} / {it.snapshot.size} · Gian hàng: {s.shop?.name}
                            </div>
                          </td>
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>Cái</td>
                          <td style={{ padding: '8px 6px', textAlign: 'center' }}>{it.quantity}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right' }}>{vnd(linePrice)}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right' }}>{vnd(lineTotal)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Bảng Tổng Hợp Thuế & Thanh Toán */}
              <div style={{ borderTop: '1px solid #333', paddingTop: 10, fontSize: 12, lineHeight: 1.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cộng tiền hàng (chưa bao gồm VAT):</span>
                  <strong>{vnd(Math.round(order.total / 1.08))}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Thuế suất GTGT: <strong>8%</strong> · Tiền thuế GTGT:</span>
                  <strong>{vnd(order.total - Math.round(order.total / 1.08))}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, borderTop: '1px solid #222', marginTop: 6, paddingTop: 6 }}>
                  <span>TỔNG CỘNG TIỀN THANH TOÁN:</span>
                  <span style={{ color: '#b91c1c' }}>{vnd(order.total)}</span>
                </div>
                <div style={{ fontStyle: 'italic', marginTop: 4, fontSize: 12 }}>
                  Mã tra cứu CQT: <code>26MNE-{order.code.slice(0, 10).toUpperCase()}</code> · Ký hiệu bảo mật: <code>NX-VERIF-78-99</code>
                </div>
              </div>

              {/* Chữ Ký Số & Con Dấu Điện Tử */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 30, borderTop: '1px dashed #ccc', paddingTop: 20 }}>
                <div style={{ fontSize: 11, maxWidth: 300 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <QrCode size={36} color="#333" />
                    <div>
                      <strong>Quét mã tra cứu HĐĐT</strong>
                      <div style={{ color: '#666' }}>Cổng thông tin hoadondientu.gdt.gov.vn</div>
                    </div>
                  </div>
                  <p style={{ margin: '4px 0', color: '#555', fontSize: 10 }}>
                    Hóa đơn điện tử có giá trị pháp lý tương đương bản gốc giấy theo quy định của Pháp luật Việt Nam.
                  </p>
                </div>
                <div style={{ textAlign: 'center', minWidth: 260 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>NGƯỜI BÁN HÀNG</div>
                  <div style={{ fontSize: 11, fontStyle: 'italic', marginBottom: 12 }}>(Chữ ký số, chứng thư số điện tử)</div>
                  <div
                    style={{
                      border: '2px solid #16a34a',
                      background: '#f0fdf4',
                      padding: '8px 12px',
                      borderRadius: 4,
                      color: '#166534',
                      fontSize: 11,
                      lineHeight: 1.4,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#15803d' }}>
                      <CheckCircle size={14} /> ĐÃ KÝ ĐIỆN TỬ HỢP LỆ
                    </div>
                    <div>Bởi: <strong>CÔNG TY CP CÔNG NGHỆ &amp; THỜI TRANG NEXORA</strong></div>
                    <div>MST: 0109988776-001</div>
                    <div>Ngày ký: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chứng Thư Bù Đắp Carbon Chuẩn Haute Couture */}
      {showCarbonCertModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              background: '#fdfbf7',
              maxWidth: 640,
              width: '100%',
              borderRadius: 6,
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '2px solid #bbf7d0',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #e5e5e5', background: '#f0fdf4' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Leaf size={16} /> NEXORA GREEN INITIATIVE · CERTIFICATE OF CLIMATE ACTION
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button"
                  style={{ fontSize: 11, padding: '4px 10px', background: '#166534', color: '#fff' }}
                  onClick={() => window.print()}
                >
                  <Printer size={13} /> In Chứng Thư
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setShowCarbonCertModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Haute Couture Certificate Layout */}
            <div style={{ padding: '36px 32px', textAlign: 'center', color: '#1c1917', fontFamily: 'var(--font-sans)' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#166534', fontWeight: 700, marginBottom: 8 }}>
                CHỨNG NHẬN ĐÓNG GÓP SINH THÁI
              </div>
              <h1 style={{ fontSize: 24, margin: '0 0 10px', color: '#0f172a', fontWeight: 400 }}>
                Chứng Thư Bù Đắp Carbon Kỹ Thuật Số
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: '0 auto 24px', maxWidth: 460 }}>
                Chứng nhận kiện hàng của Quý khách đã được bảo trợ và trung hòa hoàn toàn dấu chân phát thải thông qua vận hành Logistics xanh và phục hồi rừng bản địa.
              </p>

              <div style={{ padding: '20px', background: '#fff', border: '1px solid #d1fae5', borderRadius: 4, margin: '0 auto 24px', maxWidth: 480 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, textAlign: 'left' }}>
                  <span style={{ color: '#64748b' }}>Chủ sở hữu chứng thư:</span>
                  <strong style={{ color: '#0f172a' }}>{order.address?.recipient ?? 'Quý Khách Hàng NEXORA'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, textAlign: 'left' }}>
                  <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{order.code}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, textAlign: 'left' }}>
                  <span style={{ color: '#64748b' }}>Mã chứng nhận Blockchain:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#166534' }}>NEX-CO2-2026-{order.code.slice(0, 8).toUpperCase()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px dashed #e2e8f0', paddingTop: 8, textAlign: 'left' }}>
                  <span style={{ color: '#64748b' }}>Tổng lượng phát thải đã triệt tiêu:</span>
                  <strong style={{ color: '#166534', fontSize: 14 }}>1.85 kg CO2e</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '20px auto 0', maxWidth: 460 }}>
                <div style={{ textAlign: 'center' }}>
                  <QrCode size={48} color="#0f172a" style={{ margin: '0 auto 4px' }} />
                  <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Quét tra cứu sổ cái</span>
                </div>
                <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px double #16a34a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                  <CheckCircle size={20} />
                  <strong style={{ fontSize: 9, letterSpacing: '0.05em', marginTop: 2 }}>NEXORA ECO</strong>
                  <span style={{ fontSize: 8 }}>VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
