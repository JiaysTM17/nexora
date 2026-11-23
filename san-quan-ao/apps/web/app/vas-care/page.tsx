'use client';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Calendar, MapPin, Sparkles, Clock, CheckCircle2, QrCode, Building, Scissors, Sliders, Eye, Layers, Stethoscope, Activity, FileCheck, ArrowRight, Tag, Lock, Search, ZoomIn, Sun, Zap, Thermometer, RotateCcw, Droplets, Wind } from 'lucide-react';
import { api, CareBooking, useResource, vnd } from '../api';
import { Loading, Notice, useUser } from '../ui';

const SERVICE_LABELS: Record<string, string> = {
  SPA_CLEANING: 'Giặt hấp & Spa trang phục cao cấp (250.000đ)',
  LEATHER_RESTORE: 'Phục hồi & Dưỡng da túi/giày hiệu (450.000đ)',
  TAILORING: 'Chỉnh sửa phom dáng chuẩn May đo (180.000đ)',
  AUTHENTICATION: 'Giám định chính hãng Entrupy / Chuyên viên (350.000đ)',
};

const CARE_STATUS: Record<string, string> = {
  BOOKED: 'Đã đặt lịch · Chờ shipper niêm phong',
  SEALED_PICKUP: 'Đã niêm phong Zip-seal & nhận hàng',
  OPTICAL_CHECK: 'Đã chụp biên bản quang học 8 góc',
  IN_CARE: 'Đang xử lý Spa / Phục hồi tại Hub',
  RETURNED: 'Đã hoàn trả tận tay khách hàng',
};

type AtelierBooking = {
  id: string;
  code: string;
  hub: string;
  address: string;
  service: string;
  date: string;
  slot: string;
  notes: string;
  createdAt: string;
};

const ATELIER_HUBS = [
  {
    id: 'HCM',
    name: 'NEXORA Flagship Atelier Sài Gòn',
    address: '128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phone: '028 3822 8899',
  },
  {
    id: 'HN',
    name: 'NEXORA Heritage Atelier Hà Nội',
    address: '68 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    phone: '024 3933 6688',
  },
];

const ATELIER_SERVICES = [
  {
    id: 'BESPOKE_FITTING',
    name: 'Thử đồ Private Suite & May đo tinh chỉnh phom dáng (Bespoke Fitting)',
    price: 0,
    desc: 'Miễn phí cho mọi khách hàng NEXORA. Nghệ nhân may đo đo trực tiếp và điều chỉnh đường chỉ, vạt áo chuẩn xác theo phom người.',
  },
  {
    id: 'VIP_STYLING',
    name: 'Tư vấn định hình phong cách cá nhân cùng Senior Stylist',
    price: 350000,
    desc: 'Phiên tư vấn 1-on-1 trong 60 phút, phân tích sắc tố da (Personal Color), kiểu dáng và thiết lập bộ sưu tập Capsule 7 ngày.',
  },
  {
    id: 'ATELIER_SPA',
    name: 'Giao nhận & Trực tiếp kiểm tra quang học 8 góc tại Atelier Lounge',
    price: 250000,
    desc: 'Trực tiếp bàn giao trang phục, thưởng thức trà hoa thảo mộc chào mừng trong khi chuyên viên kiểm định và niêm phong.',
  },
];

export default function VasCarePage() {
  const { user } = useUser();
  const list = useResource<CareBooking[]>(user ? '/vas-care' : null);
  const [activeTab, setActiveTab] = useState<'COURIER' | 'ATELIER'>('COURIER');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [sampleKey, setSampleKey] = useState<'BLAZER' | 'SILK' | 'LEATHER'>('BLAZER');
  const [selectedGarmentType, setSelectedGarmentType] = useState<'WOOL_BLAZER' | 'SILK_DRESS' | 'VEG_LEATHER' | 'LINEN_SHIRT'>('WOOL_BLAZER');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('STAIN_YELLOW');
  const [diagnosisDone, setDiagnosisDone] = useState(false);
  const [diagnosedProtocol, setDiagnosedProtocol] = useState<{
    grade: string;
    recoveryRate: string;
    chemical: string;
    duration: string;
    recommendedService: string;
    serviceCode: string;
    voucher: string;
  } | null>(null);
  const [defaultItemName, setDefaultItemName] = useState('');
  const [defaultNotes, setDefaultNotes] = useState('');
  const [showVaultTracker, setShowVaultTracker] = useState(true);
  const [vaultMacroView, setVaultMacroView] = useState(false);
  const [sterilizationPreset, setSterilizationPreset] = useState<'SILK_CASHMERE' | 'LEATHER_BAGS' | 'EVENING_GOWNS'>('SILK_CASHMERE');
  const [sterilizationBooked, setSterilizationBooked] = useState(false);
  const [sterilizationTicket, setSterilizationTicket] = useState('');
  const [co2Preset, setCo2Preset] = useState<'CASHMERE' | 'SILK' | 'WOOL_SUIT'>('CASHMERE');
  const [co2Booked, setCo2Booked] = useState(false);
  const [co2Ticket, setCo2Ticket] = useState('');

  function runGarmentDiagnosis() {
    let grade = 'Cấp II · Tổn thương sắc tố bề mặt sợi (Reversible)';
    let recoveryRate = '98.5%';
    let chemical = 'Enzyme sinh học Protease & Amylase pH 6.2 trung tính, không bào mòn cấu trúc sợi';
    let duration = '24–36 giờ';
    let recommendedService = 'Giặt hấp & Spa trang phục cao cấp (250.000đ)';
    let serviceCode = 'SPA_CLEANING';
    let voucher = 'RESCUE50';

    if (selectedSymptom === 'MOLD_DRY' || selectedGarmentType === 'VEG_LEATHER') {
      grade = 'Cấp III · Suy giảm lipid và hydrat hóa mô da tự nhiên';
      recoveryRate = '96.8%';
      chemical = 'Xông khử khuẩn Ozone y tế + Tinh dầu chồn Mink Oil nguyên chất + Sáp ong rừng tự nhiên';
      duration = '48 giờ';
      recommendedService = 'Phục hồi & Dưỡng da túi/giày hiệu (450.000đ)';
      serviceCode = 'LEATHER_RESTORE';
    } else if (selectedSymptom === 'COLLAPSED_SHOULDER') {
      grade = 'Cấp I · Lệch cấu trúc nẹp phom may đo';
      recoveryRate = '99.4%';
      chemical = 'Ủ hơi nước vi điểm buồng sáng 1000 Lux, cố định phom dáng Mannequin Croquis';
      duration = '12–24 giờ';
      recommendedService = 'Chỉnh sửa phom dáng chuẩn May đo (180.000đ)';
      serviceCode = 'TAILORING';
    } else if (selectedSymptom === 'FRAYED_SEAMS') {
      grade = 'Cấp II · Suy thoái liên kết sợi chỉ may chịu lực';
      recoveryRate = '99.0%';
      chemical = 'Khâu tay đệm lụa tơ tằm đôi, đơm lại khuy xà cừ tự nhiên chính hãng';
      duration = '24 giờ';
      recommendedService = 'Chỉnh sửa phom dáng chuẩn May đo (180.000đ)';
      serviceCode = 'TAILORING';
    }

    setDiagnosedProtocol({
      grade,
      recoveryRate,
      chemical,
      duration,
      recommendedService,
      serviceCode,
      voucher,
    });
    setDiagnosisDone(true);
  }

  const RESTORATION_SAMPLES = {
    BLAZER: {
      title: 'Áo Blazer Dạ Len Ý (Super 130s Wool)',
      beforeDesc: 'Trũng đệm vai, gãy nếp ve áo, xơ cứng bề mặt sợi dạ do ẩm mốc môi trường',
      afterDesc: 'Đứng phom nguyên bản 100%, nếp ve áo sắc nét, sợi len bồng bềnh tự nhiên',
      stats: 'Phục hồi form 3D: 99.2% · Khôi phục độ nảy sợi: 100%',
      beforeImg: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=95',
    },
    SILK: {
      title: 'Đầm Lụa Tơ Tằm Bảo Lộc (Mulberry Silk)',
      beforeDesc: 'Vệt ố trà loang lổ, xỉn màu ánh xà cừ, co rút mép tà sau giặt sai quy cách',
      afterDesc: 'Tẩy điểm ố bằng enzyme sinh học pH 6.5, tà áo bay rủ mềm mại như mới',
      stats: 'Giữ ánh xà cừ: 100% · Độ lệch màu Delta E: 0.2 (Hoàn hảo)',
      beforeImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=95',
    },
    LEATHER: {
      title: 'Túi Xách Da Bò Thảo Mộc Patina (Veg-Tan Leather)',
      beforeDesc: 'Mốc trắng lỗ chân lông da, khô ráp nứt nẻ, viền cạnh sờn chỉ mất bóng',
      afterDesc: 'Khử khuẩn ozone, dưỡng tinh dầu chồn Mink Oil, đánh bóng viền thủ công bằng sáp ong',
      stats: 'Gia hạn tuổi thọ da: +10 năm · Chống thấm giọt sen: Cấp 4',
      beforeImg: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      afterImg: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=95',
    },
  };

  // Atelier state
  const [atelierBookings, setAtelierBookings] = useState<AtelierBooking[]>([]);
  const [selectedHub, setSelectedHub] = useState('HCM');
  const [selectedService, setSelectedService] = useState('BESPOKE_FITTING');
  const [selectedDate, setSelectedDate] = useState('2026-11-20');
  const [selectedSlot, setSelectedSlot] = useState('14:00 - 15:30');
  const [atelierSuccess, setAtelierSuccess] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexora_atelier_bookings');
      if (stored) {
        setAtelierBookings(JSON.parse(stored));
      } else {
        const sample: AtelierBooking = {
          id: 'at-1',
          code: 'ATELIER-VIP-8899',
          hub: 'NEXORA Flagship Atelier Sài Gòn',
          address: '128 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          service: 'Thử đồ Private Suite & May đo tinh chỉnh phom dáng (Bespoke Fitting)',
          date: '2026-11-22',
          slot: '14:00 - 15:30',
          notes: 'Khách VIP hẹn thử áo Blazer Linen và tinh chỉnh chiều dài tay áo.',
          createdAt: new Date().toISOString(),
        };
        setAtelierBookings([sample]);
        localStorage.setItem('nexora_atelier_bookings', JSON.stringify([sample]));
      }
      const storedSter = localStorage.getItem('nexora_vas_sterilization');
      if (storedSter) {
        const parsed = JSON.parse(storedSter);
        setSterilizationBooked(true);
        setSterilizationTicket(parsed.ticket);
      }
      const storedCo2 = localStorage.getItem('nexora_vas_co2_spa');
      if (storedCo2) {
        const parsedCo2 = JSON.parse(storedCo2);
        if (parsedCo2.ticket) {
          setCo2Ticket(parsedCo2.ticket);
          setCo2Booked(true);
        }
      }
    } catch {}
  }, []);

  async function submitCourier(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const created = await api<CareBooking>('/vas-care', 'POST', {
        itemName: String(d.get('itemName')),
        serviceType: String(d.get('serviceType')),
        insuredValue: Number(d.get('insuredValue')),
        notes: String(d.get('notes') || ''),
      });
      form.reset();
      setSuccess(`Đã đặt lịch thành công! Mã niêm phong Zip-seal của bạn: ${created.zipSealCode}.`);
      list.reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function submitAtelier(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const hubObj = ATELIER_HUBS.find((h) => h.id === selectedHub) || ATELIER_HUBS[0];
    const serviceObj = ATELIER_SERVICES.find((s) => s.id === selectedService) || ATELIER_SERVICES[0];
    const newBooking: AtelierBooking = {
      id: `at-${Date.now()}`,
      code: `ATELIER-VIP-${Math.floor(1000 + Math.random() * 9000)}`,
      hub: hubObj.name,
      address: hubObj.address,
      service: serviceObj.name,
      date: selectedDate,
      slot: selectedSlot,
      notes: String(d.get('notes') || ''),
      createdAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...atelierBookings];
    setAtelierBookings(updated);
    try {
      localStorage.setItem('nexora_atelier_bookings', JSON.stringify(updated));
      if (user) {
        api('/vault/booking', 'POST', {
          id: newBooking.id,
          flagship: newBooking.hub,
          service: newBooking.service,
          date: newBooking.date,
          timeSlot: newBooking.slot,
          vipPass: newBooking.code,
        }).catch(() => {});
      }
    } catch {}
    setAtelierSuccess(`Đặt lịch hẹn VIP tại ${hubObj.name} thành công! Mã xác nhận của bạn: ${newBooking.code}.`);
    setTimeout(() => setAtelierSuccess(''), 6000);
  }

  return (
    <section className="section narrow">
      <p className="eyebrow"><span />NEXORA LUXURY VAS CARE</p>
      <div className="section-heading">
        <div>
          <h1>Chăm sóc Đồ hiệu <em>White-Glove</em></h1>
          <p className="subtle">Túi niêm phong Serial Zip-seal một chiều · Biên bản kiểm tra quang học 8 góc · Bảo hiểm tài sản lên đến 100.000.000 VNĐ.</p>
        </div>
      </div>

      {/* Thước So Sánh Đối Chứng Trước & Sau Spa 1000 Lux */}
      <div
        style={{
          margin: '20px 0',
          padding: 20,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} color="var(--gold-dark)" />
            <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
              Biên Bản Đối Chứng Trước &amp; Sau Spa Chuẩn 1000 Lux
            </strong>
          </div>
          <span style={{ fontSize: 11, background: '#F3EFEA', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            {RESTORATION_SAMPLES[sampleKey].stats}
          </span>
        </div>

        {/* Garment Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { id: 'BLAZER' as const, label: 'Áo Blazer Dạ Len Ý' },
            { id: 'SILK' as const, label: 'Đầm Lụa Tơ Tằm Bảo Lộc' },
            { id: 'LEATHER' as const, label: 'Túi Da Bò Thảo Mộc' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSampleKey(item.id)}
              style={{
                fontSize: 11,
                padding: '5px 12px',
                borderRadius: 20,
                border: sampleKey === item.id ? '1.5px solid var(--gold-dark)' : '1px solid var(--line)',
                background: sampleKey === item.id ? '#F3EFEA' : '#fff',
                color: sampleKey === item.id ? 'var(--gold-dark)' : 'var(--ink)',
                fontWeight: sampleKey === item.id ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Interactive Comparison Split Lens */}
        <div
          style={{
            position: 'relative',
            height: 240,
            borderRadius: 6,
            overflow: 'hidden',
            background: '#18181b',
            display: 'flex',
          }}
        >
          {/* Before side (Left) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: `${sliderPos}%`,
              overflow: 'hidden',
              borderRight: '2px solid #fff',
              zIndex: 2,
              background: '#27272a',
            }}
          >
            <img
              src={RESTORATION_SAMPLES[sampleKey].beforeImg}
              alt="Before"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(60%) contrast(90%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(0,0,0,0.7)',
                color: '#f87171',
                padding: '2px 8px',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              TRƯỚC KHI SPA (BEFORE)
            </div>
          </div>

          {/* After side (Right) */}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={RESTORATION_SAMPLES[sampleKey].afterImg}
              alt="After"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(22, 101, 52, 0.85)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 3,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              SAU KHI HOÀN TẤT (AFTER)
            </div>
          </div>

          {/* Draggable Divider Handle */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPos}%`,
              transform: 'translate(-50%, -50%)',
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--ink)',
              zIndex: 3,
              pointerEvents: 'none',
            }}
          >
            ⟷
          </div>
        </div>

        {/* Range Slider Controller */}
        <div style={{ marginTop: 12 }}>
          <div className="row between" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
            <span>← Kéo sang trái xem Trước Spa</span>
            <span>Kéo sang phải xem Sau Phục hồi →</span>
          </div>
          <input
            type="range"
            min={5}
            max={95}
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--gold-dark)', cursor: 'ew-resize' }}
          />
        </div>

        {/* Technical Description Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px dashed var(--line)',
            fontSize: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, display: 'block' }}>Tình trạng ban đầu:</span>
            <span style={{ color: 'var(--muted)', lineHeight: 1.4 }}>{RESTORATION_SAMPLES[sampleKey].beforeDesc}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#166534', fontWeight: 600, display: 'block' }}>Kỹ thuật phục hồi Atelier:</span>
            <span style={{ color: 'var(--ink)', lineHeight: 1.4 }}>{RESTORATION_SAMPLES[sampleKey].afterDesc}</span>
          </div>
        </div>
      </div>

      {/* Bác Sĩ Đồ Hiệu & Bộ Chẩn Đoán Hư Tổn Phục Hồi Sinh Học */}
      <div
        style={{
          margin: '20px 0',
          padding: 20,
          background: '#fcfbf9',
          border: '1px solid #e2d9cc',
          borderRadius: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={19} color="var(--gold-dark)" />
            <div>
              <strong style={{ fontSize: 14, color: 'var(--ink)' }}>
                Bác Sĩ Đồ Hiệu · Chẩn Đoán Tổn Thương &amp; Lập Phác Đồ Sinh Học
              </strong>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                Phân tích tình trạng sợi dệt/đồ da và thiết lập phác đồ phục hồi vi điểm chuẩn Atelier 1000 Lux.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, background: '#F3EFEA', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
            ATELIER CLINIC
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
          {/* Step 1: Garment Type */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              1. Chọn dòng trang phục cần cứu hộ:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { id: 'WOOL_BLAZER', label: 'Áo Blazer/Măng tô dạ' },
                { id: 'SILK_DRESS', label: 'Đầm lụa tơ tằm Bảo Lộc' },
                { id: 'VEG_LEATHER', label: 'Túi/Giày da bò thảo mộc' },
                { id: 'LINEN_SHIRT', label: 'Sơ mi linen tự nhiên' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedGarmentType(item.id as any);
                    setDiagnosisDone(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    fontSize: 11,
                    textAlign: 'left',
                    borderRadius: 4,
                    border: selectedGarmentType === item.id ? '1.5px solid var(--gold-dark)' : '1px solid #e2e8f0',
                    background: selectedGarmentType === item.id ? '#F3EFEA' : '#fff',
                    color: selectedGarmentType === item.id ? 'var(--gold-dark)' : '#1e293b',
                    fontWeight: selectedGarmentType === item.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Symptom */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              2. Chọn triệu chứng hư tổn quan sát thấy:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { id: 'STAIN_YELLOW', label: 'Vệt ố trà/cà phê, ố vàng mồ hôi loang lổ lâu ngày' },
                { id: 'MOLD_DRY', label: 'Nấm mốc trắng chân lông, khô ráp nứt nẻ bề mặt' },
                { id: 'COLLAPSED_SHOULDER', label: 'Trũng đệm vai, gãy ve áo, nhăn co nếp phom 3D' },
                { id: 'FRAYED_SEAMS', label: 'Sờn rách đường chỉ may, đứt khuy xà cừ, xơ mép vải' },
              ].map((sym) => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => {
                    setSelectedSymptom(sym.id);
                    setDiagnosisDone(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: 11,
                    textAlign: 'left',
                    borderRadius: 4,
                    border: selectedSymptom === sym.id ? '1.5px solid var(--gold-dark)' : '1px solid #e2e8f0',
                    background: selectedSymptom === sym.id ? '#F3EFEA' : '#fff',
                    color: selectedSymptom === sym.id ? 'var(--gold-dark)' : '#334155',
                    fontWeight: selectedSymptom === sym.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  ● {sym.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={runGarmentDiagnosis}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--gold-dark)',
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
          <Activity size={15} /> Khởi Chạy Chẩn Đoán &amp; Đề Xuất Phác Đồ Chuẩn Atelier
        </button>

        {diagnosisDone && diagnosedProtocol && (
          <div
            style={{
              marginTop: 14,
              padding: 16,
              background: '#fff',
              border: '1.5px solid #16a34a',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(22, 101, 52, 0.06)',
            }}
          >
            <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <strong style={{ fontSize: 13, color: '#166534' }}>
                  Phác Đồ Phục Hồi Sinh Học Khuyến Nghị (Treatment Protocol)
                </strong>
              </div>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                Tỷ lệ phục hồi dự kiến: {diagnosedProtocol.recoveryRate}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 8, fontSize: 12, marginBottom: 12 }}>
              <div className="row between" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                <span style={{ color: '#64748b' }}>Phân loại tổn thương:</span>
                <strong style={{ color: '#0f172a' }}>{diagnosedProtocol.grade}</strong>
              </div>
              <div className="row between" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                <span style={{ color: '#64748b' }}>Hợp chất can thiệp:</span>
                <span style={{ color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{diagnosedProtocol.chemical}</span>
              </div>
              <div className="row between" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                <span style={{ color: '#64748b' }}>Thời gian phục hồi dự kiến:</span>
                <strong style={{ color: 'var(--gold-dark)' }}>{diagnosedProtocol.duration}</strong>
              </div>
              <div className="row between" style={{ padding: '6px 8px', background: '#f8fafc', borderRadius: 4 }}>
                <span style={{ color: '#64748b' }}>Dịch vụ chỉ định:</span>
                <strong style={{ color: '#166534' }}>{diagnosedProtocol.recommendedService}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('COURIER');
                  setDefaultItemName(
                    selectedGarmentType === 'WOOL_BLAZER'
                      ? 'Áo Blazer / Măng tô dạ cao cấp'
                      : selectedGarmentType === 'SILK_DRESS'
                      ? 'Đầm lụa tơ tằm Bảo Lộc'
                      : selectedGarmentType === 'VEG_LEATHER'
                      ? 'Túi da bò thảo mộc'
                      : 'Sơ mi linen tự nhiên'
                  );
                  setDefaultNotes(`[Phác đồ Atelier]: ${diagnosedProtocol.grade} - Dùng hợp chất: ${diagnosedProtocol.chemical} (Mã trợ giá ${diagnosedProtocol.voucher})`);
                  setSuccess(`Đã áp dụng phác đồ! Mã giảm giá ${diagnosedProtocol.voucher} (-50.000đ) đã sẵn sàng cho dịch vụ.`);
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  background: '#166534',
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
                <ArrowRight size={15} /> Điền Nhanh Vào Lịch Hẹn &amp; Nhận Voucher -50k ({diagnosedProtocol.voucher})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', gap: 10, margin: '16px 0 20px', borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveTab('COURIER')}
          style={{
            background: activeTab === 'COURIER' ? '#111' : 'transparent',
            color: activeTab === 'COURIER' ? '#fff' : 'var(--ink)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShieldCheck size={16} /> 1. Dịch Vụ Tận Nhà (White-Glove Zip-Seal)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ATELIER')}
          style={{
            background: activeTab === 'ATELIER' ? '#111' : 'transparent',
            color: activeTab === 'ATELIER' ? '#fff' : 'var(--ink)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 3,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={16} /> 2. Đặt Lịch Tại Flagship Atelier (VIP Fitting &amp; Styling)
        </button>
      </div>

      {!user ? (
        <Notice>Vui lòng <Link href="/dang-nhap">đăng nhập</Link> để đặt lịch chăm sóc đồ hiệu hoặc đặt lịch hẹn VIP tại Atelier.</Notice>
      ) : activeTab === 'COURIER' ? (
        <div className="checkout-grid">
          <form className="panel form" onSubmit={submitCourier}>
            <h2><ShieldCheck size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />Đặt lịch bưu tá niêm phong tận nhà</h2>
            {error && <Notice error>{error}</Notice>}
            {success && <Notice>{success}</Notice>}
            <label>Tên món đồ cần chăm sóc<input key={defaultItemName} name="itemName" required minLength={3} defaultValue={defaultItemName} placeholder="VD: Áo khoác len Cashmere / Túi da bê..." /></label>
            <label>Gói dịch vụ
              <select name="serviceType" defaultValue="SPA_CLEANING">
                {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </label>
            <label>Giá trị khai báo bảo hiểm (tối đa 100.000.000đ)
              <input name="insuredValue" type="number" min={0} max={100000000} defaultValue={10000000} required />
            </label>
            <label>Lưu ý đặc biệt cho chuyên viên<textarea key={defaultNotes} name="notes" defaultValue={defaultNotes} placeholder="VD: Vết ố nhẹ ở cổ tay, lưu ý khuy ngọc trai..." /></label>
            <button className="button" disabled={busy}>{busy ? 'Đang khởi tạo mã Zip-seal…' : 'Đặt lịch & Cấp mã Zip-seal'}</button>
          </form>

          <div>
            <article className="panel">
              <h2>Đơn chăm sóc tận nhà của bạn</h2>
              {list.loading ? <Loading /> : !list.data?.length ? (
                <p className="subtle">Bạn chưa có đơn chăm sóc đồ hiệu nào.</p>
              ) : list.data.map(b => (
                <div key={b.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="row between">
                    <strong>{b.itemName}</strong>
                    <span className="badge">{b.zipSealCode}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--muted)' }}>
                    {SERVICE_LABELS[b.serviceType] ?? b.serviceType}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>
                    Trạng thái: <strong>{CARE_STATUS[b.status] ?? b.status}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: 12 }}>
                    Phí dịch vụ: <strong>{vnd(b.fee)}</strong> · Bảo hiểm: <strong>{vnd(b.insuredValue)}</strong>
                  </p>
                </div>
              ))}
            </article>

            {/* Két Bảo An & Tiến Trình Phục Hồi Vi Điểm */}
            <article className="panel" style={{ marginTop: 16 }}>
              <div className="row between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={16} color="#0d9488" />
                  <strong style={{ fontSize: 13, color: '#115e59' }}>
                    Két Bảo An &amp; Tiến Trình Phục Hồi Vi Điểm
                  </strong>
                </div>
                <span style={{ fontSize: 10, background: '#ccfbf1', color: '#115e59', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                  CHỐNG ẨM 45–50% RH · KÉT #VAULT-NEX-882041
                </span>
              </div>

              <p style={{ margin: '0 0 12px', fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
                Trang phục cao cấp của bạn được lưu trữ tại buồng kiểm soát khí hậu 20°C, bảo vệ nghiêm ngặt bằng mã số định danh trước khi chuyển qua 4 chặng phục hồi quang học vi điểm.
              </p>

              {/* 4 Chặng Phục Hồi */}
              <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                {[
                  {
                    step: 1,
                    title: 'Soi Quang Học 1000 Lux & Bản Đồ Tổn Thương Vi Điểm',
                    status: 'HOÀN TẤT 100%',
                    statusColor: '#166534',
                    statusBg: '#dcfce7',
                    desc: 'Kính hiển vi kỹ thuật số 50x xác định 2 vị trí biến tính sắc tố sợi lanh và 1 điểm chỉ ve áo cần gia cố.',
                  },
                  {
                    step: 2,
                    title: 'Bể Ngâm Enzyme Sinh Học Cân Bằng pH 6.2',
                    status: 'HOÀN TẤT 100%',
                    statusColor: '#166534',
                    statusBg: '#dcfce7',
                    desc: 'Bóc tách liên kết lipid mồ hôi tự nhiên và protein hữu cơ mà không gây mòn xơ dệt.',
                  },
                  {
                    step: 3,
                    title: 'Căn Chỉnh Sợi Laser & Định Hình Ve Áo 3D',
                    status: 'ĐANG XỬ LÝ (SLA 6h)',
                    statusColor: '#b45309',
                    statusBg: '#fef3c7',
                    desc: 'Buồng ủ hơi nước vi áp suất đưa sợi vải về trạng thái dãn nở tự nhiên, khôi phục độ rủ đạt 98.6%.',
                  },
                  {
                    step: 4,
                    title: 'Niêm Phong Tamper-Evident Zip-Seal & Hộp Haute Couture',
                    status: 'CHỜ BÀN GIAO',
                    statusColor: '#475569',
                    statusBg: '#f1f5f9',
                    desc: 'Khóa mã niêm phong số hóa, khử khuẩn bằng tia UV-C và điều phối bưu tá xe điện bàn giao.',
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    style={{
                      padding: '8px 12px',
                      background: '#fff',
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontSize: 11,
                    }}
                  >
                    <div className="row between" style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        Chặng {s.step}: {s.title}
                      </span>
                      <span style={{ fontSize: 9, background: s.statusBg, color: s.statusColor, padding: '1px 5px', borderRadius: 2, fontWeight: 700 }}>
                        {s.status}
                      </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: 10 }}>{s.desc}</span>
                  </div>
                ))}
              </div>

              {/* Toggle Macro Lens View */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setVaultMacroView(!vaultMacroView)}
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    background: vaultMacroView ? '#0f766e' : '#fff',
                    color: vaultMacroView ? '#fff' : '#0f766e',
                    border: '1px solid #0f766e',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <ZoomIn size={13} /> {vaultMacroView ? 'Đóng chế độ soi hiển vi' : 'Xem Ảnh Soi Hiển Vi 50x (Macro Lens)'}
                </button>
                <span style={{ fontSize: 10, color: '#0f766e', fontWeight: 600 }}>
                  ✓ Đã kiểm định theo tiêu chuẩn Thụy Sĩ
                </span>
              </div>

              {vaultMacroView && (
                <div style={{ marginTop: 10, padding: 10, background: '#18181b', borderRadius: 4, color: '#fff', fontSize: 11 }}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>🔬 KÍNH HIỂN VI QUANG HỌC 50X · 1000 LUX SENSOR</span>
                    <span style={{ fontSize: 9, background: '#0284c7', color: '#fff', padding: '1px 6px', borderRadius: 2 }}>CALIBRATED</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                    • Cấu trúc sợi lanh dọc: Liên kết xenlulozo khôi phục 99.1%. Không còn cặn khoáng canxi gây cứng sợi.<br />
                    • Độ bóng bề mặt: Đạt 94 Gu (Gloss Units), khôi phục hiệu ứng bắt sáng tự nhiên của sợi dệt cao cấp.
                  </p>
                </div>
              )}
            </article>
          </div>
        </div>
      ) : (
        /* Phân Hệ Đặt Lịch Hẹn VIP Tại Flagship Atelier */
        <div className="checkout-grid">
          <form className="panel form" onSubmit={submitAtelier}>
            <h2>
              <Building size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />
              Đặt Lịch Hẹn VIP Tại Atelier
            </h2>
            {atelierSuccess && <Notice>{atelierSuccess}</Notice>}

            <label>
              Chọn cơ sở Flagship Atelier
              <select value={selectedHub} onChange={(e) => setSelectedHub(e.target.value)}>
                {ATELIER_HUBS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.address.split(',')[0]}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ padding: '10px 14px', background: '#faf9f5', borderRadius: 3, border: '1px solid var(--line)', fontSize: 11, lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--ink)' }}>
                <MapPin size={13} color="var(--gold-dark)" /> Địa chỉ cơ sở:
              </div>
              <div style={{ color: 'var(--muted)', marginTop: 2 }}>
                {ATELIER_HUBS.find((h) => h.id === selectedHub)?.address}
              </div>
              <div style={{ color: 'var(--muted)' }}>
                Hotline phòng chờ: <strong>{ATELIER_HUBS.find((h) => h.id === selectedHub)?.phone}</strong>
              </div>
            </div>

            <label>
              Gói dịch vụ Atelier
              <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                {ATELIER_SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.price > 0 ? `(${vnd(s.price)})` : '(0đ · Đặc quyền thành viên)'}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', margin: '-4px 0 8px' }}>
              {ATELIER_SERVICES.find((s) => s.id === selectedService)?.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label>
                Ngày hẹn
                <input
                  type="date"
                  name="date"
                  value={selectedDate}
                  min="2026-11-20"
                  max="2026-12-31"
                  required
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </label>
              <label>
                Khung giờ VIP
                <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                  <option value="10:00 - 11:30">10:00 - 11:30 (Sáng)</option>
                  <option value="14:00 - 15:30">14:00 - 15:30 (Đầu chiều)</option>
                  <option value="16:30 - 18:00">16:30 - 18:00 (Cuối chiều)</option>
                  <option value="19:00 - 20:30">19:00 - 20:30 (Buổi tối VIP)</option>
                </select>
              </label>
            </div>

            <label>
              Yêu cầu trang phục / Ghi chú cho Stylist
              <textarea name="notes" placeholder="VD: Muốn thử bộ suit linen phối cùng áo sơ mi lụa tơ tằm, cần nghệ nhân may đo đo lại chiều dài ống quần..." />
            </label>

            <button className="button" type="submit">
              Xác nhận Đặt Lịch VIP Tại Atelier
            </button>
          </form>

          <div>
            <article className="panel">
              <div className="row between" style={{ marginBottom: 12 }}>
                <h2>Thẻ Lịch Hẹn VIP Của Bạn</h2>
                <span className="badge">{atelierBookings.length} lịch hẹn</span>
              </div>

              {!atelierBookings.length ? (
                <p className="subtle">Bạn chưa có lịch hẹn nào tại Flagship Atelier.</p>
              ) : (
                atelierBookings.map((bk) => (
                  <div
                    key={bk.id}
                    style={{
                      border: '1px solid var(--line)',
                      background: '#fff',
                      borderRadius: 4,
                      padding: '14px 16px',
                      marginBottom: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gold-dark)', fontWeight: 700 }}>
                          VIP APPOINTMENT TICKET
                        </span>
                        <h3 style={{ margin: '2px 0', fontSize: 14 }}>{bk.hub}</h3>
                      </div>
                      <span style={{ fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '3px 8px', borderRadius: 2, fontWeight: 700 }}>
                        {bk.code}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, margin: '8px 0', color: 'var(--ink)' }}>
                      <strong>Dịch vụ:</strong> {bk.service}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 6, fontSize: 11, color: 'var(--muted)', background: '#faf9f5', padding: '8px 10px', borderRadius: 3 }}>
                      <div>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        <strong>Khung giờ:</strong> {bk.slot}
                      </div>
                      <div>
                        <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
                        <strong>Ngày:</strong> {bk.date}
                      </div>
                    </div>

                    {bk.notes && (
                      <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
                        &quot;{bk.notes}&quot;
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid #eee', fontSize: 11 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#166534' }}>
                        <CheckCircle2 size={13} /> Đã chuẩn bị phòng thử Private Suite
                      </span>
                      <span style={{ color: 'var(--muted)' }}>Xuất trình mã khi đến</span>
                    </div>
                  </div>
                ))
              )}
            </article>
          </div>
        </div>
      )}

      {/* Khử Khuẩn Quang Học UV-C & Buồng Ozone Tinh Khiết */}
      <div
        style={{
          marginTop: 32,
          padding: '24px 28px',
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: 8,
          border: '1px solid #334155',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'grid', placeItems: 'center' }}>
              <Sun size={20} color="#38bdf8" />
            </div>
            <div>
              <strong style={{ fontSize: 16, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                Khử Khuẩn Quang Học UV-C &amp; Buồng Ozone Tinh Khiết
              </strong>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                Tiệt trùng buồng lạnh bảo vệ sợi dệt tự nhiên nhạy cảm nhiệt độ (lụa, cashmere, da thuộc) đạt chuẩn y tế EN 14476.
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid #0284c7', padding: '3px 10px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>
            EN 14476 MEDICAL GRADE · ZERO-THERMAL DAMAGE
          </span>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            {
              id: 'SILK_CASHMERE' as const,
              title: 'Lụa Tơ Tằm & Len Cashmere',
              tech: 'UV-C 254nm lạnh + Ion Bạc Ag+',
              time: '15 phút · 21°C',
              desc: 'Diệt khuẩn vi mô, giữ nguyên 100% độ bóng ánh xà cừ và liên kết protein tơ tự nhiên.',
            },
            {
              id: 'LEATHER_BAGS' as const,
              title: 'Đồ Da Thuộc Thảo Mộc & Túi Hiệu',
              tech: 'Buồng Ozone áp suất âm 0.05 ppm',
              time: '25 phút · 46% RH',
              desc: 'Phá vỡ phân tử mùi ẩm mốc hữu cơ, tái cấp ẩm tinh dầu không làm nứt bề mặt da patina.',
            },
            {
              id: 'EVENING_GOWNS' as const,
              title: 'Váy Dạ Tiệc & Đính Kết Kim Hoàn',
              tech: 'Sóng siêu âm vi điểm + Cực tím lạnh',
              time: '30 phút · 22°C',
              desc: 'Làm sạch sâu từng kẽ pha lê Swarovski, bảo toàn tuyệt đối sợi chỉ kim tuyến Haute Couture.',
            },
          ].map((preset) => {
            const isSelected = sterilizationPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSterilizationPreset(preset.id)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 6,
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid #334155',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#1e293b',
                  color: isSelected ? '#f8fafc' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div className="row between" style={{ marginBottom: 4 }}>
                    <strong style={{ fontSize: 12, color: isSelected ? '#38bdf8' : '#f8fafc' }}>{preset.title}</strong>
                    <span style={{ fontSize: 9, background: '#0284c7', color: '#fff', padding: '1px 5px', borderRadius: 2 }}>{preset.time}</span>
                  </div>
                  <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 4 }}>{preset.tech}</span>
                  <p style={{ margin: 0, fontSize: 10, color: '#cbd5e1', lineHeight: 1.4 }}>{preset.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Chamber Physical Monitoring */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Nhiệt độ buồng lạnh</span>
            <strong style={{ fontSize: 14, color: '#38bdf8' }}>21.8°C (Khử trùng lạnh)</strong>
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Độ ẩm kiểm soát</span>
            <strong style={{ fontSize: 14, color: '#a78bfa' }}>46% RH (Kháng mốc)</strong>
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Liều lượng quang học</span>
            <strong style={{ fontSize: 14, color: '#fbbf24' }}>48 mJ/cm² (UV-C 254nm)</strong>
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block' }}>Tỷ lệ tiêu diệt mầm bệnh</span>
            <strong style={{ fontSize: 14, color: '#4ade80' }}>99.98% (EN 14476)</strong>
          </div>
        </div>

        {/* Booking Action */}
        {sterilizationBooked ? (
          <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', borderRadius: 6 }}>
            <div className="row between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> ĐÃ ĐẶT CHỖ KHỬ KHUẨN VÔ TRÙNG BUỒNG LẠNH · MÃ: {sterilizationTicket}
              </span>
              <span style={{ fontSize: 10, background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                ATELIER STERILE PASSPORT
              </span>
            </div>
            <p style={{ margin: 0, color: '#a7f3d0', fontSize: 11 }}>
              Trang phục của bạn sẽ được xử lý qua chu trình buồng tiệt trùng quang học UV-C và xông Ozone vô trùng. Bạn nhận được <strong>+120 Điểm Thưởng Xanh NEX-Green</strong> cho việc duy trì thói quen chăm sóc thời trang bền vững.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                const code = `#NX-STERILIZE-${Date.now().toString().slice(-6)}`;
                setSterilizationTicket(code);
                setSterilizationBooked(true);
                try {
                  localStorage.setItem('nexora_vas_sterilization', JSON.stringify({
                    preset: sterilizationPreset,
                    ticket: code,
                    time: new Date().toISOString(),
                  }));
                } catch {}
              }}
              style={{
                flex: 1,
                minWidth: 240,
                padding: '10px 18px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Zap size={14} /> Đặt Chỗ Khử Khuẩn Vô Trùng Buồng Lạnh (+120 Điểm Xanh)
            </button>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Miễn phí 100% khi kết hợp cùng dịch vụ Spa Giặt Hấp hoặc Đặt lịch Atelier VIP
            </span>
          </div>
        )}
      </div>

      {/* Công Nghệ Giặt Không Nước CO2 Siêu Tới Hạn · Supercritical CO2 Waterless Laundry */}
      <div
        style={{
          marginTop: 24,
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #042f2e 0%, #115e59 100%)',
          border: '1px solid #14b8a6',
          borderRadius: 8,
          color: '#fff',
        }}
      >
        <div className="row between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: '#2dd4bf' }}>
              <RotateCcw size={20} color="#2dd4bf" /> Giặt Không Nước CO2 Siêu Tới Hạn · Supercritical CO2 Wash
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#99f6e4' }}>
              Đột phá công nghệ giặt cao cấp tại 31.1°C &amp; 73.8 bar: 100% không dùng nước sạch, không dung môi dầu mỏ Perc độc hại, triệt tiêu co rút nhiệt và bảo toàn sợi len/cashmere/lụa nguyên bản.
            </p>
          </div>
          <span style={{ fontSize: 11, background: '#134e4a', color: '#5eead4', padding: '4px 12px', borderRadius: 20, fontWeight: 700, border: '1px solid #14b8a6', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Droplets size={13} /> 100% ZERO WASTEWATER
          </span>
        </div>

        {/* 3 Chu trình chăm sóc chuyên biệt */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            {
              id: 'CASHMERE',
              name: 'Chu Trình Cashmere & Vicuña Tuyệt Phẩm',
              time: '25 Phút',
              desc: 'Chiết xuất bụi bẩn và dầu thừa bằng CO2 thể lỏng ở áp suất siêu tới hạn, không vón cục và không tạo ma sát cơ học làm xơ sợi.',
              specs: 'Bảo toàn độ bồng: 100% · Độ co rút: 0.00%',
            },
            {
              id: 'SILK',
              name: 'Chu Trình Lụa Vẽ Thủ Công & Cẩn Xà Cừ',
              time: '18 Phút',
              desc: 'Không làm nhòe sắc tố khoáng tự nhiên hay bong tróc keo dán xà cừ sơn mài truyền thống trên tà áo.',
              specs: 'Giữ màu nguyên bản: 99.8% · Không nếp gãy tơ',
            },
            {
              id: 'WOOL_SUIT',
              name: 'Chu Trình Làm Sạch Phom Áo Blazer Wool',
              time: '30 Phút',
              desc: 'Khử mùi sâu trong từng lớp lót đệm vai bằng áp suất CO2 tuần hoàn, giữ nếp là ve áo sắc nét mà không cần ủi nhiệt.',
              specs: 'Khử mùi vi sinh: 99.9% · Hoàn toàn không mùi hóa chất',
            },
          ].map((preset) => {
            const isSelected = co2Preset === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setCo2Preset(preset.id as any)}
                style={{
                  padding: '12px 14px',
                  background: isSelected ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1.5px solid ${isSelected ? '#2dd4bf' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="row between" style={{ marginBottom: 4 }}>
                  <strong style={{ fontSize: 12, color: isSelected ? '#5eead4' : '#fff' }}>{preset.name}</strong>
                  <span style={{ fontSize: 10, background: '#134e4a', color: '#2dd4bf', padding: '1px 6px', borderRadius: 2, fontWeight: 700 }}>
                    {preset.time}
                  </span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: '#ccfbf1', lineHeight: 1.4 }}>
                  {preset.desc}
                </p>
                <span style={{ fontSize: 10, color: '#5eead4', fontWeight: 600 }}>
                  ✓ {preset.specs}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Telemetry Sensor Bar */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '12px 16px', borderRadius: 6, border: '1px solid rgba(45, 212, 191, 0.3)', marginBottom: 14 }}>
          <div className="row between" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5eead4', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} /> Cảm Biến Giám Sát Buồng Áp Suất Siêu Tới Hạn Thời Gian Thực:
            </span>
            <span style={{ fontSize: 10, color: '#99f6e4' }}>
              Quy trình khép kín Recapture 98.4%
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#99f6e4' }}>Áp suất vận hành</div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>73.8 bar (Supercritical)</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#99f6e4' }}>Nhiệt độ buồng</div>
              <div style={{ fontWeight: 700, color: '#5eead4', fontSize: 13 }}>31.2°C (Không co rút)</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#99f6e4' }}>Nước sạch bảo tồn</div>
              <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: 13 }}>45 Lít / lượt</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#99f6e4' }}>Dung môi Perc tồn dư</div>
              <div style={{ fontWeight: 700, color: '#34d399', fontSize: 13 }}>0.00% (Hoàn toàn sạch)</div>
            </div>
          </div>
        </div>

        {/* Action button */}
        {co2Booked ? (
          <div style={{ padding: '12px 16px', background: 'rgba(45, 212, 191, 0.15)', border: '1px solid #2dd4bf', borderRadius: 6 }}>
            <div className="row between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#5eead4', fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> ĐÃ ĐĂNG KÝ GIẶT CO2 SIÊU TỚI HẠN · PHIẾU: {co2Ticket}
              </span>
              <span style={{ fontSize: 10, background: '#0d9488', color: '#fff', padding: '2px 8px', borderRadius: 2, fontWeight: 700 }}>
                WATERLESS ECO-SPA
              </span>
            </div>
            <p style={{ margin: 0, color: '#ccfbf1', fontSize: 11 }}>
              Bưu tá sẽ thu nhận trang phục trong túi niêm phong riêng biệt. Bạn nhận ngay <strong>+150 Điểm Thưởng Xanh NEX-Green</strong> cho hành động tiết kiệm nước sạch và bảo tồn tài nguyên sinh thái.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                const code = `#NX-CO2-SPA-${Date.now().toString().slice(-6)}`;
                setCo2Ticket(code);
                setCo2Booked(true);
                try {
                  localStorage.setItem('nexora_vas_co2_spa', JSON.stringify({
                    preset: co2Preset,
                    ticket: code,
                    time: new Date().toISOString(),
                  }));
                } catch {}
              }}
              style={{
                flex: 1,
                minWidth: 260,
                padding: '10px 18px',
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
                gap: 8,
              }}
            >
              <RotateCcw size={14} /> Đặt Lịch Giặt Không Nước CO2 Siêu Tới Hạn (+150 Điểm Xanh)
            </button>
            <span style={{ fontSize: 11, color: '#99f6e4' }}>
              Quy chuẩn làm sạch xanh thân thiện với sức khỏe và môi trường
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
