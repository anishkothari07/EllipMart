# Transactions Strategy

In SmartGO, ensuring data consistency across multiple database operations is critical. 
All complex workflows (like Checkout) MUST use Prisma Transactions.

## Transaction Rules

1. **Service Layer Isolation**:
   - Transactions are orchestrated at the **Service Layer**, never in the Repository or Route layers.
   - The Route layer calls `checkoutService.executeCheckout(payload)`.
   - The Service layer opens the transaction and passes the `tx` client to the relevant Repositories.

2. **The `runInTransaction` Helper**:
   - Use `import { runInTransaction, PrismaTransactionClient } from '@/lib/prisma/transaction'`.
   - This ensures a standard interface and allows configuring isolation levels globally if needed.

## Example: Checkout Flow

The checkout process must be atomic. If any step fails, the entire operation must roll back.

```typescript
await runInTransaction(async (tx) => {
  // 1. Reserve Inventory
  await inventoryRepository.reserveStock(items, tx);

  // 2. Create Order
  const order = await orderRepository.createOrder(userId, totals, tx);

  // 3. Create Order Items
  await orderItemRepository.createItems(order.id, items, tx);

  // 4. Update Stock (Deduct)
  await inventoryRepository.deductStock(items, tx);

  // 5. Clear Cart
  await cartRepository.clearUserCart(userId, tx);
});
```

## Repository Pattern with Transactions

To support transactions, all Repository methods must optionally accept the `PrismaTransactionClient`.

```typescript
import { prisma } from '@/lib/prisma/client';
import type { PrismaTransactionClient } from '@/lib/prisma/transaction';

export class OrderRepository {
  async createOrder(data: OrderData, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    return db.order.create({ data });
  }
}
```

## Isolation Levels

For high-concurrency flows like inventory deduction, be aware of race conditions.
Use `tx.$queryRaw` with `SELECT ... FOR UPDATE` or Prisma's native `update` with `{ increment/decrement }` atomic operations where necessary to prevent lost updates during concurrent checkouts.
