const express = require("express");
const request = require("supertest");

const { createAuthRateLimiter } = require("../../src/common/presentation/middlewares/authRateLimiter");
const { selfOrAdminMiddleware } = require("../../src/user/presentation/middlewares/ownershipMiddleware");
const { UserService } = require("../../src/user/application/services/UserService");

describe("Controles OWASP", () => {
  it("limita solicitudes repetidas de autenticación", async () => {
    const app = express();
    app.post("/login", createAuthRateLimiter({ windowMs: 60_000, max: 1 }), (req, res) => {
      res.status(200).json({ ok: true });
    });

    await request(app).post("/login").expect(200);
    await request(app).post("/login").expect(429);
  });

  it("bloquea el acceso a perfiles de otros pacientes", async () => {
    const app = express();
    app.use((req, res, next) => {
      req.user = { dni: "12345678", role: "usuario" };
      next();
    });
    app.get("/users/:dni", selfOrAdminMiddleware, (req, res) => res.json({ ok: true }));

    await request(app).get("/users/87654321").expect(403);
    await request(app).get("/users/12345678").expect(200);
  });

  it("evita asignación masiva de rol durante la actualización de perfil", async () => {
    const repository = {
      findByDni: jest.fn().mockResolvedValue({ dni: "12345678" }),
      findByEmail: jest.fn(),
      update: jest.fn().mockResolvedValue({ dni: "12345678" }),
    };
    const service = new UserService(repository);

    await service.update("12345678", { names: "Ana", role: "admin" });

    expect(repository.update).toHaveBeenCalledWith("12345678", { names: "Ana" });
  });
});
