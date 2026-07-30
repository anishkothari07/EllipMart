import { PaymentStatus } from "@prisma/client";

export interface InitializePaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface InitializePaymentResult {
  providerOrderId?: string; // Some providers don't have order concept
  amount: number;
  currency: string;
  clientSecret?: string; // For Stripe, Razorpay order_id, or token
  provider: string;
}

export interface VerifyPaymentOptions {
  orderId: string;
  paymentId: string;
  providerPaymentId: string;
  providerOrderId?: string;
  signature?: string;
  rawPayload?: any; // e.g. req.body for webhook or full verification payload
}

export interface VerifyPaymentResult {
  isVerified: boolean;
  providerPaymentId: string;
  status: PaymentStatus;
  rawResponse?: any;
}

export interface WebhookResult {
  eventId: string;
  eventType: string;
  providerPaymentId?: string;
  status: PaymentStatus;
  rawPayload: any;
}

export interface IPaymentProvider {
  /** Provider Identifier (e.g. "RAZORPAY", "STRIPE", "COD") */
  id: string; 
  
  initializePayment(options: InitializePaymentOptions): Promise<InitializePaymentResult>;
  verifyPayment(options: VerifyPaymentOptions): Promise<VerifyPaymentResult>;
  
  capturePayment?(paymentId: string, amount: number): Promise<any>;
  refundPayment?(paymentId: string, amount: number, reason?: string): Promise<any>;
  cancelPayment?(paymentId: string): Promise<any>;
  
  handleWebhook?(rawPayload: string, signature: string): Promise<WebhookResult>;
  getPaymentStatus?(providerPaymentId: string): Promise<PaymentStatus>;
}
