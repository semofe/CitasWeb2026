// src/backend/medico/application/dtos/CreateMedicoDto.js

const DIAS_VALIDOS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const TURNOS_VALIDOS = ["mañana", "tarde"];

class CreateMedicoDto {
  constructor({ nombres, apellidos, email, telefono, sedeId, especialidadId, turno, diasAtencion } = {}) {
    this.nombres        = nombres;
    this.apellidos      = apellidos;
    this.email          = email;
    this.telefono       = telefono;
    this.sedeId         = sedeId;
    this.especialidadId = especialidadId;
    this.turno          = turno;
    this.diasAtencion   = diasAtencion;
  }

  validate() {
    const errors = [];

    if (!this.nombres)
      errors.push("Los nombres son requeridos");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.nombres))
      errors.push("Los nombres solo deben contener letras");

    if (!this.apellidos)
      errors.push("Los apellidos son requeridos");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.apellidos))
      errors.push("Los apellidos solo deben contener letras");

    if (!this.email)
      errors.push("El email es requerido");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email))
      errors.push("El formato del email es inválido");

    if (this.telefono && !/^9\d{8}$/.test(this.telefono))
      errors.push("El teléfono debe tener 9 dígitos y comenzar con 9");

    if (!this.sedeId)
      errors.push("La sede es requerida");

    if (!this.especialidadId)
      errors.push("La especialidad es requerida");

    if (!this.turno)
      errors.push("El turno es requerido");
    else if (!TURNOS_VALIDOS.includes(this.turno))
      errors.push("El turno debe ser 'mañana' o 'tarde'");

    if (!this.diasAtencion || this.diasAtencion.length === 0)
      errors.push("Los días de atención son requeridos");
    else if (!this.diasAtencion.every((d) => DIAS_VALIDOS.includes(d)))
      errors.push("Días válidos: lunes, martes, miercoles, jueves, viernes, sabado");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { CreateMedicoDto };