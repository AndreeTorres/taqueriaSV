import { pool } from "./src/config/db.js";

async function testDate() {
  try {
    console.log("Testing date insertion with string format...\n");

    // Test 1: Insertar como string YYYY-MM-DD
    const testDate = "2026-05-02";
    console.log(`Test 1: Inserting date string: "${testDate}"`);
    
    const result = await pool.query(
      `CREATE TEMP TABLE test_purchases (
        id SERIAL PRIMARY KEY,
        purchase_date TIMESTAMP NOT NULL
      ); 
      INSERT INTO test_purchases (purchase_date) 
      VALUES ($1::TIMESTAMP) 
      RETURNING purchase_date`,
      [testDate]
    );

    console.log("Returned from DB:", result.rows[0].purchase_date);
    console.log("Date as ISO string:", new Date(result.rows[0].purchase_date).toISOString());
    console.log("Date part:", new Date(result.rows[0].purchase_date).toISOString().split('T')[0]);

    await pool.end();
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testDate();
