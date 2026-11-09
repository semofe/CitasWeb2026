const { Router }         = require("express");
const { AuthController } = require("../controllers/AuthController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { createAuthRateLimiter } = require("../../../common/presentation/middlewares/authRateLimiter");

const createAuthRouter = (registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService) => {
  const router         = Router();
  const authController = new AuthController(registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService);
  const loginRateLimiter = createAuthRateLimiter();

  router.post("/register",         authController.register.bind(authController));
  router.post("/register-medico",  authMiddleware, roleMiddleware("admin"), authController.registerMedico.bind(authController));
  router.post("/login",            loginRateLimiter, authController.login.bind(authController));
  router.post("/forgot-password",  authController.forgotPassword.bind(authController));
  router.post("/reset-password",   authController.resetPassword.bind(authController));

  return router;
};

module.exports = { createAuthRouter };
