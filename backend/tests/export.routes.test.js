const express = require("express");
const request = require("supertest");

const mockFind = jest.fn();
jest.mock("../src/database/connection", () => ({
  database: { getDataSource: () => ({ getRepository: () => ({ find: mockFind }) }) },
}));
jest.mock("../src/user/presentation/middlewares/authMiddleware", () => ({ authMiddleware: (req, res, next) => next() }));
jest.mock("../src/user/presentation/middlewares/roleMiddleware", () => ({ roleMiddleware: () => (req, res, next) => next() }));
jest.mock("../src/user/infrastructure/interface/UserRepository", () => ({ UserRepository: jest.fn(() => ({ findAll: jest.fn().mockResolvedValue([]) })) }));
jest.mock("../src/sede/infrastructure/interface/SedeRepository", () => ({ SedeRepository: jest.fn(() => ({ findAll: jest.fn().mockResolvedValue([]) })) }));
jest.mock("../src/especialidad/infrastructure/interface/EspecialidadRepository", () => ({ EspecialidadRepository: jest.fn(() => ({ findAll: jest.fn().mockResolvedValue([]) })) }));
jest.mock("../src/medico/infrastructure/interface/MedicoRepository", () => ({ MedicoRepository: jest.fn() }));
jest.mock("../src/cita/infrastructure/interface/CitaRepository", () => ({ CitaRepository: jest.fn() }));
jest.mock("../src/cita/infrastructure/interface/CitaHistorialRepository", () => ({ CitaHistorialRepository: jest.fn() }));

const { createExportRouter } = require("../src/export/presentation/routes/export.routes");

describe("Rutas de exportación CSV", () => {
  const app = express();
  app.use("/exports", createExportRouter());

  test("exporta médicos y su versión completa", async () => {
    mockFind.mockResolvedValue([{ id: "m1", nombres: "Luis", apellidos: "Gómez", email: "luis@example.com", telefono: "999123456", sede: { id: "s1", nombre: "Central", direccion: "Av." }, especialidad: { id: "e1", nombre: "Cardiología" }, turno: "mañana", diasAtencion: ["lunes"], activo: true }]);
    const normal = await request(app).get("/exports/medicos").expect(200);
    const complete = await request(app).get("/exports/combos/medicos").expect(200);
    expect(normal.headers["content-disposition"]).toContain("medicos.csv");
    expect(complete.headers["content-disposition"]).toContain("medicos_completo.csv");
    expect(normal.text).toContain("sede_nombre");
  });

  test("exporta citas y su versión completa", async () => {
    mockFind.mockResolvedValue([{ id: "c1", pacienteDni: "12345678", paciente: { names: "Ana", last_names: "Pérez", sexo: "F", email: "ana@example.com" }, medico: { id: "m1", nombres: "Luis", apellidos: "Gómez", sede: { nombre: "Central" }, especialidad: { nombre: "Cardiología" } }, fecha: "2030-01-07", slot: "09:00-09:30", turno: "mañana", estado: "programada", motivo: "Control" }]);
    const normal = await request(app).get("/exports/citas").expect(200);
    const complete = await request(app).get("/exports/combos/citas").expect(200);
    expect(normal.headers["content-disposition"]).toContain("citas.csv");
    expect(complete.headers["content-disposition"]).toContain("citas_completo.csv");
    expect(normal.text).toContain("paciente_dni");
  });

  test("exporta historial y delega errores al middleware de Express", async () => {
    mockFind.mockResolvedValue([{ id: "h1", pacienteDni: "12345678", paciente: { names: "Ana", last_names: "Pérez", sexo: "F", email: "ana@example.com" }, medico: { id: "m1", nombres: "Luis", apellidos: "Gómez", sede: { nombre: "Central" }, especialidad: { nombre: "Cardiología" } }, fecha: "2030-01-07", slot: "09:00-09:30", turno: "mañana", estado: "no_asistio", motivo: "Control", razonMovimiento: "Vencida" }]);
    const normal = await request(app).get("/exports/citas-historial").expect(200);
    const complete = await request(app).get("/exports/combos/citas-historial").expect(200);
    expect(normal.headers["content-disposition"]).toContain("citas_historial.csv");
    expect(complete.headers["content-disposition"]).toContain("citas_historial_completo.csv");
    expect(normal.text).toContain("razon_movimiento");
  });
});
