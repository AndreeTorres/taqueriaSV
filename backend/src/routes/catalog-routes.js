import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createCatalogItem, listCatalog, updateCatalogItem } from "../services/catalog-service.js";
import { required } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    res.json(await listCatalog("categories", req.user.businessId));
  })
);

router.post(
  "/categories",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.name, "name");
    res.status(201).json(await createCatalogItem("categories", req.body, req.user.businessId));
  })
);

router.put(
  "/categories/:id",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    res.json(await updateCatalogItem("categories", req.params.id, req.body, req.user.businessId));
  })
);

router.get(
  "/suppliers",
  asyncHandler(async (req, res) => {
    res.json(await listCatalog("suppliers", req.user.businessId));
  })
);

router.post(
  "/suppliers",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    required(req.body.name, "name");
    res.status(201).json(await createCatalogItem("suppliers", req.body, req.user.businessId));
  })
);

router.put(
  "/suppliers/:id",
  authorize("administrador", "encargado de inventario"),
  asyncHandler(async (req, res) => {
    res.json(await updateCatalogItem("suppliers", req.params.id, req.body, req.user.businessId));
  })
);

export default router;
