const { Payment, PaymentSchema } = require("../../../src/payment/domain/entities/Payment");

describe("Payment", () => {
  it("representa una orden pendiente con el importe fijo de la cita", () => {
    const payment = new Payment({
      citaId: "cita-123",
      amount: 5500,
      currency: "PEN",
      provider: "payme",
      internalReference: "orden-123",
      providerReference: "payme-456",
      checkoutUrl: "https://sandbox.example/payme-456",
    });

    expect(payment).toMatchObject({
      citaId: "cita-123",
      amount: 5500,
      currency: "PEN",
      status: "pendiente",
      provider: "payme",
      internalReference: "orden-123",
    });
    expect(PaymentSchema.options.tableName).toBe("payments");
  });

  it("preserva un estado recibido y permite construir una entidad vacía", () => {
    expect(new Payment({ status: "aprobado" }).status).toBe("aprobado");
    expect(new Payment().status).toBe("pendiente");
  });
});
