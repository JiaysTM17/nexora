'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../api';
import { Notice, useUser } from '../ui';
export default function Login() {
  const [register, setRegister] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const { user, refresh } = useUser(), router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); const d = new FormData(e.currentTarget);
    try { await api(`/auth/${register ? 'register' : 'login'}`, 'POST', { email: d.get('email'), password: d.get('password'), ...(register ? { name: d.get('name') } : {}) }); refresh(); router.push('/'); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  if (user) return <section className="auth-card"><h1>Chào {user.name}</h1><p>Bạn đang đăng nhập với {user.email}.</p><button className="button" onClick={async () => { await api('/auth/logout', 'POST'); refresh(); }}>Đăng xuất</button></section>;
  return <section className="auth-card"><p className="eyebrow">CHÀO BẠN ĐẾN VỚI MẶC</p><h1>{register ? 'Bắt đầu câu chuyện của bạn.' : 'Rất vui được gặp lại.'}</h1><p>Lưu món yêu thích, chia sẻ cách phối và theo dõi đơn của bạn.</p><form onSubmit={submit} className="form">{register && <label>Tên của bạn<input name="name" required minLength={2} maxLength={100} autoComplete="name"/></label>}<label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Mật khẩu<input name="password" type="password" required minLength={10} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'}/></label>{error && <Notice error>{error}</Notice>}<button disabled={busy} className="button">{busy ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}</button></form><button className="text-button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button></section>;
}
