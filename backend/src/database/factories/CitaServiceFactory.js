// src/backend/database/factories/CitaServiceFactory.js

const { CitaService } = require("../../cita/application/services/CitaService");
const { CitaHistorialService } = require("../../cita/application/services/CitaHistorialService");

class CitaServiceFactory {
  static createCitaService(citaRepository, medicoRepository, userRepository, sedeRepository, emailService) {
    return new CitaService(citaRepository, medicoRepository, userRepository, sedeRepository, emailService);
  }

  static createCitaHistorialService(citaRepository, citaHistorialRepository) {
    return new CitaHistorialService(citaRepository, citaHistorialRepository);
  }
}

module.exports = { CitaServiceFactory };