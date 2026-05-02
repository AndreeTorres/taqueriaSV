import { pool } from "../config/db.js";

const buildDateRange = (column, startDate, endDate) => {
  if (!startDate && !endDate) return { clause: "", values: [] };

  const values = [];
  let clause = " WHERE ";

  if (startDate) {
    values.push(startDate);
    clause += `${column} >= $${values.length}`;
  }

  if (endDate) {
    values.push(endDate);
    clause += `${startDate ? " AND " : ""}${column} <= $${values.length}`;
  }

  return { clause, values };
};

export const getStockReport = async () => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.unit_measure, p.stock_current, p.stock_minimum, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'active'
     ORDER BY p.name`
  );
  return result.rows;
};

export const getLowStockReport = async () => {
  const result = await pool.query(
    `SELECT id, name, stock_current, stock_minimum, unit_measure
     FROM products
     WHERE status = 'active' AND stock_current <= stock_minimum
     ORDER BY stock_current ASC`
  );
  return result.rows;
};

export const getPurchasesByDate = async (startDate, endDate) => {
  const range = buildDateRange("purchase_date", startDate, endDate);
  const result = await pool.query(
    `SELECT * FROM purchases ${range.clause} ORDER BY purchase_date DESC`,
    range.values
  );
  return result.rows;
};

export const getSalesByDate = async (startDate, endDate) => {
  const range = buildDateRange("sale_date", startDate, endDate);
  const result = await pool.query(`SELECT * FROM sales ${range.clause} ORDER BY sale_date DESC`, range.values);
  return result.rows;
};

export const getProfitSummary = async (startDate, endDate) => {
  const salesRange = buildDateRange("s.sale_date", startDate, endDate);
  const purchasesRange = buildDateRange("purchase_date", startDate, endDate);

  const [sales, purchases] = await Promise.all([
    pool.query(`SELECT COALESCE(SUM(total), 0) AS total_sales FROM sales s ${salesRange.clause}`, salesRange.values),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_purchases FROM purchases ${purchasesRange.clause}`,
      purchasesRange.values
    ),
  ]);

  const totalSales = Number(sales.rows[0].total_sales);
  const totalPurchases = Number(purchases.rows[0].total_purchases);

  return {
    totalSales,
    totalPurchases,
    estimatedProfit: totalSales - totalPurchases,
  };
};

export const getTopProducts = async () => {
  const result = await pool.query(
    `SELECT p.name, SUM(sd.quantity) AS quantity_sold, SUM(sd.total) AS total_sales
     FROM sale_details sd
     JOIN products p ON p.id = sd.product_id
     GROUP BY p.id
     ORDER BY quantity_sold DESC
     LIMIT 10`
  );
  return result.rows;
};

export const getMovementReport = async () => {
  const result = await pool.query(
    `SELECT im.*, p.name AS product_name, u.name AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     ORDER BY im.movement_date DESC`
  );
  return result.rows;
};
