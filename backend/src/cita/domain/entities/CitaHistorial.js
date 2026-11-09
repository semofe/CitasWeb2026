// src/backend/cita/domain/entities/CitaHistorial.js

const { EntitySchema } = require("typeorm");

class CitaHistorial {
  constructor({ id, pacienteDni, medicoId, fecha, slot, turno, estado, motivo, razonMovimiento, createdAt, movedAt } = {}) {
    this.id               = id;
    this.pacienteDni      = pacienteDni;
    this.medicoId         = medicoId;
    this.fecha            = fecha;
    this.slot             = slot;
    this.turno            = turno;
    this.estado           = estado || "no_asistio";
    this.motivo           = motivo;
    this.razonMovimiento  = razonMovimiento;
    this.createdAt        = createdAt;
    this.movedAt          = movedAt;
  }
}

const CitaHistorialSchema = new EntitySchema({
  name: "CitaHistorial",
  target: CitaHistorial,
  tableName: "citas_historial",
  columns: {
    id: {
      primary: true,
      type: "uuid",
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
    },
    turno: {
      type: "varchar",
      length: 10,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "no_asistio",
      nullable: false,
      // "no_asistio" | "completada" | "cancelada"
    },
    motivo: {
      type: "varchar",
      length: 300,
      nullable: true,
    },
    razonMovimiento: {
      name: "razon_movimiento",
      type: "varchar",
      length: 100,
      nullable: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
    },
    movedAt: {
      name: "moved_at",
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

module.exports = { CitaHistorial, CitaHistorialSchema };
