const { CreateSedeDto } = require("../src/sede/application/dtos/CreateSedeDto");
const { CreateEspecialidadDto } = require("../src/especialidad/application/dtos/CreateEspecialidadDto");
const { CreateMedicoDto } = require("../src/medico/application/dtos/CreateMedicoDto");
const { SedeService } = require("../src/sede/application/services/SedeService");
const { EspecialidadService } = require("../src/especialidad/application/services/EspecialidadService");
const { MedicoService } = require("../src/medico/application/services/MedicoService");

const sede = { id: "sede-1", nombre: "Central", direccion: "Av. Principal 123", telefono: "999123456" };
const especialidad = { id: "esp-1", nombre: "Cardiología", descripcion: "Atención cardiaca" };
const medico = { nombres: "Luis", apellidos: "Gómez", email: "luis@example.com", telefono: "999123456", sedeId: sede.id, especialidadId: especialidad.id, turno: "mañana", diasAtencion: ["lunes"] };

describe("DTOs administrativos", () => {
  test("valida datos correctos e incorrectos de sede y especialidad", () => {
    expect(() => new CreateSedeDto(sede).validate()).not.toThrow();
    expect(() => new CreateSedeDto({ nombre: "A", direccion: "x", telefono: "123" }).validate()).toThrow("Nombre");
    expect(() => new CreateEspecialidadDto(especialidad).validate()).not.toThrow();
    expect(() => new CreateEspecialidadDto({ nombre: "12", descripcion: "x" }).validate()).toThrow("Nombre");
  });

  test("valida los campos y turnos de médico", () => {
    expect(() => new CreateMedicoDto(medico).validate()).not.toThrow();
    expect(() => new CreateMedicoDto({ ...medico, turno: "noche", diasAtencion: ["domingo"] }).validate()).toThrow("turno");
    expect(() => new CreateMedicoDto({ ...medico, email: "correo sin arroba" }).validate()).toThrow("email");
    expect(() => new CreateMedicoDto({}).validate()).toThrow("nombres");
  });
});

describe("Servicios administrativos", () => {
  test("gestiona sedes y especialidades, incluyendo inexistentes y duplicadas", async () => {
    const sedeRepo = { save: jest.fn().mockResolvedValue(sede), findAll: jest.fn().mockResolvedValue([sede]), findActivas: jest.fn().mockResolvedValue([sede]), findById: jest.fn().mockResolvedValue(sede), update: jest.fn().mockResolvedValue(sede), delete: jest.fn().mockResolvedValue(true) };
    const sedeService = new SedeService(sedeRepo);
    await expect(sedeService.create(sede)).resolves.toEqual(sede);
    await expect(sedeService.getAll()).resolves.toEqual([sede]);
    await expect(sedeService.getActivas()).resolves.toEqual([sede]);
    await sedeService.update(sede.id, { nombre: "Norte" }); await sedeService.delete(sede.id);
    sedeRepo.findById.mockResolvedValue(null);
    await expect(sedeService.getById("x")).rejects.toThrow("not found");

    const espRepo = { save: jest.fn().mockResolvedValue(especialidad), findByNombre: jest.fn().mockResolvedValue(null), findAll: jest.fn().mockResolvedValue([especialidad]), findActivas: jest.fn().mockResolvedValue([especialidad]), findById: jest.fn().mockResolvedValue(especialidad), update: jest.fn().mockResolvedValue(especialidad), delete: jest.fn().mockResolvedValue(true) };
    const espService = new EspecialidadService(espRepo);
    await expect(espService.create(especialidad)).resolves.toEqual(especialidad);
    await espService.getAll(); await espService.getActivas(); await espService.getById(especialidad.id); await espService.update(especialidad.id, {}); await espService.delete(especialidad.id);
    espRepo.findByNombre.mockResolvedValue(especialidad);
    await expect(espService.create(especialidad)).rejects.toThrow("ya existe");
  });

  test("gestiona médicos y valida dependencias, correo y operaciones", async () => {
    const medicoRepo = { save: jest.fn().mockResolvedValue({ id: "med-1", ...medico }), findByEmail: jest.fn().mockResolvedValue(null), findAllActive: jest.fn().mockResolvedValue([]), findAll: jest.fn().mockResolvedValue([]), findById: jest.fn().mockResolvedValue({ id: "med-1", ...medico }), findBySede: jest.fn().mockResolvedValue([]), findByEspecialidad: jest.fn().mockResolvedValue([]), findBySedeAndEspecialidad: jest.fn().mockResolvedValue([]), update: jest.fn().mockResolvedValue(true), delete: jest.fn().mockResolvedValue(true), toggleActivo: jest.fn().mockResolvedValue(true) };
    const service = new MedicoService(medicoRepo, { findById: jest.fn().mockResolvedValue(sede) }, { findById: jest.fn().mockResolvedValue(especialidad) });
    await expect(service.create(medico)).resolves.toEqual(expect.objectContaining({ id: "med-1" }));
    await service.getAll(); await service.getAllIncludingInactive(); await service.getById("med-1"); await service.getBySede(sede.id); await service.getByEspecialidad(especialidad.id); await service.getBySedeAndEspecialidad(sede.id, especialidad.id); await service.update("med-1", {}); await service.delete("med-1"); await service.toggleActivo("med-1");
    medicoRepo.findById.mockResolvedValue(null);
    await expect(service.getById("x")).rejects.toThrow("no encontrado");
  });
});
