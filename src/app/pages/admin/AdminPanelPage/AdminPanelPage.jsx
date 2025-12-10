import { Building, CheckCircle, Clock, Users, UserCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI, UserAPI } from "../../../../shared/api";
import "../../analytics/DashboardPage/DashboardPage.css";

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({totalUsers: 0, pendingRequests: 0, pendingResearchers: 0});
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Obtenemos las solicitudes de integración e investigadores pendientes
      const [institutionsData, userStatsData, researchersData] = await Promise.all([
        InstitutionAPI.getInstitutions(), 
        UserAPI.getUserStats(),
        UserAPI.getPendingResearcherRequests()
      ]);

      // Filtramos solo las instituciones pendientes de aprobacion
      const pendingInstitutions = institutionsData
        .filter((i) => i.validation_status === "PENDING")
        .map((item) => ({...item, type: "INSTITUTION", name: `Registro Nuevo: ${item.institute_name}`}));

      // Mapear solicitudes de investigadores
      const pendingResearchers = researchersData.map((item) => ({
        ...item, 
        type: "RESEARCHER", 
        name: item.full_name
      }));

      // Combinar todas las solicitudes pendientes
      const allPending = [...pendingInstitutions, ...pendingResearchers];

      // Actualizar estados con datos obtenidos
      setPendingItems(allPending);
      setStats({
        totalUsers: userStatsData.total_users,
        pendingRequests: allPending.length,
        pendingResearchers: pendingResearchers.length,
      });
    } catch (error) {
      console.error("Error cargando datos de administración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    const confirmMsg = item.type === "INSTITUTION" 
      ? "¿Estás seguro de aprobar esta institución?" 
      : "¿Estás seguro de aprobar este investigador?";
    
    if (!window.confirm(confirmMsg)) return;

    try {
      if (item.type === "INSTITUTION") {
        await InstitutionAPI.approveInstitution(item.id);
        alert("Institución aprobada con éxito");
      } else if (item.type === "RESEARCHER") {
        await UserAPI.approveResearcherRequest(item.id);
        alert("Investigador aprobado con éxito");
      }
      fetchData();
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
      alert("Error al aprobar la solicitud.");
    }
  };

  const handleReject = async (item) => {
    const confirmMsg = item.type === "INSTITUTION" 
      ? "¿Estás seguro de rechazar esta institución?" 
      : "¿Estás seguro de rechazar este investigador?";
    
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

  // Renderizado del contenido
  const renderContent = () => {
    return (
      <>
        <div className="content-header">
          <h2>Panel de Administración Global</h2>
          <p>Visión general del estado del sistema VriSA</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon">
              <Users size={24} />
            </div>
            <div className="card-info">
              <h3>Usuarios Totales</h3>
              <span className="card-value">{stats.totalUsers}</span>
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

        <div className="content-header" style={{marginTop: "32px"}}>
          <h2>Solicitudes Pendientes</h2>
          <p>Revisa y aprueba las solicitudes de nuevas instituciones e investigadores</p>
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
          {pendingItems.length === 0 ? (
            <div style={{textAlign: "center", padding: "40px", color: "#666"}}>No hay solicitudes pendientes</div>
          ) : (
            <table style={{width: "100%", borderCollapse: "collapse"}}>
              <thead>
                <tr style={{borderBottom: "2px solid #f0f0f0", textAlign: "left"}}>
                  <th style={{padding: "12px", color: "#666"}}>Tipo</th>
                  <th style={{padding: "12px", color: "#666"}}>Detalle</th>
                  <th style={{padding: "12px", color: "#666"}}>Fecha</th>
                  <th style={{padding: "12px", color: "#666"}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map((item) => (
                  <tr key={`${item.type}-${item.id}`} style={{borderBottom: "1px solid #f0f0f0"}}>
                    <td style={{padding: "16px 12px"}}>
                      {item.type === "INSTITUTION" ? (
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#4339F2",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            width: "fit-content",
                          }}
                        >
                          <Building size={14} /> Institución
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "#f3e8ff",
                            color: "#7e22ce",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            width: "fit-content",
                          }}
                        >
                          <UserCheck size={14} /> Investigador
                        </span>
                      )}
                    </td>
                    <td style={{padding: "16px 12px", fontWeight: "600"}}>
                      {item.type === "INSTITUTION" ? item.institute_name : item.full_name}
                      <div style={{fontSize: "0.8em", color: "#666", fontWeight: "normal"}}>
                        {item.type === "INSTITUTION" ? item.physic_address : item.user_email}
                      </div>
                    </td>
                    <td style={{padding: "16px 12px", color: "#666"}}>
                      {item.created_at 
                        ? new Date(item.created_at).toLocaleDateString() 
                        : item.assigned_at 
                          ? new Date(item.assigned_at).toLocaleDateString()
                          : "N/A"}
                    </td>
                    <td style={{padding: "16px 12px"}}>
                      <div style={{display: "flex", gap: "8px"}}>
                        <button
                          onClick={() => handleApprove(item)}
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
                          }}
                        >
                          <CheckCircle size={16} /> Aprobar
                        </button>
                        {item.type === "RESEARCHER" && (
                          <button
                            onClick={() => handleReject(item)}
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
                            }}
                          >
                            <XCircle size={16} /> Rechazar
                          </button>
                        )}
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
  };

  return (
    <>
      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando panel de administración...</p>
        </div>
      ) : (
        renderContent()
      )}
    </>
  );
}
