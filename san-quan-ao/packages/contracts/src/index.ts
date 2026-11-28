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
export type QuoteData = {
  shops: QuoteShop[];
  platformDiscount?: Money;
  tradeInCode?: string;
  shippingDiscount?: Money;
  coinDiscount?: Money;
  total: Money;
  address: {
    recipient: string;
    phone: string;
    line: string;
    province: string;
    deliverySlot?: string;
    ecoPackaging?: boolean;
  };
  provider: 'mock';
  logisticsPacking?: {
    totalBoxes: number;
    totalWeightGrams: number;
    isConsolidated: boolean;
    workshopsCount: number;
    tripsSaved: number;
    carbonSavedKg: number;
    courierEfficiencyScore: number;
  };
  deliveryEta?: {
    distanceKm: number;
    transitHoursMin: number;
    transitHoursMax: number;
    deliveryDateFrom: string;
    deliveryDateTo: string;
    deliverySlotWindow: string;
    weatherDelayBufferMinutes: number;
    logisticsRouteTier: 'INTRA_CITY_EV' | 'REGIONAL_TRUCK' | 'INTER_PROVINCIAL_EXPRESS';
  };
  hubAndSpoke?: {
    isConsolidationBeneficial: boolean;
    selectedHubName: string;
    netDistanceSavedKm: number;
    carbonEmissionSavedKg: number;
    efficiencyRationale: string;
  };
  riskAssessment?: {
    score: number;
    tier: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
    autoApproveDispatch: boolean;
    requiresArtisanPhoneConfirmation: boolean;
    rationale: string;
  };
  vietQr?: {
    emvCoPayload: string;
    crc16: string;
    quickLink: string;
    bankBin: string;
    accountNumber: string;
    amount: number;
    orderCode: string;
    storeName: string;
  };
};
export type PublicUser = { id: string; name: string; email: string; role: string };
export const ORDER_LABELS: Record<string, string> = {
  PENDING: 'Chờ shop xác nhận', CONFIRMED: 'Đã xác nhận', PACKED: 'Đã đóng gói',
  SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy', DELIVERY_FAILED: 'Giao thất bại', RETURNED: 'Đã hoàn về',
};
