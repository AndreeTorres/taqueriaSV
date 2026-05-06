import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { exportSales, exportProducts, exportInventory, exportPurchases, exportAll } from "../services/export-service.js";

const router = Router();

router.use(authenticate);
router.use(authorize("administrador"));

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const format = req.query.format || "csv";
    const data = await exportSales(req.user.businessId, format);
    const filename = `ventas_${new Date().toISOString().split("T")[0]}.${format}`;
    
    res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  })
);

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const format = req.query.format || "csv";
    const data = await exportProducts(req.user.businessId, format);
    const filename = `productos_${new Date().toISOString().split("T")[0]}.${format}`;
    
    res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  })
);

router.get(
  "/inventory",
  asyncHandler(async (req, res) => {
    const format = req.query.format || "csv";
    const data = await exportInventory(req.user.businessId, format);
    const filename = `inventario_${new Date().toISOString().split("T")[0]}.${format}`;
    
    res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  })
);

router.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    const format = req.query.format || "csv";
    const data = await exportPurchases(req.user.businessId, format);
    const filename = `compras_${new Date().toISOString().split("T")[0]}.${format}`;
    
    res.setHeader("Content-Type", format === "json" ? "application/json" : "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  })
);

router.get(
  "/all",
  asyncHandler(async (req, res) => {
    const format = req.query.format || "json";
    const data = await exportAll(req.user.businessId, format);
    const filename = `respaldo_completo_${new Date().toISOString().split("T")[0]}.${format === "json" ? "json" : "json"}`;
    
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(data);
  })
);

export default router;
