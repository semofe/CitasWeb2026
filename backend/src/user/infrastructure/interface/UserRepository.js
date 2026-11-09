const { IUserRepository } = require("../../domain/repository/IUserRepository");
const { UserMapper }      = require("../mappings/UserMapper");
const { database }        = require("../../../database/connection");

class UserRepository extends IUserRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("User");
  }
  
  async save(user) {
    const persistence = UserMapper.toPersistence(user);
    const saved = await this.repository.save(persistence);
    return UserMapper.toDomain(saved);
  }

  async findByDni(dni) {
    const raw = await this.repository.findOne({ where: { dni } });
    return UserMapper.toDomain(raw);
  }

  async findByEmail(email) {
    const raw = await this.repository.findOne({ where: { email} });
    return UserMapper.toDomain(raw);
  }

  async findAll() {
    const raw = await this.repository.find({ where: { activo: true } });
    return raw.map((item) => UserMapper.toDomain(item));
  }

// user/infrastructure/interface/UserRepository.js

async update(dni, data) {
  // 1. Verificar que existe antes de actualizar
  const existing = await this.repository.findOne({ where: { dni } });
  if (!existing) throw new Error("User not found");

  // 2. Hacer el update con merge para no perder campos
  const merged = this.repository.merge(existing, data);
  const saved  = await this.repository.save(merged);  // ← save en vez de update

  // 3. Convertir a dominio directamente desde el resultado
  return UserMapper.toDomain(saved);                  // ← ya no hace findByDni
}

  async delete(dni) {
    const user = await this.repository.findOne({ where: { dni } });
    if (!user) throw new Error("User not found");
    // Soft delete: marcar como inactivo en lugar de eliminar
    const merged = this.repository.merge(user, { activo: false });
    await this.repository.save(merged);
    return true;
  }

  async updatePasswordByEmail(email, hashedPassword) {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new Error("User not found");
    const merged = this.repository.merge(user, { password: hashedPassword });
    await this.repository.save(merged);
    return true;
  }
}

module.exports = { UserRepository };