// src/backend/especialidad/domain/entities/Especialidad.js

const { EntitySchema } = require("typeorm");

class Especialidad {
  constructor({ id, nombre, descripcion, activo } = {}) {
    this.id          = id;
    this.nombre      = nombre;
    this.descripcion = descripcion;
    this.activo      = activo !== undefined ? activo : true;
  }
}

const EspecialidadSchema = new EntitySchema({
  name: "Especialidad",
  target: Especialidad,
  tableName: "especialidades",
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
      unique: true,
    },
    descripcion: {
      type: "varchar",
      length: 200,
      nullable: true,
    },
    activo: {
      type: "boolean",
      default: true,
      nullable: false,
    },
  },
});

module.exports = { Especialidad, EspecialidadSchema };