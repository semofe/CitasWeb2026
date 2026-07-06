// src/backend/medico/domain/repository/IMedicoRepository.js

class IMedicoRepository {

  async save(medico) {
    throw new Error("Method 'save' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findByEmail(email) {
    throw new Error("Method 'findByEmail' must be implemented");
  }

  async findAll() {
    throw new Error("Method 'findAll' must be implemented");
  }

  async findAllActive() {
    throw new Error("Method 'findAllActive' must be implemented");
  }

  async findBySede(sedeId) {
    throw new Error("Method 'findBySede' must be implemented");
  }

  async findByEspecialidad(especialidadId) {
    throw new Error("Method 'findByEspecialidad' must be implemented");
  }

  async findBySedeAndEspecialidad(sedeId, especialidadId) {
    throw new Error("Method 'findBySedeAndEspecialidad' must be implemented");
  }

  async update(id, data) {
    throw new Error("Method 'update' must be implemented");
  }

  async delete(id) {
    throw new Error("Method 'delete' must be implemented");
  }

  async toggleActivo(id) {
    throw new Error("Method 'toggleActivo' must be implemented");
  }
}

module.exports = { IMedicoRepository };