// src/backend/cita/application/dtos/CreateCitaDto.js

const { TURNOS } = require("../../domain/constants/turnos");

class CreateCitaDto {
  constructor({ medicoId, medico_id, fecha, slot, motivo } = {}) {
    // Aceptar tanto medicoId como medico_id (camelCase y snake_case)
    // medicoId tiene prioridad
    this.medicoId = medicoId || medico_id;
    this.fecha    = fecha;
    this.slot     = slot;
    this.motivo   = motivo;
    // pacienteDni viene del token JWT, no del body
  }

  validate() {
    const errors = [];

    if (!this.medicoId) {
      errors.push("El ID del médico es requerido");
    }

    if (!this.fecha)
      errors.push("La fecha es requerida");
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(this.fecha))
      errors.push("La fecha debe tener el formato YYYY-MM-DD");
    else if (new Date(this.fecha) < new Date().setHours(0,0,0,0))
      errors.push("La fecha debe ser hoy o una fecha futura");

    if (!this.slot)
      errors.push("El slot es requerido");

    const todosLosSlots = [...TURNOS.mañana, ...TURNOS.tarde];
    if (this.slot && !todosLosSlots.includes(this.slot))
      errors.push(`Slot inválido. Slots válidos: ${todosLosSlots.join(", ")}`);

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { CreateCitaDto };