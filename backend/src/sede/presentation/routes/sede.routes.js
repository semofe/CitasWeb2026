const { Router }         = require("express");
const { SedeController } = require("../controllers/SedeController");
const { authMiddleware } = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../../user/presentation/middlewares/roleMiddleware");

const createSedeRouter = (sedeService) => {
  const router         = Router();
  const sedeController = new SedeController(sedeService);

  router.post("/",       authMiddleware, roleMiddleware("admin"), sedeController.create.bind(sedeController));
  router.get("/",        authMiddleware, sedeController.getAll.bind(sedeController));
  router.get("/activas", authMiddleware, sedeController.getActivas.bind(sedeController));
  router.get("/:id",     authMiddleware, sedeController.getById.bind(sedeController));
  router.put("/:id",     authMiddleware, roleMiddleware("admin"), sedeController.update.bind(sedeController));
  router.delete("/:id",  authMiddleware, roleMiddleware("admin"), sedeController.delete.bind(sedeController));

  return router;
};

module.exports = { createSedeRouter };