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
  asyncHandler(async (_req, res) => {
    res.json(await getStockReport());
  })
);

router.get(
  "/low-stock",
  asyncHandler(async (_req, res) => {
    res.json(await getLowStockReport());
  })
);

router.get(
  "/purchases",
  asyncHandler(async (req, res) => {
    res.json(await getPurchasesByDate(req.query.startDate, req.query.endDate));
  })
);

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    res.json(await getSalesByDate(req.query.startDate, req.query.endDate));
  })
);

router.get(
  "/profit",
  asyncHandler(async (req, res) => {
    res.json(await getProfitSummary(req.query.startDate, req.query.endDate));
  })
);

router.get(
  "/top-products",
  asyncHandler(async (_req, res) => {
    res.json(await getTopProducts());
  })
);

router.get(
  "/movements",
  asyncHandler(async (_req, res) => {
    res.json(await getMovementReport());
  })
);

export default router;
