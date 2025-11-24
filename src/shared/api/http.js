const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Manejo automático de errores
  if (!response.ok) {
    let errorMessage  = "Error en el servidor";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch (_) {}

    throw new Error(errorMessage);
  }

  // Intentamos parsear JSON, si no tiene body, devolvemos null
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}
