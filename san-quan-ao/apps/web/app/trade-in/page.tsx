'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { api, TradeInRequest, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

const STATUS_LABELS: Record<string, string> = {
  AI_PRELIMINARY: 'Vòng 1: Đã định giá AI sơ bộ',
  HUB_INSPECTING: 'Vòng 2: Đang giám định tại Hub',
  APPROVED: 'Đã duyệt · Đã cấp Voucher',
  REJECTED: 'Không đạt tiêu chuẩn thu mua',
};

export default function TradeInPage() {
  const { user } = useUser();
  const list = useResource<TradeInRequest[]>(user ? '/trade-in' : null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const created = await api<TradeInRequest>('/trade-in', 'POST', {
        brand: String(d.get('brand')),
        itemName: String(d.get('itemName')),
        category: String(d.get('category')),
        conditionNote: String(d.get('conditionNote')),
        imageUrl: String(d.get('imageUrl') || ''),
      });
      form.reset();
      setSuccess(`Đã tiếp nhận! Định giá AI sơ bộ: Grade ${created.grade} — ${vnd(created.estimatedValue)}.`);
      list.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />NEXORA CIRCULAR FASHION</p>
      <div className="section-heading">
        <div>
          <h1>Thu cũ Đổi mới <em>2 Vòng</em></h1>
          <p className="subtle">Vòng 1 AI Vision định giá tức thì · Vòng 2 giám định trực tiếp tại Hub dưới buồng sáng 1000 Lux · Nhận Voucher mua sắm ngay.</p>
        </div>
      </div>

      {!user ? (
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để gửi yêu cầu Trade-In và nhận Voucher đối ứng.</Notice>
      ) : (
        <div className="checkout-grid">
          <form className="panel form" onSubmit={submit}>
            <h2><RefreshCw size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />Gửi đồ cần thu cũ</h2>
            {error && <Notice error>{error}</Notice>}
            {success && <Notice>{success}</Notice>}
            <label>Thương hiệu<input name="brand" required minLength={2} placeholder="VD: NÉP Studio, Jacquemus, Burberry..." /></label>
            <label>Tên sản phẩm<input name="itemName" required minLength={3} placeholder="VD: Túi da mini / Áo khoác trench..." /></label>
            <label>Phân loại
              <select name="category" defaultValue="Áo khoác">
                <option value="Túi xách">Túi xách</option>
                <option value="Áo khoác">Áo khoác</option>
                <option value="Đầm / Váy">Đầm / Váy</option>
                <option value="Giày dép">Giày dép</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </select>
            </label>
            <label>Mô tả tình trạng thực tế<textarea name="conditionNote" required minLength={5} placeholder="VD: Mới 95%, ít sử dụng, còn hộp và tag..." /></label>
            <label>URL ảnh chụp chi tiết (tùy chọn)<input name="imageUrl" placeholder="http://localhost:3000/products/outfit.svg" /></label>
            <button className="button" disabled={busy}>{busy ? 'Đang định giá AI…' : 'Định giá Vòng 1 ngay'}</button>
          </form>

          <div>
            <article className="panel">
              <h2>Hồ sơ Trade-In của bạn</h2>
              {list.loading ? <Loading /> : !list.data?.length ? (
                <p className="subtle">Bạn chưa có yêu cầu thu cũ đổi mới nào.</p>
              ) : list.data.map(item => (
                <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="row between">
                    <strong>{item.brand} · {item.itemName}</strong>
                    <span className="badge">Grade {item.grade}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--muted)' }}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </p>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    Ước tính Vòng 1: <strong>{vnd(item.estimatedValue)}</strong>
                    {item.finalValue !== null && <> · Chốt Vòng 2: <strong>{vnd(item.finalValue)}</strong></>}
                  </p>
                  {item.voucherCode && (
                    <p style={{ margin: '8px 0 0', padding: '6px 10px', background: 'var(--sage)', fontSize: 12 }}>
                      Voucher đối ứng: <strong>{item.voucherCode}</strong>
                    </p>
                  )}
                </div>
              ))}
            </article>
          </div>
        </div>
      )}
    </section>
  );
}
