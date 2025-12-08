import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../shared/api";
import { formatApiErrors } from "../../shared/utils";
import { ORGANIZATION_ROLES } from "../../shared/constants/roles";
import { Eye, EyeOff } from "lucide-react"; 
import "./registeruserpage-styles.css";

export default function RegisterUserPage() {
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    belongsToOrganization: null, 
    requestedRole: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const organizationRoles = [
    { value: ORGANIZATION_ROLES.STATION_ADMIN, label: "Administrador de estación" },
    { value: ORGANIZATION_ROLES.RESEARCHER, label: "Investigador" },
    { value: ORGANIZATION_ROLES.INSTITUTION, label: "Representante de Institución" },
  ];

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleOrganizationChange = (belongsToOrg) => {
    setFormData({
      ...formData, 
      belongsToOrganization: belongsToOrg,
      requestedRole: "" 
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

    // Validaciones de UX
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
      // 2. Construimos el Payload limpio para el nuevo Backend
      const payload = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        // Si dijo "No", mandamos 'citizen'. Si dijo "Sí", mandamos el rol elegido.
        requested_role: formData.belongsToOrganization === false ? 'citizen' : formData.requestedRole
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
    <div className="register-user-container">
      <header className="register-user-header">
        <button className="register-user-back-button" onClick={() => navigate("/")}>
          <span>‹</span> Ir a Inicio
        </button>
        <div className="register-user-logo">VriSA</div>
      </header>

      <div className="register-user-form-card">
        <h1 className="register-user-form-title">¡Regístrate!</h1>
        <p className="register-user-form-subtitle">Crea una cuenta para gestionar tus estaciones o acceder a reportes de calidad del aire</p>

        <form onSubmit={handleSubmit} className="register-user-form">
          
          {/* Nombre y Apellido */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="register-user-form-group" style={{ flex: 1 }}>
              <label className="register-user-form-label">
                <span className="register-user-required">*</span> Nombre
              </label>
              <input type="text" name="first_name" className="register-user-form-input" placeholder="Juan" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="register-user-form-group" style={{ flex: 1 }}>
              <label className="register-user-form-label">
                <span className="register-user-required">*</span> Apellido
              </label>
              <input type="text" name="last_name" className="register-user-form-input" placeholder="Pérez" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="register-user-form-group">
            <label className="register-user-form-label">
              <span className="register-user-required">*</span> Correo electrónico
            </label>
            <input type="email" name="email" className="register-user-form-input" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="register-user-form-group">
            <label className="register-user-form-label">
              <span className="register-user-required">*</span> Teléfono de contacto
            </label>
            <input type="tel" name="phone" className="register-user-form-input" placeholder="Ingresa tu número de teléfono" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="register-user-form-group">
            <label className="register-user-form-label">
              <span className="register-user-required">*</span> Contraseña
            </label>
            <div className="register-user-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="register-user-form-input"
                placeholder="Establezca una contraseña"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="register-user-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={22} color="#666" /> : <Eye size={22} color="#666" />}
              </button>
            </div>
          </div>

          <div className="register-user-form-group">
            <label className="register-user-form-label">
              <span className="register-user-required">*</span> Confirmar contraseña
            </label>
            <div className="register-user-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`register-user-form-input ${formData.confirmPassword && formData.password === formData.confirmPassword ? "register-user-input-valid" : ""}`}
                placeholder="Confirme su contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                <div className="register-user-valid-icon">✓</div>
              ) : (
                <button type="button" className="register-user-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={22} color="#666" /> : <Eye size={22} color="#666" />}
                </button>
              )}
            </div>
          </div>

          <div className="register-user-form-group">
            <label className="register-user-form-label">
              <span className="register-user-required">*</span> ¿Pertenece usted a una organización ambiental?
            </label>
            <div className="register-user-radio-group">
              <label 
                className={`register-user-radio-option ${formData.belongsToOrganization === true ? "selected" : ""}`}
                onClick={() => handleOrganizationChange(true)}
              >
                <input 
                  type="radio" 
                  name="belongsToOrganization" 
                  checked={formData.belongsToOrganization === true}
                  onChange={() => {}}
                />
                <span className="register-user-radio-circle"></span>
                <span className="register-user-radio-label">Sí</span>
              </label>
              <label 
                className={`register-user-radio-option ${formData.belongsToOrganization === false ? "selected" : ""}`}
                onClick={() => handleOrganizationChange(false)}
              >
                <input 
                  type="radio" 
                  name="belongsToOrganization" 
                  checked={formData.belongsToOrganization === false}
                  onChange={() => {}}
                />
                <span className="register-user-radio-circle"></span>
                <span className="register-user-radio-label">No</span>
              </label>
            </div>
          </div>

          {/* Select de rol solo visible si pertenece a una organización */}
          {formData.belongsToOrganization === true && (
            <div className="register-user-form-group register-user-slide-in">
              <label className="register-user-form-label">
                <span className="register-user-required">*</span> Escoja el rol que desea solicitar
            </label>
            <div className="register-user-dropdown-wrapper">
                <button 
                  type="button" 
                  className={`register-user-dropdown-trigger ${isDropdownOpen ? "open" : ""}`} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={formData.requestedRole ? "" : "placeholder"}>
                    {formData.requestedRole 
                      ? organizationRoles.find(r => r.value === formData.requestedRole)?.label 
                      : "Selecciona un rol"}
                  </span>
                <span className={`register-user-dropdown-arrow ${isDropdownOpen ? "open" : ""}`}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="register-user-dropdown-menu">
                    {organizationRoles.map((role) => (
                      <div 
                        key={role.value} 
                        className="register-user-dropdown-item" 
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

          {/* Mostrar mensaje si es ciudadano (Cuadro verde) */}
          {formData.belongsToOrganization === false && (
            <div className="register-user-citizen-info register-user-slide-in">
              <div className="register-user-citizen-badge">
                <span className="register-user-citizen-icon">👤</span>
                <span>Te registrarás como <strong>Ciudadano</strong></span>
              </div>
              <p className="register-user-citizen-description">
                Como ciudadano tendrás acceso a consultar reportes de calidad del aire y datos de las estaciones de monitoreo.
              </p>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="register-user-alert-error-container">
              <ul className="register-user-alert-list">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón con texto dinámico */}
          <button type="submit" className="register-user-submit-button" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
            {loading 
              ? "Registrando..." 
              : formData.belongsToOrganization === false 
                ? "Registrarse como ciudadano" 
                : formData.requestedRole 
                  ? `Solicitar registro como ${organizationRoles.find(r => r.value === formData.requestedRole)?.label.split(" ")[0]}...`
                  : "Registrarse"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
