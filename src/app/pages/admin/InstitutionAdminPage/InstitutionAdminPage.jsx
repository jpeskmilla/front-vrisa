import { Activity, Clock, MapPin, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StationAPI, UserAPI } from "../../../../shared/api";
import { RequestManagement } from "../../../../shared/components/RequestManagement";
import "../../analytics/DashboardPage/DashboardPage.css";

/**
 * Panel de administración para instituciones ambientales.
 * Permite gestionar solicitudes de estaciones, investigadores y ver estadísticas.
 */
export default function InstitutionAdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStations: 0,
    pendingRequests: 0,
    activeStations: 0,
    pendingResearchers: 0,
  });
  const [pendingStations, setPendingStations] = useState([]);
  const [pendingResearchers, setPendingResearchers] = useState([]);
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

      // Obtener solicitudes de investigadores pendientes
      let researchers = [];
      try {
        researchers = await UserAPI.getPendingResearcherRequests();
      } catch (err) {
        console.log("No se pudieron cargar solicitudes de investigadores:", err);
      }

      setPendingStations(pending);
      setPendingResearchers(researchers);

      setStats({
        totalStations: allMyStations.length,
        pendingRequests: pending.length,
        activeStations: active,
        pendingResearchers: researchers.length,
      });
    } catch (error) {
      console.error("Error cargando datos de la institución:", error);
      alert("Error al cargar las solicitudes. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Helper para recargar datos
  const refreshData = () => {
    if (institutionId) fetchData(institutionId);
  };

  const handleApprove = async (item, type) => {
    // Aprobación de Estación
    if (type === "ENTITY") {
      const station = item;

      // Validaciones específicas de estación (ej. verificar sensores)
      const hasSensors = station.sensors && station.sensors.length > 0;
      if (!hasSensors) {
        if (!window.confirm("Esta estación no tiene sensores registrados. ¿Deseas aprobarla de todos modos?")) {
          return;
        }
      } else {
        if (!window.confirm(`¿Aprobar integración de "${station.station_name}"?`)) return;
      }

      try {
        await StationAPI.approveStation(station.station_id);
        alert(`Estación "${station.station_name}" aprobada con éxito.`);
        refreshData();
      } catch (error) {
        console.error("Error aprobando estación:", error);
        alert(`Error: ${error.message || "No se pudo aprobar la estación"}`);
      }
    }

    // Aprobación de Investigador
    else if (type === "RESEARCHER") {
      const researcher = item;
      if (!window.confirm(`¿Aprobar al investigador "${researcher.full_name}" para tu institución?`)) return;

      try {
        await UserAPI.approveResearcherRequest(researcher.id);
        alert(`Investigador "${researcher.full_name}" aprobado.`);
        refreshData();
      } catch (error) {
        console.error("Error aprobando investigador:", error);
        alert("Error al aprobar la solicitud del investigador.");
      }
    }
  };

  const handleReject = async (item, type) => {
    // Rechazo de Estación
    if (type === "ENTITY") {
      const station = item;
      if (!window.confirm(`¿Rechazar solicitud de la estación "${station.station_name}"?`)) return;

      try {
        await StationAPI.updateStation(station.station_id, {
          operative_status: "REJECTED",
        });
        alert(`Estación "${station.station_name}" rechazada.`);
        refreshData();
      } catch (error) {
        console.error("Error rechazando estación:", error);
        alert("Error al rechazar la estación.");
      }
    }

    // Rechazo de Investigador
    else if (type === "RESEARCHER") {
      const researcher = item;
      if (!window.confirm(`¿Rechazar solicitud del investigador "${researcher.full_name}"?`)) return;

      try {
        await UserAPI.rejectResearcherRequest(researcher.id);
        alert("Solicitud de investigador rechazada.");
        refreshData();
      } catch (error) {
        console.error("Error rechazando investigador:", error);
        alert("Error al rechazar la solicitud.");
      }
    }
  };

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
            <h3>Estaciones Pendientes</h3>
            <span className="card-value" style={{color: "#ef4444"}}>
              {stats.pendingRequests}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon" style={{color: "#7e22ce"}}>
            <UserCheck size={24} />
          </div>
          <div className="card-info">
            <h3>Investigadores Pendientes</h3>
            <span className="card-value" style={{color: "#7e22ce"}}>
              {stats.pendingResearchers}
            </span>
          </div>
        </div>
      </div>

      {/* Solicitudes */}
      <div style={{marginTop: "32px"}}>
        <RequestManagement
          role="institution_head"
          entityRequests={pendingStations}
          researcherRequests={pendingResearchers}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={loading}
        />
      </div>
    </>
  );
}
