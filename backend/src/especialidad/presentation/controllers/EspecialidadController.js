// src/backend/especialidad/presentation/controllers/EspecialidadController.js

const { EspecialidadMapper } = require("../../infrastructure/mappings/EspecialidadMapper");

class EspecialidadController {

  constructor(especialidadService) {
    this.especialidadService = especialidadService;
  }

  async create(req, res) {
    try {
      const especialidad = await this.especialidadService.create(req.body);
      return res.status(201).json({
        ok:      true,
        message: "Especialidad created successfully",
        data:    EspecialidadMapper.toResponse(especialidad),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const especialidades = await this.especialidadService.getAll();
      return res.status(200).json({
        ok:   true,
        data: especialidades.map((e) => EspecialidadMapper.toResponse(e)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getActivas(req, res) {
    try {
      const especialidades = await this.especialidadService.getActivas();
      return res.status(200).json({
        ok:   true,
        data: especialidades.map((e) => EspecialidadMapper.toResponse(e)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const especialidad = await this.especialidadService.getById(req.params.id);
      return res.status(200).json({
        ok:   true,
        data: EspecialidadMapper.toResponse(especialidad),
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const especialidad = await this.especialidadService.update(req.params.id, req.body);
      return res.status(200).json({
        ok:      true,
        message: "Especialidad updated successfully",
        data:    EspecialidadMapper.toResponse(especialidad),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.especialidadService.delete(req.params.id);
      return res.status(200).json({
        ok:      true,
        message: "Especialidad deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { EspecialidadController };