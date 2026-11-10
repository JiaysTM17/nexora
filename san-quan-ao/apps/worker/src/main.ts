import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env'), quiet: true });
import { Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Queue, Worker } from 'bullmq';
import { expirePendingOrders, PrismaClient } from '@mac/database';

@Injectable()
class Jobs implements OnModuleInit, OnModuleDestroy {
  private db = new PrismaClient();
  private queue?: Queue;
  private worker?: Worker;
  async onModuleInit() {
    const url = new URL(process.env.REDIS_URL ?? 'redis://localhost:63799');
    const connection = { host: url.hostname, port: Number(url.port || 6379), ...(url.password ? { password: decodeURIComponent(url.password) } : {}), ...(url.protocol === 'rediss:' ? { tls: {} } : {}) };
    await this.db.$connect();
    this.queue = new Queue('mac-maintenance', { connection });
    this.worker = new Worker('mac-maintenance', async () => {
      const expired = await expirePendingOrders(this.db);
      return { expired };
    }, { connection, concurrency: 1 });
    this.worker.on('failed', (job, error) => console.error('Maintenance failed', job?.id, error.message));
    this.worker.on('error', error => console.error('Worker connection', error.message));
    await this.queue.upsertJobScheduler('expire-pending-orders', { every: 30000 }, { name: 'expire-pending-orders', opts: { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: 50, removeOnFail: 100 } });
    console.log('Worker ready. PostgreSQL deadlines checked every 30 seconds.');
  }
  async onModuleDestroy() { await this.worker?.close(); await this.queue?.close(); await this.db.$disconnect(); }
}
@Module({ providers: [Jobs] }) class WorkerModule {}
NestFactory.createApplicationContext(WorkerModule).then(app => app.enableShutdownHooks()).catch(e => { console.error(e); process.exitCode = 1; });
