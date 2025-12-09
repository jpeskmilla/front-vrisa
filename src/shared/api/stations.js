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

/**
 * Crea una solicitud de afiliación (Para Station Admins).
 * @param {Object} data - { station: id, target_institution: id }
 */
export const createAffiliationRequest = (data) => {
  return apiFetch("/stations/affiliations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Obtiene el listado de solicitudes (Para ambos roles).
 * El backend ya filtra automáticamente según quién seas.
 */
export const getAffiliationRequests = () => {
  return apiFetch("/stations/affiliations/");
};

/**
 * Responde a una solicitud (Para Institution Admins).
 * @param {number} requestId - ID de la solicitud
 * @param {string} status - 'ACCEPTED' | 'REJECTED'
 * @param {string} comments - Comentarios opcionales
 */
export const reviewAffiliationRequest = (requestId, status, comments = "") => {
  return apiFetch(`/stations/affiliations/${requestId}/review/`, {
    method: "POST",
    body: JSON.stringify({ status, comments }),
  });
};
