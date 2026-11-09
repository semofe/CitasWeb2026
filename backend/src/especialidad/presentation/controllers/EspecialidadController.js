// src/backend/especialidad/presentation/controllers/EspecialidadController.js

const { CatalogController } = require("../../../common/presentation/controllers/CatalogController");
const { EspecialidadMapper } = require("../../infrastructure/mappings/EspecialidadMapper");

class EspecialidadController extends CatalogController {
  constructor(especialidadService) {
    super(especialidadService, EspecialidadMapper, "Especialidad");
  }
}

module.exports = { EspecialidadController };
