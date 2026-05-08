import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { ProductsByCategorySelector } from "../components/ProductsByCategorySelector";
import { currency } from "../utils/format";
import "../styles/sales-page.css";

const emptyItem = () => ({ product_id: "", quantity: 1, unit_price: 0 });

const nowLocal = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const freshForm = () => ({ client_name: "", observation: "", sale_date: nowLocal(), delivered: false, paid: false, items: [emptyItem()] });

const fmtDate = (v) => v ? new Date(v).toLocaleString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";

/* Grid de items reutilizable */
const ItemsGrid = ({ items, products, onChange, onRemove, onAdd, onAddByCategory }) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const handleCategorySelect = (product) => {
    onAddByCategory(product);
    setShowCategorySelector(false);
  };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:"0.4rem", marginBottom:"0.35rem" }}>
        {["Platillo","Cant.","Precio",""].map((h,i) => (
          <span key={i} style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>{h}</span>
        ))}
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{ display:"grid", gridTemplateColumns:"2fr 60px 90px 28px", gap:"0.4rem", marginBottom:"0.4rem" }}>
          <select value={item.product_id} onChange={(e) => onChange(idx,"product_id",e.target.value)} required>
            <option value="">— Seleccionar —</option>
            {products.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
          <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => onChange(idx,"quantity",e.target.value)} required style={{ textAlign:"center" }} />
          <input type="number" step="0.01" min="0" value={item.unit_price} onChange={(e) => onChange(idx,"unit_price",e.target.value)} required style={{ textAlign:"right" }} />
          <button type="button" className="secondary-button" onClick={() => onRemove(idx)} disabled={items.length===1}
            style={{ padding:0, fontSize:"1.2rem", color:"var(--danger)", lineHeight:1 }}>×</button>
        </div>
      ))}
      <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
        <button type="button" className="secondary-button" onClick={onAdd} style={{ fontSize:"0.8rem" }}>+ Platillo</button>
        <button type="button" className="secondary-button" onClick={() => setShowCategorySelector(!showCategorySelector)} 
          style={{ fontSize:"0.8rem", background:"var(--blue-primary)", color:"white" }}>
          {showCategorySelector ? "✕ Cerrar categorías" : "📁 Por categoría"}
        </button>
      </div>
      {showCategorySelector && (
        <div style={{ marginTop:"0.75rem", padding:"0.75rem", background:"var(--bg-secondary)", borderRadius:"var(--radius-md)", border:"1px solid var(--border)" }}>
          <ProductsByCategorySelector onSelectProduct={handleCategorySelect} />
        </div>
      )}
    </div>
  );
};

/* Panel edición completa de pedido existente */
const EditPanel = ({ sale, products, onSaved, onCancel }) => {
  const [items, setItems] = useState(() =>
    sale.details?.length
      ? sale.details.map((d) => ({ product_id: String(d.product_id), quantity: d.quantity, unit_price: Number(d.unit_price) }))
      : [emptyItem()]
  );
  const [observation, setObservation] = useState(sale.observation || "");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (idx, key, value) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      if (key === "product_id") {
        const p = products.find((x) => String(x.id) === String(value));
        return { ...item, product_id: value, unit_price: p ? Number(p.sale_price) : item.unit_price };
      }
      return { ...item, [key]: value };
    }));
  };

  const save = async () => {
    setErr(""); setSaving(true);
    try {
      const updated = await api.patch(`/sales/${sale.id}`, {
        observation: observation,
        items: items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
      });
      onSaved(updated);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const total = items.reduce((s,i) => s + Number(i.quantity||0)*Number(i.unit_price||0), 0);

  return (
    <div style={{ marginTop:"0.75rem", padding:"0.9rem", background:"var(--bg)", borderRadius:"var(--radius-md)", border:"1px solid var(--border)" }}>
      <p style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-muted)", marginBottom:"0.65rem", textTransform:"uppercase" }}>
        Modificar pedido #{sale.id}
      </p>
      <ItemsGrid items={items} products={products}
        onChange={change}
        onRemove={(i) => setItems((p) => p.length > 1 ? p.filter((_,j)=>j!==i) : p)}
        onAdd={() => setItems((p) => [...p, emptyItem()])}
      />
      <label style={{ display:"block", marginBottom:"0.75rem", marginTop:"0.75rem" }}>
        <span style={{ fontSize:"0.7rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>Notas/Preferencias</span>
        <textarea value={observation} onChange={(e) => setObservation(e.target.value)}
          placeholder="Ej: Sin picante, extra cebolla, alergias, etc…" style={{ marginTop:"0.3rem", resize:"vertical", minHeight:"50px", fontFamily:"inherit" }} />
      </label>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.75rem", flexWrap:"wrap", gap:"0.5rem" }}>
        <span style={{ fontWeight:700 }}>Total: {currency(total)}</span>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button type="button" onClick={save} disabled={saving} style={{ fontSize:"0.82rem" }}>{saving?"Guardando…":"Guardar cambios"}</button>
          <button type="button" className="secondary-button" onClick={onCancel} style={{ fontSize:"0.82rem" }}>Cancelar</button>
        </div>
      </div>
      {err && <div className="alert error" style={{ marginTop:"0.5rem" }}>{err}</div>}
    </div>
  );
};

/* Panel para marcar como pagado (con método de pago) */
const PayPanel = ({ sale, onSaved, onCancel }) => {
  const [method, setMethod] = useState("efectivo");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.patch(`/sales/${sale.id}`, { paid: true, payment_method: method });
      onSaved(updated);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginTop:"0.75rem", padding:"0.9rem", background:"var(--bg)", borderRadius:"var(--radius-md)", border:"1px solid var(--border)", display:"flex", gap:"0.75rem", alignItems:"flex-end", flexWrap:"wrap" }}>
      <label style={{ flex:"1 1 160px", margin:0 }}>
        <span style={{ fontSize:"0.75rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase" }}>Método de pago</span>
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ marginTop:"0.3rem" }}>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </label>
      <div style={{ display:"flex", gap:"0.5rem" }}>
        <button type="button" onClick={save} disabled={saving} style={{ fontSize:"0.82rem" }}>{saving?"Guardando…":"Confirmar pago"}</button>
        <button type="button" className="secondary-button" onClick={onCancel} style={{ fontSize:"0.82rem" }}>Cancelar</button>
      </div>
    </div>
  );
};

/* Badge de estado */
const StatusBadge = ({ delivered, paid }) => {
  if (paid) {
    return <span style={{ display:"inline-block", padding:"0.35rem 0.65rem", borderRadius:"var(--radius-sm)", background:"var(--success-bg)", color:"var(--success)", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase" }}>✓ Cobrado</span>;
  }
  if (delivered) {
    return <span style={{ display:"inline-block", padding:"0.35rem 0.65rem", borderRadius:"var(--radius-sm)", background:"var(--warning-bg)", color:"var(--warning)", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase" }}>📦 Entregado</span>;
  }
  return <span style={{ display:"inline-block", padding:"0.35rem 0.65rem", borderRadius:"var(--radius-sm)", background:"var(--danger-bg)", color:"var(--danger)", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase" }}>⏳ Pendiente</span>;
};

/* Tarjeta de pedido mejorada */
const SaleCard = ({ sale, products, onUpdate, editable }) => {
  const [mode, setMode] = useState(null); // null | "edit" | "pay"
  const [saleDetails, setSaleDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async (flag) => {
    setLoading(true);
    try { onUpdate(await api.patch(`/sales/${sale.id}`, { [flag]: !sale[flag] })); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openEdit = async () => {
    if (mode === "edit") { setMode(null); return; }
    setLoading(true);
    try {
      const full = await api.get(`/sales/${sale.id}`);
      setSaleDetails(full);
      setMode("edit");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const itemsCount = sale.details?.length || 0;

  return (
    <div style={{
      background: sale.paid ? "var(--success-bg)" : sale.delivered ? "var(--warning-bg)" : "var(--danger-bg)",
      border: `2px solid ${sale.paid ? "var(--success-border)" : sale.delivered ? "var(--warning-border)" : "var(--danger-border)"}`,
      borderRadius: "var(--radius-lg)",
      padding: "1rem",
      marginBottom: "0.75rem",
      transition: "all 0.2s ease"
    }}>
      {/* Encabezado */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"1rem", marginBottom:"0.75rem", flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 200px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.25rem" }}>
            <span style={{ fontWeight:700, fontSize:"1.1rem" }}>
              {sale.client_name || "Sin nombre"}
            </span>
            <StatusBadge delivered={sale.delivered} paid={sale.paid} />
          </div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
            <div>Pedido #{sale.id}</div>
            <div>{fmtDate(sale.sale_date)}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"1.3rem", fontWeight:700, color:"var(--text)" }}>
            {currency(sale.total)}
          </div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
            {itemsCount} {itemsCount === 1 ? "platillo" : "platillos"}
          </div>
        </div>
      </div>

      {/* Detalles de items */}
      {sale.details && sale.details.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.6)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem",
          marginBottom: "0.75rem",
          fontSize: "0.85rem"
        }}>
          {sale.details.map((item, idx) => (
            <div key={idx} style={{ display:"flex", justifyContent:"space-between", padding:"0.3rem 0", borderBottom: idx < sale.details.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
              <span>{item.product_name}</span>
              <span style={{ fontWeight:600 }}>{item.quantity} × {currency(item.unit_price)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Observaciones */}
      {sale.observation && (
        <div style={{ background:"rgba(255,200,0,0.1)", borderLeft:"3px solid #FCD34D", padding:"0.6rem", marginBottom:"0.75rem", borderRadius:"var(--radius-sm)", fontSize:"0.8rem" }}>
          <div style={{ fontWeight:600, color:"#92400E", marginBottom:"0.2rem" }}>📝 Notas:</div>
          <div style={{ color:"#78350F" }}>{sale.observation}</div>
        </div>
      )}

      {/* Botones de acción */}
      {editable && (
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", alignItems:"center" }}>
          {!sale.delivered && (
            <button 
              type="button" 
              onClick={() => toggle("delivered")}
              disabled={loading}
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "0.6rem 1rem",
                background: "var(--danger)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontSize: "0.9rem"
              }}>
              {loading ? "Actualizando…" : "📦 Entregar"}
            </button>
          )}
          {sale.delivered && !sale.paid && (
            <button 
              type="button"
              onClick={() => setMode((m) => m==="pay" ? null : "pay")}
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "0.6rem 1rem",
                background: "var(--warning)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem"
              }}>
              {mode === "pay" ? "✕ Cancelar" : "💳 Cobrar"}
            </button>
          )}
          <button
            type="button"
            onClick={openEdit}
            disabled={loading}
            style={{
              flex: "1 1 auto",
              minWidth: "120px",
              padding: "0.6rem 1rem",
              background: "var(--blue-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontSize: "0.9rem"
            }}>
            {mode==="edit" ? "✕ Cancelar" : "✏️ Editar"}
          </button>
        </div>
      )}

      {mode === "edit" && editable && saleDetails && (
        <EditPanel sale={saleDetails} products={products}
          onSaved={(u) => { onUpdate(u); setMode(null); setSaleDetails(null); }}
          onCancel={() => { setMode(null); setSaleDetails(null); }}
        />
      )}
      {mode === "edit" && editable && !saleDetails && (
        <div style={{ padding:"1rem", textAlign:"center", color:"var(--text-muted)", fontSize:"0.85rem" }}>Cargando…</div>
      )}
      {mode === "pay" && editable && (
        <PayPanel sale={sale}
          onSaved={(u) => { onUpdate(u); setMode(null); }}
          onCancel={() => setMode(null)}
        />
      )}
    </div>
  );
};

export const SalesPage = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(freshForm);

  const loadData = async () => {
    const [prods, salesData] = await Promise.all([api.get("/products"), api.get("/sales")]);
    setProducts(prods.filter((p) => p.status === "active"));
    setSales(salesData);
  };

  useEffect(() => { loadData().catch(console.error); }, []);

  const changeItem = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== idx) return item;
        if (key === "product_id") {
          const p = products.find((x) => String(x.id) === String(value));
          return { ...item, product_id: value, unit_price: p ? Number(p.sale_price) : item.unit_price };
        }
        return { ...item, [key]: value };
      }),
    }));
  };

  const addItemByCategory = (product) => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, {
        product_id: String(product.id),
        quantity: 1,
        unit_price: Number(product.sale_price)
      }]
    }));
  };

  const submitSale = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await api.post("/sales", {
        client_name: form.client_name,
        observation: form.observation,
        sale_date: form.sale_date,
        payment_method: "efectivo",
        delivered: false,
        paid: false,
        items: form.items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity), unit_price: Number(i.unit_price), observation: form.observation })),
      });
      setForm(freshForm());
      await loadData();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const updateSale = (updated) => {
    setSales((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
    // Forzar actualización completa después de un pequeño delay para sincronizar UI
    setTimeout(() => {
      api.get("/sales")
        .then((salesData) => setSales(salesData))
        .catch(console.error);
    }, 300);
  };

  const totalForm = form.items.reduce((s,i) => s + Number(i.quantity||0)*Number(i.unit_price||0), 0);

  const pendientes  = sales.filter((s) => !s.delivered && !s.paid);
  const sinPagar    = sales.filter((s) => s.delivered && !s.paid);
  const completados = sales.filter((s) => s.delivered && s.paid);

  return (
    <div className="page">
      <PageHeader title="Ventas" subtitle="Registro de pedidos" />

      <SectionCard title="➕ Nuevo pedido" style={{ background:"var(--blue-lighter)" }}>
        <form onSubmit={submitSale}>
          {/* 1. Cliente — obligatorio */}
          <label style={{ display:"block", marginBottom:"0.75rem" }}>
            Cliente
            <input value={form.client_name} onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
              placeholder="Nombre del cliente" required />
          </label>

          {/* 2. Platillos */}
          <div style={{ marginBottom:"0.75rem" }}>
            <ItemsGrid
              items={form.items}
              products={products}
              onChange={changeItem}
              onRemove={(idx) => setForm((p) => ({ ...p, items: p.items.filter((_,i) => i!==idx) }))}
              onAdd={() => setForm((p) => ({ ...p, items: [...p.items, emptyItem()] }))}
              onAddByCategory={addItemByCategory}
            />
          </div>

          {/* 3. Observaciones/Preferencias */}
          <label style={{ display:"block", marginBottom:"0.75rem" }}>
            Notas/Preferencias
            <textarea value={form.observation} onChange={(e) => setForm((p) => ({ ...p, observation: e.target.value }))}
              placeholder="Ej: Sin picante, extra cebolla, alergias, etc…" style={{ resize:"vertical", minHeight:"60px", fontFamily:"inherit" }} />
          </label>

          <hr style={{ border:"none", borderTop:"1px solid var(--border)", margin:"0.75rem 0" }} />

          {/* 4. Fecha — deshabilitada */}
          <label style={{ display:"block", marginBottom:"0.75rem" }}>
            Fecha y hora
            <input type="datetime-local" value={form.sale_date} disabled
              style={{ background:"var(--bg)", color:"var(--text-muted)", cursor:"not-allowed" }} />
          </label>

          {error && <div className="alert error" style={{ marginBottom:"0.75rem" }}>{error}</div>}

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}>
            <span style={{ fontSize:"1.2rem", fontWeight:700 }}>Total: <span style={{ color:"var(--blue-primary)" }}>{currency(totalForm)}</span></span>
            <button type="submit" disabled={submitting} style={{ padding:"0.8rem 2rem", fontSize:"1rem", fontWeight:600 }}>
              {submitting ? "Guardando…" : "💾 Guardar pedido"}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Pedidos Pendientes */}
      <div style={{ background:"var(--danger-bg)", border:`2px solid var(--danger-border)`, borderRadius:"var(--radius-lg)", padding:"1rem", marginBottom:"1rem" }}>
        <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"var(--danger)", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
          ⏳ Pedidos Pendientes
          <span style={{ background:"var(--danger)", color:"white", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", fontWeight:700 }}>{pendientes.length}</span>
        </h2>
        <div>
          {pendientes.length === 0
            ? <p style={{ textAlign:"center", padding:"2rem 1rem", color:"var(--text-muted)", fontSize:"0.95rem" }}>✓ Sin pedidos pendientes</p>
            : pendientes.map((s) => <SaleCard key={s.id} sale={s} products={products} onUpdate={updateSale} editable />)
          }
        </div>
      </div>

      {/* Entregados sin cobrar */}
      {sinPagar.length > 0 && (
        <div style={{ background:"var(--warning-bg)", border:`2px solid var(--warning-border)`, borderRadius:"var(--radius-lg)", padding:"1rem", marginBottom:"1rem" }}>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"var(--warning)", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            📦 Entregados sin cobrar
            <span style={{ background:"var(--warning)", color:"white", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", fontWeight:700 }}>{sinPagar.length}</span>
          </h2>
          <div>
            {sinPagar.map((s) => <SaleCard key={s.id} sale={s} products={products} onUpdate={updateSale} editable />)}
          </div>
        </div>
      )}

      {/* Cobrados */}
      {completados.length > 0 && (
        <div style={{ background:"var(--success-bg)", border:`2px solid var(--success-border)`, borderRadius:"var(--radius-lg)", padding:"1rem", marginBottom:"1rem" }}>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"var(--success)", marginBottom:"0.75rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            ✓ Pedidos Cobrados
            <span style={{ background:"var(--success)", color:"white", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", fontWeight:700 }}>{completados.length}</span>
          </h2>
          <div>
            {completados.map((s) => <SaleCard key={s.id} sale={s} products={products} onUpdate={updateSale} editable={false} />)}
          </div>
        </div>
      )}
    </div>
  );
};
