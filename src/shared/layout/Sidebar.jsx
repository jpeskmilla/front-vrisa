import { 
  Home, 
  LayoutDashboard, 
  Wind, 
  MapPin, 
  FileText, 
  LogOut 
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("¿Deseas cerrar sesión?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <aside className="layout-sidebar">
      <nav className="sidebar-nav">
        {/* Enlace para volver al Home */}
        <NavLink 
          to="/home" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>

        <div className="h-px bg-gray-200 my-2"></div>

        {/* Links del Dashboard */}
        <NavLink 
          to="/dashboard" 
          end // 'end' hace que solo se active si la ruta es exacta, no hijas
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
          <span>Estaciones</span>
        </NavLink>

        <NavLink 
          to="/dashboard/reports" 
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <FileText size={20} />
          <span>Reportes</span>
        </NavLink>

        {/* Espaciador para empujar el logout al final */}
        <div className="sidebar-spacer"></div>

        <button onClick={handleLogout} className="sidebar-link logout-link">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}
