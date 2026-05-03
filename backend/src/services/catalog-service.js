import { pool } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

const tables = {
  categories: {
    table: "categories",
    allowedFields: ["name", "description", "status"],
  },
  suppliers: {
    table: "suppliers",
    allowedFields: ["name", "phone", "address", "supplied_product", "status"],
  },
};

const buildUpdate = (allowedFields, payload) => {
  const fields = Object.entries(payload).filter(([field]) => allowedFields.includes(field));

  if (!fields.length) {
    throw new AppError("No hay campos validos para actualizar.");
  }

  const setClause = fields
    .map(([field], index) => `${field} = $${index + 1}`)
    .join(", ");

  return {
    setClause,
    values: fields.map(([, value]) => value),
  };
};

export const listCatalog = async (key, businessId) => {
  const definition = tables[key];
  const result = await pool.query(
    `SELECT * FROM ${definition.table} WHERE business_id = $1 ORDER BY id DESC`,
    [businessId]
  );
  return result.rows;
};

export const createCatalogItem = async (key, payload, businessId) => {
  const definition = tables[key];
  const fields = definition.allowedFields.filter((field) => payload[field] !== undefined);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");

  const result = await pool.query(
    `INSERT INTO ${definition.table} (${fields.join(", ")}, business_id)
     VALUES (${placeholders}, $${fields.length + 1})
     RETURNING *`,
    [...values, businessId]
  );

  return result.rows[0];
};

export const updateCatalogItem = async (key, id, payload, businessId) => {
  const definition = tables[key];
  const { setClause, values } = buildUpdate(definition.allowedFields, payload);
  const result = await pool.query(
    `UPDATE ${definition.table}
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length + 1} AND business_id = $${values.length + 2}
     RETURNING *`,
    [...values, id, businessId]
  );

  if (!result.rows[0]) {
    throw new AppError("Registro no encontrado.", 404);
  }

  return result.rows[0];
};
