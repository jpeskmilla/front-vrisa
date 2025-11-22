// src/components/Desktop1/Desktop1.jsx
import React from "react";
// reemplaza por rutas reales de tus assets exportados desde Figma
import Logo from "../../assets/vrisa_logo.png";
import homepage from "../../assets/homepage.jpg";
import "./homepage-styles.css";
import { LoginInput } from "../../shared/components/Input";

export default function Desktop1() {
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

        <div className="form-container">
          <LoginInput label="*  Correo" className="form-input" />
          <LoginInput
            type="password"
            label="* Contraseña"
            className="form-input"
          />
        </div>

        <p className="forget-text">¿Olvidaste tu contraseña?</p>

        <button type="button" className="login-button">
          Iniciar sesión
        </button>

        <p className="register-text">
          ¿No tienes cuenta? <span>Regístrate</span>
        </p>

        <img src={Logo} alt="Logo" className="vrisa-logo" />
      </div>
    </div>
  );
}
