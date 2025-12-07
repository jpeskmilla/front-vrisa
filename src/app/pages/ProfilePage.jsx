import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './profile-styles.css';

/**
 * Página de perfil del usuario.
 * Muestra y permite editar la información personal del usuario.
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
          setFormData({
            ...parsed,
            newPassword: "",
            confirmPassword: ""
          });
        } else {
          // Datos por defecto
          const defaultData = {
            first_name: "Usuario",
            email: "usuario@example.com",
            phone: "+57 300 123 4567",
            userType: "Sin definir",
            role_id: null,
            institution_id: null
          };
          setUser(defaultData);
          setFormData({
            ...defaultData,
            newPassword: "",
            confirmPassword: ""
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Validar contraseñas si se intenta cambiar
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      if (formData.newPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      // Crear objeto sin las contraseñas temporales
      const dataToSave = {
        first_name: formData.first_name,
        email: formData.email,
        userType: formData.userType,
        role_id: formData.role_id,
        institution_id: formData.institution_id
      };

      localStorage.setItem("userData", JSON.stringify(dataToSave));
      setUser(dataToSave);
      setFormData({
        ...dataToSave,
        newPassword: "",
        confirmPassword: ""
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    }
  };

  const handleCancel = () => {
    setFormData({
      ...user,
      newPassword: "",
      confirmPassword: ""
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando perfil...</p>
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
            <NavItem icon={<IconAlert />} label="Tableros" to="/dashboard"/>
            <NavItem icon={<IconReport />} label="Reportes" />
            <NavItem icon={<IconProfile />} label="Perfil" to="/profile" active/>
          </nav>
        </aside>

        {/* Contenido */}
        <section className="dashboard-content">
          <div className="profile-container">
            {/* Header del perfil */}
            <div className="profile-header">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <span>{user.first_name?.[0]}</span>
                </div>
                <div className="profile-header-info">
                  <h2>{user.first_name}</h2>
                  <p className="profile-role">{user.userType || "Usuario general"}</p>
                </div>
              </div>
              {!isEditing && (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <IconEdit />
                  Editar perfil
                </button>
              )}
            </div>

            {/* Mensaje de éxito */}
            {saveSuccess && (
              <div className="success-message">
                <IconCheck />
                Perfil actualizado correctamente
              </div>
            )}

            {/* Información del perfil */}
            <div className="profile-content">
              <div className="profile-section">
                <h3 className="section-title">Información Personal</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Nombre</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="profile-input"
                        placeholder="Ingresa tu nombre"
                      />
                    ) : (
                      <p>{user.first_name}</p>
                    )}
                  </div>

                  <div className="profile-field">
                    <label>Correo electrónico</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="profile-input"
                        placeholder="correo@ejemplo.com"
                      />
                    ) : (
                      <p>{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección de seguridad*/}
              {isEditing && (
                <div className="profile-section">
                  <h3 className="section-title">Cambiar Contraseña</h3>
                  <p className="section-subtitle">Deja estos campos vacíos si no deseas cambiar tu contraseña</p>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Nueva contraseña</label>
                      <div className="input-wrapper">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Ingresa tu nueva contraseña"
                        />
                        <button 
                          type="button" 
                          className="password-toggle-inline" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Confirmar nueva contraseña</label>
                      <div className="input-wrapper">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="profile-input"
                          placeholder="Confirma tu nueva contraseña"
                        />
                        <button 
                          type="button" 
                          className="password-toggle-inline" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                        <span className="password-match">✓ Las contraseñas coinciden</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              {isEditing && (
                <div className="profile-actions">
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button className="save-btn" onClick={handleSave}>
                    <IconCheck />
                    Guardar cambios
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Sub-componentes */

function NavItem({ icon, label, to, active }) {
  return (
    <Link to={to || "#"} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      <span className="nav-text">{label}</span>
    </Link>
  );
}

/* Íconos */
const IconAlert = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><circle cx="18" cy="5" r="3" fill="#ef4444" stroke="none" /></svg>;
const IconReport = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="8" y1="18" x2="8" y2="15" /><line x1="16" y1="18" x2="16" y2="13" /></svg>;
const IconProfile = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconEdit = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconEye = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconEyeOff = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;

export default ProfilePage;