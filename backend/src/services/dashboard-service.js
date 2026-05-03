import { pool } from "../config/db.js";

export const getDashboardSummary = async (businessId) => {
  const [sales, purchases, lowStock, totalProducts, lastMovements, salesMonth, purchasesMonth, pendingOrders] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
       FROM sales WHERE DATE(sale_date) = CURRENT_DATE AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM purchases WHERE DATE(purchase_date) = CURRENT_DATE AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT id, name, stock_current, stock_minimum
       FROM products
       WHERE status = 'active' AND stock_current <= stock_minimum AND business_id = $1
       ORDER BY stock_current ASC LIMIT 5`,
      [businessId]
    ),
    pool.query(
      `SELECT COUNT(*)::INT AS total FROM products WHERE status = 'active' AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT im.id, im.movement_type, im.quantity, im.movement_date, p.name AS product_name
       FROM inventory_movements im
       JOIN products p ON p.id = im.product_id
       WHERE im.business_id = $1
       ORDER BY im.movement_date DESC, im.id DESC LIMIT 8`,
      [businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM sales WHERE sale_date >= DATE_TRUNC('month', CURRENT_DATE) AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM purchases WHERE purchase_date >= DATE_TRUNC('month', CURRENT_DATE) AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT COUNT(*)::INT AS total FROM sales
       WHERE status IN ('pendiente', 'en_cocina') AND DATE(sale_date) = CURRENT_DATE AND business_id = $1`,
      [businessId]
    ),
  ]);

  const ingresosHoy = Number(sales.rows[0].total);
  const egresosHoy = Number(purchases.rows[0].total);
  const ingresosmes = Number(salesMonth.rows[0].total);
  const egresosmes = Number(purchasesMonth.rows[0].total);

  return {
    salesToday: ingresosHoy,
    purchasesToday: egresosHoy,
    salesTodayCount: sales.rows[0].count,
    lowStock: lowStock.rows,
    totalProducts: totalProducts.rows[0].total,
    latestMovements: lastMovements.rows,
    ingresosmes,
    egresosmes,
    gananciasMes: ingresosmes - egresosmes,
    margenMes: ingresosmes > 0 ? Number(((ingresosmes - egresosmes) / ingresosmes * 100).toFixed(1)) : 0,
    pendingOrdersCount: pendingOrders.rows[0].total,
  };
};
