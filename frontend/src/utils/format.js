export const currency = (value) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export const dateTime = (value) =>
  value ? new Date(value).toLocaleString("es-SV") : "-";

export const date = (value) => {
  if (!value) return "-";
  // Parsear el string de fecha y asegurarse de que se interprete en la zona horaria local
  const dateObj = new Date(value);
  // Obtener la fecha en formato local sin afectar por timezone
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};
