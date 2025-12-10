import { Activity, AlertTriangle, CheckCircle, Clock, MapPin, Radio, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StationAPI } from "../../../../shared/api";
import "../../analytics/DashboardPage/DashboardPage.css";

/**
 * Panel de administración para instituciones ambientales.
 * Permite gestionar solicitudes de estaciones y ver estadísticas.
 */
export default function InstitutionAdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStations: 0,
    pendingRequests: 0,
    activeStations: 0,
  });
  const [pendingStations, setPendingStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institutionId, setInstitutionId] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(userData);
    const isInstitutionUser = parsed.primary_role === "institution_head" || parsed.primary_role === "super_admin" || parsed.institution_id;

    if (!isInstitutionUser) {
      alert("Acceso denegado: Se requieren permisos de Institución.");
      navigate("/dashboard");
      return;
    }

    setInstitutionId(parsed.institution_id);
    fetchData(parsed.institution_id);
  }, [navigate]);

  const fetchData = async (institutionId) => {
    try {
      setLoading(true);

      // Obtener estaciones pendientes asociadas a la institución
      const allMyStations = await StationAPI.getStations({institution: institutionId});
      const pending = allMyStations.filter((s) => s.operative_status === "PENDING");

      // Calcular activos
      const active = allMyStations.filter((s) => s.operative_status === "ACTIVE").length;

      setPendingStations(pending);

      setStats({
        totalStations: allMyStations.length,
        pendingRequests: pending.length,
        activeStations: active,
      });
    } catch (error) {
      console.error("Error cargando datos de la institución:", error);
      alert("Error al cargar las solicitudes. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStation = async (station) => {
    if (!window.confirm(`¿Aprobar integración de "${station.station_name}"?`)) {
      return;
    }

    try {
      await StationAPI.approveStation(station.station_id);

      alert(` Estación "${station.station_name}" y su administrador han sido aprobados con éxito`);

      if (institutionId) {
        fetchData(institutionId);
      }
    } catch (error) {
      console.error("Error aprobando estación:", error);
      alert(`Error al aprobar: ${error.message || "Error desconocido"}`);
    }
  };

  const handleRejectStation = async (station) => {
    if (!window.confirm(`¿Rechazar "${station.station_name}"?`)) return;

    if (reason === null) return; // Usuario canceló

    try {
      // Actualizar estado a REJECTED
      await StationAPI.updateStation(station.station_id, {
        operative_status: "REJECTED",
      });

      alert(`Estación "${station.station_name}" rechazada`);

      if (institutionId) {
        fetchData(institutionId);
      }
    } catch (error) {
      console.error("Error rechazando estación:", error);
      alert(`Error al rechazar: ${error.message || "Error desconocido"}`);
    }
  };

  const renderContent = () => {
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
                    <p>
                      {station.location} - {station.address}
                    </p>
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
                fontWeight: "600",
              }}
            >
              Ver todas las solicitudes
            </button>
          </div>
        )}

        <div className="content-header" style={{marginTop: "32px"}}>
          <h2>Solicitudes de Estaciones</h2>
          <p>Revisa y aprueba las solicitudes de nuevas estaciones</p>
        </div>

        <div
          className="table-container"
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
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
                  <th style={{padding: "12px", color: "#666"}}>Sensores Detectados</th>
                  <th style={{padding: "12px", color: "#666"}}>Ubicación</th>
                  <th style={{padding: "12px", color: "#666"}}>Solicitante</th>
                  <th style={{padding: "12px", color: "#666"}}>Fecha</th>
                  <th style={{padding: "12px", color: "#666"}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingStations.map((station) => {
                  const hasSensors = station.sensors && station.sensors.length > 0;

                  return (
                    <tr key={station.station_id} style={{borderBottom: "1px solid #f0f0f0"}}>
                      {/* COLUMNA 1: Nombre Estación */}
                      <td style={{padding: "16px 12px"}}>
                        <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "#e0e7ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Radio size={20} style={{color: "#4339F2"}} />
                          </div>
                          <div>
                            <span style={{fontWeight: "600", color: "#1e293b"}}>{station.station_name}</span>
                            <div style={{fontSize: "0.8em", color: "#64748b"}}>ID: {station.station_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* COLUMNA 2: SENSORES (Lógica de Mitigación) */}
                      <td style={{padding: "16px 12px"}}>
                        {hasSensors ? (
                          <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                            {station.sensors.map((s) => (
                              <span
                                key={s.sensor_id}
                                style={{
                                  fontSize: "0.85rem",
                                  background: "#f0fdf4",
                                  color: "#15803d",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #bbf7d0",
                                  width: "fit-content",
                                }}
                              >
                                ✅ {s.model} ({s.serial_number})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#dc2626",
                              background: "#fef2f2",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              fontSize: "0.85rem",
                            }}
                          >
                            <AlertTriangle size={16} />
                            <span>Sin sensores (Incompleta)</span>
                          </div>
                        )}
                      </td>

                      {/* COLUMNA 3: Ubicación */}
                      <td style={{padding: "16px 12px", color: "#64748b", fontSize: "0.9rem"}}>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                          <MapPin size={14} />
                          {station.address_reference || "Sin dirección"}
                        </div>
                        <div>Lat: {station.geographic_location_lat?.toFixed(4)}</div>
                      </td>

                      {/* COLUMNA 4: Acciones */}
                      <td style={{padding: "16px 12px"}}>
                        <div style={{display: "flex", gap: "8px"}}>
                          {/* Solo permitimos aprobar si tiene sensores (Opcional, o dejamos que el admin decida) */}
                          <button
                            onClick={() => handleApproveStation(station)}
                            disabled={!hasSensors} // BLOQUEO PREVENTIVO
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "8px 16px",
                              background: hasSensors ? "#22c55e" : "#e5e7eb",
                              color: hasSensors ? "white" : "#9ca3af",
                              border: "none",
                              borderRadius: "8px",
                              cursor: hasSensors ? "pointer" : "not-allowed",
                              fontWeight: "600",
                              fontSize: "0.85rem",
                              transition: "all 0.2s",
                            }}
                            title={!hasSensors ? "No se puede aprobar una estación sin sensores" : "Aprobar estación"}
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
                              transition: "all 0.2s",
                            }}
                          >
                            <XCircle size={16} /> Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando panel de institución...</p>
        </div>
      ) : (
        renderContent()
      )}
    </>
  );
}
