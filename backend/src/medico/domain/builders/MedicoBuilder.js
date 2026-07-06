// src/backend/medico/domain/builders/MedicoBuilder.js

const { Medico } = require("../entities/Medico");

const DIAS_VALIDOS   = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const TURNOS_VALIDOS = ["mañana", "tarde"];

class MedicoBuilder {
  constructor() {
    this._nombres        = null;
    this._apellidos      = null;
    this._email          = null;
    this._telefono       = null;
    this._sedeId         = null;
    this._especialidadId = null;
    this._turno          = null;
    this._diasAtencion   = [];
    this._activo         = true;
  }

  setNombres(nombres) {
    this._nombres = nombres;
    return this;
  }

  setApellidos(apellidos) {
    this._apellidos = apellidos;
    return this;
  }

  setEmail(email) {
    this._email = email;
    return this;
  }

  setTelefono(telefono) {
    this._telefono = telefono;
    return this;
  }

  setSede(sedeId) {
    this._sedeId = sedeId;
    return this;
  }

  setEspecialidad(especialidadId) {
    this._especialidadId = especialidadId;
    return this;
  }

  setTurno(turno) {
    if (!TURNOS_VALIDOS.includes(turno))
      throw new Error("El turno debe ser mañana o tarde");
    this._turno = turno;
    return this;
  }

  setDiasAtencion(dias) {
    if (!dias || dias.length === 0)
      throw new Error("Los días de atención son requeridos");
    if (!dias.every((d) => DIAS_VALIDOS.includes(d)))
      throw new Error("Días válidos: lunes, martes, miercoles, jueves, viernes, sabado");
    this._diasAtencion = dias;
    return this;
  }

  build() {
    if (!this._nombres)        throw new Error("Los nombres son requeridos");
    if (!this._apellidos)      throw new Error("Los apellidos son requeridos");
    if (!this._email)          throw new Error("El email es requerido");
    if (!this._sedeId)         throw new Error("La sede es requerida");
    if (!this._especialidadId) throw new Error("La especialidad es requerida");
    if (!this._turno)          throw new Error("El turno es requerido");
    if (!this._diasAtencion.length)
      throw new Error("Los días de atención son requeridos");

    return new Medico({
      nombres:        this._nombres,
      apellidos:      this._apellidos,
      email:          this._email,
      telefono:       this._telefono,
      sedeId:         this._sedeId,
      especialidadId: this._especialidadId,
      turno:          this._turno,
      diasAtencion:   this._diasAtencion,
      activo:         this._activo,
    });
  }
}

module.exports = { MedicoBuilder };