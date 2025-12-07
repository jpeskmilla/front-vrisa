import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../shared/api";
import { formatApiErrors } from "../../shared/utils";
import { ORGANIZATION_ROLES } from "../../shared/constants/roles";
import "./registeruserpage-styles.css";

export default function RegisterUserPage() {
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    belongsToOrganization: null, // null = sin seleccionar, true = Sí, false = No
    requestedRole: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Roles disponibles para usuarios que pertenecen a una organización
  const organizationRoles = [
    { value: ORGANIZATION_ROLES.STATION_ADMIN, label: "Administrador de estación" },
    { value: ORGANIZATION_ROLES.RESEARCHER, label: "Investigador" },
    { value: ORGANIZATION_ROLES.INSTITUTION, label: "Institución" },
  ];

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleOrganizationChange = (belongsToOrg) => {
    setFormData({
      ...formData, 
      belongsToOrganization: belongsToOrg,
      requestedRole: belongsToOrg ? "" : "citizen" // Si no pertenece, es ciudadano
    });
    setIsDropdownOpen(false);
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({...formData, requestedRole: roleValue});
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessages(["Las contraseñas no coinciden."]);
      return;
    }

    if (formData.belongsToOrganization === null) {
      setErrorMessages(["Por favor, indica si perteneces a una organización ambiental."]);
      return;
    }

    if (formData.belongsToOrganization && !formData.requestedRole) {
      setErrorMessages(["Por favor, selecciona el rol que deseas solicitar."]);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.username,
        last_name: "Usuario", // Valor por defecto temporal
        phone: formData.phone,
        belongs_to_organization: formData.belongsToOrganization,
        requested_role: formData.requestedRole || "citizen",
        role_id: null,
        institution_id: null,
      };

      await AuthAPI.register(payload);

      alert("Usuario registrado correctamente. Por favor inicia sesión.");
      navigate("/");
    } catch (err) {
      const messages = formatApiErrors(err, "Ocurrió un error inesperado");
      setErrorMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <header className="header">
        <button className="back-button" onClick={() => navigate("/")}>
          <span>‹</span> Ir a Inicio
        </button>
        <div className="logo">VriSA</div>
      </header>

      <div className="form-card">
        <h1 className="form-title">¡Regístrate!</h1>
        <p className="form-subtitle">Crea una cuenta para gestionar tus estaciones o acceder a reportes de calidad del aire</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Nombre de usuario
            </label>
            <input type="text" name="username" className="form-input" placeholder="Ingresa un nombre de usuario" value={formData.username} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Correo electrónico
            </label>
            <input type="email" name="email" className="form-input" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Teléfono de contacto
            </label>
            <input type="tel" name="phone" className="form-input" placeholder="Ingresa tu número de teléfono" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Contraseña
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Establezca una contraseña"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Confirmar contraseña
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-input ${formData.confirmPassword && formData.password === formData.confirmPassword ? "input-valid" : ""}`}
                placeholder="Confirme su contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                <div className="valid-icon">✓</div>
              ) : (
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirmPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> ¿Pertenece usted a una organización ambiental?
            </label>
            <div className="radio-group">
              <label 
                className={`radio-option ${formData.belongsToOrganization === true ? "selected" : ""}`}
                onClick={() => handleOrganizationChange(true)}
              >
                <input 
                  type="radio" 
                  name="belongsToOrganization" 
                  checked={formData.belongsToOrganization === true}
                  onChange={() => handleOrganizationChange(true)}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">Sí</span>
              </label>
              <label 
                className={`radio-option ${formData.belongsToOrganization === false ? "selected" : ""}`}
                onClick={() => handleOrganizationChange(false)}
              >
                <input 
                  type="radio" 
                  name="belongsToOrganization" 
                  checked={formData.belongsToOrganization === false}
                  onChange={() => handleOrganizationChange(false)}
                />
                <span className="radio-circle"></span>
                <span className="radio-label">No</span>
              </label>
            </div>
          </div>

          {/* Select de rol solo visible si pertenece a una organización */}
          {formData.belongsToOrganization === true && (
            <div className="form-group slide-in">
              <label className="form-label">
                <span className="required">*</span> Escoja el rol que desea solicitar
            </label>
            <div className="dropdown-wrapper">
                <button 
                  type="button" 
                  className={`dropdown-trigger ${isDropdownOpen ? "open" : ""}`} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={formData.requestedRole ? "" : "placeholder"}>
                    {formData.requestedRole 
                      ? organizationRoles.find(r => r.value === formData.requestedRole)?.label 
                      : "Selecciona un rol"}
                  </span>
                <span className={`dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                    {organizationRoles.map((role) => (
                      <div 
                        key={role.value} 
                        className="dropdown-item" 
                        onClick={() => handleRoleSelect(role.value)}
                      >
                        {role.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Mostrar mensaje si es ciudadano */}
          {formData.belongsToOrganization === false && (
            <div className="citizen-info slide-in">
              <div className="citizen-badge">
                <span className="citizen-icon">👤</span>
                <span>Te registrarás como <strong>Ciudadano</strong></span>
              </div>
              <p className="citizen-description">
                Como ciudadano tendrás acceso a consultar reportes de calidad del aire y datos de las estaciones de monitoreo.
              </p>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="alert-error-container">
              <ul className="alert-list">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
            {loading 
              ? "Registrando..." 
              : formData.belongsToOrganization === false 
                ? "Registrarse como ciudadano" 
                : formData.requestedRole 
                  ? `Solicitar registro como ${organizationRoles.find(r => r.value === formData.requestedRole)?.label || 'usuario'}`
                  : "Registrarse"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
