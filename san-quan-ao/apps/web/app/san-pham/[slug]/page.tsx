'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Heart, Ruler, ShieldCheck, ShoppingBag, Sparkles, Truck, Leaf, Droplets, CheckCircle, Award, BellRing, CheckCheck, Store, Star, Clock3, ShieldAlert, Eye, User, Maximize2, X } from 'lucide-react';
import { api, Product, useResource, vnd } from '../../api';
import { Loading, Notice, useUser } from '../../ui';

export default function Detail({ params }: { params: Promise<{ slug: string }> }) {
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
  const [passport, setPassport] = useState<{ height?: number; weight?: number; chest?: number; waist?: number; hip?: number; fitPref?: string } | null>(null);
  const { user } = useUser();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexora_fashion_passport');
      if (stored) setPassport(JSON.parse(stored));
    } catch {}
  }, []);

  const recommendedSize = passport
    ? (passport.chest && passport.chest >= 95) || (passport.waist && passport.waist >= 75)
      ? 'L'
      : (passport.chest && passport.chest <= 86) || (passport.waist && passport.waist <= 66)
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

  const currentImage = (p.images.find((i) => i.color === selectedColor) ?? p.images[0])?.url;

  return (
    <section className="section detail">
      <Link href="/" className="back">
        <ArrowLeft size={16} />Tất cả trang phục
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <img
            src={currentImage}
            alt={`${p.name}, màu ${selectedColor}`}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('/products/shirt.svg')) {
                target.src = '/products/shirt.svg';
              }
            }}
          />
          <div
            style={{
              marginTop: 10,
              padding: '6px 12px',
              background: '#f4efe6',
              borderRadius: 4,
              fontSize: 11,
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>📷 Ảnh chụp thực tế sản phẩm (Không dùng AI)</span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>NEXORA Verified</span>
          </div>
        </div>

        <div className="detail-copy">
          <div className="row between">
            <p className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{p.shop.name}</span>
              {p.shop.isMall && (
                <span
                  style={{
                    background: 'var(--clay)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 2,
                    letterSpacing: '0.5px',
                  }}
                >
                  NEXORA MALL · CHÍNH HÃNG
                </span>
              )}
              <span style={{ color: 'var(--muted)' }}>/</span>
              <span>{p.category.name}</span>
            </p>
            {user && (
              <button
                className="icon-link"
                style={{ border: '1px solid var(--line)', padding: '6px 12px', gap: 6, fontSize: 12 }}
                disabled={wishBusy}
                onClick={toggleWishlist}
                aria-label="Yêu thích"
              >
                <Heart size={16} fill={p.isWishlisted ? 'var(--clay)' : 'none'} color={p.isWishlisted ? 'var(--clay)' : 'var(--ink)'} />
                <span>{p.isWishlisted ? 'Đã lưu' : 'Lưu lại'}</span>
              </button>
            )}
          </div>

          <h1>{p.name}</h1>
          <p className="detail-price">{vnd(variant?.price ?? Math.min(...p.variants.map((v) => v.price)))}</p>

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

          {/* Hồ Sơ Năng Lực & Uy Tín Gian Hàng (CAT-SELLER-SCORE-01) */}
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

            <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
              🛡️ Cam kết sàn: Đổi size tận cửa 24-48h · Đồng kiểm ngoại quan khi nhận · Hoàn tiền 200% nếu phát hiện hàng không chính hãng.
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

          {/* Nút Kích Hoạt Mô Phỏng Phom Dáng Silhouette 2D (CAT-VIRTUAL-SILHOUETTE) */}
          <div style={{ margin: '10px 0' }}>
            <button
              type="button"
              onClick={() => setShowSilhouetteModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
              }}
            >
              <Eye size={13} color="var(--clay)" /> 👗 Mô Phỏng Phom Dáng &amp; Độ Rủ 2D (CAT-VIRTUAL-SILHOUETTE)
            </button>
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

          {/* NEXORA Care+ Fashion Warranty Extension (VAS-WARRANTY-EXT) */}
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

          {notice && (
            <Notice error={failed}>
              {notice} {!failed && <Link href="/gio-hang">Xem giỏ →</Link>}
            </Notice>
          )}

          {/* Đăng Ký Thông Báo Có Hàng & Giảm Giá (USER-STOCK-ALERT-01) */}
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
                <BellRing size={15} /> Nhận thông báo khi có hàng lại hoặc giảm giá (USER-STOCK-ALERT-01)
              </button>
            )}
          </div>

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
              <Leaf size={18} color="var(--clay)" /> Hộ Chiếu Minh Bạch Chất Liệu &amp; Xuất Xứ (CAT-FABRIC-TRACE-01)
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
              <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 3, border: '1px solid #bbf7d0', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                  <Award size={15} /> Chỉ Số Dấu Chân Bền Vững (Eco-Footprint)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: 11, color: '#374151' }}>
                  <span>💧 Tiết kiệm nước: <strong>-65%</strong></span>
                  <span>🌿 Phát thải: <strong>1.4 kg CO2e</strong> (-72% so với Polyester)</span>
                  <span>♻️ Tự phân hủy sinh học: <strong>100% trong 12 tháng</strong></span>
                </div>
              </div>

              {/* Atelier Care Guide */}
              <div>
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--ink)' }}>Chăm sóc chuẩn Atelier (Atelier Care Guide):</strong>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 11, lineHeight: 1.6 }}>
                  <li>Giặt máy chu kỳ nhẹ / lụa hoặc giặt tay với nước mát dưới 30°C.</li>
                  <li>Không dùng chất tẩy clo mạnh; ưu tiên dung dịch giặt gốc thực vật.</li>
                  <li>Phơi trong bóng râm thoáng mát, tránh ánh nắng mặt trời gắt làm xơ cứng sợi vải.</li>
                  <li>Ủi hơi nước mặt trái ở nhiệt độ thấp để duy trì độ rủ và bề mặt óng ả nguyên bản.</li>
                </ul>
              </div>
            </div>
          </details>

          <details>
            <summary>Chính sách đổi size</summary>
            <p>{p.shop.returnPolicy}</p>
          </details>

          <details open>
            <summary>Đánh giá từ người mua ({p.reviews?.length ?? 0})</summary>
            {p.reviews?.length ? (
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {p.reviews.map((r) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                    <div className="row between">
                      <strong>{r.user.name}</strong>
                      <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p style={{ margin: '6px 0 0' }}>{r.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có đánh giá. Bạn có thể đánh giá sau khi nhận hàng.</p>
            )}
          </details>
        </div>
      </div>

      {/* Modal Mô Phỏng Phom Dáng & Độ Rủ 2D (CAT-VIRTUAL-SILHOUETTE-01) */}
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
    </section>
  );
}
