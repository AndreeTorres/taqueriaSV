# 🎯 Opciones para Organizar Productos por Categorías

## Opción 1: API con Agrupación (RECOMENDADO) ⭐⭐⭐
**Mejor para: Rendimiento y flexibilidad**

### Backend - Crear endpoint `/api/products/grouped`
```javascript
// routes/product-routes.js
router.get('/grouped', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.description,
        json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'sale_price', p.sale_price,
            'purchase_price', p.purchase_price,
            'unit_measure', p.unit_measure,
            'status', p.status
          )
        ) as products
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.business_id = $1
      WHERE c.business_id = $1
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `, [req.user.business_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend - Mostrar acordeón o tabs
```jsx
// ProductsPage.jsx
import { useState } from 'react';

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchGroupedProducts();
  }, []);

  const fetchGroupedProducts = async () => {
    try {
      const response = await fetch('/api/products/grouped');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="products-container">
      {categories.map((category) => (
        <div key={category.category_id} className="category-section">
          <button
            className="category-header"
            onClick={() => setExpandedCategory(
              expandedCategory === category.category_id ? null : category.category_id
            )}
          >
            <span>{category.category_name}</span>
            <span className="product-count">{category.products.length} productos</span>
            <span className={`arrow ${expandedCategory === category.category_id ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          
          {expandedCategory === category.category_id && (
            <div className="products-grid">
              {category.products.map((product) => (
                <div key={product.id} className="product-card">
                  <h4>{product.name}</h4>
                  <p className="price">${product.sale_price}</p>
                  <p className="unit">{product.unit_measure}</p>
                  <button>Agregar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### CSS
```css
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
  transition: all 0.3s ease;
}

.category-header:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.product-count {
  background: rgba(255,255,255,0.3);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
}

.arrow {
  transition: transform 0.3s ease;
  display: inline-block;
}

.arrow.open {
  transform: rotate(180deg);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## Opción 2: Tabs por Categoría
**Mejor para: Navegación rápida**

```jsx
export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="products-container">
      <div className="category-tabs">
        {categories.map((cat, idx) => (
          <button
            key={cat.category_id}
            className={`tab ${activeTab === idx ? 'active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {categories[activeTab]?.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Opción 3: Filtro Dropdown
**Mejor para: Espacios reducidos**

```jsx
export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProducts = selectedCategory
    ? categories.find(c => c.category_id === selectedCategory)?.products || []
    : [];

  return (
    <div className="products-container">
      <select 
        value={selectedCategory || ''} 
        onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
        className="category-filter"
      >
        <option value="">Ver todas las categorías</option>
        {categories.map((cat) => (
          <option key={cat.category_id} value={cat.category_id}>
            {cat.category_name} ({cat.products.length})
          </option>
        ))}
      </select>

      <div className="products-grid">
        {(selectedCategory ? filteredProducts : 
          categories.flatMap(c => c.products)).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Opción 4: Búsqueda + Filtro (PARA VENTAS)
**Mejor para: Sistema de punto de venta**

```jsx
export default function SalesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProducts = categories
    .filter(c => !selectedCategory || c.category_id === selectedCategory)
    .map(c => ({
      ...c,
      products: c.products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(c => c.products.length > 0);

  return (
    <div className="sales-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-filter-buttons">
        <button
          className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category_id}
            className={`filter-btn ${selectedCategory === cat.category_id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.category_id)}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {filteredProducts.map((category) => (
        <div key={category.category_id} className="category-section">
          <h3>{category.category_name}</h3>
          <div className="products-grid">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Comparativa de Opciones

| Opción | Rendimiento | Flexibilidad | UX | Complejidad |
|--------|------------|-------------|-----|-----------|
| 1. Acordeón | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Media |
| 2. Tabs | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Baja |
| 3. Dropdown | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | Baja |
| 4. Búsqueda+Filtro | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Alta |

---

## 📊 Mi Recomendación

**Para Catálogo:** Opción 1 (Acordeón) - Profesional y elegante
**Para Ventas:** Opción 4 (Búsqueda+Filtro) - Rápido y eficiente
**Para Mobile:** Opción 3 (Dropdown) - Ahorra espacio

¿Cuál prefieres implementar?
