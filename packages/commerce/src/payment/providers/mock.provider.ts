import { PaymentStatus } from "@prisma/client";
import { IPaymentProvider, InitializePaymentOptions, InitializePaymentResult, VerifyPaymentOptions, VerifyPaymentResult } from '../types';

export class MockProvider implements IPaymentProvider {
  id = "MOCK";
  
  constructor(config?: any) {}

  async initializePayment(options: InitializePaymentOptions): Promise<InitializePaymentResult> {
    return {
      providerOrderId: `mock_order_${options.orderId}`,
      amount: options.amount,
      currency: options.currency,
      provider: this.id,
    };
  }

  async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    // In mock provider, if the signature is "fail", we fail the payment
    const isSuccess = options.signature !== "fail";
    
    return {
      isVerified: isSuccess,
      providerPaymentId: options.providerPaymentId || `mock_payment_${Date.now()}`,
      status: isSuccess ? PaymentStatus.CAPTURED : PaymentStatus.FAILED,
      rawResponse: { message: isSuccess ? "Mock verification successful" : "Mock verification failed" },
    };
  }

  async capturePayment(paymentId: string, amount: number): Promise<any> {
    return { status: "captured", paymentId, amount };
  }

  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<any> {
    return { status: "refunded", paymentId, amount, reason };
  }

  async cancelPayment(paymentId: string): Promise<any> {
    return { status: "cancelled", paymentId };
  }
}
