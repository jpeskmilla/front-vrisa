import { apiFetch } from "./http";

/**
 * Función para iniciar sesión del usuario.
 * @param {string} email - correo electrónico del usuario. E.g. 'pepito.perez@example.com'
 * @param {string} password - contraseña del usuario. E.g. 'mi_contraseña_segura'
 * @returns una promesa que resuelve los datos del usuario y token de autenticación.
 */
export function login(email, password) {
  return apiFetch("/users/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Función para registrar un nuevo usuario.
 * @param {Object} userData - objeto con los datos del usuario. E.g. {
 *  firs_name: 'Pepito',
 *  last_name: 'Perez',
 *  email: 'pepito.perez@example.com',
 *  password: 'mi_contraseña_segura'
 * }
 * @returns una promesa que resuelve los datos del usuario registrado.
 */
export function register(userData) {
  return apiFetch("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Función para registrar un nuevo investigador.
 * @param {FormData} formData - FormData con los datos del investigador y archivos. Campos:
 *  - full_name: Nombre completo
 *  - document_type: Tipo de documento
 *  - document_number: Número de documento
 *  - institution: Institución a la que pertenece
 *  - email: Correo institucional
 *  - front_card: Imagen frontal de tarjeta profesional
 *  - back_card: Imagen trasera de tarjeta profesional
 * @returns una promesa que resuelve los datos del investigador registrado.
 */
export function registerResearcher(formData) {
  return apiFetch("/users/register/researcher/", {
    method: "POST",
    body: formData,
  });
}

/**
 * Función para cerrar la sesión del usuario.
 * Se elimina el token de autenticación del almacenamiento local.
 * @returns una promesa resuelta inmediatamente.
 */
export function logout() {
  localStorage.removeItem("/token/");
  return Promise.resolve();
}
