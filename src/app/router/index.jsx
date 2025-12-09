import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "../../shared/layout/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Páginas públicas
import LoginPage from "../pages/LoginPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RegisterUserPage from "../pages/RegisterUserPage.jsx";
// Páginas protegidas
import AdminPanelPage from "../pages/AdminPanelPage.jsx";
import AirQualityPage from "../pages/AirQualityPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import InstitutionAdminPage from "../pages/InstitutionAdminPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import RegisterInstitutionPage from "../pages/RegisterInstitutionPage.jsx";
import RegisterResearcherPage from "../pages/RegisterResearcherPage.jsx";
import RegisterStationPage from "../pages/RegisterStationPage.jsx";
import ReportsPage from "../pages/ReportsPage.jsx"; 


/**
 * Componente de enrutador principal de la aplicación.
 * @returns {JSX.Element} Estructura de rutas de la aplicación.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterUserPage />} />

        {/* RUTAS PROTEGIDAS (Requieren Token activo) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        {/* Dashboard y submodulos */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/air-quality" element={<AirQualityPage />} />
          {/* <Route path="/dashboard/stations" element={<StationsPage />} /> */}
          {<Route path="/dashboard/reports" element={<ReportsPage />} />}
        </Route>
        {/* Paneles de administración */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institution-admin"
          element={
            <ProtectedRoute>
              <InstitutionAdminPage />
            </ProtectedRoute>
          }
        />

        {/* Perfil de Usuario */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Flujo de Completar Registro  */}
        <Route
          path="/complete-registration/institution"
          element={
            <ProtectedRoute>
              <RegisterInstitutionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-registration/station"
          element={
            <ProtectedRoute>
              <RegisterStationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-registration/researcher"
          element={
            <ProtectedRoute>
              <RegisterResearcherPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK (404) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
