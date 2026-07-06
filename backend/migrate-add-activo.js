// Script para agregar columna activo a tabla users (soft delete support)

const { database } = require("./src/database/connection");

async function migrateAddActivo() {
  try {
    const dataSource = database.getDataSource();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si la columna ya existe
      const hasColumn = await queryRunner.hasColumn("users", "activo");

      if (!hasColumn) {
        console.log("Agregando columna activo a tabla users...");
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN activo boolean DEFAULT true NOT NULL
        `);
        console.log("✅ Columna activo agregada exitosamente");
      } else {
        console.log("ℹ️ La columna activo ya existe en la tabla users");
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
  await migrateAddActivo();
})();
