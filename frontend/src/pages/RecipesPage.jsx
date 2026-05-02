import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Table } from "../components/Table";

const emptyItem = { ingredient_product_id: "", quantity: 0.1 };

export const RecipesPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    description: "",
    items: [emptyItem],
  });

  const loadData = async () => {
    const [recipesData, productsData] = await Promise.all([api.get("/recipes"), api.get("/products")]);
    setRecipes(recipesData);
    setProducts(productsData.filter((item) => item.status === "active"));
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const updateItem = (index, key, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [key]: value };
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem] });

  const submitRecipe = async (event) => {
    event.preventDefault();
    await api.post("/recipes", {
      ...form,
      product_id: Number(form.product_id),
      items: form.items.map((item) => ({
        ingredient_product_id: Number(item.ingredient_product_id),
        quantity: Number(item.quantity),
      })),
    });
    setForm({ product_id: "", name: "", description: "", items: [emptyItem] });
    loadData().catch(console.error);
  };

  return (
    <div className="page">
      <PageHeader title="Recetas" subtitle="Relacion entre platos preparados e ingredientes" />

      <SectionCard title="Nueva receta">
        <form className="form-grid" onSubmit={submitRecipe}>
          <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
            <option value="">Producto final</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input placeholder="Nombre de receta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea placeholder="Descripcion" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {form.items.map((item, index) => (
            <div key={index} className="inline-grid">
              <select value={item.ingredient_product_id} onChange={(e) => updateItem(index, "ingredient_product_id", e.target.value)} required>
                <option value="">Ingrediente</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input type="number" step="0.0001" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required />
            </div>
          ))}
          <button type="button" className="secondary-button" onClick={addItem}>
            Agregar ingrediente
          </button>
          <button type="submit">Guardar receta</button>
        </form>
      </SectionCard>

      <SectionCard title="Recetas existentes">
        <Table
          columns={[
            { key: "product_name", label: "Producto" },
            { key: "name", label: "Receta" },
            { key: "description", label: "Descripcion" },
            {
              key: "items",
              label: "Ingredientes",
              render: (row) => row.items.map((item) => `${item.ingredient_name} (${item.quantity} ${item.unit_measure})`).join(", "),
            },
          ]}
          rows={recipes}
        />
      </SectionCard>
    </div>
  );
};
