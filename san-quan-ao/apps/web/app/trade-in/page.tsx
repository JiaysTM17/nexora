'use client';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, RefreshCw, RotateCcw, ShieldCheck, Calculator, Sparkles, Leaf, TrendingUp, Check, Truck, Clock, Package, MapPin, Recycle, Droplets, Award, FileText, Share2, Layers, Search, Eye, CheckCheck, QrCode, Cpu, ExternalLink, Copy, Key } from 'lucide-react';
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
  const [pickupScheduled, setPickupScheduled] = useState(false);
  const [pickupSlot, setPickupSlot] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('AFTERNOON');
  const [securityBag, setSecurityBag] = useState(true);
  const [pickupAddress, setPickupAddress] = useState('128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. HCM');
  const [lcaFabricType, setLcaFabricType] = useState<'LINEN' | 'SILK' | 'COTTON' | 'WOOL'>('LINEN');
  const [passportGenerated, setPassportGenerated] = useState(false);
  const [opticalScanTarget, setOpticalScanTarget] = useState<'ZIPPER' | 'WEAVE' | 'LABEL'>('WEAVE');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [sealTagRequested, setSealTagRequested] = useState(true);
  // TRADEIN-AI-AUTHENTICATION-NFT-01: NFT Digital Ownership Passport & Blockchain Tamper-Proof Provenance
  const [nftMinted, setNftMinted] = useState(false);
  const [isMintingNft, setIsMintingNft] = useState(false);
  const [nftTokenId, setNftTokenId] = useState('');
  const [nftTxHash, setNftTxHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_tradein_pickup');
      if (saved) setPickupScheduled(true);
      const savedAuth = localStorage.getItem('nexora_optical_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setScanComplete(true);
        setAuthCode(parsed.code);
      }
    } catch {}
  }, []);

  function handleSchedulePickup(e: FormEvent) {
    e.preventDefault();
    setPickupScheduled(true);
    try {
      localStorage.setItem('nexora_tradein_pickup', JSON.stringify({
        slot: pickupSlot,
        securityBag,
        address: pickupAddress,
        time: new Date().toISOString(),
      }));
    } catch {}
    setSuccess('✓ Đã đặt lịch bưu tá VinFast Green đến nhận đồ cũ niêm phong tận nhà thành công!');
  }
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
                    <Calculator size={18} color="var(--brand-indigo)" />
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
                            border: simCategory === cat.id ? '1px solid var(--brand-indigo)' : '1px solid var(--line)',
                            background: simCategory === cat.id ? '#fff' : '#fafafa',
                            color: simCategory === cat.id ? 'var(--brand-indigo)' : 'var(--ink)',
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
                            border: simGrade === g.id ? '1px solid var(--brand-indigo)' : '1px solid var(--line)',
                            background: simGrade === g.id ? '#fff' : '#fafafa',
                            color: simGrade === g.id ? 'var(--brand-indigo)' : 'var(--ink)',
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
                      <strong style={{ fontSize: 20, color: 'var(--brand-indigo)', fontFamily: 'var(--font-sans)', display: 'block', margin: '4px 0' }}>
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

          {/* Hẹn Giờ Bưu Tá Thu Gom Đồ Cũ Tận Nhà & Cấp Túi Niêm Phong (TRADEIN-COURIER-SLOT-01) */}
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
            }}
          >
            <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={18} color="var(--brand-indigo)" />
                <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
                  Hẹn Giờ Bưu Tá Thu Gom Đồ Cũ Tận Nhà (TRADEIN-COURIER-SLOT-01)
                </strong>
              </div>
              <span style={{ fontSize: 10, background: '#EEF2FF', color: 'var(--brand-indigo)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                WHITE-GLOVE COURIER PICKUP
              </span>
            </div>

            <p className="subtle" style={{ margin: '0 0 14px', fontSize: 12 }}>
              Không cần mang ra bưu cục. Bưu tá xe điện VinFast Green mang túi niêm phong quang học Tamper-Evident đến tận cửa nhà tiếp nhận miễn phí 100%.
            </p>

            {pickupScheduled ? (
              <div style={{ padding: 14, background: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
                <div className="row between" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} /> Đã Xếp Lịch Thu Gom #TRADEIN-PICKUP-889
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                      • Khung giờ hẹn: <strong>{pickupSlot === 'MORNING' ? 'Buổi sáng (08:00 - 12:00)' : pickupSlot === 'AFTERNOON' ? 'Buổi chiều (13:30 - 17:30)' : 'Buổi tối (18:00 - 21:00)'}</strong><br />
                      • Địa chỉ: {pickupAddress}<br />
                      • Dịch vụ kèm theo: {securityBag ? 'Bưu tá mang sẵn Túi Niêm Phong Quang Học Tamper-Evident & Tem Bảo Mật' : 'Khách hàng tự đóng gói trước'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button secondary"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                    onClick={() => {
                      setPickupScheduled(false);
                      try { localStorage.removeItem('nexora_tradein_pickup'); } catch {}
                    }}
                  >
                    Hủy / Đặt lại lịch
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSchedulePickup}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                      Khung giờ thuận tiện
                    </label>
                    <select
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value as any)}
                      style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid var(--line)' }}
                    >
                      <option value="MORNING">Buổi sáng (08:00 - 12:00)</option>
                      <option value="AFTERNOON">Buổi chiều (13:30 - 17:30)</option>
                      <option value="EVENING">Buổi tối (18:00 - 21:00)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: 4 }}>
                      Địa chỉ nhận đồ cũ
                    </label>
                    <input
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      style={{ width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 3, border: '1px solid var(--line)' }}
                      placeholder="Nhập địa chỉ nhà riêng hoặc văn phòng..."
                      required
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={securityBag}
                    onChange={(e) => setSecurityBag(e.target.checked)}
                    style={{ accentColor: 'var(--brand-indigo)' }}
                  />
                  Yêu cầu bưu tá mang kèm Túi Niêm Phong Quang Học Tamper-Evident &amp; Mã QR bảo mật
                </label>

                <div style={{ marginTop: 14 }}>
                  <button
                    type="submit"
                    className="button"
                    style={{ fontSize: 12, padding: '6px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Clock size={14} /> Xác Nhận Lịch Hẹn Thu Gom Tận Nhà
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      {/* Hộ Chiếu Tái Chế Sợi Dệt & Vòng Đời Tái Sinh Tuần Hoàn (TRADEIN-FABRIC-RECYCLING-INDEX-01) */}
      <div
        style={{
          marginTop: 24,
          padding: '20px 24px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 8,
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Recycle size={18} color="#059669" />
            <div>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                Hộ Chiếu Tái Chế Sợi Dệt &amp; Vòng Đời Tuần Hoàn LCA (TRADEIN-FABRIC-RECYCLING-INDEX-01)
              </strong>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Đo lường lượng tài nguyên bảo tồn và phân bổ 3 hướng tái sinh cho trang phục thu cũ.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            ZERO-LANDFILL LCA
          </span>
        </div>

        {/* Fabric Type Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { id: 'LINEN' as const, label: 'Lanh Normandy (Linen)', water: '2.700L', co2: '3.2 kg CO2e', chem: '0.85 kg' },
            { id: 'SILK' as const, label: 'Lụa Tơ Tằm Bảo Lộc', water: '1.900L', co2: '2.8 kg CO2e', chem: '0.60 kg' },
            { id: 'COTTON' as const, label: 'Bông Hữu Cơ GOTS', water: '3.800L', co2: '3.6 kg CO2e', chem: '1.10 kg' },
            { id: 'WOOL' as const, label: 'Dạ Len Ý (Merino Wool)', water: '2.400L', co2: '4.1 kg CO2e', chem: '0.90 kg' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setLcaFabricType(f.id);
                setPassportGenerated(false);
              }}
              style={{
                fontSize: 11,
                padding: '6px 12px',
                borderRadius: 4,
                border: lcaFabricType === f.id ? '1.5px solid #059669' : '1px solid #cbd5e1',
                background: lcaFabricType === f.id ? '#ecfdf5' : '#fff',
                color: lcaFabricType === f.id ? '#047857' : '#334155',
                fontWeight: lcaFabricType === f.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LCA Environmental Metrics */}
        {(() => {
          const lcaMetrics = {
            LINEN: { water: '2.700 lít', co2: '3.2 kg CO2e', chemical: '0.85 kg', landfill: '100% Chuyển hướng' },
            SILK: { water: '1.900 lít', co2: '2.8 kg CO2e', chemical: '0.60 kg', landfill: '100% Chuyển hướng' },
            COTTON: { water: '3.800 lít', co2: '3.6 kg CO2e', chemical: '1.10 kg', landfill: '100% Chuyển hướng' },
            WOOL: { water: '2.400 lít', co2: '4.1 kg CO2e', chemical: '0.90 kg', landfill: '100% Chuyển hướng' },
          }[lcaFabricType];

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
              <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Droplets size={16} color="#0284c7" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Nước sạch bảo tồn</span>
                <strong style={{ fontSize: 13, color: '#0369a1' }}>{lcaMetrics.water}</strong>
              </div>
              <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Leaf size={16} color="#16a34a" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Cắt giảm khí thải</span>
                <strong style={{ fontSize: 13, color: '#15803d' }}>{lcaMetrics.co2}</strong>
              </div>
              <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <ShieldCheck size={16} color="#d97706" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Hóa chất tổng hợp</span>
                <strong style={{ fontSize: 13, color: '#b45309' }}>−{lcaMetrics.chemical}</strong>
              </div>
              <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Recycle size={16} color="#7c3aed" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#64748b', display: 'block' }}>Bãi chôn lấp rác</span>
                <strong style={{ fontSize: 13, color: '#6d28d9' }}>{lcaMetrics.landfill}</strong>
              </div>
            </div>
          );
        })()}

        {/* 3 Circular Pathways */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 8 }}>
            Bản Đồ Phân Bổ 3 Hướng Tái Sinh Tuần Hoàn (Circular Allocation):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 11, color: '#0f172a' }}>1. Upcycling Haute Couture</strong>
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>35%</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                Chuyển giao cho các nhà thiết kế trẻ tại NEXORA Studio may nối (patchwork) thành các mẫu áo khoác độc bản.
              </p>
            </div>
            <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 11, color: '#0f172a' }}>2. Re-Loved Vintage Market</strong>
                <span style={{ fontSize: 10, background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>50%</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                Trải qua quy trình phục hồi Spa 1000 Lux và đưa lên gian hàng đồ cũ tuyển chọn với giá ưu đãi.
              </p>
            </div>
            <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <strong style={{ fontSize: 11, color: '#0f172a' }}>3. Bio-Felt Acoustic Panels</strong>
                <span style={{ fontSize: 10, background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>15%</span>
              </div>
              <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>
                Phần sợi xơ vụn được kéo sợi lại để sản xuất tấm tiêu âm và nỉ sinh học tự nhiên thân thiện môi trường.
              </p>
            </div>
          </div>
        </div>

        {passportGenerated ? (
          <div style={{ padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, fontSize: 12 }}>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span style={{ color: '#065f46', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Award size={15} /> Đã Cấp Hộ Chiếu Vòng Đời Tuần Hoàn Số: #PASSPORT-LCA-{Date.now().toString().slice(-6)}
              </span>
              <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                VERIFIED BY NEXORA ESG
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#047857', fontSize: 11 }}>
              Hộ chiếu đã được lưu trữ vào ví cá nhân (`localStorage`). Bạn đã góp phần giảm thiểu rác thải thời trang và đóng góp vào mục tiêu phát thải ròng bằng 0 (Net-Zero).
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem('nexora_circular_passport', JSON.stringify({
                  fabric: lcaFabricType,
                  code: `PASSPORT-LCA-${Date.now().toString().slice(-6)}`,
                  time: new Date().toISOString(),
                }));
              } catch {}
              setPassportGenerated(true);
            }}
            style={{
              width: '100%',
              padding: '9px 14px',
              background: '#047857',
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
            <Award size={14} /> Xuất Hộ Chiếu Vòng Đời Tuần Hoàn Số &amp; Xác Nhận Đóng Góp Sinh Thái
          </button>
        )}
      </div>

      {/* Quang Học Vi Điểm 50x & Thẩm Định Xác Thực Đồ Cũ (TRADEIN-AI-AUTHENTICATION-SCAN-01) */}
      <div
        style={{
          marginTop: 28,
          padding: '22px 26px',
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'grid', placeItems: 'center' }}>
              <Eye size={20} color="#38bdf8" />
            </div>
            <div>
              <strong style={{ fontSize: 15, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                Quang Học Vi Điểm 50x &amp; Thẩm Định Xác Thực Đồ Cũ (TRADEIN-AI-AUTHENTICATION-SCAN-01)
              </strong>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                Soi quang học 50x phân tích mật độ sợi dệt, độ sâu rãnh khắc CNC và tem dệt nhiệt chống hàng giả.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #0284c7', padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>
            ISO 4915 &amp; ENTRUPY STANDARD · 50X OPTICAL
          </span>
        </div>

        {/* Target Points Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {[
            { id: 'WEAVE' as const, label: '🔬 1. Cấu Trúc Sợi Dệt & Vết Chỉ (ISO 4915)', desc: 'Mật độ 22 sợi/cm, đường vắt sổ đôi song song 1.2mm' },
            { id: 'ZIPPER' as const, label: '⚙️ 2. Khóa Kéo & Kim Loại Khắc CNC', desc: 'Rãnh khắc sâu 0.15mm chuẩn YKK Excella / Lampo mạ PVD' },
            { id: 'LABEL' as const, label: '🏷️ 3. Tem Lụa & Sợi Huỳnh Quang UV', desc: 'Chữ vi tính Micro-print 0.3mm & sợi bảo an quang học 3D' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setOpticalScanTarget(t.id);
                setScanComplete(false);
              }}
              style={{
                fontSize: 11,
                padding: '8px 14px',
                borderRadius: 4,
                border: opticalScanTarget === t.id ? '1.5px solid #38bdf8' : '1px solid #334155',
                background: opticalScanTarget === t.id ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                color: opticalScanTarget === t.id ? '#38bdf8' : '#cbd5e1',
                fontWeight: opticalScanTarget === t.id ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Optical 50x Simulated Viewport */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          {/* Circular Aperture */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: '2px dashed #38bdf8',
                background: opticalScanTarget === 'WEAVE'
                  ? 'radial-gradient(circle, #0284c7 10%, #0f172a 75%)'
                  : opticalScanTarget === 'ZIPPER'
                  ? 'radial-gradient(circle, #64748b 10%, #0f172a 75%)'
                  : 'radial-gradient(circle, #8b5cf6 10%, #0f172a 75%)',
                position: 'relative',
                display: 'grid',
                placeItems: 'center',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 0 15px rgba(56, 189, 248, 0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Crosshairs */}
              <div style={{ position: 'absolute', width: '100%', height: 1, background: 'rgba(56, 189, 248, 0.4)' }} />
              <div style={{ position: 'absolute', height: '100%', width: 1, background: 'rgba(56, 189, 248, 0.4)' }} />
              <div style={{ width: 70, height: 70, borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.3)' }} />
              <span style={{ fontSize: 9, color: '#38bdf8', fontWeight: 700, zIndex: 2, background: 'rgba(15,23,42,0.7)', padding: '1px 4px', borderRadius: 2 }}>
                50X ZOOM
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Kính hiển vi quang học phân giải cao 1000 Lux</span>
          </div>

          {/* Optical Analysis Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                {opticalScanTarget === 'WEAVE'
                  ? 'Kiểm định sợi dệt tự nhiên & Vết kim'
                  : opticalScanTarget === 'ZIPPER'
                  ? 'Kiểm định khắc vi tính phụ kiện kim loại'
                  : 'Kiểm định tem dệt nhiệt chống giả'}
              </span>
              <span style={{ fontSize: 10, background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                128.400+ MẪU ĐỐI SÁNH
              </span>
            </div>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>
              {opticalScanTarget === 'WEAVE'
                ? 'Sợi lanh Normandy dệt chéo 2/2 đồng nhất, không pha trộn tạp chất nylon tái sinh, bước chỉ may vắt sổ 5 mũi/cm không rút xơ.'
                : opticalScanTarget === 'ZIPPER'
                ? 'Răng khóa đồng nguyên khối cắt gọt CNC độ sâu 0.15mm, lớp phủ mạ PVD chống hoen gỉ, logo dập sắc nét không bavia.'
                : 'Mực in phản quang sắc nét vi mô 0.3mm, đường dệt sợi quang học ẩn dưới ánh sáng UV bước sóng 365nm.'}
            </p>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ padding: '6px 8px', background: '#0f172a', borderRadius: 4, border: '1px solid #334155' }}>
                <span style={{ fontSize: 9, color: '#94a3b8', display: 'block' }}>Độ khớp mẫu</span>
                <strong style={{ fontSize: 12, color: '#38bdf8' }}>99.4%</strong>
              </div>
              <div style={{ padding: '6px 8px', background: '#0f172a', borderRadius: 4, border: '1px solid #334155' }}>
                <span style={{ fontSize: 9, color: '#94a3b8', display: 'block' }}>Rủi ro hàng nhái</span>
                <strong style={{ fontSize: 12, color: '#4ade80' }}>&lt; 0.6%</strong>
              </div>
              <div style={{ padding: '6px 8px', background: '#0f172a', borderRadius: 4, border: '1px solid #334155' }}>
                <span style={{ fontSize: 9, color: '#94a3b8', display: 'block' }}>Chuẩn phân giải</span>
                <strong style={{ fontSize: 12, color: '#fbbf24' }}>50x Lux</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Actions & Result */}
        {scanComplete ? (
          <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', borderRadius: 6 }}>
            <div className="row between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCheck size={16} /> ĐÃ THẨM ĐỊNH CHÍNH HÃNG 100% · MÃ: {authCode}
              </span>
              <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                VERIFIED AUTHENTIC
              </span>
            </div>
            <p style={{ margin: '0 0 8px', color: '#a7f3d0', fontSize: 11 }}>
              Chứng thư thẩm định số hóa bất biến đã được liên kết với hồ sơ Trade-In của bạn. Khi gửi đồ về Hub, hệ thống sẽ tự động đối chiếu mã quang học này trong vòng 120 giây.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sealTagRequested}
                onChange={(e) => setSealTagRequested(e.target.checked)}
                style={{ accentColor: '#38bdf8' }}
              />
              Yêu cầu dán thêm tem niêm phong giáp lai vật lý Hologram 3D chống giả khi bưu tá nhận đồ
            </label>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={isScanning}
              onClick={() => {
                setIsScanning(true);
                setTimeout(() => {
                  const generatedCode = `#AUTH-NEXORA-${Date.now().toString().slice(-6)}`;
                  setAuthCode(generatedCode);
                  setScanComplete(true);
                  setIsScanning(false);
                  try {
                    localStorage.setItem('nexora_optical_auth', JSON.stringify({
                      target: opticalScanTarget,
                      code: generatedCode,
                      time: new Date().toISOString(),
                    }));
                  } catch {}
                  setSuccess('✓ Đã hoàn tất thẩm định quang học vi điểm 50x: Xác nhận 99.4% Chính hãng!');
                }, 1200);
              }}
              style={{
                flex: 1,
                minWidth: 220,
                padding: '10px 16px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                cursor: isScanning ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Search size={14} />
              {isScanning ? 'Đang phân tích cấu trúc vi điểm 50x…' : 'Kích Hoạt Quét Quang Học Vi Điểm 50x & Cấp Mã Thẩm Định'}
            </button>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Thời gian quét: ~1.2s · Không làm tổn hại sợi vải
            </span>
          </div>
        )}
      </div>

      {/* Hộ Chiếu Sở Hữu Số NFT & Sổ Cái Xác Thực Bất Biến (TRADEIN-AI-AUTHENTICATION-NFT-01) */}
      <div
        style={{
          marginTop: 28,
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #09131f 0%, #0d1e2e 50%, #081724 100%)',
          color: '#f8fafc',
          border: '1px solid #1e3a5f',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={22} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-sans)', color: '#f8fafc' }}>
                Hộ Chiếu Sở Hữu Số NFT &amp; Sổ Cái Xác Thực Bất Biến (TRADEIN-AI-AUTHENTICATION-NFT-01)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
                Chuẩn hóa quyền sở hữu số ERC-721 &amp; W3C Verifiable Credentials trên Nexora Eco-Chain
              </p>
            </div>
          </div>
          <span
            style={{
              background: 'linear-gradient(90deg, #0284c7, #0ea5e9)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 4,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            WEB3 PROVENANCE PASSPORT
          </span>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#cbd5e1', margin: '0 0 20px' }}>
          Mỗi trang phục sau khi hoàn tất kiểm định quang học 50x sẽ được đúc (mint) một thẻ NFT Hộ chiếu số độc bản. Thẻ này lưu giữ dấu vân tay cơ lý sợi dệt, nguồn gốc xưởng may và toàn bộ lịch sử chăm sóc bảo dưỡng, biến thời trang tuần hoàn thành tài sản có thể chuyển nhượng minh bạch và chống giả tuyệt đối.
        </p>

        {nftMinted ? (
          <div
            style={{
              padding: 20,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #38bdf8',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <QrCode size={36} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Mã Định Danh Token Sở Hữu Số (ERC-721)
                  </div>
                  <strong style={{ fontSize: 16, color: '#38bdf8', letterSpacing: '0.05em' }}>
                    {nftTokenId || '#NEX-NFT-AUTH-77921'}
                  </strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 11, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: 3, fontWeight: 700 }}>
                  ✓ Đã Khắc Dấu Trên Nexora Eco-Chain
                </span>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                  Mạng Polygon Layer-2 Proof · Zero Gas Waste
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Bar */}
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(2, 6, 23, 0.75)',
                border: '1px solid #1e293b',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#94a3b8',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <Key size={13} color="#f59e0b" />
                <span>Băm Mật Mã Cấu Trúc Sợi (SHA-256):</span>
                <span style={{ color: '#e2e8f0' }}>{nftTxHash || '0x8f2a93c12b79e4d08a9f620b1e4c73d9518ac9318b320d75c9a12'}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCopiedHash(true);
                  setTimeout(() => setCopiedHash(false), 2000);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedHash ? '#34d399' : '#38bdf8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  padding: 0,
                }}
              >
                <Copy size={12} />
                {copiedHash ? 'Đã sao chép!' : 'Sao chép băm'}
              </button>
            </div>

            {/* 3-Stage Provenance Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                fontSize: 12,
              }}
            >
              <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: 4, borderLeft: '3px solid #38bdf8' }}>
                <strong style={{ display: 'block', color: '#f8fafc', marginBottom: 4 }}>
                  1. Khởi Sinh Chế Tác (Genesis)
                </strong>
                <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
                  Xưởng may đo Độc Bản #08 · Vải Linen Normandy kết hợp tơ tằm Bảo Lộc dệt thủ công 220 GSM.
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: 4, borderLeft: '3px solid #10b981' }}>
                <strong style={{ display: 'block', color: '#f8fafc', marginBottom: 4 }}>
                  2. Thẩm Định Quang Học 50x
                </strong>
                <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
                  Soi vi điểm ISO 4915, rãnh khóa CNC 0.15mm · Xác nhận 99.4% chuẩn xác thực chính hãng.
                </p>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: 4, borderLeft: '3px solid #f59e0b' }}>
                <strong style={{ display: 'block', color: '#f8fafc', marginBottom: 4 }}>
                  3. Quyền Lưu Ký Số (Custody)
                </strong>
                <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.5 }}>
                  Khóa định danh gắn với tài khoản cá nhân. Hỗ trợ 1-chạm chuyển giao khi bán lại Re-Loved hoặc đổi P2P Swap.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setSuccess(`✓ Đã mở Hộ chiếu số #${nftTokenId || 'NEX-NFT-AUTH-77921'} trên Nexora Explorer.`);
                }}
                style={{
                  padding: '8px 14px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ExternalLink size={13} /> Xem Trên Nexora Explorer
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccess(`✓ Sẵn sàng chuyển giao quyền sở hữu NFT #${nftTokenId || 'NEX-NFT-AUTH-77921'} cho người mua tiếp theo.`);
                }}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Share2 size={13} /> Chuyển Giao Quyền Sở Hữu
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccess(`✓ Đã tải gói chứng thư Hộ chiếu số định dạng W3C JSON-LD thành công.`);
                }}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FileText size={13} /> Tải Chứng Thư Xác Thực (JSON-LD)
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, padding: 18, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 6, border: '1px dashed #334155' }}>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#f8fafc' }}>
                Chưa đúc NFT Hộ Chiếu Sở Hữu Số cho trang phục này
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Sau khi đúc, bạn sẽ nhận được **+200 Điểm Thưởng Xanh** và sở hữu vĩnh viễn chứng nhận gốc trên blockchain.
              </p>
            </div>
            <button
              type="button"
              disabled={isMintingNft}
              onClick={() => {
                setIsMintingNft(true);
                setTimeout(() => {
                  const tokenId = `#NEX-NFT-AUTH-${Date.now().toString().slice(-5)}`;
                  const txHash = `0x${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
                  setNftTokenId(tokenId);
                  setNftTxHash(txHash);
                  setNftMinted(true);
                  setIsMintingNft(false);
                  try {
                    localStorage.setItem('nexora_nft_auth_passport', JSON.stringify({
                      tokenId,
                      txHash,
                      mintDate: new Date().toISOString(),
                    }));
                  } catch {}
                  setSuccess(`✓ Đúc thành công Hộ Chiếu Sở Hữu Số NFT ${tokenId} trên Nexora Eco-Chain! Cộng +200 Điểm Xanh.`);
                }, 1400);
              }}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                cursor: isMintingNft ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Cpu size={14} />
              {isMintingNft ? 'Đang mã hóa & ghi vào sổ cái Eco-Chain…' : 'Đúc Hộ Chiếu Số NFT & Khắc Dấu Chuỗi Khối (+200 Điểm)'}
            </button>
          </div>
        )}
      </div>

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
          <ShieldCheck size={22} color="var(--brand-indigo)" />
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
            Chính sách Bảo chứng Thu cũ &amp; Quyền Cân nhắc 14 Ngày (NEXORA SLA Guarantee)
          </h3>
          <span
            style={{
              background: 'var(--brand-indigo)',
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
              <RotateCcw size={16} color="var(--brand-indigo)" />
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
