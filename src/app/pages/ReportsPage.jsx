import { useState, useEffect } from "react";
import { Download, Filter, Activity, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { StationAPI, ReportAPI } from "../../shared/api"; // Asegúrate que ReportAPI esté exportado en index
import "./dashboard-styles.css";

export default function ReportsPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fechas por defecto: Últimos 7 días
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [dates, setDates] = useState({
    start: lastWeek,
    end: today
  });

  // Cargar estaciones al inicio
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await StationAPI.getStations();
        setStations(data);
      } catch (error) {
        console.error("Error cargando estaciones:", error);
      }
    };
    fetchStations();
  }, []);

  const handleDownload = async (reportType) => {
    if (!selectedStation && reportType !== 'Alertas') {
      alert("Por favor selecciona una estación primero.");
      return;
    }

    setDownloading(true);
    try {
      // Lógica de descarga según el tipo
      if (reportType === "Calidad Aire") {
        // Reporte diario (usamos la fecha de fin como referencia)
        await ReportAPI.downloadAirQualityReport(selectedStation, dates.end);
      } 
      else if (reportType === "Tendencias") {
        // Reporte de rango
        await ReportAPI.downloadTrendsReport(selectedStation, dates.start, dates.end);
      } 
      else if (reportType === "Alertas") {
        // Reporte de últimas 24h (puede ser global o por estación)
        await ReportAPI.downloadAlertsReport(selectedStation);
      }
    } catch (error) {
      console.error("Error descargando reporte:", error);
      alert("No se pudo generar el reporte. Verifica que existan datos para el rango seleccionado.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="content-header">
        <h2>Centro de Reportes</h2>
        <p>Generación de informes PDF históricos y de cumplimiento normativo.</p>
      </div>

      <div className="p-6 grid grid-cols-1 gap-6">
        
        {/* Barra de Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
            
            {/* Selector de Estación */}
            <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Estación de Monitoreo</label>
                <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                    <Filter size={18} className="text-brand-500"/>
                    <select 
                        className="bg-transparent w-full outline-none text-gray-700"
                        value={selectedStation}
                        onChange={(e) => setSelectedStation(e.target.value)}
                    >
                        <option value="">-- Seleccionar Estación --</option>
                        {stations.map(s => (
                            <option key={s.station_id} value={s.station_id}>
                                {s.station_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Fechas */}
            <div className="flex gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Desde</label>
                    <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                        <Calendar size={18} className="text-gray-500"/>
                        <input 
                            type="date" 
                            value={dates.start}
                            onChange={(e) => setDates({...dates, start: e.target.value})}
                            className="bg-transparent outline-none text-gray-700"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Hasta</label>
                    <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                        <Calendar size={18} className="text-gray-500"/>
                        <input 
                            type="date" 
                            value={dates.end}
                            onChange={(e) => setDates({...dates, end: e.target.value})}
                            className="bg-transparent outline-none text-gray-700"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Calidad del Aire Diario */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <Activity size={24}/>
                    </div>
                    <h3 className="font-bold text-gray-800">Estado Diario</h3>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                    Informe detallado tabular de las mediciones del día seleccionado ({dates.end}) y cumplimiento de norma.
                </p>
                <button 
                    onClick={() => handleDownload("Calidad Aire")}
                    disabled={downloading}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                    {downloading ? "Generando..." : <><Download size={18}/> Descargar PDF</>}
                </button>
            </div>

            {/* Tarjeta 2: Tendencias (Rango) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                        <TrendingUp size={24}/>
                    </div>
                    <h3 className="font-bold text-gray-800">Tendencias Históricas</h3>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                    Gráficas de comportamiento de variables entre {dates.start} y {dates.end}. Ideal para análisis semanal o mensual.
                </p>
                <button 
                    onClick={() => handleDownload("Tendencias")}
                    disabled={downloading}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                    {downloading ? "Generando..." : <><Download size={18}/> Descargar PDF</>}
                </button>
            </div>

            {/* Tarjeta 3: Alertas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600">
                        <AlertTriangle size={24}/>
                    </div>
                    <h3 className="font-bold text-gray-800">Alertas Críticas</h3>
                </div>
                <p className="text-sm text-gray-500 flex-1">
                    Registro de eventos donde se superaron los límites permitidos en las últimas 24 horas.
                </p>
                <button 
                    onClick={() => handleDownload("Alertas")}
                    disabled={downloading}
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                >
                    {downloading ? "Generando..." : <><Download size={18}/> Descargar PDF</>}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}