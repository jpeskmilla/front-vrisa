import { apiFetch } from "./http";

/**
 * Registra una nueva estación de monitoreo.
 * @param {FormData} stationData - Datos de la estación y sensor (FormData)
 */
export const registerStation = (stationData) => {
  return apiFetch("/stations/", {
    method: "POST",
    body: stationData,
  });
};

/**
 * Obtiene estaciones con filtros opcionales.
 * Ej: getStations({ institution: 1, status: 'PENDING' })
 */
export const getStations = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/stations/?${params}`);
};

/**
 * Obtiene una estación por ID.
 * Endpoint: /api/stations/:id/
 * @param {number|string} id - ID de la estación
 * @returns {Promise<Object>} Datos de la estación
 */
export const getStationById = (id) => {
  return apiFetch(`/stations/${id}/`);
};

/**
 * Actualiza una estación (usado para Aprobar/Rechazar).
 * Endpoint: PATCH /api/stations/:id/
 */
export const updateStation = (id, data) => {
  return apiFetch(`/stations/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
