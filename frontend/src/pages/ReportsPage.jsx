import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { currency, date, dateTime } from "../utils/format";

export const ReportsPage = () => {
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const [filterPreset, setFilterPreset] = useState("all");
  const [dateError, setDateError] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState({ totalSales: 0, totalPurchases: 0, estimatedProfit: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para validar y corregir fechas
  const validateAndCorrectDates = (start, end) => {
    setDateError("");
    
    // Si ambas están vacías, es válido (sin filtro de fecha)
    if (!start && !end) return true;
    
    // Si solo una está vacía, mostrar error
    if ((start && !end) || (!start && end)) {
      setDateError("Por favor completa ambas fechas o déjalas vacías");
      return false;
    }
    
    // Si start > end, mostrar error
    if (start > end) {
      setDateError("La fecha de inicio no puede ser posterior a la fecha final");
      return false;
    }
    
    return true;
  };

  // Función para aplicar filtros predefinidos
  const applyPreset = (preset) => {
    const today = new Date();
    let newRange = { startDate: "", endDate: "" };

    switch (preset) {
      case "today":
        const todayStr = today.toISOString().split("T")[0];
        newRange = { startDate: todayStr, endDate: todayStr };
        break;
      case "week":
        // Obtener el lunes de la semana actual
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), retroceder 6 días
        weekStart.setDate(today.getDate() - daysToMonday);
        newRange = {
          startDate: weekStart.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
        break;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newRange = {
          startDate: monthStart.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
        break;
      case "all":
      default:
        newRange = { startDate: "", endDate: "" };
    }

    setRange(newRange);
    setFilterPreset(preset);
    setDateError("");
    
    // Cargar datos con los NUEVOS parámetros
    loadDataWithRange(newRange);
  };

  // Función auxiliar para cargar datos con un rango específico
  const loadDataWithRange = async (rangeToUse) => {
    console.log("=== loadDataWithRange START ===");
    console.log("Called with range:", rangeToUse);
    
    if (!validateAndCorrectDates(rangeToUse.startDate, rangeToUse.endDate)) {
      return;
    }
    
    setLoading(true);
    
    // Construir parámetros
    const queryParams = new URLSearchParams();
    if (rangeToUse.startDate) queryParams.append("startDate", rangeToUse.startDate);
    if (rangeToUse.endDate) queryParams.append("endDate", rangeToUse.endDate);
    const params = queryParams.toString();

    try {
      const [
        purchasesData,
        salesData,
        profitData,
        topProductsData,
      ] = await Promise.all([
        api.get(`/reports/purchases${params ? `?${params}` : ""}`),
        api.get(`/reports/sales${params ? `?${params}` : ""}`),
        api.get(`/reports/profit${params ? `?${params}` : ""}`),
        api.get(`/reports/top-products${params ? `?${params}` : ""}`),
      ]);

      setPurchases(purchasesData);
      setSales(salesData);
      setProfit(profitData);
      setTopProducts(topProductsData);
    } catch (error) {
      console.error("Error loading reports:", error);
      setDateError("Error al cargar los reportes. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs de fecha
  const handleDateChange = (field, value) => {
    const newRange = { ...range, [field]: value };
    setRange(newRange);
    setDateError("");
  };

  useEffect(() => {
    // Cargar todos los datos al montar
    loadDataWithRange({ startDate: "", endDate: "" }).catch(console.error);
  }, []);

  return (
    <div className="page">
      <PageHeader title="Reportes" subtitle="Indicadores operativos y financieros basicos" />

      <SectionCard title="Filtro por fecha">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Botones de presets */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => applyPreset("today")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: filterPreset === "today" ? "#3b82f6" : "#e5e7eb",
                color: filterPreset === "today" ? "white" : "black",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => applyPreset("week")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: filterPreset === "week" ? "#3b82f6" : "#e5e7eb",
                color: filterPreset === "week" ? "white" : "black",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Esta semana
            </button>
            <button
              type="button"
              onClick={() => applyPreset("month")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: filterPreset === "month" ? "#3b82f6" : "#e5e7eb",
                color: filterPreset === "month" ? "white" : "black",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Este mes
            </button>
            <button
              type="button"
              onClick={() => applyPreset("all")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: filterPreset === "all" ? "#3b82f6" : "#e5e7eb",
                color: filterPreset === "all" ? "white" : "black",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Todo el tiempo
            </button>
          </div>

          {/* Inputs de fechas personalizadas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.25rem" }}>
                Fecha inicial
              </label>
              <input
                type="date"
                value={range.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#666", marginBottom: "0.25rem" }}>
                Fecha final
              </label>
              <input
                type="date"
                value={range.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => loadDataWithRange(range).catch(console.error)}
              disabled={loading}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: loading ? "#d1d5db" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: loading ? "default" : "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                height: "fit-content",
              }}
            >
              {loading ? "Cargando..." : "Aplicar"}
            </button>
          </div>

          {/* Mensaje de error */}
          {dateError && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              ⚠️ {dateError}
            </div>
          )}

          {/* Información de la fecha seleccionada */}
          {range.startDate && range.endDate && (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "#dbeafe",
                color: "#0c4a6e",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            >
              📅 Mostrando datos desde <strong>{range.startDate}</strong> hasta <strong>{range.endDate}</strong>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="stats-grid">
        <StatCard label="Ventas" value={currency(profit.totalSales)} accent="success" />
        <StatCard label="Compras" value={currency(profit.totalPurchases)} accent="warning" />
        <StatCard label="Ganancia estimada" value={currency(profit.estimatedProfit)} />
      </div>

      <div className="two-column">
        <SectionCard title="Productos mas vendidos">
          <Table
            key={`top-products-${filterPreset}-${range.startDate}-${range.endDate}`}
            columns={[
              { key: "name", label: "Producto" },
              { key: "quantity_sold", label: "Cantidad" },
              { key: "total_sales", label: "Ventas", render: (row) => currency(row.total_sales) },
            ]}
            rows={topProducts}
          />
        </SectionCard>

        <SectionCard title="Compras por fecha">
          <Table
            key={`purchases-${filterPreset}-${range.startDate}-${range.endDate}`}
            columns={[
              { key: "id", label: "ID" },
              { key: "purchase_date", label: "Fecha", render: (row) => date(row.purchase_date) },
              { key: "total", label: "Total", render: (row) => currency(row.total) },
            ]}
            rows={purchases}
          />
        </SectionCard>
      </div>

      <div className="two-column">
        <SectionCard title="Ventas por fecha">
          <Table
            key={`sales-${filterPreset}-${range.startDate}-${range.endDate}`}
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
    </div>
  );
};
