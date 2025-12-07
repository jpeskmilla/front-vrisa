import { 
  Building2, 
  CheckCircle, 
  Clock, 
  LayoutDashboard, 
  LogOut, 
  MapPin, 
  Radio,
  Users,
  XCircle,
  Activity,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InstitutionAPI } from "../../shared/api";
import "./dashboard-styles.css";

/**
 * Panel de administración para instituciones ambientales.
 * Permite gestionar solicitudes de estaciones y ver estadísticas.
 */
export default function InstitutionAdminPage() {
  const navigate = useNavigate();
  const [institutionUser, setInstitutionUser] = useState(null);
  const [stats, setStats] = useState({
    totalStations: 0, 
    pendingRequests: 0,
    activeStations: 0
  });
  const [pendingStations, setPendingStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Verificación de seguridad
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/");
      return;
    }
    
    const parsed = JSON.parse(userData);
    
    // Verificar que sea un usuario de institución
    const isInstitutionUser = 
      parsed.primary_role === "institution" || 
      parsed.requested_role === "institution" ||
      parsed.institution_id;
    
    if (!isInstitutionUser) {
      alert("Acceso denegado: Se requieren permisos de Institución.");
      navigate("/dashboard");
      return;
    }
    
    setInstitutionUser(parsed);
    fetchData(parsed.institution_id);
  }, [navigate]);

  const fetchData = async (institutionId) => {
    try {
      setLoading(true);
      
      // Simular datos de estaciones pendientes
      // En producción esto vendría de la API
      const mockPendingStations = [
        {
          id: 1,
          station_name: "Estación Norte Cali",
          location: "Zona Norte",
          address: "Calle 70 Norte #3N-45",
          latitude: 3.4823,
          longitude: -76.5119,
          request_status: "PENDING",
          requested_by: "Carlos Martínez",
          requested_at: new Date().toISOString(),
          type: "STATION"
        },
        {
          id: 2,
          station_name: "Estación Centro Histórico",
          location: "Centro",
          address: "Carrera 4 #10-25",
          latitude: 3.4516,
          longitude: -76.5320,
          request_status: "PENDING",
          requested_by: "Ana García",
          requested_at: new Date(Date.now() - 86400000).toISOString(),
          type: "STATION"
        }
      ];

      setPendingStations(mockPendingStations);
      setStats({
        totalStations: 8,
        pendingRequests: mockPendingStations.length,
        activeStations: 6
      });

    } catch (error) {
      console.error("Error cargando datos de la institución:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStation = async (station) => {
    if (!window.confirm(`¿Estás seguro de aprobar la estación "${station.station_name}"?`)) return;

    try {
      // Aquí iría la llamada a la API
      // await InstitutionAPI.approveStation(station.id);
      
      alert("Estación aprobada con éxito");
      
      // Actualizar lista
      setPendingStations(prev => prev.filter(s => s.id !== station.id));
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1,
        totalStations: prev.totalStations + 1,
        activeStations: prev.activeStations + 1
      }));
    } catch (error) {
      console.error("Error aprobando estación:", error);
      alert("Error al aprobar la estación.");
    }
  };

  const handleRejectStation = async (station) => {
    if (!window.confirm(`¿Estás seguro de rechazar la estación "${station.station_name}"?`)) return;

    try {
      // Aquí iría la llamada a la API
      // await InstitutionAPI.rejectStation(station.id);
      
      alert("Estación rechazada");
      
      // Actualizar lista
      setPendingStations(prev => prev.filter(s => s.id !== station.id));
      setStats(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests - 1
      }));
    } catch (error) {
      console.error("Error rechazando estación:", error);
      alert("Error al rechazar la estación.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Renderizado condicional del contenido según la tab activa
  const renderContent = () => {
    if (activeTab === "dashboard") {
      return (
        <>
          <div className="content-header">
            <h2>Panel de la Institución</h2>
            <p>Gestión de estaciones y solicitudes de tu institución</p>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon" style={{color: "#4339F2"}}>
                <MapPin size={24} />
              </div>
              <div className="card-info">
                <h3>Estaciones Totales</h3>
                <span className="card-value">{stats.totalStations}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon" style={{color: "#22c55e"}}>
                <Activity size={24} />
              </div>
              <div className="card-info">
                <h3>Estaciones Activas</h3>
                <span className="card-value" style={{color: "#22c55e"}}>
                  {stats.activeStations}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon pending-icon">
                <Clock size={24} />
              </div>
              <div className="card-info">
                <h3>Solicitudes Pendientes</h3>
                <span className="card-value" style={{color: "#ef4444"}}>
                  {stats.pendingRequests}
                </span>
              </div>
            </div>
          </div>

          {/* Últimas solicitudes */}
          {pendingStations.length > 0 && (
            <div className="stations-section">
              <h3 className="section-title">
                <AlertTriangle size={20} style={{color: "#f59e0b", marginRight: "8px"}} />
                Solicitudes de estación recientes
              </h3>
              <div className="stations-grid">
                {pendingStations.slice(0, 3).map((station) => (
                  <div key={station.id} className="station-card">
                    <div className="station-status" style={{background: "#f59e0b", boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)"}}></div>
                    <div className="station-info">
                      <h4>{station.station_name}</h4>
                      <p>{station.location} - {station.address}</p>
                      <span className="station-aqi moderate">Pendiente</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setActiveTab("approvals")}
                style={{
                  marginTop: "16px",
                  padding: "10px 20px",
                  background: "#4339F2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Ver todas las solicitudes
              </button>
            </div>
          )}
        </>
      );
    }

    if (activeTab === "approvals") {
      return (
        <>
          <div className="content-header">
            <h2>Solicitudes de Estaciones</h2>
            <p>Revisa y aprueba las solicitudes de nuevas estaciones</p>
          </div>
          
          <div
            className="table-container"
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)"
            }}
          >
            {pendingStations.length === 0 ? (
              <div style={{textAlign: "center", padding: "40px", color: "#666"}}>
                <Radio size={48} style={{color: "#d1d5db", marginBottom: "16px"}} />
                <p>No hay solicitudes pendientes</p>
              </div>
            ) : (
              <table style={{width: "100%", borderCollapse: "collapse"}}>
                <thead>
                  <tr style={{borderBottom: "2px solid #f0f0f0", textAlign: "left"}}>
                    <th style={{padding: "12px", color: "#666"}}>Estación</th>
                    <th style={{padding: "12px", color: "#666"}}>Ubicación</th>
                    <th style={{padding: "12px", color: "#666"}}>Solicitante</th>
                    <th style={{padding: "12px", color: "#666"}}>Fecha</th>
                    <th style={{padding: "12px", color: "#666"}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStations.map((station) => (
                    <tr key={station.id} style={{borderBottom: "1px solid #f0f0f0"}}>
                      <td style={{padding: "16px 12px"}}>
                        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "#e0e7ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <Radio size={20} style={{color: "#4339F2"}} />
                          </div>
                          <div>
                            <span style={{fontWeight: "600", color: "#1e293b"}}>{station.station_name}</span>
                            <div style={{fontSize: "0.8em", color: "#64748b"}}>
                              Lat: {station.latitude}, Lon: {station.longitude}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding: "16px 12px", color: "#64748b"}}>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                          <MapPin size={14} />
                          {station.location}
                        </div>
                        <div style={{fontSize: "0.85em", marginTop: "4px"}}>{station.address}</div>
                      </td>
                      <td style={{padding: "16px 12px"}}>
                        <span
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          <Users size={14} />
                          {station.requested_by}
                        </span>
                      </td>
                      <td style={{padding: "16px 12px", color: "#64748b"}}>
                        {new Date(station.requested_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{padding: "16px 12px"}}>
                        <div style={{display: "flex", gap: "8px"}}>
                          <button
                            onClick={() => handleApproveStation(station)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              background: "#22c55e",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <CheckCircle size={16} /> Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectStation(station)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              background: "white",
                              color: "#ef4444",
                              border: "2px solid #ef4444",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <XCircle size={16} /> Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      );
    }

    if (activeTab === "stations") {
      return (
        <>
          <div className="content-header">
            <h2>Estaciones de la Institución</h2>
            <p>Gestiona las estaciones de monitoreo registradas</p>
          </div>
          
          <div className="stations-section">
            <div className="stations-grid">
              <div className="station-card">
                <div className="station-status online"></div>
                <div className="station-info">
                  <h4>Estación Norte Cali</h4>
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
                <div className="station-status offline"></div>
                <div className="station-info">
                  <h4>Estación Sur</h4>
                  <p>Sin conexión</p>
                  <span className="station-aqi offline">Sin datos</span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return <div>Sección en construcción...</div>;
  };

  return (
    <div className="dashboard-container">
      {/* Header con borde distintivo para Institución */}
      <header className="dashboard-header" style={{borderTop: "4px solid #059669"}}>
        <div className="header-left">
          <h1 className="dashboard-logo">
            VriSA{" "}
            <span
              style={{
                fontSize: "0.5em",
                background: "#059669",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                verticalAlign: "middle",
                marginLeft: "8px",
              }}
            >
              INSTITUCIÓN
            </span>
          </h1>
        </div>
        <div className="header-right">
          <span className="user-greeting">
            {institutionUser?.institution_name || institutionUser?.first_name || "Institución"}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} style={{marginRight: "6px"}} />
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {/* Volver al inicio */}
            <Link to="/dashboard" className="nav-item return-home">
              <span className="nav-icon">
                <Building2 size={20} />
              </span>
              <span className="nav-text">Volver al Dashboard</span>
            </Link>
            
            <div className="sidebar-divider"></div>

            {/* Resumen */}
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} 
              onClick={() => setActiveTab("dashboard")}
            >
              <span className="nav-icon">
                <LayoutDashboard size={20} />
              </span>
              <span className="nav-text">Resumen</span>
            </button>

            {/* Aprobaciones */}
            <button
              className={`nav-item ${activeTab === "approvals" ? "active" : ""}`}
              onClick={() => setActiveTab("approvals")}
              style={{justifyContent: "space-between"}}
            >
              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                <span className="nav-icon">
                  <Clock size={20} />
                </span>
                <span className="nav-text">Solicitudes</span>
              </div>

              {stats.pendingRequests > 0 && (
                <span
                  style={{
                    background: activeTab === "approvals" ? "white" : "#ef4444",
                    color: activeTab === "approvals" ? "#4339F2" : "white",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {stats.pendingRequests}
                </span>
              )}
            </button>

            {/* Estaciones */}
            <button 
              className={`nav-item ${activeTab === "stations" ? "active" : ""}`} 
              onClick={() => setActiveTab("stations")}
            >
              <span className="nav-icon">
                <Radio size={20} />
              </span>
              <span className="nav-text">Estaciones</span>
            </button>

            {/* Usuarios */}
            <button 
              className={`nav-item ${activeTab === "users" ? "active" : ""}`} 
              onClick={() => setActiveTab("users")}
            >
              <span className="nav-icon">
                <Users size={20} />
              </span>
              <span className="nav-text">Personal</span>
            </button>
          </nav>
        </aside>

        <section className="dashboard-content">
          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Cargando panel de institución...</p>
            </div>
          ) : (
            renderContent()
          )}
        </section>
      </main>
    </div>
  );
}


