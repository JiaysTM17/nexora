import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env'), quiet: true });
config({ path: resolve(process.cwd(), '.env'), quiet: true });
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app';
import { Errors } from './common';
import type { Request, Response, NextFunction } from 'express';

export async function bootstrap(
  port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000),
  host = process.env.HOST ?? '0.0.0.0',
) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (process.env.SHIPPING_PROVIDER !== 'mock') throw new Error('Only the mock shipping adapter is implemented. Do not use this build for live shipping.');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());

  const rawOrigins = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  const allowedOrigins = rawOrigins.split(',').map(s => s.trim().toLowerCase());

  function isOriginAllowed(reqOrigin?: string | null): boolean {
    if (!reqOrigin) return true;
    const normalized = reqOrigin.toLowerCase();
    if (allowedOrigins.includes(normalized)) return true;
    if (normalized.endsWith('.vercel.app') || normalized.endsWith('.onrender.com')) return true;
    return false;
  }

  app.enableCors({
    origin: (originHeader: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!originHeader || isOriginAllowed(originHeader)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const originHeader = req.header('Origin');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const isMacWeb = req.header('X-Requested-With') === 'mac-web';
      const originOk = isOriginAllowed(originHeader);
      if (!isMacWeb || !originOk) return res.status(403).json({ message: 'Yêu cầu không hợp lệ' });
    }
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('NEXORA Atelier Marketplace API').setVersion('0.1.0').addCookieAuth('mac_session').build()));
  await app.listen(port, host);
  return app;
}
if (require.main === module) bootstrap().catch(error => { console.error(error); process.exitCode = 1; });
