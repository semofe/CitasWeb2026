const createAuthRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 10 } = {}) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = attempts.get(key);
    const current = !entry || now >= entry.resetAt
      ? { count: 0, resetAt: now + windowMs }
      : entry;

    if (current.count >= max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      return res.status(429).json({ ok: false, message: "Demasiados intentos. Intenta nuevamente más tarde." });
    }

    current.count += 1;
    attempts.set(key, current);
    return next();
  };
};

module.exports = { createAuthRateLimiter };
