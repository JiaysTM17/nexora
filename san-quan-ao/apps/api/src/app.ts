import { Global, Module, Controller, Get, Inject } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Db } from './db';
import { AdminOnly, Auth, AuthController, SignedIn } from './auth';
import { CatalogController } from './catalog';
import { Commerce, CommerceController } from './commerce';
import { CommunityController } from './community';
import { AdminController } from './admin';
import { AdminServicesController, AffiliateController, CareController, TradeInController } from './services';

@Global()
@Module({ providers: [Db, Auth, SignedIn, AdminOnly], exports: [Db, Auth, SignedIn, AdminOnly] })
class CoreModule {}
@Module({ controllers: [AuthController] }) class AccountsModule {}
@Module({ controllers: [CatalogController] }) class CatalogModule {}
@Module({ controllers: [CommerceController], providers: [Commerce] }) class CommerceModule {}
@Module({ controllers: [CommunityController] }) class CommunityModule {}
@Module({ controllers: [AdminController] }) class AdminModule {}
@Module({ controllers: [TradeInController, CareController, AdminServicesController, AffiliateController] }) class ServicesModule {}
@Controller('health')
class HealthController {
  constructor(@Inject(Db) private db: Db) {}
  @Get() async health() { await this.db.$queryRaw`SELECT 1`; return { status: 'ok', database: 'postgresql', shipping: process.env.SHIPPING_PROVIDER, payment: 'COD' }; }
}
@Module({ imports: [CoreModule, AccountsModule, CatalogModule, CommerceModule, CommunityModule, AdminModule, ServicesModule, ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])], controllers: [HealthController], providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }] })
export class AppModule {}
