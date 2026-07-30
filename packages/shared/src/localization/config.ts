import { prisma } from '@corecart/database';

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  phonePrefix: string;
  phoneLength: number;
}

// Fallback in case DB is not seeded yet
const INDIA_DEFAULT_CONFIG: CountryConfig = {
  code: "IN",
  name: "India",
  currency: "INR",
  currencySymbol: "₹",
  locale: "en-IN",
  phonePrefix: "+91",
  phoneLength: 10,
};

export const localizationConfig = {
  async getActiveCountryConfig(countryCode = "IN"): Promise<CountryConfig> {
    try {
      const country = await prisma.country.findUnique({
        where: { code: countryCode },
      });
      if (country && country.isActive) {
        return {
          code: country.code,
          name: country.name,
          currency: country.currency,
          currencySymbol: country.currencySymbol,
          locale: country.locale,
          phonePrefix: country.phonePrefix,
          phoneLength: country.phoneLength,
        };
      }
    } catch (e) {
      console.warn("Failed to retrieve country configuration from DB:", e);
    }
    return INDIA_DEFAULT_CONFIG;
  },

  formatCurrency(value: number, config: CountryConfig): string {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  },
};
