import { pool, withTransaction } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { required, positiveNumber, ensureArray, enumValue, dateString } from "../utils/validators.js";

const PAYMENT_METHODS = ["efectivo", "tarjeta", "cheque", "transferencia"];
const ORDER_TYPES = ["comer_aqui", "para_llevar", "pasar_recogiendo"];

export const listSales = async (filters = {}, businessId) => {
  let query = `SELECT s.*, u.name AS user_name FROM sales s JOIN users u ON u.id = s.user_id WHERE s.business_id = $1`;
  const params = [businessId];
  let paramIndex = 2;

  if (filters.client_name) {
    query += ` AND s.client_name ILIKE $${paramIndex}`;
    params.push(`%${filters.client_name}%`);
    paramIndex++;
  }

  if (filters.payment_method) {
    query += ` AND s.payment_method = $${paramIndex}`;
    params.push(filters.payment_method);
    paramIndex++;
  }

  if (filters.order_type) {
    query += ` AND s.order_type = $${paramIndex}`;
    params.push(filters.order_type);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND s.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.start_date) {
    query += ` AND DATE(s.sale_date) >= $${paramIndex}`;
    params.push(filters.start_date);
    paramIndex++;
  }

  if (filters.end_date) {
    query += ` AND DATE(s.sale_date) <= $${paramIndex}`;
    params.push(filters.end_date);
    paramIndex++;
  }

  query += ` ORDER BY s.sale_date DESC, s.id DESC`;

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

export const getSaleWithDetails = async (saleId, businessId) => {
  const saleResult = await pool.query(
    `SELECT s.*, u.name AS user_name
     FROM sales s JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.business_id = $2`,
    [saleId, businessId]
  );
  if (!saleResult.rows[0]) return null;
  const details = await pool.query(
    `SELECT sd.*, p.name AS product_name
     FROM sale_details sd JOIN products p ON p.id = sd.product_id
     WHERE sd.sale_id = $1`,
    [saleId]
  );
  return { ...saleResult.rows[0], details: details.rows };
};

export const createSale = async (payload, userId, businessId) => {
  required(payload.payment_method, "método de pago");
  ensureArray(payload.items, "items");
  enumValue(payload.payment_method, PAYMENT_METHODS, "método de pago");
  if (payload.order_type) enumValue(payload.order_type, ORDER_TYPES, "tipo de orden");
  if (payload.sale_date) dateString(payload.sale_date, "fecha de venta");

  for (const item of payload.items) {
    required(item.product_id, "product_id");
    positiveNumber(item.quantity, "cantidad", false);
    positiveNumber(item.unit_price, "precio unitario", true);
  }

  return withTransaction(async (client) => {
    let total = 0;
    for (const item of payload.items) {
      total += Number(item.quantity) * Number(item.unit_price);
    }

    const saleResult = await client.query(
      `INSERT INTO sales (client_name, sale_date, total, payment_method, order_type, status, observation, user_id, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        payload.client_name?.trim() || null,
        payload.sale_date || new Date(),
        total,
        payload.payment_method,
        payload.order_type || "para_llevar",
        "pendiente",
        payload.observation?.trim() || null,
        userId,
        businessId,
      ]
    );

    const saleId = saleResult.rows[0].id;

    for (const item of payload.items) {
      const product = await client.query(
        "SELECT id FROM products WHERE id = $1 AND status = 'active' AND business_id = $2",
        [item.product_id, businessId]
      );
      if (!product.rows[0]) throw new AppError(`Producto ${item.product_id} no encontrado.`, 404);

      await client.query(
        `INSERT INTO sale_details (sale_id, product_id, quantity, unit_price, total, observation)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [saleId, item.product_id, item.quantity, item.unit_price, Number(item.quantity) * Number(item.unit_price), item.observation || null]
      );
    }

    const details = await client.query(
      `SELECT sd.*, p.name AS product_name FROM sale_details sd JOIN products p ON p.id = sd.product_id WHERE sd.sale_id = $1`,
      [saleId]
    );
    return { ...saleResult.rows[0], details: details.rows };
  });
};

export const updateSale = async (saleId, payload, businessId) =>
  withTransaction(async (client) => {
    const existing = await client.query("SELECT * FROM sales WHERE id = $1 AND business_id = $2", [saleId, businessId]);
    if (!existing.rows[0]) throw new AppError("Pedido no encontrado.", 404);

    const fields = [];
    const values = [];
    let idx = 1;

    if (payload.status !== undefined) {
      enumValue(payload.status, ["pendiente", "en_cocina", "listo", "entregado"], "estado");
      fields.push(`status = $${idx++}`);
      values.push(payload.status);
    }
    if (payload.delivered !== undefined) {
      fields.push(`delivered = $${idx++}`);
      values.push(Boolean(payload.delivered));
    }
    if (payload.paid !== undefined) {
      fields.push(`paid = $${idx++}`);
      values.push(Boolean(payload.paid));
    }
    if (payload.payment_method !== undefined) {
      enumValue(payload.payment_method, PAYMENT_METHODS, "método de pago");
      fields.push(`payment_method = $${idx++}`);
      values.push(payload.payment_method);
    }
    if (payload.client_name !== undefined) {
      fields.push(`client_name = $${idx++}`);
      values.push(payload.client_name?.trim() || null);
    }
    if (payload.observation !== undefined) {
      fields.push(`observation = $${idx++}`);
      values.push(payload.observation?.trim() || null);
    }

    if (payload.items && payload.items.length > 0) {
      ensureArray(payload.items, "items");
      for (const item of payload.items) {
        required(item.product_id, "product_id");
        positiveNumber(item.quantity, "cantidad", false);
        positiveNumber(item.unit_price, "precio unitario", true);
      }

      await client.query("DELETE FROM sale_details WHERE sale_id = $1", [saleId]);
      let newTotal = 0;
      for (const item of payload.items) {
        const product = await client.query(
          "SELECT id FROM products WHERE id = $1 AND status = 'active' AND business_id = $2",
          [item.product_id, businessId]
        );
        if (!product.rows[0]) throw new AppError(`Producto ${item.product_id} no encontrado.`, 404);
        const itemTotal = Number(item.quantity) * Number(item.unit_price);
        newTotal += itemTotal;
        await client.query(
          `INSERT INTO sale_details (sale_id, product_id, quantity, unit_price, total, observation) VALUES ($1,$2,$3,$4,$5,$6)`,
          [saleId, item.product_id, item.quantity, item.unit_price, itemTotal, item.observation || null]
        );
      }
      fields.push(`total = $${idx++}`);
      values.push(newTotal);
    }

    if (fields.length > 0) {
      values.push(saleId);
      await client.query(`UPDATE sales SET ${fields.join(", ")} WHERE id = $${idx}`, values);
    }

    const updated = await client.query(
      `SELECT s.*, u.name AS user_name FROM sales s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
      [saleId]
    );
    const details = await client.query(
      `SELECT sd.*, p.name AS product_name FROM sale_details sd JOIN products p ON p.id = sd.product_id WHERE sd.sale_id = $1`,
      [saleId]
    );
    return { ...updated.rows[0], details: details.rows };
  });
