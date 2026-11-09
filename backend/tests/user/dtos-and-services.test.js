const { CreateUserDto, isValidEmail } = require("../../src/user/application/dtos/CreateUserDto");
const { UpdateUserDto } = require("../../src/user/application/dtos/UpdateUserDto");
const { LoginDto } = require("../../src/user/application/dtos/LoginDto");
const { UserService } = require("../../src/user/application/services/UserService");
const { LoginUserService } = require("../../src/user/application/services/LoginUserService");

const validUser = {
  dni: "12345678",
  names: "Ana María",
  last_names: "Pérez Díaz",
  email: "ana@example.com",
  password: "ClaveSegura1",
  phone: "999123456",
  sexo: "F",
};

describe("DTOs de usuario", () => {
  test("acepta un registro válido y normaliza el correo", () => {
    const dto = new CreateUserDto({ ...validUser, email: "  ana@example.com  " });

    expect(() => dto.validate()).not.toThrow();
    expect(dto.email).toBe("ana@example.com");
  });

  test("rechaza campos requeridos, formatos inválidos y sexo no permitido", () => {
    const dto = new CreateUserDto({
      dni: "123",
      names: "Ana7",
      last_names: "",
      email: "correo-invalido",
      password: "",
      phone: "123",
      sexo: "X",
    });

    expect(() => dto.validate()).toThrow("DNI");
    expect(() => dto.validate()).toThrow("Los nombres");
    expect(() => dto.validate()).toThrow("Los apellidos");
    expect(() => dto.validate()).toThrow("email");
    expect(() => dto.validate()).toThrow("contraseña");
    expect(() => dto.validate()).toThrow("teléfono");
    expect(() => dto.validate()).toThrow("sexo");
  });

  test("valida correos y rechaza valores excesivamente largos", () => {
    expect(isValidEmail("ana@example.com")).toBe(true);
    expect(isValidEmail("correo-invalido")).toBe(false);
    expect(isValidEmail("a".repeat(250) + "@x.com")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  test("valida una actualización parcial y normaliza el correo", () => {
    const dto = new UpdateUserDto({ names: "Ana", email: " ana@example.com " });

    expect(() => dto.validate()).not.toThrow();
    expect(dto.email).toBe("ana@example.com");
  });

  test("rechaza la modificación de DNI y datos de actualización inválidos", () => {
    expect(() => new UpdateUserDto({ dni: "87654321" }).validate()).toThrow("DNI");
    expect(() => new UpdateUserDto({}).validate()).toThrow("At least one field");
    expect(() => new UpdateUserDto({ phone: "123" }).validate()).toThrow("Phone");
    expect(() => new UpdateUserDto({ sexo: "X" }).validate()).toThrow("sexo");
  });

  test("valida las credenciales de inicio de sesión", () => {
    expect(() => new LoginDto({ email: " ana@example.com ", password: "ClaveSegura1" }).validate()).not.toThrow();
    expect(() => new LoginDto({ email: "ana@example.com", password: "corta" }).validate()).toThrow("8 caracteres");
    expect(() => new LoginDto({ email: "ana@example.com", password: "clavesegura1" }).validate()).toThrow("mayúscula");
    expect(() => new LoginDto({ email: "ana@example.com", password: "ClaveSegura" }).validate()).toThrow("número");
  });
});

describe("Servicios de usuario", () => {
  const buildRepository = () => ({
    findAll: jest.fn().mockResolvedValue([{ dni: validUser.dni }]),
    findByDni: jest.fn().mockResolvedValue({ dni: validUser.dni }),
    findByEmail: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ dni: validUser.dni }),
    delete: jest.fn().mockResolvedValue(true),
  });

  test("obtiene usuarios y un usuario por DNI", async () => {
    const repository = buildRepository();
    const service = new UserService(repository);

    await expect(service.getAll()).resolves.toEqual([{ dni: validUser.dni }]);
    await expect(service.getByDni(validUser.dni)).resolves.toEqual({ dni: validUser.dni });
  });

  test("informa cuando no encuentra un usuario", async () => {
    const repository = buildRepository();
    repository.findByDni.mockResolvedValue(null);
    const service = new UserService(repository);

    await expect(service.getByDni(validUser.dni)).rejects.toThrow("Usuario no encontrado");
    await expect(service.delete(validUser.dni)).rejects.toThrow("Usuario no encontrado");
  });

  test("actualiza solo campos permitidos y validados", async () => {
    const repository = buildRepository();
    const service = new UserService(repository);

    await service.update(validUser.dni, {
      names: "Ana",
      email: " ana.nueva@example.com ",
      role: "admin",
    });

    expect(repository.update).toHaveBeenCalledWith(validUser.dni, {
      names: "Ana",
      email: "ana.nueva@example.com",
    });
  });

  test("rechaza correo que ya pertenece a otro usuario", async () => {
    const repository = buildRepository();
    repository.findByEmail.mockResolvedValue({ dni: "87654321" });
    const service = new UserService(repository);

    await expect(service.update(validUser.dni, { email: "otro@example.com" }))
      .rejects.toThrow("email ya está registrado");
  });

  test("el login valida usuario y contraseña", async () => {
    const repository = {
      findByEmail: jest.fn().mockResolvedValue({
        comparePassword: jest.fn().mockResolvedValue(true),
      }),
    };
    const service = new LoginUserService(repository);
    const dto = new LoginDto({ email: validUser.email, password: validUser.password });

    await expect(service.execute(dto)).resolves.toEqual(expect.objectContaining({ comparePassword: expect.any(Function) }));
  });

  test("el login rechaza usuario inexistente o contraseña inválida", async () => {
    const dto = new LoginDto({ email: validUser.email, password: validUser.password });
    const missingUserService = new LoginUserService({ findByEmail: jest.fn().mockResolvedValue(null) });
    const invalidPasswordService = new LoginUserService({
      findByEmail: jest.fn().mockResolvedValue({ comparePassword: jest.fn().mockResolvedValue(false) }),
    });

    await expect(missingUserService.execute(dto)).rejects.toThrow("Email inválido");
    await expect(invalidPasswordService.execute(dto)).rejects.toThrow("Contraseña incorrecta");
  });
});
