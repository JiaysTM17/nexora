'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../api';
import { Notice, useUser } from '../ui';

export default function Register() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const { user, refresh } = useUser(), router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const d = new FormData(e.currentTarget);
    const name = String(d.get('name') ?? '').trim();
    const email = String(d.get('email') ?? '').trim().toLowerCase();
    const password = String(d.get('password') ?? '');
    const confirmPassword = String(d.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 10) {
      setError('Mật khẩu cần tối thiểu 10 ký tự');
      return;
    }

    setBusy(true);
    try {
      await api('/auth/register', 'POST', { name, email, password });
      refresh();
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <section className="auth-card" style={{ maxWidth: 520, margin: '40px auto', background: '#FFFFFF', padding: '36px 40px', border: '1px solid var(--line)', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
        <p className="eyebrow" style={{ color: 'var(--gold-dark)', marginBottom: 8 }}>NEXORA ATELIER PASSPORT</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 8px' }}>Chào mừng {user.name}</h1>
        <p className="subtle" style={{ margin: '0 0 24px', fontSize: 13 }}>Bạn đã đăng nhập với tài khoản <strong>{user.email}</strong>.</p>
        <Link href="/" className="button" style={{ justifyContent: 'center' }}>Về trang chủ khám phá</Link>
      </section>
    );
  }

  return (
    <section className="auth-card" style={{ maxWidth: 520, margin: '40px auto', background: '#FFFFFF', padding: '36px 40px', border: '1px solid var(--line)', borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.03)' }}>
      <p className="eyebrow" style={{ color: 'var(--gold-dark)', marginBottom: 8 }}>NEXORA ATELIER MEMBERSHIP</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, margin: '0 0 8px' }}>Bắt đầu phong cách của bạn.</h1>
      <p className="subtle" style={{ margin: '0 0 24px', fontSize: 13 }}>Tạo tài khoản để lưu trữ số đo cá nhân, bộ sưu tập lookbook và theo dõi đơn may đo.</p>
      <form onSubmit={submit} className="form">
        <label>
          Họ và tên
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Nguyễn Văn A" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="ten-cua-ban@domain.com" />
        </label>
        <label>
          Mật khẩu (tối thiểu 10 ký tự)
          <input name="password" type="password" required minLength={10} maxLength={128} autoComplete="new-password" placeholder="••••••••••" />
        </label>
        <label>
          Xác nhận mật khẩu
          <input name="confirmPassword" type="password" required minLength={10} maxLength={128} autoComplete="new-password" placeholder="••••••••••" />
        </label>
        {error && <Notice error>{error}</Notice>}
        <button disabled={busy} className="button" style={{ marginTop: 8 }}>
          {busy ? 'Đang khởi tạo tài khoản…' : 'Đăng Ký Tài Khoản'}
        </button>
      </form>
      <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        Đã có tài khoản? <Link href="/dang-nhap" className="text-button" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Đăng nhập ngay</Link>
      </p>
    </section>
  );
}
