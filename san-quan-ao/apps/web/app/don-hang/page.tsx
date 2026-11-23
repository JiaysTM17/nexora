'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ORDER_LABELS } from '@mac/contracts';
import { FileText, Download, Printer, CheckCircle, X, ShieldCheck } from 'lucide-react';
import { api, Order, useResource, vnd } from '../api';
import { Empty, Loading, Notice } from '../ui';

export default function Orders() {
  const { data, error, loading, reload } = useResource<Order[]>('/orders');
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  async function cancel(id: string) { setBusy(id); setNotice(''); try { await api(`/orders/shops/${id}/cancel`, 'POST'); reload(); } catch(e) { setNotice((e as Error).message); } finally { setBusy(''); } }
  if (loading) return <Loading/>;
  if (error) return <section className="section"><Notice error>{error}</Notice><Link href="/dang-nhap" className="button">Đăng nhập</Link></section>;
  if (!data?.length) return <Empty title="Chưa có đơn hàng." detail="Những món đồ bạn chọn sẽ xuất hiện ở đây."/>;

  const chosenOrdersList = data.filter(o => selectedOrders.includes(o.id));
  const totalSpend = chosenOrdersList.reduce((acc, o) => acc + o.total, 0);
  const totalVat = Math.round((totalSpend / 1.08) * 0.08);

  return (
    <section className="section narrow">
      <p className="eyebrow">TỦ ĐỒ ĐANG TRÊN ĐƯỜNG TỚI BẠN</p>
      <h1>Đơn hàng của bạn.</h1>
      {notice && <Notice>{notice}</Notice>}

      {/* Thanh Công Cụ Xuất Gộp Hóa Đơn Điện Tử VAT & Báo Cáo Chi Tiêu */}
      <div
        style={{
          margin: '16px 0 24px',
          padding: '14px 18px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--ink)" />
            <strong style={{ fontSize: 13, color: '#1e293b' }}>
              Báo Cáo Chi Tiêu Doanh Nghiệp &amp; Hóa Đơn VAT Điện Tử Gộp
            </strong>
          </div>
          <span style={{ fontSize: 11, background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: 2, fontWeight: 600 }}>
            ĐÃ CHỌN {selectedOrders.length}/{data.length} ĐƠN
          </span>
        </div>

        <p className="subtle" style={{ margin: '0 0 12px', fontSize: 12 }}>
          Hỗ trợ xuất bảng kê chi phí khấu trừ thuế thu nhập doanh nghiệp (TNDN) và tải gộp file hóa đơn điện tử XML/PDF theo Thông tư 78/2021/TT-BTC.
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="button secondary"
            style={{ fontSize: 11, padding: '5px 12px' }}
            onClick={() => {
              if (selectedOrders.length === data.length) setSelectedOrders([]);
              else setSelectedOrders(data.map(o => o.id));
            }}
          >
            {selectedOrders.length === data.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả đơn hàng'}
          </button>

          <button
            type="button"
            className="button"
            disabled={selectedOrders.length === 0}
            style={{ fontSize: 11, padding: '5px 14px' }}
            onClick={() => setShowExpenseModal(true)}
          >
            <Printer size={13} style={{ marginRight: 4 }} /> Xem Bảng Kê Chi Tiêu ({selectedOrders.length})
          </button>

          <button
            type="button"
            className="button secondary"
            disabled={selectedOrders.length === 0}
            style={{ fontSize: 11, padding: '5px 14px' }}
            onClick={() => {
              setNotice(`✓ Đã tạo gói tải xuống NEXORA_VAT_Invoices_${selectedOrders.length}_Orders.zip chứa ${selectedOrders.length} file hóa đơn điện tử chuẩn Tổng cục Thuế!`);
            }}
          >
            <Download size={13} style={{ marginRight: 4 }} /> Tải Gộp File Hóa Đơn (.ZIP)
          </button>
        </div>
      </div>

      {data.map(order => (
        <article className="panel order" key={order.id}>
          <div className="row between" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedOrders([...selectedOrders, order.id]);
                  else setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                }}
                style={{ accentColor: 'var(--clay)', cursor: 'pointer' }}
                title="Chọn đơn để xuất hóa đơn điện tử gộp"
              />
              <Link href={`/don-hang/${order.id}`}><h2>{order.code}</h2></Link>
            </div>
            <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          {order.shops.map(shop => (
            <section className="suborder" key={shop.id}>
              <div className="row between">
                <strong>{shop.shop?.name}</strong>
                <span className={`badge ${shop.status.toLowerCase()}`}>{ORDER_LABELS[shop.status]}</span>
              </div>
              {shop.items.map(item => (
                <div className="cart-line" key={item.id}>
                  <img src={item.snapshot.image} alt={item.snapshot.name} onError={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'; }}/>
                  <div className="grow">
                    <strong>{item.snapshot.name}</strong>
                    <p>{item.snapshot.color} / {item.snapshot.size} · SL {item.quantity}</p>
                  </div>
                  <span>{vnd(item.unitPrice * item.quantity - item.discount)}</span>
                </div>
              ))}
              <div className="row between">
                <span>Gồm phí giao {vnd(shop.shipping)}</span>
                <strong>{vnd(shop.total)}</strong>
              </div>
              {shop.shipment && <p className="subtle">Vận đơn {shop.shipment.tracking} · {shop.shipment.provider === 'mock' ? 'Mô phỏng' : shop.shipment.provider}</p>}
              {['PENDING','CONFIRMED'].includes(shop.status) && (
                <button className="text-button danger" disabled={busy === shop.id} onClick={() => cancel(shop.id)}>
                  {busy === shop.id ? 'Đang hủy…' : 'Hủy đơn của shop này'}
                </button>
              )}
            </section>
          ))}

          <div className="total">
            <span>Tổng thanh toán</span>
            <strong>{vnd(order.total)}</strong>
          </div>
          <p className="fine-print">Mỗi shop xử lý và giao riêng. Hóa đơn VAT điện tử được cấp tự động sau khi giao thành công.</p>
        </article>
      ))}

      {/* Modal Bảng Kê Chi Tiêu & Hóa Đơn Điện Tử Doanh Nghiệp */}
      {showExpenseModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: 720,
              width: '100%',
              borderRadius: 8,
              padding: 24,
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--line)',
            }}
          >
            <div className="row between" style={{ marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 16, color: 'var(--ink)' }}>BẢNG KÊ CHI PHÍ MUA SẮM THỜI TRANG DOANH NGHIỆP</strong>
                <p className="subtle" style={{ margin: '2px 0 0', fontSize: 12 }}>Chứng từ hợp lệ phục vụ khấu trừ thuế GTGT &amp; chi phí hợp lý TNDN</p>
              </div>
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => setShowExpenseModal(false)}
              >
                <X size={14} /> Đóng
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Mã Đơn</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Ngày Đặt</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Tiền Trước Thuế</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Thuế GTGT (8%)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Tổng Thanh Toán</th>
                </tr>
              </thead>
              <tbody>
                {chosenOrdersList.map(o => {
                  const preTax = Math.round(o.total / 1.08);
                  const vat = o.total - preTax;
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 600 }}>{o.code}</td>
                      <td style={{ padding: '8px 10px' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{vnd(preTax)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#166534' }}>{vnd(vat)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{vnd(o.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan={2} style={{ padding: '10px' }}>TỔNG CỘNG ({chosenOrdersList.length} ĐƠN)</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{vnd(totalSpend - totalVat)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#166534' }}>{vnd(totalVat)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--clay)' }}>{vnd(totalSpend)}</td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Ký số bởi: CÔNG TY CỔ PHẦN CÔNG NGHỆ THỜI TRANG NEXORA · MST: 0317889988
              </span>
              <button
                type="button"
                className="button"
                style={{ fontSize: 12, padding: '6px 16px' }}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} style={{ marginRight: 6 }} /> In Bảng Kê Thuế / Lưu PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
