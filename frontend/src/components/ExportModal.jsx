import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const ExportModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("csv");

  const downloadFile = async (endpoint, format) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("inventory_token");
      const response = await fetch(`${API_URL}/api/export/${endpoint}?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error en la descarga");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.headers.get("content-disposition")?.split("filename=")[1]?.replace(/"/g, "") || `descarga.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Error al descargar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || user?.role !== "administrador") return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>📥 Descargar Mis Datos</h2>
        <p>Elige qué descargar como backup</p>

        <div className="format-selector">
          <label>
            <input 
              type="radio" 
              name="format"
              value="csv" 
              checked={selectedFormat === "csv"} 
              onChange={(e) => setSelectedFormat(e.target.value)} 
            />
            CSV (Excel)
          </label>
          <label>
            <input 
              type="radio" 
              name="format"
              value="json" 
              checked={selectedFormat === "json"} 
              onChange={(e) => setSelectedFormat(e.target.value)} 
            />
            JSON (Datos)
          </label>
        </div>

        <div className="export-options">
          <button onClick={() => downloadFile("sales", selectedFormat)} disabled={isLoading} className="btn-export">
            💰 Mis Ventas
          </button>
          <button onClick={() => downloadFile("products", selectedFormat)} disabled={isLoading} className="btn-export">
            🍽️ Platillos
          </button>
          <button onClick={() => downloadFile("inventory", selectedFormat)} disabled={isLoading} className="btn-export">
            📦 Inventario
          </button>
          <button onClick={() => downloadFile("purchases", selectedFormat)} disabled={isLoading} className="btn-export">
            🛒 Compras
          </button>
          <button onClick={() => downloadFile("all", selectedFormat)} disabled={isLoading} className="btn-export btn-all">
            📦 Todo Junto ({selectedFormat.toUpperCase()})
          </button>
        </div>

        <button onClick={onClose} className="btn-close-modal">
          Cerrar
        </button>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-content h2 {
          margin-top: 0;
          color: #222;
          font-size: 1.3rem;
        }

        .modal-content p {
          color: #555;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .format-selector {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .format-selector label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }

        .format-selector input[type="radio"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .export-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn-export {
          padding: 12px 10px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          font-weight: 500;
          color: #333;
        }

        .btn-export:hover:not(:disabled) {
          background: #f0f0f0;
          border-color: #999;
          transform: translateY(-2px);
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-export.btn-all {
          grid-column: 1 / -1;
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
          font-weight: 600;
        }

        .btn-export.btn-all:hover:not(:disabled) {
          background: #45a049;
          border-color: #45a049;
          transform: translateY(-2px);
        }

        .btn-close-modal {
          width: 100%;
          padding: 10px;
          background: #f0f0f0;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          color: #333;
        }

        .btn-close-modal:hover {
          background: #e0e0e0;
          border-color: #999;
        }
      `}</style>
    </div>
  );
};
