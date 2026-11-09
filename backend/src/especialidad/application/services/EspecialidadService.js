// src/backend/especialidad/application/services/EspecialidadService.js

const { Especialidad }          = require("../../domain/entities/Especialidad");
const { CreateEspecialidadDto } = require("../dtos/CreateEspecialidadDto");

class EspecialidadService {

  constructor(especialidadRepository) {
    this.especialidadRepository = especialidadRepository;
  }

  async create(data) {
    const dto = new CreateEspecialidadDto(data);
    dto.validate();

    // Verificar nombre duplicado
    const existing = await this.especialidadRepository.findByNombre(data.nombre);
    if (existing) throw new Error("La especialidad ya existe");

    const especialidad = new Especialidad({ ...data, activo: true });
    return await this.especialidadRepository.save(especialidad);
  }

  async getAll() {
    return await this.especialidadRepository.findAll();
  }

  async getActivas() {
    return await this.especialidadRepository.findActivas();
  }

  async getById(id) {
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new Error("Especialidad no encontrada");
    return especialidad;
  }

  async update(id, data) {
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new Error("Especialidad no encontrada");

    // Verificar nombre duplicado si se está actualizando
    if (data.nombre) {
      const existing = await this.especialidadRepository.findByNombre(data.nombre);
      if (existing && existing.id !== id)
        throw new Error("El nombre de especialidad ya existe");
    }

    return await this.especialidadRepository.update(id, data);
  }

  async delete(id) {
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new Error("Especialidad no encontrada");
    return await this.especialidadRepository.delete(id);
  }
}

module.exports = { EspecialidadService };