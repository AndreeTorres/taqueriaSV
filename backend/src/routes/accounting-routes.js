import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getAccountingSummary, createGasto, listGastos, updateGasto, deleteGasto } from "../services/accounting-service.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("administrador"),
  asyncHandler(async (req, res) => {
    const period = req.query.period === "week" ? "week" : "month";
    res.json(await getAccountingSummary({ period }));
  })
);

router.get(
  "/gastos",
  authenticate,
  authorize("administrador"),
  asyncHandler(async (_req, res) => {
    res.json(await listGastos());
  })
);

router.post(
  "/gastos",
  authenticate,
  authorize("administrador"),
  asyncHandler(async (req, res) => {
    const { description, amount, date, type = 'operativo' } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ message: "Descripción y monto son requeridos." });
    }
    // Validate type
    if (!['operativo', 'ingredientes'].includes(type)) {
      return res.status(400).json({ message: "Tipo debe ser 'operativo' o 'ingredientes'." });
    }
    const gasto = await createGasto({ description, amount: Number(amount), date, type }, req.user.id);
    res.status(201).json(gasto);
  })
);

router.patch(
  "/gastos/:id",
  authenticate,
  authorize("administrador"),
  asyncHandler(async (req, res) => {
    const { description, amount, date, type = 'operativo' } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ message: "Descripción y monto son requeridos." });
    }
    if (!['operativo', 'ingredientes'].includes(type)) {
      return res.status(400).json({ message: "Tipo debe ser 'operativo' o 'ingredientes'." });
    }
    const gasto = await updateGasto({ description, amount: Number(amount), date, type }, req.params.id);
    res.json(gasto);
  })
);

router.delete(
  "/gastos/:id",
  authenticate,
  authorize("administrador"),
  asyncHandler(async (req, res) => {
    await deleteGasto(req.params.id);
    res.json({ success: true });
  })
);

export default router;
