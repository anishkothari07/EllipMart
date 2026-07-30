'use server';

import { customerMerchantService, CustomerListParams } from '@corecart/commerce/src/user/customer-merchant.service';
import { UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────

export async function fetchCustomersAction(params: CustomerListParams) {
  try {
    const data = await customerMerchantService.listCustomers(params);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customers list.' };
  }
}

// ─────────────────────────────────────────────
// PROFILE DETAIL
// ─────────────────────────────────────────────

export async function fetchCustomerProfileAction(userId: string) {
  try {
    const data = await customerMerchantService.getCustomerProfile(userId);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch customer profile details.' };
  }
}

// ─────────────────────────────────────────────
// CRM MUTATIONS: Notes, Tags
// ─────────────────────────────────────────────

export async function updateCustomerTagsAction(userId: string, tags: string[]) {
  try {
    await customerMerchantService.updateCustomerTags(userId, tags);
    revalidatePath('/customers');
    revalidatePath(`/customers/${userId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update tags.' };
  }
}

export async function addCustomerNoteAction(userId: string, content: string) {
  try {
    const data = await customerMerchantService.addCustomerNote(userId, content, 'Merchant Admin');
    revalidatePath(`/customers/${userId}`);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to append note.' };
  }
}

// ─────────────────────────────────────────────
// CRM MUTATIONS: Addresses
// ─────────────────────────────────────────────

export async function createCustomerAddressAction(userId: string, addressData: any) {
  try {
    const data = await customerMerchantService.createAddress(userId, addressData);
    revalidatePath(`/customers/${userId}`);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create address.' };
  }
}

export async function updateCustomerAddressAction(userId: string, addressId: string, addressData: any) {
  try {
    const data = await customerMerchantService.updateAddress(userId, addressId, addressData);
    revalidatePath(`/customers/${userId}`);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update address.' };
  }
}

export async function deleteCustomerAddressAction(userId: string, addressId: string) {
  try {
    await customerMerchantService.deleteAddress(userId, addressId);
    revalidatePath(`/customers/${userId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete address.' };
  }
}

export async function setCustomerDefaultAddressAction(userId: string, addressId: string) {
  try {
    await customerMerchantService.setDefaultAddress(userId, addressId);
    revalidatePath(`/customers/${userId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to set default address.' };
  }
}

// ─────────────────────────────────────────────
// BULK ACTIONS
// ─────────────────────────────────────────────

export async function bulkUpdateCustomersStatusAction(userIds: string[], status: UserStatus) {
  try {
    const data = await customerMerchantService.bulkUpdateStatus(userIds, status);
    revalidatePath('/customers');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Bulk status update failed.' };
  }
}
