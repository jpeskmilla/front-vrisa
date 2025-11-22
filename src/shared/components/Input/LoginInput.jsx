import React, { useState } from "react";
import HidePasswordButton from "../Button/HidePasswordButton";
import "./login-input.css";

const LoginInput = ({
  type = "text",
  placeholder = "",
  label = "",
  required = false,
  value,
  onChange,
  icon,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`login-input-container ${className}`}>
      {/* Label */}
      {label && (
        <label className="login-input-label">
          {label}
          {required && <span className="login-input-required">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="login-input-wrapper">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="login-input-field"
        />

        {/* Icono (para contraseña u otros) */}
        {isPassword && (
          <HidePasswordButton
            showPassword={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        )}

        {icon && !isPassword && (
          <div className="login-input-icon-container">
            <img src={icon} alt="Icon" className="login-input-icon" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginInput;
