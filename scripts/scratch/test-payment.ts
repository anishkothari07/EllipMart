import { paymentService } from "@/lib/modules/payment/payment.service";
import { db } from "@/lib/db";

async function run() {
  try {
    console.log("Creating checkout session...");
    const session = await paymentService.createCheckoutSession({
      userId: "test-user-1",
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
    const refund = await paymentService.refundPayment(init.paymentId, 50, "Customer requested partial refund");
    console.log("Refund result:", refund);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

run();
