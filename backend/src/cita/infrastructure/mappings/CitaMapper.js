// src/backend/cita/infrastructure/mappings/CitaMapper.js

const { Cita } = require("../../domain/entities/Cita");

class CitaMapper {

  static toDomain(raw) {
    if (!raw) return null;
    const cita = new Cita({
      id:          raw.id,
      pacienteDni: raw.pacienteDni,
      medicoId:    raw.medicoId,
      fecha:       raw.fecha,
      slot:        raw.slot,
      turno:       raw.turno,
      estado:      raw.estado,
      motivo:      raw.motivo,
      createdAt:   raw.createdAt,
    });
    // Preservar las relaciones que vienen de la BD
    if (raw.medico) cita.medico = raw.medico;
    if (raw.paciente) cita.paciente = raw.paciente;
    return cita;
  }

  static toPersistence(cita) {
    return {
      pacienteDni: cita.pacienteDni,
      medicoId:    cita.medicoId,
      fecha:       cita.fecha,
      slot:        cita.slot,
      turno:       cita.turno,
      estado:      cita.estado,
      motivo:      cita.motivo,
    };
  }

  static toResponse(cita) {
    return {
      id:    cita.id,
      pacienteDni: cita.pacienteDni,
      medicoId:    cita.medicoId,
      paciente: cita.paciente ? {
        dni:       cita.paciente.dni,
        nombres:   cita.paciente.names,
        apellidos: cita.paciente.last_names,
        email:     cita.paciente.email,
        telefono:  cita.paciente.phone,
      } : { dni: cita.pacienteDni },
      medico: cita.medico ? {
        id:        cita.medico.id,
        nombres:   cita.medico.nombres,
        apellidos: cita.medico.apellidos,
        sede:      cita.medico.sede      ? { id: cita.medico.sede.id, nombre: cita.medico.sede.nombre, direccion: cita.medico.sede.direccion, telefono: cita.medico.sede.telefono }      : null,
        especialidad: cita.medico.especialidad ? { id: cita.medico.especialidad.id, nombre: cita.medico.especialidad.nombre } : null,
      } : { id: cita.medicoId },
      fecha:     cita.fecha,
      slot:      cita.slot,
      turno:     cita.turno,
      estado:    cita.estado,
      motivo:    cita.motivo,
      createdAt: cita.createdAt,
    };
  }
}

module.exports = { CitaMapper };