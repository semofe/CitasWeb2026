// src/backend/user/presentation/middlewares/roleMiddleware.js

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const { role } = req.user;  // viene del authMiddleware

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        ok:      false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = { roleMiddleware };