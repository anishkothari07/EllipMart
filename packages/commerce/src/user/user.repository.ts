import { prisma } from '@corecart/database';
import { Prisma, User, Address } from '@prisma/client';

export class UserRepository {
  async updateProfile(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { avatar: true },
    });
  }

  async getProfile(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { avatar: true, addresses: true },
    });
  }

  async createAddress(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
    return prisma.address.create({ data });
  }

  async updateAddress(id: string, userId: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { id, userId }, // Ensure the user owns it
      data,
    });
  }

  async deleteAddress(id: string, userId: string): Promise<Address> {
    return prisma.address.delete({
      where: { id, userId },
    });
  }

  async unsetDefaultAddress(userId: string, type: 'isShipping' | 'isBilling') {
    await prisma.address.updateMany({
      where: { userId, [type]: true, isDefault: true },
      data: { isDefault: false },
    });
  }
}

export const userRepository = new UserRepository();
