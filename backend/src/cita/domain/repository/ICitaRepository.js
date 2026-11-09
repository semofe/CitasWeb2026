// src/backend/cita/domain/repository/ICitaRepository.js

class ICitaRepository {

  async save(cita) {
    throw new Error("Method 'save' must be implemented");
  }

  async findById(id) {
    throw new Error("Method 'findById' must be implemented");
  }

  async findByPaciente(pacienteDni) {
    throw new Error("Method 'findByPaciente' must be implemented");
  }

  async findByMedico(medicoId) {
    throw new Error("Method 'findByMedico' must be implemented");
  }

  async findByMedicoAndFecha(medicoId, fecha) {
    throw new Error("Method 'findByMedicoAndFecha' must be implemented");
  }

  async findAll() {
    throw new Error("Method 'findAll' must be implemented");
  }

  async update(id, data) {
    throw new Error("Method 'update' must be implemented");
  }

  async delete(id) {
    throw new Error("Method 'delete' must be implemented");
  }
}

module.exports = { ICitaRepository };