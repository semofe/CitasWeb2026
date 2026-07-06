const { ICitaRepository } = require("../../domain/repository/ICitaRepository");
const { CitaMapper }      = require("../mappings/CitaMapper");
const { database }        = require("../../../database/connection");

class CitaRepository extends ICitaRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("Cita");
  }

  async save(cita) {
    const saved = await this.repository.save(CitaMapper.toPersistence(cita));
    return CitaMapper.toDomain(saved);
  }

  async findById(id) {
    const raw = await this.repository.findOne({
      where: { id },
      relations: {
        medico: { sede: true, especialidad: true },
        paciente: true
      }
    });
    return CitaMapper.toDomain(raw);
  }

  async findByPaciente(pacienteDni) {
    const raw = await this.repository.find({
      where: { pacienteDni },
      relations: {
        medico: { sede: true, especialidad: true },
        paciente: true
      }
    });
    return raw.map((item) => CitaMapper.toDomain(item));
  }

  async findByMedico(medicoId) {
    const raw = await this.repository.find({
      where: { medicoId },
      relations: {
        medico: { sede: true, especialidad: true },
        paciente: true
      }
    });
    return raw.map((item) => CitaMapper.toDomain(item));
  }

  async findByMedicoAndFecha(medicoId, fecha) {
    const raw = await this.repository.find({
      where: { medicoId, fecha, estado: "programada" },
      relations: {
        medico: { sede: true, especialidad: true },
        paciente: true
      }
    });
    return raw.map((item) => CitaMapper.toDomain(item));
  }

  async findAll() {
    const raw = await this.repository.find({
      relations: {
        medico: { sede: true, especialidad: true },
        paciente: true
      }
    });
    return raw.map((item) => CitaMapper.toDomain(item));
  }

  async update(id, data) {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) throw new Error("Cita not found");
    const merged = this.repository.merge(existing, data);
    const saved  = await this.repository.save(merged);
    return CitaMapper.toDomain(saved);
  }

  async delete(id) {
    await this.repository.delete(id);
  }
}

module.exports = { CitaRepository };