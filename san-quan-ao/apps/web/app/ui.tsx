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
  const path = usePathname();
  const refresh = () => { api<PublicUser>('/auth/me').then(setUser).catch(() => setUser(null)); };
  useEffect(refresh, []);
  useEffect(() => {
    setOpen(false);
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && ref.length <= 100) localStorage.setItem('nexora_ref', ref);
  }, [path]);
  return <UserContext.Provider value={{ user, refresh }}>
    <div className="announcement">NEXORA — HỆ SINH THÁI THỜI TRANG & CỘNG ĐỒNG PHỐI ĐỒ THẾ HỆ MỚI <span>Khám phá ngay ↗</span></div>
    <header className="header"><Link href="/" className="logo" aria-label="NEXORA, trang chủ"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '30px', width: 'auto' }} /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Điều hướng chính"><Link className={path === '/' || path.startsWith('/san-pham') ? 'active' : ''} href="/">Khám phá</Link><Link className={path === '/phoi-do' ? 'active' : ''} href="/phoi-do">Phối đồ (Mix &amp; Match)</Link><Link className={path === '/live' ? 'active' : ''} href="/live" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px #EF4444' }}/>Trực tiếp (Live)</Link><Link className={path === '/cong-dong' ? 'active' : ''} href="/cong-dong">Cộng đồng OOTD</Link><Link className={path === '/trade-in' ? 'active' : ''} href="/trade-in">Trade-In</Link><Link className={path === '/vas-care' ? 'active' : ''} href="/vas-care">VAS Care</Link><Link className={path === '/seller' ? 'active' : ''} href="/seller">Dành cho Shop</Link>{user?.role === 'ADMIN' && <Link className={path === '/admin' ? 'active' : ''} href="/admin">Quản trị</Link>}</nav>
      <div className="header-actions">
        <Link href="/tim-kiem" className="icon-link" aria-label="Tìm kiếm"><Search size={20}/></Link>
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
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Trung Tâm Thông Báo (NOTIF-CENTER-02)</strong>
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
                <div style={{ padding: '8px 10px', background: '#faf8f5', borderRadius: 4, borderLeft: '3px solid var(--clay)' }}>
                  <strong style={{ display: 'block', color: 'var(--ink)' }}>✨ Smart Fit Fashion Passport</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 11 }}>
                    Hồ sơ số đo cá nhân đã sẵn sàng. Hệ thống sẽ tự động so khớp và gợi ý size chuẩn xác khi bạn xem sản phẩm.
                  </p>
                </div>
                <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 4, borderLeft: '3px solid #059669' }}>
                  <strong style={{ display: 'block', color: '#166534' }}>🌱 Thưởng sống xanh +50 Xu</strong>
                  <p style={{ margin: '2px 0 0', color: '#374151', fontSize: 11 }}>
                    Bạn đã chọn đóng gói xanh Eco Green Box cho đơn hàng gần nhất. Xu thưởng đã được cộng vào tài khoản.
                  </p>
                </div>
                <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 4, borderLeft: '3px solid #2563eb' }}>
                  <strong style={{ display: 'block', color: '#1e40af' }}>⚡ Phòng Thử Đồ Mix &amp; Match</strong>
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
    </header>
    <main>{children}</main>
    <footer><div><Link href="/" className="logo"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '26px', width: 'auto' }} /></Link><p>The Next Era of Fashion Commerce & Lifestyle Community.</p><p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Vận hành tuân thủ Nghị định 91/2022/NĐ-CP &amp; Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân (PDPD).</p></div><div><p>KHÁM PHÁ</p><Link href="/">Trang phục & Phụ kiện</Link><Link href="/phoi-do">Phối đồ (Mix &amp; Match)</Link><Link href="/live">Sàn diễn Live (SOC-LIVE-01)</Link><Link href="/cong-dong">Cộng đồng OOTD</Link><Link href="/trade-in">Thu cũ Đổi mới (Trade-In)</Link><Link href="/vas-care">Chăm sóc đồ hiệu (VAS Care)</Link></div><div><p>HỆ SINH THÁI</p><Link href="/don-hang">Đơn hàng của bạn</Link><Link href="/seller">Mở shop cùng NEXORA</Link><Link href="/dang-ky">Đăng ký tài khoản</Link></div><div className="footer-note"><strong>TIÊU CHUẨN VẬN HÀNH</strong><br/>• Đồng kiểm ngoại quan (RET-COINSPECT)<br/>• Cầu dao an ninh giá (SOC-PRICE-ERROR)<br/>• Mã PIN an ninh giao nhận (FUL-VERIF-05)<br/>• Hóa đơn điện tử VAT TT 78/2021<br/>• Bảo hành &amp; Đổi trả 7–15 ngày</div></footer>
  </UserContext.Provider>;
}
export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div role={error ? 'alert' : 'status'} className={error ? 'notice error' : 'notice'}>{children}</div>; }
export function Loading() { return <div className="loading" role="status"><span/>Đang tải dữ liệu…</div>; }
export function Empty({ title, detail, href = '/', action = 'Khám phá trang phục' }: { title: string; detail: string; href?: string; action?: string }) { return <div className="empty"><ShoppingBag size={40} strokeWidth={1}/><h2>{title}</h2><p>{detail}</p><Link className="button" href={href}>{action}<ArrowUpRight size={18}/></Link></div>; }
export function ProductCard({ product }: { product: Product }) {
  const colors = [...new Map(product.variants.map(v => [v.color, v.colorHex])).entries()];
  const available = product.variants.some(v => v.inventory && v.inventory.onHand > v.inventory.reserved);
  return (
    <Link href={`/san-pham/${product.slug}`} className="product-card">
      <div className="product-image">
        <img
          src={product.images[0]?.url}
          alt={product.name}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('/products/shirt.svg')) {
              target.src = '/products/shirt.svg';
            }
          }}
        />
        <span className="product-tag">{product.material}</span>
        <span className="card-arrow"><ArrowUpRight size={20}/></span>
        {!available && <span className="sold-out">Tạm hết hàng</span>}
      </div>
      <div className="product-meta">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {product.shop.name}
          {product.shop.isMall && (
            <span
              style={{
                background: 'var(--clay)',
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
          {colors.map(([color, hex]) => <i key={color} title={color} style={{ background: hex }}/>)}
        </div>
      </div>
      <h3>{product.name}</h3>
      <p className="price">{vnd(Math.min(...product.variants.map(v => v.price)))}</p>
    </Link>
  );
}
