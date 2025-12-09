import { apiFetch } from "./http";

export const getGeneralReports = () => {
  return apiFetch("/measurements/reports/");
};

/**
 * Función genérica mejorada para descargar archivos respetando el nombre del servidor.
 */
const downloadBlob = async (endpoint) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'GET',
        headers: headers
    });

    if (!response.ok) throw new Error("Error generando el reporte");

    // 1. Extraer el nombre del archivo del header Content-Disposition
    const disposition = response.headers.get('Content-Disposition');
    let filename = "reporte_vrisa.pdf"; // Fallback

    if (disposition && disposition.indexOf('attachment') !== -1) {
        // Regex para sacar filename="algo.pdf"
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Usamos el nombre extraído
    document.body.appendChild(a);
    a.click();
    a.remove();
};

// Actualizamos las funciones para aceptar variableCode opcional
export const downloadAirQualityReport = (stationId, date, variableCode = "") => {
    let url = `/measurements/reports/air-quality/?station_id=${stationId}&date=${date}`;
    if (variableCode) url += `&variable_code=${variableCode}`;
    return downloadBlob(url);
};

export const downloadTrendsReport = (stationId, startDate, endDate, variableCode = "") => {
    let url = `/measurements/reports/trends/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
    if (variableCode) url += `&variable_code=${variableCode}`;
    return downloadBlob(url);
};

export const downloadAlertsReport = (stationId = "") => {
    return downloadBlob(`/measurements/reports/alerts/?station_id=${stationId}`);
};