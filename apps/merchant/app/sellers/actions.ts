'use server';

import { prisma } from '@corecart/database';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getSellersAction() {
  try {
    const sellers = await prisma.$queryRawUnsafe<Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
      createdAt: Date;
    }>>(
      `SELECT id, "firstName", "lastName", email, status, "createdAt" FROM "User" WHERE role = 'MERCHANT'::"Role" ORDER BY "createdAt" DESC`
    );
    return { success: true, data: sellers };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createSellerAction(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const id = crypto.randomUUID();

    // Use raw SQL to bypass stale Prisma client enum validation.
    // The DB already has MERCHANT in the Role enum (after db push).
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, status, "language", "currency", "theme", "failedLoginAttempts", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'MERCHANT'::"Role", 'ACTIVE'::"UserStatus", 'en', 'USD', 'system', 0, NOW(), NOW())`,
      id, payload.email, passwordHash, payload.firstName, payload.lastName
    );

    const seller = { id, email: payload.email };

    revalidatePath('/sellers');
    return { success: true, data: { id: seller.id, email: seller.email } };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to create seller.' };
  }
}

export async function updateSellerStatusAction(sellerId: string, status: 'ACTIVE' | 'SUSPENDED') {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET status = $1::"UserStatus", "updatedAt" = NOW() WHERE id = $2`,
      status, sellerId
    );
    revalidatePath('/sellers');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
