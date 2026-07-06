// src/backend/user/domain/entities/User.js

const { EntitySchema } = require("typeorm");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

class User {
  constructor({ dni, names, last_names, email, password, phone, role, medicoId, activo, createdAt, updatedAt } = {}) {
    this.dni        = dni;
    this.names      = names;
    this.last_names = last_names;
    this.email      = email;
    this.password   = password;
    this.phone      = phone;
    this.role       = role || "usuario";   // por defecto siempre es usuario
    this.medicoId   = medicoId || null;    // relación con tabla medicos (si es médico)
    this.activo     = activo !== undefined ? activo : true;  // soft delete flag
    this.createdAt  = createdAt;
    this.updatedAt  = updatedAt;
  }

  validatePassword() {
    if (!this.password) throw new Error("La contraseña es requerida");
    if (this.password.length < 8)
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    if (!/[A-Z]/.test(this.password))
      throw new Error("La contraseña debe contener al menos una letra mayúscula");
    if (!/[0-9]/.test(this.password))
      throw new Error("La contraseña debe contener al menos un número");
  }

  async hashPassword() {
    this.validatePassword();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  }

  async comparePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  isAdmin() {
    return this.role === "admin";
  }
}

const UserSchema = new EntitySchema({
  name: "User",
  target: User,
  tableName: "users",
  columns: {
    dni: {
      primary: true,
      type: "varchar",
      length: 20,
      nullable: false,
    },
    names: {
      name: "user_names",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    last_names: {
      name: "user_lastns",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    email: {
      name: "user_email",
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false,
    },
    password: {
      name: "user_password",
      type: "varchar",
      nullable: false,
    },
    phone: {
      name: "user_phone",
      type: "varchar",
      length: 20,
      nullable: true,
    },
    role: {
      name: "user_role",
      type: "varchar",
      length: 20,
      default: "usuario",
      nullable: false,
    },
    medicoId: {
      name: "medico_id",
      type: "uuid",
      nullable: true,
    },
    activo: {
      name: "activo",
      type: "boolean",
      default: true,
      nullable: false,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
  },
});

module.exports = { User, UserSchema };