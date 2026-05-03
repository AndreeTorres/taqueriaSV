import { pool } from "../config/db.js";

const buildDateRange = (column, startDate, endDate, startIndex = 1) => {
  if (!startDate && !endDate) return { clause: "", values: [] };

  const values = [];
  let clause = " AND ";
  let idx = startIndex;

  if (startDate) {
    values.push(startDate);
    clause += `${column}::date >= $${idx++}`;
  }

  if (endDate) {
    // Incrementar un día para incluir todo el día final
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDateNextDay = nextDay.toISOString().split('T')[0];
    
    values.push(endDateNextDay);
    clause += `${startDate ? " AND " : ""}${column}::date < $${idx++}`;
  }

  return { clause, values };
};

export const getStockReport = async (businessId) => {
  const result = await pool.query(
    `SELECT p.id, p.name, p.unit_measure, p.stock_current, p.stock_minimum, c.name AS category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.status = 'active' AND p.business_id = $1
     ORDER BY p.name`,
    [businessId]
  );
  return result.rows;
};

export const getLowStockReport = async (businessId) => {
  const result = await pool.query(
    `SELECT id, name, stock_current, stock_minimum, unit_measure
     FROM products
     WHERE status = 'active' AND stock_current <= stock_minimum AND business_id = $1
     ORDER BY stock_current ASC`,
    [businessId]
  );
  return result.rows;
};

export const getPurchasesByDate = async (startDate, endDate, businessId) => {
  const range = buildDateRange("purchase_date", startDate, endDate, 2);
  const result = await pool.query(
    `SELECT * FROM purchases WHERE business_id = $1${range.clause} ORDER BY purchase_date DESC`,
    [businessId, ...range.values]
  );
  return result.rows;
};

export const getSalesByDate = async (startDate, endDate, businessId) => {
  const range = buildDateRange("sale_date", startDate, endDate, 2);
  const result = await pool.query(
    `SELECT * FROM sales WHERE business_id = $1${range.clause} ORDER BY sale_date DESC`,
    [businessId, ...range.values]
  );
  return result.rows;
};

export const getProfitSummary = async (startDate, endDate, businessId) => {
  const salesRange = buildDateRange("s.sale_date", startDate, endDate, 2);
  const purchasesRange = buildDateRange("purchase_date", startDate, endDate, 2);

  const [sales, purchases] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_sales FROM sales s WHERE s.business_id = $1${salesRange.clause}`,
      [businessId, ...salesRange.values]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_purchases FROM purchases WHERE business_id = $1${purchasesRange.clause}`,
      [businessId, ...purchasesRange.values]
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

export const getTopProducts = async (startDate, endDate, businessId) => {
  const range = buildDateRange("s.sale_date", startDate, endDate, 2);
  const result = await pool.query(
    `SELECT p.name, SUM(sd.quantity) AS quantity_sold, SUM(sd.total) AS total_sales
     FROM sale_details sd
     JOIN products p ON p.id = sd.product_id
     JOIN sales s ON s.id = sd.sale_id
     WHERE s.business_id = $1${range.clause}
     GROUP BY p.id
     ORDER BY quantity_sold DESC
     LIMIT 10`,
    [businessId, ...range.values]
  );
  return result.rows;
};

export const getMovementReport = async (startDate, endDate, businessId) => {
  const range = buildDateRange("im.movement_date", startDate, endDate, 2);
  const result = await pool.query(
    `SELECT im.*, p.name AS product_name, u.name AS user_name
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     WHERE im.business_id = $1${range.clause}
     ORDER BY im.movement_date DESC`,
    [businessId, ...range.values]
  );
  return result.rows;
};
