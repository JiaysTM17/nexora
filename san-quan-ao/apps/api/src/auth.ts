import { Body, CanActivate, Controller, ExecutionContext, ForbiddenException, Get, Inject, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { scrypt as scryptCallback, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import type { Request, Response } from 'express';
import type { PublicUser } from '@mac/contracts';
import { Db } from './db';
import { hash } from './common';

const scrypt = promisify(scryptCallback);
export type Authed = Request & { user: PublicUser };
export async function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
async function passwordMatches(password: string, encoded: string) {
  const [salt, key] = encoded.split(':');
  if (!salt || !key) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(key, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const publicUser = { id: true, email: true, name: true, role: true } as const;
const credentials = z.object({ email: z.email().max(200).transform(s => s.toLowerCase()), password: z.string().min(6).max(128) });

@Injectable()
export class Auth {
  constructor(@Inject(Db) private db: Db) {}
  async session(req: Request) {
    const token = req.cookies?.mac_session;
    if (!token || typeof token !== 'string') return null;
    const session = await this.db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: { select: publicUser } } });
    return session && session.expiresAt > new Date() ? session.user : null;
  }
  async issue(userId: string, res: Response) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 86400000);
    await this.db.session.create({ data: { userId, tokenHash: hash(token), expiresAt } });
    res.cookie('mac_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true', expires: expiresAt, path: '/' });
  }
  async shop(userId: string, shopId: string, requireApproved = true) {
    const membership = await this.db.shopMember.findUnique({ where: { shopId_userId: { shopId, userId } }, include: { shop: true } });
    if (!membership) throw new ForbiddenException('Bạn không có quyền quản lý shop này');
    if (requireApproved && membership.shop.status !== 'APPROVED') throw new ForbiddenException('Shop chưa được phép bán hàng');
    return membership.shop;
  }
}
@Injectable()
export class SignedIn implements CanActivate {
  constructor(@Inject(Auth) private auth: Auth) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Authed>();
    const user = await this.auth.session(req);
    if (!user) throw new UnauthorizedException('Bạn cần đăng nhập');
    req.user = user;
    return true;
  }
}
@Injectable()
export class AdminOnly implements CanActivate {
  canActivate(context: ExecutionContext) {
    if (context.switchToHttp().getRequest<Authed>().user?.role !== 'ADMIN') throw new ForbiddenException('Chỉ quản trị sàn được thao tác');
    return true;
  }
}
@Controller('auth')
export class AuthController {
  constructor(@Inject(Db) private db: Db, @Inject(Auth) private auth: Auth) {}
  @Post('register') async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const data = credentials.extend({ name: z.string().trim().min(2).max(100) }).strict().parse(body);
    const user = await this.db.user.create({ data: { email: data.email, name: data.name, passwordHash: await passwordHash(data.password) }, select: publicUser });
    await this.auth.issue(user.id, res);
    return user;
  }
  @Post('login') async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const data = credentials.strict().parse(body);
    const user = await this.db.user.findUnique({ where: { email: data.email } });
    // Compute a scrypt even for unknown email to reduce timing differences.
    const encoded = user?.passwordHash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`;
    if (!await passwordMatches(data.password, encoded) || !user) throw new UnauthorizedException('Email hoặc mật khẩu chưa đúng');
    await this.auth.issue(user.id, res);
    const { id, name, email, role } = user;
    return { id, name, email, role };
  }
  @Get('me') @UseGuards(SignedIn) me(@Req() req: Authed) { return req.user; }
  @Post('logout') async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.cookies?.mac_session) await this.db.session.deleteMany({ where: { tokenHash: hash(req.cookies.mac_session) } });
    res.clearCookie('mac_session', { path: '/' });
    return { ok: true };
  }
}
