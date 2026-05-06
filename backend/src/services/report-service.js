import { pool } from "../config/db.js";

const buildDateRange = (column, startDate, endDate, startIndex = 1) => {
  if (!startDate && !endDate) return { clause: "", values: [] };

  const values = [];
  let clause = " AND ";
  let idx = startIndex;

  if (startDate) {
    values.push(startDate);
    // Comparar la fecha sin zona horaria - tratar como fecha local
    clause += `DATE(${column}) >= $${idx++}::date`;
  }

  if (endDate) {
    values.push(endDate);
    if (startDate) {
      clause += ` AND `;
    }
    // Comparar la fecha sin zona horaria - tratar como fecha local
    clause += `DATE(${column}) <= $${idx++}::date`;
  }

  return { clause, values };
};

export const getStockReport = async () => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.unit_measure, p.sale_price, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'active'
     ORDER BY p.name`
  );
  return result.rows;
};

export const getLowStockReport = async () => {
  // Como ya no tenemos stock_current y stock_minimum, retornamos un array vacío
  // o podemos mostrar todos los productos activos
  const result = await pool.query(
    `SELECT id, name, unit_measure, sale_price
     FROM products
     WHERE status = 'active'
     ORDER BY name`
  );
  return result.rows;
};

export const getPurchasesByDate = async (startDate, endDate) => {
  const range = buildDateRange("purchase_date", startDate, endDate, 1);
  const result = await pool.query(
    `SELECT * FROM purchases WHERE 1=1${range.clause} ORDER BY purchase_date DESC`,
    range.values
  );
  return result.rows;
};

export const getSalesByDate = async (startDate, endDate) => {
  const range = buildDateRange("sale_date", startDate, endDate, 1);
  const query = `SELECT * FROM sales WHERE 1=1${range.clause} ORDER BY sale_date DESC`;
  const result = await pool.query(query, range.values);
  return result.rows;
};

export const getProfitSummary = async (startDate, endDate) => {
  const salesRange = buildDateRange("s.sale_date", startDate, endDate, 1);
  const purchasesRange = buildDateRange("p.purchase_date", startDate, endDate, 1);

  const [salesResult, purchasesResult] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_sales FROM sales s WHERE 1=1${salesRange.clause}`,
      salesRange.values
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_purchases FROM purchases p WHERE 1=1${purchasesRange.clause}`,
      purchasesRange.values
    ),
  ]);

  const totalSales = Number(salesResult.rows[0].total_sales);
  const totalPurchases = Number(purchasesResult.rows[0].total_purchases);

  return {
    totalSales,
    totalPurchases,
    estimatedProfit: totalSales - totalPurchases,
  };
};

export const getTopProducts = async (startDate, endDate) => {
  const range = buildDateRange("s.sale_date", startDate, endDate, 1);
  const result = await pool.query(
    `SELECT p.name, SUM(sd.quantity) AS quantity_sold, SUM(sd.total) AS total_sales
     FROM sale_details sd
     JOIN products p ON p.id = sd.product_id
     JOIN sales s ON s.id = sd.sale_id
     WHERE 1=1${range.clause}
     GROUP BY p.id, p.name
     ORDER BY quantity_sold DESC
     LIMIT 10`,
    range.values
  );
  return result.rows;
};

export const getMovementReport = async (startDate, endDate) => {
  const range = buildDateRange("im.movement_date", startDate, endDate, 1);
  const result = await pool.query(
    `SELECT im.*, p.name AS product_name, u.name AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     WHERE 1=1${range.clause}
     ORDER BY im.movement_date DESC`,
    range.values
  );
  return result.rows;
};
