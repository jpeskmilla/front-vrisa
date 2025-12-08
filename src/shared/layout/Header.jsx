import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./layout.css";

export default function Header() {
  const [user, setUser] = useState({ first_name: "U", last_name: "" });

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error("Error leyendo usuario", e);
    }
  }, []);

  return (
    <header className="layout-header">
      <div className="header-brand">
        <Link to="/home" className="brand-logo">
          VriSA
        </Link>
        <span className="brand-divider">|</span>
        <span className="header-title">Sistema de Monitoreo</span>
      </div>

      <div className="header-actions">
        {/* Opción B: Campana presente pero sin lógica compleja */}
        <button className="icon-btn" title="Notificaciones (Sin nuevas alertas)">
          <Bell size={20} />
        </button>

        <div className="user-badge">
          <div className="user-avatar">
            {user.first_name?.charAt(0) || "U"}
          </div>
          <span className="user-name">
            {user.first_name} {user.last_name?.charAt(0)}.
          </span>
        </div>
      </div>
    </header>
  );
}
