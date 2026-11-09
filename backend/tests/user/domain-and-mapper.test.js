const { User } = require("../../src/user/domain/entities/User");
const { UserMapper, isValidEmail } = require("../../src/user/infrastructure/mappings/UserMapper");

const rawUser = {
  dni: "12345678",
  names: "Ana",
  last_names: "Pérez",
  email: "ana@example.com",
  password: "ClaveSegura1",
  phone: "999123456",
  sexo: "F",
  role: "admin",
  medicoId: "medico-1",
  activo: false,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("Entidad User", () => {
  test("aplica valores por defecto y reconoce administradores", () => {
    const user = new User({ dni: rawUser.dni });
    expect(user.role).toBe("usuario");
    expect(user.activo).toBe(true);
    expect(user.sexo).toBeNull();
    expect(user.isAdmin()).toBe(false);
    expect(new User({ ...rawUser }).isAdmin()).toBe(true);
  });

  test("exige una contraseña robusta", () => {
    expect(() => new User({}).validatePassword()).toThrow("requerida");
    expect(() => new User({ password: "corta" }).validatePassword()).toThrow("8 caracteres");
    expect(() => new User({ password: "clavesegura1" }).validatePassword()).toThrow("mayúscula");
    expect(() => new User({ password: "ClaveSegura" }).validatePassword()).toThrow("número");
    expect(() => new User({ password: rawUser.password }).validatePassword()).not.toThrow();
  });

  test("cifra y compara correctamente la contraseña", async () => {
    const user = new User({ ...rawUser });
    await user.hashPassword();

    expect(user.password).not.toBe(rawUser.password);
    await expect(user.comparePassword(rawUser.password)).resolves.toBe(true);
    await expect(user.comparePassword("OtraClave1")).resolves.toBe(false);
  });
});

describe("UserMapper", () => {
  test("valida formatos de correo", () => {
    expect(isValidEmail("ana@example.com")).toBe(true);
    expect(isValidEmail("ana @example.com")).toBe(false);
    expect(isValidEmail("a".repeat(250) + "@x.com")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  test("convierte datos entre dominio, persistencia y respuesta", () => {
    expect(UserMapper.toDomain(null)).toBeNull();
    const domain = UserMapper.toDomain(rawUser);

    expect(domain).toBeInstanceOf(User);
    expect(domain.dni).toBe(rawUser.dni);
    expect(UserMapper.toPersistence(domain)).toEqual({
      dni: rawUser.dni,
      names: rawUser.names,
      last_names: rawUser.last_names,
      email: rawUser.email,
      password: rawUser.password,
      phone: rawUser.phone,
      sexo: rawUser.sexo,
      role: rawUser.role,
      medicoId: rawUser.medicoId,
      activo: rawUser.activo,
    });
    expect(UserMapper.toResponse(domain)).toEqual({
      dni: rawUser.dni,
      names: rawUser.names,
      last_names: rawUser.last_names,
      email: rawUser.email,
      phone: rawUser.phone,
      sexo: rawUser.sexo,
      role: rawUser.role,
      medicoId: rawUser.medicoId,
      activo: rawUser.activo,
      createdAt: rawUser.createdAt,
    });
  });
});
