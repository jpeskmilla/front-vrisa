import { Calendar, ClipboardList, FileText, User, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SensorAPI } from "../../../../shared/api";
import { TableDataset } from "../../../../shared/components/TableDataset";
import { getMediaUrl } from "../../../../shared/utils";
import "./MaintenanceLogsPage.css";

/**
 * Página de Historial de Mantenimientos.
 * Muestra todos los registros de mantenimiento de los sensores de la estación.
 * @returns {JSX.Element} Componente de la página de historial.
 */
export default function MaintenanceLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const data = await SensorAPI.getMaintenanceLogs();
        setLogs(data);
      } catch (err) {
        console.error("Error cargando registros:", err);
        setError("No se pudieron cargar los registros de mantenimiento.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  /**
   * Formatea la fecha del mantenimiento.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Maneja la visualización del certificado PDF.
   */
  const handleViewCertificate = (certificatePath) => {
    const fullUrl = getMediaUrl(certificatePath);
    if (fullUrl) {
        window.open(fullUrl, "_blank");
    }
  };

  // Columnas de la tabla de mantenimientos
  const tableColumns = [
    {
      header: "MANTENIMIENTO",
      cell: (row) => (
        <div className="maintenance-cell">
          <div className="maintenance-icon">
            <Wrench size={18} />
          </div>
          <div>
            <div className="maintenance-sensor">Sensor: {row.sensor_serial || `ID ${row.sensor}`}</div>
            <div className="maintenance-date">
              <Calendar size={12} />
              {formatDate(row.log_date)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "DESCRIPCIÓN",
      cell: (row) => (
        <div className="description-cell">
          <p className="description-text">
            {row.description?.length > 100
              ? `${row.description.substring(0, 100)}...`
              : row.description || "-"}
          </p>
        </div>
      ),
    },
    {
      header: "TÉCNICO",
      cell: (row) => (
        <div className="technician-cell">
          <User size={14} />
          <span>{row.technical_user_name || "No asignado"}</span>
        </div>
      ),
    },
    {
      header: "CERTIFICADO",
      className: "text-center",
      cell: (row) => (
        row.certificate_file ? (
          <button
            onClick={() => handleViewCertificate(row.certificate_file)}
            className="btn-certificate"
          >
            <FileText size={16} />
            Ver PDF
          </button>
        ) : (
          <span className="no-certificate">Sin certificado</span>
        )
      ),
    },
  ];

  if (error) {
    return (
      <div className="maintenance-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="maintenance-container">
      {/* Header */}
      <div className="maintenance-header">
        <div className="header-content">
          <div className="header-icon">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="maintenance-title">Historial de Mantenimientos</h1>
            <p className="maintenance-subtitle">
              Registro completo de todas las actividades de mantenimiento realizadas.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/maintenance/new")}
          className="btn-new-maintenance"
        >
          <Wrench size={18} />
          Nuevo Mantenimiento
        </button>
      </div>

      {/* Stats rápidos */}
      <div className="maintenance-stats">
        <div className="stat-item">
          <span className="stat-number">{logs.length}</span>
          <span className="stat-text">Total Registros</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">
            {logs.filter((l) => l.certificate_file).length}
          </span>
          <span className="stat-text">Con Certificado</span>
        </div>
      </div>

      {/* Tabla de mantenimientos */}
      <TableDataset
        columns={tableColumns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No hay registros de mantenimiento. ¡Crea el primero!"
      />
    </div>
  );
}

