import { Activity, Calendar, Download, FileText, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { MeasurementAPI, ReportAPI, StationAPI } from "../../shared/api";
import { ControlBar, ControlSelect } from "../../shared/components/ControlBar";
import { TableDataset } from "../../shared/components/TableDataset";
import "./reports-page.css";

/**
 * Página de Reportes - Historial y Descarga de Informes PDF.
 * @returns {JSX.Element} Componente de la página de reportes.
 */
export default function ReportsPage() {
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);

  // Estados de Filtros
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedVariable, setSelectedVariable] = useState("");
  const [reportCategory, setReportCategory] = useState("QUALITY");
  const [timeFilter, setTimeFilter] = useState("WEEKLY");

  const [downloadingId, setDownloadingId] = useState(null);

  // Carga inicial
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [stationsData, variablesData] = await Promise.all([StationAPI.getStations(), MeasurementAPI.getVariables()]);

        setStations(stationsData);
        setVariables(variablesData);

        if (stationsData.length > 0) setSelectedStation(stationsData[0].station_id);
      } catch (error) {
        console.error("Error cargando metadatos:", error);
      }
    };
    loadMetadata();
  }, []);

  // Generación de datos virtuales
  const generateVirtualReports = () => {
    const reports = [];
    const stationName = stations.find((s) => s.station_id == selectedStation)?.station_name || "Estación";
    const today = new Date();
    const periodsToGenerate = 5;

    for (let i = 0; i < periodsToGenerate; i++) {
      let start = new Date();
      let end = new Date();
      let label = "";

      if (timeFilter === "WEEKLY") {
        start.setDate(today.getDate() - i * 7 - 7);
        end.setDate(today.getDate() - i * 7);
        label = `Reporte Semanal`;
      } else {
        start.setMonth(today.getMonth() - i);
        start.setDate(1);
        end.setMonth(today.getMonth() - i + 1);
        end.setDate(0);
        label = `Reporte Mensual`;
      }

      reports.push({
        id: i,
        name: label,
        customer: stationName,
        type: timeFilter === "WEEKLY" ? "Semanal" : "Mensual",
        createdOn: formatDate(end),
        range: `${formatDate(start)} - ${formatDate(end)}`,
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        singleDate: end.toISOString().split("T")[0],
      });
    }
    return reports;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("es-CO", {month: "short", day: "numeric", year: "numeric"});
  };

  const handleDownload = async (report) => {
    if (!selectedStation) return alert("Seleccione una estación.");

    setDownloadingId(report.id);
    try {
      if (reportCategory === "QUALITY") {
        await ReportAPI.downloadAirQualityReport(selectedStation, report.startDate, report.endDate, selectedVariable);
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

  // === COLUMNAS DE LA TABLA ===
  const tableColumns = [
    {
      header: "REPORTE GENERADO",
      cell: (row) => (
        <div>
          <div style={{fontWeight: "600", color: "#1e293b"}}>{row.name}</div>
          <div style={{fontSize: "0.8rem", color: "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px"}}>
            <FileText size={12} /> Creado el {row.createdOn}
          </div>
        </div>
      ),
    },
    {
      header: "ESTACIÓN",
      accessorKey: "customer",
    },
    {
      header: "RANGO DE FECHAS",
      cell: (row) => <span className="date-range-badge">{row.range}</span>,
    },
    {
      header: "ACCIONES",
      className: "text-right",
      cell: (row) => (
        <button onClick={() => handleDownload(row)} disabled={downloadingId === row.id} className="btn-download">
          <Download size={16} />
          {downloadingId === row.id ? "Generando..." : "Descargar PDF"}
        </button>
      ),
    },
  ];

  // Opciones Selects
  const stationOptions = stations.map((s) => ({value: s.station_id, label: s.station_name}));
  const variableOptions = [{value: "", label: "Todas las variables"}, ...variables.map((v) => ({value: v.code, label: `${v.name} (${v.code})`}))];
  const periodOptions = [
    {value: "WEEKLY", label: "Semanal"},
    {value: "MONTHLY", label: "Mensual"},
  ];

  return (
    <div className="dashboard-container" style={{maxWidth: "100%", overflowX: "hidden"}}>
      <div className="content-header mb-6">
        <h2 style={{fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px"}}>Historial de Reportes</h2>
        <p style={{color: "#64748b"}}>Descarga informes oficiales y certificados de las estaciones de monitoreo.</p>
      </div>

      {/* Tabs usando las nuevas clases CSS */}
      <div className="reports-tabs-container">
        {["QUALITY", "TRENDS", "ALERTS"].map((cat) => (
          <button key={cat} className={`reports-tab-btn ${reportCategory === cat ? "active" : ""}`} onClick={() => setReportCategory(cat)}>
            {cat === "QUALITY" ? "Calidad del Aire" : cat === "TRENDS" ? "Tendencias" : "Alertas Críticas"}
          </button>
        ))}
      </div>

      <ControlBar>
        <div className="flex items-center gap-6 flex-wrap">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#e0e7ff",
              color: "#4339F2",
            }}
          >
            <Activity size={20} />
          </div>

          <ControlSelect label="Estación" value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} options={stationOptions} icon={Search} />

          <ControlSelect
            label="Variable"
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            options={variableOptions}
            icon={Filter}
            disabled={reportCategory === "ALERTS"}
          />
        </div>

        <div className="flex items-center gap-4">
          <div style={{height: "30px", width: "1px", backgroundColor: "#e2e8f0"}} className="hidden md:block"></div>
          <ControlSelect label="Periodo" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} options={periodOptions} icon={Calendar} />
        </div>
      </ControlBar>

      <TableDataset columns={tableColumns} data={virtualReports} emptyMessage="No hay reportes disponibles para los filtros seleccionados." />

      <p style={{marginTop: "24px", textAlign: "center", fontSize: "0.8rem", color: "#94a3b8"}}>* Mostrando historial simulado basado en datos reales de VriSA.</p>
    </div>
  );
}
