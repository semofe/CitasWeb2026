// src/backend/sede/application/dtos/CreateSedeDto.js

class CreateSedeDto {
  constructor({ nombre, direccion, telefono } = {}) {
    this.nombre    = nombre;
    this.direccion = direccion;
    this.telefono  = telefono;
  }

  validate() {
    const errors = [];

    if (!this.nombre)
      errors.push("Nombre is required");
    else if (this.nombre.length < 3)
      errors.push("Nombre must be at least 3 characters");

    if (!this.direccion)
      errors.push("Direccion is required");
    else if (this.direccion.length < 5)
      errors.push("Direccion must be at least 5 characters");

    if (this.telefono && !/^9\d{8}$/.test(this.telefono))
      errors.push("Telefono must be 9 digits and start with 9");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { CreateSedeDto };