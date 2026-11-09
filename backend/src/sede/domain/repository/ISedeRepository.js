// src/backend/sede/domain/repository/ISedeRepository.js

class ISedeRepository {

  async save(sede) {
    throw new Error("Method 'save' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findAll() {
    throw new Error("Method 'findAll' must be implemented");
  }

  async findActivas() {
    throw new Error("Method 'findActivas' must be implemented");
  }

  async update(id, data) {
    throw new Error("Method 'update' must be implemented");
  }

  async delete(id) {
    throw new Error("Method 'delete' must be implemented");
  }
}

module.exports = { ISedeRepository };