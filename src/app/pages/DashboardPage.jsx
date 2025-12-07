import {
  Activity,
  AlertCircle,
  Cloud,
  Droplet,
  Edit,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  Thermometer,
  Wind
} from 'lucide-react';
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAPI } from "../../shared/api";
import "./dashboard-styles.css";

/**
 * Página de Dashboard principal para usuarios autenticados.
 * Muestra información de calidad del aire y accesos según el rol del usuario.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        // Obtener datos del usuario desde el localStorage
        const storedData = localStorage.getItem("userData");
        const token = localStorage.getItem("token");

        if (!token || !storedData) {
          navigate("/");
          return;
        }

        const parsedUser = JSON.parse(storedData);
        setUser(parsedUser);

        if (parsedUser.user_id) {
          try {
            const freshUserData = await UserAPI.getUserById(parsedUser.user_id);

            const mergedUser = {
              ...parsedUser,
              ...freshUserData,
              institution_name: freshUserData.institution?.institute_name,
            };

            setUser(mergedUser);
            localStorage.setItem("userData", JSON.stringify(mergedUser));
          } catch (apiError) {
            console.error("Could not fetch fresh user data:", apiError);
          }
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        setError("Error cargando sesión");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    navigate("/");
  };

  // Verificar si el usuario necesita completar su registro
  const needsRegistrationCompletion = user?.belongs_to_organization && !user?.registration_complete;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-logo">VriSA</h1>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hola, {user?.first_name || "Usuario"}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Banner de completar registro */}
      {needsRegistrationCompletion && (
        <div className="registration-banner">
          <div className="banner-content">
            <div className="banner-icon"><AlertCircle size={24} /></div> 
            <div className="banner-text">
              <strong>Tu registro está incompleto</strong>
              <p>Completa tu registro para acceder a todas las funcionalidades.</p>
            </div>
            <Link to="/complete-registration" className="banner-btn">
              Completar registro
            </Link>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <Link to="/home" className="nav-item return-home">
              <span className="nav-icon"><Home size={20} /></span>
              <span className="nav-text">Ir al Inicio</span>
            </Link>
            
            <div className="sidebar-divider"></div>

            <Link to="/dashboard" className="nav-item active">
              <span className="nav-icon"><LayoutDashboard size={20} /></span>
              <span className="nav-text">Dashboard</span>
            </Link>
            <Link to="/dashboard/air-quality" className="nav-item">
              <span className="nav-icon"><Wind size={20} /></span>
              <span className="nav-text">Calidad del aire</span>
            </Link>
            <Link to="/dashboard/stations" className="nav-item">
              <span className="nav-icon"><MapPin size={20} /></span>
              <span className="nav-text">Estaciones</span>
            </Link>
            <Link to="/dashboard/reports" className="nav-item">
              <span className="nav-icon"><FileText size={20} /></span>
              <span className="nav-text">Reportes</span>
            </Link>
            {needsRegistrationCompletion && (
              <Link to="/complete-registration" className="nav-item highlight">
                <span className="nav-icon"><Edit size={20} /></span>
                <span className="nav-text">Completar registro</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Área de contenido */}
        <section className="dashboard-content">
          <div className="content-header">
            <h2>Panel de Control</h2>
            <p className="content-subtitle">Monitoreo de calidad del aire en Cali</p>
          </div>

          {/* Cards de resumen */}
          <div className="summary-cards">
            <div className="summary-card aqi-good">
              <div className="card-icon"><Activity size={24} /></div>
              <div className="card-info">
                <h3>Índice de Calidad</h3>
                <span className="card-value">42</span>
                <span className="card-label">Buena</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon"><Cloud size={24} /></div>
              <div className="card-info">
                <h3>PM2.5</h3>
                <span className="card-value">12.3</span>
                <span className="card-label">µg/m³</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon"><Thermometer size={24} /></div>
              <div className="card-info">
                <h3>Temperatura</h3>
                <span className="card-value">24°C</span>
                <span className="card-label">Agradable</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon"><Droplet size={24} /></div>
              <div className="card-info">
                <h3>Humedad</h3>
                <span className="card-value">68%</span>
                <span className="card-label">Moderada</span>
              </div>
            </div>
          </div>

          {/* Sección de estaciones */}
          <div className="stations-section">
            <h3 className="section-title">Estaciones de monitoreo activas</h3>
            <div className="stations-grid">
              <div className="station-card">
                <div className="station-status online"></div>
                <div className="station-info">
                  <h4>Estación Norte</h4>
                  <p>Última lectura: hace 5 min</p>
                  <span className="station-aqi good">AQI: 38</span>
                </div>
              </div>
              <div className="station-card">
                <div className="station-status online"></div>
                <div className="station-info">
                  <h4>Estación Centro</h4>
                  <p>Última lectura: hace 3 min</p>
                  <span className="station-aqi moderate">AQI: 55</span>
                </div>
              </div>
              <div className="station-card">
                <div className="station-status online"></div>
                <div className="station-info">
                  <h4>Estación Sur</h4>
                  <p>Última lectura: hace 8 min</p>
                  <span className="station-aqi good">AQI: 42</span>
                </div>
              </div>
              <div className="station-card">
                <div className="station-status offline"></div>
                <div className="station-info">
                  <h4>Estación Oeste</h4>
                  <p>Sin conexión</p>
                  <span className="station-aqi offline">Sin datos</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
