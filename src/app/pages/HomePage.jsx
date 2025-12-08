import {
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Microscope,
  Radio,
  User
} from "lucide-react";
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
      icon: <Building2 size={64} />,
      gradientClass: "header-blue",
      route: '/complete-registration/institution'
    },
    [ORGANIZATION_ROLES.STATION_ADMIN]: {
      title: "Administrador de Estación",
      desc: "Conecta tus sensores y estaciones a una red existente.",
      icon: <Radio size={64} />,
      gradientClass: "header-purple",
      route: '/complete-registration/station'
    },
    [ORGANIZATION_ROLES.RESEARCHER]: {
      title: "Investigador",
      desc: "Accede a datos históricos y análisis de calidad del aire.",
      icon: <Microscope size={64} />,
      gradientClass: "header-indigo",
      route: '/complete-registration/researcher'
    }
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) return null; // TODO: Agregar componente de loading (spinner u otro)

  // Obtencion el rol y el estado directamente del token JWT
  const currentRole = user?.primary_role || 'citizen';
  const roleStatus = user?.role_status || 'APPROVED';
  const isCitizen = currentRole === 'citizen';

  // Determinar si tiene una solicitud pendiente
  const isPending = roleStatus === 'PENDING' && !isCitizen;
  const pendingRoleData = roleConfig[currentRole];

  return (
    <div className="dashboard-container">
      {/* Encabezado */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <h1 className="dashboard-logo">VriSA</h1>
            </Link>
          </div>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hola, {user?.first_name}</span>
          <button className="logout-btn-text" onClick={handleLogout}>
            <LogOut size={16} style={{ display: 'inline', marginRight: '5px' }}/>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Banner de completar registro si tiene rol pendiente */}
      {isPending && (
        <div className="registration-banner">
          <div className="banner-content">
            <div className="banner-icon"><AlertCircle size={24} /></div> 
            <div className="banner-text">
              <strong>Tu solicitud está en proceso.</strong>
              <p>Tienes un rol de <b>{pendingRoleData?.title || currentRole}</b> pendiente. Completa tu perfil para agilizar la aprobación.</p>
            </div>
            <button 
              className="banner-btn" 
              onClick={() => navigate(roleConfig[currentRole]?.route || '/complete-registration')}
            >
              Completar ahora
            </button>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        {/* Barra Lateral */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" to="/dashboard"/>
            <NavItem icon={<FileText size={20}/>} label="Reportes" to="/dashboard/reports" />
            <NavItem icon={<User size={20}/>} label="Perfil" to="/profile"/>
            
            {/* Enlace destacado para completar registro */}
            {isPending && (
              <NavItem 
                icon={<ArrowRight size={20}/>} 
                label="Completar registro" 
                to="/complete-registration"
                highlight={true}
              />
            )}
          </nav>
        </aside>

        {/* Contenido */}
        <section className="dashboard-content centered-content">
          
          {/* CASO 1: Usuario con Rol Pendiente (Investigador, Admin, Institución) */}
          {isPending && pendingRoleData ? (
            <div className="single-role-view">
              <div className="content-header text-center">
                <h2>¡Bienvenido a VriSA, {user?.first_name}!</h2>
                <p className="content-subtitle">
                  Has solicitado el rol de <strong>{pendingRoleData.title}</strong>. 
                  Necesitamos información adicional para validar tu cuenta.
                </p>
              </div>

              <div className="single-role-card-container">
                <RoleCard 
                  title={pendingRoleData.title}
                  desc={pendingRoleData.desc}
                  icon={pendingRoleData.icon}
                  gradientClass={pendingRoleData.gradientClass}
                  onClick={() => navigate(roleConfig[currentRole]?.route || '/complete-registration')}
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
                    : `Tu perfil de ${currentRole} está activo. Explora las opciones disponibles.`
                  }
                </p>
              </div>

              <div className="citizen-features">
                <FeatureCard 
                  title="Dashboard" 
                  desc="Visualiza el estado de la calidad del aire en tiempo real."
                  icon={<LayoutDashboard size={32} color="white" />}
                  onClick={() => navigate('/dashboard')}
                />
                <FeatureCard 
                  title="Reportes" 
                  desc="Consulta informes históricos y estadísticas ambientales."
                  icon={<FileText size={32} color="white" />}
                  onClick={() => navigate('/dashboard/reports')}
                />
                <FeatureCard 
                  title="Estaciones" 
                  desc="Explora las estaciones de monitoreo disponibles."
                  icon={<Radio size={32} color="white" />}
                  onClick={() => navigate('/dashboard/stations')}
                />
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

/* --- Sub-componentes para limpiar el JSX --- */

function FeatureCard({ title, desc, icon, onClick }) {
  return (
    <div className="feature-card" onClick={onClick}>
      <div className="feature-icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function RoleCard({ title, desc, icon, gradientClass, onClick, buttonText }) {
  return (
    <div className="role-card">
      <div className={`role-card-header ${gradientClass}`}>
        {/* Clonamos el elemento para forzar el color blanco si viene de prop */}
        <div style={{ color: 'white' }}>{icon}</div>
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

export default HomePage;