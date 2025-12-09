import { apiFetch } from "./http";

/**
 * Obtiene el listado general de reportes disponibles (metadata).
 * @returns {Promise<Array>} Lista de reportes.
 */
export const getGeneralReports = () => {
  return apiFetch("/measurements/reports/");
};

/**
 * Función genérica para descargar archivos (Blob) desde la API.
 * 
 * @param {string} endpoint - La URL relativa del endpoint de la API.
 * @throws {Error} Si la respuesta de la API no es exitosa.
 * @returns {Promise<void>}
 */
const downloadBlob = async (endpoint) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
        console.log(`Iniciando descarga desde: ${endpoint}`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error del servidor (${response.status}): ${errorText}`);
        }

        // Intentar obtener el nombre del archivo del header Content-Disposition
        const disposition = response.headers.get('Content-Disposition');
        console.log("Header Content-Disposition:", disposition);

        let filename = "reporte_vrisa.pdf"; // Nombre por defecto (fallback)

        if (disposition) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }
        
        console.log("Nombre final del archivo:", filename);

        // Convertir a Blob y forzar descarga mediante un enlace invisible
        const blob = await response.blob();
        console.log("Tamaño del archivo recibido:", blob.size);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Limpieza del objeto URL y del elemento DOM
        setTimeout(() => {
            a.remove();
            window.URL.revokeObjectURL(url);
        }, 100);

    } catch (error) {
        console.error("Error crítico en downloadBlob:", error);
        throw error;
    }
};

/**
 * Descarga el Reporte de Calidad del Aire (Resumen Estadístico).
 * Soporta tanto la consulta de un día específico (legacy) como un rango de fechas.
 * 
 * @param {number|string} stationId - Identificador de la estación de monitoreo.
 * @param {string} startDate - Fecha de inicio (formato YYYY-MM-DD).
 * @param {string|null} [endDate=null] - Fecha de fin (formato YYYY-MM-DD). Si es null, se asume reporte de un solo día.
 * @param {string} [variableCode=""] - (Opcional) Código de la variable para filtrar (ej: "PM2.5").
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadAirQualityReport = (stationId, startDate, endDate = null, variableCode = "") => {
    let url = "";
    
    // Si se pasa endDate, usamos el formato de rango para el backend
    if (endDate) {
        url = `/measurements/reports/air-quality/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
    } else {
        // Fallback para modo "día único" si se invoca sin fecha final
        url = `/measurements/reports/air-quality/?station_id=${stationId}&date=${startDate}`;
    }

    if (variableCode) url += `&variable_code=${variableCode}`;
    return downloadBlob(url);
};

/**
 * Descarga el Reporte de Tendencias (Gráficas de comportamiento).
 * Requiere obligatoriamente un rango de fechas.
 * 
 * @param {number|string} stationId - Identificador de la estación.
 * @param {string} startDate - Fecha de inicio del análisis (YYYY-MM-DD).
 * @param {string} endDate - Fecha de fin del análisis (YYYY-MM-DD).
 * @param {string} [variableCode=""] - (Opcional) Filtro por variable específica.
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadTrendsReport = (stationId, startDate, endDate, variableCode = "") => {
    let url = `/measurements/reports/trends/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
    if (variableCode) url += `&variable_code=${variableCode}`;
    return downloadBlob(url);
};

/**
 * Descarga el Reporte de Alertas Críticas (valores que han excedido los límites de la norma).
 * Por defecto analiza las últimas 24 horas.
 * 
 * @param {number|string}- (Opcional) ID de la estación. Si se omite, busca en todas las estaciones.
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadAlertsReport = (stationId = "") => {
    return downloadBlob(`/measurements/reports/alerts/?station_id=${stationId}`);
};
