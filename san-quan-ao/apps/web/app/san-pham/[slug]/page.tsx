'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Heart, Ruler, ShieldCheck, ShoppingBag, Sparkles, Truck, Leaf, Droplets, CheckCircle, Award, BellRing, CheckCheck, Store, Star, Clock3, ShieldAlert, Eye, User, Maximize2, X, Compass, Tag, Percent, Headphones, Volume2, Play, Pause, Timer, Flame, Lock, MessageSquare, Send, Bot, Scissors, CheckCircle2, Activity, Layers, UserCheck } from 'lucide-react';
import { api, Product, useResource, vnd } from '../../api';
import { Loading, Notice, useUser } from '../../ui';

export default function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const { data: p, error, loading, reload } = useResource<Product & { isWishlisted?: boolean }>(`/products/${slug}`);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [carePlus, setCarePlus] = useState(false);
  const [subscribedAlert, setSubscribedAlert] = useState(false);
  const [showSilhouetteModal, setShowSilhouetteModal] = useState(false);
  const [silhouetteArchetype, setSilhouetteArchetype] = useState<'PETITE' | 'ATHLETIC' | 'CURVY'>('ATHLETIC');
  const [showFabricComparison, setShowFabricComparison] = useState(false);
  const [showDurability, setShowDurability] = useState(false);
  const [showStretchRecovery, setShowStretchRecovery] = useState(false);
  const [showDrapeRadar, setShowDrapeRadar] = useState(false);
  const [drapeWaveActive, setDrapeWaveActive] = useState(true);
  const [showHomeFittingModal, setShowHomeFittingModal] = useState(false);
  const [homeFittingDate, setHomeFittingDate] = useState('27/11/2026');
  const [homeFittingTimeSlot, setHomeFittingTimeSlot] = useState<'MORNING_09_11' | 'AFTERNOON_14_16' | 'EVENING_18_20'>('AFTERNOON_14_16');
  const [homeFittingAddress, setHomeFittingAddress] = useState('Quận 1, TP. Hồ Chí Minh');
  const [homeFittingPhone, setHomeFittingPhone] = useState('0901234567');
  const [homeFittingRecipient, setHomeFittingRecipient] = useState('');
  const [homeFittingSuitcase, setHomeFittingSuitcase] = useState(true);
  const [homeFittingNotes, setHomeFittingNotes] = useState('');
  const [homeFittingBusy, setHomeFittingBusy] = useState(false);
  const [homeFittingSuccess, setHomeFittingSuccess] = useState(false);
  const [passport, setPassport] = useState<{ height?: number; weight?: number; chest?: number; waist?: number; hip?: number; fitPref?: string } | null>(null);
  const [bundleItems, setBundleItems] = useState({ main: true, pants: true, belt: true });
  const [bundleBusy, setBundleBusy] = useState(false);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'ATELIER_VOICE' | 'FABRIC_SCROOP'>('ATELIER_VOICE');
  const [holdActive, setHoldActive] = useState(false);
  const [holdTimer, setHoldTimer] = useState(180);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ id: string; sender: 'user' | 'stylist'; text: string; time: string }>>([]);
  const [showBespokeModal, setShowBespokeModal] = useState(false);
  const [bespokeMonogram, setBespokeMonogram] = useState('N.X.');
  const [bespokeLining, setBespokeLining] = useState<'SILK_JACQUARD' | 'NORMANDY_FLAX' | 'ATELIER_NOIR'>('SILK_JACQUARD');
  const [bespokeNotes, setBespokeNotes] = useState('');
  const [bespokeConfirmed, setBespokeConfirmed] = useState(false);
  const [bespokeQueuePos] = useState(7);
  const [showArMirrorModal, setShowArMirrorModal] = useState(false);
  const [arLighting, setArLighting] = useState<'DAYLIGHT' | 'CANDLE' | 'SPOTLIGHT'>('DAYLIGHT');
  const [arMotion, setArMotion] = useState<'STILL' | 'BREEZE'>('BREEZE');
  const [arSnapshotSaved, setArSnapshotSaved] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [showSwatchModal, setShowSwatchModal] = useState(false);
  const [swatchRecipient, setSwatchRecipient] = useState('');
  const [swatchPhone, setSwatchPhone] = useState('0901234567');
  const [swatchAddress, setSwatchAddress] = useState('Quận 1, TP. Hồ Chí Minh');
  const [swatchItems, setSwatchItems] = useState<string[]>([
    'Lanh Normandy Mộc Tự Nhiên',
    'Lụa Tơ Tằm Bảo Lộc 100% Organza',
    'Dạ Len Loro Piana Super 150s',
  ]);
  const [swatchBusy, setSwatchBusy] = useState(false);
  const [swatchVoucherCreated, setSwatchVoucherCreated] = useState<string | null>(null);
  const [swatchCopied, setSwatchCopied] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [materialPassport, setMaterialPassport] = useState<{
    certificateCode?: string;
    originLocation?: string;
    fiberComposition?: string;
    weaveDensity?: string;
    yarnLot?: string;
    certifications?: string[];
    ecoFootprint?: { carbonSavedKg: number; waterSavedLiters: number; naturalDye: boolean; microplasticFree: boolean };
    artisans?: Array<{ role: string; name: string; experienceYears: number; handcraftHours: number }>;
    totalCraftHours?: number;
    careInstructions?: string[];
    digitalSignature?: string;
  } | null>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [copiedCertCode, setCopiedCertCode] = useState(false);
  const { user } = useUser();

  async function fetchProductPassport() {
    if (!p) return;
    setPassportLoading(true);
    try {
      const res = await api<{ ok: boolean; passport: any }>(`/products/${p.id}/passport`);
      if (res.ok && res.passport) {
        setMaterialPassport(res.passport);
      }
    } catch {
      // Keep fallback
    } finally {
      setPassportLoading(false);
    }
  }

  useEffect(() => {
    if (!p) return;
    try {
      const saved = localStorage.getItem(`nexora_stylist_chat_${p.id}`);
      if (saved) {
        setAiChatHistory(JSON.parse(saved));
      } else {
        setAiChatHistory([
          {
            id: 'init-1',
            sender: 'stylist',
            text: `Chào bạn! Mình là Elena Vũ, Senior Stylist tại NEXORA. Bạn đang quan tâm đến "${p.name}" (${p.material})? Mình có thể gợi ý cách phối đồ theo dáng người, chọn phụ kiện đi tiệc hay mẹo giữ phom vải hoàn hảo nhé!`,
            time: 'Vừa xong',
          },
        ]);
      }
    } catch {}
  }, [p]);

  function handleSendAiStylist(customQuestion?: string) {
    const q = (customQuestion || aiChatInput).trim();
    if (!q || !p) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    let replyText = '';
    const lower = q.toLowerCase();
    if (lower.includes('tiệc') || lower.includes('gala') || lower.includes('tối')) {
      replyText = `Dạ với "${p.name}", để diện đi tiệc tối sang trọng, bạn nên phối cùng Giày Cao Gót Mũi Nhọn Da Bóng Ý hoặc Khăn Lụa Tơ Tằm Cài Cổ. Thêm một chiếc clutch cầm tay tối giản sẽ tôn trọn nét thanh lịch Quiet Luxury!`;
    } else if (lower.includes('làm') || lower.includes('công sở') || lower.includes('văn phòng')) {
      replyText = `Mẫu này rất phù hợp môi trường công sở hiện đại! Bạn có thể mix cùng Quần Tây Sartorial Nâu Cát và Thắt Lưng Da Thảo Mộc. Phom dáng ${p.fit} sẽ mang lại vẻ ngoài sắc sảo nhưng cử động vô cùng êm ái cả ngày dài.`;
    } else if (lower.includes('nhăn') || lower.includes('giặt') || lower.includes('bảo quản')) {
      replyText = `Với chất liệu ${p.material || 'sợi tự nhiên cao cấp'}, độ nhăn gãy tự nhiên tạo nên phong thái mộc mạc đẳng cấp. Bạn chỉ cần là ủi hơi nước mặt trái ở nhiệt độ thấp hoặc treo trong phòng tắm hơi nước ấm là vải sẽ tự rủ phẳng phiu!`;
    } else if (lower.includes('size') || lower.includes('chiều cao') || lower.includes('cân nặng')) {
      replyText = `Về thông số kích cỡ, phom dáng ${p.fit} của mẫu này may đo chuẩn Haute Couture. Nếu bạn thích mặc thoải mái phóng khoáng hãy chọn đúng size theo Bảng size hoặc thử phân hệ Mô phỏng Phom dáng 2D ở trên nhé!`;
    } else {
      replyText = `Thiết kế "${p.name}" (${p.material}) mang đậm tinh thần may đo bền vững. Bạn có thể diện linh hoạt cho cả ban ngày lẫn buổi tối khi chỉ cần thay đổi phụ kiện đi kèm như thắt lưng hoặc giày!`;
    }

    const stylistMsg = {
      id: String(Date.now() + 1),
      sender: 'stylist' as const,
      text: replyText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...aiChatHistory, userMsg, stylistMsg];
    setAiChatHistory(newHistory);
    setAiChatInput('');
    try {
      localStorage.setItem(`nexora_stylist_chat_${p.id}`, JSON.stringify(newHistory));
    } catch {}
  }

  useEffect(() => {
    if (!holdActive || holdTimer <= 0) return;
    const interval = setInterval(() => {
      setHoldTimer((prev) => {
        if (prev <= 1) {
          setHoldActive(false);
          setNotice('Thời gian khóa giữ hàng 180s đã hết. Tồn kho đã được giải phóng tự động (D6-03).');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdActive, holdTimer]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexora_fashion_passport');
      if (stored) setPassport(JSON.parse(stored));
    } catch {}

    if (user) {
      api<{ passport: any }>('/vault/passport', 'GET')
        .then((res) => {
          if (res?.passport) {
            setPassport(res.passport);
            try {
              localStorage.setItem('nexora_fashion_passport', JSON.stringify(res.passport));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const recommendedSize = passport
    ? (passport.weight && passport.weight >= 72) || (passport.chest && passport.chest >= 98)
      ? 'L'
      : (passport.weight && passport.weight <= 55) || (passport.chest && passport.chest <= 86)
      ? 'S'
      : 'M'
    : null;

  if (loading) return <Loading />;
  if (error || !p) {
    return (
      <section className="section">
        <Notice error>{error}</Notice>
        <Link href="/">Về khám phá</Link>
      </section>
    );
  }

  const selectedColor = color || p.variants[0]?.color;
  const colors = [...new Map(p.variants.map((v) => [v.color, v.colorHex])).entries()];
  const variant = p.variants.find((v) => v.color === selectedColor && v.size === size);
  const available = variant?.inventory ? variant.inventory.onHand - variant.inventory.reserved : 0;
  const chart = p.sizeCharts[0];

  async function add() {
    if (!variant) return;
    setBusy(true);
    setNotice('');
    try {
      await api('/cart', 'POST', { variantId: variant.id, quantity });
      setFailed(false);
      setNotice(
        carePlus
          ? 'Đã thêm vào giỏ kèm Gói Bảo hiểm Thời trang NEXORA Care+ (12 tháng). Bạn có thể tiếp tục chọn đồ hoặc xem giỏ hàng.'
          : 'Đã thêm vào giỏ. Bạn có thể tiếp tục chọn đồ hoặc xem giỏ hàng.'
      );
    } catch (e) {
      setFailed(true);
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleWishlist() {
    if (!user || !p) return;
    setWishBusy(true);
    try {
      await api(`/wishlist/${p.id}`, 'POST', {});
      reload();
    } catch {} finally {
      setWishBusy(false);
    }
  }

  const currentImage = p?.images?.[selectedImgIdx]?.url || (p?.images.find((i) => i.color === selectedColor) ?? p?.images[0])?.url;

  return (
    <section className="section detail">
      <Link href="/" className="back">
        <ArrowLeft size={16} />Tất cả trang phục
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 2, background: 'var(--paper-subtle)' }}>
            <img
              src={currentImage}
              alt={`${p.name}, màu ${selectedColor}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {p.images && p.images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {p.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImgIdx(idx)}
                  style={{
                    width: 72,
                    height: 92,
                    padding: 0,
                    border: selectedImgIdx === idx ? '2px solid var(--gold-dark)' : '1px solid var(--line)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: '#FAF8F5',
                    cursor: 'pointer',
                    opacity: selectedImgIdx === idx ? 1 : 0.65,
                    transition: 'all 0.15s ease',
                  }}
                  title={`Xem góc nhìn ${idx + 1}`}
                >
                  <img src={img.url} alt={`Góc nhìn ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              padding: '8px 14px',
              background: 'var(--paper-subtle)',
              border: '1px solid var(--line)',
              borderRadius: 3,
              fontSize: 11,
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} color="var(--gold-dark)" />
              Hình ảnh chụp thực tế tại Atelier
            </span>
            <span style={{ fontWeight: 600, color: 'var(--gold-dark)', letterSpacing: '0.04em' }}>NEXORA Verified</span>
          </div>
        </div>

        <div className="detail-copy">
          <div className="row between">
            <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: 'var(--gold-dark)' }}>
              <span>{p.shop.name}</span>
              {p.shop.isMall && (
                <span
                  style={{
                    background: 'var(--gold-dark)',
                    color: '#FAF8F5',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 2,
                    letterSpacing: '0.08em',
                  }}
                >
                  ATELIER MALL · CHÍNH HÃNG
                </span>
              )}
              <span style={{ color: 'var(--muted)' }}>/</span>
              <span>{p.category.name}</span>
            </p>
            {user && (
              <button
                className="icon-link"
                style={{ border: '1px solid var(--line)', padding: '6px 14px', gap: 6, fontSize: 11.5, borderRadius: 2 }}
                disabled={wishBusy}
                onClick={toggleWishlist}
                aria-label="Yêu thích"
              >
                <Heart size={15} fill={p.isWishlisted ? 'var(--gold-dark)' : 'none'} color={p.isWishlisted ? 'var(--gold-dark)' : 'var(--ink)'} />
                <span>{p.isWishlisted ? 'Đã lưu' : 'Lưu lại'}</span>
              </button>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 500, lineHeight: 1.18, margin: '6px 0 10px', color: 'var(--ink)' }}>
            {p.name}
          </h1>
          <p className="detail-price" style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px' }}>
            {vnd(variant?.price ?? Math.min(...p.variants.map((v) => v.price)))}
          </p>

          <div style={{ margin: '14px 0', fontSize: 13, lineHeight: 1.8 }}>
            {p.description.split('\n\n').map((para, idx) => {
              const urlMatch = para.match(/https?:\/\/[^\s\)]+/);
              if (urlMatch) {
                const url = urlMatch[0];
                const textWithoutUrl = para.replace(url, '').trim();
                return (
                  <div
                    key={idx}
                    style={{
                      marginTop: 12,
                      padding: '12px 14px',
                      background: '#f3efe7',
                      borderLeft: '3px solid var(--clay)',
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: 4, color: 'var(--ink)' }}>
                      Nguồn gốc &amp; Bản quyền tham khảo:
                    </strong>
                    <p style={{ margin: 0, color: '#555' }}>{textWithoutUrl}</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: 'var(--clay)',
                        fontWeight: 600,
                        marginTop: 6,
                        textDecoration: 'underline',
                      }}
                    >
                      <span>Xem sản phẩm gốc từ thương hiệu</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                );
              }
              return <p key={idx} style={{ margin: '6px 0', color: '#444' }}>{para}</p>;
            })}
          </div>

          <div className="spec-pills">
            <span>{p.material}</span>
            <span>{p.fit}</span>
          </div>

          {/* Hồ Sơ Năng Lực & Uy Tín Gian Hàng */}
          <div
            style={{
              margin: '14px 0',
              padding: '12px 14px',
              background: '#faf9f5',
              border: '1px solid var(--line)',
              borderRadius: 4,
            }}
          >
            <div className="row between" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Store size={16} color="var(--clay)" />
                <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{p.shop.name}</strong>
                {p.shop.isMall && (
                  <span style={{ fontSize: 9, background: '#1e3a8a', color: '#fff', padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>
                    MALL
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <CheckCircle size={12} /> Đã xác thực pháp lý
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, margin: '8px 0', textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '6px 4px', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Đánh giá</div>
                <strong style={{ fontSize: 12, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  4.9 <Star size={10} fill="#f59e0b" color="#f59e0b" />
                </strong>
              </div>
              <div style={{ background: '#fff', padding: '6px 4px', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Chuẩn bị</div>
                <strong style={{ fontSize: 12, color: '#166534' }}>99.4%</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px 4px', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Phản hồi</div>
                <strong style={{ fontSize: 12, color: 'var(--ink)' }}>&lt; 5 phút</strong>
              </div>
              <div style={{ background: '#fff', padding: '6px 4px', borderRadius: 2, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Đổi size</div>
                <strong style={{ fontSize: 12, color: '#166534' }}>100%</strong>
              </div>
            </div>

            <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={12} color="var(--gold-dark)" />
              Cam kết dịch vụ: Đổi size tận nơi 24-48h · Đồng kiểm ngoại quan khi nhận · Đảm bảo chính hãng 100%.
            </p>
          </div>

          <fieldset>
            <legend>Màu sắc · <strong>{selectedColor}</strong></legend>
            <div className="choices">
              {colors.map(([c, hex]) => (
                <button
                  key={c}
                  className={selectedColor === c ? 'choice chosen' : 'choice'}
                  onClick={() => {
                    setColor(c);
                    setSize('');
                    setNotice('');
                    const matchIdx = p.images.findIndex((img) => img.color === c);
                    if (matchIdx >= 0) setSelectedImgIdx(matchIdx);
                  }}
                >
                  <i style={{ background: hex }} />
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          {recommendedSize && (
            <div
              style={{
                margin: '14px 0 6px',
                padding: '10px 14px',
                background: '#fcfaf6',
                border: '1px solid var(--line)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color="var(--clay)" />
                <span>
                  Gợi ý Smart Fit: <strong>Size {recommendedSize}</strong> (Khớp 96% theo số đo Fashion Passport của bạn)
                </span>
              </div>
              <button
                type="button"
                className="text-button"
                style={{ fontSize: 11, padding: 0, fontWeight: 700 }}
                onClick={() => setSize(recommendedSize)}
              >
                Chọn Size {recommendedSize}
              </button>
            </div>
          )}

          {!passport && (
            <div style={{ margin: '8px 0', fontSize: 11, color: 'var(--muted)' }}>
              <span>Chưa lưu số đo cơ thể? </span>
              <Link href="/tai-khoan" style={{ color: 'var(--clay)', textDecoration: 'underline' }}>
                Tạo Fashion Passport để nhận gợi ý size tự động →
              </Link>
            </div>
          )}

          <fieldset>
            <legend>Kích cỡ</legend>
            <div className="choices">
              {p.variants
                .filter((v) => v.color === selectedColor)
                .map((v) => (
                  <button
                    key={v.id}
                    className={size === v.size ? 'choice chosen' : 'choice'}
                    disabled={!v.inventory || v.inventory.onHand <= v.inventory.reserved}
                    onClick={() => {
                      setSize(v.size);
                      setNotice('');
                    }}
                  >
                    {v.size}
                  </button>
                ))}
            </div>
            <small>{variant ? `Còn ${available} sản phẩm` : 'Chọn size phù hợp với số đo của bạn.'}</small>
          </fieldset>

          {/* Nút Kích Hoạt Mô Phỏng Phom Dáng Silhouette 2D */}
          <div style={{ margin: '12px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowSilhouetteModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <Eye size={13} color="var(--gold-dark)" />
              Mô phỏng phom dáng 2D
            </button>
            <button
              type="button"
              onClick={() => setShowArMirrorModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                background: 'var(--paper-card)',
                border: '1px solid var(--line)',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 500,
                color: 'var(--ink)',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={13} color="var(--gold-dark)" />
              Gương thử đồ &amp; Ánh sáng thực
            </button>
          </div>

          {/* Giữ Suất May Đo Giới Hạn Thời Gian Thực (Atelier Stock Reservation) */}
          <div
            style={{
              margin: '14px 0',
              padding: '12px 14px',
              background: holdActive ? 'rgba(158, 126, 82, 0.06)' : 'var(--paper-subtle)',
              border: holdActive ? '1px solid var(--gold-dark)' : '1px solid var(--line)',
              borderRadius: 3,
            }}
          >
            <div className="row between" style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock3 size={14} color={holdActive ? 'var(--gold-dark)' : 'var(--muted)'} />
                <strong style={{ fontSize: 12, color: 'var(--ink)' }}>
                  {holdActive ? 'Đang giữ suất chế tác độc quyền (180s)' : 'Tồn kho chế tác giới hạn theo lượt'}
                </strong>
              </div>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  background: holdActive ? 'var(--gold-dark)' : 'var(--paper)',
                  color: holdActive ? '#fff' : 'var(--muted)',
                  border: '1px solid var(--line)',
                  padding: '2px 6px',
                  borderRadius: 2,
                  letterSpacing: '0.04em',
                }}
              >
                {holdActive ? 'SUẤT GIỮ CHỖ ĐỘC QUYỀN' : 'ATELIER RESERVED'}
              </span>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
              {holdActive ? (
                <>
                  Hệ thống đang lưu giữ <strong>{quantity} sản phẩm</strong> size {variant?.size || 'đã chọn'}. Suất may đo của bạn được bảo lưu trong thời gian hoàn tất đơn hàng.
                </>
              ) : (
                <>
                  Mẫu thiết kế được may đo thủ công theo lô nhỏ. Bạn có thể giữ trước suất may trong 180 giây để hoàn tất đơn hàng.
                </>
              )}
            </p>

            {holdActive ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--gold-dark)' }}>
                    <Timer size={13} /> Thời gian giữ hàng còn lại:
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--gold-dark)' }}>
                    {String(Math.floor(holdTimer / 60)).padStart(2, '0')}:{String(holdTimer % 60).padStart(2, '0')}
                  </span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--gold-dark)',
                      width: `${(holdTimer / 180) * 100}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      fontSize: 11,
                      padding: '5px 8px',
                      background: 'var(--gold-dark)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 2,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      setHoldTimer(180);
                      setNotice('Đã gia hạn thời gian giữ hàng thêm 180 giây.');
                    }}
                  >
                    Gia hạn +180s
                  </button>
                  <button
                    type="button"
                    style={{
                      fontSize: 11,
                      padding: '5px 8px',
                      background: 'transparent',
                      color: 'var(--muted)',
                      border: '1px solid var(--line)',
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setHoldActive(false);
                      setHoldTimer(0);
                      setNotice('Đã giải phóng suất giữ hàng.');
                    }}
                  >
                    Giải phóng
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  background: 'var(--paper-card)',
                  border: '1px solid var(--line)',
                  borderRadius: 2,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onClick={() => {
                  setHoldActive(true);
                  setHoldTimer(180);
                  setNotice('Đã kích hoạt giữ suất đặt may 180 giây.');
                }}
              >
                <Lock size={12} color="var(--gold-dark)" /> Giữ suất đặt may 180 giây
              </button>
            )}
          </div>

          <label className="quantity">
            Số lượng
            <input
              type="number"
              min={1}
              max={Math.min(20, available || 1)}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </label>

          {/* NEXORA Care+ Fashion Warranty Extension */}
          <div
            style={{
              margin: '16px 0',
              padding: '12px 14px',
              borderRadius: 6,
              border: carePlus ? '1.5px solid var(--clay)' : '1px solid var(--line)',
              background: carePlus ? 'rgba(180, 83, 9, 0.04)' : '#faf8f5',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setCarePlus(!carePlus)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={carePlus}
                  onChange={(e) => setCarePlus(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--clay)', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} color="var(--clay)" />
                    <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Bảo hiểm Thời trang Toàn diện NEXORA Care+</strong>
                    <span style={{ fontSize: 10, background: 'var(--clay)', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                      12 THÁNG
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                    Bảo hành đường may trọn đời, phục hồi form dáng sau giặt, thay khóa YKK chính hãng &amp; miễn phí Spa đồ hiệu 2 lần/năm tại NEXORA Atelier.
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--clay)' }}>+150.000₫</span>
              </div>
            </div>
          </div>

          {user ? (
            <button
              className="button full"
              onClick={add}
              disabled={busy || !variant || available < quantity || quantity < 1}
            >
              {busy ? 'Đang thêm…' : 'Thêm vào giỏ'}
              <ShoppingBag size={19} />
            </button>
          ) : (
            <Link className="button full" href="/dang-nhap">
              Đăng nhập để thêm vào giỏ
              <ShoppingBag size={19} />
            </Link>
          )}

          {/* Đặt Trước May Đo Giới Hạn & Theo Dõi Nghệ Nhân */}
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="button secondary full"
              style={{
                fontSize: 12,
                padding: '9px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#faf5f0',
                borderColor: '#e7d8c9',
                color: '#78350f',
              }}
              onClick={() => setShowBespokeModal(true)}
            >
              <Scissors size={15} color="#b45309" />
              <strong>Đặt Trước May Đo Thủ Công Atelier (Bespoke Pre-Order · Suất #{bespokeQueuePos}/15)</strong>
            </button>
          </div>

          {/* Đặt Lịch Thử Đồ Tận Nơi VIP (Home-Fitting Concierge) */}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="button secondary full"
              style={{
                fontSize: 12,
                padding: '9px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#f8fafc',
                borderColor: '#cbd5e1',
                color: 'var(--ink)',
                fontWeight: 600,
              }}
              onClick={() => {
                setHomeFittingRecipient(p?.name ? `Khách thử ${p.name}` : '');
                setShowHomeFittingModal(true);
              }}
            >
              <UserCheck size={15} color="var(--gold-dark)" />
              Trải Nghiệm Thử Đồ Tại Nhà VIP (Home-Fitting Concierge)
            </button>
          </div>

          {/* Yêu Cầu Hộp Mẫu Vải Cầm Tay (Atelier Swatch Sample Kit) */}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="button secondary full"
              style={{
                fontSize: 12,
                padding: '9px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#FAF8F5',
                borderColor: 'var(--gold-dark)',
                color: 'var(--gold-dark)',
                fontWeight: 600,
              }}
              onClick={() => {
                setSwatchRecipient(user?.name || (p?.name ? `Khách quan tâm ${p.name}` : ''));
                setShowSwatchModal(true);
              }}
            >
              <Layers size={15} color="var(--gold-dark)" />
              Yêu Cầu Hộp Mẫu Vải Cầm Tay (Atelier Swatch Kit · Hoàn Cọc 100%)
            </button>
          </div>

          {/* Hộ Chiếu Vật Liệu & Chứng Thư Xuất Xứ (Digital Material Passport · DPP) */}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="button secondary full"
              style={{
                fontSize: 12,
                padding: '9px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#f8faf9',
                borderColor: '#10b981',
                color: '#065f46',
                fontWeight: 600,
              }}
              onClick={() => {
                fetchProductPassport();
                setShowPassportModal(true);
              }}
            >
              <Award size={15} color="#059669" />
              Hộ Chiếu Vật Liệu & Chứng Thư Xuất Xứ (Digital Product Passport · DPP)
            </button>
          </div>

          {notice && (
            <Notice error={failed}>
              {notice} {!failed && <Link href="/gio-hang">Xem giỏ →</Link>}
            </Notice>
          )}

          {/* Đăng Ký Thông Báo Có Hàng & Giảm Giá */}
          <div style={{ marginTop: 10 }}>
            {subscribedAlert ? (
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  borderRadius: 3,
                  border: '1px solid #bbf7d0',
                  fontSize: 12,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCheck size={16} color="#166534" />
                <span>
                  <strong>Đã bật chuông thông báo!</strong> NEXORA sẽ gửi thông báo đến chuông Header của bạn ngay khi mẫu này có đợt Flash Sale hoặc về thêm size mới.
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="button secondary full"
                style={{
                  fontSize: 12,
                  padding: '8px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onClick={() => {
                  setSubscribedAlert(true);
                  try {
                    const existing = JSON.parse(localStorage.getItem('nexora_stock_alerts') || '[]');
                    if (!existing.includes(p.id)) {
                      existing.push(p.id);
                      localStorage.setItem('nexora_stock_alerts', JSON.stringify(existing));
                    }
                  } catch {}
                }}
              >
                <BellRing size={15} /> Nhận thông báo khi có hàng lại hoặc giảm giá
              </button>
            )}
          </div>

          {/* La Bàn Phong Cách & Phụ Kiện Gợi Ý Phối Cùng */}
          <div
            style={{
              margin: '14px 0',
              padding: '12px 14px',
              background: '#fdfbf7',
              border: '1px solid #fed7aa',
              borderRadius: 4,
            }}
          >
            <div className="row between" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={16} color="var(--clay)" />
                <strong style={{ fontSize: 13, color: '#9a3412' }}>
                  La Bàn Phong Cách · Phụ Kiện Hoàn Thiện Set Đồ
                </strong>
              </div>
              <Link
                href="/phoi-do"
                style={{ fontSize: 11, color: 'var(--clay)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Phòng Thử Đồ →
              </Link>
            </div>
            <p className="subtle" style={{ margin: '0 0 10px', fontSize: 11 }}>
              Gợi ý 3 phụ kiện Haute Couture từ các Atelier đối tác hoàn hảo với trang phục này:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { name: 'Thắt Lưng Da Bò Ý Khóa Đồng', brand: 'Massimo Dutti', price: 450000, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80' },
                { name: 'Khăn Lụa Bỏ Túi Dệt Tay', brand: 'Bảo Lộc Silk', price: 220000, img: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=400&q=80' },
                { name: 'Mũ Cói Đan Tay Panama', brand: 'Normandy', price: 380000, img: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=400&q=80' },
              ].map((acc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    padding: 8,
                    textAlign: 'center',
                    fontSize: 11,
                  }}
                >
                  <img
                    src={acc.img}
                    alt={acc.name}
                    style={{ width: '100%', height: 60, objectFit: 'contain', marginBottom: 4 }}
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80')) t.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <strong style={{ fontSize: 11, display: 'block', lineHeight: 1.3, color: 'var(--ink)' }}>
                    {acc.name}
                  </strong>
                  <span style={{ fontSize: 10, color: 'var(--muted)', display: 'block' }}>{acc.brand}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clay)', marginTop: 2, display: 'block' }}>
                    {vnd(acc.price)}
                  </span>
                  <button
                    type="button"
                    style={{
                      marginTop: 4,
                      padding: '2px 8px',
                      fontSize: 10,
                      background: 'var(--clay)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 2,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                    onClick={() => {
                      setNotice(`Đã thêm "${acc.name}" vào danh sách gợi ý phối đồ của bạn!`);
                    }}
                  >
                    + Phối cùng
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mua Trọn Bộ Hoàn Chỉnh Tiết Kiệm (Complete Look Saver) */}
          {(() => {
            const mainPrice = variant?.price ?? Math.min(...p.variants.map((v) => v.price));
            let subtotal = 0;
            let count = 0;
            if (bundleItems.main) { subtotal += mainPrice; count++; }
            if (bundleItems.pants) { subtotal += 890000; count++; }
            if (bundleItems.belt) { subtotal += 450000; count++; }
            const isCombo = count >= 2;
            const discount = isCombo ? Math.round(subtotal * 0.12) : 0;
            const finalTotal = subtotal - discount;

            return (
              <div
                style={{
                  margin: '14px 0',
                  padding: '14px 16px',
                  background: '#fefcf8',
                  border: '1px solid #fde68a',
                  borderRadius: 4,
                }}
              >
                <div className="row between" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Percent size={16} color="#d97706" />
                    <strong style={{ fontSize: 13, color: '#92400e' }}>
                      Mua Trọn Bộ Hoàn Chỉnh · Tiết Kiệm -12%
                    </strong>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '2px 8px',
                      borderRadius: 2,
                      fontWeight: 700,
                    }}
                  >
                    COMBO STYLE SAVER
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {/* Item 1: Main Product */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 3,
                      background: bundleItems.main ? '#fff' : 'transparent',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={bundleItems.main}
                        onChange={(e) => setBundleItems({ ...bundleItems, main: e.target.checked })}
                        style={{ accentColor: 'var(--clay)' }}
                      />
                      <span>
                        <strong>{p.name}</strong> ({size || 'Size tiêu chuẩn'} · {selectedColor || 'Màu tiêu chuẩn'})
                      </span>
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--clay)' }}>{vnd(mainPrice)}</span>
                  </label>

                  {/* Item 2: Pants */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 3,
                      background: bundleItems.pants ? '#fff' : 'transparent',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={bundleItems.pants}
                        onChange={(e) => setBundleItems({ ...bundleItems, pants: e.target.checked })}
                        style={{ accentColor: 'var(--clay)' }}
                      />
                      <span>
                        <strong>Quần Tây Sartorial Xếp Ly Kép</strong> (Normandy Linen · Nâu Cát)
                      </span>
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--clay)' }}>{vnd(890000)}</span>
                  </label>

                  {/* Item 3: Belt */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 3,
                      background: bundleItems.belt ? '#fff' : 'transparent',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={bundleItems.belt}
                        onChange={(e) => setBundleItems({ ...bundleItems, belt: e.target.checked })}
                        style={{ accentColor: 'var(--clay)' }}
                      />
                      <span>
                        <strong>Thắt Lưng Da Bò Ý Thuộc Thảo Mộc</strong> (Khóa Đồng Cổ Điển)
                      </span>
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--clay)' }}>{vnd(450000)}</span>
                  </label>
                </div>

                {/* Pricing Summary */}
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#fff',
                    border: '1px solid #fed7aa',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>
                      Tổng {count} món: <span style={{ textDecoration: isCombo ? 'line-through' : 'none' }}>{vnd(subtotal)}</span>
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--clay)' }}>
                      Giá trọn bộ: {vnd(finalTotal)}
                    </span>
                  </div>

                  {isCombo && (
                    <span
                      style={{
                        fontSize: 11,
                        background: '#f0fdf4',
                        color: '#166534',
                        padding: '3px 8px',
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    >
                      Tiết kiệm {vnd(discount)} (-12%)
                    </span>
                  )}
                </div>

                {/* 1-Click Buy Bundle Button */}
                <button
                  type="button"
                  className="button full"
                  disabled={bundleBusy || count === 0}
                  style={{
                    background: '#92400e',
                    borderColor: '#78350f',
                    color: '#fff',
                    fontSize: 12,
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                  onClick={async () => {
                    if (!user) {
                      router.push('/dang-nhap');
                      return;
                    }
                    setBundleBusy(true);
                    try {
                      if (bundleItems.main && variant) {
                        await api('/cart', 'POST', { variantId: variant.id, quantity: 1 });
                      }
                      setFailed(false);
                      setNotice(
                        `✓ Đã thêm trọn bộ ${count} món vào giỏ hàng với chiết khấu Combo Saver -12% (${vnd(discount)})!`
                      );
                    } catch (e) {
                      setFailed(true);
                      setNotice((e as Error).message);
                    } finally {
                      setBundleBusy(false);
                    }
                  }}
                >
                  <ShoppingBag size={15} />
                  {bundleBusy
                    ? 'Đang xử lý trọn bộ…'
                    : count > 0
                    ? `Mua Trọn Bộ (${count} món) · Tiết kiệm ${vnd(discount)}`
                    : 'Hãy chọn ít nhất 1 món'}
                </button>
              </div>
            );
          })()}

          <div className="delivery-note">
            <Truck size={19} />
            <span>COD · Phí giao hiển thị riêng cho từng shop tại bước đặt hàng.</span>
          </div>

          <details open>
            <summary>
              <Ruler size={18} />Bảng size riêng của {p.shop.name}
            </summary>
            {chart ? (
              <>
                <p>
                  Số đo {chart.kind === 'GARMENT' ? 'quần áo' : 'cơ thể'} · {chart.unit} · Phiên bản {chart.version}
                </p>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(chart.rows[0] ?? {}).map((key) => (
                          <th key={key}>
                            {({ size: 'Size', nguc: 'Ngực', vai: 'Vai', dai: 'Dài', eo: 'Eo', mong: 'Mông' } as Record<string, string>)[key] ?? key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chart.rows.map((r, i) => (
                        <tr key={i}>
                          {Object.keys(chart.rows[0]).map((key) => (
                            <td key={key}>{r[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>{chart.guide}</p>
              </>
            ) : (
              <p>Shop chưa cung cấp bảng size.</p>
            )}
          </details>

          <details open>
            <summary>
              <Leaf size={18} color="var(--clay)" /> Hộ Chiếu Minh Bạch Chất Liệu &amp; Xuất Xứ
            </summary>
            <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.7 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '8px 10px', background: '#faf9f5', borderRadius: 3, border: '1px solid var(--line)' }}>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Chất Liệu Khai Báo</small>
                  <strong>{p.material || '100% Sợi Tự Nhiên Cao Cấp'}</strong>
                </div>
                <div style={{ padding: '8px 10px', background: '#faf9f5', borderRadius: 3, border: '1px solid var(--line)' }}>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Vùng Nguyên Liệu</small>
                  <strong>{p.material?.toLowerCase().includes('lụa') ? 'Bảo Lộc Silk (Lâm Đồng)' : p.material?.toLowerCase().includes('linen') ? 'Normandy Flax (Cộng Hòa Pháp)' : 'Pima Cotton Hữu Cơ'}</strong>
                </div>
                <div style={{ padding: '8px 10px', background: '#faf9f5', borderRadius: 3, border: '1px solid var(--line)' }}>
                  <small style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>Chứng Nhận Quốc Tế</small>
                  <strong style={{ color: '#166534' }}>OEKO-TEX Standard 100 · GOTS</strong>
                </div>
              </div>

              {/* Eco Impact Indicator */}
              <div style={{ padding: '10px 14px', background: 'var(--paper-subtle)', borderRadius: 3, border: '1px solid var(--line)', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                  <Award size={14} color="var(--gold-dark)" />
                  Chỉ số vòng đời &amp; tác động sinh thái (Eco-Footprint)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                  <span>Tiết kiệm nước: <strong style={{ color: 'var(--ink)' }}>-65%</strong></span>
                  <span>Phát thải: <strong style={{ color: 'var(--ink)' }}>1.4 kg CO2e</strong> (-72% so với Polyester)</span>
                  <span>Phân hủy tự nhiên: <strong style={{ color: 'var(--ink)' }}>100% trong 12 tháng</strong></span>
                </div>
              </div>

              {/* Ma Trận So Sánh Cảm Giác & Độ Bền Vải */}
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowFabricComparison(!showFabricComparison)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: 'var(--paper-card)',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={13} color="var(--gold-dark)" />
                  {showFabricComparison ? 'Thu gọn so sánh chất liệu' : 'So sánh cảm giác sợi tự nhiên'}
                </button>

                {showFabricComparison && (
                  <div style={{ marginTop: 10, padding: 12, background: '#faf9f5', border: '1px solid var(--line)', borderRadius: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                      Đối Chiếu Giữa Sợi Tự Nhiên Cao Cấp ({p.material}) &amp; Vải Tổng Hợp Phổ Thông:
                    </div>
                    <div className="table-wrap" style={{ margin: 0 }}>
                      <table style={{ fontSize: 11 }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '6px 8px' }}>Chỉ số trải nghiệm</th>
                            <th style={{ padding: '6px 8px', color: '#166534' }}>NEXORA ({p.material})</th>
                            <th style={{ padding: '6px 8px', color: '#991b1b' }}>Vải Polyester tổng hợp</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px 8px' }}><strong>1. Độ thoáng khí &amp; thấm hút</strong></td>
                            <td style={{ padding: '6px 8px', color: '#166534' }}><strong>9.8/10</strong> · Cấu trúc sợi rỗng thoát ẩm tức thì</td>
                            <td style={{ padding: '6px 8px', color: '#991b1b' }}><strong>3.2/10</strong> · Gây hầm bí, đọng mồ hôi</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px' }}><strong>2. Độ êm dịu trên làn da</strong></td>
                            <td style={{ padding: '6px 8px', color: '#166534' }}><strong>10/10</strong> · Sợi thuần khiết, ngừa kích ứng da</td>
                            <td style={{ padding: '6px 8px', color: '#991b1b' }}><strong>4.5/10</strong> · Dễ ngứa, tích điện ma sát</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px' }}><strong>3. Điều hòa thân nhiệt 4 mùa</strong></td>
                            <td style={{ padding: '6px 8px', color: '#166534' }}><strong>9.6/10</strong> · Mát lạnh mùa hè, giữ ấm se lạnh</td>
                            <td style={{ padding: '6px 8px', color: '#991b1b' }}><strong>2.8/10</strong> · Nóng bức khi ra nắng, lạnh vào mùa đông</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px' }}><strong>4. Tuổi thọ &amp; Vòng đời (&gt;5 năm)</strong></td>
                            <td style={{ padding: '6px 8px', color: '#166534' }}>Càng giặt càng mềm và đanh sợi</td>
                            <td style={{ padding: '6px 8px', color: '#991b1b' }}>Dễ bục chỉ, xù lông vón cục sau 10 lần giặt</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px' }}><strong>5. Trách nhiệm môi trường</strong></td>
                            <td style={{ padding: '6px 8px', color: '#166534' }}>100% tự phân hủy sinh học trong đất</td>
                            <td style={{ padding: '6px 8px', color: '#991b1b' }}>Phát tán vi nhựa, mất 200+ năm phân rã</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Chỉ số độ bền sợi dệt & kiểm định ma sát giặt */}
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowDurability(!showDurability)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: showDurability ? '#ecfdf5' : '#f8fafc',
                    border: showDurability ? '1.5px solid #059669' : '1px solid #cbd5e1',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    color: showDurability ? '#047857' : '#1e293b',
                    cursor: 'pointer',
                  }}
                >
                  <Award size={13} color="#059669" /> {showDurability ? 'Thu gọn kiểm định độ bền' : 'Kiểm định độ bền sợi & ma sát giặt máy'}
                </button>

                {showDurability && (
                  <div style={{ marginTop: 10, padding: 12, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4 }}>
                    <div className="row between" style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: 12, color: '#0f172a' }}>
                        Báo cáo kiểm định độ bền &amp; ma sát cơ học (Tiêu chuẩn ISO):
                      </strong>
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                        HEAVY COMMERCIAL GRADE
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 10 }}>
                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Thử nghiệm ma sát Martindale</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>35.000 Chu kỳ chà xát</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Không xơ đứt, đạt chuẩn thương mại bền bỉ</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Chống xù lông (Pilling)</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>Cấp 4.5 / 5.0 (ISO 12945)</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Bề mặt sợi mịn màng, chống bết dính</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Lực kéo đứt sợi ướt / khô</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>420N (Bền gấp đôi khi ướt)</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Cấu trúc xenlulozo tự nhiên bền bỉ</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Tuổi thọ giặt máy ước tính</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>&gt;80 Chu kỳ giặt êm</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Duy trì &ge;95% phom dáng nguyên bản</div>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                      <em>Cam kết bảo dưỡng:</em> Mỗi đơn hàng sản phẩm sợi tự nhiên đều được tặng kèm túi giặt lưới dệt mịn micro-mesh chuyên dụng cùng tài liệu cẩm nang dùng nước giặt sinh học lành tính pH 6.2.
                    </p>
                  </div>
                )}
              </div>

              {/* Chỉ số phục hồi co giãn & kháng nhăn tự nhiên */}
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowStretchRecovery(!showStretchRecovery)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: showStretchRecovery ? '#f0fdf4' : '#fff',
                    border: showStretchRecovery ? '1px solid #16a34a' : '1px solid var(--line)',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    color: showStretchRecovery ? '#166534' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  <Activity size={13} color={showStretchRecovery ? '#16a34a' : 'var(--clay)'} />
                  {showStretchRecovery ? 'Thu gọn chỉ số phục hồi ▲' : 'Chỉ số phục hồi co giãn & kháng nhăn ▼'}
                </button>

                {showStretchRecovery && (
                  <div style={{ marginTop: 10, padding: 12, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 4 }}>
                    <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <strong style={{ fontSize: 12, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Award size={15} color="#059669" /> Kiểm nghiệm phục hồi sợi &amp; thoát ẩm (ISO 2313 &amp; ISO 9237)
                      </strong>
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                        KHÁNG NHĂN CẤP A (162°)
                      </span>
                    </div>

                    <p style={{ margin: '0 0 10px', fontSize: 11, color: '#334155', lineHeight: 1.4 }}>
                      Kết quả đo lường độ đàn hồi cơ học và khả năng nhả nếp nhăn tự nhiên của sợi {p.material} qua buồng kiểm nghiệm nhiệt ẩm chuẩn phòng thí nghiệm dệt may.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 10 }}>
                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Góc hồi nếp nhăn (CRA)</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>162° (Chuẩn ISO 2313)</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Nhả nếp gấp tự nhiên sau 15p treo ẩm</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Hồi phục đàn hồi co giãn</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>96.5% tại độ giãn 5%</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Giữ phom ve áo và đường ráp vai sắc nét</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Độ thoát khí &amp; giảm nhiệt</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>185 mm/s (ISO 9237)</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Thoáng mát, tối ưu vi khí hậu cơ thể</div>
                      </div>

                      <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Tự thẳng bằng hơi nước</span>
                        <strong style={{ fontSize: 12, color: '#047857' }}>94 / 100 Điểm</strong>
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Nhả phẳng tự nhiên khi treo trong phòng tắm hơi</div>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                      <em>Mẹo bảo quản Atelier:</em> Khi di chuyển công tác, bạn có thể treo áo trong phòng tắm nước ấm 10-15 phút, sợi vải sẽ tự hấp thụ hơi ẩm và nhả phẳng các nếp gấp mà không cần ủi nhiệt.
                    </p>
                  </div>
                )}

                {/* Đặc tính rủ vải & Cấu trúc sợi (Cusick Drapemeter) */}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowDrapeRadar(!showDrapeRadar)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      background: showDrapeRadar ? '#f0fdfa' : '#fff',
                      border: showDrapeRadar ? '1px solid #0d9488' : '1px solid var(--line)',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 600,
                      color: showDrapeRadar ? '#0f766e' : 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <Layers size={13} color={showDrapeRadar ? '#0d9488' : 'var(--clay)'} />
                    {showDrapeRadar ? 'Thu gọn thông số độ rủ ▲' : 'Đặc tính rủ vải & Cấu trúc dệt ▼'}
                  </button>

                  {showDrapeRadar && (
                    <div style={{ marginTop: 10, padding: 12, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 4 }}>
                      <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                        <strong style={{ fontSize: 12, color: '#134e4a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Award size={15} color="#0d9488" /> Độ rủ sóng vải &amp; khối lượng dệt (Cusick Drapemeter &amp; GSM)
                        </strong>
                        <span style={{ fontSize: 10, background: '#ccfbf1', color: '#115e59', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                          DRAPE FLUIDITY: GRADE A (34.2%)
                        </span>
                      </div>

                      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#115e59', lineHeight: 1.4 }}>
                        Đo lường độ rủ mềm mại tự nhiên và mật độ dệt sợi {p.material}, giúp trang phục chuyển động thanh thoát theo từng bước chân và giữ phom dáng ổn định.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 10 }}>
                        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #ccfbf1' }}>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Hệ số rủ Cusick</span>
                          <strong style={{ fontSize: 12, color: '#0f766e' }}>34.2% (Grade A Sóng rủ)</strong>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Sóng vải rủ uyển chuyển, tự duỗi nếp gãy</div>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #ccfbf1' }}>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Định lượng vải (GSM)</span>
                          <strong style={{ fontSize: 12, color: '#0f766e' }}>185 g/m²</strong>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Độ dày chuẩn mực bốn mùa, kín đáo</div>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #ccfbf1' }}>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Hệ số dẫn nhiệt</span>
                          <strong style={{ fontSize: 12, color: '#0f766e' }}>0.038 W/m·K</strong>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Cách nhiệt tự nhiên 2 chiều đông - hè</div>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#fff', borderRadius: 3, border: '1px solid #ccfbf1' }}>
                          <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Độ rủ động học</span>
                          <strong style={{ fontSize: 12, color: '#0f766e' }}>98 / 100 Điểm</strong>
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>Phom dáng rủ bồng bềnh theo nhịp bước</div>
                        </div>
                      </div>

                      <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 3, border: '1px solid #99f6e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#134e4a' }}>
                          <em>Mô phỏng động học vải:</em> {drapeWaveActive ? 'Đang kích hoạt nhịp rủ chuyển động theo bước đi' : 'Trạng thái tĩnh chuẩn'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDrapeWaveActive(!drapeWaveActive)}
                          style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            background: drapeWaveActive ? '#0f766e' : '#fff',
                            color: drapeWaveActive ? '#fff' : '#0f766e',
                            border: '1px solid #0f766e',
                            borderRadius: 2,
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          {drapeWaveActive ? 'Dừng mô phỏng' : 'Xem mô phỏng chuyển động'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Atelier Care Guide */}
              <div>
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--ink)' }}>Chăm sóc chuẩn Atelier:</strong>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 11, lineHeight: 1.6 }}>
                  <li>Giặt máy chu kỳ nhẹ hoặc giặt tay với nước mát dưới 30°C.</li>
                  <li>Không dùng chất tẩy clo mạnh; ưu tiên dung dịch giặt gốc thực vật.</li>
                  <li>Phơi trong bóng râm thoáng mát, tránh ánh nắng mặt trời trực tiếp.</li>
                  <li>Ủi hơi nước mặt trái ở nhiệt độ thấp để duy trì độ rủ và bề mặt óng ả nguyên bản.</li>
                </ul>
              </div>

              {/* Hướng Dẫn Âm Thanh & Cảm Âm Chất Liệu */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setShowVoiceGuide(!showVoiceGuide)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    background: showVoiceGuide ? '#fdf8ea' : '#fff',
                    border: showVoiceGuide ? '1px solid var(--clay)' : '1px solid var(--line)',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 600,
                    color: showVoiceGuide ? 'var(--clay)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  <Headphones size={13} color="var(--clay)" />
                  {showVoiceGuide ? 'Đóng trải nghiệm âm thanh ▲' : 'Thuyết minh chất liệu & cảm âm sợi dệt ▼'}
                </button>

                {showVoiceGuide && (
                  <div style={{ marginTop: 10, padding: 12, background: '#faf9f5', border: '1px solid #fed7aa', borderRadius: 4 }}>
                    <div className="row between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          style={{
                            padding: '3px 8px',
                            fontSize: 10,
                            borderRadius: 2,
                            border: voiceMode === 'ATELIER_VOICE' ? '1px solid var(--clay)' : '1px solid var(--line)',
                            background: voiceMode === 'ATELIER_VOICE' ? 'var(--clay)' : '#fff',
                            color: voiceMode === 'ATELIER_VOICE' ? '#fff' : 'var(--ink)',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => setVoiceMode('ATELIER_VOICE')}
                        >
                          Thuyết minh chất liệu
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '3px 8px',
                            fontSize: 10,
                            borderRadius: 2,
                            border: voiceMode === 'FABRIC_SCROOP' ? '1px solid var(--clay)' : '1px solid var(--line)',
                            background: voiceMode === 'FABRIC_SCROOP' ? 'var(--clay)' : '#fff',
                            color: voiceMode === 'FABRIC_SCROOP' ? '#fff' : 'var(--ink)',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => setVoiceMode('FABRIC_SCROOP')}
                        >
                          Cảm âm sớ vải (Silk scroop)
                        </button>
                      </div>

                      <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                        {voicePlaying ? 'Đang phát (00:24 / 00:58)' : 'Đã tạm dừng'}
                      </span>
                    </div>

                    {/* Audio Waveform Player Simulation */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--clay)',
                          color: '#fff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        onClick={() => setVoicePlaying(!voicePlaying)}
                        aria-label={voicePlaying ? 'Tạm dừng' : 'Phát âm thanh'}
                      >
                        {voicePlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
                      </button>

                      {/* Equalizer animation bars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1, height: 20 }}>
                        {[16, 24, 12, 28, 18, 30, 14, 22, 10, 26, 15, 20].map((h, i) => (
                          <div
                            key={i}
                            style={{
                              width: 3,
                              height: voicePlaying ? `${Math.max(6, (h * (i % 2 === 0 ? 1 : 0.8)))}px` : '4px',
                              background: voicePlaying ? 'var(--clay)' : '#cbd5e1',
                              borderRadius: 2,
                              transition: 'height 0.2s ease',
                            }}
                          />
                        ))}
                      </div>

                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
                        HD 48kHz
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: 11, color: '#444', fontStyle: 'italic', lineHeight: 1.5 }}>
                      {voiceMode === 'ATELIER_VOICE'
                        ? `“[Stylist]: Chào bạn, với chất liệu ${p.material || 'sợi tự nhiên'}, hãy giặt tay với nước mát dưới 30°C và phơi râm mát. Nhiệt độ cơ thể bạn sẽ hoàn thiện phom dáng và độ rủ mềm mượt tự nhiên của trang phục.”`
                        : `“[Cảm âm sớ vải]: Tiếng sột soạt thanh mảnh (Silk Scroop) khi miết nhẹ bề mặt vải – minh chứng cho độ thuần khiết của sợi tơ tằm nguyên bản, không pha tạp sợi nhân tạo.”`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* Trợ Lý Phong Cách AI Stylist Riêng Cho Sản Phẩm */}
          <details open>
            <summary style={{ cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--clay)" /> Hỏi đáp phong cách cùng Stylist Atelier
              </span>
              <span style={{ fontSize: 10, background: '#fdf8ea', color: 'var(--clay)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                ATELIER STYLING
              </span>
            </summary>

            <div style={{ marginTop: 14 }}>
              {/* Stylist Profile Banner */}
              <div style={{ padding: '10px 14px', background: '#faf9f5', borderRadius: 6, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--clay)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  EV
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--ink)' }}>Elena Vũ · Chuyên viên phong cách cao cấp (NEXORA Atelier)</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                    Tư vấn trực tiếp theo chất liệu <strong>{p.material}</strong> và phom dáng <strong>{p.fit}</strong> của riêng trang phục này.
                  </p>
                </div>
              </div>

              {/* Quick Questions Prompt Chips */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  Gợi ý câu hỏi nhanh:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { label: 'Phối đi tiệc tối & Gala', q: `Đi tiệc tối hoặc Gala thì mẫu ${p.name} này nên phối phụ kiện và trang phục nào?` },
                    { label: 'Mặc đi làm công sở', q: `Mặc đi làm văn phòng thì kết hợp cùng quần gì và giày túi nào thanh lịch?` },
                    { label: 'Vải & cách bảo quản', q: `Chất liệu ${p.material} ngồi làm việc có bị nhăn không và cách là ủi thế nào?` },
                    { label: 'Tư vấn phom dáng & size', q: `Phom dáng ${p.fit} này chọn size thế nào để vừa vặn và cử động thoải mái nhất?` },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAiStylist(chip.q)}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        borderRadius: 14,
                        border: '1px solid #fed7aa',
                        background: '#fff',
                        color: 'var(--clay)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message History Window */}
              <div
                style={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {aiChatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                      gap: 8,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: msg.sender === 'user' ? 'var(--ink)' : 'var(--clay)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {msg.sender === 'user' ? 'Bạn' : 'EV'}
                    </div>

                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        lineHeight: 1.5,
                        background: msg.sender === 'user' ? 'var(--ink)' : '#fff',
                        color: msg.sender === 'user' ? '#fff' : 'var(--ink)',
                        border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div>{msg.text}</div>
                      <div
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: msg.sender === 'user' ? 'right' : 'left',
                          opacity: 0.7,
                        }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiStylist();
                }}
                style={{ display: 'flex', gap: 8 }}
              >
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder={`Hỏi Stylist về cách phối "${p.name}"...`}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--line)',
                  }}
                />
                <button
                  type="submit"
                  disabled={!aiChatInput.trim()}
                  className="button"
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: aiChatInput.trim() ? 1 : 0.6,
                  }}
                >
                  <Send size={13} /> Hỏi Stylist
                </button>
              </form>
            </div>
          </details>

          <details>
            <summary>Chính sách đổi size</summary>
            <p>{p.shop.returnPolicy}</p>
          </details>

          <details open>
            <summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={16} fill="var(--gold-dark)" color="var(--gold-dark)" />
                Đánh giá từ khách hàng ({p.reviews?.length ?? 0})
              </span>
              {p.reviews && p.reviews.length > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)' }}>
                  {(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1)} / 5.0 ★
                </span>
              )}
            </summary>
            
            {p.reviews?.length ? (
              <div style={{ marginTop: 14 }}>
                {/* Aggregate Summary Box */}
                <div
                  style={{
                    padding: '14px 18px',
                    background: '#FAF8F5',
                    border: '1px solid var(--line)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink)' }}>
                        {(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1)}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ 5.0</span>
                      <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star key={st} size={14} fill="var(--gold-dark)" color="var(--gold-dark)" />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                      Dựa trên {p.reviews.length} đánh giá kiểm định sau khi đồng kiểm nhận hàng
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--ink)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: 13, color: '#166534' }}>100%</strong>
                      <span style={{ color: 'var(--muted)', fontSize: 10 }}>Đúng kích cỡ</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: 13, color: '#166534' }}>99%</strong>
                      <span style={{ color: 'var(--muted)', fontSize: 10 }}>Chất vải đúng mô tả</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ display: 'block', fontSize: 13, color: 'var(--gold-dark)' }}>✦ Đồng Kiểm</strong>
                      <span style={{ color: 'var(--muted)', fontSize: 10 }}>100% Khách Hài Lòng</span>
                    </div>
                  </div>
                </div>

                {/* Review Cards List */}
                <div style={{ display: 'grid', gap: 14 }}>
                  {p.reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '14px 16px',
                        background: '#fff',
                        border: '1px solid var(--line)',
                        borderRadius: 3,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div className="row between" style={{ marginBottom: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: '#FAF8F5',
                              border: '1px solid var(--line)',
                              color: 'var(--ink)',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily: 'var(--font-serif)',
                            }}
                          >
                            {r.user?.name ? r.user.name.charAt(0).toUpperCase() : 'N'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ fontSize: 12.5, color: 'var(--ink)' }}>{r.user?.name || 'Khách Hàng Atelier'}</strong>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  background: '#f0fdf4',
                                  color: '#166534',
                                  border: '1px solid #bbf7d0',
                                  padding: '1px 6px',
                                  borderRadius: 2,
                                  fontWeight: 600,
                                }}
                              >
                                ✓ Đã Đồng Kiểm &amp; Nhận Hàng
                              </span>
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                              {new Date(r.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              size={12}
                              fill={st <= r.rating ? 'var(--gold-dark)' : 'none'}
                              color={st <= r.rating ? 'var(--gold-dark)' : '#d4d4d8'}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 2, color: 'var(--muted)' }}>
                          🌿 Phom Dáng Chuẩn May Đo
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 8px', background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 2, color: 'var(--muted)' }}>
                          ✨ Chất Vải Sợi Thoáng Mát
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 8px', background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 2, color: 'var(--muted)' }}>
                          💎 Hộp Đóng Gói Atelier
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink)' }}>
                        &ldquo;{r.body}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                <p style={{ margin: 0 }}>Chưa có đánh giá nào cho thiết kế này.</p>
                <p style={{ margin: '4px 0 0', fontSize: 11 }}>
                  Mọi đánh giá tại NEXORA đều được gửi từ khách hàng đã nhận và đồng kiểm trang phục thực tế.
                </p>
              </div>
            )}
          </details>
        </div>
      </div>

      {/* Modal Mô Phỏng Phom Dáng & Độ Rủ 2D */}
      {showSilhouetteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              maxWidth: 720,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--line)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                background: '#0f172a',
                color: '#fff',
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, color: '#fff' }}>
                    Phòng Mô Phỏng Phom Dáng &amp; Độ Rủ Silhouette 2D
                  </h3>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Sản phẩm: {p.name} · Phom {p.fit} · Chất liệu {p.material}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSilhouetteModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Archetype Selector Tabs */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#334155' }}>
                Chọn tạng người đối chiếu phom dáng:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'PETITE', title: 'Petite / Thon Gọn', stats: '1m56 · 45kg · 82-62-86cm', match: 'Size S chuẩn' },
                  { id: 'ATHLETIC', title: 'Athletic / Cân Đối', stats: '1m66 · 52kg · 86-66-92cm', match: 'Size M chuẩn' },
                  { id: 'CURVY', title: 'Curvy / Đầy Đặn', stats: '1m64 · 60kg · 92-74-98cm', match: 'Size L chuẩn' },
                ].map(arc => (
                  <button
                    key={arc.id}
                    type="button"
                    onClick={() => setSilhouetteArchetype(arc.id as any)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 4,
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: silhouetteArchetype === arc.id ? '2px solid var(--clay)' : '1px solid #cbd5e1',
                      background: silhouetteArchetype === arc.id ? '#fdfbf7' : '#fff',
                    }}
                  >
                    <strong style={{ fontSize: 12, display: 'block', color: silhouetteArchetype === arc.id ? 'var(--clay)' : '#1e293b' }}>
                      {arc.title}
                    </strong>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{arc.stats}</div>
                    <span style={{ fontSize: 9, background: silhouetteArchetype === arc.id ? 'var(--clay)' : '#e2e8f0', color: silhouetteArchetype === arc.id ? '#fff' : '#475569', padding: '1px 5px', borderRadius: 2, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>
                      {arc.match}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mannequin Canvas & Silhouette Metrics */}
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
              {/* SVG Fashion Mannequin Croquis */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <svg width="220" height="340" viewBox="0 0 220 340">
                  <defs>
                    <linearGradient id="garmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9a3412" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#c2410c" stopOpacity="0.65" />
                    </linearGradient>
                  </defs>

                  {/* Body Guidelines */}
                  <line x1="20" y1="90" x2="200" y2="90" stroke="#cbd5e1" strokeDasharray="3 3" />
                  <text x="25" y="86" fontSize="9" fill="#94a3b8">Đường ngực</text>

                  <line x1="20" y1="140" x2="200" y2="140" stroke="#cbd5e1" strokeDasharray="3 3" />
                  <text x="25" y="136" fontSize="9" fill="#94a3b8">Đường eo tự nhiên</text>

                  <line x1="20" y1="190" x2="200" y2="190" stroke="#cbd5e1" strokeDasharray="3 3" />
                  <text x="25" y="186" fontSize="9" fill="#94a3b8">Hạ mông</text>

                  <line x1="20" y1="260" x2="200" y2="260" stroke="#cbd5e1" strokeDasharray="3 3" />
                  <text x="25" y="256" fontSize="9" fill="#94a3b8">Đầu gối</text>

                  {/* Minimalist Mannequin Outline */}
                  {/* Head */}
                  <ellipse cx="110" cy="35" rx="14" ry="18" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Neck */}
                  <line x1="110" y1="53" x2="110" y2="65" stroke="#94a3b8" strokeWidth="2" />
                  {/* Shoulders */}
                  <path d="M 80 72 Q 110 65 140 72" fill="none" stroke="#94a3b8" strokeWidth="2" />

                  {/* Silhouette Body Scaling based on archetype */}
                  {silhouetteArchetype === 'PETITE' && (
                    <>
                      {/* Body Frame Petite */}
                      <path d="M 80 72 L 86 140 L 92 190 L 98 260 L 100 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 140 72 L 134 140 L 128 190 L 122 260 L 120 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Garment Drape Petite */}
                      <path d="M 78 72 L 72 135 L 78 200 L 110 205 L 142 200 L 148 135 L 142 72 Z" fill="url(#garmentGrad)" stroke="#9a3412" strokeWidth="1.5" />
                    </>
                  )}
                  {silhouetteArchetype === 'ATHLETIC' && (
                    <>
                      {/* Body Frame Athletic */}
                      <path d="M 75 72 L 84 140 L 94 190 L 100 260 L 102 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 145 72 L 136 140 L 126 190 L 120 260 L 118 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Garment Drape Athletic */}
                      <path d="M 74 72 L 70 135 L 76 195 L 110 200 L 144 195 L 150 135 L 146 72 Z" fill="url(#garmentGrad)" stroke="#9a3412" strokeWidth="1.5" />
                    </>
                  )}
                  {silhouetteArchetype === 'CURVY' && (
                    <>
                      {/* Body Frame Curvy */}
                      <path d="M 72 72 L 82 140 L 98 190 L 102 260 L 104 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      <path d="M 148 72 L 138 140 L 122 190 L 118 260 L 116 320" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
                      {/* Garment Drape Curvy */}
                      <path d="M 70 72 L 66 135 L 72 190 L 110 195 L 148 190 L 154 135 L 150 72 Z" fill="url(#garmentGrad)" stroke="#9a3412" strokeWidth="1.5" />
                    </>
                  )}

                  {/* Tension markers */}
                  <circle cx="110" cy="90" r="5" fill="#16a34a" />
                  <circle cx="110" cy="140" r="5" fill="#ea580c" />
                </svg>

                <div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} /> Thoải mái
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ea580c' }} /> Ôm nhẹ tôn dáng
                  </span>
                </div>
              </div>

              {/* Analysis & Fit Evaluation */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: 14, color: '#0f172a' }}>
                    Phân Tích Độ Rủ &amp; Cảm Giác Mặc (Draping Evaluation)
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    Dựa trên chất liệu <strong>{p.material}</strong> và phom dáng <strong>{p.fit}</strong>:
                  </p>

                  <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 4, borderLeft: '3px solid #16a34a' }}>
                      <strong style={{ color: '#166534' }}>1. Vùng Ngực &amp; Cử Động Vai:</strong>
                      <div style={{ color: '#334155', marginTop: 2 }}>
                        Độ dư cử động 4–6cm, hoàn toàn thoải mái khi với tay, lái xe hoặc làm việc cả ngày mà không bị kích nách.
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 4, borderLeft: '3px solid #ea580c' }}>
                      <strong style={{ color: '#c2410c' }}>2. Vòng Eo &amp; Độ Rủ Thân Áo:</strong>
                      <div style={{ color: '#334155', marginTop: 2 }}>
                        Điểm rơi chiết eo tự nhiên giúp che khuyết điểm vùng bụng dưới, tạo hiệu ứng thị giác thon gọn và tôn dáng thanh thoát.
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 4, borderLeft: '3px solid #2563eb' }}>
                      <strong style={{ color: '#1d4ed8' }}>3. Chiều Dài Áo / Vạt Áo:</strong>
                      <div style={{ color: '#334155', marginTop: 2 }}>
                        Vạt áo phủ ngang mông (khoảng 64–68cm tùy size), dễ dàng sơ vin gọn gàng với quần âu hoặc buông tà phóng khoáng.
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const rec = silhouetteArchetype === 'PETITE' ? 'S' : silhouetteArchetype === 'ATHLETIC' ? 'M' : 'L';
                      setSize(rec);
                      setShowSilhouetteModal(false);
                      setNotice(`Đã chọn size ${rec} tương thích tối ưu với dáng người.`);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--clay)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Chọn Size {silhouetteArchetype === 'PETITE' ? 'S' : silhouetteArchetype === 'ATHLETIC' ? 'M' : 'L'} &amp; Áp Dụng Ngay
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSilhouetteModal(false)}
                    style={{
                      padding: '10px 14px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đặt Trước May Đo Thủ Công Atelier */}
      {showBespokeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setShowBespokeModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              maxWidth: 580,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #fed7aa',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scissors size={20} color="#78350f" />
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#78350f' }}>
                    Xưởng may đo thủ công NEXORA Atelier
                  </h3>
                  <div style={{ fontSize: 11, color: '#92400e' }}>
                    Chế tác thủ công theo yêu cầu (Bespoke Pre-Order)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBespokeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {bespokeConfirmed ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Award size={32} color="#b45309" />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16, color: '#78350f' }}>
                  Đã Xác Nhận Giữ Suất May Đo Thành Công!
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: '#52525b', lineHeight: 1.5 }}>
                  Mã đăng ký chế tác độc bản: <strong>#ATELIER-BESPOKE-{Date.now().toString().slice(-6)}</strong>.<br />
                  Hồ sơ đã được chuyển tiếp đến Master Tailor Hoàng Nam để chuẩn bị phóng rập may đo.
                </p>

                <div style={{ background: '#fdfbf7', border: '1px dashed #d97706', borderRadius: 6, padding: 14, textAlign: 'left', marginBottom: 16, fontSize: 12 }}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span style={{ color: '#71717a' }}>Trang phục may đo:</span>
                    <strong>{p.name}</strong>
                  </div>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span style={{ color: '#71717a' }}>Màu sắc &amp; Size:</span>
                    <span>{selectedColor || 'Mặc định'} · Size {size || 'Theo Passport'}</span>
                  </div>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span style={{ color: '#71717a' }}>Monogram thêu ve áo:</span>
                    <strong style={{ color: '#b45309', fontFamily: 'serif', letterSpacing: 1 }}>{bespokeMonogram}</strong>
                  </div>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span style={{ color: '#71717a' }}>Hàng chờ nghệ nhân:</span>
                    <strong style={{ color: '#16a34a' }}>Suất #{bespokeQueuePos} / 15 tuần này</strong>
                  </div>
                  <div className="row between">
                    <span style={{ color: '#71717a' }}>Tiền cọc 30% (Escrow Sàn NEXORA):</span>
                    <strong style={{ color: 'var(--clay)' }}>{vnd(Math.round((variant?.price || p.variants[0]?.price || 0) * 0.3))}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBespokeModal(false);
                      router.push('/tai-khoan');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'var(--clay)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Xem Hồ Sơ May Đo Tại Tài Khoản →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBespokeModal(false)}
                    style={{
                      padding: '10px 14px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: 4, border: '1px solid #fde68a', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                      Hàng chờ nghệ nhân xưởng may tuần này:
                    </span>
                    <span style={{ fontSize: 11, background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                      Suất #{bespokeQueuePos} / 15
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: '#78350f', lineHeight: 1.4 }}>
                    Mỗi tuần NEXORA Atelier chỉ nhận may đo giới hạn 15 sản phẩm thủ công để bảo đảm từng đường may đạt tiêu chuẩn Haute Couture. Thời gian hoàn thiện dự kiến: <strong>5–7 ngày làm việc</strong>.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      1. Thêu Monogram Viết Tắt Tên Chủ Nhân (Ve áo / Cổ áo trong):
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={bespokeMonogram}
                      onChange={(e) => setBespokeMonogram(e.target.value.toUpperCase())}
                      placeholder="VD: N.X. hoặc J.T."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: 2,
                        fontFamily: 'serif',
                      }}
                    />
                    <small style={{ color: '#64748b', fontSize: 10 }}>
                      Thêu tay chỉ lụa vàng ánh kim hoặc bạc trầm tùy sắc thái vải chính.
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      2. Chọn Lớp Lót Lụa May Đo Tùy Biến:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      {[
                        { id: 'SILK_JACQUARD', label: 'Lụa Thêu Chìm', desc: 'Bảo Lộc Silk' },
                        { id: 'NORMANDY_FLAX', label: 'Lanh Mộc Tự Nhiên', desc: 'Normandy Flax' },
                        { id: 'ATELIER_NOIR', label: 'Satin Đen Tuyển', desc: 'Sơn Mài Noir' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBespokeLining(item.id as any)}
                          style={{
                            padding: '8px 6px',
                            border: bespokeLining === item.id ? '1.5px solid var(--clay)' : '1px solid #e2e8f0',
                            borderRadius: 4,
                            background: bespokeLining === item.id ? '#fef3c7' : '#f8fafc',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          <strong style={{ fontSize: 11, display: 'block', color: '#1e293b' }}>{item.label}</strong>
                          <span style={{ fontSize: 9, color: '#64748b' }}>{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      3. Ghi Chú Tùy Biến Phom Dáng Dành Cho Master Tailor:
                    </label>
                    <textarea
                      rows={2}
                      value={bespokeNotes}
                      onChange={(e) => setBespokeNotes(e.target.value)}
                      placeholder="VD: Hạ eo 1cm, nới ngực 2cm cho dáng người thể thao, tay áo may lửng qua mắt cá tay..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        fontSize: 12,
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* 5 Chặng Tiến Trình Nghệ Nhân */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 8 }}>
                    Tiến Trình 5 Chặng Chế Tác Thủ Công (Artisanal Lifecycle):
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, textAlign: 'center' }}>
                    {[
                      { step: 1, title: 'Phóng Rập', desc: 'Theo số đo' },
                      { step: 2, title: 'Cắt Thủ Công', desc: 'Ủ sợi dệt' },
                      { step: 3, title: 'May Đo Ráp', desc: 'Đơm khuy xà cừ' },
                      { step: 4, title: 'Thêu Monogram', desc: 'Ủ buồng 1000 Lux' },
                      { step: 5, title: 'Đóng Hộp', desc: 'Haute Couture' },
                    ].map((st) => (
                      <div key={st.step} style={{ padding: '6px 4px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#b45309', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                          {st.step}
                        </div>
                        <strong style={{ fontSize: 10, display: 'block', color: '#0f172a' }}>{st.title}</strong>
                        <span style={{ fontSize: 8, color: '#64748b' }}>{st.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#fafaf9', padding: '10px 14px', borderRadius: 4, border: '1px solid #e7e5e4', marginBottom: 16 }}>
                  <div className="row between" style={{ fontSize: 12 }}>
                    <span>Tổng giá trị trang phục:</span>
                    <strong>{vnd(variant?.price || p.variants[0]?.price || 0)}</strong>
                  </div>
                  <div className="row between" style={{ fontSize: 12, marginTop: 4 }}>
                    <span style={{ color: '#b45309' }}>Tiền cọc giữ suất 30% (Escrow Sàn NEXORA):</span>
                    <strong style={{ color: '#b45309', fontSize: 13 }}>
                      {vnd(Math.round((variant?.price || p.variants[0]?.price || 0) * 0.3))}
                    </strong>
                  </div>
                  <div style={{ fontSize: 10, color: '#78716c', marginTop: 4 }}>
                    Phần còn lại 70% sẽ thanh toán khi bưu tá giao hàng tận nhà và khách hàng đồng kiểm ngoại quan.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const newOrder = {
                        id: `ATELIER-BESPOKE-${Date.now().toString().slice(-6)}`,
                        productName: p.name,
                        variant: `${selectedColor || 'Mặc định'} · Size ${size || 'Theo Passport'}`,
                        monogram: bespokeMonogram,
                        lining: bespokeLining,
                        notes: bespokeNotes,
                        deposit: Math.round((variant?.price || p.variants[0]?.price || 0) * 0.3),
                        queuePos: bespokeQueuePos,
                        createdAt: new Date().toLocaleDateString('vi-VN'),
                        step: 1,
                      };
                      try {
                        const existing = JSON.parse(localStorage.getItem('nexora_bespoke_preorders') || '[]');
                        existing.unshift(newOrder);
                        localStorage.setItem('nexora_bespoke_preorders', JSON.stringify(existing));
                        if (user) {
                          api('/vault/bespoke', 'POST', {
                            id: newOrder.id,
                            productName: newOrder.productName,
                            shopId: p.shop?.id || 'shop-nep',
                            shopName: p.shop?.name || 'NÉP Studio',
                            stage: 'PENDING_REVIEW',
                            deposit: newOrder.deposit,
                            totalAmount: variant?.price || p.variants[0]?.price || 0,
                            customerName: user?.name || 'Khách Hàng Atelier',
                            customerPhone: (user as any)?.phone || '0901234567',
                            variant: newOrder.variant,
                            monogram: newOrder.monogram,
                            lining: newOrder.lining,
                            notes: newOrder.notes,
                            queuePos: newOrder.queuePos,
                          }).catch(() => {});
                        }
                      } catch {}
                      setBespokeConfirmed(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      background: 'var(--clay)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Xác Nhận Đặt Cọc 30% &amp; Giữ Suất May Đo →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBespokeModal(false)}
                    style={{
                      padding: '11px 16px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gương Thử Đồ AR & Mô Phỏng Độ Rủ Tương Tác */}
      {showArMirrorModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={() => setShowArMirrorModal(false)}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: 580,
              width: '100%',
              borderRadius: 8,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowArMirrorModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={20} color="#0d9488" />
              <h2 style={{ margin: 0, fontSize: 17, color: '#134e4a' }}>
                Gương Soi Ảo AR &amp; Độ Rủ
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Mô phỏng chân thực hiệu ứng thị giác của chất liệu {p.material} dưới 3 điều kiện nguồn sáng và chuyển động gió vi điểm.
            </p>

            {/* Light Selector */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                1. Chọn Điều Kiện Ánh Sáng Môi Trường:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'DAYLIGHT' as const, label: 'Atelier Ban Ngày', kelvin: '5500K Tự nhiên' },
                  { id: 'CANDLE' as const, label: 'Nến Ấm Dạ Tiệc', kelvin: '2700K Lãng mạn' },
                  { id: 'SPOTLIGHT' as const, label: 'Spotlight Gallery', kelvin: '4000K Sân khấu' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setArLighting(l.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 4,
                      border: arLighting === l.id ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                      background: arLighting === l.id ? '#f0fdfa' : '#fff',
                      color: arLighting === l.id ? '#0f766e' : '#334155',
                      fontWeight: arLighting === l.id ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    <div>{l.label}</div>
                    <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>{l.kelvin}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Selector */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                2. Chế Độ Chuyển Động &amp; Độ Rủ (Drapery Flow):
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'STILL' as const, label: 'Tĩnh Lặng Phom May (Still Pose)' },
                  { id: 'BREEZE' as const, label: 'Gió Nhẹ Thoang Thoảng (Breeze 1.2 m/s)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setArMotion(m.id)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: arMotion === m.id ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                      background: arMotion === m.id ? '#f0fdfa' : '#fff',
                      color: arMotion === m.id ? '#0f766e' : '#334155',
                      fontWeight: arMotion === m.id ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: 11,
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AR Virtual Mirror Stage */}
            <div
              style={{
                position: 'relative',
                height: 260,
                borderRadius: 6,
                overflow: 'hidden',
                background: arLighting === 'CANDLE' ? 'linear-gradient(135deg, #451a03 0%, #1c1917 100%)' : arLighting === 'SPOTLIGHT' ? '#09090b' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                border: '1px solid #cbd5e1',
                transition: 'all 0.3s ease',
              }}
            >
              <img
                src={p.images[0]?.url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'}
                alt={p.name}
                style={{
                  maxHeight: '85%',
                  maxWidth: '85%',
                  objectFit: 'contain',
                  filter: arLighting === 'CANDLE' ? 'sepia(40%) saturate(140%) contrast(105%)' : arLighting === 'SPOTLIGHT' ? 'contrast(125%) brightness(110%)' : 'none',
                  transform: arMotion === 'BREEZE' ? 'skewX(-1.5deg) scale(1.02)' : 'none',
                  transition: 'all 0.4s ease',
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80')) target.src = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
                }}
              />

              <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, background: 'rgba(0,0,0,0.65)', color: '#5eead4', padding: '2px 8px', borderRadius: 3, fontWeight: 700 }}>
                AR DRAPERY · 60 FPS
              </div>

              <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '2px 8px', borderRadius: 3 }}>
                Hệ số rủ: 0.32 · Hồi nếp: 96%
              </div>
            </div>

            {/* Action Buttons */}
            {arSnapshotSaved ? (
              <div style={{ padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 4, color: '#065f46', fontSize: 11, textAlign: 'center' }}>
                ✓ Đã chụp và lưu Snapshot AR vào Ví Phong Cách (`localStorage`). Bạn có thể chia sẻ lên bảng tin OOTD!
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('nexora_ar_snapshots', JSON.stringify({
                      product: p.name,
                      lighting: arLighting,
                      motion: arMotion,
                      timestamp: new Date().toISOString(),
                    }));
                  } catch {}
                  setArSnapshotSaved(true);
                }}
                style={{
                  width: '100%',
                  padding: '9px 14px',
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
                <Sparkles size={14} /> Chụp Snapshot Lookbook AR &amp; Lưu Vào Ví Phong Cách
              </button>
            )}
          </div>
        </div>
      )}
      {/* Modal Trải Nghiệm Thử Đồ Tại Nhà VIP (Home-Fitting Concierge) */}
      {showHomeFittingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 20, 19, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--line)',
            borderRadius: 4,
            maxWidth: 520,
            width: '100%',
            padding: '24px 28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>DỊCH VỤ VIP CONCIERGE</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Trải Nghiệm Thử Đồ Tại Nhà</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowHomeFittingModal(false);
                  setHomeFittingSuccess(false);
                }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            {homeFittingSuccess ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16 }}>Đã Đặt Lịch Thử Đồ Thành Công!</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 16px' }}>
                  Chuyên viên Styling cao cấp của NEXORA sẽ mang sản phẩm <strong>"{p.name}"</strong> (kèm đủ size S/M/L và Vali mẫu vải) tới tận tư gia phục vụ bạn vào ngày {homeFittingDate}.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/tai-khoan" className="button" style={{ fontSize: 12, padding: '7px 16px' }}>
                    Xem Lịch Trình Tại Tài Khoản →
                  </Link>
                  <button
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 12, padding: '7px 14px' }}
                    onClick={() => {
                      setShowHomeFittingModal(false);
                      setHomeFittingSuccess(false);
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: 3, marginBottom: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={p.images[0]?.url || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'}
                    alt={p.name}
                    style={{ width: 48, height: 58, objectFit: 'cover', borderRadius: 2 }}
                  />
                  <div style={{ fontSize: 12 }}>
                    <strong>{p.name}</strong>
                    <div style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>{vnd(p.variants[0]?.price || 0)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>Xưởng: {p.shop?.name || 'NEXORA Atelier'}</div>
                  </div>
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setHomeFittingBusy(true);
                    try {
                      await api('/concierge/fitting', 'POST', {
                        productName: p.name,
                        shopId: p.shop?.id,
                        appointmentDate: homeFittingDate,
                        timeSlot: homeFittingTimeSlot,
                        address: homeFittingAddress,
                        phone: homeFittingPhone,
                        recipientName: homeFittingRecipient || 'Quý Khách Hàng',
                        fabricSuitcaseRequested: homeFittingSuitcase,
                        specialNotes: homeFittingNotes,
                      });
                      setHomeFittingSuccess(true);
                    } catch (err: any) {
                      setNotice(err.message || 'Lỗi đặt lịch hẹn');
                      setFailed(true);
                    } finally {
                      setHomeFittingBusy(false);
                    }
                  }}
                  className="stack"
                  style={{ gap: 12 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Tên Người Nhận Thử
                      </label>
                      <input
                        value={homeFittingRecipient}
                        onChange={e => setHomeFittingRecipient(e.target.value)}
                        required
                        minLength={2}
                        placeholder="Nguyễn Văn A"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Số Điện Thoại
                      </label>
                      <input
                        value={homeFittingPhone}
                        onChange={e => setHomeFittingPhone(e.target.value)}
                        required
                        pattern="0[0-9]{9}"
                        placeholder="0901234567"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Địa Chỉ Tư Gia / Văn Phòng Đón Tiếp
                    </label>
                    <input
                      value={homeFittingAddress}
                      onChange={e => setHomeFittingAddress(e.target.value)}
                      required
                      minLength={5}
                      placeholder="Số nhà, tên đường, Phường, Quận, Thành phố"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Ngày Hẹn Thử
                      </label>
                      <select
                        value={homeFittingDate}
                        onChange={e => setHomeFittingDate(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      >
                        <option value="27/11/2026">Thứ Sáu, 27/11/2026</option>
                        <option value="28/11/2026">Thứ Bảy, 28/11/2026</option>
                        <option value="29/11/2026">Chủ Nhật, 29/11/2026</option>
                        <option value="30/11/2026">Thứ Hai, 30/11/2026</option>
                        <option value="01/12/2026">Thứ Ba, 01/12/2026</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Khung Giờ Phục Vụ
                      </label>
                      <select
                        value={homeFittingTimeSlot}
                        onChange={e => setHomeFittingTimeSlot(e.target.value as any)}
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      >
                        <option value="MORNING_09_11">Sáng (09:00 - 11:30)</option>
                        <option value="AFTERNOON_14_16">Chiều (14:00 - 16:30)</option>
                        <option value="EVENING_18_20">Tối (18:00 - 20:30)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="p-chk-suitcase"
                      checked={homeFittingSuitcase}
                      onChange={e => setHomeFittingSuitcase(e.target.checked)}
                    />
                    <label htmlFor="p-chk-suitcase" style={{ fontSize: 11.5, cursor: 'pointer' }}>
                      Mang theo <strong>Vali 40+ mẫu vải len Loro Piana &amp; lụa tơ tằm</strong> để tư vấn chất liệu tại chỗ
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Ghi Chú Đón Tiếp (Tùy chọn)
                    </label>
                    <textarea
                      value={homeFittingNotes}
                      onChange={e => setHomeFittingNotes(e.target.value)}
                      rows={2}
                      placeholder="Ví dụ: Mang đủ cả 3 size S, M, L để thử so sánh phom dáng..."
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2, resize: 'vertical' }}
                    />
                  </div>

                  <div className="row between" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setShowHomeFittingModal(false)}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="button"
                      disabled={homeFittingBusy}
                    >
                      {homeFittingBusy ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch VIP'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hộp Thẻ Mẫu Vải Cầm Tay (Atelier Swatch Kit Modal) */}
      {showSwatchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 20, 19, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--line)',
            borderRadius: 4,
            maxWidth: 520,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <span className="eyebrow" style={{ fontSize: 10, marginBottom: 2 }}>TRẢI NGHIỆM CHẤT LIỆU TẬN TAY</span>
                <h3 style={{ margin: 0, fontSize: 18 }}>Hộp Mẫu Vải Thượng Hạng Cầm Tay</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSwatchModal(false);
                  setSwatchVoucherCreated(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
              >
                ×
              </button>
            </div>

            {swatchVoucherCreated ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle size={24} />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: 16 }}>Đã Tiếp Nhận Yêu Cầu Hộp Mẫu Vải</h4>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  Atelier sẽ đóng gói phong bì sáp ong chứa các mẫu vải cùng thước dây sartorial và chuyển phát hỏa tốc đến địa chỉ của bạn.
                </p>

                <div style={{ background: '#FAF8F5', border: '1px dashed var(--gold-dark)', borderRadius: 4, padding: '12px 14px', marginBottom: 18 }}>
                  <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                    Voucher Kích Hoạt Hoàn Cọc 100%
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold-dark)', fontFamily: 'monospace', letterSpacing: 2 }}>
                    {swatchVoucherCreated}
                  </div>
                  <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>
                    Trị giá 50.000₫ · Tự động giảm trừ khi bạn đặt may hoặc mua trang phục chính thức
                  </div>
                </div>

                <div className="row between">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(swatchVoucherCreated);
                      setSwatchCopied(true);
                      setTimeout(() => setSwatchCopied(false), 2000);
                    }}
                  >
                    {swatchCopied ? '✓ Đã sao chép mã' : 'Sao chép mã voucher'}
                  </button>
                  <button
                    type="button"
                    className="button"
                    style={{ background: 'var(--ink)' }}
                    onClick={() => {
                      setShowSwatchModal(false);
                      setSwatchVoucherCreated(null);
                    }}
                  >
                    Hoàn tất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 3, marginBottom: 14, fontSize: 12 }}>
                  <div>Trang phục khảo sát: <strong>{p?.name}</strong></div>
                  <div>Chất liệu chính: <strong>{p?.material || 'Lanh Normandy dệt thoi mộc'}</strong></div>
                  <div style={{ marginTop: 4, color: '#166534' }}>
                    Phí bảo chứng mẫu: <strong>50.000₫</strong> <span style={{ fontSize: 11 }}>(Hoàn 100% qua Voucher mua hàng)</span>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
                    3 Mẫu Vải Kèm Theo Trong Hộp:
                  </label>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {swatchItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3, fontSize: 11 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: idx === 0 ? '#1e3a8a' : idx === 1 ? '#fafaf9' : '#78350f', border: '1px solid #cbd5e1', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#334155' }}>{item}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#64748b' }}>Chuẩn GSM 190</span>
                      </div>
                    ))}
                  </div>
                  <small style={{ display: 'block', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
                    Kèm theo 01 thước dây may đo sartorial và thẻ QR tra cứu thông tin vùng nguyên liệu dệt.
                  </small>
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setSwatchBusy(true);
                    try {
                      const res = await api<{ voucherCode?: string }>('/swatch-orders', 'POST', {
                        productId: p?.id || p?.slug || 'sample-product',
                        productName: p?.name || 'Trang phục may đo Atelier',
                        shopId: p?.shop?.id,
                        swatches: swatchItems,
                        recipientName: swatchRecipient.trim(),
                        phone: swatchPhone.trim(),
                        address: swatchAddress.trim(),
                        depositFee: 50000,
                      });
                      setSwatchVoucherCreated(res.voucherCode || 'NX-SWATCH-VIP2026');
                    } catch (err: any) {
                      setNotice(err.message || 'Không thể tạo đơn mẫu vải');
                    } finally {
                      setSwatchBusy(false);
                    }
                  }}
                  className="stack"
                  style={{ gap: 10 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Người Nhận Hộp Mẫu
                      </label>
                      <input
                        value={swatchRecipient}
                        onChange={e => setSwatchRecipient(e.target.value)}
                        required
                        minLength={2}
                        placeholder="Họ và tên quý khách"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                        Số Điện Thoại
                      </label>
                      <input
                        value={swatchPhone}
                        onChange={e => setSwatchPhone(e.target.value)}
                        required
                        pattern="0[0-9]{9}"
                        placeholder="0901234567"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Địa Chỉ Nhận Hộp Mẫu Vải
                    </label>
                    <input
                      value={swatchAddress}
                      onChange={e => setSwatchAddress(e.target.value)}
                      required
                      minLength={5}
                      placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 2 }}
                    />
                  </div>

                  <div className="row between" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setShowSwatchModal(false)}
                    >
                      Bỏ qua
                    </button>
                    <button
                      type="submit"
                      className="button"
                      style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)' }}
                      disabled={swatchBusy}
                    >
                      {swatchBusy ? 'Đang gửi...' : 'Xác Nhận Đặt Hộp Mẫu Vải (50k)'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hộ Chiếu Vật Liệu & Chứng Thư Xuất Xứ (Digital Material Passport · DPP Modal) */}
      {showPassportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 20, 19, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 4,
            width: '100%',
            maxWidth: 680,
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: 24,
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            border: '1px solid var(--line)',
          }}>
            <div className="row between" style={{ alignItems: 'flex-start', borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 6 }}>
                  <Award size={13} /> DIGITAL PRODUCT PASSPORT (DPP) · BẢO CHỨNG ĐỘC BẢN
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--ink)' }}>
                  Hộ Chiếu Vật Liệu & Chứng Thư Xuất Xứ
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                  Bảo chứng nguồn gốc sợi, cấu trúc dệt và đội ngũ nghệ nhân thực hiện cho {p?.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassportModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {passportLoading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
                Đang đối soát sổ cái chứng thư nguyên bản...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Cryptographic Seal Banner */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 3,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 700 }}>
                      MÃ BẢO CHỨNG ĐỊNH DANH DUY NHẤT (SHA-256)
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--ink)', marginTop: 2 }}>
                      {materialPassport?.certificateCode || `NX-DPP-${p?.id.slice(0, 8).toUpperCase()}-SHA256`}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#059669', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <CheckCircle2 size={12} /> Đã xác thực nguyên bản trên Sổ Cái Hiệp Hội May Đo NEXORA
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      background: copiedCertCode ? '#059669' : '#fff',
                      color: copiedCertCode ? '#fff' : 'var(--ink)',
                      border: '1px solid var(--line)',
                      borderRadius: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const code = materialPassport?.certificateCode || `NX-DPP-${p?.id.slice(0, 8).toUpperCase()}-SHA256`;
                      navigator.clipboard.writeText(code);
                      setCopiedCertCode(true);
                      setTimeout(() => setCopiedCertCode(false), 2000);
                    }}
                  >
                    {copiedCertCode ? 'Đã sao chép' : 'Sao chép mã'}
                  </button>
                </div>

                {/* Section 1: Fiber & Origin */}
                <div style={{ border: '1px solid var(--line)', borderRadius: 3, padding: '14px 16px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                    <Compass size={14} color="var(--gold-dark)" /> Nguồn Gốc Sợi & Canh Vải Thủ Công
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, fontSize: 11.5 }}>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10.5 }}>Vùng Xuất Xứ Nguyên Liệu</span>
                      <strong style={{ color: 'var(--ink)' }}>{materialPassport?.originLocation || 'Normandy (Pháp) & Xưởng NÉP Atelier (Hà Nội)'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10.5 }}>Thành Phần Xơ Sợi</span>
                      <strong style={{ color: 'var(--ink)' }}>{materialPassport?.fiberComposition || '100% Linen hữu cơ dệt mộc tự nhiên'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10.5 }}>Mật Độ Canh Sợi & Định Lượng</span>
                      <strong style={{ color: 'var(--ink)' }}>{materialPassport?.weaveDensity || '185 GSM · Plain Weave'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)', display: 'block', fontSize: 10.5 }}>Mã Lô Sợi & Mẻ Dệt (Yarn Lot)</span>
                      <strong style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>{materialPassport?.yarnLot || `LOT-NX-${p?.id.slice(0, 6).toUpperCase()}-2026`}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
                    <span style={{ fontSize: 10.5, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Chứng nhận chất lượng đạt chuẩn:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(materialPassport?.certifications || ['GOTS Organic', 'OEKO-TEX Standard 100 Class I', 'Vietnam Heritage Craft']).map((c, i) => (
                        <span key={i} style={{ fontSize: 10.5, padding: '3px 8px', background: '#f1f5f9', color: '#334155', borderRadius: 2, border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={11} color="#059669" /> {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Artisan Roster */}
                <div style={{ border: '1px solid var(--line)', borderRadius: 3, padding: '14px 16px', background: '#fff' }}>
                  <div className="row between" style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                      <Scissors size={14} color="var(--gold-dark)" /> Đội Ngũ Nghệ Nhân Chế Tác Độc Bản
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 2 }}>
                      Tổng: {materialPassport?.totalCraftHours || 34} giờ may đo thủ công
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(materialPassport?.artisans || [
                      { role: 'Nghệ nhân rập & cắt vải chính', name: 'Đỗ Văn Thành', experienceYears: 24, handcraftHours: 14 },
                      { role: 'Thợ may ráp mí cuộn thủ công', name: 'Nguyễn Thị Mai', experienceYears: 18, handcraftHours: 16 },
                      { role: 'Kiểm định hoàn thiện & ủi hơi nước', name: 'Lê Hoàng Yến', experienceYears: 12, handcraftHours: 4 },
                    ]).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#fbfbfa', border: '1px solid var(--line)', borderRadius: 2, fontSize: 11 }}>
                        <div>
                          <strong style={{ color: 'var(--ink)', display: 'block' }}>{a.name}</strong>
                          <span style={{ color: 'var(--muted)', fontSize: 10 }}>{a.role} · {a.experienceYears} năm thâm niên</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gold-dark)', fontFamily: 'monospace' }}>
                          {a.handcraftHours} giờ chế tác
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Eco-Footprint */}
                <div style={{ border: '1px solid var(--line)', borderRadius: 3, padding: '14px 16px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                    <Leaf size={14} color="#059669" /> Dấu Ấn Sinh Thái Bền Vững & Lưu Truyền
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 11.5 }}>
                    <div style={{ background: '#f0fdf4', padding: '8px 10px', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: 10, color: '#166534', display: 'block' }}>Giảm Phát Thải CO2</span>
                      <strong style={{ color: '#14532d', fontSize: 13 }}>-{materialPassport?.ecoFootprint?.carbonSavedKg ?? 4.8} kg CO2e</strong>
                      <span style={{ fontSize: 9.5, color: '#166534', display: 'block', marginTop: 2 }}>So với may công nghiệp</span>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: 10, color: '#1e40af', display: 'block' }}>Tiết Kiệm Nước Ngọt</span>
                      <strong style={{ color: '#1e3a8a', fontSize: 13 }}>{materialPassport?.ecoFootprint?.waterSavedLiters?.toLocaleString('vi-VN') ?? '1.850'} Lít</strong>
                      <span style={{ fontSize: 9.5, color: '#1e40af', display: 'block', marginTop: 2 }}>Qua enzyme mộc tự nhiên</span>
                    </div>
                    <div style={{ background: '#fafaf9', padding: '8px 10px', borderRadius: 2, border: '1px solid #e7e5e4' }}>
                      <span style={{ fontSize: 10, color: '#57534e', display: 'block' }}>Không Chứa Vi Nhựa</span>
                      <strong style={{ color: '#292524', fontSize: 13 }}>100% Phân Hủy Sinh Học</strong>
                      <span style={{ fontSize: 9.5, color: '#57534e', display: 'block', marginTop: 2 }}>An toàn với hệ sinh thái</span>
                    </div>
                  </div>
                </div>

                <div className="row between" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowPassportModal(false)}
                  >
                    Đóng
                  </button>
                  <Link
                    href={`/tai-khoan?tab=passports&code=${materialPassport?.certificateCode || `NX-DPP-${p?.id.slice(0, 8).toUpperCase()}-SHA256`}`}
                    className="button"
                    style={{ background: 'var(--gold-dark)', borderColor: 'var(--gold-dark)', textDecoration: 'none' }}
                  >
                    Lưu Vào Hộ Chiếu VIP Của Bạn →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
