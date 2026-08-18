import {
  fetchStoreInfoAction,
  updateStoreInfoAction,
  fetchShippingZonesAction,
  createShippingZoneAction,
  deleteShippingZoneAction,
  createShippingRateAction,
  deleteShippingRateAction,
  fetchTaxRulesAction,
  createTaxRuleAction,
  deleteTaxRuleAction,
  fetchPaymentConfigAction,
  savePaymentConfigAction,
  fetchSystemSettingsAction,
  saveSystemSettingsAction,
  fetchStaffAction,
  createStaffAction,
  updateStaffAction,
  fetchAuditLogsAction,
} from '@/app/(seller)/seller/settings/actions';
import type {
  StoreInfoInput,
  ShippingZoneInput,
  ShippingRateInput,
  TaxRuleInput,
  StaffInput,
  AuditLogSearch,
} from '@corecart/commerce';
import type { UserStatus } from '@prisma/client';

export class MerchantOperationsClient {
  static async getStoreInfo() {
    const res = await fetchStoreInfoAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateStoreInfo(userId: string, input: StoreInfoInput) {
    const res = await updateStoreInfoAction(userId, input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async listShippingZones() {
    const res = await fetchShippingZonesAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createShippingZone(userId: string, input: ShippingZoneInput) {
    const res = await createShippingZoneAction(userId, input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteShippingZone(userId: string, zoneId: string) {
    const res = await deleteShippingZoneAction(userId, zoneId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async createShippingRate(userId: string, input: ShippingRateInput) {
    const res = await createShippingRateAction(userId, input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteShippingRate(userId: string, rateId: string) {
    const res = await deleteShippingRateAction(userId, rateId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async listTaxRules() {
    const res = await fetchTaxRulesAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createTaxRule(userId: string, input: TaxRuleInput) {
    const res = await createTaxRuleAction(userId, input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteTaxRule(userId: string, ruleId: string) {
    const res = await deleteTaxRuleAction(userId, ruleId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async getPaymentConfig() {
    const res = await fetchPaymentConfigAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async savePaymentConfig(userId: string, config: any) {
    const res = await savePaymentConfigAction(userId, config);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getSystemSettings() {
    const res = await fetchSystemSettingsAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async saveSystemSettings(userId: string, settings: any) {
    const res = await saveSystemSettingsAction(userId, settings);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async listStaff() {
    const res = await fetchStaffAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createStaff(userId: string, input: StaffInput) {
    const res = await createStaffAction(userId, input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateStaff(userId: string, staffId: string, payload: { name: string; staffRole: string; status: UserStatus }) {
    const res = await updateStaffAction(userId, staffId, payload);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getAuditLogs(params: AuditLogSearch) {
    const res = await fetchAuditLogsAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
