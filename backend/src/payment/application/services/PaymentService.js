const APPOINTMENT_PRICE_CENTS = 5500;
const APPOINTMENT_CURRENCY = "PEN";
const PAYMENT_RESERVATION_MINUTES = 5;

class PaymentService {
  constructor(citaRepository, paymentRepository, paymentGateway, createReference = () => crypto.randomUUID()) {
    this.citaRepository = citaRepository;
    this.paymentRepository = paymentRepository;
    this.paymentGateway = paymentGateway;
    this.createReference = createReference;
  }

  async createCheckout(citaId, pacienteDni) {
    const cita = await this.citaRepository.findById(citaId);
    if (!cita) throw new Error("Cita no encontrada");
    if (cita.pacienteDni !== pacienteDni) throw new Error("No tienes permiso para pagar esta cita");
    if (cita.estado !== "pendiente_pago") throw new Error("La cita no está pendiente de pago");

    const pendingPayment = await this.paymentRepository.findPendingByCitaId(citaId);
    if (pendingPayment) return pendingPayment;

    const internalReference = this.createReference();
    const checkout = await this.paymentGateway.createCheckout({
      amount: APPOINTMENT_PRICE_CENTS,
      currency: APPOINTMENT_CURRENCY,
      reference: internalReference,
      description: "Reserva de cita médica",
    });

    return this.paymentRepository.save({
      citaId,
      amount: APPOINTMENT_PRICE_CENTS,
      currency: APPOINTMENT_CURRENCY,
      status: "pendiente",
      provider: "payme",
      internalReference,
      providerReference: checkout.providerReference,
      checkoutUrl: checkout.checkoutUrl,
    });
  }

  async expirePendingPayments(now = new Date()) {
    const cutoff = new Date(now.getTime() - PAYMENT_RESERVATION_MINUTES * 60 * 1000);
    const expiredPayments = await this.paymentRepository.findPendingCreatedBefore(cutoff);

    for (const payment of expiredPayments) {
      await this.paymentRepository.markExpired(payment.id);
      await this.citaRepository.update(payment.citaId, { estado: "expirada" });
    }

    return expiredPayments.length;
  }

  async processSimulatedResult(paymentId, pacienteDni, result) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Pago no encontrado");

    const cita = await this.citaRepository.findById(payment.citaId);
    if (!cita || cita.pacienteDni !== pacienteDni) {
      throw new Error("No tienes permiso para procesar este pago");
    }

    if (payment.status !== "pendiente") return payment;
    if (!["aprobado", "rechazado"].includes(result)) {
      throw new Error("Resultado de pago inválido");
    }

    await this.paymentRepository.updateStatus(payment.id, result);
    await this.citaRepository.update(payment.citaId, {
      estado: result === "aprobado" ? "programada" : "expirada",
    });

    return { ...payment, status: result };
  }

  async processWebhook(payload, signature) {
    const isValid = this.paymentGateway.verifyWebhook(payload, signature);
    if (!isValid) throw new Error("Firma inválida");

    const payment = await this.paymentRepository.findById(payload.paymentId);
    if (!payment) throw new Error("Pago no encontrado");
    if (payment.amount !== payload.amount || payment.currency !== payload.currency) {
      throw new Error("Monto o moneda inválidos");
    }
    if (payment.status !== "pendiente") return { ...payment, duplicate: true };
    if (!["aprobado", "rechazado"].includes(payload.status)) {
      throw new Error("Estado de pago inválido");
    }

    await this.paymentRepository.updateStatus(payment.id, payload.status);
    await this.citaRepository.update(payment.citaId, {
      estado: payload.status === "aprobado" ? "programada" : "expirada",
    });

    return { ...payment, status: payload.status };
  }

  async getPaymentForPatient(paymentId, pacienteDni) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Pago no encontrado");

    const cita = await this.citaRepository.findById(payment.citaId);
    if (!cita || cita.pacienteDni !== pacienteDni) {
      throw new Error("No tienes permiso para ver este pago");
    }

    return payment;
  }
}

module.exports = {
  PaymentService,
  APPOINTMENT_PRICE_CENTS,
  APPOINTMENT_CURRENCY,
  PAYMENT_RESERVATION_MINUTES,
};
