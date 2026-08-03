import { prisma } from '@corecart/database';

export class TaxCalculator {
  static calculate(subtotal: number, rate: number) {
    return (subtotal * rate) / 100;
  }
}

export const taxService = {
  async calculateTaxes(subtotal: number, country?: string, state?: string) {
    const rules = await prisma.taxRule.findMany({
      where: {
        isActive: true,
        OR: [
          { country: null, state: null },
          { country: country || undefined, state: null },
          { country: country || undefined, state: state || undefined }
        ]
      }
    });

    let totalTax = 0;
    const summary: { name: string; rate: number; amount: number }[] = [];

    for (const rule of rules) {
      const amount = TaxCalculator.calculate(subtotal, Number(rule.rate));
      totalTax += amount;
      summary.push({
        name: rule.name,
        rate: Number(rule.rate),
        amount
      });
    }

    return {
      totalTax,
      summary
    };
  }
};
