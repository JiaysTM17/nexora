'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, RefreshCw, RotateCcw, ShieldCheck, Calculator, Sparkles, Leaf, TrendingUp, Check } from 'lucide-react';
import { api, TradeInRequest, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

const STATUS_LABELS: Record<string, string> = {
  AI_PRELIMINARY: 'Vòng 1: Đã định giá AI sơ bộ',
  HUB_INSPECTING: 'Vòng 2: Đang giám định tại Hub',
  APPROVED: 'Đã duyệt · Đã cấp Voucher',
  REJECTED: 'Không đạt tiêu chuẩn thu mua',
};

export default function TradeInPage() {
  const { user } = useUser();
  const list = useResource<TradeInRequest[]>(user ? '/trade-in' : null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
  const [simCategory, setSimCategory] = useState<'SHIRT' | 'BLAZER' | 'DRESS' | 'BAG'>('SHIRT');
  const [simGrade, setSimGrade] = useState<'S' | 'A' | 'B' | 'C'>('A');
  const [formFields, setFormFields] = useState({
    brand: '',
    itemName: '',
    category: 'Áo khoác',
    conditionNote: '',
  });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const created = await api<TradeInRequest>('/trade-in', 'POST', {
        brand: String(d.get('brand')),
        itemName: String(d.get('itemName')),
        category: String(d.get('category')),
        conditionNote: String(d.get('conditionNote')),
        imageUrl: String(d.get('imageUrl') || ''),
      });
      form.reset();
      setSuccess(`Đã tiếp nhận! Định giá AI sơ bộ: Grade ${created.grade} — ${vnd(created.estimatedValue)}.`);
      list.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />NEXORA CIRCULAR FASHION</p>
      <div className="section-heading">
        <div>
          <h1>Thu cũ Đổi mới <em>2 Vòng</em></h1>
          <p className="subtle">Vòng 1 AI Vision định giá tức thì · Vòng 2 giám định trực tiếp tại Hub dưới buồng sáng 1000 Lux · Nhận Voucher mua sắm ngay.</p>
        </div>
      </div>

      {!user ? (
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để gửi yêu cầu Trade-In và nhận Voucher đối ứng.</Notice>
      ) : (
        <>
          {/* Bộ Giả Lập Định Giá Thu Cũ Đổi Mới Tức Thì (TRADEIN-ESTIMATE-SIMULATOR-01) */}
          {(() => {
            const simData = {
              SHIRT: { name: 'Áo Sơ Mi Lụa / Linen Cao Cấp', basePrice: 1250000, category: 'Áo khoác', defaultBrand: 'NEXORA Atelier' },
              BLAZER: { name: 'Áo Khoác Blazer May Đo / Sartorial', basePrice: 2850000, category: 'Áo khoác', defaultBrand: 'COS' },
              DRESS: { name: 'Đầm Lụa Midi / Váy Thiết Kế', basePrice: 1950000, category: 'Đầm / Váy', defaultBrand: 'Gia Studios' },
              BAG: { name: 'Túi Da Thuộc Thảo Mộc / Phụ Kiện', basePrice: 2200000, category: 'Túi xách', defaultBrand: 'NÉP Studio' },
            };
            const gradeRatios = { S: 0.5, A: 0.4, B: 0.3, C: 0.2 };
            const activeItem = simData[simCategory];
            const estimatedValue = Math.round(activeItem.basePrice * gradeRatios[simGrade]);

            return (
              <div
                style={{
                  marginBottom: 24,
                  padding: '18px 22px',
                  background: '#fcfbf7',
                  border: '1px solid #fed7aa',
                  borderRadius: 6,
                }}
              >
                <div className="row between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calculator size={18} color="var(--clay)" />
                    <strong style={{ fontSize: 14, color: '#9a3412' }}>
                      Bộ Giả Lập Định Giá Thu Cũ Đổi Mới Tức Thì (TRADEIN-ESTIMATE-SIMULATOR)
                    </strong>
                  </div>
                  <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                    CHUẨN KHẢO THÍ 1000 LUX
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                  {/* Select Category */}
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      1. Loại trang phục tái sinh:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { id: 'SHIRT', label: 'Áo Sơ Mi Lụa / Linen (~1.25M)' },
                        { id: 'BLAZER', label: 'Áo Khoác Blazer / Suit (~2.85M)' },
                        { id: 'DRESS', label: 'Đầm Lụa Midi Thiết Kế (~1.95M)' },
                        { id: 'BAG', label: 'Túi Da Thuộc / Phụ Kiện (~2.2M)' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: 11,
                            borderRadius: 3,
                            border: simCategory === cat.id ? '1px solid var(--clay)' : '1px solid var(--line)',
                            background: simCategory === cat.id ? '#fff' : '#fafafa',
                            color: simCategory === cat.id ? 'var(--clay)' : 'var(--ink)',
                            fontWeight: simCategory === cat.id ? 700 : 400,
                            cursor: 'pointer',
                          }}
                          onClick={() => setSimCategory(cat.id as any)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Grade */}
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                      2. Tình trạng thực tế (Grading):
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[
                        { id: 'S', label: 'Grade S · Nguyên tag / Chưa mặc (50%)' },
                        { id: 'A', label: 'Grade A · Mặc 1-2 lần, hoàn hảo (40%)' },
                        { id: 'B', label: 'Grade B · Đã mặc, không lỗi (30%)' },
                        { id: 'C', label: 'Grade C · Sờn mờ nhẹ (20%)' },
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          style={{
                            textAlign: 'left',
                            padding: '6px 10px',
                            fontSize: 11,
                            borderRadius: 3,
                            border: simGrade === g.id ? '1px solid var(--clay)' : '1px solid var(--line)',
                            background: simGrade === g.id ? '#fff' : '#fafafa',
                            color: simGrade === g.id ? 'var(--clay)' : 'var(--ink)',
                            fontWeight: simGrade === g.id ? 700 : 400,
                            cursor: 'pointer',
                          }}
                          onClick={() => setSimGrade(g.id as any)}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimate Result Box */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#fff',
                      border: '1px solid #fed7aa',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', display: 'block' }}>
                        Ước Tính Voucher Nhận Được:
                      </span>
                      <strong style={{ fontSize: 20, color: 'var(--clay)', fontFamily: 'Georgia, serif', display: 'block', margin: '4px 0' }}>
                        {vnd(estimatedValue)}
                      </strong>
                      <div style={{ fontSize: 11, color: '#166534', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Leaf size={13} /> Giảm phát thải: <strong>~3.2 kg CO2e</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="button secondary"
                      style={{ fontSize: 11, padding: '6px 10px', marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      onClick={() => {
                        setFormFields({
                          brand: activeItem.defaultBrand,
                          itemName: activeItem.name,
                          category: activeItem.category,
                          conditionNote: `Tình trạng Grade ${simGrade} (Ước tính voucher: ${vnd(estimatedValue)}). Đã kiểm tra không sờn rách vải.`,
                        });
                      }}
                    >
                      <Check size={13} /> Áp dụng vào form gửi đồ ↓
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="checkout-grid">
            <form className="panel form" onSubmit={submit}>
              <h2><RefreshCw size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />Gửi đồ cần thu cũ</h2>
              {error && <Notice error>{error}</Notice>}
              {success && <Notice>{success}</Notice>}
              <label>Thương hiệu<input name="brand" value={formFields.brand} onChange={e => setFormFields({ ...formFields, brand: e.target.value })} required minLength={2} placeholder="VD: NÉP Studio, Jacquemus, Burberry..." /></label>
              <label>Tên sản phẩm<input name="itemName" value={formFields.itemName} onChange={e => setFormFields({ ...formFields, itemName: e.target.value })} required minLength={3} placeholder="VD: Túi da mini / Áo khoác trench..." /></label>
              <label>Phân loại
                <select name="category" value={formFields.category} onChange={e => setFormFields({ ...formFields, category: e.target.value })}>
                  <option value="Túi xách">Túi xách</option>
                  <option value="Áo khoác">Áo khoác</option>
                  <option value="Đầm / Váy">Đầm / Váy</option>
                  <option value="Giày dép">Giày dép</option>
                  <option value="Phụ kiện">Phụ kiện</option>
                </select>
              </label>
              <label>Mô tả tình trạng thực tế<textarea name="conditionNote" value={formFields.conditionNote} onChange={e => setFormFields({ ...formFields, conditionNote: e.target.value })} required minLength={5} placeholder="VD: Mới 95%, ít sử dụng, còn hộp và tag..." /></label>
              <label>URL ảnh chụp chi tiết (tùy chọn)<input name="imageUrl" placeholder="http://localhost:3000/products/outfit.svg" /></label>
              <button className="button" disabled={busy}>{busy ? 'Đang định giá AI…' : 'Định giá Vòng 1 ngay'}</button>
            </form>

            <div>
              <article className="panel">
                <h2>Hồ sơ Trade-In của bạn</h2>
                {list.loading ? <Loading /> : !list.data?.length ? (
                  <p className="subtle">Bạn chưa có yêu cầu thu cũ đổi mới nào.</p>
                ) : list.data.map(item => (
                  <div key={item.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                    <div className="row between">
                      <strong>{item.brand} · {item.itemName}</strong>
                      <span className="badge">Grade {item.grade}</span>
                    </div>
                    <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--muted)' }}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </p>
                    <p style={{ margin: 0, fontSize: 13 }}>
                      Ước tính Vòng 1: <strong>{vnd(item.estimatedValue)}</strong>
                      {item.finalValue !== null && <> · Chốt Vòng 2: <strong>{vnd(item.finalValue)}</strong></>}
                    </p>
                    {item.voucherCode && (
                      <p style={{ margin: '8px 0 0', padding: '6px 10px', background: 'var(--sage)', fontSize: 12 }}>
                        Voucher đối ứng: <strong>{item.voucherCode}</strong>
                      </p>
                    )}
                  </div>
                ))}
              </article>
            </div>
          </div>
        </>
      )}

      {/* Cam kết Bảo chứng Thu cũ & Quyền Cân nhắc 14 ngày (VAS-TRADEIN-REQUOTE) */}
      <div
        style={{
          marginTop: 32,
          padding: '24px 28px',
          background: '#fcfaf6',
          border: '1px solid var(--line)',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <ShieldCheck size={22} color="var(--clay)" />
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
            Chính sách Bảo chứng Thu cũ &amp; Quyền Cân nhắc 14 Ngày (NEXORA SLA Guarantee)
          </h3>
          <span
            style={{
              background: 'var(--clay)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 3,
            }}
          >
            HOÀN TRẢ 0Đ
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div style={{ padding: '12px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>
              <RotateCcw size={16} color="var(--clay)" />
              <span>Quyền cân nhắc 14 ngày vô điều kiện</span>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Sau khi có định giá Vòng 2 tại Hub, bạn có 14 ngày để đồng ý đổi voucher hoặc yêu cầu hoàn trả lại trang phục ban đầu.
            </p>
          </div>

          <div style={{ padding: '12px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>Bảo hiểm hoàn trả 0đ tận cửa</span>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Nếu mức định giá Vòng 2 chênh lệch trên 10% so với AI Vòng 1, NEXORA miễn phí hoàn toàn cước vận chuyển hoàn trả 2 chiều.
            </p>
          </div>

          <div style={{ padding: '12px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>
              <ShieldCheck size={16} color="#2563eb" />
              <span>Niêm phong quang học Tamper-Evident</span>
            </div>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Trang phục được quay video unboxing 4K tại buồng sáng 1000 Lux và đóng tem niêm phong bảo mật trước khi gửi trả lại.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
