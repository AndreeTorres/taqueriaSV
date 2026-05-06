import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Table } from "../components/Table";
import { currency } from "../utils/format";

const productFormInitial = {
  name: "",
  category_id: "",
  product_type: "producto para venta",
  unit_measure: "unidad",
  purchase_price: 0,
  sale_price: 0,
  status: "active",
};

// Modal de edición de productos
const EditProductModal = ({ product, categories, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: product.name || "",
    category_id: product.category_id || "",
    product_type: product.product_type || "producto para venta",
    unit_measure: product.unit_measure || "unidad",
    purchase_price: product.purchase_price || 0,
    sale_price: product.sale_price || 0,
    status: product.status || "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({
        ...form,
        category_id: Number(form.category_id),
        purchase_price: Number(form.purchase_price),
        sale_price: Number(form.sale_price),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem",
    }}>
      <div style={{
        background: "var(--bg-light)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem",
        maxWidth: "500px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
      }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.3rem", fontWeight: 700 }}>
          Editar producto: {product.name}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Nombre</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: "100%", marginTop: "0.3rem" }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Categoría</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                style={{ width: "100%", marginTop: "0.3rem" }}
              >
                <option value="">Seleccionar</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Tipo</span>
              <select
                value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                style={{ width: "100%", marginTop: "0.3rem" }}
              >
                <option>producto para venta</option>
                <option>ingrediente</option>
                <option>insumo</option>
              </select>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Unidad</span>
              <select
                value={form.unit_measure}
                onChange={(e) => setForm({ ...form, unit_measure: e.target.value })}
                style={{ width: "100%", marginTop: "0.3rem" }}
              >
                {["libra", "quintal", "arroba", "unidad", "litro", "galon", "caja"].map((unit) => (
                  <option key={unit}>{unit}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Estado</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{ width: "100%", marginTop: "0.3rem" }}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Precio Compra</span>
              <input
                type="number"
                step="0.01"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                style={{ width: "100%", marginTop: "0.3rem" }}
              />
            </label>
            <label>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Precio Venta</span>
              <input
                type="number"
                step="0.01"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                style={{ width: "100%", marginTop: "0.3rem" }}
              />
            </label>
          </div>

          {error && <div className="alert error" style={{ marginBottom: "1rem" }}>{error}</div>}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: "var(--blue-primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: "var(--border)",
                color: "var(--text)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(productFormInitial);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", status: "active" });
  const [message, setMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [productsData, categoriesData] = await Promise.all([
      api.get("/products"),
      api.get("/catalog/categories"),
    ]);
    setProducts(productsData);
    setCategories(categoriesData);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const submitProduct = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/products", {
        ...form,
        category_id: Number(form.category_id),
        purchase_price: Number(form.purchase_price),
        sale_price: Number(form.sale_price),
      });
      setForm(productFormInitial);
      setMessage("✓ Producto creado correctamente.");
      setTimeout(() => setMessage(""), 3000);
      loadData().catch(console.error);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    setLoading(true);
    try {
      await api.patch(`/products/${editingProduct.id}`, updatedProduct);
      setMessage("✓ Producto actualizado correctamente.");
      setTimeout(() => setMessage(""), 3000);
      setEditingProduct(null);
      loadData().catch(console.error);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) return;
    try {
      await api.delete(`/products/${productId}`);
      setMessage("✓ Producto eliminado correctamente.");
      setTimeout(() => setMessage(""), 3000);
      loadData().catch(console.error);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/catalog/categories", categoryForm);
      setCategoryForm({ name: "", description: "", status: "active" });
      setMessage("✓ Categoría creada correctamente.");
      setTimeout(() => setMessage(""), 3000);
      loadData().catch(console.error);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Productos" subtitle="Gestion de catalogo, precios y stock base" />
      {message && (
        <div style={{
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: message.includes("✓") ? "var(--success-bg)" : "var(--danger-bg)",
          color: message.includes("✓") ? "var(--success)" : "var(--danger)",
          fontWeight: 500,
          border: `1px solid ${message.includes("✓") ? "var(--success-border)" : "var(--danger-border)"}`,
        }}>
          {message}
        </div>
      )}

      <div className="three-column">
        <SectionCard title="Nuevo producto">
          <form className="form-grid" onSubmit={submitProduct}>
            <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">Categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })}>
              <option>producto para venta</option>
              <option>ingrediente</option>
              <option>insumo</option>
            </select>
            <select value={form.unit_measure} onChange={(e) => setForm({ ...form, unit_measure: e.target.value })}>
              {["libra", "quintal", "arroba", "unidad", "litro", "galon", "caja"].map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Precio compra" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            <input type="number" step="0.01" placeholder="Precio venta" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <button type="submit">Guardar producto</button>
          </form>
        </SectionCard>

        <SectionCard title="Nueva categoria">
          <form className="form-grid" onSubmit={submitCategory}>
            <input placeholder="Nombre" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
            <textarea placeholder="Descripcion" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            <select value={categoryForm.status} onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <button type="submit">Guardar categoria</button>
          </form>
        </SectionCard>

        <SectionCard title="Categorias actuales">
          <ul className="simple-list">
            {categories.map((category) => (
              <li key={category.id}>
                <strong>{category.name}</strong>
                <span>{category.status}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Listado de productos">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg)" }}>
                <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>ID</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Nombre</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Categoría</th>
                <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Tipo</th>
                <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Unidad</th>
                <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Compra</th>
                <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Venta</th>
                <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Estado</th>
                <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: product.status === "inactive" ? "rgba(0, 0, 0, 0.02)" : "transparent",
                    opacity: product.status === "inactive" ? 0.6 : 1,
                  }}
                >
                  <td style={{ padding: "0.75rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>#{product.id}</td>
                  <td style={{ padding: "0.75rem", fontWeight: 500 }}>{product.name}</td>
                  <td style={{ padding: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{product.category_name}</td>
                  <td style={{ padding: "0.75rem", fontSize: "0.8rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.25rem 0.5rem",
                      background: "var(--blue-lighter)",
                      color: "var(--blue-primary)",
                      borderRadius: "var(--radius-sm)",
                      textTransform: "capitalize",
                    }}>
                      {product.product_type}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>{product.unit_measure}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 500 }}>{currency(product.purchase_price)}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600, color: "var(--success)" }}>{currency(product.sale_price)}</td>
                  <td style={{ padding: "0.75rem", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.3rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: product.status === "active" ? "var(--success-bg)" : "var(--danger-bg)",
                      color: product.status === "active" ? "var(--success)" : "var(--danger)",
                      borderRadius: "var(--radius-sm)",
                      textTransform: "uppercase",
                    }}>
                      {product.status === "active" ? "✓ Activo" : "✗ Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "center", display: "flex", gap: "0.35rem", justifyContent: "center" }}>
                    <button
                      onClick={() => setEditingProduct(product)}
                      style={{
                        padding: "0.4rem 0.7rem",
                        fontSize: "0.75rem",
                        background: "var(--blue-primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      style={{
                        padding: "0.4rem 0.7rem",
                        fontSize: "0.75rem",
                        background: "var(--danger)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            <p>No hay productos registrados</p>
          </div>
        )}
      </SectionCard>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};
