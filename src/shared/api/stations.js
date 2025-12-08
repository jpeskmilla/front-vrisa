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
 */
export const getStationById = (id) => {
  return apiFetch(`/stations/${id}/`);
};
