export type Money = number; // Integer VND. Never accept authoritative totals from a browser.
export type QuoteItem = {
  variantId: string; productId: string; shopId: string; name: string; sku: string;
  color: string; size: string; image: string; price: Money; quantity: number;
  sizeChart: unknown; policy: string;
};
export type QuoteShop = {
  shopId: string; shopName: string; items: QuoteItem[];
  subtotal: Money; discount: Money; shipping: Money; total: Money;
};
export type QuoteData = { shops: QuoteShop[]; platformDiscount?: Money; tradeInCode?: string; total: Money; address: { recipient: string; phone: string; line: string; province: string }; provider: 'mock' };
export type PublicUser = { id: string; name: string; email: string; role: string };
export const ORDER_LABELS: Record<string, string> = {
  PENDING: 'Chờ shop xác nhận', CONFIRMED: 'Đã xác nhận', PACKED: 'Đã đóng gói',
  SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', DELIVERY_FAILED: 'Giao thất bại', RETURNED: 'Đã hoàn về',
};
