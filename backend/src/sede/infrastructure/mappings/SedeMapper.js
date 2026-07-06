// src/backend/sede/infrastructure/mappings/SedeMapper.js

const { Sede } = require("../../domain/entities/Sede");

class SedeMapper {

  static toDomain(raw) {
    if (!raw) return null;
    return new Sede({
      id:        raw.id,
      nombre:    raw.nombre,
      direccion: raw.direccion,
      telefono:  raw.telefono,
      activo:    raw.activo,
    });
  }

  static toPersistence(sede) {
    return {
      id:        sede.id,
      nombre:    sede.nombre,
      direccion: sede.direccion,
      telefono:  sede.telefono,
      activo:    sede.activo,
    };
  }

  static toResponse(sede) {
    return {
      id:        sede.id,
      nombre:    sede.nombre,
      direccion: sede.direccion,
      telefono:  sede.telefono,
      activo:    sede.activo,
    };
  }
}

module.exports = { SedeMapper };