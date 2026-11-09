class PaymentController {
  constructor(paymentService, paymentRepository) {
    this.paymentService = paymentService;
    this.paymentRepository = paymentRepository;
  }

  async createCheckout(req, res) {
    try {
      const payment = await this.paymentService.createCheckout(req.body.citaId, req.user.dni);
      return res.status(201).json({ ok: true, data: payment });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const payment = await this.paymentService.getPaymentForPatient(req.params.id, req.user.dni);
      return res.status(200).json({ ok: true, data: payment });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async simulateResult(req, res) {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ ok: false, message: "Ruta no disponible" });
    }
    try {
      const payment = await this.paymentService.processSimulatedResult(
        req.params.id,
        req.user.dni,
        req.body.result,
      );
      return res.status(200).json({ ok: true, data: payment });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async webhook(req, res) {
    try {
      const payment = await this.paymentService.processWebhook(
        req.body,
        req.headers["x-payment-signature"],
      );
      return res.status(200).json({ ok: true, data: payment });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { PaymentController };
