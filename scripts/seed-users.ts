import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { prisma, Role, UserStatus } from '../packages/database/src/index';

async function main() {
  console.log('Seeding admin and merchant users...');
  
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  // 1. Super Admin / Merchant user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@corecart.com' },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'super@corecart.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Created/Updated Super Admin: ${superAdmin.email} (ID: ${superAdmin.id})`);

  // 2. Demo Merchant user
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@ellipmart.com' },
    update: {
      passwordHash,
      role: Role.MERCHANT,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'merchant@ellipmart.com',
      passwordHash,
      firstName: 'Merchant',
      lastName: 'User',
      role: Role.MERCHANT,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Created/Updated Merchant User: ${merchant.email} (ID: ${merchant.id})`);
  console.log('Done! Default Password for both is: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
