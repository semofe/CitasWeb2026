const { IEspecialidadRepository } = require("../../domain/repository/IEspecialidadRepository");
const { EspecialidadMapper }      = require("../mappings/EspecialidadMapper");
const { database }                = require("../../../database/connection");

class EspecialidadRepository extends IEspecialidadRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("Especialidad");
  }

  async save(especialidad) {
  const saved = await this.repository.save({
    nombre:      especialidad.nombre,
    descripcion: especialidad.descripcion,
    activo:      especialidad.activo,
  });
  return EspecialidadMapper.toDomain(saved);
  }

  async findById(id) {
    const raw = await this.repository.findOne({ where: { id } });
    return EspecialidadMapper.toDomain(raw);
  }

  async findByNombre(nombre) {
    const raw = await this.repository.findOne({ where: { nombre } });
    return EspecialidadMapper.toDomain(raw);
  }

  async findAll() {
    const raw = await this.repository.find();
    return raw.map((item) => EspecialidadMapper.toDomain(item));
  }

  async findActivas() {
    const raw = await this.repository.find({ where: { activo: true } });
    return raw.map((item) => EspecialidadMapper.toDomain(item));
  }

  async update(id, data) {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) throw new Error("Especialidad not found");
    const merged = this.repository.merge(existing, data);
    const saved  = await this.repository.save(merged);
    return EspecialidadMapper.toDomain(saved);
  }

  async delete(id) {
    const especialidad = await this.findById(id);
    if (!especialidad) throw new Error("Especialidad not found");
    await this.repository.delete(id);
    return true;
  }
}

module.exports = { EspecialidadRepository };