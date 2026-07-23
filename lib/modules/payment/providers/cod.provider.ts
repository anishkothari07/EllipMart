import { PaymentStatus } from "@prisma/client";
import { IPaymentProvider, InitializePaymentOptions, InitializePaymentResult, VerifyPaymentOptions, VerifyPaymentResult } from "../types";

export class CodProvider implements IPaymentProvider {
  id = "COD";
  
  constructor(config?: any) {}

  async initializePayment(options: InitializePaymentOptions): Promise<InitializePaymentResult> {
    return {
      providerOrderId: `cod_order_${options.orderId}`,
      amount: options.amount,
      currency: options.currency,
      provider: this.id,
    };
  }

  async verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult> {
    return {
      isVerified: true,
      providerPaymentId: `cod_payment_${Date.now()}`,
      status: PaymentStatus.PENDING, // COD remains pending until delivery
      rawResponse: { message: "COD order placed successfully" },
    };
  }

  async capturePayment(paymentId: string, amount: number): Promise<any> {
    // Usually triggered by delivery agent upon receiving cash
    return { status: "captured", paymentId, amount };
  }
}
