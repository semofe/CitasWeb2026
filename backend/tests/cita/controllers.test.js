const { CitaController } = require("../../src/cita/presentation/controllers/CitaController");
const { CitaHistorialController } = require("../../src/cita/presentation/controllers/CitaHistorialController");
const cita = { id: "c1", pacienteDni: "12345678", medicoId: "m1", fecha: "2030-01-07", slot: "09:00-09:30", turno: "mañana", estado: "programada" };
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe("Controladores de citas", () => {
  const buildService = () => ({ create: jest.fn().mockResolvedValue(cita), getSlotsDisponibles: jest.fn().mockResolvedValue([cita.slot]), getMisCitas: jest.fn().mockResolvedValue([cita]), getAll: jest.fn().mockResolvedValue([cita]), getByMedico: jest.fn().mockResolvedValue([cita]), cancelar: jest.fn().mockResolvedValue(cita), findById: jest.fn().mockResolvedValue(cita), completar: jest.fn().mockResolvedValue({ ...cita, estado: "completada" }), actualizar: jest.fn().mockResolvedValue(cita), getMisCitasMedico: jest.fn().mockResolvedValue([cita]) });
  test("responde los flujos principales", async () => {
    const service = buildService(); const controller = new CitaController(service); const user = { dni: cita.pacienteDni, role: "usuario", medicoId: "m1" };
    for (const [method, req] of [["create", { body: {}, user }], ["getSlotsDisponibles", { query: { medicoId: "m1", fecha: cita.fecha } }], ["getMisCitas", { user }], ["getAll", {}], ["getByMedico", { params: { medicoId: "m1" } }], ["cancelar", { params: { id: cita.id }, user }], ["completar", { params: { id: cita.id }, user: { ...user, role: "medico" } }], ["actualizar", { params: { id: cita.id }, body: {}, user }], ["getMisCitasMedico", { user }]]) { const response = res(); await controller[method](req, response); expect(response.status).toHaveBeenCalled(); }
  });
  test("bloquea permisos y devuelve errores", async () => {
    const service = buildService(); const controller = new CitaController(service);
    service.findById.mockResolvedValueOnce(null); let response = res(); await controller.completar({ params: { id: "x" }, user: { role: "admin" } }, response); expect(response.status).toHaveBeenCalledWith(404);
    service.findById.mockResolvedValueOnce(cita); response = res(); await controller.completar({ params: { id: "x" }, user: { role: "usuario" } }, response); expect(response.status).toHaveBeenCalledWith(403);
    service.findById.mockResolvedValueOnce(cita); response = res(); await controller.actualizar({ params: { id: "x" }, body: {}, user: { dni: "otro", role: "usuario" } }, response); expect(response.status).toHaveBeenCalledWith(403);
    response = res(); await controller.getMisCitasMedico({ user: {} }, response); expect(response.status).toHaveBeenCalledWith(400);
    service.create.mockRejectedValue(new Error("falló")); response = res(); await controller.create({ body: {}, user: { dni: "x" } }, response); expect(response.status).toHaveBeenCalledWith(400);
  });
});

describe("CitaHistorialController", () => {
  test("expone los tres historiales", async () => {
    const service = { getHistorialByPaciente: jest.fn().mockResolvedValue([cita]), getHistorialByMedico: jest.fn().mockResolvedValue([cita]), getAllHistorial: jest.fn().mockResolvedValue([cita]) }; const controller = new CitaHistorialController(service);
    for (const [method, req] of [["getHistorialByPaciente", { user: { dni: "12345678" } }], ["getHistorialByMedico", { params: { medicoId: "m1" } }], ["getAllHistorial", {}]]) { const response = res(); await controller[method](req, response); expect(response.status).toHaveBeenCalledWith(200); }
  });
});
