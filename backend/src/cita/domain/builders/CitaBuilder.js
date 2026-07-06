// src/backend/cita/domain/builders/CitaBuilder.js

const { Cita }   = require("../entities/Cita");
const { TURNOS } = require("../constants/turnos");

class CitaBuilder {
  constructor() {
    this._pacienteDni = null;
    this._medicoId    = null;
    this._fecha       = null;
    this._slot        = null;
    this._turno       = null;
    this._estado      = "programada";
    this._motivo      = null;
  }

  setPaciente(pacienteDni) {
    this._pacienteDni = pacienteDni;
    return this;
  }

  setMedico(medicoId, turno) {
    this._medicoId = medicoId;
    this._turno    = turno;
    return this;
  }

  setFecha(fecha) {
    this._fecha = fecha;
    return this;
  }

  setSlot(slot) {
    this._slot = slot;
    return this;
  }

  setMotivo(motivo) {
    this._motivo = motivo;
    return this;
  }

  build() {
    if (!this._pacienteDni) throw new Error("El paciente es requerido");
    if (!this._medicoId)    throw new Error("El médico es requerido");
    if (!this._fecha)       throw new Error("La fecha es requerida");
    if (!this._slot)        throw new Error("El slot es requerido");
    if (!this._turno)       throw new Error("El turno es requerido");

    return new Cita({
      pacienteDni: this._pacienteDni,
      medicoId:    this._medicoId,
      fecha:       this._fecha,
      slot:        this._slot,
      turno:       this._turno,
      estado:      this._estado,
      motivo:      this._motivo,
    });
  }
}

module.exports = { CitaBuilder };