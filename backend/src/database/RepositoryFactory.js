// src/backend/database/RepositoryFactory.js

const { UserRepository }            = require("../user/infrastructure/interface/UserRepository");
const { SedeRepository }            = require("../sede/infrastructure/interface/SedeRepository");
const { EspecialidadRepository }    = require("../especialidad/infrastructure/interface/EspecialidadRepository");
const { MedicoRepository }          = require("../medico/infrastructure/interface/MedicoRepository");
const { CitaRepository }            = require("../cita/infrastructure/interface/CitaRepository");
const { CitaHistorialRepository }   = require("../cita/infrastructure/interface/CitaHistorialRepository");

class RepositoryFactory {

  static create(type) {
    switch (type) {
      case "user":             return new UserRepository();
      case "sede":             return new SedeRepository();
      case "especialidad":     return new EspecialidadRepository();
      case "medico":           return new MedicoRepository();
      case "cita":             return new CitaRepository();
      case "citaHistorial":    return new CitaHistorialRepository();
      default: throw new Error(`Repository type '${type}' not found`);
    }
  }
}

module.exports = { RepositoryFactory };