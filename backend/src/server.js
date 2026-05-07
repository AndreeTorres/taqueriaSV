import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await pool.query("SELECT 1");
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`Backend running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start backend", error);
  process.exit(1);
});
