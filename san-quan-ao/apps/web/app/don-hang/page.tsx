'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ORDER_LABELS } from '@mac/contracts';
import { api, Order, useResource, vnd } from '../api';
import { Empty, Loading, Notice } from '../ui';
export default function Orders() {
  const { data, error, loading, reload } = useResource<Order[]>('/orders');
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState('');
  async function cancel(id: string) { setBusy(id); setNotice(''); try { await api(`/orders/shops/${id}/cancel`, 'POST'); reload(); } catch(e) { setNotice((e as Error).message); } finally { setBusy(''); } }
  if (loading) return <Loading/>;
  if (error) return <section className="section"><Notice error>{error}</Notice><Link href="/dang-nhap" className="button">Đăng nhập</Link></section>;
  if (!data?.length) return <Empty title="Chưa có đơn hàng." detail="Những món đồ bạn chọn sẽ xuất hiện ở đây."/>;
  return <section className="section narrow"><p className="eyebrow">TỦ ĐỒ ĐANG TRÊN ĐƯỜNG TỚI BẠN</p><h1>Đơn hàng của bạn.</h1>{notice && <Notice error>{notice}</Notice>}{data.map(order => <article className="panel order" key={order.id}><div className="row between"><Link href={`/don-hang/${order.id}`}><h2>{order.code}</h2></Link><span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span></div>{order.shops.map(shop => <section className="suborder" key={shop.id}><div className="row between"><strong>{shop.shop?.name}</strong><span className={`badge ${shop.status.toLowerCase()}`}>{ORDER_LABELS[shop.status]}</span></div>{shop.items.map(item => <div className="cart-line" key={item.id}><img src={item.snapshot.image} alt={item.snapshot.name}/><div className="grow"><strong>{item.snapshot.name}</strong><p>{item.snapshot.color} / {item.snapshot.size} · SL {item.quantity}</p></div><span>{vnd(item.unitPrice * item.quantity - item.discount)}</span></div>)}<div className="row between"><span>Gồm phí giao {vnd(shop.shipping)}</span><strong>{vnd(shop.total)}</strong></div>{shop.shipment && <p className="subtle">Vận đơn {shop.shipment.tracking} · {shop.shipment.provider === 'mock' ? 'Mô phỏng' : shop.shipment.provider}</p>}{['PENDING','CONFIRMED'].includes(shop.status) && <button className="text-button danger" disabled={busy === shop.id} onClick={() => cancel(shop.id)}>{busy === shop.id ? 'Đang hủy…' : 'Hủy đơn của shop này'}</button>}</section>)}<div className="total"><span>Tổng ban đầu · COD</span><strong>{vnd(order.total)}</strong></div><p className="fine-print">Mỗi shop xử lý và giao riêng. Đơn đã hủy không phát sinh tiền thu COD.</p></article>)}</section>;

}
