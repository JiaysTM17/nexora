'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowRight, Share2, Check, RefreshCw, Layers, Sun, Cloud, Wind, Thermometer, MapPin, Compass } from 'lucide-react';
import { api, vnd } from '../api';
import { Notice, useUser } from '../ui';

type StylePiece = {
  id: string;
  category: 'top' | 'bottom' | 'outer';
  name: string;
  shop: string;
  price: number;
  image: string;
  material: string;
  colors: { name: string; hex: string; variantId: string }[];
  sizes: string[];
};

const PIECES: StylePiece[] = [
  // Tops
  {
    id: 'linen-shirt',
    category: 'top',
    name: 'Sơ mi linen thong thả',
    shop: 'NÉP Studio',
    price: 425000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    material: 'Linen 100% thoáng khí',
    colors: [
      { name: 'Kem', hex: '#dfd4bd', variantId: 'linen-shirt-0-M' },
      { name: 'Đen', hex: '#30332f', variantId: 'linen-shirt-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'everyday-tee',
    category: 'top',
    name: 'Áo thun ngày thường',
    shop: 'Lụa & Co',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    material: 'Cotton 100% Compact 220gsm',
    colors: [
      { name: 'Trắng', hex: '#eeeae1', variantId: 'everyday-tee-0-M' },
      { name: 'Xanh', hex: '#748774', variantId: 'everyday-tee-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  // Bottoms
  {
    id: 'wide-trousers',
    category: 'bottom',
    name: 'Quần suông nếp nhẹ',
    shop: 'Lụa & Co',
    price: 495000,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80',
    material: 'Cotton 97%, spandex 3%',
    colors: [
      { name: 'Nâu', hex: '#82644e', variantId: 'wide-trousers-0-M' },
      { name: 'Đen', hex: '#30332f', variantId: 'wide-trousers-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'weekend-dress',
    category: 'bottom',
    name: 'Đầm dạo cuối tuần',
    shop: 'NÉP Studio',
    price: 685000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
    material: 'Cotton 70%, linen 30%',
    colors: [
      { name: 'Nâu', hex: '#a7654b', variantId: 'weekend-dress-0-M' },
      { name: 'Kem', hex: '#dfd4bd', variantId: 'weekend-dress-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  // Outerwear
  {
    id: 'linen-blazer',
    category: 'outer',
    name: 'Áo khoác Blazer Linen cấu trúc nhẹ',
    shop: 'NÉP Studio',
    price: 1350000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
    material: 'Linen 100% phom Relaxed Tailored',
    colors: [
      { name: 'Kem', hex: '#f4ede1', variantId: 'linen-blazer-0-M' },
      { name: 'Đen', hex: '#252926', variantId: 'linen-blazer-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 'wool-trench-coat',
    category: 'outer',
    name: 'Áo măng tô Trench Coat dạ mỏng cao cấp',
    shop: 'NÉP Studio',
    price: 2450000,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=80',
    material: 'Wool pha lụa dệt chéo',
    colors: [
      { name: 'Nâu cát', hex: '#b89f82', variantId: 'wool-trench-coat-0-M' },
      { name: 'Xanh rêu', hex: '#475345', variantId: 'wool-trench-coat-1-M' },
    ],
    sizes: ['S', 'M', 'L'],
  },
];

export default function MixMatchPage() {
  const { user } = useUser();
  const [topId, setTopId] = useState('linen-shirt');
  const [bottomId, setBottomId] = useState('wide-trousers');
  const [outerId, setOuterId] = useState<string | null>('linen-blazer');
  const [topColor, setTopColor] = useState('Kem');
  const [bottomColor, setBottomColor] = useState('Nâu');
  const [outerColor, setOuterColor] = useState('Kem');
  const [topSize, setTopSize] = useState('M');
  const [bottomSize, setBottomSize] = useState('M');
  const [outerSize, setOuterSize] = useState('M');

  const [weatherCity, setWeatherCity] = useState<'SAIGON' | 'HANOI' | 'DALAT'>('SAIGON');
  const [occasion, setOccasion] = useState<'OFFICE' | 'STREET' | 'GALA'>('OFFICE');

  function applyWeatherFormula(city: 'SAIGON' | 'HANOI' | 'DALAT', occ: 'OFFICE' | 'STREET' | 'GALA') {
    setWeatherCity(city);
    setOccasion(occ);
    if (city === 'SAIGON') {
      setTopId('linen-shirt');
      setTopColor('Kem');
      setBottomId('wide-trousers');
      setBottomColor('Nâu');
      setOuterId(null);
      setNotice('☀️ Đã áp dụng công thức thời tiết Sài Gòn (32°C): Linen 100% thoáng khí + Quần suông nếp nhẹ, tối ưu giải nhiệt và giữ độ thanh lịch.');
    } else if (city === 'HANOI') {
      setTopId('linen-shirt');
      setTopColor('Kem');
      setBottomId('wide-trousers');
      setBottomColor('Nâu');
      setOuterId('linen-blazer');
      setOuterColor('Kem');
      setNotice('⛅ Đã áp dụng công thức thời tiết Hà Nội (19°C): Phối lớp Smart Layering với Blazer Linen Tailored và Sơ mi linen.');
    } else {
      setTopId('everyday-tee');
      setTopColor('Trắng');
      setBottomId('wide-trousers');
      setBottomColor('Đen');
      setOuterId('wool-trench-coat');
      setOuterColor('Nâu cát');
      setNotice('🌧️ Đã áp dụng công thức thời tiết Đà Lạt (14°C): Áo măng tô Trench Coat dạ mỏng cao cấp + Cotton compact giữ ấm cơ thể.');
    }
  }

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selectedTop = PIECES.find(p => p.id === topId)!;
  const selectedBottom = PIECES.find(p => p.id === bottomId)!;
  const selectedOuter = PIECES.find(p => p.id === outerId);

  const subtotal = selectedTop.price + selectedBottom.price + (selectedOuter?.price ?? 0);
  const bundleDiscount = Math.round(subtotal * 0.1); // -10% bundle style saver
  const finalTotal = subtotal - bundleDiscount;

  async function addBundleToCart() {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm trọn set đồ vào giỏ hàng.');
      return;
    }
    setBusy(true);
    setNotice('');
    setError('');

    const topVariant = selectedTop.colors.find(c => c.name === topColor)?.variantId ?? selectedTop.colors[0].variantId;
    const bottomVariant = selectedBottom.colors.find(c => c.name === bottomColor)?.variantId ?? selectedBottom.colors[0].variantId;
    const outerVariant = selectedOuter?.colors.find(c => c.name === outerColor)?.variantId ?? selectedOuter?.colors[0].variantId;

    try {
      // Add items sequentially
      await api('/cart', 'POST', { variantId: topVariant, quantity: 1 });
      await api('/cart', 'POST', { variantId: bottomVariant, quantity: 1 });
      if (outerVariant) {
        await api('/cart', 'POST', { variantId: outerVariant, quantity: 1 });
      }
      setNotice(`Đã thêm trọn bộ ${outerVariant ? '3' : '2'} món vào giỏ hàng! Đã áp dụng ưu đãi Combo Style Saver (-10%).`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} color="var(--clay)" />
            NEXORA EDITORIAL STUDIO · CAT-MIX-MATCH-01
          </p>
          <h1 style={{ margin: '4px 0 8px', fontSize: 28, fontFamily: 'Georgia, serif' }}>
            Phòng Thử Đồ Mix &amp; Match
          </h1>
          <p className="subtle" style={{ margin: 0, maxWidth: 600 }}>
            Tự do phối ghép các mảnh ghép trang phục thời thượng, tính toán bảng màu hài hòa và nhận ngay ưu đãi <strong>Combo Style Saver -10%</strong> khi mua trọn bộ.
          </p>
        </div>

        <Link href="/cong-dong" className="button subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Share2 size={16} /> Xem Outfit Cộng Đồng
        </Link>
      </div>

      {notice && (
        <div style={{ marginTop: 20 }}>
          <Notice>{notice} <Link href="/gio-hang" style={{ fontWeight: 600, textDecoration: 'underline' }}>Đến giỏ hàng ngay →</Link></Notice>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 20 }}>
          <Notice error>{error}</Notice>
        </div>
      )}

      {/* Bộ Lọc Phối Đồ Theo Thời Tiết & Ngữ Cảnh (CAT-OUTFIT-WEATHER-SYNC-01) */}
      <div
        style={{
          marginTop: 20,
          padding: '14px 18px',
          background: '#fdfbf7',
          border: '1px solid #fed7aa',
          borderRadius: 6,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Thermometer size={16} color="var(--clay)" />
            <strong style={{ fontSize: 13, color: '#9a3412' }}>
              Gợi Ý Phối Đồ Theo Thời Tiết &amp; Dịp Xuất Hiện (CAT-OUTFIT-WEATHER-SYNC-01)
            </strong>
            <span style={{ fontSize: 10, background: '#ffedd5', color: '#9a3412', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
              AI WEATHER SYNC
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#78350f' }}>
            Khí hậu địa phương: <strong>{weatherCity === 'SAIGON' ? 'Nhiệt đới nắng ấm (32°C)' : weatherCity === 'HANOI' ? 'Gió mùa Đông Bắc (19°C)' : 'Cao nguyên sương lạnh (14°C)'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Thành phố / Khí hậu:</span>
          {[
            { id: 'SAIGON' as const, label: '☀️ Sài Gòn 32°C (Nắng ấm)', tip: 'Linen & Lụa thoáng khí' },
            { id: 'HANOI' as const, label: '⛅ Hà Nội 19°C (Se lạnh)', tip: 'Layering với Blazer' },
            { id: 'DALAT' as const, label: '🌧️ Đà Lạt 14°C (Sương gió)', tip: 'Trench coat dạ mỏng' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyWeatherFormula(item.id, occasion)}
              style={{
                fontSize: 11,
                padding: '5px 12px',
                borderRadius: 20,
                border: weatherCity === item.id ? '1.5px solid var(--clay)' : '1px solid #fed7aa',
                background: weatherCity === item.id ? '#fed7aa' : '#fff',
                color: weatherCity === item.id ? '#7c2d12' : '#9a3412',
                fontWeight: weatherCity === item.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}

          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginLeft: 12 }}>Ngữ cảnh:</span>
          {[
            { id: 'OFFICE' as const, label: '🏢 Công sở' },
            { id: 'STREET' as const, label: '☕ Dạo phố' },
            { id: 'GALA' as const, label: '🍷 Dạ tiệc' },
          ].map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setOccasion(occ.id)}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 4,
                border: occasion === occ.id ? '1px solid var(--ink)' : '1px solid var(--line)',
                background: occasion === occ.id ? 'var(--ink)' : '#fff',
                color: occasion === occ.id ? '#fff' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {occ.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32,
          marginTop: 28,
        }}
      >
        {/* Left Column: Style Canvas (Visual Stack) */}
        <div>
          <div
            style={{
              padding: 24,
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div className="row between" style={{ marginBottom: 16 }}>
              <span className="eyebrow" style={{ margin: 0 }}>
                BỘ PHỐI HIỆN TẠI ({selectedOuter ? '3 MÓN' : '2 MÓN'})
              </span>
              <span
                style={{
                  fontSize: 11,
                  background: 'var(--sage)',
                  color: 'var(--ink)',
                  padding: '2px 8px',
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >
                ★ Tone-sur-Tone: 98/100
              </span>
            </div>

            {/* Visual Canvas Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: selectedOuter ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {/* Outer Layer */}
              {selectedOuter && (
                <div style={{ position: 'relative' }}>
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#f5f0e8' }}>
                    <img
                      src={selectedOuter.image}
                      alt={selectedOuter.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--clay)', fontWeight: 700 }}>LỚP NGOÀI</span>
                    <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedOuter.name}</h4>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedOuter.price)}</span>
                  </div>
                </div>
              )}

              {/* Top Layer */}
              <div style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#f5f0e8' }}>
                  <img
                    src={selectedTop.image}
                    alt={selectedTop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                    }}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--clay)', fontWeight: 700 }}>ÁO CHÍNH</span>
                  <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedTop.name}</h4>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedTop.price)}</span>
                </div>
              </div>

              {/* Bottom Layer */}
              <div style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#f5f0e8' }}>
                  <img
                    src={selectedBottom.image}
                    alt={selectedBottom.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                    }}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--clay)', fontWeight: 700 }}>QUẦN / VÁY</span>
                  <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedBottom.name}</h4>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedBottom.price)}</span>
                </div>
              </div>
            </div>

            {/* Editorial Palette Note */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                background: '#faf8f5',
                border: '1px solid var(--line)',
                borderRadius: 4,
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: 'block', color: 'var(--ink)', marginBottom: 2 }}>
                Đánh giá Phom Dáng &amp; Chất Liệu từ Stylist:
              </strong>
              <span style={{ color: '#555' }}>
                Sự phối hợp giữa {selectedTop.material} và {selectedBottom.material} tạo độ chuyển tiếp tự nhiên, phóng khoáng mà vẫn giữ được chuẩn mực may đo tinh tế.
              </span>
            </div>

            {/* Total and Checkout Card */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--line)',
              }}
            >
              <div className="row between" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                <span>Tổng giá gốc ({selectedOuter ? '3' : '2'} sản phẩm):</span>
                <span>{vnd(subtotal)}</span>
              </div>
              <div className="row between" style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginBottom: 8 }}>
                <span>Ưu đãi Combo Style Saver (-10%):</span>
                <span>−{vnd(bundleDiscount)}</span>
              </div>
              <div className="row between" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
                <span>Tổng thanh toán Combo:</span>
                <span style={{ color: 'var(--clay)' }}>{vnd(finalTotal)}</span>
              </div>

              <button
                className="button full"
                onClick={addBundleToCart}
                disabled={busy}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {busy ? <RefreshCw size={18} className="spin" /> : <ShoppingBag size={18} />}
                <span>{busy ? 'Đang thêm cả set…' : `Mua Trọn Set (Tiết kiệm ${vnd(bundleDiscount)})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Wardrobe Selector Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Áo Khoác Ngoài (Outerwear) */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="var(--clay)" /> Lớp Ngoài (Outerwear)
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button
                className={`choice ${outerId === null ? 'chosen' : ''}`}
                onClick={() => setOuterId(null)}
              >
                Không chọn
              </button>
              {PIECES.filter(p => p.category === 'outer').map(p => (
                <button
                  key={p.id}
                  className={`choice ${outerId === p.id ? 'chosen' : ''}`}
                  onClick={() => setOuterId(p.id)}
                >
                  {p.name} ({vnd(p.price)})
                </button>
              ))}
            </div>
            {selectedOuter && (
              <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--muted)' }}>Màu sắc:</span>
                <div className="choices">
                  {selectedOuter.colors.map(c => (
                    <button
                      key={c.name}
                      className={`choice ${outerColor === c.name ? 'chosen' : ''}`}
                      onClick={() => setOuterColor(c.name)}
                    >
                      <i style={{ background: c.hex }} /> {c.name}
                    </button>
                  ))}
                </div>
                <span style={{ color: 'var(--muted)', marginLeft: 8 }}>Size:</span>
                <div className="choices">
                  {selectedOuter.sizes.map(s => (
                    <button
                      key={s}
                      className={`choice ${outerSize === s ? 'chosen' : ''}`}
                      onClick={() => setOuterSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Áo Chính (Tops) */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--clay)" /> Áo Chính (Tops)
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {PIECES.filter(p => p.category === 'top').map(p => (
                <button
                  key={p.id}
                  className={`choice ${topId === p.id ? 'chosen' : ''}`}
                  onClick={() => setTopId(p.id)}
                >
                  {p.name} ({vnd(p.price)})
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: 'var(--muted)' }}>Màu sắc:</span>
              <div className="choices">
                {selectedTop.colors.map(c => (
                  <button
                    key={c.name}
                    className={`choice ${topColor === c.name ? 'chosen' : ''}`}
                    onClick={() => setTopColor(c.name)}
                  >
                    <i style={{ background: c.hex }} /> {c.name}
                  </button>
                ))}
              </div>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>Size:</span>
              <div className="choices">
                {selectedTop.sizes.map(s => (
                  <button
                    key={s}
                    className={`choice ${topSize === s ? 'chosen' : ''}`}
                    onClick={() => setTopSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Quần / Chân Váy (Bottoms) */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--clay)" /> Quần / Chân Váy (Bottoms)
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {PIECES.filter(p => p.category === 'bottom').map(p => (
                <button
                  key={p.id}
                  className={`choice ${bottomId === p.id ? 'chosen' : ''}`}
                  onClick={() => setBottomId(p.id)}
                >
                  {p.name} ({vnd(p.price)})
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: 'var(--muted)' }}>Màu sắc:</span>
              <div className="choices">
                {selectedBottom.colors.map(c => (
                  <button
                    key={c.name}
                    className={`choice ${bottomColor === c.name ? 'chosen' : ''}`}
                    onClick={() => setBottomColor(c.name)}
                  >
                    <i style={{ background: c.hex }} /> {c.name}
                  </button>
                ))}
              </div>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>Size:</span>
              <div className="choices">
                {selectedBottom.sizes.map(s => (
                  <button
                    key={s}
                    className={`choice ${bottomSize === s ? 'chosen' : ''}`}
                    onClick={() => setBottomSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div
            style={{
              padding: '16px 20px',
              background: '#fcfaf6',
              border: '1px solid var(--line)',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: 6 }}>
              Quyền Lợi Độc Quyền Khi Mua Combo (CAT-MIX-MATCH):
            </strong>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)' }}>
              <li>Chiết khấu ngay <strong>10%</strong> trên toàn bộ set đồ đã phối.</li>
              <li>Miễn phí vận chuyển toàn quốc với mã <strong>Freeship Xtra</strong> tại Giỏ hàng.</li>
              <li>Hỗ trợ đổi size từng món riêng biệt trong vòng 7–15 ngày.</li>
              <li>Được tặng <strong>+100 Xu NEXORA Coins</strong> khi chia sẻ hình chụp OOTD thực tế lên Cộng đồng.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
