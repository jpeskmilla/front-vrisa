import React from "react";
import passwordIcon from "../../../assets/password_icon.png";
import "../Input/login-input.css";

const HidePasswordButton = ({ showPassword, onToggle, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`login-input-icon-button ${className}`}
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      <img
        src={passwordIcon}
        alt={showPassword ? "Ocultar" : "Mostrar"}
        className="login-input-icon"
      />
    </button>
  );
};

export default HidePasswordButton;
