// src/backend/especialidad/domain/repository/IEspecialidadRepository.js

class IEspecialidadRepository {

  async save(especialidad) {
    throw new Error("Method 'save' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findByNombre(nombre) {
    throw new Error("Method 'findByNombre' must be implemented");
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

module.exports = { IEspecialidadRepository };