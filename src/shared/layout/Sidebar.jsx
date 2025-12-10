import { Building2, ClipboardList, Cpu, FileText, Home, LayoutDashboard, LogOut, MapPin, PlusCircle, Shield, Wind } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ORGANIZATION_ROLES } from "../constants/roles";
import "./layout.css";

export default function Sidebar() {
  const navigate = useNavigate();

  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userRole = userData?.primary_role;
  const isStationAdmin = userRole === ORGANIZATION_ROLES.STATION_ADMIN;
  const isSuperAdmin = userRole === "super_admin";
  const isInstitutionHead = userRole === "institution_head";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="layout-sidebar">
      <nav className="sidebar-nav">
        {/* Ir al Inicio */}
        <NavLink to="/home" className="sidebar-link return-home">
          <Home size={20} />
          <span>Ir al Inicio</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
          <FileText size={20} />
          <span>Perfil</span>
        </NavLink>

        <div className="sidebar-divider"></div>

        {/* Sección de Gestión - Solo para Administradores */}
        {(isSuperAdmin || isInstitutionHead) && (
          <>
            <div className="sidebar-section-label">Gestión</div>

            <NavLink to={isSuperAdmin ? "/admin" : "/institution-admin"} end className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Shield size={20} />
              <span>Panel de Administración</span>
            </NavLink>

            {isSuperAdmin && (
              <>
                <NavLink to="/admin/institutions" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
                  <Building2 size={20} />
                  <span>Instituciones</span>
                </NavLink>

                <NavLink to="/admin/stations" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
                  <MapPin size={20} />
                  <span>Estaciones</span>
                </NavLink>
              </>
            )}

            {isInstitutionHead && (
              <NavLink to="/institution-admin/stations" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
                <MapPin size={20} />
                <span>Mis Estaciones</span>
              </NavLink>
            )}

            <div className="sidebar-divider"></div>
          </>
        )}

        {/* Sección de Monitoreo - Para TODOS los roles */}
        <div className="sidebar-section-label">Monitoreo</div>

        <NavLink to="/dashboard" end className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/air-quality" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
          <Wind size={20} />
          <span>Calidad del Aire</span>
        </NavLink>

        <NavLink to="/dashboard/reports" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
          <FileText size={20} />
          <span>Reportes</span>
        </NavLink>

        {/* Sección exclusiva para Administradores de Estación */}
        {isStationAdmin && (
          <>
            <div className="sidebar-divider"></div>

            <div className="sidebar-section-label">Gestión de Estación</div>

            <NavLink to="/dashboard/stations" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
              <MapPin size={20} />
              <span>Mi Estación</span>
            </NavLink>

            <NavLink to="/dashboard/maintenance" end className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
              <ClipboardList size={20} />
              <span>Mantenimientos</span>
            </NavLink>

            <NavLink to="/dashboard/maintenance/new" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
              <PlusCircle size={20} />
              <span>Nuevo Mantenimiento</span>
            </NavLink>

            <NavLink to="/dashboard/sensors/new" className={({isActive}) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Cpu size={20} />
              <span>Registrar Sensor</span>
            </NavLink>
          </>
        )}

        <div className="sidebar-spacer"></div>

        {/* Logout al final */}
        <button onClick={handleLogout} className="sidebar-link logout-link">
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </aside>
  );
}
