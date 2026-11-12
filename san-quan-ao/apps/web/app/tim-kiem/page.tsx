'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useResource } from '../api';
import { Loading, Empty } from '../ui';
import type { Product } from '../api';

type ProductsResult = { items: Product[]; total: number; page: number };

function SearchResults({ q }: { q: string }) {
  const encoded = encodeURIComponent(q);
  const { data, loading, error } = useResource<ProductsResult>(q ? `/products?q=${encoded}` : null);
  if (!q) return <p style={{ color: 'var(--muted)', margin: '60px auto', textAlign: 'center' }}>Nhập từ khóa để tìm kiếm sản phẩm.</p>;
  if (loading) return <Loading />;
  if (error) return <p style={{ color: 'var(--muted)' }}>Không thể tải kết quả. Vui lòng thử lại.</p>;
  if (!data?.items.length) return (
    <Empty
      title={`Không tìm thấy "${q}"`}
      detail="Thử tìm bằng từ khóa khác hoặc duyệt qua tất cả sản phẩm."
      href="/"
      action="Về trang chủ"
    />
  );
  return (
    <>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
        {data.total} kết quả cho <strong>"{q}"</strong>
      </p>
      <div className="product-grid">
        {data.items.map(p => {
          const minPrice = Math.min(...p.variants.map(v => v.price));
          const colors = [...new Set(p.variants.map(v => v.colorHex))];
          const inStock = p.variants.some(v => v.inventory && v.inventory.onHand > v.inventory.reserved);
          return (
            <Link href={`/san-pham/${p.slug}`} key={p.id} className="product-card">
              <div className="product-image">
                {p.images[0] && <img src={p.images[0].url} alt={p.name} />}
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
  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    setInput(params?.get('q') ?? '');
    setQ(params?.get('q') ?? '');
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    setQ(trimmed);
    const url = trimmed ? `/tim-kiem?q=${encodeURIComponent(trimmed)}` : '/tim-kiem';
    router.push(url, { scroll: false });
  }

  return (
    <section className="section">
      <p className="eyebrow"><span />TÌM KIẾM SẢN PHẨM</p>
      <h1>Bạn đang tìm gì?</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 12, maxWidth: 600, marginBottom: 40 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', border: '1px solid var(--line)', background: '#fff', padding: '0 14px', gap: 10 }}>
          <Search size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Áo linen, quần suông, đầm…"
            style={{ border: 'none', background: 'none', flex: 1, padding: '13px 0', fontSize: 14 }}
            autoFocus
            maxLength={100}
          />
        </label>
        <button className="button" type="submit">Tìm</button>
      </form>
      <Suspense fallback={<Loading />}>
        <SearchResults q={q} />
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
