// Script para agregar columna sexo a tabla users

const { database } = require("./src/database/connection");

async function migrateAddSexo() {
  try {
    const dataSource = database.getDataSource();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hasColumn = await queryRunner.hasColumn("users", "user_sexo");

      if (!hasColumn) {
        console.log("Agregando columna user_sexo a tabla users...");
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN user_sexo varchar(1) NULL
        `);
        console.log("✅ Columna user_sexo agregada exitosamente");
      } else {
        console.log("ℹ️ La columna user_sexo ya existe en la tabla users");
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

(async () => {
  await database.connect();
  await migrateAddSexo();
})();
