import {
  ClipboardList,
  Cpu,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  PlusCircle,
  Wind,
  Wrench
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { ORGANIZATION_ROLES } from "../constants/roles";
import "./layout.css";

export default function Sidebar() {
  const navigate = useNavigate();

  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isStationAdmin = userData?.primary_role === ORGANIZATION_ROLES.STATION_ADMIN;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="layout-sidebar">
      <nav className="sidebar-nav">
        {/* Ir al Inicio */}
        <NavLink 
          to="/home" 
          className="sidebar-link return-home"
        >
          <Home size={20} />
          <span>Ir al Inicio</span>
        </NavLink>

        <div className="sidebar-divider"></div>

        {/* Links Principales */}
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/dashboard/air-quality" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Wind size={20} />
          <span>Calidad del Aire</span>
        </NavLink>

        <NavLink 
          to="/dashboard/reports" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <FileText size={20} />
          <span>Reportes</span>
        </NavLink>

        {/* Sección exclusiva para Administradores de Estación */}
        {isStationAdmin && (
          <>
            <div className="sidebar-divider"></div>

            <div className="sidebar-section-label">Gestión de Estación</div>

            <NavLink 
              to="/dashboard/stations" 
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <MapPin size={20} />
              <span>Mi Estación</span>
            </NavLink>

            <NavLink 
              to="/dashboard/maintenance" 
              end
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <ClipboardList size={20} />
              <span>Mantenimientos</span>
            </NavLink>

            <NavLink 
              to="/dashboard/maintenance/new" 
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <PlusCircle size={20} />
              <span>Nuevo Mantenimiento</span>
            </NavLink>

            <NavLink 
              to="/dashboard/sensors/new" 
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
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
