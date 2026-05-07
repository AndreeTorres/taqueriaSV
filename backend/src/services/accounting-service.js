import { pool } from "../config/db.js";

export const getAccountingSummary = async ({ period = "month" } = {}, businessId) => {
  const daysBack = period === "week" ? 7 : 30;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);

  const [ingresosMes, egresosMes, ingresosAyer, egresosAyer, dailyData, topProducts, paymentBreakdown] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
       FROM sales
       WHERE sale_date >= $1 AND business_id = $2`,
      [pastDate, businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
       FROM purchases
       WHERE purchase_date >= $1
         AND (supplier_id IS NOT NULL OR description IS NOT NULL)
         AND business_id = $2`,
      [pastDate, businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM sales
       WHERE DATE(sale_date AT TIME ZONE 'America/El_Salvador') = (CURRENT_DATE AT TIME ZONE 'America/El_Salvador')::date - INTERVAL '1 day' AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM purchases
       WHERE DATE(purchase_date AT TIME ZONE 'America/El_Salvador') = (CURRENT_DATE AT TIME ZONE 'America/El_Salvador')::date - INTERVAL '1 day'
         AND (supplier_id IS NOT NULL OR description IS NOT NULL)
         AND business_id = $1`,
      [businessId]
    ),
    pool.query(
      `SELECT
         TO_CHAR(gs.day AT TIME ZONE 'America/El_Salvador', 'DD/MM') AS day,
         COALESCE(s.total, 0) AS ingresos,
         COALESCE(p.total, 0) AS egresos,
         COALESCE(s.total, 0) - COALESCE(p.total, 0) AS ganancia
       FROM generate_series(
         $1::timestamp,
         CURRENT_TIMESTAMP,
         '1 day'::interval
       ) AS gs(day)
       LEFT JOIN (
         SELECT DATE(sale_date AT TIME ZONE 'America/El_Salvador') AS d, SUM(total) AS total
         FROM sales WHERE business_id = $2 GROUP BY DATE(sale_date AT TIME ZONE 'America/El_Salvador')
       ) s ON s.d = DATE(gs.day AT TIME ZONE 'America/El_Salvador')
       LEFT JOIN (
         SELECT DATE(purchase_date AT TIME ZONE 'America/El_Salvador') AS d, SUM(total) AS total
         FROM purchases
         WHERE (supplier_id IS NOT NULL OR description IS NOT NULL) AND business_id = $2
         GROUP BY DATE(purchase_date AT TIME ZONE 'America/El_Salvador')
       ) p ON p.d = DATE(gs.day AT TIME ZONE 'America/El_Salvador')
       ORDER BY gs.day`,
      [pastDate, businessId]
    ),
    pool.query(
      `SELECT p.name AS product_name, SUM(sd.quantity) AS units_sold, SUM(sd.total) AS total
       FROM sale_details sd
       JOIN products p ON p.id = sd.product_id
       JOIN sales s ON s.id = sd.sale_id
       WHERE s.sale_date >= $1 AND s.business_id = $2
       GROUP BY p.id, p.name
       ORDER BY total DESC
       LIMIT 5`,
      [pastDate, businessId]
    ),
    pool.query(
      `SELECT payment_method, COUNT(*)::INT AS count, SUM(total) AS total
       FROM sales
       WHERE sale_date >= $1 AND business_id = $2
       GROUP BY payment_method
       ORDER BY total DESC`,
      [pastDate, businessId]
    ),
  ]);

  const ingresos = Number(ingresosMes.rows[0].total);
  const egresos = Number(egresosMes.rows[0].total);
  const ganancia = ingresos - egresos;
  const margen = ingresos > 0 ? ((ganancia / ingresos) * 100).toFixed(1) : "0.0";

  const ingresosAyerVal = Number(ingresosAyer.rows[0].total);
  const egresosAyerVal = Number(egresosAyer.rows[0].total);

  return {
    period,
    ingresos,
    egresos,
    ganancia,
    margen: Number(margen),
    salesCount: ingresosMes.rows[0].count,
    purchasesCount: egresosMes.rows[0].count,
    ingresosAyer: ingresosAyerVal,
    egresosAyer: egresosAyerVal,
    gananciAyer: ingresosAyerVal - egresosAyerVal,
    dailyData: dailyData.rows.map((r) => ({
      day: r.day,
      ingresos: Number(r.ingresos),
      egresos: Number(r.egresos),
      ganancia: Number(r.ganancia),
    })),
    topProducts: topProducts.rows.map((r) => ({
      product_name: r.product_name,
      units_sold: Number(r.units_sold),
      total: Number(r.total),
    })),
    paymentBreakdown: paymentBreakdown.rows.map((r) => ({
      payment_method: r.payment_method,
      count: r.count,
      total: Number(r.total),
    })),
  };
};

export const listGastos = async (businessId) => {
  const result = await pool.query(
    `SELECT id, description, total AS amount, purchase_date AS date, type, created_at
     FROM purchases
     WHERE description IS NOT NULL AND business_id = $1
     ORDER BY purchase_date DESC, id DESC
     LIMIT 100`,
    [businessId]
  );
  return result.rows.map((r) => ({
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    date: r.date,
    type: r.type || 'operativo',
    created_at: r.created_at,
  }));
};

export const createGasto = async ({ description, amount, date, type = 'operativo' }, userId, businessId) => {
  const supplier = await pool.query(
    `SELECT id FROM suppliers WHERE name = 'Gastos Generales' AND business_id = $1 LIMIT 1`,
    [businessId]
  );
  const supplierId = supplier.rows[0]?.id;
  if (!supplierId) throw new Error("Proveedor de gastos no configurado.");

  const result = await pool.query(
    `INSERT INTO purchases (supplier_id, purchase_date, total, user_id, description, type, business_id)
     VALUES ($1, $2::date, $3, $4, $5, $6, $7)
     RETURNING id, description, total AS amount, purchase_date::date AS date, type`,
    [supplierId, date || new Date().toISOString().split('T')[0], amount, userId, description, type, businessId]
  );
  const r = result.rows[0];
  return { id: r.id, description: r.description, amount: Number(r.amount), date: r.date, type: r.type };
};

export const updateGasto = async ({ description, amount, date, type }, gastoId, businessId) => {
  const result = await pool.query(
    `UPDATE purchases
     SET description = $1, total = $2, purchase_date = $3::date, type = $4
     WHERE id = $5 AND description IS NOT NULL AND business_id = $6
     RETURNING id, description, total AS amount, purchase_date::date AS date, type`,
    [description, amount, date || new Date().toISOString().split('T')[0], type, gastoId, businessId]
  );
  if (result.rows.length === 0) throw new Error("Gasto no encontrado.");
  const r = result.rows[0];
  return { id: r.id, description: r.description, amount: Number(r.amount), date: r.date, type: r.type };
};

export const deleteGasto = async (gastoId, businessId) => {
  const result = await pool.query(
    `DELETE FROM purchases
     WHERE id = $1 AND description IS NOT NULL AND business_id = $2
     RETURNING id`,
    [gastoId, businessId]
  );
  if (result.rows.length === 0) throw new Error("Gasto no encontrado.");
  return { success: true };
};
