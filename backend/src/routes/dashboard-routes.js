import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getDashboardSummary } from "../services/dashboard-service.js";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(await getDashboardSummary(req.user.businessId));
  })
);

export default router;
