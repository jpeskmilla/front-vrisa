/**
 * Mapeo de colores por variable (Código: Color HEX)
 * Utilizado en gráficos de calidad del aire.
 */
export const VARIABLE_COLORS = {
  "PM2.5": "#EF4444", // Rojo
  "PM10": "#F97316",  // Naranja
  "TEMP": "#3B82F6",  // Azul
  "HUM": "#10B981",   // Verde
  "CO": "#6366F1",    // Indigo
  "NO2": "#8B5CF6",   // Violeta
  "DEFAULT": "#4F46E5" // Color por defecto
};

// Definición de umbrales para AQI de acuerdo al estándar US EPA
export const AQI_THRESHOLDS = [
  { value: 50, label: "Moderado (51-100)", color: "#FACC15" },      
  { value: 100, label: "Dañino G.S. (101-150)", color: "#FB923C" }, 
  { value: 150, label: "Nocivo (151-200)", color: "#EF4444" },      
  { value: 200, label: "Muy Nocivo (201-300)", color: "#A855F7" },  
  { value: 300, label: "Peligroso (301+)", color: "#7F1D1D" },      
];