import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createRecipe, listRecipes, updateRecipe } from "../services/recipe-service.js";
import { ensureArray, positiveNumber, required } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await listRecipes(req.user.businessId));
  })
);

router.post(
  "/",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.product_id, "product_id");
    required(req.body.name, "name");
    ensureArray(req.body.items, "items");
    req.body.items.forEach((item) => {
      required(item.ingredient_product_id, "ingredient_product_id");
      positiveNumber(item.quantity, "quantity");
    });
    res.status(201).json(await createRecipe(req.body, req.user.businessId));
  })
);

router.put(
  "/:id",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.name, "name");
    ensureArray(req.body.items, "items");
    res.json(await updateRecipe(req.params.id, req.body, req.user.businessId));
  })
);

export default router;
