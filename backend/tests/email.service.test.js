const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockCreateTransport = jest.fn(() => ({ sendMail: mockSendMail, verify: mockVerify }));
jest.mock("nodemailer", () => ({ createTransport: mockCreateTransport }));

const { EmailService } = require("../src/utils/EmailService");

const patient = { names: "Ana", last_names: "Pérez", dni: "12345678", phone: "999123456", email: "ana@example.com" };
const doctor = { nombres: "Luis", apellidos: "Gómez", email: "luis@example.com", especialidad: { nombre: "Cardiología" } };
const cita = { fecha: "2030-01-07", slot: "09:00-09:30" };
const sede = { nombre: "Central", direccion: "Av. Principal", telefono: "999123456" };

describe("EmailService", () => {
  const originalProvider = process.env.EMAIL_PROVIDER;

  beforeEach(() => { jest.clearAllMocks(); process.env.EMAIL_PROVIDER = "gmail"; process.env.EMAIL_USER = "clinic@example.com"; });
  afterAll(() => { process.env.EMAIL_PROVIDER = originalProvider; });

  test("configura proveedores gmail, outlook y custom", () => {
    new EmailService();
    expect(mockCreateTransport).toHaveBeenCalledWith(expect.objectContaining({ service: "gmail" }));
    process.env.EMAIL_PROVIDER = "outlook"; new EmailService();
    expect(mockCreateTransport).toHaveBeenLastCalledWith(expect.objectContaining({ host: "smtp-mail.outlook.com", secure: true, requireTLS: true, port: 465 }));
    process.env.EMAIL_PROVIDER = "custom"; process.env.EMAIL_HOST = "smtp.test"; process.env.EMAIL_SECURE = "true"; new EmailService();
    expect(mockCreateTransport).toHaveBeenLastCalledWith(expect.objectContaining({ host: "smtp.test", secure: true, requireTLS: true, port: 465 }));
    process.env.EMAIL_PROVIDER = "invalid";
    expect(() => new EmailService()).toThrow("not supported");
  });

  test("verifica conexión y genera HTML para paciente y médico", async () => {
    mockVerify.mockResolvedValue(true);
    const service = new EmailService();
    await expect(service.verificarConexion()).resolves.toBe(true);
    expect(service.generarHtmlCita(patient, doctor, cita, sede, "paciente")).toContain("Tus datos");
    expect(service.generarHtmlCita(patient, doctor, cita, sede, "medico")).toContain("Datos del paciente");
    mockVerify.mockRejectedValue(new Error("sin conexión"));
    await expect(service.verificarConexion()).resolves.toBe(false);
  });

  test("envía confirmación a paciente, médico y OTP", async () => {
    mockSendMail.mockResolvedValue(true);
    const service = new EmailService();
    await expect(service.enviarConfirmacionCita(patient, doctor, cita, sede)).resolves.toBe(true);
    expect(mockSendMail).toHaveBeenCalledTimes(2);
    await expect(service.enviarOtp(patient, "123456")).resolves.toBe(true);
    expect(mockSendMail).toHaveBeenCalledTimes(3);
  });

  test("propaga errores de envío", async () => {
    mockSendMail.mockRejectedValue(new Error("falló"));
    const service = new EmailService();
    await expect(service.enviarConfirmacionCita(patient, { ...doctor, email: null }, cita, sede)).rejects.toThrow("falló");
  });
});
