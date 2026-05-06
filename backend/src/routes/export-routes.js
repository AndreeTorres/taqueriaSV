import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(authenticate);

// Export endpoints will be implemented here
// Examples:
// - GET /api/export/sales
// - GET /api/export/products
// - GET /api/export/inventory
// - GET /api/export/purchases
// - GET /api/export/all

export default router;
