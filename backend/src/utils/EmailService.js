const nodemailer = require("nodemailer");

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

      // Enviar al paciente
      await this.transporter.sendMail({
        from: `"Clínica R. Palma" <${process.env.EMAIL_USER}>`,
        to: paciente.email,
        subject: asunto,
        html: htmlPaciente,
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
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 30px 20px; }
          .titulo { font-size: 24px; font-weight: bold; color: #dc3545; margin-bottom: 20px; text-align: center; }
          .seccion { margin-bottom: 25px; }
          .seccion-titulo { font-weight: bold; color: #333; margin-bottom: 10px; font-size: 16px; border-bottom: 2px solid #dc3545; padding-bottom: 8px; }
          .dato { display: flex; margin-bottom: 12px; }
          .dato-label { font-weight: 600; color: #666; width: 140px; }
          .dato-valor { color: #333; }
          .cita-box { background: #f9f9f9; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .cita-box-item { display: flex; margin-bottom: 10px; }
          .cita-icon { width: 30px; color: #dc3545; font-weight: bold; }
          .cita-text { flex: 1; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .firma { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; }
          .boton { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <div class="logo">🏥 Clínica R. Palma</div>
            <p>Centro Médico de Excelencia</p>
          </div>

          <!-- CONTENIDO -->
          <div class="content">
            <div class="titulo">Confirmación de Cita Médica</div>
            
            <p>Estimado/a <strong>${nombreDestinatario}</strong>,</p>
            <p style="margin-bottom: 20px; color: #666;">
              ${esPaciente 
                ? `Tu cita ha sido registrada exitosamente. A continuación encontrarás los detalles de tu consulta.` 
                : `Se ha registrado una nueva cita para ti. A continuación encontrarás los detalles.`}
            </p>

            <!-- DETALLES DE LA CITA -->
            <div class="cita-box">
              <div class="cita-box-item">
                <div class="cita-icon">📅</div>
                <div class="cita-text">
                  <strong>Fecha:</strong><br>
                  ${fechaFormato}
                </div>
              </div>
              <div class="cita-box-item">
                <div class="cita-icon">🕐</div>
                <div class="cita-text">
                  <strong>Horario:</strong><br>
                  ${cita.slot}
                </div>
              </div>
              <div class="cita-box-item">
                <div class="cita-icon">📍</div>
                <div class="cita-text">
                  <strong>Ubicación:</strong><br>
                  ${sede.nombre}
                </div>
              </div>
            </div>

            <!-- DATOS DEL PACIENTE -->
            ${esPaciente ? `
              <div class="seccion">
                <div class="seccion-titulo">Tus Datos</div>
                <div class="dato">
                  <div class="dato-label">Nombre:</div>
                  <div class="dato-valor">${paciente.names} ${paciente.last_names}</div>
                </div>
                <div class="dato">
                  <div class="dato-label">DNI:</div>
                  <div class="dato-valor">${paciente.dni}</div>
                </div>
                <div class="dato">
                  <div class="dato-label">Teléfono:</div>
                  <div class="dato-valor">${paciente.phone || "No registrado"}</div>
                </div>
                <div class="dato">
                  <div class="dato-label">Email:</div>
                  <div class="dato-valor">${paciente.email}</div>
                </div>
              </div>
            ` : `
              <div class="seccion">
                <div class="seccion-titulo">Datos del Paciente</div>
                <div class="dato">
                  <div class="dato-label">Nombre:</div>
                  <div class="dato-valor">${paciente.names} ${paciente.last_names}</div>
                </div>
                <div class="dato">
                  <div class="dato-label">DNI:</div>
                  <div class="dato-valor">${paciente.dni}</div>
                </div>
                <div class="dato">
                  <div class="dato-label">Teléfono:</div>
                  <div class="dato-valor">${paciente.phone || "No registrado"}</div>
                </div>
              </div>
            `}

            <!-- DATOS DEL MÉDICO -->
            <div class="seccion">
              <div class="seccion-titulo">Datos del Médico</div>
              <div class="dato">
                <div class="dato-label">Nombre:</div>
                <div class="dato-valor">Dr. ${medico.nombres} ${medico.apellidos}</div>
              </div>
              <div class="dato">
                <div class="dato-label">Especialidad:</div>
                <div class="dato-valor">${medico.especialidad?.nombre || "No especificada"}</div>
              </div>
            </div>

            <!-- DATOS DE LA SEDE -->
            <div class="seccion">
              <div class="seccion-titulo">Ubicación de la Clínica</div>
              <div class="dato">
                <div class="dato-label">Sede:</div>
                <div class="dato-valor">${sede.nombre}</div>
              </div>
              <div class="dato">
                <div class="dato-label">Dirección:</div>
                <div class="dato-valor">${sede.direccion || "No registrada"}</div>
              </div>
              <div class="dato">
                <div class="dato-label">Teléfono:</div>
                <div class="dato-valor">${sede.telefono || "No registrado"}</div>
              </div>
            </div>

            <!-- RECOMENDACIONES -->
            <div class="seccion" style="background: #fffbea; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
              <div class="seccion-titulo" style="color: #ff9800; border-color: #ff9800;">⚠️ Importante</div>
              <ul style="margin-left: 20px; color: #666;">
                <li>Por favor, llegar 10 minutos antes de la hora programada.</li>
                <li>En caso de no poder asistir, avisar con al menos 24 horas de anticipación.</li>
                <li>Traer documento de identidad y datos de tu seguro médico si aplica.</li>
              </ul>
            </div>

            <div class="firma">
              <p>Atentamente,</p>
              <p><strong>Clínica R. Palma</strong></p>
              <p style="font-size: 11px; margin-top: 10px;">Este es un email automatizado. Por favor, no respondas a este correo.</p>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p>© 2026 Clínica R. Palma - Todos los derechos reservados</p>
            <p>Email: info@clinicapalma.com | Teléfono: +51 (1) 1234-5678</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = { EmailService };
