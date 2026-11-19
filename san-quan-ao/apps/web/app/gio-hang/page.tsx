'use client';
import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Trash2, MapPin, Clock, Leaf } from 'lucide-react';
import type { QuoteData } from '@mac/contracts';
import { api, Product, useResource, Variant, vnd } from '../api';
import { Empty, Loading, Notice } from '../ui';
type CartLine = { id: string; quantity: number; variant: Variant & { product: Product } };
type Address = { id: string; recipient: string; phone: string; line: string; province: string };
type Quote = { id: string; data: QuoteData; expiresAt: string };
export default function Cart() {
  const cart = useResource<CartLine[]>('/cart'), addresses = useResource<Address[]>('/addresses');
  const [addressId, setAddressId] = useState(''), [quote, setQuote] = useState<Quote | null>(null), [codes, setCodes] = useState<Record<string, string>>({}), [tradeInCode, setTradeInCode] = useState(''), [useFreeship, setUseFreeship] = useState(true), [useCoins, setUseCoins] = useState(false), [deliverySlot, setDeliverySlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('AFTERNOON'), [ecoPackaging, setEcoPackaging] = useState(true), [error, setError] = useState(''), [busy, setBusy] = useState(false), [newAddress, setNewAddress] = useState(false), [paymentMethod, setPaymentMethod] = useState<'COD' | 'BNPL'>('COD');
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
    try { const trimmedTi = tradeInCode.trim().toUpperCase(); const vouchersPayload: Record<string, string> = {
        ...Object.fromEntries(Object.entries(codes).filter(([, code]) => code.trim()).map(([shop, code]) => [shop, code.trim().toUpperCase()])),
        ...(useFreeship ? { _freeship: 'FREESHIP30' } : {}),
        ...(useCoins ? { _coins: '25000' } : {}),
        ...(trimmedTi ? { _tradeIn: trimmedTi } : {}),
      };
      const q = await api<Quote>('/checkout/quote', 'POST', {
        addressId: chosenAddress,
        vouchers: vouchersPayload,
        deliverySlot,
        ecoPackaging,
        ...(trimmedTi ? { tradeInCode: trimmedTi } : {}),
      }); setQuote(q); key.current = crypto.randomUUID(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function order() {
    if (!quote) return; setBusy(true); setError('');
    try { const ref = localStorage.getItem('nexora_ref'); await api('/orders', 'POST', { quoteId: quote.id, idempotencyKey: key.current, paymentMethod, ...(ref ? { refUserId: ref } : {}) }); localStorage.removeItem('nexora_ref'); router.push('/don-hang'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (cart.loading) return <Loading/>;
  if (cart.error) return <section className="section"><Notice error>{cart.error}</Notice><Link className="button" href="/dang-nhap">Đăng nhập</Link></section>;
  if (!cart.data?.length) return <Empty title="Giỏ đồ đang chờ bạn." detail="Chọn một món hợp mình để bắt đầu nhé."/>;
  return <section className="section"><p className="eyebrow">TỪ CẢM HỨNG ĐẾN TỦ ĐỒ</p><h1>Giỏ hàng của bạn.</h1><p className="subtle">Một lần đặt, theo dõi đơn và phí giao riêng từng shop.</p><div className="checkout-grid"><div>{[...groups].map(([shopId, lines]) => <section key={shopId} className="panel"><h2 className="panel-title">{lines[0].variant.product.shop.name}</h2>{lines.map(line => <div className="cart-line" key={line.id}><img src={line.variant.product.images[0]?.url} alt={line.variant.product.name} onError={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg'; }}/><div className="grow"><Link href={`/san-pham/${line.variant.product.slug}`}><strong>{line.variant.product.name}</strong></Link><p>{line.variant.color} / Size {line.variant.size}</p><div className="row"><input aria-label={`Số lượng ${line.variant.product.name}`} className="qty-input" type="number" min={1} max={20} value={line.quantity} onChange={e => { const value = Number(e.target.value); if (Number.isInteger(value) && value > 0 && value <= 20) void changeLine(line.id, value); }}/><button className="icon-link" aria-label={`Xóa ${line.variant.product.name}`} onClick={() => changeLine(line.id)}><Trash2 size={16}/></button></div></div><strong>{vnd(line.variant.price * line.quantity)}</strong></div>)}<label className="voucher">Mã giảm của shop<input value={codes[shopId] ?? ''} onChange={e => { setCodes({ ...codes, [shopId]: e.target.value }); invalidate(); }} placeholder={shopId === 'shop-nep' ? 'Thử CHAO50 cho đơn từ 400.000đ' : 'Nhập mã nếu có'}/></label></section>)}
      <section className="panel"><h2 className="panel-title"><MapPin size={18}/>Giao đến</h2>{addresses.error && <Notice error>{addresses.error}</Notice>}{addresses.data?.map(a => <label className="address-option" key={a.id}><input type="radio" name="address" checked={chosenAddress === a.id} onChange={() => { setAddressId(a.id); invalidate(); }}/><span><strong>{a.recipient} · {a.phone}</strong><br/>{a.line}, {a.province}</span></label>)}<button className="text-button" onClick={() => setNewAddress(!newAddress)}>{newAddress ? 'Đóng' : '+ Thêm địa chỉ'}</button>{newAddress && <form onSubmit={addAddress} className="form"><label>Người nhận<input name="recipient" required minLength={2}/></label><label>Số điện thoại<input name="phone" required pattern="0[0-9]{9}" inputMode="tel"/></label><label>Địa chỉ cụ thể<input name="line" required minLength={5}/></label><label>Tỉnh / thành phố<input name="province" required minLength={2}/></label><button className="button" disabled={busy}>Lưu địa chỉ</button></form>}</section>
      <section className="panel">
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} /> Khung Giờ Giao Hàng &amp; Đóng Gói Xanh (FUL-GREEN-SLOT)
        </h2>
        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Lựa chọn khung giờ bưu tá giao hàng phù hợp với lịch sinh hoạt và đóng gói thân thiện môi trường.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'MORNING', label: 'Buổi sáng · 08:00 - 12:00', desc: 'Giao trong buổi sáng, phù hợp nhận tại nơi làm việc hoặc công ty.' },
            { id: 'AFTERNOON', label: 'Buổi chiều · 13:30 - 17:30', desc: 'Khung giờ hành chính tiêu chuẩn, bưu tá liên hệ trước khi đến.' },
            { id: 'EVENING', label: 'Buổi tối · 18:00 - 21:00 (Ngoài giờ)', desc: 'Giao tận cửa nhà sau giờ tan tầm, không lo vắng mặt.' },
          ].map(slot => (
            <label key={slot.id} className="address-option" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="deliverySlot"
                checked={deliverySlot === slot.id}
                onChange={() => { setDeliverySlot(slot.id as any); invalidate(); }}
              />
              <span>
                <strong>{slot.label}</strong>
                <br />
                <small className="subtle">{slot.desc}</small>
              </span>
            </label>
          ))}
        </div>
        <label className="address-option" style={{ background: ecoPackaging ? 'rgba(5, 150, 105, 0.05)' : undefined, border: ecoPackaging ? '1px solid #059669' : undefined }}>
          <input
            type="checkbox"
            checked={ecoPackaging}
            onChange={e => { setEcoPackaging(e.target.checked); invalidate(); }}
          />
          <span>
            <strong style={{ color: '#047857', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🌱 Hộp Giấy Kraft Tự Hủy Eco Green Box (Không nilon)
              <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                +50 XU
              </span>
            </strong>
            <br />
            <small className="subtle">
              Sử dụng 100% vật liệu giấy tổ ong tái sinh tự phân hủy sinh học, tặng ngay +50 Xu NEXORA Coins vào ví sau khi nhận hàng.
            </small>
          </span>
        </label>
      </section>
      <section className="panel"><h2 className="panel-title">Ưu Đãi Đa Tầng NEXORA (CART-STACK-01)</h2><label className="address-option" style={{ marginBottom: 10 }}><input type="checkbox" checked={useFreeship} onChange={e => { setUseFreeship(e.target.checked); invalidate(); }} /><span><strong>Voucher Miễn Phí Vận Chuyển Freeship Xtra (Tầng 3)</strong><br/><small className="subtle">Tài trợ giảm trực tiếp 30.000đ phí giao hàng trên toàn sàn.</small></span></label><label className="address-option"><input type="checkbox" checked={useCoins} onChange={e => { setUseCoins(e.target.checked); invalidate(); }} /><span><strong>Dùng Xu Thưởng NEXORA Coins (Tầng 5)</strong><br/><small className="subtle">Đang có: 25.000 xu khả dụng. Cấn trừ trực tiếp 25.000đ (1 xu = 1đ).</small></span></label></section>
      <section className="panel"><h2 className="panel-title">Voucher Trade-In NEXORA (Tầng 2)</h2><label className="voucher">Mã đối ứng từ Thu cũ Đổi mới (NXTI-...)<input value={tradeInCode} onChange={e => { setTradeInCode(e.target.value); invalidate(); }} placeholder="VD: NXTI-DEMO50"/></label></section>
      <section className="panel"><h2 className="panel-title">Phương thức thanh toán</h2><label className="address-option"><input type="radio" name="paymentMethod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')}/><span><strong>Thanh toán khi nhận hàng (COD)</strong><br/><small className="subtle">Nhận hàng, kiểm tra ngoại quan (RET-COINSPECT) và thanh toán cho shipper.</small></span></label><label className="address-option" style={{ marginTop: 8 }}><input type="radio" name="paymentMethod" checked={paymentMethod === 'BNPL'} onChange={() => setPaymentMethod('BNPL')}/><span><strong>Mua trước Trả sau (NEXORA PayLater · 0% Lãi suất)</strong><br/><small className="subtle">Chia đều 3 kỳ thanh toán 0% lãi suất và không phụ phí (PAY-BNPL-MIDFLOW-05).</small></span></label>{paymentMethod === 'BNPL' && quote && <div style={{ marginTop: 12, padding: 12, background: 'var(--sage)', borderRadius: 2, fontSize: 12 }}><strong>Kế hoạch trả góp 3 kỳ (0% lãi suất):</strong><div className="row between" style={{ marginTop: 6 }}><span>Kỳ 1 (Hôm nay lúc giao dịch):</span><strong>{vnd(Math.round(quote.data.total / 3))}</strong></div><div className="row between"><span>Kỳ 2 (Sau 30 ngày):</span><strong>{vnd(Math.round(quote.data.total / 3))}</strong></div><div className="row between"><span>Kỳ 3 (Sau 60 ngày):</span><strong>{vnd(quote.data.total - 2 * Math.round(quote.data.total / 3))}</strong></div><p className="fine-print" style={{ margin: '8px 0 0' }}>Bảo lãnh tín dụng tiêu dùng số bởi NEXORA PayLater.</p></div>}</section></div>
      <aside className="panel checkout-summary"><p className="eyebrow">KIỂM TRA TRƯỚC KHI ĐẶT</p><h2>Tổng đơn hàng</h2>{quote ? <>{quote.data.shops.map(shop => <div className="quote-shop" key={shop.shopId}><strong>{shop.shopName}</strong><p><span>Tiền hàng</span><span>{vnd(shop.subtotal)}</span></p><p><span>Giảm giá</span><span>−{vnd(shop.discount)}</span></p><p><span>Phí giao mô phỏng</span><span>{vnd(shop.shipping)}</span></p><p><strong>Thanh toán cho shop</strong><strong>{vnd(shop.total)}</strong></p></div>)}{(quote.data.platformDiscount ?? 0) > 0 && <div className="quote-shop"><p><span>Voucher Sàn / Trade-In ({quote.data.tradeInCode})</span><span>−{vnd(quote.data.platformDiscount ?? 0)}</span></p></div>}{(quote.data.shippingDiscount ?? 0) > 0 && <div className="quote-shop"><p><span>Voucher Freeship Xtra (Tầng 3)</span><span>−{vnd(quote.data.shippingDiscount ?? 0)}</span></p></div>}{(quote.data.coinDiscount ?? 0) > 0 && <div className="quote-shop"><p><span>Xu Thưởng NEXORA Coins (Tầng 5)</span><span>−{vnd(quote.data.coinDiscount ?? 0)}</span></p></div>}<div className="total"><span>Tổng thanh toán ({paymentMethod === 'BNPL' ? 'PayLater 0%' : 'COD'})</span><strong>{vnd(quote.data.total)}</strong></div><p className="subtle">Báo giá có hiệu lực đến {new Date(quote.expiresAt).toLocaleTimeString('vi-VN')}.</p><button className="button full" disabled={busy} onClick={order}>{busy ? 'Đang đặt…' : paymentMethod === 'BNPL' ? `Xác nhận đặt PayLater (Kỳ 1: ${vnd(Math.round(quote.data.total / 3))})` : 'Xác nhận đặt COD'}<ArrowRight size={18}/></button><button className="text-button" onClick={getQuote} disabled={busy}>Tính lại báo giá</button></> : <><p>Kiểm tra địa chỉ và mã giảm để lấy tổng chính xác cho từng shop.</p><button className="button full" disabled={busy || !chosenAddress} onClick={getQuote}>{busy ? 'Đang tính…' : 'Xem báo giá'}<ArrowRight size={18}/></button></>}{error && <Notice error>{error}</Notice>}<p className="fine-print">Bản phát triển sử dụng phí giao giả lập 30.000đ/shop. Chưa tạo vận đơn hoặc thu tiền thật.</p></aside></div></section>;
}
