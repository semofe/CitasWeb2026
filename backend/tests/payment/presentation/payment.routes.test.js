const express = require("express");
const request = require("supertest");
const { createPaymentRouter } = require("../../../src/payment/presentation/routes/payment.routes");

describe("POST /api/payments/webhook", () => {
  it("recibe el webhook y delega la validación de firma al servicio", async () => {
    const paymentService = {
      processWebhook: jest.fn().mockResolvedValue({ id: "pago-123", status: "aprobado" }),
    };
    const paymentRepository = {};
    const app = express();
    app.use(express.json());
    app.use("/api/payments", createPaymentRouter(paymentService, paymentRepository));

    await request(app)
      .post("/api/payments/webhook")
      .set("x-payment-signature", "firma-valida")
      .send({ paymentId: "pago-123", amount: 5500, currency: "PEN", status: "aprobado" })
      .expect(200)
      .expect({ ok: true, data: { id: "pago-123", status: "aprobado" } });

    expect(paymentService.processWebhook).toHaveBeenCalledWith(
      { paymentId: "pago-123", amount: 5500, currency: "PEN", status: "aprobado" },
      "firma-valida",
    );
  });
});
