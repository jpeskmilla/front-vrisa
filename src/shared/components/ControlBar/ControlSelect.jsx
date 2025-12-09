import { ChevronDown } from "lucide-react";
import "./control-bar.css";

/**
 * Selector estandarizado para la barra de control.
 * @param {string} label - Texto en mayúsculas a la izquierda (ej: ESTACIÓN)
 * @param {string} value - Valor actual
 * @param {function} onChange - Handler
 * @param {Array} options - Array de objetos { value, label }
 * @param {ReactNode} icon - Icono opcional para el select
 */
export default function ControlSelect({ 
  label, 
  value, 
  onChange, 
  options = [], 
  icon: Icon, 
  disabled = false 
}) {
  return (
    <div className="cb-input-group">
      {/* Etiqueta */}
      {label && (
        <span className="cb-label hidden md:block">
          {label}
        </span>
      )}
      
      <div className="cb-select-wrapper">
        {/* Icono Izquierdo (Opcional) */}
        {Icon && (
          <div className="cb-icon-left">
            <Icon size={18} />
          </div>
        )}

        {/* El Select Nativo Estilizado */}
        <select 
          className={`cb-select ${Icon ? 'has-icon' : ''}`}
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
        <div className="cb-icon-right">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}
