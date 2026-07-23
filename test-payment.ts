import "dotenv/config";
import { paymentService } from "@/lib/modules/payment/payment.service";
import { refundService } from "@/lib/modules/payment/refund.service";
import { prisma as db } from "@/lib/prisma/client";

async function run() {
  try {
    const user = await db.user.upsert({
      where: { email: "test-payment@example.com" },
      update: {},
      create: {
        id: "test-payment-user-1",
        email: "test-payment@example.com",
        firstName: "Test",
        lastName: "User",
        password: "hashedpassword123",
      }
    });

    console.log("Creating checkout session...");
    const session = await paymentService.createCheckoutSession({
      userId: user.id,
      shippingAddress: "123 Main St",
      billingAddress: "123 Main St",
      subTotal: 100.0,
      taxTotal: 10.0,
      shippingTotal: 5.0,
      discountTotal: 0.0,
      grandTotal: 115.0,
      paymentProvider: "MOCK",
    });
    console.log("Session created:", session.id);

    console.log("Initializing order payment...");
    const init = await paymentService.initializeOrderPayment(session.id);
    console.log("Initialized payment:", init);

    console.log("Verifying payment...");
    const verify = await paymentService.verifyPayment(
      init.orderId,
      init.paymentId,
      "mock-provider-pay-id",
      "success-sig"
    );
    console.log("Verification result:", verify);

    const order = await db.order.findUnique({ where: { id: init.orderId } });
    console.log("Final Order Status:", order?.status);
    
    console.log("Refunding payment...");
    const refund = await refundService.processRefund(session.paymentId, 10, "Test reason");
    console.log("Refund Processed:", refund);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
