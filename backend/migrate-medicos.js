#!/usr/bin/env node

/**
 * Script de migración: Asignar turno 'mañana' a médicos con turno NULL
 * Uso: node migrate-medicos.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { database } = require("./src/database/connection");

async function migrate() {
  try {
    console.log("🔄 Conectando a la base de datos...");
    const dataSource = await database.connect();

    console.log("📝 Actualizando médicos con turno NULL...");
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      const result = await queryRunner.query(
        `UPDATE medicos SET turno = 'mañana' WHERE turno IS NULL`
      );

      console.log(`✅ Migración completada. Filas actualizadas.`);
    } finally {
      await queryRunner.release();
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en migración:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
