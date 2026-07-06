// src/backend/cita/domain/repository/ICitaHistorialRepository.js

class ICitaHistorialRepository {
  async save(citaHistorial) {
    throw new Error("Method save not implemented");
  }

  async findById(id) {
    throw new Error("Method findById not implemented");
  }

  async findByPaciente(pacienteDni) {
    throw new Error("Method findByPaciente not implemented");
  }

  async findByMedico(medicoId) {
    throw new Error("Method findByMedico not implemented");
  }

  async findAll() {
    throw new Error("Method findAll not implemented");
  }
}

module.exports = { ICitaHistorialRepository };
