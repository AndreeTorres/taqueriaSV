import { pool, withTransaction } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

export const listRecipes = async (businessId) => {
  const recipes = await pool.query(
    `SELECT r.*, p.name AS product_name
     FROM recipes r
     JOIN products p ON p.id = r.product_id
     WHERE r.business_id = $1
     ORDER BY r.id DESC`,
    [businessId]
  );

  const fullRecipes = [];

  for (const recipe of recipes.rows) {
    const items = await pool.query(
      `SELECT ri.*, p.name AS ingredient_name, p.unit_measure
       FROM recipe_items ri
       JOIN products p ON p.id = ri.ingredient_product_id
       WHERE ri.recipe_id = $1`,
      [recipe.id]
    );

    fullRecipes.push({
      ...recipe,
      items: items.rows,
    });
  }

  return fullRecipes;
};

export const createRecipe = async (payload, businessId) =>
  withTransaction(async (client) => {
    const product = await client.query(
      "SELECT * FROM products WHERE id = $1 AND business_id = $2",
      [payload.product_id, businessId]
    );

    if (!product.rows[0]) {
      throw new AppError("Producto final no encontrado.", 404);
    }

    const existing = await client.query(
      "SELECT id FROM recipes WHERE product_id = $1 AND business_id = $2",
      [payload.product_id, businessId]
    );
    if (existing.rows[0]) {
      throw new AppError("Ese producto ya tiene una receta asociada.");
    }

    const recipeResult = await client.query(
      `INSERT INTO recipes (product_id, name, description, business_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [payload.product_id, payload.name, payload.description || null, businessId]
    );

    for (const item of payload.items) {
      await client.query(
        `INSERT INTO recipe_items (recipe_id, ingredient_product_id, quantity)
         VALUES ($1,$2,$3)`,
        [recipeResult.rows[0].id, item.ingredient_product_id, item.quantity]
      );
    }

    return recipeResult.rows[0];
  });

export const updateRecipe = async (id, payload, businessId) =>
  withTransaction(async (client) => {
    const recipe = await client.query(
      "SELECT * FROM recipes WHERE id = $1 AND business_id = $2",
      [id, businessId]
    );
    if (!recipe.rows[0]) {
      throw new AppError("Receta no encontrada.", 404);
    }

    const recipeResult = await client.query(
      `UPDATE recipes
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND business_id = $4
       RETURNING *`,
      [payload.name, payload.description || null, id, businessId]
    );

    await client.query("DELETE FROM recipe_items WHERE recipe_id = $1", [id]);

    for (const item of payload.items) {
      await client.query(
        `INSERT INTO recipe_items (recipe_id, ingredient_product_id, quantity)
         VALUES ($1,$2,$3)`,
        [id, item.ingredient_product_id, item.quantity]
      );
    }

    return recipeResult.rows[0];
  });
