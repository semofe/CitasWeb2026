// src/backend/cita/presentation/controllers/CitaController.js

const { CitaMapper } = require("../../infrastructure/mappings/CitaMapper");

class CitaController {

  constructor(citaService) {
    this.citaService = citaService;
  }

  async create(req, res) {
    try {
      const pacienteDni = req.user.dni;
      const cita = await this.citaService.create(req.body, pacienteDni);
      return res.status(201).json({
        ok:      true,
        message: "Cita created successfully",
        data:    CitaMapper.toResponse(cita),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getSlotsDisponibles(req, res) {
    try {
      const { medicoId, fecha } = req.query;
      const slots = await this.citaService.getSlotsDisponibles(medicoId, fecha);
      return res.status(200).json({ ok: true, data: slots });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getMisCitas(req, res) {
    try {
      const pacienteDni = req.user.dni;
      const citas = await this.citaService.getMisCitas(pacienteDni);
      return res.status(200).json({
        ok:   true,
        data: citas.map((c) => CitaMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const citas = await this.citaService.getAll();
      return res.status(200).json({
        ok:   true,
        data: citas.map((c) => CitaMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getByMedico(req, res) {
    try {
      const citas = await this.citaService.getByMedico(req.params.medicoId);
      return res.status(200).json({
        ok:   true,
        data: citas.map((c) => CitaMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async cancelar(req, res) {
    try {
      const pacienteDni = req.user.dni;
      const isAdmin = req.user.role === "admin";
      const cita = await this.citaService.cancelar(req.params.id, pacienteDni, isAdmin);
      return res.status(200).json({
        ok:      true,
        message: "Cita cancelada successfully",
        data:    CitaMapper.toResponse(cita),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async completar(req, res) {
    try {
      const role = req.user.role;
      const medicoId = req.user.medicoId;
      const cita = await this.citaService.findById(req.params.id);

      if (!cita) return res.status(404).json({ ok: false, message: "Cita not found" });

      // Admin puede completar cualquier cita. Medico solo las suyas.
      if (role !== "admin") {
        if (role !== "medico" || !medicoId || cita.medicoId !== medicoId) {
          return res.status(403).json({ ok: false, message: "No tienes permiso para completar esta cita" });
        }
      }

      const citaCompletada = await this.citaService.completar(req.params.id);
      return res.status(200).json({
        ok:      true,
        message: "Cita completada successfully",
        data:    CitaMapper.toResponse(citaCompletada),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const pacienteDni = req.user.dni;
      const isAdmin = req.user.role === "admin";
      const cita = await this.citaService.findById(req.params.id);
      if (!cita) return res.status(404).json({ ok: false, message: "Cita not found" });
      
      // Solo el paciente o un admin pueden editar
      if (!isAdmin && cita.pacienteDni !== pacienteDni) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para editar esta cita" });
      }

      const citaActualizada = await this.citaService.actualizar(req.params.id, req.body);
      return res.status(200).json({
        ok:      true,
        message: "Cita actualizada successfully",
        data:    CitaMapper.toResponse(citaActualizada),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async getMisCitasMedico(req, res) {
    try {
      const medicoId = req.user.medicoId;
      
      if (!medicoId) {
        return res.status(400).json({ ok: false, message: "Usuario no es médico" });
      }

      const citas = await this.citaService.getMisCitasMedico(medicoId);
      return res.status(200).json({
        ok:   true,
        data: citas.map((c) => CitaMapper.toResponse(c)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { CitaController };