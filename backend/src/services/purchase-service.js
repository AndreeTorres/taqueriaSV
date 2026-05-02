import { pool, withTransaction } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

export const listPurchases = async () => {
  const result = await pool.query(
    `SELECT p.*, s.name AS supplier_name, u.name AS user_name
     FROM purchases p
     JOIN suppliers s ON s.id = p.supplier_id
     JOIN users u ON u.id = p.user_id
     ORDER BY p.purchase_date DESC, p.id DESC`
  );
  return result.rows;
};

export const createPurchase = async (payload, userId) =>
  withTransaction(async (client) => {
    const supplier = await client.query("SELECT id FROM suppliers WHERE id = $1 AND status = 'active'", [
      payload.supplier_id,
    ]);

    if (!supplier.rows[0]) {
      throw new AppError("Proveedor no encontrado o inactivo.", 404);
    }

    let totalAmount = 0;

    for (const item of payload.items) {
      totalAmount += Number(item.quantity) * Number(item.unit_price);
    }

    const purchaseResult = await client.query(
      `INSERT INTO purchases (supplier_id, purchase_date, total, user_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [payload.supplier_id, payload.purchase_date || new Date(), totalAmount, userId]
    );

    for (const item of payload.items) {
      const productResult = await client.query("SELECT * FROM products WHERE id = $1", [item.product_id]);
      const product = productResult.rows[0];

      if (!product) {
        throw new AppError(`Producto ${item.product_id} no encontrado.`, 404);
      }

      await client.query(
        `INSERT INTO purchase_details (purchase_id, product_id, quantity, unit_price, total)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          purchaseResult.rows[0].id,
          item.product_id,
          item.quantity,
          item.unit_price,
          Number(item.quantity) * Number(item.unit_price),
        ]
      );

      await client.query(
        `UPDATE products
         SET stock_current = stock_current + $1,
             purchase_price = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [item.quantity, item.unit_price, item.product_id]
      );

      await client.query(
        `INSERT INTO inventory_movements
         (product_id, movement_type, quantity, movement_date, user_id, observation)
         VALUES ($1, 'purchase', $2, $3, $4, $5)`,
        [
          item.product_id,
          item.quantity,
          payload.purchase_date || new Date(),
          userId,
          payload.observation || "Entrada por compra",
        ]
      );
    }

    const details = await client.query(
      `SELECT pd.*, pr.name AS product_name
       FROM purchase_details pd
       JOIN products pr ON pr.id = pd.product_id
       WHERE pd.purchase_id = $1`,
      [purchaseResult.rows[0].id]
    );

    return {
      ...purchaseResult.rows[0],
      details: details.rows,
    };
  });
