import { useState, useEffect } from 'react';
import { getProductsByCategory } from '../services/productService.js';

export const ProductsByCategorySelector = ({ onSelectProduct }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsByCategory();
        setCategories(data);
        if (data.length > 0) {
          setExpandedCategory(data[0].id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Cargando categorías...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#f44336' }}>❌ Error: {error}</div>;
  }

  return (
    <div style={{ 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px', 
      padding: '20px',
      maxHeight: '500px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>
        📁 Seleccionar Producto
      </h3>

      {categories.map((category) => (
        <div key={category.id} style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: expandedCategory === category.id ? '#2196F3' : '#e0e0e0',
              color: expandedCategory === category.id ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            <span>{category.name}</span>
            <span style={{ fontSize: '12px' }}>({category.products?.length || 0})</span>
          </button>

          {expandedCategory === category.id && category.products && (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '4px', 
              marginTop: '8px',
              padding: '10px',
              border: '1px solid #ddd'
            }}>
              {category.products.length > 0 ? (
                category.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e8f5e9';
                      e.target.style.borderColor = '#4CAF50';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f9f9f9';
                      e.target.style.borderColor = '#ddd';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{product.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{product.unit_measure}</div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '3px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      whiteSpace: 'nowrap'
                    }}>
                      ${product.sale_price.toFixed(2)}
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
                  Sin productos
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
