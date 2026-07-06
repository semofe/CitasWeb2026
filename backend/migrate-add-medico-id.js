// Script para agregar columna medico_id a tabla users

const { database } = require("./src/database/connection");

async function migrateAddMedicoId() {
  try {
    const dataSource = database.getDataSource();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si la columna ya existe
      const hasColumn = await queryRunner.hasColumn("users", "medico_id");

      if (!hasColumn) {
        console.log("Agregando columna medico_id a tabla users...");
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN medico_id uuid NULL
        `);
        console.log("✅ Columna medico_id agregada exitosamente");
      } else {
        console.log("ℹ️ La columna medico_id ya existe en la tabla users");
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    console.log("✅ Migración completada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    process.exit(1);
  }
}

// Ejecutar la migración
(async () => {
  await database.connect();
  await migrateAddMedicoId();
})();
