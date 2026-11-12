'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Order, ReturnRequest, useResource, vnd } from '../../api';
import { Empty, Loading, Notice } from '../../ui';

const RETURN_LABELS: Record<string, string> = {
  REQUESTED: 'Chờ shop xử lý',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  COMPLETED: 'Hoàn tất',
};

export default function OrderDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: order, error, loading, reload } = useResource<Order>(id ? `/orders/${id}` : null);
  const { data: returns, reload: reloadReturns } = useResource<ReturnRequest[]>(id ? '/returns' : null);
  const [notice, setNotice] = useState(''), [success, setSuccess] = useState(''), [busy, setBusy] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [returningShop, setReturningShop] = useState<string | null>(null);

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
      setReviewing(null);
      setSuccess('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      reload();
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setBusy('');
    }
  }

  async function submitReturn(e: FormEvent<HTMLFormElement>, shopOrderId: string, items: { id: string; quantity: number }[]) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const kind = String(d.get('kind')) as 'EXCHANGE' | 'REFUND';
    const reason = String(d.get('reason'));
    setBusy(`return:${shopOrderId}`);
    setNotice('');
    setSuccess('');
    try {
      await api(`/orders/shops/${shopOrderId}/returns`, 'POST', {
        kind,
        reason,
        items: items.map(i => ({ orderItemId: i.id, quantity: i.quantity })),
      });
      setReturningShop(null);
      setSuccess('Đã gửi yêu cầu đổi/trả đến shop.');
      reloadReturns();
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
          <p className="eyebrow" style={{ marginBottom: 8 }}>
            <MapPin size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
            ĐỊA CHỈ NHẬN HÀNG
          </p>
          <strong>{address.recipient} · {address.phone}</strong>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            {address.line}, {address.province}
          </p>
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
          {shop.items.map(item => {
            const reviewed = item.reviews && item.reviews.length > 0;
            return (
              <div key={item.id}>
                <div className="cart-line">
                  <img
                    src={item.snapshot.image}
                    alt={item.snapshot.name}
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
                    <button className="button" disabled={busy === item.id}>{busy === item.id ? 'Đang gửi…' : 'Gửi đánh giá'}</button>
                  </form>
                )}
              </div>
            );
          })}
          <div className="row between" style={{ padding: '12px 0', borderTop: '1px solid var(--line)', fontSize: 12 }}>
            <span>Tiền hàng</span>
            <span>{vnd(shop.subtotal)}</span>
          </div>
          {shop.discount > 0 && (
            <div className="row between" style={{ fontSize: 12 }}>
              <span>Giảm giá</span>
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
          {shop.shipment && (
            <p className="subtle" style={{ fontSize: 11, margin: '8px 0 0' }}>
              Vận đơn: {shop.shipment.tracking} · {shop.shipment.provider === 'mock' ? 'Mô phỏng' : shop.shipment.provider} · {shop.shipment.status}
            </p>
          )}
          {shopReturns.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--sage)', fontSize: 12 }}>
              <strong>Yêu cầu đổi/trả:</strong>
              {shopReturns.map(r => (
                <p key={r.id} style={{ margin: '6px 0 0' }}>
                  {r.kind === 'EXCHANGE' ? 'Đổi size' : 'Hoàn trả'} · <strong>{RETURN_LABELS[r.status] ?? r.status}</strong> — {r.reason}
                </p>
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
                  <label>Hình thức<select name="kind"><option value="EXCHANGE">Đổi size / mẫu</option><option value="REFUND">Hoàn trả & hoàn tiền</option></select></label>
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
        <span>Tổng thanh toán ({order.paymentMethod ?? 'COD'})</span>
        <strong>{vnd(order.total)}</strong>
      </div>
      <p className="fine-print">Mỗi shop xử lý và giao riêng. Đơn đã hủy không phát sinh tiền thu COD.</p>
    </section>
  );
}
