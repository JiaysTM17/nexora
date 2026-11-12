'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { ArrowUpRight, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import type { PublicUser } from '@mac/contracts';
import { api, Product, vnd } from './api';

const UserContext = createContext<{ user: PublicUser | null; refresh: () => void }>({ user: null, refresh: () => {} });
export const useUser = () => useContext(UserContext);
export function Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null), [open, setOpen] = useState(false);
  const path = usePathname();
  const refresh = () => { api<PublicUser>('/auth/me').then(setUser).catch(() => setUser(null)); };
  useEffect(refresh, []);
  useEffect(() => setOpen(false), [path]);
  return <UserContext.Provider value={{ user, refresh }}>
    <div className="announcement">NEXORA — HỆ SINH THÁI THỜI TRANG & CỘNG ĐỒNG PHỐI ĐỒ THẾ HỆ MỚI <span>Khám phá ngay ↗</span></div>
    <header className="header"><Link href="/" className="logo" aria-label="NEXORA, trang chủ"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '30px', width: 'auto' }} /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Điều hướng chính"><Link className={path === '/' || path.startsWith('/san-pham') ? 'active' : ''} href="/">Khám phá</Link><Link className={path === '/cong-dong' ? 'active' : ''} href="/cong-dong">Cộng đồng OOTD</Link><Link className={path === '/seller' ? 'active' : ''} href="/seller">Dành cho Shop</Link>{user?.role === 'ADMIN' && <Link href="/admin">Quản trị</Link>}</nav>
      <div className="header-actions"><Link className="icon-link account" href={user ? '/don-hang' : '/dang-nhap'} aria-label={user ? 'Đơn hàng của tôi' : 'Đăng nhập'}><UserRound size={21}/><span>{user?.name.split(' ')[0] ?? 'Tài khoản'}</span></Link><Link href="/gio-hang" className="icon-link" aria-label="Giỏ hàng"><ShoppingBag size={22}/></Link><button className="icon-link mobile-menu" onClick={() => setOpen(!open)} aria-label="Mở menu" aria-expanded={open}>{open ? <X/> : <Menu/>}</button></div>
    </header>
    <main>{children}</main>
    <footer><div><Link href="/" className="logo"><img src="/nexora-logo.svg" alt="NEXORA" style={{ height: '26px', width: 'auto' }} /></Link><p>The Next Era of Fashion Commerce & Lifestyle Community.</p></div><div><p>KHÁM PHÁ</p><Link href="/">Trang phục & Phụ kiện</Link><Link href="/cong-dong">Cộng đồng OOTD</Link></div><div><p>HỆ SINH THÁI</p><Link href="/don-hang">Đơn hàng của bạn</Link><Link href="/seller">Mở shop cùng NEXORA</Link></div><div className="footer-note">Hệ sinh thái NEXORA<br/>Nền tảng TMĐT thời trang thế hệ mới.<br/>Tích hợp Trade-in & Chăm sóc đồ hiệu.</div></footer>
  </UserContext.Provider>;
}
export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <div role={error ? 'alert' : 'status'} className={error ? 'notice error' : 'notice'}>{children}</div>; }
export function Loading() { return <div className="loading" role="status"><span/>Đang tải dữ liệu…</div>; }
export function Empty({ title, detail, href = '/', action = 'Khám phá trang phục' }: { title: string; detail: string; href?: string; action?: string }) { return <div className="empty"><ShoppingBag size={40} strokeWidth={1}/><h2>{title}</h2><p>{detail}</p><Link className="button" href={href}>{action}<ArrowUpRight size={18}/></Link></div>; }
export function ProductCard({ product }: { product: Product }) {
  const colors = [...new Map(product.variants.map(v => [v.color, v.colorHex])).entries()];
  const available = product.variants.some(v => v.inventory && v.inventory.onHand > v.inventory.reserved);
  return <Link href={`/san-pham/${product.slug}`} className="product-card"><div className="product-image"><img src={product.images[0]?.url} alt={product.name}/><span className="product-tag">{product.material}</span><span className="card-arrow"><ArrowUpRight size={20}/></span>{!available && <span className="sold-out">Tạm hết hàng</span>}</div><div className="product-meta"><span>{product.shop.name}</span><div className="swatches">{colors.map(([color, hex]) => <i key={color} title={color} style={{ background: hex }}/>)}</div></div><h3>{product.name}</h3><p className="price">{vnd(Math.min(...product.variants.map(v => v.price)))}</p></Link>;
}
