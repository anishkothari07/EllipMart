import { IPaymentProvider } from "./types";

export type ProviderFactory = (config?: any) => IPaymentProvider;

class PaymentProviderRegistry {
  private factories: Map<string, ProviderFactory> = new Map();

  register(id: string, factory: ProviderFactory) {
    if (this.factories.has(id)) {
      throw new Error(`Payment provider factory for ${id} is already registered.`);
    }
    this.factories.set(id, factory);
  }

  resolve(id: string, config?: any): IPaymentProvider {
    const factory = this.factories.get(id);
    if (!factory) {
      throw new Error(`Payment provider ${id} not found in registry.`);
    }
    return factory(config);
  }

  getRegisteredProviderIds(): string[] {
    return Array.from(this.factories.keys());
  }
}

export const paymentRegistry = new PaymentProviderRegistry();
