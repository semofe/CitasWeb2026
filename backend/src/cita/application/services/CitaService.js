// src/backend/cita/application/services/CitaService.js

const { CitaBuilder }   = require("../../domain/builders/CitaBuilder");
const { CreateCitaDto } = require("../dtos/CreateCitaDto");
const { TURNOS }        = require("../../domain/constants/turnos");

class CitaService {
  constructor(citaRepository, medicoRepository, userRepository, sedeRepository, emailService) {
    this.citaRepository   = citaRepository;
    this.medicoRepository = medicoRepository;
    this.userRepository   = userRepository;
    this.sedeRepository   = sedeRepository;
    this.emailService     = emailService;
  }

  async create(data, pacienteDni) {

    // Normalizar data: aceptar tanto medico_id como medicoId
    const normalizedData = {
      medicoId: data.medicoId || data.medico_id,
      fecha: data.fecha,
      slot: data.slot,
      motivo: data.motivo
    };

    // DTO valida formato
    const dto = new CreateCitaDto(normalizedData);
    dto.validate();

    // Validar que la fecha no sea pasada
    const fechaCita = new Date(normalizedData.fecha);
    fechaCita.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaCita < hoy) throw new Error("No puedes crear citas en fechas pasadas");

    const medico = await this.medicoRepository.findById(normalizedData.medicoId);
    if (!medico) throw new Error("Médico no encontrado");

    // Parsear turnos (pueden ser "mañana" o "mañana,tarde")    if (!medico.turno) throw new Error("El medico no tiene turnos asignados");
        const turnosDelMedico = medico.turno.split(',').map(t => t.trim().toLowerCase());
    const slotsValidos = [];
    for (const turno of turnosDelMedico) {
      const slots = TURNOS[turno];
      if (slots) {
        slotsValidos.push(...slots);
      }
    }
    
    if (!slotsValidos.includes(normalizedData.slot))
      throw new Error(`El medico no tiene disponible ese slot. Slots: ${slotsValidos.join(", ")}`);

    const diaSemana = new Date(normalizedData.fecha + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long" })
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Elimina acentos
    
    if (!medico.diasAtencion.includes(diaSemana))
      throw new Error(`El medico no atiende los dias ${diaSemana}`);

    const citasDelDia = await this.citaRepository.findByMedicoAndFecha(normalizedData.medicoId, normalizedData.fecha);
    if (citasDelDia.some((c) => c.slot === normalizedData.slot))
      throw new Error("El slot seleccionado ya está ocupado");

    const citasPaciente = await this.citaRepository.findByPaciente(pacienteDni);
    if (citasPaciente.some((c) => c.fecha === normalizedData.fecha && c.estado === "programada"))
      throw new Error("Ya tienes una cita programada para ese día");

    // Calcular el turno específico del slot
    let turnoDelSlot = null;
    for (const turnoKey of Object.keys(TURNOS)) {
      if (TURNOS[turnoKey].includes(normalizedData.slot)) {
        turnoDelSlot = turnoKey;
        break;
      }
    }

    // Builder construye la entidad
    const cita = new CitaBuilder()
      .setPaciente(pacienteDni)
      .setMedico(normalizedData.medicoId, turnoDelSlot)
      .setFecha(normalizedData.fecha)
      .setSlot(normalizedData.slot)
      .setMotivo(normalizedData.motivo)
      .build();

    const citaGuardada = await this.citaRepository.save(cita);

    // Enviar email de confirmación (sin bloquear si falla)
    try {
      const paciente = await this.userRepository.findByDni(pacienteDni);
      const medicoCompleto = await this.medicoRepository.findById(normalizedData.medicoId);
      const sede = await this.sedeRepository.findById(medico.sedeId);

      if (this.emailService && paciente) {
        await this.emailService.enviarConfirmacionCita(
          paciente,
          medicoCompleto,
          citaGuardada,
          sede
        );
      }
    } catch (emailError) {
      console.warn("⚠️ Error enviando email:", emailError.message);
      // No lanzamos error, la cita se guardó correctamente
    }

    return citaGuardada;
  }

  async getSlotsDisponibles(medicoId, fecha) {
    const medico = await this.medicoRepository.findById(medicoId);
    if (!medico) throw new Error("Médico no encontrado");
    if (!medico.turno) return []; // Si no tiene turno, no hay slots disponibles
    
    // Parsear turnos (pueden ser "mañana" o "mañana,tarde")
    const turnosDelMedico = medico.turno.split(',').map(t => t.trim().toLowerCase());
    const slotsValidos = [];
    for (const turno of turnosDelMedico) {
      const slots = TURNOS[turno];
      if (slots) {
        slotsValidos.push(...slots);
      }
    }
    
    const citasDelDia   = await this.citaRepository.findByMedicoAndFecha(medicoId, fecha);
    const slotsOcupados = citasDelDia.map((c) => c.slot);
    return slotsValidos.filter((s) => !slotsOcupados.includes(s));
  }

  async getMisCitas(pacienteDni) {
    return await this.citaRepository.findByPaciente(pacienteDni);
  }

  async getAll() {
    return await this.citaRepository.findAll();
  }

  async findById(id) {
    return await this.citaRepository.findById(id);
  }

  async getByMedico(medicoId) {
    return await this.citaRepository.findByMedico(medicoId);
  }

  async cancelar(id, pacienteDni, isAdmin = false) {
    const cita = await this.citaRepository.findById(id);
    if (!cita) throw new Error("Cita not found");
    
    // Solo el paciente o un admin pueden cancelar
    if (!isAdmin && cita.pacienteDni !== pacienteDni) {
      throw new Error("No puedes cancelar esta cita");
    }
    
    if (cita.estado !== "programada") throw new Error("Solo puedes cancelar citas programadas");
    await this.citaRepository.update(id, { estado: "cancelada" });
    return await this.citaRepository.findById(id); // Devolver la cita actualizada
  }

  async completar(id) {
    const cita = await this.citaRepository.findById(id);
    if (!cita) throw new Error("Cita not found");
    if (cita.estado !== "programada") throw new Error("Solo puedes completar citas programadas");
    await this.citaRepository.update(id, { estado: "completada" });
    return await this.citaRepository.findById(id); // Devolver la cita actualizada
  }

  async actualizar(id, datos) {
    const cita = await this.citaRepository.findById(id);
    if (!cita) throw new Error("Cita not found");
    if (cita.estado !== "programada") throw new Error("Solo puedes editar citas programadas");

    // Si cambia la fecha o slot, validar disponibilidad
    if (datos.fecha || datos.slot) {
      const nuevaFecha = datos.fecha || cita.fecha;
      const nuevoSlot = datos.slot || cita.slot;

      // Validar que la fecha no sea pasada
      const fechaCita = new Date(nuevaFecha);
      fechaCita.setHours(0, 0, 0, 0);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaCita < hoy) throw new Error("No puedes agendar en fechas pasadas");

      // Validar slot disponible
      const citasDelDia = await this.citaRepository.findByMedicoAndFecha(cita.medicoId, nuevaFecha);
      const slotOcupado = citasDelDia.some((c) => c.slot === nuevoSlot && c.id !== id);
      if (slotOcupado) throw new Error("El slot seleccionado ya está ocupado");

      // Validar turno del slot
      const medico = await this.medicoRepository.findById(cita.medicoId);
      const turnosDelMedico = medico.turno.split(',').map(t => t.trim().toLowerCase());
      const slotsValidos = [];
      for (const turno of turnosDelMedico) {
        const slots = TURNOS[turno];
        if (slots) {
          slotsValidos.push(...slots);
        }
      }
      if (!slotsValidos.includes(nuevoSlot))
        throw new Error("El médico no atiende en ese horario");

      // Validar día de atención
      const diaSemana = new Date(nuevaFecha + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long" })
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (!medico.diasAtencion.includes(diaSemana))
        throw new Error(`El médico no atiende los días ${diaSemana}`);
    }

    await this.citaRepository.update(id, datos);
    return await this.citaRepository.findById(id); // Devolver la cita actualizada
  }

  async autocompletarVencidas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const citas = await this.citaRepository.findAll();
    let completadas = 0;

    for (const cita of citas) {
      if (cita.estado === "programada") {
        const fechaCita = new Date(cita.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        
        if (fechaCita < hoy) {
          await this.citaRepository.update(cita.id, { estado: "completada" });
          completadas++;
        }
      }
    }

    return completadas;
  }

  async getMisCitasMedico(medicoId) {
    return await this.citaRepository.findByMedico(medicoId);
  }
}

module.exports = { CitaService };