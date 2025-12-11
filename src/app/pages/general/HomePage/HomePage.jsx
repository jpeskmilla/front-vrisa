import { AlertCircle, Building2, FileText, LayoutDashboard, Microscope, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ORGANIZATION_ROLES } from "../../../../shared/constants/roles";
import "./HomePage.css";

/**
 * Página principal de la aplicación.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mapeo de nombres amigables para todos los roles
  const roleFriendlyNames = {
    [ORGANIZATION_ROLES.INSTITUTION]: "Representante de Institución",
    [ORGANIZATION_ROLES.STATION_ADMIN]: "Administrador de Estación",
    [ORGANIZATION_ROLES.RESEARCHER]: "Investigador",
    "institution_head": "Director de Institución",
    "super_admin": "Administrador del Sistema",
    "citizen": "Ciudadano",
  };

  // Configuración de roles con sus rutas y datos
  const roleConfig = {
    [ORGANIZATION_ROLES.INSTITUTION]: {
      title: "Representante de Institución",
      desc: "Registra tu organización y gestiona redes de monitoreo.",
      icon: <Building2 size={64} />,
      gradientClass: "header-blue",
      route: "/complete-registration/institution",
    },
    [ORGANIZATION_ROLES.STATION_ADMIN]: {
      title: "Administrador de Estación",
      desc: "Conecta tus sensores y estaciones a una red existente.",
      icon: <Radio size={64} />,
      gradientClass: "header-purple",
      route: "/complete-registration/station",
    },
    [ORGANIZATION_ROLES.RESEARCHER]: {
      title: "Investigador",
      desc: "Accede a datos históricos y análisis de calidad del aire.",
      icon: <Microscope size={64} />,
      gradientClass: "header-indigo",
      route: "/complete-registration/researcher",
    },
  };

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  if (loading) return null;

  // --- LÓGICA DE ROL ROBUSTA ---
  const rawRole = user?.primary_role || "citizen";
  // Convertimos a string y minúsculas para evitar errores de comparación
  const currentRole = String(rawRole).toLowerCase().trim();
  const isCitizen = currentRole === "citizen";

  const roleStatus = user?.role_status || "APPROVED";

  // Determinar si tiene una solicitud pendiente
  const isPending = roleStatus === "PENDING" && !isCitizen;
  
  // Usamos el rol original (rawRole) para buscar en la config, ya que las keys suelen ser exactas
  const pendingRoleData = roleConfig[user?.primary_role];

  return (
    <>
      {/* Banner de completar registro si tiene rol pendiente */}
      {isPending && (
        <div className="registration-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <AlertCircle size={24} />
            </div>
            <div className="banner-text">
              <strong>Tu solicitud está en proceso.</strong>
              <p>
                Tienes un rol de <b>{pendingRoleData?.title || rawRole}</b> pendiente. Completa tu perfil para agilizar la aprobación.
              </p>
            </div>
            <button className="banner-btn" onClick={() => navigate(roleConfig[user?.primary_role]?.route || "/complete-registration")}>
              Completar ahora
            </button>
          </div>
        </div>
      )}

      {/* Contenido */}
      <section className="dashboard-content centered-content">
        {/* CASO 1: Usuario con Rol Pendiente */}
        {isPending && pendingRoleData ? (
          <div className="single-role-view">
            <div className="content-header text-center">
              <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
              <p className="content-subtitle">
                Has solicitado el rol de <strong>{pendingRoleData.title}</strong>. Necesitamos información adicional para validar tu cuenta.
              </p>
            </div>

            <div className="single-role-card-container">
              <RoleCard
                title={pendingRoleData.title}
                desc={pendingRoleData.desc}
                icon={pendingRoleData.icon}
                gradientClass={pendingRoleData.gradientClass}
                onClick={() => navigate(roleConfig[user?.primary_role]?.route || "/complete-registration")}
                buttonText="Continuar Registro"
              />
            </div>
          </div>
        ) : (
          /* CASO 2: Usuario Aprobado o Ciudadano */
          <div className="citizen-welcome">
            <div className="content-header text-center">
              <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
              <p className="content-subtitle">
                {isCitizen
                  ? "Como ciudadano, puedes consultar la calidad del aire y acceder a reportes públicos."
                  : `Tu perfil de ${roleFriendlyNames[user?.primary_role] || rawRole} está activo. Explora las opciones disponibles.`}
              </p>
            </div>

            <div className="citizen-features">
              <FeatureCard
                title="Dashboard"
                desc="Visualiza el estado de la calidad del aire en tiempo real."
                icon={<LayoutDashboard size={32} color="white" />}
                onClick={() => navigate("/dashboard")}
              />
              <FeatureCard
                title="Reportes"
                desc="Consulta informes históricos y estadísticas ambientales."
                icon={<FileText size={32} color="white" />}
                onClick={() => navigate("/dashboard/reports")}
              />
              
              {/* AQUÍ ESTABA EL ERROR: He borrado la tarjeta duplicada que estaba sin condición */}
              
              {/* Esta tarjeta SOLO se muestra si NO es ciudadano */}
              {!isCitizen && (
                <FeatureCard
                  title="Estaciones"
                  desc="Explora las estaciones de monitoreo disponibles."
                  icon={<Radio size={32} color="white" />}
                  onClick={() => navigate("/dashboard/stations")}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
};

/* --- Sub-componentes --- */

function FeatureCard({title, desc, icon, onClick}) {
  return (
    <div className="feature-card" onClick={onClick}>
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function RoleCard({title, desc, icon, gradientClass, onClick, buttonText}) {
  return (
    <div className="role-card">
      <div className={`role-card-header ${gradientClass}`}>
        <div style={{color: "white"}}>{icon}</div>
      </div>
      <div className="role-card-body">
        <h3>{title}</h3>
        <p>{desc}</p>
        <button className="role-select-btn" onClick={onClick}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default HomePage;