'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, MapPin, Package, RefreshCw, ShieldCheck } from 'lucide-react';
import { api, AffiliateSummary, CareBooking, TradeInRequest, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

type Address = { id: string; recipient: string; phone: string; line: string; province: string };

export default function AccountPage() {
  const { user, refresh } = useUser();
  const router = useRouter();
  const addresses = useResource<Address[]>(user ? '/addresses' : null);
  const tradeIns = useResource<TradeInRequest[]>(user ? '/trade-in' : null);
  const careList = useResource<CareBooking[]>(user ? '/vas-care' : null);
  const affiliate = useResource<AffiliateSummary>(user ? '/affiliate/summary' : null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function addAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/addresses', 'POST', Object.fromEntries(new FormData(e.currentTarget).entries()));
      setAdding(false);
      addresses.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api('/auth/logout', 'POST');
    refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <section className="section narrow">
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để xem hồ sơ tài khoản NEXORA.</Notice>
      </section>
    );
  }

  const activeVouchers = (tradeIns.data ?? []).filter(t => t.status === 'APPROVED' && t.voucherCode);

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />TÀI KHOẢN NEXORA</p>
      <div className="section-heading">
        <div>
          <h1>Xin chào, <em>{user.name}</em></h1>
          <p className="subtle">{user.email} · Vai trò: {user.role}</p>
        </div>
        <button className="button secondary" onClick={logout}><LogOut size={16} />Đăng xuất</button>
      </div>

      {error && <Notice error>{error}</Notice>}

      <div className="stats">
        <div>
          <small>ĐƠN HÀNG</small>
          <Link href="/don-hang" className="row"><Package size={18} /><strong>Xem đơn</strong></Link>
        </div>
        <div>
          <small>VOUCHER TRADE-IN</small>
          <Link href="/trade-in" className="row"><RefreshCw size={18} /><strong>{activeVouchers.length} mã</strong></Link>
        </div>
        <div>
          <small>VAS CARE</small>
          <Link href="/vas-care" className="row"><ShieldCheck size={18} /><strong>{careList.data?.length ?? 0} lịch</strong></Link>
        </div>
        <div>
          <small>ĐỊA CHỈ</small>
          <strong>{addresses.data?.length ?? 0} địa chỉ</strong>
        </div>
      </div>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2>Ví Hoa hồng KOC (Affiliate · Giữ 15 ngày)</h2>
          <button
            type="button"
            className="text-button"
            onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${user.id}`)}
          >
            Sao chép link giới thiệu
          </button>
        </div>
        <p className="subtle" style={{ fontSize: 12 }}>Link giới thiệu: <code>/?ref={user.id}</code> (Nhận 5% hoa hồng đơn giao thành công)</p>
        <div className="stats" style={{ margin: '12px 0' }}>
          <div><small>TẠM GIỮ 15 NGÀY</small><strong>{vnd(affiliate.data?.held ?? 0)}</strong></div>
          <div><small>KHẢ DỤNG</small><strong>{vnd(affiliate.data?.available ?? 0)}</strong></div>
          <div><small>ĐÃ HỦY (HOÀN ĐƠN)</small><strong>{vnd(affiliate.data?.cancelled ?? 0)}</strong></div>
          <div><small>ĐƠN GIỚI THIỆU</small><strong>{affiliate.data?.items.length ?? 0}</strong></div>
        </div>
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2>Voucher Trade-In của bạn</h2>
          <Link href="/trade-in" className="text-button">Gửi Trade-In mới →</Link>
        </div>
        {tradeIns.loading ? <Loading /> : !activeVouchers.length ? (
          <p className="subtle">Chưa có mã Voucher Trade-In khả dụng.</p>
        ) : activeVouchers.map(v => (
          <div key={v.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <strong>{v.voucherCode}</strong>
              <p className="subtle" style={{ margin: 0, fontSize: 12 }}>{v.brand} · {v.itemName}</p>
            </div>
            <strong>{vnd(v.finalValue ?? v.estimatedValue)}</strong>
          </div>
        ))}
      </article>

      <article className="panel">
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2><MapPin size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />Sổ địa chỉ giao hàng</h2>
          <button className="text-button" onClick={() => setAdding(!adding)}>{adding ? 'Đóng' : '+ Thêm địa chỉ'}</button>
        </div>
        {adding && (
          <form onSubmit={addAddress} className="form" style={{ marginBottom: 20 }}>
            <label>Người nhận<input name="recipient" required minLength={2} /></label>
            <label>Số điện thoại<input name="phone" required pattern="0[0-9]{9}" inputMode="tel" /></label>
            <label>Địa chỉ cụ thể<input name="line" required minLength={5} /></label>
            <label>Tỉnh / thành phố<input name="province" required minLength={2} /></label>
            <button className="button" disabled={busy}>Lưu địa chỉ</button>
          </form>
        )}
        {addresses.loading ? <Loading /> : !addresses.data?.length ? (
          <p className="subtle">Chưa có địa chỉ giao hàng nào.</p>
        ) : addresses.data.map(a => (
          <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
            <strong>{a.recipient} · {a.phone}</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)' }}>{a.line}, {a.province}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
