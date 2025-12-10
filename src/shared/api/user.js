// src/shared/api/user.js
import { apiFetch } from "./http";

/**
 * Función para obtener los datos del usuario por ID.
 * @param {number|string} userId - ID del usuario
 */
export function getUserById(userId) {
  return apiFetch(`/users/${userId}/`);
}

/**
 * Función para actualizar los datos del usuario por ID.
 * @param {number|string} userId - ID del usuario
 * @param {Object} data - Datos a actualizar
 */
export function updateUser(userId, data) {
  return apiFetch(`/users/${userId}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Obtiene estadísticas generales de usuarios (solo admins).
 * Endpoint: GET /api/users/stats/
 */
export function getUserStats() {
  return apiFetch("/users/stats/", {
    method: "GET",
  });
}

/**
 * Obtiene las solicitudes de investigadores pendientes de aprobación (solo admins).
 * Endpoint: GET /api/users/researchers/pending/
 */
export function getPendingResearcherRequests() {
  return apiFetch("/users/researchers/pending/", {
    method: "GET",
  });
}

/**
 * Aprueba una solicitud de investigador (solo admins).
 * @param {number} userRoleId - ID de la asignación de rol a aprobar
 * Endpoint: POST /api/users/researchers/{userRoleId}/approve/
 */
export function approveResearcherRequest(userRoleId) {
  return apiFetch(`/users/researchers/${userRoleId}/approve/`, {
    method: "POST",
  });
}

/**
 * Rechaza una solicitud de investigador (solo admins).
 * @param {number} userRoleId - ID de la asignación de rol a rechazar
 * Endpoint: POST /api/users/researchers/{userRoleId}/reject/
 */
export function rejectResearcherRequest(userRoleId) {
  return apiFetch(`/users/researchers/${userRoleId}/reject/`, {
    method: "POST",
  });
}
