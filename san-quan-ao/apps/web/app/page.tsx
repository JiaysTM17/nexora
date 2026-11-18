'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Search, SlidersHorizontal, Zap } from 'lucide-react';
import { Product, useResource } from './api';
import { Loading, Notice, ProductCard } from './ui';

export default function Home() {
  const [category, setCategory] = useState(''), [query, setQuery] = useState(''), [search, setSearch] = useState(''), [color, setColor] = useState(''), [size, setSize] = useState(''), [stock, setStock] = useState(false), [mall, setMall] = useState(false), [filters, setFilters] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const params = new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { q: search } : {}), ...(color ? { color } : {}), ...(size ? { size } : {}), ...(stock ? { inStock: 'true' } : {}), ...(mall ? { isMall: 'true' } : {}) });
  const { data, error, loading } = useResource<{ items: Product[]; total: number }>(`/products?${params}`);
  return <>
    <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> TỦ ĐỒ CỦA BẠN, CÂU CHUYỆN CỦA BẠN</div><h1>Mỗi ngày,<br/>một cách <em>là mình.</em></h1><p>Khám phá những món đồ dễ yêu từ các shop Việt.<br/>Tìm cảm hứng mới từ những người có gu giống bạn.</p><a className="button" href="#trang-phuc">Tìm món đồ của bạn<ArrowUpRight size={20}/></a><div className="hero-proof"><span><Check size={15}/> Chọn đúng màu, đúng size</span><span><Check size={15}/> Mua từ shop độc lập</span></div></div><div className="hero-art"><img src="/products/outfit.svg" alt="Minh họa phối sơ mi linen và quần suông màu nâu"/><div className="editor-note"><span>THE EVERYDAY EDIT / 01</span><strong>Đơn giản. Nhưng có gu.</strong><Link href="/cong-dong">Xem cách phối <ArrowUpRight size={16}/></Link></div><div className="vertical-note">LESS EFFORT. MORE YOU.</div></div></section>
    <div className="values-strip"><span>CHẤT LIỆU THOẢI MÁI</span><i>✳</i><span>PHONG CÁCH CỦA RIÊNG BẠN</span><i>✳</i><span>KẾT NỐI CÁC SHOP VIỆT</span><i>✳</i><span>CẢM HỨNG MỖI NGÀY</span></div>
    <section className="section" style={{ paddingBottom: 0 }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '22px 30px', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ background: 'var(--clay)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Zap size={12} fill="#fff"/> FLASH SALE ĐỘC QUYỀN (CART-FLASH-03)
          </span>
          <h2 style={{ color: '#fff', margin: '8px 0 4px', fontSize: 24, fontWeight: 600 }}>Giờ Vàng Săn Deal · Khóa Giữ Giá 15 Phút</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 12 }}>Phân lập tồn kho độc lập &amp; khóa giá chống race-condition. Tự động hoàn lại kho chung khi quá hạn.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Kết thúc sau</span>
          <div style={{ display: 'flex', gap: 5, fontFamily: 'monospace', fontSize: 17, fontWeight: 700, alignItems: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 8px', borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)' }}>{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 8px', borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)' }}>{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span style={{ background: 'var(--clay)', padding: '5px 8px', borderRadius: 2 }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
    <section className="section" id="trang-phuc"><div className="section-heading"><div><p className="eyebrow">CHỌN ÍT HƠN, YÊU NHIỀU HƠN</p><h2>Thêm một món <em>hợp mình.</em></h2></div><span className="subtle">{data ? `${data.total} thiết kế đang chờ bạn` : 'Tìm thiết kế dành cho bạn'}</span></div>
      <div className="catalog-toolbar"><div className="tabs" aria-label="Danh mục">{[['', 'Tất cả'], ['ao', 'Áo'], ['quan', 'Quần'], ['vay', 'Váy & đầm'], ['ao-khoac', 'Áo khoác & Blazer']].map(([id, name]) => <button key={id} className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}>{name}</button>)}</div><div className="toolbar-right"><form className="search" onSubmit={e => { e.preventDefault(); setSearch(query); }}><Search size={17}/><input aria-label="Tìm tên sản phẩm" placeholder="Tìm món bạn thích…" value={query} onChange={e => setQuery(e.target.value)}/><button type="submit" aria-label="Tìm kiếm"><ArrowRight size={17}/></button></form><button className="filter-button" onClick={() => setFilters(!filters)} aria-expanded={filters}><SlidersHorizontal size={17}/>Bộ lọc</button></div></div>
      {filters && <div className="filters"><label>Màu sắc<select value={color} onChange={e => setColor(e.target.value)}><option value="">Mọi màu</option>{['Đen', 'Trắng', 'Kem', 'Nâu', 'Xanh'].map(c => <option key={c}>{c}</option>)}</select></label><label>Kích cỡ<select value={size} onChange={e => setSize(e.target.value)}><option value="">Mọi size</option>{['S', 'M', 'L'].map(s => <option key={s}>{s}</option>)}</select></label><label className="check"><input type="checkbox" checked={stock} onChange={e => setStock(e.target.checked)}/>Chỉ món còn hàng</label><label className="check"><input type="checkbox" checked={mall} onChange={e => setMall(e.target.checked)}/>Chỉ NEXORA Mall (Chính hãng)</label><button className="text-button" onClick={() => { setColor(''); setSize(''); setStock(false); setMall(false); setSearch(''); setQuery(''); }}>Xóa bộ lọc</button></div>}
      {loading ? <Loading/> : error ? <Notice error>{error}</Notice> : data?.items.length ? <div className="product-grid">{data.items.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <Notice>Chưa có món phù hợp bộ lọc. Bạn thử màu hoặc size khác nhé.</Notice>}
    </section>
    <section className="community-banner"><div><p className="eyebrow">CẢM HỨNG TỪ CỘNG ĐỒNG OOTD</p><h2>Đồ quen.<br/><em>Cách phối mới.</em></h2><p>Cùng một chiếc áo, hàng trăm câu chuyện phong cách.<br/>Ghé xem mọi người đang mặc gì hôm nay.</p><Link href="/cong-dong" className="button light">Khám phá cộng đồng OOTD<ArrowUpRight size={19}/></Link></div><img src="/products/community.svg" alt="Minh họa các cách kết hợp áo và quần"/><span className="community-stamp">NEXORA<br/>STYLE HUB<br/>↗</span></section>
  </>;
}
