import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "../../shared/layout/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Páginas públicas
import LoginPage from "../pages/auth/LoginPage";
import RegisterUserPage from "../pages/auth/RegisterUserPage";
import NotFoundPage from "../pages/general/NotFoundPage";
// Páginas protegidas
import AdminPanelPage from "../pages/admin/AdminPanelPage";
import GlobalStationsPage from "../pages/admin/GlobalStationsPage";
import InstitutionAdminPage from "../pages/admin/InstitutionAdminPage";
import InstitutionsListPage from "../pages/admin/InstitutionsListPage";
import AirQualityPage from "../pages/analytics/AirQualityPage";
import DashboardPage from "../pages/analytics/DashboardPage";
import ReportsPage from "../pages/analytics/ReportsPage";
import HomePage from "../pages/general/HomePage";
import ProfilePage from "../pages/general/ProfilePage";
import RegisterInstitutionPage from "../pages/registration/RegisterInstitutionPage";
import RegisterResearcherPage from "../pages/registration/RegisterResearcherPage";
import RegisterStationPage from "../pages/registration/RegisterStationPage";
import MaintenanceLogsPage from "../pages/station/MaintenanceLogsPage";
import MyStationPage from "../pages/station/MyStationPage";
import RegisterMaintenancePage from "../pages/station/RegisterMaintenancePage";
import RegisterSensorPage from "../pages/station/RegisterSensorPage";

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

        {/* RUTAS PROTEGIDAS CON LAYOUT COMPARTIDO */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/admin/institutions" element={<InstitutionsListPage />} />
          <Route path="/admin/stations" element={<GlobalStationsPage />} />
          <Route path="/institution-admin" element={<InstitutionAdminPage />} />
          <Route path="/institution-admin/stations" element={<GlobalStationsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/air-quality" element={<AirQualityPage />} />
          <Route path="/dashboard/stations" element={<MyStationPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/maintenance" element={<MaintenanceLogsPage />} />
          <Route path="/dashboard/maintenance/new" element={<RegisterMaintenancePage />} />
          <Route path="/dashboard/sensors/new" element={<RegisterSensorPage />} />
        </Route>

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
