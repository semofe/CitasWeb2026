// src/backend/database/factories/SedeServiceFactory.js

const { SedeService } = require("../../sede/application/services/SedeService");

class SedeServiceFactory {
  static createSedeService(sedeRepository) {
    return new SedeService(sedeRepository);
  }
}

module.exports = { SedeServiceFactory };