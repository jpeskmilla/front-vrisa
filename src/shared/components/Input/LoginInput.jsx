import React, { useState } from "react";

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
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="absolute top-[-30px] left-[24px] [font-family:'Inter-Regular',Helvetica] font-normal text-black text-2xl tracking-[0] leading-[normal]">
          {label}
          {required && <span className="text-[#ff0000] ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative w-full h-[70px]">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-full px-6 bg-white rounded-[10px] border-[3px] border-solid ${
            isFocused ? "border-primario" : "border-primario"
          } [font-family:'Inter-Regular',Helvetica] font-normal text-[#4f4f4f] text-2xl tracking-[0] leading-[normal] outline-none placeholder:text-[#4f4f4f]`}
        />

        {/* Icono (para contraseña u otros) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 w-[37px] h-[37px] flex items-center justify-center cursor-pointer"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            <img
              src="/password_icon.png"
              alt={showPassword ? "Ocultar" : "Mostrar"}
              className="w-full h-full object-cover"
            />
          </button>
        )}

        {icon && !isPassword && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 w-[37px] h-[37px] flex items-center justify-center">
            <img src={icon} alt="Icon" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginInput;
