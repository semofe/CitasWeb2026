const { RegisterUserService } = require("../../src/user/application/services/RegisterUserService");
const { RegisterMedicoService } = require("../../src/user/application/services/RegisterMedicoService");
const { SimulatedPaymentGateway } = require("../../src/payment/infrastructure/gateways/SimulatedPaymentGateway");

const userInput = {
  dni: "12345678", names: "Luis", last_names: "Rojas", email: "luis@test.com",
  password: "ClaveSegura1!", phone: "999999999", sexo: "M",
};
const medicoInput = {
  ...userInput, nombres: "Luis", apellidos: "Rojas", telefono: "999999999",
  sedeId: "s1", especialidadId: "e1", turno: "mañana", diasAtencion: ["lunes"],
};

describe("RegisterUserService", () => {
  const buildRepository = () => ({ findByDni: jest.fn().mockResolvedValue(null), findByEmail: jest.fn().mockResolvedValue(null), save: jest.fn().mockImplementation(async (user) => user) });

  test("valida, cifra la contraseña y guarda un usuario", async () => {
    const repository = buildRepository();
    const user = await new RegisterUserService(repository).execute(userInput);
    expect(user.role).toBe("usuario");
    expect(user.password).not.toBe(userInput.password);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  test("rechaza DNI y email ya registrados", async () => {
    const repository = buildRepository();
    repository.findByDni.mockResolvedValueOnce({ dni: userInput.dni });
    await expect(new RegisterUserService(repository).execute(userInput)).rejects.toThrow("DNI ya está registrado");
    repository.findByDni.mockResolvedValueOnce(null);
    repository.findByEmail.mockResolvedValueOnce({ email: userInput.email });
    await expect(new RegisterUserService(repository).execute(userInput)).rejects.toThrow("email ya está registrado");
  });
});

describe("RegisterMedicoService", () => {
  const buildDependencies = () => ({
    userRepository: { findByDni: jest.fn().mockResolvedValue(null), findByEmail: jest.fn().mockResolvedValue(null), save: jest.fn().mockImplementation(async (user) => ({ id: "u1", ...user })) },
    medicoRepository: { findByEmail: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue({ id: "m1" }), delete: jest.fn().mockResolvedValue() },
    sedeRepository: { findById: jest.fn().mockResolvedValue({ id: "s1" }) },
    especialidadRepository: { findById: jest.fn().mockResolvedValue({ id: "e1" }) },
  });
  const service = (deps) => new RegisterMedicoService(deps.userRepository, deps.medicoRepository, deps.sedeRepository, deps.especialidadRepository);

  test("crea médico y usuario enlazado con contraseña cifrada", async () => {
    const deps = buildDependencies();
    const saved = await service(deps).execute(medicoInput);
    expect(saved.role).toBe("medico");
    expect(saved.medicoId).toBe("m1");
    expect(saved.password).not.toBe(medicoInput.password);
    expect(deps.medicoRepository.save).toHaveBeenCalledTimes(1);
  });

  test("valida dependencias y evita registros duplicados", async () => {
    let deps = buildDependencies();
    deps.userRepository.findByDni.mockResolvedValueOnce({});
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("DNI ya está registrado");
    deps = buildDependencies(); deps.userRepository.findByEmail.mockResolvedValueOnce({});
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("email ya está registrado");
    deps = buildDependencies(); deps.sedeRepository.findById.mockResolvedValueOnce(null);
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("Sede no encontrada");
    deps = buildDependencies(); deps.especialidadRepository.findById.mockResolvedValueOnce(null);
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("Especialidad no encontrada");
    deps = buildDependencies(); deps.medicoRepository.findByEmail.mockResolvedValueOnce({});
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("registrado como médico");
  });

  test("elimina el médico creado si no se puede guardar su usuario", async () => {
    const deps = buildDependencies();
    deps.userRepository.save.mockRejectedValueOnce(new Error("Falló usuario"));
    await expect(service(deps).execute(medicoInput)).rejects.toThrow("Falló usuario");
    expect(deps.medicoRepository.delete).toHaveBeenCalledWith("m1");
  });
});

describe("SimulatedPaymentGateway", () => {
  test("devuelve una referencia segura y rechaza webhooks no verificados", async () => {
    const gateway = new SimulatedPaymentGateway();
    await expect(gateway.createCheckout({ reference: "pago-1" })).resolves.toEqual({ providerReference: "sim-pago-1", checkoutUrl: null });
    expect(gateway.verifyWebhook()).toBe(false);
  });
});
