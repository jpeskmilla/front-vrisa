import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../shared/api/http'; // Importamos la clase de error
import { AuthAPI } from '../../shared/api';
import './registerpage-styles.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const userTypes = [
    'Administrador de estación',
    'Institución',
    'Investigador',
    'Ciudadano'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeSelect = (type) => {
    setFormData({ ...formData, userType: type });
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages("");
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessages(["Las contraseñas no coinciden."]);
      return;
    }

    setLoading(true);

    try {        
        const payload = {
          email: formData.email,
          password: formData.password,
          first_name: formData.username, // Usando username como first_name temporalmente
          last_name: "Something",  // Valor por defecto temporal
          role_id: null,
          institution_id: null
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
        <button className="back-button" onClick={() => navigate('/')}>
          <span>‹</span> Ir a Inicio
        </button>
        <div className="logo">VriSA</div>
      </header>

      <div className="form-card">
        
        <h1 className="form-title">¡Regístrate!</h1>
        <p className="form-subtitle">
          Crea una cuenta para gestionar tus estaciones o
          acceder a reportes de calidad del aire
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Ingresa un nombre de usuario"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Teléfono de contacto
            </label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="Ingresa tu número de teléfono"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Contraseña
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Establezca una contraseña"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
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
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`form-input ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'input-valid' : ''}`}
                placeholder="Confirme su contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                <div className="valid-icon">✓</div>
              ) : (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showConfirmPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span> Tipo de usuario / Entidad (opcional)
            </label>
            <div className="dropdown-wrapper">
              <button
                type="button"
                className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={formData.userType ? '' : 'placeholder'}>
                  {formData.userType || 'Selecciona una opción'}
                </span>
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {userTypes.map((type) => (
                    <div
                      key={type}
                      className="dropdown-item"
                      onClick={() => handleUserTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errorMessages.length > 0 && (
            <div className="alert-error-container">
              <ul className="alert-list">
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            Registrarse como usuario general
          </button>
        </form>
      </div>
    </div>
  );
}