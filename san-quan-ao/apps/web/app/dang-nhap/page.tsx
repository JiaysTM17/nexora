'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  if (user) return (
    <section className="auth-card">
      <h1>Chào {user.name}</h1>
      <p>Bạn đang đăng nhập với {user.email}.</p>
      <button className="button" onClick={async () => { await api('/auth/logout', 'POST'); refresh(); }}>Đăng xuất</button>
    </section>
  );

  return (
    <section className="auth-card">
      <p className="eyebrow">CHÀO BẠN ĐẾN VỚI NEXORA</p>
      <h1>Rất vui được gặp lại.</h1>
      <p>Lưu món yêu thích, chia sẻ cách phối và theo dõi đơn của bạn.</p>
      <form onSubmit={submit} className="form">
        <label>Email<input name="email" type="email" required autoComplete="email"/></label>
        <label>Mật khẩu<input name="password" type="password" required minLength={6} maxLength={128} autoComplete="current-password"/></label>
        {error && <Notice error>{error}</Notice>}
        <button disabled={busy} className="button">{busy ? 'Đang xử lý…' : 'Đăng nhập'}</button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
        Chưa có tài khoản? <Link href="/dang-ky" className="text-button">Đăng ký tài khoản mới</Link>
      </p>
    </section>
  );
}
