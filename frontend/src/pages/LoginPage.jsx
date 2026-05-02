import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ textAlign: "center" }}>
          <div className="login-logo" style={{ fontSize: "2rem", background: "linear-gradient(135deg,#E85D04,#C94B00)", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
            🌮
          </div>
          <span className="eyebrow">Taquería</span>
          <h1 style={{ fontSize: "1.6rem" }}>Los Campos</h1>
          <p style={{ marginTop: "0.25rem" }}>Ingrese sus credenciales para continuar.</p>
        </div>

        <label>
          Correo electrónico
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="correo@ejemplo.com"
            required
            autoFocus
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
        </label>

        {error ? <div className="alert error">{error}</div> : null}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "0.65rem 1rem" }}>
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};
