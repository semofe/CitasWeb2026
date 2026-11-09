class SimulatedPaymentGateway {
  async createCheckout({ reference }) {
    return {
      providerReference: `sim-${reference}`,
      checkoutUrl: null,
    };
  }

  verifyWebhook() {
    return false;
  }
}

module.exports = { SimulatedPaymentGateway };
