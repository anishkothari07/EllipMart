import {
  fetchCustomersAction,
  fetchCustomerProfileAction,
  updateCustomerTagsAction,
  addCustomerNoteAction,
  createCustomerAddressAction,
  updateCustomerAddressAction,
  deleteCustomerAddressAction,
  setCustomerDefaultAddressAction,
  bulkUpdateCustomersStatusAction,
} from '@/app/(seller)/seller/customers/actions';
import type { CustomerListParams } from '@corecart/commerce';
import type { UserStatus } from '@prisma/client';

export class MerchantCustomerClient {
  static async listCustomers(params: CustomerListParams) {
    const res = await fetchCustomersAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getCustomerProfile(userId: string) {
    const res = await fetchCustomerProfileAction(userId);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateTags(userId: string, tags: string[]) {
    const res = await updateCustomerTagsAction(userId, tags);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async addNote(userId: string, content: string) {
    const res = await addCustomerNoteAction(userId, content);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createAddress(userId: string, addressData: any) {
    const res = await createCustomerAddressAction(userId, addressData);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateAddress(userId: string, addressId: string, addressData: any) {
    const res = await updateCustomerAddressAction(userId, addressId, addressData);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteAddress(userId: string, addressId: string) {
    const res = await deleteCustomerAddressAction(userId, addressId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async setDefaultAddress(userId: string, addressId: string) {
    const res = await setCustomerDefaultAddressAction(userId, addressId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkUpdateStatus(userIds: string[], status: UserStatus) {
    const res = await bulkUpdateCustomersStatusAction(userIds, status);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
