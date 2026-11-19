'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, LogOut, MapPin, Package, RefreshCw, ShieldCheck, Sparkles, UserCheck, Layers, Calendar, Sun, CloudRain, Share2, Check, Shirt, ExternalLink, Leaf, Trees, TreePine, Award } from 'lucide-react';
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
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nexora_fashion_passport');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return { height: 168, weight: 58, chest: 88, waist: 68, hip: 92, fitPref: 'REGULAR' };
  });
  const [passportSaved, setPassportSaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [weatherMode, setWeatherMode] = useState<'WARM' | 'COOL'>('WARM');
  const [pinnedDay, setPinnedDay] = useState<number | null>(null);

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
          <button className="button" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            Cập nhật Fashion Passport
          </button>
        </form>
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
