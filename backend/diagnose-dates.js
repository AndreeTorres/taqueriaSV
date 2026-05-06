import pg from "pg";
import { config } from "dotenv";

config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function diagnose() {
  try {
    console.log("=== DIAGNOSTIC REPORT ===\n");

    // 1. Check server timezone
    const tzResult = await pool.query("SELECT current_setting('TIMEZONE') as tz, NOW() as server_now, CURRENT_DATE as server_date");
    console.log("1. PostgreSQL Server Info:");
    console.log("   Timezone:", tzResult.rows[0].tz);
    console.log("   Server NOW():", tzResult.rows[0].server_now);
    console.log("   Server CURRENT_DATE:", tzResult.rows[0].server_date);

    // 2. Check JavaScript Date behavior
    console.log("\n2. JavaScript Date Behavior:");
    const jsDate1 = new Date("2026-05-02T00:00:00");
    const jsDate2 = new Date("2026-05-02");
    const jsDate3 = new Date();
    
    console.log("   new Date('2026-05-02T00:00:00'):");
    console.log("     - JS Date:", jsDate1);
    console.log("     - ISO:", jsDate1.toISOString());
    console.log("     - Local:", jsDate1.toString());
    
    console.log("   new Date('2026-05-02'):");
    console.log("     - JS Date:", jsDate2);
    console.log("     - ISO:", jsDate2.toISOString());
    
    console.log("   new Date() (now):");
    console.log("     - JS Date:", jsDate3);
    console.log("     - ISO:", jsDate3.toISOString());

    // 3. Test inserting with each method
    console.log("\n3. Test Database Insertions:\n");

    // Test 1: Using new Date object
    await pool.query("DROP TABLE IF EXISTS test_dates");
    await pool.query(`CREATE TABLE test_dates (
      id SERIAL PRIMARY KEY,
      method VARCHAR(50),
      input_value TEXT,
      stored_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Test with Date object
    console.log("   Test A: Inserting new Date('2026-05-02T00:00:00')");
    const testDateA = new Date("2026-05-02T00:00:00");
    const resultA = await pool.query(
      "INSERT INTO test_dates (method, input_value, stored_date) VALUES ($1, $2, $3) RETURNING stored_date",
      ["Date object", testDateA.toISOString(), testDateA]
    );
    console.log("   - Stored in DB:", resultA.rows[0].stored_date);
    console.log("   - Retrieved as Date:", new Date(resultA.rows[0].stored_date).toISOString().split('T')[0]);

    // Test with string
    console.log("\n   Test B: Inserting string '2026-05-02 00:00:00'::TIMESTAMP");
    const resultB = await pool.query(
      "INSERT INTO test_dates (method, input_value, stored_date) VALUES ($1, $2, $3::TIMESTAMP) RETURNING stored_date",
      ["String cast", "2026-05-02 00:00:00", "2026-05-02 00:00:00"]
    );
    console.log("   - Stored in DB:", resultB.rows[0].stored_date);
    console.log("   - Retrieved as Date:", new Date(resultB.rows[0].stored_date).toISOString().split('T')[0]);

    // Test with AT TIME ZONE
    console.log("\n   Test C: Using AT TIME ZONE 'UTC' with string");
    const resultC = await pool.query(
      `INSERT INTO test_dates (method, input_value, stored_date) 
       VALUES ($1, $2, ($3 || ' 00:00:00')::TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE current_setting('TIMEZONE')) 
       RETURNING stored_date`,
      ["AT TIME ZONE", "2026-05-02", "2026-05-02"]
    );
    console.log("   - Stored in DB:", resultC.rows[0].stored_date);
    console.log("   - Retrieved as Date:", new Date(resultC.rows[0].stored_date).toISOString().split('T')[0]);

    // Show all results
    console.log("\n4. Summary of all stored dates:");
    const allResults = await pool.query("SELECT method, input_value, stored_date FROM test_dates ORDER BY id");
    allResults.rows.forEach(row => {
      const dateOnly = new Date(row.stored_date).toISOString().split('T')[0];
      console.log(`   ${row.method}: "${row.input_value}" -> stored as ${row.stored_date} -> seen as ${dateOnly}`);
    });

    await pool.end();
    console.log("\n=== END DIAGNOSTIC ===");
  } catch (e) {
    console.error("Error:", e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

diagnose();
