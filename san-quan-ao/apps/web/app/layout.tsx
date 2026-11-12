import type { Metadata } from 'next';
import './globals.css';
import { Shell } from './ui';
export const metadata: Metadata = {
  title: 'NEXORA — Nền Tảng Thời Trang & Cộng Đồng Phối Đồ Thế Hệ Mới',
  description: 'NEXORA - Hệ sinh thái thương mại điện tử thời trang tích hợp Mạng xã hội OOTD, Thu cũ đổi mới Trade-In và Dịch vụ chăm sóc đồ hiệu cao cấp.',
  icons: {
    icon: '/nexora-icon.svg',
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body><Shell>{children}</Shell></body></html>;
}
