import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Table } from "../components/Table";
import { dateTime } from "../utils/format";

const initialForm = {
  product_id: "",
  movement_type: "manual_adjustment",
  quantity: 0,
  observation: "",
};

export const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState({ lowStock: [], insufficientIngredients: [], productsWithoutMovement: [] });
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    const [productsData, movementsData, alertsData] = await Promise.all([
      api.get("/products"),
      api.get("/inventory/movements"),
      api.get("/inventory/alerts"),
    ]);
    setProducts(productsData);
    setMovements(movementsData);
    setAlerts(alertsData);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const submitMovement = async (event) => {
    event.preventDefault();
    await api.post("/inventory/movements", {
      ...form,
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
    });
    setForm(initialForm);
    loadData().catch(console.error);
  };

  return (
    <div className="page">
      <PageHeader title="Inventario" subtitle="Ajustes, alertas y trazabilidad de movimientos" />

      <div className="three-column">
        <SectionCard title="Registrar movimiento">
          <form className="form-grid" onSubmit={submitMovement}>
            <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
              <option value="">Producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <select value={form.movement_type} onChange={(e) => setForm({ ...form, movement_type: e.target.value })}>
              <option value="manual_adjustment">Ajuste manual</option>
              <option value="internal_consumption">Consumo interno</option>
              <option value="loss">Perdida o merma</option>
            </select>
            <input type="number" step="0.01" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <textarea placeholder="Observacion" value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} />
            <button type="submit">Guardar movimiento</button>
          </form>
        </SectionCard>

        <SectionCard title="Alertas de stock">
          <ul className="simple-list">
            {alerts.lowStock.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.stock_current} / minimo {item.stock_minimum}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Recetas sin ingredientes">
          <ul className="simple-list">
            {alerts.insufficientIngredients.map((item, index) => (
              <li key={index}>
                <strong>{item.recipe}</strong>
                <span>{item.missing.map((row) => row.ingredient_name).join(", ")}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Historial de movimientos">
        <Table
          columns={[
            { key: "product_name", label: "Producto" },
            { key: "movement_type", label: "Tipo" },
            { key: "quantity", label: "Cantidad" },
            { key: "user_name", label: "Usuario" },
            { key: "movement_date", label: "Fecha", render: (row) => dateTime(row.movement_date) },
            { key: "observation", label: "Observacion" },
          ]}
          rows={movements}
        />
      </SectionCard>
    </div>
  );
};
