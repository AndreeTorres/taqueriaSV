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
    res.json(await getPurchasesByDate(req.query.startDate, req.query.endDate, req.user.businessId));
  })
);

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    res.json(await getSalesByDate(req.query.startDate, req.query.endDate, req.user.businessId));
  })
);

router.get(
  "/profit",
  asyncHandler(async (req, res) => {
    res.json(await getProfitSummary(req.query.startDate, req.query.endDate, req.user.businessId));
  })
);

router.get(
  "/top-products",
  asyncHandler(async (req, res) => {
    res.json(await getTopProducts(req.user.businessId));
  })
);

router.get(
  "/movements",
  asyncHandler(async (req, res) => {
    res.json(await getMovementReport(req.user.businessId));
  })
);

export default router;
