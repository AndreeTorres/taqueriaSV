export const currency = (value) =>
  new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export const dateTime = (value) =>
  value ? new Date(value).toLocaleString("es-SV") : "-";
