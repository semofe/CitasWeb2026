// src/backend/sede/domain/entities/Sede.js

const { EntitySchema } = require("typeorm");

class Sede {
  constructor({ id, nombre, direccion, telefono, activo } = {}) {
    this.id        = id;
    this.nombre    = nombre;
    this.direccion = direccion;
    this.telefono  = telefono;
    this.activo    = activo !== undefined ? activo : true;
  }
}

const SedeSchema = new EntitySchema({
  name: "Sede",
  target: Sede,
  tableName: "sedes",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    direccion: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    activo: {
      type: "boolean",
      default: true,
      nullable: false,
    },
  },
});

module.exports = { Sede, SedeSchema };