import type { Metadata } from 'next';
import './globals.css';
import { Shell } from './ui';
export const metadata: Metadata = { title: 'Mặc — Mặc theo cách của bạn', description: 'Khám phá trang phục từ những shop độc lập và tìm cảm hứng phối đồ mỗi ngày.' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body><Shell>{children}</Shell></body></html>;
}
