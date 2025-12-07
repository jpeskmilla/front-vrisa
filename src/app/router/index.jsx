import { BrowserRouter, Route, Routes } from "react-router-dom";

// Páginas públicas
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RegisterInstitutionPage from "../pages/RegisterInstitutionPage.jsx";
import RegisterResearcherPage from "../pages/RegisterResearcherPage.jsx";
import RegisterStationPage from "../pages/RegisterStationPage.jsx";
import RegisterUserPage from "../pages/RegisterUserPage.jsx";

// Páginas protegidas
import CompleteRegistrationPage from "../pages/CompleteRegistrationPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import HomePage from "../pages/HomePage.jsx";

// Componentes de rutas
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterUserPage />} />
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
