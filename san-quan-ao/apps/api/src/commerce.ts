import { BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Inject, Injectable, NotFoundException, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { QuoteData, QuoteShop } from '@mac/contracts';
import { Auth, Authed, SignedIn } from './auth';
import { Db, serial, Tx } from './db';
import { addressInput, allocateDiscount, hash, id, json } from './common';
import {
  generateVietQrEmvCoPayload,
  calculateLogisticsPacking,
  evaluateOrderRisk,
  evaluateOrderVelocityAndAnomaly,
  evaluateCustomerRfmAndClv,
  checkVoucherEligibilityForCustomer,
  inferVoucherRequiredTier,
  buildAddressSybilFingerprint,
  computeLedgerMerkleAudit,
  verifyMerkleInclusionProof,
  reconcileBatchOrdersSubsetSum,
  optimizeCourierMilkRunRouting,
  solveMinCostMaxFlowOrderFulfillment,
  verifyEscrowSettlement,
  solveVoucherKnapsack,
  reconcileBankTransferNapasIpn,
  calculateLogisticsDeliveryEta,
  calculateBespokeCriticalPathSchedule,
  calculateHubAndSpokeConsolidation,
  createAuditChainBlock,
  verifyAuditChainIntegrity,
  calculateArtisanQueueLeadTime,
  safeBpsCalculation,
  bankersRound,
  BespokeCraftStage,
  evaluateProofOfDeliverySecurityAndWeight,
  calculateWeatherAdaptiveRerouteBuffer,
  calculateGreenMileEvTelemetryPassport,
  arbitrateEscrowDisputeSettlement,
  calculateToilePostureCorrection,
  calculateCuttingMarkerYield,
  calculateFittingValetDispatch,
  calculateEscrow3TierSettlement,
  evaluateBayesianReviewCredibility,
  detectAstroturfingAndCollusionReviews,
  optimizeReverseLogisticsDoorstepRouting,
  evaluateRmaWearAndTearRestitution,
  curateTactileFabricSwatchBox,
  calculateSwatchToBespokeRebateAndConversion,
  packHomeFittingValetSuitcase,
  mapFittingCorrectionBiomechanicalRevise,
  calculateSafetyStockAndReorderPoint,
  allocateMultiChannelStockRationing,
  forecastPreorderBacklogPromisedDeliveryDate,
  optimizeMultiHubTransshipmentConsolidation,
  calculateDeadstockFabricDecayMarkdown,
  optimizeRemnantPatternUpcyclingNest,
  evaluateArtisanFairTradePriceFloor,
  auditAtelierEprCircularityIndex,
  scheduleMultiSkillArtisanWorkforce,
  detectTheoryOfConstraintsBottleneck,
  calculateErgonomicFatigueDecayCurve,
  arbitratePriorityRushBespokeSurcharge,
} from './algorithms';

const orderInclude = { shops: { include: { shop: { select: { name: true } }, items: { include: { reviews: { select: { id: true, rating: true } } } }, shipment: true }, orderBy: { shopId: 'asc' as const } } };

function quotePricingFingerprint(data: QuoteData): string {
  return hash(JSON.stringify({
    shops: data.shops.map(s => ({
      shopId: s.shopId,
      subtotal: s.subtotal,
      discount: s.discount,
      shipping: s.shipping,
      total: s.total,
      items: s.items.map(it => ({
        variantId: it.variantId,
        price: it.price,
        quantity: it.quantity,
        policy: it.policy,
      })),
    })),
    platformDiscount: data.platformDiscount ?? 0,
    shippingDiscount: data.shippingDiscount ?? 0,
    coinDiscount: data.coinDiscount ?? 0,
    tradeInCode: data.tradeInCode ?? null,
    total: data.total,
    address: data.address,
  }));
}
@Injectable()
export class Commerce {
  constructor(@Inject(Db) private db: Db) {}
  async price(
    tx: Tx,
    userId: string,
    addressId: string,
    codes: Record<string, string>,
    deliverySlot?: string,
    ecoPackaging?: boolean,
  ): Promise<QuoteData> {
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ của bạn');
    const lines = await tx.cartLine.findMany({
      where: { userId }, orderBy: { variantId: 'asc' },
      include: { variant: { include: {
        inventory: true,
        product: { include: { shop: true, images: { orderBy: { position: 'asc' } }, sizeCharts: { orderBy: { version: 'desc' }, take: 1 } } },
      } } },
    });
    if (!lines.length) throw new ConflictException('Giỏ hàng đang trống');
    if (lines.length > 50) throw new ConflictException('Mỗi lần đặt tối đa 50 dòng');
    const groups = new Map<string, QuoteShop>();
    for (const line of lines) {
      const v = line.variant, p = v.product, inv = v.inventory;
      if (!v.active || p.status !== 'ACTIVE' || p.shop.status !== 'APPROVED') throw new ConflictException({ code: 'ITEM_UNAVAILABLE', message: `${p.name} đã ngừng bán`, variantId: v.id });
      if (!inv || inv.onHand - inv.reserved < line.quantity) throw new ConflictException({ code: 'OUT_OF_STOCK', message: `${p.name} / ${v.color} / ${v.size} không đủ hàng`, variantId: v.id, available: inv ? inv.onHand - inv.reserved : 0 });
      if (!groups.has(v.shopId)) groups.set(v.shopId, { shopId: v.shopId, shopName: p.shop.name, items: [], subtotal: 0, discount: 0, shipping: 30000, total: 0 });
      const group = groups.get(v.shopId)!;
      group.items.push({ variantId: v.id, productId: p.id, shopId: v.shopId, name: p.name, sku: v.sku, color: v.color, size: v.size, price: v.price, quantity: line.quantity, image: (p.images.find(i => i.color === v.color) ?? p.images[0])?.url ?? '', sizeChart: p.sizeCharts[0] ?? null, policy: p.shop.returnPolicy });
      group.subtotal += v.price * line.quantity;
    }
    const hasVoucherCodes = Object.keys(codes).some(k => !k.startsWith('_') && Boolean(codes[k]));
    let loyaltyCtx: { isNewMemberEligible: boolean; eligibleVoucherTiers: string[] } | null = null;
    if (hasVoucherCodes) {
      const priorOrders = await tx.order.findMany({
        where: { userId },
        select: { id: true, total: true, createdAt: true, shops: { select: { status: true } } },
        take: 100,
      });
      const rfm = evaluateCustomerRfmAndClv({
        userId,
        accountCreatedAtMs: Date.now() - 86_400_000,
        orders: priorOrders.map(o => {
          const st = o.shops.map(s => s.status);
          const allCancelled = st.length > 0 && st.every(x => x === 'CANCELLED');
          const anyReturned = st.some(x => x === 'RETURNED');
          const allDelivered = st.length > 0 && st.every(x => x === 'DELIVERED');
          return {
            orderId: o.id,
            createdAtMs: o.createdAt.getTime(),
            netAmountVnd: o.total,
            status: allCancelled ? 'CANCELLED' : anyReturned ? 'RETURNED' : allDelivered ? 'COMPLETED' : 'ACTIVE',
          };
        }),
      });
      loyaltyCtx = { isNewMemberEligible: rfm.isNewMemberEligible, eligibleVoucherTiers: rfm.eligibleVoucherTiers };
    }
    for (const group of groups.values()) {
      const code = codes[group.shopId];
      if (code) {
        const voucher = await tx.voucher.findUnique({ where: { shopId_code: { shopId: group.shopId, code } } });
        if (!voucher || voucher.expiresAt <= new Date() || voucher.uses >= voucher.maxUses || group.subtotal < voucher.minimum) throw new ConflictException(`Mã ${code} không áp dụng được cho ${group.shopName}`);
        if (loyaltyCtx) {
          const tierCheck = checkVoucherEligibilityForCustomer({
            voucherCode: voucher.code,
            isNewMemberEligible: loyaltyCtx.isNewMemberEligible,
            eligibleVoucherTiers: loyaltyCtx.eligibleVoucherTiers,
          });
          if (!tierCheck.eligible) throw new ConflictException(tierCheck.reason || `Mã ${code} không phù hợp hạng thành viên hiện tại`);
        }
        group.discount = Math.min(voucher.amount, group.subtotal);
      }
      group.total = group.subtotal - group.discount + group.shipping;
    }
    for (const shopId of Object.keys(codes)) {
      if (!['_tradeIn', '_freeship', '_coins'].includes(shopId) && !groups.has(shopId)) {
        throw new ConflictException('Voucher không thuộc shop trong giỏ');
      }
    }
    const shops = [...groups.values()].sort((a, b) => a.shopId.localeCompare(b.shopId));
    const preTotal = shops.reduce((s, g) => s + g.total, 0);
    let platformDiscount = 0;
    const tradeInCode = codes._tradeIn?.trim().toUpperCase();
    if (tradeInCode) {
      const ti = await tx.tradeInRequest.findFirst({ where: { voucherCode: tradeInCode, userId, status: 'APPROVED', redeemedOrderId: null } });
      if (!ti || !ti.finalValue) throw new ConflictException(`Mã Trade-In ${tradeInCode} không hợp lệ hoặc đã sử dụng`);
      platformDiscount = Math.min(ti.finalValue, preTotal);
    }
    let shippingDiscount = 0;
    const applyFreeship = codes._freeship === 'true' || codes._freeship === '1';
    if (applyFreeship) {
      const totalShipping = shops.reduce((s, g) => s + g.shipping, 0);
      shippingDiscount = Math.min(30000, totalShipping);
    }
    let coinDiscount = 0;
    const rawCoins = Number(codes._coins ?? 0);
    const coinsRequested = Number.isFinite(rawCoins) && rawCoins > 0 ? Math.floor(rawCoins) : 0;
    if (coinsRequested > 0) {
      const maxCoins = Math.min(50000, Math.round(preTotal * 0.1));
      coinDiscount = Math.min(coinsRequested, maxCoins, Math.max(0, preTotal - platformDiscount - shippingDiscount));
    }
    const finalTotal = Math.max(0, preTotal - platformDiscount - shippingDiscount - coinDiscount);

    // 1. Phân bổ đóng gói sinh thái & gom tuyến bưu tá xe điện (Best-Fit Decreasing)
    const physicalItems = lines.map(line => ({
      variantId: line.variant.id,
      name: line.variant.product.name,
      shopId: line.variant.shopId,
      shopName: line.variant.product.shop.name,
      quantity: line.quantity,
      estimatedWeightGrams: 350,
      estimatedVolumeCm3: 1200,
    }));
    const logisticsPacking = calculateLogisticsPacking(physicalItems, true);

    // 2. Đánh giá rủi ro gian lận / bom hàng đa tiêu chí (MCDA + EWMA Z-Score Velocity Anomaly)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const oneHourAgo = new Date(Date.now() - 3600000);
    const oneDayAgo = new Date(Date.now() - 86400000);
    const [recentOrders, recentCancellationsCount] = await Promise.all([
      tx.order.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true, address: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      tx.shopOrder.count({
        where: { order: { userId }, status: 'CANCELLED', createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);
    const isNewAddress = recentOrders.length > 0
      ? !recentOrders.some(o => {
          const a = o.address as { line?: string; province?: string } | null;
          return a?.line === address.line && a?.province === address.province;
        })
      : false;
    const velocityAnomaly = evaluateOrderVelocityAndAnomaly({
      currentOrderTotalVnd: finalTotal,
      historicalOrderTotalsVnd: recentOrders.map(o => o.total),
      ordersInLast1Hour: recentOrders.filter(o => o.createdAt >= oneHourAgo).length,
      ordersInLast24Hours: recentOrders.filter(o => o.createdAt >= oneDayAgo).length,
      recentCancellations30d: recentCancellationsCount,
      totalOrders30d: recentOrders.length,
      isNewAddress,
      distinctShopsCount: groups.size,
    });

    const riskAssessment = evaluateOrderRisk({
      orderTotal: finalTotal,
      paymentMethod: 'VIETQR',
      itemCount: lines.reduce((s, l) => s + l.quantity, 0),
      shopCount: groups.size,
      recentCancellationsCount,
      isNewAddress,
      hasBespokeItem: lines.some(l => l.variant.product.name.toLowerCase().includes('may đo') || l.variant.product.name.toLowerCase().includes('rập')),
    });
    const combinedRiskRationale = velocityAnomaly.signals.length
      ? `${riskAssessment.rationale} | Anomaly(${velocityAnomaly.riskLevel}, Z=${velocityAnomaly.spendZScore}): ${velocityAnomaly.signals.join(', ')}`
      : riskAssessment.rationale;

    // 3. Ước tính lịch giao hàng & lộ trình logistics đa chặng (Haversine Multi-Hub Delivery Window)
    const validDeliverySlot = deliverySlot === 'MORNING' || deliverySlot === 'AFTERNOON' || deliverySlot === 'EVENING' ? deliverySlot : 'AFTERNOON';
    const deliveryEta = calculateLogisticsDeliveryEta({
      originProvince: 'Hà Nội',
      destinationProvince: address.province || 'Hà Nội',
      deliverySlot: validDeliverySlot,
    });

    // 4. Tối ưu hóa gom tuyến đa xưởng may Hub-and-Spoke
    const workshopOrigins = shops.map(s => ({
      shopId: s.shopId,
      shopName: s.shopName,
      province: s.shopId === 'shop-nep' ? 'Hà Nội' : 'Nam Định',
      itemCount: s.items.reduce((acc, it) => acc + it.quantity, 0),
      weightGrams: s.items.reduce((acc, it) => acc + it.quantity * 350, 0),
    }));
    const hubAndSpokeResult = calculateHubAndSpokeConsolidation(workshopOrigins, address.province || 'Hà Nội');
    const hubAndSpoke = {
      isConsolidationBeneficial: hubAndSpokeResult.isConsolidationBeneficial,
      selectedHubName: hubAndSpokeResult.selectedHub.name,
      netDistanceSavedKm: hubAndSpokeResult.netDistanceSavedKm,
      carbonEmissionSavedKg: hubAndSpokeResult.carbonEmissionSavedKg,
      efficiencyRationale: hubAndSpokeResult.efficiencyRationale,
    };

    // 5. Chuẩn bị trước mã VietQR EMVCo mẫu cho báo giá
    const sampleVietQr = generateVietQrEmvCoPayload({
      bankBin: '970422',
      accountNumber: '999988886666',
      amount: finalTotal,
      orderCode: `NX-PRE-${address.id.slice(-6).toUpperCase()}`,
      storeName: 'NEXORA ATELIER ESCROW',
    });

    return {
      shops,
      platformDiscount,
      shippingDiscount,
      coinDiscount,
      ...(tradeInCode ? { tradeInCode } : {}),
      total: finalTotal,
      address: {
        recipient: address.recipient,
        phone: address.phone,
        line: address.line,
        province: address.province,
        ...(deliverySlot ? { deliverySlot } : {}),
        ...(ecoPackaging !== undefined ? { ecoPackaging } : {}),
      },
      provider: 'mock',
      deliveryEta,
      hubAndSpoke,
      logisticsPacking: {
        totalBoxes: logisticsPacking.totalBoxes,
        totalWeightGrams: logisticsPacking.totalWeightGrams,
        isConsolidated: logisticsPacking.isConsolidated,
        workshopsCount: logisticsPacking.workshopsCount,
        tripsSaved: logisticsPacking.tripsSaved,
        carbonSavedKg: logisticsPacking.carbonSavedKg,
        courierEfficiencyScore: logisticsPacking.courierEfficiencyScore,
      },
      riskAssessment: {
        score: riskAssessment.score,
        tier: riskAssessment.tier,
        autoApproveDispatch: riskAssessment.autoApproveDispatch,
        requiresArtisanPhoneConfirmation: riskAssessment.requiresArtisanPhoneConfirmation,
        rationale: combinedRiskRationale,
      },
      vietQr: sampleVietQr,
    };
  }
  async quote(userId: string, addressId: string, codes: Record<string, string>, deliverySlot?: string, ecoPackaging?: boolean) {
    return serial(this.db, async tx => {
      const data = await this.price(tx, userId, addressId, codes, deliverySlot, ecoPackaging);
      return tx.checkoutQuote.create({ data: { userId, addressId, voucherCodes: codes, data: json(data), fingerprint: quotePricingFingerprint(data), expiresAt: new Date(Date.now() + 10 * 60000) } });
    });
  }
  async order(userId: string, quoteId: string, key: string, refUserId?: string, paymentMethod: string = 'COD') {
    return serial(this.db, async tx => {
      const existing = await tx.order.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey: key } }, include: orderInclude });
      if (existing) {
        if (existing.quoteId !== quoteId) throw new ConflictException('Khóa đặt hàng đã dùng cho một báo giá khác');
        return existing;
      }
      const quote = await tx.checkoutQuote.findFirst({ where: { id: quoteId, userId }, include: { order: true } });
      if (!quote) throw new NotFoundException('Không tìm thấy báo giá');
      if (quote.order) return tx.order.findUniqueOrThrow({ where: { id: quote.order.id }, include: orderInclude });
      if (quote.expiresAt <= new Date()) throw new ConflictException({ code: 'QUOTE_EXPIRED', message: 'Báo giá hết hạn. Vui lòng lấy báo giá mới.' });
      const codes = quote.voucherCodes as Record<string, string>;
      const quoteData = quote.data as QuoteData;
      const current = await this.price(tx, userId, quote.addressId, codes, quoteData.address?.deliverySlot, quoteData.address?.ecoPackaging);
      if (quotePricingFingerprint(current) !== quote.fingerprint && hash(JSON.stringify(current)) !== quote.fingerprint) throw new ConflictException({ code: 'QUOTE_CHANGED', message: 'Giỏ, giá hoặc địa chỉ đã thay đổi. Vui lòng kiểm tra báo giá mới.', quote: current });
      // Conditional updates run in stable order and are committed with the order.
      const items = current.shops.flatMap(g => g.items).sort((a, b) => a.variantId.localeCompare(b.variantId));
      for (const item of items) {
        const changed = await tx.$executeRaw`UPDATE "InventoryBalance" SET "reserved" = "reserved" + ${item.quantity} WHERE "variantId" = ${item.variantId} AND "onHand" - "reserved" >= ${item.quantity}`;
        if (!changed) throw new ConflictException({ code: 'OUT_OF_STOCK', message: `${item.name} vừa hết hàng`, variantId: item.variantId });
      }
      let validRef = refUserId && refUserId !== userId ? (await tx.user.findUnique({ where: { id: refUserId }, select: { id: true } }))?.id : undefined;
      if (validRef) {
        // Anti-Sybil & Anti-Reciprocal-Referral guard: block commission if KOC shares non-placeholder shipping fingerprint or previously used buyer as KOC
        const [kocAddresses, reciprocalOrder] = await Promise.all([
          tx.address.findMany({ where: { userId: validRef }, select: { phone: true, line: true, province: true }, take: 20 }),
          tx.order.findFirst({ where: { userId: validRef, affiliateUserId: userId }, select: { id: true } }),
        ]);
        const isPlaceholderPhone = /^0900000000$/.test(current.address.phone);
        const buyerFp = buildAddressSybilFingerprint(current.address.phone, current.address.line, current.address.province);
        const sharesSybilAddress = !isPlaceholderPhone && kocAddresses.some(a => buildAddressSybilFingerprint(a.phone, a.line, a.province) === buyerFp);
        if (sharesSybilAddress || reciprocalOrder) {
          validRef = undefined;
        }
      }
      const order = await tx.order.create({ data: { code: `NX-${randomUUID().slice(0, 8).toUpperCase()}`, userId, quoteId, idempotencyKey: key, total: current.total, platformDiscount: current.platformDiscount ?? 0, paymentMethod, ...(validRef ? { affiliateUserId: validRef } : {}), address: json(current.address) } });
      if (current.tradeInCode) {
        const redeemed = await tx.tradeInRequest.updateMany({ where: { voucherCode: current.tradeInCode, userId, status: 'APPROVED', redeemedOrderId: null }, data: { redeemedOrderId: order.id } });
        if (redeemed.count !== 1) throw new ConflictException(`Mã Trade-In ${current.tradeInCode} vừa được sử dụng`);
      }
      for (const group of current.shops) {
        const shop = await tx.shop.findUniqueOrThrow({ where: { id: group.shopId } });
        const settlementCheck = verifyEscrowSettlement({
          orderTotal: group.total,
          shopSubtotal: group.subtotal,
          shopDiscount: group.discount,
          shippingFee: group.shipping,
          platformFeeBps: shop.feeBps,
          affiliateCommissionBps: validRef ? 500 : 0,
          orderCode: order.code,
        });
        if (!settlementCheck.isValid) {
          throw new ConflictException('Lệch bất biến sổ cái ký quỹ (Escrow Invariant Disparity)');
        }
        let voucherId: string | undefined;
        if (codes[group.shopId]) {
          const voucher = await tx.voucher.findUniqueOrThrow({ where: { shopId_code: { shopId: group.shopId, code: codes[group.shopId] } } });
          const voucherUpdated = await tx.voucher.updateMany({
            where: { id: voucher.id, uses: { lt: voucher.maxUses }, expiresAt: { gt: new Date() } },
            data: { uses: { increment: 1 } },
          });
          if (voucherUpdated.count !== 1) throw new ConflictException(`Mã ${codes[group.shopId]} vừa hết lượt sử dụng hoặc đã hết hạn`);
          voucherId = voucher.id;
        }
        const discount = allocateDiscount(group.discount, group.items.map(i => i.price * i.quantity));
        const holdUntil = new Date(Date.now() + 24 * 3600000);
        await tx.shopOrder.create({ data: { orderId: order.id, shopId: group.shopId, subtotal: group.subtotal, discount: group.discount, shipping: group.shipping, total: group.total, feeBps: shop.feeBps, voucherId, holdUntil, items: { create: group.items.map((item, i) => ({ variantId: item.variantId, productId: item.productId, quantity: item.quantity, unitPrice: item.price, discount: discount[i], snapshot: json(item), reservation: { create: { variantId: item.variantId, quantity: item.quantity, expiresAt: holdUntil } } })) } } });
      }
      await tx.cartLine.deleteMany({ where: { userId } });
      await tx.outboxEvent.create({ data: { kind: 'ORDER_CREATED', payload: { orderId: order.id, userId } } });
      const cryptoBlock = createAuditChainBlock({
        index: 1,
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
        action: 'ORDER_CREATE',
        entityId: order.id,
        actorId: userId,
        amountVnd: order.total,
        data: {
          code: order.code,
          riskTier: current.riskAssessment?.tier,
          boxes: current.logisticsPacking?.totalBoxes,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'ORDER_CREATE',
          entityId: order.id,
          data: {
            total: order.total,
            riskScore: current.riskAssessment?.score,
            riskTier: current.riskAssessment?.tier,
            boxes: current.logisticsPacking?.totalBoxes,
            carbonSavedKg: current.logisticsPacking?.carbonSavedKg,
            vietQrEmvCo: paymentMethod === 'VIETQR',
            cryptoBlock,
          },
        },
      });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    });
  }
  async cancel(userId: string, shopOrderId: string) {
    return serial(this.db, async tx => {
      const order = await tx.shopOrder.findFirst({ where: { id: shopOrderId, order: { userId } }, include: { items: { include: { reservation: true } } } });
      if (!order) throw new NotFoundException('Không tìm thấy đơn');
      if (order.status === 'CANCELLED') return order;
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) throw new ConflictException('Đơn đã đóng gói hoặc xuất kho, vui lòng liên hệ shop');
      for (const item of [...order.items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
        const changed = await tx.reservation.updateMany({ where: { orderItemId: item.id, status: 'ACTIVE' }, data: { status: 'RELEASED' } });
        if (changed.count) await tx.inventoryBalance.update({ where: { variantId: item.variantId }, data: { reserved: { decrement: item.quantity } } });
      }
      if (order.voucherId) await tx.voucher.updateMany({ where: { id: order.voucherId, uses: { gt: 0 } }, data: { uses: { decrement: 1 } } });
      const updated = await tx.shopOrder.update({ where: { id: shopOrderId }, data: { status: 'CANCELLED' } });
      const remainingActive = await tx.shopOrder.count({ where: { orderId: order.orderId, status: { not: 'CANCELLED' } } });
      if (remainingActive === 0) {
        await tx.tradeInRequest.updateMany({ where: { redeemedOrderId: order.orderId }, data: { redeemedOrderId: null } });
      }
      await tx.auditLog.create({ data: { actorId: userId, action: 'ORDER_CANCEL', entityId: shopOrderId, data: { tradeInReleased: remainingActive === 0 } } });
      return updated;
    });
  }
  async confirmReceipt(userId: string, shopOrderId: string) {
    return serial(this.db, async tx => {
      const order = await tx.shopOrder.findFirst({
        where: { id: shopOrderId, order: { userId } },
        include: { order: { select: { affiliateUserId: true } }, shipment: true },
      });
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng của bạn');
      if (order.status === 'DELIVERED') return order;
      if (!['SHIPPED', 'DELIVERY_FAILED'].includes(order.status)) throw new ConflictException('Chỉ có thể xác nhận khi đơn hàng đang trên đường giao (SHIPPED)');

      const now = new Date();
      if (order.shipment) {
        await tx.shipment.update({ where: { id: order.shipment.id }, data: { status: 'DELIVERED' } });
      }
      const updated = await tx.shopOrder.update({
        where: { id: shopOrderId },
        data: { status: 'DELIVERED', deliveredAt: now },
      });

      const netSales = Math.max(0, order.subtotal - order.discount);
      const existingCod = await tx.sellerLedgerEntry.findUnique({ where: { sourceKey: `cod:${order.id}` } });
      if (!existingCod) {
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'COD_COLLECTED_BY_CARRIER', amount: order.total, sourceKey: `cod:${order.id}` } });
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'PLATFORM_FEE_RECEIVABLE', amount: Math.round(netSales * order.feeBps / 10000), sourceKey: `fee:${order.id}` } });
        await tx.sellerLedgerEntry.create({ data: { shopId: order.shopId, shopOrderId: order.id, kind: 'TAX_WITHHOLDING_VAT_PIT', amount: -Math.round(netSales * 150 / 10000), sourceKey: `tax:${order.id}` } });
      }

      if (order.order.affiliateUserId && netSales > 0) {
        const existingAff = await tx.affiliateEarning.findUnique({ where: { shopOrderId: order.id } });
        if (!existingAff) {
          await tx.affiliateEarning.create({
            data: {
              kocUserId: order.order.affiliateUserId,
              shopOrderId: order.id,
              amount: Math.round(netSales * 500 / 10000),
              status: 'HELD',
              holdUntil: new Date(Date.now() + 15 * 86400000),
            },
          });
        }
      }

      await tx.auditLog.create({
        data: { actorId: userId, action: 'ORDER_CONFIRM_RECEIPT', entityId: shopOrderId, data: { status: 'DELIVERED' } },
      });

      return updated;
    });
  }
}
@Controller()
@UseGuards(SignedIn)
export class CommerceController {
  constructor(@Inject(Db) private db: Db, @Inject(Commerce) private commerce: Commerce, @Inject(Auth) private auth: Auth) {}
  @Get('addresses') addresses(@Req() req: Authed) { return this.db.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }); }
  @Post('addresses') async address(@Req() req: Authed, @Body() body: unknown) {
    const parsed = addressInput.parse(body);
    const count = await this.db.address.count({ where: { userId: req.user.id } });
    if (count >= 20) throw new ConflictException('Mỗi tài khoản lưu tối đa 20 địa chỉ nhận hàng');
    return this.db.address.create({ data: { ...parsed, userId: req.user.id } });
  }
  @Patch('addresses/:id') async updateAddress(@Req() req: Authed, @Param('id') addressId: string, @Body() body: unknown) {
    const parsed = addressInput.partial().refine(obj => Object.keys(obj).length > 0, 'Cần ít nhất một trường cập nhật').parse(body);
    const existing = await this.db.address.findFirst({ where: { id: addressId, userId: req.user.id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy địa chỉ của bạn');
    return this.db.address.update({ where: { id: addressId }, data: parsed });
  }
  @Delete('addresses/:id') async deleteAddress(@Req() req: Authed, @Param('id') addressId: string) {
    const deleted = await this.db.address.deleteMany({ where: { id: addressId, userId: req.user.id } });
    if (!deleted.count) throw new NotFoundException('Không tìm thấy địa chỉ của bạn');
    return { ok: true };
  }
  @Get('cart') cart(@Req() req: Authed) {
    return this.db.cartLine.findMany({ where: { userId: req.user.id }, orderBy: { id: 'asc' }, include: { variant: { include: {
      inventory: true, product: { include: { shop: { select: { id: true, name: true } }, images: { orderBy: { position: 'asc' } } } },
    } } } });
  }
  @Post('cart') async add(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ variantId: id, quantity: z.number().int().min(1).max(20) }).strict().parse(body);
    return serial(this.db, async tx => {
      const variant = await tx.variant.findFirst({ where: { id: data.variantId, active: true, product: { status: 'ACTIVE', shop: { status: 'APPROVED' } } }, include: { inventory: true } });
      if (!variant) throw new NotFoundException('Sản phẩm không còn bán');
      const prior = await tx.cartLine.findUnique({ where: { userId_variantId: { userId: req.user.id, variantId: data.variantId } } });
      const quantity = (prior?.quantity ?? 0) + data.quantity;
      if (quantity > 20 || !variant.inventory || quantity > variant.inventory.onHand - variant.inventory.reserved) throw new ConflictException('Số lượng vượt tồn hiện tại hoặc giới hạn 20 món mỗi SKU');
      return tx.cartLine.upsert({ where: { userId_variantId: { userId: req.user.id, variantId: data.variantId } }, create: { userId: req.user.id, variantId: data.variantId, quantity }, update: { quantity } });
    });
  }

  @Post('cart/batch')
  async addBatch(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      items: z.array(z.object({
        variantId: id,
        quantity: z.number().int().min(1).max(20).default(1),
      })).min(1).max(10),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const added: any[] = [];
      for (const item of data.items) {
        const variant = await tx.variant.findFirst({
          where: { id: item.variantId, active: true, product: { status: 'ACTIVE', shop: { status: 'APPROVED' } } },
          include: { inventory: true, product: { select: { name: true } } },
        });
        if (!variant) throw new NotFoundException(`Sản phẩm [${item.variantId}] không còn bán hoặc tạm ẩn`);
        const prior = await tx.cartLine.findUnique({
          where: { userId_variantId: { userId: req.user.id, variantId: item.variantId } },
        });
        const quantity = (prior?.quantity ?? 0) + item.quantity;
        if (quantity > 20 || !variant.inventory || quantity > variant.inventory.onHand - variant.inventory.reserved) {
          const remaining = variant.inventory ? Math.max(0, variant.inventory.onHand - variant.inventory.reserved) : 0;
          throw new ConflictException(`Sản phẩm "${variant.product.name}" (Màu ${variant.color}, Size ${variant.size}) tạm hết hàng (Còn lại: ${remaining})`);
        }
        const line = await tx.cartLine.upsert({
          where: { userId_variantId: { userId: req.user.id, variantId: item.variantId } },
          create: { userId: req.user.id, variantId: item.variantId, quantity },
          update: { quantity },
        });
        added.push(line);
      }
      return { ok: true, addedCount: added.length, lines: added };
    });
  }
  @Patch('cart/:id') async updateLine(@Req() req: Authed, @Param('id') lineId: string, @Body() body: unknown) {
    const { quantity } = z.object({ quantity: z.number().int().min(1).max(20) }).strict().parse(body);
    return serial(this.db, async tx => {
      const line = await tx.cartLine.findFirst({
        where: { id: lineId, userId: req.user.id },
        include: { variant: { include: { inventory: true, product: { include: { shop: true } } } } },
      });
      if (!line) throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
      const v = line.variant;
      if (!v.active || v.product.status !== 'ACTIVE' || v.product.shop.status !== 'APPROVED') {
        throw new ConflictException('Sản phẩm đã ngừng bán');
      }
      const available = v.inventory ? v.inventory.onHand - v.inventory.reserved : 0;
      if (quantity > available) {
        throw new ConflictException(`Số lượng vượt tồn hiện tại (Còn lại: ${Math.max(0, available)})`);
      }
      await tx.cartLine.update({ where: { id: line.id }, data: { quantity } });
      return { ok: true };
    });
  }
  @Delete('cart/:id') async remove(@Req() req: Authed, @Param('id') lineId: string) { await this.db.cartLine.deleteMany({ where: { id: lineId, userId: req.user.id } }); return { ok: true }; }
  @Post('checkout/quote') quote(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      addressId: id,
      vouchers: z.record(id, z.string().max(30)).default({}),
      tradeInCode: z.string().trim().max(30).optional(),
      deliverySlot: z.string().max(30).optional(),
      ecoPackaging: z.boolean().optional(),
    }).strict().parse(body);
    const codes = data.tradeInCode ? { ...data.vouchers, _tradeIn: data.tradeInCode } : data.vouchers;
    return this.commerce.quote(req.user.id, data.addressId, codes, data.deliverySlot, data.ecoPackaging);
  }
  @Post('checkout/optimal-vouchers') async optimalVouchers(@Req() req: Authed, @Body() body: unknown) {
    z.object({ addressId: id.optional() }).strict().parse(body || {});
    const lines = await this.db.cartLine.findMany({
      where: { userId: req.user.id },
      include: { variant: { include: { product: { include: { shop: true } } } } },
    });
    const activeLines = lines.filter(l => l.variant.active && l.variant.product.status === 'ACTIVE' && l.variant.product.shop.status === 'APPROVED');
    if (!activeLines.length) {
      return { ok: true, optimalVouchers: {}, totalSavings: 0, savingsBreakdown: [], netPayableAfterOptimization: 0 };
    }
    const shopMap = new Map<string, { shopId: string; subtotal: number; shopName: string }>();
    for (const line of activeLines) {
      const v = line.variant;
      const existing = shopMap.get(v.shopId) || { shopId: v.shopId, subtotal: 0, shopName: v.product.shop.name };
      existing.subtotal += v.price * line.quantity;
      shopMap.set(v.shopId, existing);
    }
    const shopSubtotals = Array.from(shopMap.values());
    const shopIds = shopSubtotals.map(s => s.shopId);

    const [allVouchers, priorOrders] = await Promise.all([
      this.db.voucher.findMany({
        where: { shopId: { in: shopIds }, expiresAt: { gt: new Date() } },
      }),
      this.db.order.findMany({
        where: { userId: req.user.id },
        select: { id: true, total: true, createdAt: true, shops: { select: { status: true } } },
        take: 100,
      }),
    ]);
    const rfm = evaluateCustomerRfmAndClv({
      userId: req.user.id,
      accountCreatedAtMs: Date.now() - 86_400_000,
      orders: priorOrders.map(o => {
        const st = o.shops.map(s => s.status);
        const allCancelled = st.length > 0 && st.every(x => x === 'CANCELLED');
        const anyReturned = st.some(x => x === 'RETURNED');
        const allDelivered = st.length > 0 && st.every(x => x === 'DELIVERED');
        return {
          orderId: o.id,
          createdAtMs: o.createdAt.getTime(),
          netAmountVnd: o.total,
          status: allCancelled ? 'CANCELLED' : anyReturned ? 'RETURNED' : allDelivered ? 'COMPLETED' : 'ACTIVE',
        };
      }),
    });
    const candidateVouchers = allVouchers.filter(v =>
      v.uses < v.maxUses &&
      checkVoucherEligibilityForCustomer({
        voucherCode: v.code,
        isNewMemberEligible: rfm.isNewMemberEligible,
        eligibleVoucherTiers: rfm.eligibleVoucherTiers,
      }).eligible
    );

    const tradeIns = await this.db.tradeInRequest.findMany({
      where: { userId: req.user.id, status: 'APPROVED', redeemedOrderId: null, voucherCode: { not: null } },
    });

    const optimization = solveVoucherKnapsack({
      shopSubtotals,
      candidateVouchers: candidateVouchers.map(v => ({
        id: v.id,
        code: v.code,
        shopId: v.shopId,
        amount: v.amount,
        minimum: v.minimum,
        expiresAt: v.expiresAt,
        uses: v.uses,
        maxUses: v.maxUses,
      })),
      tradeInVouchers: tradeIns.filter(t => t.voucherCode && t.finalValue).map(t => ({
        code: t.voucherCode!,
        value: t.finalValue!,
      })),
      freeShipAvailable: true,
      userCoinBalance: 20000,
    });

    return { ok: true, customerTier: rfm.tier, ...optimization };
  }

  @Get('checkout/available-vouchers') async getAvailableVouchers(@Req() req: Authed, @Query('q') search?: string) {
    const keyword = (search ?? '').trim().toUpperCase();
    const [lines, priorOrders, tradeIns] = await Promise.all([
      this.db.cartLine.findMany({
        where: { userId: req.user.id },
        include: { variant: { include: { product: { include: { shop: true } } } } },
      }),
      this.db.order.findMany({
        where: { userId: req.user.id },
        select: { id: true, total: true, createdAt: true, shops: { select: { status: true } } },
        take: 100,
      }),
      this.db.tradeInRequest.findMany({
        where: { userId: req.user.id, status: 'APPROVED', redeemedOrderId: null, voucherCode: { not: null } },
      }),
    ]);

    const rfm = evaluateCustomerRfmAndClv({
      userId: req.user.id,
      accountCreatedAtMs: Date.now() - 86_400_000,
      orders: priorOrders.map(o => {
        const st = o.shops.map(s => s.status);
        const allCancelled = st.length > 0 && st.every(x => x === 'CANCELLED');
        const anyReturned = st.some(x => x === 'RETURNED');
        const allDelivered = st.length > 0 && st.every(x => x === 'DELIVERED');
        return {
          orderId: o.id,
          createdAtMs: o.createdAt.getTime(),
          netAmountVnd: o.total,
          status: allCancelled ? 'CANCELLED' : anyReturned ? 'RETURNED' : allDelivered ? 'COMPLETED' : 'ACTIVE',
        };
      }),
    });

    const shopSubtotals = new Map<string, number>();
    for (const line of lines) {
      if (line.variant.active && line.variant.product.status === 'ACTIVE' && line.variant.product.shop.status === 'APPROVED') {
        shopSubtotals.set(line.variant.shopId, (shopSubtotals.get(line.variant.shopId) ?? 0) + line.variant.price * line.quantity);
      }
    }

    const vouchers = await this.db.voucher.findMany({
      where: { expiresAt: { gt: new Date() }, shop: { status: 'APPROVED' } },
      include: { shop: { select: { id: true, name: true } } },
      orderBy: { amount: 'desc' },
      take: 100,
    });

    const formattedShopVouchers = vouchers
      .filter(v => v.uses < v.maxUses)
      .filter(v => !keyword || v.code.toUpperCase().includes(keyword) || v.shop.name.toUpperCase().includes(keyword))
      .map(v => {
        const tierCheck = checkVoucherEligibilityForCustomer({
          voucherCode: v.code,
          isNewMemberEligible: rfm.isNewMemberEligible,
          eligibleVoucherTiers: rfm.eligibleVoucherTiers,
        });
        const cartShopSubtotal = shopSubtotals.get(v.shopId) ?? 0;
        const meetsMinimum = cartShopSubtotal >= v.minimum;
        return {
          id: v.id,
          code: v.code,
          shopId: v.shopId,
          shopName: v.shop.name,
          amount: v.amount,
          minimum: v.minimum,
          remainingUses: Math.max(0, v.maxUses - v.uses),
          expiresAt: v.expiresAt,
          requiredTier: tierCheck.requiredTier,
          tierEligible: tierCheck.eligible,
          inCartShop: shopSubtotals.has(v.shopId),
          meetsMinimum,
          canApplyNow: tierCheck.eligible && shopSubtotals.has(v.shopId) && meetsMinimum,
          ineligibleReason: !tierCheck.eligible
            ? tierCheck.reason
            : !shopSubtotals.has(v.shopId)
              ? `Chưa có sản phẩm của ${v.shop.name} trong giỏ`
              : !meetsMinimum
                ? `Cần mua thêm ${(v.minimum - cartShopSubtotal).toLocaleString('vi-VN')}₫ tại ${v.shop.name}`
                : null,
        };
      });

    return {
      ok: true,
      customerTier: rfm.tier,
      isNewMemberEligible: rfm.isNewMemberEligible,
      eligibleVoucherTiers: rfm.eligibleVoucherTiers,
      shopVouchers: formattedShopVouchers,
      tradeInVouchers: tradeIns
        .filter(t => t.voucherCode && t.finalValue && (!keyword || t.voucherCode.toUpperCase().includes(keyword)))
        .map(t => ({
          id: t.id,
          code: t.voucherCode!,
          itemName: t.itemName,
          amount: t.finalValue!,
          canApplyNow: shopSubtotals.size > 0,
        })),
    };
  }
  @Post('orders') createOrder(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      quoteId: id,
      idempotencyKey: z.string().min(16).max(100),
      refUserId: id.optional(),
      paymentMethod: z.enum(['COD', 'BNPL', 'VIETQR']).optional(),
    }).strict().parse(body);
    return this.commerce.order(req.user.id, data.quoteId, data.idempotencyKey, data.refUserId, data.paymentMethod ?? 'COD');
  }
  @Get('orders/loyalty-profile') async getLoyaltyProfile(@Req() req: Authed) {
    const [user, orders] = await Promise.all([
      this.db.user.findUniqueOrThrow({ where: { id: req.user.id }, select: { id: true, createdAt: true } }),
      this.db.order.findMany({
        where: { userId: req.user.id },
        select: { id: true, total: true, createdAt: true, shops: { select: { status: true } } },
        orderBy: { createdAt: 'asc' },
        take: 200,
      }),
    ]);

    const orderRecords = orders.map(o => {
      const statuses = o.shops.map(s => s.status);
      const allCancelled = statuses.length > 0 && statuses.every(st => st === 'CANCELLED');
      const anyReturned = statuses.some(st => st === 'RETURNED');
      const allDelivered = statuses.length > 0 && statuses.every(st => st === 'DELIVERED');
      return {
        orderId: o.id,
        createdAtMs: o.createdAt.getTime(),
        netAmountVnd: o.total,
        status: (allCancelled ? 'CANCELLED' : anyReturned ? 'RETURNED' : allDelivered ? 'COMPLETED' : 'ACTIVE') as 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'ACTIVE',
      };
    });

    const profile = evaluateCustomerRfmAndClv({
      userId: user.id,
      accountCreatedAtMs: user.createdAt.getTime(),
      orders: orderRecords,
    });

    return { ok: true, profile };
  }
  @Get('orders') orders(@Req() req: Authed) { return this.db.order.findMany({ where: { userId: req.user.id }, include: orderInclude, take: 50, orderBy: { createdAt: 'desc' } }); }
  @Get('orders/:id') async orderDetail(@Req() req: Authed, @Param('id') orderId: string) {
    const order = await this.db.order.findFirst({ where: { id: orderId, userId: req.user.id }, include: orderInclude });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    const vietQr = generateVietQrEmvCoPayload({
      bankBin: '970422',
      accountNumber: '999988886666',
      amount: order.total,
      orderCode: order.code,
      storeName: 'NEXORA ATELIER ESCROW',
    });
    const rawAddr = (order.address as any) || {};
    const destProvince = rawAddr.province || 'Hà Nội';
    const slot = rawAddr.deliverySlot === 'MORNING' || rawAddr.deliverySlot === 'AFTERNOON' || rawAddr.deliverySlot === 'EVENING' ? rawAddr.deliverySlot : 'AFTERNOON';
    const deliveryEta = calculateLogisticsDeliveryEta({
      originProvince: 'Hà Nội',
      destinationProvince: destProvince,
      deliverySlot: slot,
    });
    return { ...order, vietQr, deliveryEta };
  }
  @Get('orders/:id/vietqr') async getOrderVietQr(@Req() req: Authed, @Param('id') orderId: string) {
    const order = await this.db.order.findFirst({ where: { id: orderId, userId: req.user.id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return generateVietQrEmvCoPayload({
      bankBin: '970422',
      accountNumber: '999988886666',
      amount: order.total,
      orderCode: order.code,
      storeName: 'NEXORA ATELIER ESCROW',
    });
  }
  @Post('orders/:id/confirm-payment') async confirmPayment(@Req() req: Authed, @Param('id') orderId: string, @Body() body: unknown) {
    const { referenceNumber } = z.object({ referenceNumber: z.string().trim().min(3).max(60) }).strict().parse(body);
    return serial(this.db, async tx => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId: req.user.id },
        include: { shops: { select: { status: true } } },
      });
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.shops.length > 0 && order.shops.every(s => s.status === 'CANCELLED')) {
        throw new ConflictException('Đơn hàng đã hủy hoàn toàn, không thể xác nhận thanh toán');
      }

      const prevAudits = await tx.auditLog.findMany({
        where: { entityId: order.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      const existingConfirm = prevAudits.find(a => a.action === 'ORDER_CONFIRM_PAYMENT');
      if (existingConfirm) {
        const prevRef = (existingConfirm.data as any)?.referenceNumber;
        if (prevRef === referenceNumber) {
          return { ok: true, idempotent: true, orderId: order.id, referenceNumber, status: 'ESCROW_PAID_VERIFIED', cryptoBlock: (existingConfirm.data as any)?.cryptoBlock };
        }
        throw new ConflictException('Đơn hàng này đã được xác nhận thanh toán bằng một mã tham chiếu khác');
      }

      const lastWithCrypto = prevAudits.find(a => (a.data as any)?.cryptoBlock?.blockHash);
      const prevHash = (lastWithCrypto?.data as any)?.cryptoBlock?.blockHash || '0000000000000000000000000000000000000000000000000000000000000000';
      const prevIndex = (lastWithCrypto?.data as any)?.cryptoBlock?.index || 0;
      const cryptoBlock = createAuditChainBlock({
        index: prevIndex + 1,
        prevHash,
        action: 'ORDER_CONFIRM_PAYMENT',
        entityId: order.id,
        actorId: req.user.id,
        amountVnd: order.total,
        data: { referenceNumber, paymentMethod: order.paymentMethod },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'ORDER_CONFIRM_PAYMENT',
          entityId: order.id,
          data: { referenceNumber, paymentMethod: order.paymentMethod, verifiedAt: new Date().toISOString(), cryptoBlock },
        },
      });
      return { ok: true, orderId: order.id, referenceNumber, status: 'ESCROW_PAID_VERIFIED', cryptoBlock };
    });
  }
  @Post('orders/webhook/napas-ipn') async handleNapasIpnWebhook(@Body() body: unknown) {
    const ipn = z.object({
      transactionId: z.string().min(1).max(100),
      amount: z.number().int().positive(),
      narrative: z.string().min(1).max(500),
      transferDate: z.string().optional().default(() => new Date().toISOString()),
      gateway: z.string().optional().default('NAPAS_247'),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const duplicateIpn = await tx.providerEvent.findUnique({
        where: { provider_externalId: { provider: 'napas_ipn', externalId: ipn.transactionId } },
      });
      if (duplicateIpn) {
        const prevPayload = duplicateIpn.payload as Record<string, any>;
        if (prevPayload.amount !== ipn.amount) {
          throw new ConflictException('Transaction ID NAPAS đã tồn tại với số tiền khác');
        }
        return { ok: true, duplicate: true, reconciliation: prevPayload.reconciliation };
      }

      const rawPendingOrders = await tx.order.findMany({
        where: {
          paymentMethod: 'VIETQR',
          createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
        },
        select: { id: true, code: true, total: true, userId: true, createdAt: true, shops: { select: { status: true } } },
        take: 100,
      });
      const pendingOrders = rawPendingOrders.filter(o => !(o.shops.length > 0 && o.shops.every(s => s.status === 'CANCELLED')));

      const result = reconcileBankTransferNapasIpn(
        {
          transactionId: ipn.transactionId,
          amount: ipn.amount,
          narrative: ipn.narrative,
          transferDate: ipn.transferDate,
          gateway: ipn.gateway,
        },
        pendingOrders.map(o => ({
          orderId: o.id,
          orderCode: o.code,
          total: o.total,
          userId: o.userId,
          createdAt: o.createdAt,
        })),
      );

      await tx.providerEvent.create({
        data: {
          provider: 'napas_ipn',
          externalId: ipn.transactionId,
          payload: json({ amount: ipn.amount, narrative: ipn.narrative, reconciliation: result }),
        },
      });

      if (result.matched && result.orderId) {
        const prevAudits = await tx.auditLog.findMany({
          where: { entityId: result.orderId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        const lastWithCrypto = prevAudits.find(a => (a.data as any)?.cryptoBlock?.blockHash);
        const prevHash = (lastWithCrypto?.data as any)?.cryptoBlock?.blockHash || '0000000000000000000000000000000000000000000000000000000000000000';
        const prevIndex = (lastWithCrypto?.data as any)?.cryptoBlock?.index || 0;
        const cryptoBlock = createAuditChainBlock({
          index: prevIndex + 1,
          prevHash,
          action: 'NAPAS_IPN_RECONCILED',
          entityId: result.orderId,
          actorId: 'SYSTEM_NAPAS_GATEWAY',
          amountVnd: ipn.amount,
          data: {
            transactionId: ipn.transactionId,
            confidencePct: result.confidencePct,
            matchType: result.matchType,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: 'SYSTEM_NAPAS_GATEWAY',
            action: 'NAPAS_IPN_RECONCILED',
            entityId: result.orderId,
            data: {
              transactionId: ipn.transactionId,
              amount: ipn.amount,
              narrative: ipn.narrative,
              confidencePct: result.confidencePct,
              matchType: result.matchType,
              reconciledAt: new Date().toISOString(),
              cryptoBlock,
            },
          },
        });
      } else {
        // Automatic multi-order Subset-Sum reconciliation fallback when 1 bank transfer pays multiple VIETQR orders
        const batchResult = reconcileBatchOrdersSubsetSum({
          transferAmountVnd: ipn.amount,
          narrative: ipn.narrative,
          candidates: pendingOrders.map(o => ({
            orderId: o.id,
            orderCode: o.code,
            userId: o.userId,
            totalVnd: o.total,
            createdAtMs: o.createdAt.getTime(),
          })),
        });
        if (batchResult.matched && batchResult.matchedOrderIds.length >= 2) {
          for (const matchedId of batchResult.matchedOrderIds) {
            await tx.auditLog.create({
              data: {
                actorId: 'SYSTEM_NAPAS_GATEWAY',
                action: 'NAPAS_IPN_BATCH_RECONCILED',
                entityId: matchedId,
                data: {
                  transactionId: ipn.transactionId,
                  batchOrderCodes: batchResult.matchedOrderCodes,
                  transferAmountVnd: ipn.amount,
                  confidencePct: batchResult.confidencePct,
                },
              },
            });
          }
          return { ok: true, reconciliation: result, batchReconciliation: batchResult };
        }
      }

      return { ok: true, reconciliation: result };
    });
  }

  @Post('orders/reconcile-batch')
  reconcileBatchTransferEndpoint(@Body() body: unknown) {
    const data = z.object({
      transferAmountVnd: z.number().int().positive(),
      narrative: z.string().max(500).default(''),
      toleranceVnd: z.number().int().min(0).max(10000).optional(),
      maxSubsetSize: z.number().int().min(2).max(5).optional(),
      candidates: z.array(z.object({
        orderId: z.string().min(1),
        orderCode: z.string().min(1),
        userId: z.string().min(1),
        totalVnd: z.number().int().positive(),
        createdAtMs: z.number().int().min(0),
      })).max(50),
    }).strict().parse(body);

    return { ok: true, ...reconcileBatchOrdersSubsetSum(data) };
  }

  @Post('logistics/milk-run-vrp')
  optimizeMilkRunEndpoint(@Body() body: unknown) {
    const data = z.object({
      depot: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), name: z.string().optional() }),
      stops: z.array(z.object({
        stopId: z.string().min(1),
        label: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        weightKg: z.number().positive().max(500),
      })).max(60),
      vehicleCapacityKg: z.number().positive().optional(),
      maxStopsPerRoute: z.number().int().min(2).max(25).optional(),
      avgSpeedKmh: z.number().positive().optional(),
    }).strict().parse(body);

    return { ok: true, ...optimizeCourierMilkRunRouting(data) };
  }

  @Post('logistics/min-cost-fulfillment')
  solveMinCostFulfillmentEndpoint(@Body() body: unknown) {
    const data = z.object({
      hubs: z.array(z.object({
        hubId: z.string().min(1),
        hubName: z.string().min(1),
        availableUnits: z.number().int().min(0),
      })).max(50),
      demands: z.array(z.object({
        demandId: z.string().min(1),
        requiredUnits: z.number().int().min(0),
      })).max(100),
      arcs: z.array(z.object({
        hubId: z.string().min(1),
        demandId: z.string().min(1),
        unitCostVnd: z.number().int().min(0),
        maxCapacityUnits: z.number().int().min(0).optional(),
      })).max(2000),
    }).strict().parse(body);

    return { ok: true, ...solveMinCostMaxFlowOrderFulfillment(data) };
  }
  @Post('bespoke/cpm-schedule') async calculateCustomCpmSchedule(@Body() body: unknown) {
    const data = z.object({
      stages: z.array(z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        durationHours: z.number().positive(),
        dependencies: z.array(z.string()),
      })).min(1).optional(),
    }).strict().parse(body || {});

    const stages: BespokeCraftStage[] = data.stages || [
      { id: 'STAGE_1_BIOMETRIC', name: 'Đo trắc học 3D & Thử phom số', durationHours: 6, dependencies: [] },
      { id: 'STAGE_2_PATTERN', name: 'Ra rập mộc thủ công trên vải toan', durationHours: 12, dependencies: ['STAGE_1_BIOMETRIC'] },
      { id: 'STAGE_3_FABRIC_WEAVE', name: 'Dệt & Thêu hoa văn lụa tơ sen thủ công', durationHours: 24, dependencies: ['STAGE_2_PATTERN'] },
      { id: 'STAGE_4_FITTING', name: 'Lên phom áo & Buổi Fitting trực tiếp lần 1', durationHours: 8, dependencies: ['STAGE_3_FABRIC_WEAVE'] },
      { id: 'STAGE_5_FINISHING', name: 'Hoàn thiện viền tay & Đóng dấu triện nghệ nhân', durationHours: 10, dependencies: ['STAGE_4_FITTING'] },
    ];

    const schedule = calculateBespokeCriticalPathSchedule(stages);
    return { ok: true, schedule };
  }
  @Get('bespoke/:id/cpm-schedule') async getBespokeProjectSchedule(@Param('id') bespokeId: string) {
    const bespokeLog = await this.db.auditLog.findFirst({
      where: { entityId: bespokeId, action: 'VAULT_BESPOKE' },
    });
    const stage1Hours = bespokeLog ? 8 : 6;
    const stages: BespokeCraftStage[] = [
      { id: 'STAGE_1_BIOMETRIC', name: 'Đo trắc học 3D & Thử phom số', durationHours: stage1Hours, dependencies: [] },
      { id: 'STAGE_2_PATTERN', name: 'Ra rập mộc thủ công trên vải toan', durationHours: 12, dependencies: ['STAGE_1_BIOMETRIC'] },
      { id: 'STAGE_3_FABRIC_WEAVE', name: 'Dệt & Thêu hoa văn lụa tơ sen thủ công', durationHours: 24, dependencies: ['STAGE_2_PATTERN'] },
      { id: 'STAGE_4_FITTING', name: 'Lên phom áo & Buổi Fitting trực tiếp lần 1', durationHours: 8, dependencies: ['STAGE_3_FABRIC_WEAVE'] },
      { id: 'STAGE_5_FINISHING', name: 'Hoàn thiện viền tay & Đóng dấu triện nghệ nhân', durationHours: 10, dependencies: ['STAGE_4_FITTING'] },
    ];
    const schedule = calculateBespokeCriticalPathSchedule(stages);
    return { ok: true, bespokeId, schedule };
  }
  @Get('orders/:id/audit-chain') async getOrderAuditChain(@Req() req: Authed, @Param('id') orderId: string) {
    const order = await this.db.order.findFirst({ where: { id: orderId, userId: req.user.id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    const logs = await this.db.auditLog.findMany({
      where: { entityId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    const blocks: any[] = logs
      .map(l => (l.data as any)?.cryptoBlock)
      .filter(Boolean);
    const chainVerification = verifyAuditChainIntegrity(blocks);
    return {
      ok: true,
      orderId: order.id,
      orderCode: order.code,
      totalEntries: logs.length,
      cryptoBlocksCount: blocks.length,
      integrity: chainVerification,
      chain: blocks,
    };
  }
  @Post('logistics/hub-and-spoke') async evaluateHubAndSpoke(@Body() body: unknown) {
    const data = z.object({
      workshops: z.array(z.object({
        shopId: z.string(),
        shopName: z.string(),
        province: z.string(),
        itemCount: z.number().int().min(1),
        weightGrams: z.number().int().min(50),
      })).min(1),
      destinationProvince: z.string().min(2),
    }).strict().parse(body);

    const result = calculateHubAndSpokeConsolidation(data.workshops, data.destinationProvince);
    return { ok: true, ...result };
  }
  @Post('artisan/queue-forecast') async forecastArtisanQueue(@Body() body: unknown) {
    const data = z.object({
      activeOrderCount: z.number().int().min(0),
      artisanCount: z.number().int().min(1).default(3),
      avgCraftHoursPerGarment: z.number().min(1).default(16),
      dailyWorkingHoursPerArtisan: z.number().min(1).max(16).default(8),
    }).strict().parse(body);

    const forecast = calculateArtisanQueueLeadTime(data);
    return { ok: true, forecast };
  }
  @Post('orders/shops/:id/cancel') cancel(@Req() req: Authed, @Param('id') shopOrderId: string) { return this.commerce.cancel(req.user.id, shopOrderId); }
  @Post('orders/shops/:id/confirm-receipt') confirmReceipt(@Req() req: Authed, @Param('id') shopOrderId: string) { return this.commerce.confirmReceipt(req.user.id, shopOrderId); }

  @Post('orders/security/pod-verify')
  verifyProofOfDelivery(@Body() body: unknown) {
    const data = z.object({
      orderCode: z.string().min(1),
      shopId: z.string().min(1),
      dispatchWeightGrams: z.number().int().min(10).default(450),
      hubWeightGrams: z.number().int().min(10).default(452),
      handoverWeightGrams: z.number().int().min(10).default(450),
      enteredSecurityPin: z.string().optional(),
      weightToleranceGrams: z.number().int().min(1).max(200).optional().default(50),
    }).strict().parse(body ?? {});

    const result = evaluateProofOfDeliverySecurityAndWeight(data);
    return { ok: true, ...result };
  }

  @Post('orders/logistics/weather-reroute')
  calculateWeatherRerouteEndpoint(@Body() body: unknown) {
    const data = z.object({
      precipitationRateMmH: z.number().min(0).default(62),
      windSpeedKmh: z.number().min(0).default(45),
      floodingProbabilityPct: z.number().min(0).max(100).default(68),
      baseDistanceKm: z.number().min(0.1).default(8.4),
      baseEtaMinutes: z.number().int().min(1).optional().default(35),
    }).strict().parse(body ?? {});

    const result = calculateWeatherAdaptiveRerouteBuffer(data);
    return { ok: true, ...result };
  }

  @Post('orders/logistics/green-mile')
  calculateGreenMileEndpoint(@Body() body: unknown) {
    const data = z.object({
      orderCode: z.string().min(1),
      routeDistanceKm: z.number().min(0.1).default(8.4),
      evVehicleModel: z.string().optional().default('VinFast Feliz LFP 100% Eco Electric'),
      batterySocPct: z.number().min(1).max(100).optional().default(84),
      avgSpeedKmh: z.number().min(1).max(120).optional().default(28.5),
    }).strict().parse(body ?? {});

    const result = calculateGreenMileEvTelemetryPassport(data);
    return { ok: true, ...result };
  }

  @Post('orders/disputes/arbitrate')
  arbitrateDisputeEndpoint(@Body() body: unknown) {
    const data = z.object({
      disputeId: z.string().min(1).default(() => 'DISPUTE-' + Date.now().toString().slice(-4)),
      shopOrderId: z.string().min(1),
      escrowHeldAmountVnd: z.number().int().min(1000).default(1250000),
      disputeReason: z.enum([
        'DEFECTIVE_FABRIC',
        'WRONG_MEASUREMENTS',
        'SHIPPING_DAMAGE',
        'CHANGE_OF_MIND',
        'COUNTERFEIT_CONCERN',
      ]).default('DEFECTIVE_FABRIC'),
      buyerEvidenceProvided: z.boolean().default(true),
      sellerPreShipmentProof: z.boolean().default(false),
      transitWeightDiscrepancy: z.boolean().default(false),
      carrierIncidentLogged: z.boolean().optional().default(false),
    }).strict().parse(body ?? {});

    const result = arbitrateEscrowDisputeSettlement(data);
    return { ok: true, ...result };
  }
  @Get('seller/shops/:shopId/orders') async sellerOrders(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const rows = await this.db.shopOrder.findMany({ where: { shopId }, include: { items: true, shipment: true, order: { select: { code: true, address: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
    return rows.map(row => {
      if (!['DELIVERED', 'CANCELLED', 'RETURNED'].includes(row.status)) return row;
      const addr = row.order.address as { recipient: string; phone: string; line: string; province: string };
      return {
        ...row,
        order: {
          ...row.order,
          address: {
            recipient: addr.recipient,
            phone: addr.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
            line: '*** (Đã ẩn theo PDPD NĐ 13/2023)',
            province: addr.province,
          },
        },
      };
    });
  }
  @Post('seller/shops/:shopId/orders/:orderId/transition') async transition(@Req() req: Authed, @Param('shopId') shopId: string, @Param('orderId') orderId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const { status } = z.object({ status: z.enum(['CONFIRMED', 'PACKED', 'SHIPPED']) }).strict().parse(body);
    return serial(this.db, async tx => {
      const order = await tx.shopOrder.findFirst({ where: { id: orderId, shopId }, include: { items: true } });
      if (!order) throw new NotFoundException('Đơn không thuộc shop');
      if (order.status === status) return order;
      const preceding = { CONFIRMED: 'PENDING', PACKED: 'CONFIRMED', SHIPPED: 'PACKED' };
      if (order.status !== preceding[status]) throw new ConflictException('Không thể chuyển trạng thái này');
      if (order.status === 'PENDING' && order.holdUntil <= new Date()) throw new ConflictException('Đơn đã hết thời gian chờ xác nhận');
      if (status === 'SHIPPED') {
        for (const item of [...order.items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
          const changed = await tx.reservation.updateMany({ where: { orderItemId: item.id, status: 'ACTIVE' }, data: { status: 'CONSUMED' } });
          if (changed.count !== 1) throw new ConflictException('Lượt giữ hàng không còn hợp lệ');
          await tx.inventoryBalance.update({ where: { variantId: item.variantId }, data: { onHand: { decrement: item.quantity }, reserved: { decrement: item.quantity } } });
          await tx.stockMovement.create({ data: { variantId: item.variantId, quantity: -item.quantity, kind: 'DISPATCH', sourceKey: `dispatch:${item.id}`, actorId: req.user.id } });
        }
        await tx.shipment.create({ data: { shopOrderId: orderId, provider: 'mock', tracking: `MOCK-${orderId}`, status: 'SHIPPED', codAmount: order.total } });
      }
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `ORDER_${status}`, entityId: orderId, data: { provider: 'mock' } } });
      return tx.shopOrder.update({ where: { id: orderId }, data: { status } });
    });
  }

  @Post('reviews') async createReview(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({ orderItemId: id, rating: z.number().int().min(1).max(5), body: z.string().trim().min(5).max(1000) }).strict().parse(body);
    return serial(this.db, async tx => {
      const item = await tx.orderItem.findFirst({
        where: { id: data.orderItemId, shopOrder: { order: { userId: req.user.id } } },
        include: { shopOrder: true, reviews: true },
      });
      if (!item) throw new NotFoundException('Không tìm thấy sản phẩm trong đơn hàng của bạn');
      if (item.shopOrder.status !== 'DELIVERED') throw new ConflictException('Chỉ có thể đánh giá sau khi đơn hàng đã giao');
      if (item.reviews.length) throw new ConflictException('Sản phẩm này đã được đánh giá');
      const review = await tx.review.create({
        data: { userId: req.user.id, productId: item.productId, orderItemId: item.id, rating: data.rating, body: data.body },
      });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'REVIEW_CREATE', entityId: review.id, data: { productId: item.productId, rating: data.rating } } });
      return review;
    });
  }

  @Post('reviews/credibility-audit')
  async auditReviewCredibility(@Body() body: unknown) {
    const parsed = z.object({
      reviews: z.array(z.object({
        id: z.string(),
        rating: z.number().min(1).max(5),
        hasVerifiedPurchase: z.boolean().default(true),
        hasPhotosOrMeasurements: z.boolean().default(false),
        textLength: z.number().int().min(0).default(20),
        authorAgeDays: z.number().min(0).default(30),
        helpfulVotes: z.number().int().min(0).default(0),
      }).passthrough()).default([]),
      priorMean: z.number().min(1).max(5).optional(),
      priorWeight: z.number().positive().optional(),
    }).passthrough().parse(body ?? {});
    return evaluateBayesianReviewCredibility({
      reviews: parsed.reviews as any,
      priorMean: parsed.priorMean,
      priorWeight: parsed.priorWeight,
    });
  }

  @Post('reviews/anti-astroturfing')
  async detectReviewAstroturfing(@Body() body: unknown) {
    const parsed = z.object({
      candidateReviews: z.array(z.object({
        id: z.string(),
        userId: z.string(),
        ipAddress: z.string().default('127.0.0.1'),
        deviceHash: z.string().default('dev'),
        rating: z.number().min(1).max(5),
        body: z.string(),
        createdAtIso: z.string().default(() => new Date().toISOString()),
        isVerifiedOrder: z.boolean().default(true),
      }).passthrough()).default([]),
      maxBurstThresholdHours: z.number().positive().optional(),
    }).passthrough().parse(body ?? {});
    return detectAstroturfingAndCollusionReviews({
      candidateReviews: parsed.candidateReviews as any,
      maxBurstThresholdHours: parsed.maxBurstThresholdHours,
    });
  }

  @Post('returns/reverse-logistics')
  async planReverseLogistics(@Body() body: any) {
    if (!body?.customerLocation || !body?.primaryWorkshop || !body?.centralHub) {
      throw new BadRequestException('Thông tin tọa độ khách hàng, xưởng và Hub trung tâm là bắt buộc');
    }
    return optimizeReverseLogisticsDoorstepRouting({
      customerLocation: body.customerLocation,
      primaryWorkshop: body.primaryWorkshop,
      centralHub: body.centralHub,
      requestKind: body.requestKind || 'DOORSTEP_EXCHANGE',
      itemWeightKg: body.itemWeightKg,
    });
  }

  @Post('returns/rma-restitution')
  async evaluateRmaCondition(@Body() body: any) {
    if (!body?.originalItemPriceVnd || !body?.condition) {
      throw new BadRequestException('Giá gốc sản phẩm và tình trạng ngoại quan là bắt buộc');
    }
    return evaluateRmaWearAndTearRestitution({
      originalItemPriceVnd: Number(body.originalItemPriceVnd),
      condition: body.condition,
      fabricType: body.fabricType,
      returnKind: body.returnKind,
    });
  }

  @Get('returns') returns(@Req() req: Authed) {
    return this.db.returnRequest.findMany({ where: { userId: req.user.id }, include: { items: { include: { orderItem: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post('returns') async createReturnDirect(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      shopId: id.optional(),
      shopOrderId: id.optional(),
      kind: z.enum(['EXCHANGE', 'REFUND', 'DOORSTEP_EXCHANGE']),
      reason: z.string().trim().min(5).max(500),
      items: z.array(z.object({ orderItemId: id, quantity: z.number().int().min(1).max(20), replacementVariantId: id.optional() }).strict()).min(1).max(20),
    }).strict().parse(body);
    const targetShopOrderId = data.shopOrderId || data.shopId;
    if (!targetShopOrderId) throw new NotFoundException('Thiếu thông tin đơn hàng');
    return this.createReturn(req, targetShopOrderId, { kind: data.kind, reason: data.reason, items: data.items });
  }

  @Post('orders/shops/:id/returns') async createReturn(@Req() req: Authed, @Param('id') shopOrderId: string, @Body() body: unknown) {
    const data = z.object({
      kind: z.enum(['EXCHANGE', 'REFUND', 'DOORSTEP_EXCHANGE']),
      reason: z.string().trim().min(5).max(500),
      items: z.array(z.object({ orderItemId: id, quantity: z.number().int().min(1).max(20), replacementVariantId: id.optional() }).strict()).min(1).max(20),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const shopOrder = await tx.shopOrder.findFirst({ where: { id: shopOrderId, order: { userId: req.user.id } }, include: { items: true } });
      if (!shopOrder) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (shopOrder.status !== 'DELIVERED') throw new ConflictException('Chỉ hỗ trợ đổi size hoặc hoàn trả sau khi đã nhận hàng');
      if (shopOrder.deliveredAt && Date.now() - shopOrder.deliveredAt.getTime() > 7 * 86400000) throw new ConflictException('Đã quá hạn 7 ngày yêu cầu đổi/trả');
      const itemMap = new Map(shopOrder.items.map(i => [i.id, i]));
      const existingReturns = await tx.returnItem.findMany({
        where: { orderItemId: { in: data.items.map(i => i.orderItemId) }, request: { status: { in: ['REQUESTED', 'APPROVED', 'COMPLETED', 'DISPUTED'] } } },
      });
      const returnedQty = new Map<string, number>();
      for (const r of existingReturns) returnedQty.set(r.orderItemId, (returnedQty.get(r.orderItemId) ?? 0) + r.quantity);
      const returnItems: { orderItemId: string; quantity: number; replacementVariantId?: string; refundAmount: number }[] = [];
      for (const reqItem of data.items) {
        const orderItem = itemMap.get(reqItem.orderItemId);
        if (!orderItem) throw new NotFoundException('Sản phẩm không thuộc đơn hàng này');
        const used = returnedQty.get(orderItem.id) ?? 0;
        if (used + reqItem.quantity > orderItem.quantity) throw new ConflictException('Số lượng đổi/trả vượt quá số lượng đã mua');
        let replacementVariantId: string | undefined;
        if (['EXCHANGE', 'DOORSTEP_EXCHANGE'].includes(data.kind) && reqItem.replacementVariantId) {
          const rep = await tx.variant.findFirst({
            where: { id: reqItem.replacementVariantId, shopId: shopOrder.shopId, active: true, product: { status: 'ACTIVE' } },
            include: { inventory: true },
          });
          if (!rep) throw new NotFoundException('Phân loại hàng đổi không tồn tại hoặc đã ngừng bán');
          if (!rep.inventory || rep.inventory.onHand - rep.inventory.reserved < reqItem.quantity) {
            throw new ConflictException('Phân loại hàng muốn đổi hiện không đủ tồn kho');
          }
          replacementVariantId = rep.id;
        }
        const unitNet = Math.max(0, Math.floor((orderItem.unitPrice * orderItem.quantity - orderItem.discount) / orderItem.quantity));
        returnItems.push({
          orderItemId: orderItem.id,
          quantity: reqItem.quantity,
          replacementVariantId,
          refundAmount: data.kind === 'REFUND' ? unitNet * reqItem.quantity : 0,
        });
      }
      const created = await tx.returnRequest.create({
        data: { userId: req.user.id, shopId: shopOrder.shopId, reason: data.reason, kind: data.kind, items: { create: returnItems } },
        include: { items: true },
      });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'RETURN_REQUEST', entityId: created.id, data: { shopOrderId, kind: data.kind } } });
      return created;
    });
  }

  @Get('seller/shops/:shopId/returns') async sellerReturns(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.returnRequest.findMany({ where: { shopId }, include: { items: { include: { orderItem: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Post('seller/shops/:shopId/returns/:returnId/decision') async decideReturn(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('returnId') returnId: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId);
    const { status, returnless } = z.object({
      status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']),
      returnless: z.boolean().optional(),
    }).strict().parse(body);
    return serial(this.db, async tx => {
      const rr = await tx.returnRequest.findFirst({ where: { id: returnId, shopId }, include: { items: { include: { orderItem: true } } } });
      if (!rr) throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả');
      if (rr.status === status) return rr;
      const allowed: Record<string, string[]> = { REQUESTED: ['APPROVED', 'REJECTED'], APPROVED: ['COMPLETED'] };
      if (!(allowed[rr.status] ?? []).includes(status)) throw new ConflictException('Không thể chuyển trạng thái yêu cầu này');
      if (status === 'COMPLETED' && rr.kind === 'REFUND') {
        const totalRefund = rr.items.reduce((s, i) => s + i.refundAmount, 0);
        const shopOrderId = rr.items[0]?.orderItem.shopOrderId;
        if (totalRefund > 0) {
          const existingDebit = await tx.sellerLedgerEntry.findUnique({ where: { sourceKey: `refund:${rr.id}` } });
          if (!existingDebit) {
            await tx.sellerLedgerEntry.create({
              data: { shopId, shopOrderId, kind: 'REFUND_DEBIT', amount: -totalRefund, sourceKey: `refund:${rr.id}` },
            });
          }
        }
        if (shopOrderId) {
          await tx.shopOrder.updateMany({ where: { id: shopOrderId, status: { not: 'RETURNED' } }, data: { status: 'RETURNED' } });
          await tx.affiliateEarning.updateMany({ where: { shopOrderId, status: 'HELD' }, data: { status: 'CANCELLED' } });
        }
        if (returnless) {
          await tx.auditLog.create({ data: { actorId: req.user.id, action: 'RET_RETURNLESS_REFUND', entityId: rr.id, data: { shopId, totalRefund } } });
        }
      } else if (status === 'COMPLETED' && ['EXCHANGE', 'DOORSTEP_EXCHANGE'].includes(rr.kind)) {
        for (const item of rr.items) {
          if (!item.replacementVariantId) continue;
          const moveKey = `exchange-out:${item.id}`;
          const alreadyMoved = await tx.stockMovement.findUnique({ where: { sourceKey: moveKey } });
          if (!alreadyMoved) {
            const deducted = await tx.$executeRaw`UPDATE "InventoryBalance" SET "onHand" = "onHand" - ${item.quantity} WHERE "variantId" = ${item.replacementVariantId} AND "onHand" - "reserved" >= ${item.quantity}`;
            if (!deducted) throw new ConflictException('Phân loại hàng đổi không còn đủ tồn kho để xuất đổi');
            await tx.stockMovement.create({
              data: { variantId: item.replacementVariantId, quantity: -item.quantity, kind: 'EXCHANGE_DISPATCH', sourceKey: moveKey, actorId: req.user.id },
            });
          }
        }
      }
      await tx.auditLog.create({ data: { actorId: req.user.id, action: `RETURN_${status}`, entityId: rr.id, data: { shopId, returnless } } });
      return tx.returnRequest.update({ where: { id: rr.id }, data: { status }, include: { items: true } });
    });
  }

  @Post('returns/:id/cancel') async cancelReturn(@Req() req: Authed, @Param('id') returnId: string) {
    return serial(this.db, async tx => {
      const rr = await tx.returnRequest.findFirst({ where: { id: returnId, userId: req.user.id }, include: { items: true } });
      if (!rr) throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả');
      if (rr.status === 'CANCELLED') return rr;
      if (rr.status !== 'REQUESTED') {
        throw new ConflictException('Chỉ có thể hủy yêu cầu đổi/trả khi shop chưa xử lý (REQUESTED)');
      }
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'RETURN_CANCELLED_BY_BUYER', entityId: rr.id, data: {} } });
      return tx.returnRequest.update({ where: { id: rr.id }, data: { status: 'CANCELLED' }, include: { items: true } });
    });
  }

  @Post('returns/:id/dispute') async disputeReturn(
    @Req() req: Authed,
    @Param('id') returnId: string,
    @Body() body: unknown,
  ) {
    const data = z.object({ reason: z.string().trim().min(5).max(1000) }).strict().parse(body);
    return serial(this.db, async tx => {
      const rr = await tx.returnRequest.findFirst({ where: { id: returnId, userId: req.user.id } });
      if (!rr) throw new NotFoundException('Không tìm thấy yêu cầu đổi/trả');
      if (!['REQUESTED', 'REJECTED'].includes(rr.status)) throw new ConflictException('Chỉ có thể khiếu nại yêu cầu đang chờ hoặc đã bị shop từ chối');
      await tx.auditLog.create({
        data: { actorId: req.user.id, action: 'RETURN_DISPUTED_ESCALATION', entityId: rr.id, data: { reason: data.reason } },
      });
      return tx.returnRequest.update({
        where: { id: rr.id },
        data: { status: 'DISPUTED', reason: `${rr.reason} | [Khiếu nại trọng tài sàn SLA 48h: ${data.reason}]` },
        include: { items: true },
      });
    });
  }

  @Get('seller/shops/:shopId/vouchers') async sellerVouchers(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    return this.db.voucher.findMany({ where: { shopId }, orderBy: { expiresAt: 'desc' }, take: 50 });
  }

  @Post('seller/shops/:shopId/vouchers') async createVoucher(@Req() req: Authed, @Param('shopId') shopId: string, @Body() body: unknown) {
    await this.auth.shop(req.user.id, shopId);
    const data = z.object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/),
      amount: z.number().int().min(1000).max(50_000_000),
      minimum: z.number().int().min(0).max(100_000_000),
      maxUses: z.number().int().min(1).max(100000),
      daysValid: z.number().int().min(1).max(365).default(30),
    }).strict().parse(body);
    const voucher = await this.db.voucher.create({
      data: { shopId, code: data.code, amount: data.amount, minimum: data.minimum, maxUses: data.maxUses, expiresAt: new Date(Date.now() + data.daysValid * 86400000) },
    });
    await this.db.auditLog.create({ data: { actorId: req.user.id, action: 'VOUCHER_CREATE', entityId: voucher.id, data: { shopId, code: voucher.code } } });
    return voucher;
  }

  @Patch('seller/shops/:shopId/vouchers/:voucherId') async updateVoucher(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('voucherId') voucherId: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const data = z.object({
      amount: z.number().int().min(1000).max(50_000_000).optional(),
      minimum: z.number().int().min(0).max(100_000_000).optional(),
      maxUses: z.number().int().min(1).max(100000).optional(),
      daysValid: z.number().int().min(1).max(365).optional(),
    }).strict().refine(obj => Object.keys(obj).length > 0, 'Cần ít nhất một trường cập nhật').parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.voucher.findFirst({ where: { id: voucherId, shopId } });
      if (!existing) throw new NotFoundException('Không tìm thấy mã giảm giá thuộc shop');
      if (data.maxUses !== undefined && data.maxUses < existing.uses) {
        throw new ConflictException(`Giới hạn lượt dùng mới (${data.maxUses}) không thể nhỏ hơn số lượt đã dùng (${existing.uses})`);
      }
      const { daysValid, ...rest } = data;
      const updated = await tx.voucher.update({
        where: { id: voucherId },
        data: {
          ...rest,
          ...(daysValid !== undefined ? { expiresAt: new Date(Date.now() + daysValid * 86400000) } : {}),
        },
      });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'VOUCHER_UPDATE', entityId: voucherId, data: json(data) } });
      return updated;
    });
  }

  @Delete('seller/shops/:shopId/vouchers/:voucherId') async deleteOrExpireVoucher(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('voucherId') voucherId: string,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    return serial(this.db, async tx => {
      const existing = await tx.voucher.findFirst({ where: { id: voucherId, shopId } });
      if (!existing) throw new NotFoundException('Không tìm thấy mã giảm giá thuộc shop');
      const orderRefCount = await tx.shopOrder.count({ where: { voucherId } });
      if (existing.uses > 0 || orderRefCount > 0) {
        await tx.voucher.update({ where: { id: voucherId }, data: { expiresAt: new Date(0), maxUses: existing.uses } });
        await tx.auditLog.create({ data: { actorId: req.user.id, action: 'VOUCHER_EXPIRED_DEACTIVATED', entityId: voucherId, data: { code: existing.code } } });
        return { ok: true, deletedId: voucherId, mode: 'EXPIRED_DEACTIVATED' };
      }
      await tx.voucher.delete({ where: { id: voucherId } });
      await tx.auditLog.create({ data: { actorId: req.user.id, action: 'VOUCHER_DELETE', entityId: voucherId, data: { code: existing.code } } });
      return { ok: true, deletedId: voucherId, mode: 'DELETED' };
    });
  }

  @Get('seller/shops/:shopId/ledger') async sellerLedger(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const entries = await this.db.sellerLedgerEntry.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 100 });
    const balance = entries.reduce((s, e) => s + e.amount, 0);
    const escrowCutoff = new Date(Date.now() - 7 * 86400000);
    const recentDelivered = await this.db.shopOrder.findMany({ where: { shopId, status: 'DELIVERED', deliveredAt: { gt: escrowCutoff } }, select: { total: true } });
    const openReturns = await this.db.returnRequest.findMany({ where: { shopId, status: { in: ['REQUESTED', 'APPROVED', 'DISPUTED'] } }, include: { items: true } });
    const held = recentDelivered.reduce((s, o) => s + o.total, 0);
    const disputed = openReturns.reduce((s, r) => s + r.items.reduce((x, i) => x + i.refundAmount, 0), 0);
    const available = Math.max(0, balance - held - disputed);
    const merkleAudit = computeLedgerMerkleAudit(
      entries.map(e => ({ id: e.id, kind: e.kind, amount: e.amount, sourceKey: e.sourceKey })),
    );
    return {
      balance,
      available,
      held,
      disputed,
      merkleRoot: merkleAudit.merkleRoot,
      invariantsValid: merkleAudit.invariantsValid,
      violations: merkleAudit.violations,
      entries,
    };
  }

  @Get('seller/shops/:shopId/ledger/:entryId/proof') async sellerLedgerProof(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('entryId') entryId: string,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const entries = await this.db.sellerLedgerEntry.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' }, take: 500 });
    const target = entries.find(e => e.id === entryId);
    if (!target) throw new NotFoundException('Không tìm thấy bút toán sổ cái thuộc shop');
    const merkleAudit = computeLedgerMerkleAudit(
      entries.map(e => ({ id: e.id, kind: e.kind, amount: e.amount, sourceKey: e.sourceKey })),
    );
    const proof = merkleAudit.proofsByEntryId[entryId];
    const verified = proof
      ? verifyMerkleInclusionProof({ leafHash: proof.leafHash, steps: proof.steps, expectedRoot: merkleAudit.merkleRoot })
      : false;
    return {
      ok: true,
      entry: target,
      merkleRoot: merkleAudit.merkleRoot,
      leafHash: proof?.leafHash ?? null,
      steps: proof?.steps ?? [],
      verified,
    };
  }

  @Post('seller/shops/:shopId/payout') async requestPayout(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Body() body: unknown,
  ) {
    const shop = await this.auth.shop(req.user.id, shopId, true);
    const data = z.object({
      amount: z.number().int().min(50000).max(500000000),
      bankName: z.string().trim().min(2).max(100),
      accountNumber: z.string().trim().min(5).max(30),
      beneficiaryName: z.string().trim().min(2).max(100),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const entries = await tx.sellerLedgerEntry.findMany({ where: { shopId } });
      const balance = entries.reduce((s, e) => s + e.amount, 0);
      const escrowCutoff = new Date(Date.now() - 7 * 86400000);
      const recentDelivered = await tx.shopOrder.findMany({ where: { shopId, status: 'DELIVERED', deliveredAt: { gt: escrowCutoff } }, select: { total: true } });
      const openReturns = await tx.returnRequest.findMany({ where: { shopId, status: { in: ['REQUESTED', 'APPROVED', 'DISPUTED'] } }, include: { items: true } });
      const held = recentDelivered.reduce((s, o) => s + o.total, 0);
      const disputed = openReturns.reduce((s, r) => s + r.items.reduce((x, i) => x + i.refundAmount, 0), 0);
      const available = Math.max(0, balance - held - disputed);

      const settlement = calculateEscrow3TierSettlement({
        shopId,
        shopName: shop.name,
        availableBalanceVnd: available,
        heldEscrow7DayVnd: held,
        disputedBalanceVnd: disputed,
        requestedPayoutAmountVnd: data.amount,
        bankAccount: data.accountNumber,
        bankCode: data.bankName,
        accountHolder: data.beneficiaryName,
      });

      if (settlement.payoutStatus !== 'APPROVED_FOR_DISBURSEMENT') {
        throw new ConflictException(`Số tiền rút (${data.amount.toLocaleString()}₫) không hợp lệ hoặc vượt quá số dư khả dụng (${available.toLocaleString()}₫).`);
      }

      const transferRef = settlement.napasTransactionRef;
      const entry = await tx.sellerLedgerEntry.create({
        data: {
          shopId,
          kind: 'PAYOUT_ESCROW_WITHDRAWAL',
          amount: -data.amount,
          sourceKey: `payout:${shopId}:${transferRef}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'SELLER_ESCROW_PAYOUT',
          entityId: entry.id,
          data: {
            ...settlement,
            transferRef,
          },
        },
      });

      return {
        ok: true,
        transferRef,
        amount: data.amount,
        netDisbursedVnd: settlement.netDisbursedVnd,
        totalTaxWithheldVnd: settlement.totalTaxWithheldVnd,
        statutoryVatWithheld1PctVnd: settlement.statutoryVatWithheld1PctVnd,
        statutoryPitWithheldHalfPctVnd: settlement.statutoryPitWithheldHalfPctVnd,
        eTaxInvoiceCode: settlement.eTaxInvoiceCode,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        beneficiaryName: data.beneficiaryName,
        remainingAvailable: available - data.amount,
        estimatedArrival: 'Tức thì qua NAPAS 24/7 (trong 1-5 phút)',
        advisory: settlement.advisory,
      };
    });
  }

  @Get('wishlist') async getWishlist(@Req() req: Authed) {
    const items = await this.db.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            shop: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { where: { active: true }, include: { inventory: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return items.map(w => w.product);
  }

  @Post('wishlist/:productId') async toggleWishlist(@Req() req: Authed, @Param('productId') productId: string) {
    const existing = await this.db.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) {
      await this.db.wishlist.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    }
    const product = await this.db.product.findFirst({ where: { id: productId, status: 'ACTIVE', shop: { status: 'APPROVED' } }, select: { id: true } });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại hoặc đã ngừng bán');
    await this.db.wishlist.create({
      data: { userId: req.user.id, productId },
    });
    return { wishlisted: true };
  }

  @Get('seller/shops/:shopId/bespoke')
  async sellerBespokeOrders(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const logs = await this.db.auditLog.findMany({
      where: { action: 'VAULT_BESPOKE' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const actorIds = [...new Set(logs.map(l => l.actorId))];
    const users = await this.db.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return logs
      .filter(l => {
        const d = (l.data as any) || {};
        return !d.shopId || d.shopId === shopId;
      })
      .map(l => {
        const user = userMap.get(l.actorId);
        return {
          id: l.entityId,
          ...((l.data as any) || {}),
          customerName: user?.name || 'Khách Hàng Atelier',
          customerEmail: user?.email || '',
          createdAt: l.createdAt,
        };
      });
  }

  @Post('seller/shops/:shopId/bespoke/:id/stage')
  async updateBespokeStage(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const parsed = z.object({
      stage: z.enum([
        'PENDING_REVIEW',
        'PATTERNING',
        'FABRIC_CUTTING',
        'HAND_STITCHING',
        'FINISHING_QC',
        'READY_TO_SHIP',
      ]),
      tailorNote: z.string().max(500).optional().default(''),
      masterTailor: z.string().max(100).optional(),
      estimatedDays: z.number().int().min(1).max(30).optional(),
    }).parse(body);

    const originalLog = await this.db.auditLog.findFirst({
      where: { action: 'VAULT_BESPOKE', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    const updatedData = {
      ...((originalLog?.data as any) || {}),
      stage: parsed.stage,
      tailorNote: parsed.tailorNote,
      ...(parsed.masterTailor ? { masterTailor: parsed.masterTailor } : {}),
      ...(parsed.estimatedDays ? { estimatedDays: parsed.estimatedDays } : {}),
      updatedAt: new Date().toISOString(),
    };

    if (originalLog) {
      await this.db.auditLog.update({
        where: { id: originalLog.id },
        data: { data: updatedData as any },
      });
    } else {
      await this.db.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'VAULT_BESPOKE',
          entityId: id,
          data: updatedData as any,
        },
      });
    }

    return { ok: true, bespoke: updatedData };
  }

  @Post('seller/shops/:shopId/bespoke/:id/toile')
  async submitBespokeToile(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const parsed = z.object({
      frontViewUrl: z.string().max(500).default('/images/bespoke-toile-front.jpg'),
      sideViewUrl: z.string().max(500).default('/images/bespoke-toile-side.jpg'),
      backViewUrl: z.string().max(500).default('/images/bespoke-toile-back.jpg'),
      shoulderSlope: z.enum(['STANDARD', 'SLOPING', 'SQUARE']).default('STANDARD'),
      postureBalance: z.enum(['NORMAL', 'ERECT', 'STOOPED']).default('NORMAL'),
      easeAllowanceBust: z.number().default(6),
      easeAllowanceWaist: z.number().default(4),
      masterNotes: z.string().max(1000).default('Mẫu vải mộc đã hoàn thiện canh sợi, đường châm phấn đạt chuẩn.'),
      status: z.enum(['SUBMITTED_FOR_CLIENT_REVIEW', 'CLIENT_APPROVED', 'REVISION_REQUESTED']).default('SUBMITTED_FOR_CLIENT_REVIEW'),
    }).parse(body);

    const originalLog = await this.db.auditLog.findFirst({
      where: { action: 'VAULT_BESPOKE', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    const postureCorrection = calculateToilePostureCorrection({
      orderId: id,
      shoulderSlope: parsed.shoulderSlope,
      postureBalance: parsed.postureBalance,
      measuredChestCm: 88,
      measuredWaistCm: 68,
      easeAllowanceBustCm: parsed.easeAllowanceBust,
      easeAllowanceWaistCm: parsed.easeAllowanceWaist,
      masterNotes: parsed.masterNotes,
    });

    const toileData = {
      ...parsed,
      postureCorrection,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (originalLog) {
      const updatedData = {
        ...((originalLog.data as any) || {}),
        toileMilestone: toileData,
        stage: originalLog.data && (originalLog.data as any).stage === 'PENDING_REVIEW' ? 'PATTERNING' : (originalLog.data as any)?.stage || 'PATTERNING',
        updatedAt: new Date().toISOString(),
      };
      await this.db.auditLog.update({
        where: { id: originalLog.id },
        data: { data: updatedData as any },
      });
    }

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'BESPOKE_TOILE_DOSSIER',
        entityId: id,
        data: toileData as any,
      },
    });

    return { ok: true, toile: toileData, postureCorrection };
  }

  @Post('seller/shops/:shopId/bespoke/:id/cutting-marker')
  async calculateCuttingMarker(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const parsed = z.object({
      fabricBoltWidthCm: z.number().positive().default(140),
      allocatedBoltLengthMeters: z.number().positive().default(2.6),
      fabricType: z.string().default('Linen hữu cơ Normandy'),
      patternPieces: z.array(z.object({
        pieceName: z.string(),
        widthCm: z.number().positive(),
        lengthCm: z.number().positive(),
        quantity: z.number().int().positive(),
      })).optional(),
      preshrinkDecatizingWash: z.boolean().default(true),
    }).parse(body || {});

    const defaultPieces = [
      { pieceName: 'Thân trước (Front Body)', widthCm: 65, lengthCm: 110, quantity: 2 },
      { pieceName: 'Thân sau (Back Body)', widthCm: 68, lengthCm: 112, quantity: 1 },
      { pieceName: 'Tay áo (Sleeves)', widthCm: 45, lengthCm: 60, quantity: 2 },
      { pieceName: 'Cổ áo & Ve áo (Collar & Lapel)', widthCm: 25, lengthCm: 85, quantity: 2 },
      { pieceName: 'Lót túi (Pocket Bags)', widthCm: 20, lengthCm: 25, quantity: 4 },
    ];

    const result = calculateCuttingMarkerYield({
      ticketCode: `TICKET-${id.slice(0, 8).toUpperCase()}`,
      fabricBoltWidthCm: parsed.fabricBoltWidthCm,
      allocatedBoltLengthMeters: parsed.allocatedBoltLengthMeters,
      fabricType: parsed.fabricType,
      patternPieces: parsed.patternPieces || defaultPieces,
      preshrinkDecatizingWash: parsed.preshrinkDecatizingWash,
    });

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'BESPOKE_CUTTING_MARKER',
        entityId: id,
        data: result as any,
      },
    });

    return { ok: true, cuttingMarker: result };
  }

  @Get('bespoke/:id/toile')
  async getBespokeToile(@Req() req: Authed, @Param('id') id: string) {
    const bespokeLog = await this.db.auditLog.findFirst({
      where: { action: 'VAULT_BESPOKE', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (bespokeLog && (bespokeLog.data as any)?.toileMilestone) {
      return { ok: true, toile: (bespokeLog.data as any).toileMilestone, stage: (bespokeLog.data as any).stage };
    }

    const toileLog = await this.db.auditLog.findFirst({
      where: { action: 'BESPOKE_TOILE_DOSSIER', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    return { ok: true, toile: (toileLog?.data as any) || null, stage: (bespokeLog?.data as any)?.stage || null };
  }

  @Post('bespoke/:id/toile-decision')
  async decideBespokeToile(
    @Req() req: Authed,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = z.object({
      decision: z.enum(['APPROVE', 'REQUEST_ADJUSTMENT']),
      clientNote: z.string().max(1000).default(''),
      adjustments: z.record(z.string(), z.any()).optional(),
    }).parse(body);

    const originalLog = await this.db.auditLog.findFirst({
      where: { action: 'VAULT_BESPOKE', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!originalLog) {
      throw new BadRequestException('Không tìm thấy dự án may đo tương ứng');
    }
    if (originalLog.actorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền phê duyệt mẫu vải mộc của khách hàng khác');
    }

    const currentData = (originalLog.data as any) || {};
    const currentToile = currentData.toileMilestone || {};

    const isApprove = parsed.decision === 'APPROVE';
    const nextStatus = isApprove ? 'CLIENT_APPROVED' : 'REVISION_REQUESTED';
    const nextStage = isApprove ? 'FABRIC_CUTTING' : currentData.stage || 'PATTERNING';

    const updatedToile = {
      ...currentToile,
      status: nextStatus,
      clientDecision: parsed.decision,
      clientNote: parsed.clientNote,
      clientDecisionAt: new Date().toISOString(),
      ...(parsed.adjustments ? { clientAdjustments: parsed.adjustments } : {}),
    };

    const updatedBespoke = {
      ...currentData,
      stage: nextStage,
      toileMilestone: updatedToile,
      updatedAt: new Date().toISOString(),
    };

    await this.db.auditLog.update({
      where: { id: originalLog.id },
      data: { data: updatedBespoke as any },
    });

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'BESPOKE_TOILE_DECISION',
        entityId: id,
        data: {
          decision: parsed.decision,
          clientNote: parsed.clientNote,
          stageAfter: nextStage,
          decidedAt: new Date().toISOString(),
        } as any,
      },
    });

    return { ok: true, toile: updatedToile, stage: nextStage };
  }

  @Post('concierge/fitting')
  async bookHomeFitting(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      bespokeId: z.string().max(100).optional(),
      productName: z.string().min(2).max(200),
      shopId: z.string().max(100).optional(),
      appointmentDate: z.string().min(5).max(50),
      timeSlot: z.enum(['MORNING_09_11', 'AFTERNOON_14_16', 'EVENING_18_20']),
      address: z.string().min(5).max(300),
      phone: z.string().min(9).max(15),
      recipientName: z.string().min(2).max(100),
      fabricSuitcaseRequested: z.boolean().default(true),
      specialNotes: z.string().max(500).optional().default(''),
    }).strict().parse(body);

    const fittingId = `FITTING-HF-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

    const fittingData = {
      id: fittingId,
      ...data,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      depositHeld: 200000,
      statusHistory: [
        { status: 'CONFIRMED', timestamp: new Date().toISOString(), note: 'Hệ thống Concierge đã tiếp nhận lịch hẹn thử đồ tại gia.' }
      ],
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'CONCIERGE_HOME_FITTING',
        entityId: fittingId,
        data: fittingData as any,
      },
    });

    return { ok: true, fitting: fittingData };
  }

  @Get('concierge/fittings')
  async getBuyerFittings(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: { action: 'CONCIERGE_HOME_FITTING', actorId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({
      id: l.entityId,
      ...((l.data as any) || {}),
      createdAt: l.createdAt,
    }));
  }

  @Get('seller/shops/:shopId/fittings')
  async getSellerFittings(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const logs = await this.db.auditLog.findMany({
      where: { action: 'CONCIERGE_HOME_FITTING' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const actorIds = [...new Set(logs.map(l => l.actorId))];
    const users = await this.db.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return logs
      .filter(l => {
        const d = (l.data as any) || {};
        return !d.shopId || d.shopId === shopId;
      })
      .map(l => {
        const user = userMap.get(l.actorId);
        return {
          id: l.entityId,
          ...((l.data as any) || {}),
          customerName: user?.name || 'Khách Hàng VIP',
          customerEmail: user?.email || '',
          createdAt: l.createdAt,
        };
      });
  }

  @Post('seller/shops/:shopId/fittings/:id/dispatch')
  async dispatchFittingValet(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const parsed = z.object({
      status: z.enum(['VALET_ASSIGNED', 'EN_ROUTE', 'COMPLETED', 'ORDER_CONVERTED', 'CANCELLED']),
      stylistName: z.string().min(2).max(100),
      stylistPhone: z.string().min(9).max(15),
      valetNotes: z.string().max(500).optional().default(''),
      conversionAmount: z.number().int().min(0).optional(),
    }).parse(body);

    const originalLog = await this.db.auditLog.findFirst({
      where: { action: 'CONCIERGE_HOME_FITTING', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!originalLog) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn thử đồ [${id}]`);
    }

    const currentData = (originalLog.data as any) || {};
    if (currentData.shopId && currentData.shopId !== shopId) {
      throw new ForbiddenException('Lịch hẹn thử đồ này thuộc xưởng may khác');
    }
    if (['CANCELLED', 'ORDER_CONVERTED'].includes(currentData.status) && currentData.status !== parsed.status) {
      throw new ConflictException(`Lịch hẹn thử đồ đã ở trạng thái kết thúc (${currentData.status})`);
    }
    const history = Array.isArray(currentData.statusHistory) ? currentData.statusHistory : [];
    history.push({
      status: parsed.status,
      timestamp: new Date().toISOString(),
      stylistName: parsed.stylistName,
      note: parsed.valetNotes,
    });

    const valetDispatch = calculateFittingValetDispatch({
      fittingId: id,
      customerName: currentData.customerName || 'Khách Hàng VIP',
      customerAddress: currentData.address || 'Quận Ba Đình, Hà Nội',
      valetStylistName: parsed.stylistName,
      scheduledTimeIso: currentData.dateIso || new Date().toISOString(),
      distanceKm: 6.8,
    });

    const updatedData = {
      ...currentData,
      status: parsed.status,
      stylistName: parsed.stylistName,
      stylistPhone: parsed.stylistPhone,
      valetNotes: parsed.valetNotes,
      valetDispatch,
      statusHistory: history,
      ...(parsed.conversionAmount !== undefined ? { conversionAmount: parsed.conversionAmount } : {}),
      updatedAt: new Date().toISOString(),
    };

    await this.db.auditLog.update({
      where: { id: originalLog.id },
      data: { data: updatedData as any },
    });

    return { ok: true, fitting: updatedData, valetDispatch };
  }

  @Post('swatch-orders')
  async orderSwatchKit(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      productId: z.string().max(100),
      productName: z.string().min(2).max(200),
      shopId: z.string().max(100).optional(),
      swatches: z.array(z.string()).min(1).max(5).default(['Lanh Normandy Mộc', 'Lụa Tơ Tằm Bảo Lộc']),
      recipientName: z.string().min(2).max(100),
      phone: z.string().min(9).max(15),
      address: z.string().min(5).max(300),
      depositFee: z.number().default(50000),
    }).strict().parse(body);

    const swatchId = `SWATCH-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
    const voucherCode = `NX-SWATCH-${randomUUID().slice(0, 6).toUpperCase()}`;

    const swatchData = {
      id: swatchId,
      ...data,
      voucherCode,
      status: 'CONFIRMED',
      carrier: 'Bưu Điện EMS Chuyển Phát Nhanh',
      trackingNumber: `EMS-NX-${swatchId.slice(-6)}`,
      statusHistory: [
        {
          status: 'CONFIRMED',
          timestamp: new Date().toISOString(),
          note: 'Đã tiếp nhận yêu cầu gửi hộp thẻ mẫu vải và kích hoạt voucher bảo chứng 50.000₫.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'SWATCH_KIT_ORDER',
        entityId: swatchId,
        data: swatchData as any,
      },
    });

    return { ok: true, swatchOrder: swatchData, voucherCode };
  }

  @Get('swatch-orders')
  async getBuyerSwatchOrders(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'SWATCH_KIT_ORDER',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs.map(l => ({
      ...(l.data as any),
      createdAt: l.createdAt,
    }));
  }

  @Post('swatch-orders/tactile-curation')
  async curateSwatchBox(@Body() body: any) {
    const candidateSwatches = body?.candidateSwatches || [];
    return curateTactileFabricSwatchBox({
      candidateSwatches,
      boxCapacity: body?.boxCapacity,
      preferredPalette: body?.preferredPalette,
    });
  }

  @Post('swatch-orders/bespoke-rebate')
  async calculateBespokeRebate(@Body() body: any) {
    if (!body?.bespokeOrderGrossVnd) {
      throw new BadRequestException('Giá trị đơn may đo Bespoke là bắt buộc');
    }
    return calculateSwatchToBespokeRebateAndConversion({
      swatchDepositVnd: body.swatchDepositVnd,
      bespokeOrderGrossVnd: Number(body.bespokeOrderGrossVnd),
      dwellDaysSinceSwatchArrival: Number(body.dwellDaysSinceSwatchArrival ?? 5),
      swatchTouchCount: Number(body.swatchTouchCount ?? 3),
      materialPurityPct: Number(body.materialPurityPct ?? 95),
    });
  }

  @Post('concierge/valet-suitcase')
  async packValetSuitcase(@Body() body: any) {
    const requestedItems = body?.requestedItems || [];
    return packHomeFittingValetSuitcase({
      requestedItems,
      maxWeightCapacityKg: body?.maxWeightCapacityKg,
      maxVolumeCapacityLiters: body?.maxVolumeCapacityLiters,
    });
  }

  @Post('concierge/biomechanical-revise')
  async reviseBiomechanicalPattern(@Body() body: any) {
    if (!body?.bespokeId || !body?.garmentType) {
      throw new BadRequestException('Mã đơn Bespoke và loại trang phục là bắt buộc');
    }
    return mapFittingCorrectionBiomechanicalRevise({
      bespokeId: body.bespokeId,
      garmentType: body.garmentType,
      fittingIssues: body.fittingIssues || [],
      measuredArmscyePerimeterMm: Number(body.measuredArmscyePerimeterMm ?? 480),
      measuredSleeveHeadPerimeterMm: Number(body.measuredSleeveHeadPerimeterMm ?? 495),
    });
  }

  @Get('seller/shops/:shopId/swatch-orders')
  async getSellerSwatchOrders(@Req() req: Authed, @Param('shopId') shopId: string) {
    await this.auth.shop(req.user.id, shopId, false);
    const logs = await this.db.auditLog.findMany({
      where: { action: 'SWATCH_KIT_ORDER' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const actorIds = [...new Set(logs.map(l => l.actorId))];
    const users = await this.db.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    return logs
      .filter(l => {
        const d = (l.data as any) || {};
        return !d.shopId || d.shopId === shopId;
      })
      .map(l => {
        const user = userMap.get(l.actorId);
        return {
          id: l.entityId,
          ...((l.data as any) || {}),
          customerName: user?.name || (l.data as any)?.recipientName || 'Khách Hàng Atelier',
          customerEmail: user?.email || '',
          createdAt: l.createdAt,
        };
      });
  }

  @Post('seller/shops/:shopId/swatch-orders/:id/dispatch')
  async dispatchSwatchOrder(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);
    const parsed = z.object({
      carrier: z.string().max(100).default('EMS Hỏa Tốc'),
      trackingNumber: z.string().max(100).default(() => `EMS-${Date.now().toString().slice(-8)}`),
      notes: z.string().max(500).optional().default('Đã đóng gói bao bì phong bì sáp bảo quản mẫu vải.'),
    }).parse(body);

    const originalLog = await this.db.auditLog.findFirst({
      where: { action: 'SWATCH_KIT_ORDER', entityId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!originalLog) {
      throw new NotFoundException(`Không tìm thấy đơn mẫu vải [${id}]`);
    }

    const currentData = (originalLog.data as any) || {};
    if (currentData.shopId && currentData.shopId !== shopId) {
      throw new ForbiddenException('Đơn mẫu vải này thuộc xưởng may khác');
    }
    if (currentData.status === 'DISPATCHED') {
      return { ok: true, idempotent: true, swatchOrder: currentData };
    }
    const history = Array.isArray(currentData.statusHistory) ? currentData.statusHistory : [];
    history.push({
      status: 'DISPATCHED',
      timestamp: new Date().toISOString(),
      carrier: parsed.carrier,
      trackingNumber: parsed.trackingNumber,
      note: parsed.notes,
    });

    const updatedData = {
      ...currentData,
      status: 'DISPATCHED',
      carrier: parsed.carrier,
      trackingNumber: parsed.trackingNumber,
      dispatchNotes: parsed.notes,
      statusHistory: history,
      dispatchedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.auditLog.update({
      where: { id: originalLog.id },
      data: { data: updatedData as any },
    });

    return { ok: true, swatchOrder: updatedData };
  }

  @Post('seller/shops/:shopId/products/:productId/passport')
  @UseGuards(SignedIn)
  async updateProductPassport(
    @Req() req: Authed,
    @Param('shopId') shopId: string,
    @Param('productId') productId: string,
    @Body() body: unknown,
  ) {
    await this.auth.shop(req.user.id, shopId, false);

    const product = await this.db.product.findFirst({
      where: { id: productId, shopId },
      include: { shop: { select: { id: true, name: true, slug: true } } },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm thuộc xưởng của bạn');
    }

    const schema = z.object({
      originLocation: z.string().min(3).max(200),
      fiberComposition: z.string().min(3).max(200),
      weaveDensity: z.string().min(3).max(200),
      yarnLot: z.string().min(2).max(100),
      certifications: z.array(z.string().min(2).max(100)),
      ecoFootprint: z.object({
        carbonSavedKg: z.number().min(0),
        waterSavedLiters: z.number().min(0),
        naturalDye: z.boolean().default(true),
        microplasticFree: z.boolean().default(true),
      }),
      artisans: z.array(z.object({
        role: z.string().min(2).max(100),
        name: z.string().min(2).max(100),
        experienceYears: z.number().min(0).max(60),
        handcraftHours: z.number().min(1).max(500),
      })),
      careInstructions: z.array(z.string().min(2).max(200)).optional(),
      notes: z.string().max(500).optional(),
    });

    const parsed = schema.parse(body);
    const certCode = `NX-DPP-${productId.slice(0, 8).toUpperCase()}-SHA256`;
    const totalCraftHours = parsed.artisans.reduce((sum, a) => sum + a.handcraftHours, 0);

    const passportData = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      shopId: product.shop.id,
      shopName: product.shop.name,
      certificateCode: certCode,
      ...parsed,
      totalCraftHours,
      careInstructions: parsed.careInstructions || [
        'Giặt tay nhẹ nhàng bằng nước mát với xà phòng tự nhiên không chất tẩy',
        'Phơi phẳng tự nhiên trong bóng râm, tránh ánh nắng trực tiếp gay gắt',
        'Là ủi hơi nước chuyên dụng để giữ cấu trúc sợi vải bền lâu',
      ],
      digitalSignature: `0x${Buffer.from(product.id + certCode + totalCraftHours).toString('hex').slice(0, 40)}`,
      updatedAt: new Date().toISOString(),
    };

    const existingLog = await this.db.auditLog.findFirst({
      where: { action: 'PRODUCT_MATERIAL_PASSPORT', entityId: productId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingLog) {
      await this.db.auditLog.update({
        where: { id: existingLog.id },
        data: { data: passportData as any },
      });
    } else {
      await this.db.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'PRODUCT_MATERIAL_PASSPORT',
          entityId: productId,
          data: passportData as any,
        },
      });
    }

    return { ok: true, passport: passportData };
  }

  @Get('vault/material-passports')
  @UseGuards(SignedIn)
  async getVaultMaterialPassports(@Req() req: Authed) {
    const orders = await this.db.order.findMany({
      where: { userId: req.user.id },
      include: {
        shops: {
          include: {
            shop: { select: { id: true, name: true, slug: true } },
            items: true,
          },
        },
      },
      take: 20,
    });

    const productIds = [
      ...new Set(orders.flatMap(o => o.shops.flatMap(s => s.items.map(it => it.productId)))),
    ];
    const products = await this.db.product.findMany({
      where: { id: { in: productIds } },
      include: { shop: { select: { id: true, name: true, slug: true } } },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    const bespokeLogs = await this.db.auditLog.findMany({
      where: { actorId: req.user.id, action: 'VAULT_BESPOKE' },
      take: 20,
    });

    const passports: any[] = [];

    for (const [prodId, prod] of productMap.entries()) {
      const customLog = await this.db.auditLog.findFirst({
        where: { action: 'PRODUCT_MATERIAL_PASSPORT', entityId: prodId },
        orderBy: { createdAt: 'desc' },
      });
      if (customLog && customLog.data) {
        passports.push(customLog.data);
      } else {
        passports.push({
          productId: prod.id,
          productName: prod.name,
          productSlug: prod.slug,
          shopName: prod.shop.name,
          certificateCode: `NX-DPP-${prod.id.slice(0, 8).toUpperCase()}-SHA256`,
          originLocation: 'Normandy (Pháp) & Xưởng NÉP Atelier (Hà Nội)',
          fiberComposition: '100% Linen tự nhiên dệt mộc hữu cơ',
          weaveDensity: '185 GSM · Plain Weave',
          yarnLot: `LOT-NX-${prod.id.slice(0, 6).toUpperCase()}-2026`,
          totalCraftHours: 34,
          certifications: ['GOTS Organic', 'OEKO-TEX Standard 100 Class I'],
          ecoFootprint: { carbonSavedKg: 4.8, waterSavedLiters: 1850, naturalDye: true, microplasticFree: true },
          artisans: [
            { role: 'Nghệ nhân rập chính', name: 'Đỗ Văn Thành', experienceYears: 24, handcraftHours: 14 },
            { role: 'Thợ may thủ công', name: 'Nguyễn Thị Mai', experienceYears: 18, handcraftHours: 20 },
          ],
        });
      }
    }

    for (const b of bespokeLogs) {
      const d = (b.data as any) || {};
      passports.push({
        bespokeId: b.entityId,
        productName: d.title || 'Dự Án May Đo Thửa Riêng Bespoke',
        shopName: d.shopName || 'Atelier May Đo Cao Cấp',
        certificateCode: `NX-DPP-BESPOKE-${b.entityId.slice(0, 8).toUpperCase()}`,
        originLocation: 'Làng lụa tơ tằm Nha Xá & Xưởng May Đo Thửa Riêng',
        fiberComposition: d.fabric || '100% Lụa tơ tằm thủ công kết hợp tơ sen tự nhiên',
        weaveDensity: 'Dệt đũi tơ mộc 140x110/inch',
        yarnLot: `LOT-BESPOKE-${b.entityId.slice(0, 6).toUpperCase()}`,
        totalCraftHours: 48,
        certifications: ['NEXORA Master Tailor Accredited', 'Vietnam Heritage Craft'],
        ecoFootprint: { carbonSavedKg: 6.5, waterSavedLiters: 2400, naturalDye: true, microplasticFree: true },
        artisans: [
          { role: 'Thợ cả may đo độc bản', name: 'Đặng Quốc Huy', experienceYears: 28, handcraftHours: 32 },
          { role: 'Thợ đính kết thủ công', name: 'Phạm Thu Hằng', experienceYears: 15, handcraftHours: 16 },
        ],
      });
    }

    return { ok: true, passports };
  }

  @Post('inventory/safety-stock')
  async evaluateInventorySafetyStock(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = calculateSafetyStockAndReorderPoint(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/rationing-allocation')
  async allocateMultiChannelRationing(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = allocateMultiChannelStockRationing(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/preorder-queue-pdd')
  async forecastPreorderQueuePdd(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = forecastPreorderBacklogPromisedDeliveryDate(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/transshipment-consolidate')
  async optimizeTransshipmentConsolidation(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = optimizeMultiHubTransshipmentConsolidation(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/deadstock-markdown')
  async evaluateDeadstockMarkdown(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = calculateDeadstockFabricDecayMarkdown(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/remnant-upcycle-nest')
  async optimizeRemnantUpcyclingNest(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = optimizeRemnantPatternUpcyclingNest(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/fair-trade-floor')
  async evaluateFairTradePriceFloor(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = evaluateArtisanFairTradePriceFloor(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/epr-circularity-audit')
  async auditEprCircularity(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = auditAtelierEprCircularityIndex(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/artisan-multi-skill-schedule')
  async scheduleArtisanWorkforce(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = scheduleMultiSkillArtisanWorkforce(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/toc-bottleneck-audit')
  async auditTocBottleneck(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = detectTheoryOfConstraintsBottleneck(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/ergonomic-fatigue-analysis')
  async analyzeErgonomicFatigue(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = calculateErgonomicFatigueDecayCurve(parsed as any);
    return { ok: true, ...result };
  }

  @Post('inventory/rush-bespoke-arbitrate')
  async arbitrateRushBespoke(@Body() body: unknown) {
    const parsed = z.record(z.string(), z.unknown()).parse(body);
    const result = arbitratePriorityRushBespokeSurcharge(parsed as any);
    return { ok: true, ...result };
  }
}

