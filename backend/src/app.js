import cors from "cors";
import express from "express";
import accountingRoutes from "./routes/accounting-routes.js";
import authRoutes from "./routes/auth-routes.js";
import catalogRoutes from "./routes/catalog-routes.js";
import dashboardRoutes from "./routes/dashboard-routes.js";
import inventoryRoutes from "./routes/inventory-routes.js";
import productRoutes from "./routes/product-routes.js";
import purchaseRoutes from "./routes/purchase-routes.js";
import recipeRoutes from "./routes/recipe-routes.js";
import reportRoutes from "./routes/report-routes.js";
import saleRoutes from "./routes/sale-routes.js";
import exportRoutes from "./routes/export-routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl.split(",").map(url => url.trim()),
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/export", exportRoutes);

app.use(errorHandler);

export default app;
