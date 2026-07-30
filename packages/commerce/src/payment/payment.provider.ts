export interface IPaymentProvider {
  initialize(config: any): Promise<void>;
  createPayment(orderId: string, amount: number, currency: string, metadata?: any): Promise<{ transactionId: string; clientSecret?: string; raw: any }>;
  verifyPayment(transactionId: string, payload: any): Promise<boolean>;
  capturePayment(transactionId: string, amount: number): Promise<boolean>;
  refundPayment(transactionId: string, amount: number): Promise<boolean>;
  cancelPayment(transactionId: string): Promise<boolean>;
  webhook(payload: any): Promise<void>;
}

export class MockPaymentProvider implements IPaymentProvider {
  async initialize(config: any) {
    console.log('MockPaymentProvider initialized');
  }

  async createPayment(orderId: string, amount: number, currency: string, metadata?: any) {
    return {
      transactionId: `mock_tx_${Date.now()}`,
      clientSecret: `mock_secret_${Date.now()}`,
      raw: { orderId, amount, currency, status: 'CREATED' }
    };
  }

  async verifyPayment(transactionId: string, payload: any) {
    // For mock, any payload with success=true verifies it
    return payload?.success === true;
  }

  async capturePayment(transactionId: string, amount: number) {
    return true;
  }

  async refundPayment(transactionId: string, amount: number) {
    return true;
  }

  async cancelPayment(transactionId: string) {
    return true;
  }

  async webhook(payload: any) {
    console.log('MockPaymentProvider webhook received', payload);
  }
}

export class CODProvider implements IPaymentProvider {
  async initialize(config: any) {}

  async createPayment(orderId: string, amount: number, currency: string, metadata?: any) {
    return {
      transactionId: `cod_tx_${Date.now()}`,
      raw: { orderId, amount, currency, status: 'PENDING_COD' }
    };
  }

  async verifyPayment(transactionId: string, payload: any) {
    return true; // COD is always verified upon order creation
  }

  async capturePayment(transactionId: string, amount: number) {
    return true; // Captured upon delivery
  }

  async refundPayment(transactionId: string, amount: number) {
    return false; // Cash refund not handled digitally
  }

  async cancelPayment(transactionId: string) {
    return true;
  }

  async webhook(payload: any) {}
}

export const paymentProviders: Record<string, IPaymentProvider> = {
  'MOCK': new MockPaymentProvider(),
  'COD': new CODProvider()
};
