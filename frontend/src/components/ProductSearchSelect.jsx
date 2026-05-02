import { useState, useEffect, useRef, useMemo } from "react";
import { api } from "../api/client";

/**
 * ProductSearchSelect - Componente para búsqueda y selección de productos/platillos
 * 
 * Props:
 * - value: ID del producto seleccionado
 * - onChange: callback cuando se selecciona un producto
 * - placeholder: texto por defecto
 * - productType: filtrar por tipo de producto (ej: "producto para venta")
 * - category: filtrar por categoría
 */
export const ProductSearchSelect = ({
  value,
  onChange,
  placeholder = "Buscar platillo...",
  productType = "producto para venta",
  category = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          product_type: productType,
          status: "active",
          limit: 500,
        });
        if (category) params.append("category_id", category);

        const data = await api.get(`/products?${params.toString()}`);
        console.log("Productos cargados:", data); // Debug
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [productType, category]);

  // Obtener producto seleccionado
  useEffect(() => {
    const selected = products.find((p) => String(p.id) === String(value));
    setSelectedProduct(selected || null);
  }, [value, products]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Agrupar y filtrar productos
  const groupedProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.category_name && p.category_name.toLowerCase().includes(term))
      );
    }

    // Agrupar por categoría
    const grouped = {};
    filtered.forEach((product) => {
      const catName = product.category_name || "Sin categoría";
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(product);
    });

    return grouped;
  }, [searchTerm, products]);

  const handleSelect = (product) => {
    onChange(String(product.id));
    setSelectedProduct(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSelectedProduct(null);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          position: "relative",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "0.4rem",
          backgroundColor: isOpen ? "var(--bg-light)" : "var(--bg)",
          cursor: "text",
        }}
        onClick={() => setIsOpen(true)}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || (selectedProduct ? selectedProduct.name : "")}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "0.9rem",
            color: "var(--text)",
          }}
          autoComplete="off"
        />
        {selectedProduct && !searchTerm && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              maxWidth: "100px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            ${selectedProduct.sale_price.toFixed(2)}
          </span>
        )}
        {selectedProduct && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "0.2rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
            title="Limpiar"
          >
            ×
          </button>
        )}
        {!selectedProduct && (
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              lineHeight: 1,
            }}
          >
            ▼
          </span>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            backgroundColor: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            zIndex: 1000,
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              Cargando...
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              {searchTerm
                ? "No se encontraron platillos"
                : "No hay platillos disponibles"}
            </div>
          ) : (
            <div>
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <div key={category}>
                  {/* Encabezado de categoría */}
                  <div
                    style={{
                      padding: "0.6rem 0.85rem",
                      backgroundColor: "var(--bg-light)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      borderBottom: "1px solid var(--border)",
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    {category}
                  </div>
                  
                  {/* Items de la categoría */}
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-light)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            color: "var(--text)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.name}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                          color: "var(--text)",
                          fontSize: "0.85rem",
                        }}
                      >
                        ${parseFloat(product.sale_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
