import { apiFetch } from "./http";

export const getVariables = () => {
  return apiFetch("/measurements/variables/");
};

export const getHistoricalData = (filters) => {
  // Convierte el objeto filters { station_id: 1, ... } a query string
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/measurements/data/history/?${params}`);
};

/**
 * Obtiene el índice de calidad del aire (AQI) actual para una estación dada.
 * @param {number} stationId - ID de la estación.
 * @returns {Promise<object>} Datos del AQI actual.
 */
export const getCurrentAQI = (stationId) => {
  return apiFetch(`/measurements/aqi/current/?station_id=${stationId}`);
};
