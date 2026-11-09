const { Router }         = require("express");
const { UserController } = require("../controllers/UserController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");
const { selfOrAdminMiddleware } = require("../middlewares/ownershipMiddleware");

const createUserRouter = (userService) => {
  const router         = Router();
  const userController = new UserController(userService);

  router.get("/",        authMiddleware, roleMiddleware("admin"), userController.getAll.bind(userController));
  router.get("/:dni",    authMiddleware, selfOrAdminMiddleware, userController.getByDni.bind(userController));
  router.put("/:dni",    authMiddleware, selfOrAdminMiddleware, userController.update.bind(userController));
  router.delete("/:dni", authMiddleware, roleMiddleware("admin"), userController.delete.bind(userController));

  return router;
};

module.exports = { createUserRouter };
