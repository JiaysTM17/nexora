'use client';
import { useCallback, useEffect, useState } from 'react';
export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export async function api<T = unknown>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API}${path}`, { method, credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'mac-web' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? 'Không thể hoàn tất yêu cầu');
  return result as T;
}
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(r => r + 1), []);
  useEffect(() => {
    let active = true;
    if (!path) { setData(null); setLoading(false); return; }
    setLoading(true); setError('');
    api<T>(path).then(d => { if (active) setData(d); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [path, revision]);
  return { data, error, loading, reload };
}
export const vnd = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
export type Variant = { id: string; sku: string; color: string; colorHex: string; size: string; price: number; inventory: { onHand: number; reserved: number } | null };
export type ProductReview = { id: string; rating: number; body: string; createdAt: string; user: { name: string } };
export type Product = { id: string; slug: string; name: string; description: string; material: string; fit: string; status: string; images: { url: string; color: string | null }[]; shop: { id: string; name: string; slug: string; returnPolicy: string }; category: { name: string }; variants: Variant[]; sizeCharts: { id: string; version: number; kind: string; unit: string; guide: string; rows: Record<string, string | number>[] }[]; reviews?: ProductReview[] };
export type Shop = { id: string; name: string; status: string; feeBps: number; origin: string };
export type Item = { id: string; quantity: number; unitPrice: number; discount: number; snapshot: { name: string; color: string; size: string; image: string }; reviews?: { id: string; rating: number }[] };
export type ReturnRequest = { id: string; shopId: string; kind: 'EXCHANGE' | 'REFUND'; reason: string; status: string; createdAt: string; items: { id: string; orderItemId: string; quantity: number; refundAmount: number; orderItem?: { shopOrderId: string; snapshot: { name: string; color: string; size: string } } }[] };
export type Voucher = { id: string; code: string; amount: number; minimum: number; maxUses: number; uses: number; expiresAt: string };
export type SellerLedger = { balance: number; entries: { id: string; kind: string; amount: number; sourceKey: string; createdAt: string }[] };
export type ShopOrder = { id: string; status: string; total: number; subtotal: number; discount: number; shipping: number; shop?: { name: string }; items: Item[]; order?: { code: string; address: { recipient: string; line: string; phone: string; province: string } }; shipment?: { tracking: string; provider: string; status: string } };
export type Order = { id: string; code: string; total: number; createdAt: string; shops: ShopOrder[]; address?: { recipient: string; line: string; phone: string; province: string }; paymentMethod?: string };
export type FeedPost = { id: string; caption: string; author: { id: string; name: string }; media: { url: string; position: number }[]; tags: { id: string; mediaPosition: number; x: number; y: number; available: boolean; product: { id: string; name: string; slug: string; shop: { name: string }; variants: { id: string; price: number; inventory?: { onHand: number; reserved: number } | null }[] } }[]; liked: boolean; savedByMe: boolean; _count: { reactions: number; comments: number }; comments: { id: string; body: string; user: { name: string } }[] };
export type TradeInRequest = { id: string; brand: string; itemName: string; category: string; conditionNote: string; imageUrl: string; grade: string; estimatedValue: number; finalValue: number | null; voucherCode: string | null; status: string; createdAt: string; user?: { name: string; email: string } };
export type CareBooking = { id: string; itemName: string; serviceType: string; zipSealCode: string; insuredValue: number; fee: number; status: string; notes: string; createdAt: string; user?: { name: string; email: string } };
