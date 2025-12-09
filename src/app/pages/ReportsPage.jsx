import { useState, useEffect } from "react";
import { Download, Filter, Calendar, Search } from "lucide-react";
import { StationAPI, ReportAPI, MeasurementAPI } from "../../shared/api";
import "./dashboard-styles.css";

export default function ReportsPage() {
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);
  
  // Estados de Filtros
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedVariable, setSelectedVariable] = useState(""); // "" = Todas
  const [reportCategory, setReportCategory] = useState("QUALITY"); // QUALITY | TRENDS | ALERTS
  const [timeFilter, setTimeFilter] = useState("WEEKLY"); // WEEKLY | MONTHLY
  
  const [downloadingId, setDownloadingId] = useState(null);

  // Carga inicial
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [stationsData, variablesData] = await Promise.all([
          StationAPI.getStations(),
          MeasurementAPI.getVariables()
        ]);
        
        setStations(stationsData);
        setVariables(variablesData);
        
        if (stationsData.length > 0) setSelectedStation(stationsData[0].station_id);
      } catch (error) {
        console.error("Error cargando metadatos:", error);
      }
    };
    loadMetadata();
  }, []);

  /**
   * Genera el listado virtual de reportes.
   * AHORA: Genera solo fechas relevantes (Nov-Dic) para que tenga sentido con tu simulación.
   */
  const generateVirtualReports = () => {
    const reports = [];
    const stationName = stations.find(s => s.station_id == selectedStation)?.station_name || "Estación";
    
    // Punto de anclaje: Hoy
    const today = new Date();
    
    // Generamos solo 4 periodos hacia atrás para no llenar de fechas vacías
    const periodsToGenerate = 4; 

    for (let i = 0; i < periodsToGenerate; i++) {
      let start = new Date();
      let end = new Date();
      let label = "";

      if (timeFilter === "WEEKLY") {
        // Semanas hacia atrás
        start.setDate(today.getDate() - (i * 7) - 7); 
        end.setDate(today.getDate() - (i * 7));
        label = `Semana: ${formatDate(start)} al ${formatDate(end)}`;
      } else {
        // Meses hacia atrás
        start.setMonth(today.getMonth() - i);
        start.setDate(1);
        end.setMonth(today.getMonth() - i + 1);
        end.setDate(0); // Último día del mes actual en iteración
        label = `Mes: ${start.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;
      }

      reports.push({
        id: i,
        name: label,
        customer: stationName,
        type: timeFilter === "WEEKLY" ? "Semanal" : "Mensual",
        createdOn: formatDate(end),
        range: `${formatDate(start)} - ${formatDate(end)}`,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        singleDate: end.toISOString().split('T')[0] 
      });
    }
    return reports;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = async (report) => {
    if (!selectedStation) return alert("Seleccione una estación.");

    setDownloadingId(report.id);
    try {
      if (reportCategory === "QUALITY") {
        await ReportAPI.downloadAirQualityReport(selectedStation, report.singleDate, selectedVariable);
      } else if (reportCategory === "TRENDS") {
        await ReportAPI.downloadTrendsReport(selectedStation, report.startDate, report.endDate, selectedVariable);
      } else if (reportCategory === "ALERTS") {
        await ReportAPI.downloadAlertsReport(selectedStation);
      }
    } catch (error) {
      console.error("Error descarga:", error);
      alert("Error al generar el PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const virtualReports = generateVirtualReports();

  return (
    <div className="dashboard-container" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Header */}
      <div className="content-header">
        <h2>Historial de Reportes</h2>
        <p>Descarga informes oficiales filtrados por estación y variable.</p>
      </div>

      {/* TABS Superiores */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {["QUALITY", "TRENDS", "ALERTS"].map((cat) => (
          <button 
            key={cat}
            className={`pb-3 px-2 font-medium transition-colors border-b-2 ${reportCategory === cat ? 'border-brand-500 text-brand-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setReportCategory(cat)}
          >
            {cat === "QUALITY" ? "Calidad del Aire" : cat === "TRENDS" ? "Tendencias" : "Alertas Críticas"}
          </button>
        ))}
      </div>

      {/* BARRA DE FILTROS (Estilo Card) */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        
        {/* Estación */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estación de Origen</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <select 
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-brand-500 bg-white text-gray-700 text-sm"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              {stations.map(s => <option key={s.station_id} value={s.station_id}>{s.station_name}</option>)}
            </select>
          </div>
        </div>

        {/* Variable (NUEVO) */}
        <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Variable Específica</label>
            <div className="relative">
                <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
                <select 
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-brand-500 bg-white text-gray-700 text-sm"
                    value={selectedVariable}
                    onChange={(e) => setSelectedVariable(e.target.value)}
                    disabled={reportCategory === "ALERTS"} // Alertas suelen ser generales
                >
                    <option value="">Todas las variables</option>
                    {variables.map(v => (
                        <option key={v.code} value={v.code}>{v.name} ({v.code})</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Periodo */}
        <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Periodo</label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setTimeFilter("WEEKLY")}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === "WEEKLY" ? "bg-white shadow text-brand-500 font-bold" : "text-gray-500"}`}
                >
                    Semanal
                </button>
                <button 
                    onClick={() => setTimeFilter("MONTHLY")}
                    className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === "MONTHLY" ? "bg-white shadow text-brand-500 font-bold" : "text-gray-500"}`}
                >
                    Mensual
                </button>
            </div>
        </div>
      </div>

      {/* TABLA LIMPIA */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="py-3 px-5 text-gray-600 text-xs font-bold uppercase tracking-wider">Reporte Generado</th>
                <th className="py-3 px-5 text-gray-600 text-xs font-bold uppercase tracking-wider">Estación</th>
                <th className="py-3 px-5 text-gray-600 text-xs font-bold uppercase tracking-wider">Filtro Variable</th>
                <th className="py-3 px-5 text-gray-600 text-xs font-bold uppercase tracking-wider">Rango de Fechas</th>
                <th className="py-3 px-5 text-right text-gray-600 text-xs font-bold uppercase tracking-wider">Descarga</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {virtualReports.map((report) => (
                <tr key={report.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="py-4 px-5">
                        <div className="font-semibold text-gray-800 text-sm">{report.name}</div>
                        <div className="text-xs text-gray-400 mt-1">Creado el {report.createdOn}</div>
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-600">
                        {report.customer}
                    </td>
                    <td className="py-4 px-5">
                        {selectedVariable ? (
                             <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{selectedVariable}</span>
                        ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Todas</span>
                        )}
                    </td>
                    <td className="py-4 px-5 text-sm font-mono text-gray-500">
                        {report.range}
                    </td>
                    <td className="py-4 px-5 text-right">
                        <button 
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId === report.id}
                            className="bg-white border border-gray-300 hover:bg-brand-500 hover:text-white hover:border-brand-500 text-gray-700 text-sm font-medium py-1.5 px-4 rounded transition-all disabled:opacity-50 shadow-sm"
                        >
                            {downloadingId === report.id ? "Procesando..." : "Descargar PDF"}
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      
      <p className="mt-4 text-center text-xs text-gray-400">
        * Mostrando historial de los últimos periodos disponibles en la base de datos de VriSA.
      </p>
    </div>
  );
}