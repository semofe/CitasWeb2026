// src/backend/user/infrastructure/mappings/UserMapper.js

const { User } = require("../../domain/entities/User");

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

class UserMapper {

  static toDomain(raw) {
    if (!raw) return null;
    return new User({
      dni:        raw.dni,
      names:      raw.names,
      last_names: raw.last_names,
      email:      raw.email,
      password:   raw.password,
      phone:      raw.phone,
      role:       raw.role,
      medicoId:   raw.medicoId,
      activo:     raw.activo,
      createdAt:  raw.createdAt,
      updatedAt:  raw.updatedAt,
    });
  }

  static toPersistence(user) {
    return {
      dni:        user.dni,
      names:      user.names,
      last_names: user.last_names,
      email:      user.email,
      password:   user.password,
      phone:      user.phone,
      role:       user.role,
      medicoId:   user.medicoId,
      activo:     user.activo,
    };
  }

  static toResponse(user) {
    return {
      dni:        user.dni,
      names:      user.names,
      last_names: user.last_names,
      email:      user.email,
      phone:      user.phone,
      role:       user.role,
      medicoId:   user.medicoId,
      activo:     user.activo,
      createdAt:  user.createdAt,
    };
  }
}

module.exports = { UserMapper, isValidEmail };