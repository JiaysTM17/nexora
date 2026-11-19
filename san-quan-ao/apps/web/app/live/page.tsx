'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Clock, Heart, Radio, Send, ShoppingBag, Sparkles, Users, Volume2, VolumeX } from 'lucide-react';
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
                    <strong style={{ fontSize: 20, color: 'var(--clay)' }}>
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
                    border: pinnedIndex === idx ? '2px solid var(--clay)' : '1px solid var(--line)',
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
                  <span style={{ fontSize: 12, color: 'var(--clay)', fontWeight: 600 }}>{vnd(p.variants[0]?.price ?? 0)}</span>
                  {pinnedIndex === idx && <span style={{ display: 'block', fontSize: 10, color: 'var(--clay)', marginTop: 4 }}>● Đang diễn trên sàn</span>}
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
    </section>
  );
}
