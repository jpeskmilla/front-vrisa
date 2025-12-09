import "./stat-card.css";

/**
 * Componente para mostrar un indicador clave de rendimiento.
 * 
 * @param {string} label - Título de la tarjeta (ej: "Promedio")
 * @param {string|number} value - El valor principal
 * @param {string} unit - La unidad de medida (ej: "µg/m³")
 * @param {ReactNode} icon - Icono de Lucide-react
 * @param {string} colorClass - Clase CSS para el fondo del icono (ej: "bg-red-50") o style inline si prefieres
 * @param {string} barColor - Color HEX para la barra inferior decorativa
 */
export default function StatCard({ label, value, unit, icon, colorClass, barColor }) {
  return (
    <div className="stat-card">
      {/* Icono con fondo circular/cuadrado */}
      <div className={`stat-icon-wrapper ${colorClass || ''}`}>
        {icon}
      </div>
      
      {/* Contenido de texto */}
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          <span className="stat-unit">{unit}</span>
        </div>
      </div>

      {/* Barra decorativa inferior */}
      <div className="stat-bar" style={{ backgroundColor: barColor }}></div>
    </div>
  );
}
