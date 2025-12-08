import { apiFetch } from "./http";

// Función placeholder para evitar errores
export const getGeneralReports = () => {
  return apiFetch("/measurements/reports/");
};