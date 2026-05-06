import { pool } from "./src/config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("🔧 Iniciando migración: Creando proveedor 'Gastos Generales'...");
    
    const sql = fs.readFileSync(
      path.join(__dirname, "../database/insert_gastos_generales_supplier.sql"),
      "utf8"
    );

    await pool.query(sql);
    
    console.log("✅ Migración completada exitosamente");
    console.log("✨ El proveedor 'Gastos Generales' ha sido creado para todos los negocios");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la migración:", error.message);
    process.exit(1);
  }
}

runMigration();
