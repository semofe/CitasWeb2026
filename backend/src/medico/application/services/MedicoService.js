// src/backend/medico/application/services/MedicoService.js

const { MedicoBuilder }   = require("../../domain/builders/MedicoBuilder");
const { CreateMedicoDto } = require("../dtos/CreateMedicoDto");

class MedicoService {
  constructor(medicoRepository, sedeRepository, especialidadRepository) {
    this.medicoRepository       = medicoRepository;
    this.sedeRepository         = sedeRepository;
    this.especialidadRepository = especialidadRepository;
  }

  async create(data) {

    // DTO valida formato
    const dto = new CreateMedicoDto(data);
    dto.validate();

    const sede = await this.sedeRepository.findById(data.sedeId);
    if (!sede) throw new Error("Sede no encontrada");

    const especialidad = await this.especialidadRepository.findById(data.especialidadId);
    if (!especialidad) throw new Error("Especialidad no encontrada");

    const existing = await this.medicoRepository.findByEmail(data.email);
    if (existing) throw new Error("El email ya está registrado");

    // Builder construye la entidad
    const medico = new MedicoBuilder()
      .setNombres(data.nombres)
      .setApellidos(data.apellidos)
      .setEmail(data.email)
      .setTelefono(data.telefono)
      .setSede(data.sedeId)
      .setEspecialidad(data.especialidadId)
      .setTurno(data.turno)
      .setDiasAtencion(data.diasAtencion)
      .build();

    return await this.medicoRepository.save(medico);
  }

  async getAll() {
    return await this.medicoRepository.findAllActive();
  }

  async getAllIncludingInactive() {
    return await this.medicoRepository.findAll();
  }

  async getById(id) {
    const medico = await this.medicoRepository.findById(id);
    if (!medico) throw new Error("Médico no encontrado");
    return medico;
  }

  async getBySede(sedeId) {
    return await this.medicoRepository.findBySede(sedeId);
  }

  async getByEspecialidad(especialidadId) {
    return await this.medicoRepository.findByEspecialidad(especialidadId);
  }

  async getBySedeAndEspecialidad(sedeId, especialidadId) {
    return await this.medicoRepository.findBySedeAndEspecialidad(sedeId, especialidadId);
  }

  async update(id, data) {
    const medico = await this.medicoRepository.findById(id);
    if (!medico) throw new Error("Medico not found");

    if (data.email) {
      const existing = await this.medicoRepository.findByEmail(data.email);
      if (existing && existing.id !== id)
        throw new Error("El email ya está registrado");
    }

    return await this.medicoRepository.update(id, data);
  }

  async delete(id) {
    const medico = await this.medicoRepository.findById(id);
    if (!medico) throw new Error("Medico not found");
    return await this.medicoRepository.delete(id);
  }

  async toggleActivo(id) {
    const medico = await this.medicoRepository.findById(id);
    if (!medico) throw new Error("Medico not found");
    return await this.medicoRepository.toggleActivo(id);
  }
}

module.exports = { MedicoService };