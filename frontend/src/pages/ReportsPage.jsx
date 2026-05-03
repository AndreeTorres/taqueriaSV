import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { currency, date, dateTime } from "../utils/format";

export const ReportsPage = () => {
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [stock, setStock] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState({ totalSales: 0, totalPurchases: 0, estimatedProfit: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const params = new URLSearchParams(
    Object.entries(range).filter(([, value]) => value)
  ).toString();

  const loadData = async () => {
    const [
      stockData,
      lowStockData,
      purchasesData,
      salesData,
      profitData,
      topProductsData,
      movementsData,
    ] = await Promise.all([
      api.get("/reports/stock"),
      api.get("/reports/low-stock"),
      api.get(`/reports/purchases${params ? `?${params}` : ""}`),
      api.get(`/reports/sales${params ? `?${params}` : ""}`),
      api.get(`/reports/profit${params ? `?${params}` : ""}`),
      api.get(`/reports/top-products${params ? `?${params}` : ""}`),
      api.get(`/reports/movements${params ? `?${params}` : ""}`),
    ]);

    setStock(stockData);
    setLowStock(lowStockData);
    setPurchases(purchasesData);
    setSales(salesData);
    setProfit(profitData);
    setTopProducts(topProductsData);
    setMovements(movementsData);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  return (
    <div className="page">
      <PageHeader title="Reportes" subtitle="Indicadores operativos y financieros basicos" />

      <SectionCard title="Filtro por fecha">
        <div className="inline-grid">
          <input type="date" value={range.startDate} onChange={(e) => setRange({ ...range, startDate: e.target.value })} />
          <input type="date" value={range.endDate} onChange={(e) => setRange({ ...range, endDate: e.target.value })} />
          <button type="button" onClick={() => loadData().catch(console.error)}>
            Aplicar filtro
          </button>
        </div>
      </SectionCard>

      <div className="stats-grid">
        <StatCard label="Ventas" value={currency(profit.totalSales)} accent="success" />
        <StatCard label="Compras" value={currency(profit.totalPurchases)} accent="warning" />
        <StatCard label="Ganancia estimada" value={currency(profit.estimatedProfit)} />
        <StatCard label="Bajo stock" value={lowStock.length} accent="danger" />
      </div>

      <div className="two-column">
        <SectionCard title="Stock actual">
          <Table
            columns={[
              { key: "name", label: "Producto" },
              { key: "category_name", label: "Categoria" },
              { key: "stock_current", label: "Stock" },
              { key: "stock_minimum", label: "Minimo" },
            ]}
            rows={stock}
          />
        </SectionCard>

        <SectionCard title="Productos mas vendidos">
          <Table
            columns={[
              { key: "name", label: "Producto" },
              { key: "quantity_sold", label: "Cantidad" },
              { key: "total_sales", label: "Ventas", render: (row) => currency(row.total_sales) },
            ]}
            rows={topProducts}
          />
        </SectionCard>
      </div>

      <div className="two-column">
        <SectionCard title="Compras por fecha">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "purchase_date", label: "Fecha", render: (row) => date(row.purchase_date) },
              { key: "total", label: "Total", render: (row) => currency(row.total) },
            ]}
            rows={purchases}
          />
        </SectionCard>

        <SectionCard title="Ventas por fecha">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "sale_date", label: "Fecha", render: (row) => date(row.sale_date) },
              { key: "payment_method", label: "Pago" },
              { key: "total", label: "Total", render: (row) => currency(row.total) },
            ]}
            rows={sales}
          />
        </SectionCard>
      </div>

      <SectionCard title="Movimientos de inventario">
        <Table
          columns={[
            { key: "product_name", label: "Producto" },
            { key: "movement_type", label: "Tipo" },
            { key: "quantity", label: "Cantidad" },
            { key: "user_name", label: "Usuario" },
            { key: "movement_date", label: "Fecha", render: (row) => date(row.movement_date) },
          ]}
          rows={movements}
        />
      </SectionCard>
    </div>
  );
};
