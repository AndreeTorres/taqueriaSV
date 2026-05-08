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
    return <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>⏳ Cargando categorías...</div>;
  }

  if (error) {
    return <div style={{ padding: '1.25rem', color: 'var(--danger)', fontSize: '0.95rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)' }}>❌ Error: {error}</div>;
  }

  return (
    <div style={{ 
      backgroundColor: 'var(--bg)', 
      borderRadius: 'var(--radius-lg)', 
      padding: '1.25rem',
      maxHeight: '500px',
      overflowY: 'auto',
      border: '1px solid var(--border)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', letterSpacing: '0.5px' }}>
        📁 Seleccionar Producto por Categoría
      </h3>

      {categories.map((category) => (
        <div key={category.id} style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: expandedCategory === category.id ? 'var(--blue-primary)' : 'var(--surface)',
              color: expandedCategory === category.id ? 'white' : 'var(--text)',
              border: `1px solid ${expandedCategory === category.id ? 'var(--blue-primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              boxShadow: expandedCategory === category.id ? 'var(--shadow-sm)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (expandedCategory !== category.id) {
                e.currentTarget.style.backgroundColor = 'var(--blue-lighter)';
                e.currentTarget.style.borderColor = 'var(--blue-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (expandedCategory !== category.id) {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
          >
            <span>{category.name}</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>({category.products?.length || 0})</span>
          </button>

          {expandedCategory === category.id && category.products && (
            <div style={{ 
              backgroundColor: 'var(--surface)', 
              borderRadius: 'var(--radius-md)', 
              marginTop: '0.5rem',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              animation: 'slideDown 0.2s ease'
            }}>
              {category.products.length > 0 ? (
                category.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      marginBottom: '0.6rem',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'var(--text)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--success-bg)';
                      e.currentTarget.style.borderColor = 'var(--success)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--text)' }}>{product.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.unit_measure}</div>
                    </div>
                    <div style={{ 
                      backgroundColor: 'var(--blue-primary)', 
                      color: 'white', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      marginLeft: '0.75rem'
                    }}>
                      ${product.sale_price.toFixed(2)}
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                  Sin productos disponibles
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
