'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Search, SlidersHorizontal, Zap, TrendingUp, Sparkles, Layers, ShoppingBag, Eye } from 'lucide-react';
import { Product, useResource, vnd } from './api';
import { Loading, Notice, ProductCard } from './ui';

export default function Home() {
  const [category, setCategory] = useState(''), [query, setQuery] = useState(''), [search, setSearch] = useState(''), [color, setColor] = useState(''), [size, setSize] = useState(''), [stock, setStock] = useState(false), [mall, setMall] = useState(false), [filters, setFilters] = useState(false);
  const [activeCapsule, setActiveCapsule] = useState(0);
  const params = new URLSearchParams({ ...(category ? { category } : {}), ...(search ? { q: search } : {}), ...(color ? { color } : {}), ...(size ? { size } : {}), ...(stock ? { inStock: 'true' } : {}), ...(mall ? { isMall: 'true' } : {}) });
  const { data, error, loading } = useResource<{ items: Product[]; total: number }>(`/products?${params}`);
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span/> NEXORA ATELIER // SS 2026 RUNWAY &amp; EDITORIAL ARCHIVE</div>
        <h1 style={{ textWrap: 'balance', letterSpacing: '-0.02em', fontSize: 'clamp(28px, 3.2vw, 44px)', fontWeight: 700, lineHeight: 1.25 }}>
          Nghệ Thuật May Đo.<br/>
          <span style={{ color: 'var(--brand-indigo)' }}>Bản Sắc Đương Đại.</span>
        </h1>
        <p>Tuyển tập thiết kế may đo cao cấp từ các nhà mốt độc lập. Chuẩn mực trong từng phom dáng, nguyên bản trong từng thớ sợi tự nhiên.</p>
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
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
          alt="NEXORA Runway &amp; Editorial Archive"
        />
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
      <i>●</i>
      <span>ĐỒNG KIỂM TRƯỚC KHI NHẬN HÀNG</span>
      <i>●</i>
      <span>PHÒNG THỬ ĐỒ MIX &amp; MATCH AI</span>
      <i>●</i>
      <span>ATELIER SPA &amp; CHĂM SÓC ĐỒ HIỆU</span>
      <i>●</i>
      <span>THU CŨ ĐỔI MỚI TRADE-IN MINH BẠCH</span>
    </div>

    {/* Editorial Stories & Atelier Chapters */}
    <section className="section" style={{ paddingTop: 36, paddingBottom: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ height: 230, overflow: 'hidden', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
              alt="Chất liệu mộc tự nhiên"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(20, 20, 19, 0.88)', color: 'var(--gold-light)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 2 }}>
              01 / CHẤT LIỆU MỘC
            </span>
          </div>
          <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--ink)' }}>Sợi Lanh Normandy &amp; Lụa Tơ Tằm</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>Chất liệu dệt thủ công thoáng khí, phom dáng rủ nhẹ nhàng tôn vinh vẻ đẹp nguyên bản và bền bỉ cùng thời gian.</p>
            </div>
            <Link href="/san-pham?category=AO" style={{ marginTop: 16, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Khám phá chất liệu <ArrowUpRight size={14}/>
            </Link>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ height: 230, overflow: 'hidden', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80"
              alt="Kỹ nghệ may đo cao cấp"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(20, 20, 19, 0.88)', color: 'var(--gold-light)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 2 }}>
              02 / ATELIER TAILORING
            </span>
          </div>
          <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--ink)' }}>Kỹ Nghệ May Đo &amp; Phom Dáng Cấu Trúc</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>Đường may sắc sảo, đường cắt tỉ mỉ từ các nghệ nhân may đo độc lập tuyển chọn đạt chuẩn sartorial quốc tế.</p>
            </div>
            <Link href="/san-pham?category=AO_KHOAC" style={{ marginTop: 16, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Xem bộ sưu tập <ArrowUpRight size={14}/>
            </Link>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ height: 230, overflow: 'hidden', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
              alt="Digital Runway & Mix Studio"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: 14, left: 14, background: 'rgba(20, 20, 19, 0.88)', color: 'var(--gold-light)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 2 }}>
              03 / DIGITAL RUNWAY
            </span>
          </div>
          <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--ink)' }}>Studio Phối Đồ AI &amp; Sàn Diễn Độc Quyền</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>Trải nghiệm thử trang phục ảo theo thời gian thực và đón nhận cảm hứng phong cách từ cộng đồng OOTD thượng lưu.</p>
            </div>
            <Link href="/phoi-do" style={{ marginTop: 16, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Thử phối trang phục <ArrowUpRight size={14}/>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Bảng Xếp Hạng Xu Hướng Thời Trang Tuần Realtime */}
    <section className="section" style={{ paddingTop: 32, paddingBottom: 0 }}>
      <div style={{ padding: '28px 32px', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <p className="eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)' }}>
              <TrendingUp size={14} /> EDITORIAL FORECAST // SS 2026 RUNWAY INSIGHTS
            </p>
            <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>
              Điểm Nhấn Xu Hướng &amp; Cấu Trúc May Đo
            </h2>
          </div>
          <Link href="/phoi-do" className="button subtle" style={{ fontSize: 11, padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Phòng Thử Đồ Mix &amp; Match →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {[
            {
              rank: '01',
              title: 'Quiet Luxury & Phom Rộng Phóng Khoáng',
              growth: '+142%',
              desc: 'Áo khoác blazer linen cấu trúc nhẹ phối quần tây ống suông cạp cao xếp ly đôi.',
              tag: 'Thịnh hành nhất',
            },
            {
              rank: '02',
              title: 'Chất Liệu Tự Nhiên & Dệt Thô Mộc',
              growth: '+98%',
              desc: 'Sơ mi 100% Premium Linen & Cotton Compact Pima mềm mát, bề mặt dệt sống động.',
              tag: 'Tăng trưởng nhanh',
            },
            {
              rank: '03',
              title: 'Tone Màu Đất & Phong Cách Sartorial',
              growth: '+85%',
              desc: 'Trench coat dạ wool dệt chéo màu nâu cát ấm cổ điển, phom vai Ý thanh thoát.',
              tag: 'Được yêu thích',
            },
          ].map(trend => (
            <div
              key={trend.rank}
              style={{
                padding: '20px 22px',
                background: '#FAF8F5',
                border: '1px solid var(--line)',
                borderRadius: 2,
              }}
            >
              <div className="row between" style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--gold-dark)' }}>
                  {trend.rank}
                </span>
                <span style={{ fontSize: 10.5, background: '#EBF3EE', color: '#2D5A3F', padding: '3px 8px', borderRadius: 2, fontWeight: 700 }}>
                  {trend.growth}
                </span>
              </div>
              <h4 style={{ margin: '0 0 6px', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)' }}>
                {trend.title}
              </h4>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                {trend.desc}
              </p>
              <span style={{ display: 'inline-block', marginTop: 12, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', fontWeight: 700 }}>
                ✦ {trend.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Bộ Sưu Tập Capsule Mùa Mới · Capsule Lookbook Studio */}
    <section className="section" style={{ paddingTop: 32, paddingBottom: 0 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: 2, padding: '28px 32px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <div className="row between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <p className="eyebrow" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)' }}>
              <Layers size={14} /> ATELIER CAPSULE EDIT // HARMONY OF FABRIC
            </p>
            <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>
              Bộ Sưu Tập Capsule &amp; Nghệ Thuật Phối Đồ
            </h2>
            <p className="subtle" style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--muted)' }}>
              Ba bản phối may đo thiết yếu được cố vấn sắc độ bởi các Senior Stylist, tôn vinh chất liệu tự nhiên cùng ưu đãi Combo Saver -10%.
            </p>
          </div>
          <Link href="/phoi-do" className="button" style={{ fontSize: 11, padding: '9px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} /> Mở Studio Phối Đồ Tự Do →
          </Link>
        </div>

        {/* Lookbook Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 20, overflowX: 'auto' }}>
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
                background: activeCapsule === tab.id ? '#141413' : '#FAF8F5',
                color: activeCapsule === tab.id ? '#FAF8F5' : 'var(--ink)',
                border: activeCapsule === tab.id ? '1px solid #141413' : '1px solid var(--line)',
                padding: '8px 18px',
                borderRadius: 2,
                fontSize: 11.5,
                fontWeight: activeCapsule === tab.id ? 700 : 500,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.name} <small style={{ opacity: 0.75, fontSize: 10, letterSpacing: '0.02em' }}>({tab.tag})</small>
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
              top: { name: 'Áo sơ mi cổ trụ Premium Linen', price: 420000, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', shop: 'NÉP Studio' },
              bottom: { name: 'Quần short linen mộc tự nhiên', price: 390000, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80', shop: 'NÉP Studio' },
              outer: { name: 'Áo khoác safari kaki đũi', price: 650000, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80', shop: 'NÉP Studio' },
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
              top: { name: 'Áo Polo dệt kim Merino sợi dài', price: 490000, img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80', shop: 'Lụa & Co' },
              bottom: { name: 'Quần tây xếp ly kép phom suông', price: 580000, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80', shop: 'Lụa & Co' },
              outer: { name: 'Áo khoác Blazer Linen hai hàng khuy', price: 890000, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', shop: 'Lụa & Co' },
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
              top: { name: 'Áo sơ mi lụa tơ tằm dệt tay', price: 750000, img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80', shop: 'NEXORA Atelier' },
              bottom: { name: 'Quần culottes lụa cát mềm rủ', price: 680000, img: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80', shop: 'NEXORA Atelier' },
              outer: { name: 'Khăn lụa bỏ túi & Áo choàng nhẹ', price: 420000, img: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80', shop: 'NEXORA Atelier' },
              originalTotal: 1850000,
              comboTotal: 1665000,
              desc: '100% sợi tơ tằm nguyên bản thủ công từ thủ phủ tơ lụa Bảo Lộc, tạo độ rủ mềm mại như làn da thứ hai với ánh óng ả tự nhiên tuyệt mỹ.',
            },
          ];

          const cur = edits[activeCapsule];

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'center' }}>
              {/* 3 Pieces Visual Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { role: 'Áo chính (Top)', item: cur.top },
                  { role: 'Quần/Váy (Bottom)', item: cur.bottom },
                  { role: 'Lớp ngoài (Outer)', item: cur.outer },
                ].map((piece, i) => (
                  <div
                    key={i}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 2,
                      padding: 12,
                      background: '#FFFFFF',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-dark)', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                      {piece.role}
                    </span>
                    <img
                      src={piece.item.img}
                      alt={piece.item.name}
                      style={{ width: '100%', height: 135, objectFit: 'cover', borderRadius: 2, margin: '4px 0' }}
                    />
                    <div style={{ fontSize: 11.5, fontWeight: 500, lineHeight: 1.35, margin: '6px 0 2px', minHeight: 32, overflow: 'hidden' }}>
                      {piece.item.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink)', fontWeight: 700 }}>
                      {vnd(piece.item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lookbook Editorial Details */}
              <div style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, letterSpacing: '0.04em', background: '#F3EFEA', color: 'var(--gold-dark)', padding: '3px 10px', borderRadius: 2, fontWeight: 700 }}>
                    {cur.palette}
                  </span>
                  <span style={{ fontSize: 10.5, letterSpacing: '0.04em', background: '#EBF3EE', color: '#2D5A3F', padding: '3px 10px', borderRadius: 2, fontWeight: 700 }}>
                    {cur.harmony}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, margin: '6px 0 10px' }}>
                  {cur.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: '0 0 16px' }}>
                  {cur.desc}
                </p>

                <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 2, padding: '14px 18px', marginBottom: 16 }}>
                  <div className="row between" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>
                    <span>Tổng giá trị lẻ 3 món:</span>
                    <span>{vnd(cur.originalTotal)}</span>
                  </div>
                  <div className="row between" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      Giá trọn bộ Combo Style Saver:
                      <span style={{ fontSize: 9.5, background: 'var(--gold-dark)', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                        -10%
                      </span>
                    </span>
                    <strong style={{ color: 'var(--gold-dark)', fontSize: 17, fontFamily: 'var(--font-serif)' }}>{vnd(cur.comboTotal)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Link
                    href={`/phoi-do`}
                    className="button"
                    style={{ flex: 1, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Sparkles size={14} /> Thử Phối Đồ Tại Studio
                  </Link>
                  <Link
                    href={`/tim-kiem?q=${encodeURIComponent(cur.id === 'normandy' ? 'Linen' : cur.id === 'executive' ? 'Blazer' : 'Lụa')}`}
                    className="button secondary"
                    style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Eye size={14} /> Khám Phá
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
    <section className="community-banner"><div><p className="eyebrow">COMMUNITY LOOKBOOK // #NEXORA_OOTD</p><h2>Cảm Hứng Phong Cách <em>Thực Tế Từ Cộng Đồng.</em></h2><p>Cùng một chiếc áo, hàng trăm câu chuyện phong cách.<br/>Ghé xem mọi người đang mặc gì hôm nay.</p><Link href="/cong-dong" className="button light">Khám phá cộng đồng OOTD<ArrowUpRight size={19}/></Link></div><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80" alt="Cộng đồng thời trang NEXORA OOTD"/><span className="community-stamp">NEXORA<br/>STYLE HUB<br/>↗</span></section>
  </>;
}
