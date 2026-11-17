'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useResource } from '../api';
import { Loading, Empty } from '../ui';
import type { Product } from '../api';

type ProductsResult = { items: Product[]; total: number; page: number };
type Category = { id: string; name: string; slug: string };

function SearchResults({ q, category, priceRange }: { q: string; category?: string; priceRange?: string }) {
  let queryUrl = `/products?page=1`;
  if (q) queryUrl += `&q=${encodeURIComponent(q)}`;
  if (category) queryUrl += `&category=${encodeURIComponent(category)}`;
  if (priceRange === 'under-1m') queryUrl += `&maxPrice=1000000`;
  else if (priceRange === '1m-2m') queryUrl += `&minPrice=1000000&maxPrice=2000000`;
  else if (priceRange === 'over-2m') queryUrl += `&minPrice=2000000`;

  const { data, loading, error } = useResource<ProductsResult>(queryUrl);
  if (!q && !category && !priceRange) return <p style={{ color: 'var(--muted)', margin: '60px auto', textAlign: 'center' }}>Nhập từ khóa hoặc chọn bộ lọc để tìm kiếm sản phẩm.</p>;
  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--muted)' }}>Không thể tải kết quả. Vui lòng thử lại.</p>;
  if (!data?.items.length) return (
    <Empty
      title="Không tìm thấy sản phẩm phù hợp"
      detail="Thử thay đổi từ khóa, danh mục hoặc khoảng giá lọc."
      href="/tim-kiem"
      action="Xóa bộ lọc"
    />
  );
  return (
    <>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
        Tìm thấy <strong>{data.total}</strong> sản phẩm phù hợp
      </p>
      <div className="product-grid">
        {data.items.map(p => {
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
                      if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                    }}
                  />
                )}
                {!inStock && <span className="sold-out">Hết hàng</span>}
                <span className="card-arrow">→</span>
              </div>
              <div className="product-meta">
                <span>{p.shop.name}</span>
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

  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState(initialPrice);

  const categories = useResource<Category[]>('/categories');

  useEffect(() => {
    setInput(params?.get('q') ?? '');
    setQ(params?.get('q') ?? '');
    setCategory(params?.get('category') ?? '');
    setPriceRange(params?.get('price') ?? '');
  }, [params]);

  function applyFilters(newQ: string, newCat: string, newPrice: string) {
    const sp = new URLSearchParams();
    if (newQ.trim()) sp.set('q', newQ.trim());
    if (newCat) sp.set('category', newCat);
    if (newPrice) sp.set('price', newPrice);
    const qs = sp.toString();
    router.push(qs ? `/tim-kiem?${qs}` : '/tim-kiem', { scroll: false });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    setQ(trimmed);
    applyFilters(trimmed, category, priceRange);
  }

  return (
    <section className="section">
      <p className="eyebrow"><span />TÌM KIẾM SẢN PHẨM</p>
      <h1>Khám phá thiết kế thời trang</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 12, maxWidth: 640, marginBottom: 20 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid var(--line)', background: '#fff', padding: '0 14px', gap: 10 }}>
          <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tìm áo linen, đầm lụa, blazer, trench coat…"
            style={{ border: 'none', background: 'none', flex: 1, padding: '13px 0', fontSize: 14 }}
            autoFocus
            maxLength={100}
          />
        </label>
        <button className="button" type="submit">Tìm</button>
      </form>

      <div className="row wrap" style={{ gap: 12, marginBottom: 36, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bộ lọc:</span>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); applyFilters(q, e.target.value, priceRange); }}
          style={{ padding: '8px 12px', border: '1px solid var(--line)', background: '#fff', fontSize: 13 }}
          aria-label="Lọc theo danh mục"
        >
          <option value="">Tất cả danh mục</option>
          {categories.data?.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>

        <select
          value={priceRange}
          onChange={e => { setPriceRange(e.target.value); applyFilters(q, category, e.target.value); }}
          style={{ padding: '8px 12px', border: '1px solid var(--line)', background: '#fff', fontSize: 13 }}
          aria-label="Lọc theo mức giá"
        >
          <option value="">Tất cả mức giá</option>
          <option value="under-1m">Dưới 1.000.000đ</option>
          <option value="1m-2m">1.000.000đ – 2.000.000đ</option>
          <option value="over-2m">Trên 2.000.000đ</option>
        </select>

        {(q || category || priceRange) && (
          <button
            type="button"
            className="button secondary"
            style={{ padding: '8px 12px', fontSize: 12 }}
            onClick={() => { setInput(''); setQ(''); setCategory(''); setPriceRange(''); router.push('/tim-kiem', { scroll: false }); }}
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      <Suspense fallback={<Loading />}>
        <SearchResults q={q} category={category} priceRange={priceRange} />
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
