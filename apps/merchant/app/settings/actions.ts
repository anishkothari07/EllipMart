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
import { UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// STORE INFO
// ─────────────────────────────────────────────

export async function fetchStoreInfoAction() {
  try {
    const data = await operationsMerchantService.getStoreInfo();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch store information.' };
  }
}

export async function updateStoreInfoAction(userId: string, input: StoreInfoInput) {
  try {
    const data = await operationsMerchantService.updateStoreInfo(userId, input);
    revalidatePath('/settings');
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
    const data = await operationsMerchantService.listShippingZones();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch shipping zones.' };
  }
}

export async function createShippingZoneAction(userId: string, input: ShippingZoneInput) {
  try {
    const data = await operationsMerchantService.createShippingZone(userId, input);
    revalidatePath('/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create shipping zone.' };
  }
}

export async function deleteShippingZoneAction(userId: string, zoneId: string) {
  try {
    await operationsMerchantService.deleteShippingZone(userId, zoneId);
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete shipping zone.' };
  }
}

export async function createShippingRateAction(userId: string, input: ShippingRateInput) {
  try {
    const data = await operationsMerchantService.createShippingRate(userId, input);
    revalidatePath('/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create shipping rate.' };
  }
}

export async function deleteShippingRateAction(userId: string, rateId: string) {
  try {
    await operationsMerchantService.deleteShippingRate(userId, rateId);
    revalidatePath('/settings');
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
    const data = await operationsMerchantService.listTaxRules();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch tax configurations.' };
  }
}

export async function createTaxRuleAction(userId: string, input: TaxRuleInput) {
  try {
    const data = await operationsMerchantService.createTaxRule(userId, input);
    revalidatePath('/settings');
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create tax rate.' };
  }
}

export async function deleteTaxRuleAction(userId: string, ruleId: string) {
  try {
    await operationsMerchantService.deleteTaxRule(userId, ruleId);
    revalidatePath('/settings');
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
