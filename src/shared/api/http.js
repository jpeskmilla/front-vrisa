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
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
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
    // Redirigir solo si: hay 401, había sesión activa, y NO es el endpoint de login
    const isLoginEndpoint = endpoint.includes('/login');
    if (response.status === 401 && token && !isLoginEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      
      // Forzar recarga a la página de login
      window.location.href = "/"; 
      return; 
    }
    const errorMessage = data?.message || data?.detail || "Error en el servidor";

    throw new ApiError(errorMessage, response.status, data);
  }
  
  return data;
}
