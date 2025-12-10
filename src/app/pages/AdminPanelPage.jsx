import { Building, CheckCircle, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI, UserAPI } from "../../shared/api";
import "./dashboard-styles.css";

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({totalUsers: 0, pendingRequests: 0});
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
      // Obtenemos las solicitudes de integración
      const [institutionsData, userStatsData] = await Promise.all([InstitutionAPI.getInstitutions(), UserAPI.getUserStats()]);

      // Filtramos solo las instituciones pendientes de aprobacion
      const pendingInstitutions = institutionsData
        .filter((i) => i.validation_status === "PENDING")
        .map((item) => ({...item, type: "INSTITUTION", name: `Registro Nuevo: ${item.institute_name}`}));

      // Actualizar estados con datos obtenidos
      setPendingItems(pendingInstitutions);
      setStats({
        totalUsers: userStatsData.total_users,
        pendingRequests: pendingInstitutions.length,
      });
    } catch (error) {
      console.error("Error cargando datos de administración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    if (!window.confirm("¿Estás seguro de aprobar esta institución?")) return;

    try {
      if (item.type === "INSTITUTION") {
        await InstitutionAPI.approveInstitution(item.id);
      }
      alert("Institución aprobada con éxito");
      fetchData();
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
      alert("Error al aprobar la solicitud.");
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
        </div>

        <div className="content-header" style={{marginTop: "32px"}}>
          <h2>Solicitudes Pendientes</h2>
          <p>Revisa y aprueba las solicitudes de nuevas instituciones</p>
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
                          <ClipboardCheck size={14} /> Solicitud
                        </span>
                      )}
                    </td>
                    <td style={{padding: "16px 12px", fontWeight: "600"}}>
                      {item.type === "INSTITUTION" ? item.institute_name : item.institution_name}
                      <div style={{fontSize: "0.8em", color: "#666", fontWeight: "normal"}}>{item.type === "INSTITUTION" ? item.physic_address : "Solicitud de integración"}</div>
                    </td>
                    <td style={{padding: "16px 12px", color: "#666"}}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date(item.request_date).toLocaleDateString()}
                    </td>
                    <td style={{padding: "16px 12px", display: "flex", gap: "8px"}}>
                      <button
                        onClick={() => handleApprove(item)}
                        style={
                          {
                            /* ... estilos botón aprobar ... */
                          }
                        }
                      >
                        <CheckCircle size={16} /> Aprobar
                      </button>
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
