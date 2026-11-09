// src/backend/cita/domain/entities/Cita.js

const { EntitySchema } = require("typeorm");

class Cita {
  constructor({ id, pacienteDni, medicoId, fecha, slot, turno, estado, motivo, createdAt } = {}) {
    this.id          = id;
    this.pacienteDni = pacienteDni;
    this.medicoId    = medicoId;
    this.fecha       = fecha;
    this.slot        = slot;
    this.turno       = turno;
    this.estado      = estado || "programada";
    this.motivo      = motivo;
    this.createdAt   = createdAt;
  }
}

const CitaSchema = new EntitySchema({
  name: "Cita",
  target: Cita,
  tableName: "citas",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    pacienteDni: {
      name: "paciente_dni",
      type: "varchar",
      length: 20,
      nullable: false,
    },
    medicoId: {
      name: "medico_id",
      type: "uuid",
      nullable: false,
    },
    fecha: {
      type: "date",
      nullable: false,
    },
    slot: {
      type: "varchar",
      length: 20,
      nullable: false,
      // "09:00-09:30"
    },
    turno: {
      type: "varchar",
      length: 10,
      nullable: false,
      // "mañana" | "tarde"
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "programada",
      nullable: false,
      // "programada" | "completada" | "cancelada"
    },
    motivo: {
      type: "varchar",
      length: 300,
      nullable: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    paciente: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "paciente_dni" },
      eager: true,
    },
    medico: {
      type: "many-to-one",
      target: "Medico",
      joinColumn: { name: "medico_id" },
      eager: true,
    },
  },
});

module.exports = { Cita, CitaSchema };