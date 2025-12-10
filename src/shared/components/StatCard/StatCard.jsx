import "./stat-card.css";

/**
 * Componente para mostrar un indicador clave de rendimiento.
 *
 * @param {string} label - Título de la tarjeta (ej: "Promedio")
 * @param {string|number} value - El valor principal
 * @param {string} unit - La unidad de medida (ej: "µg/m³")
 * @param {ReactNode} icon - Icono de Lucide-react
 * @param {string} colorHex - Color HEX para el borde.
 * @param {string} borderType - Tipo de borde: "left" | "full" | "none"
 * @param {string} statusColor - Color HEX para el texto de la unidad (ej: verde/rojo para normal/alerta)
 */
export default function StatCard({label, value, unit, icon, colorHex, borderType = "bottom", statusColor}) {
  const cardStyle = {};

  if (borderType === "left") {
    cardStyle.borderLeftColor = colorHex;
  } else if (borderType === "full") {
    cardStyle.borderColor = colorHex;
  }

  return (
    <div className={`stat-card border-${borderType}`} style={cardStyle}>
      <div className="stat-icon-wrapper">{icon}</div>

      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          {unit && (
            <span className="stat-unit" style={statusColor ? {color: statusColor} : {}}>
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
