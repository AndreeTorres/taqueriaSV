import { pool } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No autorizado.", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.status = 'active'`,
      [payload.userId]
    );

    if (!result.rows[0]) {
      throw new AppError("Usuario no disponible.", 401);
    }

    req.user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      roleId: result.rows[0].role_id,
      role: result.rows[0].role_name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("No tiene permisos para esta accion.", 403));
  }

  next();
};
