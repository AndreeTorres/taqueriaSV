import { useState, useEffect } from 'react';
import { getProductsByCategory, getAllProducts } from '../services/productService.js';

export const ProductsDebug = () => {
  const [categoryProducts, setCategoryProducts] = useState(null);
  const [allProducts, setAllProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar productos por categoría
  const fetchCategoryProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsByCategory();
      setCategoryProducts(data);
      console.log('📊 Estructura de datos por categoría:', JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verificar todos los productos
  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts({ limit: 10 });
      setAllProducts(data);
      console.log('📋 Todos los productos:', JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-cargar al montar el componente
    fetchCategoryProducts();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px' }}>
      <h2>🔍 Verificación de Conexión - Productos</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={fetchCategoryProducts}
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          {loading ? '⏳ Cargando...' : '📁 Obtener por Categoría'}
        </button>
        
        <button 
          onClick={fetchAllProducts}
          disabled={loading}
          style={{ padding: '10px 20px', backgroundColor: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
        >
          {loading ? '⏳ Cargando...' : '📋 Obtener Todos'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', borderRadius: '4px', marginBottom: '10px' }}>
          ❌ Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Productos por Categoría */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
          <h3>Productos por Categoría</h3>
          {categoryProducts ? (
            <div>
              <p><strong>Total de categorías:</strong> {categoryProducts.length}</p>
              {categoryProducts.map((category) => (
                <div key={category.id} style={{ marginBottom: '15px', borderLeft: '3px solid #4CAF50', paddingLeft: '10px' }}>
                  <h4>{category.name}</h4>
                  <p style={{ fontSize: '12px', color: '#666' }}>{category.description}</p>
                  <p><strong>Productos: {category.products?.length || 0}</strong></p>
                  <ul style={{ fontSize: '12px', color: '#333' }}>
                    {category.products?.slice(0, 3).map((product) => (
                      <li key={product.id}>{product.name} - ${product.sale_price}</li>
                    ))}
                    {category.products?.length > 3 && <li>... y {category.products.length - 3} más</li>}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>Sin datos</p>
          )}
        </div>

        {/* Todos los Productos */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
          <h3>Todos los Productos</h3>
          {allProducts ? (
            <div>
              <p><strong>Total de productos:</strong> {allProducts.length}</p>
              <ul style={{ fontSize: '12px', color: '#333', maxHeight: '300px', overflowY: 'auto' }}>
                {allProducts.map((product) => (
                  <li key={product.id}>
                    {product.name} - {product.category_name} - ${product.sale_price}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Sin datos</p>
          )}
        </div>
      </div>

      {/* JSON Raw */}
      {categoryProducts && (
        <div style={{ marginTop: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '4px' }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>📝 JSON Raw (Productos por Categoría)</summary>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '11px', marginTop: '10px' }}>
              {JSON.stringify(categoryProducts, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
