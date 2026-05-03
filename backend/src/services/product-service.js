import { pool } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { required, positiveNumber, stringLength, enumValue } from "../utils/validators.js";

const PRODUCT_TYPES = ["producto para venta", "ingrediente", "insumo"];
const STATUSES = ["active", "inactive"];

export const listProducts = async (filters = {}, businessId) => {
  let query = `SELECT p.*, c.name AS category_name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.business_id = $1`;
  const params = [businessId];
  let paramIndex = 2;

  if (filters.search) {
    query += ` AND (p.name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.category_id) {
    query += ` AND p.category_id = $${paramIndex}`;
    params.push(filters.category_id);
    paramIndex++;
  }

  if (filters.product_type) {
    query += ` AND p.product_type = $${paramIndex}`;
    params.push(filters.product_type);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND p.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.low_stock === "true") {
    query += ` AND p.stock_current <= p.stock_minimum`;
  }

  query += ` ORDER BY p.id DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }

  const result = await pool.query(query, params);
  return result.rows;
};

export const createProduct = async (payload, businessId) => {
  required(payload.name, "nombre");
  required(payload.category_id, "categoría");
  required(payload.product_type, "tipo de producto");
  required(payload.unit_measure, "unidad de medida");

  stringLength(payload.name, 1, 150, "nombre");
  positiveNumber(payload.purchase_price, "precio de compra", true);
  positiveNumber(payload.sale_price, "precio de venta", true);
  positiveNumber(payload.stock_minimum, "stock mínimo", true);
  enumValue(payload.product_type, PRODUCT_TYPES, "tipo de producto");
  enumValue(payload.status ?? "active", STATUSES, "estado");

  const result = await pool.query(
    `INSERT INTO products
      (name, category_id, product_type, unit_measure, purchase_price, sale_price, stock_current, stock_minimum, status, business_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      payload.name.trim(),
      payload.category_id,
      payload.product_type,
      payload.unit_measure,
      payload.purchase_price ?? 0,
      payload.sale_price ?? 0,
      payload.stock_current ?? 0,
      payload.stock_minimum ?? 0,
      payload.status ?? "active",
      businessId,
    ]
  );
  return result.rows[0];
};

export const updateProduct = async (id, payload, businessId) => {
  if (payload.name) stringLength(payload.name, 1, 150, "nombre");
  if (payload.purchase_price !== undefined) positiveNumber(payload.purchase_price, "precio de compra", true);
  if (payload.sale_price !== undefined) positiveNumber(payload.sale_price, "precio de venta", true);
  if (payload.stock_minimum !== undefined) positiveNumber(payload.stock_minimum, "stock mínimo", true);
  if (payload.product_type) enumValue(payload.product_type, PRODUCT_TYPES, "tipo de producto");
  if (payload.status) enumValue(payload.status, STATUSES, "estado");

  const fields = [
    "name",
    "category_id",
    "product_type",
    "unit_measure",
    "purchase_price",
    "sale_price",
    "stock_current",
    "stock_minimum",
    "status",
  ].filter((field) => payload[field] !== undefined);

  if (!fields.length) {
    throw new AppError("No hay campos válidos para actualizar.");
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
  const values = fields.map((field) => payload[field]);
  const result = await pool.query(
    `UPDATE products
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${values.length + 1} AND business_id = $${values.length + 2}
     RETURNING *`,
    [...values, id, businessId]
  );

  if (!result.rows[0]) {
    throw new AppError("Producto no encontrado.", 404);
  }

  return result.rows[0];
};

export const deleteProduct = async (id, businessId) => {
  const result = await pool.query(
    `DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING id, name`,
    [id, businessId]
  );

  if (!result.rows[0]) {
    throw new AppError("Producto no encontrado.", 404);
  }

  return { success: true, deleted: result.rows[0] };
};
