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
      <section className="auth-card">
        <h1>Chào {user.name}</h1>
        <p>Bạn đã đăng nhập với tài khoản {user.email}.</p>
        <Link href="/" className="button">Về trang chủ</Link>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">CHÀO BẠN ĐẾN VỚI NEXORA</p>
      <h1>Bắt đầu câu chuyện của bạn.</h1>
      <p>Tạo tài khoản để lưu món đồ yêu thích, chia sẻ cách phối và theo dõi đơn hàng của bạn.</p>
      <form onSubmit={submit} className="form">
        <label>
          Họ và tên
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Nguyễn Văn A" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="ban@email.com" />
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
        <button disabled={busy} className="button">
          {busy ? 'Đang tạo tài khoản…' : 'Đăng ký tài khoản'}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
        Đã có tài khoản? <Link href="/dang-nhap" className="text-button">Đăng nhập ngay</Link>
      </p>
    </section>
  );
}
