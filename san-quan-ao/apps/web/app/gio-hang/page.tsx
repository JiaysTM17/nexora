'use client';
import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Trash2, MapPin } from 'lucide-react';
import type { QuoteData } from '@mac/contracts';
import { api, Product, useResource, Variant, vnd } from '../api';
import { Empty, Loading, Notice } from '../ui';
type CartLine = { id: string; quantity: number; variant: Variant & { product: Product } };
type Address = { id: string; recipient: string; phone: string; line: string; province: string };
type Quote = { id: string; data: QuoteData; expiresAt: string };
export default function Cart() {
  const cart = useResource<CartLine[]>('/cart'), addresses = useResource<Address[]>('/addresses');
  const [addressId, setAddressId] = useState(''), [quote, setQuote] = useState<Quote | null>(null), [codes, setCodes] = useState<Record<string, string>>({}), [tradeInCode, setTradeInCode] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [newAddress, setNewAddress] = useState(false);
  const key = useRef(''), router = useRouter();
  const chosenAddress = addressId || addresses.data?.[0]?.id;
  const groups = new Map<string, CartLine[]>();
  for (const line of cart.data ?? []) { const shopId = line.variant.product.shop.id; groups.set(shopId, [...(groups.get(shopId) ?? []), line]); }
  const invalidate = () => { setQuote(null); key.current = ''; };
  async function changeLine(lineId: string, quantity?: number) {
    invalidate(); setError(''); try { await api(`/cart/${lineId}`, quantity === undefined ? 'DELETE' : 'PATCH', quantity === undefined ? undefined : { quantity }); cart.reload(); } catch (e) { setError((e as Error).message); }
  }
  async function addAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); const form = new FormData(e.currentTarget);
    try { const a = await api<Address>('/addresses', 'POST', Object.fromEntries(form.entries())); setAddressId(a.id); setNewAddress(false); addresses.reload(); invalidate(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function getQuote() {
    setBusy(true); setError(''); invalidate();
    try { const trimmedTi = tradeInCode.trim().toUpperCase(); const q = await api<Quote>('/checkout/quote', 'POST', { addressId: chosenAddress, vouchers: Object.fromEntries(Object.entries(codes).filter(([, code]) => code.trim()).map(([shop, code]) => [shop, code.trim().toUpperCase()])), ...(trimmedTi ? { tradeInCode: trimmedTi } : {}) }); setQuote(q); key.current = crypto.randomUUID(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function order() {
    if (!quote) return; setBusy(true); setError('');
    try { const ref = localStorage.getItem('nexora_ref'); await api('/orders', 'POST', { quoteId: quote.id, idempotencyKey: key.current, ...(ref ? { refUserId: ref } : {}) }); localStorage.removeItem('nexora_ref'); router.push('/don-hang'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (cart.loading) return <Loading/>;
  if (cart.error) return <section className="section"><Notice error>{cart.error}</Notice><Link className="button" href="/dang-nhap">Đăng nhập</Link></section>;
  if (!cart.data?.length) return <Empty title="Giỏ đồ đang chờ bạn." detail="Chọn một món hợp mình để bắt đầu nhé."/>;
  return <section className="section"><p className="eyebrow">TỪ CẢM HỨNG ĐẾN TỦ ĐỒ</p><h1>Giỏ hàng của bạn.</h1><p className="subtle">Một lần đặt, theo dõi đơn và phí giao riêng từng shop.</p><div className="checkout-grid"><div>{[...groups].map(([shopId, lines]) => <section key={shopId} className="panel"><h2 className="panel-title">{lines[0].variant.product.shop.name}</h2>{lines.map(line => <div className="cart-line" key={line.id}><img src={line.variant.product.images[0]?.url} alt={line.variant.product.name}/><div className="grow"><Link href={`/san-pham/${line.variant.product.slug}`}><strong>{line.variant.product.name}</strong></Link><p>{line.variant.color} / Size {line.variant.size}</p><div className="row"><input aria-label={`Số lượng ${line.variant.product.name}`} className="qty-input" type="number" min={1} max={20} value={line.quantity} onChange={e => { const value = Number(e.target.value); if (Number.isInteger(value) && value > 0 && value <= 20) void changeLine(line.id, value); }}/><button className="icon-link" aria-label={`Xóa ${line.variant.product.name}`} onClick={() => changeLine(line.id)}><Trash2 size={16}/></button></div></div><strong>{vnd(line.variant.price * line.quantity)}</strong></div>)}<label className="voucher">Mã giảm của shop<input value={codes[shopId] ?? ''} onChange={e => { setCodes({ ...codes, [shopId]: e.target.value }); invalidate(); }} placeholder={shopId === 'shop-nep' ? 'Thử CHAO50 cho đơn từ 400.000đ' : 'Nhập mã nếu có'}/></label></section>)}
      <section className="panel"><h2 className="panel-title"><MapPin size={18}/>Giao đến</h2>{addresses.error && <Notice error>{addresses.error}</Notice>}{addresses.data?.map(a => <label className="address-option" key={a.id}><input type="radio" name="address" checked={chosenAddress === a.id} onChange={() => { setAddressId(a.id); invalidate(); }}/><span><strong>{a.recipient} · {a.phone}</strong><br/>{a.line}, {a.province}</span></label>)}<button className="text-button" onClick={() => setNewAddress(!newAddress)}>{newAddress ? 'Đóng' : '+ Thêm địa chỉ'}</button>{newAddress && <form onSubmit={addAddress} className="form"><label>Người nhận<input name="recipient" required minLength={2}/></label><label>Số điện thoại<input name="phone" required pattern="0[0-9]{9}" inputMode="tel"/></label><label>Địa chỉ cụ thể<input name="line" required minLength={5}/></label><label>Tỉnh / thành phố<input name="province" required minLength={2}/></label><button className="button" disabled={busy}>Lưu địa chỉ</button></form>}</section>
      <section className="panel"><h2 className="panel-title">Voucher Trade-In NEXORA</h2><label className="voucher">Mã đối ứng từ Thu cũ Đổi mới (NXTI-...)<input value={tradeInCode} onChange={e => { setTradeInCode(e.target.value); invalidate(); }} placeholder="VD: NXTI-DEMO50"/></label></section></div>
      <aside className="panel checkout-summary"><p className="eyebrow">KIỂM TRA TRƯỚC KHI ĐẶT</p><h2>Tổng đơn hàng</h2>{quote ? <>{quote.data.shops.map(shop => <div className="quote-shop" key={shop.shopId}><strong>{shop.shopName}</strong><p><span>Tiền hàng</span><span>{vnd(shop.subtotal)}</span></p><p><span>Giảm giá</span><span>−{vnd(shop.discount)}</span></p><p><span>Phí giao mô phỏng</span><span>{vnd(shop.shipping)}</span></p><p><strong>Thanh toán cho shop</strong><strong>{vnd(shop.total)}</strong></p></div>)}{(quote.data.platformDiscount ?? 0) > 0 && <div className="quote-shop"><p><span>Voucher Trade-In ({quote.data.tradeInCode})</span><span>−{vnd(quote.data.platformDiscount ?? 0)}</span></p></div>}<div className="total"><span>Tổng COD</span><strong>{vnd(quote.data.total)}</strong></div><p className="subtle">Báo giá có hiệu lực đến {new Date(quote.expiresAt).toLocaleTimeString('vi-VN')}.</p><button className="button full" disabled={busy} onClick={order}>{busy ? 'Đang đặt…' : 'Xác nhận đặt COD'}<ArrowRight size={18}/></button><button className="text-button" onClick={getQuote} disabled={busy}>Tính lại báo giá</button></> : <><p>Kiểm tra địa chỉ và mã giảm để lấy tổng chính xác cho từng shop.</p><button className="button full" disabled={busy || !chosenAddress} onClick={getQuote}>{busy ? 'Đang tính…' : 'Xem báo giá'}<ArrowRight size={18}/></button></>}{error && <Notice error>{error}</Notice>}<p className="fine-print">Bản phát triển sử dụng phí giao giả lập 30.000đ/shop. Chưa tạo vận đơn hoặc thu tiền thật.</p></aside></div></section>;
}
