import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { currency } from "../utils/format";
import "../styles/accounting-page.css";

const BAR_H = 140;
const BAR_W = 32;
const GAP = 10;

const BarChart = ({ data, period }) => {
  if (!data || data.length === 0) return <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>Sin datos</p>;
  const days = period === "week" ? data.slice(-7) : data;
  const maxVal = Math.max(...days.map((d) => Math.max(d.ingresos, d.egresos)), 1);
  const svgW = days.length * (BAR_W * 2 + GAP + 6) + 20;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={BAR_H + 56} style={{ display: "block", minWidth: "100%" }}>
        {days.map((d, i) => {
          const x = 10 + i * (BAR_W * 2 + GAP + 6);
          const hI = (d.ingresos / maxVal) * BAR_H;
          const hE = (d.egresos / maxVal) * BAR_H;
          const gananciaColor = d.ganancia >= 0 ? "#16A34A" : "#DC2626";
          return (
            <g key={i}>
              <rect x={x} y={BAR_H - hI} width={BAR_W} height={hI} fill="#E85D04" rx={3} opacity={0.85}>
                <title>Ingresos: {currency(d.ingresos)}</title>
              </rect>
              <rect x={x + BAR_W + 3} y={BAR_H - hE} width={BAR_W} height={hE} fill="#F59E0B" rx={3} opacity={0.85}>
                <title>Egresos: {currency(d.egresos)}</title>
              </rect>
              <text x={x + BAR_W} y={BAR_H + 16} textAnchor="middle" fontSize={10} fill="#6B7280">{d.day}</text>
              <text x={x + BAR_W} y={BAR_H + 30} textAnchor="middle" fontSize={9} fill={gananciaColor} fontWeight={600}>
                {d.ganancia >= 0 ? "+" : ""}{currency(d.ganancia)}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={BAR_H} x2={svgW} y2={BAR_H} stroke="#E8E0D5" strokeWidth={1} />
      </svg>
      <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", marginTop: "0.5rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span style={{ width: 12, height: 12, background: "#E85D04", borderRadius: 2, display: "inline-block" }} />Ingresos
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span style={{ width: 12, height: 12, background: "#F59E0B", borderRadius: 2, display: "inline-block" }} />Egresos
        </span>
      </div>
    </div>
  );
};

const DonutChart = ({ segments, size = 110 }) => {
  if (!segments || segments.length === 0) return null;
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="muted" style={{ textAlign: "center" }}>Sin datos</p>;
  const cx = size / 2, cy = size / 2, r = size * 0.38, ri = size * 0.22;
  const colors = ["#E85D04", "#F59E0B", "#16A34A", "#DC2626", "#7C3AED"];
  let angle = -Math.PI / 2;
  const slices = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const xi1 = cx + ri * Math.cos(angle), yi1 = cy + ri * Math.sin(angle);
    const xi2 = cx + ri * Math.cos(angle - sweep), yi2 = cy + ri * Math.sin(angle - sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${large} 0 ${xi2} ${yi2} Z`,
      color: colors[i % colors.length],
      label: seg.label,
      pct: ((seg.value / total) * 100).toFixed(0),
    };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.9}><title>{s.label}: {s.pct}%</title></path>
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: "var(--text-muted)" }}>{s.label}</span>
            <span style={{ fontWeight: 600, color: "var(--text)", marginLeft: "auto" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const GASTO_EMPTY = { description: "", amount: "", date: new Date().toISOString().slice(0, 10), type: "operativo" };

const GastosSection = ({ onGastoChanged }) => {
  const [gastos, setGastos] = useState([]);
  const [form, setForm] = useState(GASTO_EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [newGastoIds, setNewGastoIds] = useState(new Set());

  const loadGastos = async () => {
    try {
      const res = await api.get("/accounting/gastos");
      setGastos(res);
    } catch (_) {}
  };

  useEffect(() => { 
    loadGastos(); 
  }, [refreshCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 1500); // Recarga cada 1.5 segundos
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = editingId 
        ? await api.patch(`/accounting/gastos/${editingId}`, form)
        : await api.post("/accounting/gastos", form);
      
      // Marcar nuevo gasto para animación
      if (result?.id && !editingId) {
        setNewGastoIds(prev => new Set(prev).add(result.id));
        setTimeout(() => {
          setNewGastoIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(result.id);
            return newSet;
          });
        }, 600);
      }
      
      setForm(GASTO_EMPTY);
      setShowForm(false);
      setEditingId(null);
      // Forzar recarga inmediata y notificar al padre
      setTimeout(() => {
        setRefreshCount(prev => prev + 1);
        onGastoChanged?.();
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gasto) => {
    setForm({
      description: gasto.description,
      amount: gasto.amount,
      date: gasto.date.split('T')[0],
      type: gasto.type
    });
    setEditingId(gasto.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await api.delete(`/accounting/gastos/${id}`);
      // Forzar recarga inmediata y notificar al padre
      setTimeout(() => {
        setRefreshCount(prev => prev + 1);
        onGastoChanged?.();
      }, 100);
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  return (
    <SectionCard
      title="Gastos y Compras"
      actions={
        <button onClick={() => {
          setShowForm((v) => !v);
          if (!showForm) {
            setForm(GASTO_EMPTY);
            setEditingId(null);
          }
        }}>
          {showForm ? "Cancelar" : "+ Agregar gasto"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem", padding: "1rem", background: "var(--bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <label style={{ flex: "2 1 200px" }}>
            Descripción
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ej: Compra de carne, gas, tortillas…"
              required
            />
          </label>
          <label style={{ flex: "1 1 120px" }}>
            Monto ($)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </label>
          <label style={{ flex: "1 1 120px" }}>
            Tipo
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              <option value="operativo">Operativo</option>
              <option value="ingredientes">Ingredientes</option>
            </select>
          </label>
          <label style={{ flex: "1 1 140px" }}>
            Fecha
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          {error && <div className="alert error" style={{ width: "100%" }}>{error}</div>}
          <div style={{ width: "100%", display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={saving}>{saving ? "Guardando…" : editingId ? "Actualizar gasto" : "Guardar gasto"}</button>
            <button type="button" className="secondary-button" onClick={() => { setShowForm(false); setEditingId(null); setForm(GASTO_EMPTY); }}>Cancelar</button>
          </div>
        </form>
      )}

      {gastos.length === 0 && !showForm && (
        <p className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>Sin gastos registrados</p>
      )}

      {gastos.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Descripción</th>
              <th style={{ textAlign: "center", padding: "0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Tipo</th>
              <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Fecha</th>
              <th style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Monto</th>
              <th style={{ textAlign: "center", padding: "0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g) => (
              <tr 
                key={g.id} 
                className={newGastoIds.has(g.id) ? 'adding' : ''}
                style={{ 
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: newGastoIds.has(g.id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  transition: 'background-color 0.3s ease'
                }}
              >
                <td style={{ padding: "0.6rem 0.5rem" }}>{g.description}</td>
                <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: g.type === "ingredientes" ? "var(--warning)" : "var(--text-muted)" }}>
                  {g.type === "ingredientes" ? "🛒 Ingredientes" : "📊 Operativo"}
                </td>
                <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", color: "var(--text-muted)" }}>
                  {new Date(g.date).toLocaleDateString("es-MX")}
                </td>
                <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 600, color: "var(--danger)" }}>
                  -{currency(g.amount)}
                </td>
                <td style={{ padding: "0.6rem 0.5rem", textAlign: "center", display: "flex", gap: "0.3rem", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleEdit(g)}
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "var(--blue-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(g.id)}
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", background: "var(--danger)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
};

// Componente para animar cambios de valores
const AnimatedValue = ({ value, format = (v) => v, isHighlighted }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (prevValue !== value) {
      setPrevValue(value);
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <span className={`stat-value number-animate ${highlight ? 'highlight' : ''}`}>
      {format(value)}
    </span>
  );
};

export const ContabilidadPage = () => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async (p, showLoading = true) => {
    if (showLoading) setLoading(true);
    setIsUpdating(true);
    try {
      const res = await api.get(`/accounting?period=${p}`);
      // Actualizar data con transición suave
      setData(prevData => {
        if (!prevData) return res;
        // Fusionar los datos nuevos con los anteriores para una actualización más suave
        return {
          ...res,
          // Mantener valores previos brevemente si hay cambios drásticos
          ingresos: res.ingresos,
          egresos: res.egresos,
          ganancia: res.ganancia,
          margen: res.margen,
        };
      });
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
      setIsUpdating(false);
    }
  };

  useEffect(() => { load(period, true); }, [period]);

  const handleGastoChanged = () => {
    // Recarga silenciosamente sin mostrar loading
    load(period, false);
  };

  const margenColor = data && data.margen >= 0 ? "success" : "danger";
  const gananciasColor = data && data.ganancia >= 0 ? "success" : "danger";
  const paymentSegments = data ? data.paymentBreakdown.map((p) => ({ label: p.payment_method, value: p.total })) : [];

  return (
    <div className="page">
      <PageHeader
        title="Contabilidad"
        subtitle={`Análisis financiero — ${period === "week" ? "últimos 7 días" : "últimos 30 días"}`}
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className={period === "week" ? "" : "secondary-button"} onClick={() => setPeriod("week")}>7 días</button>
            <button className={period === "month" ? "" : "secondary-button"} onClick={() => setPeriod("month")}>30 días</button>
          </div>
        }
      />

      {loading && <div className="muted" style={{ padding: "2rem", textAlign: "center" }}>Cargando…</div>}

      {!loading && data && (
        <div className={`data-container ${isUpdating ? 'updating' : ''}`} style={{ transition: 'opacity 0.3s ease' }}>
          <div className="stats-grid">
            <StatCard label="Ingresos (ventas)" value={<AnimatedValue value={data.ingresos} format={currency} />} accent="success" />
            <StatCard label="Egresos (gastos)" value={<AnimatedValue value={data.egresos} format={currency} />} accent="warning" />
            <StatCard label="Ganancia neta" value={<AnimatedValue value={data.ganancia} format={currency} />} accent={gananciasColor} />
            <StatCard label="Margen de ganancia" value={<AnimatedValue value={data.margen} format={(v) => `${v}%`} />} accent={margenColor} />
          </div>

          <div className="three-column">
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Ventas registradas</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>{data.salesCount}</p>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Gastos registrados</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>{data.purchasesCount}</p>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Ticket promedio</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
                {data.salesCount > 0 ? currency(data.ingresos / data.salesCount) : "$0.00"}
              </p>
            </div>
          </div>

          <div className="two-column">
            <SectionCard title="Ingresos vs Egresos por día">
              <BarChart data={data.dailyData} period={period} />
            </SectionCard>
            <SectionCard title="Métodos de pago">
              <DonutChart segments={paymentSegments} size={130} />
              <div style={{ marginTop: "1rem" }}>
                {data.paymentBreakdown.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.875rem" }}>
                    <span style={{ textTransform: "capitalize" }}>{p.payment_method}</span>
                    <span style={{ display: "flex", gap: "1rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>{p.count} ventas</span>
                      <strong>{currency(p.total)}</strong>
                    </span>
                  </div>
                ))}
                {data.paymentBreakdown.length === 0 && <p className="muted" style={{ textAlign: "center", padding: "1rem" }}>Sin ventas en el período</p>}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Platillos más vendidos">
            {data.topProducts.length === 0 && (
              <p className="muted" style={{ textAlign: "center", padding: "1.5rem" }}>Sin ventas en el período</p>
            )}
            {data.topProducts.map((p, i) => {
              const pct = data.ingresos > 0 ? (p.total / data.ingresos) * 100 : 0;
              return (
                <div key={i} style={{ marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.875rem" }}>
                    <span style={{ fontWeight: 500 }}>{p.product_name}</span>
                    <span style={{ display: "flex", gap: "1rem", color: "var(--text-muted)" }}>
                      <span>{p.units_sold} uds</span>
                      <strong style={{ color: "var(--text)" }}>{currency(p.total)}</strong>
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--blue-primary)", borderRadius: 99, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </SectionCard>

          <SectionCard title="Resumen financiero">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <tbody>
                {[
                  { label: "Ingresos totales (ventas)", value: data.ingresos, color: "var(--success)" },
                  { label: "Egresos totales (gastos)", value: -data.egresos, color: "var(--warning)" },
                  { label: "Ganancia bruta", value: data.ganancia, bold: true, color: data.ganancia >= 0 ? "var(--success)" : "var(--danger)" },
                  { label: "Margen de rentabilidad", value: null, display: `${data.margen}%`, bold: true, color: data.margen >= 0 ? "var(--success)" : "var(--danger)" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: row.bold ? 700 : 500, color: row.color }}>
                      {row.display ?? (row.value >= 0 ? `+${currency(row.value)}` : `-${currency(Math.abs(row.value))}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        </div>
      )}

      <GastosSection onGastoChanged={handleGastoChanged} />
    </div>
  );
};
