'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Order, useResource, vnd } from '../../api';
import { Empty, Loading, Notice } from '../../ui';

export default function OrderDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: order, error, loading, reload } = useResource<Order>(id ? `/orders/${id}` : null);
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState('');

  async function cancel(shopOrderId: string) {
    setBusy(shopOrderId);
    setNotice('');
    try {
      await api(`/orders/shops/${shopOrderId}/cancel`, 'POST');
      reload();
    } catch (e) {
      setNotice((e as Error).message);
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
      {order.shops.map(shop => (
        <article className="panel" key={shop.id} style={{ marginBottom: 20 }}>
          <div className="panel-title">
            <div className="row between" style={{ width: '100%' }}>
              <strong>{shop.shop?.name}</strong>
              <span className={`badge ${shop.status.toLowerCase()}`}>
                {ORDER_LABELS[shop.status] ?? shop.status}
              </span>
            </div>
          </div>
          {shop.items.map(item => (
            <div className="cart-line" key={item.id}>
              <img
                src={item.snapshot.image}
                alt={item.snapshot.name}
                style={{ width: 70, height: 86, objectFit: 'cover', background: 'var(--sage)' }}
              />
              <div className="grow">
                <strong>{item.snapshot.name}</strong>
                <p>{item.snapshot.color} / {item.snapshot.size} · SL {item.quantity}</p>
              </div>
              <span>{vnd(item.unitPrice * item.quantity - item.discount)}</span>
            </div>
          ))}
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
        </article>
      ))}
      <div className="total">
        <span>Tổng thanh toán ({order.paymentMethod ?? 'COD'})</span>
        <strong>{vnd(order.total)}</strong>
      </div>
      <p className="fine-print">Mỗi shop xử lý và giao riêng. Đơn đã hủy không phát sinh tiền thu COD.</p>
    </section>
  );
}
