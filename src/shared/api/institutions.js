import { apiFetch } from "./http";

/**
 * Registra una nueva institución (Solicitud).
 * @param {FormData} formData - Datos del formulario incluyendo archivos.
 */
export function registerInstitution(formData) {
  return apiFetch("/institutions/register/", {
    method: "POST",
    body: formData
  });
}

/**
 * Obtiene todas las solicitudes de integración.
 * Endpoint: GET /api/institutions/requests/
 */
export function getIntegrationRequests() {
  return apiFetch("/institutions/requests/");
}

/**
 * Aprueba una solicitud específica.
 * Endpoint: POST /api/institutions/requests/{id}/approve/
 */
export function approveRequest(institutionId) {
  return apiFetch(`/institutions/requests/${institutionId}/approve/`, {
    method: "POST",
  });
}

/**
 * Obtiene el listado de instituciones registradas.
 */
export function getInstitutions() {
  return apiFetch("/institutions/institutes/");
}
