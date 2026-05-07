const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const buildHeaders = (token, isJson = true) => {
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("inventory_token");
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...buildHeaders(token, options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error inesperado");
  }

  return data;
};

export const api = {
  get: (path) => apiRequest(path),
  post: (path, payload) =>
    apiRequest(path, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  put: (path, payload) =>
    apiRequest(path, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  patch: (path, payload) =>
    apiRequest(path, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  delete: (path) =>
    apiRequest(path, {
      method: "DELETE",
    }),
};
