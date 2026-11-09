const selfOrAdminMiddleware = (req, res, next) => {
  if (req.user?.role === "admin" || req.user?.dni === req.params.dni) {
    return next();
  }

  return res.status(403).json({ ok: false, message: "No tienes permiso para acceder a este recurso" });
};

module.exports = { selfOrAdminMiddleware };
