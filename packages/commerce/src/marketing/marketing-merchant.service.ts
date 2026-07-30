import { prisma } from '@corecart/database';
import { AppError } from '@corecart/shared';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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
  sectionName: string; // "Featured Products", "Trending Products", "Best Sellers", "New Arrivals"
  productIds: string[]; // pinned product IDs
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
  announcements: Announcement[];
  isActive: boolean;
  freeShippingThreshold: number;
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
  collectionDefaults: SeoMeta;
  categoryDefaults: SeoMeta;
  productDefaults: SeoMeta;
}

export interface MarketingContent {
  heroBanners: HeroBanner[];
  promotionalBanners: PromotionalBanner[];
  featuredCollections: FeaturedCollection[];
  featuredProducts: FeaturedProductSection[];
  announcementBar: AnnouncementBarConfig;
  seoSettings: SeoSettingsConfig;
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export const marketingMerchantService = {
  async ensureSettings() {
    let settings = await prisma.websiteSettings.findFirst({
      include: { website: true },
    });

    if (!settings) {
      // Fetch or create a website
      let website = await prisma.website.findFirst();
      if (!website) {
        website = await prisma.website.create({
          data: {
            name: 'SmartGO Store',
            domain: 'localhost',
          },
        });
      }

      settings = await prisma.websiteSettings.create({
        data: {
          websiteId: website.id,
          brandName: 'SmartGO',
          websiteName: 'SmartGO Store',
          tagline: 'Premium Agentic Commerce',
          defaultCurrency: 'INR',
          defaultLanguage: 'en',
          announcementsJson: JSON.stringify([
            { text: 'Free shipping on orders above ₹999!', isActive: true },
          ]),
        },
        include: { website: true },
      });
    }
    return settings;
  },

  async getMarketingContent(): Promise<MarketingContent> {
    const settings = await this.ensureSettings();

    let content: any = null;
    if (settings.megaMenuFeaturedJson) {
      try {
        content = JSON.parse(settings.megaMenuFeaturedJson);
      } catch {
        // Fallback to default schema if JSON corrupted
      }
    }

    if (!content) {
      // Default initial marketing content structure
      content = {
        heroBanners: [
          {
            id: 'hero-1',
            title: 'Next-Gen Agentic Shopping',
            subtitle: 'Powered by Gemini AI',
            description: 'Experience the future of e-commerce with our automated agentic shopping portal.',
            ctaText: 'Shop New Arrivals',
            ctaUrl: '/search',
            bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
            mobileImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600',
            startDate: '',
            endDate: '',
            isActive: true,
            sortOrder: 1,
          },
        ],
        promotionalBanners: [
          {
            id: 'promo-1',
            title: 'Festival Flash Sale: 20% Off',
            description: 'Get exclusive discounts on premium inventory catalog items.',
            buttonText: 'Claim Discount',
            url: '/search',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=800',
            priority: 'high',
            isActive: true,
            startDate: '',
            endDate: '',
            type: 'FLASH_SALE',
          },
        ],
        featuredCollections: [],
        featuredProducts: [
          {
            sectionName: 'Trending Products',
            productIds: [],
          },
          {
            sectionName: 'Best Sellers',
            productIds: [],
          },
          {
            sectionName: 'New Arrivals',
            productIds: [],
          },
        ],
        announcementBar: {
          announcements: [
            { id: 'ann-1', text: 'Free shipping on orders above ₹999!', isActive: true },
            { id: 'ann-2', text: 'Use code SMART10 for 10% off your first purchase!', isActive: true },
          ],
          isActive: true,
          freeShippingThreshold: 999,
        },
        seoSettings: {
          homepage: {
            title: 'SmartGO — Premium Agentic E-Commerce Store',
            description: 'Buy premium products with automated checkout workflows and AI shopping assistance.',
            canonical: 'https://smartgo.example.com',
            ogImage: '',
            robots: 'index, follow',
            keywords: 'ecommerce, agentic, gemini, automated shopping',
          },
          collectionDefaults: {
            title: 'Collections — SmartGO',
            description: 'Browse collections of curated products.',
            canonical: '',
            ogImage: '',
            robots: 'index, follow',
            keywords: 'collections, items',
          },
          categoryDefaults: {
            title: 'Categories — SmartGO',
            description: 'Browse products by department.',
            canonical: '',
            ogImage: '',
            robots: 'index, follow',
            keywords: 'categories, departments',
          },
          productDefaults: {
            title: 'Buy Products Online — SmartGO',
            description: 'View pricing, details, and checkout options.',
            canonical: '',
            ogImage: '',
            robots: 'index, follow',
            keywords: 'buy online, store',
          },
        },
      };
    }
    content.heroBanners = content.heroBanners || [];
    content.promotionalBanners = content.promotionalBanners || [];
    content.featuredCollections = content.featuredCollections || [];
    content.featuredProducts = content.featuredProducts || [];
    content.announcementBar = content.announcementBar || { announcements: [] };
    if (content.announcementBar) {
      content.announcementBar.announcements = content.announcementBar.announcements || [];
    }
    content.seoSettings = content.seoSettings || {
      homeDefaults: { title: '', description: '', keywords: '' },
      categoryDefaults: { title: '', description: '', keywords: '' },
      productDefaults: { title: '', description: '', keywords: '' }
    };

    return content;
  },

  async saveMarketingContent(content: MarketingContent): Promise<MarketingContent> {
    const settings = await this.ensureSettings();
    await prisma.websiteSettings.update({
      where: { id: settings.id },
      data: {
        megaMenuFeaturedJson: JSON.stringify(content),
      },
    });
    return content;
  },
};
