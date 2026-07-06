// src/backend/medico/domain/entities/Medico.js

const { EntitySchema } = require("typeorm");

class Medico {
  constructor({ id, nombres, apellidos, email, telefono, sedeId, especialidadId, turno, diasAtencion, activo, sede, especialidad } = {}) {
    this.id              = id;
    this.nombres         = nombres;
    this.apellidos       = apellidos;
    this.email           = email;
    this.telefono        = telefono;
    this.sedeId          = sedeId;
    this.especialidadId  = especialidadId;
    this.turno           = turno;
    this.diasAtencion    = diasAtencion;
    this.activo          = activo !== undefined ? activo : true;
    this.sede            = sede || null;
    this.especialidad    = especialidad || null;
  }
}

const MedicoSchema = new EntitySchema({
  name: "Medico",
  target: Medico,
  tableName: "medicos",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    nombres: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellidos: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    sedeId: {
      name: "sede_id",
      type: "uuid",
      nullable: false,
    },
    especialidadId: {
      name: "especialidad_id",
      type: "uuid",
      nullable: false,
    },
    turno: {
      type: "varchar",
      length: 50,
      nullable: true,
      // "mañana" | "tarde" | "mañana,tarde"
    },
    diasAtencion: {
      name: "dias_atencion",
      type: "simple-array",
      nullable: false,
      // ["lunes","miercoles","viernes"]
    },
    activo: {
      type: "boolean",
      default: true,
      nullable: false,
    },
  },
  relations: {
    sede: {
      type: "many-to-one",
      target: "Sede",
      joinColumn: { name: "sede_id" },
      eager: true,
    },
    especialidad: {
      type: "many-to-one",
      target: "Especialidad",
      joinColumn: { name: "especialidad_id" },
      eager: true,
    },
  },
});

module.exports = { Medico, MedicoSchema };