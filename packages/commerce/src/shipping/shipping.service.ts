import { prisma } from '@corecart/database';

export class ShippingCalculator {
  static calculate(subtotal: number, rate: any) {
    if (rate.minOrder && subtotal < Number(rate.minOrder)) {
      return null; // Rate not applicable
    }
    if (rate.maxOrder && subtotal > Number(rate.maxOrder)) {
      return null; // Rate not applicable
    }
    return Number(rate.cost);
  }
}

export const shippingService = {
  async getAvailableOptions(country: string, subtotal: number) {
    const zones = await prisma.shippingZone.findMany({
      where: {
        isActive: true,
        // Assuming countries is a JSON string like '["US", "CA"]'
        countries: {
          contains: `"${country}"`
        }
      },
      include: {
        rates: {
          where: { isActive: true }
        },
        provider: true
      }
    });

    const options: { id: string; zoneId: string; providerName: string; methodName: string; cost: number; estDays: string }[] = [];
    for (const zone of zones) {
      for (const rate of zone.rates) {
        const cost = ShippingCalculator.calculate(subtotal, rate);
        if (cost !== null) {
          options.push({
            id: rate.id,
            zoneId: zone.id,
            providerName: zone.provider?.name || 'Standard',
            methodName: rate.methodName,
            cost: cost,
            estDays: rate.estDays
          });
        }
      }
    }
    return options.sort((a, b) => a.cost - b.cost);
  },

  async getRateById(rateId: string) {
    const rate = await prisma.shippingRate.findUnique({
      where: { id: rateId },
      include: { zone: { include: { provider: true } } }
    });
    return rate;
  }
};
