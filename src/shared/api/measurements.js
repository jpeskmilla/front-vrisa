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
  const query = stationId ? `?station_id=${stationId}` : '';
  return apiFetch(`/measurements/aqi/current/${query}`);
};

/**
 * Obtiene las mediciones más recientes para una estación dada o todas las estaciones si no se proporciona ID.
 * @param {string} stationId - ID de la estación (opcional).
 * @returns {Promise<object>} Mediciones más recientes.
 */
export const getLatestMeasurements = (stationId) => {
  const query = stationId ? `?station_id=${stationId}` : '';
  return apiFetch(`/measurements/latest/${query}`);
}
