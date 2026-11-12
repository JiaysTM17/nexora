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
      if (order.voucherId) await tx.voucher.update({ where: { id: order.voucherId }, data: { uses: { decrement: 1 } } });
      await tx.shopOrder.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
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
