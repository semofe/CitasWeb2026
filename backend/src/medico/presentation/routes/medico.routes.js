const { Router }          = require("express");
const { MedicoController } = require("../controllers/MedicoController");
const { authMiddleware }  = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware }  = require("../../../user/presentation/middlewares/roleMiddleware");

const createMedicoRouter = (medicoService, registerMedicoService) => {
  const router           = Router();
  const medicoController = new MedicoController(medicoService, registerMedicoService);

  router.post("/",                           authMiddleware, roleMiddleware("admin"), medicoController.create.bind(medicoController));
  router.post("/con-acceso",                 authMiddleware, roleMiddleware("admin"), medicoController.createConAcceso.bind(medicoController));
  router.get("/",                            authMiddleware, medicoController.getAll.bind(medicoController));
  router.get("/filtrar",                     authMiddleware, medicoController.getBySedeAndEspecialidad.bind(medicoController));
  router.get("/sede/:sedeId",                authMiddleware, medicoController.getBySede.bind(medicoController));
  router.get("/especialidad/:especialidadId", authMiddleware, medicoController.getByEspecialidad.bind(medicoController));
  router.get("/:id",                         authMiddleware, medicoController.getById.bind(medicoController));
  router.put("/:id",                         authMiddleware, roleMiddleware("admin"), medicoController.update.bind(medicoController));
  router.delete("/:id",                      authMiddleware, roleMiddleware("admin"), medicoController.delete.bind(medicoController));
  router.patch("/:id/toggle",                authMiddleware, roleMiddleware("admin"), medicoController.toggleActivo.bind(medicoController));

  return router;
};

module.exports = { createMedicoRouter };