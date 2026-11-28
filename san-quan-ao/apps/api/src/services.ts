import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AdminOnly, Authed, SignedIn } from './auth';
import { Db, serial } from './db';
import {
  calculateTradeInResidualValuation,
  calculateCircularLcaImpact,
  evaluateAHPInspectionGrading,
  generateTamperProofTradeInVoucher,
  calculateCareActuarialRiskPremium,
  generateCryptographicZipSeal,
  verifyZipSealAuthenticity,
  estimateTextileRestorationKinetics,
  computeSupercriticalCo2SterilizationProfile,
  calculateColorHarmonyDeltaE00,
  calculateGarmentThermalComfortClo,
  optimizeCapsuleCombinatorics,
  calculateComboBundlePricing,
  calculateLiveFlashDropAllocation,
  calculatePollConsensus,
  matchOptimalStylist,
  evaluateRunwayFrameEntropy,
  evaluateP2PGarmentSwap,
  calculateCreatorPatronageWithholding,
  evaluateOOTDSpatialDispersion,
  calculateChallengePrizeDividend,
  classifyFashionStyleArchetypeMahalanobis,
  calculateFootwearAnthropometricSizing,
  calculateCostPerWearAmortization,
  evaluateHibernationMicroclimateMoldRisk,
  computeShapleyMultiTouchAttribution,
} from './algorithms';

const BASE_ESTIMATE: Record<string, number> = {
  'Túi xách': 3_500_000,
  'Áo khoác': 1_200_000,
  'Đầm / Váy': 900_000,
  'Giày dép': 1_500_000,
  'Phụ kiện': 700_000,
};

const CARE_FEES: Record<string, number> = {
  SPA_CLEANING: 250_000,
  LEATHER_RESTORE: 450_000,
  TAILORING: 180_000,
  AUTHENTICATION: 350_000,
};

function estimatePreliminary(
  category: string,
  conditionNote: string,
  brand: string = '',
  originalPrice?: number,
  ageMonths: number = 6,
  fabricType?: 'COTTON' | 'LINEN' | 'SILK' | 'WOOL' | 'POLYESTER' | 'LEATHER' | 'DENIM' | 'OTHER',
): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  estimatedValue: number;
  depreciationRate: number;
  lca: ReturnType<typeof calculateCircularLcaImpact>;
} {
  const valuation = calculateTradeInResidualValuation({
    category,
    brand,
    conditionNote,
    originalRetailPrice: originalPrice,
    ageMonths,
    fabricType,
  });

  const lca = calculateCircularLcaImpact({
    fabricType: fabricType ?? 'COTTON',
    weightGrams: 500,
    resaleGrade: valuation.grade,
  });

  return {
    grade: valuation.grade,
    estimatedValue: valuation.estimatedValue,
    depreciationRate: valuation.depreciationRate,
    lca,
  };
}

@Controller('trade-in')
@UseGuards(SignedIn)
export class TradeInController {
  constructor(@Inject(Db) private db: Db) {}

  @Get()
  list(@Req() req: Authed) {
    return this.db.tradeInRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Get(':id')
  async getDetail(@Req() req: Authed, @Param('id') id: string) {
    const item = await this.db.tradeInRequest.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!item) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
    const logs = await this.db.auditLog.findMany({
      where: { entityId: id },
      orderBy: { createdAt: 'asc' },
    });
    return { ...item, timeline: logs };
  }

  @Post('pre-valuation')
  preValuation(@Body() body: unknown) {
    const data = z.object({
      category: z.string().trim().min(2).max(60),
      brand: z.string().trim().min(1).max(80).optional().default(''),
      conditionNote: z.string().trim().max(500).optional().default(''),
      purchasePrice: z.number().int().min(0).max(500_000_000).optional(),
      ageMonths: z.number().int().min(0).max(120).optional().default(6),
      fabricType: z.enum(['COTTON', 'LINEN', 'SILK', 'WOOL', 'POLYESTER', 'LEATHER', 'DENIM', 'OTHER']).optional(),
      weightGrams: z.number().min(50).max(5000).optional().default(500),
    }).passthrough().parse(body ?? {});

    const valuation = calculateTradeInResidualValuation({
      category: data.category,
      brand: data.brand,
      conditionNote: data.conditionNote,
      originalRetailPrice: data.purchasePrice,
      ageMonths: data.ageMonths,
      fabricType: data.fabricType,
    });

    const lca = calculateCircularLcaImpact({
      fabricType: data.fabricType ?? 'COTTON',
      weightGrams: data.weightGrams,
      resaleGrade: valuation.grade,
    });

    return {
      success: true,
      ...valuation,
      lca,
    };
  }

  @Post()
  async submit(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      brand: z.string().trim().min(2).max(80),
      itemName: z.string().trim().min(3).max(120),
      category: z.string().trim().min(2).max(60),
      conditionNote: z.string().trim().min(5).max(500),
      imageUrl: z.string().trim().max(300).optional().default(''),
      originalPrice: z.number().int().min(0).max(500_000_000).optional(),
      ageMonths: z.number().int().min(0).max(120).optional().default(6),
      fabricType: z.enum(['COTTON', 'LINEN', 'SILK', 'WOOL', 'POLYESTER', 'LEATHER', 'DENIM', 'OTHER']).optional(),
    }).passthrough().parse(body);

    const { grade, estimatedValue, depreciationRate, lca } = estimatePreliminary(
      data.category,
      data.conditionNote,
      data.brand,
      data.originalPrice,
      data.ageMonths,
      data.fabricType,
    );
    return serial(this.db, async tx => {
      const created = await tx.tradeInRequest.create({
        data: {
          userId: req.user.id,
          brand: data.brand,
          itemName: data.itemName,
          category: data.category,
          conditionNote: data.conditionNote,
          imageUrl: data.imageUrl,
          grade,
          estimatedValue,
          status: 'AI_PRELIMINARY',
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'TRADEIN_SUBMIT',
          entityId: created.id,
          data: { grade, estimatedValue, depreciationRate, lca, brand: data.brand, category: data.category },
        },
      });
      return created;
    });
  }

  @Post(':id/cancel')
  async cancel(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown = {}) {
    const { reason } = z.object({
      reason: z.string().trim().max(500).optional().default('Hủy theo yêu cầu của khách hàng'),
    }).passthrough().parse(body ?? {});

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
      if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(existing.status)) {
        throw new BadRequestException('Không thể hủy yêu cầu Thu cũ đã hoàn tất hoặc đã có kết quả thẩm định');
      }
      const updated = await tx.tradeInRequest.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
      await tx.auditLog.create({
        data: { actorId: req.user.id, action: 'TRADEIN_CANCELLED', entityId: id, data: { reason } },
      });
      return updated;
    });
  }

  @Post(':id/pickup')
  async schedulePickup(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      slot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
      address: z.string().trim().min(5).max(300),
      securityBag: z.boolean().default(true),
      scheduledDate: z.string().optional(),
    }).strict().parse(body);

    const trackingCode = `NX-PICKUP-${randomUUID().slice(0, 6).toUpperCase()}`;
    const slotLabel = data.slot === 'MORNING' ? 'Buổi sáng (08:00 - 12:00)' : data.slot === 'AFTERNOON' ? 'Buổi chiều (13:30 - 17:30)' : 'Buổi tối (18:00 - 21:00)';

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
      if (['CANCELLED', 'REJECTED'].includes(existing.status)) {
        throw new ConflictException('Yêu cầu Thu cũ Đổi mới đã bị hủy hoặc từ chối, không thể đặt lịch thu gom');
      }

      // Update to HUB_INSPECTING if still preliminary
      const newStatus = existing.status === 'AI_PRELIMINARY' ? 'HUB_INSPECTING' : existing.status;
      const updated = await tx.tradeInRequest.update({
        where: { id },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'TRADEIN_PICKUP',
          entityId: id,
          data: {
            trackingCode,
            courier: 'VinFast Green Electric Van',
            slot: data.slot,
            slotLabel,
            address: data.address,
            securityBag: data.securityBag,
            scheduledDate: data.scheduledDate || new Date().toISOString(),
          },
        },
      });

      return { success: true, trackingCode, item: updated };
    });
  }

  @Post(':id/optical-auth')
  async saveOpticalAuth(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      target: z.enum(['WEAVE', 'ZIPPER', 'LABEL']),
      code: z.string().trim().min(3).max(80),
      matchScore: z.number().min(0).max(100).default(99.4),
      requestedHologramSeal: z.boolean().default(true),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
      if (['CANCELLED', 'REJECTED'].includes(existing.status)) {
        throw new ConflictException('Yêu cầu Thu cũ Đổi mới đã bị hủy hoặc từ chối');
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'TRADEIN_OPTICAL_CHECK',
          entityId: id,
          data: {
            ...data,
            luxStandard: '1000 Lux ISO 4915',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { success: true, authCode: data.code };
    });
  }

  @Post(':id/passport')
  async savePassport(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      fabricType: z.enum(['LINEN', 'SILK', 'COTTON', 'WOOL']),
      passportCode: z.string().trim().min(3).max(80),
      waterSaved: z.string().default('2.700 lít'),
      co2Reduced: z.string().default('3.2 kg CO2e'),
      chemicalSaved: z.string().default('0.85 kg'),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
      if (['CANCELLED', 'REJECTED'].includes(existing.status)) {
        throw new ConflictException('Yêu cầu Thu cũ Đổi mới đã bị hủy hoặc từ chối');
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'TRADEIN_LCA_PASSPORT',
          entityId: id,
          data: {
            ...data,
            certifiedBy: 'NEXORA ESG Zero-Landfill',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { success: true, passportCode: data.passportCode };
    });
  }

  @Post(':id/nft-mint')
  async mintNft(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      tokenId: z.string().trim().min(3).max(80),
      txHash: z.string().trim().min(10).max(120),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Thu cũ Đổi mới');
      if (['CANCELLED', 'REJECTED'].includes(existing.status)) {
        throw new ConflictException('Yêu cầu Thu cũ Đổi mới đã bị hủy hoặc từ chối, không thể đúc NFT');
      }
      const priorNft = await tx.auditLog.findFirst({
        where: { entityId: id, action: 'TRADEIN_NFT_MINTED' },
      });
      if (priorNft) {
        throw new ConflictException('Chứng chỉ NFT cho vật phẩm Thu cũ này đã được đúc trước đó');
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'TRADEIN_NFT_MINTED',
          entityId: id,
          data: {
            tokenId: data.tokenId,
            txHash: data.txHash,
            network: 'Nexora Eco-Chain (Polygon Layer-2)',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { success: true, tokenId: data.tokenId, txHash: data.txHash };
    });
  }
}

@Controller('vas-care')
@UseGuards(SignedIn)
export class CareController {
  constructor(@Inject(Db) private db: Db) {}

  @Get()
  list(@Req() req: Authed) {
    return this.db.careBooking.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Post('estimate-premium')
  estimatePremium(@Body() body: unknown) {
    const data = z.object({
      declaredValueVnd: z.number().int().min(0).max(100_000_000),
      serviceType: z.enum(['SPA_CLEANING', 'LEATHER_RESTORE', 'TAILORING', 'AUTHENTICATION']),
      fabricMatrix: z.enum(['SILK_CASHMERE', 'VEGETABLE_LEATHER', 'FINE_WOOL', 'LINEN_COTTON', 'SYNTHETIC']).optional(),
      transitMode: z.enum(['ECO_ELECTRIC_VAN', 'EXPRESS_COURIER', 'ATELIER_DIRECT']).optional(),
    }).passthrough().parse(body ?? {});

    const premium = calculateCareActuarialRiskPremium({
      declaredValueVnd: data.declaredValueVnd,
      serviceType: data.serviceType,
      fabricMatrix: data.fabricMatrix,
      transitMode: data.transitMode,
    });

    return { success: true, ...premium };
  }

  @Post('diagnose-kinetics')
  diagnoseKinetics(@Body() body: unknown) {
    const data = z.object({
      garmentType: z.enum(['WOOL_BLAZER', 'SILK_DRESS', 'VEG_LEATHER', 'LINEN_SHIRT', 'CASHMERE_KNIT']),
      symptom: z.enum(['STAIN_YELLOW', 'STAIN_OIL', 'MOLD_SPORES', 'COLOR_FADE', 'LEATHER_DRY']),
      severityLevel: z.number().int().min(1).max(5).optional(),
      treatmentMethod: z.enum(['SUPERCRITICAL_CO2', 'BIO_ENZYME_SPA', 'OZONE_CHAMBER', 'ORGANIC_OILING']).optional(),
    }).passthrough().parse(body ?? {});

    const kinetics = estimateTextileRestorationKinetics(data);
    return { success: true, ...kinetics };
  }

  @Post('co2-profile')
  co2Profile(@Body() body: unknown) {
    const data = z.object({
      preset: z.enum(['SILK_CASHMERE', 'LEATHER_BAGS', 'EVENING_GOWNS', 'WOOL_SUIT']),
      targetDisinfectionLevel: z.enum(['LOG_3_SURFACE', 'LOG_4_DEEP_SPORE', 'LOG_5_MEDICAL_GRADE']).optional(),
    }).passthrough().parse(body ?? {});

    const profile = computeSupercriticalCo2SterilizationProfile(data);
    return { success: true, ...profile };
  }

  @Post()
  async book(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      itemName: z.string().trim().min(3).max(120),
      serviceType: z.enum(['SPA_CLEANING', 'LEATHER_RESTORE', 'TAILORING', 'AUTHENTICATION']),
      insuredValue: z.number().int().min(0).max(100_000_000),
      notes: z.string().trim().max(500).optional().default(''),
      fabricMatrix: z.enum(['SILK_CASHMERE', 'VEGETABLE_LEATHER', 'FINE_WOOL', 'LINEN_COTTON', 'SYNTHETIC']).optional(),
      transitMode: z.enum(['ECO_ELECTRIC_VAN', 'EXPRESS_COURIER', 'ATELIER_DIRECT']).optional(),
    }).passthrough().parse(body);

    const riskPremium = calculateCareActuarialRiskPremium({
      declaredValueVnd: data.insuredValue,
      serviceType: data.serviceType,
      fabricMatrix: data.fabricMatrix,
      transitMode: data.transitMode,
    });

    const fee = riskPremium.totalFee;
    const tempBookingId = randomUUID();
    const zipSeal = generateCryptographicZipSeal({
      bookingId: tempBookingId,
      userId: req.user.id,
      serviceType: data.serviceType,
      hubCode: 'SGN',
    });
    const zipSealCode = zipSeal.sealCode;

    return serial(this.db, async tx => {
      const created = await tx.careBooking.create({
        data: {
          userId: req.user.id,
          itemName: data.itemName,
          serviceType: data.serviceType,
          zipSealCode,
          insuredValue: data.insuredValue,
          fee,
          notes: data.notes,
          status: 'BOOKED',
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'CARE_BOOK',
          entityId: created.id,
          data: {
            zipSealCode,
            fee,
            actuarialUnderwriting: riskPremium,
            hmacSignature: zipSeal.hmacSignature,
          },
        },
      });
      return created;
    });
  }

  @Get(':id')
  async getDetail(@Req() req: Authed, @Param('id') id: string) {
    const booking = await this.db.careBooking.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!booking) throw new NotFoundException('Không tìm thấy đơn chăm sóc đồ hiệu');
    const logs = await this.db.auditLog.findMany({
      where: { entityId: id },
      orderBy: { createdAt: 'asc' },
    });
    return { ...booking, timeline: logs };
  }

  @Post(':id/cancel')
  async cancel(@Req() req: Authed, @Param('id') id: string) {
    return serial(this.db, async tx => {
      const booking = await tx.careBooking.findFirst({
        where: { id, userId: req.user.id },
      });
      if (!booking) throw new NotFoundException('Không tìm thấy đơn chăm sóc đồ hiệu');
      if (booking.status === 'CANCELLED') return booking;
      if (booking.status !== 'BOOKED') {
        throw new ConflictException('Không thể hủy đơn chăm sóc khi trang phục đã được thu gom hoặc đang xử lý');
      }
      const updated = await tx.careBooking.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
      await tx.auditLog.create({
        data: { actorId: req.user.id, action: 'CARE_CANCELLED', entityId: id, data: {} },
      });
      return updated;
    });
  }
}

@Controller('admin/services')
@UseGuards(SignedIn, AdminOnly)
export class AdminServicesController {
  constructor(@Inject(Db) private db: Db) {}

  @Get('trade-ins')
  listTradeIns() {
    return this.db.tradeInRequest.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Post('trade-ins/:id/inspect')
  async inspectTradeIn(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      grade: z.enum(['S', 'A', 'B', 'C', 'D']).optional(),
      finalValue: z.number().int().min(0).max(200_000_000).optional(),
      status: z.enum(['HUB_INSPECTING', 'APPROVED', 'REJECTED']),
      note: z.string().trim().max(500).optional().default(''),
      opticalFactors: z.object({
        fiberStructureScore: z.number().min(0).max(100),
        hardwareSeamScore: z.number().min(0).max(100),
        colorRetentionScore: z.number().min(0).max(100),
        stainReversibilityScore: z.number().min(0).max(100),
      }).optional(),
    }).passthrough().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Trade-In');
      if (existing.status === 'CANCELLED') {
        throw new ConflictException('Yêu cầu Trade-In đã bị khách hàng hủy, không thể thẩm định');
      }
      if (existing.redeemedOrderId && data.status !== 'APPROVED') {
        throw new ConflictException('Voucher Trade-In đã được sử dụng trong đơn hàng, không thể đổi trạng thái');
      }

      let assignedGrade: 'S' | 'A' | 'B' | 'C' | 'D' = (data.grade as any) ?? existing.grade;
      let finalVal = data.finalValue ?? existing.estimatedValue;
      let ahpResult: ReturnType<typeof evaluateAHPInspectionGrading> | null = null;

      if (data.opticalFactors) {
        ahpResult = evaluateAHPInspectionGrading(data.opticalFactors);
        assignedGrade = ahpResult.grade;
        if (data.finalValue === undefined) {
          const retention = assignedGrade === 'S' ? 1.0 : assignedGrade === 'A' ? 0.9 : assignedGrade === 'B' ? 0.75 : assignedGrade === 'C' ? 0.5 : 0.3;
          finalVal = Math.round(existing.estimatedValue * retention);
        }
      }

      let voucherCode = existing.voucherCode;
      let voucherDetails: ReturnType<typeof generateTamperProofTradeInVoucher> | null = null;
      if (data.status === 'APPROVED') {
        if (!voucherCode) {
          voucherDetails = generateTamperProofTradeInVoucher({
            tradeInId: id,
            grade: assignedGrade,
            amountVnd: finalVal,
            userId: existing.userId,
          });
          voucherCode = voucherDetails.code;
        }
      }

      const updated = await tx.tradeInRequest.update({
        where: { id },
        data: { grade: assignedGrade, finalValue: finalVal, status: data.status, voucherCode },
      });
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: `TRADEIN_${data.status}`,
          entityId: id,
          data: {
            grade: assignedGrade,
            finalValue: finalVal,
            voucherCode,
            voucherSignature: voucherDetails?.signatureHex,
            voucherExpiresAt: voucherDetails?.expiresAt?.toISOString(),
            ahpInspection: ahpResult,
            note: data.note,
          },
        },
      });
      return { ...updated, ahpInspection: ahpResult, voucherDetails };
    });
  }

  @Get('care')
  listCare() {
    return this.db.careBooking.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Post('care/:id/status')
  async updateCareStatus(@Req() req: Authed, @Param('id') id: string, @Body() body: unknown) {
    const data = z.object({
      status: z.enum(['BOOKED', 'SEALED_PICKUP', 'OPTICAL_CHECK', 'IN_CARE', 'RETURNED', 'CANCELLED']),
      note: z.string().trim().max(500).optional(),
      sealCode: z.string().trim().optional(),
      opticalDeltaE: z.number().min(0).max(10).optional(),
      tensileRetentionPct: z.number().min(0).max(100).optional(),
    }).passthrough().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.careBooking.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy đơn chăm sóc đồ hiệu');
      if (existing.status !== data.status) {
        const allowedCareTransitions: Record<string, string[]> = {
          BOOKED: ['SEALED_PICKUP', 'OPTICAL_CHECK', 'CANCELLED'],
          SEALED_PICKUP: ['OPTICAL_CHECK', 'IN_CARE', 'CANCELLED'],
          OPTICAL_CHECK: ['IN_CARE', 'RETURNED', 'CANCELLED'],
          IN_CARE: ['RETURNED'],
          RETURNED: [],
          CANCELLED: [],
        };
        if (!(allowedCareTransitions[existing.status] ?? []).includes(data.status)) {
          throw new ConflictException(`Không thể chuyển đơn chăm sóc từ ${existing.status} sang ${data.status}`);
        }
      }

      // Xác thực mã niêm phong Zip-seal quang học nếu chuyển sang các trạng thái kiểm định
      let sealAuth: ReturnType<typeof verifyZipSealAuthenticity> | null = null;
      const targetSeal = data.sealCode || existing.zipSealCode;
      if (targetSeal && (data.status === 'SEALED_PICKUP' || data.status === 'OPTICAL_CHECK' || data.status === 'RETURNED')) {
        sealAuth = verifyZipSealAuthenticity(targetSeal);
      }

      const updated = await tx.careBooking.update({ where: { id }, data: { status: data.status } });
      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: `CARE_${data.status}`,
          entityId: id,
          data: {
            note: data.note || '',
            sealVerification: sealAuth,
            opticalDeltaE: data.opticalDeltaE,
            tensileRetentionPct: data.tensileRetentionPct,
          },
        },
      });
      return { ...updated, sealVerification: sealAuth };
    });
  }
}

@Controller('affiliate')
@UseGuards(SignedIn)
export class AffiliateController {
  constructor(@Inject(Db) private db: Db) {}

  @Get('summary')
  async summary(@Req() req: Authed) {
    const items = await this.db.affiliateEarning.findMany({
      where: { kocUserId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const now = new Date();
    const held = items.filter(i => i.status === 'HELD' && i.holdUntil > now).reduce((s, i) => s + i.amount, 0);
    const available = items.filter(i => i.status === 'AVAILABLE' || (i.status === 'HELD' && i.holdUntil <= now)).reduce((s, i) => s + i.amount, 0);
    const cancelled = items.filter(i => i.status === 'CANCELLED').reduce((s, i) => s + i.amount, 0);
    return { held, available, cancelled, items };
  }

  @Post('shapley-attribution')
  evaluateShapleyAttribution(@Body() body: unknown) {
    const data = z.object({
      totalCommissionPoolVnd: z.number().int().min(0).max(100_000_000),
      conversionTimestampMs: z.number().int().min(0).optional(),
      halfLifeHours: z.number().positive().max(720).optional(),
      touchpoints: z.array(z.object({
        kocUserId: z.string().min(1).max(100),
        channel: z.enum(['OOTD_POST', 'LOOKBOOK_PIN', 'LIVESTREAM_HOST', 'DIRECT_SHARE_LINK']),
        timestampMs: z.number().int().min(0),
        engagementQualityScore: z.number().min(0.5).max(2.0).optional(),
      })).max(50),
    }).strict().parse(body);

    return { ok: true, ...computeShapleyMultiTouchAttribution(data) };
  }

  @Get('attribution-insights')
  async getAttributionInsights(@Req() req: Authed) {
    const [posts, earnings] = await Promise.all([
      this.db.post.findMany({
        where: { authorId: req.user.id, status: 'PUBLISHED' },
        select: { id: true, createdAt: true, _count: { select: { reactions: true, saved: true, tags: true } } },
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.affiliateEarning.findMany({
        where: { kocUserId: req.user.id, status: { not: 'CANCELLED' } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const totalPool = earnings.reduce((s, e) => s + e.amount, 0);
    const syntheticTouches = [
      ...posts.map(p => ({
        kocUserId: req.user.id,
        channel: 'OOTD_POST' as const,
        timestampMs: p.createdAt.getTime(),
        engagementQualityScore: Math.min(2.0, 1.0 + (p._count.reactions + p._count.saved * 2) * 0.05),
      })),
      ...earnings.map(e => ({
        kocUserId: req.user.id,
        channel: 'DIRECT_SHARE_LINK' as const,
        timestampMs: e.createdAt.getTime(),
        engagementQualityScore: 1.0,
      })),
    ];

    const shapley = computeShapleyMultiTouchAttribution({
      totalCommissionPoolVnd: totalPool,
      touchpoints: syntheticTouches,
    });

    return {
      ok: true,
      publishedShoppablePosts: posts.length,
      activeEarningsCount: earnings.length,
      shapley,
    };
  }
}

@Controller('vault')
@UseGuards(SignedIn)
export class VaultController {
  constructor(@Inject(Db) private db: Db) {}

  @Get()
  async getVault(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: { in: [
          'VAULT_PASSPORT',
          'VAULT_LOOKBOOK',
          'VAULT_BESPOKE',
          'VAULT_BOOKING',
          'VAULT_SWAP',
          'VAULT_CIRCULAR_PASSPORT',
          'VAULT_PATRONAGE',
          'VAULT_EVENT',
          'VAULT_MOODBOARD',
          'VAULT_HIBERNATION',
          'FABRIC_VAULT_RESERVE',
        ] },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const passportLog = logs.find(l => l.action === 'VAULT_PASSPORT');
    const lookbooks = logs.filter(l => l.action === 'VAULT_LOOKBOOK').map(l => l.data);
    const bespoke = logs.filter(l => l.action === 'VAULT_BESPOKE').map(l => l.data);
    const bookings = logs.filter(l => l.action === 'VAULT_BOOKING').map(l => l.data);
    const swaps = logs.filter(l => l.action === 'VAULT_SWAP').map(l => l.data);
    const circularPassports = logs.filter(l => l.action === 'VAULT_CIRCULAR_PASSPORT').map(l => l.data);
    const patronages = logs.filter(l => l.action === 'VAULT_PATRONAGE').map(l => l.data);
    const events = logs.filter(l => l.action === 'VAULT_EVENT').map(l => l.data);
    const moodboards = logs.filter(l => l.action === 'VAULT_MOODBOARD').map(l => l.data);
    const hibernations = logs.filter(l => l.action === 'VAULT_HIBERNATION').map(l => l.data);
    const fabricReserves = logs.filter(l => l.action === 'FABRIC_VAULT_RESERVE').map(l => l.data);

    return {
      passport: passportLog?.data ?? null,
      lookbooks,
      bespoke,
      bookings,
      swaps,
      circularPassports,
      patronages,
      events,
      moodboards,
      hibernations,
      fabricReserves,
    };
  }

  @Get('fabric-reserves')
  async listFabricReserves(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'FABRIC_VAULT_RESERVE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('fabric-reserves/:id/commission')
  async commissionFromFabric(
    @Req() req: Authed,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = z.object({
      productName: z.string().min(1).max(200),
      shopId: z.string().default('shop-nep'),
      shopName: z.string().default('NÉP Studio'),
      monogram: z.string().max(50).default(''),
      lining: z.string().max(100).default('Lụa Habotai tự nhiên cùng tông màu'),
      notes: z.string().max(500).optional().default(''),
      passport: z.any().optional(),
    }).passthrough().parse(body);

    return serial(this.db, async tx => {
      const fabricLog = await tx.auditLog.findFirst({
        where: {
          actorId: req.user.id,
          action: 'FABRIC_VAULT_RESERVE',
          entityId: id,
        },
      });

      if (!fabricLog) throw new NotFoundException('Không tìm thấy chứng thư đặt chỗ vải di sản');
      const reserveData = (fabricLog.data as any) || {};
      if (reserveData.allocationStatus === 'COMMISSIONED') {
        throw new ConflictException('Phần vải dự trữ này đã được chuyển đổi sang đơn may đo Bespoke trước đó');
      }

      const bespokeId = 'BESPOKE-VAULT-' + Date.now().toString(36).toUpperCase() + '-' + randomUUID().slice(0, 4).toUpperCase();
      const bespokeData = {
        id: bespokeId,
        productName: parsed.productName,
        shopId: parsed.shopId,
        shopName: parsed.shopName,
        monogram: parsed.monogram,
        lining: parsed.lining,
        notes: parsed.notes,
        passport: parsed.passport || null,
        stage: 'PENDING_REVIEW',
        queuePos: 2,
        isHeritageFabric: true,
        fabricReserveId: id,
        fabricBoltCode: reserveData.fabricCode || reserveData.fabricId,
        fabricName: reserveData.fabricName,
        fabricOrigin: reserveData.origin,
        meterageAllocated: reserveData.meters,
        depositCredited: reserveData.depositAmount,
        fabricCertificate: reserveData.certificateCode || reserveData.certificate,
        createdAt: new Date().toISOString(),
      };

      await tx.auditLog.update({
        where: { id: fabricLog.id },
        data: {
          data: {
            ...reserveData,
            allocationStatus: 'COMMISSIONED',
            allocatedToBespokeId: bespokeId,
            allocatedAt: new Date().toISOString(),
            allocatedShopId: parsed.shopId,
            allocatedShopName: parsed.shopName,
          } as any,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'VAULT_BESPOKE',
          entityId: bespokeId,
          data: bespokeData as any,
        },
      });

      return { ok: true, bespoke: bespokeData };
    });
  }

  @Get('passport')
  async getPassport(@Req() req: Authed) {
    const log = await this.db.auditLog.findFirst({
      where: {
        actorId: req.user.id,
        action: 'VAULT_PASSPORT',
      },
      orderBy: { createdAt: 'desc' },
    });
    return { ok: true, passport: log?.data ?? null };
  }

  @Post('passport')
  async savePassport(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      height: z.number().min(100).max(250).optional(),
      weight: z.number().min(30).max(200).optional(),
      chest: z.number().min(50).max(180).optional(),
      waist: z.number().min(40).max(160).optional(),
      hip: z.number().min(50).max(180).optional(),
      fitPref: z.string().max(40).optional(),
      footLength: z.number().optional(),
      footWidth: z.number().optional(),
      archType: z.string().max(40).optional(),
    }).passthrough().parse(body);

    let footwearSizing: ReturnType<typeof calculateFootwearAnthropometricSizing> | null = null;
    if (data.footLength && data.footWidth) {
      footwearSizing = calculateFootwearAnthropometricSizing({
        footLengthMm: data.footLength,
        footWidthMm: data.footWidth,
        archType: (data.archType as any) || 'STANDARD',
      });
    }

    const payload = {
      ...data,
      footwearSizing,
    };

    const log = await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_PASSPORT',
        entityId: req.user.id,
        data: payload as any,
      },
    });
    return { ok: true, passport: log.data };
  }

  @Post('style-archetype/classify')
  classifyStyleArchetype(@Body() body: unknown) {
    const data = z.object({
      colorPaletteChoice: z.number().int().min(0).max(3).default(0),
      contextChoice: z.number().int().min(0).max(3).default(0),
      tactileChoice: z.number().int().min(0).max(3).default(0),
      ethosChoice: z.number().int().min(0).max(3).default(0),
      preferredFit: z.enum(['REGULAR', 'OVERSIZED', 'SLIM']).optional().default('REGULAR'),
    }).passthrough().parse(body ?? {});

    const classification = classifyFashionStyleArchetypeMahalanobis(data);
    return { ok: true, ...classification };
  }

  @Post('passport/footwear-sizing')
  calculateFootwearSizingEndpoint(@Body() body: unknown) {
    const data = z.object({
      footLengthMm: z.number().min(180).max(340).default(255),
      footWidthMm: z.number().min(60).max(140).default(96),
      archType: z.enum(['STANDARD', 'FLAT', 'HIGH']).default('STANDARD'),
      shoeCategory: z.enum(['LOAFER_DERBY', 'SNEAKER', 'BOOT', 'HEEL_SANDAL']).optional().default('LOAFER_DERBY'),
    }).passthrough().parse(body ?? {});

    const sizing = calculateFootwearAnthropometricSizing(data);
    return { ok: true, ...sizing };
  }

  @Post('wardrobe/cost-per-wear')
  calculateCostPerWearEndpoint(@Body() body: unknown) {
    const data = z.object({
      itemPurchasePriceVnd: z.number().int().min(50000).default(2400000),
      maintenanceCostsVnd: z.number().int().min(0).default(180000),
      wearsToDate: z.number().int().min(1).default(28),
      garmentType: z.string().default('Áo Khoác Blazer Linen Normandy'),
      fabricCategory: z.enum(['LINEN_FLAX', 'MERINO_WOOL', 'MULBERRY_SILK', 'ORGANIC_COTTON']).default('LINEN_FLAX'),
      purchaseDateIso: z.string().optional(),
      currentDateIso: z.string().optional(),
    }).passthrough().parse(body ?? {});

    const cpw = calculateCostPerWearAmortization(data);
    return { ok: true, ...cpw };
  }

  @Post('hibernation/microclimate-eval')
  evaluateMicroclimateEndpoint(@Body() body: unknown) {
    const data = z.object({
      ambientTempC: z.number().min(5).max(50).default(31.5),
      relativeHumidityPct: z.number().min(10).max(100).default(78),
      durationMonths: z.union([z.literal(3), z.literal(6), z.literal(12)]).default(6),
      fabricType: z.enum(['WOOL_CASHMERE', 'NATURAL_SILK', 'NORMANDY_LINEN']).default('WOOL_CASHMERE'),
      packagingMethod: z.enum(['ZIP_SEAL_BIO_SILICA', 'STANDARD_POLYBAG', 'UNPROTECTED_OPEN']).default('ZIP_SEAL_BIO_SILICA'),
    }).passthrough().parse(body ?? {});

    const evalResult = evaluateHibernationMicroclimateMoldRisk(data);
    return { ok: true, ...evalResult };
  }

  @Post('lookbook/color-harmony')
  calculateHarmony(@Body() body: unknown) {
    const data = z.object({
      hexColors: z.array(z.string()).min(1).max(10),
    }).passthrough().parse(body ?? {});

    const harmony = calculateColorHarmonyDeltaE00(data.hexColors);
    return { ok: true, ...harmony };
  }

  @Post('lookbook/thermal-comfort')
  calculateThermalComfort(@Body() body: unknown) {
    const data = z.object({
      pieces: z.array(z.object({
        id: z.string(),
        category: z.enum(['top', 'bottom', 'outer']),
        material: z.string().default(''),
      })).min(1),
      ambientTempC: z.number().min(-20).max(50),
      windSpeedMps: z.number().min(0).max(30).optional().default(1.0),
    }).passthrough().parse(body ?? {});

    const comfort = calculateGarmentThermalComfortClo(data);
    return { ok: true, ...comfort };
  }

  @Post('lookbook/capsule-optimizer')
  optimizeCapsule(@Body() body: unknown) {
    const data = z.object({
      pieces: z.array(z.object({
        id: z.string(),
        name: z.string(),
        category: z.enum(['top', 'bottom', 'outer']),
        price: z.number().int().min(0),
        material: z.string().default(''),
      })).min(2),
    }).passthrough().parse(body ?? {});

    const optimization = optimizeCapsuleCombinatorics(data.pieces);
    return { ok: true, ...optimization };
  }

  @Post('lookbook/combo-pricing')
  calculateBundlePricing(@Body() body: unknown) {
    const data = z.object({
      items: z.array(z.object({
        id: z.string(),
        price: z.number().int().min(0),
        category: z.string().default('top'),
      })).min(1),
      discountTierPct: z.number().min(0).max(50).optional(),
    }).passthrough().parse(body ?? {});

    const pricing = calculateComboBundlePricing(data);
    return { ok: true, ...pricing };
  }

  @Post('live/flash-velocity')
  async calculateFlashVelocity(@Body() body: unknown) {
    const data = z.object({
      viewers: z.number().int().min(1).default(1200),
      elapsedSeconds: z.number().min(0).default(60),
      windowSeconds: z.number().int().min(10).default(900),
      initialStock: z.number().int().min(1).default(20),
      reservedCount: z.number().int().min(0).default(0),
      decayRateAlpha: z.number().min(0).max(1).optional(),
      buyerTier: z.enum(['VIP_DIAMOND', 'VIP_GOLD', 'STANDARD']).default('STANDARD'),
      requestedQuantity: z.number().int().min(1).max(5).default(1),
    }).passthrough().parse(body ?? {});

    const result = calculateLiveFlashDropAllocation(data);
    return { ok: true, ...result };
  }

  @Post('live/poll-consensus')
  async calculateLivePoll(@Body() body: unknown) {
    const data = z.object({
      votes: z.record(z.string(), z.number().int().min(0)),
      confidenceZ: z.number().min(1).max(3).optional().default(1.96),
      consensusThreshold: z.number().min(0.1).max(0.9).optional().default(0.35),
    }).passthrough().parse(body ?? {});

    const result = calculatePollConsensus(data);
    return { ok: true, ...result };
  }

  @Post('live/stylist-match')
  async matchStylistEndpoint(@Body() body: unknown) {
    const data = z.object({
      customerArchetype: z.string().default('QUIET_LUXURY'),
      consultFormat: z.enum(['VIRTUAL', 'FLAGSHIP', 'SWATCH_BOX']).default('VIRTUAL'),
      requestedSlot: z.string().optional(),
      vipTier: z.enum(['DIAMOND', 'GOLD', 'SILVER', 'STANDARD']).default('STANDARD'),
      notes: z.string().max(500).optional(),
    }).passthrough().parse(body ?? {});

    const result = matchOptimalStylist(data);
    return { ok: true, ...result };
  }

  @Post('live/runway-entropy')
  async evaluateRunwayEntropy(@Body() body: unknown) {
    const data = z.object({
      angle: z.string().default('CATWALK'),
      productName: z.string().default('Áo khoác Blazer Linen cấu trúc nhẹ'),
      price: z.number().int().min(0).default(1250000),
      timestamp: z.string().optional(),
      lookId: z.string().optional(),
    }).passthrough().parse(body ?? {});

    const result = evaluateRunwayFrameEntropy(data);
    return { ok: true, ...result };
  }

  @Get('lookbooks')
  async listLookbooks(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_LOOKBOOK',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('lookbook')
  async saveLookbook(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      title: z.string().min(1).max(200),
      items: z.array(z.any()).default([]),
      harmonyScore: z.number().optional(),
      palette: z.string().optional(),
      hexColors: z.array(z.string()).optional(),
    }).passthrough().parse(body);

    let colorAnalysis: ReturnType<typeof calculateColorHarmonyDeltaE00> | null = null;
    const colorsToAnalyze = data.hexColors || (Array.isArray(data.items) ? data.items.map((i: any) => i.colorHex || i.hex).filter(Boolean) : []);
    if (colorsToAnalyze.length >= 2) {
      colorAnalysis = calculateColorHarmonyDeltaE00(colorsToAnalyze);
    }

    let runwayFrameAnalysis: ReturnType<typeof evaluateRunwayFrameEntropy> | null = null;
    if ((data as any).angle) {
      runwayFrameAnalysis = evaluateRunwayFrameEntropy({
        angle: (data as any).angle,
        productName: data.title,
        price: Number((data as any).price) || 1200000,
        lookId: data.id,
      });
    }

    const payload = {
      ...data,
      colorAnalysis,
      runwayFrameAnalysis,
      harmonyScore: data.harmonyScore ?? colorAnalysis?.overallHarmonyScore ?? 92,
      rarityTier: runwayFrameAnalysis?.rarityTier,
      collectorScore: runwayFrameAnalysis?.collectorScore,
      provenanceHash: runwayFrameAnalysis?.provenanceHash,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_LOOKBOOK',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, lookbook: payload };
  }

  @Delete('lookbooks/:id')
  async deleteLookbook(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_LOOKBOOK',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Get('capsules')
  async listCapsules(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_CAPSULE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('capsule')
  async saveCapsule(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      title: z.string().min(1).max(200),
      pieces: z.array(z.any()),
      outfitsCount: z.number().default(6),
      estimatedCostPerWear: z.number().default(18500),
      totalInvestment: z.number().min(0),
      bundleDiscount: z.number().min(0).default(0),
      palette: z.string().optional(),
      notes: z.string().max(500).optional(),
    }).passthrough().parse(body);

    let capsuleAnalysis: ReturnType<typeof optimizeCapsuleCombinatorics> | null = null;
    if (Array.isArray(data.pieces) && data.pieces.length >= 2) {
      capsuleAnalysis = optimizeCapsuleCombinatorics(data.pieces.map((p: any) => ({
        id: p.id || randomUUID(),
        name: p.name || 'Trang phục Capsule',
        category: p.category || (p.material?.toLowerCase().includes('áo') ? 'top' : p.material?.toLowerCase().includes('khoác') ? 'outer' : 'bottom'),
        price: Number(p.price) || 500000,
        material: p.material || '',
      })));
    }

    const payload = {
      ...data,
      capsuleAnalysis,
      outfitsCount: capsuleAnalysis ? capsuleAnalysis.totalOutfitsCount : data.outfitsCount,
      bundleDiscount: capsuleAnalysis ? capsuleAnalysis.bundleSavingsVnd : data.bundleDiscount,
      costPerWear180Days: capsuleAnalysis?.costPerWear180Days,
      costPerWear365Days: capsuleAnalysis?.costPerWear365Days,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_CAPSULE',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, capsule: payload };
  }

  @Delete('capsules/:id')
  async deleteCapsule(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_CAPSULE',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Get('bespoke')
  async listBespoke(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_BESPOKE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('bespoke')
  async saveBespoke(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      productName: z.string().min(1).max(200),
      monogram: z.string().max(50),
      lining: z.string().max(100),
      notes: z.string().max(500).optional().default(''),
      queuePos: z.number().default(7),
    }).passthrough().parse(body);

    return serial(this.db, async tx => {
      if ((data as any).fabricReserveId) {
        const reserveId = (data as any).fabricReserveId;
        const fabricLog = await tx.auditLog.findFirst({
          where: {
            actorId: req.user.id,
            action: 'FABRIC_VAULT_RESERVE',
            entityId: reserveId,
          },
        });
        if (fabricLog) {
          const reserveData = (fabricLog.data as any) || {};
          if (reserveData.allocationStatus === 'COMMISSIONED') {
            throw new ConflictException('Phần vải dự trữ này đã được ủy thác cho một đơn may đo khác');
          }
          (data as any).isHeritageFabric = true;
          (data as any).fabricBoltCode = (data as any).fabricBoltCode || reserveData.fabricCode || reserveData.fabricId;
          (data as any).fabricName = (data as any).fabricName || reserveData.fabricName;
          (data as any).fabricOrigin = (data as any).fabricOrigin || reserveData.origin;
          (data as any).meterageAllocated = (data as any).meterageAllocated || reserveData.meters;
          (data as any).depositCredited = (data as any).depositCredited || reserveData.depositAmount;
          (data as any).fabricCertificate = (data as any).fabricCertificate || reserveData.certificateCode || reserveData.certificate;

          await tx.auditLog.update({
            where: { id: fabricLog.id },
            data: {
              data: {
                ...reserveData,
                allocationStatus: 'COMMISSIONED',
                allocatedToBespokeId: data.id,
                allocatedAt: new Date().toISOString(),
                allocatedShopId: (data as any).shopId || 'shop-nep',
                allocatedShopName: (data as any).shopName || 'NÉP Studio',
              } as any,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'VAULT_BESPOKE',
          entityId: data.id,
          data: data as any,
        },
      });
      return { ok: true, bespoke: data };
    });
  }

  @Get('bookings')
  async listBookings(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_BOOKING',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('booking')
  async saveBooking(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      flagship: z.string().max(150),
      service: z.string().max(150),
      date: z.string(),
      timeSlot: z.string(),
      vipPass: z.string(),
    }).passthrough().parse(body);

    const stylistMatching = matchOptimalStylist({
      customerArchetype: (data as any).archetype || (data as any).customerArchetype || 'QUIET_LUXURY',
      consultFormat: (data as any).format || 'VIRTUAL',
      requestedSlot: data.timeSlot,
      vipTier: (data as any).vipTier || 'GOLD',
      notes: (data as any).notes || '',
    });

    const payload = {
      ...data,
      stylistMatching,
      appointmentHash: stylistMatching.appointmentHash,
      leadTimeMinutes: stylistMatching.preparationLeadTimeMinutes,
      privateSuiteAssigned: stylistMatching.privateSuiteAssigned,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_BOOKING',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, booking: payload };
  }

  @Delete('bookings/:id')
  async deleteBooking(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_BOOKING',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Post('community/swap-evaluate')
  async evaluateSwapEndpoint(@Body() body: unknown) {
    const data = z.object({
      myItemName: z.string().default('Áo Khoác Blazer Linen Cổ Điển'),
      myEstimatedValueVnd: z.number().int().min(100000).default(650000),
      myConditionGrade: z.enum(['S', 'A', 'B', 'C']).optional().default('A'),
      targetItemName: z.string().default('Sơ Mi Lụa Tơ Tằm Bảo Lộc'),
      targetEstimatedValueVnd: z.number().int().min(100000).default(680000),
      targetConditionGrade: z.enum(['S', 'A', 'B', 'C']).optional().default('A'),
      fabricType: z.string().optional().default('LINEN'),
    }).passthrough().parse(body ?? {});

    const result = evaluateP2PGarmentSwap(data);
    return { ok: true, ...result };
  }

  @Post('community/patronage-withholding')
  async evaluatePatronageWithholdingEndpoint(@Body() body: unknown) {
    const data = z.object({
      creatorIdOrName: z.string().default('Elena Vũ (@elenavu)'),
      grossAmountVnd: z.number().int().min(1000).default(20000),
      message: z.string().optional().default('Bảo trợ phong cách'),
      senderUserId: z.string().optional(),
    }).passthrough().parse(body ?? {});

    const result = calculateCreatorPatronageWithholding(data);
    return { ok: true, ...result };
  }

  @Post('community/ootd-spatial')
  async evaluateOOTDSpatialEndpoint(@Body() body: unknown) {
    const data = z.object({
      tags: z.array(z.object({
        productId: z.string(),
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        mediaPosition: z.number().int().optional(),
      })),
      minAllowedDistance: z.number().min(0.01).max(0.5).optional().default(0.08),
    }).passthrough().parse(body ?? {});

    const result = evaluateOOTDSpatialDispersion(data.tags, data.minAllowedDistance);
    return { ok: true, ...result };
  }

  @Post('community/challenge-dividend')
  async evaluateChallengeDividendEndpoint(@Body() body: unknown) {
    const data = z.object({
      challengeId: z.string().default('CHAL-46-LINEN'),
      entries: z.array(z.object({
        postId: z.string(),
        creatorName: z.string(),
        votes: z.number().int().min(0),
        daysActive: z.number().optional().default(1),
      })).min(1),
      totalPrizePoolVnd: z.number().int().min(100000).default(15000000),
      topCount: z.number().int().min(1).max(10).optional().default(3),
    }).passthrough().parse(body ?? {});

    const result = calculateChallengePrizeDividend(data);
    return { ok: true, ...result };
  }

  @Get('swaps')
  async listSwaps(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_SWAP',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('swap')
  async saveSwap(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      myItem: z.string(),
      myVal: z.number(),
      targetItem: z.string(),
      targetVal: z.number(),
      escrowLocked: z.boolean().default(true),
    }).passthrough().parse(body);

    const swapEvaluation = evaluateP2PGarmentSwap({
      myItemName: data.myItem,
      myEstimatedValueVnd: data.myVal,
      targetItemName: data.targetItem,
      targetEstimatedValueVnd: data.targetVal,
    });

    const payload = {
      ...data,
      swapEvaluation,
      fairValueMatchPct: swapEvaluation.fairValueMatchPct,
      requiredEscrowCollateralVnd: swapEvaluation.requiredEscrowCollateralVnd,
      compensationAmountVnd: swapEvaluation.compensationAmountVnd,
      compensationDirection: swapEvaluation.compensationDirection,
      contractStateHash: swapEvaluation.contractStateHash,
      ecoImpact: swapEvaluation.ecoImpact,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_SWAP',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, swap: payload };
  }

  @Delete('swaps/:id')
  async deleteSwap(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_SWAP',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Post('swaps/:id/complete')
  async completeSwap(@Req() req: Authed, @Param('id') id: string) {
    return serial(this.db, async tx => {
      const existing = await tx.auditLog.findFirst({
        where: { actorId: req.user.id, action: 'VAULT_SWAP', entityId: id },
      });
      if (!existing) {
        throw new NotFoundException('Không tìm thấy giao dịch trao đổi P2P đang mở hoặc giao dịch đã hoàn tất');
      }
      const swapData = (existing.data as any) || {};

      await tx.auditLog.deleteMany({
        where: {
          actorId: req.user.id,
          action: 'VAULT_SWAP',
          entityId: id,
        },
      });

      const completedRecord = {
        id,
        completedAt: new Date().toISOString(),
        ecoPoints: swapData.ecoImpact?.ecoPointsReward || 300,
        co2SavedKg: swapData.ecoImpact?.co2SavedKg || 4.8,
        waterSavedL: swapData.ecoImpact?.waterSavedLiters || 3200,
        fairValueMatchPct: swapData.fairValueMatchPct || 96.5,
        contractStateHash: swapData.contractStateHash,
        status: 'COMPLETED',
      };

      await tx.auditLog.create({
        data: {
          actorId: req.user.id,
          action: 'VAULT_SWAP_COMPLETED',
          entityId: id,
          data: completedRecord as any,
        },
      });
      return { ok: true, completed: completedRecord };
    });
  }

  @Get('patronages')
  async listPatronages(@Req() req: Authed) {
    const logs = await this.db.auditLog.findMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_PATRONAGE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return logs.map(l => ({ id: l.entityId, ...((l.data as any) || {}), createdAt: l.createdAt }));
  }

  @Post('circular-passport')
  async saveCircularPassport(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      fabric: z.string().max(50),
      code: z.string().max(80),
      time: z.string().optional(),
    }).passthrough().parse(body);

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_CIRCULAR_PASSPORT',
        entityId: data.code,
        data: data as any,
      },
    });
    return { ok: true, passport: data };
  }

  @Post('patronage')
  async savePatronage(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      creator: z.string().max(100),
      amount: z.number().min(1000),
      msg: z.string().max(500),
      at: z.string().optional(),
    }).passthrough().parse(body);

    const taxAudit = calculateCreatorPatronageWithholding({
      creatorIdOrName: data.creator,
      grossAmountVnd: data.amount,
      message: data.msg,
      senderUserId: req.user.id,
    });

    const payload = {
      ...data,
      taxAudit,
      pitTaxWithheldVnd: taxAudit.pitTaxWithheldVnd,
      netDisbursedVnd: taxAudit.netDisbursedVnd,
      eTaxReceiptNumber: taxAudit.eTaxReceiptNumber,
      ecoCoinsEarned: taxAudit.loyaltyEcoCoinsEarned,
      complianceArticle: taxAudit.complianceArticle,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_PATRONAGE',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, patronage: payload };
  }

  @Post('event')
  async saveEvent(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      title: z.string().min(1).max(200),
      date: z.string().max(100),
      time: z.string().max(50),
      occasion: z.string().max(200),
      outfit: z.string().max(500),
      weather: z.string().max(200).optional(),
      vasReminder: z.boolean().default(false),
    }).passthrough().parse(body);

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_EVENT',
        entityId: data.id,
        data: data as any,
      },
    });
    return { ok: true, event: data };
  }

  @Delete('event/:id')
  async deleteEvent(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_EVENT',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Post('moodboard')
  async saveMoodboard(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      title: z.string().min(1).max(200),
      palette: z.string().max(50),
      note: z.string().max(500),
      tag: z.string().max(100),
    }).passthrough().parse(body);

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_MOODBOARD',
        entityId: data.id,
        data: data as any,
      },
    });
    return { ok: true, pin: data };
  }

  @Delete('moodboard/:id')
  async deleteMoodboard(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_MOODBOARD',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }

  @Post('hibernation')
  async saveHibernation(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      id: z.string().default(() => randomUUID()),
      item: z.string().min(1).max(200),
      duration: z.string().max(100),
      fee: z.number().min(0),
      code: z.string().max(100),
      date: z.string().max(100),
      fabricType: z.enum(['WOOL_CASHMERE', 'NATURAL_SILK', 'NORMANDY_LINEN']).optional(),
      ambientTempC: z.number().optional(),
      relativeHumidityPct: z.number().optional(),
    }).passthrough().parse(body);

    const durMonths: 3 | 6 | 12 = data.duration.includes('3') ? 3 : data.duration.includes('12') ? 12 : 6;
    const fabType = data.fabricType || (data.item.toLowerCase().includes('lụa') ? 'NATURAL_SILK' : data.item.toLowerCase().includes('lanh') ? 'NORMANDY_LINEN' : 'WOOL_CASHMERE');

    const climateEval = evaluateHibernationMicroclimateMoldRisk({
      ambientTempC: data.ambientTempC || 31.5,
      relativeHumidityPct: data.relativeHumidityPct || 78,
      durationMonths: durMonths,
      fabricType: fabType,
      packagingMethod: 'ZIP_SEAL_BIO_SILICA',
    });

    const payload = {
      ...data,
      code: data.code || climateEval.serviceSummary.securitySealCode,
      securitySealCode: climateEval.serviceSummary.securitySealCode,
      tamperEvidentTrackingHash: climateEval.serviceSummary.tamperEvidentTrackingHash,
      ecoCoinsEarned: climateEval.serviceSummary.ecoCoinsEarned,
      vaultMetrics: climateEval.vaultPreservationMetrics,
      careAdvice: climateEval.careAdvice,
    };

    await this.db.auditLog.create({
      data: {
        actorId: req.user.id,
        action: 'VAULT_HIBERNATION',
        entityId: data.id,
        data: payload as any,
      },
    });
    return { ok: true, hibernation: payload };
  }

  @Delete('hibernation/:id')
  async deleteHibernation(@Req() req: Authed, @Param('id') id: string) {
    await this.db.auditLog.deleteMany({
      where: {
        actorId: req.user.id,
        action: 'VAULT_HIBERNATION',
        entityId: id,
      },
    });
    return { ok: true, deletedId: id };
  }
}
