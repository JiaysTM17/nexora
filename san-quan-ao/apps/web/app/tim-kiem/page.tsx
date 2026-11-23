'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Palette, Sparkles, Layers } from 'lucide-react';
import { useResource } from '../api';
import { Loading, Empty } from '../ui';
import type { Product } from '../api';

type ProductsResult = { items: Product[]; total: number; page: number };
type Category = { id: string; name: string; slug: string };

const PALETTE_FAMILIES = [
  { id: 'ALL', name: 'Tất cả sắc thái', hex: '#ffffff', border: '#cbd5e1' },
  { id: 'SAND', name: 'Cát Mộc Normandy', hex: '#dfd4bd', border: '#b89f82' },
  { id: 'INDIGO', name: 'Lam Chàm Sâu', hex: '#1e3a5f', border: '#1e3a5f' },
  { id: 'EARTH', name: 'Đất Nung Gốm', hex: '#a7654b', border: '#a7654b' },
  { id: 'CHARCOAL', name: 'Đen Sơn Mài', hex: '#27272a', border: '#27272a' },
  { id: 'IVORY', name: 'Trắng Ngà Tơ Tằm', hex: '#fbf9f4', border: '#e2e8f0' },
];

const PALETTE_KEYWORDS: Record<string, string[]> = {
  SAND: ['kem', 'be', 'cát', 'sand', 'linen'],
  INDIGO: ['xanh', 'chàm', 'indigo', 'blue', 'navy'],
  EARTH: ['nâu', 'đất', 'terracotta', 'brown', 'gốm'],
  CHARCOAL: ['đen', 'noir', 'charcoal', 'black', 'sơn mài'],
  IVORY: ['trắng', 'ngà', 'ivory', 'white', 'lụa'],
};

const GSM_TIERS = [
  { id: 'ALL', name: 'Mọi định lượng (Tất cả)', range: '0 - 600 GSM', desc: 'Toàn bộ trang phục trong catalog' },
  { id: 'LIGHT', name: 'Mỏng nhẹ nhiệt đới (< 150 GSM)', range: '80 - 150 GSM', desc: 'Lụa Habotai, Voan tơ tằm, Linen mỏng 115 GSM - mặc mát mùa hè' },
  { id: 'MEDIUM', name: 'Trung bình bốn mùa (150 - 260 GSM)', range: '150 - 260 GSM', desc: 'Linen Normandy 185 GSM, Oxford Cotton 210 GSM - phom đứng rủ nhẹ' },
  { id: 'HEAVY', name: 'Dày dặn cấu trúc (> 260 GSM)', range: '260 - 520 GSM', desc: 'Dạ Len Ý 420 GSM, Da thuộc thảo mộc, Canvas dệt đôi - giữ ấm & ve áo sắc nét' },
];

const GSM_KEYWORDS: Record<string, string[]> = {
  LIGHT: ['lụa', 'silk', 'habotai', 'voan', 'mỏng', 'nhẹ', 'sơ mi lụa'],
  MEDIUM: ['linen', 'lanh', 'cotton', 'polo', 'oxford', 'twill', 'sơ mi'],
  HEAVY: ['blazer', 'dạ', 'len', 'khoác', 'áo khoác', 'măng tô', 'da bò', 'wool', 'jacket', 'túi'],
};

function SearchResults({ q, category, priceRange, isMall, palette, gsmTier }: { q: string; category?: string; priceRange?: string; isMall?: boolean; palette?: string; gsmTier?: string }) {
  let queryUrl = `/products?page=1`;
  if (q) queryUrl += `&q=${encodeURIComponent(q)}`;
  if (category) queryUrl += `&category=${encodeURIComponent(category)}`;
  if (isMall) queryUrl += `&isMall=true`;
  if (priceRange === 'under-1m') queryUrl += `&maxPrice=1000000`;
  else if (priceRange === '1m-2m') queryUrl += `&minPrice=1000000&maxPrice=2000000`;
  else if (priceRange === 'over-2m') queryUrl += `&minPrice=2000000`;

  const { data, loading, error } = useResource<ProductsResult>(queryUrl);
  if (!q && !category && !priceRange && !isMall && (!palette || palette === 'ALL') && (!gsmTier || gsmTier === 'ALL')) {
    return <p style={{ color: 'var(--muted)', margin: '60px auto', textAlign: 'center' }}>Nhập từ khóa hoặc chọn bộ lọc để tìm kiếm sản phẩm.</p>;
  }
  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--muted)' }}>Không thể tải kết quả. Vui lòng thử lại.</p>;

  const rawItems = data?.items ?? [];
  let items = rawItems;
  if (palette && palette !== 'ALL' && PALETTE_KEYWORDS[palette]) {
    const kws = PALETTE_KEYWORDS[palette];
    items = items.filter(p => p.variants.some(v => kws.some(kw => v.color.toLowerCase().includes(kw))) || kws.some(kw => p.name.toLowerCase().includes(kw)));
  }
  if (gsmTier && gsmTier !== 'ALL' && GSM_KEYWORDS[gsmTier]) {
    const gKws = GSM_KEYWORDS[gsmTier];
    items = items.filter(p => gKws.some(kw => p.name.toLowerCase().includes(kw) || p.material.toLowerCase().includes(kw)));
  }

  if (!items.length) {
    return (
      <Empty
        title="Không tìm thấy sản phẩm phù hợp"
        detail="Thử thay đổi từ khóa, danh mục, khoảng giá hoặc chọn sắc thái bảng màu khác."
        href="/tim-kiem"
        action="Xóa bộ lọc"
      />
    );
  }
  return (
    <>
      <div className="row between" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
          Tìm thấy <strong>{items.length}</strong> sản phẩm phù hợp {palette && palette !== 'ALL' ? `(Sắc thái: ${PALETTE_FAMILIES.find(p => p.id === palette)?.name})` : ''}
        </p>
        {palette && palette !== 'ALL' && (
          <span style={{ fontSize: 10, background: '#EEF2FF', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            HÒA SẮC TONE-SUR-TONE 98/100
          </span>
        )}
      </div>
      <div className="product-grid">
        {items.map(p => {
          const minPrice = Math.min(...p.variants.map(v => v.price));
          const colors = [...new Set(p.variants.map(v => v.colorHex))];
          const inStock = p.variants.some(v => v.inventory && v.inventory.onHand > v.inventory.reserved);
          return (
            <Link href={`/san-pham/${p.slug}`} key={p.id} className="product-card">
              <div className="product-image">
                {p.images[0] && (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                )}
                {!inStock && <span className="sold-out">Hết hàng</span>}
                <span className="card-arrow">→</span>
              </div>
              <div className="product-meta">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {p.shop.name}
                  {p.shop.isMall && (
                    <span
                      style={{
                        background: 'var(--gold-dark)',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 2,
                        letterSpacing: '0.4px',
                      }}
                    >
                      MALL
                    </span>
                  )}
                </span>
                <div className="swatches">
                  {colors.slice(0, 4).map(c => <i key={c} style={{ background: c }} />)}
                </div>
              </div>
              <h3>{p.name}</h3>
              <p className="price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params?.get('q') ?? '';
  const initialCat = params?.get('category') ?? '';
  const initialPrice = params?.get('price') ?? '';
  const initialMall = params?.get('mall') === 'true';

  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState(initialPrice);
  const [mallOnly, setMallOnly] = useState(initialMall);
  const [palette, setPalette] = useState('ALL');
  const [gsmTier, setGsmTier] = useState('ALL');

  const categories = useResource<Category[]>('/categories');

  useEffect(() => {
    setInput(params?.get('q') ?? '');
    setQ(params?.get('q') ?? '');
    setCategory(params?.get('category') ?? '');
    setPriceRange(params?.get('price') ?? '');
    setMallOnly(params?.get('mall') === 'true');
  }, [params]);

  function applyFilters(newQ: string, newCat: string, newPrice: string, newMall: boolean) {
    const sp = new URLSearchParams();
    if (newQ.trim()) sp.set('q', newQ.trim());
    if (newCat) sp.set('category', newCat);
    if (newPrice) sp.set('price', newPrice);
    if (newMall) sp.set('mall', 'true');
    const qs = sp.toString();
    router.push(qs ? `/tim-kiem?${qs}` : '/tim-kiem', { scroll: false });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    setQ(trimmed);
    applyFilters(trimmed, category, priceRange, mallOnly);
  }

  return (
    <section className="section">
      <p className="eyebrow"><span />TÌM KIẾM SẢN PHẨM</p>
      <h1>Khám phá thiết kế thời trang</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 12, maxWidth: 640, marginBottom: 20 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid var(--line)', background: '#fff', padding: '0 14px', gap: 10 }}>
          <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14 }}
            placeholder="Tìm theo tên sản phẩm, chất liệu..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </label>
        <button type="submit" className="button" style={{ padding: '0 24px' }}>
          Tìm kiếm
        </button>
      </form>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 32 }}>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); applyFilters(q, e.target.value, priceRange, mallOnly); }}
          style={{ padding: '8px 12px', border: '1px solid var(--line)', background: '#fff', fontSize: 13 }}
          aria-label="Lọc theo danh mục"
        >
          <option value="">Tất cả danh mục</option>
          {categories.data?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        <select
          value={priceRange}
          onChange={e => { setPriceRange(e.target.value); applyFilters(q, category, e.target.value, mallOnly); }}
          style={{ padding: '8px 12px', border: '1px solid var(--line)', background: '#fff', fontSize: 13 }}
          aria-label="Lọc theo mức giá"
        >
          <option value="">Tất cả mức giá</option>
          <option value="under-1m">Dưới 1.000.000đ</option>
          <option value="1m-2m">1.000.000đ – 2.000.000đ</option>
          <option value="over-2m">Trên 2.000.000đ</option>
        </select>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '7px 12px', border: '1px solid var(--line)', background: mallOnly ? '#f5eee6' : '#fff', fontSize: 13, userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={mallOnly}
            onChange={e => {
              setMallOnly(e.target.checked);
              applyFilters(q, category, priceRange, e.target.checked);
            }}
          />
          <strong style={{ color: 'var(--gold-dark)' }}>NEXORA Mall</strong> (Chính hãng 100%)
        </label>

        {(q || category || priceRange || mallOnly || palette !== 'ALL' || gsmTier !== 'ALL') && (
          <button
            type="button"
            className="button secondary"
            style={{ padding: '8px 12px', fontSize: 12 }}
            onClick={() => { setInput(''); setQ(''); setCategory(''); setPriceRange(''); setMallOnly(false); setPalette('ALL'); setGsmTier('ALL'); router.push('/tim-kiem', { scroll: false }); }}
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Bộ Lọc Sắc Thái Bảng Màu & Hòa Sắc Tone-Sur-Tone */}
      <div
        style={{
          margin: '0 0 16px',
          padding: '12px 16px',
          background: '#fdfbf7',
          border: '1px solid var(--line)',
          borderRadius: 6,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={15} color="var(--gold-dark)" />
            <strong style={{ fontSize: 12, color: '#9a3412' }}>
              Lọc Theo Sắc Thái Bảng Màu Tự Nhiên
            </strong>
          </div>
          <span style={{ fontSize: 11, color: '#78350f' }}>
            Hòa sắc: <strong>{PALETTE_FAMILIES.find((p) => p.id === palette)?.name}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {PALETTE_FAMILIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPalette(p.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                cursor: 'pointer',
                border: palette === p.id ? '1.5px solid var(--gold-dark)' : '1px solid var(--line)',
                background: palette === p.id ? 'var(--line)' : '#fff',
                color: palette === p.id ? '#7c2d12' : '#9a3412',
                fontWeight: palette === p.id ? 700 : 500,
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: p.hex,
                  border: `1px solid ${p.border}`,
                  display: 'inline-block',
                }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bộ Lọc Định Lượng Sợi Dệt GSM & Độ Dày Trang Phục */}
      <div
        style={{
          margin: '0 0 28px',
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} color="#0284c7" />
            <strong style={{ fontSize: 12, color: '#0369a1' }}>
              Lọc Theo Định Lượng Sợi Dệt GSM
            </strong>
          </div>
          <span style={{ fontSize: 11, color: '#0284c7' }}>
            Độ dày: <strong>{GSM_TIERS.find((g) => g.id === gsmTier)?.range}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {GSM_TIERS.map((g) => {
            const isSelected = gsmTier === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGsmTier(g.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                  background: isSelected ? '#e0f2fe' : '#fff',
                  color: isSelected ? '#0369a1' : '#334155',
                  fontWeight: isSelected ? 700 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontWeight: 600 }}>{g.name}</div>
                <small style={{ color: '#64748b', display: 'block', fontSize: 10, marginTop: 2 }}>{g.desc}</small>
              </button>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <SearchResults q={q} category={category} priceRange={priceRange} isMall={mallOnly} palette={palette} gsmTier={gsmTier} />
      </Suspense>
    </section>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPage />
    </Suspense>
  );
}
