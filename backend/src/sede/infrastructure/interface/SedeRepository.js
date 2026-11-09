const { ISedeRepository } = require("../../domain/repository/ISedeRepository");
const { SedeMapper }      = require("../mappings/SedeMapper");
const { database }        = require("../../../database/connection");

class SedeRepository extends ISedeRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("Sede");
  }

async save(sede) {
  const saved = await this.repository.save({
    nombre:    sede.nombre,
    direccion: sede.direccion,
    telefono:  sede.telefono,
    activo:    sede.activo,
  });
  return SedeMapper.toDomain(saved);
}

  async findById(id) {
    const raw = await this.repository.findOne({ where: { id } });
    return SedeMapper.toDomain(raw);
  }

  async findAll() {
    const raw = await this.repository.find();
    return raw.map((item) => SedeMapper.toDomain(item));
  }

  async findActivas() {
    const raw = await this.repository.find({ where: { activo: true } });
    return raw.map((item) => SedeMapper.toDomain(item));
  }

  async update(id, data) {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) throw new Error("Sede not found");
    const merged = this.repository.merge(existing, data);
    const saved  = await this.repository.save(merged);
    return SedeMapper.toDomain(saved);
  }

  async delete(id) {
    const sede = await this.findById(id);
    if (!sede) throw new Error("Sede not found");
    await this.repository.delete(id);
    return true;
  }
}

module.exports = { SedeRepository };