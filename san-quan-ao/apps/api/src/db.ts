import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@mac/database';

@Injectable()
export class Db extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
export type Tx = Prisma.TransactionClient;
export async function serial<T>(db: PrismaClient, fn: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(fn, { isolationLevel: 'Serializable', timeout: 15000 }); }
    catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && (
        ['P2034', 'P2002'].includes(error.code) ||
        (error.code === 'P2010' && ['40001', '40P01'].includes(String(error.meta?.code)))
      );
      if (retryable && attempt < 4) {
        await new Promise(r => setTimeout(r, 20 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
}
