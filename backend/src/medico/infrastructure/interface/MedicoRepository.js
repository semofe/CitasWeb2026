// src/backend/medico/infrastructure/interface/MedicoRepository.js
const { IMedicoRepository } = require("../../domain/repository/IMedicoRepository");
const { MedicoMapper }      = require("../mappings/MedicoMapper");
const { database }          = require("../../../database/connection");

class MedicoRepository extends IMedicoRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("Medico");
  }
  
  async save(medico) {
    const saved = await this.repository.save(MedicoMapper.toPersistence(medico));
    return MedicoMapper.toDomain(saved);
  }

  async findById(id) {
    const raw = await this.repository.findOne({
      where: { id },
      relations: { sede: true, especialidad: true }
    });
    return MedicoMapper.toDomain(raw);
  }

  async findByEmail(email) {
    const raw = await this.repository.findOne({
      where: { email },
      relations: { sede: true, especialidad: true }
    });
    return MedicoMapper.toDomain(raw);
  }

  async findAll() {
    const raw = await this.repository.find({
      relations: { sede: true, especialidad: true }
    });
    return raw.map((item) => MedicoMapper.toDomain(item));
  }

  async findAllActive() {
    const raw = await this.repository.find({
      where: { activo: true },
      relations: { sede: true, especialidad: true }
    });
    return raw.map((item) => MedicoMapper.toDomain(item));
  }

  async findBySede(sedeId) {
    const raw = await this.repository.find({
      where: { sedeId, activo: true },
      relations: { sede: true, especialidad: true }
    });
    return raw.map((item) => MedicoMapper.toDomain(item));
  }

  async findByEspecialidad(especialidadId) {
    const raw = await this.repository.find({
      where: { especialidadId, activo: true },
      relations: { sede: true, especialidad: true }
    });
    return raw.map((item) => MedicoMapper.toDomain(item));
  }

  async findBySedeAndEspecialidad(sedeId, especialidadId) {
    const raw = await this.repository.find({
      where: { sedeId, especialidadId, activo: true },
      relations: { sede: true, especialidad: true }
    });
    return raw.map((item) => MedicoMapper.toDomain(item));
  }

  async update(id, data) {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) throw new Error("Medico not found");
    const merged = this.repository.merge(existing, data);
    const saved  = await this.repository.save(merged);
    return MedicoMapper.toDomain(saved);
  }

  async delete(id) {
    const medico = await this.findById(id);
    if (!medico) throw new Error("Medico not found");
    await this.repository.delete(id);
    return true;
  }

  async toggleActivo(id) {
    const medico = await this.repository.findOne({ where: { id } });
    if (!medico) throw new Error("Medico not found");
    const nuevoEstado = !medico.activo;
    await this.repository.update(id, { activo: nuevoEstado });
    return nuevoEstado;
  }
}

module.exports = { MedicoRepository };