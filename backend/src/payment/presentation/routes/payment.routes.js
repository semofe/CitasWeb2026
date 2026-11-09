const { Router } = require("express");
const { PaymentController } = require("../controllers/PaymentController");
const { authMiddleware } = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../../user/presentation/middlewares/roleMiddleware");

const createPaymentRouter = (paymentService, paymentRepository) => {
  const router = Router();
  const controller = new PaymentController(paymentService, paymentRepository);

  router.post("/webhook", controller.webhook.bind(controller));
  router.post("/checkout", authMiddleware, roleMiddleware("usuario"), controller.createCheckout.bind(controller));
  router.get("/:id", authMiddleware, roleMiddleware("usuario"), controller.getById.bind(controller));
  router.post("/:id/simular", authMiddleware, roleMiddleware("usuario"), controller.simulateResult.bind(controller));

  return router;
};

module.exports = { createPaymentRouter };
