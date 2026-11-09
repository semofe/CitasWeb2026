const { MedicoController } = require("../src/medico/presentation/controllers/MedicoController");
const { MedicoMapper } = require("../src/medico/infrastructure/mappings/MedicoMapper");
const { CitaMapper } = require("../src/cita/infrastructure/mappings/CitaMapper");
const { CitaHistorialMapper } = require("../src/cita/infrastructure/mappings/CitaHistorialMapper");

const medico = {
  id: "m1", nombres: "Ana", apellidos: "Pérez", email: "ana@clinica.test",
  telefono: "999999999", sedeId: "s1", especialidadId: "e1", turno: "mañana",
  diasAtencion: ["lunes"], activo: true,
};

const response = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe("MedicoController", () => {
  const buildService = () => ({
    create: jest.fn().mockResolvedValue(medico),
    getAll: jest.fn().mockResolvedValue([medico]),
    getAllIncludingInactive: jest.fn().mockResolvedValue([medico]),
    getById: jest.fn().mockResolvedValue(medico),
    getBySede: jest.fn().mockResolvedValue([medico]),
    getByEspecialidad: jest.fn().mockResolvedValue([medico]),
    getBySedeAndEspecialidad: jest.fn().mockResolvedValue([medico]),
    update: jest.fn().mockResolvedValue(medico),
    delete: jest.fn().mockResolvedValue(),
    toggleActivo: jest.fn().mockResolvedValue(false),
  });

  test("atiende los flujos administrativos y públicos", async () => {
    const service = buildService();
    const register = { execute: jest.fn().mockResolvedValue({ id: "u1" }) };
    const controller = new MedicoController(service, register);
    const cases = [
      ["create", { body: medico }], ["createConAcceso", { body: medico }],
      ["getAll", { user: { role: "admin" } }], ["getAll", { user: { role: "usuario" } }],
      ["getById", { params: { id: "m1" } }], ["getBySede", { params: { sedeId: "s1" } }],
      ["getByEspecialidad", { params: { especialidadId: "e1" } }],
      ["getBySedeAndEspecialidad", { query: { sedeId: "s1", especialidadId: "e1" } }],
      ["update", { params: { id: "m1" }, body: medico }], ["delete", { params: { id: "m1" } }],
      ["toggleActivo", { params: { id: "m1" } }],
    ];
    for (const [method, req] of cases) {
      const res = response();
      await controller[method](req, res);
      expect(res.status).toHaveBeenCalled();
    }
    expect(service.getAllIncludingInactive).toHaveBeenCalled();
    expect(service.getAll).toHaveBeenCalled();
  });

  test("informa errores y ausencia del servicio de registro", async () => {
    const service = buildService();
    const controller = new MedicoController(service);
    let res = response();
    await controller.createConAcceso({ body: medico }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    service.getById.mockRejectedValueOnce(new Error("No encontrado"));
    res = response(); await controller.getById({ params: { id: "x" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
    service.create.mockRejectedValueOnce(new Error("Datos inválidos"));
    res = response(); await controller.create({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("Mapeadores de cita", () => {
  const rawCita = {
    id: "c1", pacienteDni: "12345678", medicoId: "m1", fecha: "2030-01-07",
    slot: "09:00", turno: "mañana", estado: "programada", motivo: "Control", createdAt: "2030-01-01",
    paciente: { dni: "12345678", names: "Luis", last_names: "Rojas", email: "luis@test.com", phone: "999" },
    medico: { ...medico, sede: { id: "s1", nombre: "Central", direccion: "Av. 1", telefono: "111" }, especialidad: { id: "e1", nombre: "Medicina" } },
  };

  test("transforma citas entre dominio, persistencia y respuesta", () => {
    expect(CitaMapper.toDomain(null)).toBeNull();
    const domain = CitaMapper.toDomain(rawCita);
    expect(domain.medico.nombre).toBeUndefined();
    expect(domain.medico.id).toBe("m1");
    expect(CitaMapper.toPersistence(domain)).toMatchObject({ medicoId: "m1", pacienteDni: "12345678" });
    expect(CitaMapper.toResponse(domain)).toMatchObject({ id: "c1", paciente: { dni: "12345678" }, medico: { id: "m1" } });
    const minimal = CitaMapper.toDomain({ ...rawCita, medico: undefined, paciente: undefined });
    expect(CitaMapper.toResponse(minimal).paciente).toEqual({ dni: "12345678" });
  });

  test("transforma el historial para base de datos y API", () => {
    const raw = { ...rawCita, razonMovimiento: "Reprogramación", movedAt: "2030-01-02" };
    expect(CitaHistorialMapper.toDomain(null)).toBeNull();
    const domain = CitaHistorialMapper.toDomain(raw);
    expect(CitaHistorialMapper.toPersistence(domain)).toMatchObject({ id: "c1", razonMovimiento: "Reprogramación" });
    expect(CitaHistorialMapper.toResponse(domain)).toMatchObject({ movedAt: "2030-01-02", estado: "programada" });
  });
});

describe("MedicoMapper", () => {
  test("convierte registros con relaciones y días en texto", () => {
    const raw = {
      ...medico,
      diasAtencion: "lunes, miércoles",
      sede: { id: "s1", nombre: "Central" },
      especialidad: { id: "e1", nombre: "Medicina" },
    };
    expect(MedicoMapper.toDomain(null)).toBeNull();
    const domain = MedicoMapper.toDomain(raw);
    expect(domain.diasAtencion).toEqual(["lunes", "miércoles"]);
    expect(MedicoMapper.toPersistence(domain)).toMatchObject({ sedeId: "s1", especialidadId: "e1" });
    expect(MedicoMapper.toResponse(domain)).toMatchObject({
      sede: { id: "s1", nombre: "Central" },
      especialidad: { id: "e1", nombre: "Medicina" },
      diasAtencion: ["lunes", "miércoles"],
    });
  });

  test("usa identificadores cuando el médico no carga relaciones", () => {
    const domain = MedicoMapper.toDomain({ ...medico, diasAtencion: null, sede: null, especialidad: null });
    expect(domain.diasAtencion).toEqual([]);
    expect(MedicoMapper.toResponse(domain)).toMatchObject({ sede: { id: "s1" }, especialidad: { id: "e1" } });
  });
});
