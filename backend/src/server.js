import app from "./app.js";
import { pool } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await pool.query("SELECT 1");
  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start backend", error);
  process.exit(1);
});
