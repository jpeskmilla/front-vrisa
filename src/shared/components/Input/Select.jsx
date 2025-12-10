import { ChevronDown } from "lucide-react";
import "./select.css";

/**
 * Componente Select reutilizable con estilos unificados.
 * 
 * @param {string|number} value - Valor seleccionado actualmente.
 * @param {function} onChange - Función manejadora del evento change.
 * @param {Array<{value: string|number, label: string}>} options - Lista de opciones.
 * @param {ElementType} icon - (Opcional) Componente de icono (Lucide) para la izquierda.
 * @param {boolean} disabled - (Opcional) Deshabilita el select.
 * @param {string} className - (Opcional) Clases CSS adicionales para el contenedor.
 */
export default function Select({ 
  value, 
  onChange, 
  options = [], 
  icon: Icon, 
  disabled = false,
  className = ""
}) {
  return (
    <div className={`custom-select-wrapper ${className}`}>
      {/* Icono Izquierdo (Opcional) */}
      {Icon && (
        <div className="custom-select-icon-left">
          <Icon size={18} />
        </div>
      )}

      <select 
        className={`custom-select ${Icon ? 'has-icon' : ''}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Flecha Derecha Fija */}
      <div className="custom-select-icon-right">
        <ChevronDown size={16} />
      </div>
    </div>
  );
}
