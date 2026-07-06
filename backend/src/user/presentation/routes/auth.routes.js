const { Router }         = require("express");
const { AuthController } = require("../controllers/AuthController");

const createAuthRouter = (registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService) => {
  const router         = Router();
  const authController = new AuthController(registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService);

  router.post("/register",         authController.register.bind(authController));
  router.post("/register-medico",  authController.registerMedico.bind(authController));
  router.post("/login",            authController.login.bind(authController));
  router.post("/forgot-password",  authController.forgotPassword.bind(authController));
  router.post("/reset-password",   authController.resetPassword.bind(authController));

  return router;
};

module.exports = { createAuthRouter };