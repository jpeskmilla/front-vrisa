import "./control-bar.css";

/**
 * Contenedor estilizado para las barras de herramientas superiores.
 * Estilo unificado tipo "Cápsula" o "Panel flotante".
 */
export default function ControlBar({ children, className = "" }) {
  return (
    <div className={`cb-container ${className}`}>
      {children}
    </div>
  );
}
