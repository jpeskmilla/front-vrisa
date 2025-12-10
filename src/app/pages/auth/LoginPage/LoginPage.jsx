import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import homepage from "../../../../assets/homepage.jpg";
import Logo from "../../../../assets/vrisa_logo.png";
import { AuthAPI } from "../../../../shared/api";
import "./LoginPage.css";

/**
 * Componente de la página de inicio de sesión.
 * Permite a los usuarios ingresar su correo y contraseña para iniciar sesión.
 * También proporciona un enlace para registrarse si no tienen una cuenta.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleChange = (field) => (e) => {
    setFormData({...formData, [field]: e.target.value});
    setError(""); // Limpiar error al escribir
  };

  /**
   * Función para manejar el envío del formulario de inicio de sesión.
   * @param {*} e - evento del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await AuthAPI.login(formData.email, formData.password);

      // Guardar token en localStorage
      if (response.access) {
        localStorage.setItem("token", response.access);
        localStorage.setItem("refreshToken", response.refresh);
        const decodedToken = jwtDecode(response.access);

        const userData = {
          user_id: decodedToken.user_id,
          email: decodedToken.email,
          first_name: decodedToken.full_name?.split(" ")[0] || decodedToken.first_name || decodedToken.email.split("@")[0],
          institution_id: decodedToken.institution_id,
          primary_role: decodedToken.primary_role,
          role_status: decodedToken.role_status
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));

        const role = decodedToken.primary_role;
        if (role === "super_admin") {
          navigate("/admin");
        } else if (role === "institution_head") {
          navigate("/institution-admin");
        } else {
          navigate("/home");
        }
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err) {
      // Mensajes más amigables según el tipo de error
      if (err.status === 401) {
        setError("Las credenciales ingresadas no son correctas. Por favor, verifica tu correo electrónico y contraseña.");
      } else if (err.status === 404) {
        setError("No se pudo conectar con el servidor. Por favor, intenta nuevamente más tarde.");
      } else if (err.status >= 500) {
        setError("Ocurrió un error en el servidor. Por favor, intenta nuevamente en unos momentos.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="header">
        <div className="logo">VriSA</div>
      </header>

      <div className="main-content">
        <div className="image-section">
          <img src={homepage} alt="homepage" className="homepage-image" />
        </div>

        <div className="form-section">
          <h1 className="form-title">¡Bienvenido!</h1>
          <p className="form-subtitle">Ingresa tu correo y contraseña para iniciar sesión</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Correo electrónico
              </label>
              <input type="email" className="form-input" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange("email")} required />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Contraseña
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange("password")}
                  required
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

            <p className="forget-text">¿Olvidaste tu contraseña?</p>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="register-text">
            ¿No tienes cuenta? <span onClick={handleRegisterClick}>Regístrate</span>
          </p>

          <img src={Logo} alt="Logo VriSA" className="vrisa-logo" />
        </div>
      </div>
    </div>
  );
}
