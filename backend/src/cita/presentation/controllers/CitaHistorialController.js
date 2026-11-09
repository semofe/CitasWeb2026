// src/backend/cita/presentation/controllers/CitaHistorialController.js

const { CitaHistorialMapper } = require("../../infrastructure/mappings/CitaHistorialMapper");

class CitaHistorialController {
  constructor(citaHistorialService) {
    this.citaHistorialService = citaHistorialService;
  }

  async getHistorialByPaciente(req, res) {
    try {
      const pacienteDni = req.user.dni;
      const historial = await this.citaHistorialService.getHistorialByPaciente(pacienteDni);
      return res.status(200).json({
        ok: true,
        data: historial.map((c) => CitaHistorialMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getHistorialByMedico(req, res) {
    try {
      const historial = await this.citaHistorialService.getHistorialByMedico(req.params.medicoId);
      return res.status(200).json({
        ok: true,
        data: historial.map((c) => CitaHistorialMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getAllHistorial(req, res) {
    try {
      const historial = await this.citaHistorialService.getAllHistorial();
      return res.status(200).json({
        ok: true,
        data: historial.map((c) => CitaHistorialMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { CitaHistorialController };
