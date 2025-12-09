import React, { useState } from "react";
import { Download, Filter, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import "./dashboard-styles.css"; // Usa tus estilos existentes

export default function ReportsPage() {
  // Datos falsos para que VEAS la página funcionado de inmediato
  const stations = [
    { id: 1, name: "Estación Norte" },
    { id: 2, name: "Estación Sur" },
    { id: 3, name: "Estación Centro" }
  ];

  const [selectedStation, setSelectedStation] = useState("");

  const handleDownload = (tipo) => {
    alert(`Aquí se descargaría el reporte de: ${tipo}`);
    // Aquí luego conectaremos con el Backend que hicimos antes
  };

  return (
    <div className="dashboard-container">
      <div className="content-header">
        <h2>Reportes y Descargas</h2>
        <p>Genera archivos PDF con la información histórica.</p>
      </div>

      <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        
        {/* Selector Global */}
        <div style={{ gridColumn: "1 / -1", background: "white", padding: "20px", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
            <Filter size={20} color="#4F46E5"/>
            <select 
                style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
            >
                <option value="">Selecciona una estación...</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>

        {/* Tarjeta 1: Calidad del Aire */}
        <div className="summary-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "15px", height: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#E0E7FF", padding: "8px", borderRadius: "8px" }}><Activity color="#4339F2"/></div>
                <h3 style={{ margin: 0 }}>Estado Ambiental</h3>
            </div>
            <p style={{ fontSize: "0.9em", color: "#666" }}>Reporte diario de variables y cumplimiento normativo.</p>
            <button onClick={() => handleDownload("Calidad Aire")} style={{ width: "100%", padding: "10px", background: "#4339F2", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "center", gap: "5px" }}>
                <Download size={16}/> Descargar PDF
            </button>
        </div>

        {/* Tarjeta 2: Tendencias */}
        <div className="summary-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "15px", height: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#F3E8FF", padding: "8px", borderRadius: "8px" }}><TrendingUp color="#7E22CE"/></div>
                <h3 style={{ margin: 0 }}>Tendencias</h3>
            </div>
            <p style={{ fontSize: "0.9em", color: "#666" }}>Gráficas de comportamiento histórico.</p>
            <button onClick={() => handleDownload("Tendencias")} style={{ width: "100%", padding: "10px", background: "#7E22CE", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "center", gap: "5px" }}>
                <Download size={16}/> Descargar PDF
            </button>
        </div>

        {/* Tarjeta 3: Alertas */}
        <div className="summary-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "15px", height: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#FEE2E2", padding: "8px", borderRadius: "8px" }}><AlertTriangle color="#EF4444"/></div>
                <h3 style={{ margin: 0 }}>Alertas Críticas</h3>
            </div>
            <p style={{ fontSize: "0.9em", color: "#666" }}>Registro de excesos de límites permitidos.</p>
            <button onClick={() => handleDownload("Alertas")} style={{ width: "100%", padding: "10px", background: "#EF4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", justifyContent: "center", gap: "5px" }}>
                <Download size={16}/> Descargar PDF
            </button>
        </div>

      </div>
    </div>
  );
}