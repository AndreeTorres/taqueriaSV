import { pool } from "../config/db.js";

const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return headers.join(",");
  
  const rows = [headers];
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(values.join(","));
  });
  return rows.join("\n");
};

const convertToJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

export const exportSales = async (businessId, format = "csv") => {
  const result = await pool.query(
    `SELECT s.id, s.client_name, s.total, s.payment_method, s.order_type, s.status, s.sale_date, u.name AS user_name
     FROM sales s
     JOIN users u ON u.id = s.user_id
     WHERE s.business_id = $1
     ORDER BY s.sale_date DESC`,
    [businessId]
  );

  const headers = ["id", "client_name", "total", "payment_method", "order_type", "status", "sale_date", "user_name"];
  
  if (format === "json") {
    return convertToJSON(result.rows);
  }
  return convertToCSV(result.rows, headers);
};

export const exportProducts = async (businessId, format = "csv") => {
  const result = await pool.query(
    `SELECT p.id, p.name, c.name AS category, p.product_type, p.unit_measure, p.purchase_price, p.sale_price, p.status
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.business_id = $1
     ORDER BY p.id DESC`,
    [businessId]
  );

  const headers = ["id", "name", "category", "product_type", "unit_measure", "purchase_price", "sale_price", "status"];
  
  if (format === "json") {
    return convertToJSON(result.rows);
  }
  return convertToCSV(result.rows, headers);
};

export const exportInventory = async (businessId, format = "csv") => {
  const result = await pool.query(
    `SELECT im.id, p.name AS product_name, im.movement_type, im.quantity, im.movement_date, u.name AS user_name, im.observation
     FROM inventory_movements im
     JOIN products p ON p.id = im.product_id
     JOIN users u ON u.id = im.user_id
     WHERE im.business_id = $1
     ORDER BY im.movement_date DESC`,
    [businessId]
  );

  const headers = ["id", "product_name", "movement_type", "quantity", "movement_date", "user_name", "observation"];
  
  if (format === "json") {
    return convertToJSON(result.rows);
  }
  return convertToCSV(result.rows, headers);
};

export const exportPurchases = async (businessId, format = "csv") => {
  const result = await pool.query(
    `SELECT p.id, s.name AS supplier_name, p.total, p.purchase_date, u.name AS user_name
     FROM purchases p
     JOIN suppliers s ON s.id = p.supplier_id
     JOIN users u ON u.id = p.user_id
     WHERE p.business_id = $1
     ORDER BY p.purchase_date DESC`,
    [businessId]
  );

  const headers = ["id", "supplier_name", "total", "purchase_date", "user_name"];
  
  if (format === "json") {
    return convertToJSON(result.rows);
  }
  return convertToCSV(result.rows, headers);
};

export const exportAll = async (businessId, format = "csv") => {
  const [salesResult, productsResult, inventoryResult, purchasesResult] = await Promise.all([
    pool.query(
      `SELECT s.id, s.client_name, s.total, s.payment_method, s.order_type, s.status, s.sale_date, u.name AS user_name
       FROM sales s
       JOIN users u ON u.id = s.user_id
       WHERE s.business_id = $1
       ORDER BY s.sale_date DESC`,
      [businessId]
    ),
    pool.query(
      `SELECT p.id, p.name, c.name AS category, p.product_type, p.unit_measure, p.purchase_price, p.sale_price, p.status
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.business_id = $1
       ORDER BY p.id DESC`,
      [businessId]
    ),
    pool.query(
      `SELECT im.id, p.name AS product_name, im.movement_type, im.quantity, im.movement_date, u.name AS user_name, im.observation
       FROM inventory_movements im
       JOIN products p ON p.id = im.product_id
       JOIN users u ON u.id = im.user_id
       WHERE im.business_id = $1
       ORDER BY im.movement_date DESC`,
      [businessId]
    ),
    pool.query(
      `SELECT p.id, s.name AS supplier_name, p.total, p.purchase_date, u.name AS user_name
       FROM purchases p
       JOIN suppliers s ON s.id = p.supplier_id
       JOIN users u ON u.id = p.user_id
       WHERE p.business_id = $1
       ORDER BY p.purchase_date DESC`,
      [businessId]
    ),
  ]);

  if (format === "json") {
    const allData = {
      exportDate: new Date().toISOString(),
      sales: salesResult.rows,
      products: productsResult.rows,
      inventory: inventoryResult.rows,
      purchases: purchasesResult.rows,
    };
    return JSON.stringify(allData, null, 2);
  }

  // Para CSV, combinamos todo en un formato legible
  let csvContent = `RESPALDO COMPLETO - ${new Date().toISOString()}\n\n`;

  // Ventas
  csvContent += "=== VENTAS ===\n";
  const salesHeaders = ["id", "client_name", "total", "payment_method", "order_type", "status", "sale_date", "user_name"];
  csvContent += convertToCSV(salesResult.rows, salesHeaders) + "\n\n";

  // Productos
  csvContent += "=== PRODUCTOS ===\n";
  const productsHeaders = ["id", "name", "category", "product_type", "unit_measure", "purchase_price", "sale_price", "status"];
  csvContent += convertToCSV(productsResult.rows, productsHeaders) + "\n\n";

  // Inventario
  csvContent += "=== INVENTARIO ===\n";
  const inventoryHeaders = ["id", "product_name", "movement_type", "quantity", "movement_date", "user_name", "observation"];
  csvContent += convertToCSV(inventoryResult.rows, inventoryHeaders) + "\n\n";

  // Compras
  csvContent += "=== COMPRAS ===\n";
  const purchasesHeaders = ["id", "supplier_name", "total", "purchase_date", "user_name"];
  csvContent += convertToCSV(purchasesResult.rows, purchasesHeaders);

  return csvContent;
};
