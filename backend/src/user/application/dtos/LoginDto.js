const { isValidEmail } = require("./CreateUserDto");

class LoginDto {
  constructor({ email, password } = {}) {
    this.email    = typeof email === "string" ? email.trim() : email;
    this.password = password;
  }

  validate() {
    const errors = [];

    if (!this.email)
      errors.push("El email es requerido");
    else if (!isValidEmail(this.email))
      errors.push("El formato del email es inválido");

    if (!this.password)
      errors.push("La contraseña es requerida");
    else if (this.password.length < 8)
      errors.push("La contraseña debe tener al menos 8 caracteres");
    else if (!/[A-Z]/.test(this.password))
      errors.push("La contraseña debe contener al menos una letra mayúscula");
    else if (!/[0-9]/.test(this.password))
      errors.push("La contraseña debe contener al menos un número");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }
}

module.exports = { LoginDto };