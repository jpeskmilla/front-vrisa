import { Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI, UserAPI } from "../../../../shared/api";
import { RequestManagement } from "../../../../shared/components/RequestManagement";
import { UserStatsWidget } from "../../../../shared/components/TableDataset";
import "../../analytics/DashboardPage/DashboardPage.css";

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({total_users: 0, breakdown: {}});
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [pendingResearchers, setPendingResearchers] = useState([]);

  useEffect(() => {
    // Verificación de seguridad
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.primary_role !== "super_admin") {
      alert("Acceso denegado: Se requieren permisos de Super Administrador.");
      navigate("/home");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [institutionsData, userStatsData, researchersData] = await Promise.all([
        InstitutionAPI.getInstitutions(),
        UserAPI.getUserStats(),
        UserAPI.getPendingResearcherRequests(),
      ]);

      // Filtrar pendientes
      const pendingInst = institutionsData.filter((i) => i.validation_status === "PENDING");

      setPendingInstitutions(pendingInst);
      setPendingResearchers(researchersData);
      setStats(userStatsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item, type) => {
    if (!window.confirm("¿Confirmar aprobación?")) return;
    try {
      if (type === "ENTITY") await InstitutionAPI.approveInstitution(item.id);
      else await UserAPI.approveResearcherRequest(item.id);
      fetchData();
    } catch (e) {
      alert("Error");
    }
  };

  const handleReject = async (item) => {
    const confirmMsg = item.type === "INSTITUTION" ? "¿Estás seguro de rechazar esta institución?" : "¿Estás seguro de rechazar este investigador?";

    if (!window.confirm(confirmMsg)) return;

    try {
      if (item.type === "RESEARCHER") {
        await UserAPI.rejectResearcherRequest(item.id);
        alert("Solicitud de investigador rechazada");
      }
      fetchData();
    } catch (error) {
      console.error("Error rechazando solicitud:", error);
      alert("Error al rechazar la solicitud.");
    }
  };

  return (
    <>
      <div className="content-header">
        <h2>Panel de Administración Global</h2>
        <p>Visión general del estado del sistema VriSA</p>
      </div>

      {/* Grid superior: Resumen Cards + Tabla de Usuarios */}
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px"}}>
        {/* Columna Izquierda: Tarjetas de Resumen (simplificado) */}
        <div className="summary-cards" style={{display: "grid", gridTemplateColumns: "1fr", gap: "16px", alignContent: "start", margin: 0}}>
          {/* Card Total */}
          <div className="summary-card">
            <div className="card-icon">
              <Users size={24} />
            </div>
            <div className="card-info">
              <h3>Usuarios Totales</h3>
              <span className="card-value">{stats.total_users}</span>
            </div>
          </div>
          {/* Card Pendientes */}
          <div className="summary-card">
            <div className="card-icon pending-icon">
              <Clock size={24} />
            </div>
            <div className="card-info">
              <h3>Solicitudes</h3>
              <span className="card-value" style={{color: "#ef4444"}}>
                {pendingInstitutions.length + pendingResearchers.length}
              </span>
            </div>
          </div>
          {/* Puedes agregar más cards aquí si quieres */}
        </div>

        {/* Columna Derecha: Widget de Tabla de Usuarios */}
        <div style={{minWidth: "300px"}}>
          <UserStatsWidget stats={stats} />
        </div>
      </div>

      {/* Sección Inferior: Gestión de Solicitudes (Componente Compartido) */}
      <RequestManagement
        role="super_admin"
        entityRequests={pendingInstitutions}
        researcherRequests={pendingResearchers}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />
    </>
  );
}
