import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env'), quiet: true });
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app';
import { Errors } from './common';
import type { Request, Response, NextFunction } from 'express';

export async function bootstrap(port = Number(process.env.API_PORT ?? 4000)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  if (process.env.SHIPPING_PROVIDER !== 'mock') throw new Error('Only the mock shipping adapter is implemented. Do not use this build for live shipping.');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser());
  const origin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({ origin, credentials: true, allowedHeaders: ['Content-Type', 'X-Requested-With'] });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && (req.header('X-Requested-With') !== 'mac-web' || (req.header('Origin') && req.header('Origin') !== origin))) return res.status(403).json({ message: 'Yêu cầu không hợp lệ' });
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.useGlobalFilters(new Errors());
  app.enableShutdownHooks();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Mặc Marketplace API').setVersion('0.1.0').addCookieAuth('mac_session').build()));
  await app.listen(port, '127.0.0.1');
  return app;
}
if (require.main === module) bootstrap().catch(error => { console.error(error); process.exitCode = 1; });
