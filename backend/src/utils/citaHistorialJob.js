// src/backend/utils/citaHistorialJob.js

const { RepositoryFactory } = require("../database/RepositoryFactory");
const { CitaServiceFactory } = require("../database/factories/CitaServiceFactory");

class CitaHistorialJob {
  static async initializeJob(paymentService) {
    const citaRepository = RepositoryFactory.create("cita");
    const citaHistorialRepository = RepositoryFactory.create("citaHistorial");
    const citaHistorialService = CitaServiceFactory.createCitaHistorialService(citaRepository, citaHistorialRepository);
    const citaService = CitaServiceFactory.createCitaService(citaRepository);

    // Ejecutar cada minuto
    setInterval(async () => {
      try {
        const pagosExpirados = paymentService ? await paymentService.expirePendingPayments() : 0;
        // Auto-completar citas vencidas
        const autocompletadas = await citaService.autocompletarVencidas();
        
        const vencidas = await citaHistorialService.moveCitasVencidas();
        const completadas = await citaHistorialService.moveCompletedCitas();
        const canceladas = await citaHistorialService.moveCancelledCitas();

        if (vencidas > 0 || completadas > 0 || canceladas > 0 || autocompletadas > 0 || pagosExpirados > 0) {
          console.log(`📊 Citas procesadas - Pagos expirados: ${pagosExpirados}, Auto-completadas: ${autocompletadas}, Historial: ${vencidas + completadas + canceladas}`);
        }
      } catch (error) {
        console.error("❌ Error en CitaHistorialJob:", error.message);
      }
    }, 60 * 1000); // 1 minuto

    // Ejecutar una vez al iniciar
    try {
      const pagosExpirados = paymentService ? await paymentService.expirePendingPayments() : 0;
      const autocompletadas = await citaService.autocompletarVencidas();
      
      const vencidas = await citaHistorialService.moveCitasVencidas();
      const completadas = await citaHistorialService.moveCompletedCitas();
      const canceladas = await citaHistorialService.moveCancelledCitas();

      if (vencidas > 0 || completadas > 0 || canceladas > 0 || autocompletadas > 0 || pagosExpirados > 0) {
        console.log(`📊 Sincronización inicial - Pagos expirados: ${pagosExpirados}, Auto-completadas: ${autocompletadas}, Historial: ${vencidas + completadas + canceladas}`);
      }
    } catch (error) {
      console.error("❌ Error en sincronización inicial:", error.message);
    }
  }
}

module.exports = { CitaHistorialJob };
