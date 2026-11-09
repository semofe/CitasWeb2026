const { CreateCitaDto } = require("../../src/cita/application/dtos/CreateCitaDto");
const { Cita } = require("../../src/cita/domain/entities/Cita");
const { CitaHistorial } = require("../../src/cita/domain/entities/CitaHistorial");
const { CitaService } = require("../../src/cita/application/services/CitaService");
const { CitaHistorialService } = require("../../src/cita/application/services/CitaHistorialService");

const futureDate = "2030-01-07"; // lunes
const baseCita = { id: "cita-1", pacienteDni: "12345678", medicoId: "medico-1", fecha: futureDate, slot: "09:00-09:30", turno: "mañana", estado: "programada", motivo: "Control" };
const medico = { id: "medico-1", sedeId: "sede-1", turno: "mañana,tarde", diasAtencion: ["lunes"] };

const repositories = () => ({
  cita: {
    findByMedicoAndFecha: jest.fn().mockResolvedValue([]), findByPaciente: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockImplementation(async value => ({ ...value, id: "cita-1" })), findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ ...baseCita }), findByMedico: jest.fn().mockResolvedValue([baseCita]),
    update: jest.fn().mockResolvedValue(true), delete: jest.fn().mockResolvedValue(true),
  },
  medico: { findById: jest.fn().mockResolvedValue(medico) },
  user: { findByDni: jest.fn().mockResolvedValue({ dni: baseCita.pacienteDni }) },
  sede: { findById: jest.fn().mockResolvedValue({ id: "sede-1" }) },
});

describe("Citas: DTO y entidades", () => {
  test("acepta citas futuras y acepta medico_id", () => {
    const dto = new CreateCitaDto({ medico_id: "medico-1", fecha: futureDate, slot: baseCita.slot });
    expect(dto.medicoId).toBe("medico-1");
    expect(() => dto.validate()).not.toThrow();
    expect(new Cita({}).estado).toBe("programada");
    expect(new CitaHistorial({}).estado).toBe("no_asistio");
  });

  test("rechaza datos incompletos, fecha pasada y slot inválido", () => {
    expect(() => new CreateCitaDto({}).validate()).toThrow("ID del médico");
    expect(() => new CreateCitaDto({ medicoId: "m", fecha: "2030/01/01", slot: "x" }).validate()).toThrow("formato");
    expect(() => new CreateCitaDto({ medicoId: "m", fecha: "2000-01-01", slot: "09:00-09:30" }).validate()).toThrow("futura");
    expect(() => new CreateCitaDto({ medicoId: "m", fecha: futureDate, slot: "x" }).validate()).toThrow("Slot inválido");
  });
});

describe("CitaService", () => {
  const build = () => { const r = repositories(); return { r, service: new CitaService(r.cita, r.medico, r.user, r.sede, null) }; };

  test("crea una cita pendiente de pago y consulta slots disponibles", async () => {
    const { r, service } = build();
    const created = await service.create({ medico_id: "medico-1", fecha: futureDate, slot: baseCita.slot, motivo: "Control" }, baseCita.pacienteDni);
    expect(created.estado).toBe("pendiente_pago");
    expect(r.cita.save).toHaveBeenCalled();
    r.cita.findByMedicoAndFecha.mockResolvedValue([{ slot: "09:00-09:30" }]);
    const slots = await service.getSlotsDisponibles("medico-1", futureDate);
    expect(slots).not.toContain("09:00-09:30");
  });

  test("rechaza médico, horario, día, slot y cita duplicada", async () => {
    const { r, service } = build();
    r.medico.findById.mockResolvedValueOnce(null);
    await expect(service.create({ medicoId: "x", fecha: futureDate, slot: baseCita.slot }, baseCita.pacienteDni)).rejects.toThrow("Médico no encontrado");
    r.medico.findById.mockResolvedValueOnce({ ...medico, turno: null });
    await expect(service.create({ medicoId: "x", fecha: futureDate, slot: baseCita.slot }, baseCita.pacienteDni)).rejects.toThrow("turnos");
    r.medico.findById.mockResolvedValueOnce({ ...medico, diasAtencion: [] });
    await expect(service.create({ medicoId: "x", fecha: futureDate, slot: baseCita.slot }, baseCita.pacienteDni)).rejects.toThrow("no atiende");
    r.cita.findByMedicoAndFecha.mockResolvedValueOnce([{ slot: baseCita.slot }]);
    await expect(service.create({ medicoId: "x", fecha: futureDate, slot: baseCita.slot }, baseCita.pacienteDni)).rejects.toThrow("ocupado");
    r.cita.findByPaciente.mockResolvedValueOnce([{ fecha: futureDate, estado: "programada" }]);
    await expect(service.create({ medicoId: "x", fecha: futureDate, slot: baseCita.slot }, baseCita.pacienteDni)).rejects.toThrow("Ya tienes");
  });

  test("cancela, completa, edita y autocompleta citas", async () => {
    const { r, service } = build();
    await service.cancelar("cita-1", baseCita.pacienteDni);
    await service.completar("cita-1");
    await service.actualizar("cita-1", { motivo: "Cambio" });
    expect(r.cita.update).toHaveBeenCalledWith("cita-1", { motivo: "Cambio" });
    r.cita.findAll.mockResolvedValue([{ ...baseCita, fecha: "2000-01-01" }, { ...baseCita, id: "cita-2", estado: "cancelada" }]);
    await expect(service.autocompletarVencidas()).resolves.toBe(1);
  });

  test("rechaza cancelación, completado o edición no permitidos", async () => {
    const { r, service } = build();
    r.cita.findById.mockResolvedValueOnce(null);
    await expect(service.cancelar("x", baseCita.pacienteDni)).rejects.toThrow("not found");
    r.cita.findById.mockResolvedValueOnce({ ...baseCita, pacienteDni: "otro" });
    await expect(service.cancelar("x", baseCita.pacienteDni)).rejects.toThrow("No puedes cancelar");
    r.cita.findById.mockResolvedValueOnce({ ...baseCita, estado: "cancelada" });
    await expect(service.completar("x")).rejects.toThrow("Solo puedes completar");
    r.cita.findById.mockResolvedValueOnce({ ...baseCita, estado: "cancelada" });
    await expect(service.actualizar("x", {})).rejects.toThrow("Solo puedes editar");
  });
});

describe("CitaHistorialService", () => {
  test("mueve citas vencidas, completadas y canceladas al historial", async () => {
    const citaRepository = { findAll: jest.fn(), delete: jest.fn().mockResolvedValue(true) };
    const historial = { save: jest.fn().mockResolvedValue(true), findByPaciente: jest.fn(), findByMedico: jest.fn(), findAll: jest.fn() };
    const service = new CitaHistorialService(citaRepository, historial);
    citaRepository.findAll.mockResolvedValue([{ ...baseCita, fecha: "2000-01-01" }]);
    await expect(service.moveCitasVencidas()).resolves.toBe(1);
    citaRepository.findAll.mockResolvedValue([{ ...baseCita, estado: "completada" }]);
    await expect(service.moveCompletedCitas()).resolves.toBe(1);
    citaRepository.findAll.mockResolvedValue([{ ...baseCita, estado: "cancelada" }]);
    await expect(service.moveCancelledCitas()).resolves.toBe(1);
    historial.findByPaciente.mockResolvedValue([baseCita]); historial.findByMedico.mockResolvedValue([baseCita]); historial.findAll.mockResolvedValue([baseCita]);
    await expect(service.getHistorialByPaciente(baseCita.pacienteDni)).resolves.toEqual([baseCita]);
    await expect(service.getHistorialByMedico(baseCita.medicoId)).resolves.toEqual([baseCita]);
    await expect(service.getAllHistorial()).resolves.toEqual([baseCita]);
  });
});
