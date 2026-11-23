'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Search, SlidersHorizontal, Zap, TrendingUp, Sparkles, Layers, ShoppingBag, Eye } from 'lucide-react';
import { Product, useResource, vnd } from './api';
import { Loading, Notice, ProductCard } from './ui';

export default function Home() {
  const [category, setCategory] = useState(''), [query, setQuery] = useState(''), [search, setSearch] = useState(''), [color, setColor] = useState(''), [size, setSize] = useState(''), [stock, setStock] = useState(false), [mall, setMall] = useState(false), [filters, setFilters] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });
  const [activeCapsule, setActiveCapsule] = useState(0);
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
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span/> NEXORA ATELIER // SS 2026 RUNWAY &amp; EDITORIAL ARCHIVE</div>
        <h1>KIẾN TẠO PHONG CÁCH.<br/><span>ĐỊNH HÌNH BẢN SẮC.</span></h1>
        <p>Nền tảng thương mại thời trang đương đại kết hợp AI Styling &amp; Mạng xã hội OOTD.<br/>Khám phá các thiết kế nguyên bản từ các xưởng may thủ công &amp; nhà mốt độc lập.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <a className="button" href="#trang-phuc">Khám Phá Bộ Sưu Tập <ArrowUpRight size={18}/></a>
          <Link className="button subtle" href="/phoi-do" style={{ background: '#FFFFFF', border: '1px solid var(--line)', color: 'var(--ink)' }}>
            <Sparkles size={16} /> Studio Phối Đồ AI
          </Link>
        </div>
        <div className="hero-proof">
          <span><Check size={14}/> Đồng kiểm ngoại quan tại chỗ</span>
          <span><Check size={14}/> 100% Chất liệu cao cấp tự nhiên</span>
          <span><Check size={14}/> Nhà mốt độc lập tuyển chọn</span>
        </div>
      </div>
      <div className="hero-art">
        <img src="/products/outfit.svg" alt="Minh họa phối sơ mi linen và quần suông màu nâu"/>
        <div className="editor-note">
          <span>EDITORIAL SELECTION // 01</span>
          <strong>Normandy Linen &amp; Sartorial Cut</strong>
          <Link href="/phoi-do">Mở Studio Mix &amp; Match <ArrowUpRight size={16}/></Link>
        </div>
        <div className="vertical-note">LESS EFFORT. MORE YOU.</div>
      </div>
    </section>
    <div className="values-strip">
      <span>100% NGUYÊN BẢN CHÍNH HÃNG</span>
      <i>✳</i>
      <span>ĐỒNG KIỂM TRƯỚC KHI NHẬN HÀNG</span>
      <i>✳</i>
      <span>PHÒNG THỬ ĐỒ MIX &amp; MATCH AI</span>
      <i>✳</i>
      <span>ATELIER SPA &amp; CHĂM SÓC ĐỒ HIỆU</span>
      <i>✳</i>
      <span>THU CŨ ĐỔI MỚI TRADE-IN MINH BẠCH</span>
    </div>
    <section className="section" style={{ paddingBottom: 0 }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '22px 30px', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ background: '#4F46E5', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2, letterSpacing: 1, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
            <span style={{ background: '#4F46E5', padding: '5px 8px', borderRadius: 2 }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
    <section className="section" style={{ paddingTop: 16, paddingBottom: 0 }}>
      <div style={{ background: '#0f172a', color: '#fff', padding: '24px 30px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, borderLeft: '4px solid #EF4444' }}>
        <div style={{ maxWidth: 640 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px #EF4444' }}/>
            NEXORA LIVE RUNWAY (SOC-LIVE-01) · 1.428 ĐANG XEM
          </span>
          <h2 style={{ color: '#fff', margin: '10px 0 6px', fontSize: 24, fontWeight: 600 }}>Sàn Diễn Trực Tiếp: BST Mùa Đông 2026</h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>Trải nghiệm chốt đơn 1-chạm không rời luồng phát, tương tác trực tiếp với Stylist và săn các deal ghim độc quyền giảm tới 35%.</p>
        </div>
        <Link href="/live" className="button" style={{ background: '#EF4444', borderColor: '#EF4444', color: '#fff', padding: '12px 24px', fontWeight: 600, gap: 10 }}>
          Vào xem trực tiếp <ArrowUpRight size={18}/>
        </Link>
      </div>
    </section>

    {/* Bảng Xếp Hạng Xu Hướng Thời Trang Tuần Realtime (CAT-TRENDING-BOARD-02) */}
    <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }}>
      <div style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 4 }}>
        <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <p className="eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-indigo)' }}>
              <TrendingUp size={14} /> NEXORA TREND RADAR · REALTIME SALES VELOCITY (CAT-TRENDING-BOARD-02)
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 750, color: 'var(--ink)' }}>
              Bảng Xếp Hạng Xu Hướng Tuần Này
            </h2>
          </div>
          <Link href="/phoi-do" className="button subtle" style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Phòng Thử Đồ Mix &amp; Match →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              rank: '#1',
              title: 'Quiet Luxury & Phom Rộng Phóng Khoáng',
              growth: '+142%',
              desc: 'Áo khoác blazer linen cấu trúc nhẹ phối quần tây ống suông cạp cao xếp ly nhẹ.',
              tag: 'Thịnh hành nhất',
            },
            {
              rank: '#2',
              title: 'Chất Liệu Tự Nhiên & Dệt Thô Mộc',
              growth: '+98%',
              desc: 'Sơ mi 100% Premium Linen & Cotton Compact Pima mềm mát bền màu.',
              tag: 'Tăng trưởng nhanh',
            },
            {
              rank: '#3',
              title: 'Tone Màu Đất & Phong Cách Sartorial',
              growth: '+85%',
              desc: 'Trench coat dạ wool dệt chéo màu nâu cát ấm cổ điển thượng lưu.',
              tag: 'Được yêu thích',
            },
          ].map(trend => (
            <div
              key={trend.rank}
              style={{
                padding: '16px 18px',
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 4,
              }}
            >
              <div className="row between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--brand-indigo)' }}>
                  {trend.rank}
                </span>
                <span style={{ fontSize: 11, background: '#eef2ed', color: '#166534', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                  {trend.growth}
                </span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: 14, lineHeight: 1.4, color: 'var(--ink)' }}>
                {trend.title}
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                {trend.desc}
              </p>
              <span style={{ display: 'inline-block', marginTop: 10, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--brand-indigo)', fontWeight: 600 }}>
                • {trend.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Bộ Sưu Tập Capsule Mùa Mới · Capsule Lookbook Studio (CAT-CAPSULE-LOOKBOOK-01) */}
    <section className="section" style={{ paddingTop: 20, paddingBottom: 0 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 4, padding: '24px 28px' }}>
        <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <p className="eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-indigo)' }}>
              <Layers size={14} /> THE SEASONAL CAPSULE EDIT · STYLE STUDIO (CAT-CAPSULE-LOOKBOOK-01)
            </p>
            <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 750, color: 'var(--ink)' }}>
              Bộ Sưu Tập Capsule &amp; Gợi Ý Phối Đồ Trọn Set
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12 }}>
              Tuyển tập 3 phong cách thiết yếu được các Senior Stylist căn chỉnh sắc độ chuẩn mực và áp dụng chiết khấu Combo Saver -10%.
            </p>
          </div>
          <Link href="/phoi-do" className="button" style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Mở Studio Phối Đồ Tự Do →
          </Link>
        </div>

        {/* Lookbook Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 10, marginBottom: 16, overflowX: 'auto' }}>
          {[
            { id: 0, name: 'The Normandy Summer Edit', tag: '100% Linen' },
            { id: 1, name: 'The Minimal Executive Edit', tag: 'Sartorial Cut' },
            { id: 2, name: 'Bảo Lộc Silk Atelier Edit', tag: 'Thủ Công Tơ Tằm' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCapsule(tab.id)}
              style={{
                background: activeCapsule === tab.id ? '#09090B' : '#F8FAFC',
                color: activeCapsule === tab.id ? '#FFFFFF' : 'var(--ink)',
                border: '1px solid var(--line)',
                padding: '7px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: activeCapsule === tab.id ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.name} <small style={{ opacity: 0.75, fontSize: 10 }}>({tab.tag})</small>
            </button>
          ))}
        </div>

        {/* Selected Capsule Lookbook Showcase */}
        {(() => {
          const edits = [
            {
              id: 'normandy',
              title: 'The Normandy Summer Edit',
              palette: 'Tone Cát Sa Mạc & Trắng Ngà',
              harmony: '99/100 Tone-sur-Tone',
              tag: 'Phóng khoáng · 100% Linen',
              top: { name: 'Áo sơ mi cổ trụ Premium Linen', price: 420000, img: '/products/shirt.svg', shop: 'NÉP Studio' },
              bottom: { name: 'Quần short linen mộc tự nhiên', price: 390000, img: '/products/pants.svg', shop: 'NÉP Studio' },
              outer: { name: 'Áo khoác safari kaki đũi', price: 650000, img: '/products/jacket.svg', shop: 'NÉP Studio' },
              originalTotal: 1460000,
              comboTotal: 1314000,
              desc: 'Tuyển tập sợi lanh dệt thưa thoáng khí từ vùng Normandy, kết hợp gam màu cát đất ấm và trắng ngà đem lại cảm giác dạo bước nhẹ nhõm bên bờ biển mùa hè.',
            },
            {
              id: 'executive',
              title: 'The Minimal Executive Edit',
              palette: 'Tone Xám Melange & Đen Tuyển',
              harmony: '98/100 Tone-sur-Tone',
              tag: 'Chỉn chu · Sartorial Cut',
              top: { name: 'Áo Polo dệt kim Merino sợi dài', price: 490000, img: '/products/shirt.svg', shop: 'Lụa & Co' },
              bottom: { name: 'Quần tây xếp ly kép phom suông', price: 580000, img: '/products/pants.svg', shop: 'Lụa & Co' },
              outer: { name: 'Áo khoác Blazer Linen hai hàng khuy', price: 890000, img: '/products/jacket.svg', shop: 'Lụa & Co' },
              originalTotal: 1960000,
              comboTotal: 1764000,
              desc: 'Ngôn ngữ thiết kế Quiet Luxury tối giản, cấu trúc ve áo mềm mại không độn vai kết hợp phom quần tây Ý sartorial tôn dáng chuẩn mực trong mọi buổi đàm phán.',
            },
            {
              id: 'silk-atelier',
              title: 'Bảo Lộc Silk Atelier Edit',
              palette: 'Tone Ngà Óng & Nâu Đất',
              harmony: '97/100 Tone-sur-Tone',
              tag: 'Thủ công · 100% Tơ Tằm',
              top: { name: 'Áo sơ mi lụa tơ tằm dệt tay', price: 750000, img: '/products/shirt.svg', shop: 'NEXORA Atelier' },
              bottom: { name: 'Quần culottes lụa cát mềm rủ', price: 680000, img: '/products/pants.svg', shop: 'NEXORA Atelier' },
              outer: { name: 'Khăn lụa bỏ túi & Áo choàng nhẹ', price: 420000, img: '/products/jacket.svg', shop: 'NEXORA Atelier' },
              originalTotal: 1850000,
              comboTotal: 1665000,
              desc: '100% sợi tơ tằm nguyên bản thủ công từ thủ phủ tơ lụa Bảo Lộc, tạo độ rủ mềm mại như làn da thứ hai với ánh óng ả tự nhiên tuyệt mỹ.',
            },
          ];

          const cur = edits[activeCapsule];

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'center' }}>
              {/* 3 Pieces Visual Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { role: 'Áo chính (Top)', item: cur.top },
                  { role: 'Quần/Váy (Bottom)', item: cur.bottom },
                  { role: 'Lớp ngoài (Outer)', item: cur.outer },
                ].map((piece, i) => (
                  <div
                    key={i}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 3,
                      padding: 10,
                      background: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                      {piece.role}
                    </span>
                    <img
                      src={piece.item.img}
                      alt={piece.item.name}
                      style={{ width: '100%', height: 110, objectFit: 'contain', margin: '4px 0' }}
                    />
                    <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, margin: '4px 0 2px', minHeight: 28, overflow: 'hidden' }}>
                      {piece.item.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 700 }}>
                      {vnd(piece.item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lookbook Editorial Details */}
              <div style={{ padding: '8px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, background: '#EEF2FF', color: 'var(--brand-indigo)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                    {cur.palette}
                  </span>
                  <span style={{ fontSize: 11, background: '#eef2ed', color: '#166534', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                    {cur.harmony}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 8px' }}>
                  {cur.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {cur.desc}
                </p>

                <div style={{ background: '#F8FAFC', border: '1px solid var(--line)', borderRadius: 3, padding: '12px 16px', marginBottom: 14 }}>
                  <div className="row between" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                    <span>Tổng giá trị lẻ 3 món:</span>
                    <span>{vnd(cur.originalTotal)}</span>
                  </div>
                  <div className="row between" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Giá trọn bộ Combo Style Saver:
                      <span style={{ fontSize: 10, background: '#166534', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                        -10%
                      </span>
                    </span>
                    <strong style={{ color: 'var(--brand-indigo)', fontSize: 16 }}>{vnd(cur.comboTotal)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Link
                    href={`/phoi-do`}
                    className="button"
                    style={{ flex: 1, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Sparkles size={15} /> Thử Phối Đồ Tại Studio
                  </Link>
                  <Link
                    href={`/tim-kiem?q=${encodeURIComponent(cur.id === 'normandy' ? 'Linen' : cur.id === 'executive' ? 'Blazer' : 'Lụa')}`}
                    className="button secondary"
                    style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Eye size={15} /> Khám Phá
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>

    <section className="section" id="trang-phuc"><div className="section-heading"><div><p className="eyebrow">THE ATELIER COLLECTION // CURATED APPAREL</p><h2>Tuyển Tập Thiết Kế <em>Nguyên Bản.</em></h2></div><span className="subtle">{data ? `${data.total} thiết kế đang chờ bạn` : 'Tìm thiết kế dành cho bạn'}</span></div>
      <div className="catalog-toolbar"><div className="tabs" aria-label="Danh mục">{[['', 'Tất cả'], ['ao', 'Áo'], ['quan', 'Quần'], ['vay', 'Váy & đầm'], ['ao-khoac', 'Áo khoác & Blazer']].map(([id, name]) => <button key={id} className={category === id ? 'selected' : ''} onClick={() => setCategory(id)}>{name}</button>)}</div><div className="toolbar-right"><form className="search" onSubmit={e => { e.preventDefault(); setSearch(query); }}><Search size={17}/><input aria-label="Tìm tên sản phẩm" placeholder="Tìm món bạn thích…" value={query} onChange={e => setQuery(e.target.value)}/><button type="submit" aria-label="Tìm kiếm"><ArrowRight size={17}/></button></form><button className="filter-button" onClick={() => setFilters(!filters)} aria-expanded={filters}><SlidersHorizontal size={17}/>Bộ lọc</button></div></div>
      {filters && <div className="filters"><label>Màu sắc<select value={color} onChange={e => setColor(e.target.value)}><option value="">Mọi màu</option>{['Đen', 'Trắng', 'Kem', 'Nâu', 'Xanh'].map(c => <option key={c}>{c}</option>)}</select></label><label>Kích cỡ<select value={size} onChange={e => setSize(e.target.value)}><option value="">Mọi size</option>{['S', 'M', 'L'].map(s => <option key={s}>{s}</option>)}</select></label><label className="check"><input type="checkbox" checked={stock} onChange={e => setStock(e.target.checked)}/>Chỉ món còn hàng</label><label className="check"><input type="checkbox" checked={mall} onChange={e => setMall(e.target.checked)}/>Chỉ NEXORA Mall (Chính hãng)</label><button className="text-button" onClick={() => { setColor(''); setSize(''); setStock(false); setMall(false); setSearch(''); setQuery(''); }}>Xóa bộ lọc</button></div>}
      {loading ? <Loading/> : error ? <Notice error>{error}</Notice> : data?.items.length ? <div className="product-grid">{data.items.map(p => <ProductCard key={p.id} product={p}/>)}</div> : <Notice>Chưa có món phù hợp bộ lọc. Bạn thử màu hoặc size khác nhé.</Notice>}
    </section>
    <section className="community-banner"><div><p className="eyebrow">COMMUNITY LOOKBOOK // #NEXORA_OOTD</p><h2>Cảm Hứng Phong Cách <em>Thực Tế Từ Cộng Đồng.</em></h2><p>Cùng một chiếc áo, hàng trăm câu chuyện phong cách.<br/>Ghé xem mọi người đang mặc gì hôm nay.</p><Link href="/cong-dong" className="button light">Khám phá cộng đồng OOTD<ArrowUpRight size={19}/></Link></div><img src="/products/community.svg" alt="Minh họa các cách kết hợp áo và quần"/><span className="community-stamp">NEXORA<br/>STYLE HUB<br/>↗</span></section>
  </>;
}
