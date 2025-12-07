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
