const variantMap = {
  active:     "badge-success",
  activo:     "badge-success",
  inactive:   "badge-neutral",
  inactivo:   "badge-neutral",
  low_stock:  "badge-danger",
  "bajo stock": "badge-danger",
  venta:      "badge-info",
  compra:     "badge-warning",
  sale:       "badge-info",
  purchase:   "badge-warning",
  entrada:    "badge-success",
  salida:     "badge-danger",
  manual_adjustment: "badge-neutral",
  internal_consumption: "badge-warning",
  loss:       "badge-danger",
  pendiente:  "badge-neutral",
  en_cocina:  "badge-warning",
  listo:      "badge-success",
  entregado:  "badge-info",
};

const labelMap = {
  active:     "Activo",
  activo:     "Activo",
  inactive:   "Inactivo",
  inactivo:   "Inactivo",
  low_stock:  "Bajo stock",
  manual_adjustment: "Ajuste",
  internal_consumption: "Consumo",
  loss:       "Merma",
  "producto para venta": "Venta",
  ingrediente: "Ingrediente",
  insumo:     "Insumo",
  pendiente:  "Pendiente",
  en_cocina:  "En cocina",
  listo:      "Listo",
  entregado:  "Entregado",
};

const accentClassMap = {
  success: "badge-success",
  warning: "badge-warning",
  danger:  "badge-danger",
  info:    "badge-info",
  neutral: "badge-neutral",
};

export const Badge = ({ value, accent, children }) => {
  if (accent !== undefined) {
    return <span className={`badge ${accentClassMap[accent] ?? "badge-neutral"}`}>{children}</span>;
  }
  if (value == null || value === "") return <span className="badge badge-neutral">—</span>;
  const key = String(value).toLowerCase();
  const variant = variantMap[key] ?? "badge-neutral";
  const label = labelMap[key] ?? value;
  return <span className={`badge ${variant}`}>{label}</span>;
};
