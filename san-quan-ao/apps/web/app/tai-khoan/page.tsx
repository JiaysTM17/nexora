'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, MapPin, Package, RefreshCw, ShieldCheck, Sparkles, UserCheck, Layers, Calendar, Sun, CloudRain, Share2, Check, Shirt, ExternalLink, Leaf, Trees, TreePine, Award, Compass, Palette, Footprints, BarChart3, Calculator, TrendingDown, Pin, Image, Clock, Plus, Trash2, CheckCircle2, Scissors, Archive } from 'lucide-react';
import { api, AffiliateSummary, CareBooking, Product, TradeInRequest, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

type Address = { id: string; recipient: string; phone: string; line: string; province: string };

export default function AccountPage() {
  const { user, refresh } = useUser();
  const router = useRouter();
  const addresses = useResource<Address[]>(user ? '/addresses' : null);
  const tradeIns = useResource<TradeInRequest[]>(user ? '/trade-in' : null);
  const careList = useResource<CareBooking[]>(user ? '/vas-care' : null);
  const affiliate = useResource<AffiliateSummary>(user ? '/affiliate/summary' : null);
  const wishlist = useResource<Product[]>(user ? '/wishlist' : null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [passport, setPassport] = useState<{
    height: number;
    weight: number;
    chest: number;
    waist: number;
    hip: number;
    fitPref: string;
    footLength?: number;
    footWidth?: number;
    archType?: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_fashion_passport');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return { height: 168, weight: 58, chest: 88, waist: 68, hip: 92, fitPref: 'REGULAR', footLength: 255, footWidth: 96, archType: 'STANDARD' };
  });
  const [passportSaved, setPassportSaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weatherMode, setWeatherMode] = useState<'WARM' | 'COOL'>('WARM');
  const [pinnedDay, setPinnedDay] = useState<number | null>(null);
  const [archetype, setArchetype] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_style_archetype') || 'Quiet Luxury Curator';
    }
    return 'Quiet Luxury Curator';
  });
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [cpwItemIndex, setCpwItemIndex] = useState(0);
  const [cpwWears, setCpwWears] = useState(28);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [moodboardPins, setMoodboardPins] = useState<Array<{ id: string; title: string; palette: string; note: string; tag: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_style_moodboards');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      { id: '1', title: 'Normandy Coastal Flax', palette: '#d6cbba', note: 'Sợi lanh thô dệt thưa, tông cát mộc mạc thư thái', tag: '#QuietLuxury' },
      { id: '2', title: 'Sơn Mài Midnight', palette: '#1c1917', note: 'Đen tuyền sâu thẳm, đường cắt sắc sảo tương phản', tag: '#Monochrome' },
      { id: '3', title: 'Bảo Lộc Silk Elegance', palette: '#f8fafc', note: 'Lụa tơ tằm mềm mại óng ả, độ rủ hoàn hảo', tag: '#SilkHeritage' },
      { id: '4', title: 'Terracotta Earth', palette: '#b45309', note: 'Nâu đất ấm nồng, phóng khoáng hòa nhịp đất trời', tag: '#EarthSartorial' },
    ];
  });
  const [addingPin, setAddingPin] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinNote, setNewPinNote] = useState('');
  const [newPinPalette, setNewPinPalette] = useState('#d6cbba');
  const [fashionEvents, setFashionEvents] = useState<Array<{ id: string; title: string; date: string; time: string; occasion: string; outfit: string; weather: string; vasReminder: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_fashion_events');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      { id: 'ev-1', title: 'Họp Chiến Lược Quý IV HĐQT', date: 'Thứ 2, 23/11', time: '09:00', occasion: 'Sartorial Power Dressing', outfit: 'Áo Blazer Dạ Len Ý + Quần Tây Xếp Ly Kép + Thắt Lưng Da Đồng', weather: 'Sài Gòn 31°C · Nắng nhẹ', vasReminder: true },
      { id: 'ev-2', title: 'Dạ Tiệc Tối Khai Mạc Triển Lãm Sơn Mài', date: 'Thứ 4, 25/11', time: '19:30', occasion: 'Quiet Luxury Gala', outfit: 'Đầm Lụa Satin Sơn Mài Đen + Khăn Cài Tơ Tằm Bảo Lộc', weather: 'Gió mát 24°C', vasReminder: true },
      { id: 'ev-3', title: 'Dạo Phố & Cà Phê Chụp Ảnh OOTD', date: 'Thứ 7, 28/11', time: '15:30', occasion: 'Minimalist Relaxed', outfit: 'Sơ Mi Normandy Linen Mộc + Quần Suông Cát + Nón Cói', weather: 'Nắng ấm 29°C', vasReminder: false },
    ];
  });
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Chủ Nhật, 29/11');
  const [newEventTime, setNewEventTime] = useState('18:00');
  const [newEventOccasion, setNewEventOccasion] = useState('Smart Casual Evening');
  const [newEventOutfit, setNewEventOutfit] = useState('Áo Polo Dệt Kim Merino + Quần Tây Trắng Ngà');
  const [newEventVasReminder, setNewEventVasReminder] = useState(true);
  const [hasGreenPledge, setHasGreenPledge] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_green_shopper_pledge') === 'true';
    }
    return false;
  });
  const [wardrobeSyncActive, setWardrobeSyncActive] = useState(false);
  const [bespokeOrders, setBespokeOrders] = useState<Array<{ id: string; productName: string; variant: string; monogram: string; deposit: number; queuePos: number; createdAt: string; step: number; lining?: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_bespoke_preorders');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [hibernationOpen, setHibernationOpen] = useState(false);
  const [hibernationItem, setHibernationItem] = useState('Áo Khoác Blazer Dạ Len Ý Sartorial');
  const [hibernationDuration, setHibernationDuration] = useState<'3_MONTHS' | '6_MONTHS' | '12_MONTHS'>('6_MONTHS');
  const [hibernationBooked, setHibernationBooked] = useState<Array<{ id: string; item: string; duration: string; fee: number; code: string; date: string }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_garment_hibernation');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [
      { id: 'HIB-8812', item: 'Áo Khoác Blazer Dạ Len Ý Sartorial', duration: '6 Tháng (Gói Mùa Mưa)', fee: 240000, code: 'HIBERNATE-VAULT-8812', date: '18/11/2026' }
    ];
  });

  function savePassport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const updated = {
      height: Number(d.get('height')),
      weight: Number(d.get('weight')),
      chest: Number(d.get('chest')),
      waist: Number(d.get('waist')),
      hip: Number(d.get('hip')),
      fitPref: String(d.get('fitPref')),
      footLength: Number(d.get('footLength') || 255),
      footWidth: Number(d.get('footWidth') || 96),
      archType: String(d.get('archType') || 'STANDARD'),
    };
    setPassport(updated);
    localStorage.setItem('nexora_fashion_passport', JSON.stringify(updated));
    setPassportSaved(true);
    setTimeout(() => setPassportSaved(false), 3000);
  }

  async function addAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/addresses', 'POST', Object.fromEntries(new FormData(e.currentTarget).entries()));
      setAdding(false);
      addresses.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api('/auth/logout', 'POST');
    refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <section className="section narrow">
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để xem hồ sơ tài khoản NEXORA.</Notice>
      </section>
    );
  }

  const activeVouchers = (tradeIns.data ?? []).filter(t => t.status === 'APPROVED' && t.voucherCode);

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />TÀI KHOẢN NEXORA</p>
      <div className="section-heading">
        <div>
          <h1>Xin chào, <em>{user.name}</em></h1>
          <p className="subtle">{user.email} · Vai trò: {user.role}</p>
        </div>
        <button className="button secondary" onClick={logout}><LogOut size={16} />Đăng xuất</button>
      </div>

      {error && <Notice error>{error}</Notice>}

      <div className="stats">
        <div>
          <small>ĐƠN HÀNG</small>
          <Link href="/don-hang" className="row"><Package size={18} /><strong>Xem đơn</strong></Link>
        </div>
        <div>
          <small>VOUCHER TRADE-IN</small>
          <Link href="/trade-in" className="row"><RefreshCw size={18} /><strong>{activeVouchers.length} mã</strong></Link>
        </div>
        <div>
          <small>VAS CARE</small>
          <Link href="/vas-care" className="row"><ShieldCheck size={18} /><strong>{careList.data?.length ?? 0} lịch</strong></Link>
        </div>
        <div>
          <small>ĐÃ LƯU</small>
          <strong>{wishlist.data?.length ?? 0} món</strong>
        </div>
      </div>

      {/* Huy Hiệu Cam Kết Tiêu Dùng Xanh (CART-CARBON-REDUCTION-PLEDGE-01) */}
      {hasGreenPledge && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🌿</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 13, color: '#166534' }}>Huy Hiệu Tiêu Dùng Sinh Thái: Green Shopper Pioneer</strong>
                <span style={{ fontSize: 10, background: '#16a34a', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                  PLEDGE VERIFIED
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#15803d' }}>
                Đã ký cam kết giao hàng không nilon, gom chuyến xe điện và tuần hoàn bao bì. Tích lũy <strong>+100 Điểm Xanh NEX-Green</strong>.
              </p>
            </div>
          </div>
          <Link href="/gio-hang" style={{ fontSize: 11, color: '#166534', fontWeight: 600, textDecoration: 'underline' }}>
            Xem cam kết tại giỏ →
          </Link>
        </div>
      )}

      {/* Danh Sách Đặt Trước May Đo Thủ Công Atelier (CAT-PRE-ORDER-ATELIER-01) */}
      {bespokeOrders.length > 0 && (
        <article className="panel" style={{ background: '#fdfbf7', border: '1px solid #fed7aa', marginBottom: 16 }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scissors size={18} color="#b45309" />
              <div>
                <h2 style={{ margin: 0, fontSize: 14, color: '#78350f' }}>
                  Hồ Sơ Đặt Trước May Đo Thủ Công (Bespoke Pre-Order Atelier Queue)
                </h2>
                <p className="subtle" style={{ margin: '2px 0 0', fontSize: 11 }}>
                  Tiến trình chế tác thủ công độc bản bởi Master Tailor Hoàng Nam tại NEXORA Atelier.
                </p>
              </div>
            </div>
            <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 2, fontWeight: 700 }}>
              {bespokeOrders.length} suất đang may
            </span>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {bespokeOrders.map((bo) => (
              <div key={bo.id} style={{ background: '#ffffff', borderRadius: 6, border: '1px solid #fed7aa', padding: 14 }}>
                <div className="row between" style={{ marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#1e293b' }}>{bo.productName}</strong>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Mã hồ sơ: <strong>#{bo.id}</strong> · Ngày đăng ký: {bo.createdAt} · Biến thể: {bo.variant}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                      Suất Hàng Chờ #{bo.queuePos}/15
                    </span>
                    <div style={{ fontSize: 11, color: '#b45309', fontWeight: 700, marginTop: 4 }}>
                      Đã cọc 30%: {vnd(bo.deposit)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0', padding: '8px 10px', background: '#fafaf9', borderRadius: 4, fontSize: 11 }}>
                  <span>Monogram ve áo: <strong style={{ color: '#b45309', fontFamily: 'serif', letterSpacing: 1 }}>{bo.monogram}</strong></span>
                  <span>·</span>
                  <span>Lớp lót: <strong>{bo.lining || 'Lụa Jacquard'}</strong></span>
                  <span>·</span>
                  <span>Bảo chứng: <strong style={{ color: '#16a34a' }}>Escrow Sàn D1-01</strong></span>
                </div>

                {/* 5-step progress bar */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#b45309' }}>Chặng 1: Phóng rập cá nhân</span>
                    <span>Chặng 2: Cắt sợi</span>
                    <span>Chặng 3: Đơm khuy</span>
                    <span>Chặng 4: Thêu monogram</span>
                    <span>Chặng 5: Đóng hộp</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '25%', height: '100%', background: '#b45309' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* Hồ Sơ Số Đo Thời Trang Cá Nhân (NEXORA Fashion Passport · USER-PASSPORT-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Sparkles size={18} color="var(--clay)" /> Hồ Sơ Số Đo Thời Trang (Fashion Passport)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Lưu số đo cơ thể cá nhân để nhận gợi ý size thông minh (Smart Fit) tự động trên từng sản phẩm.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#eef2ed', color: '#166534', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
            Smart Fit Active
          </span>
        </div>

        {passportSaved && (
          <div style={{ marginBottom: 12 }}>
            <Notice>Đã lưu Fashion Passport thành công! Hệ thống sẽ tự động so khớp và gợi ý size khi bạn xem trang phục.</Notice>
          </div>
        )}

        <form onSubmit={savePassport} className="form" style={{ marginTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            <label>
              Chiều cao (cm)
              <input name="height" type="number" min={120} max={220} defaultValue={passport.height} required />
            </label>
            <label>
              Cân nặng (kg)
              <input name="weight" type="number" min={35} max={150} defaultValue={passport.weight} required />
            </label>
            <label>
              Vòng 1 / Ngực (cm)
              <input name="chest" type="number" min={60} max={140} defaultValue={passport.chest} required />
            </label>
            <label>
              Vòng 2 / Eo (cm)
              <input name="waist" type="number" min={50} max={130} defaultValue={passport.waist} required />
            </label>
            <label>
              Vòng 3 / Mông (cm)
              <input name="hip" type="number" min={60} max={150} defaultValue={passport.hip} required />
            </label>
            <label>
              Gu mặc ưu tiên
              <select name="fitPref" defaultValue={passport.fitPref}>
                <option value="REGULAR">Vừa vặn (Regular Fit)</option>
                <option value="OVERSIZED">Rộng rãi (Oversized / Relaxed)</option>
                <option value="SLIM">Ôm dáng (Slim Fit)</option>
              </select>
            </label>
          </div>

          {/* Thước Đo Chân Số Hóa & Khuyến Nghị Size Giày/Guốc (USER-FOOTWEAR-SCAN-01) */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
                <Footprints size={16} color="var(--clay)" /> Thước Đo Chân Số Hóa &amp; Size Giày/Guốc (USER-FOOTWEAR-SCAN-01)
              </span>
              <span style={{ fontSize: 10, background: '#f5f3ef', padding: '2px 8px', borderRadius: 2, color: 'var(--muted)', fontWeight: 600 }}>
                Chuẩn quốc tế ISO 9407 / Mondopoint
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              <label>
                Chiều dài chân (mm)
                <input name="footLength" type="number" min={200} max={320} defaultValue={passport.footLength ?? 255} required />
              </label>
              <label>
                Chiều rộng chân (mm)
                <input name="footWidth" type="number" min={70} max={130} defaultValue={passport.footWidth ?? 96} required />
              </label>
              <label>
                Dạng vòm chân (Arch)
                <select name="archType" defaultValue={passport.archType ?? 'STANDARD'}>
                  <option value="STANDARD">Vòm cân đối tiêu chuẩn</option>
                  <option value="FLAT">Bàn chân bẹt (Low/Flat Arch)</option>
                  <option value="HIGH">Vòm chân cao (High Arch)</option>
                </select>
              </label>
            </div>

            {/* Calculated Shoe Size Card */}
            {(() => {
              const fl = passport.footLength ?? 255;
              const eu = (((fl + 15) * 1.5) / 10).toFixed(1);
              const us = ((((fl + 15) * 1.5) / 10) - 33).toFixed(1);
              const uk = ((((fl + 15) * 1.5) / 10) - 33.5).toFixed(1);
              return (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#faf9f5', border: '1px solid var(--line)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ background: '#fff', border: '1px solid var(--line)', padding: '6px 10px', borderRadius: 3, textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'var(--muted)' }}>SIZE CHUẨN</div>
                      <strong style={{ fontSize: 14, color: 'var(--clay)' }}>EU {eu}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink)' }}>
                      <span>Tương đương: <strong>US {us}</strong> · <strong>UK {uk}</strong> · Lót giày khuyến nghị: <strong>{fl + 5}mm</strong></span>
                      <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 2 }}>
                        {passport.archType === 'FLAT' && 'Khuyến nghị: Đế đệm êm nâng đỡ lòng bàn chân, tránh mũi nhọn cứng.'}
                        {passport.archType === 'HIGH' && 'Khuyến nghị: Đệm vòm êm ái hấp thụ chấn động, phom rộng mu bàn chân.'}
                        {(!passport.archType || passport.archType === 'STANDARD') && 'Khuyến nghị: Phù hợp mọi phom Loafer da Ý, Sneaker và Sandal cao gót.'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: '#166534', fontWeight: 600, background: '#eaf5ee', padding: '3px 8px', borderRadius: 2 }}>
                    ✓ Khớp 98% phom giày NEXORA
                  </span>
                </div>
              );
            })()}
          </div>
          <button className="button" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            Cập nhật Fashion Passport
          </button>
        </form>
      </article>

      {/* Khám Phá Bản Sắc Phong Cách Thời Trang (Fashion Archetype Quiz · USER-STYLE-QUIZ-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Compass size={18} color="var(--clay)" /> Bản Sắc Phong Cách Thời Trang (Fashion Archetype)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Khám phá DNA thẩm mỹ của bạn qua 4 câu hỏi định hình phong cách độc quyền từ các Senior Stylist.
            </p>
          </div>
          <button
            type="button"
            className="text-button"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => {
              setQuizOpen(!quizOpen);
              setQuizStep(0);
              setQuizAnswers({});
            }}
          >
            <Palette size={14} /> {quizOpen ? 'Đóng bài trắc nghiệm' : archetype ? 'Trắc nghiệm lại' : 'Làm trắc nghiệm ngay'}
          </button>
        </div>

        {/* Current Archetype Badge */}
        {archetype && !quizOpen && (
          <div
            style={{
              padding: '14px 18px',
              background: '#faf8f5',
              border: '1px solid var(--line)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clay)', fontWeight: 700 }}>
                STYLE DNA ARCHETYPE
              </span>
              <h3 style={{ margin: '2px 0 4px', fontSize: 16 }}>{archetype}</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                {archetype === 'Quiet Luxury Curator' && 'Khí chất thượng lưu tinh tế, ưa chuộng lụa tơ tằm và len merino, tối giản không phô trương.'}
                {archetype === 'Earth Sartorialist' && 'Hòa hợp cùng thiên nhiên qua chất liệu đay lanh Normandy, phom suit mềm phóng khoáng và gam màu sa mạc.'}
                {archetype === 'Minimalist Architect' && 'Đường cắt may sắc sảo, bảng màu đơn sắc monochrome đen - trắng tạo ấn tượng thị giác hiện đại.'}
                {archetype === 'Slow Fashion Bohemian' && 'Đũi lanh mộc tự nhiên, sợi bông hữu cơ bay bổng, tôn vinh lối sống xanh bền vững tuần hoàn.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, background: '#fff', border: '1px solid var(--line)', padding: '4px 10px', borderRadius: 3, fontWeight: 600 }}>
                ✓ Đã đồng bộ Fashion Passport
              </span>
              <span style={{ fontSize: 11, background: '#eef2ed', color: '#166534', padding: '4px 10px', borderRadius: 3, fontWeight: 600 }}>
                ✓ Tự động cá nhân hóa 7 ngày
              </span>
            </div>
          </div>
        )}

        {/* Quiz Steps Form */}
        {quizOpen && (
          <div style={{ marginTop: 14, padding: '16px 20px', background: '#fff', border: '1px solid var(--line)', borderRadius: 4 }}>
            {(() => {
              const questions = [
                {
                  title: '1. Bảng màu làm bạn cảm thấy tự tin và thư thái nhất?',
                  options: [
                    { label: 'Gam màu trung tính: Trắng ngà, be cát, xám khói, xanh navy', type: 'Quiet Luxury Curator' },
                    { label: 'Màu đất mộc mạc: Nâu đất, vàng mù tạt, xanh rêu, chàm tự nhiên', type: 'Earth Sartorialist' },
                    { label: 'Đơn sắc tối giản: Đen tuyền, trắng tinh tế, ghi đậm tương phản', type: 'Minimalist Architect' },
                    { label: 'Màu sợi mộc: Kem tự nhiên, màu vải đũi chưa qua tẩy nhuộm', type: 'Slow Fashion Bohemian' },
                  ],
                },
                {
                  title: '2. Bối cảnh bạn thường xuyên chú trọng trang phục nhất?',
                  options: [
                    { label: 'Phòng họp đối tác cao cấp, dạ tiệc tối và sự kiện networking', type: 'Quiet Luxury Curator' },
                    { label: 'Không gian sáng tạo, studio nghệ thuật và cà phê cuối tuần', type: 'Earth Sartorialist' },
                    { label: 'Triển lãm kiến trúc, thảm đỏ nghệ thuật đương đại', type: 'Minimalist Architect' },
                    { label: 'Các chuyến du lịch nghỉ dưỡng, dã ngoại và hòa mình với tự nhiên', type: 'Slow Fashion Bohemian' },
                  ],
                },
                {
                  title: '3. Chất liệu vải chạm vào làn da mang lại cảm xúc say đắm nhất?',
                  options: [
                    { label: 'Lụa tơ tằm dệt tay & Len lông cừu Merino sợi mảnh', type: 'Quiet Luxury Curator' },
                    { label: 'Đay lanh French Normandy Flax & Cotton Compact Pima', type: 'Earth Sartorialist' },
                    { label: 'Lụa satin cát bóng mờ & Dạ wool đanh mịn sắc nét', type: 'Minimalist Architect' },
                    { label: 'Đũi tơ tằm thô, sợi gai dầu & cotton hữu cơ thoáng khí', type: 'Slow Fashion Bohemian' },
                  ],
                },
                {
                  title: '4. Châm ngôn thời trang miêu tả chân thực nhất gu mặc của bạn?',
                  options: [
                    { label: '“Sang trọng không cần phô trương, chất lượng định nghĩa đẳng cấp.”', type: 'Quiet Luxury Curator' },
                    { label: '“Hòa mình cùng thiên nhiên, nét thanh lịch mộc mạc không gắng gượng.”', type: 'Earth Sartorialist' },
                    { label: '“Cấu trúc hình học chuẩn mực, tối giản nhưng đậm ấn tượng thị giác.”', type: 'Minimalist Architect' },
                    { label: '“Mặc vì cảm xúc và sự tự do, tôn vinh lối sống bền vững tuần hoàn.”', type: 'Slow Fashion Bohemian' },
                  ],
                },
              ];

              const currentQ = questions[quizStep];

              return (
                <div>
                  <div className="row between" style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--clay)', fontWeight: 700, textTransform: 'uppercase' }}>
                      CÂU HỎI {quizStep + 1} / 4
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      Tiến độ: {Math.round(((quizStep + 1) / 4) * 100)}%
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, margin: '0 0 14px' }}>{currentQ.title}</h3>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {currentQ.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        style={{
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: '1px solid var(--line)',
                          borderRadius: 3,
                          background: quizAnswers[quizStep] === opt.type ? '#faf8f3' : '#fff',
                          borderColor: quizAnswers[quizStep] === opt.type ? 'var(--clay)' : 'var(--line)',
                          cursor: 'pointer',
                          fontSize: 13,
                          lineHeight: 1.5,
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => {
                          const updated = { ...quizAnswers, [quizStep]: opt.type };
                          setQuizAnswers(updated);
                          if (quizStep < 3) {
                            setQuizStep(quizStep + 1);
                          } else {
                            // Calculate result
                            const counts: Record<string, number> = {};
                            Object.values(updated).forEach((t) => {
                              counts[t] = (counts[t] || 0) + 1;
                            });
                            let best = 'Quiet Luxury Curator';
                            let max = 0;
                            Object.entries(counts).forEach(([k, v]) => {
                              if (v > max) {
                                max = v;
                                best = k;
                              }
                            });
                            setArchetype(best);
                            try {
                              localStorage.setItem('nexora_style_archetype', best);
                            } catch {}
                            setQuizOpen(false);
                          }
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {quizStep > 0 && (
                    <button
                      type="button"
                      className="text-button"
                      style={{ marginTop: 12, fontSize: 11, padding: 0 }}
                      onClick={() => setQuizStep(quizStep - 1)}
                    >
                      &larr; Quay lại câu hỏi trước
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </article>

      {/* Tủ Đồ Nhộng Thông Minh & Trợ Lý Phong Cách AI (Capsule Wardrobe AI Stylist · SOC-WARDROBE-AI-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Layers size={18} color="var(--clay)" /> Tủ Đồ Nhộng &amp; Trợ Lý AI Stylist (Capsule Wardrobe)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Thuật toán AI Stylist tự động lập lịch phối đồ 7 ngày từ 7 món đồ thiết yếu, đồng bộ theo số đo ({passport.height}cm / {passport.weight}kg · {passport.fitPref}) của bạn.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Thời tiết:</span>
            <button
              type="button"
              className={`text-button ${weatherMode === 'WARM' ? 'primary' : ''}`}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                background: weatherMode === 'WARM' ? '#fdf8ea' : 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: weatherMode === 'WARM' ? 700 : 500,
              }}
              onClick={() => setWeatherMode('WARM')}
            >
              <Sun size={12} color={weatherMode === 'WARM' ? '#d97706' : 'currentColor'} /> Nắng ấm thoáng mát
            </button>
            <button
              type="button"
              className={`text-button ${weatherMode === 'COOL' ? 'primary' : ''}`}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                background: weatherMode === 'COOL' ? '#eff6ff' : 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: weatherMode === 'COOL' ? 700 : 500,
              }}
              onClick={() => setWeatherMode('COOL')}
            >
              <CloudRain size={12} color={weatherMode === 'COOL' ? '#2563eb' : 'currentColor'} /> Se lạnh thu đông
            </button>
          </div>
        </div>

        {/* 7-Day Day Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, margin: '14px 0' }}>
          {[
            { day: 'Thứ 2', title: 'Work Minimal' },
            { day: 'Thứ 3', title: 'Executive' },
            { day: 'Thứ 4', title: 'Creative' },
            { day: 'Thứ 5', title: 'Chic Mono' },
            { day: 'Thứ 6', title: 'Smart Denim' },
            { day: 'Thứ 7', title: 'Eco Weekend' },
            { day: 'Chủ Nhật', title: 'Gallery Vibe' },
          ].map((item, idx) => {
            const isSelected = selectedDay === idx;
            const isPinned = pinnedDay === idx;
            return (
              <button
                key={item.day}
                type="button"
                onClick={() => setSelectedDay(idx)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 3,
                  border: isSelected ? '2px solid var(--clay)' : '1px solid var(--line)',
                  background: isSelected ? '#faf8f3' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--clay)' : 'var(--ink)' }}>
                  {item.day}
                </div>
                <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                {isPinned && (
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#16a34a', marginTop: 3 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Outfit Card */}
        {(() => {
          const weeklySets = [
            {
              dayName: 'Thứ 2',
              concept: 'Quiet Luxury Minimalist',
              harmony: '99/100 (Tone-sur-Tone Hoàn Hảo)',
              warm: {
                top: 'Áo sơ mi lụa tơ tằm dệt thủ công (Trắng Ngà)',
                bottom: 'Quần tây sartorial xếp ly kép (Nâu Cát)',
                layer: 'Khăn lụa bỏ túi atelier',
                shoes: 'Loafer da lộn thuộc thảo mộc',
              },
              cool: {
                top: 'Áo sơ mi lụa tơ tằm dệt thủ công (Trắng Ngà)',
                bottom: 'Quần tây sartorial xếp ly kép (Nâu Cát)',
                layer: 'Áo khoác Blazer Linen hai hàng khuy dáng suông (Xám Melange)',
                shoes: 'Derby da bò Ý nguyên tấm',
              },
              tags: ['#OfficeChic', '#QuietLuxury', '#NEXORA_Atelier'],
              rationale: `Phom dáng ${passport.fitPref === 'SLIM' ? 'ôm gọn tôn đường nét' : 'suông vừa vặn phóng khoáng'} tạo phong thái chỉn chu, quyền lực nhưng thanh thoát cho ngày khởi đầu tuần mới.`,
            },
            {
              dayName: 'Thứ 3',
              concept: 'Contemporary Executive',
              harmony: '96/100 (Hài Hòa Thanh Lịch)',
              warm: {
                top: 'Áo Polo dệt kim Merino sợi dài (Xám Khói)',
                bottom: 'Quần âu may đo phom phẳng (Đen Tuyển)',
                layer: 'Thắt lưng da thủ công',
                shoes: 'Sneaker da thuộc tối giản',
              },
              cool: {
                top: 'Áo Polo dệt kim Merino sợi dài (Xám Khói)',
                bottom: 'Quần âu may đo phom phẳng (Đen Tuyển)',
                layer: 'Cardigan len cashmere cổ tim mỏng',
                shoes: 'Chelsea boots da thuộc thảo mộc',
              },
              tags: ['#Executive', '#MerinoWool', '#SmartCasual'],
              rationale: 'Chất liệu len Merino thoáng khí tự nhiên, cân bằng hoàn hảo giữa tính trang trọng công sở và sự mềm mại thoải mái.',
            },
            {
              dayName: 'Thứ 4',
              concept: 'Mid-week Earth Sartorial',
              harmony: '97/100 (Gam Màu Tự Nhiên)',
              warm: {
                top: 'Áo sơ mi cổ trụ linen cát sa mạc',
                bottom: 'Quần jeans ống suông organic wash nhẹ',
                layer: 'Đồng hồ dây da thủ công',
                shoes: 'Loafer penny da mộc',
              },
              cool: {
                top: 'Áo sơ mi cổ trụ linen cát sa mạc',
                bottom: 'Quần jeans ống suông organic wash nhẹ',
                layer: 'Áo khoác safari kaki đũi',
                shoes: 'Boots cổ lửng da lộn',
              },
              tags: ['#EarthTone', '#OrganicDenim', '#MidWeek'],
              rationale: 'Tông màu cát sa mạc kết hợp denim organic giúp giải tỏa áp lực giữa tuần, mang lại năng lượng sáng tạo.',
            },
            {
              dayName: 'Thứ 5',
              concept: 'High Monochrome Aesthetics',
              harmony: '98/100 (Đơn Sắc Sang Trọng)',
              warm: {
                top: 'Áo dệt kim cổ lọ ngắn tay đen tuyền',
                bottom: 'Quần xếp ly ống rộng monochrome',
                layer: 'Trâm cài bạc đúc tối giản',
                shoes: 'Mule gót thấp bọc da',
              },
              cool: {
                top: 'Áo dệt kim cổ lọ len cừu đen tuyền',
                bottom: 'Quần xếp ly ống rộng monochrome',
                layer: 'Áo măng-tô dáng dài hai lớp lót lụa',
                shoes: 'Giày bốt cao gót đen mờ',
              },
              tags: ['#Monochrome', '#TotalBlack', '#HighEditorial'],
              rationale: 'Nguyên tắc đơn sắc monochrome tôn chiều cao tối đa, phù hợp các buổi thuyết trình và dạ tiệc tối.',
            },
            {
              dayName: 'Thứ 6',
              concept: 'Smart Denim & Casual Friday',
              harmony: '95/100 (Tự Do Tinh Tế)',
              warm: {
                top: 'Áo thun Pima Cotton chải kỹ không đường may',
                bottom: 'Quần jeans suông vintage wash',
                layer: 'Áo sơ mi oxford khoác ngoài mở cúc',
                shoes: 'Giày vải canvas đế lưu hóa',
              },
              cool: {
                top: 'Áo thun Pima Cotton chải kỹ',
                bottom: 'Quần jeans suông vintage wash',
                layer: 'Áo nỉ chui đầu dệt cotton 420gsm',
                shoes: 'Sneaker retro da lộn',
              },
              tags: ['#CasualFriday', '#PimaCotton', '#Effortless'],
              rationale: 'Chuyển giao mượt mà từ giờ làm việc chiều thứ 6 sang buổi hẹn hò cuối tuần mà không cần thay trang phục.',
            },
            {
              dayName: 'Thứ 7',
              concept: 'Eco Linen Weekend Escape',
              harmony: '98/100 (Hơi Thở Thiên Nhiên)',
              warm: {
                top: 'Áo đũi lanh cộc tay nâu đất thảo mộc',
                bottom: 'Quần short linen mộc tự nhiên',
                layer: 'Nón cói panama đan tay',
                shoes: 'Sandals da quai chéo thủ công',
              },
              cool: {
                top: 'Áo sơ mi đũi lanh dài tay',
                bottom: 'Quần lanh ống đứng nhuộm chàm tự nhiên',
                layer: 'Khăn quàng đũi tơ tằm thô',
                shoes: 'Espadrilles đế cói Tây Ban Nha',
              },
              tags: ['#EcoLinen', '#WeekendEscape', '#SlowFashion'],
              rationale: '100% sợi tự nhiên phân hủy sinh học, nâng niu làn da trong các chuyến dã ngoại và nghỉ dưỡng.',
            },
            {
              dayName: 'Chủ Nhật',
              concept: 'Sunday Gallery & Atelier Brunch',
              harmony: '96/100 (Cảm Hứng Nghệ Thuật)',
              warm: {
                top: 'Áo lụa dáng suông cổ thuyền bay bổng',
                bottom: 'Quần culottes lụa cát mềm rủ',
                layer: 'Túi tote canvas mộc dập logo dập chìm',
                shoes: 'Giày búp bê da cừu siêu mềm',
              },
              cool: {
                top: 'Áo len dệt thưa phom oversized',
                bottom: 'Chân váy xếp ly lụa satin mờ',
                layer: 'Áo choàng poncho len lông cừu',
                shoes: 'Ankle boots da thuộc',
              },
              tags: ['#ArtGallery', '#SundayBrunch', '#PureComfort'],
              rationale: 'Tạo hình nghệ thuật phóng khoáng, hoàn hảo cho những buổi ghé thăm triển lãm nghệ thuật và cà phê nhẹ nhàng.',
            },
          ];

          const current = weeklySets[selectedDay];
          const outfit = weatherMode === 'WARM' ? current.warm : current.cool;
          const isCurrentPinned = pinnedDay === selectedDay;

          return (
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 4,
                padding: '16px 20px',
                background: '#fff',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clay)', fontWeight: 700 }}>
                    LỊCH PHỐI ĐỒ {current.dayName.toUpperCase()} · AI STYLIST
                  </span>
                  <h3 style={{ margin: '2px 0', fontSize: 16 }}>{current.concept}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    <span>Chỉ số hòa sắc: <strong style={{ color: '#166534' }}>{current.harmony}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="button secondary"
                    style={{
                      fontSize: 12,
                      padding: '6px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: isCurrentPinned ? '#f0fdf4' : undefined,
                      borderColor: isCurrentPinned ? '#16a34a' : undefined,
                      color: isCurrentPinned ? '#166534' : undefined,
                    }}
                    onClick={() => setPinnedDay(isCurrentPinned ? null : selectedDay)}
                  >
                    {isCurrentPinned ? <Check size={14} /> : <Calendar size={14} />}
                    {isCurrentPinned ? 'Đã ghim hôm nay' : 'Chọn mặc hôm nay'}
                  </button>
                  <Link
                    href={`/cong-dong`}
                    className="button"
                    style={{ fontSize: 12, padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Share2 size={14} /> Đăng OOTD Lookbook
                  </Link>
                </div>
              </div>

              {/* Outfit Layers Detail */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '14px 0', padding: '12px 14px', background: '#faf9f5', borderRadius: 3 }}>
                <div>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Áo chính (Top)</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{outfit.top}</div>
                </div>
                <div>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Quần / Chân váy (Bottom)</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{outfit.bottom}</div>
                </div>
                <div>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Áo khoác / Layer (Outerwear)</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{outfit.layer}</div>
                </div>
                <div>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Giày &amp; Phụ kiện (Footwear)</small>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{outfit.shoes}</div>
                </div>
              </div>

              <p style={{ margin: '8px 0', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                💡 <strong>Ghi chú AI Stylist:</strong> {current.rationale}
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {current.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, background: '#f5f0e8', color: 'var(--ink)', padding: '2px 8px', borderRadius: 3 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Capsule Wardrobe Missing Piece Recommender */}
        <div style={{ marginTop: 14, padding: '12px 16px', background: '#fcfcfc', border: '1px dashed var(--line)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shirt size={22} color="var(--clay)" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Mảnh Ghép Capsule Hoàn Hảo (Missing Piece Suggestion)</div>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                Tủ đồ của bạn đang thiếu 1 chiếc <strong>Áo khoác Linen dáng suông</strong> để mở khóa thêm 4 công thức phối đồ đa tầng mùa này.
              </p>
            </div>
          </div>
          <Link
            href="/san-pham/ao-khoac-linen-dang-suong"
            className="text-button"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            Khám phá mảnh ghép <ExternalLink size={12} />
          </Link>
        </div>

        {/* Phân Tích Bảng Màu & Chi Phí Trên Mỗi Lần Mặc (Wardrobe Palette & Cost-per-Wear Analyzer · USER-WARDROBE-ANALYTICS-01) */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={17} color="var(--clay)" />
              <strong style={{ fontSize: 13, color: 'var(--ink)' }}>
                Phân Tích Bảng Màu &amp; Chi Phí Mỗi Lần Mặc (USER-WARDROBE-ANALYTICS-01)
              </strong>
            </div>
            <button
              type="button"
              className="text-button"
              style={{ fontSize: 11, padding: 0 }}
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
            >
              {analyticsOpen ? 'Thu gọn phân tích ▲' : 'Xem chi tiết biểu đồ ▼'}
            </button>
          </div>

          {/* Palette Distribution Bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: 'var(--muted)' }}>
              <span>Phân bổ bảng màu tủ đồ cá nhân:</span>
              <strong style={{ color: 'var(--clay)' }}>88% Hài hòa phong cách {archetype}</strong>
            </div>
            <div style={{ display: 'flex', height: 12, borderRadius: 3, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ width: '42%', background: '#d6cbba' }} title="Neutral & Trắng Ngà: 42%" />
              <div style={{ width: '28%', background: '#1e3a8a' }} title="Indigo & Navy: 28%" />
              <div style={{ width: '18%', background: '#333333' }} title="Đen Tuyền & Xám Melange: 18%" />
              <div style={{ width: '12%', background: '#b45309' }} title="Nâu Đất Sa Mạc: 12%" />
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, marginTop: 6, color: 'var(--muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d6cbba', display: 'inline-block' }} />
                42% Neutral &amp; Ivory
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e3a8a', display: 'inline-block' }} />
                28% Indigo &amp; Navy
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333333', display: 'inline-block' }} />
                18% Noir &amp; Slate
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b45309', display: 'inline-block' }} />
                12% Earth Ochre
              </span>
            </div>
          </div>

          {/* Interactive Cost-Per-Wear Calculator */}
          {analyticsOpen && (
            <div style={{ padding: '12px 14px', background: '#faf9f5', border: '1px solid var(--line)', borderRadius: 4, marginTop: 8 }}>
              {(() => {
                const cpwInventory = [
                  { name: 'Áo Sơ Mi Lụa Bảo Lộc Cổ Điển', brand: 'NEXORA Atelier', price: 1250000, category: 'Top' },
                  { name: 'Quần Tây Sartorial Linen Normandy', brand: 'Massimo Dutti', price: 890000, category: 'Bottom' },
                  { name: 'Áo Blazer Wool Cashmere Suông Rộng', brand: 'COS Vietnam', price: 2850000, category: 'Outerwear' },
                  { name: 'Đầm Lụa Midi Dệt Thủ Công', brand: 'Gia Studios', price: 1950000, category: 'Dress' },
                ];
                const activeItem = cpwInventory[cpwItemIndex];
                const currentCpw = Math.round(activeItem.price / Math.max(1, cpwWears));
                const isOptimal = currentCpw < 50000;

                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Calculator size={15} color="var(--clay)" />
                      <strong style={{ fontSize: 12, color: 'var(--ink)' }}>
                        Bộ Tính Chi Phí Mỗi Lần Mặc (Cost-Per-Wear · CPW Calculator)
                      </strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
                      <label style={{ fontSize: 11 }}>
                        Chọn trang phục trong tủ đồ:
                        <select
                          value={cpwItemIndex}
                          onChange={(e) => setCpwItemIndex(Number(e.target.value))}
                          style={{ marginTop: 4, fontSize: 11, padding: '4px 6px' }}
                        >
                          {cpwInventory.map((item, idx) => (
                            <option key={idx} value={idx}>
                              {item.name} ({vnd(item.price)})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ fontSize: 11 }}>
                        Số lần đã diện trang phục: <strong style={{ color: 'var(--clay)' }}>{cpwWears} lần</strong>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={cpwWears}
                          onChange={(e) => setCpwWears(Number(e.target.value))}
                          style={{ marginTop: 6, width: '100%', accentColor: 'var(--clay)' }}
                        />
                      </label>
                    </div>

                    {/* CPW Metric Output */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', display: 'block' }}>
                          Chi phí thực tế trên mỗi lần mặc:
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay)', fontFamily: 'Georgia, serif' }}>
                            {vnd(currentCpw)}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>/ lần diện</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 2,
                            fontWeight: 600,
                            background: isOptimal ? '#f0fdf4' : '#fffbeb',
                            color: isOptimal ? '#166534' : '#b45309',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {isOptimal ? '🌿 Đạt chuẩn Bền Vững Xanh (< 50k/lần)' : '⚡ Cần mặc thêm để tối ưu hóa giá trị'}
                        </span>
                        <div style={{ marginTop: 4 }}>
                          <Link href="/trade-in" style={{ fontSize: 10, color: 'var(--clay)', textDecoration: 'underline' }}>
                            🔄 Thu Cũ Đổi Mới Nếu Ít Mặc (&lt; 5 lần) →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </article>

      {/* Hồ Sơ Tủ Đồ Số & Cam Kết Tương Thích Số Đo (USER-FIT-WARDROBE-INTEGRATION-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <ShieldCheck size={18} color="#059669" /> Hồ Sơ Tủ Đồ Số &amp; Cam Kết Tương Thích Số Đo (USER-FIT-WARDROBE-INTEGRATION-01)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Đồng bộ sinh trắc học Fashion Passport với tủ đồ số hóa, bảo đảm tỷ lệ vừa vặn 98% và cam kết đổi size 0đ tận nhà.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
              FIT MATCH: 98% · BẢO LÃNH ĐỔI TRẢ 0Đ
            </span>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => {
                setWardrobeSyncActive(true);
                setTimeout(() => setWardrobeSyncActive(false), 3000);
              }}
            >
              {wardrobeSyncActive ? '✓ Đã đồng bộ Passport' : 'Đồng bộ lại số đo'}
            </button>
          </div>
        </div>

        {/* 2 Thẻ chỉ số tổng quan */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
          <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>Tương Thích Sinh Trắc Học Tủ Đồ</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <strong style={{ fontSize: 22, color: '#047857', fontFamily: 'Georgia, serif' }}>98%</strong>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Tối ưu tuyệt đối</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
              Căn cứ chiều cao {passport.height}cm, ngực {passport.chest}cm, eo {passport.waist}cm từ Fashion Passport.
            </p>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>Hiệu Suất Tủ Đồ Nhộng (Capsule Utilization)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <strong style={{ fontSize: 22, color: '#0f172a', fontFamily: 'Georgia, serif' }}>82%</strong>
              <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>41 / 50 ngày diện</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
              Tỷ lệ các món đồ phối lặp lại hiệu quả, giảm thiểu lãng phí và tối ưu hóa chỉ số Cost-Per-Wear.
            </p>
          </div>
        </div>

        {/* Danh sách 3 món đồ số hóa trong tủ */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 8 }}>
            Kiểm Tra Độ Vừa Vặn Từng Món Trang Phục Trong Tủ Đồ Cá Nhân:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              {
                name: 'Áo Khoác Blazer Dạ Len Ý Sartorial',
                match: '99%',
                spec: 'Vai 44cm (Khớp chuẩn 44cm) · Dài tay 61cm',
                status: 'HOÀN HẢO',
                statusBg: '#dcfce7',
                statusColor: '#15803d',
              },
              {
                name: 'Sơ Mi Lanh Normandy Cổ Trúc',
                match: '98%',
                spec: `Vòng ngực ${passport.chest}cm · Eo ${passport.waist}cm`,
                status: 'CHUẨN FORM',
                statusBg: '#dcfce7',
                statusColor: '#15803d',
              },
              {
                name: 'Đầm Lụa Tơ Tằm Bảo Lộc Dáng Dài',
                match: '97%',
                spec: 'Hạ eo 38cm · Chiều dài đầm 115cm tôn dáng',
                status: 'VỪA VẶN',
                statusBg: '#ede9fe',
                statusColor: '#6d28d9',
              },
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '10px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <strong style={{ fontSize: 11, color: '#0f172a' }}>{item.name}</strong>
                  <span style={{ fontSize: 9, background: item.statusBg, color: item.statusColor, padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>
                    {item.status} ({item.match})
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                  {item.spec}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cam kết Fit Guarantee */}
        <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, fontSize: 11, color: '#065f46', lineHeight: 1.4 }}>
          <strong>🛡️ Cam Kết Vừa Vặn 100% (Fit Guarantee Assurance):</strong> Nếu bất kỳ sản phẩm nào bạn nhận về có độ lệch &gt;2cm so với thông số Fashion Passport của bạn, bạn được đổi size tốc hành 24-48h tận nhà hoàn toàn 0đ qua dịch vụ <Link href="/don-hang" style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline' }}>RET-QUICK-EXCHANGE-01</Link>.
        </div>

        {/* Nhật Ký Bảo Dưỡng Sợi Dệt & Két Ngủ Đông Phục Trang (USER-GARMENT-LIFESPAN-EXTENDER-01) */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #cbd5e1' }}>
          <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong style={{ fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Archive size={16} color="#047857" /> Nhật Ký Bảo Dưỡng Sợi Dệt &amp; Két Ngủ Đông Phục Trang (USER-GARMENT-LIFESPAN-EXTENDER-01)
              </strong>
              <p className="subtle" style={{ margin: '2px 0 0', fontSize: 11 }}>
                Quản lý vòng đời chu kỳ giặt êm của sợi dệt và dịch vụ lưu trữ phục trang trái mùa trong buồng két kháng ẩm 45-50% RH chuẩn Atelier.
              </p>
            </div>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: 11, padding: '4px 10px' }}
              onClick={() => setHibernationOpen(!hibernationOpen)}
            >
              {hibernationOpen ? 'Đóng biểu mẫu gửi két' : '❄️ Gửi Két Ngủ Đông Trái Mùa →'}
            </button>
          </div>

          {/* 3 Metrics vòng đời sợi dệt */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 10 }}>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
              <div style={{ color: '#64748b', fontSize: 10 }}>Sơ Mi Lanh Normandy</div>
              <strong style={{ color: '#047857' }}>18 / 80 Chu kỳ giặt êm</strong>
              <div style={{ fontSize: 9, color: '#059669', marginTop: 1 }}>Độ nguyên vẹn sợi: 94.2% · Khuyến nghị xịt sương ấm</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
              <div style={{ color: '#64748b', fontSize: 10 }}>Blazer Dạ Len Ý Sartorial</div>
              <strong style={{ color: '#047857' }}>4 / 30 Lần hấp sinh học</strong>
              <div style={{ fontSize: 9, color: '#059669', marginTop: 1 }}>Phom ve áo: 99% · Đã sẵn sàng gửi két ngủ đông</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 11 }}>
              <div style={{ color: '#64748b', fontSize: 10 }}>Đầm Lụa Tơ Tằm Bảo Lộc</div>
              <strong style={{ color: '#047857' }}>6 / 50 Lần giặt lụa nhẹ</strong>
              <div style={{ fontSize: 9, color: '#059669', marginTop: 1 }}>Độ óng ả bề mặt: 96 Gu · Khuyến nghị ủi mặt trái</div>
            </div>
          </div>

          {hibernationOpen && (
            <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: 6, marginTop: 8 }}>
              <strong style={{ fontSize: 12, color: '#166534', display: 'block', marginBottom: 8 }}>
                Đăng Ký Lưu Kho Buồng Két Ngủ Đông Trái Mùa (Atelier Hibernation Vault):
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#166534', display: 'block', marginBottom: 2 }}>Món đồ cần lưu kho:</label>
                  <select
                    value={hibernationItem}
                    onChange={e => setHibernationItem(e.target.value)}
                    style={{ width: '100%', fontSize: 11, padding: '5px 8px', border: '1px solid #86efac', borderRadius: 4 }}
                  >
                    <option value="Áo Khoác Blazer Dạ Len Ý Sartorial">Áo Khoác Blazer Dạ Len Ý Sartorial (Dạ dày mùa đông)</option>
                    <option value="Đầm Lụa Dạ Tiệc Dáng Dài">Đầm Lụa Dạ Tiệc Dáng Dài (Trang phục lễ hội cao cấp)</option>
                    <option value="Áo Măng Tô Dạ Cashmere 2 Hàng Khuy">Áo Măng Tô Dạ Cashmere 2 Hàng Khuy</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: '#166534', display: 'block', marginBottom: 2 }}>Thời gian bảo quản:</label>
                  <select
                    value={hibernationDuration}
                    onChange={e => setHibernationDuration(e.target.value as any)}
                    style={{ width: '100%', fontSize: 11, padding: '5px 8px', border: '1px solid #86efac', borderRadius: 4 }}
                  >
                    <option value="3_MONTHS">3 Tháng (120.000₫ · Tặng 1 lần giặt hấp)</option>
                    <option value="6_MONTHS">6 Tháng (240.000₫ · Tặng 1 lần giặt + túi vải canvas)</option>
                    <option value="12_MONTHS">12 Tháng (420.000₫ · Tặng 2 lần giặt + bảo hiểm 50tr)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: '#15803d', fontWeight: 600 }}>
                  ✓ Bưu tá xe điện lấy đồ tận nhà trong túi niêm phong zip-seal tamper-evident
                </span>
                <button
                  type="button"
                  className="button"
                  style={{ fontSize: 11, padding: '5px 14px', background: '#166534', color: '#fff' }}
                  onClick={() => {
                    const fee = hibernationDuration === '3_MONTHS' ? 120000 : hibernationDuration === '6_MONTHS' ? 240000 : 420000;
                    const code = `HIBERNATE-VAULT-${Math.floor(1000 + Math.random() * 9000)}`;
                    const durationLabel = hibernationDuration === '3_MONTHS' ? '3 Tháng' : hibernationDuration === '6_MONTHS' ? '6 Tháng' : '12 Tháng';
                    const newEntry = {
                      id: `HIB-${Date.now().toString().slice(-4)}`,
                      item: hibernationItem,
                      duration: `${durationLabel} (Atelier Care)`,
                      fee,
                      code,
                      date: new Date().toLocaleDateString('vi-VN'),
                    };
                    const updated = [newEntry, ...hibernationBooked];
                    setHibernationBooked(updated);
                    try {
                      localStorage.setItem('nexora_garment_hibernation', JSON.stringify(updated));
                    } catch {}
                    setHibernationOpen(false);
                  }}
                >
                  Xác Nhận Gửi Két Bảo An (+150 Xu Xanh)
                </button>
              </div>
            </div>
          )}

          {hibernationBooked.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11 }}>
              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Phiếu gửi két ngủ đông đang có hiệu lực:</span>
              <div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
                {hibernationBooked.slice(0, 2).map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 10 }}>
                    <span><strong>{b.item}</strong> · {b.duration}</span>
                    <span style={{ color: '#166534', fontWeight: 700 }}>Mã: {b.code} ({vnd(b.fee)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Bảng Cảm Hứng & Ghim Phong Cách Thời Trang Cá Nhân (Personal Style Moodboard · USER-STYLE-MOODBOARD-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Pin size={18} color="var(--clay)" /> Bảng Cảm Hứng Phong Cách Cá Nhân (USER-STYLE-MOODBOARD-01)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Lưu giữ những gam màu, chất liệu và phom dáng truyền cảm hứng nhất cho bản sắc {archetype} của bạn.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => setAddingPin(!addingPin)}
            >
              <Sparkles size={13} /> {addingPin ? 'Hủy thêm thẻ' : '+ Thêm thẻ cảm hứng'}
            </button>
            <Link
              href="/cong-dong"
              className="button"
              style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Share2 size={13} /> Chia sẻ lên Lookbook
            </Link>
          </div>
        </div>

        {/* Adding Pin Form */}
        {addingPin && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPinTitle.trim()) return;
              const newPin = {
                id: Date.now().toString(),
                title: newPinTitle.trim(),
                note: newPinNote.trim() || 'Cảm hứng phối đồ độc bản',
                palette: newPinPalette,
                tag: `#${newPinTitle.replace(/\s+/g, '')}`,
              };
              const updated = [newPin, ...moodboardPins];
              setMoodboardPins(updated);
              try {
                localStorage.setItem('nexora_style_moodboards', JSON.stringify(updated));
              } catch {}
              setNewPinTitle('');
              setNewPinNote('');
              setAddingPin(false);
            }}
            style={{ marginBottom: 14, padding: 12, background: '#faf9f5', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 10 }}>
              <label>
                Tiêu đề cảm hứng:
                <input
                  type="text"
                  required
                  placeholder="VD: Cát Vàng Mùa Thu..."
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>
              <label>
                Mô tả chi tiết / Sợi dệt:
                <input
                  type="text"
                  placeholder="VD: Áo dệt kim mịn màng phối blazer..."
                  value={newPinNote}
                  onChange={(e) => setNewPinNote(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>
              <label>
                Tông màu chủ đạo:
                <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                  {['#d6cbba', '#1c1917', '#1e3a8a', '#b45309', '#f8fafc', '#15803d'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: c,
                        border: newPinPalette === c ? '2px solid var(--clay)' : '1px solid var(--line)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setNewPinPalette(c)}
                    />
                  ))}
                </div>
              </label>
            </div>
            <button type="submit" className="button" style={{ fontSize: 11, padding: '6px 14px' }}>
              Ghim vào Moodboard
            </button>
          </form>
        )}

        {/* Moodboard Visual Pin Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {moodboardPins.map((pin) => (
            <div
              key={pin.id}
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ height: 48, background: pin.palette, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10px' }}>
                <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.85)', padding: '1px 5px', borderRadius: 2, fontWeight: 700, color: 'var(--ink)' }}>
                  {pin.tag}
                </span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <strong style={{ fontSize: 13, display: 'block', color: 'var(--ink)', marginBottom: 4 }}>
                  {pin.title}
                </strong>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {pin.note}
                </p>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--clay)' }}>
                  <span>✓ Style Moodboard</span>
                  <button
                    type="button"
                    className="text-button"
                    style={{ fontSize: 10, padding: 0, color: 'var(--muted)' }}
                    onClick={() => {
                      const updated = moodboardPins.filter((p) => p.id !== pin.id);
                      setMoodboardPins(updated);
                      try {
                        localStorage.setItem('nexora_style_moodboards', JSON.stringify(updated));
                      } catch {}
                    }}
                  >
                    Gỡ ghim
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Lịch Trình Sự Kiện & Chuẩn Bị Trang Phục Cá Nhân (USER-FASHION-CALENDAR-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Calendar size={18} color="var(--clay)" /> Lịch Trình Sự Kiện &amp; Chuẩn Bị Trang Phục (USER-FASHION-CALENDAR-01)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Lên lịch phối đồ đón đầu sự kiện trong tuần, đồng bộ dự báo thời tiết và tự động kích hoạt nhắc hẹn giặt hấp đồ hiệu VAS Care.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => setAddingEvent(!addingEvent)}
            >
              <Plus size={13} /> {addingEvent ? 'Hủy thêm lịch' : '+ Thêm sự kiện & set đồ'}
            </button>
            <Link
              href="/phoi-do"
              className="button"
              style={{ fontSize: 11, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Layers size={13} /> Mở Studio Phối Đồ
            </Link>
          </div>
        </div>

        {/* Add Event Form */}
        {addingEvent && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newEventTitle.trim()) return;
              const newEv = {
                id: `ev-${Date.now()}`,
                title: newEventTitle.trim(),
                date: newEventDate,
                time: newEventTime,
                occasion: newEventOccasion,
                outfit: newEventOutfit,
                weather: 'Dự báo: 28°C · Nắng đẹp',
                vasReminder: newEventVasReminder,
              };
              const updated = [...fashionEvents, newEv];
              setFashionEvents(updated);
              try {
                localStorage.setItem('nexora_fashion_events', JSON.stringify(updated));
              } catch {}
              setNewEventTitle('');
              setAddingEvent(false);
            }}
            style={{ marginBottom: 14, padding: 12, background: '#faf9f5', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 10 }}>
              <label>
                Tên sự kiện:
                <input
                  type="text"
                  required
                  placeholder="VD: Tiệc Kỷ Niệm Công Ty..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>

              <label>
                Ngày diễn ra:
                <input
                  type="text"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>

              <label>
                Giờ &amp; Ngữ cảnh:
                <input
                  type="text"
                  required
                  value={newEventOccasion}
                  onChange={(e) => setNewEventOccasion(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>

              <label>
                Set đồ chỉ định diện:
                <input
                  type="text"
                  required
                  value={newEventOutfit}
                  onChange={(e) => setNewEventOutfit(e.target.value)}
                  style={{ marginTop: 4, width: '100%', fontSize: 12, padding: '6px 8px' }}
                />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={newEventVasReminder}
                onChange={(e) => setNewEventVasReminder(e.target.checked)}
                style={{ accentColor: 'var(--clay)' }}
              />
              Tự động gửi thông báo nhắc Spa / Giặt hấp đồ hiệu VAS Care trước 48 giờ
            </label>

            <button type="submit" className="button" style={{ fontSize: 11, padding: '6px 14px' }}>
              Lưu Vào Lịch Trình Phong Cách
            </button>
          </form>
        )}

        {/* Fashion Events Timeline Cards */}
        <div style={{ display: 'grid', gap: 10 }}>
          {fashionEvents.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: '12px 16px',
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ padding: '8px 12px', background: '#fdf8ea', borderRadius: 4, textAlign: 'center', border: '1px solid #fed7aa', minWidth: 85 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay)' }}>{ev.date}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                    <Clock size={10} /> {ev.time}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{ev.title}</strong>
                    <span style={{ fontSize: 9, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>
                      {ev.occasion}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--clay)', marginTop: 3, fontWeight: 500 }}>
                    👗 Trang phục: <strong>{ev.outfit}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 12 }}>
                    <span>⛅ {ev.weather}</span>
                    {ev.vasReminder && (
                      <span style={{ color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={11} /> Nhắc VAS Care trước 48h
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  href="/vas-care"
                  className="button secondary"
                  style={{ fontSize: 10, padding: '4px 8px' }}
                >
                  Đặt Spa Đồ Hiệu
                </Link>
                <button
                  type="button"
                  className="text-button"
                  style={{ padding: 4, color: '#94a3b8' }}
                  onClick={() => {
                    const updated = fashionEvents.filter((item) => item.id !== ev.id);
                    setFashionEvents(updated);
                    try {
                      localStorage.setItem('nexora_fashion_events', JSON.stringify(updated));
                    } catch {}
                  }}
                  title="Xóa sự kiện"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>

      {/* Rừng Xanh NEXORA & Bù Đắp Carbon Sinh Thái (NEXORA Green Forest · ECO-TREE-OFFSET-01) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Trees size={18} color="#166534" /> Rừng Xanh NEXORA &amp; Đóng Góp Sinh Thái (ECO-TREE-OFFSET-01)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Dự án “Một Đơn Hàng - Một Cây Xanh Bản Địa”. Mỗi lần bạn lựa chọn Đóng gói Xanh Eco Box, NEXORA trích quỹ bảo trợ và trồng cây tại các khu rừng phòng hộ Việt Nam.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Award size={13} /> NEXORA Eco Pioneer 2026
          </span>
        </div>

        {/* Eco Stats Counters */}
        <div className="stats" style={{ margin: '14px 0' }}>
          <div>
            <small style={{ color: '#166534' }}>CÂY XANH ĐÃ TRỒNG</small>
            <strong style={{ color: '#166534' }}>3 cây bản địa</strong>
          </div>
          <div>
            <small>CO2 ĐÃ BÙ ĐẮP</small>
            <strong>64.5 kg CO2e</strong>
          </div>
          <div>
            <small>XU THƯỞNG ECO BOX</small>
            <strong style={{ color: 'var(--clay)' }}>+150 Xu đã nhận</strong>
          </div>
          <div>
            <small>ĐÓNG GÓI XANH</small>
            <strong>3/3 đơn gần nhất</strong>
          </div>
        </div>

        {/* Digital Trees Registry */}
        <div style={{ marginTop: 14 }}>
          <strong style={{ fontSize: 13, display: 'block', marginBottom: 8, color: 'var(--ink)' }}>
            Sổ cái cây xanh bảo trợ của bạn (Digital Tree Registry):
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              {
                id: 'TREE-VN-CG-2401',
                species: 'Cây Bần Trắng (Sonneratia alba)',
                location: 'Rừng ngập mặn Cần Giờ, TP. Hồ Chí Minh',
                date: '12/10/2026',
                co2: '22.5 kg CO2e/năm',
                status: 'Đang sinh trưởng tốt (Năm 1)',
              },
              {
                id: 'TREE-VN-CP-2402',
                species: 'Cây Chò Chỉ (Parashorea chinensis)',
                location: 'Vườn quốc gia Cúc Phương, Ninh Bình',
                date: '04/11/2026',
                co2: '24.0 kg CO2e/năm',
                status: 'Đang sinh trưởng tốt (Năm 1)',
              },
              {
                id: 'TREE-VN-CM-2403',
                species: 'Cây Đước Đôi (Rhizophora apiculata)',
                location: 'Vườn quốc gia Mũi Cà Mau',
                date: '18/11/2026',
                co2: '18.0 kg CO2e/năm',
                status: 'Vừa hoàn tất gieo ươm',
              },
            ].map((t) => (
              <div
                key={t.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  padding: '10px 12px',
                  background: '#faf9f5',
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <TreePine size={13} /> {t.id}
                  </span>
                  <span style={{ fontSize: 9, background: '#eef2ed', color: '#166534', padding: '1px 5px', borderRadius: 2 }}>
                    Verified
                  </span>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.species}</div>
                <div style={{ color: 'var(--muted)' }}>{t.location}</div>
                <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed #e0ded6', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ngày gieo: {t.date}</span>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>{t.co2}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2>Ví Hoa hồng KOC (Affiliate · Giữ 15 ngày)</h2>
          <button
            type="button"
            className="text-button"
            onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${user.id}`)}
          >
            Sao chép link giới thiệu
          </button>
        </div>
        <p className="subtle" style={{ fontSize: 12 }}>Link giới thiệu: <code>/?ref={user.id}</code> (Nhận 5% hoa hồng đơn giao thành công)</p>
        <div className="stats" style={{ margin: '12px 0' }}>
          <div><small>TẠM GIỮ 15 NGÀY</small><strong>{vnd(affiliate.data?.held ?? 0)}</strong></div>
          <div><small>KHẢ DỤNG</small><strong>{vnd(affiliate.data?.available ?? 0)}</strong></div>
          <div><small>ĐÃ HỦY (HOÀN ĐƠN)</small><strong>{vnd(affiliate.data?.cancelled ?? 0)}</strong></div>
          <div><small>ĐƠN GIỚI THIỆU</small><strong>{affiliate.data?.items.length ?? 0}</strong></div>
        </div>
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2><Heart size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Danh sách trang phục yêu thích</h2>
          <span className="subtle">{wishlist.data?.length ?? 0} sản phẩm</span>
        </div>
        {wishlist.loading ? <Loading /> : !wishlist.data?.length ? (
          <p className="subtle">Bạn chưa lưu sản phẩm nào. Nhấn biểu tượng trái tim ở trang sản phẩm để lưu lại.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {wishlist.data.map(item => (
              <Link href={`/san-pham/${item.slug}`} key={item.id} className="product-card" style={{ border: '1px solid var(--line)', padding: 12, background: '#fff' }}>
                <div className="product-image" style={{ aspectRatio: '1/1' }}>
                  {item.images[0] && (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                      }}
                    />
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="subtle" style={{ fontSize: 11 }}>{item.shop.name}</span>
                  <h3 style={{ fontSize: 13, margin: '4px 0' }}>{item.name}</h3>
                  <p className="price" style={{ fontSize: 12, fontWeight: 600 }}>{vnd(Math.min(...item.variants.map(v => v.price)))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2>Voucher Trade-In của bạn</h2>
          <Link href="/trade-in" className="text-button">Gửi Trade-In mới →</Link>
        </div>
        {tradeIns.loading ? <Loading /> : !activeVouchers.length ? (
          <p className="subtle">Chưa có mã Voucher Trade-In khả dụng.</p>
        ) : activeVouchers.map(v => (
          <div key={v.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <strong>{v.voucherCode}</strong>
              <p className="subtle" style={{ margin: 0, fontSize: 12 }}>{v.brand} · {v.itemName}</p>
            </div>
            <strong>{vnd(v.finalValue ?? v.estimatedValue)}</strong>
          </div>
        ))}
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2><MapPin size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Sổ địa chỉ giao hàng</h2>
          <button className="text-button" onClick={() => setAdding(!adding)}>{adding ? 'Đóng' : '+ Thêm địa chỉ'}</button>
        </div>
        {adding && (
          <form onSubmit={addAddress} className="form" style={{ marginBottom: 20 }}>
            <label>Người nhận<input name="recipient" required minLength={2} /></label>
            <label>Số điện thoại<input name="phone" required pattern="0[0-9]{9}" inputMode="tel" /></label>
            <label>Địa chỉ cụ thể<input name="line" required minLength={5} /></label>
            <label>Tỉnh / thành phố<input name="province" required minLength={2} /></label>
            <button className="button" disabled={busy}>Lưu địa chỉ</button>
          </form>
        )}
        {addresses.loading ? <Loading /> : !addresses.data?.length ? (
          <p className="subtle">Chưa có địa chỉ giao hàng nào.</p>
        ) : addresses.data.map(a => (
          <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
            <strong>{a.recipient} · {a.phone}</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{a.line}, {a.province}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
