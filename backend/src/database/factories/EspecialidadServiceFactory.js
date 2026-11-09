// src/backend/database/factories/EspecialidadServiceFactory.js

const { EspecialidadService } = require("../../especialidad/application/services/EspecialidadService");

class EspecialidadServiceFactory {
  static createEspecialidadService(especialidadRepository) {
    return new EspecialidadService(especialidadRepository);
  }
}

module.exports = { EspecialidadServiceFactory };