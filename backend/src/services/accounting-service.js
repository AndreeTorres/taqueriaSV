import { pool } from "../config/db.js";

export const getAccountingSummary = async ({ period = "month" } = {}) => {
  const interval = period === "week" ? "7 days" : "30 days";

  const [ingresosMes, egresosMes, ingresosAyer, egresosAyer, dailyData, topProducts, paymentBreakdown] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
       FROM sales
       WHERE sale_date >= NOW() - INTERVAL '${interval}'`
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*)::INT AS count
       FROM purchases
       WHERE purchase_date >= NOW() - INTERVAL '${interval}' AND (supplier_id IS NOT NULL OR description IS NOT NULL)`
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM sales
       WHERE DATE(sale_date) = CURRENT_DATE - 1`
    ),
    pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM purchases
       WHERE DATE(purchase_date) = CURRENT_DATE - 1 AND (supplier_id IS NOT NULL OR description IS NOT NULL)`
    ),
    pool.query(
      `SELECT
         TO_CHAR(gs.day, 'DD/MM') AS day,
         COALESCE(s.total, 0) AS ingresos,
         COALESCE(p.total, 0) AS egresos,
         COALESCE(s.total, 0) - COALESCE(p.total, 0) AS ganancia
       FROM generate_series(
         (NOW() - INTERVAL '${interval}')::date,
         CURRENT_DATE,
         '1 day'::interval
       ) AS gs(day)
       LEFT JOIN (
         SELECT DATE(sale_date) AS d, SUM(total) AS total
         FROM sales GROUP BY DATE(sale_date)
       ) s ON s.d = gs.day::date
       LEFT JOIN (
         SELECT DATE(purchase_date) AS d, SUM(total) AS total
         FROM purchases 
         WHERE supplier_id IS NOT NULL OR description IS NOT NULL
         GROUP BY DATE(purchase_date)
       ) p ON p.d = gs.day::date
       ORDER BY gs.day`
    ),
    pool.query(
      `SELECT p.name AS product_name, SUM(sd.quantity) AS units_sold, SUM(sd.total) AS total
       FROM sale_details sd
       JOIN products p ON p.id = sd.product_id
       JOIN sales s ON s.id = sd.sale_id
       WHERE s.sale_date >= NOW() - INTERVAL '${interval}'
       GROUP BY p.id, p.name
       ORDER BY total DESC
       LIMIT 5`
    ),
    pool.query(
      `SELECT payment_method, COUNT(*)::INT AS count, SUM(total) AS total
       FROM sales
       WHERE sale_date >= NOW() - INTERVAL '${interval}'
       GROUP BY payment_method
       ORDER BY total DESC`
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

export const listGastos = async () => {
  const result = await pool.query(
    `SELECT id, description, total AS amount, purchase_date AS date, type, created_at
     FROM purchases
     WHERE description IS NOT NULL
     ORDER BY purchase_date DESC, id DESC
     LIMIT 100`
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

export const createGasto = async ({ description, amount, date, type = 'operativo' }, userId) => {
  const supplier = await pool.query(
    `SELECT id FROM suppliers WHERE name = 'Gastos Generales' LIMIT 1`
  );
  const supplierId = supplier.rows[0]?.id;
  if (!supplierId) throw new Error("Proveedor de gastos no configurado.");

  const result = await pool.query(
    `INSERT INTO purchases (supplier_id, purchase_date, total, user_id, description, type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, description, total AS amount, purchase_date AS date, type`,
    [supplierId, date || new Date(), amount, userId, description, type]
  );
  const r = result.rows[0];
  const gasto = { id: r.id, description: r.description, amount: Number(r.amount), date: r.date, type: r.type };
  
  // If type is 'ingredientes', create an inventory movement for tracking
  if (type === 'ingredientes') {
    try {
      await pool.query(
        `INSERT INTO inventory_movements (product_id, movement_type, quantity, movement_date, user_id, observation)
         VALUES ((SELECT id FROM products WHERE name = 'Gastos Ingredientes' LIMIT 1), 'gasto_ingrediente', $1, $2, $3, $4)`,
        [amount, new Date(), userId, `Gasto de ingredientes: ${description}`]
      );
    } catch (err) {
      // If product doesn't exist, just log the expense without inventory movement
      console.warn("Producto 'Gastos Ingredientes' no encontrado. Gasto registrado sin movimiento de inventario.");
    }
  }
  
  return gasto;
};

export const updateGasto = async ({ description, amount, date, type }, gastoId) => {
  const result = await pool.query(
    `UPDATE purchases 
     SET description = $1, total = $2, purchase_date = $3, type = $4
     WHERE id = $5 AND description IS NOT NULL
     RETURNING id, description, total AS amount, purchase_date AS date, type`,
    [description, amount, date || new Date(), type, gastoId]
  );
  if (result.rows.length === 0) throw new Error("Gasto no encontrado.");
  const r = result.rows[0];
  return { id: r.id, description: r.description, amount: Number(r.amount), date: r.date, type: r.type };
};

export const deleteGasto = async (gastoId) => {
  const result = await pool.query(
    `DELETE FROM purchases 
     WHERE id = $1 AND description IS NOT NULL
     RETURNING id`,
    [gastoId]
  );
  if (result.rows.length === 0) throw new Error("Gasto no encontrado.");
  return { success: true };
};
