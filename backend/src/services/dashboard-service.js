import { pool } from "../config/db.js";

export const getDashboardSummary = async (businessId) => {
  try {
    // Primero, diagnóstico: ver qué fechas hay en la BD
    const diagQuery = await pool.query(
      `SELECT 
        MAX(sale_date) as ultima_venta,
        MIN(sale_date) as primera_venta,
        CURRENT_DATE,
        CURRENT_DATE AT TIME ZONE 'America/El_Salvador' as fecha_hoy_sv,
        (SELECT COUNT(*) FROM sales WHERE sale_date::date = CURRENT_DATE AND business_id = $1) as ventas_hoy_simple,
        (SELECT COUNT(*) FROM sales WHERE DATE(sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/El_Salvador') = CURRENT_DATE AT TIME ZONE 'America/El_Salvador' AND business_id = $1) as ventas_hoy_tz
       FROM sales
       WHERE business_id = $1`,
      [businessId]
    );
    
    console.log("Diagnostic:", diagQuery.rows[0]);

    const [sales, purchases, totalProducts, lastMovements, salesMonth, purchasesMonth, pendingOrders] = await Promise.all([
      // Ventas de hoy - intentar con conversión simple primero
      pool.query(
        `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
         FROM sales 
         WHERE sale_date::date = CURRENT_DATE::date AND business_id = $1`,
        [businessId]
      ),
      // Compras de hoy
      pool.query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM purchases 
         WHERE purchase_date::date = CURRENT_DATE::date AND business_id = $1`,
        [businessId]
      ),
      // Total de productos activos
      pool.query(
        `SELECT COUNT(*)::INT AS total FROM products WHERE status = 'active' AND business_id = $1`,
        [businessId]
      ),
      // Últimos movimientos de inventario
      pool.query(
        `SELECT im.id, im.movement_type, im.quantity, im.movement_date, p.name AS product_name
         FROM inventory_movements im
         JOIN products p ON p.id = im.product_id
         WHERE im.business_id = $1
         ORDER BY im.movement_date DESC, im.id DESC LIMIT 8`,
        [businessId]
      ),
      // Ventas del mes actual
      pool.query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM sales 
         WHERE DATE_TRUNC('month', sale_date::date::timestamp) = DATE_TRUNC('month', CURRENT_DATE::timestamp) AND business_id = $1`,
        [businessId]
      ),
      // Compras del mes actual
      pool.query(
        `SELECT COALESCE(SUM(total), 0) AS total
         FROM purchases 
         WHERE DATE_TRUNC('month', purchase_date::date::timestamp) = DATE_TRUNC('month', CURRENT_DATE::timestamp) AND business_id = $1`,
        [businessId]
      ),
      // Pedidos activos (no entregados)
      pool.query(
        `SELECT COUNT(*)::INT AS total FROM sales
         WHERE delivered = false AND business_id = $1`,
        [businessId]
      ),
    ]);

    const ingresosHoy = Number(sales.rows[0]?.total || 0);
    const egresosHoy = Number(purchases.rows[0]?.total || 0);
    const countToday = sales.rows[0]?.count || 0;
    const ingresosmes = Number(salesMonth.rows[0]?.total || 0);
    const egresosmes = Number(purchasesMonth.rows[0]?.total || 0);
    const totalProductsCount = totalProducts.rows[0]?.total || 0;
    const pendingCount = pendingOrders.rows[0]?.total || 0;

    console.log("Dashboard data:", {
      ingresosHoy,
      egresosHoy,
      countToday,
      ingresosmes,
      egresosmes,
      pendingCount,
    });

    return {
      salesToday: ingresosHoy,
      purchasesToday: egresosHoy,
      salesTodayCount: countToday,
      totalProducts: totalProductsCount,
      latestMovements: lastMovements.rows || [],
      ingresosmes,
      egresosmes,
      gananciasMes: ingresosmes - egresosmes,
      margenMes: ingresosmes > 0 ? Number(((ingresosmes - egresosmes) / ingresosmes * 100).toFixed(1)) : 0,
      pendingOrdersCount: pendingCount,
    };
  } catch (error) {
    console.error("Error in getDashboardSummary:", error);
    throw error;
  }
};
