const { Router }         = require("express");
const { AuthController } = require("../controllers/AuthController");

const createAuthRouter = (registerService, loginService, registerMedicoService) => {
  const router         = Router();
  const authController = new AuthController(registerService, loginService, registerMedicoService);

  router.post("/register",         authController.register.bind(authController));
  router.post("/register-medico",  authController.registerMedico.bind(authController));
  router.post("/login",            authController.login.bind(authController));

  return router;
};

module.exports = { createAuthRouter };