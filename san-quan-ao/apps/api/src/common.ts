import { ArgumentsHost, Catch, ExceptionFilter, HttpException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@mac/database';
import { ZodError, z } from 'zod';
import type { Response } from 'express';
import { createHash } from 'node:crypto';

export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export const id = z.string().min(1).max(100);
export const money = z.number().int().min(0).max(100_000_000);
export const addressInput = z.object({ recipient: z.string().trim().min(2).max(100), phone: z.string().regex(/^0[0-9]{9}$/), line: z.string().trim().min(5).max(300), province: z.string().trim().min(2).max(80) }).strict();
export const json = (data: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(data));

// Largest-remainder allocation preserves every VND and never depends on float rounding.
export function allocateDiscount(amount: number, weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > total || weights.some(v => !Number.isSafeInteger(v) || v < 0)) throw new BadRequestException('Phân bổ giảm giá không hợp lệ');
  if (!total) return weights.map(() => 0);
  const denominator = BigInt(total);
  const rows = weights.map((v, i) => ({ i, value: Number(BigInt(amount) * BigInt(v) / denominator), remainder: BigInt(amount) * BigInt(v) % denominator }));
  let remaining = amount - rows.reduce((s, r) => s + r.value, 0);
  for (const row of [...rows].sort((a, b) => a.remainder === b.remainder ? a.i - b.i : a.remainder > b.remainder ? -1 : 1)) {
    if (remaining-- <= 0) break;
    row.value++;
  }
  return rows.map(r => r.value);
}

@Catch()
export class Errors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof ZodError) return response.status(400).json({ code: 'VALIDATION', message: 'Thông tin chưa hợp lệ', fields: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
    if (error instanceof HttpException) {
      const body = error.getResponse();
      return response.status(error.getStatus()).json(typeof body === 'string' ? { message: body } : body);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return response.status(409).json({ message: 'Thông tin đã tồn tại' });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return response.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    console.error('Unhandled API error', error instanceof Error ? error.message : 'unknown');
    return response.status(500).json({ message: 'Hệ thống gặp lỗi. Vui lòng thử lại.' });
  }
}
