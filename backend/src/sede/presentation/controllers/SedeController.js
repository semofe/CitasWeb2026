// src/backend/sede/presentation/controllers/SedeController.js

const { SedeMapper } = require("../../infrastructure/mappings/SedeMapper");

class SedeController {

  constructor(sedeService) {
    this.sedeService = sedeService;
  }

  async create(req, res) {
    try {
      const sede = await this.sedeService.create(req.body);
      return res.status(201).json({
        ok:      true,
        message: "Sede created successfully",
        data:    SedeMapper.toResponse(sede),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const sedes = await this.sedeService.getAll();
      return res.status(200).json({
        ok:   true,
        data: sedes.map((s) => SedeMapper.toResponse(s)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getActivas(req, res) {
    try {
      const sedes = await this.sedeService.getActivas();
      return res.status(200).json({
        ok:   true,
        data: sedes.map((s) => SedeMapper.toResponse(s)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const sede = await this.sedeService.getById(req.params.id);
      return res.status(200).json({
        ok:   true,
        data: SedeMapper.toResponse(sede),
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const sede = await this.sedeService.update(req.params.id, req.body);
      return res.status(200).json({
        ok:      true,
        message: "Sede updated successfully",
        data:    SedeMapper.toResponse(sede),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.sedeService.delete(req.params.id);
      return res.status(200).json({
        ok:      true,
        message: "Sede deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { SedeController };