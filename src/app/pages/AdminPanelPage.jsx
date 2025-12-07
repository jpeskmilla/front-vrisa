import { Building, Building2, CheckCircle, ClipboardCheck, Clock, LayoutDashboard, LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI, UserAPI } from "../../shared/api";
import "./dashboard-styles.css";

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({totalUsers: 0, pendingRequests: 0});
  const [pendingItems, setPendingItems] = useState([]);
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
    if (parsed.primary_role !== "super_admin") {
      alert("Acceso denegado: Se requieren permisos de Super Administrador.");
      navigate("/home");
      return;
    }
    setAdminUser(parsed);

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Obtenemos las solicitudes de integración
      const [requestsData, institutionsData, userStatsData] = await Promise.all([
        InstitutionAPI.getIntegrationRequests(),
        InstitutionAPI.getInstitutions(),
        UserAPI.getUserStats() 
    ]);

      // Filtramos solo las pendientes para la vista principal
      const pendingRequests = requestsData
        .filter((r) => r.request_status === "PENDING")
        .map((item) => ({...item, type: "REQUEST", name: `Solicitud de Integración: ${item.institution_name}`}));

      const pendingInstitutions = institutionsData
        .filter((i) => i.validation_status === "PENDING")
        .map((item) => ({...item, type: "INSTITUTION", name: `Registro Nuevo: ${item.institute_name}`}));

      const allPending = [...pendingInstitutions, ...pendingRequests];

      // Actualizar estados con datos obtenidos
      setPendingItems(allPending);
      setStats({
        totalUsers: userStatsData.total_users,
        pendingRequests: allPending.length,
      });
    } catch (error) {
      console.error("Error cargando datos de administración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm("¿Estás seguro de aprobar esta institución?")) return;

    try {
      if (item.type === "INSTITUTION") {
        // ID de la institución
        await InstitutionAPI.approveInstitution(item.id);
      } else {
        // ID de la solicitud
        await InstitutionAPI.approveRequest(item.id);
      }
      alert("Institución aprobada con éxito");
      fetchData(); // Recargar la lista
    } catch (error) {
      console.error("Error aprobando solicitud:", error);
      alert("Error al aprobar la solicitud.");
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
        </>
      );
    }

    if (activeTab === "approvals") {
      return (
        <>
          {/* ... header ... */}
          <div
            className="table-container"
            style={
              {
                /*...*/
              }
            }
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
    }

    return <div>Sección en construcción...</div>;
  };

  return (
    <div className="dashboard-container">
      {/* Header con borde distintivo para Admin */}
      <header className="dashboard-header" style={{borderTop: "4px solid #4339F2"}}>
        <div className="header-left">
          <h1 className="dashboard-logo">
            VriSA{" "}
            <span
              style={{
                fontSize: "0.5em",
                background: "#4339F2",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                verticalAlign: "middle",
                marginLeft: "8px",
              }}
            >
              ADMIN
            </span>
          </h1>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hola, {adminUser?.first_name}</span>
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
            {/* Resumen Global */}
            <button className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
              <span className="nav-icon">
                <LayoutDashboard size={20} />
              </span>
              <span className="nav-text">Resumen Global</span>
            </button>

            {/* Aprobaciones */}
            <button
              className={`nav-item ${activeTab === "approvals" ? "active" : ""}`}
              onClick={() => setActiveTab("approvals")}
              style={{justifyContent: "space-between"}}
            >
              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                <span className="nav-icon">
                  <ClipboardCheck size={20} />
                </span>
                <span className="nav-text">Aprobaciones</span>
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

            {/* Gestión Usuarios */}
            <button className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
              <span className="nav-icon">
                <Users size={20} />
              </span>
              <span className="nav-text">Gestión Usuarios</span>
            </button>

            {/* Instituciones */}
            <button className={`nav-item ${activeTab === "institutions" ? "active" : ""}`} onClick={() => setActiveTab("institutions")}>
              <span className="nav-icon">
                <Building2 size={20} />
              </span>
              <span className="nav-text">Instituciones</span>
            </button>
          </nav>
        </aside>

        <section className="dashboard-content">
          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-spinner"></div>
              <p>Cargando panel de administración...</p>
            </div>
          ) : (
            renderContent()
          )}
        </section>
      </main>
    </div>
  );
}
