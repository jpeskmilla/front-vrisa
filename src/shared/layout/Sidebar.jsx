import {
  ClipboardList,
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
import "./layout.css";

export default function Sidebar() {
  const navigate = useNavigate();

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
          to="/dashboard/stations" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <MapPin size={20} />
          <span>Mi Estación</span>
        </NavLink>

        <NavLink 
          to="/dashboard/reports" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <FileText size={20} />
          <span>Reportes</span>
        </NavLink>

        <div className="sidebar-divider"></div>

        {/* Sección de Mantenimiento */}
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
