// src/backend/cita/infrastructure/interface/CitaHistorialRepository.js

const { ICitaHistorialRepository } = require("../../domain/repository/ICitaHistorialRepository");
const { CitaHistorialMapper }      = require("../mappings/CitaHistorialMapper");
const { database }                 = require("../../../database/connection");

class CitaHistorialRepository extends ICitaHistorialRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("CitaHistorial");
  }

  async save(citaHistorial) {
    const saved = await this.repository.save(CitaHistorialMapper.toPersistence(citaHistorial));
    return CitaHistorialMapper.toDomain(saved);
  }

  async findById(id) {
    const raw = await this.repository.findOne({ where: { id } });
    return CitaHistorialMapper.toDomain(raw);
  }

  async findByPaciente(pacienteDni) {
    const raw = await this.repository.find({ where: { pacienteDni } });
    return raw.map((item) => CitaHistorialMapper.toDomain(item));
  }

  async findByMedico(medicoId) {
    const raw = await this.repository.find({ where: { medicoId } });
    return raw.map((item) => CitaHistorialMapper.toDomain(item));
  }

  async findAll() {
    const raw = await this.repository.find();
    return raw.map((item) => CitaHistorialMapper.toDomain(item));
  }

  async deleteById(id) {
    await this.repository.delete(id);
  }
}

module.exports = { CitaHistorialRepository };
