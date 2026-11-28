'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { ArrowUpRight, Bell, Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import type { PublicUser } from '@mac/contracts';
import { api, Product, vnd } from './api';

const UserContext = createContext<{ user: PublicUser | null; refresh: () => void }>({ user: null, refresh: () => {} });
export const useUser = () => useContext(UserContext);
export function Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null), [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const path = usePathname();
  const refresh = () => { api<PublicUser>('/auth/me').then(setUser).catch(() => setUser(null)); };
  useEffect(refresh, []);
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && ref.length <= 100) localStorage.setItem('nexora_ref', ref);
  }, [path]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      api<Product[]>(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => setSearchResults(res.slice(0, 5)))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  return <UserContext.Provider value={{ user, refresh }}>
    <div className="announcement">NEXORA Atelier · Tuyển tập thiết kế may đo cao cấp và cộng đồng thời trang độc lập <span>Khám phá ngay &rarr;</span></div>
    <header className="header"><Link href="/" className="logo" aria-label="NEXORA, trang chủ"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '38px', width: 'auto' }} /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Điều hướng chính"><Link className={path === '/' || path.startsWith('/san-pham') ? 'active' : ''} href="/">Khám phá</Link><Link className={path === '/phoi-do' ? 'active' : ''} href="/phoi-do">Phối đồ (Mix &amp; Match)</Link><Link className={path === '/live' ? 'active' : ''} href="/live" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px #EF4444' }}/>Trực tiếp (Live)</Link><Link className={path === '/cong-dong' ? 'active' : ''} href="/cong-dong">Cộng đồng OOTD</Link><Link className={path === '/trade-in' ? 'active' : ''} href="/trade-in">Trade-In</Link><Link className={path === '/vas-care' ? 'active' : ''} href="/vas-care">VAS Care</Link><Link className={path === '/seller' ? 'active' : ''} href="/seller">Dành cho Shop</Link>{user?.role === 'ADMIN' && <Link className={path === '/admin' ? 'active' : ''} href="/admin">Quản trị</Link>}</nav>
      <div className="header-actions">
        <button
          type="button"
          className="icon-link"
          aria-label="Tìm kiếm nhanh (Ctrl+K)"
          title="Tìm kiếm nhanh (Ctrl+K)"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={20}/>
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="icon-link"
            aria-label="Thông báo"
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen) setUnreadCount(0);
            }}
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'var(--clay)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: -60,
                width: 320,
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 6,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                padding: '14px 16px',
                zIndex: 100,
                fontSize: 12,
              }}
            >
              <div className="row between" style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Trung tâm thông báo</strong>
                <button
                  type="button"
                  className="text-button"
                  style={{ fontSize: 10, padding: 0 }}
                  onClick={() => setNotifOpen(false)}
                >
                  Đóng
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '8px 10px', background: '#F8FAFC', borderRadius: 4, borderLeft: '3px solid var(--gold-dark)' }}>
                  <strong style={{ display: 'block', color: 'var(--ink)' }}>Hồ sơ số đo Fashion Passport</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 11 }}>
                    Hồ sơ số đo cá nhân đã sẵn sàng. Hệ thống sẽ tự động so khớp và gợi ý size chuẩn xác khi bạn xem sản phẩm.
                  </p>
                </div>
                <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 4, borderLeft: '3px solid #059669' }}>
                  <strong style={{ display: 'block', color: '#166534' }}>Thưởng sống xanh +50 Xu</strong>
                  <p style={{ margin: '2px 0 0', color: '#374151', fontSize: 11 }}>
                    Bạn đã chọn đóng gói xanh Eco Green Box cho đơn hàng gần nhất. Xu thưởng đã được cộng vào tài khoản.
                  </p>
                </div>
                <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 4, borderLeft: '3px solid #2563eb' }}>
                  <strong style={{ display: 'block', color: '#1e40af' }}>Phòng thử đồ Mix &amp; Match</strong>
                  <p style={{ margin: '2px 0 0', color: '#374151', fontSize: 11 }}>
                    Khám phá tính năng phối đồ 3 lớp tại /phoi-do và nhận chiết khấu Combo Style Saver -10% khi mua trọn bộ.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
                <Link href="/don-hang" onClick={() => setNotifOpen(false)} style={{ color: 'var(--clay)', fontWeight: 600, fontSize: 11 }}>
                  Xem lịch sử đơn hàng &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
        {user && <Link href="/tai-khoan" className="icon-link" aria-label="Món đồ đã lưu"><Heart size={20}/></Link>}
        <Link className="icon-link account" href={user ? '/tai-khoan' : '/dang-nhap'} aria-label={user ? 'Tài khoản của tôi' : 'Đăng nhập'}><UserRound size={21}/><span>{user?.name.split(' ')[0] ?? 'Tài khoản'}</span></Link>
        <Link href="/gio-hang" className="icon-link" aria-label="Giỏ hàng"><ShoppingBag size={22}/></Link>
        <button className="icon-link mobile-menu" onClick={() => setOpen(!open)} aria-label="Mở menu" aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
      </div>

      {/* Live Search & Command Palette */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 80,
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 580,
              borderRadius: 6,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              border: '1px solid var(--line)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
              <Search size={18} color="var(--muted)" style={{ marginRight: 10 }} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trang phục, chất liệu (Linen, Lụa...), phong cách... (Esc để đóng)"
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  width: '100%',
                  background: 'transparent',
                }}
              />
              <button
                type="button"
                className="text-button"
                style={{ fontSize: 11, padding: '2px 6px' }}
                onClick={() => setSearchOpen(false)}
              >
                Esc
              </button>
            </div>

            {/* Trending tags */}
            <div style={{ padding: '8px 16px', background: '#faf9f5', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>Thịnh hành:</span>
              {['Quiet Luxury', 'Linen Normandy', 'Lụa Tơ Tằm', 'Quần Sartorial', 'Blazer'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    padding: '2px 8px',
                    borderRadius: 3,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSearchQuery(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
              {searching ? (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                  Đang tìm kiếm sản phẩm...
                </div>
              ) : searchQuery.trim() && !searchResults.length ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                  Không tìm thấy sản phẩm nào khớp với &quot;{searchQuery}&quot;. Thử tìm với từ khóa khác hoặc{' '}
                  <Link href={`/tim-kiem?q=${encodeURIComponent(searchQuery)}`} onClick={() => setSearchOpen(false)} style={{ color: 'var(--clay)', fontWeight: 600 }}>
                    tìm kiếm nâng cao &rarr;
                  </Link>
                </div>
              ) : searchResults.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/san-pham/${prod.slug}`}
                      onClick={() => setSearchOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 10px',
                        borderRadius: 4,
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f3ee')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img
                        src={prod.images[0]?.url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'}
                        alt={prod.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 3, background: '#F3EFEA' }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes('unsplash.com')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{prod.shop.name}</span>
                          {prod.shop.isMall && (
                            <span style={{ fontSize: 9, background: 'var(--gold-dark)', color: '#FAF8F5', padding: '1px 5px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.05em' }}>
                              ATELIER
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{prod.material}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>
                        {vnd(Math.min(...prod.variants.map((v) => v.price)))}
                      </div>
                    </Link>
                  ))}
                  <div style={{ padding: '8px 10px', borderTop: '1px solid var(--line)', textAlign: 'center', marginTop: 4 }}>
                    <Link
                      href={`/tim-kiem?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchOpen(false)}
                      style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600 }}
                    >
                      Xem toàn bộ kết quả cho &quot;{searchQuery}&quot; &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                  Gõ từ khóa để nhận gợi ý sản phẩm tức thời, hoặc nhấn vào các thẻ thịnh hành ở trên.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    <main>{children}</main>
    <footer><div><Link href="/" className="logo"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '36px', width: 'auto' }} /></Link><p>The Next Era of Fashion Commerce &amp; Lifestyle Community.</p><p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Vận hành tuân thủ Nghị định 91/2022/NĐ-CP &amp; Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân (PDPD).</p></div><div><p>KHÁM PHÁ</p><Link href="/">Trang phục & Phụ kiện</Link><Link href="/phoi-do">Phối đồ (Mix &amp; Match)</Link><Link href="/live">Sàn diễn Live Runway</Link><Link href="/cong-dong">Cộng đồng OOTD</Link><Link href="/trade-in">Thu cũ Đổi mới (Trade-In)</Link><Link href="/vas-care">Chăm sóc đồ hiệu (VAS Care)</Link></div><div><p>HỆ SINH THÁI</p><Link href="/don-hang">Đơn hàng của bạn</Link><Link href="/seller">Mở shop cùng NEXORA</Link><Link href="/dang-ky">Đăng ký tài khoản</Link></div><div className="footer-note"><strong>TIÊU CHUẨN VẬN HÀNH ATELIER</strong><br/>• Đồng kiểm ngoại quan tận tay<br/>• Bảo vệ giá niêm yết chính hãng<br/>• Mã PIN an toàn bảo mật giao nhận<br/>• Hóa đơn điện tử VAT chuẩn quy định<br/>• Đặc quyền đổi trả &amp; bảo hành 15 ngày</div></footer>
  </UserContext.Provider>;
}
export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div role={error ? 'alert' : 'status'} className={error ? 'notice error' : 'notice'}>{children}</div>; }
export function Loading() { return <div className="loading" role="status"><span/>Đang chuẩn bị bộ sưu tập…</div>; }
export function Empty({ title, detail, href = '/', action = 'Khám phá trang phục' }: { title: string; detail: string; href?: string; action?: string }) { return <div className="empty"><ShoppingBag size={40} strokeWidth={1}/><h2>{title}</h2><p>{detail}</p><Link className="button" href={href}>{action}<ArrowUpRight size={18}/></Link></div>; }
export function ProductCard({ product }: { product: Product }) {
  const colors = [...new Map(product.variants.map(v => [v.color, v.colorHex])).entries()];
  const available = product.variants.some(v => v.inventory && v.inventory.onHand > v.inventory.reserved);
  const fallbackImg = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
  return (
    <Link href={`/san-pham/${product.slug}`} className="product-card">
      <div className="product-image">
        <img
          src={product.images[0]?.url || fallbackImg}
          alt={product.name}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('unsplash.com')) {
              target.src = fallbackImg;
            }
          }}
        />
        <span className="product-tag">{product.material}</span>
        <span className="card-arrow"><ArrowUpRight size={18}/></span>
        {!available && <span className="sold-out">Tạm hết hàng</span>}
      </div>
      <div className="product-meta">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {product.shop.name}
          {product.shop.isMall && (
            <span
              style={{
                background: 'var(--gold-dark)',
                color: '#FAF8F5',
                fontSize: 8.5,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 2,
                letterSpacing: '0.6px',
              }}
            >
              ATELIER MALL
            </span>
          )}
        </span>
        <div className="swatches">
          {colors.map(([color, hex]) => <i key={color} title={color} style={{ background: hex }}/>)}
        </div>
      </div>
      <h3>{product.name}</h3>
      <p className="price">{vnd(Math.min(...product.variants.map(v => v.price)))}</p>
    </Link>
  );
}
