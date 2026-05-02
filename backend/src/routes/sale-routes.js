import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createSale, getSaleWithDetails, listSales, updateSale } from "../services/sale-service.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    const filters = {
      client_name: req.query.client_name,
      payment_method: req.query.payment_method,
      order_type: req.query.order_type,
      status: req.query.status,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };
    res.json(await listSales(filters));
  })
);

router.post(
  "/",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createSale(req.body, req.user.id));
  })
);

router.get(
  "/:id",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    const sale = await getSaleWithDetails(Number(req.params.id));
    if (!sale) return res.status(404).json({ message: "Pedido no encontrado." });
    res.json(sale);
  })
);

router.patch(
  "/:id",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    res.json(await updateSale(Number(req.params.id), req.body));
  })
);

export default router;
