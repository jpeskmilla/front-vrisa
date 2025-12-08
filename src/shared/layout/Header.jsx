import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./layout.css";

export default function Header() {
  const [user, setUser] = useState({ first_name: "", last_name: "" });

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) { console.error(e); }
  }, []);

  // Función para obtener iniciales
  const getInitials = () => {
    const first = user.first_name ? user.first_name.charAt(0).toUpperCase() : "";
    const last = user.last_name ? user.last_name.charAt(0).toUpperCase() : "";
    
    if (!first && !last) return "U";
    return `${first}${last}`;
  };

  // Función para formatear nombre
  const getDisplayName = () => {
    if (!user.first_name) return "Usuario";
    const lastInitial = user.last_name ? ` ${user.last_name.charAt(0)}.` : "";
    return `${user.first_name}${lastInitial}`;
  };

  return (
    <header className="layout-header">
      <div className="header-left">
        <Link to="/home" className="layout-logo">
          VriSA
        </Link>
        <div className="brand-divider"></div>
        <span className="header-subtitle">Sistema de Monitoreo</span>
      </div>

      <div className="header-right">
        {/* TODO: Implement notification functionality */}
        <button className="icon-btn" title="Notificaciones">
          <Bell size={22} />
        </button>
        
        <div className="header-user-pill">
            <div className="avatar-circle">
                {getInitials()}
            </div>
            <span className="user-name-text">
                {getDisplayName()}
            </span>
        </div>
      </div>
    </header>
  );
}
