'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, MapPin, Package, RefreshCw, ShieldCheck, Sparkles, UserCheck, Layers, Calendar, Sun, CloudRain, Share2, Check, Shirt, ExternalLink, Leaf, Trees, TreePine, Award, Compass, Palette, Footprints, BarChart3, Calculator, TrendingDown, Pin, Image, Clock, Plus, Trash2, CheckCircle2, Scissors, Archive, Droplets, Thermometer, Wind, Receipt, FileSpreadsheet, Download, Video, Camera } from 'lucide-react';
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
  const fittings = useResource<any[]>(user ? '/concierge/fittings' : null);
  const swatchOrders = useResource<any[]>(user ? '/swatch-orders' : null);
  const materialPassports = useResource<{ ok: boolean; passports: any[] }>(user ? '/vault/material-passports' : null);
  const savedCapsules = useResource<any[]>(user ? '/vault/capsules' : null);
  const heritageFabrics = useResource<{ ok: boolean; fabrics: any[] }>('/fabrics');
  const myFabricReserves = useResource<any[]>(user ? '/vault/fabric-reserves' : null);
  const [reservingFabric, setReservingFabric] = useState<any>(null);
  const [reserveMeters, setReserveMeters] = useState<number>(2.5);
  const [reservePurpose, setReservePurpose] = useState<string>('May Đo Áo Blazer Bespoke');
  const [reserveRecipient, setReserveRecipient] = useState<string>('');
  const [reservePhone, setReservePhone] = useState<string>('');
  const [reserveNotes, setReserveNotes] = useState<string>('');
  const [reserveBusy, setReserveBusy] = useState<boolean>(false);
  const [reserveSuccessCert, setReserveSuccessCert] = useState<string | null>(null);
  const [reserveNotice, setReserveNotice] = useState<string | null>(null);
  const [copiedFabricCert, setCopiedFabricCert] = useState<string | null>(null);
  const [commissionFabricReserve, setCommissionFabricReserve] = useState<any>(null);
  const [commissionProductName, setCommissionProductName] = useState('');
  const [commissionShopId, setCommissionShopId] = useState('shop-nep');
  const [commissionShopName, setCommissionShopName] = useState('NÉP Studio');
  const [commissionMonogram, setCommissionMonogram] = useState('');
  const [commissionLining, setCommissionLining] = useState('Lụa Habotai tự nhiên cùng tông màu');
  const [commissionNotes, setCommissionNotes] = useState('');
  const [commissionBusy, setCommissionBusy] = useState(false);
  const [copiedDppCode, setCopiedDppCode] = useState<string | null>(null);
  const [capsuleNotice, setCapsuleNotice] = useState<string | null>(null);
  const [verifyCertCode, setVerifyCertCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyError, setVerifyError] = useState('');
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
      { id: '4', title: 'Terracotta Earth', palette: 'var(--gold-dark)', note: 'Nâu đất ấm nồng, phóng khoáng hòa nhịp đất trời', tag: '#EarthSartorial' },
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
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [
      {
        id: '#NX-BESPOKE-9921',
        productName: 'Áo Khoác Blazer Linen Normandy Khâu Tay Độc Bản',
        variant: 'Xanh Navy Đậm / Size 48',
        monogram: 'ELENA-VU',
        deposit: 1050000,
        queuePos: 4,
        createdAt: '18/11/2026',
        step: 3,
        lining: 'Lụa Tơ Tằm Bảo Lộc Hoạ Tiết Chìm',
      },
    ];
  });
  // Bespoke Atelier 5-Stage Crafting Progress & Escrow 30% Deposit Ledger
  const [activeBespokeStep, setActiveBespokeStep] = useState(3);
  const [liveCameraFeedOpen, setLiveCameraFeedOpen] = useState(false);
  const [homeFittingRequested, setHomeFittingRequested] = useState(false);
  const [copiedSwatchVoucher, setCopiedSwatchVoucher] = useState<string | null>(null);
  const [homeFittingModalOpen, setHomeFittingModalOpen] = useState(false);
  const [fittingTargetOrder, setFittingTargetOrder] = useState<any>(null);
  const [fittingDate, setFittingDate] = useState('26/11/2026');
  const [fittingTimeSlot, setFittingTimeSlot] = useState<'MORNING_09_11' | 'AFTERNOON_14_16' | 'EVENING_18_20'>('AFTERNOON_14_16');
  const [fittingAddress, setFittingAddress] = useState('Quận 1, TP. Hồ Chí Minh');
  const [fittingPhone, setFittingPhone] = useState('0901234567');
  const [fittingRecipient, setFittingRecipient] = useState('');
  const [fittingSuitcase, setFittingSuitcase] = useState(true);
  const [fittingNotes, setFittingNotes] = useState('');
  const [toileReviewModal, setToileReviewModal] = useState<any>(null);
  const [toileClientNote, setToileClientNote] = useState<string>('Vải mộc lên phom chuẩn, đồng ý cho hạ kéo cắt vải chính.');
  const [toileClientDecisionNotice, setToileClientDecisionNotice] = useState<string>('');

  // Creator Affiliate Income Statement & Automated PIT Withholding Compliance
  const [taxReportDownloaded, setTaxReportDownloaded] = useState(false);
  const [selectedTaxQuarter, setSelectedTaxQuarter] = useState<'Q4_2026' | 'Q3_2026'>('Q4_2026');
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
  const [selectedWeatherOutfit, setSelectedWeatherOutfit] = useState<number>(0);
  const [weatherScheduleNotice, setWeatherScheduleNotice] = useState<string>('');

  useEffect(() => {
    if (user) {
      api('/vault')
        .then((vault: any) => {
          if (vault?.passport) {
            setPassport((prev) => ({ ...prev, ...vault.passport }));
            try {
              localStorage.setItem('nexora_fashion_passport', JSON.stringify(vault.passport));
            } catch {}
          }
          if (vault?.bespoke && Array.isArray(vault.bespoke) && vault.bespoke.length > 0) {
            setBespokeOrders((prev) => {
              const combined = [...vault.bespoke, ...prev.filter(p => !vault.bespoke.some((v: any) => v.id === p.id))];
              return combined;
            });
          }
          if (vault?.events && Array.isArray(vault.events) && vault.events.length > 0) {
            setFashionEvents((prev) => {
              const combined = [...vault.events, ...prev.filter(p => !vault.events.some((v: any) => v.id === p.id))];
              return combined;
            });
          }
          if (vault?.moodboards && Array.isArray(vault.moodboards) && vault.moodboards.length > 0) {
            setMoodboardPins((prev) => {
              const combined = [...vault.moodboards, ...prev.filter(p => !vault.moodboards.some((v: any) => v.id === p.id))];
              return combined;
            });
          }
          if (vault?.hibernations && Array.isArray(vault.hibernations) && vault.hibernations.length > 0) {
            setHibernationBooked((prev) => {
              const combined = [...vault.hibernations, ...prev.filter(p => !vault.hibernations.some((v: any) => v.id === p.id))];
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  async function savePassport(e: FormEvent<HTMLFormElement>) {
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
    try {
      localStorage.setItem('nexora_fashion_passport', JSON.stringify(updated));
      await api('/vault/passport', 'POST', updated);
    } catch {}
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

      {/* Huy Hiệu Cam Kết Tiêu Dùng Xanh */}
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

      {/* Danh Sách Đặt Trước May Đo Thủ Công & Quản Trị Cọc Escrow */}
      {bespokeOrders.length > 0 && (
        <article className="panel" style={{ background: '#fdfbf7', border: '1px solid #fed7aa', marginBottom: 16 }}>
          <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Scissors size={20} color="var(--gold-dark)" />
              <div>
                <h2 style={{ margin: 0, fontSize: 15, color: '#78350f', fontFamily: 'var(--font-sans)' }}>
                  Tiến Trình Chế Tác Đo May Thủ Công 5 Chặng &amp; Cọc Escrow
                </h2>
                <p className="subtle" style={{ margin: '2px 0 0', fontSize: 11 }}>
                  Chế tác may đo Haute Couture bởi Master Tailor Hoàng Nam · Bảo chứng ký quỹ Escrow Sàn NEXORA
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 3, fontWeight: 700 }}>
                {bespokeOrders.length} tác phẩm đang chế tác
              </span>
              <button
                type="button"
                onClick={() => setLiveCameraFeedOpen(!liveCameraFeedOpen)}
                style={{
                  padding: '3px 8px',
                  background: liveCameraFeedOpen ? '#78350f' : '#fff',
                  color: liveCameraFeedOpen ? '#fff' : '#78350f',
                  border: '1px solid var(--gold-dark)',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Camera size={12} /> {liveCameraFeedOpen ? 'Đóng Cam Atelier' : 'Xem Trực Tiếp Atelier'}
              </button>
            </div>
          </div>

          {liveCameraFeedOpen && (
            <div style={{ marginBottom: 14, padding: 12, background: '#1c1917', borderRadius: 6, color: '#f5f5f4', border: '1px solid #44403c' }}>
              <div className="row between" style={{ marginBottom: 8, fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                  LIVE ATELIER CAM · BÀN THỢ MASTER TAILOR
                </span>
                <span style={{ color: '#a8a29e' }}>FHD 1080p · 60 FPS · Cụm Bàn Cắt May #02</span>
              </div>
              <div style={{ height: 140, background: '#292524', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed #57534e' }}>
                <Video size={28} color="#d6d3d1" />
                <span style={{ fontSize: 12, color: '#d6d3d1' }}>Nghệ nhân Hoàng Nam đang khâu tay lớp lót lụa tơ tằm Bảo Lộc cho ve áo</span>
                <span style={{ fontSize: 10, color: '#a8a29e' }}>Thời gian thực: {new Date().toLocaleTimeString('vi-VN')} · Độ ẩm phòng may: 48% RH</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 14 }}>
            {bespokeOrders.map((bo) => (
              <div key={bo.id} style={{ background: '#ffffff', borderRadius: 6, border: '1px solid #fed7aa', padding: 16 }}>
                <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{bo.productName}</strong>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Hồ sơ: <strong>#{bo.id}</strong> · Ngày khởi tạo: {bo.createdAt} · Biến thể: {bo.variant}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: 3, fontWeight: 700 }}>
                      Suất Hàng Chờ #{bo.queuePos}/15
                    </span>
                    <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 800, marginTop: 4 }}>
                      Cọc Escrow 30%: {vnd(bo.deposit)}
                    </div>
                  </div>
                </div>

                {/* Heritage Fabric Provenance Banner */}
                {(bo as any).isHeritageFabric && (
                  <div style={{ margin: '0 0 10px', padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, fontSize: 11, color: '#92400e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <span>
                        Canh vải di sản: <strong>{(bo as any).fabricName}</strong> (Chứng thư: <code style={{ fontFamily: 'monospace' }}>{(bo as any).fabricCertificate || (bo as any).fabricBoltCode}</code>)
                      </span>
                      <span style={{ fontWeight: 600, color: '#166534' }}>
                        Đã khấu trừ cọc vải 30%: {vnd((bo as any).depositCredited || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Escrow and Detail Tag Bar */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', margin: '8px 0 14px', padding: '8px 12px', background: '#fafaf9', borderRadius: 4, fontSize: 11 }}>
                  <span>Monogram ve áo: <strong style={{ color: 'var(--gold-dark)', fontFamily: 'var(--font-sans)', letterSpacing: 1.2 }}>{bo.monogram}</strong></span>
                  <span>·</span>
                  <span>Lớp lót may đo: <strong>{bo.lining || 'Lụa Tơ Tằm Bảo Lộc'}</strong></span>
                  <span>·</span>
                  <span>Trạng thái ký quỹ: <strong style={{ color: '#16a34a' }}>Bảo lưu Escrow Sàn (#ESCROW-NX-{bo.id.slice(-4)})</strong></span>
                </div>

                {/* Interactive 5-Step Crafting Timeline */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 8 }}>
                    {[
                      { step: 1, title: 'Chặng 1: Phóng rập mộc', desc: 'Định hình form số đo 3 vòng' },
                      { step: 2, title: 'Chặng 2: Cắt & Thêu tay', desc: 'Thêu chỉ lụa Monogram' },
                      { step: 3, title: 'Chặng 3: Lên khung canvas', desc: 'Đính kết lót tơ tằm Bảo Lộc' },
                      { step: 4, title: 'Chặng 4: Ủ hơi & UV-C', desc: 'Kiểm tra độ rủ & khử khuẩn' },
                      { step: 5, title: 'Chặng 5: Đóng hộp sồi', desc: 'Bàn giao xe điện VinFast Feliz' },
                    ].map((st) => {
                      const isPast = activeBespokeStep > st.step;
                      const isCurrent = activeBespokeStep === st.step;
                      return (
                        <div
                          key={st.step}
                          onClick={() => setActiveBespokeStep(st.step)}
                          style={{
                            padding: '8px 6px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            background: isCurrent ? '#fef3c7' : isPast ? '#f0fdf4' : '#f8fafc',
                            border: isCurrent ? '1.5px solid #d97706' : isPast ? '1px solid #86efac' : '1px solid #e2e8f0',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? '#92400e' : isPast ? '#166534' : '#64748b' }}>
                            {st.title}
                          </div>
                          <div style={{ fontSize: 9, color: isCurrent ? 'var(--gold-dark)' : '#94a3b8', marginTop: 2, lineHeight: 1.2 }}>
                            {st.desc}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 9, fontWeight: 700, color: isPast ? '#16a34a' : isCurrent ? '#d97706' : '#cbd5e1' }}>
                            {isPast ? '✓ Đạt chuẩn' : isCurrent ? '● Đang làm' : '○ Chờ tiếp'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(activeBespokeStep / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #d97706)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Toile Muslin Co-Creation Badge & Action */}
                <div style={{ marginTop: 12, padding: '10px 14px', background: (bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? '#f0fdf4' : (bo as any).toileMilestone?.status === 'REVISION_REQUESTED' ? '#fef2f2' : '#fdf8f0', border: `1px solid ${(bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? '#86efac' : (bo as any).toileMilestone?.status === 'REVISION_REQUESTED' ? '#fca5a5' : '#fed7aa'}`, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: (bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? '#166534' : (bo as any).toileMilestone?.status === 'REVISION_REQUESTED' ? '#991b1b' : '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Scissors size={14} />
                      {(bo as any).toileMilestone?.status === 'CLIENT_APPROVED'
                        ? 'Mẫu Vải Mộc (Toile Muslin): Đã duyệt cắt vải chính'
                        : (bo as any).toileMilestone?.status === 'REVISION_REQUESTED'
                        ? 'Mẫu Vải Mộc (Toile Muslin): Đang tinh chỉnh rập theo phản hồi'
                        : 'Mẫu Vải Mộc (Toile Muslin): Cần bạn thẩm định & duyệt hạ kéo'}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      Thử form 3 góc độ (Mặt trước, Góc nghiêng 45°, Lưng) trước khi xưởng hạ kéo cắt thước vải thật.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="button secondary"
                    style={{
                      fontSize: 11,
                      padding: '5px 12px',
                      borderColor: (bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? '#16a34a' : 'var(--gold-dark)',
                      color: (bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? '#16a34a' : 'var(--gold-dark)',
                    }}
                    onClick={() => {
                      setToileReviewModal(bo);
                      if ((bo as any).toileMilestone?.clientNote) {
                        setToileClientNote((bo as any).toileMilestone.clientNote);
                      } else {
                        setToileClientNote('Vải mộc lên phom chuẩn, đường may phẳng mịn. Đồng ý cho hạ kéo cắt vải chính.');
                      }
                    }}
                  >
                    {(bo as any).toileMilestone?.status === 'CLIENT_APPROVED' ? 'Xem Lại Hồ Sơ Mộc →' : 'Phòng Duyệt Mẫu Vải Mộc →'}
                  </button>
                </div>

                {/* Escrow Guarantee & Home Fitting Appointment */}
                <div className="row between" style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 10, fontSize: 11 }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} color="#16a34a" />
                    Cọc 30% được giữ trong tài khoản Escrow Sàn NEXORA, chỉ giải ngân cho thợ khi bạn mặc thử vừa vặn tại nhà.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFittingTargetOrder(bo);
                      setFittingRecipient(user?.name || '');
                      setFittingPhone(addresses.data?.[0]?.phone || '0901234567');
                      setFittingAddress(addresses.data?.[0] ? `${addresses.data[0].line}, ${addresses.data[0].province}` : 'Quận 1, TP. Hồ Chí Minh');
                      setHomeFittingModalOpen(true);
                    }}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--ink)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <UserCheck size={13} />
                    Đặt Lịch Thử Đồ Tại Nhà (Home Fitting)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* Lịch Hẹn Thử Đồ Tại Nhà VIP (Home-Fitting Concierge Ledger) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <UserCheck size={18} color="var(--gold-dark)" /> Lịch Hẹn Thử Đồ Tại Nhà VIP (Home-Fitting Concierge)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Theo dõi hành trình chuyên viên styling mang trang phục cùng vali 40+ mẫu vải đến phục vụ riêng tại tư gia.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#FAF8F5', color: 'var(--gold-dark)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
            Valet Stylist Service
          </span>
        </div>

        {fittings.loading ? (
          <Loading />
        ) : !fittings.data?.length ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', background: '#FAF8F5', border: '1px dashed var(--line)', borderRadius: 3 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
              Bạn chưa có lịch hẹn thử đồ tại nhà nào đang diễn ra.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--gold-dark)' }}>
              Dịch vụ miễn phí 100% cho mọi đơn may đo Bespoke Atelier hoặc hóa đơn đồ hiệu từ 2.000.000₫.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fittings.data.map((fit: any) => {
              const statusLabels: Record<string, { label: string; bg: string; color: string }> = {
                CONFIRMED: { label: 'Đã Xác Nhận Lịch', bg: '#EFF6FF', color: '#1E40AF' },
                VALET_ASSIGNED: { label: 'Đã Phân Công Stylist', bg: '#FEF9C3', color: '#854D0E' },
                EN_ROUTE: { label: 'Chuyên Viên Đang Di Chuyển', bg: '#F3E8FF', color: '#6B21A8' },
                COMPLETED: { label: 'Đã Hoàn Tất Thử Đồ', bg: '#DCFCE7', color: '#166534' },
                ORDER_CONVERTED: { label: 'Đã Chốt May Đo / Mua Hàng', bg: '#ECFDF5', color: '#047857' },
                CANCELLED: { label: 'Đã Hủy Lịch', bg: '#FEE2E2', color: '#991B1B' },
              };
              const st = statusLabels[fit.status] || { label: fit.status, bg: '#F1F5F9', color: '#475569' };

              return (
                <div key={fit.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '14px 16px', background: '#FFFFFF' }}>
                  <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{fit.productName}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        Mã cuộc hẹn: <strong style={{ fontFamily: 'monospace' }}>{fit.id}</strong>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                      {st.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, fontSize: 11, background: '#FAF8F5', padding: '10px 12px', borderRadius: 3, margin: '8px 0' }}>
                    <div>
                      <div>Thời gian hẹn: <strong>{fit.appointmentDate} ({fit.timeSlot})</strong></div>
                      <div>Địa chỉ: <strong>{fit.address}</strong></div>
                    </div>
                    {fit.stylistName && (
                      <div>
                        <div>Chuyên viên phục vụ:</div>
                        <strong>{fit.stylistName} ({fit.stylistPhone})</strong>
                      </div>
                    )}
                  </div>

                  {fit.fabricSuitcaseRequested && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#166534', background: '#F0FDF4', padding: '4px 8px', borderRadius: 2, display: 'inline-block' }}>
                      ✓ Kèm Vali 40+ mẫu vải Len &amp; Lụa tự nhiên phục vụ chọn chất liệu tại chỗ
                    </div>
                  )}

                  {fit.valetNotes && (
                    <div style={{ marginTop: 6, fontSize: 11, fontStyle: 'italic', color: 'var(--muted)' }}>
                      Ghi chú chuyên viên: "{fit.valetNotes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* Hộp Thẻ Mẫu Vải Cầm Tay & Voucher Hoàn Cọc (Atelier Fabric Swatch Kits) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Layers size={18} color="var(--gold-dark)" /> Hộp Thẻ Mẫu Vải Cầm Tay &amp; Voucher Bảo Chứng
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Theo dõi bưu phẩm mẫu vải gửi hỏa tốc tận nhà và sử dụng voucher hoàn tiền bảo chứng 100% khi may đo.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#FAF8F5', color: 'var(--gold-dark)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
            Hoàn Cọc 100% Qua Voucher
          </span>
        </div>

        {swatchOrders.loading ? (
          <Loading />
        ) : !swatchOrders.data?.length ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', background: '#FAF8F5', border: '1px dashed var(--line)', borderRadius: 3 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
              Bạn chưa đặt hộp mẫu vải nào. Khi xem chi tiết sản phẩm, bạn có thể yêu cầu gửi mẫu vải tận tay để cảm nhận độ dày, độ rủ và chạm sớ vải trước khi may đo.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {swatchOrders.data.map((sw: any) => (
              <div key={sw.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '14px 16px', background: '#FFFFFF' }}>
                <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{sw.productName}</strong>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
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
                    {sw.status === 'DISPATCHED' ? '✓ Đã xuất bưu tá hỏa tốc' : '● Chờ bưu tá đóng gói'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, fontSize: 11, background: '#FAF8F5', padding: '10px 12px', borderRadius: 3, margin: '8px 0' }}>
                  <div>
                    <div>Người nhận: <strong>{sw.recipientName}</strong> ({sw.phone})</div>
                    <div>Địa chỉ giao: <strong>{sw.address}</strong></div>
                    <div style={{ marginTop: 4, color: '#475569' }}>
                      Vận đơn: <strong>{sw.carrier || 'EMS Hỏa Tốc'}</strong> {sw.trackingNumber ? `(${sw.trackingNumber})` : ''}
                    </div>
                  </div>

                  {/* Voucher Card */}
                  <div style={{ background: '#fff', border: '1px dashed var(--gold-dark)', borderRadius: 3, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                        Mã Voucher Hoàn Cọc 50.000₫
                      </span>
                      <strong style={{ fontSize: 13, color: 'var(--gold-dark)', fontFamily: 'monospace' }}>
                        {sw.voucherCode}
                      </strong>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      style={{ fontSize: 10.5, padding: 0, marginTop: 4, textAlign: 'left', fontWeight: 600, color: '#166534' }}
                      onClick={() => {
                        navigator.clipboard.writeText(sw.voucherCode);
                        setCopiedSwatchVoucher(sw.voucherCode);
                        setTimeout(() => setCopiedSwatchVoucher(null), 2000);
                      }}
                    >
                      {copiedSwatchVoucher === sw.voucherCode ? '✓ Đã sao chép mã' : 'Sao chép mã voucher →'}
                    </button>
                  </div>
                </div>

                {Array.isArray(sw.swatches) && (
                  <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>Mẫu vải trong hộp:</span>
                    {sw.swatches.map((item: string, idx: number) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: 2, fontSize: 10 }}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Bộ Sưu Tập Chứng Thư Vật Liệu & Hộ Chiếu DPP (Digital Product Passport & COA) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Award size={18} color="#059669" /> Hộ Chiếu Vật Liệu &amp; Chứng Thư Xuất Xứ (Digital Product Passport · DPP)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Lưu giữ vĩnh viễn nguồn gốc xơ sợi, lô mẻ dệt mộc và đội ngũ nghệ nhân may đo cho các trang phục bạn sở hữu.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
            SHA-256 Cryptographic Sealed
          </span>
        </div>

        {/* Live DPP Verification Tool */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '14px 16px', marginBottom: 16 }}>
          <strong style={{ fontSize: 12, display: 'block', marginBottom: 6, color: 'var(--ink)' }}>
            Tra Cứu &amp; Đối Soát Tính Nguyên Bản Mã Chứng Thư DPP
          </strong>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!verifyCertCode.trim()) return;
              setVerifyBusy(true);
              setVerifyError('');
              setVerifyResult(null);
              try {
                const res = await api<{ ok: boolean; valid: boolean; passport?: any; message?: string }>('/passport/verify', 'POST', {
                  certificateCode: verifyCertCode.trim(),
                });
                setVerifyResult(res);
              } catch (err) {
                setVerifyError((err as Error).message);
              } finally {
                setVerifyBusy(false);
              }
            }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            <input
              type="text"
              placeholder="Nhập mã chứng thư (vd: NX-DPP-LINEN-SH-SHA256)"
              value={verifyCertCode}
              onChange={(e) => setVerifyCertCode(e.target.value)}
              required
              style={{ flex: 1, minWidth: 260, padding: '7px 12px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, fontFamily: 'monospace' }}
            />
            <button
              type="submit"
              className="button"
              style={{ background: '#059669', borderColor: '#059669', fontSize: 12 }}
              disabled={verifyBusy}
            >
              {verifyBusy ? 'Đang đối soát...' : 'Xác Thực Ngay →'}
            </button>
          </form>

          {verifyError && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: '#b91c1c' }}>
              ✕ {verifyError}
            </div>
          )}

          {verifyResult && (
            <div style={{ marginTop: 10, padding: 12, background: verifyResult.valid ? '#f0fdf4' : '#fef2f2', border: `1px solid ${verifyResult.valid ? '#86efac' : '#fca5a5'}`, borderRadius: 3, fontSize: 11.5 }}>
              {verifyResult.valid ? (
                <div>
                  <div style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> CHỨNG THƯ CHÍNH THỨC NGUYÊN BẢN HỢP LỆ
                  </div>
                  <div style={{ marginTop: 4, color: 'var(--ink)' }}>
                    Mã: <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{verifyResult.certificateCode}</code> · Phát hành bởi: {verifyResult.issuer}
                  </div>
                  {verifyResult.passport && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#334155' }}>
                      Sản phẩm: <strong>{verifyResult.passport.productName}</strong> · Nguồn gốc: {verifyResult.passport.originLocation} · Xơ sợi: {verifyResult.passport.fiberComposition} · Thủ công: {verifyResult.passport.totalCraftHours || 34} giờ
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: '#991b1b', fontWeight: 600 }}>
                  ✕ {verifyResult.message || 'Mã chứng thư không tồn tại trên hệ thống sổ cái NEXORA.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buyer Passports List */}
        {materialPassports.loading ? (
          <Loading />
        ) : !materialPassports.data?.passports?.length ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', background: '#FAF8F5', border: '1px dashed var(--line)', borderRadius: 3 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
              Chưa có chứng thư nào trong vault. Khi bạn hoàn tất đơn hàng hoặc may đo bespoke, mỗi trang phục sẽ được phát hành một Hộ Chiếu DPP độc bản lưu giữ tại đây.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {materialPassports.data.passports.map((p: any, idx: number) => (
              <div key={idx} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '14px 16px', background: '#FFFFFF', borderLeft: '3px solid #10b981' }}>
                <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{p.productName}</strong>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Atelier chế tác: <strong>{p.shopName}</strong> · Lô sợi: <code style={{ fontFamily: 'monospace' }}>{p.yarnLot}</code>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)' }}>
                      {p.certificateCode}
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      style={{ fontSize: 10.5, padding: 0, marginTop: 2, color: '#059669', fontWeight: 600 }}
                      onClick={() => {
                        navigator.clipboard.writeText(p.certificateCode);
                        setCopiedDppCode(p.certificateCode);
                        setTimeout(() => setCopiedDppCode(null), 2000);
                      }}
                    >
                      {copiedDppCode === p.certificateCode ? '✓ Đã sao chép' : 'Sao chép mã định danh →'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11, background: '#f8fafc', padding: '8px 12px', borderRadius: 2 }}>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Xuất xứ xơ sợi:</span>
                    <strong>{p.originLocation}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Thành phần chất liệu:</span>
                    <strong>{p.fiberComposition}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Định lượng dệt mộc:</span>
                    <strong>{p.weaveDensity}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10 }}>Tổng giờ công nghệ nhân:</span>
                    <strong style={{ color: 'var(--gold-dark)' }}>{p.totalCraftHours || 34} giờ may đo thủ công</strong>
                  </div>
                </div>

                {Array.isArray(p.artisans) && (
                  <div style={{ marginTop: 8, fontSize: 10.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>Nghệ nhân thực hiện:</span>
                    {p.artisans.map((a: any, i: number) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#1e293b', padding: '1px 6px', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        {a.name} ({a.role} · {a.handcraftHours}h)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Bộ Sưu Tập Tủ Đồ Nhộng Độc Bản (Curated Capsule Wardrobes · 5x5 Slow Fashion Matrix) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Archive size={18} color="var(--gold-dark)" /> Bộ Sưu Tập Tủ Đồ Nhộng (Capsule Wardrobes)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Các phương án tủ đồ nhộng 5 món đa ứng dụng đã lưu từ Phòng Thử Đồ (Lookbook &amp; Capsule Planner), tối ưu hóa Cost-Per-Wear và giảm phát thải thời trang nhanh.
            </p>
          </div>
          <Link
            href="/phoi-do"
            className="text-button"
            style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gold-dark)', fontWeight: 600 }}
          >
            <Plus size={14} /> Thiết Kế Tủ Đồ Mới →
          </Link>
        </div>

        {capsuleNotice && (
          <div style={{ marginBottom: 12 }}>
            <Notice>{capsuleNotice}</Notice>
          </div>
        )}

        {savedCapsules.loading ? (
          <Loading />
        ) : !savedCapsules.data?.length ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', background: '#FAF8F5', border: '1px dashed var(--line)', borderRadius: 3 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
              Chưa có tủ đồ nhộng nào trong vault của bạn. Hãy trải nghiệm phối 5 món đồ mộc cao cấp tại Phòng Thử Đồ để tạo nên 12 phong cách sống với ưu đãi đặc quyền -15% và tính toán chi phí trên mỗi lần mặc (Cost-Per-Wear).
            </p>
            <Link
              href="/phoi-do"
              className="button"
              style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
              <Sparkles size={14} /> Khám Phá Capsule Wardrobe Studio →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {savedCapsules.data.map((cap: any) => (
              <div key={cap.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '16px', background: '#FFFFFF', borderLeft: '3px solid var(--gold-dark)' }}>
                <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{cap.title || 'Tủ Đồ Nhộng Thu Đông Quiet Luxury'}</strong>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Mã: <code style={{ fontFamily: 'monospace' }}>{cap.id}</code></span>
                      <span>·</span>
                      <span>Bảng màu: <strong style={{ color: 'var(--ink)' }}>{cap.palette || 'Quiet Luxury'}</strong></span>
                      <span>·</span>
                      <span>Lưu ngày: {cap.createdAt ? new Date(cap.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, background: '#eef2ed', color: '#166534', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
                      ✓ Phối {cap.outfitsCount || 12} Phong Cách
                    </span>
                    <button
                      type="button"
                      className="text-button"
                      style={{ fontSize: 11, color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px' }}
                      onClick={async () => {
                        try {
                          await api(`/vault/capsules/${cap.id}`, 'DELETE');
                          setCapsuleNotice('Đã gỡ tủ đồ nhộng khỏi Vault thành công.');
                          setTimeout(() => setCapsuleNotice(null), 3000);
                          savedCapsules.reload();
                        } catch (err) {
                          setError((err as Error).message);
                        }
                      }}
                    >
                      <Trash2 size={13} /> Xóa
                    </button>
                  </div>
                </div>

                {/* Investment & CPW Card */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, background: '#FAF8F5', padding: '12px 14px', borderRadius: 3, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block' }}>Tổng mức đầu tư (Đã -15%):</span>
                    <strong style={{ fontSize: 14, color: 'var(--gold-dark)' }}>{vnd(cap.totalInvestment || 0)}</strong>
                    {cap.bundleDiscount ? (
                      <div style={{ fontSize: 10, color: '#166534', marginTop: 1 }}>
                        Tiết kiệm đặc quyền {vnd(cap.bundleDiscount)}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block' }}>Chi phí trên lần mặc (CPW):</span>
                    <strong style={{ fontSize: 14, color: '#166534' }}>
                      ~{vnd(cap.estimatedCostPerWear || 18100)} / ngày
                    </strong>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                      Định mức bền bỉ trên 150 lần mặc
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block' }}>Chứng chỉ sinh thái:</span>
                    <strong style={{ fontSize: 12, color: 'var(--ink)' }}>100% Sợi mộc tự nhiên</strong>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>
                      GOTS Organic &amp; OEKO-TEX Standard
                    </div>
                  </div>
                </div>

                {/* Pieces list */}
                {Array.isArray(cap.pieces) && cap.pieces.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      5 Mảnh Ghép Trụ Cột Trong Tủ Đồ:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6 }}>
                      {cap.pieces.map((pc: any, pidx: number) => (
                        <div key={pidx} style={{ fontSize: 11, background: '#FFFFFF', border: '1px solid var(--line)', padding: '6px 10px', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{pc.name}</span>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{pc.material || 'Chất liệu tự nhiên tuyển chọn'}</div>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 600 }}>{vnd(pc.price || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="button"
                    style={{ fontSize: 11.5, padding: '7px 14px' }}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const items = (cap.pieces || []).map((p: any) => ({
                          variantId: `${p.id}-0-M`,
                          quantity: 1,
                        }));
                        if (items.length) {
                          await api('/cart/batch', 'POST', { items });
                          setCapsuleNotice(`Đã thêm trọn bộ ${items.length} món vào giỏ hàng với ưu đãi Capsule -15%!`);
                          router.push('/gio-hang');
                        }
                      } catch (err) {
                        setError((err as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <Package size={14} /> Thêm Trọn Bộ 5 Món Vào Giỏ Hàng (-15%)
                  </button>

                  <Link
                    href="/phoi-do"
                    className="button secondary"
                    style={{ fontSize: 11.5, padding: '7px 14px' }}
                  >
                    <Layers size={14} /> Tái Hiện Trên Ma Trận Phối Đồ →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Kho Sợi & Canh Vải Di Sản (Rare Heritage Fabric Vault · Suất Ký Quỹ Độc Bản) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Compass size={18} color="var(--gold-dark)" /> Kho Sợi &amp; Canh Vải Di Sản (Rare Heritage Fabric Reserve)
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Khám phá và ký quỹ cắt giữ các cuộn vải mộc dệt tay độc bản số lượng giới hạn từ các làng nghề truyền thống và vùng nguyên liệu quốc tế được bảo tồn.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#FAF8F5', color: 'var(--gold-dark)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: 2, fontWeight: 600 }}>
            Ký Quỹ Escrow 30% · Giữ Mét Vải Độc Bản
          </span>
        </div>

        {reserveNotice && (
          <div style={{ marginBottom: 12 }}>
            <Notice>{reserveNotice}</Notice>
          </div>
        )}

        {/* Client's Active Fabric Reserves */}
        {Array.isArray(myFabricReserves.data) && myFabricReserves.data.length > 0 && (
          <div style={{ marginBottom: 16, padding: 14, background: '#fdfbf7', border: '1px solid #fed7aa', borderRadius: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#78350f', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={14} color="#b45309" /> Chứng Thư Ký Quỹ Vải Quý Đang Nắm Giữ ({myFabricReserves.data.length})
              </span>
              <span style={{ fontSize: 10, color: '#92400e', background: '#fef3c7', padding: '2px 6px', borderRadius: 2 }}>
                Đã Bảo Lưu Trong Kho Atelier
              </span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {myFabricReserves.data.map((res: any, rIdx: number) => (
                <div key={rIdx} style={{ background: '#fff', border: '1px solid #fed7aa', padding: '12px 14px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 13.5, color: 'var(--ink)' }}>{res.fabricName}</strong>
                      {res.allocationStatus === 'COMMISSIONED' ? (
                        <span style={{ fontSize: 9.5, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                          ĐÃ CHUYỂN MAY ĐO #{res.allocatedToBespokeId ? res.allocatedToBespokeId.slice(-8).toUpperCase() : ''}
                        </span>
                      ) : (
                        <span style={{ fontSize: 9.5, color: '#b45309', background: '#fef3c7', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>
                          SẴN SÀNG CHỈ ĐỊNH MAY ĐO
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                      Mã: <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{res.certificateCode}</code> · Cắt giữ: <strong style={{ color: '#166534' }}>{res.meters} mét</strong> · Dự kiến: {res.purpose}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--gold-dark)' }}>{vnd(res.totalAmount)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        className="text-button"
                        style={{ fontSize: 10.5, padding: 0, color: '#059669', fontWeight: 600 }}
                        onClick={() => {
                          navigator.clipboard.writeText(res.certificateCode);
                          setCopiedFabricCert(res.certificateCode);
                          setTimeout(() => setCopiedFabricCert(null), 2000);
                        }}
                      >
                        {copiedFabricCert === res.certificateCode ? '✓ Đã sao chép' : 'Sao chép mã'}
                      </button>
                      {res.allocationStatus !== 'COMMISSIONED' && (
                        <button
                          type="button"
                          className="button"
                          style={{ fontSize: 10.5, padding: '3px 8px', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                          onClick={() => {
                            setCommissionFabricReserve(res);
                            setCommissionProductName(res.purpose || 'Áo Blazer Bespoke May Đo Từ Vải Quý');
                            setCommissionShopId('shop-nep');
                            setCommissionShopName('NÉP Studio');
                            setCommissionMonogram('');
                            setCommissionLining('Lụa Habotai tự nhiên cùng tông màu');
                            setCommissionNotes('');
                          }}
                        >
                          May đo từ súc vải này →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fabric Bolts Grid */}
        {heritageFabrics.loading ? (
          <Loading />
        ) : !heritageFabrics.data?.fabrics?.length ? (
          <Notice>Kho lưu trữ đang cập nhật các lô vải di sản mùa mới.</Notice>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {heritageFabrics.data.fabrics.map((f: any) => (
              <div key={f.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: '14px 16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: f.hexColor, border: '1px solid #cbd5e1', display: 'inline-block' }} />
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{f.colorName}</span>
                    </div>
                    <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>{f.code}</code>
                  </div>

                  <strong style={{ fontSize: 14, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                    {f.name}
                  </strong>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                    Xuất xứ: <strong>{f.origin}</strong>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: 11.5, color: '#475569', lineHeight: 1.45 }}>
                    {f.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10.5, background: '#FAF8F5', padding: '8px 10px', borderRadius: 3, marginBottom: 10 }}>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Định lượng dệt:</span>
                      <strong>{f.gsm} GSM</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Khổ vải rộng:</span>
                      <strong>{f.widthCm} cm</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Lô dệt mộc:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{f.yarnLot}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block' }}>Thu hoạch:</span>
                      <strong>Năm {f.harvestYear}</strong>
                    </div>
                  </div>

                  {/* Meterage availability bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--muted)' }}>Tồn khả dụng trong kho:</span>
                      <strong style={{ color: f.availableMeterage > 10 ? '#166534' : '#dc2626' }}>
                        {f.availableMeterage}m / {f.totalMeterage}m
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.round((f.availableMeterage / f.totalMeterage) * 100)}%`,
                          height: '100%',
                          background: f.availableMeterage > 10 ? '#10b981' : '#f59e0b',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="row between" style={{ alignItems: 'baseline', marginBottom: 10, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>Giá niêm yết vải quý:</span>
                      <strong style={{ fontSize: 14, color: 'var(--gold-dark)' }}>{vnd(f.pricePerMeter)}</strong>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}> / mét</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#166534', fontWeight: 600 }}>Cọc 30% Escrow</span>
                  </div>

                  <button
                    type="button"
                    className="button full"
                    style={{ fontSize: 11.5, padding: '8px 12px' }}
                    onClick={() => {
                      setReservingFabric(f);
                      setReserveMeters(2.5);
                      setReservePurpose('May Đo Áo Blazer Bespoke');
                      setReserveSuccessCert(null);
                    }}
                  >
                    Ký Quỹ Cắt Giữ Vải Quý →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Modal Khởi Tạo May Đo Từ Súc Vải Di Sản (Commission Fabric to Bespoke Modal) */}
      {commissionFabricReserve && (
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
            maxWidth: 540,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>MAY ĐO TỪ VẢI DI SẢN</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Chỉ Định May Đo Bespoke</h3>
              </div>
              <button
                type="button"
                onClick={() => setCommissionFabricReserve(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: 4, marginBottom: 16, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{commissionFabricReserve.fabricName}</strong>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-dark)', fontSize: 11 }}>
                  {commissionFabricReserve.certificateCode}
                </span>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                Số mét vải bảo lưu: <strong>{commissionFabricReserve.meters} mét</strong> · Xuất xứ: {commissionFabricReserve.origin || 'Làng nghề di sản'}
              </div>
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--line)', color: '#166534', fontSize: 11 }}>
                Tiền cọc giữ vải 30% đã thanh toán: <strong>{vnd(commissionFabricReserve.depositAmount || Math.round(commissionFabricReserve.totalAmount * 0.3))}</strong> (Sẽ được tự động khấu trừ 100% vào đơn may đo)
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setCommissionBusy(true);
                try {
                  const res = await api(`/vault/fabric-reserves/${commissionFabricReserve.id}/commission`, 'POST', {
                    productName: commissionProductName,
                    shopId: commissionShopId,
                    shopName: commissionShopName,
                    monogram: commissionMonogram,
                    lining: commissionLining,
                    notes: commissionNotes,
                    passport: passport,
                  }) as { ok?: boolean; bespoke?: any };
                  if (res?.bespoke) {
                    setBespokeOrders((prev: any[]) => [res.bespoke, ...prev]);
                  }
                  myFabricReserves.reload();
                  setReserveNotice('Khởi tạo đơn may đo từ súc vải di sản thành công! Xưởng may NÉP Studio đã tiếp nhận hồ sơ.');
                  setCommissionFabricReserve(null);
                } catch (err: any) {
                  setReserveNotice(err.message || 'Không thể khởi tạo may đo');
                } finally {
                  setCommissionBusy(false);
                }
              }}
              style={{ display: 'grid', gap: 12 }}
            >
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Xưởng May Đồng Sáng Tạo (Partner Atelier)
                </label>
                <select
                  value={commissionShopId}
                  onChange={e => {
                    setCommissionShopId(e.target.value);
                    setCommissionShopName(e.target.value === 'shop-nep' ? 'NÉP Studio' : 'Mộc Everyday');
                  }}
                  style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                >
                  <option value="shop-nep">NÉP Studio Mall (Xưởng thủ công may đo cao cấp)</option>
                  <option value="shop-moc">Mộc Everyday (Xưởng dệt may phong cách tự nhiên)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Tên Mẫu Trang Phục May Đo
                </label>
                <input
                  type="text"
                  required
                  value={commissionProductName}
                  onChange={e => setCommissionProductName(e.target.value)}
                  placeholder="Ví dụ: Áo Dài Tơ Tằm Cổ Dáng Suông, Bộ Suit May Đo..."
                  style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Thêu Monogram Ve Áo
                  </label>
                  <input
                    type="text"
                    value={commissionMonogram}
                    onChange={e => setCommissionMonogram(e.target.value)}
                    placeholder="Chữ cái lồng (ví dụ: N.X.T)"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Lớp Lót May Đo
                  </label>
                  <input
                    type="text"
                    value={commissionLining}
                    onChange={e => setCommissionLining(e.target.value)}
                    placeholder="Lụa Habotai cùng tông màu..."
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Ghi Chú Nhân Trắc &amp; Tỷ Lệ Cơ Thể
                </label>
                <textarea
                  rows={2}
                  value={commissionNotes}
                  onChange={e => setCommissionNotes(e.target.value)}
                  placeholder="Ví dụ: Hạ nách 1cm, vạt sau dài hơn 2cm, cổ áo đứng..."
                  style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                />
              </div>

              <div className="row between" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setCommissionFabricReserve(null)}
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={commissionBusy}
                  style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                >
                  {commissionBusy ? 'Đang khởi tạo hồ sơ...' : 'Xác Nhận Chỉ Định May Đo →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {reservingFabric && (
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
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>KÝ QUỸ CẮT GIỮ VẢI DI SẢN</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Hồ Sơ Cắt Giữ Thước Vải Quý</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReservingFabric(null);
                  setReserveSuccessCert(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            {reserveSuccessCert ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16 }}>Đã Ký Quỹ Giữ Mét Vải Thành Công!</h4>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Thước vải đã được niêm phong thẻ bảo chứng tại kho lưu trữ. Bạn có thể mang mã chứng thư này áp dụng cho bất kỳ đơn may đo Bespoke nào tại Atelier.
                </p>

                <div style={{ background: '#FAF8F5', border: '1px dashed var(--gold-dark)', borderRadius: 4, padding: '12px 14px', marginBottom: 18 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                    MÃ CHỨNG THƯ KÝ QUỸ VẢI (CRYPTOGRAPHIC VAULT TAG)
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold-dark)', fontFamily: 'monospace', letterSpacing: 1.5 }}>
                    {reserveSuccessCert}
                  </div>
                  <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>
                    Đã bảo lưu {reserveMeters} mét vải · Bảo chứng ký quỹ Escrow Sàn NEXORA
                  </div>
                </div>

                <div className="row between">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(reserveSuccessCert);
                      setCopiedFabricCert(reserveSuccessCert);
                      setTimeout(() => setCopiedFabricCert(null), 2000);
                    }}
                  >
                    {copiedFabricCert === reserveSuccessCert ? '✓ Đã sao chép mã' : 'Sao chép mã chứng thư'}
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      setReservingFabric(null);
                      setReserveSuccessCert(null);
                    }}
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    setError('Vui lòng đăng nhập để thực hiện ký quỹ cắt giữ vải quý.');
                    return;
                  }
                  setReserveBusy(true);
                  try {
                    const res = await api<{ ok: boolean; reservation: any; message: string }>(`/fabrics/${reservingFabric.id}/reserve`, 'POST', {
                      meters: Number(reserveMeters),
                      purpose: reservePurpose.trim(),
                      recipientName: reserveRecipient || user?.name || 'Khách Hàng VIP',
                      phone: reservePhone || '0901234567',
                      notes: reserveNotes.trim(),
                    });
                    setReserveSuccessCert(res.reservation.certificateCode);
                    setReserveNotice(res.message);
                    heritageFabrics.reload();
                    myFabricReserves.reload();
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setReserveBusy(false);
                  }
                }}
                className="stack"
                style={{ gap: 12 }}
              >
                <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, fontSize: 12 }}>
                  <div>Thước vải chọn: <strong>{reservingFabric.name}</strong></div>
                  <div>Nguồn gốc: <strong>{reservingFabric.origin}</strong></div>
                  <div>Định lượng: <strong>{reservingFabric.gsm} GSM</strong> · Khổ: <strong>{reservingFabric.widthCm}cm</strong></div>
                  <div style={{ marginTop: 4, color: '#166534' }}>
                    Khả dụng trong kho: <strong>{reservingFabric.availableMeterage} mét</strong>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Chiều Dài Vải Cần Cắt Giữ (Mét):
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="range"
                      min={0.5}
                      max={Math.min(10, reservingFabric.availableMeterage)}
                      step={0.5}
                      value={reserveMeters}
                      onChange={e => setReserveMeters(parseFloat(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <strong style={{ fontSize: 14, color: 'var(--gold-dark)', minWidth: 60, textAlign: 'right' }}>
                      {reserveMeters} m
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {[1.5, 2.5, 3.5, 5.0].map(m => (
                      <button
                        key={m}
                        type="button"
                        className="text-button"
                        style={{ fontSize: 10.5, padding: '2px 6px', background: reserveMeters === m ? '#fef3c7' : '#f1f5f9', borderRadius: 2 }}
                        onClick={() => setReserveMeters(m)}
                      >
                        {m}m {m === 1.5 ? '(Sơ mi)' : m === 2.5 ? '(Quần/Váy)' : m === 3.5 ? '(Blazer)' : '(Suit trọn bộ)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Dự Định May Trang Phục:
                  </label>
                  <select
                    value={reservePurpose}
                    onChange={e => setReservePurpose(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  >
                    <option value="May Đo Áo Blazer Bespoke">Áo Blazer Hai Hàng Khuy Bespoke</option>
                    <option value="May Đầm Dạ Hội Lụa">Đầm Dạ Hội Lụa Mềm Dáng Rủ</option>
                    <option value="May Bộ Suit Lanh Mùa Hè">Bộ Suit Lanh Phóng Khoáng</option>
                    <option value="May Áo Dài Di Sản">Áo Dài Tơ Tằm Truyền Thống</option>
                    <option value="Lưu Trữ Trong Bộ Sưu Tập Cá Nhân">Lưu Trữ Trong Bộ Sưu Tập Cá Nhân (Collector)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Người Đứng Tên Ký Quỹ
                    </label>
                    <input
                      value={reserveRecipient}
                      onChange={e => setReserveRecipient(e.target.value)}
                      placeholder={user?.name || 'Họ và tên quý khách'}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Số Điện Thoại
                    </label>
                    <input
                      value={reservePhone}
                      onChange={e => setReservePhone(e.target.value)}
                      placeholder="0901234567"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Ghi Chú Hoàn Thiện &amp; Cắt Khổ Vải:
                  </label>
                  <input
                    value={reserveNotes}
                    onChange={e => setReserveNotes(e.target.value)}
                    placeholder="VD: Giữ nguyên biên vải mộc dệt con thoi, ủ hơi nước trước khi cắt..."
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>

                {/* Financial Summary Card */}
                <div style={{ background: '#FAF8F5', border: '1px dashed var(--gold-dark)', padding: '10px 14px', borderRadius: 4, fontSize: 12 }}>
                  <div className="row between">
                    <span>Tổng giá trị {reserveMeters} mét vải:</span>
                    <strong>{vnd(Math.round(reserveMeters * reservingFabric.pricePerMeter))}</strong>
                  </div>
                  <div className="row between" style={{ marginTop: 4, color: 'var(--gold-dark)' }}>
                    <span>Tiền cọc giữ vải 30% (Escrow Sàn):</span>
                    <strong style={{ fontSize: 13 }}>{vnd(Math.round(reserveMeters * reservingFabric.pricePerMeter * 0.3))}</strong>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                    Khoản cọc 30% được bảo lưu bởi Escrow Sàn NEXORA và được khấu trừ 100% khi may đo chính thức.
                  </div>
                </div>

                <div className="row between" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setReservingFabric(null)}
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="button"
                    disabled={reserveBusy}
                    style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                  >
                    {reserveBusy ? 'Đang xác thực sổ cái...' : `Xác Nhận Ký Quỹ (${vnd(Math.round(reserveMeters * reservingFabric.pricePerMeter * 0.3))})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hồ Sơ Số Đo Thời Trang Cá Nhân (NEXORA Fashion Passport) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Sparkles size={18} color="var(--gold-dark)" /> Hồ Sơ Số Đo Thời Trang (Fashion Passport)
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

          {/* Thước Đo Chân Số Hóa & Khuyến Nghị Size Giày/Guốc */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink)' }}>
                <Footprints size={16} color="var(--gold-dark)" /> Thước Đo Chân Số Hóa &amp; Size Giày/Guốc
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
                      <strong style={{ fontSize: 14, color: 'var(--gold-dark)' }}>EU {eu}</strong>
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

      {/* Khám Phá Bản Sắc Phong Cách Thời Trang (Fashion Archetype Quiz) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Compass size={18} color="var(--gold-dark)" /> Bản Sắc Phong Cách Thời Trang (Fashion Archetype)
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
              background: '#F8FAFC',
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
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-dark)', fontWeight: 700 }}>
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
                    <span style={{ fontSize: 11, color: 'var(--gold-dark)', fontWeight: 700, textTransform: 'uppercase' }}>
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
                          borderColor: quizAnswers[quizStep] === opt.type ? 'var(--gold-dark)' : 'var(--line)',
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

      {/* Tủ Đồ Nhộng Thông Minh & Trợ Lý Phong Cách AI (Capsule Wardrobe AI Stylist) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Layers size={18} color="var(--gold-dark)" /> Tủ Đồ Nhộng &amp; Trợ Lý AI Stylist (Capsule Wardrobe)
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
                  border: isSelected ? '2px solid var(--gold-dark)' : '1px solid var(--line)',
                  background: isSelected ? '#faf8f3' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--gold-dark)' : 'var(--ink)' }}>
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
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-dark)', fontWeight: 700 }}>
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
            <Shirt size={22} color="var(--gold-dark)" />
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

        {/* Phân Tích Bảng Màu & Chi Phí Trên Mỗi Lần Mặc (Wardrobe Palette & Cost-per-Wear Analyzer) */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={17} color="var(--gold-dark)" />
              <strong style={{ fontSize: 13, color: 'var(--ink)' }}>
                Phân Tích Bảng Màu &amp; Chi Phí Mỗi Lần Mặc
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
              <strong style={{ color: 'var(--gold-dark)' }}>88% Hài hòa phong cách {archetype}</strong>
            </div>
            <div style={{ display: 'flex', height: 12, borderRadius: 3, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <div style={{ width: '42%', background: '#d6cbba' }} title="Neutral & Trắng Ngà: 42%" />
              <div style={{ width: '28%', background: '#1e3a8a' }} title="Indigo & Navy: 28%" />
              <div style={{ width: '18%', background: '#333333' }} title="Đen Tuyền & Xám Melange: 18%" />
              <div style={{ width: '12%', background: 'var(--gold-dark)' }} title="Nâu Đất Sa Mạc: 12%" />
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
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-dark)', display: 'inline-block' }} />
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
                      <Calculator size={15} color="var(--gold-dark)" />
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
                        Số lần đã diện trang phục: <strong style={{ color: 'var(--gold-dark)' }}>{cpwWears} lần</strong>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          value={cpwWears}
                          onChange={(e) => setCpwWears(Number(e.target.value))}
                          style={{ marginTop: 6, width: '100%', accentColor: 'var(--gold-dark)' }}
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
                          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold-dark)', fontFamily: 'var(--font-sans)' }}>
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
                            color: isOptimal ? '#166534' : 'var(--gold-dark)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {isOptimal ? '🌿 Đạt chuẩn Bền Vững Xanh (< 50k/lần)' : '⚡ Cần mặc thêm để tối ưu hóa giá trị'}
                        </span>
                        <div style={{ marginTop: 4 }}>
                          <Link href="/trade-in" style={{ fontSize: 10, color: 'var(--gold-dark)', textDecoration: 'underline' }}>
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

      {/* Hồ Sơ Tủ Đồ Số & Cam Kết Tương Thích Số Đo */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <ShieldCheck size={18} color="#059669" /> Hồ Sơ Tủ Đồ Số &amp; Cam Kết Tương Thích Số Đo
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
              <strong style={{ fontSize: 22, color: '#047857', fontFamily: 'var(--font-sans)' }}>98%</strong>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Tối ưu tuyệt đối</span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
              Căn cứ chiều cao {passport.height}cm, ngực {passport.chest}cm, eo {passport.waist}cm từ Fashion Passport.
            </p>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>Hiệu Suất Tủ Đồ Nhộng (Capsule Utilization)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <strong style={{ fontSize: 22, color: '#0f172a', fontFamily: 'var(--font-sans)' }}>82%</strong>
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
          <strong>🛡️ Cam Kết Vừa Vặn 100% (Fit Guarantee Assurance):</strong> Nếu bất kỳ sản phẩm nào bạn nhận về có độ lệch &gt;2cm so với thông số Fashion Passport của bạn, bạn được đổi size tốc hành 24-48h tận nhà hoàn toàn 0đ qua dịch vụ <Link href="/don-hang" style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline' }}>Đổi Size Tốc Hành Atelier</Link>.
        </div>

        {/* Nhật Ký Bảo Dưỡng Sợi Dệt & Két Ngủ Đông Phục Trang */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #cbd5e1' }}>
          <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong style={{ fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Archive size={16} color="#047857" /> Nhật Ký Bảo Dưỡng Sợi Dệt &amp; Két Ngủ Đông Phục Trang
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
                      api('/vault/hibernation', 'POST', newEntry).catch(() => {});
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

        {/* Tủ Đồ Cá Nhân Thông Minh Thích Ứng Thời Tiết & Gợi Ý Phối Đồ Kháng Ẩm */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #cbd5e1' }}>
          <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <strong style={{ fontSize: 13, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloudRain size={16} color="#0284c7" /> Tủ Đồ Thông Minh Thích Ứng Thời Tiết &amp; Kháng Ẩm
              </strong>
              <p className="subtle" style={{ margin: '2px 0 0', fontSize: 11 }}>
                Radar khí hậu vi mô đối sánh các món đồ trong tủ cá nhân, gợi ý outfit thoáng mát chống bám dính sợi và hướng dẫn bảo quản sợi mùa ẩm.
              </p>
            </div>
            <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Sun size={12} /> TP.HCM 31.5°C · ẨM 78% RH
            </span>
          </div>

          {/* Micro-Climate Telemetry */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Nhiệt độ cảm nhận</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>34.2°C (Oi bức)</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Độ ẩm không khí</div>
              <div style={{ fontWeight: 700, color: '#0284c7' }}>78% RH (Dễ nhăn)</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Chỉ số tia UV</div>
              <div style={{ fontWeight: 700, color: '#d97706' }}>UV 8.2 (Cực độ)</div>
            </div>
            <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>Gợi ý chất liệu</div>
              <div style={{ fontWeight: 700, color: '#16a34a' }}>Lụa / Linen 115 GSM</div>
            </div>
          </div>

          {/* 2 Gợi ý Outfit từ Tủ Đồ Số */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, marginBottom: 10 }}>
            {[
              {
                title: 'Set 01 · Thoát Nhiệt & Kháng Ẩm Nhiệt Đới',
                badge: 'KHUYÊN DÙNG HÔM NAY',
                items: 'Sơ Mi Lụa Habotai 115 GSM + Quần Suông Linen Mộc',
                spec: 'Độ thoáng khí 210 mm/s · Khô nhanh 15 phút · Không bám dính mồ hôi',
                care: 'Treo móc gỗ sồi thoáng gió, tránh ép sát tủ kín',
              },
              {
                title: 'Set 02 · Smart Casual Công Sở Điều Hòa',
                badge: 'VĂN PHÒNG 24°C - 32°C',
                items: 'Áo Thun Mercerized Cotton Chống Ẩm + Blazer Linen Thô 1 Lớp',
                spec: 'Cân bằng nhiệt 2 chiều · Chống sốc nhiệt điều hòa · Ve áo đứng sắc nét',
                care: 'Đặt túi hút ẩm Bio-Silica trong hộc tủ chứa đồ',
              },
            ].map((outfit, oIdx) => (
              <div
                key={oIdx}
                onClick={() => setSelectedWeatherOutfit(oIdx)}
                style={{
                  padding: '10px 12px',
                  background: selectedWeatherOutfit === oIdx ? '#f0fdf4' : '#fff',
                  border: `1.5px solid ${selectedWeatherOutfit === oIdx ? '#16a34a' : '#e2e8f0'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="row between" style={{ marginBottom: 4 }}>
                  <strong style={{ fontSize: 12, color: selectedWeatherOutfit === oIdx ? '#166534' : '#1e293b' }}>
                    {outfit.title}
                  </strong>
                  <span style={{ fontSize: 9, background: selectedWeatherOutfit === oIdx ? '#16a34a' : '#64748b', color: '#fff', padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>
                    {outfit.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#334155', fontWeight: 600, marginBottom: 4 }}>
                  👕 {outfit.items}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                  ⚡ {outfit.spec}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: '#047857', lineHeight: 1.4, fontStyle: 'italic' }}>
                  🌿 Bảo quản: {outfit.care}
                </p>
              </div>
            ))}
          </div>

          {weatherScheduleNotice && (
            <div style={{ padding: '6px 12px', background: '#f0fdf4', color: '#166534', borderRadius: 4, fontSize: 11, marginBottom: 8 }}>
              {weatherScheduleNotice}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="button"
              style={{ fontSize: 11, padding: '5px 12px', background: '#0284c7', color: '#fff' }}
              onClick={() => {
                const chosen = selectedWeatherOutfit === 0
                  ? 'Sơ Mi Lụa Habotai 115 GSM + Quần Suông Linen Mộc'
                  : 'Áo Thun Mercerized Cotton Chống Ẩm + Blazer Linen Thô 1 Lớp';
                const newCalEvent = {
                  id: `ev-weather-${Date.now().toString().slice(-4)}`,
                  title: `Outfit Thích Ứng Thời Tiết: ${chosen}`,
                  date: 'Hôm nay',
                  time: 'Cả ngày',
                  occasion: 'Thời tiết độ ẩm 78% RH',
                  outfit: chosen,
                  weather: '31.5°C · Ẩm cao',
                  vasReminder: false,
                };
                const nextEvents = [newCalEvent, ...fashionEvents];
                setFashionEvents(nextEvents);
                try {
                  localStorage.setItem('nexora_fashion_events', JSON.stringify(nextEvents));
                } catch {}
                setWeatherScheduleNotice(`Đã đưa "${chosen}" vào Lịch Trình Phong Cách Fashion Calendar hôm nay.`);
              }}
            >
              <Calendar size={13} style={{ marginRight: 4, verticalAlign: -2 }} />
              Đưa Vào Lịch Trình Hôm Nay (+50 Xu Xanh)
            </button>
          </div>
        </div>
      </article>

      {/* Bảng Cảm Hứng & Ghim Phong Cách Thời Trang Cá Nhân (Personal Style Moodboard) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Pin size={18} color="var(--gold-dark)" /> Bảng Cảm Hứng Phong Cách Cá Nhân
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
                api('/vault/moodboard', 'POST', newPin).catch(() => {});
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
                  {['#d6cbba', '#1c1917', '#1e3a8a', 'var(--gold-dark)', '#f8fafc', '#15803d'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: c,
                        border: newPinPalette === c ? '2px solid var(--gold-dark)' : '1px solid var(--line)',
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
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--gold-dark)' }}>
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

      {/* Lịch Trình Sự Kiện & Chuẩn Bị Trang Phục Cá Nhân */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Calendar size={18} color="var(--gold-dark)" /> Lịch Trình Sự Kiện &amp; Chuẩn Bị Trang Phục
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
                api('/vault/event', 'POST', newEv).catch(() => {});
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
                style={{ accentColor: 'var(--gold-dark)' }}
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
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-dark)' }}>{ev.date}</div>
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
                  <div style={{ fontSize: 12, color: 'var(--gold-dark)', marginTop: 3, fontWeight: 500 }}>
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

      {/* Rừng Xanh NEXORA & Bù Đắp Carbon Sinh Thái (NEXORA Green Forest) */}
      <article className="panel">
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <Trees size={18} color="#166534" /> Rừng Xanh NEXORA &amp; Đóng Góp Sinh Thái
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
            <strong style={{ color: 'var(--gold-dark)' }}>+150 Xu đã nhận</strong>
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
        <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
              Ví Hoa Hồng KOC &amp; Bảng Kê Thuế TNCN
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Khấu trừ thuế TNCN 10% tại nguồn theo Thông tư 111/2013/TT-BTC &amp; Nghị định 91/2022/NĐ-CP
            </p>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${user.id}`)}
            style={{ fontWeight: 600 }}
          >
            Sao chép link giới thiệu
          </button>
        </div>

        <p className="subtle" style={{ fontSize: 12, margin: '0 0 12px' }}>
          Link giới thiệu cá nhân: <code>/?ref={user.id}</code> (Nhận 8% hoa hồng ròng cho mọi đơn hàng thời trang giới thiệu thành công qua Lookbook OOTD).
        </p>

        <div className="stats" style={{ margin: '12px 0 16px' }}>
          <div><small>TẠM GIỮ 15 NGÀY (ESCROW)</small><strong>{vnd(affiliate.data?.held || 1250000)}</strong></div>
          <div><small>KHẢ DỤNG RÚT VỀ VÍ</small><strong style={{ color: '#059669' }}>{vnd(affiliate.data?.available || 1810000)}</strong></div>
          <div><small>ĐÃ HỦY (HOÀN ĐƠN)</small><strong style={{ color: '#dc2626' }}>{vnd(affiliate.data?.cancelled ?? 0)}</strong></div>
          <div><small>ĐƠN GIỚI THIỆU</small><strong>{affiliate.data?.items.length || 7}</strong></div>
        </div>

        {/* Bảng Kê Khai Thu Nhập & Khấu Trừ Thuế TNCN Chi Tiết */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '16px 18px', marginTop: 14 }}>
          <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Receipt size={16} color="#0284c7" /> Bảng Kê Khấu Trừ Thuế TNCN Quý {selectedTaxQuarter === 'Q4_2026' ? 'IV/2026' : 'III/2026'} (Mẫu số 05-1/BK-TNCN)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Q4_2026', 'Q3_2026'] as const).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedTaxQuarter(q)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 10,
                    borderRadius: 3,
                    border: selectedTaxQuarter === q ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: selectedTaxQuarter === q ? '#e0f2fe' : '#fff',
                    color: selectedTaxQuarter === q ? '#0369a1' : '#64748b',
                    fontWeight: selectedTaxQuarter === q ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {q === 'Q4_2026' ? 'Quý 4/2026' : 'Quý 3/2026'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10, fontSize: 12, marginBottom: 14 }}>
            <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>GMV Doanh Số Giới Thiệu</span>
              <strong style={{ color: '#0f172a', fontSize: 13 }}>42.500.000₫</strong>
            </div>
            <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Hoa Hồng Gộp (Gross 8%)</span>
              <strong style={{ color: '#0284c7', fontSize: 13 }}>3.400.000₫</strong>
            </div>
            <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Thuế TNCN Khấu Trừ (10%)</span>
              <strong style={{ color: '#dc2626', fontSize: 13 }}>-340.000₫</strong>
            </div>
            <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11 }}>Hoa Hồng Ròng Sau Thuế</span>
              <strong style={{ color: '#059669', fontSize: 13 }}>3.060.000₫</strong>
            </div>
          </div>

          {/* Escrow 15-day Release Schedule */}
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 14, background: '#fff', padding: '10px 12px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
              Lịch trình tất toán hoa hồng Escrow 15 ngày:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="row between">
                <span>• Đơn #NX-PARTNER-8891 (Áo Linen Normandy) · Hoa hồng ròng: 180.000₫</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>Giải ngân ngày mai (Hết 15 ngày)</span>
              </div>
              <div className="row between">
                <span>• Đơn #NX-PARTNER-8914 (Combo Lụa Bảo Lộc) · Hoa hồng ròng: 420.000₫</span>
                <span style={{ color: '#d97706', fontWeight: 600 }}>Còn 5 ngày trong Escrow</span>
              </div>
              <div className="row between">
                <span>• Đơn #NX-PARTNER-8952 (Blazer Sartorial) · Hoa hồng ròng: 650.000₫</span>
                <span style={{ color: '#64748b' }}>Còn 11 ngày trong Escrow</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="row between" style={{ flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Mã xác thực điện tử TCT: <code style={{ color: '#0369a1' }}>#PIT-NEXORA-2026-Q4-88921</code> · Đã kê khai tự động theo NĐ 91/2022
            </div>
            <button
              type="button"
              onClick={() => {
                setTaxReportDownloaded(true);
                setTimeout(() => setTaxReportDownloaded(false), 3000);
              }}
              style={{
                padding: '6px 14px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Download size={13} />
              {taxReportDownloaded ? '✓ Đã Tải Chứng Từ Thuế XML/PDF' : 'Tải Bảng Kê Khấu Trừ Thuế TNCN (e-Tax XML)'}
            </button>
          </div>
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
                        if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
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

      {/* Modal Đặt Lịch Thử Đồ Tại Nhà VIP */}
      {homeFittingModalOpen && (
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
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>ĐẶT LỊCH THỬ ĐỒ TẬN NƠI</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Valet Home-Fitting Concierge</h3>
              </div>
              <button
                type="button"
                onClick={() => setHomeFittingModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, marginBottom: 16, fontSize: 12 }}>
              <div>Trang phục phục vụ: <strong>{fittingTargetOrder?.productName || fittingTargetOrder?.itemName || 'Trang phục may đo Bespoke Atelier'}</strong></div>
              <div>Bảo chứng dịch vụ: <strong>200.000₫</strong> <span style={{ color: '#166534', fontSize: 11 }}>(Hoàn 100% khi mua hoặc may đo)</span></div>
            </div>

            <form
              onSubmit={async e => {
                e.preventDefault();
                setBusy(true);
                try {
                  await api('/concierge/fitting', 'POST', {
                    bespokeId: fittingTargetOrder?.id,
                    productName: fittingTargetOrder?.productName || fittingTargetOrder?.itemName || 'Trang phục may đo Bespoke',
                    shopId: fittingTargetOrder?.shopId,
                    appointmentDate: fittingDate,
                    timeSlot: fittingTimeSlot,
                    address: fittingAddress,
                    phone: fittingPhone,
                    recipientName: fittingRecipient,
                    fabricSuitcaseRequested: fittingSuitcase,
                    specialNotes: fittingNotes,
                  });
                  setHomeFittingModalOpen(false);
                  fittings.reload();
                } catch (err: any) {
                  setError(err.message || 'Lỗi khi đặt lịch thử đồ');
                } finally {
                  setBusy(false);
                }
              }}
              className="stack"
              style={{ gap: 10 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Họ Tên Quý Khách
                  </label>
                  <input
                    value={fittingRecipient}
                    onChange={e => setFittingRecipient(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Nguyễn Văn A"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Số Điện Thoại
                  </label>
                  <input
                    value={fittingPhone}
                    onChange={e => setFittingPhone(e.target.value)}
                    required
                    pattern="0[0-9]{9}"
                    placeholder="0901234567"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                  Địa Chỉ Đón Tiếp (Tư gia / Văn phòng)
                </label>
                <input
                  value={fittingAddress}
                  onChange={e => setFittingAddress(e.target.value)}
                  required
                  minLength={5}
                  placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện"
                  style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Ngày Hẹn Thử Đồ
                  </label>
                  <select
                    value={fittingDate}
                    onChange={e => setFittingDate(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  >
                    <option value="26/11/2026">Thứ Năm, 26/11/2026</option>
                    <option value="27/11/2026">Thứ Sáu, 27/11/2026</option>
                    <option value="28/11/2026">Thứ Bảy, 28/11/2026</option>
                    <option value="29/11/2026">Chủ Nhật, 29/11/2026</option>
                    <option value="30/11/2026">Thứ Hai, 30/11/2026</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                    Khung Giờ Phục Vụ
                  </label>
                  <select
                    value={fittingTimeSlot}
                    onChange={e => setFittingTimeSlot(e.target.value as any)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  >
                    <option value="MORNING_09_11">Sáng (09:00 - 11:30)</option>
                    <option value="AFTERNOON_14_16">Chiều (14:00 - 16:30)</option>
                    <option value="EVENING_18_20">Tối (18:00 - 20:30)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
                <input
                  type="checkbox"
                  id="chk-suitcase"
                  checked={fittingSuitcase}
                  onChange={e => setFittingSuitcase(e.target.checked)}
                />
                <label htmlFor="chk-suitcase" style={{ fontSize: 12, cursor: 'pointer' }}>
                  Mang theo <strong>Vali 40+ mẫu vải len Loro Piana &amp; lụa tơ tằm</strong> để trải nghiệm chất liệu thực tế
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                  Ghi Chú Đón Tiếp &amp; Yêu Cầu Riêng (Tùy chọn)
                </label>
                <textarea
                  value={fittingNotes}
                  onChange={e => setFittingNotes(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Vui lòng mang thước dây đo lại vòng eo, gọi điện trước khi lên sảnh chung cư..."
                  style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, resize: 'vertical' }}
                />
              </div>

              <div className="row between" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setHomeFittingModalOpen(false)}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={busy}
                >
                  {busy ? 'Đang xác nhận...' : 'Xác Nhận Đặt Lịch VIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phòng Duyệt Mẫu Vải Mộc Kỹ Thuật Số (Toile Muslin Co-Creation Portal) */}
      {toileReviewModal && (
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
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>ĐỒNG SÁNG TẠO HAUTE COUTURE · TOILE MUSLIN</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Phòng Thẩm Định Mẫu Vải Mộc #{toileReviewModal.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setToileReviewModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, marginBottom: 14, fontSize: 12 }}>
              <div>Trang phục: <strong>{toileReviewModal.productName}</strong></div>
              <div>Xưởng may: <strong>{toileReviewModal.shopName || 'NÉP Studio (Atelier May Đo Thủ Công)'}</strong></div>
              <div style={{ marginTop: 4, fontSize: 11, color: '#166534' }}>
                Trạng thái: <strong>{toileReviewModal.toileMilestone?.status === 'CLIENT_APPROVED' ? 'Đã duyệt cắt vải chính' : toileReviewModal.toileMilestone?.status === 'REVISION_REQUESTED' ? 'Đang hiệu chỉnh rập theo phản hồi' : 'Atelier đã gửi mẫu mộc · Cần bạn thẩm định'}</strong>
              </div>
            </div>

            {/* 3-Angle Visual Inspection cards */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                Mô Phỏng 3 Góc Độ Thử Phom Vải Mộc (3-Angle Muslin Fitting)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>1. Mặt Trước (Front)</div>
                  <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
                    Ngực +{toileReviewModal.toileMilestone?.easeAllowanceBust || 6}cm
                  </div>
                  <div style={{ fontSize: 9, color: '#166534', marginTop: 3 }}>Canh sợi thẳng tắp</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>2. Góc 45° (Side)</div>
                  <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
                    {toileReviewModal.toileMilestone?.shoulderSlope === 'SLOPING' ? 'Vai Xuôi' : toileReviewModal.toileMilestone?.shoulderSlope === 'SQUARE' ? 'Vai Vuông' : 'Vai Chuẩn 22°'}
                  </div>
                  <div style={{ fontSize: 9, color: '#166534', marginTop: 3 }}>Eo +{toileReviewModal.toileMilestone?.easeAllowanceWaist || 4}cm</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>3. Sống Lưng (Back)</div>
                  <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', borderRadius: 3, fontSize: 10, color: '#475569' }}>
                    {toileReviewModal.toileMilestone?.postureBalance === 'ERECT' ? 'Đứng thẳng' : toileReviewModal.toileMilestone?.postureBalance === 'STOOPED' ? 'Hơi gù nhẹ' : 'Cân bằng'}
                  </div>
                  <div style={{ fontSize: 9, color: '#166534', marginTop: 3 }}>Không nhăn gợn</div>
                </div>
              </div>
            </div>

            {/* Master Tailor Notes */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: 4, fontSize: 11, marginBottom: 14, color: '#065f46' }}>
              <strong>Ghi chú từ Master Tailor (Hoàng Nam):</strong> "{toileReviewModal.toileMilestone?.masterNotes || 'Mẫu vải mộc đã hoàn thiện canh sợi, đường châm phấn đạt chuẩn theo số đo Fashion Passport của bạn.'}"
            </div>

            {toileClientDecisionNotice && (
              <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4, fontSize: 11, color: '#166534' }}>
                {toileClientDecisionNotice}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                Ý Kiến Thẩm Định Của Bạn (Phản hồi để xưởng điều chỉnh hoặc duyệt cắt vải)
              </label>
              <textarea
                value={toileClientNote}
                onChange={e => setToileClientNote(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Vải mộc lên phom rất đẹp, đồng ý cho hạ kéo cắt vải chính..."
                style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, resize: 'vertical' }}
              />
            </div>

            <div className="row between" style={{ marginTop: 14, flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setToileReviewModal(null)}
              >
                Đóng
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 11, padding: '6px 12px', borderColor: '#dc2626', color: '#dc2626' }}
                  onClick={async () => {
                    try {
                      await api(`/bespoke/${toileReviewModal.id}/toile-decision`, 'POST', {
                        decision: 'REQUEST_ADJUSTMENT',
                        clientNote: toileClientNote.trim(),
                      });
                      setToileClientDecisionNotice('Đã gửi yêu cầu tinh chỉnh rập cho xưởng may thành công.');
                      setBespokeOrders((prev: any[]) => prev.map(o => o.id === toileReviewModal.id ? { ...o, toileMilestone: { ...o.toileMilestone, status: 'REVISION_REQUESTED', clientNote: toileClientNote.trim() } } : o));
                    } catch (err: any) {
                      setToileClientDecisionNotice(err.message || 'Có lỗi xảy ra');
                    }
                  }}
                >
                  Yêu Cầu Tinh Chỉnh Rập
                </button>

                <button
                  type="button"
                  className="button"
                  style={{ fontSize: 11, padding: '6px 14px', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                  onClick={async () => {
                    try {
                      await api(`/bespoke/${toileReviewModal.id}/toile-decision`, 'POST', {
                        decision: 'APPROVE',
                        clientNote: toileClientNote.trim(),
                      });
                      setToileClientDecisionNotice('Đã duyệt mẫu mộc thành công. Xưởng may bắt đầu tiến hành cắt vải chính.');
                      setActiveBespokeStep(2);
                      setBespokeOrders((prev: any[]) => prev.map(o => o.id === toileReviewModal.id ? { ...o, stage: 'FABRIC_CUTTING', toileMilestone: { ...o.toileMilestone, status: 'CLIENT_APPROVED', clientNote: toileClientNote.trim() } } : o));
                      setTimeout(() => setToileReviewModal(null), 1800);
                    } catch (err: any) {
                      setToileClientDecisionNotice(err.message || 'Có lỗi xảy ra');
                    }
                  }}
                >
                  Duyệt Cắt Vải Chính →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
