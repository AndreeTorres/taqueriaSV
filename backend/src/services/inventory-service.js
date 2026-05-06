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

export const listMovements = async (businessId) => {
  const result = await pool.query(
    `SELECT im.*, p.name AS product_name, u.name AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     WHERE im.business_id = $1
     ORDER BY im.movement_date DESC, im.id DESC`,
    [businessId]
  );

  return result.rows;
};

export const createManualMovement = async (payload, userId, businessId) =>
  withTransaction(async (client) => {
    const productResult = await client.query(
      "SELECT * FROM products WHERE id = $1 AND business_id = $2",
      [payload.product_id, businessId]
    );
    const product = productResult.rows[0];

    if (!product) {
      throw new AppError("Producto no encontrado.", 404);
    }

    const quantity = Number(payload.quantity);

    // Registrar el movimiento de inventario sin actualizar stock_current (campo eliminado)
    const movementResult = await client.query(
      `INSERT INTO inventory_movements
       (product_id, movement_type, quantity, movement_date, user_id, observation, business_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        payload.product_id,
        payload.movement_type,
        quantity,
        payload.movement_date || new Date(),
        userId,
        payload.observation || movementLabels[payload.movement_type],
        businessId,
      ]
    );

    return movementResult.rows[0];
  });

export const getAlerts = async (businessId) => {
  const [recipesResult, inactiveResult] = await Promise.all([
    pool.query(
      `SELECT p.id AS product_id, p.name AS recipe_name
       FROM recipes r
       JOIN products p ON p.id = r.product_id
       WHERE p.status = 'active' AND r.business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT p.id, p.name
       FROM products p
       LEFT JOIN inventory_movements im ON im.product_id = p.id AND im.business_id = $1
       WHERE p.status = 'active' AND p.business_id = $1
       GROUP BY p.id
       HAVING MAX(im.movement_date) IS NULL
       ORDER BY p.name`,
      [businessId]
    ),
  ]);

  const insufficientIngredients = [];

  for (const recipe of recipesResult.rows) {
    const items = await pool.query(
      `SELECT ri.quantity, i.name AS ingredient_name
       FROM recipe_items ri
       JOIN products i ON i.id = ri.ingredient_product_id
       WHERE ri.recipe_id = (
         SELECT id FROM recipes WHERE product_id = $1 AND business_id = $2
       )`,
      [recipe.product_id, businessId]
    );

    // Sin campos de stock, retornamos lista vacía o información parcial
    if (items.rows.length) {
      insufficientIngredients.push({
        recipe: recipe.recipe_name,
        missing: items.rows,
      });
    }
  }

  return {
    lowStock: [],
    insufficientIngredients,
    productsWithoutMovement: inactiveResult.rows,
  };
};
