import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createPurchase, listPurchases } from "../services/purchase-service.js";
import { ensureArray, positiveNumber, required } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (_req, res) => {
    res.json(await listPurchases());
  })
);

router.post(
  "/",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.supplier_id, "supplier_id");
    ensureArray(req.body.items, "items");
    req.body.items.forEach((item) => {
      required(item.product_id, "product_id");
      positiveNumber(item.quantity, "quantity");
      positiveNumber(item.unit_price, "unit_price");
    });
    res.status(201).json(await createPurchase(req.body, req.user.id));
  })
);

export default router;
