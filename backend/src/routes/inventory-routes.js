import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createManualMovement, getAlerts, listMovements } from "../services/inventory-service.js";
import { positiveNumber, required } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get(
  "/movements",
  asyncHandler(async (req, res) => {
    res.json(await listMovements(req.user.businessId));
  })
);

router.get(
  "/alerts",
  asyncHandler(async (req, res) => {
    res.json(await getAlerts(req.user.businessId));
  })
);

router.post(
  "/movements",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.product_id, "product_id");
    required(req.body.movement_type, "movement_type");
    positiveNumber(req.body.quantity, "quantity");
    res.status(201).json(await createManualMovement(req.body, req.user.id, req.user.businessId));
  })
);

export default router;
