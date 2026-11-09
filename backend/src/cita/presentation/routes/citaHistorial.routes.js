// src/backend/cita/presentation/routes/citaHistorial.routes.js

const { Router } = require("express");
const { CitaHistorialController } = require("../controllers/CitaHistorialController");
const { authMiddleware } = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../../user/presentation/middlewares/roleMiddleware");

const createCitaHistorialRouter = (citaHistorialService) => {
  const router = Router();
  const citaHistorialController = new CitaHistorialController(citaHistorialService);

  router.get("/mis-citas-historial", authMiddleware, citaHistorialController.getHistorialByPaciente.bind(citaHistorialController));
  router.get("/medico/:medicoId", authMiddleware, roleMiddleware("admin"), citaHistorialController.getHistorialByMedico.bind(citaHistorialController));
  router.get("/", authMiddleware, roleMiddleware("admin"), citaHistorialController.getAllHistorial.bind(citaHistorialController));

  return router;
};

module.exports = { createCitaHistorialRouter };
