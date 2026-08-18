'use server';

import {
  operationsMerchantService,
  StoreInfoInput,
  ShippingZoneInput,
  ShippingRateInput,
  TaxRuleInput,
  StaffInput,
  AuditLogSearch,
} from '@corecart/commerce/src/operations/operations-merchant.service';
import { requireSellerAccess } from '@corecart/shared/src/auth';
import { UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';


// ─────────────────────────────────────────────
// STORE INFO
// ─────────────────────────────────────────────

export async function fetchStoreInfoAction() {
  try {
    await requireSellerAccess();
    const data = await operationsMerchantService.getStoreInfo();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch store information.' };
  }
}

export async function updateStoreInfoAction(input: StoreInfoInput) {
  try {
    const user = await requireSellerAccess();
    const data = await operationsMerchantService.updateStoreInfo(user.id, input);
    revalidatePath('/seller/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update store settings.' };
  }
}

// ─────────────────────────────────────────────
// SHIPPING
// ─────────────────────────────────────────────

export async function fetchShippingZonesAction() {
  try {
    await requireSellerAccess();
    const data = await operationsMerchantService.listShippingZones();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch shipping zones.' };
  }
}

export async function createShippingZoneAction(input: ShippingZoneInput) {
  try {
    const user = await requireSellerAccess();
    const data = await operationsMerchantService.createShippingZone(user.id, input);
    revalidatePath('/seller/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create shipping zone.' };
  }
}

export async function deleteShippingZoneAction(zoneId: string) {
  try {
    const user = await requireSellerAccess();
    await operationsMerchantService.deleteShippingZone(user.id, zoneId);
    revalidatePath('/seller/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete shipping zone.' };
  }
}

export async function createShippingRateAction(input: ShippingRateInput) {
  try {
    const user = await requireSellerAccess();
    const data = await operationsMerchantService.createShippingRate(user.id, input);
    revalidatePath('/seller/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create shipping rate.' };
  }
}

export async function deleteShippingRateAction(rateId: string) {
  try {
    const user = await requireSellerAccess();
    await operationsMerchantService.deleteShippingRate(user.id, rateId);
    revalidatePath('/seller/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete shipping rate.' };
  }
}

// ─────────────────────────────────────────────
// TAXES
// ─────────────────────────────────────────────

export async function fetchTaxRulesAction() {
  try {
    await requireSellerAccess();
    const data = await operationsMerchantService.listTaxRules();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch tax configurations.' };
  }
}

export async function createTaxRuleAction(input: TaxRuleInput) {
  try {
    const user = await requireSellerAccess();
    const data = await operationsMerchantService.createTaxRule(user.id, input);
    revalidatePath('/seller/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create tax rate.' };
  }
}

export async function deleteTaxRuleAction(ruleId: string) {
  try {
    const user = await requireSellerAccess();
    await operationsMerchantService.deleteTaxRule(user.id, ruleId);
    revalidatePath('/seller/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete tax rate.' };
  }
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

export async function fetchPaymentConfigAction() {
  try {
    const data = await operationsMerchantService.getPaymentConfig();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch payments config.' };
  }
}

export async function savePaymentConfigAction(userId: string, config: any) {
  try {
    const data = await operationsMerchantService.savePaymentConfig(userId, config);
    revalidatePath('/settings');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payments config.' };
  }
}

// ─────────────────────────────────────────────
// SYSTEM SETTINGS
// ─────────────────────────────────────────────

export async function fetchSystemSettingsAction() {
  try {
    const data = await operationsMerchantService.getSystemSettings();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch system configurations.' };
  }
}

export async function saveSystemSettingsAction(userId: string, settings: any) {
  try {
    const data = await operationsMerchantService.saveSystemSettings(userId, settings);
    revalidatePath('/settings');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save system settings.' };
  }
}

// ─────────────────────────────────────────────
// STAFF USERS & ROLES
// ─────────────────────────────────────────────

export async function fetchStaffAction() {
  try {
    const data = await operationsMerchantService.listStaff();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load staff list.' };
  }
}

export async function createStaffAction(userId: string, input: StaffInput) {
  try {
    const data = await operationsMerchantService.createStaff(userId, input);
    revalidatePath('/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create staff member.' };
  }
}

export async function updateStaffAction(userId: string, staffId: string, payload: { name: string; staffRole: string; status: UserStatus }) {
  try {
    const data = await operationsMerchantService.updateStaff(userId, staffId, payload);
    revalidatePath('/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update staff member.' };
  }
}

// ─────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────

export async function fetchAuditLogsAction(params: AuditLogSearch) {
  try {
    const data = await operationsMerchantService.getAuditLogs(params);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load audit logs.' };
  }
}
