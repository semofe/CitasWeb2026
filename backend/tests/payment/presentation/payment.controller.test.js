const { PaymentController } = require("../../../src/payment/presentation/controllers/PaymentController");

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe("PaymentController", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const buildController = () => {
    const payment = { id: "payment-1", status: "pendiente" };
    const service = {
      createCheckout: jest.fn().mockResolvedValue(payment),
      getPaymentForPatient: jest.fn().mockResolvedValue(payment),
      processSimulatedResult: jest.fn().mockResolvedValue({ ...payment, status: "aprobado" }),
      processWebhook: jest.fn().mockResolvedValue({ ...payment, status: "aprobado" }),
    };
    return { controller: new PaymentController(service, {}), service };
  };

  test("crea checkout y obtiene un pago del paciente", async () => {
    const { controller, service } = buildController();
    const checkoutResponse = createResponse();
    const getResponse = createResponse();

    await controller.createCheckout({ body: { citaId: "cita-1" }, user: { dni: "12345678" } }, checkoutResponse);
    await controller.getById({ params: { id: "payment-1" }, user: { dni: "12345678" } }, getResponse);

    expect(service.createCheckout).toHaveBeenCalledWith("cita-1", "12345678");
    expect(checkoutResponse.status).toHaveBeenCalledWith(201);
    expect(service.getPaymentForPatient).toHaveBeenCalledWith("payment-1", "12345678");
    expect(getResponse.status).toHaveBeenCalledWith(200);
  });

  test("simula pagos fuera de producción y procesa webhooks", async () => {
    process.env.NODE_ENV = "test";
    const { controller, service } = buildController();
    const simulationResponse = createResponse();
    const webhookResponse = createResponse();

    await controller.simulateResult({ params: { id: "payment-1" }, user: { dni: "12345678" }, body: { result: "approved" } }, simulationResponse);
    await controller.webhook({ body: { paymentId: "payment-1" }, headers: { "x-payment-signature": "firma" } }, webhookResponse);

    expect(service.processSimulatedResult).toHaveBeenCalledWith("payment-1", "12345678", "approved");
    expect(simulationResponse.status).toHaveBeenCalledWith(200);
    expect(service.processWebhook).toHaveBeenCalledWith({ paymentId: "payment-1" }, "firma");
    expect(webhookResponse.status).toHaveBeenCalledWith(200);
  });

  test("oculta la simulación en producción y controla errores", async () => {
    process.env.NODE_ENV = "production";
    const { controller, service } = buildController();
    const productionResponse = createResponse();

    await controller.simulateResult({ params: { id: "payment-1" }, user: { dni: "12345678" }, body: {} }, productionResponse);
    expect(productionResponse.status).toHaveBeenCalledWith(404);

    process.env.NODE_ENV = "test";
    service.createCheckout.mockRejectedValue(new Error("Cita no válida"));
    service.getPaymentForPatient.mockRejectedValue(new Error("No encontrado"));
    service.processSimulatedResult.mockRejectedValue(new Error("Resultado inválido"));
    service.processWebhook.mockRejectedValue(new Error("Firma inválida"));

    const checkoutResponse = createResponse();
    const getResponse = createResponse();
    const simulationResponse = createResponse();
    const webhookResponse = createResponse();
    await controller.createCheckout({ body: {}, user: { dni: "12345678" } }, checkoutResponse);
    await controller.getById({ params: { id: "payment-1" }, user: { dni: "12345678" } }, getResponse);
    await controller.simulateResult({ params: { id: "payment-1" }, user: { dni: "12345678" }, body: {} }, simulationResponse);
    await controller.webhook({ body: {}, headers: {} }, webhookResponse);

    expect(checkoutResponse.status).toHaveBeenCalledWith(400);
    expect(getResponse.status).toHaveBeenCalledWith(500);
    expect(simulationResponse.status).toHaveBeenCalledWith(400);
    expect(webhookResponse.status).toHaveBeenCalledWith(400);
  });
});
