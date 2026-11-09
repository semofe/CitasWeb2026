// src/backend/cita/infrastructure/mappings/CitaHistorialMapper.js

const { CitaHistorial } = require("../../domain/entities/CitaHistorial");

class CitaHistorialMapper {
  static toDomain(raw) {
    if (!raw) return null;
    return new CitaHistorial({
      id: raw.id,
      pacienteDni: raw.pacienteDni,
      medicoId: raw.medicoId,
      fecha: raw.fecha,
      slot: raw.slot,
      turno: raw.turno,
      estado: raw.estado,
      motivo: raw.motivo,
      razonMovimiento: raw.razonMovimiento,
      createdAt: raw.createdAt,
      movedAt: raw.movedAt,
    });
  }

  static toPersistence(citaHistorial) {
    return {
      id: citaHistorial.id,
      pacienteDni: citaHistorial.pacienteDni,
      medicoId: citaHistorial.medicoId,
      fecha: citaHistorial.fecha,
      slot: citaHistorial.slot,
      turno: citaHistorial.turno,
      estado: citaHistorial.estado,
      motivo: citaHistorial.motivo,
      razonMovimiento: citaHistorial.razonMovimiento,
      createdAt: citaHistorial.createdAt,
    };
  }

  static toResponse(citaHistorial) {
    return {
      id: citaHistorial.id,
      pacienteDni: citaHistorial.pacienteDni,
      medicoId: citaHistorial.medicoId,
      fecha: citaHistorial.fecha,
      slot: citaHistorial.slot,
      turno: citaHistorial.turno,
      estado: citaHistorial.estado,
      motivo: citaHistorial.motivo,
      razonMovimiento: citaHistorial.razonMovimiento,
      createdAt: citaHistorial.createdAt,
      movedAt: citaHistorial.movedAt,
    };
  }
}

module.exports = { CitaHistorialMapper };
