import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas públicas
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RegisterResearcherPage from "../pages/RegisterResearcherPage.jsx";
import RegisterInstitutionPage from "../pages/RegisterInstitutionPage.jsx";
import RegisterStationPage from "../pages/RegisterStationPage.jsx";

// Páginas protegidas
import HomePage from "../pages/HomePage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CompleteRegistrationPage from "../pages/CompleteRegistrationPage.jsx";

// Componentes de rutas
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-researcher" element={<RegisterResearcherPage />} />
        <Route path="/register-institution" element={<RegisterInstitutionPage />} />
        <Route path="/register-station" element={<RegisterStationPage />} />
        
        {/* Rutas protegidas */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
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
