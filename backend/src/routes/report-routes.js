import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  getLowStockReport,
  getMovementReport,
  getProfitSummary,
  getPurchasesByDate,
  getSalesByDate,
  getStockReport,
  getTopProducts,
} from "../services/report-service.js";

const router = Router();

router.use(authenticate, authorize("administrador", "encargado de inventario"));

router.get(
  "/stock",
  asyncHandler(async (req, res) => {
    res.json(await getStockReport(req.user.businessId));
  })
);

router.get(
  "/low-stock",
  asyncHandler(async (req, res) => {
    res.json(await getLowStockReport(req.user.businessId));
  })
);

router.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    res.json(await getPurchasesByDate(req.user.businessId, req.query.startDate, req.query.endDate));
  })
);

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const result = await getSalesByDate(req.user.businessId, req.query.startDate, req.query.endDate);
    res.json(result);
  })
);

router.get(
  "/profit",
  asyncHandler(async (req, res) => {
    const result = await getProfitSummary(req.user.businessId, req.query.startDate, req.query.endDate);
    res.json(result);
  })
);

router.get(
  "/top-products",
  asyncHandler(async (req, res) => {
    res.json(await getTopProducts(req.user.businessId, req.query.startDate, req.query.endDate));
  })
);

router.get(
  "/movements",
  asyncHandler(async (req, res) => {
    res.json(await getMovementReport(req.user.businessId, req.query.startDate, req.query.endDate));
  })
);

export default router;
