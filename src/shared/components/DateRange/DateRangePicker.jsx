import { Calendar, ChevronDown, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { QUICK_RANGES } from "../../constants";
import "./date-range.css";

export default function DateRangePicker({ startDate, endDate, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("Últimos 7 días");
  const containerRef = useRef(null);

  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickSelect = (range) => {
    const end = new Date();
    const start = new Date(end.getTime() - range.minutes * 60000);
    
    // Formatear para input datetime-local (YYYY-MM-DDTHH:mm)
    const formatLocal = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    setLabel(range.label);
    setLocalStart(formatLocal(start));
    setLocalEnd(formatLocal(end));
    
    // Enviar ISO String completo
    onChange(start.toISOString(), end.toISOString());
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    setLabel("Rango personalizado");
    const startISO = new Date(localStart).toISOString();
    const endISO = new Date(localEnd).toISOString();
    onChange(startISO, endISO);
    setIsOpen(false);
  };

  return (
    <div className="date-picker-container" ref={containerRef}>
      {/* Botón Principal */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="date-picker-trigger"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#64748b" />
          <span>{label}</span>
        </div>
        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="date-picker-dropdown">
          
          {/* Columna Izquierda (Rangos Rápidos) */}
          <div className="dp-sidebar">
            <span className="dp-label-mini">RANGOS RÁPIDOS</span>
            <div className="dp-list">
              {QUICK_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSelect(range)}
                  className="quick-range-btn"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Columna Derecha (Rango Absoluto) */}
          <div className="dp-main">
            <div className="dp-header">
              <Calendar size={16} color="#4339F2"/>
              <span>Rango Absoluto</span>
            </div>
            
            <div className="dp-input-group">
              <label className="dp-input-label">Desde</label>
              <input 
                type="datetime-local" 
                className="dp-input"
                value={localStart}
                onChange={(e) => setLocalStart(e.target.value)}
              />
            </div>
            
            <div className="dp-input-group">
              <label className="dp-input-label">Hasta</label>
              <input 
                type="datetime-local" 
                className="dp-input"
                value={localEnd}
                onChange={(e) => setLocalEnd(e.target.value)}
              />
            </div>

            <button type="button" onClick={handleApplyCustom} className="dp-apply-btn">
              Aplicar Rango
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
