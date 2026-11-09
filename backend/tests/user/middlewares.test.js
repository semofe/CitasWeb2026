const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../../src/user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../src/user/presentation/middlewares/roleMiddleware");

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe("Middlewares de autenticación y roles", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "una-clave-de-pruebas-con-mas-de-32-caracteres";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  test("rechaza solicitudes sin token Bearer", () => {
    const res = createResponse();
    const next = jest.fn();

    authMiddleware({ headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token not provided" });
    expect(next).not.toHaveBeenCalled();
  });

  test("acepta un JWT válido y adjunta el usuario a la solicitud", () => {
    const token = jwt.sign({ dni: "12345678", role: "usuario" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toEqual(expect.objectContaining({ dni: "12345678", role: "usuario" }));
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("rechaza un JWT inválido", () => {
    const res = createResponse();
    const next = jest.fn();

    authMiddleware({ headers: { authorization: "Bearer token-invalido" } }, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  test("autoriza y bloquea según el rol requerido", () => {
    const allowAdmin = roleMiddleware("admin");
    const allowedResponse = createResponse();
    const deniedResponse = createResponse();
    const next = jest.fn();

    allowAdmin({ user: { role: "admin" } }, allowedResponse, next);
    allowAdmin({ user: { role: "usuario" } }, deniedResponse, jest.fn());

    expect(next).toHaveBeenCalledTimes(1);
    expect(deniedResponse.status).toHaveBeenCalledWith(403);
    expect(deniedResponse.json).toHaveBeenCalledWith({
      ok: false,
      message: "Access denied: insufficient permissions",
    });
  });
});
