import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { currency } from "../utils/format";

const ORDER_TYPES = [
  { value: "comer_aqui", label: "Comer aquí" },
  { value: "para_llevar", label: "Para llevar" },
  { value: "pasar_recogiendo", label: "Pasar recogiendo" },
];

const STATUSES = [
  { value: "pendiente", label: "Pendiente", accent: "neutral" },
  { value: "en_cocina", label: "En cocina", accent: "warning" },
  { value: "listo", label: "Listo", accent: "success" },
  { value: "entregado", label: "Entregado", accent: "info" },
];

const statusBadge = (status) => {
  const s = STATUSES.find((x) => x.value === status) ?? { label: status, accent: "neutral" };
  return <Badge accent={s.accent}>{s.label}</Badge>;
};

const orderTypeLabel = (val) => ORDER_TYPES.find((x) => x.value === val)?.label ?? val;

const padOrder = (id) => String(id).padStart(3, "0");

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyItem = { product_id: "", quantity: 1, unit_price: 0, observation: "" };

export const FacturacionPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailModal, setDetailModal] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [form, setForm] = useState({
    client_name: "",
    sale_date: nowLocal(),
    payment_method: "efectivo",
    order_type: "comer_aqui",
    status: "pendiente",
    items: [emptyItem],
  });

  const loadData = async () => {
    const [p, o] = await Promise.all([api.get("/products"), api.get("/sales")]);
    setProducts(p.filter((x) => x.status === "active"));
    setOrders(o);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const updateItem = (index, key, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [key]: value };
    if (key === "product_id") {
      const prod = products.find((p) => String(p.id) === String(value));
      if (prod) items[index].unit_price = prod.sale_price;
    }
    setForm({ ...form, items });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: items.length ? items : [emptyItem] });
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/sales", {
        ...form,
        items: form.items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          observation: item.observation || undefined,
        })),
      });
      setSuccess("Pedido registrado correctamente.");
      setForm({ client_name: "", sale_date: nowLocal(), payment_method: "efectivo", order_type: "comer_aqui", status: "pendiente", items: [emptyItem] });
      loadData().catch(console.error);
    } catch (err) {
      setError(err.message);
    }
  };

  const changeStatus = async (orderId, newStatus) => {
    setStatusLoading(orderId);
    try {
      await api.patch(`/sales/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusLoading(null);
    }
  };

  const openDetail = async (orderId) => {
    const data = await api.get(`/sales/${orderId}`);
    setDetailModal(data);
  };

  const totalForm = form.items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.unit_price), 0);

  const activeOrders = orders.filter((o) => o.status !== "entregado");
  const historyOrders = orders.filter((o) => o.status === "entregado");

  return (
    <div className="page">
      <PageHeader title="Facturación" subtitle="Control de pedidos y estado en tiempo real" />

      {/* Active orders board */}
      <div className="order-board">
        {STATUSES.filter((s) => s.value !== "entregado").map((s) => {
          const col = activeOrders.filter((o) => o.status === s.value);
          return (
            <div key={s.value} className="order-column">
              <div className={`order-column-header order-col-${s.accent}`}>
                <span>{s.label}</span>
                <span className="order-count">{col.length}</span>
              </div>
              <div className="order-column-body">
                {col.length === 0 && <p className="order-empty">Sin pedidos</p>}
                {col.map((o) => (
                  <div key={o.id} className="order-card" onClick={() => openDetail(o.id)}>
                    <div className="order-card-top">
                      <span className="order-number">#{padOrder(o.id)}</span>
                      <span className="order-type-chip">{orderTypeLabel(o.order_type)}</span>
                    </div>
                    <div className="order-client">{o.client_name || "Sin nombre"}</div>
                    <div className="order-total">{currency(o.total)}</div>
                    <div className="order-actions" onClick={(e) => e.stopPropagation()}>
                      {STATUSES.filter((st) => st.value !== s.value && st.value !== "entregado").map((st) => (
                        <button
                          key={st.value}
                          className="secondary-button order-status-btn"
                          disabled={statusLoading === o.id}
                          onClick={() => changeStatus(o.id, st.value)}
                        >
                          → {st.label}
                        </button>
                      ))}
                      <button
                        className="success-button order-status-btn"
                        disabled={statusLoading === o.id}
                        onClick={() => changeStatus(o.id, "entregado")}
                      >
                        Entregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New order form */}
      <SectionCard title="Nuevo pedido">
        <form className="form-grid" onSubmit={submitOrder}>
          <div className="inline-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <input placeholder="Nombre del cliente (opcional)" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <select value={form.order_type} onChange={(e) => setForm({ ...form, order_type: e.target.value })}>
              {ORDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>

          <div className="inline-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <input type="datetime-local" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="order-items-header">
            <span>Producto</span><span>Cant.</span><span>Precio</span><span>Observación</span><span></span>
          </div>
          {form.items.map((item, idx) => (
            <div key={idx} className="inline-grid" style={{ gridTemplateColumns: "2fr 0.7fr 0.7fr 1.5fr auto" }}>
              <select value={item.product_id} onChange={(e) => updateItem(idx, "product_id", e.target.value)} required>
                <option value="">Seleccionar producto</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} required />
              <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", e.target.value)} required />
              <input placeholder="Sin cebolla, extra salsa…" value={item.observation} onChange={(e) => updateItem(idx, "observation", e.target.value)} />
              <button type="button" className="danger-button" style={{ padding: "0.5rem 0.75rem" }} onClick={() => removeItem(idx)}>✕</button>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button type="button" className="secondary-button" onClick={() => setForm({ ...form, items: [...form.items, emptyItem] })}>
              + Agregar producto
            </button>
            <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>Total: {currency(totalForm)}</span>
          </div>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          <button type="submit">Registrar pedido</button>
        </form>
      </SectionCard>

      {/* Historial */}
      <SectionCard title="Historial de pedidos entregados">
        <Table
          columns={[
            { key: "id", label: "N° Pedido", render: (r) => <span style={{ fontWeight: 600 }}>#{padOrder(r.id)}</span> },
            { key: "client_name", label: "Cliente", render: (r) => r.client_name || "—" },
            { key: "order_type", label: "Tipo", render: (r) => orderTypeLabel(r.order_type) },
            { key: "payment_method", label: "Pago" },
            { key: "total", label: "Total", render: (r) => currency(r.total) },
            { key: "status", label: "Estado", render: (r) => statusBadge(r.status) },
            { key: "actions", label: "", render: (r) => <button className="secondary-button" style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }} onClick={() => openDetail(r.id)}>Ver detalle</button> },
          ]}
          rows={historyOrders}
        />
      </SectionCard>

      {/* Detail modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pedido #{padOrder(detailModal.id)}</h3>
              <button className="secondary-button" style={{ padding: "0.3rem 0.65rem" }} onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-meta">
              <span><strong>Cliente:</strong> {detailModal.client_name || "—"}</span>
              <span><strong>Tipo:</strong> {orderTypeLabel(detailModal.order_type)}</span>
              <span><strong>Estado:</strong> {statusBadge(detailModal.status)}</span>
              <span><strong>Pago:</strong> {detailModal.payment_method}</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--border)" }}>Producto</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>Cant.</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>Precio</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>Subtotal</th>
                  <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid var(--border)" }}>Observación</th>
                </tr>
              </thead>
              <tbody>
                {(detailModal.details || []).map((d) => (
                  <tr key={d.id}>
                    <td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)" }}>{d.product_name}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>{d.quantity}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>{currency(d.unit_price)}</td>
                    <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>{currency(d.total)}</td>
                    <td style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{d.observation || "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ padding: "0.65rem 0.75rem", fontWeight: 700, textAlign: "right" }}>Total:</td>
                  <td style={{ padding: "0.65rem 0.75rem", fontWeight: 700, textAlign: "right" }}>{currency(detailModal.total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
