const { isValidEmail } = require("./CreateUserDto");

class UpdateUserDto {
  constructor({ dni, names, last_names, email, phone } = {}) {
    this.dni        = dni;
    this.names      = names;
    this.last_names = last_names;
    this.email      = typeof email === "string" ? email.trim() : email;
    this.phone      = phone;
  }

  validate() {
    // Sale inmediatamente sin seguir validando
    if (this.dni) throw new Error("El DNI no puede modificarse");

    const errors = [];

    if (!this.names && !this.last_names && !this.email && !this.phone)
      errors.push("At least one field is required to update");

    if (this.names && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.names))
      errors.push("Names must contain only letters");

    if (this.last_names && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.last_names))
      errors.push("Last names must contain only letters");

    if (this.email && !isValidEmail(this.email))
      errors.push("Email format is invalid");

    if (this.phone && !/^9\d{8}$/.test(this.phone))
      errors.push("Phone must be 9 digits and start with 9");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { UpdateUserDto };