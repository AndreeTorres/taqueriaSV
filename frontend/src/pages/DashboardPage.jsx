import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { currency, dateTime } from "../utils/format";

export const DashboardPage = () => {
  const [data, setData] = useState({
    salesToday: 0,
    purchasesToday: 0,
    salesTodayCount: 0,
    totalProducts: 0,
    latestMovements: [],
    ingresosmes: 0,
    egresosmes: 0,
    gananciasMes: 0,
    margenMes: 0,
    pendingOrdersCount: 0,
  });

  useEffect(() => {
    api.get("/dashboard").then(setData).catch(console.error);
  }, []);

  const margenColor = data.margenMes >= 0 ? "success" : "danger";
  const gananciasColor = data.gananciasMes >= 0 ? "success" : "danger";

  return (
    <div className="page">
      <PageHeader title="Dashboard" subtitle="Resumen operativo y financiero del negocio" />

      {/* Today */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.65rem" }}>Hoy</p>
        <div className="stats-grid">
          <StatCard label="Ventas del día" value={currency(data.salesToday)} accent="success" />
          <StatCard label="Pedidos del día" value={data.salesTodayCount} accent="default" />
          <StatCard label="Compras del día" value={currency(data.purchasesToday)} accent="warning" />
          <StatCard label="Pedidos activos" value={data.pendingOrdersCount} accent={data.pendingOrdersCount > 0 ? "warning" : "default"} />
        </div>
      </div>

      {/* Month */}
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.65rem" }}>Este mes</p>
        <div className="stats-grid">
          <StatCard label="Ingresos del mes" value={currency(data.ingresosmes)} accent="success" />
          <StatCard label="Egresos del mes" value={currency(data.egresosmes)} accent="warning" />
          <StatCard label="Ganancia neta" value={currency(data.gananciasMes)} accent={gananciasColor} />
          <StatCard label="Margen de ganancia" value={`${data.margenMes}%`} accent={margenColor} />
        </div>
      </div>

      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: "0.65rem" }}>Información del negocio</p>
        <div className="stats-grid">
          <StatCard label="Productos activos" value={data.totalProducts} accent="default" />
        </div>
      </div>

      <div>
        <SectionCard title="Últimos movimientos">
          <Table
            columns={[
              { key: "product_name", label: "Producto" },
              { key: "movement_type", label: "Tipo" },
              { key: "quantity", label: "Cantidad" },
              { key: "movement_date", label: "Fecha", render: (row) => dateTime(row.movement_date) },
            ]}
            rows={data.latestMovements}
          />
        </SectionCard>
      </div>
    </div>
  );
};
