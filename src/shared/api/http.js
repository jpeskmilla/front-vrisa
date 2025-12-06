const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  /**
   * Clase personalizada para errores de la API del servidor.
   * @param {*} message - Mensaje de error
   * @param {*} status - Código de estado HTTP
   * @param {*} data - Datos adicionales del error (si los hay)
   */
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Intentamos parsear JSON, si no tiene body, devolvemos null
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || "Error en el servidor";

    throw new ApiError(errorMessage, response.status, data);
  }
  
  return data;
}
