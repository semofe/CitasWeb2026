const {
  PaymentService,
  APPOINTMENT_PRICE_CENTS,
  PAYMENT_RESERVATION_MINUTES,
} = require("../../../src/payment/application/services/PaymentService");

describe("PaymentService.createCheckout", () => {
  const cita = {
    id: "cita-123",
    pacienteDni: "12345678",
    estado: "pendiente_pago",
  };

  let citaRepository;
  let paymentRepository;
  let paymentGateway;
  let service;

  beforeEach(() => {
    citaRepository = {
      findById: jest.fn().mockResolvedValue(cita),
    };
    paymentRepository = {
      findPendingByCitaId: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation(async (payment) => ({ id: "pago-123", ...payment })),
    };
    paymentGateway = {
      createCheckout: jest.fn().mockResolvedValue({
        providerReference: "payme-456",
        checkoutUrl: "https://sandbox.example/payme-456",
      }),
    };

    service = new PaymentService(citaRepository, paymentRepository, paymentGateway, () => "orden-123");
  });

  it("crea una orden pendiente de S/ 55.00 calculada por el servidor", async () => {
    const payment = await service.createCheckout("cita-123", "12345678");

    expect(payment).toMatchObject({
      id: "pago-123",
      citaId: "cita-123",
      amount: APPOINTMENT_PRICE_CENTS,
      currency: "PEN",
      status: "pendiente",
      provider: "payme",
      internalReference: "orden-123",
      providerReference: "payme-456",
      checkoutUrl: "https://sandbox.example/payme-456",
    });
    expect(paymentGateway.createCheckout).toHaveBeenCalledWith(expect.objectContaining({
      amount: 5500,
      currency: "PEN",
      reference: "orden-123",
    }));
  });

  it("rechaza el pago si la cita pertenece a otro paciente", async () => {
    await expect(service.createCheckout("cita-123", "87654321"))
      .rejects.toThrow("No tienes permiso para pagar esta cita");
  });

  it("rechaza el pago cuando la cita no existe", async () => {
    citaRepository.findById.mockResolvedValue(null);

    await expect(service.createCheckout("cita-inexistente", "12345678"))
      .rejects.toThrow("Cita no encontrada");
  });

  it("rechaza el pago de una cita que no está pendiente", async () => {
    citaRepository.findById.mockResolvedValue({ ...cita, estado: "confirmada" });

    await expect(service.createCheckout("cita-123", "12345678"))
      .rejects.toThrow("La cita no está pendiente de pago");
  });

  it("devuelve el pago pendiente existente sin crear otro checkout", async () => {
    const existingPayment = { id: "pago-existente", citaId: "cita-123", status: "pendiente" };
    paymentRepository.findPendingByCitaId.mockResolvedValue(existingPayment);

    await expect(service.createCheckout("cita-123", "12345678"))
      .resolves.toEqual(existingPayment);
    expect(paymentGateway.createCheckout).not.toHaveBeenCalled();
    expect(paymentRepository.save).not.toHaveBeenCalled();
  });

  it("genera una referencia interna segura cuando no se inyecta una", async () => {
    const serviceWithDefaultReference = new PaymentService(citaRepository, paymentRepository, paymentGateway);

    const payment = await serviceWithDefaultReference.createCheckout("cita-123", "12345678");

    expect(payment.internalReference).toMatch(/^[0-9a-f-]{36}$/i);
  });

  describe("expirePendingPayments", () => {
    it("expira pagos vencidos a los cinco minutos y libera sus horarios", async () => {
      const now = new Date("2026-11-08T15:00:00.000Z");
      const expiredPayments = [
        { id: "pago-1", citaId: "cita-1" },
        { id: "pago-2", citaId: "cita-2" },
      ];
      paymentRepository.findPendingCreatedBefore = jest.fn().mockResolvedValue(expiredPayments);
      paymentRepository.markExpired = jest.fn();
      citaRepository.update = jest.fn();

      const result = await service.expirePendingPayments(now);

      expect(PAYMENT_RESERVATION_MINUTES).toBe(5);
      expect(paymentRepository.findPendingCreatedBefore)
        .toHaveBeenCalledWith(new Date("2026-11-08T14:55:00.000Z"));
      expect(paymentRepository.markExpired).toHaveBeenCalledTimes(2);
      expect(citaRepository.update).toHaveBeenCalledWith("cita-1", { estado: "expirada" });
      expect(citaRepository.update).toHaveBeenCalledWith("cita-2", { estado: "expirada" });
      expect(result).toBe(2);
    });

    it("no modifica citas cuando no hay pagos vencidos", async () => {
      paymentRepository.findPendingCreatedBefore = jest.fn().mockResolvedValue([]);
      paymentRepository.markExpired = jest.fn();
      citaRepository.update = jest.fn();

      await expect(service.expirePendingPayments(new Date("2026-11-08T15:00:00.000Z")))
        .resolves.toBe(0);
      expect(paymentRepository.markExpired).not.toHaveBeenCalled();
      expect(citaRepository.update).not.toHaveBeenCalled();
    });

    it("usa la hora actual cuando no se proporciona una fecha de referencia", async () => {
      paymentRepository.findPendingCreatedBefore = jest.fn().mockResolvedValue([]);

      await service.expirePendingPayments();

      expect(paymentRepository.findPendingCreatedBefore).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe("processSimulatedResult", () => {
    beforeEach(() => {
      paymentRepository.findById = jest.fn().mockResolvedValue({
        id: "pago-123",
        citaId: "cita-123",
        status: "pendiente",
      });
      paymentRepository.updateStatus = jest.fn().mockResolvedValue(undefined);
      citaRepository.update = jest.fn().mockResolvedValue(undefined);
    });

    it("confirma una cita solo tras aprobar el pago", async () => {
      const payment = await service.processSimulatedResult("pago-123", "12345678", "aprobado");

      expect(paymentRepository.updateStatus).toHaveBeenCalledWith("pago-123", "aprobado");
      expect(citaRepository.update).toHaveBeenCalledWith("cita-123", { estado: "programada" });
      expect(payment).toMatchObject({ id: "pago-123", status: "aprobado" });
    });

    it("expira y libera la cita cuando el pago es rechazado", async () => {
      const payment = await service.processSimulatedResult("pago-123", "12345678", "rechazado");

      expect(paymentRepository.updateStatus).toHaveBeenCalledWith("pago-123", "rechazado");
      expect(citaRepository.update).toHaveBeenCalledWith("cita-123", { estado: "expirada" });
      expect(payment).toMatchObject({ id: "pago-123", status: "rechazado" });
    });

    it("no procesa dos veces una orden que ya tiene resultado", async () => {
      paymentRepository.findById.mockResolvedValue({ id: "pago-123", citaId: "cita-123", status: "aprobado" });

      await expect(service.processSimulatedResult("pago-123", "12345678", "aprobado"))
        .resolves.toMatchObject({ status: "aprobado" });
      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
      expect(citaRepository.update).not.toHaveBeenCalled();
    });

    it("rechaza pagos inexistentes, ajenos o con resultados no permitidos", async () => {
      paymentRepository.findById.mockResolvedValueOnce(null);
      await expect(service.processSimulatedResult("pago-404", "12345678", "aprobado"))
        .rejects.toThrow("Pago no encontrado");

      citaRepository.findById.mockResolvedValueOnce({ ...cita, pacienteDni: "87654321" });
      await expect(service.processSimulatedResult("pago-123", "12345678", "aprobado"))
        .rejects.toThrow("No tienes permiso para procesar este pago");

      await expect(service.processSimulatedResult("pago-123", "12345678", "pendiente"))
        .rejects.toThrow("Resultado de pago inválido");
    });
  });

  describe("processWebhook", () => {
  it("rechaza un webhook con firma inválida", async () => {
      paymentGateway.verifyWebhook = jest.fn().mockReturnValue(false);

  await expect(
    service.processWebhook(
          { paymentId: "pago-123", amount: 5500, status: "aprobado" },
          "firma-falsa",
        ),
  ).rejects.toThrow("Firma inválida");
    });

    it("confirma una cita cuando el webhook válido informa S/ 55.00", async () => {
      paymentGateway.verifyWebhook = jest.fn().mockReturnValue(true);
      paymentRepository.findById = jest.fn().mockResolvedValue({
        id: "pago-123",
        citaId: "cita-123",
        amount: 5500,
        currency: "PEN",
        status: "pendiente",
      });
      paymentRepository.updateStatus = jest.fn();
      citaRepository.update = jest.fn();

      await expect(
        service.processWebhook(
          { paymentId: "pago-123", amount: 5500, currency: "PEN", status: "aprobado" },
          "firma-válida",
        ),
      ).resolves.toMatchObject({ status: "aprobado" });

      expect(paymentRepository.updateStatus).toHaveBeenCalledWith("pago-123", "aprobado");
      expect(citaRepository.update).toHaveBeenCalledWith("cita-123", { estado: "programada" });
    });

    it("identifica un webhook duplicado sin modificar nuevamente la cita", async () => {
      paymentGateway.verifyWebhook = jest.fn().mockReturnValue(true);
      paymentRepository.findById = jest.fn().mockResolvedValue({
        id: "pago-123",
        citaId: "cita-123",
        amount: 5500,
        currency: "PEN",
        status: "aprobado",
      });
      paymentRepository.updateStatus = jest.fn();
      citaRepository.update = jest.fn();

      await expect(
        service.processWebhook(
          { paymentId: "pago-123", amount: 5500, currency: "PEN", status: "aprobado" },
          "firma-válida",
        ),
      ).resolves.toMatchObject({ status: "aprobado", duplicate: true });

      expect(paymentRepository.updateStatus).not.toHaveBeenCalled();
      expect(citaRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("getPaymentForPatient", () => {
    it("impide que un paciente consulte el pago de otra persona", async () => {
      paymentRepository.findById = jest.fn().mockResolvedValue({ id: "pago-123", citaId: "cita-123" });
      citaRepository.findById = jest.fn().mockResolvedValue({ ...cita, pacienteDni: "87654321" });

      await expect(service.getPaymentForPatient("pago-123", "12345678"))
        .rejects.toThrow("No tienes permiso para ver este pago");
    });
});
});
