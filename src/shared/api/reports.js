import { apiFetch } from "./http";

// Función placeholder para evitar errores
export const getGeneralReports = () => {
  return apiFetch("/measurements/reports/");
};

/**
 * Función genérica para descargar archivos (blobs)
 */
const downloadBlob = async (endpoint) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: headers
    });

    if (!response.ok) throw new Error("Error generando el reporte");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Intentar sacar el nombre del archivo del header o usar genérico
    a.download = "reporte_vrisa.pdf"; 
    document.body.appendChild(a);
    a.click();
    a.remove();
};

export const downloadAirQualityReport = (stationId, date) => {
    return downloadBlob(`/measurements/reports/air-quality/?station_id=${stationId}&date=${date}`);
};

export const downloadTrendsReport = (stationId, startDate, endDate) => {
    return downloadBlob(`/measurements/reports/trends/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`);
};

export const downloadAlertsReport = (stationId = "") => {
    return downloadBlob(`/measurements/reports/alerts/?station_id=${stationId}`);
};
