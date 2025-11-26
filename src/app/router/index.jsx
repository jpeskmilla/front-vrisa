import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas públicas
import HomePage from "../pages/HomePage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RegisterResearcherPage from "../pages/RegisterResearcherPage.jsx";

// Páginas protegidas
import DashboardPage from "../pages/DashboardPage.jsx";
import CompleteRegistrationPage from "../pages/CompleteRegistrationPage.jsx";

// Componentes de rutas
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-researcher" element={<RegisterResearcherPage />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/complete-registration" 
          element={
            <ProtectedRoute>
              <CompleteRegistrationPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
