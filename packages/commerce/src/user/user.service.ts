import { userRepository } from './user.repository';
import { z } from 'zod';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from './user.dto';
import { AppError } from '@corecart/shared';

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.getProfile(userId);
    if (!user) throw new AppError('User not found', 404);
    
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, payload: z.infer<typeof updateProfileSchema>) {
    const updated = await userRepository.updateProfile(userId, payload);
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async addAddress(userId: string, payload: z.infer<typeof createAddressSchema>) {
    if (payload.isDefault) {
      if (payload.isShipping) await userRepository.unsetDefaultAddress(userId, 'isShipping');
      if (payload.isBilling) await userRepository.unsetDefaultAddress(userId, 'isBilling');
    }
    
    return userRepository.createAddress({
      ...payload,
      userId,
    });
  }

  async updateAddress(userId: string, addressId: string, payload: z.infer<typeof updateAddressSchema>) {
    if (payload.isDefault) {
      if (payload.isShipping) await userRepository.unsetDefaultAddress(userId, 'isShipping');
      if (payload.isBilling) await userRepository.unsetDefaultAddress(userId, 'isBilling');
    }

    try {
      return await userRepository.updateAddress(addressId, userId, payload);
    } catch (e) {
      throw new AppError('Address not found or unauthorized', 404);
    }
  }

  async deleteAddress(userId: string, addressId: string) {
    try {
      await userRepository.deleteAddress(addressId, userId);
      return { success: true };
    } catch (e) {
      throw new AppError('Address not found or unauthorized', 404);
    }
  }
}

export const userService = new UserService();
