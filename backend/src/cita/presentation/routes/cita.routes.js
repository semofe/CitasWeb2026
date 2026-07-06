const { Router }         = require("express");
const { CitaController } = require("../controllers/CitaController");
const { authMiddleware } = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../../user/presentation/middlewares/roleMiddleware");

const createCitaRouter = (citaService) => {
  const router         = Router();
  const citaController = new CitaController(citaService);

  // POST
  router.post("/",                authMiddleware, citaController.create.bind(citaController));
  
  // GET específicos (deben ir ANTES de GET /:id)
  router.get("/mis-citas",           authMiddleware, citaController.getMisCitas.bind(citaController));
  router.get("/mis-citas-medico",    authMiddleware, citaController.getMisCitasMedico.bind(citaController));
  router.get("/slots",               authMiddleware, citaController.getSlotsDisponibles.bind(citaController));
  router.get("/medico/:medicoId",    authMiddleware, roleMiddleware("admin"), citaController.getByMedico.bind(citaController));
  
  // PATCH con rutas específicas
  router.patch("/:id/cancelar",   authMiddleware, citaController.cancelar.bind(citaController));
  router.patch("/:id/completar",  authMiddleware, roleMiddleware("admin", "medico"), citaController.completar.bind(citaController));
  router.patch("/:id",            authMiddleware, citaController.actualizar.bind(citaController));
  
  // GET genérico (al final)
  router.get("/",                 authMiddleware, roleMiddleware("admin"), citaController.getAll.bind(citaController));

  return router;
};

module.exports = { createCitaRouter };