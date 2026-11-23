'use client';
import { FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Trash2, MapPin, Clock, Leaf, Sparkles, Gift, Split, Send, UserCheck, CheckCircle2, Award, ShieldCheck, Trees, Check, Truck, CheckCheck, Globe, HeartHandshake, Compass } from 'lucide-react';
import type { QuoteData } from '@mac/contracts';
import { api, Product, useResource, Variant, vnd } from '../api';
import { Empty, Loading, Notice } from '../ui';
type CartLine = { id: string; quantity: number; variant: Variant & { product: Product } };
type Address = { id: string; recipient: string; phone: string; line: string; province: string };
type Quote = { id: string; data: QuoteData; expiresAt: string };

const REFOREST_TIERS = {
  TIER1: {
    id: 'TIER1',
    name: 'Trung Hòa Carbon Cơ Bản',
    fee: 10000,
    co2: '2.0 kg CO2e',
    target: '01 Cây Mầm Đước Đôi',
    location: 'Rừng Ngập Mặn Cần Giờ (10.412°N 106.953°E)',
    points: 50,
  },
  TIER2: {
    id: 'TIER2',
    name: 'Sinh Thái Tích Cực (Positive Impact)',
    fee: 25000,
    co2: '5.0 kg CO2e',
    target: '02 Cây Bản Địa Dầu Rái / Thông',
    location: 'Rừng Nguyên Sinh Măng Đen Kon Tum (14.605°N 108.289°E)',
    points: 120,
  },
  TIER3: {
    id: 'TIER3',
    name: 'Bảo Tồn Rừng Già Thượng Nguồn',
    fee: 50000,
    co2: '12.0 kg CO2e',
    target: 'Bảo tồn 5m² rừng & 04 cây gỗ lớn',
    location: 'Vườn Quốc Gia Cát Tiên Đồng Nai (11.425°N 107.428°E)',
    points: 250,
  },
} as const;

export default function Cart() {
  const cart = useResource<CartLine[]>('/cart'), addresses = useResource<Address[]>('/addresses');
  const [addressId, setAddressId] = useState(''), [quote, setQuote] = useState<Quote | null>(null), [codes, setCodes] = useState<Record<string, string>>({}), [tradeInCode, setTradeInCode] = useState(''), [useFreeship, setUseFreeship] = useState(true), [useCoins, setUseCoins] = useState(false), [deliverySlot, setDeliverySlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('AFTERNOON'), [ecoPackaging, setEcoPackaging] = useState(true), [giftWrap, setGiftWrap] = useState(false), [giftRibbon, setGiftRibbon] = useState<'CHAMPAGNE' | 'EMERALD' | 'NAVY'>('CHAMPAGNE'), [giftMessage, setGiftMessage] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false), [newAddress, setNewAddress] = useState(false), [paymentMethod, setPaymentMethod] = useState<'COD' | 'BNPL'>('COD');
  const [splitDelivery, setSplitDelivery] = useState(false);
  const [itemDestinations, setItemDestinations] = useState<Record<string, 'HOME' | 'OFFICE_GIFT'>>({});
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftRecipientPhone, setGiftRecipientPhone] = useState('');
  const [giftRecipientAddress, setGiftRecipientAddress] = useState('');
  const [carbonPledge, setCarbonPledge] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_green_shopper_pledge') === 'true';
    }
    return false;
  });
  const [carbonOffsetActive, setCarbonOffsetActive] = useState(false);
  const [offsetCertCode, setOffsetCertCode] = useState('');
  // CART-DYNAMIC-CARBON-OFFSET-PLEDGE-01: Dynamic Micro-Reforestation Contribution & Live Carbon Offset Selector
  const [reforestPledgeActive, setReforestPledgeActive] = useState(true);
  const [reforestTier, setReforestTier] = useState<'TIER1' | 'TIER2' | 'TIER3'>('TIER2');
  const [reforestCertCode, setReforestCertCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_reforest_cert') || `TREE-VN-${Date.now().toString().slice(-6)}`;
    }
    return 'TREE-VN-88912';
  });
  const [consolidatedShipping, setConsolidatedShipping] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nexora_consolidated_shipping') !== 'false';
    }
    return true;
  });
  const [consolidationMode, setConsolidationMode] = useState<'SINGLE_DROP' | 'EXPEDITE_PARTIAL'>('SINGLE_DROP');
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
  return <section className="section"><p className="eyebrow">TỪ CẢM HỨNG ĐẾN TỦ ĐỒ</p><h1>Giỏ hàng của bạn.</h1><p className="subtle">Một lần đặt, theo dõi đơn và phí giao riêng từng shop.</p><div className="checkout-grid"><div>{[...groups].map(([shopId, lines]) => <section key={shopId} className="panel"><h2 className="panel-title">{lines[0].variant.product.shop.name}</h2>{lines.map(line => <div className="cart-line" key={line.id}><img src={line.variant.product.images[0]?.url} alt={line.variant.product.name} onError={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'; }}/><div className="grow"><Link href={`/san-pham/${line.variant.product.slug}`}><strong>{line.variant.product.name}</strong></Link><p>{line.variant.color} / Size {line.variant.size}</p><div className="row"><input aria-label={`Số lượng ${line.variant.product.name}`} className="qty-input" type="number" min={1} max={20} value={line.quantity} onChange={e => { const value = Number(e.target.value); if (Number.isInteger(value) && value > 0 && value <= 20) void changeLine(line.id, value); }}/><button className="icon-link" aria-label={`Xóa ${line.variant.product.name}`} onClick={() => changeLine(line.id)}><Trash2 size={16}/></button></div></div><strong>{vnd(line.variant.price * line.quantity)}</strong></div>)}<label className="voucher">Mã giảm của shop<input value={codes[shopId] ?? ''} onChange={e => { setCodes({ ...codes, [shopId]: e.target.value }); invalidate(); }} placeholder={shopId === 'shop-nep' ? 'Thử CHAO50 cho đơn từ 400.000đ' : 'Nhập mã nếu có'}/></label></section>)}
      <section className="panel"><h2 className="panel-title"><MapPin size={18}/>Giao đến</h2>{addresses.error && <Notice error>{addresses.error}</Notice>}{addresses.data?.map(a => <label className="address-option" key={a.id}><input type="radio" name="address" checked={chosenAddress === a.id} onChange={() => { setAddressId(a.id); invalidate(); }}/><span><strong>{a.recipient} · {a.phone}</strong><br/>{a.line}, {a.province}</span></label>)}<button className="text-button" onClick={() => setNewAddress(!newAddress)}>{newAddress ? 'Đóng' : '+ Thêm địa chỉ'}</button>{newAddress && <form onSubmit={addAddress} className="form"><label>Người nhận<input name="recipient" required minLength={2}/></label><label>Số điện thoại<input name="phone" required pattern="0[0-9]{9}" inputMode="tel"/></label><label>Địa chỉ cụ thể<input name="line" required minLength={5}/></label><label>Tỉnh / thành phố<input name="province" required minLength={2}/></label><button className="button" disabled={busy}>Lưu địa chỉ</button></form>}</section>

      {/* Phân Tách Địa Chỉ Giao Nhiều Điểm & Tặng Quà */}
      <section className="panel" style={{ background: splitDelivery ? '#fefce8' : undefined, border: splitDelivery ? '1px solid #fef08a' : undefined }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Split size={18} color={splitDelivery ? '#b45309' : undefined} /> Giao Nhiều Địa Chỉ Riêng Biệt
          </h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={splitDelivery}
              onChange={(e) => {
                setSplitDelivery(e.target.checked);
                invalidate();
              }}
              style={{ accentColor: 'var(--gold-dark)' }}
            />
            Bật phân tách địa chỉ
          </label>
        </div>
        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Tách đơn hàng thành nhiều kiện gửi đến các địa chỉ khác nhau (VD: Giao áo sơ mi về văn phòng công ty, đầm quà tặng gửi trực tiếp đến bạn bè).
        </p>

        {splitDelivery && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #fde047' }}>
            <h3 style={{ fontSize: 13, color: '#854d0e', margin: '0 0 8px' }}>Phân bổ điểm đến cho từng món đồ:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {cart.data?.map((line) => (
                <div key={line.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#fff', borderRadius: 4, border: '1px solid #fef08a', fontSize: 12 }}>
                  <div style={{ maxWidth: '60%' }}>
                    <strong>{line.variant.product.name}</strong>
                    <span className="subtle" style={{ display: 'block', fontSize: 11 }}>Size {line.variant.size} · SL: {line.quantity}</span>
                  </div>
                  <select
                    value={itemDestinations[line.id] ?? 'HOME'}
                    onChange={(e) => setItemDestinations({ ...itemDestinations, [line.id]: e.target.value as any })}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 3, border: '1px solid #ca8a04' }}
                  >
                    <option value="HOME">Điểm 1: Địa chỉ mặc định</option>
                    <option value="OFFICE_GIFT">Điểm 2: Quà tặng / Văn phòng</option>
                  </select>
                </div>
              ))}
            </div>

            <div style={{ padding: 12, background: '#fff', borderRadius: 6, border: '1px solid #fde047' }}>
              <strong style={{ fontSize: 12, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Send size={14} /> Thông Tin Điểm Đến Thứ 2 (Quà Tặng / Văn Phòng):
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                <input
                  placeholder="Họ tên người nhận quà"
                  value={giftRecipientName}
                  onChange={(e) => setGiftRecipientName(e.target.value)}
                  style={{ fontSize: 12, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <input
                  placeholder="Số điện thoại người nhận"
                  value={giftRecipientPhone}
                  onChange={(e) => setGiftRecipientPhone(e.target.value)}
                  style={{ fontSize: 12, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
                <input
                  placeholder="Địa chỉ cụ thể (Số nhà, đường, quận...)"
                  value={giftRecipientAddress}
                  onChange={(e) => setGiftRecipientAddress(e.target.value)}
                  style={{ fontSize: 12, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 3 }}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Tuyến Gom Hàng Giao Ghép Đa Gian Hàng */}
      <section className="panel" style={{ background: consolidatedShipping ? '#f0fdf4' : undefined, border: consolidatedShipping ? '1.5px solid #86efac' : undefined }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Truck size={18} color={consolidatedShipping ? '#15803d' : undefined} />
            Tuyến Gom Hàng Giao Ghép Đa Gian Hàng
          </h2>
          <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            {groups.size > 1 ? `GOM TUYẾN ${groups.size} SHOP` : 'ĐƠN HÀNG XANH'} · VINFAST EV
          </span>
        </div>
        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Thuật toán định tuyến thông minh: Tự động gom các kiện hàng từ <strong>{groups.size} xưởng thời trang</strong> về trạm Micro-Hub trung tâm trước khi điều phối bưu tá xe điện giao tận cửa, tránh lãng phí nhiều cuốc xe và tiết kiệm cước vận chuyển.
        </p>

        <label className="address-option" style={{ background: '#fff', border: consolidatedShipping ? '1.5px solid #16a34a' : '1px solid var(--line)', marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={consolidatedShipping}
            onChange={(e) => {
              setConsolidatedShipping(e.target.checked);
              try {
                localStorage.setItem('nexora_consolidated_shipping', String(e.target.checked));
              } catch {}
              invalidate();
            }}
            style={{ accentColor: '#16a34a' }}
          />
          <span>
            <strong style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCheck size={16} /> Bật chế độ Gom Tuyến Giao Ghép Xe Điện
              <span style={{ fontSize: 10, background: '#16a34a', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                TIẾT KIỆM 35.000₫ &amp; −0.38kg CO2e
              </span>
            </strong>
            <br />
            <small className="subtle">
              Các gói hàng từ {[...groups.values()].map(g => g[0]?.variant?.product?.shop?.name).filter(Boolean).join(', ')} sẽ được ghép chung 1 lộ trình giao bưu tá VinFast Feliz.
            </small>
          </span>
        </label>

        {consolidatedShipping && (
          <div style={{ padding: 12, background: '#fff', borderRadius: 6, border: '1px dashed #86efac' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 8 }}>
              Chọn phương thức gom chuyến bưu tá:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => setConsolidationMode('SINGLE_DROP')}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: 'pointer',
                  border: consolidationMode === 'SINGLE_DROP' ? '1.5px solid #16a34a' : '1px solid var(--line)',
                  background: consolidationMode === 'SINGLE_DROP' ? '#ecfdf5' : '#fafafa',
                  color: consolidationMode === 'SINGLE_DROP' ? '#15803d' : 'var(--ink)',
                  fontWeight: consolidationMode === 'SINGLE_DROP' ? 700 : 500,
                }}
              >
                <div>✓ 1. Giao gộp 1 lần duy nhất (Single Eco Drop)</div>
                <small style={{ color: '#64748b', display: 'block', marginTop: 2 }}>
                  Bưu tá giao cùng lúc tất cả món đồ khi tập kết đủ tại Hub. Thưởng +100 Điểm Xanh.
                </small>
              </button>

              <button
                type="button"
                onClick={() => setConsolidationMode('EXPEDITE_PARTIAL')}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  cursor: 'pointer',
                  border: consolidationMode === 'EXPEDITE_PARTIAL' ? '1.5px solid #ca8a04' : '1px solid var(--line)',
                  background: consolidationMode === 'EXPEDITE_PARTIAL' ? '#fefce8' : '#fafafa',
                  color: consolidationMode === 'EXPEDITE_PARTIAL' ? '#854d0e' : 'var(--ink)',
                  fontWeight: consolidationMode === 'EXPEDITE_PARTIAL' ? 700 : 500,
                }}
              >
                <div>⚡ 2. Giao tách lẻ theo tiến độ (Expedite Partial)</div>
                <small style={{ color: '#64748b', display: 'block', marginTop: 2 }}>
                  Shop nào chuẩn bị xong trước sẽ phát hàng trước cho khách cần gấp.
                </small>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#15803d', borderTop: '1px solid #dcfce7', paddingTop: 8 }}>
              <span>Trạm gom tập kết: <strong>Micro-Hub Bến Nghé (Quận 1)</strong></span>
              <span>Giảm thiểu: <strong>−0.38 kg CO2e</strong></span>
            </div>
          </div>
        )}
      </section>
      <section className="panel">
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} /> Khung Giờ Giao Hàng &amp; Đóng Gói Xanh
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

      {/* Cam Kết Tiêu Dùng Xanh & Giao Hàng Không Rác Thải Nhựa */}
      <section className="panel" style={{ background: carbonPledge ? '#f0fdf4' : undefined, border: carbonPledge ? '1px solid #86efac' : undefined }}>
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Leaf size={18} color="#16a34a" /> Cam Kết Tiêu Dùng Bền Vững &amp; Giao Không Nhựa
        </h2>
        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Đồng hành cùng NEXORA trong sứ mệnh thời trang sinh thái, bảo vệ thiên nhiên và loại bỏ hoàn toàn rác thải nhựa một lần.
        </p>

        <label className="address-option" style={{ background: carbonPledge ? '#dcfce7' : '#f8fafc', border: carbonPledge ? '1.5px solid #22c55e' : '1px solid #e2e8f0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={carbonPledge}
            onChange={e => {
              setCarbonPledge(e.target.checked);
              if (e.target.checked) {
                localStorage.setItem('nexora_green_shopper_pledge', 'true');
              } else {
                localStorage.removeItem('nexora_green_shopper_pledge');
              }
            }}
          />
          <span>
            <strong style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🌿 Ký Cam Kết Tiêu Dùng Sinh Thái &amp; Giao Hàng Xanh
              <span style={{ fontSize: 10, background: '#16a34a', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                +100 ĐIỂM XANH
              </span>
            </strong>
            <br />
            <small style={{ color: '#166534', fontSize: 12 }}>
              Đồng ý 3 nguyên tắc vận hành bền vững của NEXORA cho đơn hàng này:
            </small>
          </span>
        </label>

        {carbonPledge && (
          <div style={{ marginTop: 12, padding: 12, background: '#ffffff', borderRadius: 4, border: '1px solid #bbf7d0', fontSize: 12 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#14532d' }}>1. Vận chuyển gom tuyến (Consolidated Route):</strong>
                  <div style={{ color: '#334155', marginTop: 1 }}>
                    Bưu tá xe điện VinFast ưu tiên tối ưu cung đường giao ghép để giảm 35% phát thải khí nhà kính (CO2e).
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#14532d' }}>2. 100% Không túi nilon bóng khí (Zero Bubble-wrap):</strong>
                  <div style={{ color: '#334155', marginTop: 1 }}>
                    Toàn bộ trang phục được bảo vệ bằng đệm giấy tổ ong Kraft tái chế, dây thừng đay tự nhiên và tem niêm phong sáp sinh học.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: '#14532d' }}>3. Thu hồi bao bì tuần hoàn:</strong>
                  <div style={{ color: '#334155', marginTop: 1 }}>
                    Sẵn sàng hoàn trả hộp carton hoặc túi giấy bảo quản cho shipper NEXORA trong lần giao nhận tiếp theo.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Award size={14} /> Kích hoạt danh hiệu: <strong>🌿 Green Shopper Pioneer</strong>
              </span>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#14532d', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                Đã ghi nhận vào hồ sơ cá nhân
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Bộ Đo Giảm Phát Thải Tuyến Vận Chuyển & Đóng Góp Rừng Ngập Mặn */}
      <section className="panel" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Trees size={18} color="#059669" /> Tuyến Giao Hàng Xanh &amp; Trung Hòa Carbon
          </h2>
          <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            CARBON NEUTRAL ROUTE
          </span>
        </div>

        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Phân tích lượng khí thải nhà kính giảm được nhờ tối ưu hóa logistics xe điện VinFast Feliz và đệm giấy tổ ong không nilon.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
          <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }}>
            <span style={{ color: '#64748b', display: 'block' }}>Xe Điện VinFast Feliz</span>
            <strong style={{ color: '#047857', fontSize: 12 }}>-0.45 kg CO2e</strong>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>So với xe xăng truyền thống</div>
          </div>

          <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }}>
            <span style={{ color: '#64748b', display: 'block' }}>Đóng Gói Không Nilon</span>
            <strong style={{ color: '#047857', fontSize: 12 }}>-0.12 kg CO2e</strong>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>Giấy tổ ong tự hủy sinh học</div>
          </div>

          <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', fontSize: 11 }}>
            <span style={{ color: '#64748b', display: 'block' }}>Dấu Chân Carbon Ròng</span>
            <strong style={{ color: '#0f172a', fontSize: 12 }}>0.08 kg CO2e</strong>
            <div style={{ fontSize: 9, color: '#94a3b8' }}>Lượng phát thải tối thiểu còn lại</div>
          </div>
        </div>

        {carbonOffsetActive ? (
          <div style={{ padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 4, fontSize: 12 }}>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span style={{ color: '#065f46', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} /> Đã Bù Đắp 100% Phát Thải (Mã Chứng Thư: #{offsetCertCode})
              </span>
              <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                100% NET-ZERO
              </span>
            </div>
            <p style={{ margin: 0, color: '#047857', fontSize: 11 }}>
              Đơn hàng này được trích từ Quỹ NEXORA Green Fund bảo trợ 01 mầm cây Đước tại Rừng phòng hộ Cần Giờ, trung hòa hoàn toàn 0.08 kg CO2e còn lại.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const code = `NETZERO-${Date.now().toString().slice(-6)}`;
              setOffsetCertCode(code);
              setCarbonOffsetActive(true);
              try {
                localStorage.setItem('nexora_order_carbon_offset', JSON.stringify({
                  code,
                  reduced: '0.57 kg CO2e',
                  offset: '0.08 kg CO2e',
                  location: 'Rừng phòng hộ Cần Giờ',
                }));
              } catch {}
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#047857',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Trees size={14} /> Bù Đắp 100% Carbon Ròng (Tài Trợ Trồng Rừng Cần Giờ · 0đ)
          </button>
        )}
      </section>

      {/* Đóng Góp Trồng Rừng Tự Nhiên & Bù Trừ Carbon Động Theo Giỏ Hàng */}
      <section className="panel" style={{ background: reforestPledgeActive ? '#f0fdf4' : '#fff', border: reforestPledgeActive ? '1px solid #86efac' : '1px solid var(--line)' }}>
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Globe size={18} color="#059669" /> Đóng Góp Trồng Rừng Tự Nhiên &amp; Bù Trừ Carbon
          </h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#047857' }}>
            <input
              type="checkbox"
              checked={reforestPledgeActive}
              onChange={e => {
                setReforestPledgeActive(e.target.checked);
                invalidate();
              }}
              style={{ accentColor: '#059669' }}
            />
            Tham gia chương trình Trồng Rừng Sinh Thái
          </label>
        </div>

        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Lượng phát thải tính toán cho giỏ hàng hiện tại: <strong style={{ color: '#0f172a' }}>~1.85 kg CO2e</strong> (Bao gồm chế tác sợi tự nhiên và vận chuyển đa chặng). Bạn có thể lựa chọn mức bảo trợ rừng tương ứng để chung tay cùng NEXORA phủ xanh Việt Nam:
        </p>

        {reforestPledgeActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {(Object.keys(REFOREST_TIERS) as Array<keyof typeof REFOREST_TIERS>).map(tierKey => {
                const item = REFOREST_TIERS[tierKey];
                const selected = reforestTier === tierKey;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setReforestTier(tierKey);
                      invalidate();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 6,
                      border: selected ? '2px solid #059669' : '1px solid #cbd5e1',
                      background: selected ? '#ecfdf5' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease-in-out',
                    }}
                  >
                    <div>
                      <div className="row between" style={{ marginBottom: 4 }}>
                        <strong style={{ fontSize: 13, color: selected ? '#065f46' : 'var(--ink)' }}>
                          {item.name}
                        </strong>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#047857' }}>
                          +{vnd(item.fee)}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginBottom: 4 }}>
                        🌳 {item.target} (Bù trừ {item.co2})
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>
                        📍 {item.location}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>
                        +{item.points} Điểm Xanh NEX-Green
                      </span>
                      {selected && <CheckCircle2 size={14} color="#059669" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '8px 12px', background: '#fff', border: '1px solid #bbf7d0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
              <span style={{ color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={14} /> Mã Cam Kết Bảo Trợ Rừng: <strong>#{reforestCertCode}</strong>
              </span>
              <span style={{ color: '#64748b' }}>
                Hợp tác cùng Ban Quản Lý Rừng Phòng Hộ &amp; Vườn Quốc Gia · Kiểm toán minh bạch GPS
              </span>
            </div>
          </div>
        )}
      </section>
      <section className="panel">
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} /> Hộp Quà Tặng Cao Cấp &amp; Thiệp Sáp Niêm Phong
        </h2>
        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Đặc quyền dành riêng cho các dịp kỷ niệm hoặc quà tặng tinh tế với quy chuẩn đóng gói Haute Couture.
        </p>
        <label className="address-option" style={{ background: giftWrap ? 'rgba(217, 119, 6, 0.05)' : undefined, border: giftWrap ? '1px solid #d97706' : undefined, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={giftWrap}
            onChange={e => {
              setGiftWrap(e.target.checked);
              if (e.target.checked) {
                localStorage.setItem('nexora_gift_wrap', JSON.stringify({ ribbon: giftRibbon, message: giftMessage }));
              } else {
                localStorage.removeItem('nexora_gift_wrap');
              }
            }}
          />
          <span>
            <strong style={{ color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Gift size={15} /> Đóng gói Hộp Quà Nhung &amp; Thiệp Viết Tay Sáp Đồng
              <span style={{ fontSize: 10, background: '#d97706', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>
                +60.000đ (0đ khi đơn &gt; 2 triệu)
              </span>
            </strong>
            <br />
            <small className="subtle">
              Hộp cứng nắp gập phủ vải nhung xám khói, thắt nơ ruy băng lụa dệt và thiệp chúc mừng viết tay Calligraphy niêm phong dấu sáp đồng độc bản.
            </small>
          </span>
        </label>
        {giftWrap && (
          <div style={{ padding: 14, background: '#fdfbf7', border: '1px dashed #d97706', borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                1. Chọn màu ruy băng lụa dệt thủ công:
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { id: 'CHAMPAGNE', label: 'Vàng Champagne Ánh Kim', color: '#d97706', bg: '#fef3c7' },
                  { id: 'EMERALD', label: 'Xanh Ngọc Lục Bảo', color: '#047857', bg: '#d1fae5' },
                  { id: 'NAVY', label: 'Xanh Navy Hoàng Gia', color: '#1d4ed8', bg: '#dbeafe' },
                ].map(rb => (
                  <button
                    key={rb.id}
                    type="button"
                    onClick={() => {
                      setGiftRibbon(rb.id as any);
                      localStorage.setItem('nexora_gift_wrap', JSON.stringify({ ribbon: rb.id, message: giftMessage }));
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 3,
                      fontSize: 12,
                      cursor: 'pointer',
                      border: giftRibbon === rb.id ? `2px solid ${rb.color}` : '1px solid var(--line)',
                      background: giftRibbon === rb.id ? rb.bg : '#fff',
                      color: giftRibbon === rb.id ? rb.color : 'var(--ink)',
                      fontWeight: giftRibbon === rb.id ? 700 : 500,
                    }}
                  >
                    ● {rb.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                2. Lời chúc viết tay trên thiệp giấy mỹ thuật (Tối đa 120 ký tự):
              </span>
              <textarea
                value={giftMessage}
                maxLength={120}
                rows={2}
                placeholder="VD: Chúc mừng sinh nhật Minh Anh! Chúc em luôn rạng rỡ và hạnh phúc trong từng khoảnh khắc..."
                onChange={e => {
                  setGiftMessage(e.target.value);
                  localStorage.setItem('nexora_gift_wrap', JSON.stringify({ ribbon: giftRibbon, message: e.target.value }));
                }}
                style={{
                  width: '100%',
                  padding: 8,
                  fontSize: 12,
                  fontFamily: 'inherit',
                  border: '1px solid var(--line)',
                  borderRadius: 2,
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                <span>Niêm phong bằng sáp nóng khắc biểu tượng thương hiệu NEXORA</span>
                <span>{giftMessage.length}/120 ký tự</span>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="panel"><h2 className="panel-title">Ưu Đãi Đa Tầng NEXORA</h2><label className="address-option" style={{ marginBottom: 10 }}><input type="checkbox" checked={useFreeship} onChange={e => { setUseFreeship(e.target.checked); invalidate(); }} /><span><strong>Voucher Miễn Phí Vận Chuyển Freeship Xtra (Tầng 3)</strong><br/><small className="subtle">Tài trợ giảm trực tiếp 30.000đ phí giao hàng trên toàn sàn.</small></span></label><label className="address-option"><input type="checkbox" checked={useCoins} onChange={e => { setUseCoins(e.target.checked); invalidate(); }} /><span><strong>Dùng Xu Thưởng NEXORA Coins (Tầng 5)</strong><br/><small className="subtle">Đang có: 25.000 xu khả dụng. Cấn trừ trực tiếp 25.000đ (1 xu = 1đ).</small></span></label></section>
      <section className="panel"><h2 className="panel-title">Voucher Trade-In NEXORA (Tầng 2)</h2><label className="voucher">Mã đối ứng từ Thu cũ Đổi mới (NXTI-...)<input value={tradeInCode} onChange={e => { setTradeInCode(e.target.value); invalidate(); }} placeholder="VD: NXTI-DEMO50"/></label></section>
      <section className="panel"><h2 className="panel-title">Phương thức thanh toán</h2><label className="address-option"><input type="radio" name="paymentMethod" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')}/><span><strong>Thanh toán khi nhận hàng (COD)</strong><br/><small className="subtle">Nhận hàng, kiểm tra ngoại quan và thanh toán cho shipper.</small></span></label><label className="address-option" style={{ marginTop: 8 }}><input type="radio" name="paymentMethod" checked={paymentMethod === 'BNPL'} onChange={() => setPaymentMethod('BNPL')}/><span><strong>Mua trước Trả sau (NEXORA PayLater · 0% Lãi suất)</strong><br/><small className="subtle">Chia đều 3 kỳ thanh toán 0% lãi suất và không phụ phí (PAY-BNPL-MIDFLOW-05).</small></span></label>{paymentMethod === 'BNPL' && quote && <div style={{ marginTop: 12, padding: 12, background: 'var(--sage)', borderRadius: 2, fontSize: 12 }}><strong>Kế hoạch trả góp 3 kỳ (0% lãi suất):</strong><div className="row between" style={{ marginTop: 6 }}><span>Kỳ 1 (Hôm nay lúc giao dịch):</span><strong>{vnd(Math.round(quote.data.total / 3))}</strong></div><div className="row between"><span>Kỳ 2 (Sau 30 ngày):</span><strong>{vnd(Math.round(quote.data.total / 3))}</strong></div><div className="row between"><span>Kỳ 3 (Sau 60 ngày):</span><strong>{vnd(quote.data.total - 2 * Math.round(quote.data.total / 3))}</strong></div><p className="fine-print" style={{ margin: '8px 0 0' }}>Bảo lãnh tín dụng tiêu dùng số bởi NEXORA PayLater.</p></div>}</section></div>
      <aside className="panel checkout-summary"><p className="eyebrow">KIỂM TRA TRƯỚC KHI ĐẶT</p><h2>Tổng đơn hàng</h2>{quote ? (() => {
        const reforestCost = reforestPledgeActive ? REFOREST_TIERS[reforestTier].fee : 0;
        const finalAmount = quote.data.total + reforestCost;
        return (
          <>
            {quote.data.shops.map(shop => (
              <div className="quote-shop" key={shop.shopId}>
                <strong>{shop.shopName}</strong>
                <p><span>Tiền hàng</span><span>{vnd(shop.subtotal)}</span></p>
                <p><span>Giảm giá</span><span>−{vnd(shop.discount)}</span></p>
                <p><span>Phí giao mô phỏng</span><span>{vnd(shop.shipping)}</span></p>
                <p><strong>Thanh toán cho shop</strong><strong>{vnd(shop.total)}</strong></p>
              </div>
            ))}
            {(quote.data.platformDiscount ?? 0) > 0 && (
              <div className="quote-shop">
                <p><span>Voucher Sàn / Trade-In ({quote.data.tradeInCode})</span><span>−{vnd(quote.data.platformDiscount ?? 0)}</span></p>
              </div>
            )}
            {(quote.data.shippingDiscount ?? 0) > 0 && (
              <div className="quote-shop">
                <p><span>Voucher Freeship Xtra (Tầng 3)</span><span>−{vnd(quote.data.shippingDiscount ?? 0)}</span></p>
              </div>
            )}
            {(quote.data.coinDiscount ?? 0) > 0 && (
              <div className="quote-shop">
                <p><span>Xu Thưởng NEXORA Coins (Tầng 5)</span><span>−{vnd(quote.data.coinDiscount ?? 0)}</span></p>
              </div>
            )}
            {reforestCost > 0 && (
              <div className="quote-shop" style={{ borderLeft: '3px solid #059669', paddingLeft: 8, background: '#f0fdf4' }}>
                <p style={{ margin: 0 }}>
                  <span style={{ color: '#065f46', fontWeight: 600 }}>Bảo trợ trồng rừng ({REFOREST_TIERS[reforestTier].name})</span>
                  <span style={{ color: '#047857', fontWeight: 700 }}>+{vnd(reforestCost)}</span>
                </p>
              </div>
            )}
            <div className="total">
              <span>Tổng thanh toán ({paymentMethod === 'BNPL' ? 'PayLater 0%' : 'COD'})</span>
              <strong>{vnd(finalAmount)}</strong>
            </div>
            <p className="subtle">Báo giá có hiệu lực đến {new Date(quote.expiresAt).toLocaleTimeString('vi-VN')}.</p>
            <button className="button full" disabled={busy} onClick={order}>
              {busy ? 'Đang đặt…' : paymentMethod === 'BNPL' ? `Xác nhận đặt PayLater (Kỳ 1: ${vnd(Math.round(finalAmount / 3))})` : 'Xác nhận đặt COD'}
              <ArrowRight size={18}/>
            </button>
            <button className="text-button" onClick={getQuote} disabled={busy}>Tính lại báo giá</button>
          </>
        );
      })() : <><p>Kiểm tra địa chỉ và mã giảm để lấy tổng chính xác cho từng shop.</p><button className="button full" disabled={busy || !chosenAddress} onClick={getQuote}>{busy ? 'Đang tính…' : 'Xem báo giá'}<ArrowRight size={18}/></button></>}{error && <Notice error>{error}</Notice>}<p className="fine-print">Bản phát triển sử dụng phí giao giả lập 30.000đ/shop. Chưa tạo vận đơn hoặc thu tiền thật.</p></aside></div></section>;
}
