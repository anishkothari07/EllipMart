// Marketing types
export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  bgImage: string;
  mobileImage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  url: string;
  image: string;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  startDate: string;
  endDate: string;
  type: 'FESTIVAL' | 'FLASH_SALE' | 'OFFER' | 'ANNOUNCEMENT';
}

export interface FeaturedCollection {
  collectionId: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FeaturedProductSection {
  sectionName: string;
  productIds: string[];
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  robots: string;
  keywords: string;
}

export interface SeoSettingsConfig {
  homepage: SeoMeta;
  productDefaults: SeoMeta;
  collectionDefaults: SeoMeta;
  categoryDefaults: SeoMeta;
}

export interface Announcement {
  id: string;
  text: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface AnnouncementBarConfig {
  isActive: boolean;
  announcements: Announcement[];
  freeShippingThreshold: number;
}

export interface MarketingContent {
  heroBanners: HeroBanner[];
  promotionalBanners: PromotionalBanner[];
  featuredCollections: FeaturedCollection[];
  featuredProducts: FeaturedProductSection[];
  seoSettings: SeoSettingsConfig;
  announcementBar: AnnouncementBarConfig;
}

// Operational settings types
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
  countries: string[];
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
  status?: any; // UserStatus
}

export interface AuditLogSearch {
  search?: string;
  action?: string;
  entityType?: string;
  page?: number;
  limit?: number;
}
