const { CatalogController } = require("../../src/common/presentation/controllers/CatalogController");

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe("CatalogController", () => {
  const entity = { id: "catalog-1", nombre: "Cardiología" };
  const mapper = { toResponse: jest.fn((value) => ({ id: value.id, nombre: value.nombre })) };
  const buildService = () => ({
    create: jest.fn().mockResolvedValue(entity),
    getAll: jest.fn().mockResolvedValue([entity]),
    getActivas: jest.fn().mockResolvedValue([entity]),
    getById: jest.fn().mockResolvedValue(entity),
    update: jest.fn().mockResolvedValue(entity),
    delete: jest.fn().mockResolvedValue(true),
  });

  test("ejecuta las operaciones CRUD y conserva las respuestas HTTP", async () => {
    const service = buildService();
    const controller = new CatalogController(service, mapper, "Especialidad");

    const createResponseObject = createResponse();
    await controller.create({ body: { nombre: entity.nombre } }, createResponseObject);
    expect(createResponseObject.status).toHaveBeenCalledWith(201);
    expect(createResponseObject.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Especialidad created successfully" }));

    const allResponse = createResponse();
    await controller.getAll({}, allResponse);
    expect(allResponse.status).toHaveBeenCalledWith(200);
    expect(allResponse.json).toHaveBeenCalledWith({ ok: true, data: [{ id: entity.id, nombre: entity.nombre }] });

    const activeResponse = createResponse();
    await controller.getActivas({}, activeResponse);
    expect(activeResponse.status).toHaveBeenCalledWith(200);

    const byIdResponse = createResponse();
    await controller.getById({ params: { id: entity.id } }, byIdResponse);
    expect(byIdResponse.json).toHaveBeenCalledWith({ ok: true, data: { id: entity.id, nombre: entity.nombre } });

    const updateResponse = createResponse();
    await controller.update({ params: { id: entity.id }, body: { nombre: "Neurología" } }, updateResponse);
    expect(service.update).toHaveBeenCalledWith(entity.id, { nombre: "Neurología" });
    expect(updateResponse.status).toHaveBeenCalledWith(200);

    const deleteResponse = createResponse();
    await controller.delete({ params: { id: entity.id } }, deleteResponse);
    expect(service.delete).toHaveBeenCalledWith(entity.id);
    expect(deleteResponse.json).toHaveBeenCalledWith({ ok: true, message: "Especialidad deleted successfully" });
  });

  test("devuelve los códigos de error esperados", async () => {
    const service = buildService();
    service.create.mockRejectedValue(new Error("Datos inválidos"));
    service.getAll.mockRejectedValue(new Error("Error interno"));
    service.getActivas.mockRejectedValue(new Error("Error interno"));
    service.getById.mockRejectedValue(new Error("No encontrado"));
    service.update.mockRejectedValue(new Error("Datos inválidos"));
    service.delete.mockRejectedValue(new Error("No encontrado"));
    const controller = new CatalogController(service, mapper, "Sede");

    const createResult = createResponse();
    await controller.create({ body: {} }, createResult);
    expect(createResult.status).toHaveBeenCalledWith(400);

    const allResult = createResponse();
    await controller.getAll({}, allResult);
    expect(allResult.status).toHaveBeenCalledWith(500);

    const activeResult = createResponse();
    await controller.getActivas({}, activeResult);
    expect(activeResult.status).toHaveBeenCalledWith(500);

    const byIdResult = createResponse();
    await controller.getById({ params: { id: entity.id } }, byIdResult);
    expect(byIdResult.status).toHaveBeenCalledWith(404);

    const updateResult = createResponse();
    await controller.update({ params: { id: entity.id }, body: {} }, updateResult);
    expect(updateResult.status).toHaveBeenCalledWith(400);

    const deleteResult = createResponse();
    await controller.delete({ params: { id: entity.id } }, deleteResult);
    expect(deleteResult.status).toHaveBeenCalledWith(404);
  });
});
