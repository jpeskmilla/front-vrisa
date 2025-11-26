import { Navigate } from "react-router-dom";

/**
 * Componente de ruta protegida.
 * Redirige a la página de inicio si no hay token de autenticación.
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}