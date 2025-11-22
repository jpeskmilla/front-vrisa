// src/components/Desktop1/Desktop1.jsx
import React from "react";
// reemplaza por rutas reales de tus assets exportados desde Figma
import Logo from "../../assets/vrisa_logo.png";
import homepage from "../../assets/homepage.jpg";
import "./homepage-styles.css";
export default function Desktop1() {
  return (
    <div>
      <img src={homepage} alt="homepage" className="desktop1-homepage" />
      <img src={Logo} alt="Logo" className="desktop1-logo" />
    </div>
  );
}
