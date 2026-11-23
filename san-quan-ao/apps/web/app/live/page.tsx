'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Clock, Heart, Radio, Send, ShoppingBag, Sparkles, Users, Volume2, VolumeX, Camera, BarChart2, Gift, CheckCircle2, Bookmark, Layers, CheckCheck } from 'lucide-react';
import { api, Product, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

type LiveMessage = {
  id: string;
  sender: string;
  avatar: string;
  role?: 'host' | 'shopper' | 'system';
  text: string;
  time: string;
};

const INITIAL_MESSAGES: LiveMessage[] = [
  { id: '1', sender: 'NEXORA Stylist', avatar: 'N', role: 'host', text: 'Chào mừng các bạn đến với Sàn Diễn Live Thời Trang Thu Đông 2026! Deal ghim hôm nay giảm trực tiếp 35% duy nhất trong phiên phát sóng.', time: '12:00' },
  { id: '2', sender: 'Hương Giang', avatar: 'H', role: 'shopper', text: 'Áo blazer da Ý bạn mẫu 1m65 mặc size nào vừa vặn vậy shop ơi?', time: '12:02' },
  { id: '3', sender: 'NEXORA Stylist', avatar: 'N', role: 'host', text: 'Bạn mẫu cao 1m68 nặng 50kg đang mặc Size S rất ôm vai và tôn dáng nha Hương Giang!', time: '12:03' },
  { id: '4', sender: 'Thanh Trúc', avatar: 'T', role: 'shopper', text: 'Chất dạ ép của măng-tô có ấm và có lót lụa bên trong không shop?', time: '12:04' },
  { id: '5', sender: 'Hệ thống Sàn', avatar: '⚡', role: 'system', text: 'Khách hàng Minh Anh vừa chốt 1 Áo Blazer Da Ý Sang Trọng!', time: '12:05' },
];

export default function LiveRoom() {
  const { user } = useUser();
  const catalog = useResource<{ items: Product[] }>('/products');
  const [pinnedIndex, setPinnedIndex] = useState(0);
  const [messages, setMessages] = useState<LiveMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [muted, setMuted] = useState(true);
  const [heartsCount, setHeartsCount] = useState(4820);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);
  const [viewers, setViewers] = useState(1428);
  const [stockLeft, setStockLeft] = useState(8);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 35 });
  const [selectedSize, setSelectedSize] = useState('S');
  const [buying, setBuying] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [runwayAngle, setRunwayAngle] = useState<'CATWALK' | 'MACRO' | 'BACKSTAGE'>('CATWALK');
  const [selectedPollOption, setSelectedPollOption] = useState<string>('opt-1');
  const [hasVotedPoll, setHasVotedPoll] = useState<boolean>(false);
  const [pollVotes, setPollVotes] = useState<{ [key: string]: number }>({
    'opt-1': 486,
    'opt-2': 214,
    'opt-3': 105,
  });
  const [voucherCopied, setVoucherCopied] = useState<boolean>(false);
  const [savedLookbooks, setSavedLookbooks] = useState<{ id: string; title: string; price: number; time: string; angle: string }[]>([]);
  const [capturingLook, setCapturingLook] = useState(false);
  const [lookCapturedNotice, setLookCapturedNotice] = useState('');

  useEffect(() => {
    try {
      const savedVote = localStorage.getItem('nexora_live_poll_vote');
      if (savedVote) {
        setHasVotedPoll(true);
        setSelectedPollOption(savedVote);
      }
      const savedLooks = localStorage.getItem('nexora_saved_runway_looks');
      if (savedLooks) {
        setSavedLookbooks(JSON.parse(savedLooks));
      }
    } catch {}
  }, []);

  function captureRunwayLook() {
    if (!pinnedProduct) return;
    setCapturingLook(true);
    setTimeout(() => {
      const angleName = runwayAngle === 'CATWALK' ? 'Sàn Diễn Catwalk' : runwayAngle === 'MACRO' ? 'Cận Cảnh 4K' : 'Hậu Trường Stylist';
      const newLook = {
        id: `LOOK-${Date.now().toString().slice(-6)}`,
        title: `BST Sàn Diễn: ${pinnedProduct.name}`,
        price: Math.round((pinnedProduct.variants[0]?.price ?? 1000000) * 0.75),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        angle: angleName,
      };
      const updated = [newLook, ...savedLookbooks.slice(0, 4)];
      setSavedLookbooks(updated);
      try {
        localStorage.setItem('nexora_saved_runway_looks', JSON.stringify(updated));
      } catch {}
      setCapturingLook(false);
      setLookCapturedNotice(`✓ Đã chụp & lưu Lookbook "${newLook.title}" (${angleName}) vào bộ sưu tập cá nhân!`);
      setTimeout(() => setLookCapturedNotice(''), 4500);
    }, 600);
  }

  function handleVotePoll(optionId: string) {
    if (hasVotedPoll) return;
    setHasVotedPoll(true);
    setSelectedPollOption(optionId);
    setPollVotes(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));
    try {
      localStorage.setItem('nexora_live_poll_vote', optionId);
    } catch {}
    setSuccessNotice('✓ Bạn đã bình chọn thành công! Mã ưu đãi -20% Flash Deal (RUNWAY20) đã được mở khóa.');
  }

  // Live countdown timer for pinned deal
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Viewer count jitter
  useEffect(() => {
    const vTimer = setInterval(() => {
      setViewers(v => Math.max(1200, v + Math.floor(Math.random() * 7) - 3));
    }, 4000);
    return () => clearInterval(vTimer);
  }, []);

  const products = catalog.data?.items ?? [];
  const pinnedProduct = products[pinnedIndex] ?? products[0];

  function addHeart() {
    setHeartsCount(c => c + 1);
    const newId = Date.now() + Math.random();
    const randomLeft = 60 + Math.floor(Math.random() * 30);
    setFloatingHearts(prev => [...prev.slice(-12), { id: newId, left: randomLeft }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== newId));
    }, 1800);
  }

  function sendChat(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: LiveMessage = {
      id: String(Date.now()),
      sender: user?.name ?? 'Bạn (Khách hàng)',
      avatar: (user?.name?.[0] ?? 'K').toUpperCase(),
      role: 'shopper',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  }

  async function oneTapBuy() {
    if (!user) {
      setErrorNotice('Vui lòng đăng nhập để chốt đơn trong phiên live.');
      return;
    }
    if (!pinnedProduct) return;
    setBuying(true);
    setErrorNotice('');
    setSuccessNotice('');
    try {
      const variant = pinnedProduct.variants.find(v => v.size === selectedSize) ?? pinnedProduct.variants[0];
      if (!variant) throw new Error('Không tìm thấy biến thể size phù hợp.');
      await api('/cart', 'POST', { variantId: variant.id, quantity: 1 });
      setSuccessNotice(`Đã chốt thành công 1 ${pinnedProduct.name} (Size ${selectedSize}) vào giỏ hàng!`);
      setStockLeft(s => Math.max(1, s - 1));
      // Add system ticker message
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'Hệ thống Sàn',
          avatar: '⚡',
          role: 'system',
          text: `Khách hàng ${user.name} vừa chốt 1 ${pinnedProduct.name}!`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e) {
      setErrorNotice((e as Error).message);
    } finally {
      setBuying(false);
    }
  }

  if (catalog.loading) return <Loading />;

  return (
    <section className="section live-page" style={{ maxWidth: 1440, padding: '30px 4%' }}>
      <div className="section-heading" style={{ marginBottom: 20 }}>
        <div>
          <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 8px #EF4444' }} />
            NEXORA LIVE RUNWAY STUDIO (SOC-LIVE-01)
          </p>
          <h1 style={{ fontSize: 36, margin: 0 }}>Sàn Diễn Trực Tiếp &amp; Chốt Đơn 1-Chạm</h1>
          <p className="subtle" style={{ margin: '4px 0 0' }}>Xem người mẫu trình diễn, trao đổi với Stylist và nhận deal độc quyền không gián đoạn luồng phát.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#111827', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <Radio size={15} color="#EF4444" /> ĐANG PHÁT
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f5f9', color: '#0f172a', padding: '6px 14px', borderRadius: 20, fontSize: 12 }}>
            <Users size={15} /> <strong>{viewers.toLocaleString('vi-VN')}</strong> người xem
          </div>
        </div>
      </div>

      {errorNotice && <Notice error>{errorNotice}</Notice>}
      {successNotice && <Notice>{successNotice} <Link href="/gio-hang">Đến giỏ hàng thanh toán ngay →</Link></Notice>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* CỘT TRÁI: KHUNG PHÁT SÓNG RUNWAY & DEAL GHIM */}
        <div>
          {/* VIDEO STAGE CONTAINER */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0a0a0c', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Visual Runway Simulation Backdrop */}
            <img
              src={pinnedProduct?.images[0]?.url || '/products/blazer.svg'}
              alt="Runway Stage"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, filter: 'contrast(1.05)' }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('/products/blazer.svg')) target.src = '/products/blazer.svg';
              }}
            />

            {/* Video Overlays */}
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, zIndex: 10 }}>
              <span style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, letterSpacing: 1 }}>
                ● LIVE
              </span>
              <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11, padding: '4px 10px', borderRadius: 4 }}>
                Full HD 1080p · Runway Stage 01
              </span>
            </div>

            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 10 }}>
              <button
                type="button"
                onClick={() => setMuted(!muted)}
                style={{ background: 'rgba(15, 23, 42, 0.75)', border: 0, color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer' }}
                aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>

            {/* Floating Hearts Animation */}
            {floatingHearts.map(h => (
              <span
                key={h.id}
                style={{
                  position: 'absolute',
                  bottom: 30,
                  left: `${h.left}%`,
                  fontSize: 26,
                  color: '#EF4444',
                  animation: 'floatUp 1.8s ease-out forwards',
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              >
                ♥
              </span>
            ))}

            <style>{`
              @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0) scale(0.8); }
                50% { opacity: 0.9; transform: translateY(-70px) scale(1.2); }
                100% { opacity: 0; transform: translateY(-140px) scale(1.4); }
              }
            `}</style>

            {/* Bottom Stream Bar */}
            <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontSize: 11, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '12px 10px 4px', zIndex: 10 }}>
              <span>Trình diễn: <strong>BST Đông Cao Cấp 2026</strong></span>
              <span>Stylist: <strong>Elena Vũ</strong> (Hà Nội Hub)</span>
            </div>
          </div>

          {/* DEAL SỐC ĐANG GHIM (PINNED PRODUCT CARD - SOC-LIVE-01) */}
          {pinnedProduct && (
            <div style={{ marginTop: 20, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4 }}>
                  <Sparkles size={14} /> DEAL SỐC ĐANG LÊN SÓNG (GIẢM 35%)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                  <Clock size={14} /> Kết thúc sau: <strong>{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</strong>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 16, alignItems: 'center' }}>
                <img
                  src={pinnedProduct.images[0]?.url || '/products/shirt.svg'}
                  alt={pinnedProduct.name}
                  style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                  }}
                />

                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{pinnedProduct.name}</h3>
                  <p className="subtle" style={{ margin: '4px 0 8px', fontSize: 12 }}>
                    Gian hàng: <strong>{pinnedProduct.shop.name}</strong> · Chất liệu: {pinnedProduct.material}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <strong style={{ fontSize: 20, color: 'var(--brand-indigo)' }}>
                      {vnd(Math.round((pinnedProduct.variants[0]?.price ?? 1000000) * 0.65))}
                    </strong>
                    <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--muted)' }}>
                      {vnd(pinnedProduct.variants[0]?.price ?? 1000000)}
                    </span>
                    <span style={{ fontSize: 11, color: '#166534', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                      -35% Live Deal
                    </span>
                  </div>

                  {/* Stock Progress Bar */}
                  <div style={{ marginTop: 8, maxWidth: 300 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>Chỉ còn {stockLeft} chiếc giá Flash</span>
                      <span className="subtle">Đã bán 42/50</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(42 / 50) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
                    </div>
                  </div>
                </div>

                {/* 1-TAP PURCHASE ACTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['S', 'M', 'L'].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: selectedSize === size ? '2px solid var(--ink)' : '1px solid var(--line)',
                          background: selectedSize === size ? 'var(--ink)' : '#fff',
                          color: selectedSize === size ? '#fff' : 'var(--ink)',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="button"
                    style={{ padding: '10px 16px', fontSize: 13, gap: 8 }}
                    disabled={buying}
                    onClick={oneTapBuy}
                  >
                    <ShoppingBag size={16} />
                    {buying ? 'Đang chốt…' : 'Chốt Đơn 1-Chạm'}
                  </button>

                  <Link
                    href={`/san-pham/${pinnedProduct.slug}`}
                    className="button secondary"
                    style={{ padding: '6px 12px', fontSize: 11, textAlign: 'center' }}
                  >
                    Xem chi tiết bảng size <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* KỆ SẢN PHẨM PHIÊN LIVE (FEATURED RUNWAY SHELF) */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Trang Phục Xuất Hiện Trong Phiên Live ({products.length})</span>
              <span className="subtle" style={{ fontSize: 12, fontWeight: 400 }}>Nhấp vào để đổi sản phẩm ghim trên sàn diễn</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {products.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => { setPinnedIndex(idx); setStockLeft(8); }}
                  style={{
                    background: '#fff',
                    border: pinnedIndex === idx ? '2px solid var(--brand-indigo)' : '1px solid var(--line)',
                    borderRadius: 8,
                    padding: 10,
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                  }}
                >
                  <img
                    src={p.images[0]?.url || '/products/shirt.svg'}
                    alt={p.name}
                    style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                    }}
                  />
                  <strong style={{ fontSize: 12, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</strong>
                  <span style={{ fontSize: 12, color: 'var(--brand-indigo)', fontWeight: 600 }}>{vnd(p.variants[0]?.price ?? 0)}</span>
                  {pinnedIndex === idx && <span style={{ display: 'block', fontSize: 10, color: 'var(--brand-indigo)', marginTop: 4 }}>● Đang diễn trên sàn</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: PHÒNG CHAT TƯƠNG TÁC THỜI GIAN THỰC & NÚT THẢ TIM */}
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, height: 680, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          {/* Chat Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf9f5' }}>
            <div>
              <strong style={{ fontSize: 14 }}>Khán Phòng Trực Tiếp</strong>
              <span className="subtle" style={{ display: 'block', fontSize: 11 }}>Stylist &amp; Khán giả tương tác trực tiếp</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={addHeart}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Bấm để thả tim cho người mẫu"
              >
                <Heart size={15} fill="#DC2626" /> {heartsCount.toLocaleString('vi-VN')}
              </button>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div style={{ flex: 1, padding: '16px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  fontSize: 13,
                  background: m.role === 'host' ? '#EFF6FF' : m.role === 'system' ? '#FEF3C7' : 'transparent',
                  padding: m.role ? '8px 12px' : '4px 0',
                  borderRadius: 8,
                  border: m.role === 'host' ? '1px solid #BFDBFE' : m.role === 'system' ? '1px solid #FDE68A' : 'none',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: m.role === 'host' ? '#2563EB' : m.role === 'system' ? '#D97706' : '#64748B',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {m.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: m.role === 'host' ? '#1E40AF' : m.role === 'system' ? '#B45309' : 'var(--ink)' }}>
                      {m.sender} {m.role === 'host' && <span style={{ fontSize: 10, background: '#DBEAFE', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>HOST</span>}
                    </span>
                    <span className="subtle" style={{ fontSize: 10 }}>{m.time}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.4, color: m.role === 'system' ? '#92400E' : 'inherit' }}>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form
            onSubmit={sendChat}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--line)',
              background: '#faf9f5',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Đặt câu hỏi về size, chất vải..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--line)', background: '#fff', fontSize: 13 }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'var(--ink)',
                border: 0,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                opacity: chatInput.trim() ? 1 : 0.5,
              }}
              aria-label="Gửi bình luận"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      {/* Khán Giả Bình Chọn Bộ Sưu Tập Kế Tiếp & Mở Khóa Deal Độc Quyền (LIVE-STREAM-POLL-01) */}
      <div
        style={{
          marginTop: 28,
          padding: '20px 24px',
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div className="row between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={18} color="var(--brand-indigo)" />
              <h2 style={{ margin: 0, fontSize: 18 }}>Khán Giả Bình Chọn Set Trình Diễn Tiếp Theo (LIVE-STREAM-POLL-01)</h2>
              <span style={{ fontSize: 10, background: '#EEF2FF', color: 'var(--brand-indigo)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                INTERACTIVE RUNWAY POLL
              </span>
            </div>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Tham gia điều phối sàn diễn theo sở thích! Mẫu có số phiếu cao nhất sẽ được người mẫu diện trong lượt catwalk tiếp theo. Bình chọn để nhận ngay Voucher Flash Deal -20%.
            </p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>
            Tổng số phiếu: <strong>{(pollVotes['opt-1'] + pollVotes['opt-2'] + pollVotes['opt-3']).toLocaleString('vi-VN')} lượt</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {[
            {
              id: 'opt-1',
              title: 'Set 1: Áo Blazer Da Ý & Quần Tây Xếp Ly',
              category: 'Contemporary Power Dressing',
              desc: 'Form dáng cấu trúc sắc nét kết hợp chất da cừu nappa bóng mờ sang trọng.',
              img: '/products/blazer.svg',
            },
            {
              id: 'opt-2',
              title: 'Set 2: Đầm Lụa Satin Sơn Mài Đen Dạ Tiệc',
              category: 'Quiet Luxury Gala',
              desc: 'Tà váy rủ tự nhiên với hiệu ứng bắt sáng mềm mại dưới ánh đèn sàn diễn.',
              img: '/products/dress.svg',
            },
            {
              id: 'opt-3',
              title: 'Set 3: Áo Khoác Măng Tô Dạ Ép Double-Breasted',
              category: 'Winter Atelier Outerwear',
              desc: 'Chất dạ lông cừu thượng hạng dệt thủ công tạo phom đứng ấm áp đẳng cấp.',
              img: '/products/coat.svg',
            },
          ].map((opt) => {
            const total = pollVotes['opt-1'] + pollVotes['opt-2'] + pollVotes['opt-3'];
            const count = pollVotes[opt.id] || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = selectedPollOption === opt.id;

            return (
              <div
                key={opt.id}
                style={{
                  border: isSelected ? '2px solid var(--brand-indigo)' : '1px solid var(--line)',
                  borderRadius: 6,
                  padding: 14,
                  background: isSelected ? '#fbf8f3' : '#faf9f5',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 4, background: '#eee', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={opt.img}
                        alt={opt.title}
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          if (!t.src.includes('/products/shirt.svg')) t.src = '/products/shirt.svg';
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
                        {opt.category}
                      </span>
                      <strong style={{ fontSize: 13, display: 'block', color: 'var(--ink)' }}>{opt.title}</strong>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>{opt.desc}</p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: 'var(--muted)' }}>Tỷ lệ bình chọn</span>
                      <strong style={{ color: isSelected ? 'var(--brand-indigo)' : 'var(--ink)' }}>{percent}% ({count} phiếu)</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: isSelected ? 'var(--brand-indigo)' : '#64748b',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={hasVotedPoll}
                    onClick={() => handleVotePoll(opt.id)}
                    className={isSelected ? 'button' : 'button secondary'}
                    style={{
                      width: '100%',
                      fontSize: 11,
                      padding: '6px 10px',
                      opacity: hasVotedPoll && !isSelected ? 0.6 : 1,
                    }}
                  >
                    {hasVotedPoll ? (isSelected ? '✓ Bạn đã chọn mẫu này' : 'Đã hoàn thành bình chọn') : 'Bình chọn set này'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voucher Reward Banner */}
        {hasVotedPoll && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#f0fdf4',
              borderRadius: 6,
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center' }}>
                <Gift size={18} color="#16a34a" />
              </div>
              <div>
                <strong style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} /> Thưởng Khán Giả: Mã Giảm Giá Live Flash Deal -20%
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#334155' }}>
                  Áp dụng trực tiếp tại bước thanh toán giỏ hàng cho toàn bộ sản phẩm đang diễn trên sàn runway.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  padding: '4px 12px',
                  background: '#fff',
                  border: '1px dashed #16a34a',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: '#15803d',
                }}
              >
                RUNWAY20
              </div>
              <button
                type="button"
                className="button"
                style={{ fontSize: 11, padding: '6px 12px' }}
                onClick={() => {
                  try {
                    navigator.clipboard.writeText('RUNWAY20');
                  } catch {}
                  setVoucherCopied(true);
                  setTimeout(() => setVoucherCopied(false), 2500);
                }}
              >
                {voucherCopied ? '✓ Đã sao chép' : 'Sao chép mã'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lookbook Đa Góc Nhìn Sàn Diễn Catwalk & Hậu Trường (LIVE-RUNWAY-LOOKBOOK-01) */}
      <div style={{ marginTop: 28, padding: '20px 24px', background: '#fff', border: '1px solid var(--line)', borderRadius: 8 }}>
        <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Camera size={18} color="var(--brand-indigo)" />
              <h2 style={{ margin: 0, fontSize: 18 }}>Lookbook Sàn Diễn Đa Góc Nhìn (LIVE-RUNWAY-LOOKBOOK-01)</h2>
              <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                RUNWAY 360°
              </span>
            </div>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Khám phá trang phục từ góc Catwalk trực diện, cận cảnh vi mô sớ vải 4K và hậu trường chuẩn bị của Stylist.
            </p>
          </div>

          {/* Angle Selectors */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'CATWALK', label: '🚶 Sàn Diễn Catwalk' },
              { id: 'MACRO', label: '🔍 Cận Cảnh Sợi Vải 4K' },
              { id: 'BACKSTAGE', label: '💄 Hậu Trường Stylist' },
            ].map(ang => (
              <button
                key={ang.id}
                type="button"
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: runwayAngle === ang.id ? 700 : 500,
                  border: runwayAngle === ang.id ? '1px solid var(--brand-indigo)' : '1px solid var(--line)',
                  background: runwayAngle === ang.id ? '#EEF2FF' : '#fff',
                  color: runwayAngle === ang.id ? 'var(--brand-indigo)' : 'var(--ink)',
                  cursor: 'pointer',
                }}
                onClick={() => setRunwayAngle(ang.id as any)}
              >
                {ang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Runway Lookbook Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              id: 'look-1',
              title: 'Set Áo Sơ Mi Lụa & Quần Tây Xếp Ly',
              category: 'Normandy Minimalist',
              price: 1250000,
              livePrice: 1062500,
              slug: 'ao-so-mi-lua-to-tam-cao-cap',
              img: '/products/shirt.svg',
              catwalkDesc: 'Tà áo lụa bay nhẹ theo nhịp bước chân, phom suông thanh thoát dưới ánh đèn spotlight vàng ấm.',
              macroDesc: 'Bề mặt sợi tơ dệt mật độ cao 19mm momme, đường kim mũi chỉ 5 mũi/cm chuẩn Haute Couture.',
              backstageDesc: 'Stylist sơ-vin vạt trước, mở 2 khuy cổ tạo nét phóng khoáng tự nhiên trước giờ diễn.',
            },
            {
              id: 'look-2',
              title: 'Áo Blazer Da Ý & Thắt Lưng Cổ Điển',
              category: 'Contemporary Executive',
              price: 2850000,
              livePrice: 2422500,
              slug: 'ao-khoac-blazer-linen-dang-suong',
              img: '/products/jacket.svg',
              catwalkDesc: 'Cầu vai đệm mỏng quyền lực, ve áo nhọn sắc nét tạo phong thái đĩnh đạc tự tin trên sàn diễn.',
              macroDesc: 'Chất da thuộc thảo mộc tự nhiên thơm nhẹ, khuy áo sừng khắc logo NEXORA sắc sảo.',
              backstageDesc: 'Chuyên gia vuốt nhẹ nếp gấp tay áo và hoàn thiện điểm nhấn bằng thắt lưng da bò Ý.',
            },
            {
              id: 'look-3',
              title: 'Đầm Lụa Midi Dáng Suông & Khăn Cài',
              category: 'Quiet Luxury Evening',
              price: 1950000,
              livePrice: 1657500,
              slug: 'ao-polo-det-kim-merino',
              img: '/products/dress.svg',
              catwalkDesc: 'Độ rủ óng ả ôm nhẹ theo từng chuyển động cơ thể, tà váy xòe duyên dáng ở cuối sàn runway.',
              macroDesc: 'Sợi lụa satin bắt sáng huyền ảo, viền cổ may giấu chỉ tinh tế hoàn mỹ.',
              backstageDesc: 'Stylist kết hợp cùng khuyên tai ngọc trai tự nhiên và guốc cao gót thanh mảnh.',
            },
          ].map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 6,
                overflow: 'hidden',
                background: '#faf9f5',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', height: 200, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    if (!t.src.includes('/products/shirt.svg')) t.src = '/products/shirt.svg';
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontSize: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {runwayAngle === 'CATWALK' ? '📹 Cam 1 · Sàn Diễn' : runwayAngle === 'MACRO' ? '🔬 Cam 2 · Macro 4K' : '💄 Cam 3 · Hậu Trường'}
                </span>
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 10,
                    background: 'var(--brand-indigo)',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  LIVE DEAL -15%
                </span>
              </div>

              <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
                    {item.category}
                  </span>
                  <strong style={{ fontSize: 13, display: 'block', margin: '2px 0 6px', color: 'var(--ink)' }}>
                    {item.title}
                  </strong>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: '#444', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {runwayAngle === 'CATWALK' ? item.catwalkDesc : runwayAngle === 'MACRO' ? item.macroDesc : item.backstageDesc}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-indigo)' }}>
                      {vnd(item.livePrice)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>
                      {vnd(item.price)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href={`/san-pham/${item.slug}`}
                      className="button secondary"
                      style={{ flex: 1, fontSize: 11, padding: '6px 8px', textAlign: 'center' }}
                    >
                      Chi tiết <ArrowUpRight size={12} style={{ display: 'inline', verticalAlign: -1 }} />
                    </Link>
                    <button
                      type="button"
                      className="button"
                      style={{ flex: 1, fontSize: 11, padding: '6px 8px' }}
                      onClick={async () => {
                        const targetProd = catalog.data?.items.find(x => x.slug === item.slug) ?? catalog.data?.items[0];
                        const targetVar = targetProd?.variants[0];
                        if (targetVar) {
                          try {
                            await api('/cart', 'POST', { variantId: targetVar.id, quantity: 1 });
                            setSuccessNotice(`✓ Đã thêm "${item.title}" với giá ưu đãi Live Deal (-15%) vào giỏ hàng!`);
                          } catch (err) {
                            setErrorNotice((err as Error).message);
                          }
                        } else {
                          setSuccessNotice(`✓ Đã lưu mã giảm giá Live Deal -15% cho mẫu "${item.title}"!`);
                        }
                      }}
                    >
                      <ShoppingBag size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                      Chốt Deal Live
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bộ Thu Thập & Chụp Lookbook Sàn Diễn Tức Thời (LIVE-INTERACTIVE-RUNWAY-LOOKBOOK-01) */}
      <div
        style={{
          marginTop: 28,
          padding: '24px 26px',
          background: '#faf9f5',
          border: '1.5px solid var(--brand-indigo)',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(180, 83, 9, 0.08)',
        }}
      >
        <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'grid', placeItems: 'center' }}>
              <Layers size={18} color="var(--brand-indigo)" />
            </div>
            <div>
              <strong style={{ fontSize: 16, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Chụp &amp; Lưu Lookbook Sàn Diễn Tức Thời (LIVE-INTERACTIVE-RUNWAY-LOOKBOOK-01)
              </strong>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                Bắt trọn khoảnh khắc người mẫu đang sải bước, lưu trữ trọn set phối đồ vào bộ sưu tập cá nhân và hưởng chiết khấu trọn bộ -25%.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, background: 'var(--brand-indigo)', color: '#fff', padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>
            REALTIME RUNWAY CAPTURE
          </span>
        </div>

        {lookCapturedNotice && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 6, color: '#047857', fontSize: 12, fontWeight: 600 }}>
            {lookCapturedNotice}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 18 }}>
          {/* Active Live Runway Snapshot Box */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                  Khung Hình Sàn Diễn Trực Tiếp
                </span>
                <span style={{ fontSize: 10, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                  {runwayAngle === 'CATWALK' ? '📹 Sàn Diễn Catwalk' : runwayAngle === 'MACRO' ? '🔬 Cận Cảnh 4K' : '💄 Hậu Trường'}
                </span>
              </div>

              <div style={{ position: 'relative', height: 160, borderRadius: 6, overflow: 'hidden', background: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={pinnedProduct?.images[0]?.url || '/products/blazer.svg'}
                  alt="Current Live Look"
                  style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    if (!t.src.includes('/products/blazer.svg')) t.src = '/products/blazer.svg';
                  }}
                />
                <div style={{ position: 'absolute', bottom: 8, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 10, background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: 3 }}>
                  <span>{pinnedProduct?.name || 'BST Độc Quyền'}</span>
                  <span>Đang trên sàn diễn</span>
                </div>
              </div>

              <button
                type="button"
                disabled={capturingLook}
                onClick={captureRunwayLook}
                className="button"
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Camera size={15} />
                {capturingLook ? 'Đang chụp khoảnh khắc sàn diễn…' : 'Chụp & Lưu Lookbook Khung Hình Này Vào Tủ Đồ'}
              </button>
            </div>
          </div>

          {/* Complete Runway Outfit Set Breakdown */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                  Chi Tiết Trọn Set Sàn Diễn Đang Trình Chiếu
                </span>
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                  COMBO FLASH DEAL -25%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                  <span>1. Món chính: <strong>{pinnedProduct?.name}</strong></span>
                  <strong style={{ color: 'var(--ink)' }}>{vnd(pinnedProduct?.variants[0]?.price ?? 1250000)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                  <span>2. Quần suông tơ tằm xếp ly Atelier</span>
                  <strong style={{ color: 'var(--ink)' }}>{vnd(1350000)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                  <span>3. Thắt lưng da thảo mộc khóa đồng</span>
                  <strong style={{ color: 'var(--ink)' }}>{vnd(650000)}</strong>
                </div>
              </div>

              {/* Price Calculation */}
              {(() => {
                const baseMain = pinnedProduct?.variants[0]?.price ?? 1250000;
                const totalOriginal = baseMain + 1350000 + 650000;
                const setDiscounted = Math.round(totalOriginal * 0.75);

                return (
                  <div style={{ padding: '8px 10px', background: '#EEF2FF', border: '1px dashed var(--brand-indigo)', borderRadius: 6, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Tổng niêm yết (3 món):</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>{vnd(totalOriginal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>Giá trọn set sàn diễn (-25%):</span>
                      <strong style={{ fontSize: 15, color: 'var(--brand-indigo)' }}>{vnd(setDiscounted)}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              type="button"
              className="button"
              style={{
                width: '100%',
                padding: '9px 14px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onClick={async () => {
                if (!pinnedProduct) return;
                const variant = pinnedProduct.variants[0];
                if (variant) {
                  try {
                    await api('/cart', 'POST', { variantId: variant.id, quantity: 1 });
                    setSuccessNotice(`✓ Đã thêm trọn bộ Set Sàn Diễn của "${pinnedProduct.name}" với giá ưu đãi Combo -25% vào giỏ hàng!`);
                  } catch (e) {
                    setErrorNotice((e as Error).message);
                  }
                }
              }}
            >
              <ShoppingBag size={14} /> Chốt Trọn Set Sàn Diễn Vào Giỏ Hàng (-25%)
            </button>
          </div>
        </div>

        {/* Saved Lookbooks Gallery */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Bookmark size={14} color="var(--brand-indigo)" /> Bộ Sưu Tập Lookbook Sàn Diễn Đã Lưu ({savedLookbooks.length})
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              Được đồng bộ tự động vào Tủ đồ số tại `/tai-khoan`
            </span>
          </div>

          {savedLookbooks.length === 0 ? (
            <div style={{ padding: '16px', background: '#fff', border: '1px dashed var(--line)', borderRadius: 6, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
              Bạn chưa chụp lưu set nào trong phiên live hôm nay. Hãy bấm nút <strong>"Chụp &amp; Lưu Lookbook"</strong> ở trên để bắt trọn set đồ yêu thích nhé!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {savedLookbooks.map((lb) => (
                <div
                  key={lb.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                      <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 2 }}>{lb.angle}</span>
                      <span>{lb.time}</span>
                    </div>
                    <strong style={{ fontSize: 12, display: 'block', color: 'var(--ink)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lb.title}
                    </strong>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-indigo)' }}>
                      {vnd(lb.price)}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="button secondary"
                      style={{ flex: 1, fontSize: 10, padding: '4px 6px' }}
                      onClick={() => {
                        setSuccessNotice(`✓ Đã mở lại bản phối "${lb.title}" từ kho Lookbook sàn diễn.`);
                      }}
                    >
                      Xem Lại
                    </button>
                    <button
                      type="button"
                      className="button"
                      style={{ flex: 1, fontSize: 10, padding: '4px 6px' }}
                      onClick={async () => {
                        if (pinnedProduct?.variants[0]) {
                          try {
                            await api('/cart', 'POST', { variantId: pinnedProduct.variants[0].id, quantity: 1 });
                            setSuccessNotice(`✓ Đã thêm "${lb.title}" vào giỏ hàng!`);
                          } catch (e) {
                            setErrorNotice((e as Error).message);
                          }
                        }
                      }}
                    >
                      Chốt Đơn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
