import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Shell } from './ui';

export const metadata: Metadata = {
  title: 'NEXORA — Nền Tảng Thời Trang & Cộng Đồng Phối Đồ Thế Hệ Mới',
  description: 'NEXORA - Hệ sinh thái thương mại điện tử thời trang may đo cao cấp tích hợp Mạng xã hội OOTD, Thu cũ đổi mới Trade-In và Dịch vụ chăm sóc đồ hiệu Atelier.',
  icons: {
    icon: '/nexora-icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e293b',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
