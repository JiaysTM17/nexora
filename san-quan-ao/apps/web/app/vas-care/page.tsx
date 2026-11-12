'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { api, CareBooking, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

const SERVICE_LABELS: Record<string, string> = {
  SPA_CLEANING: 'Giặt hấp & Spa trang phục cao cấp (250.000đ)',
  LEATHER_RESTORE: 'Phục hồi & Dưỡng da túi/giày hiệu (450.000đ)',
  TAILORING: 'Chỉnh sửa phom dáng chuẩn May đo (180.000đ)',
  AUTHENTICATION: 'Giám định chính hãng Entrupy / Chuyên viên (350.000đ)',
};

const CARE_STATUS: Record<string, string> = {
  BOOKED: 'Đã đặt lịch · Chờ shipper niêm phong',
  SEALED_PICKUP: 'Đã niêm phong Zip-seal & nhận hàng',
  OPTICAL_CHECK: 'Đã chụp biên bản quang học 8 góc',
  IN_CARE: 'Đang xử lý Spa / Phục hồi tại Hub',
  RETURNED: 'Đã hoàn trả tận tay khách hàng',
};

export default function VasCarePage() {
  const { user } = useUser();
  const list = useResource<CareBooking[]>(user ? '/vas-care' : null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const created = await api<CareBooking>('/vas-care', 'POST', {
        itemName: String(d.get('itemName')),
        serviceType: String(d.get('serviceType')),
        insuredValue: Number(d.get('insuredValue')),
        notes: String(d.get('notes') || ''),
      });
      form.reset();
      setSuccess(`Đã đặt lịch thành công! Mã niêm phong Zip-seal của bạn: ${created.zipSealCode}.`);
      list.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />NEXORA LUXURY VAS CARE</p>
      <div className="section-heading">
        <div>
          <h1>Chăm sóc Đồ hiệu <em>White-Glove</em></h1>
          <p className="subtle">Túi niêm phong Serial Zip-seal một chiều · Biên bản kiểm tra quang học 8 góc · Bảo hiểm tài sản lên đến 100.000.000 VNĐ.</p>
        </div>
      </div>

      {!user ? (
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để đặt lịch chăm sóc đồ hiệu và nhận mã niêm phong bảo mật.</Notice>
      ) : (
        <div className="checkout-grid">
          <form className="panel form" onSubmit={submit}>
            <h2><ShieldCheck size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />Đặt lịch chăm sóc đồ hiệu</h2>
            {error && <Notice error>{error}</Notice>}
            {success && <Notice>{success}</Notice>}
            <label>Tên món đồ cần chăm sóc<input name="itemName" required minLength={3} placeholder="VD: Áo khoác len Cashmere / Túi da bê..." /></label>
            <label>Gói dịch vụ
              <select name="serviceType" defaultValue="SPA_CLEANING">
                {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </label>
            <label>Giá trị khai báo bảo hiểm (tối đa 100.000.000đ)
              <input name="insuredValue" type="number" min={0} max={100000000} defaultValue={10000000} required />
            </label>
            <label>Lưu ý đặc biệt cho chuyên viên<textarea name="notes" placeholder="VD: Vết ố nhẹ ở cổ tay, lưu ý khuy ngọc trai..." /></label>
            <button className="button" disabled={busy}>{busy ? 'Đang khởi tạo mã Zip-seal…' : 'Đặt lịch & Cấp mã Zip-seal'}</button>
          </form>

          <div>
            <article className="panel">
              <h2>Đơn chăm sóc của bạn</h2>
              {list.loading ? <Loading /> : !list.data?.length ? (
                <p className="subtle">Bạn chưa có đơn chăm sóc đồ hiệu nào.</p>
              ) : list.data.map(b => (
                <div key={b.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="row between">
                    <strong>{b.itemName}</strong>
                    <span className="badge">{b.zipSealCode}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--muted)' }}>
                    {SERVICE_LABELS[b.serviceType] ?? b.serviceType}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>
                    Trạng thái: <strong>{CARE_STATUS[b.status] ?? b.status}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: 12 }}>
                    Phí dịch vụ: <strong>{vnd(b.fee)}</strong> · Bảo hiểm: <strong>{vnd(b.insuredValue)}</strong>
                  </p>
                </div>
              ))}
            </article>
          </div>
        </div>
      )}
    </section>
  );
}
