'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Store, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api';
import { Notice, useUser } from '../ui';

export default function Login() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const { user, refresh } = useUser(), router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); const d = new FormData(e.currentTarget);
    try {
      await api('/auth/login', 'POST', { email: d.get('email'), password: d.get('password') });
      refresh();
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function quickLogin(email: string, pass: string) {
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', 'POST', { email, password: pass });
      refresh();
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (user) return (
    <section className="auth-card" style={{ maxWidth: 520, margin: '40px auto', background: '#FFFFFF', padding: '36px 40px', border: '1px solid var(--line)', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
      <p className="eyebrow" style={{ color: 'var(--gold-dark)', marginBottom: 8 }}>NEXORA ATELIER PASSPORT</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 8px' }}>Chào mừng trở lại, {user.name}</h1>
      <p className="subtle" style={{ margin: '0 0 24px', fontSize: 13 }}>
        Bạn đang hoạt động với tài khoản <strong>{user.email}</strong> · Phân quyền: <span className="badge" style={{ background: user.role === 'ADMIN' ? 'var(--gold-dark)' : '#141413', color: '#fff' }}>{user.role}</span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <Link href="/tai-khoan" className="button" style={{ justifyContent: 'center' }}>
          <Sparkles size={16} /> Vào Kho Thời Trang &amp; Số Đo Cá Nhân
        </Link>
        {(user.role === 'ADMIN' || user.email.includes('seller')) && (
          <Link href="/seller" className="button secondary" style={{ justifyContent: 'center' }}>
            <Store size={16} /> Vào Không Gian Người Bán (Shop Studio)
          </Link>
        )}
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="button secondary" style={{ justifyContent: 'center', borderColor: 'var(--gold-dark)', color: 'var(--gold-dark)' }}>
            <ShieldCheck size={16} /> Vào Cổng Quản Trị Sàn Toàn Diện
          </Link>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, textAlign: 'center' }}>
        <button
          className="button subtle"
          style={{ fontSize: 12, color: 'var(--muted)' }}
          onClick={async () => { await api('/auth/logout', 'POST'); refresh(); }}
        >
          Đăng xuất phiên hiện tại
        </button>
      </div>
    </section>
  );

  return (
    <section className="auth-card" style={{ maxWidth: 520, margin: '40px auto', background: '#FFFFFF', padding: '36px 40px', border: '1px solid var(--line)', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
      <p className="eyebrow" style={{ color: 'var(--gold-dark)', marginBottom: 8 }}>NEXORA ATELIER SIGN IN</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 8px' }}>Rất vui được gặp lại bạn.</h1>
      <p className="subtle" style={{ margin: '0 0 24px', fontSize: 13 }}>Lưu món đồ yêu thích, sở hữu bản phối AI và theo dõi hành trình trang phục.</p>

      {/* Demo 1-Click Login Pills */}
      <div style={{ marginBottom: 24, padding: '16px 18px', background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'block', marginBottom: 10 }}>
          ✦ Đăng Nhập Nhanh Trải Nghiệm (1-Click Demo)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            style={{ fontSize: 11.5, padding: '7px 10px', background: '#fff', borderColor: 'var(--line)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
            onClick={() => quickLogin('user@nexora.vn', 'user123')}
          >
            <UserCheck size={14} color="var(--gold-dark)" /> Khách Hàng VIP
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            style={{ fontSize: 11.5, padding: '7px 10px', background: '#fff', borderColor: 'var(--line)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
            onClick={() => quickLogin('seller.a@mac.local', 'MacLocal2026!')}
          >
            <Store size={14} color="var(--gold-dark)" /> Gian Hàng NÉP
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            style={{ fontSize: 11.5, padding: '7px 10px', background: '#fff', borderColor: 'var(--line)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
            onClick={() => quickLogin('admin@nexora.vn', 'admin123')}
          >
            <ShieldCheck size={14} color="var(--gold-dark)" /> Quản Trị Sàn
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="form">
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="ten-cua-ban@domain.com"/>
        </label>
        <label>
          Mật khẩu
          <input name="password" type="password" required minLength={6} maxLength={128} autoComplete="current-password" placeholder="••••••••"/>
        </label>
        {error && <Notice error>{error}</Notice>}
        <button disabled={busy} className="button" style={{ marginTop: 8 }}>
          {busy ? 'Đang xác thực…' : 'Đăng Nhập Ngay'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        Chưa có tài khoản? <Link href="/dang-ky" className="text-button" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Tạo tài khoản mới</Link>
      </p>
    </section>
  );
}
