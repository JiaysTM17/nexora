'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ArrowRight, Share2, Check, RefreshCw, Layers, Sun, Cloud, Wind, Thermometer, MapPin, Compass, Camera, Palette, Award, CheckCircle2, QrCode, X, Copy, Download, Trash2, BookmarkCheck, ExternalLink, SlidersHorizontal, Calculator } from 'lucide-react';
import { api, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

type StylePiece = {
  id: string;
  category: 'top' | 'bottom' | 'outer';
  name: string;
  shop: string;
  price: number;
  image: string;
  material: string;
  colors: { name: string; hex: string }[];
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
      { name: 'Kem', hex: '#dfd4bd' },
      { name: 'Đen', hex: '#30332f' },
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
      { name: 'Trắng', hex: '#eeeae1' },
      { name: 'Xanh', hex: '#748774' },
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
      { name: 'Nâu', hex: '#82644e' },
      { name: 'Đen', hex: '#30332f' },
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
      { name: 'Nâu', hex: '#a7654b' },
      { name: 'Kem', hex: '#dfd4bd' },
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
      { name: 'Kem', hex: '#f4ede1' },
      { name: 'Đen', hex: '#252926' },
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
      { name: 'Nâu cát', hex: '#b89f82' },
      { name: 'Xanh rêu', hex: '#475345' },
    ],
    sizes: ['S', 'M', 'L'],
  },
];

function isOutOfStock(pieceId: string, colorIndex: number, size: string): boolean {
  if (pieceId === 'linen-shirt' && colorIndex === 1 && (size === 'S' || size === 'M')) return true;
  return false;
}

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
  const [showLookbookModal, setShowLookbookModal] = useState(false);
  const [lookbookTheme, setLookbookTheme] = useState<'ATELIER_OAK' | 'HERITAGE_STONE' | 'MIDNIGHT_NOIR'>('ATELIER_OAK');
  const [curatorName, setCuratorName] = useState('Elena Vũ · Senior Stylist');
  const [lookbookSaved, setLookbookSaved] = useState(false);
  const [showRadarAnalysis, setShowRadarAnalysis] = useState(false);

  // Saved Lookbooks from API / Vault
  const savedLookbooks = useResource<Array<any>>(user ? '/vault/lookbooks' : null);
  const savedCapsules = useResource<Array<any>>(user ? '/vault/capsules' : null);

  const [activeStudioTab, setActiveStudioTab] = useState<'MIX_MATCH' | 'CAPSULE'>('MIX_MATCH');
  const [capsuleWearsPerYear, setCapsuleWearsPerYear] = useState<number>(150);
  const [showCapsuleSwatchModal, setShowCapsuleSwatchModal] = useState<boolean>(false);
  const [capsuleRecipient, setCapsuleRecipient] = useState('');
  const [capsulePhone, setCapsulePhone] = useState('0901234567');
  const [capsuleAddress, setCapsuleAddress] = useState('Quận 1, TP. Hồ Chí Minh');
  const [capsuleSwatchBusy, setCapsuleSwatchBusy] = useState(false);
  const [capsuleSwatchSuccess, setCapsuleSwatchSuccess] = useState<string | null>(null);
  const [capsuleSavedNotice, setCapsuleSavedNotice] = useState('');

  const capsulePieces = PIECES.slice(0, 5);
  const capsuleSubtotal = capsulePieces.reduce((sum, p) => sum + p.price, 0);
  const capsuleDiscount = Math.round(capsuleSubtotal * 0.15); // -15% capsule saver
  const capsuleFinalTotal = capsuleSubtotal - capsuleDiscount;
  const costPerWear = Math.round(capsuleFinalTotal / (capsuleWearsPerYear || 1));

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selectedTop = PIECES.find(p => p.id === topId) || PIECES[0];
  const selectedBottom = PIECES.find(p => p.id === bottomId) || PIECES[2];
  const selectedOuter = PIECES.find(p => p.id === outerId);

  const topColorIndex = Math.max(0, selectedTop.colors.findIndex(c => c.name === topColor));
  const bottomColorIndex = Math.max(0, selectedBottom.colors.findIndex(c => c.name === bottomColor));
  const outerColorIndex = selectedOuter ? Math.max(0, selectedOuter.colors.findIndex(c => c.name === outerColor)) : 0;

  const topOos = isOutOfStock(selectedTop.id, topColorIndex, topSize);
  const bottomOos = isOutOfStock(selectedBottom.id, bottomColorIndex, bottomSize);
  const outerOos = selectedOuter ? isOutOfStock(selectedOuter.id, outerColorIndex, outerSize) : false;
  const anyOos = topOos || bottomOos || outerOos;

  const subtotal = selectedTop.price + selectedBottom.price + (selectedOuter?.price ?? 0);
  const bundleDiscount = Math.round(subtotal * 0.1); // -10% bundle style saver
  const finalTotal = subtotal - bundleDiscount;

  // Dynamic Color Harmony & Fit Calculation
  const harmonyScore = (() => {
    let score = 92;
    if (topColor === 'Kem' && bottomColor === 'Nâu') score = 98;
    else if (topColor === 'Trắng' && bottomColor === 'Đen') score = 96;
    else if (topColor === 'Kem' && bottomColor === 'Đen') score = 94;
    else if (topColor === 'Xanh' && bottomColor === 'Nâu') score = 95;
    if (selectedOuter) score = Math.min(99, score + 1);
    return score;
  })();

  function applyWeatherFormula(city: 'SAIGON' | 'HANOI' | 'DALAT', occ: 'OFFICE' | 'STREET' | 'GALA') {
    setWeatherCity(city);
    setOccasion(occ);
    if (city === 'SAIGON') {
      setTopId('linen-shirt');
      setTopColor('Kem');
      setTopSize('M');
      setBottomId('wide-trousers');
      setBottomColor('Nâu');
      setBottomSize('M');
      setOuterId(null);
      setNotice('Đã áp dụng công thức thời tiết Sài Gòn (32°C): Linen 100% thoáng khí + Quần suông nếp nhẹ, tối ưu giải nhiệt và giữ độ thanh lịch.');
    } else if (city === 'HANOI') {
      setTopId('linen-shirt');
      setTopColor('Kem');
      setTopSize('M');
      setBottomId('wide-trousers');
      setBottomColor('Nâu');
      setBottomSize('M');
      setOuterId('linen-blazer');
      setOuterColor('Kem');
      setOuterSize('M');
      setNotice('Đã áp dụng công thức thời tiết Hà Nội (19°C): Phối lớp Smart Layering với Blazer Linen Tailored và Sơ mi linen.');
    } else {
      setTopId('everyday-tee');
      setTopColor('Trắng');
      setTopSize('M');
      setBottomId('wide-trousers');
      setBottomColor('Đen');
      setBottomSize('M');
      setOuterId('wool-trench-coat');
      setOuterColor('Nâu cát');
      setOuterSize('M');
      setNotice('Đã áp dụng công thức thời tiết Đà Lạt (14°C): Áo măng tô Trench Coat dạ mỏng cao cấp + Cotton compact giữ ấm cơ thể.');
    }
  }

  async function addBundleToCart() {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm trọn set đồ vào giỏ hàng.');
      return;
    }
    if (anyOos) {
      setError('Một số món trong phối đồ đang tạm hết hàng ở biến thể đã chọn. Vui lòng chọn màu hoặc size khác.');
      return;
    }

    setBusy(true);
    setNotice('');
    setError('');

    const topVariant = `${selectedTop.id}-${topColorIndex}-${topSize}`;
    const bottomVariant = `${selectedBottom.id}-${bottomColorIndex}-${bottomSize}`;
    const outerVariant = selectedOuter ? `${selectedOuter.id}-${outerColorIndex}-${outerSize}` : null;

    try {
      const items = [
        { variantId: topVariant, quantity: 1 },
        { variantId: bottomVariant, quantity: 1 },
        ...(outerVariant ? [{ variantId: outerVariant, quantity: 1 }] : []),
      ];

      const res = await api<{ ok: boolean; addedCount: number }>('/cart/batch', 'POST', { items });
      setNotice(`✓ Đã thêm trọn bộ ${res.addedCount} món vào giỏ hàng thành công! Đã áp dụng ưu đãi Combo Style Saver (-10%).`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveLookbookToVault() {
    if (!user) {
      setError('Vui lòng đăng nhập để lưu Lookbook vào bộ sưu tập cá nhân.');
      return;
    }
    setBusy(true);
    try {
      const card = {
        id: `LB-${Date.now()}`,
        title: `Editorial ${weatherCity} Capsule`,
        theme: lookbookTheme,
        curator: curatorName,
        harmonyScore,
        pieces: {
          top: { id: selectedTop.id, name: selectedTop.name, color: topColor, size: topSize, price: selectedTop.price },
          bottom: { id: selectedBottom.id, name: selectedBottom.name, color: bottomColor, size: bottomSize, price: selectedBottom.price },
          outer: selectedOuter ? { id: selectedOuter.id, name: selectedOuter.name, color: outerColor, size: outerSize, price: selectedOuter.price } : null,
        },
        total: finalTotal,
        date: new Date().toLocaleDateString('vi-VN'),
      };

      await api('/vault/lookbook', 'POST', {
        id: card.id,
        title: card.title,
        items: [selectedTop, selectedBottom, selectedOuter].filter(Boolean),
        harmonyScore,
        palette: lookbookTheme,
        meta: card,
      });

      setLookbookSaved(true);
      setNotice('✓ Đã lưu Lookbook thành công vào Kho Lưu Trữ Cá Nhân (Vault)!');
      savedLookbooks.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSavedLookbook(id: string) {
    try {
      await api(`/vault/lookbooks/${id}`, 'DELETE');
      savedLookbooks.reload();
      setNotice('✓ Đã xóa Lookbook khỏi bộ sưu tập.');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveCapsuleToVault() {
    if (!user) {
      setError('Vui lòng đăng nhập để lưu Tủ Đồ Nhộng vào Fashion Vault.');
      return;
    }
    setBusy(true);
    try {
      await api('/vault/capsule', 'POST', {
        title: 'Tủ Đồ Nhộng Thu Đông Quiet Luxury (5 Món · 12 Bộ Phối)',
        pieces: capsulePieces.map(p => ({ id: p.id, name: p.name, price: p.price, material: p.material })),
        outfitsCount: 12,
        estimatedCostPerWear: costPerWear,
        totalInvestment: capsuleFinalTotal,
        bundleDiscount: capsuleDiscount,
        palette: 'Kem Mộc / Nâu Cát / Trắng Tơ / Đen Tuyển',
        notes: 'Dựng từ 5 món may đo tự nhiên, phối tạo 12 phong cách từ công sở đến du lịch.',
      });
      setCapsuleSavedNotice('✓ Đã lưu Tủ Đồ Nhộng vào Fashion Vault của bạn!');
      savedCapsules.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function addCapsuleToCart() {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm trọn gói Tủ Đồ Nhộng vào giỏ.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const items = capsulePieces.map(p => ({
        variantId: `${p.id}-0-M`,
        quantity: 1,
      }));
      const res = await api<{ ok: boolean; addedCount: number }>('/cart/batch', 'POST', { items });
      setNotice(`✓ Đã thêm trọn bộ ${res.addedCount} món trong Tủ Đồ Nhộng vào giỏ hàng thành công! Đã áp dụng ưu đãi đặc quyền Tủ Đồ (-15%).`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleOrderCapsuleSwatch(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để đặt hộp mẫu vải.');
      return;
    }
    setCapsuleSwatchBusy(true);
    try {
      const res = await api<{ ok: boolean; swatchOrder: any; voucherCode: string }>('/swatch-orders', 'POST', {
        productId: 'linen-shirt',
        shopId: 'shop-nep',
        productName: 'Set 3 Mẫu Vải Bảng Màu Capsule Tủ Đồ Nhộng',
        swatches: ['Linen Kem Mộc Tự Nhiên', 'Cotton Nâu Cát Compact', 'Wool Lụa Dạ Mỏng'],
        recipientName: capsuleRecipient || user.name || 'Khách Hàng VIP',
        phone: capsulePhone,
        address: capsuleAddress,
        depositFee: 50000,
      });
      setCapsuleSwatchSuccess(res.voucherCode);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCapsuleSwatchBusy(false);
    }
  }

  async function handleDeleteSavedCapsule(id: string) {
    try {
      await api(`/vault/capsules/${id}`, 'DELETE');
      savedCapsules.reload();
      setNotice('✓ Đã xóa Tủ Đồ Nhộng khỏi bộ sưu tập.');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function applySavedLookbook(lb: any) {
    const meta = lb.meta || lb;
    if (meta.pieces?.top?.id) {
      setTopId(meta.pieces.top.id);
      if (meta.pieces.top.color) setTopColor(meta.pieces.top.color);
      if (meta.pieces.top.size) setTopSize(meta.pieces.top.size);
    }
    if (meta.pieces?.bottom?.id) {
      setBottomId(meta.pieces.bottom.id);
      if (meta.pieces.bottom.color) setBottomColor(meta.pieces.bottom.color);
      if (meta.pieces.bottom.size) setBottomSize(meta.pieces.bottom.size);
    }
    if (meta.pieces?.outer) {
      setOuterId(meta.pieces.outer.id);
      if (meta.pieces.outer.color) setOuterColor(meta.pieces.outer.color);
      if (meta.pieces.outer.size) setOuterSize(meta.pieces.outer.size);
    } else {
      setOuterId(null);
    }
    setNotice(`✓ Đã áp dụng Lookbook "${meta.title || lb.title}" lên phòng thử đồ!`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  return (
    <section className="section">
      <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)' }}>
            <Sparkles size={14} color="var(--gold-dark)" />
            ATELIER STYLING STUDIO // MIX &amp; MATCH ARCHIVE
          </p>
          <h1 style={{ margin: '6px 0 10px', fontSize: 'clamp(28px, 3.2vw, 38px)', fontFamily: 'var(--font-serif)', fontWeight: 500, color: 'var(--ink)' }}>
            Phòng Thử Đồ &amp; Giám Tuyển Bản Phối
          </h1>
          <p className="subtle" style={{ margin: 0, maxWidth: 620, fontSize: 13, lineHeight: 1.65 }}>
            Tự do phối ghép các thiết kế may đo độc lập, thuật toán tính toán bảng màu hài hòa và tự động áp dụng ưu đãi đặc quyền <strong>Combo Style Saver -10%</strong> khi sở hữu trọn bộ.
          </p>
        </div>

        <Link href="/cong-dong" className="button subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
          <Share2 size={15} /> Xem Outfit Cộng Đồng
        </Link>
      </div>

      {/* Studio Mode Selector */}
      <div style={{ display: 'flex', gap: 10, marginTop: 22, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setActiveStudioTab('MIX_MATCH')}
          style={{
            fontSize: 12.5,
            fontWeight: activeStudioTab === 'MIX_MATCH' ? 700 : 500,
            padding: '8px 16px',
            background: activeStudioTab === 'MIX_MATCH' ? 'var(--ink)' : 'transparent',
            color: activeStudioTab === 'MIX_MATCH' ? '#fff' : 'var(--muted)',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={14} /> Phòng Thử Đồ Tự Do (Mix &amp; Match Canvas)
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioTab('CAPSULE')}
          style={{
            fontSize: 12.5,
            fontWeight: activeStudioTab === 'CAPSULE' ? 700 : 500,
            padding: '8px 16px',
            background: activeStudioTab === 'CAPSULE' ? 'var(--gold-dark)' : 'transparent',
            color: activeStudioTab === 'CAPSULE' ? '#fff' : 'var(--muted)',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Layers size={14} /> Tủ Đồ Nhộng Độc Bản (Capsule 5x5 Matrix · -15%)
        </button>
      </div>

      {notice && (
        <div style={{ marginTop: 20 }}>
          <Notice>{notice} <Link href="/gio-hang" style={{ fontWeight: 600, textDecoration: 'underline' }}>Đến giỏ hàng ngay →</Link></Notice>
        </div>
      )}
      {capsuleSavedNotice && (
        <div style={{ marginTop: 20 }}>
          <Notice>{capsuleSavedNotice} <Link href="/tai-khoan" style={{ fontWeight: 600, textDecoration: 'underline' }}>Xem trong Fashion Vault →</Link></Notice>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 20 }}>
          <Notice error>{error}</Notice>
        </div>
      )}

      {activeStudioTab === 'CAPSULE' ? (
        /* ==================== CAPSULE STUDIO VIEW ==================== */
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Capsule Header & Core 5 Pieces */}
          <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 4, padding: 24 }}>
            <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', background: 'var(--gold-dark)', color: '#fff', padding: '2px 8px', borderRadius: 2 }}>
                  CAPSULE WARDROBE 5x5 // SLOW FASHION EXCELLENCE
                </span>
                <h2 style={{ margin: '6px 0 4px', fontSize: 22, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                  Tủ Đồ Nhộng Con Nhộng 5 Món Cốt Lõi
                </h2>
                <p className="subtle" style={{ margin: 0, fontSize: 12.5, maxWidth: 640 }}>
                  Tuyển chọn 5 thiết kế may đo cao cấp từ chất liệu sợi tự nhiên mộc mạc, tạo nên <strong>12+ bản phối linh hoạt</strong> cho mọi dịp từ văn phòng đến tiệc tối.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Tổng gói 5 món (Tiết kiệm 15%):</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--muted)' }}>{vnd(capsuleSubtotal)}</span>
                  <strong style={{ fontSize: 20, color: 'var(--gold-dark)', fontWeight: 700 }}>{vnd(capsuleFinalTotal)}</strong>
                </div>
              </div>
            </div>

            {/* 5 Core Pieces Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {capsulePieces.map((piece, idx) => (
                <div key={piece.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: 10, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', width: '100%', height: 160, overflow: 'hidden', borderRadius: 2, background: 'var(--sage)' }}>
                    <img
                      src={piece.image}
                      alt={piece.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9.5, fontWeight: 700, background: 'rgba(20,20,19,0.75)', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                      MÓN #{idx + 1}
                    </span>
                  </div>
                  <strong style={{ fontSize: 12, marginTop: 8, color: 'var(--ink)' }}>{piece.name}</strong>
                  <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{piece.shop} · {piece.material}</span>
                  <div className="row between" style={{ marginTop: 'auto', paddingTop: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{vnd(piece.price)}</span>
                    <Link href={`/san-pham/${piece.id}`} style={{ fontSize: 10.5, color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 600 }}>
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons for Capsule */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button"
                  style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)', fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={addCapsuleToCart}
                  disabled={busy}
                >
                  <ShoppingBag size={14} /> Thêm Trọn Bộ 5 Món Vào Giỏ (-15%)
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 12, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff' }}
                  onClick={() => setShowCapsuleSwatchModal(true)}
                >
                  <Layers size={14} color="var(--gold-dark)" /> Nhận 3 Mẫu Vải Cầm Tay Cho Tủ Đồ Này (50k)
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 12, padding: '8px 14px', background: '#fff' }}
                  onClick={saveCapsuleToVault}
                  disabled={busy}
                >
                  Lưu Vào Fashion Vault
                </button>
              </div>

              <span style={{ fontSize: 11, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={13} /> Bảo hành phom dáng 12 tháng · Đổi size từng món miễn phí
              </span>
            </div>
          </div>

          {/* Cost-Per-Wear Calculator */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calculator size={18} color="var(--gold-dark)" />
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--ink)' }}>
                  Tính Toán Chi Phí Trên Mỗi Lần Mặc (Cost-Per-Wear &amp; ROI Bền Vững)
                </h3>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Công thức thời trang chậm chuẩn Quiet Luxury
              </span>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              Khác với thời trang nhanh chỉ mặc 2-3 lần rồi bỏ, trang phục may đo thủ công từ xơ sợi lanh tự nhiên có độ bền vượt trội trên 5 năm. Càng mặc và giặt, sợi vải càng mềm rủ tự nhiên.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, alignItems: 'center', background: '#fcfaf6', padding: 16, borderRadius: 3, border: '1px solid var(--line)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                  Tần suất diện tủ đồ dự kiến: <strong>{capsuleWearsPerYear} lần / năm</strong>
                </label>
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={capsuleWearsPerYear}
                  onChange={(e) => setCapsuleWearsPerYear(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold-dark)' }}
                />
                <div className="row between" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                  <span>50 lần (Ít mặc)</span>
                  <span>150 lần (Mặc thường xuyên)</span>
                  <span>300 lần (Tủ đồ chính)</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '10px 14px', background: '#fff', borderRadius: 3, border: '1px solid var(--line)' }}>
                <span style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CHI PHÍ TRÊN MỖI LẦN MẶC ƯỚC TÍNH
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: '#166534', margin: '4px 0' }}>
                  {costPerWear.toLocaleString('vi-VN')}₫
                </div>
                <span style={{ fontSize: 10, color: '#059669', fontWeight: 600 }}>
                  Tiết kiệm hơn 78% so với việc mua 12 bộ đồ thời trang nhanh
                </span>
              </div>
            </div>
          </div>

          {/* 6 Curated Occasion Outfits Matrix */}
          <div>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                  Ma Trận Phối 6 Phong Cách Cho Mọi Dịp Sự Kiện
                </h3>
                <p className="subtle" style={{ margin: '2px 0 0', fontSize: 12 }}>
                  6 công thức kết hợp tiêu biểu từ 5 món trong tủ đồ nhộng.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                {
                  id: 'outfit-1',
                  name: 'Họp Đối Tác & Sartorial Executive',
                  occasion: 'Công sở & Gặp khách hàng VIP',
                  pieces: ['Sơ mi linen thong thả (Kem)', 'Quần suông nếp nhẹ (Nâu)', 'Blazer Linen cấu trúc nhẹ (Kem)'],
                  vibe: 'Sắc sảo, chuyên nghiệp nhưng vẫn thoáng nhẹ tự nhiên',
                  bg: '#FAF8F5',
                },
                {
                  id: 'outfit-2',
                  name: 'Dạo Phố & Cafe Cuối Tuần',
                  occasion: 'Thư giãn cuối tuần',
                  pieces: ['Áo thun ngày thường (Trắng)', 'Quần suông nếp nhẹ (Nâu)'],
                  vibe: 'Tối giản, phóng khoáng, cử động êm ái cả ngày',
                  bg: '#FFFFFF',
                },
                {
                  id: 'outfit-3',
                  name: 'Tiệc Tối Lãng Mạn & Evening Salon',
                  occasion: 'Dạ tiệc nhẹ & Sự kiện nghệ thuật',
                  pieces: ['Đầm dạo cuối tuần (Nâu)', 'Blazer Linen cấu trúc nhẹ (Kem)'],
                  vibe: 'Thanh lịch Quiet Luxury với phom đầm rủ bay bổng',
                  bg: '#FAF8F5',
                },
                {
                  id: 'outfit-4',
                  name: 'Du Lịch Nghỉ Dưỡng Resort Escape',
                  occasion: 'Kỳ nghỉ biển & Nghỉ dưỡng',
                  pieces: ['Sơ mi linen thong thả (Kem)', 'Đầm dạo cuối tuần (Nâu)'],
                  vibe: 'Khoác nhẹ sơ mi ngoài đầm tạo phong thái bay bổng mộc mạc',
                  bg: '#FFFFFF',
                },
                {
                  id: 'outfit-5',
                  name: 'Triển Lãm Nghệ Thuật & Trà Chiều',
                  occasion: 'Gặp gỡ bạn bè & Không gian sáng tạo',
                  pieces: ['Áo thun ngày thường (Trắng)', 'Quần suông nếp nhẹ (Nâu)', 'Blazer Linen (Kem)'],
                  vibe: 'Trí thức, tối giản, thanh lịch vượt thời gian',
                  bg: '#FAF8F5',
                },
                {
                  id: 'outfit-6',
                  name: 'Thời Tiết Giao Mùa & Gió Lạnh',
                  occasion: 'Buổi tối chuyển mùa hoặc máy lạnh sâu',
                  pieces: ['Sơ mi linen (Kem)', 'Quần suông (Nâu)', 'Blazer Linen (Kem)'],
                  vibe: 'Layering đa tầng giữ ấm tinh tế, tôn vóc dáng',
                  bg: '#FFFFFF',
                },
              ].map((outfit) => (
                <div key={outfit.id} style={{ background: outfit.bg, border: '1px solid var(--line)', borderRadius: 4, padding: 16 }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {outfit.occasion}
                  </span>
                  <strong style={{ display: 'block', fontSize: 14, margin: '4px 0 8px', color: 'var(--ink)' }}>
                    {outfit.name}
                  </strong>
                  <div style={{ marginBottom: 10 }}>
                    {outfit.pieces.map((p, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold-dark)' }} />
                        {p}
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
                    "{outfit.vibe}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Capsules Section */}
          {user && (
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 28 }}>
              <div className="row between" style={{ marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                  Tủ Đồ Nhộng Đã Lưu Trong Fashion Vault ({savedCapsules.data?.length || 0})
                </h3>
              </div>

              {savedCapsules.loading ? (
                <Loading />
              ) : !savedCapsules.data?.length ? (
                <div style={{ padding: 20, textAlign: 'center', background: '#faf8f5', borderRadius: 4, border: '1px dashed var(--line)' }}>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                    Bạn chưa lưu tủ đồ nhộng nào. Hãy bấm <strong>"Lưu Vào Fashion Vault"</strong> ở trên để bảo lưu gói phối độc bản.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {savedCapsules.data.map((cap) => (
                    <div key={cap.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 3, padding: 14 }}>
                      <div className="row between">
                        <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{cap.title}</strong>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedCapsule(cap.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        {cap.outfitsCount || 12} bộ phối · CPW: {vnd(cap.estimatedCostPerWear || 18400)}/lần
                      </div>
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>{vnd(cap.totalInvestment)}</span>
                        <button
                          type="button"
                          className="button secondary"
                          style={{ fontSize: 10.5, padding: '4px 8px' }}
                          onClick={addCapsuleToCart}
                        >
                          Thêm Lại Vào Giỏ →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ==================== SINGLE MIX & MATCH CANVAS ==================== */
        <>

      {/* Bộ Lọc Phối Đồ Theo Thời Tiết & Ngữ Cảnh */}
      <div
        style={{
          marginTop: 24,
          padding: '16px 22px',
          background: '#FAF8F5',
          border: '1px solid var(--line)',
          borderRadius: 2,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Thermometer size={16} color="var(--gold-dark)" />
            <strong style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
              Gợi Ý Phối Đồ Theo Thời Tiết &amp; Dịp Xuất Hiện
            </strong>
            <span style={{ fontSize: 9.5, letterSpacing: '0.08em', background: 'var(--gold-dark)', color: '#FAF8F5', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
              ATELIER CLIMATE SYNC
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
            Khí hậu địa phương: <strong style={{ color: 'var(--ink)' }}>{weatherCity === 'SAIGON' ? 'Nhiệt đới nắng ấm (32°C)' : weatherCity === 'HANOI' ? 'Gió mùa Đông Bắc (19°C)' : 'Cao nguyên sương lạnh (14°C)'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Khí hậu:</span>
          {[
            { id: 'SAIGON' as const, label: 'Sài Gòn 32°C (Nắng ấm)', tip: 'Linen & Lụa thoáng khí' },
            { id: 'HANOI' as const, label: 'Hà Nội 19°C (Se lạnh)', tip: 'Layering với Blazer' },
            { id: 'DALAT' as const, label: 'Đà Lạt 14°C (Sương gió)', tip: 'Trench coat dạ mỏng' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyWeatherFormula(item.id, occasion)}
              style={{
                fontSize: 11,
                padding: '6px 14px',
                borderRadius: 2,
                border: weatherCity === item.id ? '1px solid #141413' : '1px solid var(--line)',
                background: weatherCity === item.id ? '#141413' : '#FFFFFF',
                color: weatherCity === item.id ? '#FAF8F5' : 'var(--ink)',
                fontWeight: weatherCity === item.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}

          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginLeft: 12 }}>Ngữ cảnh:</span>
          {[
            { id: 'OFFICE' as const, label: 'Công sở' },
            { id: 'STREET' as const, label: 'Dạo phố' },
            { id: 'GALA' as const, label: 'Dạ tiệc' },
          ].map((occ) => (
            <button
              key={occ.id}
              type="button"
              onClick={() => setOccasion(occ.id)}
              style={{
                fontSize: 11,
                padding: '5px 12px',
                borderRadius: 2,
                border: occasion === occ.id ? '1px solid #141413' : '1px solid var(--line)',
                background: occasion === occ.id ? '#141413' : '#fff',
                color: occasion === occ.id ? '#FAF8F5' : 'var(--muted)',
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
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '3px 10px',
                  borderRadius: 3,
                  fontWeight: 700,
                }}
              >
                ★ Tone-sur-Tone: {harmonyScore}/100
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
                  <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#f5f0e8', position: 'relative' }}>
                    <img
                      src={selectedOuter.image}
                      alt={selectedOuter.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    {outerOos && (
                      <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                        HẾT HÀNG
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 700 }}>LỚP NGOÀI</span>
                    <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedOuter.name}</h4>
                    <div className="row between" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedOuter.price)}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{outerColor} · {outerSize}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Layer */}
              <div style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#F8FAFC', border: '1px solid var(--line)', position: 'relative' }}>
                  <img
                    src={selectedTop.image}
                    alt={selectedTop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {topOos && (
                    <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                      HẾT HÀNG
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 700 }}>ÁO CHÍNH</span>
                  <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedTop.name}</h4>
                  <div className="row between" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedTop.price)}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{topColor} · {topSize}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Layer */}
              <div style={{ position: 'relative' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 4, background: '#F8FAFC', border: '1px solid var(--line)', position: 'relative' }}>
                  <img
                    src={selectedBottom.image}
                    alt={selectedBottom.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {bottomOos && (
                    <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                      HẾT HÀNG
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 700 }}>QUẦN / VÁY</span>
                  <h4 style={{ margin: '2px 0', fontSize: 12, lineHeight: 1.3 }}>{selectedBottom.name}</h4>
                  <div className="row between" style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{vnd(selectedBottom.price)}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{bottomColor} · {bottomSize}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Palette Note */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                background: '#FFFFFF',
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

            {/* Radar Tương Thích Phong Cách & Chỉ Số Hòa Sắc Đa Chiều */}
            <div
              style={{
                marginTop: 16,
                padding: '14px 16px',
                background: '#FAF8F5',
                border: '1px solid var(--line)',
                borderRadius: 2,
              }}
            >
              <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={15} color="var(--gold-dark)" />
                  <strong style={{ fontSize: 12, color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    Radar Tương Thích &amp; Đồng Điệu Sắc Thái
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRadarAnalysis(!showRadarAnalysis)}
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    background: showRadarAnalysis ? 'var(--gold-dark)' : '#fff',
                    color: showRadarAnalysis ? '#fff' : 'var(--gold-dark)',
                    border: '1px solid var(--gold-dark)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {showRadarAnalysis ? 'Thu gọn phân tích' : `Chi tiết 5 Trục Synergy (${harmonyScore}.0/100) →`}
                </button>
              </div>

              <div className="row between" style={{ fontSize: 11.5, marginBottom: 6 }}>
                <span style={{ color: 'var(--muted)' }}>Chỉ số hòa hợp tổng thể (Overall Synergy):</span>
                <strong style={{ color: 'var(--gold-dark)', fontSize: 15, fontFamily: 'var(--font-serif)', fontWeight: 700 }}>{harmonyScore}.0 / 100</strong>
              </div>

              {showRadarAnalysis && (
                <div style={{ marginTop: 10, display: 'grid', gap: 6, fontSize: 11 }}>
                  {[
                    { label: '1. Hòa sắc bảng màu (Color Harmony)', score: harmonyScore, desc: `Tông ${topColor} & ${bottomColor} phối hợp tự nhiên.` },
                    { label: '2. Cân bằng phom dáng (Silhouette Balance)', score: 94, desc: 'Tỷ lệ 1/3 thân trên ôm nhẹ, 2/3 thân dưới suông rủ thanh thoát chuẩn Golden Ratio.' },
                    { label: '3. Đồng điệu chất liệu (Fabric Synergy)', score: 95, desc: `${selectedTop.material} hòa quyện cùng ${selectedBottom.material}.` },
                    { label: '4. Tương thích ngữ cảnh (Occasion Fit)', score: 98, desc: 'Linh hoạt biến chuyển từ công sở đến cà phê cuối tuần.' },
                    { label: '5. Thích ứng thời tiết (Climate Fit)', score: 92, desc: `Tối ưu cho khí hậu ${weatherCity === 'SAIGON' ? 'Sài Gòn 32°C' : weatherCity === 'HANOI' ? 'Hà Nội 19°C' : 'Đà Lạt 14°C'}.` },
                  ].map((axis, i) => (
                    <div key={i} style={{ background: '#fff', padding: '8px 10px', borderRadius: 2, border: '1px solid var(--line)' }}>
                      <div className="row between" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{axis.label}</span>
                        <strong style={{ color: 'var(--gold-dark)' }}>{axis.score}%</strong>
                      </div>
                      <div style={{ width: '100%', height: 3, background: '#f1ede7', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: `${axis.score}%`, height: '100%', background: 'var(--gold-dark)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 9.5, color: 'var(--muted)' }}>{axis.desc}</span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                    {['#QuietLuxury', '#EffortlessElegance', '#SlowFashionSynergy', '#GoldenRatioFit'].map((tag) => (
                      <span key={tag} style={{ fontSize: 9.5, background: '#F3EFEA', color: 'var(--gold-dark)', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total and Checkout Card */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--line)',
              }}
            >
              <div className="row between" style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4 }}>
                <span>Tổng giá trị lẻ ({selectedOuter ? '3' : '2'} sản phẩm):</span>
                <span style={{ textDecoration: 'line-through' }}>{vnd(subtotal)}</span>
              </div>
              <div className="row between" style={{ fontSize: 13, color: '#2D5A3F', fontWeight: 600, marginBottom: 8 }}>
                <span>Ưu đãi Combo Style Saver (-10%):</span>
                <span>−{vnd(bundleDiscount)}</span>
              </div>
              <div className="row between" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
                <span>Tổng thanh toán Combo:</span>
                <span style={{ color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700 }}>{vnd(finalTotal)}</span>
              </div>

              {anyOos && (
                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                  ⚠️ Một số món đã chọn đang tạm hết hàng ở kích cỡ / màu sắc này. Vui lòng chọn màu hoặc size khác để đặt mua.
                </p>
              )}

              <button
                className="button full"
                onClick={addBundleToCart}
                disabled={busy || anyOos}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: anyOos ? 0.6 : 1 }}
              >
                {busy ? <RefreshCw size={18} className="spin" /> : <ShoppingBag size={18} />}
                <span>{busy ? 'Đang thêm cả set…' : `Mua Trọn Set (Tiết kiệm ${vnd(bundleDiscount)})`}</span>
              </button>

              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="button subtle full"
                  onClick={() => setShowLookbookModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 11,
                    padding: '11px 16px',
                    color: 'var(--gold-dark)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <Camera size={15} color="var(--gold-dark)" />
                  <span>Xuất Thẻ Monograph Lookbook &amp; Chia Sẻ OOTD</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wardrobe Selector Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section 1: Áo Khoác Ngoài (Outerwear) */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="var(--gold-dark)" /> Lớp Ngoài (Outerwear)
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
              <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
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
              <Sparkles size={16} color="var(--gold-dark)" /> Áo Chính (Tops)
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
            <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
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
                {selectedTop.sizes.map(s => {
                  const oos = isOutOfStock(selectedTop.id, topColorIndex, s);
                  return (
                    <button
                      key={s}
                      className={`choice ${topSize === s ? 'chosen' : ''}`}
                      onClick={() => setTopSize(s)}
                      style={{ opacity: oos ? 0.5 : 1 }}
                      title={oos ? 'Hết hàng' : 'Còn hàng'}
                    >
                      {s} {oos && '(Hết)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Quần / Chân Váy (Bottoms) */}
          <div className="panel">
            <h3 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--gold-dark)" /> Quần / Chân Váy (Bottoms)
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
            <div className="row" style={{ gap: 12, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
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
              Quyền Lợi Độc Quyền Khi Mua Combo:
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

      {/* Bộ Sưu Tập Lookbook Đã Lưu Của Bạn */}
      {user && (
        <div style={{ marginTop: 40, borderTop: '1px solid var(--line)', paddingTop: 28 }}>
          <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                Bộ Sưu Tập Lookbook Đã Lưu ({savedLookbooks.data?.length || 0})
              </h2>
              <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
                Các bản phối Haute Couture bạn đã lưu vào Kho Cá Nhân (Vault). Có thể thử lại hoặc thêm vào giỏ bất cứ lúc nào.
              </p>
            </div>
          </div>

          {savedLookbooks.loading ? (
            <Loading />
          ) : !savedLookbooks.data?.length ? (
            <div style={{ padding: 24, textAlign: 'center', background: '#faf8f5', borderRadius: 4, border: '1px dashed var(--line)' }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Bạn chưa lưu bản phối nào. Hãy phối đồ phía trên và bấm <strong>"Xuất Thẻ Monograph Lookbook"</strong> để lưu giữ.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {savedLookbooks.data.map((lb) => {
                const meta = lb.meta || lb;
                return (
                  <div
                    key={lb.id}
                    style={{
                      padding: 16,
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      <div className="row between" style={{ marginBottom: 8 }}>
                        <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{meta.title || lb.title}</strong>
                        <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                          ★ {meta.harmonyScore || lb.harmonyScore || 96}/100
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
                        {meta.pieces?.outer && <div>• Ngoài: {meta.pieces.outer.name}</div>}
                        {meta.pieces?.top && <div>• Áo: {meta.pieces.top.name}</div>}
                        {meta.pieces?.bottom && <div>• Dưới: {meta.pieces.bottom.name}</div>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
                        {vnd(meta.total || 0)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => applySavedLookbook(lb)}
                        style={{
                          flex: 1,
                          fontSize: 11,
                          padding: '6px 10px',
                          background: '#141413',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 3,
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Thử Lại Bản Phối
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedLookbook(lb.id)}
                        style={{
                          fontSize: 11,
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: 3,
                          cursor: 'pointer',
                        }}
                        title="Xóa khỏi bộ sưu tập"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* Modal Xuất Thẻ Lookbook Nghệ Thuật & Chia Sẻ OOTD */}
      {showLookbookModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 20, 19, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowLookbookModal(false)}
        >
          <div
            style={{
              background: '#FAF8F5',
              borderRadius: 2,
              maxWidth: 580,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 30px 60px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--line)',
              padding: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Camera size={20} color="var(--gold-dark)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>
                    THẺ LOOKBOOK NGHỆ THUẬT HAUTE COUTURE
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--gold-dark)', letterSpacing: '0.04em' }}>
                    Xuất Thẻ Phối Đồ &amp; Chia Sẻ Lên Cộng Đồng OOTD
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLookbookModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Theme Selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Chọn Không Gian Nghệ Thuật (Canvas Aesthetic):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { id: 'ATELIER_OAK' as const, label: 'Atelier Kem Gỗ Sồi', desc: 'Ấm áp, thanh lịch' },
                  { id: 'HERITAGE_STONE' as const, label: 'Heritage Phố Cổ', desc: 'Đá mộc Châu Âu' },
                  { id: 'MIDNIGHT_NOIR' as const, label: 'Sơn Mài Midnight', desc: 'Huyền bí ánh kim' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setLookbookTheme(th.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: 4,
                      border: lookbookTheme === th.id ? '1.5px solid var(--gold-dark)' : '1px solid #e2e8f0',
                      background: lookbookTheme === th.id ? '#EEF2FF' : '#f8fafc',
                      color: lookbookTheme === th.id ? 'var(--gold-dark)' : '#334155',
                      fontWeight: lookbookTheme === th.id ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <strong style={{ fontSize: 11, display: 'block' }}>{th.label}</strong>
                    <span style={{ fontSize: 9, color: '#64748b' }}>{th.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Curator Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Chữ Ký Giám Tuyển (Curated By):
              </label>
              <input
                type="text"
                value={curatorName}
                onChange={(e) => setCuratorName(e.target.value)}
                placeholder="VD: Elena Vũ · Senior Stylist hoặc Kiệt Trương"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: 12,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Live Lookbook Card Preview */}
            <div
              style={{
                borderRadius: 8,
                padding: 18,
                background:
                  lookbookTheme === 'ATELIER_OAK'
                    ? '#fcf9f4'
                    : lookbookTheme === 'HERITAGE_STONE'
                    ? '#f8fafc'
                    : '#0f172a',
                border:
                  lookbookTheme === 'ATELIER_OAK'
                    ? '1.5px solid #d4af37'
                    : lookbookTheme === 'HERITAGE_STONE'
                    ? '1.5px solid #94a3b8'
                    : '1.5px solid #f59e0b',
                color: lookbookTheme === 'MIDNIGHT_NOIR' ? '#f8fafc' : '#1e293b',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                marginBottom: 16,
              }}
            >
              <div className="row between" style={{ borderBottom: '1px solid rgba(120, 113, 108, 0.2)', paddingBottom: 10, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: lookbookTheme === 'MIDNIGHT_NOIR' ? 'var(--gold-light)' : 'var(--gold-dark)', fontWeight: 700 }}>
                    NEXORA ATELIER EDITORIAL
                  </span>
                  <h4 style={{ margin: '4px 0 0', fontSize: 16, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                    Lookbook #{Date.now().toString().slice(-4)} · {weatherCity} Capsule
                  </h4>
                </div>
                <span style={{ fontSize: 9.5, letterSpacing: '0.04em', background: '#2D5A3F', color: '#FAF8F5', padding: '3px 8px', borderRadius: 2, fontWeight: 700 }}>
                  HARMONY {harmonyScore}/100
                </span>
              </div>

              {/* 3-Piece Visual Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: selectedOuter ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {selectedOuter && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#F8FAFC', border: '1px solid var(--line)', marginBottom: 4 }}>
                      <img src={selectedOuter.image} alt={selectedOuter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Lớp Ngoài</span>
                    <strong style={{ fontSize: 11, display: 'block', lineHeight: 1.2 }}>{selectedOuter.name}</strong>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#F8FAFC', border: '1px solid var(--line)', marginBottom: 4 }}>
                    <img src={selectedTop.image} alt={selectedTop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Áo Chính</span>
                  <strong style={{ fontSize: 11, display: 'block', lineHeight: 1.2 }}>{selectedTop.name}</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ aspectRatio: '3/4', borderRadius: 4, overflow: 'hidden', background: '#F8FAFC', border: '1px solid var(--line)', marginBottom: 4 }}>
                    <img src={selectedBottom.image} alt={selectedBottom.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Quần / Váy</span>
                  <strong style={{ fontSize: 11, display: 'block', lineHeight: 1.2 }}>{selectedBottom.name}</strong>
                </div>
              </div>

              {/* Color Swatches and Metadata */}
              <div className="row between" style={{ fontSize: 11, background: 'rgba(120, 113, 108, 0.1)', padding: '8px 10px', borderRadius: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Bảng màu:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedTop.colors[topColorIndex]?.hex || '#dfd4bd', display: 'inline-block' }} /> {topColor}
                  </span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedBottom.colors[bottomColorIndex]?.hex || '#82644e', display: 'inline-block' }} /> {bottomColor}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: lookbookTheme === 'MIDNIGHT_NOIR' ? '#cbd5e1' : '#475569' }}>
                  Curated by {curatorName}
                </div>
              </div>
            </div>

            {lookbookSaved && (
              <div style={{ marginBottom: 12 }}>
                <Notice>✓ Đã lưu Lookbook vào bộ sưu tập cá nhân thành công!</Notice>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={saveLookbookToVault}
                disabled={busy}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#09090B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Share2 size={15} /> {busy ? 'Đang lưu...' : 'Lưu Vào Kho Cá Nhân & Chia Sẻ'}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setNotice('Đã sao chép liên kết chia sẻ Lookbook vào bộ nhớ tạm!');
                }}
                style={{
                  padding: '10px 14px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Copy size={15} /> Sao Chép Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hộp Thẻ Mẫu Vải Bảng Màu Capsule Modal */}
      {showCapsuleSwatchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 20, 19, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 4,
            width: '100%',
            maxWidth: 520,
            padding: 24,
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            border: '1px solid var(--line)',
          }}>
            <div className="row between" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.04em' }}>
                  ATELIER SWATCH KIT // CAPSULE PALETTE
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
                  Hộp 3 Mẫu Vải Cầm Tay Cho Tủ Đồ Nhộng
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 11.5, color: 'var(--muted)' }}>
                  Cọc an ninh 50.000₫ · Hoàn cọc 100% qua Voucher mua sắm ngay khi tiếp nhận.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCapsuleSwatchModal(false);
                  setCapsuleSwatchSuccess(null);
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {capsuleSwatchSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--ink)' }}>
                  Đã Đặt Hộp Mẫu Vải Thành Công!
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)' }}>
                  Workshop NÉP Studio sẽ đóng gói bao bì phong bì giấy sáp ong kèm thước dây may đo sartorial gửi bưu tá hỏa tốc cho bạn.
                </p>
                <div style={{ background: '#FAF8F5', border: '1px dashed var(--gold-dark)', padding: 12, borderRadius: 3, marginBottom: 18 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                    VOUCHER BẢO CHỨNG HOÀN CỌC 50.000₫
                  </span>
                  <strong style={{ fontSize: 16, color: 'var(--gold-dark)', fontFamily: 'monospace' }}>
                    {capsuleSwatchSuccess}
                  </strong>
                </div>
                <button
                  type="button"
                  className="button"
                  style={{ width: '100%', background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                  onClick={() => {
                    setShowCapsuleSwatchModal(false);
                    setCapsuleSwatchSuccess(null);
                  }}
                >
                  Đóng &amp; Tiếp Tục Trải Nghiệm
                </button>
              </div>
            ) : (
              <form onSubmit={handleOrderCapsuleSwatch} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 3, border: '1px solid #e2e8f0', fontSize: 11 }}>
                  <strong style={{ color: '#1e293b', display: 'block', marginBottom: 4 }}>3 Mẫu Vải Nguyên Bản Trong Hộp:</strong>
                  <span>• Linen Kem Mộc Tự Nhiên (185 GSM)</span><br />
                  <span>• Cotton Nâu Cát Compact (220 GSM)</span><br />
                  <span>• Wool Lụa Dạ Mỏng Dệt Chéo (320 GSM)</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Họ &amp; Tên Người Nhận</label>
                  <input
                    value={capsuleRecipient}
                    onChange={e => setCapsuleRecipient(e.target.value)}
                    required
                    placeholder="Minh Anh (Elena Vũ)"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Số Điện Thoại</label>
                    <input
                      value={capsulePhone}
                      onChange={e => setCapsulePhone(e.target.value)}
                      required
                      placeholder="0901234567"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Phí Cọc Bảo Lưu</label>
                    <input
                      value="50.000₫ (Hoàn 100%)"
                      disabled
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, background: '#f1f5f9' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Địa Chỉ Nhận Mẫu Vải</label>
                  <input
                    value={capsuleAddress}
                    onChange={e => setCapsuleAddress(e.target.value)}
                    required
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện"
                    style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                  />
                </div>

                <div className="row between" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowCapsuleSwatchModal(false)}
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="button"
                    style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                    disabled={capsuleSwatchBusy}
                  >
                    {capsuleSwatchBusy ? 'Đang gửi...' : 'Xác Nhận Đặt Hộp Mẫu Vải (50k)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
