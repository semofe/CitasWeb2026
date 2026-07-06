// src/backend/utils/citaHistorialJob.js

const { RepositoryFactory } = require("../database/RepositoryFactory");
const { CitaServiceFactory } = require("../database/factories/CitaServiceFactory");

class CitaHistorialJob {
  static async initializeJob() {
    const citaRepository = RepositoryFactory.create("cita");
    const citaHistorialRepository = RepositoryFactory.create("citaHistorial");
    const citaHistorialService = CitaServiceFactory.createCitaHistorialService(citaRepository, citaHistorialRepository);
    const citaService = CitaServiceFactory.createCitaService(citaRepository);

    // Ejecutar cada minuto
    setInterval(async () => {
      try {
        // Auto-completar citas vencidas
        const autocompletadas = await citaService.autocompletarVencidas();
        
        const vencidas = await citaHistorialService.moveCitasVencidas();
        const completadas = await citaHistorialService.moveCompletedCitas();
        const canceladas = await citaHistorialService.moveCancelledCitas();

        if (vencidas > 0 || completadas > 0 || canceladas > 0 || autocompletadas > 0) {
          console.log(`📊 Citas procesadas - Auto-completadas: ${autocompletadas}, Movidas al historial - Vencidas: ${vencidas}, Completadas: ${completadas}, Canceladas: ${canceladas}`);
        }
      } catch (error) {
        console.error("❌ Error en CitaHistorialJob:", error.message);
      }
    }, 60 * 1000); // 1 minuto

    // Ejecutar una vez al iniciar
    try {
      const autocompletadas = await citaService.autocompletarVencidas();
      
      const vencidas = await citaHistorialService.moveCitasVencidas();
      const completadas = await citaHistorialService.moveCompletedCitas();
      const canceladas = await citaHistorialService.moveCancelledCitas();

      if (vencidas > 0 || completadas > 0 || canceladas > 0 || autocompletadas > 0) {
        console.log(`📊 Sincronización inicial - Auto-completadas: ${autocompletadas}, Movidas al historial - Vencidas: ${vencidas}, Completadas: ${completadas}, Canceladas: ${canceladas}`);
      }
    } catch (error) {
      console.error("❌ Error en sincronización inicial:", error.message);
    }
  }
}

module.exports = { CitaHistorialJob };
