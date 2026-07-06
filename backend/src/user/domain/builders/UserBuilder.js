// src/backend/user/domain/builders/UserBuilder.js

const { User } = require("../entities/User");

class UserBuilder {
  constructor() {
    this._dni        = null;
    this._names      = null;
    this._last_names = null;
    this._email      = null;
    this._password   = null;
    this._phone      = null;
    this._role       = "usuario";
    this._medicoId   = null;
  }

  setDni(dni) {
    this._dni = dni;
    return this;
  }

  setNames(names) {
    this._names = names;
    return this;
  }

  setLastNames(last_names) {
    this._last_names = last_names;
    return this;
  }

  setEmail(email) {
    this._email = email;
    return this;
  }

  setPassword(password) {
    this._password = password;
    return this;
  }

  setPhone(phone) {
    this._phone = phone;
    return this;
  }

  setRole(role) {
    if (!["admin", "usuario", "medico"].includes(role))
      throw new Error("El rol debe ser admin, usuario o medico");
    this._role = role;
    return this;
  }

  setMedicoId(medicoId) {
    this._medicoId = medicoId;
    return this;
  }

  build() {
    if (!this._dni)        throw new Error("El DNI es requerido");
    if (!this._names)      throw new Error("Los nombres son requeridos");
    if (!this._last_names) throw new Error("Los apellidos son requeridos");
    if (!this._email)      throw new Error("El email es requerido");
    if (!this._password)   throw new Error("La contraseña es requerida");

    return new User({
      dni:        this._dni,
      names:      this._names,
      last_names: this._last_names,
      email:      this._email,
      password:   this._password,
      phone:      this._phone,
      role:       this._role,
      medicoId:   this._medicoId,
    });
  }
}

module.exports = { UserBuilder };