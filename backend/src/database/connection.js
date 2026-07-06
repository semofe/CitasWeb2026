const { DataSource } = require("typeorm");
const { UserSchema }         = require("../user/domain/entities/User");
const { SedeSchema }         = require("../sede/domain/entities/Sede");
const { EspecialidadSchema } = require("../especialidad/domain/entities/Especialidad");
const { MedicoSchema }       = require("../medico/domain/entities/Medico");
const { CitaSchema }         = require("../cita/domain/entities/Cita");
const { CitaHistorialSchema } = require("../cita/domain/entities/CitaHistorial");

class Database {
  constructor() {
    if (Database.instance) return Database.instance;

    this.dataSource = new DataSource({
      type:        "postgres",
      host:        process.env.DB_HOST,
      port:        Number(process.env.DB_PORT),
      username:    process.env.DB_USER,
      password:    process.env.DB_PASSWORD,
      database:    process.env.DB_NAME,
      synchronize: true,
      logging:     false,
      entities:    [UserSchema, SedeSchema, EspecialidadSchema, MedicoSchema, CitaSchema, CitaHistorialSchema],
    });

    Database.instance = this;
  }

  async connect() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log("✅ Database connected");
    }
    return this.dataSource;
  }

  getDataSource() {
    return this.dataSource;
  }
}

const database = new Database();
module.exports = { database };