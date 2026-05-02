import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Table } from "../components/Table";
import { currency, dateTime } from "../utils/format";

const emptyItem = { product_id: "", quantity: 1, unit_price: 0 };

export const PurchasesPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    phone: "",
    address: "",
    supplied_product: "",
    status: "active",
  });
  const [purchaseForm, setPurchaseForm] = useState({
    supplier_id: "",
    purchase_date: "",
    observation: "",
    items: [emptyItem],
  });

  const loadData = async () => {
    const [suppliersData, productsData, purchasesData] = await Promise.all([
      api.get("/catalog/suppliers"),
      api.get("/products"),
      api.get("/purchases"),
    ]);
    setSuppliers(suppliersData);
    setProducts(productsData);
    setPurchases(purchasesData);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const updateItem = (index, key, value) => {
    const items = [...purchaseForm.items];
    items[index] = { ...items[index], [key]: value };
    setPurchaseForm({ ...purchaseForm, items });
  };

  const addItem = () => {
    setPurchaseForm({ ...purchaseForm, items: [...purchaseForm.items, emptyItem] });
  };

  const submitSupplier = async (event) => {
    event.preventDefault();
    await api.post("/catalog/suppliers", supplierForm);
    setSupplierForm({ name: "", phone: "", address: "", supplied_product: "", status: "active" });
    loadData().catch(console.error);
  };

  const submitPurchase = async (event) => {
    event.preventDefault();
    await api.post("/purchases", {
      ...purchaseForm,
      supplier_id: Number(purchaseForm.supplier_id),
      items: purchaseForm.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    });
    setPurchaseForm({ supplier_id: "", purchase_date: "", observation: "", items: [emptyItem] });
    loadData().catch(console.error);
  };

  return (
    <div className="page">
      <PageHeader title="Compras" subtitle="Ingreso de mercaderia y actualizacion automatica de stock" />

      <div className="two-column">
        <SectionCard title="Nuevo proveedor">
          <form className="form-grid" onSubmit={submitSupplier}>
            <input placeholder="Nombre" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
            <input placeholder="Telefono" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
            <input placeholder="Direccion" value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
            <input placeholder="Producto que provee" value={supplierForm.supplied_product} onChange={(e) => setSupplierForm({ ...supplierForm, supplied_product: e.target.value })} />
            <button type="submit">Guardar proveedor</button>
          </form>
        </SectionCard>

        <SectionCard title="Registrar compra">
          <form className="form-grid" onSubmit={submitPurchase}>
            <select value={purchaseForm.supplier_id} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_id: e.target.value })} required>
              <option value="">Proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <input type="datetime-local" value={purchaseForm.purchase_date} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })} />
            <textarea placeholder="Observacion" value={purchaseForm.observation} onChange={(e) => setPurchaseForm({ ...purchaseForm, observation: e.target.value })} />
            {purchaseForm.items.map((item, index) => (
              <div key={index} className="inline-grid">
                <select value={item.product_id} onChange={(e) => updateItem(index, "product_id", e.target.value)} required>
                  <option value="">Producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required />
                <input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, "unit_price", e.target.value)} required />
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={addItem}>
              Agregar item
            </button>
            <button type="submit">Guardar compra</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Historial de compras">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "supplier_name", label: "Proveedor" },
            { key: "purchase_date", label: "Fecha", render: (row) => dateTime(row.purchase_date) },
            { key: "total", label: "Total", render: (row) => currency(row.total) },
            { key: "user_name", label: "Usuario" },
          ]}
          rows={purchases}
        />
      </SectionCard>
    </div>
  );
};
