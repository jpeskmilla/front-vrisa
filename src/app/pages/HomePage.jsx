import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './homepage-styles.css';

/**
 * Página principal de la aplicación.
 * Permite al usuario seleccionar su rol (si lo desea) para completar su registro.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos del usuario
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

      <main className="dashboard-main">
        {/* Barra Lateral */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <NavItem icon={<IconAlert />} label="Alertas" />
            <NavItem icon={<IconReport />} label="Reportes" />
            <NavItem icon={<IconProfile />} label="Perfil" />
          </nav>
        </aside>

        {/* Contenido */}
        <section className="dashboard-content centered-content">
          <div className="content-header text-center">
            <h2>¡Bienvenido a VriSA!</h2>
            <p className="content-subtitle">Selecciona tu rol para completar el registro.</p>
          </div>

          <div className="role-cards-grid">
            {/* Tarjeta 1 */}
            <RoleCard 
              title="Representante de Institución"
              desc="Registra tu organización y gestiona redes de monitoreo."
              icon={<IconInstitution />}
              gradientClass="header-blue"
              onClick={() => navigate('/register-institution')}
            />
            
            {/* Tarjeta 2 */}
            <RoleCard 
              title="Administrador de Estación"
              desc="Conecta tus sensores y estaciones a una red existente."
              icon={<IconStation />}
              gradientClass="header-purple"
              onClick={() => navigate('/register-station')}
            />

            {/* Tarjeta 3 */}
            <RoleCard 
              title="Investigador"
              desc="Accede a datos históricos y análisis de calidad del aire."
              icon={<IconResearch />}
              gradientClass="header-indigo"
              onClick={() => navigate('/register-researcher')}
            />
          </div>

          {/* Indicación hacia el menú */}
          <div className="sidebar-hint-container">
            <p className="sidebar-hint-text">
              <svg className="hint-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              ¿No deseas registrar un rol? Explora las opciones en el<strong>menú lateral</strong>.
            </p>
          </div>

        </section>
      </main>
    </div>
  );
}

/* Sub-componentes */

function RoleCard({ title, desc, icon, gradientClass, onClick }) {
  return (
    <div className="role-card">
      <div className={`role-card-header ${gradientClass}`}>
        {icon}
      </div>
      <div className="role-card-body">
        <h3>{title}</h3>
        <p>{desc}</p>
        <button className="role-select-btn" onClick={onClick}>
          Seleccionar
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label }) {
  return (
    <Link to="#" className="nav-item">
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

export default HomePage;