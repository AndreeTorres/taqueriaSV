export const currency = (value) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export const dateTime = (value) =>
  value ? new Date(value).toLocaleString("es-SV") : "-";

export const date = (value) => {
  if (!value) return "-";
  const d = String(value).slice(0, 10);
  const [year, month, day] = d.split("-");
  return `${day}/${month}/${year}`;
};
