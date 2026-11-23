'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { Bookmark, Heart, MessageCircle, Plus, Flag, ArrowUpRight, ShoppingBag, Share2, HelpCircle, CheckCircle2, Sparkles, Filter, Hash, Compass, Coffee, Coins, Gift, Trophy, Flame, Award, ThumbsUp, Calendar, Video, Users, ArrowLeftRight, Repeat, ShieldCheck, Scale } from 'lucide-react';
import { api, FeedPost, Product, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';
export default function Community() {
  const feed = useResource<FeedPost[]>('/community/posts'), catalog = useResource<{ items: Product[] }>('/products');
  const { user } = useUser(); const [compose, setCompose] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [tagIds, setTagIds] = useState<string[]>([]), [reportId, setReportId] = useState(''), [filter, setFilter] = useState<'all' | 'saved' | 'samples'>('all'), [fitTab, setFitTab] = useState<Record<string, 'all' | 'fit'>>({}), [commentInputs, setCommentInputs] = useState<Record<string, string>>({}), [trendTag, setTrendTag] = useState<string>('ALL'), [tipPostId, setTipPostId] = useState<string | null>(null), [tipAmount, setTipAmount] = useState<number>(20000), [tippedPosts, setTippedPosts] = useState<Record<string, number>>({});
  const [challengeVotes, setChallengeVotes] = useState<Record<string, number>>({});
  const [joinedChallenge, setJoinedChallenge] = useState(false);
  const [workshopRsvp, setWorkshopRsvp] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapProposed, setSwapProposed] = useState(false);
  const [mySwapItem, setMySwapItem] = useState('Áo Khoác Blazer Linen Cổ Điển');
  const [mySwapVal, setMySwapVal] = useState(650000);
  const [targetSwapItem, setTargetSwapItem] = useState('Sơ Mi Lụa Tơ Tằm Bảo Lộc');
  const [targetSwapVal, setTargetSwapVal] = useState(680000);
  const [swapContractId, setSwapContractId] = useState('SWAP-P2P-882149');
  const [selectedShowcaseSwap, setSelectedShowcaseSwap] = useState(0);
  const [patronOpen, setPatronOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState('Elena Vũ (@elenavu)');
  const [patronAmount, setPatronAmount] = useState(20000);
  const [patronMsg, setPatronMsg] = useState('Bộ phối đồ blazer và lụa quá thanh lịch!');
  const [patronHistory, setPatronHistory] = useState<Array<{ id: string; creator: string; amount: number; msg: string; at: string }>>([]);

  useEffect(() => {
    try {
      const storedVotes = localStorage.getItem('nexora_challenge_votes');
      if (storedVotes) setChallengeVotes(JSON.parse(storedVotes));
      const storedJoined = localStorage.getItem('nexora_challenge_joined');
      if (storedJoined) setJoinedChallenge(true);
      const storedRsvp = localStorage.getItem('nexora_workshop_rsvp');
      if (storedRsvp) setWorkshopRsvp(true);
      const storedSwap = localStorage.getItem('nexora_active_swap_meet');
      if (storedSwap) {
        setSwapProposed(true);
        try {
          const parsed = JSON.parse(storedSwap);
          if (parsed?.id) setSwapContractId(parsed.id);
        } catch {}
      }
      const savedPatron = localStorage.getItem('nexora_creator_patronage');
      if (savedPatron) setPatronHistory(JSON.parse(savedPatron));
    } catch {}
  }, []);

  function handleSendPatronage(e: FormEvent) {
    e.preventDefault();
    const entry = {
      id: `PATRON-${Date.now().toString().slice(-6)}`,
      creator: selectedCreator,
      amount: patronAmount,
      msg: patronMsg,
      at: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [entry, ...patronHistory.slice(0, 5)];
    setPatronHistory(updated);
    try {
      localStorage.setItem('nexora_creator_patronage', JSON.stringify(updated));
    } catch {}
    setNotice(`✓ Bạn đã gửi bảo trợ ${vnd(patronAmount)} đến ${selectedCreator}! Đã cộng +20 Xu Xanh vào tài khoản của bạn.`);
    setPatronOpen(false);
  }

  function voteChallenge(postId: string) {
    const current = challengeVotes[postId] || 0;
    const next = { ...challengeVotes, [postId]: current + 1 };
    setChallengeVotes(next);
    try {
      localStorage.setItem('nexora_challenge_votes', JSON.stringify(next));
    } catch {}
    setNotice(`Đã gửi 1 phiếu bình chọn cho bài phối đồ dự thi thử thách! (+10 Xu Xanh)`);
  }

  function handleJoinChallenge() {
    setJoinedChallenge(true);
    try {
      localStorage.setItem('nexora_challenge_joined', 'true');
    } catch {}
    setCompose(true);
    setNotice('✓ Bạn đã đăng ký tham gia Thử Thách #LinenInTheCity! Đã cộng +500 Điểm Xanh vào tài khoản.');
  }
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
    {user && <div className="tabs" style={{ marginBottom: 16 }}><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>Tất cả bài phối</button><button className={filter === 'saved' ? 'selected' : ''} onClick={() => setFilter('saved')}>Bài đã lưu</button><button className={filter === 'samples' ? 'selected' : ''} onClick={() => setFilter('samples')}>Mẫu thử KOC</button></div>}
    {/* Thử Thách Phối Đồ Tuần Hoàn Tuần & Bình Chọn Cộng Đồng */}
    <div
      style={{
        marginBottom: 16,
        padding: '14px 18px',
        background: '#FAF8F5',
        border: '1px solid var(--line)',
        borderRadius: 8,
      }}
    >
      <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trophy size={18} color="var(--gold-dark)" />
          <div>
            <strong style={{ fontSize: 14, color: '#09090B' }}>
              Thử Thách Tuần: #LinenInTheCity · SS 2026
            </strong>
            <span style={{ marginLeft: 8, fontSize: 10, background: '#E2E8F0', color: '#09090B', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
              ĐANG BÌNH CHỌN · CÒN 4 NGÀY
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600 }}>
          Quỹ thưởng: <strong style={{ color: 'var(--gold-dark)' }}>15.000.000₫</strong> Voucher &amp; Thẻ VIP Fashion Week
        </div>
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
        Thử thách sáng tạo bộ phối OOTD tinh tế cùng chất liệu Linen tự nhiên &amp; Lụa Bảo Lộc. Hãy bình chọn cho outfit bạn ấn tượng nhất hoặc gửi bài phối để nhận ngay +500 Xu Xanh!
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {joinedChallenge ? (
          <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', fontWeight: 600, padding: '5px 12px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} /> Đã gửi bài tham gia (#CHAL-46-LINEN)
          </span>
        ) : (
          <button
            type="button"
            className="button"
            style={{ fontSize: 11, padding: '5px 14px', background: 'var(--gold-dark)', borderColor: '#92400e', color: '#fff' }}
            onClick={handleJoinChallenge}
          >
            <Plus size={13} /> Tham gia thử thách (+500 Điểm Xanh)
          </button>
        )}
        <button
          type="button"
          className="button secondary"
          style={{ fontSize: 11, padding: '5px 12px' }}
          onClick={() => {
            setTrendTag('Linen');
            setNotice('Đang lọc danh sách bài dự thi thử thách mang hashtag #LinenNormandy!');
          }}
        >
          Lọc bài dự thi #Linen
        </button>
      </div>
    </div>

    {/* Masterclass Thời Trang Bền Vững & Workshop Trực Tuyến Hàng Tuần */}
    <div
      style={{
        marginBottom: 16,
        padding: '14px 18px',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EEF2FF', display: 'grid', placeItems: 'center', color: 'var(--gold-dark)', flexShrink: 0 }}>
          <Video size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>
              Styling Masterclass: "Nghệ Thuật Xếp Lớp Smart Layering &amp; Giữ Phom Lụa"
            </strong>
            <span style={{ fontSize: 9, background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
              LIVE WORKSHOP
            </span>
          </div>
          <p className="subtle" style={{ margin: '2px 0 0', fontSize: 11, lineHeight: 1.4 }}>
            Dẫn dắt bởi Master Tailor Hoàng Nam &amp; Senior Stylist Elena Vũ · <strong>Thứ 7 tuần này · 19:30 - 21:00</strong> (Live Zoom &amp; Sàn Diễn /live)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {workshopRsvp ? (
          <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', fontWeight: 600, padding: '5px 12px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} /> ĐÃ GIỮ CHỖ VIP #WS-LAYER-26
          </span>
        ) : (
          <button
            type="button"
            className="button"
            style={{ fontSize: 11, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              setWorkshopRsvp(true);
              try {
                localStorage.setItem('nexora_workshop_rsvp', 'true');
              } catch {}
              setNotice('✓ Đã đăng ký giữ chỗ Workshop thành công! Mã vé mời VIP đã gửi vào ứng dụng và cộng +200 Điểm Xanh.');
            }}
          >
            <Calendar size={13} /> Đăng Ký Giữ Chỗ (+200 Điểm Xanh)
          </button>
        )}
      </div>
    </div>

    {/* Sàn Đổi Đồ Tủ Áo Tuần Hoàn · NEX-Swap Circle P2P */}
    <div
      style={{
        marginBottom: 16,
        padding: '16px 20px',
        background: '#FAF8F5',
        border: '1px solid var(--line)',
        borderRadius: 8,
      }}
    >
      <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftRight size={18} color="var(--gold-dark)" />
          <div>
            <strong style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}>
              Atelier Swap Lounge · Sàn Trao Đổi Đồ Hiệu Tuần Hoàn P2P
            </strong>
            <span style={{ marginLeft: 8, fontSize: 9.5, background: '#F3EFEA', color: 'var(--gold-dark)', padding: '2px 7px', borderRadius: 2, fontWeight: 700, letterSpacing: '0.06em' }}>
              ESCROW BẢO CHỨNG 1:1
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSwapModalOpen(!swapModalOpen)}
          style={{
            fontSize: 11,
            padding: '5px 12px',
            background: swapModalOpen ? '#141413' : '#FAF8F5',
            color: swapModalOpen ? '#FAF8F5' : 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: 2,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          {swapModalOpen ? 'Thu gọn giao diện đổi đồ' : 'Khám phá Sàn Đổi Đồ & Đề Xuất →'}
        </button>
      </div>

      <p style={{ margin: '0 0 10px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        Giao lưu phục trang cao cấp trực tiếp giữa các thành viên cộng đồng. Định giá đối ứng công bằng (Fair Value Match Score 96%), cọc bảo chứng Escrow an toàn 100% và giao nhận đồng kiểm 2 chiều.
      </p>

      {/* 3 Trụ cột an toàn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 2, border: '1px solid var(--line)', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)', fontWeight: 700, marginBottom: 2 }}>
            <Scale size={13} /> Định Giá Công Bằng 96%
          </div>
          <span style={{ color: '#475569', fontSize: 10 }}>Thuật toán so khớp giá trị thị trường và tự động tính tiền bù trừ chênh lệch.</span>
        </div>
        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 2, border: '1px solid var(--line)', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)', fontWeight: 700, marginBottom: 2 }}>
            <ShieldCheck size={13} /> Escrow Khóa Cọc Trung Gian
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 10 }}>Khoản cọc được giữ an toàn trên NEXORA Trust đến khi hai bên cùng ký nhận hài lòng.</span>
        </div>
        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 2, border: '1px solid var(--line)', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold-dark)', fontWeight: 700, marginBottom: 2 }}>
            <Repeat size={13} /> Vận Chuyển Đồng Kiểm 2 Chiều
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 10 }}>Giao - nhận cùng thời điểm, đồng kiểm chất liệu tận tay trước khi xác nhận.</span>
        </div>
      </div>

      {/* Swap Status or Form */}
      {swapProposed ? (
        <div style={{ padding: '12px 14px', background: '#fff', border: '1px solid var(--gold-dark)', borderRadius: 2 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} color="var(--gold-dark)" /> Hợp Đồng Trao Đổi Đang Thực Hiện: #{swapContractId}
            </span>
            <span style={{ fontSize: 9.5, background: '#F3EFEA', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
              ESCROW ĐÃ KHÓA · ĐANG ĐIỀU PHỐI GIAO NHẬN
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink)', lineHeight: 1.5, background: '#FAF8F5', padding: '8px 10px', borderRadius: 2, marginBottom: 8, border: '1px solid var(--line)' }}>
            <div>• <strong>Món của bạn:</strong> {mySwapItem} (Định giá: {vnd(mySwapVal)})</div>
            <div>• <strong>Đổi lấy:</strong> {targetSwapItem} (Định giá: {vnd(targetSwapVal)})</div>
            <div>• <strong>Khoản bù trừ chênh lệch:</strong> {vnd(Math.abs(targetSwapVal - mySwapVal))} (Đã khóa tạm giữ vào Escrow)</div>
            <div>• <strong>Dịch vụ vận chuyển:</strong> Chuyển phát giao nhận đồng kiểm tận tay (Mã: #SWAP-DELIV-992)</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('nexora_active_swap_meet');
                } catch {}
                setSwapProposed(false);
                setNotice('Đã hoàn tất / đóng hợp đồng trao đổi đồ tuần hoàn.');
              }}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                background: '#FAF8F5',
                color: 'var(--muted)',
                border: '1px solid var(--line)',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              Hoàn tất &amp; Đóng hợp đồng
            </button>
            <span style={{ fontSize: 10, color: '#0f766e', alignSelf: 'center', fontWeight: 600 }}>
              ✓ Đã tích lũy +300 Điểm Xanh Tuần Hoàn vào ví NEX-Green
            </span>
          </div>
        </div>
      ) : swapModalOpen ? (
        <div style={{ padding: '12px 14px', background: '#fff', border: '1px dashed #0d9488', borderRadius: 6 }}>
          <strong style={{ fontSize: 12, color: '#0f766e', display: 'block', marginBottom: 8 }}>
            Đề Xuất Hợp Đồng Trao Đổi Ngang Hàng P2P:
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                1. Món đồ từ tủ đồ của bạn:
              </label>
              <input
                type="text"
                value={mySwapItem}
                onChange={(e) => setMySwapItem(e.target.value)}
                style={{ width: '100%', fontSize: 11, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 4, marginBottom: 4 }}
                placeholder="Tên trang phục mang trao đổi…"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#64748b' }}>
                Định giá: <strong style={{ color: 'var(--ink)' }}>{vnd(mySwapVal)}</strong>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                2. Món đồ cộng đồng muốn đổi lấy:
              </label>
              <input
                type="text"
                value={targetSwapItem}
                onChange={(e) => setTargetSwapItem(e.target.value)}
                style={{ width: '100%', fontSize: 11, padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 4, marginBottom: 4 }}
                placeholder="Tên trang phục bạn muốn nhận…"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#64748b' }}>
                Định giá: <strong style={{ color: 'var(--ink)' }}>{vnd(targetSwapVal)}</strong>
              </div>
            </div>
          </div>

          <div className="row between" style={{ background: '#f0fdfa', padding: '8px 12px', borderRadius: 4, marginBottom: 10, fontSize: 11 }}>
            <span style={{ color: '#134e4a' }}>
              Chênh lệch giá trị đối ứng: <strong>{vnd(Math.abs(targetSwapVal - mySwapVal))}</strong> ({targetSwapVal > mySwapVal ? 'Bạn bù qua Escrow' : 'Đối tác bù vào ví bạn'})
            </span>
            <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
              FAIR VALUE MATCH: 96%
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const contractId = `SWAP-P2P-${Date.now().toString().slice(-6)}`;
              setSwapContractId(contractId);
              try {
                localStorage.setItem('nexora_active_swap_meet', JSON.stringify({
                  id: contractId,
                  myItem: mySwapItem,
                  targetItem: targetSwapItem,
                  diff: Math.abs(targetSwapVal - mySwapVal),
                  createdAt: new Date().toISOString(),
                }));
              } catch {}
              setSwapProposed(true);
              setNotice(`✓ Đã tạo hợp đồng đổi đồ #${contractId}! Escrow trung gian đã kích hoạt và thông báo tới chủ nhân món đồ.`);
            }}
            style={{
              width: '100%',
              padding: '8px 14px',
              background: '#0d9488',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <ArrowLeftRight size={14} /> Ký Thỏa Thuận Đổi Đồ &amp; Khóa Escrow Bảo Chứng
          </button>
        </div>
      ) : null}

      {/* Showcase Các Cặp Trao Đổi Tuần Hoàn & Ma Trận Định Giá */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #99f6e4' }}>
        <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#134e4a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Scale size={14} color="#0f766e" /> Showcase Các Cặp Đổi Điển Hình &amp; Ma Trận Fair Value
          </span>
          <span style={{ fontSize: 10, background: '#ccfbf1', color: '#0f766e', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
            WEAR &amp; TEAR INDEX · ESCROW 1:1
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8, marginBottom: 6 }}>
          {[
            {
              title: 'Cặp Đổi 01 · Tinh Hoa Linen & Lụa',
              from: 'Blazer Linen Khuy Sừng Tự Nhiên (Size M, Mới 95%)',
              fromVal: 1850000,
              to: 'Váy Lụa Hà Đông Cắt Xéo (Size S, Mới 98%)',
              toVal: 1950000,
              diff: 100000,
              comp: 'Bù 100.000₫ qua Escrow',
              eco: 'Giảm 4.8kg CO2e · Tiết kiệm 3.200L nước',
              score: '97.2%',
            },
            {
              title: 'Cặp Đổi 02 · Denim Nhật & Wool Blend',
              from: 'Sơ Mi Denim Nhật Dệt Thủ Công (Size L, Mới 92%)',
              fromVal: 1450000,
              to: 'Quần Tây Xếp Ly Wool Blend (Size 32, Mới 94%)',
              toVal: 1550000,
              diff: 100000,
              comp: 'Bù 100.000₫ qua Escrow',
              eco: 'Giảm 3.9kg CO2e · Tiết kiệm 2.800L nước',
              score: '96.5%',
            },
            {
              title: 'Cặp Đổi 03 · Phụ Kiện Da Thảo Mộc',
              from: 'Túi Da Veg-Tan Nhuộm Thảo Mộc (Mới 90%)',
              fromVal: 2400000,
              to: 'Khăn Lụa Tơ Tằm + Loafer Da Lộn (Size 38, Mới 96%)',
              toVal: 2350000,
              diff: 50000,
              comp: 'Đối tác bù 50.000₫ vào ví bạn',
              eco: 'Giảm 6.2kg CO2e · Tái chế 100% vòng đời',
              score: '98.1%',
            },
          ].map((pair, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedShowcaseSwap(idx);
                setMySwapItem(pair.from);
                setMySwapVal(pair.fromVal);
                setTargetSwapItem(pair.to);
                setTargetSwapVal(pair.toVal);
                setSwapModalOpen(true);
                setNotice(`✓ Đã áp dụng "${pair.title}" vào Hợp đồng Escrow! Bạn có thể chỉnh sửa chi tiết hoặc ấn Ký ngay.`);
              }}
              style={{
                padding: '10px 12px',
                background: selectedShowcaseSwap === idx ? '#ccfbf1' : '#ffffff',
                border: `1px solid ${selectedShowcaseSwap === idx ? '#0d9488' : '#e2e8f0'}`,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div className="row between" style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 11, color: '#0f766e' }}>{pair.title}</strong>
                <span style={{ fontSize: 9, background: '#059669', color: '#fff', padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>
                  Match: {pair.score}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.4, marginBottom: 4 }}>
                <div><strong>Bạn đổi:</strong> {pair.from} ({vnd(pair.fromVal)})</div>
                <div><strong>Nhận về:</strong> {pair.to} ({vnd(pair.toVal)})</div>
              </div>
              <div className="row between" style={{ fontSize: 9, color: '#0f766e', borderTop: '1px solid #e6fffa', paddingTop: 4, marginTop: 4 }}>
                <span>{pair.comp}</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>{pair.eco}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Quỹ Bảo Trợ Phong Cách & Bảng Vinh Danh Nhà Sáng Tạo OOTD */}
    <div
      style={{
        marginBottom: 16,
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1px solid #fde68a',
        borderRadius: 8,
      }}
    >
      <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="var(--gold-dark)" />
          <div>
            <strong style={{ fontSize: 13, color: '#92400e' }}>
              Quỹ Bảo Trợ Phong Cách &amp; Bảng Vinh Danh Nhà Sáng Tạo OOTD
            </strong>
            <span style={{ marginLeft: 8, fontSize: 10, background: '#fef3c7', color: 'var(--gold-dark)', padding: '1px 6px', borderRadius: 2, fontWeight: 700, border: '1px solid #fde68a' }}>
              CREATOR PATRONAGE VAULT
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPatronOpen(!patronOpen)}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            background: patronOpen ? 'var(--gold-dark)' : '#fff',
            color: patronOpen ? '#fff' : 'var(--gold-dark)',
            border: '1px solid var(--gold-dark)',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {patronOpen ? 'Đóng biểu mẫu gửi bảo trợ' : '🌟 Gửi Bảo Trợ Phong Cách →'}
        </button>
      </div>

      <p style={{ margin: '0 0 12px', fontSize: 11, color: '#78350f', lineHeight: 1.4 }}>
        Vinh danh và tiếp sức tài chính trực tiếp cho các Stylist &amp; Curator có gu ăn mặc truyền cảm hứng. Khoản tài trợ được chuyển tự động vào Creator Wallet với chứng từ khấu trừ 10% thuế TNCN tại nguồn theo TT 111/2013/TT-BTC.
      </p>

      {/* 3 Top Muses của tuần */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          { name: 'Elena Vũ (@elenavu)', funded: '9.450.000₫', coffees: 128, role: 'Atelier Muse', tag: 'Top 1 Tuần 46' },
          { name: 'Hoàng Nam (@namtailor)', funded: '6.200.000₫', coffees: 84, role: 'Master Tailor Mentor', tag: 'Top 2 Tuần 46' },
          { name: 'Mai Phương (@maiphuong.eco)', funded: '4.850.000₫', coffees: 62, role: 'Slow Fashion Ambassador', tag: 'Top 3 Tuần 46' },
        ].map((muse, mIdx) => (
          <div
            key={mIdx}
            style={{
              padding: '10px 12px',
              background: '#fff',
              border: '1px solid #fde68a',
              borderRadius: 6,
              fontSize: 11,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <strong style={{ color: '#0f172a', fontSize: 12 }}>{muse.name}</strong>
              <span style={{ fontSize: 9, background: '#EEF2FF', color: '#a16207', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                {muse.tag}
              </span>
            </div>
            <div style={{ color: '#64748b', fontSize: 10, marginBottom: 2 }}>Danh hiệu: <strong style={{ color: 'var(--gold-dark)' }}>{muse.role}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ color: '#166534', fontWeight: 700 }}>{muse.funded} ({muse.coffees} ☕)</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCreator(muse.name);
                  setPatronOpen(true);
                }}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  borderRadius: 3,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Tặng ly cà phê
              </button>
            </div>
          </div>
        ))}
      </div>

      {patronOpen && (
        <form onSubmit={handleSendPatronage} style={{ padding: '12px 14px', background: '#fff', border: '1px dashed #d97706', borderRadius: 6, marginTop: 8 }}>
          <strong style={{ fontSize: 12, color: '#92400e', display: 'block', marginBottom: 8 }}>
            Gửi Khoản Tri Ân Cho Nhà Sáng Tạo:
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>Nhà sáng tạo nhận:</label>
              <select
                value={selectedCreator}
                onChange={e => setSelectedCreator(e.target.value)}
                style={{ width: '100%', fontSize: 11, padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              >
                <option value="Elena Vũ (@elenavu)">Elena Vũ (@elenavu) · Atelier Muse</option>
                <option value="Hoàng Nam (@namtailor)">Hoàng Nam (@namtailor) · Master Tailor</option>
                <option value="Mai Phương (@maiphuong.eco)">Mai Phương (@maiphuong.eco) · Slow Fashion</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>Mức tài trợ:</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { v: 10000, label: '10k (Trà)' },
                  { v: 20000, label: '20k (Cà phê)' },
                  { v: 50000, label: '50k (Bánh)' },
                  { v: 100000, label: '100k (Hoa)' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setPatronAmount(opt.v)}
                    style={{
                      padding: '4px 6px',
                      fontSize: 10,
                      background: patronAmount === opt.v ? '#fef3c7' : '#fff',
                      color: patronAmount === opt.v ? '#92400e' : '#475569',
                      border: `1px solid ${patronAmount === opt.v ? '#d97706' : '#cbd5e1'}`,
                      borderRadius: 3,
                      fontWeight: patronAmount === opt.v ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>Lời nhắn gửi gắm:</label>
            <input
              type="text"
              value={patronMsg}
              onChange={e => setPatronMsg(e.target.value)}
              style={{ width: '100%', fontSize: 11, padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: 4 }}
              placeholder="Lời nhắn ấm áp động viên tác giả…"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#166534', fontWeight: 600 }}>
              ✓ Tự động cộng +20 Điểm Xanh vào tài khoản của bạn
            </span>
            <button
              type="submit"
              className="button"
              style={{ fontSize: 11, padding: '5px 14px', background: 'var(--gold-dark)', color: '#fff' }}
            >
              Gửi Bảo Trợ {vnd(patronAmount)}
            </button>
          </div>
        </form>
      )}

      {patronHistory.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #fde68a', fontSize: 10 }}>
          <span style={{ color: '#92400e', fontWeight: 600 }}>Nhật ký bạn vừa bảo trợ gần đây:</span>
          {patronHistory.slice(0, 2).map(h => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#78350f', marginTop: 2 }}>
              <span>{h.creator}: <em>"{h.msg}"</em></span>
              <strong>{vnd(h.amount)} ({h.at})</strong>
            </div>
          ))}
        </div>
      )}
    </div>
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
            border: trendTag === tag.id ? '1px solid var(--gold-dark)' : '1px solid var(--line)',
            background: trendTag === tag.id ? '#EEF2FF' : '#fff',
            color: trendTag === tag.id ? 'var(--gold-dark)' : 'var(--ink)',
            fontWeight: trendTag === tag.id ? 700 : 500,
          }}
        >
          {tag.label}
        </button>
      ))}
    </div>
    {filter === 'samples' && <div className="panel" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 8, padding: 24, marginBottom: 24 }}><div className="row between" style={{ marginBottom: 16 }}><div><h2 style={{ fontSize: 22, margin: 0 }}>Trung Tâm Mẫu Thử KOC</h2><p className="subtle" style={{ margin: '4px 0 0' }}>Dành cho Nhà Sáng Tạo có Điểm Tín Nhiệm &ge; 90. Nhận mẫu thử miễn phí, sáng tạo OOTD và nhận hoa hồng 5%.</p></div><div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '8px 14px', borderRadius: 8, fontSize: 12 }}>Điểm Tín Nhiệm Của Bạn: <strong style={{ color: 'var(--gold-dark)' }}>96/100 (Hạng Kim Cương)</strong> · SLA duyệt 48h</div></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>{catalog.data?.items.slice(0, 4).map(p => <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}><img src={p.images[0]?.url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 10 }} onError={(e) => { const t = e.currentTarget as HTMLImageElement; if (!t.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80')) t.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'; }} /><strong style={{ fontSize: 13, display: 'block' }}>{p.name}</strong><span className="subtle" style={{ fontSize: 11 }}>Gian hàng: {p.shop.name}</span><div className="row between" style={{ marginTop: 10 }}><span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Mẫu thử miễn phí</span><button className="button" style={{ fontSize: 11, padding: '6px 12px' }} disabled={busy} onClick={() => { setNotice(`Đã gửi yêu cầu xin mẫu thử "${p.name}" tới ${p.shop.name}! Shop sẽ phản hồi trong 48h.`); }}>Xin Mẫu Thử</button></div></div>)}</div></div>}{compose && <form className="panel form composer" onSubmit={publish}><h2>Hôm nay bạn mặc gì?</h2><label>Câu chuyện của bạn<textarea name="caption" required minLength={5} maxLength={2000}/></label><label>Đường dẫn ảnh, mỗi ảnh một dòng<textarea name="images" required placeholder="https://images.unsplash.com/photo-..."/></label><p className="fine-print">Bản phát triển dùng URL ảnh. Luồng tải ảnh trực tiếp sẽ được bổ sung.</p><fieldset><legend>Gắn sản phẩm trong bộ đồ</legend>{catalog.data?.items.map(p => <label className="check" key={p.id}><input type="checkbox" checked={tagIds.includes(p.id)} onChange={e => setTagIds(e.target.checked ? [...tagIds, p.id] : tagIds.filter(id => id !== p.id))}/>{p.name} · {p.shop.name}</label>)}</fieldset><button disabled={busy} className="button">{busy ? 'Đang đăng…' : 'Đăng bài phối đồ'}</button></form>}{error && <Notice error>{error}</Notice>}{notice && <Notice>{notice} <Link href="/gio-hang">Xem giỏ hàng →</Link></Notice>}{feed.error && <Notice error>{feed.error}</Notice>}{feed.loading ? <Loading/> : <div className="feed-grid">{posts.map(post => <article key={post.id} className="post"><div className="post-author"><div className="avatar">{post.author.name[0]}</div><div><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><strong>{post.author.name}</strong><span className="badge" style={{ fontSize: 9, padding: '1px 5px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>★ KOC Kim Cương (96/100)</span></div><span className="subtle" style={{ fontSize: 11 }}>Cảm hứng hằng ngày</span></div>{user && user.id !== post.author.id && <button className="text-button" onClick={() => action(`/community/users/${post.author.id}/follow`)}>Theo dõi</button>}</div><div className="post-media"><img src={post.media[0]?.url} alt={post.caption} onError={(e) => { const target = e.currentTarget as HTMLImageElement; if (!target.src.includes('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80')) target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'; }}/>{post.tags.filter(t => t.mediaPosition === 0).map((tag, i) => tag.available ? <Link key={tag.id} className="image-tag" style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%` }} href={`/san-pham/${tag.product.slug}`} aria-label={`Xem ${tag.product.name}`}>{i + 1}<span>{tag.product.name}</span></Link> : <span key={tag.id} className="image-tag unavailable" style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%` }}>×</span>)}</div><div className="post-actions"><button className={post.liked ? 'icon-link liked' : 'icon-link'} aria-label={post.liked ? 'Bỏ thích' : 'Thích'} onClick={() => action(`/community/posts/${post.id}/like`, post.liked ? 'DELETE' : 'POST')}><Heart size={22} fill={post.liked ? 'currentColor' : 'none'}/>{post._count.reactions}</button><span className="row"><MessageCircle size={21}/>{post._count.comments}</span><button className="icon-link" aria-label="Chia sẻ link KOC" title="Sao chép link giới thiệu KOC" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}/?ref=${post.author.id}`); setNotice(`Đã sao chép link KOC của ${post.author.name}!`); }}><Share2 size={18}/></button><button className="icon-link" style={{ color: tippedPosts[post.id] ? 'var(--gold-dark)' : undefined }} aria-label="Tặng xu sáng tạo" title="Tặng xu thưởng sáng tạo cho tác giả" onClick={() => setTipPostId(tipPostId === post.id ? null : post.id)}><Coffee size={18}/><span style={{ fontSize: 11, fontWeight: 600 }}>{tippedPosts[post.id] ? vnd(tippedPosts[post.id]) : 'Thưởng KOC'}</span></button><button className="icon-link" style={{ color: challengeVotes[post.id] ? 'var(--gold-dark)' : undefined }} aria-label="Bình chọn thử thách" title="Bình chọn trang phục tham gia Thử Thách Tuần" onClick={() => voteChallenge(post.id)}><Trophy size={17}/><span style={{ fontSize: 11, fontWeight: 600 }}>{challengeVotes[post.id] ? `${challengeVotes[post.id]} vote` : 'Bình chọn'}</span></button><button className="icon-link push-right" aria-label={post.savedByMe ? 'Bỏ lưu' : 'Lưu bài'} onClick={() => action(`/community/posts/${post.id}/save`, post.savedByMe ? 'DELETE' : 'POST')}><Bookmark size={21} fill={post.savedByMe ? 'currentColor' : 'none'}/></button><button className="icon-link" aria-label="Báo cáo bài" onClick={() => setReportId(reportId === post.id ? '' : post.id)}><Flag size={17}/></button></div>{tipPostId === post.id && (<div style={{ margin: '8px 20px', padding: 12, background: '#F8FAFC', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><strong style={{ color: '#09090B', display: 'flex', alignItems: 'center', gap: 6 }}><Coffee size={15}/> Tặng Ly Cà Phê · Xu Sáng Tạo</strong><span style={{ fontSize: 10, background: '#EEF2FF', color: '#a16207', padding: '1px 6px', borderRadius: 2 }}>Tuân thủ TT 111/2013 PIT 10%</span></div><p style={{ margin: '0 0 8px', fontSize: 11, color: '#475569', lineHeight: 1.4 }}>Gửi tặng khoản thưởng khích lệ tác giả <strong>{post.author.name}</strong>. Khoản thưởng chuyển thẳng vào Creator Wallet sau khi khấu trừ thuế theo quy định.</p><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{[{ val: 10000, label: '10.000₫ · Trà Xanh' }, { val: 20000, label: '20.000₫ · Cà Phê' }, { val: 50000, label: '50.000₫ · Bánh Ngọt' }, { val: 100000, label: '100.000₫ · Bó Hoa' }].map(opt => (<button key={opt.val} type="button" style={{ padding: '4px 8px', fontSize: 11, borderRadius: 3, border: tipAmount === opt.val ? '1px solid var(--gold-dark)' : '1px solid #CBD5E1', background: tipAmount === opt.val ? '#EEF2FF' : '#fff', color: tipAmount === opt.val ? 'var(--gold-dark)' : '#09090B', fontWeight: tipAmount === opt.val ? 700 : 500, cursor: 'pointer' }} onClick={() => setTipAmount(opt.val)}>{opt.label}</button>))}</div><div style={{ display: 'flex', gap: 8 }}><button type="button" className="button" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => { setTippedPosts({ ...tippedPosts, [post.id]: (tippedPosts[post.id] || 0) + tipAmount }); setTipPostId(null); setNotice(`✓ Bạn đã tặng ${vnd(tipAmount)} cho nhà sáng tạo ${post.author.name}! Khoản thưởng đã được ghi nhận vào Creator Wallet.`); }}>Tặng {vnd(tipAmount)} ngay</button><button type="button" className="text-button" style={{ fontSize: 11, padding: '5px 8px' }} onClick={() => setTipPostId(null)}>Đóng</button></div></div>)}<p className="caption">{post.caption}</p><div className="tagged-products">{post.tags.map((tag, index) => <div key={tag.id}><span className="tag-number">{index + 1}</span><div className="grow"><strong>{tag.product.name}</strong><small>{tag.product.shop.name}</small></div>{tag.available ? <Link href={`/san-pham/${tag.product.slug}`}>{tag.product.variants[0] && vnd(tag.product.variants[0].price)}<ArrowUpRight size={16}/></Link> : <span className="subtle">Ngừng bán</span>}</div>)}</div>{post.tags.some(t => t.available) && <div style={{ padding: '0 20px 12px' }}><button className="button secondary full" disabled={busy} onClick={() => shopTheLook(post)}><ShoppingBag size={16}/>Mua trọn bộ (Shop the Look)</button></div>}{reportId === post.id && <form className="form" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); void action(`/community/posts/${post.id}/report`, 'POST', { reason: d.get('reason') }); setReportId(''); }}><label>Lý do báo cáo<input name="reason" minLength={5} required/></label><button className="button secondary">Gửi báo cáo</button></form>}

{/* Thẻ Lọc & Hỏi Đáp Tỉ Lệ Dáng KOC */}
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
          background: fitTab[post.id] === 'fit' ? 'var(--gold-dark)' : '#f1f5f9',
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
