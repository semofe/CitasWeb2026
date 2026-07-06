// src/backend/user/application/dtos/CreateUserDto.js

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

class CreateUserDto {
  constructor({ dni, names, last_names, email, password, phone, sexo } = {}) {
    this.dni        = dni;
    this.names      = names;
    this.last_names = last_names;
    this.email      = typeof email === "string" ? email.trim() : email;
    this.password   = password;
    this.phone      = phone;
    this.sexo       = sexo || null;
    // role NO viene del cliente, siempre se asigna como "usuario"
  }

  validate() {
    const errors = [];

    if (!this.dni)
      errors.push("El DNI es requerido");
    else if (!/^\d{8}$/.test(this.dni))
      errors.push("El DNI debe tener exactamente 8 dígitos numéricos");

    if (!this.names)
      errors.push("Los nombres son requeridos");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.names))
      errors.push("Los nombres solo deben contener letras");

    if (!this.last_names)
      errors.push("Los apellidos son requeridos");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.last_names))
      errors.push("Los apellidos solo deben contener letras");

    if (!this.email)
      errors.push("El email es requerido");
    else if (!isValidEmail(this.email))
      errors.push("El formato del email es inválido");

    if (!this.password)
      errors.push("La contraseña es requerida");

    if (!this.phone)
      errors.push("El teléfono es requerido");
    else if (!/^9\d{8}$/.test(this.phone))
      errors.push("El teléfono debe tener 9 dígitos y comenzar con 9");

    if (this.sexo !== null && this.sexo !== undefined && !['M', 'F', 'O'].includes(this.sexo))
      errors.push("El sexo debe ser M, F u O");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { CreateUserDto, isValidEmail };