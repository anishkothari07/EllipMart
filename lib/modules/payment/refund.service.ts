import { prisma as db } from "@/lib/prisma/client";
import { PaymentStatus, PaymentEventStatus } from "@prisma/client";
import { paymentRegistry } from "./registry";

export class RefundService {
  async processRefund(paymentId: string, amount: number, reason?: string) {
    const payment = await db.payment.findUnique({ 
      where: { id: paymentId },
      include: { refunds: true }
    });
    
    if (!payment) throw new Error("Payment not found");
    if (payment.status !== PaymentStatus.CAPTURED && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new Error("Payment cannot be refunded in its current status");
    }

    const totalRefunded = payment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    if (totalRefunded + amount > Number(payment.amount)) {
      throw new Error("Refund amount exceeds the original payment amount");
    }

    // Determine the active provider configuration
    const providerRecord = await db.paymentProvider.findUnique({
      where: { code: payment.provider },
      include: { configs: { where: { isActive: true } } }
    });

    const config = providerRecord?.configs[0] || {};
    const provider = paymentRegistry.resolve(payment.provider, config);

    if (!provider.refundPayment) throw new Error("Provider does not support refunds");

    const refundRecord = await db.refund.create({
      data: {
        paymentId,
        amount,
        reason,
        status: PaymentStatus.REFUND_PENDING,
      }
    });

    try {
      await db.paymentEvent.create({
        data: {
          paymentId,
          status: PaymentEventStatus.REFUND_STARTED,
          providerPaymentId: payment.providerPaymentId,
        }
      });

      const result = await provider.refundPayment(payment.providerPaymentId || paymentId, amount, reason);

      await db.refund.update({
        where: { id: refundRecord.id },
        data: {
          status: PaymentStatus.REFUNDED,
          providerRefundId: result.providerRefundId,
        }
      });

      // Check if partially or fully refunded
      const newTotalRefunded = totalRefunded + amount;
      const newPaymentStatus = newTotalRefunded >= Number(payment.amount) 
        ? PaymentStatus.REFUNDED 
        : PaymentStatus.PARTIALLY_REFUNDED;

      await db.payment.update({
        where: { id: paymentId },
        data: { status: newPaymentStatus }
      });

      await db.paymentEvent.create({
        data: {
          paymentId,
          status: PaymentEventStatus.REFUNDED,
          providerPaymentId: result.providerRefundId,
          rawPayload: JSON.stringify(result),
        }
      });

      return result;
    } catch (error: any) {
      await db.refund.update({
        where: { id: refundRecord.id },
        data: {
          status: PaymentStatus.FAILED,
          reason: error.message || "Refund failed",
        }
      });
      throw error;
    }
  }

  async getRefundHistory(paymentId: string) {
    return await db.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const refundService = new RefundService();
