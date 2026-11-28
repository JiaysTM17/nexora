import { createHash } from 'node:crypto';
import { allocateDiscount } from './common';

// ============================================================================
// THUẬT TOÁN 90: CHUẨN HÓA TIẾNG VIỆT KHÔNG DẤU, DAMERAU-LEVENSHTEIN & TRIE AUTOCOMPLETE
// (Vietnamese Diacritic Folding, Optimal String Alignment & Prefix Autocomplete)
// ============================================================================

export function normalizeVietnameseText(input: string): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Optimal String Alignment (Restricted Damerau-Levenshtein) distance.
 * Supports adjacent character transpositions (e.g. "laụ" <-> "lụa", "sơ mi" <-> "so im") at cost 1.
 */
export function calculateDamerauLevenshteinDistance(a: string, b: string): number {
  const s = a ?? '';
  const t = b ?? '';
  const n = s.length;
  const m = t.length;
  if (n === 0) return m;
  if (m === 0) return n;

  const d: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) d[i][0] = i;
  for (let j = 0; j <= m; j++) d[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      let val = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && s[i - 1] === t[j - 2] && s[i - 2] === t[j - 1]) {
        val = Math.min(val, d[i - 2][j - 2] + 1); // transposition
      }
      d[i][j] = val;
    }
  }
  return d[n][m];
}

export interface FuzzyVietnameseSearchResult {
  score: number;
  matchedTerms: number;
  totalQueryTerms: number;
  isMatch: boolean;
  exactPhraseBoost: boolean;
}

export function scoreFuzzyVietnameseMatch(params: {
  query: string;
  title: string;
  material?: string;
  description?: string;
  categoryName?: string;
  shopName?: string;
}): FuzzyVietnameseSearchResult {
  const normQuery = normalizeVietnameseText(params.query);
  if (!normQuery) {
    return { score: 0, matchedTerms: 0, totalQueryTerms: 0, isMatch: false, exactPhraseBoost: false };
  }

  const normTitle = normalizeVietnameseText(params.title);
  const normMaterial = normalizeVietnameseText(params.material || '');
  const normCategory = normalizeVietnameseText(params.categoryName || '');
  const normShop = normalizeVietnameseText(params.shopName || '');
  const normDesc = normalizeVietnameseText(params.description || '');

  const fieldTokens = [
    ...normTitle.split(' ').filter(Boolean).map(tok => ({ tok, weight: 3.0 })),
    ...normMaterial.split(' ').filter(Boolean).map(tok => ({ tok, weight: 2.4 })),
    ...normCategory.split(' ').filter(Boolean).map(tok => ({ tok, weight: 2.0 })),
    ...normShop.split(' ').filter(Boolean).map(tok => ({ tok, weight: 1.5 })),
    ...normDesc.split(' ').filter(Boolean).map(tok => ({ tok, weight: 1.0 })),
  ];

  const queryTerms = normQuery.split(' ').filter(Boolean);
  let totalScore = 0;
  let matchedTerms = 0;

  for (const qTerm of queryTerms) {
    let bestTermScore = 0;
    const maxAllowedDist = qTerm.length <= 3 ? 0 : qTerm.length <= 6 ? 1 : 2;

    for (const { tok, weight } of fieldTokens) {
      if (tok === qTerm) {
        bestTermScore = Math.max(bestTermScore, weight * 1.0);
      } else if (tok.startsWith(qTerm) && qTerm.length >= 2) {
        bestTermScore = Math.max(bestTermScore, weight * 0.85);
      } else if (maxAllowedDist > 0 && Math.abs(tok.length - qTerm.length) <= maxAllowedDist) {
        const dist = calculateDamerauLevenshteinDistance(qTerm, tok);
        if (dist <= maxAllowedDist) {
          const sim = 1 - dist / Math.max(qTerm.length, tok.length);
          bestTermScore = Math.max(bestTermScore, weight * sim * 0.78);
        }
      }
    }

    if (bestTermScore > 0) {
      matchedTerms++;
      totalScore += bestTermScore;
    }
  }

  const exactPhraseBoost = normTitle.includes(normQuery) || normMaterial.includes(normQuery);
  if (exactPhraseBoost) {
    totalScore += 4.5;
  }

  const coverageRatio = queryTerms.length > 0 ? matchedTerms / queryTerms.length : 0;
  const normalizedScore = Number((totalScore * (0.4 + 0.6 * coverageRatio)).toFixed(4));
  const isMatch = exactPhraseBoost || (queryTerms.length <= 2 ? matchedTerms === queryTerms.length : coverageRatio >= 0.5);

  return {
    score: normalizedScore,
    matchedTerms,
    totalQueryTerms: queryTerms.length,
    isMatch,
    exactPhraseBoost,
  };
}

export interface AutocompleteEntry {
  id: string;
  text: string;
  slug?: string;
  kind: 'PRODUCT' | 'MATERIAL' | 'CATEGORY' | 'SHOP';
  popularityScore?: number;
}

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  slug?: string;
  kind: AutocompleteEntry['kind'];
  relevanceScore: number;
  matchKind: 'PREFIX' | 'SUBSTRING' | 'FUZZY';
}

export function buildPrefixAutocompleteSuggestions(params: {
  prefix: string;
  entries: AutocompleteEntry[];
  limit?: number;
}): AutocompleteSuggestion[] {
  const normPrefix = normalizeVietnameseText(params.prefix);
  const limit = Math.max(1, Math.min(20, params.limit ?? 8));
  if (!normPrefix) return [];

  const seenText = new Set<string>();
  const scored: AutocompleteSuggestion[] = [];

  for (const entry of params.entries) {
    const normEntry = normalizeVietnameseText(entry.text);
    if (!normEntry || seenText.has(normEntry)) continue;

    const popBoost = Math.min(20, Math.log1p(Math.max(0, entry.popularityScore ?? 1)) * 3);
    let matchScore = 0;
    let matchKind: AutocompleteSuggestion['matchKind'] | null = null;

    if (normEntry.startsWith(normPrefix)) {
      matchScore = 100 + popBoost;
      matchKind = 'PREFIX';
    } else if (normEntry.split(' ').some(w => w.startsWith(normPrefix))) {
      matchScore = 82 + popBoost;
      matchKind = 'PREFIX';
    } else if (normEntry.includes(normPrefix)) {
      matchScore = 65 + popBoost;
      matchKind = 'SUBSTRING';
    } else if (normPrefix.length >= 3) {
      const tokens = normEntry.split(' ');
      const minDist = Math.min(...tokens.map(t => calculateDamerauLevenshteinDistance(normPrefix, t.slice(0, normPrefix.length + 1))));
      if (minDist <= 1) {
        matchScore = 45 + popBoost;
        matchKind = 'FUZZY';
      }
    }

    if (matchKind) {
      seenText.add(normEntry);
      scored.push({
        id: entry.id,
        text: entry.text,
        slug: entry.slug,
        kind: entry.kind,
        relevanceScore: Number(matchScore.toFixed(2)),
        matchKind,
      });
    }
  }

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
}

// ============================================================================
// THUẬT TOÁN 91: HỆ THỐNG GỢI Ý SẢN PHẨM LAI (HYBRID COLLABORATIVE + CONTENT + PMI)
// (Item-Item Cosine CF + Pointwise Mutual Information Co-Purchase + Gaussian Price Kernel)
// ============================================================================

export interface RecommendationProductNode {
  id: string;
  name: string;
  categoryId: string;
  material: string;
  fit?: string;
  shopId: string;
  priceVnd: number;
  positiveRatingsCount?: number;
  totalRatingsCount?: number;
}

export interface UserItemInteraction {
  userId: string;
  productId: string;
  weight: number;
}

export interface HybridRecommendationItem {
  productId: string;
  hybridScore: number;
  collaborativeCosine: number;
  coPurchasePmiLift: number;
  contentSimilarity: number;
  coldStartQualityScore: number;
  reasonTag: 'CO_PURCHASED' | 'SIMILAR_ATELIER_STYLE' | 'SAME_CATEGORY_MATERIAL' | 'POPULAR_COLD_START';
}

export interface HybridRecommendationResult {
  targetProductId: string;
  strategyUsed: 'HYBRID_CF_CONTENT' | 'CONTENT_AND_QUALITY_COLD_START';
  recommendations: HybridRecommendationItem[];
}

export function recommendHybridProducts(params: {
  targetProductId: string;
  catalog: RecommendationProductNode[];
  interactions: UserItemInteraction[];
  limit?: number;
}): HybridRecommendationResult {
  const limit = Math.max(1, Math.min(24, params.limit ?? 6));
  const target = params.catalog.find(p => p.id === params.targetProductId);
  if (!target) {
    return { targetProductId: params.targetProductId, strategyUsed: 'CONTENT_AND_QUALITY_COLD_START', recommendations: [] };
  }

  const itemUsers = new Map<string, Map<string, number>>();
  const allUsers = new Set<string>();
  for (const inter of params.interactions) {
    if (inter.weight <= 0) continue;
    allUsers.add(inter.userId);
    let uMap = itemUsers.get(inter.productId);
    if (!uMap) {
      uMap = new Map<string, number>();
      itemUsers.set(inter.productId, uMap);
    }
    uMap.set(inter.userId, (uMap.get(inter.userId) ?? 0) + inter.weight);
  }

  const totalUsers = Math.max(1, allUsers.size);
  const targetVec = itemUsers.get(target.id) ?? new Map<string, number>();
  const targetNorm = Math.sqrt(Array.from(targetVec.values()).reduce((s, w) => s + w * w, 0));
  const targetTokens = new Set(normalizeVietnameseText(`${target.name} ${target.material} ${target.fit ?? ''}`).split(' ').filter(t => t.length > 1));

  const hasCollaborativeSignal = targetVec.size >= 1 && targetNorm > 0;
  const scored: HybridRecommendationItem[] = [];

  for (const cand of params.catalog) {
    if (cand.id === target.id) continue;

    const candVec = itemUsers.get(cand.id) ?? new Map<string, number>();
    const candNorm = Math.sqrt(Array.from(candVec.values()).reduce((s, w) => s + w * w, 0));
    let dot = 0;
    let coUsers = 0;
    if (targetNorm > 0 && candNorm > 0) {
      for (const [uid, tw] of targetVec.entries()) {
        const cw = candVec.get(uid);
        if (cw !== undefined) {
          dot += tw * cw;
          coUsers++;
        }
      }
    }
    const cosine = targetNorm > 0 && candNorm > 0 ? dot / (targetNorm * candNorm) : 0;

    let pmiLift = 0;
    if (coUsers > 0 && targetVec.size > 0 && candVec.size > 0) {
      const pXY = coUsers / totalUsers;
      const pX = targetVec.size / totalUsers;
      const pY = candVec.size / totalUsers;
      const pmi = Math.log2(Math.max(1e-9, pXY / (pX * pY)));
      const npmi = pmi / Math.max(1e-9, -Math.log2(pXY));
      pmiLift = Math.max(0, Math.min(1, (npmi + 1) / 2));
    }

    const sameCat = cand.categoryId === target.categoryId ? 1 : 0;
    const candTokens = new Set(normalizeVietnameseText(`${cand.name} ${cand.material} ${cand.fit ?? ''}`).split(' ').filter(t => t.length > 1));
    let interTokens = 0;
    for (const tok of targetTokens) {
      if (candTokens.has(tok)) interTokens++;
    }
    const unionTokens = targetTokens.size + candTokens.size - interTokens;
    const tokenJaccard = unionTokens > 0 ? interTokens / unionTokens : 0;

    const priceDiffRatio = Math.abs(cand.priceVnd - target.priceVnd) / Math.max(1, target.priceVnd);
    const priceKernel = Math.exp(-(priceDiffRatio * priceDiffRatio) / (2 * 0.45 * 0.45));
    const contentSim = 0.40 * sameCat + 0.35 * tokenJaccard + 0.25 * priceKernel;

    const nPos = Math.max(0, cand.positiveRatingsCount ?? 0);
    const nTot = Math.max(nPos, cand.totalRatingsCount ?? 0);
    let wilson = 0.5;
    if (nTot > 0) {
      const z = 1.96;
      const p = nPos / nTot;
      const denom = 1 + (z * z) / nTot;
      wilson = (p + (z * z) / (2 * nTot) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * nTot)) / nTot)) / denom;
    }

    const cfComponent = 0.65 * cosine + 0.35 * pmiLift;
    const hybridScore = hasCollaborativeSignal
      ? 0.50 * cfComponent + 0.38 * contentSim + 0.12 * wilson
      : 0.78 * contentSim + 0.22 * wilson;

    let reasonTag: HybridRecommendationItem['reasonTag'] = 'POPULAR_COLD_START';
    if (cfComponent >= 0.25) reasonTag = 'CO_PURCHASED';
    else if (sameCat && tokenJaccard >= 0.25) reasonTag = 'SAME_CATEGORY_MATERIAL';
    else if (contentSim >= 0.4) reasonTag = 'SIMILAR_ATELIER_STYLE';

    scored.push({
      productId: cand.id,
      hybridScore: Number(hybridScore.toFixed(4)),
      collaborativeCosine: Number(cosine.toFixed(4)),
      coPurchasePmiLift: Number(pmiLift.toFixed(4)),
      contentSimilarity: Number(contentSim.toFixed(4)),
      coldStartQualityScore: Number(wilson.toFixed(4)),
      reasonTag,
    });
  }

  return {
    targetProductId: target.id,
    strategyUsed: hasCollaborativeSignal ? 'HYBRID_CF_CONTENT' : 'CONTENT_AND_QUALITY_COLD_START',
    recommendations: scored.sort((a, b) => b.hybridScore - a.hybridScore).slice(0, limit),
  };
}

// ============================================================================
// THUẬT TOÁN 92: PHÁT HIỆN BẤT THƯỜNG TỐC ĐỘ ĐẶT HÀNG & Z-SCORE GIAN LẬN
// (Order Velocity EWMA & Spend Z-Score Anomaly Detection)
// ============================================================================

export interface OrderVelocityAnomalyParams {
  currentOrderTotalVnd: number;
  historicalOrderTotalsVnd: number[];
  ordersInLast1Hour: number;
  ordersInLast24Hours: number;
  recentCancellations30d: number;
  totalOrders30d: number;
  isNewAddress: boolean;
  distinctShopsCount: number;
}

export interface OrderVelocityAnomalyResult {
  anomalyScore: number;
  spendZScore: number;
  cancellationRate: number;
  velocityBurstDetected: boolean;
  riskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  signals: string[];
}

export function evaluateOrderVelocityAndAnomaly(params: OrderVelocityAnomalyParams): OrderVelocityAnomalyResult {
  const hist = params.historicalOrderTotalsVnd.filter(v => Number.isFinite(v) && v >= 0);
  let spendZScore = 0;

  if (hist.length >= 2) {
    const mean = hist.reduce((s, v) => s + v, 0) / hist.length;
    const variance = hist.reduce((s, v) => s + (v - mean) * (v - mean), 0) / hist.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 1000) {
      spendZScore = (params.currentOrderTotalVnd - mean) / stdDev;
    } else if (mean > 0 && params.currentOrderTotalVnd > mean * 3) {
      spendZScore = 3.0;
    }
  } else if (params.currentOrderTotalVnd >= 15_000_000) {
    spendZScore = 2.2;
  }

  const cancellationRate = params.totalOrders30d > 0
    ? Math.min(1, params.recentCancellations30d / params.totalOrders30d)
    : 0;

  let score = 0;
  const signals: string[] = [];

  if (spendZScore >= 2.5) {
    score += Math.min(35, Math.round((spendZScore - 1.5) * 14));
    signals.push(`GIÁ_TRỊ_ĐỘT_BIẾN (Z=${spendZScore.toFixed(2)})`);
  }
  const velocityBurstDetected = params.ordersInLast1Hour >= 3 || params.ordersInLast24Hours >= 8;
  if (params.ordersInLast1Hour >= 3) {
    score += Math.min(30, params.ordersInLast1Hour * 8);
    signals.push(`TẦN_SUẤT_CAO_1H (${params.ordersInLast1Hour} đơn/giờ)`);
  } else if (params.ordersInLast24Hours >= 8) {
    score += 18;
    signals.push(`TẦN_SUẤT_CAO_24H (${params.ordersInLast24Hours} đơn/ngày)`);
  }

  if (params.recentCancellations30d >= 2 && cancellationRate >= 0.4) {
    score += Math.min(25, Math.round(cancellationRate * 30));
    signals.push(`TỶ_LỆ_HỦY_CAO (${Math.round(cancellationRate * 100)}%)`);
  }
  if (params.isNewAddress && params.currentOrderTotalVnd >= 5_000_000) {
    score += 12;
    signals.push('ĐỊA_CHỈ_MỚI_GIÁ_TRỊ_CAO');
  }
  if (params.distinctShopsCount >= 4) {
    score += 8;
    signals.push(`ĐA_XƯỞNG_CÙNG_LÚC (${params.distinctShopsCount} shop)`);
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  const riskLevel: OrderVelocityAnomalyResult['riskLevel'] =
    clampedScore >= 75 ? 'CRITICAL' :
    clampedScore >= 50 ? 'HIGH' :
    clampedScore >= 25 ? 'ELEVATED' : 'NORMAL';

  return {
    anomalyScore: clampedScore,
    spendZScore: Number(spendZScore.toFixed(3)),
    cancellationRate: Number(cancellationRate.toFixed(3)),
    velocityBurstDetected,
    riskLevel,
    signals,
  };
}

// ============================================================================
// THUẬT TOÁN 93: DỰ BÁO NHU CẦU HOLT EXPONENTIAL SMOOTHING & PHÂN LOẠI ABC-XYZ
// (Holt's Linear Trend Demand Forecast + ABC-XYZ Inventory Health Matrix)
// ============================================================================

export interface VariantDemandHistory {
  variantId: string;
  sku: string;
  productName: string;
  unitPriceVnd: number;
  onHand: number;
  reserved: number;
  weeklySalesHistory: number[];
  leadTimeDays?: number;
}

export interface VariantInventoryForecast {
  variantId: string;
  sku: string;
  productName: string;
  availableStock: number;
  forecastNextWeekUnits: number;
  weeklyTrendSlope: number;
  safetyStockUnits: number;
  reorderPointUnits: number;
  daysOfCover: number | null;
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  healthStatus: 'STOCKOUT_IMMINENT' | 'REORDER_NOW' | 'OVERSTOCK_DEADSTOCK' | 'HEALTHY';
  recommendedRestockQty: number;
}

export interface InventoryDemandForecastResult {
  totalVariants: number;
  stockoutImminentCount: number;
  reorderNowCount: number;
  overstockCount: number;
  items: VariantInventoryForecast[];
}

export function forecastInventoryDemandAndAbcXyz(params: {
  variants: VariantDemandHistory[];
  alpha?: number;
  beta?: number;
  serviceZ?: number;
}): InventoryDemandForecastResult {
  const alpha = params.alpha ?? 0.4;
  const beta = params.beta ?? 0.25;
  const serviceZ = params.serviceZ ?? 1.65;

  if (!params.variants.length) {
    return { totalVariants: 0, stockoutImminentCount: 0, reorderNowCount: 0, overstockCount: 0, items: [] };
  }

  const revenues = params.variants.map(v => {
    const totalUnits = v.weeklySalesHistory.reduce((s, q) => s + Math.max(0, q), 0);
    return { variantId: v.variantId, revenue: totalUnits * v.unitPriceVnd };
  });
  const totalRevenue = revenues.reduce((s, r) => s + r.revenue, 0);
  const abcMap = new Map<string, 'A' | 'B' | 'C'>();
  let cumRev = 0;
  for (const r of [...revenues].sort((a, b) => b.revenue - a.revenue)) {
    if (totalRevenue <= 0) {
      abcMap.set(r.variantId, 'C');
      continue;
    }
    const shareBefore = cumRev / totalRevenue;
    cumRev += r.revenue;
    abcMap.set(r.variantId, shareBefore < 0.80 ? 'A' : shareBefore < 0.95 ? 'B' : 'C');
  }

  const items: VariantInventoryForecast[] = params.variants.map(v => {
    const history = v.weeklySalesHistory.length ? v.weeklySalesHistory.map(q => Math.max(0, q)) : [0];
    const availableStock = Math.max(0, v.onHand - v.reserved);
    const leadTimeDays = Math.max(1, v.leadTimeDays ?? 7);

    let level = history[0];
    let trend = history.length >= 2 ? history[1] - history[0] : 0;
    for (let i = 1; i < history.length; i++) {
      const prevLevel = level;
      level = alpha * history[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }
    const forecastNextWeekUnits = Math.max(0, Number((level + trend).toFixed(2)));

    const mean = history.reduce((s, q) => s + q, 0) / history.length;
    const variance = history.reduce((s, q) => s + (q - mean) * (q - mean), 0) / history.length;
    const stdDevWeekly = Math.sqrt(variance);
    const cv = mean > 0 ? stdDevWeekly / mean : 1.0;

    const xyzClass: 'X' | 'Y' | 'Z' = cv <= 0.25 ? 'X' : cv <= 0.60 ? 'Y' : 'Z';
    const leadWeeks = leadTimeDays / 7;
    const safetyStockUnits = Math.ceil(serviceZ * stdDevWeekly * Math.sqrt(leadWeeks));
    const expectedLeadDemand = (forecastNextWeekUnits / 7) * leadTimeDays;
    const reorderPointUnits = Math.ceil(expectedLeadDemand + safetyStockUnits);

    const dailyDemand = forecastNextWeekUnits / 7;
    const daysOfCover = dailyDemand > 0.01 ? Number((availableStock / dailyDemand).toFixed(1)) : null;

    let healthStatus: VariantInventoryForecast['healthStatus'] = 'HEALTHY';
    if (availableStock === 0 || (daysOfCover !== null && daysOfCover <= 3)) {
      healthStatus = 'STOCKOUT_IMMINENT';
    } else if (availableStock <= reorderPointUnits) {
      healthStatus = 'REORDER_NOW';
    } else if ((daysOfCover === null && availableStock >= 15) || (daysOfCover !== null && daysOfCover >= 90)) {
      healthStatus = 'OVERSTOCK_DEADSTOCK';
    }

    const targetCoverUnits = Math.ceil(dailyDemand * 21 + safetyStockUnits);
    const recommendedRestockQty = healthStatus === 'STOCKOUT_IMMINENT' || healthStatus === 'REORDER_NOW'
      ? Math.max(1, targetCoverUnits - availableStock)
      : 0;

    return {
      variantId: v.variantId,
      sku: v.sku,
      productName: v.productName,
      availableStock,
      forecastNextWeekUnits,
      weeklyTrendSlope: Number(trend.toFixed(2)),
      safetyStockUnits,
      reorderPointUnits,
      daysOfCover,
      abcClass: abcMap.get(v.variantId) ?? 'C',
      xyzClass,
      healthStatus,
      recommendedRestockQty,
    };
  });

  return {
    totalVariants: items.length,
    stockoutImminentCount: items.filter(i => i.healthStatus === 'STOCKOUT_IMMINENT').length,
    reorderNowCount: items.filter(i => i.healthStatus === 'REORDER_NOW').length,
    overstockCount: items.filter(i => i.healthStatus === 'OVERSTOCK_DEADSTOCK').length,
    items,
  };
}

// ============================================================================
// THUẬT TOÁN 94: TỔNG HỢP ĐỘ TIN CẬY ĐÁNH GIÁ SẢN PHẨM (BAYESIAN + WILSON 95%)
// ============================================================================

export interface ProductRatingSummary {
  reviewCount: number;
  rawAverage: number;
  bayesianAverage: number;
  wilsonLowerBound95: number;
  positiveSharePct: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function computeProductRatingSummary(params: {
  ratings: number[];
  priorMean?: number;
  priorWeight?: number;
}): ProductRatingSummary {
  const priorMean = params.priorMean ?? 4.3;
  const priorWeight = params.priorWeight ?? 5;
  const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const valid = params.ratings.filter(r => Number.isFinite(r) && r >= 1 && r <= 5).map(r => Math.round(r) as 1 | 2 | 3 | 4 | 5);
  for (const r of valid) dist[r]++;

  const n = valid.length;
  if (n === 0) {
    return {
      reviewCount: 0,
      rawAverage: 0,
      bayesianAverage: Number(priorMean.toFixed(2)),
      wilsonLowerBound95: 0,
      positiveSharePct: 0,
      distribution: dist,
    };
  }

  const sum = valid.reduce((s, r) => s + r, 0);
  const rawAverage = sum / n;
  const bayesianAverage = (priorWeight * priorMean + sum) / (priorWeight + n);

  const positive = valid.filter(r => r >= 4).length;
  const p = positive / n;
  const z = 1.96;
  const wilson = (p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);

  return {
    reviewCount: n,
    rawAverage: Number(rawAverage.toFixed(2)),
    bayesianAverage: Number(bayesianAverage.toFixed(2)),
    wilsonLowerBound95: Number(Math.max(0, wilson).toFixed(4)),
    positiveSharePct: Math.round(p * 100),
    distribution: dist,
  };
}

// ============================================================================
// THUẬT TOÁN 95: GIỚI HẠN TỐC ĐỘ CỬA SỔ TRƯỢT (SLIDING-WINDOW RATE LIMITER)
// ============================================================================

export interface SlidingWindowRateLimitResult {
  allowed: boolean;
  currentCount: number;
  remaining: number;
  retryAfterMs: number;
  activeTimestampsMs: number[];
}

export function evaluateSlidingWindowRateLimit(params: {
  timestampsMs: number[];
  nowMs: number;
  windowMs: number;
  maxRequests: number;
}): SlidingWindowRateLimitResult {
  const windowMs = Math.max(1, params.windowMs);
  const maxRequests = Math.max(1, params.maxRequests);
  const cutoff = params.nowMs - windowMs;
  const active = params.timestampsMs.filter(ts => ts > cutoff && ts <= params.nowMs).sort((a, b) => a - b);

  if (active.length >= maxRequests) {
    const oldest = active[0];
    const retryAfterMs = Math.max(1, oldest + windowMs - params.nowMs);
    return {
      allowed: false,
      currentCount: active.length,
      remaining: 0,
      retryAfterMs,
      activeTimestampsMs: active,
    };
  }

  const next = [...active, params.nowMs];
  return {
    allowed: true,
    currentCount: next.length,
    remaining: Math.max(0, maxRequests - next.length),
    retryAfterMs: 0,
    activeTimestampsMs: next,
  };
}

// ============================================================================
// THUẬT TOÁN 96: PHÂN KHÚC KHÁCH HÀNG RFM, XÁC SUẤT SỐNG SÓT BG/NBD & DỰ BÁO CLV
// (RFM Scoring, Pareto/BG-NBD Survival Probability, 12M CLV & VIP Voucher Eligibility)
// ============================================================================

export type VipLoyaltyTier = 'NEW_MEMBER' | 'STANDARD' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'AT_RISK_VIP' | 'CHURNED';

export interface CustomerOrderRecord {
  orderId: string;
  createdAtMs: number;
  netAmountVnd: number;
  status: 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'ACTIVE';
}

export interface CustomerRfmClvParams {
  userId: string;
  accountCreatedAtMs: number;
  nowMs?: number;
  orders: CustomerOrderRecord[];
  discountRateAnnual?: number; // default 0.12
}

export interface CustomerRfmClvResult {
  userId: string;
  tier: VipLoyaltyTier;
  recencyDays: number | null;
  frequencyCompleted: number;
  monetaryTotalVnd: number;
  averageOrderValueVnd: number;
  rfmScores: { r: 1 | 2 | 3 | 4 | 5; f: 1 | 2 | 3 | 4 | 5; m: 1 | 2 | 3 | 4 | 5; composite: number };
  survivalProbability: number; // P(alive) in [0, 1]
  churnRiskScore: number;      // 0..100
  projected12mClvVnd: number;
  isNewMemberEligible: boolean;
  eligibleVoucherTiers: string[];
}

export function evaluateCustomerRfmAndClv(params: CustomerRfmClvParams): CustomerRfmClvResult {
  const nowMs = params.nowMs ?? Date.now();
  const discountRate = Math.max(0.01, Math.min(0.5, params.discountRateAnnual ?? 0.12));

  const validOrders = [...params.orders]
    .filter(o => o.status === 'COMPLETED' || o.status === 'ACTIVE')
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
  const cancelledCount = params.orders.filter(o => o.status === 'CANCELLED').length;
  const returnedCount = params.orders.filter(o => o.status === 'RETURNED').length;

  const frequency = validOrders.length;
  if (frequency === 0) {
    return {
      userId: params.userId,
      tier: 'NEW_MEMBER',
      recencyDays: null,
      frequencyCompleted: 0,
      monetaryTotalVnd: 0,
      averageOrderValueVnd: 0,
      rfmScores: { r: 1, f: 1, m: 1, composite: 100 },
      survivalProbability: 0.5,
      churnRiskScore: 50,
      projected12mClvVnd: 0,
      isNewMemberEligible: true,
      eligibleVoucherTiers: ['WELCOME_NEWBIE', 'PUBLIC_ALL'],
    };
  }

  const lastOrderMs = validOrders[validOrders.length - 1].createdAtMs;
  const recencyDays = Math.max(0, (nowMs - lastOrderMs) / 86_400_000);
  const monetaryTotalVnd = validOrders.reduce((s, o) => s + Math.max(0, Math.round(o.netAmountVnd)), 0);
  const averageOrderValueVnd = Math.round(monetaryTotalVnd / frequency);

  // Quintile scoring (1..5) calibrated for luxury/atelier fashion cadence
  const rScore: 1 | 2 | 3 | 4 | 5 =
    recencyDays <= 14 ? 5 : recencyDays <= 45 ? 4 : recencyDays <= 90 ? 3 : recencyDays <= 180 ? 2 : 1;
  const fScore: 1 | 2 | 3 | 4 | 5 =
    frequency >= 10 ? 5 : frequency >= 6 ? 4 : frequency >= 3 ? 3 : frequency >= 2 ? 2 : 1;
  const mScore: 1 | 2 | 3 | 4 | 5 =
    monetaryTotalVnd >= 30_000_000 ? 5 :
    monetaryTotalVnd >= 12_000_000 ? 4 :
    monetaryTotalVnd >= 5_000_000 ? 3 :
    monetaryTotalVnd >= 1_500_000 ? 2 : 1;

  // BG/NBD-inspired Pareto survival probability using inter-purchase cadence
  let avgInterPurchaseDays = 45;
  if (frequency >= 2) {
    const spanDays = Math.max(1, (lastOrderMs - validOrders[0].createdAtMs) / 86_400_000);
    avgInterPurchaseDays = Math.max(7, spanDays / (frequency - 1));
  }
  const hazardRatio = recencyDays / (avgInterPurchaseDays + 15);
  const rawSurvival = 1 / (1 + Math.pow(hazardRatio, 1.65));
  const frictionPenalty = Math.min(0.35, cancelledCount * 0.04 + returnedCount * 0.05);
  const survivalProbability = Number(Math.max(0.02, Math.min(0.99, rawSurvival * (1 - frictionPenalty))).toFixed(4));
  const churnRiskScore = Math.round((1 - survivalProbability) * 100);

  // Expected purchases over next 365 days attenuated by P(alive) and discounted
  const expectedAnnualOrders = (365 / Math.max(14, avgInterPurchaseDays)) * survivalProbability;
  const grossMarginFactor = 0.65;
  const projected12mClvVnd = Math.round(
    (expectedAnnualOrders * averageOrderValueVnd * grossMarginFactor) / (1 + discountRate)
  );

  let tier: VipLoyaltyTier = 'STANDARD';
  if (recencyDays > 240 && survivalProbability < 0.2) {
    tier = 'CHURNED';
  } else if ((mScore >= 4 || fScore >= 4) && survivalProbability < 0.38) {
    tier = 'AT_RISK_VIP';
  } else if (monetaryTotalVnd >= 25_000_000 || (rScore >= 4 && fScore >= 4 && mScore >= 4)) {
    tier = 'DIAMOND';
  } else if (monetaryTotalVnd >= 10_000_000 || (fScore >= 3 && mScore >= 3)) {
    tier = 'GOLD';
  } else if (monetaryTotalVnd >= 3_000_000 || frequency >= 2) {
    tier = 'SILVER';
  }

  const eligibleVoucherTiers = ['PUBLIC_ALL'];
  if (tier === 'DIAMOND') eligibleVoucherTiers.push('VIP_DIAMOND', 'VIP_GOLD', 'VIP_SILVER', 'BESPOKE_CONCIERGE');
  else if (tier === 'GOLD') eligibleVoucherTiers.push('VIP_GOLD', 'VIP_SILVER');
  else if (tier === 'SILVER') eligibleVoucherTiers.push('VIP_SILVER');
  else if (tier === 'AT_RISK_VIP') eligibleVoucherTiers.push('WINBACK_VIP', 'VIP_GOLD');
  else if (tier === 'CHURNED') eligibleVoucherTiers.push('WINBACK_REACTIVATE');

  return {
    userId: params.userId,
    tier,
    recencyDays: Number(recencyDays.toFixed(1)),
    frequencyCompleted: frequency,
    monetaryTotalVnd,
    averageOrderValueVnd,
    rfmScores: { r: rScore, f: fScore, m: mScore, composite: rScore * 100 + fScore * 10 + mScore },
    survivalProbability,
    churnRiskScore,
    projected12mClvVnd,
    isNewMemberEligible: false, // Strictly false once frequency >= 1 (prevents newbie voucher reuse!)
    eligibleVoucherTiers,
  };
}

// ============================================================================
// THUẬT TOÁN 97: KHAI PHÁ LUẬT KẾT HỢP MUA KÈM (MARKET BASKET ASSOCIATION RULES)
// (Laplace-Smoothed Support, Confidence, Lift, Conviction & Exact-VND Bundle Pricer)
// ============================================================================

export interface BasketCatalogItem {
  productId: string;
  name: string;
  priceVnd: number;
  categoryId: string;
}

export interface CoPurchaseBundleRule {
  companionProductId: string;
  companionName: string;
  coOccurrenceCount: number;
  support: number;
  confidence: number;
  lift: number;
  conviction: number;
  bundleOriginalVnd: number;
  bundleDiscountVnd: number;
  bundleNetVnd: number;
  allocatedItemDiscountsVnd: [number, number];
}

export interface MarketBasketResult {
  anchorProductId: string;
  totalBasketsAnalyzed: number;
  rules: CoPurchaseBundleRule[];
}

export function mineFrequentCoPurchaseBundles(params: {
  anchorProductId: string;
  baskets: string[][];
  catalog: BasketCatalogItem[];
  maxRules?: number;
  maxBundleDiscountBps?: number; // default 800 (8%)
}): MarketBasketResult {
  const maxRules = Math.max(1, Math.min(12, params.maxRules ?? 5));
  const maxBps = Math.max(100, Math.min(2500, params.maxBundleDiscountBps ?? 800));
  const catMap = new Map(params.catalog.map(c => [c.productId, c]));
  const anchor = catMap.get(params.anchorProductId);
  if (!anchor) {
    return { anchorProductId: params.anchorProductId, totalBasketsAnalyzed: params.baskets.length, rules: [] };
  }

  const dedupBaskets = params.baskets
    .map(b => [...new Set(b.filter(id => catMap.has(id)))])
    .filter(b => b.length > 0);
  const N = dedupBaskets.length;

  const itemFreq = new Map<string, number>();
  const coFreq = new Map<string, number>();
  for (const basket of dedupBaskets) {
    const hasAnchor = basket.includes(anchor.productId);
    for (const pid of basket) {
      itemFreq.set(pid, (itemFreq.get(pid) ?? 0) + 1);
      if (hasAnchor && pid !== anchor.productId) {
        coFreq.set(pid, (coFreq.get(pid) ?? 0) + 1);
      }
    }
  }

  const anchorCount = itemFreq.get(anchor.productId) ?? 0;
  const rules: CoPurchaseBundleRule[] = [];

  for (const cand of params.catalog) {
    if (cand.productId === anchor.productId) continue;
    const coCount = coFreq.get(cand.productId) ?? 0;
    const candCount = itemFreq.get(cand.productId) ?? 0;

    // If we have real co-purchases, compute Laplace-smoothed association metrics;
    // if basket history is empty/cold, only include complementary cross-category items with modest score.
    if (N > 0 && anchorCount > 0 && coCount === 0) continue;
    if (N === 0 && cand.categoryId === anchor.categoryId) continue;

    const denomN = N + 2;
    const pA = (anchorCount + 1) / denomN;
    const pB = (candCount + 1) / denomN;
    const pAB = N > 0 ? (coCount + 0.5) / denomN : 0.15;
    const confidence = N > 0 ? (coCount + 0.5) / (anchorCount + 1) : 0.35;
    const lift = pAB / Math.max(1e-9, pA * pB);
    const conviction = (1 - pB) / Math.max(0.05, 1 - Math.min(0.95, confidence));

    const bundleOriginalVnd = anchor.priceVnd + cand.priceVnd;
    // Dynamic discount scales with confidence & cross-category synergy, capped by maxBps
    const crossCatBonusBps = cand.categoryId !== anchor.categoryId ? 150 : 0;
    const effectiveBps = Math.min(maxBps, Math.max(200, Math.round(confidence * 600) + crossCatBonusBps));
    const bundleDiscountVnd = Math.min(bundleOriginalVnd, Math.round((bundleOriginalVnd * effectiveBps) / 10000));
    const allocated = allocateDiscount(bundleDiscountVnd, [anchor.priceVnd, cand.priceVnd]);

    rules.push({
      companionProductId: cand.productId,
      companionName: cand.name,
      coOccurrenceCount: coCount,
      support: Number(pAB.toFixed(4)),
      confidence: Number(confidence.toFixed(4)),
      lift: Number(lift.toFixed(4)),
      conviction: Number(conviction.toFixed(4)),
      bundleOriginalVnd,
      bundleDiscountVnd,
      bundleNetVnd: bundleOriginalVnd - bundleDiscountVnd,
      allocatedItemDiscountsVnd: [allocated[0], allocated[1]],
    });
  }

  rules.sort((a, b) => (b.coOccurrenceCount !== a.coOccurrenceCount ? b.lift * b.confidence - a.lift * a.confidence : b.lift - a.lift));
  return {
    anchorProductId: anchor.productId,
    totalBasketsAnalyzed: N,
    rules: rules.slice(0, maxRules),
  };
}

// ============================================================================
// THUẬT TOÁN 98: XẾP HẠNG BẢNG TIN CỘNG ĐỒNG EDGERANK & TIME-DECAY GRAVITY
// (Social Affinity + Weighted Engagement + Time-Decay Gravity + Author Diversity)
// ============================================================================

export interface CommunityPostCandidate {
  postId: string;
  authorId: string;
  createdAtMs: number;
  reactionsCount: number;
  savesCount: number;
  commentsCount: number;
  activeProductTagsCount: number;
  openReportsCount?: number;
}

export interface RankedCommunityPost {
  postId: string;
  authorId: string;
  edgeRankScore: number;
  affinityMultiplier: number;
  diversityPenalty: number;
}

export function rankCommunityFeedEdgeRank(params: {
  posts: CommunityPostCandidate[];
  followedAuthorIds: string[];
  nowMs?: number;
  gravity?: number; // default 1.45
}): RankedCommunityPost[] {
  const nowMs = params.nowMs ?? Date.now();
  const gravity = Math.max(0.5, Math.min(3.0, params.gravity ?? 1.45));
  const followedSet = new Set(params.followedAuthorIds);

  // Step 1: Score each post by Affinity * EdgeWeight / (AgeHours + 2)^Gravity
  const prelim = params.posts.map(p => {
    const ageHours = Math.max(0, (nowMs - p.createdAtMs) / 3_600_000);
    const affinityMultiplier = followedSet.has(p.authorId) ? 1.65 : 1.0;
    const rawEngagement =
      1.0 +
      Math.max(0, p.reactionsCount) * 2.0 +
      Math.max(0, p.savesCount) * 3.5 +
      Math.max(0, p.commentsCount) * 2.5 +
      Math.max(0, p.activeProductTagsCount) * 1.8 -
      Math.max(0, p.openReportsCount ?? 0) * 6.0;

    const clampedEngagement = Math.max(0.1, rawEngagement);
    const timeDecayed = (affinityMultiplier * clampedEngagement) / Math.pow(ageHours + 2, gravity);
    return { ...p, affinityMultiplier, baseScore: timeDecayed };
  });

  // Step 2: Greedy Author Diversity Damping (0.55^k for k-th post by same author)
  const remaining = [...prelim];
  const authorSeenCount = new Map<string, number>();
  const finalRanked: RankedCommunityPost[] = [];

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestAdjusted = -Infinity;
    let bestPenalty = 1;

    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      const priorByAuthor = authorSeenCount.get(cand.authorId) ?? 0;
      const penalty = Math.pow(0.55, priorByAuthor);
      const adjusted = cand.baseScore * penalty;
      if (adjusted > bestAdjusted) {
        bestAdjusted = adjusted;
        bestIdx = i;
        bestPenalty = penalty;
      }
    }

    const chosen = remaining.splice(bestIdx, 1)[0];
    authorSeenCount.set(chosen.authorId, (authorSeenCount.get(chosen.authorId) ?? 0) + 1);
    finalRanked.push({
      postId: chosen.postId,
      authorId: chosen.authorId,
      edgeRankScore: Number(bestAdjusted.toFixed(5)),
      affinityMultiplier: chosen.affinityMultiplier,
      diversityPenalty: Number(bestPenalty.toFixed(4)),
    });
  }

  return finalRanked;
}

// ============================================================================
// THUẬT TOÁN 99: ĐỒ THỊ PHÁT HIỆN VÒNG LẶP HOA HỒNG (AFFILIATE RING), SYBIL & WARDROBING
// (Directed Graph Cycle Detection + Address/Phone Sybil Clustering + Return Abuse)
// ============================================================================

export interface ReferralEdge {
  orderId: string;
  buyerId: string;
  affiliateUserId: string;
  amountVnd: number;
}

export interface UserAddressRecord {
  userId: string;
  phone: string;
  addressLine: string;
  province: string;
}

export interface UserReturnStats {
  userId: string;
  deliveredOrdersCount: number;
  returnRequestsCount: number;
  lateWindowReturnsCount: number; // returns filed on day 5..7 after delivery
}

export interface FraudGraphAuditResult {
  referralCycles: string[][];
  sybilAddressClusters: { fingerprint: string; userIds: string[] }[];
  selfDealingOrderIds: string[];
  wardrobingSuspects: { userId: string; returnRate: number; lateWindowRatio: number; riskScore: number }[];
  overallRiskStatus: 'CLEAN' | 'WATCHLIST' | 'RING_DETECTED';
}

export function buildAddressSybilFingerprint(phone: string, line: string, province: string): string {
  const digits = (phone ?? '').replace(/\D/g, '').slice(-9);
  const normAddr = `${digits}|${normalizeVietnameseText(line)}|${normalizeVietnameseText(province)}`;
  return createHash('sha256').update(normAddr).digest('hex').slice(0, 16);
}

export function detectAffiliateAndReturnAbuseGraph(params: {
  referrals: ReferralEdge[];
  addresses: UserAddressRecord[];
  returnStats: UserReturnStats[];
}): FraudGraphAuditResult {
  // 1. Address/Phone Sybil Clustering
  const fpUsers = new Map<string, Set<string>>();
  const userFps = new Map<string, Set<string>>();
  for (const a of params.addresses) {
    if (!a.phone && !a.addressLine) continue;
    const fp = buildAddressSybilFingerprint(a.phone, a.addressLine, a.province);
    if (!fpUsers.has(fp)) fpUsers.set(fp, new Set());
    fpUsers.get(fp)!.add(a.userId);
    if (!userFps.has(a.userId)) userFps.set(a.userId, new Set());
    userFps.get(a.userId)!.add(fp);
  }

  const sybilAddressClusters = [...fpUsers.entries()]
    .filter(([, set]) => set.size >= 2)
    .map(([fingerprint, set]) => ({ fingerprint, userIds: [...set].sort() }));

  // 2. Self-Dealing Orders (buyer shares address/phone fingerprint with affiliate KOC, or buyer === affiliate)
  const selfDealingOrderIds: string[] = [];
  const adj = new Map<string, Set<string>>();
  for (const ref of params.referrals) {
    if (ref.buyerId === ref.affiliateUserId) {
      selfDealingOrderIds.push(ref.orderId);
      continue;
    }
    const buyerSet = userFps.get(ref.buyerId);
    const kocSet = userFps.get(ref.affiliateUserId);
    let sharedFp = false;
    if (buyerSet && kocSet) {
      for (const fp of buyerSet) {
        if (kocSet.has(fp)) {
          sharedFp = true;
          break;
        }
      }
    }
    if (sharedFp) {
      selfDealingOrderIds.push(ref.orderId);
    }
    if (!adj.has(ref.buyerId)) adj.set(ref.buyerId, new Set());
    adj.get(ref.buyerId)!.add(ref.affiliateUserId);
  }

  // 3. Directed Cycle Detection (up to length 5 to catch 2-way/3-way/4-way collusion rings)
  const cycleKeySet = new Set<string>();
  const referralCycles: string[][] = [];
  const nodes = [...adj.keys()].sort();

  for (const start of nodes) {
    const dfs = (curr: string, path: string[]) => {
      if (path.length > 5) return;
      const neighbors = adj.get(curr);
      if (!neighbors) return;
      for (const nxt of neighbors) {
        if (nxt === start && path.length >= 2) {
          // Canonicalize cycle rotation by smallest lexical node ID
          const minNode = [...path].sort()[0];
          const minIdx = path.indexOf(minNode);
          const canonical = [...path.slice(minIdx), ...path.slice(0, minIdx)];
          const key = canonical.join('->');
          if (!cycleKeySet.has(key)) {
            cycleKeySet.add(key);
            referralCycles.push([...canonical, canonical[0]]);
          }
        } else if (!path.includes(nxt) && nxt > start) {
          dfs(nxt, [...path, nxt]);
        }
      }
    };
    dfs(start, [start]);
  }

  // 4. Serial Wardrobing / Return Abuse Scorer
  const wardrobingSuspects: FraudGraphAuditResult['wardrobingSuspects'] = [];
  for (const st of params.returnStats) {
    if (st.deliveredOrdersCount < 2 || st.returnRequestsCount < 2) continue;
    const returnRate = Math.min(1, st.returnRequestsCount / st.deliveredOrdersCount);
    const lateWindowRatio = Math.min(1, st.lateWindowReturnsCount / Math.max(1, st.returnRequestsCount));
    const riskScore = Math.min(100, Math.round(returnRate * 65 + lateWindowRatio * 35));
    if (riskScore >= 55) {
      wardrobingSuspects.push({
        userId: st.userId,
        returnRate: Number(returnRate.toFixed(3)),
        lateWindowRatio: Number(lateWindowRatio.toFixed(3)),
        riskScore,
      });
    }
  }

  const overallRiskStatus: FraudGraphAuditResult['overallRiskStatus'] =
    referralCycles.length > 0 || selfDealingOrderIds.length > 0 ? 'RING_DETECTED' :
    sybilAddressClusters.length > 0 || wardrobingSuspects.length > 0 ? 'WATCHLIST' : 'CLEAN';

  return {
    referralCycles,
    sybilAddressClusters,
    selfDealingOrderIds,
    wardrobingSuspects: wardrobingSuspects.sort((a, b) => b.riskScore - a.riskScore),
    overallRiskStatus,
  };
}

// ============================================================================
// THUẬT TOÁN 100: TỐI ƯU HÓA GIÁ ĐỘNG THEO ĐỘ CO GIÃN CẦU (LOG-LOG OLS ELASTICITY)
// (Bayesian-Shrunk Log-Log Price Elasticity & Circuit-Breaker-Safe Yield Pricing)
// ============================================================================

export interface PriceDemandObservation {
  unitPriceVnd: number;
  unitsSold: number;
}

export interface DynamicPriceRecommendation {
  variantId: string;
  sku: string;
  currentPriceVnd: number;
  recommendedPriceVnd: number;
  priceChangePct: number;
  estimatedElasticity: number;
  action: 'MARKUP_SCARCITY' | 'MARKDOWN_CLEARANCE' | 'HOLD_OPTIMAL';
  expectedWeeklyUnits: number;
  expectedGrossMarginVnd: number;
}

export function optimizeDynamicPriceElasticity(params: {
  variantId: string;
  sku: string;
  currentPriceVnd: number;
  unitCostFloorVnd?: number; // default 55% of currentPriceVnd
  availableStock: number;
  targetDaysToSellThrough?: number; // default 28 days
  observations: PriceDemandObservation[];
  priorElasticity?: number; // default -1.65 (luxury/premium apparel)
}): DynamicPriceRecommendation {
  const curPrice = Math.max(1000, Math.round(params.currentPriceVnd));
  const costFloor = Math.max(500, Math.round(params.unitCostFloorVnd ?? curPrice * 0.55));
  const priorE = params.priorElasticity ?? -1.65;
  const targetWeeks = Math.max(1, (params.targetDaysToSellThrough ?? 28) / 7);

  // Filter positive (P, Q) points for log-log OLS: ln(Q) = a + e * ln(P)
  const validObs = params.observations.filter(o => o.unitPriceVnd > 0 && o.unitsSold > 0);
  let olsElasticity = priorE;
  let weightOls = 0;

  if (validObs.length >= 2) {
    const xs = validObs.map(o => Math.log(o.unitPriceVnd));
    const ys = validObs.map(o => Math.log(o.unitsSold));
    const meanX = xs.reduce((s, v) => s + v, 0) / xs.length;
    const meanY = ys.reduce((s, v) => s + v, 0) / ys.length;
    let covXY = 0;
    let varX = 0;
    for (let i = 0; i < xs.length; i++) {
      covXY += (xs[i] - meanX) * (ys[i] - meanY);
      varX += (xs[i] - meanX) * (xs[i] - meanX);
    }
    if (varX > 1e-6) {
      olsElasticity = Math.max(-4.5, Math.min(-0.3, covXY / varX));
      weightOls = Math.min(0.85, validObs.length / (validObs.length + 4));
    }
  }

  // Bayesian shrinkage toward category prior
  const e = Number((weightOls * olsElasticity + (1 - weightOls) * priorE).toFixed(3));

  const baselineWeeklyUnits = validObs.length > 0
    ? validObs.reduce((s, o) => s + o.unitsSold, 0) / validObs.length
    : 2.0;

  // Profit-maximizing Lerner condition: P* = C * |e| / (|e| - 1) when |e| > 1.15
  const absE = Math.max(1.18, Math.abs(e));
  let idealPrice = costFloor * (absE / (absE - 1));

  // Inventory pressure adjustment (sell-through vs available stock)
  const desiredWeeklyRate = params.availableStock / targetWeeks;
  if (params.availableStock <= 3 && baselineWeeklyUnits >= 2) {
    idealPrice = Math.max(idealPrice, curPrice * 1.08); // scarcity yield
  } else if (params.availableStock >= 20 && baselineWeeklyUnits < desiredWeeklyRate * 0.5) {
    idealPrice = Math.min(idealPrice, curPrice * 0.90); // gentle clearance markdown
  }

  // Guardrails: never below costFloor * 1.15, never exceed +/- 15% per step (circuit-breaker safe), round to 1,000 VND
  const minSafePrice = Math.max(costFloor * 1.15, curPrice * 0.85);
  const maxSafePrice = curPrice * 1.15;
  const clamped = Math.max(minSafePrice, Math.min(maxSafePrice, idealPrice));
  const recommendedPriceVnd = Math.max(1000, Math.round(clamped / 1000) * 1000);

  const ratio = recommendedPriceVnd / curPrice;
  const priceChangePct = Number(((ratio - 1) * 100).toFixed(2));
  const expectedWeeklyUnits = Number(Math.max(0, baselineWeeklyUnits * Math.pow(ratio, e)).toFixed(2));
  const expectedGrossMarginVnd = Math.round(expectedWeeklyUnits * Math.max(0, recommendedPriceVnd - costFloor));

  const action: DynamicPriceRecommendation['action'] =
    priceChangePct >= 2.0 ? 'MARKUP_SCARCITY' :
    priceChangePct <= -2.0 ? 'MARKDOWN_CLEARANCE' : 'HOLD_OPTIMAL';

  return {
    variantId: params.variantId,
    sku: params.sku,
    currentPriceVnd: curPrice,
    recommendedPriceVnd: action === 'HOLD_OPTIMAL' ? curPrice : recommendedPriceVnd,
    priceChangePct: action === 'HOLD_OPTIMAL' ? 0 : priceChangePct,
    estimatedElasticity: e,
    action,
    expectedWeeklyUnits,
    expectedGrossMarginVnd,
  };
}

// ============================================================================
// THUẬT TOÁN 101: CÂY MERKLE NHỊ PHÂN ĐỐI SOÁT SỔ CÁI & BẰNG CHỨNG BAO HÀM O(log N)
// (SHA-256 Binary Merkle Tree Root, Inclusion Proof & Double-Entry Ledger Invariant Check)
// ============================================================================

export interface MerkleLedgerLeafInput {
  id: string;
  kind: string;
  amount: number;
  sourceKey: string;
}

export interface MerkleProofStep {
  position: 'LEFT' | 'RIGHT';
  hash: string;
}

export interface MerkleLedgerAuditResult {
  merkleRoot: string;
  leafCount: number;
  netBalanceVnd: number;
  invariantsValid: boolean;
  violations: string[];
  proofsByEntryId: Record<string, { leafHash: string; steps: MerkleProofStep[] }>;
}

function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function computeLedgerLeafHash(entry: MerkleLedgerLeafInput): string {
  return sha256Hex(`LEAF:${entry.id}|${entry.kind}|${entry.amount}|${entry.sourceKey}`);
}

export function verifyMerkleInclusionProof(params: {
  leafHash: string;
  steps: MerkleProofStep[];
  expectedRoot: string;
}): boolean {
  let cur = params.leafHash;
  for (const step of params.steps) {
    cur = step.position === 'LEFT'
      ? sha256Hex(`NODE:${step.hash}:${cur}`)
      : sha256Hex(`NODE:${cur}:${step.hash}`);
  }
  return cur === params.expectedRoot;
}

export function computeLedgerMerkleAudit(entries: MerkleLedgerLeafInput[]): MerkleLedgerAuditResult {
  const violations: string[] = [];
  const seenKeys = new Set<string>();
  let totalInflows = 0;
  let totalPayoutsAbs = 0;
  let netBalanceVnd = 0;

  // Deterministic ordering by id for canonical Merkle root
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));

  for (const e of sorted) {
    if (!Number.isSafeInteger(e.amount)) {
      violations.push(`UNSAFE_INTEGER:${e.id}`);
    }
    if (seenKeys.has(e.sourceKey)) {
      violations.push(`DUPLICATE_SOURCE_KEY:${e.sourceKey}`);
    }
    seenKeys.add(e.sourceKey);
    netBalanceVnd += e.amount;
    if (e.amount > 0) totalInflows += e.amount;
    if (e.kind === 'PAYOUT_ESCROW_WITHDRAWAL') {
      if (e.amount >= 0) violations.push(`INVALID_PAYOUT_SIGN:${e.id}`);
      totalPayoutsAbs += Math.abs(e.amount);
    }
  }

  if (totalPayoutsAbs > totalInflows && sorted.length > 0) {
    violations.push('PAYOUT_EXCEEDS_TOTAL_INFLOWS');
  }

  if (sorted.length === 0) {
    const emptyRoot = sha256Hex('EMPTY_MERKLE_LEDGER');
    return {
      merkleRoot: emptyRoot,
      leafCount: 0,
      netBalanceVnd: 0,
      invariantsValid: true,
      violations: [],
      proofsByEntryId: {},
    };
  }

  const leafHashes = sorted.map(computeLedgerLeafHash);
  const proofsByEntryId: Record<string, { leafHash: string; steps: MerkleProofStep[] }> = {};
  for (let i = 0; i < sorted.length; i++) {
    proofsByEntryId[sorted[i].id] = { leafHash: leafHashes[i], steps: [] };
  }

  // Track which original indices belong to each node at the current tree level
  let levelNodes: { hash: string; origIndices: number[] }[] = leafHashes.map((h, idx) => ({
    hash: h,
    origIndices: [idx],
  }));

  while (levelNodes.length > 1) {
    const nextLevel: { hash: string; origIndices: number[] }[] = [];
    for (let i = 0; i < levelNodes.length; i += 2) {
      const left = levelNodes[i];
      const right = i + 1 < levelNodes.length ? levelNodes[i + 1] : { hash: left.hash, origIndices: [] };
      const parentHash = sha256Hex(`NODE:${left.hash}:${right.hash}`);

      for (const origIdx of left.origIndices) {
        proofsByEntryId[sorted[origIdx].id].steps.push({ position: 'RIGHT', hash: right.hash });
      }
      for (const origIdx of right.origIndices) {
        proofsByEntryId[sorted[origIdx].id].steps.push({ position: 'LEFT', hash: left.hash });
      }

      nextLevel.push({
        hash: parentHash,
        origIndices: [...left.origIndices, ...right.origIndices],
      });
    }
    levelNodes = nextLevel;
  }

  return {
    merkleRoot: levelNodes[0].hash,
    leafCount: sorted.length,
    netBalanceVnd,
    invariantsValid: violations.length === 0,
    violations,
    proofsByEntryId,
  };
}

// ============================================================================
// HELPER NGHIỆP VỤ VOUCHER THEO HẠNG THÀNH VIÊN (TIER & NEWBIE VOUCHER POLICY)
// ============================================================================

export type RequiredVoucherTier = 'WELCOME_NEWBIE' | 'VIP_SILVER' | 'VIP_GOLD' | 'VIP_DIAMOND' | 'PUBLIC_ALL';

export function inferVoucherRequiredTier(code: string): RequiredVoucherTier {
  const upper = (code ?? '').trim().toUpperCase();
  if (/^(NEW|WELCOME|UTE)/.test(upper)) return 'WELCOME_NEWBIE';
  if (/^(DIAMOND|VIPDIA)/.test(upper)) return 'VIP_DIAMOND';
  if (/^(GOLD|VIPGOLD)/.test(upper)) return 'VIP_GOLD';
  if (/^(SILVER|VIPSIL)/.test(upper)) return 'VIP_SILVER';
  return 'PUBLIC_ALL';
}

export function checkVoucherEligibilityForCustomer(params: {
  voucherCode: string;
  isNewMemberEligible: boolean;
  eligibleVoucherTiers: string[];
}): { eligible: boolean; requiredTier: RequiredVoucherTier; reason?: string } {
  const requiredTier = inferVoucherRequiredTier(params.voucherCode);
  if (requiredTier === 'PUBLIC_ALL') {
    return { eligible: true, requiredTier };
  }
  if (requiredTier === 'WELCOME_NEWBIE') {
    if (!params.isNewMemberEligible) {
      return {
        eligible: false,
        requiredTier,
        reason: `Mã ${params.voucherCode} chỉ dành cho khách hàng mới chưa từng phát sinh đơn hàng`,
      };
    }
    return { eligible: true, requiredTier };
  }
  if (!params.eligibleVoucherTiers.includes(requiredTier)) {
    return {
      eligible: false,
      requiredTier,
      reason: `Mã ${params.voucherCode} yêu cầu hạng thành viên ${requiredTier.replace('VIP_', '')}`,
    };
  }
  return { eligible: true, requiredTier };
}

// ============================================================================
// THUẬT TOÁN 102: PERSONALIZED PAGERANK UY TÍN XƯỞNG MAY & EMPIRICAL BAYES SLA
// (Bipartite Buyer-Shop PageRank Power Iteration + Shrunk SLA Reliability)
// ============================================================================

export interface ShopTrustInput {
  shopId: string;
  shopName: string;
  isMall: boolean;
  deliveredCount: number;
  cancelledOrExpiredCount: number;
  disputedOrReturnedCount: number;
  ratings: number[];
  buyerSpendEdges: { buyerId: string; netSpendVnd: number }[];
}

export interface ShopTrustRankItem {
  shopId: string;
  shopName: string;
  pageRankAuthority: number; // normalized 0..100
  slaReliabilityPct: number;
  bayesianRating: number;
  distinctBuyers: number;
  repeatBuyers: number;
  compositeTrustScore: number; // 0..100
  searchBoostMultiplier: number; // 0.85..1.25
  mallEligibilityRecommended: boolean;
  trustTier: 'ATELIER_GRAND_CRU' | 'TRUSTED_CRAFTSMAN' | 'STANDARD_WORKSHOP' | 'PROBATION_WATCH';
}

export function computeSellerTrustAndPageRank(params: {
  shops: ShopTrustInput[];
  dampingFactor?: number; // default 0.85
  iterations?: number;    // default 25
}): ShopTrustRankItem[] {
  const N = params.shops.length;
  if (N === 0) return [];
  const d = Math.max(0.5, Math.min(0.95, params.dampingFactor ?? 0.85));
  const iters = Math.max(5, Math.min(60, params.iterations ?? 25));

  // Project bipartite Buyer <-> Shop graph into a weighted Shop -> Shop transition matrix:
  // If a buyer purchases from multiple shops (or repeatedly), log-dampened spend creates endorsement flow;
  // cap single-buyer weight via log1p(netSpendVnd) to resist wash-trading by one whale account.
  const buyerShops = new Map<string, Map<string, number>>();
  const shopBuyerCounts = new Map<string, Map<string, number>>();

  for (const s of params.shops) {
    const bCount = new Map<string, number>();
    for (const edge of s.buyerSpendEdges) {
      if (edge.netSpendVnd <= 0) continue;
      bCount.set(edge.buyerId, (bCount.get(edge.buyerId) ?? 0) + 1);
      let sMap = buyerShops.get(edge.buyerId);
      if (!sMap) {
        sMap = new Map<string, number>();
        buyerShops.set(edge.buyerId, sMap);
      }
      const w = Math.log1p(edge.netSpendVnd / 100_000);
      sMap.set(s.shopId, (sMap.get(s.shopId) ?? 0) + w);
    }
    shopBuyerCounts.set(s.shopId, bCount);
  }

  const shopIdx = new Map(params.shops.map((s, i) => [s.shopId, i]));
  // Transition matrix colStochastic[from][to]
  const outWeights: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  for (const sMap of buyerShops.values()) {
    const entries = [...sMap.entries()];
    for (let i = 0; i < entries.length; i++) {
      for (let j = 0; j < entries.length; j++) {
        const fromIdx = shopIdx.get(entries[i][0]);
        const toIdx = shopIdx.get(entries[j][0]);
        if (fromIdx !== undefined && toIdx !== undefined) {
          outWeights[fromIdx][toIdx] += Math.sqrt(entries[i][1] * entries[j][1]);
        }
      }
    }
  }

  // Personalization vector v proportional to smoothed distinct buyer count + Mall verification prior
  const rawPrior = params.shops.map(s => {
    const distinct = shopBuyerCounts.get(s.shopId)?.size ?? 0;
    return 1 + distinct + (s.isMall ? 0.5 : 0);
  });
  const sumPrior = rawPrior.reduce((a, b) => a + b, 0);
  const v = rawPrior.map(x => x / sumPrior);

  let pr = [...v];
  for (let step = 0; step < iters; step++) {
    const next = v.map(vi => (1 - d) * vi);
    for (let from = 0; from < N; from++) {
      const rowSum = outWeights[from].reduce((a, b) => a + b, 0);
      if (rowSum <= 1e-9) {
        for (let to = 0; to < N; to++) next[to] += d * pr[from] * v[to];
      } else {
        for (let to = 0; to < N; to++) {
          next[to] += d * pr[from] * (outWeights[from][to] / rowSum);
        }
      }
    }
    pr = next;
  }

  const maxPr = Math.max(...pr, 1e-9);

  return params.shops
    .map((s, idx) => {
      const bMap = shopBuyerCounts.get(s.shopId) ?? new Map<string, number>();
      const distinctBuyers = bMap.size;
      const repeatBuyers = [...bMap.values()].filter(c => c >= 2).length;

      // Empirical Bayes SLA score: prior = 10 successes / 11 trials (~90.9%)
      const totalOps = s.deliveredCount + s.cancelledOrExpiredCount + s.disputedOrReturnedCount;
      const goodOps = Math.max(0, s.deliveredCount - s.disputedOrReturnedCount * 0.5);
      const slaReliability = (goodOps + 10) / (totalOps + 11);
      const slaReliabilityPct = Number((slaReliability * 100).toFixed(2));

      const ratingSum = s.ratings.reduce((acc, r) => acc + Math.max(1, Math.min(5, r)), 0);
      const bayesianRating = Number(((4.35 * 5 + ratingSum) / (5 + s.ratings.length)).toFixed(2));
      const ratingNorm = ((bayesianRating - 1) / 4) * 100;

      const pageRankAuthority = Number(((pr[idx] / maxPr) * 100).toFixed(2));
      const compositeTrustScore = Number(
        (0.32 * pageRankAuthority + 0.43 * slaReliabilityPct + 0.25 * ratingNorm).toFixed(2)
      );

      const searchBoostMultiplier = Number(
        Math.max(0.85, Math.min(1.25, 0.85 + (compositeTrustScore / 100) * 0.40)).toFixed(3)
      );

      const trustTier: ShopTrustRankItem['trustTier'] =
        compositeTrustScore >= 85 && slaReliabilityPct >= 90 ? 'ATELIER_GRAND_CRU' :
        compositeTrustScore >= 72 && slaReliabilityPct >= 82 ? 'TRUSTED_CRAFTSMAN' :
        slaReliabilityPct < 68 || compositeTrustScore < 55 ? 'PROBATION_WATCH' : 'STANDARD_WORKSHOP';

      return {
        shopId: s.shopId,
        shopName: s.shopName,
        pageRankAuthority,
        slaReliabilityPct,
        bayesianRating,
        distinctBuyers,
        repeatBuyers,
        compositeTrustScore,
        searchBoostMultiplier,
        mallEligibilityRecommended: compositeTrustScore >= 80 && slaReliabilityPct >= 88 && s.deliveredCount >= 3,
        trustTier,
      };
    })
    .sort((a, b) => b.compositeTrustScore - a.compositeTrustScore);
}

// ============================================================================
// THUẬT TOÁN 103: ĐẤU GIÁ ĐỒNG NHẤT GIÁ VICKREY CHO PHIÊN BẢN GIỚI HẠN
// (Multi-Unit Uniform-Price / Generalized Vickrey Limited-Drop Clearing)
// ============================================================================

export interface SealedDropBid {
  bidId: string;
  userId: string;
  bidPriceVnd: number;
  quantity: number;
  submittedAtMs: number;
}

export interface DropWinnerAllocation {
  bidId: string;
  userId: string;
  allocatedQty: number;
  bidPriceVnd: number;
  clearingUnitPriceVnd: number;
  totalPayableVnd: number;
  bidderSurplusRefundVnd: number;
}

export interface UniformPriceAuctionResult {
  dropId: string;
  supplyUnits: number;
  totalRequestedUnits: number;
  allocatedUnits: number;
  clearingUnitPriceVnd: number;
  isOversubscribed: boolean;
  totalGrossEscrowVnd: number;
  totalSurplusRefundedVnd: number;
  totalNetRevenueVnd: number;
  winners: DropWinnerAllocation[];
}

export function clearUniformPriceLimitedDropAuction(params: {
  dropId: string;
  supplyUnits: number;
  reservePriceVnd: number;
  maxUnitsPerUser?: number;
  bids: SealedDropBid[];
}): UniformPriceAuctionResult {
  const supply = Math.max(1, Math.floor(params.supplyUnits));
  const reserve = Math.max(1000, Math.floor(params.reservePriceVnd));
  const maxPerUser = Math.max(1, Math.floor(params.maxUnitsPerUser ?? 2));

  // Filter valid bids >= reservePriceVnd; sort by highest price first, then earliest timestamp (FIFO tie-break)
  const validBids = params.bids
    .filter(b => Number.isSafeInteger(b.bidPriceVnd) && b.bidPriceVnd >= reserve && b.quantity >= 1)
    .sort((a, b) => (b.bidPriceVnd !== a.bidPriceVnd ? b.bidPriceVnd - a.bidPriceVnd : a.submittedAtMs - b.submittedAtMs));

  const totalRequestedUnits = validBids.reduce((s, b) => s + Math.floor(b.quantity), 0);
  const userAllocated = new Map<string, number>();
  const provisionalWinners: { bid: SealedDropBid; qty: number }[] = [];
  let remaining = supply;
  let highestRejectedBidVnd: number | null = null;

  for (const bid of validBids) {
    const already = userAllocated.get(bid.userId) ?? 0;
    const userCapLeft = Math.max(0, maxPerUser - already);
    const reqQty = Math.min(Math.floor(bid.quantity), userCapLeft);
    if (reqQty <= 0) continue;

    if (remaining <= 0) {
      if (highestRejectedBidVnd === null) highestRejectedBidVnd = bid.bidPriceVnd;
      continue;
    }

    const granted = Math.min(remaining, reqQty);
    provisionalWinners.push({ bid, qty: granted });
    userAllocated.set(bid.userId, already + granted);
    remaining -= granted;

    if (granted < reqQty && highestRejectedBidVnd === null) {
      highestRejectedBidVnd = bid.bidPriceVnd;
    }
  }

  // Generalized Vickrey / Uniform-Price rule:
  // If oversubscribed, uniform price = max(reserve, highest rejected marginal bid), capped at lowest winning bid.
  // If undersubscribed, uniform price = reservePriceVnd.
  const lowestWinningBid = provisionalWinners.length > 0
    ? provisionalWinners[provisionalWinners.length - 1].bid.bidPriceVnd
    : reserve;
  const isOversubscribed = highestRejectedBidVnd !== null;
  const clearingUnitPriceVnd = isOversubscribed
    ? Math.max(reserve, Math.min(lowestWinningBid, highestRejectedBidVnd!))
    : reserve;

  let totalGrossEscrowVnd = 0;
  let totalSurplusRefundedVnd = 0;
  let totalNetRevenueVnd = 0;

  const winners: DropWinnerAllocation[] = provisionalWinners.map(({ bid, qty }) => {
    const gross = bid.bidPriceVnd * qty;
    const payable = clearingUnitPriceVnd * qty;
    const surplus = gross - payable;
    totalGrossEscrowVnd += gross;
    totalNetRevenueVnd += payable;
    totalSurplusRefundedVnd += surplus;
    return {
      bidId: bid.bidId,
      userId: bid.userId,
      allocatedQty: qty,
      bidPriceVnd: bid.bidPriceVnd,
      clearingUnitPriceVnd,
      totalPayableVnd: payable,
      bidderSurplusRefundVnd: surplus,
    };
  });

  return {
    dropId: params.dropId,
    supplyUnits: supply,
    totalRequestedUnits,
    allocatedUnits: supply - remaining,
    clearingUnitPriceVnd,
    isOversubscribed,
    totalGrossEscrowVnd,
    totalSurplusRefundedVnd,
    totalNetRevenueVnd,
    winners,
  };
}

// ============================================================================
// THUẬT TOÁN 104: ĐỊNH TUYẾN XE ĐIỆN MILK-RUN CLARKE-WRIGHT SAVINGS + 2-OPT VRP
// (Capacitated Vehicle Routing with Clarke-Wright Savings & 2-Opt Local Search)
// ============================================================================

export interface VrpStopNode {
  stopId: string;
  label: string;
  lat: number;
  lng: number;
  weightKg: number;
}

export interface MilkRunRoutePlan {
  vehicleIndex: number;
  orderedStopIds: string[];
  orderedLabels: string[];
  totalWeightKg: number;
  routeDistanceKm: number;
  estimatedDurationMinutes: number;
}

export interface MilkRunOptimizationResult {
  vehiclesUsed: number;
  naiveStarDistanceKm: number;
  optimizedTotalDistanceKm: number;
  distanceSavedKm: number;
  savingsPct: number;
  co2AbatedKg: number;
  routes: MilkRunRoutePlan[];
}

function haversineKmInternal(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(Math.max(0, 1 - s)));
}

function routeLengthKm(depot: { lat: number; lng: number }, seq: VrpStopNode[]): number {
  if (seq.length === 0) return 0;
  let dist = haversineKmInternal(depot.lat, depot.lng, seq[0].lat, seq[0].lng);
  for (let i = 0; i + 1 < seq.length; i++) {
    dist += haversineKmInternal(seq[i].lat, seq[i].lng, seq[i + 1].lat, seq[i + 1].lng);
  }
  dist += haversineKmInternal(seq[seq.length - 1].lat, seq[seq.length - 1].lng, depot.lat, depot.lng);
  return dist;
}

function improveRoute2Opt(depot: { lat: number; lng: number }, stops: VrpStopNode[]): VrpStopNode[] {
  if (stops.length < 3) return stops;
  let best = [...stops];
  let bestDist = routeLengthKm(depot, best);
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ];
        const candDist = routeLengthKm(depot, candidate);
        if (candDist + 1e-6 < bestDist) {
          best = candidate;
          bestDist = candDist;
          improved = true;
        }
      }
    }
  }
  return best;
}

export function optimizeCourierMilkRunRouting(params: {
  depot: { lat: number; lng: number; name?: string };
  stops: VrpStopNode[];
  vehicleCapacityKg?: number; // default 60 kg (EV cargo box)
  maxStopsPerRoute?: number;  // default 8
  avgSpeedKmh?: number;       // default 28 km/h urban EV
}): MilkRunOptimizationResult {
  const capKg = Math.max(5, params.vehicleCapacityKg ?? 60);
  const maxStops = Math.max(2, Math.min(25, params.maxStopsPerRoute ?? 8));
  const speed = Math.max(10, params.avgSpeedKmh ?? 28);
  const stops = params.stops.slice(0, 60).map(s => ({ ...s, weightKg: Math.max(0.1, Math.min(capKg, s.weightKg)) }));

  if (stops.length === 0) {
    return {
      vehiclesUsed: 0,
      naiveStarDistanceKm: 0,
      optimizedTotalDistanceKm: 0,
      distanceSavedKm: 0,
      savingsPct: 0,
      co2AbatedKg: 0,
      routes: [],
    };
  }

  // Naive star tour: Depot -> Stop_i -> Depot for every stop independently
  const distDepot = stops.map(s => haversineKmInternal(params.depot.lat, params.depot.lng, s.lat, s.lng));
  const naiveStarDistanceKm = distDepot.reduce((sum, d) => sum + 2 * d, 0);

  // Initialize each stop in its own route
  const routes: (VrpStopNode[] | null)[] = stops.map(s => [s]);
  const nodeRouteIdx = new Map<string, number>(stops.map((s, idx) => [s.stopId, idx]));

  // Compute Clarke-Wright savings s(i, j) = d(0, i) + d(0, j) - d(i, j)
  const savingsList: { i: number; j: number; saving: number }[] = [];
  for (let i = 0; i < stops.length; i++) {
    for (let j = i + 1; j < stops.length; j++) {
      const dij = haversineKmInternal(stops[i].lat, stops[i].lng, stops[j].lat, stops[j].lng);
      const saving = distDepot[i] + distDepot[j] - dij;
      if (saving > 0) savingsList.push({ i, j, saving });
    }
  }
  savingsList.sort((a, b) => b.saving - a.saving);

  for (const { i, j } of savingsList) {
    const idI = stops[i].stopId;
    const idJ = stops[j].stopId;
    const rI = nodeRouteIdx.get(idI)!;
    const rJ = nodeRouteIdx.get(idJ)!;
    if (rI === rJ) continue;
    const routeA = routes[rI];
    const routeB = routes[rJ];
    if (!routeA || !routeB) continue;
    if (routeA.length + routeB.length > maxStops) continue;

    const weightSum = [...routeA, ...routeB].reduce((s, n) => s + n.weightKg, 0);
    if (weightSum > capKg) continue;

    // Merge only if idI and idJ sit at endpoints of their respective routes
    let merged: VrpStopNode[] | null = null;
    if (routeA[routeA.length - 1].stopId === idI && routeB[0].stopId === idJ) {
      merged = [...routeA, ...routeB];
    } else if (routeB[routeB.length - 1].stopId === idJ && routeA[0].stopId === idI) {
      merged = [...routeB, ...routeA];
    } else if (routeA[0].stopId === idI && routeB[0].stopId === idJ) {
      merged = [...[...routeA].reverse(), ...routeB];
    } else if (routeA[routeA.length - 1].stopId === idI && routeB[routeB.length - 1].stopId === idJ) {
      merged = [...routeA, ...[...routeB].reverse()];
    }

    if (merged) {
      routes[rI] = merged;
      routes[rJ] = null;
      for (const n of merged) nodeRouteIdx.set(n.stopId, rI);
    }
  }

  const finalRoutes: MilkRunRoutePlan[] = routes
    .filter((r): r is VrpStopNode[] => Boolean(r && r.length > 0))
    .map((rawRoute, idx) => {
      const polished = improveRoute2Opt(params.depot, rawRoute);
      const distKm = routeLengthKm(params.depot, polished);
      const weight = polished.reduce((s, n) => s + n.weightKg, 0);
      const serviceMins = polished.length * 6;
      const travelMins = (distKm / speed) * 60;
      return {
        vehicleIndex: idx + 1,
        orderedStopIds: polished.map(n => n.stopId),
        orderedLabels: polished.map(n => n.label),
        totalWeightKg: Number(weight.toFixed(2)),
        routeDistanceKm: Number(distKm.toFixed(2)),
        estimatedDurationMinutes: Math.round(travelMins + serviceMins),
      };
    });

  const optimizedTotalDistanceKm = finalRoutes.reduce((s, r) => s + r.routeDistanceKm, 0);
  const distanceSavedKm = Math.max(0, naiveStarDistanceKm - optimizedTotalDistanceKm);
  const savingsPct = naiveStarDistanceKm > 0 ? (distanceSavedKm / naiveStarDistanceKm) * 100 : 0;
  // ~0.118 kg CO2e saved per km abated + EV substitution factor
  const co2AbatedKg = distanceSavedKm * 0.118;

  return {
    vehiclesUsed: finalRoutes.length,
    naiveStarDistanceKm: Number(naiveStarDistanceKm.toFixed(2)),
    optimizedTotalDistanceKm: Number(optimizedTotalDistanceKm.toFixed(2)),
    distanceSavedKm: Number(distanceSavedKm.toFixed(2)),
    savingsPct: Number(savingsPct.toFixed(2)),
    co2AbatedKg: Number(co2AbatedKg.toFixed(3)),
    routes: finalRoutes,
  };
}

// ============================================================================
// THUẬT TOÁN 105: KIỂM ĐỊNH THỐNG KÊ A/B TUẦN TỰ (WALD SPRT + BETA-BINOMIAL)
// (Sequential Probability Ratio Test + Exact Beta Posterior + Welch RPV t-Stat)
// ============================================================================

export interface AbVariantStats {
  exposures: number;
  conversions: number;
  meanOrderValueVnd: number;
  stdDevOrderValueVnd?: number;
}

export interface SequentialAbTestResult {
  conversionRateA: number;
  conversionRateB: number;
  relativeLiftPct: number;
  probBBeatsA: number; // Posterior P(theta_B > theta_A) in [0, 1]
  sprtLogLikelihoodRatio: number;
  upperThreshold: number;
  lowerThreshold: number;
  sprtDecision: 'WINNER_B' | 'WINNER_A' | 'CONTINUE_SAMPLING';
  welchRevenueTStat: number;
  recommendedAction: string;
}

/**
 * Deterministic Midpoint Quadrature over Beta PDF in log-space (Lanczos lgamma)
 * to compute exact P(Beta(aB, bB) > Beta(aA, bA)) with zero random seed flakiness!
 */
function logGamma(z: number): number {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  let x = c[0];
  const zm = z - 1;
  for (let i = 1; i < g + 2; i++) x += c[i] / (zm + i);
  const t = zm + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (zm + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaPdf(x: number, a: number, b: number, logNorm: number): number {
  if (x <= 0 || x >= 1) return 0;
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logNorm);
}

export function evaluatePromoExperimentSequentialAb(params: {
  controlA: AbVariantStats;
  treatmentB: AbVariantStats;
  minimumDetectableRelativeLift?: number; // default 0.15 (+15% relative conversion lift)
  alpha?: number; // Type-I error, default 0.05
  beta?: number;  // Type-II error, default 0.20 (80% power)
}): SequentialAbTestResult {
  const nA = Math.max(1, Math.floor(params.controlA.exposures));
  const cA = Math.max(0, Math.min(nA, Math.floor(params.controlA.conversions)));
  const nB = Math.max(1, Math.floor(params.treatmentB.exposures));
  const cB = Math.max(0, Math.min(nB, Math.floor(params.treatmentB.conversions)));

  const pA = cA / nA;
  const pB = cB / nB;
  const relativeLiftPct = pA > 0 ? ((pB - pA) / pA) * 100 : pB > 0 ? 100 : 0;

  // Beta(1 + c, 1 + n - c) exact numerical integration on 400-grid
  const aA = 1 + cA, bA = 1 + (nA - cA);
  const aB = 1 + cB, bB = 1 + (nB - cB);
  const logNormA = logGamma(aA) + logGamma(bA) - logGamma(aA + bA);
  const logNormB = logGamma(aB) + logGamma(bB) - logGamma(aB + bB);

  const steps = 400;
  const h = 1 / steps;
  let cdfA = 0;
  let probBBeatsA = 0;
  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) * h;
    const pdfA = betaPdf(x, aA, bA, logNormA) * h;
    const pdfB = betaPdf(x, aB, bB, logNormB) * h;
    // Midpoint rule: P(B > A) = integral_0^1 pdfB(x) * CDF_A(x) dx
    probBBeatsA += pdfB * (cdfA + 0.5 * pdfA);
    cdfA += pdfA;
  }
  probBBeatsA = Math.max(0, Math.min(1, probBBeatsA));

  // Wald's SPRT log-likelihood ratio against H1: p1 = p0 * (1 + mde)
  const alpha = Math.max(0.001, Math.min(0.2, params.alpha ?? 0.05));
  const betaErr = Math.max(0.01, Math.min(0.4, params.beta ?? 0.20));
  const mde = Math.max(0.02, params.minimumDetectableRelativeLift ?? 0.15);
  const upperThreshold = Math.log((1 - betaErr) / alpha);
  const lowerThreshold = Math.log(betaErr / (1 - alpha));

  const p0 = Math.max(0.005, Math.min(0.90, (cA + cB + 1) / (nA + nB + 2)));
  const p1 = Math.min(0.99, p0 * (1 + mde));
  // Effective binomial likelihood ratio on treatment observations anchored to control baseline pA_smooth
  const pBase = Math.max(0.005, Math.min(0.90, (cA + 1) / (nA + 2)));
  const pAlt = Math.min(0.99, pBase * (1 + mde));
  const llr =
    cB * Math.log(pAlt / pBase) +
    (nB - cB) * Math.log((1 - pAlt) / (1 - pBase)) -
    (cA > cB && nA === nB ? Math.abs(cA - cB) * Math.log(p1 / p0) : 0);

  let sprtDecision: SequentialAbTestResult['sprtDecision'] = 'CONTINUE_SAMPLING';
  if (llr >= upperThreshold && probBBeatsA >= 1 - alpha) {
    sprtDecision = 'WINNER_B';
  } else if (llr <= lowerThreshold || (probBBeatsA <= alpha && nA + nB >= 40)) {
    sprtDecision = 'WINNER_A';
  }

  // Welch's t-statistic on Revenue-Per-Visitor (RPV = conversion * orderValue)
  const rpvA = pA * params.controlA.meanOrderValueVnd;
  const rpvB = pB * params.treatmentB.meanOrderValueVnd;
  const sdOrderA = params.controlA.stdDevOrderValueVnd ?? params.controlA.meanOrderValueVnd * 0.35;
  const sdOrderB = params.treatmentB.stdDevOrderValueVnd ?? params.treatmentB.meanOrderValueVnd * 0.35;
  const varRpvA = pA * (1 - pA) * Math.pow(params.controlA.meanOrderValueVnd, 2) + pA * Math.pow(sdOrderA, 2);
  const varRpvB = pB * (1 - pB) * Math.pow(params.treatmentB.meanOrderValueVnd, 2) + pB * Math.pow(sdOrderB, 2);
  const seDiff = Math.sqrt(varRpvA / nA + varRpvB / nB);
  const welchRevenueTStat = seDiff > 1e-6 ? (rpvB - rpvA) / seDiff : 0;

  const recommendedAction =
    sprtDecision === 'WINNER_B'
      ? 'Triển khai phương án B cho 100% lưu lượng (đã vượt ngưỡng kiểm định tuần tự SPRT)'
      : sprtDecision === 'WINNER_A'
        ? 'Dừng phương án B, giữ nguyên phương án đối chứng A để bảo toàn biên lợi nhuận'
        : 'Tiếp tục thu thập mẫu theo rào chắn SPRT (chưa đủ bằng chứng thống kê kết luận sớm)';

  return {
    conversionRateA: Number(pA.toFixed(4)),
    conversionRateB: Number(pB.toFixed(4)),
    relativeLiftPct: Number(relativeLiftPct.toFixed(2)),
    probBBeatsA: Number(probBBeatsA.toFixed(4)),
    sprtLogLikelihoodRatio: Number(llr.toFixed(4)),
    upperThreshold: Number(upperThreshold.toFixed(4)),
    lowerThreshold: Number(lowerThreshold.toFixed(4)),
    sprtDecision,
    welchRevenueTStat: Number(welchRevenueTStat.toFixed(3)),
    recommendedAction,
  };
}

// ============================================================================
// THUẬT TOÁN 106: BỘ LỌC BLOOM BĂM KÉP KIRSCH-MITZENMACHER & TINYLFU HOT-KEY
// (Optimal Bit-Array Bloom Filter + Exponentially Decayed TinyLFU Frequency Sketch)
// ============================================================================

export interface SerializedBloomFilter {
  bitCount: number;
  hashCount: number;
  insertedCount: number;
  estimatedFalsePositiveRate: number;
  words: number[]; // Uint32 words
}

function hashPair32(key: string): [number, number] {
  const digest = createHash('sha256').update(key).digest();
  const h1 = digest.readUInt32BE(0);
  const h2 = digest.readUInt32BE(4) || 0x9e3779b9;
  return [h1, h2];
}

export function buildBloomFilter(params: {
  items: string[];
  expectedCapacity?: number;
  falsePositiveRate?: number; // default 0.01 (1%)
}): SerializedBloomFilter {
  const n = Math.max(10, params.expectedCapacity ?? Math.max(10, params.items.length));
  const p = Math.max(0.0001, Math.min(0.2, params.falsePositiveRate ?? 0.01));
  const ln2 = Math.LN2;
  const bitCount = Math.max(64, Math.ceil((-n * Math.log(p)) / (ln2 * ln2)));
  const hashCount = Math.max(1, Math.min(16, Math.round((bitCount / n) * ln2)));
  const words = new Array<number>(Math.ceil(bitCount / 32)).fill(0);

  let insertedCount = 0;
  const uniqueItems = [...new Set(params.items.map(s => s.trim()).filter(Boolean))];
  for (const item of uniqueItems) {
    const [h1, h2] = hashPair32(item);
    for (let i = 0; i < hashCount; i++) {
      const bitIdx = Number((BigInt(h1) + BigInt(i) * BigInt(h2)) % BigInt(bitCount));
      words[bitIdx >>> 5] = (words[bitIdx >>> 5] | (1 << (bitIdx & 31))) >>> 0;
    }
    insertedCount++;
  }

  const estFpr = Math.pow(1 - Math.exp((-hashCount * Math.max(1, insertedCount)) / bitCount), hashCount);
  return {
    bitCount,
    hashCount,
    insertedCount,
    estimatedFalsePositiveRate: Number(estFpr.toFixed(6)),
    words,
  };
}

export function queryBloomFilter(filter: SerializedBloomFilter, candidate: string): boolean {
  const key = (candidate ?? '').trim();
  if (!key || !filter.words.length || filter.bitCount <= 0) return false;
  const [h1, h2] = hashPair32(key);
  for (let i = 0; i < filter.hashCount; i++) {
    const bitIdx = Number((BigInt(h1) + BigInt(i) * BigInt(h2)) % BigInt(filter.bitCount));
    const word = filter.words[bitIdx >>> 5] ?? 0;
    if ((word & (1 << (bitIdx & 31))) === 0) return false;
  }
  return true;
}

export class DecayedTinyLfuTracker {
  private readonly maxEntries: number;
  private readonly halfLifeMs: number;
  private readonly table = new Map<string, { score: number; updatedAtMs: number; rawLabel: string }>();

  constructor(maxEntries = 256, halfLifeMs = 3_600_000) {
    this.maxEntries = Math.max(16, maxEntries);
    this.halfLifeMs = Math.max(10_000, halfLifeMs);
  }

  record(rawKey: string, weight = 1.0, nowMs = Date.now()): void {
    const norm = normalizeVietnameseText(rawKey);
    if (!norm || weight <= 0) return;
    const existing = this.table.get(norm);
    if (existing) {
      const elapsed = Math.max(0, nowMs - existing.updatedAtMs);
      const decay = Math.pow(0.5, elapsed / this.halfLifeMs);
      existing.score = existing.score * decay + weight;
      existing.updatedAtMs = nowMs;
      existing.rawLabel = rawKey.trim();
      return;
    }

    if (this.table.size >= this.maxEntries) {
      // Window-TinyLFU admission: evict lowest decayed-frequency victim if incoming weight >= victim decayed score
      let minKey: string | null = null;
      let minVal = Infinity;
      for (const [k, v] of this.table.entries()) {
        const decayed = v.score * Math.pow(0.5, Math.max(0, nowMs - v.updatedAtMs) / this.halfLifeMs);
        if (decayed < minVal) {
          minVal = decayed;
          minKey = k;
        }
      }
      if (minKey !== null) {
        if (weight < minVal) return; // Reject one-hit-wonder cache pollution!
        this.table.delete(minKey);
      }
    }

    this.table.set(norm, { score: weight, updatedAtMs: nowMs, rawLabel: rawKey.trim() });
  }

  topK(limit = 8, nowMs = Date.now()): { normalizedKey: string; label: string; decayedFrequency: number }[] {
    const scored: { normalizedKey: string; label: string; decayedFrequency: number }[] = [];
    for (const [k, v] of this.table.entries()) {
      const decayed = v.score * Math.pow(0.5, Math.max(0, nowMs - v.updatedAtMs) / this.halfLifeMs);
      if (decayed > 0.01) {
        scored.push({
          normalizedKey: k,
          label: v.rawLabel,
          decayedFrequency: Number(decayed.toFixed(4)),
        });
      }
    }
    return scored.sort((a, b) => b.decayedFrequency - a.decayedFrequency).slice(0, Math.max(1, limit));
  }
}

// ============================================================================
// THUẬT TOÁN 107: ĐỐI SOÁT KHỚP LỆNH CHUYỂN KHOẢN GỘP ĐA ĐƠN (SUBSET-SUM)
// (Branch-and-Bound Multi-Order Batch Bank Transfer Reconciliation)
// ============================================================================

export interface BatchOrderCandidate {
  orderId: string;
  orderCode: string;
  userId: string;
  totalVnd: number;
  createdAtMs: number;
}

export interface BatchReconciliationResult {
  matched: boolean;
  ambiguousMultipleMatches: boolean;
  matchedOrderIds: string[];
  matchedOrderCodes: string[];
  sumOrdersVnd: number;
  transferAmountVnd: number;
  deltaVnd: number;
  confidencePct: number;
}

export function reconcileBatchOrdersSubsetSum(params: {
  transferAmountVnd: number;
  narrative: string;
  candidates: BatchOrderCandidate[];
  toleranceVnd?: number;   // default 1000 VND (bank rounding / fee tolerance)
  maxSubsetSize?: number;  // default 4 orders in one combined payment
}): BatchReconciliationResult {
  const target = Math.floor(params.transferAmountVnd);
  const tol = Math.max(0, Math.min(10_000, Math.floor(params.toleranceVnd ?? 1000)));
  const maxK = Math.max(2, Math.min(5, Math.floor(params.maxSubsetSize ?? 4)));
  const upperNarrative = (params.narrative ?? '').toUpperCase();

  // Keep up to 25 most recent candidates with positive total <= target + tol
  const pool = [...params.candidates]
    .filter(c => c.totalVnd > 0 && c.totalVnd <= target + tol)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 25);

  if (pool.length < 2) {
    return {
      matched: false,
      ambiguousMultipleMatches: false,
      matchedOrderIds: [],
      matchedOrderCodes: [],
      sumOrdersVnd: 0,
      transferAmountVnd: target,
      deltaVnd: target,
      confidencePct: 0,
    };
  }

  // Sort descending by totalVnd for aggressive suffix-sum pruning in Branch-and-Bound
  pool.sort((a, b) => b.totalVnd - a.totalVnd);
  const suffixSum = new Array<number>(pool.length + 1).fill(0);
  for (let i = pool.length - 1; i >= 0; i--) {
    suffixSum[i] = suffixSum[i + 1] + pool[i].totalVnd;
  }

  interface SubsetHit {
    subset: BatchOrderCandidate[];
    sum: number;
    score: number;
  }
  const hits: SubsetHit[] = [];

  const dfs = (idx: number, chosen: BatchOrderCandidate[], currentSum: number) => {
    if (hits.length >= 12) return;
    if (chosen.length >= 2 && Math.abs(currentSum - target) <= tol) {
      const sameUser = new Set(chosen.map(c => c.userId)).size === 1;
      const codeMentions = chosen.filter(c => upperNarrative.includes(c.orderCode.toUpperCase())).length;
      const exactBonus = currentSum === target ? 25 : 10;
      const score =
        exactBonus +
        (sameUser ? 40 : 0) +
        codeMentions * 20 -
        chosen.length * 2;
      hits.push({ subset: [...chosen], sum: currentSum, score });
    }
    if (idx >= pool.length || chosen.length >= maxK) return;
    // Prune if even taking all remaining items cannot reach (target - tol)
    if (currentSum + suffixSum[idx] < target - tol) return;

    for (let i = idx; i < pool.length; i++) {
      const nxtSum = currentSum + pool[i].totalVnd;
      if (nxtSum <= target + tol) {
        chosen.push(pool[i]);
        dfs(i + 1, chosen, nxtSum);
        chosen.pop();
      }
    }
  };

  dfs(0, [], 0);

  if (hits.length === 0) {
    return {
      matched: false,
      ambiguousMultipleMatches: false,
      matchedOrderIds: [],
      matchedOrderCodes: [],
      sumOrdersVnd: 0,
      transferAmountVnd: target,
      deltaVnd: target,
      confidencePct: 0,
    };
  }

  hits.sort((a, b) => b.score - a.score);
  const best = hits[0];
  const runnerUp = hits[1];
  // Flag ambiguity if two distinct subsets tie in score without narrative code disambiguation
  const ambiguous = Boolean(runnerUp && runnerUp.score === best.score);
  const confidencePct = ambiguous ? 60 : Math.min(99, Math.max(70, best.score));

  return {
    matched: !ambiguous,
    ambiguousMultipleMatches: ambiguous,
    matchedOrderIds: best.subset.map(c => c.orderId),
    matchedOrderCodes: best.subset.map(c => c.orderCode),
    sumOrdersVnd: best.sum,
    transferAmountVnd: target,
    deltaVnd: Math.abs(target - best.sum),
    confidencePct,
  };
}

// ============================================================================
// THUẬT TOÁN 108: LUỒNG CỰC ĐẠI CHI PHÍ CỰC TIỂU ĐIỀU PHỐI ĐƠN HÀNG ĐA KHO
// (Successive Shortest Path / SPFA Residual Graph Min-Cost Max-Flow)
// ============================================================================

export interface SupplyHubNode {
  hubId: string;
  hubName: string;
  availableUnits: number;
}

export interface DemandOrderNode {
  demandId: string;
  requiredUnits: number;
}

export interface FulfillmentArcSpec {
  hubId: string;
  demandId: string;
  unitCostVnd: number;
  maxCapacityUnits?: number;
}

export interface AllocatedFulfillmentFlow {
  hubId: string;
  demandId: string;
  units: number;
  unitCostVnd: number;
  lineCostVnd: number;
}

export interface MinCostMaxFlowResult {
  totalRequiredUnits: number;
  totalFulfilledUnits: number;
  unfulfilledUnits: number;
  fillRatePct: number;
  totalMinimumCostVnd: number;
  allocations: AllocatedFulfillmentFlow[];
}

interface ResidualEdge {
  to: number;
  rev: number;
  cap: number;
  cost: number;
  hubId?: string;
  demandId?: string;
  origCap?: number;
}

export function solveMinCostMaxFlowOrderFulfillment(params: {
  hubs: SupplyHubNode[];
  demands: DemandOrderNode[];
  arcs: FulfillmentArcSpec[];
}): MinCostMaxFlowResult {
  const hubs = params.hubs.filter(h => h.availableUnits > 0);
  const demands = params.demands.filter(d => d.requiredUnits > 0);
  const totalRequiredUnits = params.demands.reduce((s, d) => s + Math.max(0, Math.floor(d.requiredUnits)), 0);

  if (hubs.length === 0 || demands.length === 0 || params.arcs.length === 0) {
    return {
      totalRequiredUnits,
      totalFulfilledUnits: 0,
      unfulfilledUnits: totalRequiredUnits,
      fillRatePct: totalRequiredUnits === 0 ? 100 : 0,
      totalMinimumCostVnd: 0,
      allocations: [],
    };
  }

  // Node indexing: 0 = Source, 1..H = Hubs, H+1..H+D = Demands, H+D+1 = Sink
  const H = hubs.length;
  const D = demands.length;
  const source = 0;
  const sink = H + D + 1;
  const V = sink + 1;

  const hubIndex = new Map(hubs.map((h, i) => [h.hubId, 1 + i]));
  const demandIndex = new Map(demands.map((d, j) => [d.demandId, 1 + H + j]));
  const graph: ResidualEdge[][] = Array.from({ length: V }, () => []);

  const addEdge = (u: number, v: number, cap: number, cost: number, hubId?: string, demandId?: string) => {
    const fwd: ResidualEdge = { to: v, rev: graph[v].length, cap, cost, hubId, demandId, origCap: cap };
    const bwd: ResidualEdge = { to: u, rev: graph[u].length, cap: 0, cost: -cost };
    graph[u].push(fwd);
    graph[v].push(bwd);
  };

  for (const h of hubs) {
    addEdge(source, hubIndex.get(h.hubId)!, Math.floor(h.availableUnits), 0);
  }
  for (const d of demands) {
    addEdge(demandIndex.get(d.demandId)!, sink, Math.floor(d.requiredUnits), 0);
  }
  for (const arc of params.arcs) {
    const u = hubIndex.get(arc.hubId);
    const v = demandIndex.get(arc.demandId);
    if (u === undefined || v === undefined) continue;
    const cap = Math.max(0, Math.floor(arc.maxCapacityUnits ?? 1_000_000));
    if (cap <= 0) continue;
    addEdge(u, v, cap, Math.round(arc.unitCostVnd), arc.hubId, arc.demandId);
  }

  let totalFlow = 0;
  let totalCost = 0;
  const INF = Number.MAX_SAFE_INTEGER;

  // Successive Shortest Path via SPFA on residual network
  while (true) {
    const dist = new Array<number>(V).fill(INF);
    const inQueue = new Array<boolean>(V).fill(false);
    const parentNode = new Array<number>(V).fill(-1);
    const parentEdge = new Array<number>(V).fill(-1);

    dist[source] = 0;
    const queue: number[] = [source];
    inQueue[source] = true;

    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      inQueue[u] = false;
      for (let ei = 0; ei < graph[u].length; ei++) {
        const e = graph[u][ei];
        if (e.cap > 0 && dist[u] + e.cost < dist[e.to]) {
          dist[e.to] = dist[u] + e.cost;
          parentNode[e.to] = u;
          parentEdge[e.to] = ei;
          if (!inQueue[e.to]) {
            queue.push(e.to);
            inQueue[e.to] = true;
          }
        }
      }
    }

    if (dist[sink] === INF) break;

    // Bottleneck capacity along shortest augmenting path
    let push = INF;
    for (let v = sink; v !== source; v = parentNode[v]) {
      const u = parentNode[v];
      const ei = parentEdge[v];
      push = Math.min(push, graph[u][ei].cap);
    }

    for (let v = sink; v !== source; v = parentNode[v]) {
      const u = parentNode[v];
      const ei = parentEdge[v];
      const edge = graph[u][ei];
      edge.cap -= push;
      graph[v][edge.rev].cap += push;
    }

    totalFlow += push;
    totalCost += push * dist[sink];
  }

  const allocations: AllocatedFulfillmentFlow[] = [];
  for (let u = 1; u <= H; u++) {
    for (const e of graph[u]) {
      if (e.hubId && e.demandId && e.origCap !== undefined) {
        const used = e.origCap - e.cap;
        if (used > 0) {
          allocations.push({
            hubId: e.hubId,
            demandId: e.demandId,
            units: used,
            unitCostVnd: e.cost,
            lineCostVnd: used * e.cost,
          });
        }
      }
    }
  }

  const unfulfilledUnits = Math.max(0, totalRequiredUnits - totalFlow);
  const fillRatePct = totalRequiredUnits > 0 ? Number(((totalFlow / totalRequiredUnits) * 100).toFixed(2)) : 100;

  return {
    totalRequiredUnits,
    totalFulfilledUnits: totalFlow,
    unfulfilledUnits,
    fillRatePct,
    totalMinimumCostVnd: totalCost,
    allocations,
  };
}

// ============================================================================
// THUẬT TOÁN 109: PHÂN BỔ HOA HỒNG ĐA CHẠM SHAPLEY VALUE CHO KOC / AFFILIATE
// (Exact Cooperative Game-Theory Shapley Value + Hamilton-Hare Exact VND Split)
// ============================================================================

export type AffiliateTouchChannel = 'OOTD_POST' | 'LOOKBOOK_PIN' | 'LIVESTREAM_HOST' | 'DIRECT_SHARE_LINK';

export interface AffiliateTouchpoint {
  kocUserId: string;
  channel: AffiliateTouchChannel;
  timestampMs: number;
  engagementQualityScore?: number; // 0.5..2.0
}

export interface ShapleyCreatorPayout {
  kocUserId: string;
  shapleySharePct: number;
  allocatedCommissionVnd: number;
  touchCount: number;
  channels: AffiliateTouchChannel[];
}

export interface ShapleyAttributionResult {
  totalCommissionPoolVnd: number;
  uniqueCreatorsCount: number;
  exactDongPreserved: boolean;
  payouts: ShapleyCreatorPayout[];
}

const CHANNEL_BASE_STRENGTH: Record<AffiliateTouchChannel, number> = {
  LIVESTREAM_HOST: 1.35,
  OOTD_POST: 1.15,
  LOOKBOOK_PIN: 1.05,
  DIRECT_SHARE_LINK: 1.0,
};

export function computeShapleyMultiTouchAttribution(params: {
  totalCommissionPoolVnd: number;
  touchpoints: AffiliateTouchpoint[];
  conversionTimestampMs?: number;
  halfLifeHours?: number; // recency half-life, default 72h
}): ShapleyAttributionResult {
  const poolVnd = Math.max(0, Math.floor(params.totalCommissionPoolVnd));
  if (poolVnd === 0 || params.touchpoints.length === 0) {
    return { totalCommissionPoolVnd: poolVnd, uniqueCreatorsCount: 0, exactDongPreserved: true, payouts: [] };
  }

  const convTs = params.conversionTimestampMs ?? Math.max(...params.touchpoints.map(t => t.timestampMs));
  const halfLifeMs = Math.max(1, params.halfLifeHours ?? 72) * 3_600_000;

  // Aggregate effective coalition strength per distinct KOC (cap at 10 distinct KOCs for exact 2^N coalition evaluation)
  const creatorMap = new Map<string, { strength: number; touchCount: number; channels: Set<AffiliateTouchChannel> }>();
  for (const tp of params.touchpoints) {
    const ageMs = Math.max(0, convTs - tp.timestampMs);
    const recencyDecay = Math.pow(0.5, ageMs / halfLifeMs);
    const quality = Math.max(0.5, Math.min(2.0, tp.engagementQualityScore ?? 1.0));
    const contrib = CHANNEL_BASE_STRENGTH[tp.channel] * recencyDecay * quality;

    const cur = creatorMap.get(tp.kocUserId) ?? { strength: 0, touchCount: 0, channels: new Set() };
    // Diminishing returns for repeated self-touches by the same KOC: log1p compression
    cur.strength += contrib;
    cur.touchCount++;
    cur.channels.add(tp.channel);
    creatorMap.set(tp.kocUserId, cur);
  }

  const creators = [...creatorMap.entries()]
    .map(([kocUserId, info]) => ({
      kocUserId,
      effectiveWeight: Math.log1p(info.strength),
      touchCount: info.touchCount,
      channels: [...info.channels],
      hasDiscoveryChannel: info.channels.has('OOTD_POST') || info.channels.has('LIVESTREAM_HOST') || info.channels.has('LOOKBOOK_PIN'),
      hasClosingChannel: info.channels.has('DIRECT_SHARE_LINK'),
    }))
    .sort((a, b) => b.effectiveWeight - a.effectiveWeight)
    .slice(0, 10);

  const n = creators.length;
  // Characteristic function v(S): saturating conversion lift 1 - exp(-sum_{i in S} w_i) + synergy bonus when S spans both discovery & closing!
  const totalMask = 1 << n;
  const coalitionVal = new Float64Array(totalMask);
  for (let mask = 1; mask < totalMask; mask++) {
    let wSum = 0;
    let hasDisc = false;
    let hasClose = false;
    let count = 0;
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        wSum += creators[i].effectiveWeight;
        if (creators[i].hasDiscoveryChannel) hasDisc = true;
        if (creators[i].hasClosingChannel) hasClose = true;
        count++;
      }
    }
    const synergy = count >= 2 && hasDisc && hasClose ? 1.18 : 1.0;
    coalitionVal[mask] = (1 - Math.exp(-wSum)) * synergy;
  }

  // Precompute factorials 0!..n!
  const fact = new Array<number>(n + 1).fill(1);
  for (let i = 2; i <= n; i++) fact[i] = fact[i - 1] * i;
  const nFact = fact[n];

  const shapleyRaw = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    const bit = 1 << i;
    for (let mask = 0; mask < totalMask; mask++) {
      if ((mask & bit) !== 0) continue;
      // Popcount |S|
      let sSize = 0;
      for (let m = mask; m > 0; m &= m - 1) sSize++;
      const weight = (fact[sSize] * fact[n - sSize - 1]) / nFact;
      const marginal = coalitionVal[mask | bit] - coalitionVal[mask];
      shapleyRaw[i] += weight * Math.max(0, marginal);
    }
  }

  const totalShapley = shapleyRaw.reduce((a, b) => a + b, 0);
  const scaledWeights = totalShapley > 1e-9
    ? shapleyRaw.map(v => Math.max(1, Math.round((v / totalShapley) * 100_000)))
    : creators.map(() => 1);
  const weightSum = scaledWeights.reduce((a, b) => a + b, 0);

  // Exact integer VND allocation using Hamilton-Hare largest remainder
  const exactVnd = poolVnd <= weightSum
    ? allocateDiscount(poolVnd, scaledWeights)
    : (() => {
        const base = Math.floor(poolVnd / weightSum);
        const rem = poolVnd - base * weightSum;
        const remAlloc = allocateDiscount(rem, scaledWeights);
        return scaledWeights.map((w, idx) => base * w + remAlloc[idx]);
      })();

  const payouts: ShapleyCreatorPayout[] = creators.map((c, idx) => ({
    kocUserId: c.kocUserId,
    shapleySharePct: Number(((scaledWeights[idx] / weightSum) * 100).toFixed(2)),
    allocatedCommissionVnd: exactVnd[idx],
    touchCount: c.touchCount,
    channels: c.channels,
  }));

  const distributedSum = payouts.reduce((s, p) => s + p.allocatedCommissionVnd, 0);
  return {
    totalCommissionPoolVnd: poolVnd,
    uniqueCreatorsCount: n,
    exactDongPreserved: distributedSum === poolVnd,
    payouts,
  };
}

// ============================================================================
// THUẬT TOÁN 110: PHÁT HIỆN ĐỘT BIẾN CHUỖI THỜI GIAN CUSUM TRÊN MAD BỀN VỮNG
// (Page's Two-Sided Tabular CUSUM over Median-Absolute-Deviation Residuals)
// ============================================================================

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface CusumAnomalyPoint {
  index: number;
  label: string;
  value: number;
  zRobust: number;
  cusumPos: number;
  cusumNeg: number;
  direction: 'SPIKE_UP' | 'DROP_DOWN';
}

export interface CusumMonitorResult {
  baselineMedian: number;
  robustSigmaMad: number;
  thresholdH: number;
  slackK: number;
  regimeStatus: 'STABLE' | 'UPWARD_SHIFT' | 'DOWNWARD_DROP' | 'VOLATILE_BOTH';
  anomalies: CusumAnomalyPoint[];
}

function medianOfSorted(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
}

export function detectTimeSeriesCusumAnomalies(params: {
  series: TimeSeriesPoint[];
  slackK?: number;     // allowance k in sigma units, default 0.5
  thresholdH?: number; // decision interval h in sigma units, default 4.0
}): CusumMonitorResult {
  const pts = params.series.filter(p => Number.isFinite(p.value));
  const k = Math.max(0.1, params.slackK ?? 0.5);
  const h = Math.max(1.5, params.thresholdH ?? 4.0);

  if (pts.length < 3) {
    return {
      baselineMedian: pts[0]?.value ?? 0,
      robustSigmaMad: 0,
      thresholdH: h,
      slackK: k,
      regimeStatus: 'STABLE',
      anomalies: [],
    };
  }

  const sortedVals = [...pts.map(p => p.value)].sort((a, b) => a - b);
  const med = medianOfSorted(sortedVals);
  const absDevs = pts.map(p => Math.abs(p.value - med)).sort((a, b) => a - b);
  const mad = medianOfSorted(absDevs);
  // Consistent normal scale factor 1.4826 * MAD; fallback to 5% of |median| + 1 when series is nearly constant
  const robustSigma = Math.max(1.4826 * mad, Math.abs(med) * 0.05, 1e-3);

  let sPos = 0;
  let sNeg = 0;
  let hasUp = false;
  let hasDown = false;
  const anomalies: CusumAnomalyPoint[] = [];

  for (let i = 0; i < pts.length; i++) {
    const z = (pts[i].value - med) / robustSigma;
    sPos = Math.max(0, sPos + z - k);
    sNeg = Math.max(0, sNeg - z - k);

    if (sPos >= h) {
      hasUp = true;
      anomalies.push({
        index: i,
        label: pts[i].label,
        value: pts[i].value,
        zRobust: Number(z.toFixed(3)),
        cusumPos: Number(sPos.toFixed(3)),
        cusumNeg: Number(sNeg.toFixed(3)),
        direction: 'SPIKE_UP',
      });
      sPos = h * 0.5; // partial reset after alarm to avoid permanent saturation
    } else if (sNeg >= h) {
      hasDown = true;
      anomalies.push({
        index: i,
        label: pts[i].label,
        value: pts[i].value,
        zRobust: Number(z.toFixed(3)),
        cusumPos: Number(sPos.toFixed(3)),
        cusumNeg: Number(sNeg.toFixed(3)),
        direction: 'DROP_DOWN',
      });
      sNeg = h * 0.5;
    }
  }

  const regimeStatus: CusumMonitorResult['regimeStatus'] =
    hasUp && hasDown ? 'VOLATILE_BOTH' :
    hasUp ? 'UPWARD_SHIFT' :
    hasDown ? 'DOWNWARD_DROP' : 'STABLE';

  return {
    baselineMedian: Number(med.toFixed(2)),
    robustSigmaMad: Number(robustSigma.toFixed(2)),
    thresholdH: h,
    slackK: k,
    regimeStatus,
    anomalies,
  };
}

// ============================================================================
// THUẬT TOÁN 111: DẤU VÂN TAY VĂN BẢN SIMHASH 64-BIT, HAMMING & 4-BAND LSH
// (Charikar 64-Bit Vietnamese SimHash + Popcount Hamming + Pigeonhole LSH)
// ============================================================================

export function computeVietnameseSimHash64(text: string): string {
  const norm = normalizeVietnameseText(text);
  if (!norm) return '0000000000000000';

  const tokens = norm.split(' ').filter(Boolean);
  const features: { feat: string; weight: number }[] = [];
  for (let i = 0; i < tokens.length; i++) {
    features.push({ feat: `1g:${tokens[i]}`, weight: 1 });
    if (i + 1 < tokens.length) {
      features.push({ feat: `2g:${tokens[i]}_${tokens[i + 1]}`, weight: 2 });
    }
    if (i + 2 < tokens.length) {
      features.push({ feat: `3g:${tokens[i]}_${tokens[i + 1]}_${tokens[i + 2]}`, weight: 3 });
    }
  }

  const accum = new Int32Array(64);
  for (const { feat, weight } of features) {
    const digest = createHash('sha256').update(feat).digest();
    const hi = digest.readUInt32BE(0);
    const lo = digest.readUInt32BE(4);
    for (let bit = 0; bit < 32; bit++) {
      accum[bit] += (lo & (1 << bit)) !== 0 ? weight : -weight;
      accum[32 + bit] += (hi & (1 << bit)) !== 0 ? weight : -weight;
    }
  }

  let fp = 0n;
  for (let bit = 0; bit < 64; bit++) {
    if (accum[bit] > 0) {
      fp |= 1n << BigInt(bit);
    }
  }
  return fp.toString(16).padStart(16, '0');
}

export function hammingDistanceSimHash64(hexA: string, hexB: string): number {
  const a = BigInt(`0x${hexA.padStart(16, '0').slice(-16)}`);
  const b = BigInt(`0x${hexB.padStart(16, '0').slice(-16)}`);
  let x = a ^ b;
  let dist = 0;
  while (x > 0n) {
    x &= x - 1n;
    dist++;
  }
  return dist;
}

export interface NearDuplicatePair {
  idA: string;
  idB: string;
  authorIdA?: string;
  authorIdB?: string;
  hammingDistance: number;
  estimatedSimilarityPct: number;
}

export function detectNearDuplicateTextsSimHash(params: {
  documents: { id: string; text: string; authorId?: string }[];
  maxHammingDistance?: number; // default 8 out of 64 bits (~87.5% bit agreement)
}): { totalDocuments: number; duplicatePairs: NearDuplicatePair[] } {
  const maxDist = Math.max(0, Math.min(20, params.maxHammingDistance ?? 8));
  const docs = params.documents.filter(d => normalizeVietnameseText(d.text).length >= 8).slice(0, 500);
  const hashes = docs.map(d => ({ ...d, simhash: computeVietnameseSimHash64(d.text) }));

  // 4-band LSH index (each band = 4 hex chars = 16 bits); exact Pigeonhole guarantee for maxDist <= 3,
  // plus sliding 2-char sub-band buckets for high-recall candidate generation up to maxDist <= 12
  const buckets = new Map<string, number[]>();
  for (let idx = 0; idx < hashes.length; idx++) {
    const h = hashes[idx].simhash;
    for (let b = 0; b < 8; b++) {
      const bandKey = `${b}:${h.slice(b * 2, b * 2 + 2)}`;
      let list = buckets.get(bandKey);
      if (!list) {
        list = [];
        buckets.set(bandKey, list);
      }
      list.push(idx);
    }
  }

  const checkedPairs = new Set<string>();
  const duplicatePairs: NearDuplicatePair[] = [];

  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const idxA = Math.min(list[i], list[j]);
        const idxB = Math.max(list[i], list[j]);
        const pairKey = `${idxA}:${idxB}`;
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        const dist = hammingDistanceSimHash64(hashes[idxA].simhash, hashes[idxB].simhash);
        if (dist <= maxDist) {
          duplicatePairs.push({
            idA: hashes[idxA].id,
            idB: hashes[idxB].id,
            authorIdA: hashes[idxA].authorId,
            authorIdB: hashes[idxB].authorId,
            hammingDistance: dist,
            estimatedSimilarityPct: Number((((64 - dist) / 64) * 100).toFixed(2)),
          });
        }
      }
    }
  }

  return {
    totalDocuments: docs.length,
    duplicatePairs: duplicatePairs.sort((a, b) => a.hammingDistance - b.hammingDistance),
  };
}

// ============================================================================
// THUẬT TOÁN 112: TỐI ƯU DANH MỤC NHẬP HÀNG THEO MARKOWITZ MEAN-VARIANCE & HHI
// (Risk-Adjusted Marginal Utility Assortment Portfolio & HHI Diversification)
// ============================================================================

export interface CandidateAssortmentSku {
  variantId: string;
  sku: string;
  categoryId: string;
  unitRestockCostVnd: number;
  expectedNetMarginPerUnitVnd: number;
  weeklyDemandMean: number;
  weeklyDemandStdDev: number;
  maxRestockUnits?: number;
}

export interface AllocatedAssortmentLine {
  variantId: string;
  sku: string;
  categoryId: string;
  recommendedUnits: number;
  capitalAllocatedVnd: number;
  expectedProfitVnd: number;
  riskAdjustedUtility: number;
}

export interface AssortmentPortfolioResult {
  budgetVnd: number;
  capitalDeployedVnd: number;
  remainingCashVnd: number;
  expectedTotalProfitVnd: number;
  portfolioRiskStdVnd: number;
  portfolioSharpeIndex: number;
  categoryHhiIndex: number; // 0..10000 (lower = better diversified)
  allocations: AllocatedAssortmentLine[];
}

export function optimizeShopAssortmentPortfolio(params: {
  budgetVnd: number;
  riskAversionLambda?: number; // default 0.35
  candidates: CandidateAssortmentSku[];
}): AssortmentPortfolioResult {
  const budget = Math.max(0, Math.floor(params.budgetVnd));
  const lambda = Math.max(0.01, Math.min(2.0, params.riskAversionLambda ?? 0.35));
  const valid = params.candidates.filter(
    c => c.unitRestockCostVnd >= 1000 && c.expectedNetMarginPerUnitVnd > 0 && c.weeklyDemandMean > 0
  );

  if (budget === 0 || valid.length === 0) {
    return {
      budgetVnd: budget,
      capitalDeployedVnd: 0,
      remainingCashVnd: budget,
      expectedTotalProfitVnd: 0,
      portfolioRiskStdVnd: 0,
      portfolioSharpeIndex: 0,
      categoryHhiIndex: 0,
      allocations: [],
    };
  }

  const chosenUnits = new Array<number>(valid.length).fill(0);
  const catSpend = new Map<string, number>();
  let spent = 0;

  // Iterative Marginal Risk-Adjusted Bang-per-Buck:
  // Marginal expected sale probability diminishes past mean + k*std (newsvendor saturation),
  // plus quadratic category concentration covariance penalty (Markowitz intra-category rho = 0.45).
  while (true) {
    let bestIdx = -1;
    let bestMarginalRatio = 0;

    for (let i = 0; i < valid.length; i++) {
      const c = valid[i];
      const curQ = chosenUnits[i];
      const capMax = Math.max(1, Math.min(100, c.maxRestockUnits ?? Math.ceil(c.weeklyDemandMean * 4 + 4)));
      if (curQ >= capMax || spent + c.unitRestockCostVnd > budget) continue;

      // Approximate probability that (curQ + 1)-th unit sells within 3-week horizon
      const horizonMean = c.weeklyDemandMean * 3;
      const horizonStd = Math.max(0.5, c.weeklyDemandStdDev * Math.sqrt(3));
      const z = (curQ + 1 - horizonMean) / horizonStd;
      // Logistic normal tail survival P(Demand >= curQ + 1)
      const sellProb = 1 / (1 + Math.exp(1.702 * z));

      const expectedGain = sellProb * c.expectedNetMarginPerUnitVnd - (1 - sellProb) * c.unitRestockCostVnd * 0.15;
      const unitRiskPenalty = lambda * horizonStd * c.unitRestockCostVnd * 0.04;
      const curCatShare = spent > 0 ? (catSpend.get(c.categoryId) ?? 0) / spent : 0;
      const corrPenalty = lambda * curCatShare * c.expectedNetMarginPerUnitVnd * 0.45;

      const netMarginalUtility = expectedGain - unitRiskPenalty - corrPenalty;
      const ratio = netMarginalUtility / c.unitRestockCostVnd;

      if (netMarginalUtility > 0 && ratio > bestMarginalRatio) {
        bestMarginalRatio = ratio;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;
    const picked = valid[bestIdx];
    chosenUnits[bestIdx]++;
    spent += picked.unitRestockCostVnd;
    catSpend.set(picked.categoryId, (catSpend.get(picked.categoryId) ?? 0) + picked.unitRestockCostVnd);
  }

  let expectedTotalProfitVnd = 0;
  let totalVarianceVnd2 = 0;
  const allocations: AllocatedAssortmentLine[] = [];

  for (let i = 0; i < valid.length; i++) {
    const q = chosenUnits[i];
    if (q <= 0) continue;
    const c = valid[i];
    const horizonMean = c.weeklyDemandMean * 3;
    const expectedSold = Math.min(q, horizonMean);
    const expProfit = Math.round(expectedSold * c.expectedNetMarginPerUnitVnd);
    const stdVnd = Math.min(q, Math.max(0.5, c.weeklyDemandStdDev * Math.sqrt(3))) * c.expectedNetMarginPerUnitVnd;
    expectedTotalProfitVnd += expProfit;
    totalVarianceVnd2 += stdVnd * stdVnd;

    allocations.push({
      variantId: c.variantId,
      sku: c.sku,
      categoryId: c.categoryId,
      recommendedUnits: q,
      capitalAllocatedVnd: q * c.unitRestockCostVnd,
      expectedProfitVnd: expProfit,
      riskAdjustedUtility: Math.round(expProfit - lambda * stdVnd),
    });
  }

  const portfolioRiskStdVnd = Math.round(Math.sqrt(totalVarianceVnd2));
  const portfolioSharpeIndex = portfolioRiskStdVnd > 0
    ? Number((expectedTotalProfitVnd / portfolioRiskStdVnd).toFixed(3))
    : expectedTotalProfitVnd > 0 ? 5.0 : 0;

  let hhi = 0;
  if (spent > 0) {
    for (const cs of catSpend.values()) {
      const sharePct = (cs / spent) * 100;
      hhi += sharePct * sharePct;
    }
  }

  return {
    budgetVnd: budget,
    capitalDeployedVnd: spent,
    remainingCashVnd: budget - spent,
    expectedTotalProfitVnd,
    portfolioRiskStdVnd,
    portfolioSharpeIndex,
    categoryHhiIndex: Math.round(hhi),
    allocations: allocations.sort((a, b) => b.capitalAllocatedVnd - a.capitalAllocatedVnd),
  };
}

// ============================================================================
// THUẬT TOÁN 113: LẬP LỊCH THỬ LẠI OUTBOX VỚI DETERMINISTIC JITTER & DEAD-LETTER
// (Exponential Backoff with Deterministic Hash Jitter & Poison Quarantine)
// ============================================================================

export interface OutboxEventCandidate {
  id: string;
  kind: string;
  attempts: number;
  createdAtMs: number;
}

export interface OutboxScheduleDecision {
  id: string;
  kind: string;
  attempts: number;
  status: 'READY_TO_DISPATCH' | 'BACKOFF_WAITING' | 'DEAD_LETTER_QUARANTINED';
  backoffDelayMs: number;
  eligibleAtMs: number;
}

export interface OutboxSchedulePlan {
  circuitState: 'CLOSED_HEALTHY' | 'HALF_OPEN_DEGRADED' | 'OPEN_BACKPRESSURE';
  readyIds: string[];
  waitingCount: number;
  deadLetterCount: number;
  decisions: OutboxScheduleDecision[];
}

export function planOutboxRetryAndCircuitSchedule(params: {
  events: OutboxEventCandidate[];
  nowMs?: number;
  baseDelayMs?: number; // default 2,000ms
  maxDelayMs?: number;  // default 300,000ms (5m)
  maxAttempts?: number; // default 5
}): OutboxSchedulePlan {
  const nowMs = params.nowMs ?? Date.now();
  const baseMs = Math.max(100, params.baseDelayMs ?? 2000);
  const capMs = Math.max(baseMs, params.maxDelayMs ?? 300_000);
  const maxAttempts = Math.max(1, params.maxAttempts ?? 5);

  const decisions: OutboxScheduleDecision[] = [];
  const readyIds: string[] = [];
  let waitingCount = 0;
  let deadLetterCount = 0;

  for (const ev of params.events) {
    if (ev.attempts >= maxAttempts) {
      deadLetterCount++;
      decisions.push({
        id: ev.id,
        kind: ev.kind,
        attempts: ev.attempts,
        status: 'DEAD_LETTER_QUARANTINED',
        backoffDelayMs: capMs,
        eligibleAtMs: ev.createdAtMs + capMs,
      });
      continue;
    }

    if (ev.attempts === 0) {
      readyIds.push(ev.id);
      decisions.push({
        id: ev.id,
        kind: ev.kind,
        attempts: 0,
        status: 'READY_TO_DISPATCH',
        backoffDelayMs: 0,
        eligibleAtMs: ev.createdAtMs,
      });
      continue;
    }

    // Equal-Jitter Exponential Backoff using deterministic SHA-256 fraction u in [0, 1)
    const expCap = Math.min(capMs, baseMs * Math.pow(2, ev.attempts - 1));
    const uInt = createHash('sha256').update(`${ev.id}:${ev.attempts}`).digest().readUInt32BE(0);
    const u = uInt / 0x100000000;
    const jitteredDelay = Math.round(expCap * (0.5 + 0.5 * u));
    const eligibleAtMs = ev.createdAtMs + jitteredDelay;

    if (nowMs >= eligibleAtMs) {
      readyIds.push(ev.id);
      decisions.push({
        id: ev.id,
        kind: ev.kind,
        attempts: ev.attempts,
        status: 'READY_TO_DISPATCH',
        backoffDelayMs: jitteredDelay,
        eligibleAtMs,
      });
    } else {
      waitingCount++;
      decisions.push({
        id: ev.id,
        kind: ev.kind,
        attempts: ev.attempts,
        status: 'BACKOFF_WAITING',
        backoffDelayMs: jitteredDelay,
        eligibleAtMs,
      });
    }
  }

  const total = params.events.length;
  const deadRatio = total > 0 ? deadLetterCount / total : 0;
  const circuitState: OutboxSchedulePlan['circuitState'] =
    deadLetterCount >= 10 || deadRatio >= 0.5 ? 'OPEN_BACKPRESSURE' :
    deadLetterCount >= 1 || waitingCount >= 10 ? 'HALF_OPEN_DEGRADED' : 'CLOSED_HEALTHY';

  return {
    circuitState,
    readyIds,
    waitingCount,
    deadLetterCount,
    decisions,
  };
}
