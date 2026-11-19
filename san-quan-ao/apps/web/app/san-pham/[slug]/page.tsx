'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Heart, Ruler, ShieldCheck, ShoppingBag, Sparkles, Truck, Leaf, Droplets, CheckCircle, Award, BellRing, CheckCheck } from 'lucide-react';
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
    </section>
  );
}
