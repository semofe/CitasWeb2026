// src/backend/sede/application/services/SedeService.js

const { Sede }          = require("../../domain/entities/Sede");
const { CreateSedeDto } = require("../dtos/CreateSedeDto");

class SedeService {

  constructor(sedeRepository) {
    this.sedeRepository = sedeRepository;
  }

  async create(data) {
    const dto = new CreateSedeDto(data);
    dto.validate();
    const sede = new Sede({ ...data, activo: true });
    return await this.sedeRepository.save(sede);
  }

  async getAll() {
    return await this.sedeRepository.findAll();
  }

  async getActivas() {
    return await this.sedeRepository.findActivas();
  }

  async getById(id) {
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new Error("Sede not found");
    return sede;
  }

  async update(id, data) {
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new Error("Sede not found");
    return await this.sedeRepository.update(id, data);
  }

  async delete(id) {
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new Error("Sede not found");
    return await this.sedeRepository.delete(id);
  }
}

module.exports = { SedeService };