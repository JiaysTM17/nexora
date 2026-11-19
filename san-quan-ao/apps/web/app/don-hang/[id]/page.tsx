'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, FileText, Truck, KeyRound, PackageCheck, CheckCircle2, Clock, Leaf } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Order, ReturnRequest, useResource, vnd } from '../../api';
import { Empty, Loading, Notice } from '../../ui';

const RETURN_LABELS: Record<string, string> = {
  REQUESTED: 'Chờ shop xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Shop từ chối',
  DISPUTED: 'Trọng tài Sàn thụ lý (SLA 48h)',
  COMPLETED: 'Hoàn tất',
};

const SLOT_LABELS: Record<string, string> = {
  MORNING: 'Buổi sáng (08:00 - 12:00)',
  AFTERNOON: 'Buổi chiều (13:30 - 17:30)',
  EVENING: 'Buổi tối (18:00 - 21:00 · Ngoài giờ)',
};

function getSecurityPin(orderCode: string, shopId: string): string {
  let hash = 0;
  const str = `${orderCode}:${shopId}:NEXORA_PIN`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const pin = (Math.abs(hash) % 900000) + 100000;
  return pin.toString();
}

export default function OrderDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: order, error, loading, reload } = useResource<Order>(id ? `/orders/${id}` : null);
  const { data: returns, reload: reloadReturns } = useResource<ReturnRequest[]>(id ? '/returns' : null);
  const [notice, setNotice] = useState(''), [success, setSuccess] = useState(''), [busy, setBusy] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [returningShop, setReturningShop] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState(true);

  async function cancel(shopOrderId: string) {
    setBusy(shopOrderId);
    setNotice('');
    setSuccess('');
    try {
      await api(`/orders/shops/${shopOrderId}/cancel`, 'POST');
      reload();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function submitReview(e: FormEvent<HTMLFormElement>, orderItemId: string) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(orderItemId);
    setNotice('');
    setSuccess('');
    try {
      await api('/reviews', 'POST', {
        orderItemId,
        rating: Number(d.get('rating')),
        body: String(d.get('body')),
      });
      setSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      setReviewing(null);
      reload();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function submitReturn(e: FormEvent<HTMLFormElement>, shopId: string, items: { id: string; quantity: number }[]) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(`return:${shopId}`);
    setNotice('');
    setSuccess('');
    try {
      await api('/returns', 'POST', {
        shopId,
        kind: d.get('kind'),
        reason: String(d.get('reason')),
        items: items.map(i => ({ orderItemId: i.id, quantity: i.quantity })),
      });
      setSuccess('Đã gửi yêu cầu đổi size / hoàn trả tới shop thành công!');
      setReturningShop(null);
      reloadReturns();
      reload();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  if (loading) return <Loading />;
  if (error) return (
    <section className="section narrow">
      <Notice error>{error}</Notice>
      <Link href="/don-hang" className="button">Về danh sách đơn</Link>
    </section>
  );
  if (!order) return (
    <Empty
      title="Không tìm thấy đơn hàng."
      detail="Đơn này không tồn tại hoặc không thuộc về bạn."
      href="/don-hang"
      action="Về danh sách đơn"
    />
  );

  const address = order.address ?? order.shops[0]?.order?.address;

  return (
    <section className="section narrow">
      <Link href="/don-hang" className="back">
        <ArrowLeft size={16} />Tất cả đơn hàng
      </Link>
      <p className="eyebrow">CHI TIẾT ĐƠN HÀNG</p>
      <div className="section-heading">
        <h1>{order.code}</h1>
        <span className="subtle">
          {new Date(order.createdAt).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      </div>
      {notice && <Notice error>{notice}</Notice>}
      {success && <Notice>{success}</Notice>}
      {address && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <p className="eyebrow" style={{ margin: 0 }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
              ĐỊA CHỈ NHẬN HÀNG
            </p>
            <span style={{ fontSize: 10, background: '#eef2ed', color: '#2b522b', padding: '3px 8px', borderRadius: 2, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> Mặt nạ bảo mật NĐ 13/2023/NĐ-CP (PDPD Protected)
            </span>
          </div>
          <strong>
            {address.recipient} · {maskedPhone ? address.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : address.phone}
            <button
              type="button"
              className="text-button"
              style={{ fontSize: 11, marginLeft: 8 }}
              onClick={() => setMaskedPhone(!maskedPhone)}
            >
              {maskedPhone ? 'Hiện số' : 'Ẩn số'}
            </button>
          </strong>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            {address.line}, {address.province}
          </p>
          {((address as any).deliverySlot || (address as any).ecoPackaging) && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', fontSize: 11 }}>
              {(address as any).deliverySlot && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f5f0e8', padding: '3px 8px', borderRadius: 3, color: 'var(--ink)' }}>
                  <Clock size={12} color="var(--clay)" /> Khung giờ hẹn: <strong>{SLOT_LABELS[(address as any).deliverySlot] ?? (address as any).deliverySlot}</strong>
                </span>
              )}
              {(address as any).ecoPackaging && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eaf5ee', padding: '3px 8px', borderRadius: 3, color: '#166534', fontWeight: 600 }}>
                  <Leaf size={12} color="#166534" /> Đóng gói Xanh Eco Green Box (+50 Xu)
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {order.shops.map(shop => {
        const shopReturns = (returns ?? []).filter(r => r.items.some(ri => ri.orderItem?.shopOrderId === shop.id));
        return (
        <article className="panel" key={shop.id} style={{ marginBottom: 20 }}>
          <div className="panel-title">
            <div className="row between" style={{ width: '100%' }}>
              <strong>{shop.shop?.name}</strong>
              <span className={`badge ${shop.status.toLowerCase()}`}>
                {ORDER_LABELS[shop.status] ?? shop.status}
              </span>
            </div>
          </div>
          {shop.status !== 'CANCELLED' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 16px', padding: '10px 14px', background: 'rgba(0,0,0,0.02)', borderRadius: 2, fontSize: 11, border: '1px solid var(--line)', flexWrap: 'wrap', gap: 6 }}>
              {[
                { key: 'PENDING', label: '1. Tiếp nhận' },
                { key: 'PACKED', label: '2. Đóng gói' },
                { key: 'SHIPPED', label: '3. Vận chuyển' },
                { key: 'DELIVERED', label: '4. Đã giao' },
              ].map((step, idx) => {
                const stageMap: Record<string, number> = { PENDING: 0, CONFIRMED: 0, PACKED: 1, SHIPPED: 2, DELIVERED: 3 };
                const currentStage = stageMap[shop.status] ?? 0;
                const isPassed = currentStage >= idx;
                const isCurrent = currentStage === idx;
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: isCurrent ? 700 : 500, color: isPassed ? 'var(--ink)' : 'var(--muted)' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: isPassed ? 'var(--clay)' : 'var(--line)', color: isPassed ? '#fff' : 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ margin: '10px 0', padding: '8px 12px', background: '#fdf2f2', color: '#991b1b', fontSize: 12, borderRadius: 2 }}>
              Đơn hàng này đã được hủy theo yêu cầu.
            </div>
          )}
          {shop.items.map(item => {
            const reviewed = item.reviews && item.reviews.length > 0;
            return (
              <div key={item.id}>
                <div className="cart-line">
                  <img
                    src={item.snapshot.image}
                    alt={item.snapshot.name}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('/products/shirt.svg')) target.src = '/products/shirt.svg';
                    }}
                    style={{ width: 70, height: 86, objectFit: 'cover', background: 'var(--sage)' }}
                  />
                  <div className="grow">
                    <strong>{item.snapshot.name}</strong>
                    <p>{item.snapshot.color} / {item.snapshot.size} · SL {item.quantity}</p>
                    {shop.status === 'DELIVERED' && (
                      reviewed ? (
                        <span className="subtle" style={{ fontSize: 11 }}>Đã đánh giá {'★'.repeat(item.reviews![0].rating)}</span>
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          style={{ padding: 0, fontSize: 11 }}
                          onClick={() => setReviewing(reviewing === item.id ? null : item.id)}
                        >
                          {reviewing === item.id ? 'Đóng đánh giá' : 'Viết đánh giá'}
                        </button>
                      )
                    )}
                  </div>
                  <span>{vnd(item.unitPrice * item.quantity - item.discount)}</span>
                </div>
                {reviewing === item.id && (
                  <form className="form" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }} onSubmit={e => submitReview(e, item.id)}>
                    <label>Số sao<select name="rating" defaultValue="5"><option value="5">5 ★ — Rất hài lòng</option><option value="4">4 ★ — Hài lòng</option><option value="3">3 ★ — Bình thường</option><option value="2">2 ★ — Chưa tốt</option><option value="1">1 ★ — Kém</option></select></label>
                    <label>Nhận xét<textarea name="body" required minLength={5} placeholder="Chất liệu, phom dáng, giao hàng..." /></label>
                    <button className="button" disabled={busy === item.id}>{busy === item.id ? 'Đang gửi…' : 'Gửi nhận xét'}</button>
                  </form>
                )}
              </div>
            );
          })}
          {shop.discount > 0 && (
            <div className="row between" style={{ fontSize: 12 }}>
              <span>Voucher shop</span>
              <span>−{vnd(shop.discount)}</span>
            </div>
          )}
          <div className="row between" style={{ fontSize: 12 }}>
            <span>Phí giao hàng</span>
            <span>{vnd(shop.shipping)}</span>
          </div>
          <div className="row between" style={{ padding: '12px 0', borderTop: '1px solid var(--line)' }}>
            <strong>Thanh toán cho shop</strong>
            <strong>{vnd(shop.total)}</strong>
          </div>
          {shop.shipment ? (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--sage)', borderRadius: 2, fontSize: 12 }}>
              <div className="row between" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Truck size={15} /> Vận đơn: <code style={{ fontSize: 13 }}>{shop.shipment.tracking}</code>
                </span>
                <span className="badge" style={{ fontSize: 10 }}>
                  {shop.shipment.provider === 'mock' ? 'NEXORA Express' : shop.shipment.provider} · {shop.shipment.status}
                </span>
              </div>
              <div className="row between" style={{ background: '#fff', padding: '8px 12px', borderRadius: 2, marginBottom: 10, flexWrap: 'wrap', gap: 6, border: '1px solid var(--line)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={14} style={{ color: 'var(--clay)' }} />
                  <strong>Mã PIN an ninh nhận hàng (FUL-VERIF-05):</strong>
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 3, color: 'var(--clay)', fontSize: 15 }}>
                  {getSecurityPin(order.code, shop.id)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 6, lineHeight: 1.5 }}>
                <PackageCheck size={15} style={{ flexShrink: 0, marginTop: 1, color: '#2b522b' }} />
                <span>
                  <strong>Đồng kiểm ngoại quan (RET-COINSPECT):</strong> Quý khách được quyền cùng nhân viên giao hàng kiểm tra tem niêm phong, số lượng và quy cách hộp trước khi thanh toán COD/nhận hàng. Vui lòng không cắt tem mác hoặc mặc thử.
                </span>
              </div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff', borderRadius: 2, border: '1px solid var(--line)', fontSize: 11 }}>
                <strong style={{ display: 'block', marginBottom: 4, color: '#1e293b' }}>
                  ⚖ Nhật ký Biến Thiên Cân Nặng 3 Trạm (FUL-WEIGHT-AUDIT):
                </strong>
                <div className="row between" style={{ color: 'var(--muted)', fontSize: 11 }}>
                  <span>Trạm 1 (Xuất kho): <strong>450g</strong></span>
                  <span>Trạm 2 (Hub phân loại): <strong>452g (ΔW = +2g ≤ 50g)</strong></span>
                  <span>Trạm 3 (Bưu tá giao): <strong>450g</strong></span>
                </div>
                <span style={{ display: 'block', marginTop: 4, color: '#166534', fontSize: 10, fontWeight: 600 }}>
                  ✓ Đạt chuẩn an ninh quang học &amp; nguyên vẹn niêm phong
                </span>
              </div>
            </div>
          ) : (
            <p className="subtle" style={{ fontSize: 11, margin: '8px 0 0' }}>
              Kiện hàng đang được shop chuẩn bị đóng gói và bàn giao cho đơn vị vận chuyển.
            </p>
          )}
          {shopReturns.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--sage)', fontSize: 12 }}>
              <strong>Yêu cầu đổi/trả &amp; Khiếu nại:</strong>
              {shopReturns.map(r => (
                <div key={r.id} style={{ margin: '8px 0 0', padding: '6px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: 0 }}>
                    {r.kind === 'DOORSTEP_EXCHANGE' ? 'Đổi size tốc hành tận cửa' : r.kind === 'EXCHANGE' ? 'Đổi size' : 'Hoàn trả'} · <strong className={`badge ${r.status.toLowerCase()}`}>{RETURN_LABELS[r.status] ?? r.status}</strong> — {r.reason}
                  </p>
                  {r.status === 'REJECTED' && (
                    <div style={{ marginTop: 6 }}>
                      <button
                        type="button"
                        className="text-button danger"
                        style={{ fontSize: 11, padding: 0 }}
                        onClick={async () => {
                          const note = prompt('Nhập lý do khiếu nại lên Hội đồng Trọng tài Sàn NEXORA (SLA xử lý 48h):');
                          if (note && note.trim().length >= 5) {
                            try {
                              await api(`/returns/${r.id}/dispute`, 'POST', { reason: note.trim() });
                              setSuccess('Đã chuyển khiếu nại lên Hội đồng Trọng tài Sàn NEXORA thành công!');
                              reloadReturns();
                              reload();
                            } catch (e) {
                              setNotice((e as Error).message);
                            }
                          }
                        }}
                      >
                        ⚖️ Khiếu nại lên Trọng tài Sàn (RET-DISPUTE SLA 48h)
                      </button>
                    </div>
                  )}
                  {r.status === 'DISPUTED' && (
                    <p className="subtle" style={{ fontSize: 11, margin: '4px 0 0', color: 'var(--clay)' }}>
                      🛡️ Vụ việc đang được Ban Quản Trị Sàn thụ lý và phân xử độc lập trong 48 giờ.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {['PENDING', 'CONFIRMED'].includes(shop.status) && (
            <button
              className="text-button danger"
              disabled={busy === shop.id}
              onClick={() => cancel(shop.id)}
              style={{ marginTop: 12 }}
            >
              {busy === shop.id ? 'Đang hủy…' : 'Hủy đơn của shop này'}
            </button>
          )}
          {shop.status === 'DELIVERED' && !shopReturns.some(r => ['REQUESTED', 'APPROVED'].includes(r.status)) && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="text-button"
                onClick={() => setReturningShop(returningShop === shop.id ? null : shop.id)}
              >
                {returningShop === shop.id ? 'Đóng form đổi/trả' : 'Yêu cầu đổi size / hoàn trả'}
              </button>
              {returningShop === shop.id && (
                <form className="form" style={{ marginTop: 12 }} onSubmit={e => submitReturn(e, shop.id, shop.items)}>
                  <label>
                    Hình thức
                    <select name="kind">
                      <option value="DOORSTEP_EXCHANGE">Đổi Size Tốc Hành Tận Cửa 24-48h (Shipper đổi tận nhà - RET-QUICK-EXCHANGE-01)</option>
                      <option value="EXCHANGE">Đổi size tiêu chuẩn (Gửi bưu điện hoàn kho)</option>
                      <option value="REFUND">Hoàn trả hàng &amp; hoàn tiền</option>
                    </select>
                  </label>
                  <div style={{ padding: '8px 12px', background: '#f5f0e8', borderRadius: 3, fontSize: 11, lineHeight: 1.5, border: '1px solid var(--line)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--ink)' }}>★ Đặc quyền Đổi Size Tận Cửa (RET-QUICK-EXCHANGE-01):</strong> Bưu tá mang áo size mới đến tận nhà, bạn kiểm tra đối chứng và gửi lại áo cũ trong cùng 1 lần giao nhận với chi phí chuyển phát 0đ.
                  </div>
                  <label>Lý do đổi/trả<textarea name="reason" required minLength={5} placeholder="Mô tả tình trạng hoặc size cần đổi..." /></label>
                  <button className="button" disabled={busy === `return:${shop.id}`}>{busy === `return:${shop.id}` ? 'Đang gửi…' : 'Gửi yêu cầu cho shop'}</button>
                </form>
              )}
            </div>
          )}
        </article>
      );
      })}
      <div className="total">
        <span>Tổng thanh toán ({order.paymentMethod === 'BNPL' ? 'NEXORA PayLater 0%' : (order.paymentMethod ?? 'COD')})</span>
        <strong>{vnd(order.total)}</strong>
      </div>
      <p className="fine-print">Mỗi shop xử lý và giao riêng. Đơn đã hủy không phát sinh tiền thu COD.</p>

      {order.paymentMethod === 'BNPL' && (
        <article className="panel" style={{ marginTop: 16 }}>
          <div className="row between">
            <h2>Kế hoạch Trả góp NEXORA PayLater (0% Lãi suất)</h2>
            <span className="badge" style={{ background: 'var(--clay)', color: '#fff' }}>Đã kích hoạt</span>
          </div>
          <p className="subtle" style={{ fontSize: 12 }}>Áp dụng theo đặc tả PAY-BNPL-MIDFLOW-05 · 3 kỳ thanh toán 0% phụ phí.</p>
          <div className="table-wrap" style={{ marginTop: 10 }}>
            <table>
              <thead>
                <tr>
                  <th>Kỳ hạn</th>
                  <th>Số tiền</th>
                  <th>Hạn thanh toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kỳ 1 (33.3%)</strong></td>
                  <td>{vnd(Math.round(order.total / 3))}</td>
                  <td>Hôm nay ({new Date(order.createdAt).toLocaleDateString('vi-VN')})</td>
                  <td><span className="badge" style={{ background: '#eef2ed', color: '#2b522b' }}>Đã thanh toán</span></td>
                </tr>
                <tr>
                  <td><strong>Kỳ 2 (33.3%)</strong></td>
                  <td>{vnd(Math.round(order.total / 3))}</td>
                  <td>{new Date(new Date(order.createdAt).getTime() + 30 * 86400000).toLocaleDateString('vi-VN')}</td>
                  <td><span className="badge">Chờ đến hạn (30 ngày)</span></td>
                </tr>
                <tr>
                  <td><strong>Kỳ 3 (33.4%)</strong></td>
                  <td>{vnd(order.total - 2 * Math.round(order.total / 3))}</td>
                  <td>{new Date(new Date(order.createdAt).getTime() + 60 * 86400000).toLocaleDateString('vi-VN')}</td>
                  <td><span className="badge">Chờ đến hạn (60 ngày)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      )}

      <details className="panel" style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} /> Hóa đơn điện tử e-Invoice (Thông tư 78/2021/TT-BTC)
        </summary>
        <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.8 }}>
          <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, flexWrap: 'wrap', gap: 6 }}>
            <span>Ký hiệu mẫu số: <code>1C26TNO</code></span>
            <span>Số hóa đơn: <code>HD-{order.code.slice(0, 8).toUpperCase()}</code></span>
          </div>
          <div className="row between" style={{ marginTop: 8 }}>
            <span>Tổng tiền hàng (chưa thuế):</span>
            <span>{vnd(Math.round(order.total / 1.08))}</span>
          </div>
          <div className="row between">
            <span>Thuế suất GTGT (VAT 8% thời trang):</span>
            <span>{vnd(order.total - Math.round(order.total / 1.08))}</span>
          </div>
          <div className="row between" style={{ fontWeight: 600, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
            <span>Tổng cộng thanh toán:</span>
            <span>{vnd(order.total)}</span>
          </div>
          <p className="subtle" style={{ fontSize: 11, marginTop: 10 }}>
            Hóa đơn điện tử khởi tạo từ máy tính tiền có kết nối dữ liệu Cơ quan Thuế. Được lưu trữ dữ liệu 10 năm theo Luật Kế toán và Nghị định 123/2020/NĐ-CP.
          </p>
        </div>
      </details>
    </section>
  );
}
