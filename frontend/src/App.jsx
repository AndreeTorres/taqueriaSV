import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProductsDebug } from "./components/ProductsDebug";
import { AppShell } from "./layout/AppShell";
import { ContabilidadPage } from "./pages/ContabilidadPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesPage } from "./pages/SalesPage";

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route
        path="debug-productos"
        element={
          <ProtectedRoute roles={["administrador"]}>
            <ProductsDebug />
          </ProtectedRoute>
        }
      />
      <Route
        path="ventas"
        element={
          <ProtectedRoute roles={["administrador", "taquero"]}>
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="products"
        element={
          <ProtectedRoute roles={["administrador", "taquero"]}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="contabilidad"
        element={
          <ProtectedRoute roles={["administrador"]}>
            <ContabilidadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="reports"
        element={
          <ProtectedRoute roles={["administrador"]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
