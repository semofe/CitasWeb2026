// src/backend/especialidad/infrastructure/mappings/EspecialidadMapper.js

const { Especialidad } = require("../../domain/entities/Especialidad");

class EspecialidadMapper {

  static toDomain(raw) {
    if (!raw) return null;
    return new Especialidad({
      id:          raw.id,
      nombre:      raw.nombre,
      descripcion: raw.descripcion,
      activo:      raw.activo,
    });
  }

  static toPersistence(especialidad) {
    return {
      id:          especialidad.id,
      nombre:      especialidad.nombre,
      descripcion: especialidad.descripcion,
      activo:      especialidad.activo,
    };
  }

  static toResponse(especialidad) {
    return {
      id:          especialidad.id,
      nombre:      especialidad.nombre,
      descripcion: especialidad.descripcion,
      activo:      especialidad.activo,
    };
  }
}

module.exports = { EspecialidadMapper };