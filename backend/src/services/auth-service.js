import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { signToken } from "../utils/jwt.js";

export const loginUser = async ({ email, password }) => {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.password, u.status, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE LOWER(u.email) = LOWER($1)`,
    [email]
  );

  const user = result.rows[0];

  if (!user || user.status !== "active") {
    throw new AppError("Credenciales invalidas.", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AppError("Credenciales invalidas.", 401);
  }

  return {
    token: signToken({ userId: user.id, role: user.role_name }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
    },
  };
};
