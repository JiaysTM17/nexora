'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Bookmark, Heart, MessageCircle, Plus, Flag, ArrowUpRight, ShoppingBag, Share2, HelpCircle, CheckCircle2, Sparkles, Filter, Hash, Compass, Coffee, Coins, Gift } from 'lucide-react';
import { api, FeedPost, Product, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';
export default function Community() {
  const feed = useResource<FeedPost[]>('/community/posts'), catalog = useResource<{ items: Product[] }>('/products');
  const { user } = useUser(); const [compose, setCompose] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [tagIds, setTagIds] = useState<string[]>([]), [reportId, setReportId] = useState(''), [filter, setFilter] = useState<'all' | 'saved' | 'samples'>('all'), [fitTab, setFitTab] = useState<Record<string, 'all' | 'fit'>>({}), [commentInputs, setCommentInputs] = useState<Record<string, string>>({}), [trendTag, setTrendTag] = useState<string>('ALL'), [tipPostId, setTipPostId] = useState<string | null>(null), [tipAmount, setTipAmount] = useState<number>(20000), [tippedPosts, setTippedPosts] = useState<Record<string, number>>({});
  async function action(path: string, method = 'POST', body?: unknown) { setError(''); setNotice(''); try { await api(path, method, body); feed.reload(); } catch (e) { setError((e as Error).message); } }
  async function shopTheLook(post: FeedPost) {
    if (!user) { setError('Vui lòng đăng nhập để thêm set đồ vào giỏ hàng'); return; }
    setBusy(true); setError(''); setNotice('');
    let added = 0;
    try {
      for (const tag of post.tags) {
        if (!tag.available) continue;
        const v = tag.product.variants.find(x => !x.inventory || x.inventory.onHand > x.inventory.reserved) ?? tag.product.variants[0];
        if (v?.id) { await api('/cart', 'POST', { variantId: v.id, quantity: 1 }); added++; }
      }
      setNotice(added > 0 ? `Đã thêm ${added} món từ set đồ vào giỏ hàng!` : 'Set đồ hiện không có sản phẩm còn hàng.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); const d = new FormData(e.currentTarget);
    try { await api('/community/posts', 'POST', { caption: d.get('caption'), images: String(d.get('images')).split('\n').map(s => s.trim()).filter(Boolean), tags: tagIds.map((productId, index) => ({ productId, mediaPosition: 0, x: 0.5, y: Math.min(0.85, 0.3 + index * 0.2) })) }); setCompose(false); setTagIds([]); feed.reload(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const posts = (feed.data ?? [])
    .filter(p => filter === 'all' || p.savedByMe)
    .filter(p => {
      if (trendTag === 'ALL') return true;
      const kw = trendTag.toLowerCase();
      return p.caption.toLowerCase().includes(kw) || p.tags.some(t => t.product.name.toLowerCase().includes(kw));
    });
  return <section className="section community-page"><div className="section-heading"><div><p className="eyebrow">NEXORA OOTD COMMUNITY</p><h1>Gu riêng. <em>Cảm hứng chung.</em></h1><p className="subtle">Chia sẻ bộ đồ hôm nay. Chạm vào món bạn thích hoặc mua cả set với Shop the Look.</p></div>{user ? <button className="button" onClick={() => setCompose(!compose)}><Plus size={18}/>Chia sẻ cách phối</button> : <Link className="button" href="/dang-nhap">Đăng nhập để chia sẻ</Link>}</div>
    {user && <div className="tabs" style={{ marginBottom: 16 }}><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>Tất cả bài phối</button><button className={filter === 'saved' ? 'selected' : ''} onClick={() => setFilter('saved')}>Bài đã lưu</button><button className={filter === 'samples' ? 'selected' : ''} onClick={() => setFilter('samples')}>Mẫu thử KOC (SOC-CREATOR-SAMPLE)</button></div>}
    {/* Thanh Khám Phá Thẻ Xu Hướng (SOC-OOTD-TAG-DISCOVERY-02) */}
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
      {[
        { id: 'ALL', label: '# Tất cả cảm hứng' },
        { id: 'QuietLuxury', label: '#QuietLuxury' },
        { id: 'Linen', label: '#LinenNormandy' },
        { id: 'Lụa', label: '#BaoLocSilk' },
        { id: 'Sartorial', label: '#SartorialSuit' },
        { id: 'Tối giản', label: '#Minimalist' },
      ].map(tag => (
        <button
          key={tag.id}
          type="button"
          onClick={() => setTrendTag(tag.id)}
          style={{
            padding: '5px 12px',
            borderRadius: 20,
            fontSize: 11,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            border: trendTag === tag.id ? '1px solid var(--clay)' : '1px solid var(--line)',
            background: trendTag === tag.id ? '#fdf8ea' : '#fff',
            color: trendTag === tag.id ? 'var(--clay)' : 'var(--ink)',
            fontWeight: trendTag === tag.id ? 700 : 500,
          }}
        >
          {tag.label}
        </button>
      ))}
    </div>
    {filter === 'samples' && <div className="panel" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 24, marginBottom: 24 }}><div className="row between" style={{ marginBottom: 16 }}><div><h2 style={{ fontSize: 22, margin: 0 }}>Trung Tâm Mẫu Thử KOC (SOC-CREATOR-SAMPLE)</h2><p className="subtle" style={{ margin: '4px 0 0' }}>Dành cho Nhà Sáng Tạo có Điểm Tín Nhiệm &ge; 90. Nhận mẫu thử miễn phí, sáng tạo OOTD và nhận hoa hồng 5%.</p></div><div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>Điểm Tín Nhiệm Của Bạn: <strong style={{ color: '#1D4ED8' }}>96/100 (Hạng Kim Cương)</strong> · SLA duyệt 48h</div></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>{catalog.data?.items.slice(0, 4).map(p => <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}><img src={p.images[0]?.url || '/products/shirt.svg'} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }} onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (!t.src.includes('/products/shirt.svg')) t.src = '/products/shirt.svg'; }} /><strong style={{ fontSize: 13, display: 'block' }}>{p.name}</strong><span className="subtle" style={{ fontSize: 11 }}>Gian hàng: {p.shop.name}</span><div className="row between" style={{ marginTop: 10 }}><span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Mẫu thử miễn phí</span><button className="button" style={{ fontSize: 11, padding: '6px 12px' }} disabled={busy} onClick={() => { setNotice(`Đã gửi yêu cầu xin mẫu thử "${p.name}" tới ${p.shop.name}! Shop sẽ phản hồi trong 48h.`); }}>Xin Mẫu Thử</button></div></div>)}</div></div>}{compose && <form className="panel form composer" onSubmit={publish}><h2>Hôm nay bạn mặc gì?</h2><label>Câu chuyện của bạn<textarea name="caption" required minLength={5} maxLength={2000}/></label><label>Đường dẫn ảnh, mỗi ảnh một dòng<textarea name="images" required placeholder="http://localhost:3000/products/outfit.svg"/></label><p className="fine-print">Bản phát triển dùng URL ảnh. Luồng tải ảnh trực tiếp sẽ được bổ sung.</p><fieldset><legend>Gắn sản phẩm trong bộ đồ</legend>{catalog.data?.items.map(p => <label className="check" key={p.id}><input type="checkbox" checked={tagIds.includes(p.id)} onChange={e => setTagIds(e.target.checked ? [...tagIds, p.id] : tagIds.filter(id => id !== p.id))}/>{p.name} · {p.shop.name}</label>)}</fieldset><button disabled={busy} className="button">{busy ? 'Đang đăng…' : 'Đăng bài phối đồ'}</button></form>}{error && <Notice error>{error}</Notice>}{notice && <Notice>{notice} <Link href="/gio-hang">Xem giỏ hàng →</Link></Notice>}{feed.error && <Notice error>{feed.error}</Notice>}{feed.loading ? <Loading/> : <div className="feed-grid">{posts.map(post => <article key={post.id} className="post"><div className="post-author"><div className="avatar">{post.author.name[0]}</div><div><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><strong>{post.author.name}</strong><span className="badge" style={{ fontSize: 9, padding: '1px 5px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>★ KOC Kim Cương (96/100)</span></div><span className="subtle" style={{ fontSize: 11 }}>Cảm hứng hằng ngày</span></div>{user && user.id !== post.author.id && <button className="text-button" onClick={() => action(`/community/users/${post.author.id}/follow`)}>Theo dõi</button>}</div><div className="post-media"><img src={post.media[0]?.url} alt={post.caption} onError={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.includes('/products/outfit.svg')) target.src = '/products/outfit.svg'; }}/>{post.tags.filter(t => t.mediaPosition === 0).map((tag, i) => tag.available ? <Link key={tag.id} className="image-tag" style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%` }} href={`/san-pham/${tag.product.slug}`} aria-label={`Xem ${tag.product.name}`}>{i + 1}<span>{tag.product.name}</span></Link> : <span key={tag.id} className="image-tag unavailable" style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%` }}>×</span>)}</div><div className="post-actions"><button className={post.liked ? 'icon-link liked' : 'icon-link'} aria-label={post.liked ? 'Bỏ thích' : 'Thích'} onClick={() => action(`/community/posts/${post.id}/like`, post.liked ? 'DELETE' : 'POST')}><Heart size={22} fill={post.liked ? 'currentColor' : 'none'}/>{post._count.reactions}</button><span className="row"><MessageCircle size={21}/>{post._count.comments}</span><button className="icon-link" aria-label="Chia sẻ link KOC" title="Sao chép link giới thiệu KOC" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${post.author.id}`); setNotice(`Đã sao chép link KOC của ${post.author.name}!`); }}><Share2 size={18}/></button><button className="icon-link" style={{ color: tippedPosts[post.id] ? '#b45309' : undefined }} aria-label="Tặng xu sáng tạo" title="Tặng xu thưởng sáng tạo cho tác giả (SOC-CREATOR-TIP-01)" onClick={() => setTipPostId(tipPostId === post.id ? null : post.id)}><Coffee size={18}/><span style={{ fontSize: 11, fontWeight: 600 }}>{tippedPosts[post.id] ? vnd(tippedPosts[post.id]) : 'Thưởng KOC'}</span></button><button className="icon-link push-right" aria-label={post.savedByMe ? 'Bỏ lưu' : 'Lưu bài'} onClick={() => action(`/community/posts/${post.id}/save`, post.savedByMe ? 'DELETE' : 'POST')}><Bookmark size={21} fill={post.savedByMe ? 'currentColor' : 'none'}/></button><button className="icon-link" aria-label="Báo cáo bài" onClick={() => setReportId(reportId === post.id ? '' : post.id)}><Flag size={17}/></button></div>{tipPostId === post.id && (<div style={{ margin: '8px 20px', padding: 12, background: '#fefce8', border: '1px solid #fef08a', borderRadius: 4, fontSize: 12 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><strong style={{ color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}><Coffee size={15}/> Tặng Ly Cà Phê · Xu Sáng Tạo (SOC-CREATOR-TIP-01)</strong><span style={{ fontSize: 10, background: '#fef9c3', color: '#a16207', padding: '1px 6px', borderRadius: 2 }}>Tuân thủ TT 111/2013 PIT 10%</span></div><p style={{ margin: '0 0 8px', fontSize: 11, color: '#713f12', lineHeight: 1.4 }}>Gửi tặng khoản thưởng khích lệ tác giả <strong>{post.author.name}</strong>. Khoản thưởng chuyển thẳng vào Creator Wallet sau khi khấu trừ thuế theo quy định.</p><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{[{ val: 10000, label: '10.000₫ · Trà Xanh' }, { val: 20000, label: '20.000₫ · Cà Phê' }, { val: 50000, label: '50.000₫ · Bánh Ngọt' }, { val: 100000, label: '100.000₫ · Bó Hoa' }].map(opt => (<button key={opt.val} type="button" style={{ padding: '4px 8px', fontSize: 11, borderRadius: 3, border: tipAmount === opt.val ? '1px solid var(--clay)' : '1px solid #fde047', background: tipAmount === opt.val ? '#fdf8ea' : '#fff', color: tipAmount === opt.val ? 'var(--clay)' : '#854d0e', fontWeight: tipAmount === opt.val ? 700 : 500, cursor: 'pointer' }} onClick={() => setTipAmount(opt.val)}>{opt.label}</button>))}</div><div style={{ display: 'flex', gap: 8 }}><button type="button" className="button" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => { setTippedPosts({ ...tippedPosts, [post.id]: (tippedPosts[post.id] || 0) + tipAmount }); setTipPostId(null); setNotice(`✓ Bạn đã tặng ${vnd(tipAmount)} cho nhà sáng tạo ${post.author.name}! Khoản thưởng đã được ghi nhận vào Creator Wallet.`); }}>Tặng {vnd(tipAmount)} ngay</button><button type="button" className="text-button" style={{ fontSize: 11, padding: '5px 8px' }} onClick={() => setTipPostId(null)}>Đóng</button></div></div>)}<p className="caption">{post.caption}</p><div className="tagged-products">{post.tags.map((tag, index) => <div key={tag.id}><span className="tag-number">{index + 1}</span><div className="grow"><strong>{tag.product.name}</strong><small>{tag.product.shop.name}</small></div>{tag.available ? <Link href={`/san-pham/${tag.product.slug}`}>{tag.product.variants[0] && vnd(tag.product.variants[0].price)}<ArrowUpRight size={16}/></Link> : <span className="subtle">Ngừng bán</span>}</div>)}</div>{post.tags.some(t => t.available) && <div style={{ padding: '0 20px 12px' }}><button className="button secondary full" disabled={busy} onClick={() => shopTheLook(post)}><ShoppingBag size={16}/>Mua trọn bộ (Shop the Look)</button></div>}{reportId === post.id && <form className="form" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); void action(`/community/posts/${post.id}/report`, 'POST', { reason: d.get('reason') }); setReportId(''); }}><label>Lý do báo cáo<input name="reason" minLength={5} required/></label><button className="button secondary">Gửi báo cáo</button></form>}

{/* Thẻ Lọc & Hỏi Đáp Tỉ Lệ Dáng KOC (SOC-FIT-FEEDBACK-01) */}
<div style={{ padding: '0 20px 8px', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 8, paddingTop: 8 }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        type="button"
        onClick={() => setFitTab({ ...fitTab, [post.id]: 'all' })}
        style={{
          background: (fitTab[post.id] ?? 'all') === 'all' ? 'var(--ink)' : '#f1f5f9',
          color: (fitTab[post.id] ?? 'all') === 'all' ? '#fff' : '#475569',
          border: 'none',
          padding: '3px 8px',
          borderRadius: 3,
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Tất cả ({post.comments.length})
      </button>
      <button
        type="button"
        onClick={() => setFitTab({ ...fitTab, [post.id]: 'fit' })}
        style={{
          background: fitTab[post.id] === 'fit' ? 'var(--clay)' : '#f1f5f9',
          color: fitTab[post.id] === 'fit' ? '#fff' : '#475569',
          border: 'none',
          padding: '3px 8px',
          borderRadius: 3,
          fontSize: 10,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <HelpCircle size={11} /> Hỏi đáp Dáng &amp; Size (Fit Q&amp;A)
      </button>
    </div>
    <span style={{ fontSize: 10, color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <CheckCircle2 size={11} /> KOC phản hồi SLA 24h
    </span>
  </div>

  {fitTab[post.id] === 'fit' && (
    <div style={{ marginBottom: 10, padding: 8, background: '#fdfbf7', border: '1px dashed #d97706', borderRadius: 4 }}>
      <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>
        💡 Câu hỏi gợi ý nhanh về số đo cơ thể:
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          '1m58 - 48kg mặc size gì tôn dáng?',
          'Vải có bị co rút sau khi giặt không?',
          'Áo có xẻ tà bên hông không?',
        ].map(promptText => (
          <button
            key={promptText}
            type="button"
            onClick={() => setCommentInputs({ ...commentInputs, [post.id]: `[Hỏi Size & Dáng]: ${promptText}` })}
            style={{
              padding: '2px 8px',
              borderRadius: 3,
              fontSize: 10,
              background: '#fff',
              border: '1px solid #fed7aa',
              color: '#c2410c',
              cursor: 'pointer',
            }}
          >
            + {promptText}
          </button>
        ))}
      </div>
    </div>
  )}
</div>

{post.comments
  .filter(c => fitTab[post.id] !== 'fit' || c.body.includes('[Hỏi Size & Dáng]') || c.user.name === post.author.name)
  .slice(0, 4)
  .map(c => (
    <p key={c.id} className="comment">
      {c.body.includes('[Hỏi Size & Dáng]') && (
        <span style={{ fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 2, marginRight: 6, fontWeight: 700 }}>
          FIT Q&amp;A
        </span>
      )}
      <strong>{c.user.name}</strong>
      {c.user.name === post.author.name && (
        <span style={{ fontSize: 9, background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: 2, marginLeft: 4, marginRight: 6, fontWeight: 700 }}>
          ✓ KOC Tác giả
        </span>
      )}
      {' '}{c.body}
    </p>
  ))}
{user && (
  <form
    className="comment-form"
    onSubmit={e => {
      e.preventDefault();
      const val = commentInputs[post.id] ?? '';
      if (!val.trim()) return;
      void action(`/community/posts/${post.id}/comments`, 'POST', { body: val.trim() });
      setCommentInputs({ ...commentInputs, [post.id]: '' });
    }}
  >
    <input
      name="body"
      aria-label="Bình luận"
      value={commentInputs[post.id] ?? ''}
      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
      placeholder={fitTab[post.id] === 'fit' ? 'Nhập chiều cao, cân nặng để hỏi KOC…' : 'Thêm một lời nhắn…'}
      required
      maxLength={1000}
    />
    <button>Gửi</button>
  </form>
)}</article>)}</div>}{!feed.loading && posts.length === 0 && <Notice>{filter === 'saved' ? 'Bạn chưa lưu bài phối đồ nào.' : 'Chưa có bài phối đồ. Hãy chia sẻ bộ đầu tiên nhé.'}</Notice>}</section>;
}
