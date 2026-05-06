import pg from "pg";
import { config } from "dotenv";

config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkTimezone() {
  try {
    const result = await pool.query("SELECT NOW() as now, CURRENT_DATE as today");
    console.log("PostgreSQL Current Date/Time:");
    console.log(JSON.stringify(result.rows[0], null, 2));

    // Verificar la zona horaria
    const tzResult = await pool.query("SELECT current_setting('TIMEZONE') as tz");
    console.log("\nPostgreSQL Timezone:", tzResult.rows[0].tz);

    // Test con una fecha
    const testDate = new Date("2026-05-02T00:00:00Z");
    console.log("\nTest Date in Node.js:");
    console.log("ISO String:", testDate.toISOString());
    console.log("Time (ms):", testDate.getTime());

    // Insertar y leer de vuelta
    await pool.query(`
      CREATE TEMP TABLE test_date (
        id SERIAL PRIMARY KEY,
        my_date TIMESTAMP NOT NULL
      )
    `);

    await pool.query("INSERT INTO test_date (my_date) VALUES ($1)", [testDate]);

    const readResult = await pool.query("SELECT my_date FROM test_date");
    console.log("\nDate Stored in DB:", readResult.rows[0].my_date);

    await pool.end();
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

checkTimezone();
