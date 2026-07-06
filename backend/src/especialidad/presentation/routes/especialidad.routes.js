const { Router }                 = require("express");
const { EspecialidadController } = require("../controllers/EspecialidadController");
const { authMiddleware }         = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware }         = require("../../../user/presentation/middlewares/roleMiddleware");

const createEspecialidadRouter = (especialidadService) => {
  const router                 = Router();
  const especialidadController = new EspecialidadController(especialidadService);

  router.post("/",       authMiddleware, roleMiddleware("admin"), especialidadController.create.bind(especialidadController));
  router.get("/",        authMiddleware, especialidadController.getAll.bind(especialidadController));
  router.get("/activas", authMiddleware, especialidadController.getActivas.bind(especialidadController));
  router.get("/:id",     authMiddleware, especialidadController.getById.bind(especialidadController));
  router.put("/:id",     authMiddleware, roleMiddleware("admin"), especialidadController.update.bind(especialidadController));
  router.delete("/:id",  authMiddleware, roleMiddleware("admin"), especialidadController.delete.bind(especialidadController));

  return router;
};

module.exports = { createEspecialidadRouter };