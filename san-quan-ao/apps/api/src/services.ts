import { Body, Controller, Get, Inject, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { AdminOnly, Authed, SignedIn } from './auth';
import { Db, serial } from './db';

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

function estimatePreliminary(category: string, conditionNote: string): { grade: string; estimatedValue: number } {
  const base = BASE_ESTIMATE[category] ?? 800_000;
  const note = conditionNote.toLowerCase();
  if (note.includes('mới') || note.includes('like new') || note.includes('nguyên tem')) {
    return { grade: 'S', estimatedValue: Math.round(base * 1.15) };
  }
  if (note.includes('ít') || note.includes('tốt') || note.includes('95')) {
    return { grade: 'A', estimatedValue: base };
  }
  if (note.includes('xước') || note.includes('cũ') || note.includes('sờn')) {
    return { grade: 'C', estimatedValue: Math.round(base * 0.55) };
  }
  return { grade: 'B', estimatedValue: Math.round(base * 0.8) };
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

  @Post()
  async submit(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      brand: z.string().trim().min(2).max(80),
      itemName: z.string().trim().min(3).max(120),
      category: z.string().trim().min(2).max(60),
      conditionNote: z.string().trim().min(5).max(500),
      imageUrl: z.string().trim().max(300).optional().default(''),
    }).strict().parse(body);

    const { grade, estimatedValue } = estimatePreliminary(data.category, data.conditionNote);
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
        data: { actorId: req.user.id, action: 'TRADEIN_SUBMIT', entityId: created.id, data: { grade, estimatedValue } },
      });
      return created;
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

  @Post()
  async book(@Req() req: Authed, @Body() body: unknown) {
    const data = z.object({
      itemName: z.string().trim().min(3).max(120),
      serviceType: z.enum(['SPA_CLEANING', 'LEATHER_RESTORE', 'TAILORING', 'AUTHENTICATION']),
      insuredValue: z.number().int().min(0).max(100_000_000),
      notes: z.string().trim().max(500).optional().default(''),
    }).strict().parse(body);

    const baseFee = CARE_FEES[data.serviceType];
    const insuranceFee = data.insuredValue > 10_000_000 ? Math.round((data.insuredValue - 10_000_000) * 0.005) : 0;
    const fee = baseFee + insuranceFee;
    const zipSealCode = `NX-SEAL-${randomUUID().slice(0, 8).toUpperCase()}`;

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
        data: { actorId: req.user.id, action: 'CARE_BOOK', entityId: created.id, data: { zipSealCode, fee } },
      });
      return created;
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
      grade: z.enum(['S', 'A', 'B', 'C', 'D']),
      finalValue: z.number().int().min(0).max(200_000_000),
      status: z.enum(['HUB_INSPECTING', 'APPROVED', 'REJECTED']),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.tradeInRequest.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy yêu cầu Trade-In');
      const voucherCode =
        data.status === 'APPROVED'
          ? existing.voucherCode ?? `NXTI-${randomUUID().slice(0, 6).toUpperCase()}`
          : existing.voucherCode;
      const updated = await tx.tradeInRequest.update({
        where: { id },
        data: { grade: data.grade, finalValue: data.finalValue, status: data.status, voucherCode },
      });
      await tx.auditLog.create({
        data: { actorId: req.user.id, action: `TRADEIN_${data.status}`, entityId: id, data: { grade: data.grade, finalValue: data.finalValue, voucherCode } },
      });
      return updated;
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
    const { status } = z.object({
      status: z.enum(['BOOKED', 'SEALED_PICKUP', 'OPTICAL_CHECK', 'IN_CARE', 'RETURNED']),
    }).strict().parse(body);

    return serial(this.db, async tx => {
      const existing = await tx.careBooking.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy đơn chăm sóc đồ hiệu');
      const updated = await tx.careBooking.update({ where: { id }, data: { status } });
      await tx.auditLog.create({
        data: { actorId: req.user.id, action: `CARE_${status}`, entityId: id, data: {} },
      });
      return updated;
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
}
