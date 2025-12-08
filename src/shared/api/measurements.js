import { apiFetch } from "./http";

export const getVariables = () => {
  return apiFetch("/measurements/variables/");
};

export const getHistoricalData = (filters) => {
  // Convierte el objeto filters { station_id: 1, ... } a query string
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/measurements/data/history/?${params}`);
};