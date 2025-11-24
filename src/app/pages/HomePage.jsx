import React, { useState } from "react";
import Logo from "../../assets/vrisa_logo.png";
import homepage from "../../assets/homepage.jpg";
import "./homepage-styles.css";
import { LoginInput } from "../../shared/components/Input";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../shared/api";

/**
 * Componente de la página de inicio de sesión.
 * Permite a los usuarios ingresar su correo y contraseña para iniciar sesión.
 * También proporciona un enlace para registrarse si no tienen una cuenta.
 */
export default function Desktop1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
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
        // Redirigir después del login exitoso
        navigate("/dashboard");
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      <div className="image-container">
        <img src={homepage} alt="homepage" className="homepage-image" />
      </div>

      <div className="homepage-container">
        <div className="homepage-welcome-container">
          <strong>¡Bienvenido!</strong>
          <p>Ingresa tu correo y contraseña para iniciar</p>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          <LoginInput
            label="*  Correo"
            className="form-input"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange("email")}
            required
          />
          <LoginInput
            type="password"
            label="* Contraseña"
            className="form-input"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange("password")}
            required
          />

          {error && (
            <p style={{ color: "#e53935", fontSize: "0.9rem", marginTop: "8px" }}>
              {error}
            </p>
          )}

          <p className="forget-text">¿Olvidaste tu contraseña?</p>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="register-text">
          ¿No tienes cuenta?{" "}
          <span onClick={handleRegisterClick} style={{ cursor: "pointer" }}>
            Regístrate
          </span>
        </p>

        <img src={Logo} alt="Logo" className="vrisa-logo" />
      </div>
    </div>
  );
}
