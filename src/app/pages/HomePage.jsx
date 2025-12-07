import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ORGANIZATION_ROLES } from "../../shared/constants/roles";
import './homepage-styles.css';

/**
 * Página principal de la aplicación.
 * - Si el usuario ya eligió un rol durante el registro, muestra solo ese rol para completar
 * - Si es ciudadano, muestra la vista de ciudadano
 * - Si tiene registro completo, muestra opciones generales
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configuración de roles con sus rutas y datos
  const roleConfig = {
    [ORGANIZATION_ROLES.INSTITUTION]: {
      title: "Representante de Institución",
      desc: "Registra tu organización y gestiona redes de monitoreo.",
      icon: <IconInstitution />,
      gradientClass: "header-blue",
      route: '/register-institution'
    },
    [ORGANIZATION_ROLES.STATION_ADMIN]: {
      title: "Administrador de Estación",
      desc: "Conecta tus sensores y estaciones a una red existente.",
      icon: <IconStation />,
      gradientClass: "header-purple",
      route: '/register-station'
    },
    [ORGANIZATION_ROLES.RESEARCHER]: {
      title: "Investigador",
      desc: "Accede a datos históricos y análisis de calidad del aire.",
      icon: <IconResearch />,
      gradientClass: "header-indigo",
      route: '/register-researcher'
    }
  };

  useEffect(() => {
    // Cargar datos del usuario
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser({
            first_name: "Usuario",
            email: "usuario@example.com"
          });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Verificar el estado del usuario
  const requestedRole = user?.requested_role || user?.role;
  const isCitizen = user?.belongs_to_organization === false || requestedRole === 'citizen';
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  
  // El registro está completo solo si:
  // - Es ciudadano (ciudadanos no necesitan completar registro adicional)
  // - Ya tiene una institución asignada
  // - El campo registration_complete está explícitamente en true
  const hasCompletedRegistration = isCitizen || hasInstitutionAssigned || user?.registration_complete === true;
  
  // Verificar si tiene un rol específico de organización pendiente
  const hasSpecificRole = requestedRole && requestedRole !== 'citizen' && roleConfig[requestedRole];
  
  // DEBUG: Mostrar valores para depuración (puedes eliminar esto después)
  console.log('HomePage - Estado del usuario:', {
    user,
    requestedRole,
    isCitizen,
    hasInstitutionAssigned,
    hasCompletedRegistration,
    hasSpecificRole,
    belongsToOrg: user?.belongs_to_organization
  });
  
  // Determinar qué vista mostrar
  // Mostrar el rol específico si el usuario tiene un rol de organización pendiente
  const shouldShowSingleRole = hasSpecificRole && !hasCompletedRegistration;
  
  // Mostrar todos los cards si:
  // - Pertenece a organización pero no eligió rol específico
  // - O no es ciudadano y no tiene rol definido
  const shouldShowAllRoleCards = 
    !isCitizen && 
    !hasCompletedRegistration && 
    !hasSpecificRole &&
    user?.belongs_to_organization === true;
  
  console.log('HomePage - Vistas:', { shouldShowSingleRole, shouldShowAllRoleCards, isCitizen });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando opciones...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <h1 className="dashboard-logo">VriSA</h1>
          </div>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hola, {user.first_name}</span>
          <button className="logout-btn-text" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      {/* Banner de completar registro si tiene rol pendiente */}
      {shouldShowSingleRole && (
        <div className="registration-banner">
          <div className="banner-content">
            <div className="banner-icon">⚠️</div> 
            <div className="banner-text">
              <strong>Tu registro está incompleto</strong>
              <p>Completa tu registro como {roleConfig[requestedRole]?.title} para acceder a todas las funcionalidades.</p>
            </div>
            <button 
              className="banner-btn" 
              onClick={() => navigate(roleConfig[requestedRole]?.route)}
            >
              Completar registro
            </button>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        {/* Barra Lateral */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <NavItem icon={<IconAlert />} label="Tableros" to="/dashboard"/>
            <NavItem icon={<IconReport />} label="Reportes" />
            <NavItem icon={<IconProfile />} label="Perfil" to="/profile"/>
            {/* Enlace para completar registro si tiene rol pendiente */}
            {shouldShowSingleRole && (
              <NavItem 
                icon={<IconCompleteRegistration />} 
                label="Completar registro" 
                to={roleConfig[requestedRole]?.route}
                highlight={true}
              />
            )}
          </nav>
        </aside>

        {/* Contenido */}
        <section className="dashboard-content centered-content">
          {/* Vista para usuario con rol específico pendiente */}
          {shouldShowSingleRole && (
            <div className="single-role-view">
              <div className="content-header text-center">
                <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
                <p className="content-subtitle">
                  Completa tu registro como <strong>{roleConfig[requestedRole].title}</strong> para acceder a todas las funcionalidades.
                </p>
              </div>

              <div className="single-role-card-container">
                <RoleCard 
                  title={roleConfig[requestedRole].title}
                  desc={roleConfig[requestedRole].desc}
                  icon={roleConfig[requestedRole].icon}
                  gradientClass={roleConfig[requestedRole].gradientClass}
                  onClick={() => navigate(roleConfig[requestedRole].route)}
                  buttonText="Completar registro"
                />
              </div>

              <div className="sidebar-hint-container">
                <p className="sidebar-hint-text">
                  <svg className="hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Mientras tanto, puedes explorar las opciones en el <strong>menú lateral</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Vista para selección de múltiples roles (solo si no eligió rol en registro) */}
          {shouldShowAllRoleCards && (
            <>
              <div className="content-header text-center">
                <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
                <p className="content-subtitle">
                  Selecciona el rol que deseas solicitar para completar tu registro.
                </p>
              </div>

              <div className="role-cards-grid">
                <RoleCard 
                  title="Representante de Institución"
                  desc="Registra tu organización y gestiona redes de monitoreo."
                  icon={<IconInstitution />}
                  gradientClass="header-blue"
                  onClick={() => navigate('/register-institution')}
                />
                
                <RoleCard 
                  title="Administrador de Estación"
                  desc="Conecta tus sensores y estaciones a una red existente."
                  icon={<IconStation />}
                  gradientClass="header-purple"
                  onClick={() => navigate('/register-station')}
                />

                <RoleCard 
                  title="Investigador"
                  desc="Accede a datos históricos y análisis de calidad del aire."
                  icon={<IconResearch />}
                  gradientClass="header-indigo"
                  onClick={() => navigate('/register-researcher')}
                />
              </div>

              <div className="sidebar-hint-container">
                <p className="sidebar-hint-text">
                  <svg className="hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  ¿No deseas registrar un rol? Explora las opciones en el <strong>menú lateral</strong>.
                </p>
              </div>
            </>
          )}

          {/* Vista para ciudadanos y usuarios con registro completo */}
          {!shouldShowSingleRole && !shouldShowAllRoleCards && (
            <div className="citizen-welcome">
              <div className="content-header text-center">
                <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
                <p className="content-subtitle">
                  {isCitizen 
                    ? "Como ciudadano, puedes consultar la calidad del aire y acceder a reportes públicos."
                    : "Tu registro está completo. Explora las opciones disponibles."
                  }
                </p>
              </div>

              <div className="citizen-features">
                <div className="feature-card" onClick={() => navigate('/dashboard')}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </div>
                  <h3>Dashboard</h3>
                  <p>Visualiza el estado de la calidad del aire en tiempo real.</p>
                </div>

                <div className="feature-card" onClick={() => navigate('/dashboard/reports')}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="8" y1="18" x2="8" y2="15" />
                      <line x1="16" y1="18" x2="16" y2="13" />
                    </svg>
                  </div>
                  <h3>Reportes</h3>
                  <p>Consulta informes históricos y estadísticas ambientales.</p>
                </div>

                <div className="feature-card" onClick={() => navigate('/dashboard/stations')}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3>Estaciones</h3>
                  <p>Explora las estaciones de monitoreo disponibles.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* Sub-componentes */

function RoleCard({ title, desc, icon, gradientClass, onClick, buttonText = "Seleccionar" }) {
  return (
    <div className="role-card">
      <div className={`role-card-header ${gradientClass}`}>
        {icon}
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

function NavItem({ icon, label, to, highlight = false }) {
  return (
    <Link to={to || "#"} className={`nav-item ${highlight ? 'highlight' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-text">{label}</span>
    </Link>
  );
}

/* Íconos */
const IconAlert = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><circle cx="18" cy="5" r="3" fill="#ef4444" stroke="none" /></svg>;
const IconReport = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="8" y1="18" x2="8" y2="15" /><line x1="16" y1="18" x2="16" y2="13" /></svg>;
const IconProfile = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;

const IconInstitution = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="5" y1="21" x2="5" y2="10" />
    <line x1="19" y1="21" x2="19" y2="10" />
    <polyline points="5 10 12 3 19 10" />
    <path d="M9 21v-8" /><path d="M12 21v-8" /><path d="M15 21v-8" />
    <path d="M12 3a2 2 0 0 1 2 2" />
  </svg>
);

const IconStation = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 1 7.38 16.75" />
    <path d="M4.62 18.75A10 10 0 0 1 12 2" />
    <path d="M12 8l-4 12" /><path d="M12 8l4 12" />
    <line x1="6" y1="15" x2="18" y2="15" />
    <circle cx="12" cy="5" r="1.5" />
  </svg>
);

const IconResearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    <circle cx="13" cy="11" r="5" />
    <path d="M16.5 14.5l2.5 2.5" />
  </svg>
);

const IconCompleteRegistration = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default HomePage;