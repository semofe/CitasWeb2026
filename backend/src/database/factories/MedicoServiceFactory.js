// src/backend/database/factories/MedicoServiceFactory.js

const { MedicoService } = require("../../medico/application/services/MedicoService");

class MedicoServiceFactory {
  static createMedicoService(medicoRepository, sedeRepository, especialidadRepository) {
    return new MedicoService(medicoRepository, sedeRepository, especialidadRepository);
  }
}

module.exports = { MedicoServiceFactory };