import { prisma } from '@corecart/database';
import { Role, UserStatus } from '@corecart/database';
import { AppError } from '@corecart/shared';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StoreInfoInput {
  brandName: string;
  websiteName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  defaultCurrency: string;
  defaultLanguage: string;
  gstin: string;
  timezone: string;
  businessHours: string;
}

export interface ShippingZoneInput {
  name: string;
  countries: string[]; // JSON array of country codes
}

export interface ShippingRateInput {
  zoneId: string;
  methodName: string;
  cost: number;
  estDays: string;
  minOrder?: number;
  maxOrder?: number;
}

export interface TaxRuleInput {
  name: string;
  rate: number;
  country?: string;
  state?: string;
  isActive?: boolean;
}

export interface StaffInput {
  email: string;
  firstName: string;
  lastName: string;
  staffRole: 'Owner' | 'Manager' | 'Inventory Manager' | 'Support' | 'Viewer';
  status?: UserStatus;
}

export interface AuditLogSearch {
  search?: string;
  action?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const operationsMerchantService = {

  // ── STORE INFO ──────────────────────────────

  async getStoreInfo() {
    let settings = await prisma.websiteSettings.findFirst();
    if (!settings) {
      // Auto create default settings
      let website = await prisma.website.findFirst();
      if (!website) {
        website = await prisma.website.create({
          data: { name: 'EllipMart Store', domain: 'localhost' },
        });
      }
      settings = await prisma.websiteSettings.create({
        data: {
          websiteId: website.id,
          brandName: 'EllipMart',
          websiteName: 'EllipMart Store',
          contactEmail: 'contact@ellipmart.com',
          contactPhone: '+91 99999 99999',
          businessAddress: '123 EllipMart Towers, Bangalore, India',
          defaultCurrency: 'INR',
          defaultLanguage: 'en',
          announcementsJson: '[]',
          socialLinksJson: '{"paymentProviders":{"cod":true,"razorpay":false,"stripe":false,"paypal":false},"systemSettings":{"dateFormat":"dd/MM/yyyy","timeFormat":"12h","numberFormat":"INR","defaultPagination":10}}',
        },
      });
    }
    return settings;
  },

  async updateStoreInfo(userId: string, input: StoreInfoInput) {
    const settings = await this.getStoreInfo();
    const updated = await prisma.websiteSettings.update({
      where: { id: settings.id },
      data: {
        brandName: input.brandName,
        websiteName: input.websiteName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        businessAddress: input.businessAddress,
        defaultCurrency: input.defaultCurrency,
        defaultLanguage: input.defaultLanguage,
        copyright: input.gstin, // Re-use copyright field to store GSTIN to avoid migrations
        tagline: input.timezone, // Re-use tagline to store timezone
        supportPhone: input.businessHours, // Re-use supportPhone for business hours
      },
    });

    await this.writeAuditLog(
      userId,
      'UPDATE',
      'WebsiteSettings',
      settings.id,
      JSON.stringify(settings),
      JSON.stringify(updated)
    );

    return updated;
  },

  // ── SHIPPING ZONES & RATES ──────────────────

  async listShippingZones() {
    return prisma.shippingZone.findMany({
      include: { rates: true },
    });
  },

  async createShippingZone(userId: string, input: ShippingZoneInput) {
    const zone = await prisma.shippingZone.create({
      data: {
        name: input.name,
        countries: JSON.stringify(input.countries),
        isActive: true,
      },
    });

    await this.writeAuditLog(userId, 'CREATE', 'ShippingZone', zone.id, '', JSON.stringify(zone));
    return zone;
  },

  async deleteShippingZone(userId: string, zoneId: string) {
    const deleted = await prisma.shippingZone.delete({
      where: { id: zoneId },
    });

    await this.writeAuditLog(userId, 'DELETE', 'ShippingZone', zoneId, JSON.stringify(deleted), '');
    return deleted;
  },

  async createShippingRate(userId: string, input: ShippingRateInput) {
    const rate = await prisma.shippingRate.create({
      data: {
        zoneId: input.zoneId,
        methodName: input.methodName,
        cost: input.cost,
        estDays: input.estDays,
        minOrder: input.minOrder || null,
        maxOrder: input.maxOrder || null,
        isActive: true,
      },
    });

    await this.writeAuditLog(userId, 'CREATE', 'ShippingRate', rate.id, '', JSON.stringify(rate));
    return rate;
  },

  async deleteShippingRate(userId: string, rateId: string) {
    const deleted = await prisma.shippingRate.delete({
      where: { id: rateId },
    });

    await this.writeAuditLog(userId, 'DELETE', 'ShippingRate', rateId, JSON.stringify(deleted), '');
    return deleted;
  },

  // ── TAX SETTINGS ────────────────────────────

  async listTaxRules() {
    return prisma.taxRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async createTaxRule(userId: string, input: TaxRuleInput) {
    const rule = await prisma.taxRule.create({
      data: {
        name: input.name,
        rate: input.rate,
        country: input.country || 'IN',
        state: input.state || null,
        isActive: input.isActive ?? true,
      },
    });

    await this.writeAuditLog(userId, 'CREATE', 'TaxRule', rule.id, '', JSON.stringify(rule));
    return rule;
  },

  async deleteTaxRule(userId: string, ruleId: string) {
    const deleted = await prisma.taxRule.delete({
      where: { id: ruleId },
    });

    await this.writeAuditLog(userId, 'DELETE', 'TaxRule', ruleId, JSON.stringify(deleted), '');
    return deleted;
  },

  // ── PAYMENT SETTINGS ────────────────────────

  async getPaymentConfig() {
    const info = await this.getStoreInfo();
    try {
      if (info.socialLinksJson) {
        const parsed = JSON.parse(info.socialLinksJson);
        if (parsed.paymentProviders) return parsed.paymentProviders;
      }
    } catch {}
    return { cod: true, razorpay: false, stripe: false, paypal: false };
  },

  async savePaymentConfig(userId: string, config: any) {
    const info = await this.getStoreInfo();
    let parsed: any = {};
    try {
      if (info.socialLinksJson) parsed = JSON.parse(info.socialLinksJson);
    } catch {}
    parsed.paymentProviders = config;

    const updated = await prisma.websiteSettings.update({
      where: { id: info.id },
      data: { socialLinksJson: JSON.stringify(parsed) },
    });

    await this.writeAuditLog(userId, 'UPDATE', 'PaymentConfig', info.id, info.socialLinksJson || '', JSON.stringify(parsed));
    return config;
  },

  // ── SYSTEM SETTINGS & PREFERENCES ────────────

  async getSystemSettings() {
    const info = await this.getStoreInfo();
    try {
      if (info.socialLinksJson) {
        const parsed = JSON.parse(info.socialLinksJson);
        if (parsed.systemSettings) return parsed.systemSettings;
      }
    } catch {}
    return { dateFormat: 'dd/MM/yyyy', timeFormat: '12h', numberFormat: 'INR', defaultPagination: 10 };
  },

  async saveSystemSettings(userId: string, settings: any) {
    const info = await this.getStoreInfo();
    let parsed: any = {};
    try {
      if (info.socialLinksJson) parsed = JSON.parse(info.socialLinksJson);
    } catch {}
    parsed.systemSettings = settings;

    await prisma.websiteSettings.update({
      where: { id: info.id },
      data: { socialLinksJson: JSON.stringify(parsed) },
    });

    await this.writeAuditLog(userId, 'UPDATE', 'SystemSettings', info.id, info.socialLinksJson || '', JSON.stringify(parsed));
    return settings;
  },

  // ── STAFF USERS & ROLES ─────────────────────

  async listStaff() {
    const staff = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: 'desc' },
    });

    return staff.map((u) => {
      let staffRole = 'Manager';
      try {
        if (u.savedPreferences) {
          const parsed = JSON.parse(u.savedPreferences);
          if (parsed.staffRole) staffRole = parsed.staffRole;
        }
      } catch {}

      return {
        id: u.id,
        email: u.email,
        name: `${u.firstName} ${u.lastName}`.trim(),
        role: u.role,
        staffRole,
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      };
    });
  },

  async createStaff(userId: string, input: StaffInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new AppError('User with this email already exists.', 400);

    const passwordHash = await bcrypt.hash('Staff123!', 10);
    const savedPreferences = JSON.stringify({ staffRole: input.staffRole });

    const user = await prisma.user.create({
      data: {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
        role: Role.ADMIN,
        status: input.status || UserStatus.ACTIVE,
        savedPreferences,
      },
    });

    await this.writeAuditLog(userId, 'CREATE', 'StaffUser', user.id, '', JSON.stringify({ id: user.id, email: user.email, role: input.staffRole }));
    return user;
  },

  async updateStaff(userId: string, staffId: string, payload: { name: string; staffRole: string; status: UserStatus }) {
    const u = await prisma.user.findUnique({ where: { id: staffId } });
    if (!u) throw new AppError('Staff user not found.', 404);

    const [first, ...rest] = payload.name.split(' ');
    const last = rest.join(' ') || '';

    const savedPreferences = JSON.stringify({ staffRole: payload.staffRole });

    const updated = await prisma.user.update({
      where: { id: staffId },
      data: {
        firstName: first,
        lastName: last,
        status: payload.status,
        savedPreferences,
      },
    });

    await this.writeAuditLog(userId, 'UPDATE', 'StaffUser', staffId, JSON.stringify(u), JSON.stringify(updated));
    return updated;
  },

  // ── AUDIT LOGS ──────────────────────────────

  async getAuditLogs(params: AuditLogSearch) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.search) {
      where.OR = [
        { id: { contains: params.search } },
        { entityId: { contains: params.search } },
        { changes: { contains: params.search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Format logs with user names
    const users = await prisma.user.findMany({
      where: { id: { in: items.map((i) => i.userId).filter(Boolean) as string[] } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map<string, { id: string; firstName: string; lastName: string; email: string }>(
      users.map((u) => [u.id, u as any])
    );

    const formatted = items.map((item) => {
      const u = item.userId ? userMap.get(item.userId) : null;
      return {
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        changes: item.changes,
        createdAt: item.createdAt.toISOString(),
        userName: u ? `${u.firstName} ${u.lastName}` : 'System',
        userEmail: u ? u.email : 'system@ellipmart.com',
      };
    });

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async writeAuditLog(
    userId: string | null,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    previousValue: string,
    newValue: string
  ) {
    try {
      const changes = JSON.stringify({
        prev: previousValue ? JSON.parse(previousValue) : null,
        curr: newValue ? JSON.parse(newValue) : null,
      });

      return await prisma.auditLog.create({
        data: {
          entityType,
          entityId,
          action,
          changes,
          userId,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
    }
  },
};
