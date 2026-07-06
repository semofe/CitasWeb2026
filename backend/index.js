const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors    = require("cors");

const { database }          = require("./src/database/connection");
const { RepositoryFactory } = require("./src/database/RepositoryFactory");
const { CitaHistorialJob }  = require("./src/utils/citaHistorialJob");
const { EmailService }      = require("./src/utils/EmailService");
const { otpService }        = require("./src/user/application/services/OtpService");

const { UserServiceFactory }         = require("./src/database/factories/UserServiceFactory");
const { SedeServiceFactory }         = require("./src/database/factories/SedeServiceFactory");
const { EspecialidadServiceFactory } = require("./src/database/factories/EspecialidadServiceFactory");
const { MedicoServiceFactory }       = require("./src/database/factories/MedicoServiceFactory");
const { CitaServiceFactory }         = require("./src/database/factories/CitaServiceFactory");

const { createAuthRouter }         = require("./src/user/presentation/routes/auth.routes");
const { createUserRouter }         = require("./src/user/presentation/routes/user.routes");
const { createSedeRouter }         = require("./src/sede/presentation/routes/sede.routes");
const { createEspecialidadRouter } = require("./src/especialidad/presentation/routes/especialidad.routes");
const { createMedicoRouter }       = require("./src/medico/presentation/routes/medico.routes");
const { createCitaRouter }         = require("./src/cita/presentation/routes/cita.routes");
const { createCitaHistorialRouter } = require("./src/cita/presentation/routes/citaHistorial.routes");
const { createExportRouter }       = require("./src/export/presentation/routes/export.routes");

const app = express();
app.use(cors());
app.use(express.json());

database.connect()
  .then(async () => {

    // Inicializar servicio de email
    const emailService = new EmailService();
    const emailConnected = await emailService.verificarConexion();

    // Repositorios — Factory Method
    const userRepository         = RepositoryFactory.create("user");
    const sedeRepository         = RepositoryFactory.create("sede");
    const especialidadRepository = RepositoryFactory.create("especialidad");
    const medicoRepository       = RepositoryFactory.create("medico");
    const citaRepository         = RepositoryFactory.create("cita");
    const citaHistorialRepository = RepositoryFactory.create("citaHistorial");

    // Servicios — Abstract Factory
    const registerService       = UserServiceFactory.createRegisterService(userRepository);
    const registerMedicoService = UserServiceFactory.createRegisterMedicoService(userRepository, medicoRepository, sedeRepository, especialidadRepository);
    const loginService          = UserServiceFactory.createLoginService(userRepository);
    const userService           = UserServiceFactory.createUserService(userRepository);
    const forgotPasswordService = UserServiceFactory.createForgotPasswordService(userRepository, otpService, emailService);
    const resetPasswordService  = UserServiceFactory.createResetPasswordService(userRepository, otpService);
    const sedeService        = SedeServiceFactory.createSedeService(sedeRepository);
    const especialidadService = EspecialidadServiceFactory.createEspecialidadService(especialidadRepository);
    const medicoService      = MedicoServiceFactory.createMedicoService(medicoRepository, sedeRepository, especialidadRepository);
    const citaService        = CitaServiceFactory.createCitaService(citaRepository, medicoRepository, userRepository, sedeRepository, emailConnected ? emailService : null);
    const citaHistorialService = CitaServiceFactory.createCitaHistorialService(citaRepository, citaHistorialRepository);

    // Rutas — reciben servicios ya construidos
    app.use("/api/auth",           createAuthRouter(registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService));
    app.use("/api/users",          createUserRouter(userService));
    app.use("/api/sedes",          createSedeRouter(sedeService));
    app.use("/api/especialidades", createEspecialidadRouter(especialidadService));
    app.use("/api/medicos",        createMedicoRouter(medicoService, registerMedicoService));
    app.use("/api/citas",          createCitaRouter(citaService));
    app.use("/api/citas-historial", createCitaHistorialRouter(citaHistorialService));
    app.use("/api/exports",        createExportRouter());

    app.get("/", (req, res) => {
      res.json({ ok: true, message: "API running" });
    });

    // Servir archivos estáticos del frontend compilado
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Fallback a index.html para React Router (debe ser antes del 404)
    app.use((req, res) => {
      // Si no es una ruta API, servir index.html
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
      } else {
        res.status(404).json({ ok: false, message: "Route not found" });
      }
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ ok: false, message: "Internal server error" });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      CitaHistorialJob.initializeJob();
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });