const { Router } = require("express");
const { stringify } = require("csv-stringify/sync");

const { authMiddleware } = require("../../../user/presentation/middlewares/authMiddleware");
const { roleMiddleware } = require("../../../user/presentation/middlewares/roleMiddleware");
const { database } = require("../../../database/connection");
const { UserRepository } = require("../../../user/infrastructure/interface/UserRepository");
const { SedeRepository } = require("../../../sede/infrastructure/interface/SedeRepository");
const { EspecialidadRepository } = require("../../../especialidad/infrastructure/interface/EspecialidadRepository");
const { MedicoRepository } = require("../../../medico/infrastructure/interface/MedicoRepository");
const { CitaRepository } = require("../../../cita/infrastructure/interface/CitaRepository");
const { CitaHistorialRepository } = require("../../../cita/infrastructure/interface/CitaHistorialRepository");

const buildCsv = (rows) => stringify(rows, { header: true });

const formatDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace("T", " ").slice(0, 19);
};

const sendCsv = (res, filename, rows) => {
  const csv = `\ufeff${buildCsv(rows)}`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
};

const mapUserRow = (user) => ({
  dni: user.dni,
  nombres: user.names,
  apellidos: user.last_names,
  email: user.email,
  telefono: user.phone,
  rol: user.role,
  medico_id: user.medicoId,
  created_at: formatTimestamp(user.createdAt),
  updated_at: formatTimestamp(user.updatedAt),
});

const mapSedeRow = (sede) => ({
  id: sede.id,
  nombre: sede.nombre,
  direccion: sede.direccion,
  telefono: sede.telefono,
  activo: sede.activo,
});

const mapEspecialidadRow = (especialidad) => ({
  id: especialidad.id,
  nombre: especialidad.nombre,
  descripcion: especialidad.descripcion,
  activo: especialidad.activo,
});

const mapMedicoRow = (medico) => ({
  id: medico.id,
  nombres: medico.nombres,
  apellidos: medico.apellidos,
  email: medico.email,
  telefono: medico.telefono,
  sede_id: medico.sede?.id ?? medico.sedeId,
  sede_nombre: medico.sede?.nombre ?? null,
  sede_direccion: medico.sede?.direccion ?? null,
  especialidad_id: medico.especialidad?.id ?? medico.especialidadId,
  especialidad_nombre: medico.especialidad?.nombre ?? null,
  turno: medico.turno,
  dias_atencion: Array.isArray(medico.diasAtencion) ? medico.diasAtencion.join(", ") : medico.diasAtencion,
  activo: medico.activo,
});

const mapCitaRow = (cita) => ({
  id: cita.id,
  paciente_dni: cita.pacienteDni,
  paciente_nombres: cita.paciente?.names ?? null,
  paciente_apellidos: cita.paciente?.last_names ?? null,
  paciente_email: cita.paciente?.email ?? null,
  medico_id: cita.medico?.id ?? cita.medicoId,
  medico_nombres: cita.medico?.nombres ?? null,
  medico_apellidos: cita.medico?.apellidos ?? null,
  sede_nombre: cita.medico?.sede?.nombre ?? null,
  especialidad_nombre: cita.medico?.especialidad?.nombre ?? null,
  fecha: formatDate(cita.fecha),
  slot: cita.slot,
  turno: cita.turno,
  estado: cita.estado,
  motivo: cita.motivo,
  created_at: formatTimestamp(cita.createdAt),
});

const mapCitaHistorialRow = (citaHistorial) => ({
  id: citaHistorial.id,
  paciente_dni: citaHistorial.pacienteDni,
  paciente_nombres: citaHistorial.paciente?.names ?? null,
  paciente_apellidos: citaHistorial.paciente?.last_names ?? null,
  paciente_email: citaHistorial.paciente?.email ?? null,
  medico_id: citaHistorial.medico?.id ?? citaHistorial.medicoId,
  medico_nombres: citaHistorial.medico?.nombres ?? null,
  medico_apellidos: citaHistorial.medico?.apellidos ?? null,
  sede_nombre: citaHistorial.medico?.sede?.nombre ?? null,
  especialidad_nombre: citaHistorial.medico?.especialidad?.nombre ?? null,
  fecha: formatDate(citaHistorial.fecha),
  slot: citaHistorial.slot,
  turno: citaHistorial.turno,
  estado: citaHistorial.estado,
  motivo: citaHistorial.motivo,
  razon_movimiento: citaHistorial.razonMovimiento,
  created_at: formatTimestamp(citaHistorial.createdAt),
  moved_at: formatTimestamp(citaHistorial.movedAt),
});

const createExportRouter = () => {
  const router = Router();
  const userRepository = new UserRepository();
  const sedeRepository = new SedeRepository();
  const especialidadRepository = new EspecialidadRepository();
  const medicoRepository = new MedicoRepository();
  const citaRepository = new CitaRepository();
  const citaHistorialRepository = new CitaHistorialRepository();

  router.use(authMiddleware, roleMiddleware("admin"));

  router.get("/users", async (req, res, next) => {
    try {
      const users = await userRepository.findAll();
      return sendCsv(res, "users.csv", users.map(mapUserRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/sedes", async (req, res, next) => {
    try {
      const sedes = await sedeRepository.findAll();
      return sendCsv(res, "sedes.csv", sedes.map(mapSedeRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/especialidades", async (req, res, next) => {
    try {
      const especialidades = await especialidadRepository.findAll();
      return sendCsv(res, "especialidades.csv", especialidades.map(mapEspecialidadRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/medicos", async (req, res, next) => {
    try {
      const rawMedicos = await database.getDataSource().getRepository("Medico").find({
        relations: { sede: true, especialidad: true },
      });
      return sendCsv(res, "medicos.csv", rawMedicos.map(mapMedicoRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/citas", async (req, res, next) => {
    try {
      const rawCitas = await database.getDataSource().getRepository("Cita").find({
        relations: {
          medico: { sede: true, especialidad: true },
          paciente: true,
        },
      });
      return sendCsv(res, "citas.csv", rawCitas.map(mapCitaRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/citas-historial", async (req, res, next) => {
    try {
      const rawHistorial = await database.getDataSource().getRepository("CitaHistorial").find({
        relations: {
          medico: { sede: true, especialidad: true },
          paciente: true,
        },
      });
      return sendCsv(res, "citas_historial.csv", rawHistorial.map(mapCitaHistorialRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/combos/medicos", async (req, res, next) => {
    try {
      const rawMedicos = await database.getDataSource().getRepository("Medico").find({
        relations: { sede: true, especialidad: true },
      });
      return sendCsv(res, "medicos_completo.csv", rawMedicos.map(mapMedicoRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/combos/citas", async (req, res, next) => {
    try {
      const rawCitas = await database.getDataSource().getRepository("Cita").find({
        relations: {
          medico: { sede: true, especialidad: true },
          paciente: true,
        },
      });
      return sendCsv(res, "citas_completo.csv", rawCitas.map(mapCitaRow));
    } catch (error) {
      return next(error);
    }
  });

  router.get("/combos/citas-historial", async (req, res, next) => {
    try {
      const rawHistorial = await database.getDataSource().getRepository("CitaHistorial").find({
        relations: {
          medico: { sede: true, especialidad: true },
          paciente: true,
        },
      });
      return sendCsv(res, "citas_historial_completo.csv", rawHistorial.map(mapCitaHistorialRow));
    } catch (error) {
      return next(error);
    }
  });

  return router;
};

module.exports = { createExportRouter };