const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AuthController } = require("../../src/user/presentation/controllers/AuthController");
const { UserController } = require("../../src/user/presentation/controllers/UserController");
const { ForgotPasswordService } = require("../../src/user/application/services/ForgotPasswordService");
const { ResetPasswordService } = require("../../src/user/application/services/ResetPasswordService");
const { otpService } = require("../../src/user/application/services/OtpService");

const user = {
  dni: "12345678",
  names: "Ana",
  last_names: "Pérez",
  email: "ana@example.com",
  phone: "999123456",
  sexo: "F",
  role: "usuario",
  medicoId: null,
  activo: true,
};

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe("AuthController", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(() => {
    process.env.JWT_SECRET = "una-clave-de-pruebas-con-mas-de-32-caracteres";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  const buildController = () => {
    const services = {
      register: { execute: jest.fn().mockResolvedValue(user) },
      login: { execute: jest.fn().mockResolvedValue(user) },
      registerMedico: { execute: jest.fn().mockResolvedValue(user) },
      forgot: { execute: jest.fn().mockResolvedValue(true) },
      reset: { execute: jest.fn().mockResolvedValue(true) },
    };
    return {
      services,
      controller: new AuthController(services.register, services.login, services.registerMedico, services.forgot, services.reset),
    };
  };

  test("registra usuarios y médicos, y controla sus errores", async () => {
    const { controller, services } = buildController();
    const registerResponse = createResponse();
    const medicoResponse = createResponse();
    await controller.register({ body: user }, registerResponse);
    await controller.registerMedico({ body: user }, medicoResponse);
    expect(registerResponse.status).toHaveBeenCalledWith(201);
    expect(medicoResponse.status).toHaveBeenCalledWith(201);

    services.register.execute.mockRejectedValue(new Error("DNI repetido"));
    services.registerMedico.execute.mockRejectedValue(new Error("Médico repetido"));
    const registerError = createResponse();
    const medicoError = createResponse();
    await controller.register({ body: user }, registerError);
    await controller.registerMedico({ body: user }, medicoError);
    expect(registerError.status).toHaveBeenCalledWith(400);
    expect(medicoError.status).toHaveBeenCalledWith(400);
  });

  test("inicia sesión con JWT y no revela detalles ante un fallo", async () => {
    const { controller, services } = buildController();
    const successResponse = createResponse();
    await controller.login({ body: { email: user.email, password: "ClaveSegura1" } }, successResponse);
    const responseBody = successResponse.json.mock.calls[0][0];
    expect(successResponse.status).toHaveBeenCalledWith(200);
    expect(jwt.verify(responseBody.data.token, process.env.JWT_SECRET)).toEqual(expect.objectContaining({ dni: user.dni }));

    services.login.execute.mockRejectedValue(new Error("Contraseña incorrecta"));
    const failureResponse = createResponse();
    await controller.login({ body: { email: user.email, password: "ClaveSegura1" } }, failureResponse);
    expect(failureResponse.status).toHaveBeenCalledWith(401);
    expect(failureResponse.json).toHaveBeenCalledWith({ ok: false, message: "Credenciales inválidas" });
  });

  test("protege la recuperación y el reinicio de contraseña", async () => {
    const { controller, services } = buildController();
    const missingEmail = createResponse();
    await controller.forgotPassword({ body: {} }, missingEmail);
    expect(missingEmail.status).toHaveBeenCalledWith(400);

    const forgotResponse = createResponse();
    await controller.forgotPassword({ body: { email: user.email } }, forgotResponse);
    expect(forgotResponse.status).toHaveBeenCalledWith(200);

    services.forgot.execute.mockRejectedValue(new Error("No existe"));
    const hiddenFailure = createResponse();
    await controller.forgotPassword({ body: { email: "nadie@example.com" } }, hiddenFailure);
    expect(hiddenFailure.status).toHaveBeenCalledWith(200);

    const missingResetFields = createResponse();
    await controller.resetPassword({ body: {} }, missingResetFields);
    expect(missingResetFields.status).toHaveBeenCalledWith(400);

    const resetResponse = createResponse();
    await controller.resetPassword({ body: { email: user.email, otp: "123456", newPassword: "ClaveSegura1" } }, resetResponse);
    expect(resetResponse.status).toHaveBeenCalledWith(200);

    services.reset.execute.mockRejectedValue(new Error("OTP inválido"));
    const resetError = createResponse();
    await controller.resetPassword({ body: { email: user.email, otp: "123456", newPassword: "ClaveSegura1" } }, resetError);
    expect(resetError.status).toHaveBeenCalledWith(400);
  });
});

describe("UserController", () => {
  const buildService = () => ({
    getAll: jest.fn().mockResolvedValue([user]),
    getByDni: jest.fn().mockResolvedValue(user),
    update: jest.fn().mockResolvedValue(user),
    delete: jest.fn().mockResolvedValue(true),
  });

  test("responde correctamente las operaciones de usuario", async () => {
    const service = buildService();
    const controller = new UserController(service);
    const allResponse = createResponse();
    const byDniResponse = createResponse();
    const updateResponse = createResponse();
    const deleteResponse = createResponse();

    await controller.getAll({}, allResponse);
    await controller.getByDni({ params: { dni: user.dni } }, byDniResponse);
    await controller.update({ params: { dni: user.dni }, body: { names: "Ana" } }, updateResponse);
    await controller.delete({ params: { dni: user.dni } }, deleteResponse);

    expect(allResponse.status).toHaveBeenCalledWith(200);
    expect(byDniResponse.status).toHaveBeenCalledWith(200);
    expect(updateResponse.status).toHaveBeenCalledWith(200);
    expect(deleteResponse.status).toHaveBeenCalledWith(200);
  });

  test("responde con el código correcto cuando el servicio falla", async () => {
    const service = buildService();
    service.getAll.mockRejectedValue(new Error("Error interno"));
    service.getByDni.mockRejectedValue(new Error("No encontrado"));
    service.update.mockRejectedValue(new Error("Datos inválidos"));
    service.delete.mockRejectedValue(new Error("No encontrado"));
    const controller = new UserController(service);

    const allResponse = createResponse();
    const byDniResponse = createResponse();
    const updateResponse = createResponse();
    const deleteResponse = createResponse();
    await controller.getAll({}, allResponse);
    await controller.getByDni({ params: { dni: user.dni } }, byDniResponse);
    await controller.update({ params: { dni: user.dni }, body: {} }, updateResponse);
    await controller.delete({ params: { dni: user.dni } }, deleteResponse);

    expect(allResponse.status).toHaveBeenCalledWith(500);
    expect(byDniResponse.status).toHaveBeenCalledWith(404);
    expect(updateResponse.status).toHaveBeenCalledWith(400);
    expect(deleteResponse.status).toHaveBeenCalledWith(404);
  });
});

describe("Servicios de recuperación de contraseña", () => {
  test("genera, verifica y consume un OTP", () => {
    const email = `otp-${Date.now()}@example.com`;
    const otp = otpService.generate(email);
    expect(otpService.verify(email, otp)).toBe(true);
    expect(otpService.verify(email, "000000")).toBe(false);
    otpService.consume(email);
    expect(otpService.verify(email, otp)).toBe(false);
  });

  test("envía un OTP solo para cuentas existentes", async () => {
    const userRepository = { findByEmail: jest.fn().mockResolvedValue(user) };
    const otp = { generate: jest.fn().mockReturnValue("123456") };
    const email = { enviarOtp: jest.fn().mockResolvedValue(true) };
    const service = new ForgotPasswordService(userRepository, otp, email);

    await expect(service.execute(user.email)).resolves.toBe(true);
    expect(email.enviarOtp).toHaveBeenCalledWith(user, "123456");

    userRepository.findByEmail.mockResolvedValue(null);
    await expect(service.execute("nadie@example.com")).rejects.toThrow("No existe una cuenta");
  });

  test("actualiza la contraseña solo con OTP válido y contraseña robusta", async () => {
    const repository = { updatePasswordByEmail: jest.fn().mockResolvedValue(true) };
    const otp = { verify: jest.fn().mockReturnValue(true), consume: jest.fn() };
    const service = new ResetPasswordService(repository, otp);

    await expect(service.execute(user.email, "123456", "clave")).rejects.toThrow("8 caracteres");
    otp.verify.mockReturnValue(false);
    await expect(service.execute(user.email, "123456", "ClaveSegura1")).rejects.toThrow("código");

    otp.verify.mockReturnValue(true);
    await expect(service.execute(user.email, "123456", "ClaveSegura1")).resolves.toBe(true);
    const hash = repository.updatePasswordByEmail.mock.calls[0][1];
    expect(await bcrypt.compare("ClaveSegura1", hash)).toBe(true);
    expect(otp.consume).toHaveBeenCalledWith(user.email);
  });
});
