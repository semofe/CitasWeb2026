// src/backend/especialidad/application/dtos/CreateEspecialidadDto.js

class CreateEspecialidadDto {
  constructor({ nombre, descripcion } = {}) {
    this.nombre      = nombre;
    this.descripcion = descripcion;
  }

  validate() {
    const errors = [];

    if (!this.nombre)
      errors.push("Nombre is required");
    else if (this.nombre.length < 3)
      errors.push("Nombre must be at least 3 characters");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.nombre))
      errors.push("Nombre must contain only letters");

    if (this.descripcion && this.descripcion.length < 5)
      errors.push("Descripcion must be at least 5 characters");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { CreateEspecialidadDto };