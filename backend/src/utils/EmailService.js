const nodemailer = require("nodemailer");
const path       = require("path");

const LOGO_PATH = path.join(__dirname, "../../../frontend/public/logolp.png");
const LOGO_CID  = "logolp";

class EmailService {
  constructor() {
    this.transporter = this.initializeTransporter();
  }

  initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || "gmail";
    let config = {};

    switch (emailProvider.toLowerCase()) {
      case "gmail":
        config = {
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, // App Password (no contraseña normal)
          },
        };
        break;

      case "outlook":
      case "hotmail":
        config = {
          host: process.env.EMAIL_HOST || "smtp-mail.outlook.com",
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        };
        break;

      case "custom":
        config = {
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        };
        break;

      default:
        throw new Error(`Email provider "${emailProvider}" not supported`);
    }

    return nodemailer.createTransport(config);
  }

  async verificarConexion() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service conectado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error en email service:", error.message);
      return false;
    }
  }

  async enviarConfirmacionCita(paciente, medico, cita, sede) {
    try {
      const asunto = `Confirmación de Cita - Clínica R. Palma`;

      const htmlPaciente = this.generarHtmlCita(
        paciente,
        medico,
        cita,
        sede,
        "paciente"
      );

      const logoAttachment = [{ filename: "logolp.png", path: LOGO_PATH, cid: LOGO_CID }];

      // Enviar al paciente
      await this.transporter.sendMail({
        from: `"Clínica R. Palma" <${process.env.EMAIL_USER}>`,
        to: paciente.email,
        subject: asunto,
        html: htmlPaciente,
        attachments: logoAttachment,
      });

      console.log(`✅ Email enviado a paciente: ${paciente.email}`);

      // Enviar al médico (opcional)
      if (medico.email) {
        const htmlMedico = this.generarHtmlCita(
          paciente,
          medico,
          cita,
          sede,
          "medico"
        );

        await this.transporter.sendMail({
          from: `"Clínica R. Palma" <${process.env.EMAIL_USER}>`,
          to: medico.email,
          subject: asunto,
          html: htmlMedico,
          attachments: logoAttachment,
        });

        console.log(`✅ Email enviado a médico: ${medico.email}`);
      }

      return true;
    } catch (error) {
      console.error("❌ Error enviando email:", error.message);
      throw error;
    }
  }

  generarHtmlCita(paciente, medico, cita, sede, destinatario) {
    const fechaFormato = new Date(cita.fecha).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const esPaciente = destinatario === "paciente";
    const nombreDestinatario = esPaciente ? paciente.names : medico.nombres;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0fdf4; color: #1a2e22; line-height: 1.6; }
          .wrapper { padding: 32px 16px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }

          /* HEADER */
          .header { background: linear-gradient(135deg, #28b565 0%, #1a7a3c 100%); padding: 36px 32px; text-align: center; }
          .header-logo-circle { width: 72px; height: 72px; background: #ffffff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 14px auto; overflow: hidden; }
          .header h1 { color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .header p { color: rgba(255,255,255,0.8); font-size: 13px; }

          /* BADGE CONFIRMACIÓN */
          .badge-wrap { padding: 0 32px; margin-top: -20px; margin-bottom: 24px; }
          .badge-confirmed { background: #28b565; color: #fff; font-size: 13px; font-weight: 600; border-radius: 20px; padding: 8px 20px; display: inline-block; }

          /* CUERPO */
          .body { padding: 8px 32px 32px; }
          .greeting { font-size: 16px; margin-bottom: 6px; color: #1a2e22; }
          .subgreeting { font-size: 14px; color: #6b7280; margin-bottom: 24px; }

          /* CAJA FECHA-HORA DESTACADA */
          .date-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1.5px solid #86efac; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 24px; flex-wrap: wrap; }
          .date-item { flex: 1; min-width: 130px; }
          .date-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 4px; font-weight: 600; }
          .date-value { font-size: 15px; font-weight: 700; color: #1a7a3c; }

          /* SECCIONES */
          .section { margin-bottom: 20px; }
          .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #28b565; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1.5px solid #d1fae5; }
          .row { display: flex; margin-bottom: 10px; gap: 8px; }
          .row-label { font-size: 13px; color: #9ca3af; width: 130px; flex-shrink: 0; }
          .row-value { font-size: 13px; color: #1a2e22; font-weight: 500; }

          /* AVISO */
          .notice { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-top: 24px; }
          .notice-title { font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
          .notice ul { padding-left: 18px; }
          .notice li { font-size: 13px; color: #78350f; margin-bottom: 4px; }

          /* FIRMA */
          .firma { margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
          .firma p { font-size: 13px; color: #6b7280; }
          .firma strong { color: #1a7a3c; }

          /* FOOTER */
          .footer { background: #f0fdf4; padding: 20px 32px; text-align: center; border-top: 1px solid #d1fae5; }
          .footer p { font-size: 12px; color: #9ca3af; margin-bottom: 2px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">

            <!-- HEADER -->
            <div class="header">
              <div style="text-align:center;">
                <div class="header-logo-circle">
                  <img src="cid:${LOGO_CID}" alt="Clínica Ricardo Palma" style="height:52px; width:52px; object-fit:contain; display:block;" />
                </div>
              </div>
              <h1>Clínica Ricardo Palma</h1>
              <p>Centro Médico de Excelencia</p>
            </div>

            <!-- BADGE -->
            <div class="badge-wrap" style="text-align:center; margin-top:-18px; margin-bottom:28px;">
              <span class="badge-confirmed">✓ &nbsp;Cita confirmada</span>
            </div>

            <!-- CUERPO -->
            <div class="body">
              <p class="greeting">Hola, <strong>${nombreDestinatario}</strong>.</p>
              <p class="subgreeting">
                ${esPaciente
                  ? "Tu cita médica ha sido registrada exitosamente. A continuación encontrarás todos los detalles."
                  : "Se ha registrado una nueva cita en tu agenda. A continuación encontrarás los detalles."}
              </p>

              <!-- FECHA Y HORA DESTACADA -->
              <div class="date-box">
                <div class="date-item">
                  <div class="date-label">📅 &nbsp;Fecha</div>
                  <div class="date-value">${fechaFormato}</div>
                </div>
                <div class="date-item">
                  <div class="date-label">🕐 &nbsp;Horario</div>
                  <div class="date-value">${cita.slot}</div>
                </div>
                <div class="date-item">
                  <div class="date-label">📍 &nbsp;Sede</div>
                  <div class="date-value">${sede.nombre}</div>
                </div>
              </div>

              <!-- DATOS DEL MÉDICO -->
              <div class="section">
                <div class="section-title">Médico tratante</div>
                <div class="row">
                  <div class="row-label">Nombre</div>
                  <div class="row-value">Dr. ${medico.nombres} ${medico.apellidos}</div>
                </div>
                <div class="row">
                  <div class="row-label">Especialidad</div>
                  <div class="row-value">${medico.especialidad?.nombre || "No especificada"}</div>
                </div>
              </div>

              <!-- DATOS DEL PACIENTE -->
              ${esPaciente ? `
              <div class="section">
                <div class="section-title">Tus datos</div>
                <div class="row">
                  <div class="row-label">Nombre</div>
                  <div class="row-value">${paciente.names} ${paciente.last_names}</div>
                </div>
                <div class="row">
                  <div class="row-label">DNI</div>
                  <div class="row-value">${paciente.dni}</div>
                </div>
                <div class="row">
                  <div class="row-label">Teléfono</div>
                  <div class="row-value">${paciente.phone || "No registrado"}</div>
                </div>
                <div class="row">
                  <div class="row-label">Email</div>
                  <div class="row-value">${paciente.email}</div>
                </div>
              </div>
              ` : `
              <div class="section">
                <div class="section-title">Datos del paciente</div>
                <div class="row">
                  <div class="row-label">Nombre</div>
                  <div class="row-value">${paciente.names} ${paciente.last_names}</div>
                </div>
                <div class="row">
                  <div class="row-label">DNI</div>
                  <div class="row-value">${paciente.dni}</div>
                </div>
                <div class="row">
                  <div class="row-label">Teléfono</div>
                  <div class="row-value">${paciente.phone || "No registrado"}</div>
                </div>
              </div>
              `}

              <!-- DATOS DE LA SEDE -->
              <div class="section">
                <div class="section-title">Ubicación</div>
                <div class="row">
                  <div class="row-label">Sede</div>
                  <div class="row-value">${sede.nombre}</div>
                </div>
                <div class="row">
                  <div class="row-label">Dirección</div>
                  <div class="row-value">${sede.direccion || "No registrada"}</div>
                </div>
                <div class="row">
                  <div class="row-label">Teléfono</div>
                  <div class="row-value">${sede.telefono || "No registrado"}</div>
                </div>
              </div>

              <!-- AVISO -->
              <div class="notice">
                <div class="notice-title">⚠️ Recuerda</div>
                <ul>
                  <li>Llegar 10 minutos antes de la hora programada.</li>
                  <li>En caso de no poder asistir, avisar con al menos 24 horas de anticipación.</li>
                  <li>Traer documento de identidad y datos de tu seguro médico si aplica.</li>
                </ul>
              </div>

              <!-- FIRMA -->
              <div class="firma">
                <p>Atentamente,</p>
                <p><strong>Clínica Ricardo Palma</strong></p>
                <p style="margin-top:6px; font-size:12px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
              </div>
            </div>

            <!-- FOOTER -->
            <div class="footer">
              <p>© 2026 Clínica Ricardo Palma · Todos los derechos reservados</p>
              <p>Email: info@clinicapalma.com &nbsp;|&nbsp; Tel: +51 (1) 1234-5678</p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;
  }

  async enviarOtp(user, otp) {
    const nombre = user.names || "Usuario";
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
          .container { max-width: 520px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28b565 0%, #1a7a3c 100%); padding: 36px 24px; text-align: center; }
          .header h1 { color: #fff; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .header p { color: rgba(255,255,255,0.85); font-size: 14px; }
          .body { padding: 36px 32px; }
          .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }
          .otp-box { background: #f0fdf4; border: 2px dashed #28b565; border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #1a7a3c; font-family: 'Courier New', monospace; }
          .otp-expiry { font-size: 13px; color: #9ca3af; margin-top: 12px; }
          .warning { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px; margin-top: 20px; font-size: 13px; color: #92400e; }
          .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Clínica Ricardo Palma</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          <div class="body">
            <p class="greeting">Hola, <strong>${nombre}</strong>.</p>
            <p style="font-size:15px; color:#555; margin-bottom:8px;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código de verificación:
            </p>
            <div class="otp-box">
              <p class="otp-label">Tu código OTP</p>
              <div class="otp-code">${otp}</div>
              <p class="otp-expiry">⏱ Válido por <strong>10 minutos</strong></p>
            </div>
            <div class="warning">
              ⚠️ Si no solicitaste este código, ignora este mensaje. Tu contraseña no será modificada.
            </div>
          </div>
          <div class="footer">
            © 2026 Clínica Ricardo Palma · Este es un correo automático, no respondas a este mensaje.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"Clínica R. Palma" <${process.env.EMAIL_USER}>`,
      to:   user.email,
      subject: "Código de verificación - Recuperación de contraseña",
      html,
    });

    console.log(`✅ OTP enviado a: ${user.email}`);
    return true;
  }
}

module.exports = { EmailService };
