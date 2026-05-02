import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createProduct, listProducts, updateProduct, deleteProduct } from "../services/product-service.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      category_id: req.query.category_id,
      product_type: req.query.product_type,
      status: req.query.status,
      low_stock: req.query.low_stock,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    };
    res.json(await listProducts(filters));
  })
);

router.post(
  "/",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    res.status(201).json(await createProduct(req.body));
  })
);

router.put(
  "/:id",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    res.json(await updateProduct(Number(req.params.id), req.body));
  })
);

router.patch(
  "/:id",
  authorize("administrador", "taquero"),
  asyncHandler(async (req, res) => {
    res.json(await updateProduct(Number(req.params.id), req.body));
  })
);

router.delete(
  "/:id",
  authorize("administrador"),
  asyncHandler(async (req, res) => {
    res.json(await deleteProduct(Number(req.params.id)));
  })
);

export default router;
