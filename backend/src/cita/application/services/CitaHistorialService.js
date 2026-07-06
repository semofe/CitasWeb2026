// src/backend/cita/application/services/CitaHistorialService.js

const { CitaHistorial } = require("../../domain/entities/CitaHistorial");

class CitaHistorialService {
  constructor(citaRepository, citaHistorialRepository) {
    this.citaRepository = citaRepository;
    this.citaHistorialRepository = citaHistorialRepository;
  }

  async moveCitasVencidas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const allCitas = await this.citaRepository.findAll();
    const citasVencidas = allCitas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      return fechaCita < hoy && cita.estado === "programada";
    });

    for (const cita of citasVencidas) {
      const citaHistorial = new CitaHistorial({
        id: cita.id,
        pacienteDni: cita.pacienteDni,
        medicoId: cita.medicoId,
        fecha: cita.fecha,
        slot: cita.slot,
        turno: cita.turno,
        estado: "no_asistio",
        motivo: cita.motivo,
        razonMovimiento: "Movida automáticamente por fecha vencida",
        createdAt: cita.createdAt,
      });

      await this.citaHistorialRepository.save(citaHistorial);
      await this.citaRepository.delete(cita.id);
    }

    return citasVencidas.length;
  }

  async moveCompletedCitas() {
    const allCitas = await this.citaRepository.findAll();
    const citasCompletadas = allCitas.filter(cita => cita.estado === "completada");

    for (const cita of citasCompletadas) {
      const citaHistorial = new CitaHistorial({
        id: cita.id,
        pacienteDni: cita.pacienteDni,
        medicoId: cita.medicoId,
        fecha: cita.fecha,
        slot: cita.slot,
        turno: cita.turno,
        estado: "completada",
        motivo: cita.motivo,
        razonMovimiento: "Completada por médico",
        createdAt: cita.createdAt,
      });

      await this.citaHistorialRepository.save(citaHistorial);
      await this.citaRepository.delete(cita.id);
    }

    return citasCompletadas.length;
  }

  async moveCancelledCitas() {
    const allCitas = await this.citaRepository.findAll();
    const citasCanceladas = allCitas.filter(cita => cita.estado === "cancelada");

    for (const cita of citasCanceladas) {
      const citaHistorial = new CitaHistorial({
        id: cita.id,
        pacienteDni: cita.pacienteDni,
        medicoId: cita.medicoId,
        fecha: cita.fecha,
        slot: cita.slot,
        turno: cita.turno,
        estado: "cancelada",
        motivo: cita.motivo,
        razonMovimiento: "Cancelada por paciente o médico",
        createdAt: cita.createdAt,
      });

      await this.citaHistorialRepository.save(citaHistorial);
      await this.citaRepository.delete(cita.id);
    }

    return citasCanceladas.length;
  }

  async getHistorialByPaciente(pacienteDni) {
    return await this.citaHistorialRepository.findByPaciente(pacienteDni);
  }

  async getHistorialByMedico(medicoId) {
    return await this.citaHistorialRepository.findByMedico(medicoId);
  }

  async getAllHistorial() {
    return await this.citaHistorialRepository.findAll();
  }
}

module.exports = { CitaHistorialService };
