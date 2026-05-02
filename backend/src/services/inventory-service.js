import { pool, withTransaction } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

const movementLabels = {
  purchase: "Entrada por compra",
  sale: "Salida por venta",
  internal_consumption: "Salida por consumo interno",
  manual_adjustment: "Ajuste manual",
  loss: "Perdida o merma",
  recipe_consumption: "Salida por receta",
};

export const listMovements = async () => {
  const result = await pool.query(
    `SELECT im.*, p.name AS product_name, u.name AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     ORDER BY im.movement_date DESC, im.id DESC`
  );

  return result.rows;
};

export const createManualMovement = async (payload, userId) =>
  withTransaction(async (client) => {
    const productResult = await client.query("SELECT * FROM products WHERE id = $1", [payload.product_id]);
    const product = productResult.rows[0];

    if (!product) {
      throw new AppError("Producto no encontrado.", 404);
    }

    const quantity = Number(payload.quantity);
    const isExit = ["internal_consumption", "loss"].includes(payload.movement_type);
    const stockDelta = payload.movement_type === "manual_adjustment" ? quantity : isExit ? -quantity : quantity;

    if (isExit && Number(product.stock_current) < quantity) {
      throw new AppError("Stock insuficiente para registrar la salida.");
    }

    const updatedStock = Number(product.stock_current) + stockDelta;

    if (updatedStock < 0) {
      throw new AppError("El ajuste deja el stock en un valor invalido.");
    }

    await client.query("UPDATE products SET stock_current = $1, updated_at = NOW() WHERE id = $2", [
      updatedStock,
      payload.product_id,
    ]);

    const movementResult = await client.query(
      `INSERT INTO inventory_movements
       (product_id, movement_type, quantity, movement_date, user_id, observation)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        payload.product_id,
        payload.movement_type,
        quantity,
        payload.movement_date || new Date(),
        userId,
        payload.observation || movementLabels[payload.movement_type],
      ]
    );

    return movementResult.rows[0];
  });

export const getAlerts = async () => {
  const [lowStockResult, recipesResult, inactiveResult] = await Promise.all([
    pool.query(
      `SELECT id, name, stock_current, stock_minimum
       FROM products
       WHERE status = 'active' AND stock_current <= stock_minimum
       ORDER BY stock_current ASC`
    ),
    pool.query(
      `SELECT p.id AS product_id, p.name AS recipe_name
       FROM recipes r
       JOIN products p ON p.id = r.product_id
       WHERE p.status = 'active'`
    ),
    pool.query(
      `SELECT p.id, p.name
       FROM products p
       LEFT JOIN inventory_movements im ON im.product_id = p.id
       WHERE p.status = 'active'
       GROUP BY p.id
       HAVING MAX(im.movement_date) IS NULL
       ORDER BY p.name`
    ),
  ]);

  const insufficientIngredients = [];

  for (const recipe of recipesResult.rows) {
    const items = await pool.query(
      `SELECT ri.quantity, i.name AS ingredient_name, i.stock_current
       FROM recipe_items ri
       JOIN products i ON i.id = ri.ingredient_product_id
       WHERE ri.recipe_id = (
         SELECT id FROM recipes WHERE product_id = $1
       )`,
      [recipe.product_id]
    );

    const missing = items.rows.filter((item) => Number(item.stock_current) < Number(item.quantity));
    if (missing.length) {
      insufficientIngredients.push({
        recipe: recipe.recipe_name,
        missing,
      });
    }
  }

  return {
    lowStock: lowStockResult.rows,
    insufficientIngredients,
    productsWithoutMovement: inactiveResult.rows,
  };
};
