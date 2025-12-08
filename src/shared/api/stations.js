import { apiFetch } from "./http";

/**
 * Obtiene el listado de estaciones disponibles.
 * Endpoint: /api/stations/
 */
export const getStations = () => {
  return apiFetch("/stations/");
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
