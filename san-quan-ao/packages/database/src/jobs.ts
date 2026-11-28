import { PrismaClient, Prisma } from '@prisma/client';

async function serial<T>(db: PrismaClient, action: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let retry = 0; ; retry++) {
    try { return await db.$transaction(action, { isolationLevel: 'Serializable', timeout: 15000 }); }
    catch (e) { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034' && retry < 4) continue; throw e; }
  }
}
// Database holds the deadlines. Queue contents can be discarded and reconstructed.
export async function expirePendingOrders(db: PrismaClient, now = new Date()) {
  const candidates = await db.shopOrder.findMany({ where: { status: 'PENDING', holdUntil: { lte: now } }, select: { id: true }, take: 100, orderBy: { holdUntil: 'asc' } });
  let expired = 0;
  for (const candidate of candidates) {
    expired += await serial(db, async tx => {
      const order = await tx.shopOrder.findFirst({ where: { id: candidate.id, status: 'PENDING', holdUntil: { lte: now } }, include: { items: { orderBy: { variantId: 'asc' } } } });
      if (!order) return 0;
      for (const item of order.items) {
        const hold = await tx.reservation.updateMany({ where: { orderItemId: item.id, status: 'ACTIVE' }, data: { status: 'RELEASED' } });
        if (hold.count) await tx.inventoryBalance.update({ where: { variantId: item.variantId }, data: { reserved: { decrement: item.quantity } } });
      }
      if (order.voucherId) await tx.voucher.updateMany({ where: { id: order.voucherId, uses: { gt: 0 } }, data: { uses: { decrement: 1 } } });
      await tx.shopOrder.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      const remainingActive = await tx.shopOrder.count({ where: { orderId: order.orderId, status: { not: 'CANCELLED' } } });
      if (remainingActive === 0) {
        await tx.tradeInRequest.updateMany({ where: { redeemedOrderId: order.orderId }, data: { redeemedOrderId: null } });
      }
      await tx.auditLog.create({ data: { actorId: 'system:worker', action: 'ORDER_EXPIRED', entityId: order.id, data: {} } });
      await tx.outboxEvent.create({ data: { kind: 'ORDER_EXPIRED', payload: { shopOrderId: order.id, userId: (await tx.order.findUniqueOrThrow({ where: { id: order.orderId } })).userId } } });
      return 1;
    });
  }
  return expired;
}

export async function releaseHeldAffiliateEarnings(db: PrismaClient, now = new Date()) {
  const matured = await db.affiliateEarning.findMany({
    where: { status: 'HELD', holdUntil: { lte: now } },
    take: 100,
    orderBy: { holdUntil: 'asc' },
  });
  let released = 0;
  for (const earning of matured) {
    released += await serial(db, async tx => {
      const updated = await tx.affiliateEarning.updateMany({
        where: { id: earning.id, status: 'HELD', holdUntil: { lte: now } },
        data: { status: 'AVAILABLE' },
      });
      if (!updated.count) return 0;
      await tx.auditLog.create({
        data: {
          actorId: 'system:worker',
          action: 'AFFILIATE_EARNING_RELEASED',
          entityId: earning.id,
          data: { kocUserId: earning.kocUserId, shopOrderId: earning.shopOrderId, amount: earning.amount },
        },
      });
      return 1;
    });
  }
  return released;
}

export async function purgeExpiredSessionsAndQuotes(db: PrismaClient, now = new Date()) {
  const [sessionsDeleted, quotesDeleted] = await Promise.all([
    db.session.deleteMany({ where: { expiresAt: { lte: now } } }),
    db.checkoutQuote.deleteMany({ where: { expiresAt: { lte: now }, order: { is: null } } }),
  ]);
  return {
    expiredSessionsPurged: sessionsDeleted.count,
    expiredQuotesPurged: quotesDeleted.count,
  };
}

export async function processPendingOutboxEvents(db: PrismaClient, now = new Date()) {
  const candidates = await db.outboxEvent.findMany({
    where: { processedAt: null, attempts: { lt: 5 } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  let processed = 0;
  let retried = 0;
  const nowMs = now.getTime();

  for (const ev of candidates) {
    // Exponential backoff check for events that failed previously (attempts > 0)
    if (ev.attempts > 0) {
      const backoffMs = Math.min(300_000, 2000 * Math.pow(2, ev.attempts - 1));
      if (nowMs < ev.createdAt.getTime() + backoffMs) continue;
    }

    try {
      const done = await serial(db, async tx => {
        const claimed = await tx.outboxEvent.updateMany({
          where: { id: ev.id, processedAt: null },
          data: { processedAt: now, attempts: { increment: 1 } },
        });
        if (!claimed.count) return 0;
        await tx.auditLog.create({
          data: {
            actorId: 'system:outbox',
            action: `OUTBOX_DISPATCHED_${ev.kind}`,
            entityId: ev.id,
            data: ev.payload ?? {},
          },
        });
        return 1;
      });
      processed += done;
    } catch {
      retried++;
      await db.outboxEvent.updateMany({
        where: { id: ev.id, processedAt: null },
        data: { attempts: { increment: 1 } },
      });
    }
  }

  return { outboxProcessed: processed, outboxRetried: retried };
}
