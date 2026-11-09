// src/backend/medico/infrastructure/mappings/MedicoMapper.js

const { Medico } = require("../../domain/entities/Medico");

class MedicoMapper {

  static toDomain(raw) {
    if (!raw) return null;
    return new Medico({
      id:             raw.id,
      nombres:        raw.nombres,
      apellidos:      raw.apellidos,
      email:          raw.email,
      telefono:       raw.telefono,
      sedeId:         raw.sedeId,
      especialidadId: raw.especialidadId,
      turno:          raw.turno,
      diasAtencion:   Array.isArray(raw.diasAtencion) ? raw.diasAtencion : (raw.diasAtencion ? raw.diasAtencion.split(',').map(d => d.trim()) : []),
      activo:         raw.activo,
      sede:           raw.sede        || null,
      especialidad:   raw.especialidad || null,
    });
  }

  static toPersistence(medico) {
    return {
      nombres:        medico.nombres,
      apellidos:      medico.apellidos,
      email:          medico.email,
      telefono:       medico.telefono,
      sedeId:         medico.sedeId,
      especialidadId: medico.especialidadId,
      turno:          medico.turno,
      diasAtencion:   medico.diasAtencion,
      activo:         medico.activo,
    };
  }

  static toResponse(medico) {
    return {
      id:             medico.id,
      nombres:        medico.nombres,
      apellidos:      medico.apellidos,
      email:          medico.email,
      telefono:       medico.telefono,
      sede:           medico.sede    ? { id: medico.sede.id,    nombre: medico.sede.nombre }    : { id: medico.sedeId },
      especialidad:   medico.especialidad ? { id: medico.especialidad.id, nombre: medico.especialidad.nombre } : { id: medico.especialidadId },
      turno:          medico.turno,
      diasAtencion:   Array.isArray(medico.diasAtencion) ? medico.diasAtencion : (medico.diasAtencion ? medico.diasAtencion.split(',').map(d => d.trim()) : []),
      activo:         medico.activo,
    };
  }
}

module.exports = { MedicoMapper };