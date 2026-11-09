const { createCitaRouter } = require("../src/cita/presentation/routes/cita.routes");
const { createCitaHistorialRouter } = require("../src/cita/presentation/routes/citaHistorial.routes");
const { createMedicoRouter } = require("../src/medico/presentation/routes/medico.routes");
const { createSedeRouter } = require("../src/sede/presentation/routes/sede.routes");
const { createEspecialidadRouter } = require("../src/especialidad/presentation/routes/especialidad.routes");
const { createAuthRouter } = require("../src/user/presentation/routes/auth.routes");
const { createUserRouter } = require("../src/user/presentation/routes/user.routes");
const { CitaServiceFactory } = require("../src/database/factories/CitaServiceFactory");
const { UserServiceFactory } = require("../src/database/factories/UserServiceFactory");
const { MedicoServiceFactory } = require("../src/database/factories/MedicoServiceFactory");
const { SedeServiceFactory } = require("../src/database/factories/SedeServiceFactory");
const { EspecialidadServiceFactory } = require("../src/database/factories/EspecialidadServiceFactory");

const paths = (router) => router.stack.filter((layer) => layer.route).map((layer) => layer.route.path);

describe("Rutas HTTP", () => {
  test("registra los endpoints de citas e historial en orden específico", () => {
    expect(paths(createCitaRouter({}))).toEqual(expect.arrayContaining(["/", "/mis-citas", "/mis-citas-medico", "/slots", "/medico/:medicoId", "/:id/cancelar", "/:id/completar", "/:id"]));
    expect(paths(createCitaHistorialRouter({}))).toEqual(expect.arrayContaining(["/mis-citas-historial", "/medico/:medicoId", "/"]));
  });

  test("registra rutas administrativas de médicos, sedes y especialidades", () => {
    expect(paths(createMedicoRouter({}, {}))).toHaveLength(10);
    expect(paths(createSedeRouter({}))).toEqual(expect.arrayContaining(["/", "/activas", "/:id"]));
    expect(paths(createEspecialidadRouter({}))).toEqual(expect.arrayContaining(["/", "/activas", "/:id"]));
  });

  test("protege y registra las rutas de autenticación y usuarios", () => {
    expect(paths(createAuthRouter({}, {}, {}, {}, {}))).toEqual(expect.arrayContaining(["/register", "/register-medico", "/login", "/forgot-password", "/reset-password"]));
    expect(paths(createUserRouter({}))).toEqual(expect.arrayContaining(["/", "/:dni"]));
  });
});

describe("Fábricas de servicios", () => {
  const repo = {};
  test("construyen servicios con las dependencias recibidas", () => {
    expect(CitaServiceFactory.createCitaService(repo, repo, repo, repo, repo).citaRepository).toBe(repo);
    expect(CitaServiceFactory.createCitaHistorialService(repo, repo).citaHistorialRepository).toBe(repo);
    expect(UserServiceFactory.createRegisterService(repo).userRepository).toBe(repo);
    expect(UserServiceFactory.createRegisterMedicoService(repo, repo, repo, repo).medicoRepository).toBe(repo);
    expect(UserServiceFactory.createLoginService(repo).userRepository).toBe(repo);
    expect(UserServiceFactory.createUserService(repo).userRepository).toBe(repo);
    expect(UserServiceFactory.createForgotPasswordService(repo, repo, repo).otpService).toBe(repo);
    expect(UserServiceFactory.createResetPasswordService(repo, repo).otpService).toBe(repo);
    expect(MedicoServiceFactory.createMedicoService(repo, repo, repo).medicoRepository).toBe(repo);
    expect(SedeServiceFactory.createSedeService(repo).sedeRepository).toBe(repo);
    expect(EspecialidadServiceFactory.createEspecialidadService(repo).especialidadRepository).toBe(repo);
  });
});
