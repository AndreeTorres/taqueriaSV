import { useState, useMemo } from "react";
import { Badge } from "./Badge";

const STATUS_KEYS = new Set(["status", "estado", "movement_type", "product_type"]);

export const Table = ({ 
  columns, 
  rows, 
  searchable = true,
  searchFields = [],
  sortable = true,
  pagination = true,
  pageSize = 10,
  onRowClick = null
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Búsqueda
    if (searchTerm && searchFields.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((row) =>
        searchFields.some((field) =>
          String(row[field] || "").toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Ordenamiento
    if (sortBy) {
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [rows, searchTerm, searchFields, sortBy, sortOrder]);

  const paginatedRows = useMemo(() => {
    if (!pagination) return filteredRows;
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  const handleSort = (key) => {
    if (!sortable) return;
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const renderHeader = (column) => {
    if (!sortable || !column.sortable) {
      return column.label;
    }
    return (
      <button
        onClick={() => handleSort(column.key)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          color: sortBy === column.key ? "var(--blue-primary)" : "inherit",
          fontWeight: sortBy === column.key ? "600" : "inherit",
        }}
      >
        {column.label}
        {sortBy === column.key && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
      </button>
    );
  };

  return (
    <div>
      {searchable && searchFields.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "0.65rem 0.85rem",
              border: "2px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.95rem",
            }}
          />
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} onClick={() => handleSort(column.key)}>
                  {renderHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length ? (
              paginatedRows.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row)
                        : STATUS_KEYS.has(column.key)
                        ? <Badge value={row[column.key]} />
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="empty-row">
                  {searchTerm ? "No se encontraron registros" : "Sin registros"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};
