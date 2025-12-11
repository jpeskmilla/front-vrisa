import { Activity, Cpu, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SensorAPI } from "../../../../shared/api";
import { TableDataset } from "../../../../shared/components/TableDataset";
import { ORGANIZATION_ROLES } from "../../../../shared/constants/roles";
import "./MyStationPage.css";

/**
 * Página de Estación - Listado de sensores de la estación del usuario.
 * Accesible para usuarios con rol station_admin.
 * @returns {JSX.Element} Componente de la página de estación.
 */
export default function MyStationPage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
    const userData = localStorage.getItem("userData");
    
    if (!userData) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userData);
    const role = user.primary_role;

    // Si NO es administrador de estación, lo sacamos de aquí
    if (role !== ORGANIZATION_ROLES.STATION_ADMIN) {
      // Redirección inteligente según quién sea el intruso
      if (role === 'super_admin') {
        navigate("/admin/stations"); // El admin debe ver el listado global
      } else if (role === 'institution_head') {
        navigate("/institution-admin/stations"); // El jefe de institución a su panel
      } else {
        navigate("/dashboard"); // Ciudadanos o roles incompletos al dashboard
      }
    }
  }, [navigate]);
  // ------------------------------------

  useEffect(() => {
    const loadSensors = async () => {
      // Verificación extra para no llamar a la API si ya nos estamos yendo
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      if (userData.primary_role !== ORGANIZATION_ROLES.STATION_ADMIN) return;

      try {
        setIsLoading(true);
        const data = await SensorAPI.getSensors();
        setSensors(data);
      } catch (err) {
        console.error("Error cargando sensores:", err);
        setError("No se pudieron cargar los sensores.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSensors();
  }, []);


  /**
   * Formatea la fecha de instalación.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Renderiza el badge de estado del sensor.
   */
  const renderStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: "Activo", className: "status-active" },
      INACTIVE: { label: "Inactivo", className: "status-inactive" },
      MAINTENANCE: { label: "En Mantenimiento", className: "status-maintenance" },
    };

    const config = statusConfig[status] || { label: status, className: "" };

    return (
      <span className={`sensor-status-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Columnas de la tabla de sensores
  const tableColumns = [
    {
      header: "SENSOR",
      cell: (row) => (
        <div className="sensor-cell">
          <div className="sensor-icon">
            <Cpu size={18} />
          </div>
          <div>
            <div className="sensor-model">{row.model}</div>
            <div className="sensor-serial">S/N: {row.serial_number}</div>
          </div>
        </div>
      ),
    },
    {
      header: "FABRICANTE",
      accessorKey: "manufacturer",
    },
    {
      header: "ESTADO",
      cell: (row) => renderStatusBadge(row.status),
    },
    {
      header: "FECHA INSTALACIÓN",
      cell: (row) => (
        <span className="date-badge">{formatDate(row.installation_date)}</span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="stations-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="stations-container">
      {/* Header */}
      <div className="stations-header">
        <div className="header-content">
          <div className="header-icon">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="stations-title">Mi Estación</h1>
            <p className="stations-subtitle">
              Gestiona los sensores y equipos de tu estación de monitoreo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stations-stats">
        <div className="stat-card">
          <div className="stat-icon active">
            <Activity size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {sensors.filter((s) => s.status === "ACTIVE").length}
            </span>
            <span className="stat-label">Sensores Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon maintenance">
            <Settings size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {sensors.filter((s) => s.status === "MAINTENANCE").length}
            </span>
            <span className="stat-label">En Mantenimiento</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <Cpu size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{sensors.length}</span>
            <span className="stat-label">Total Sensores</span>
          </div>
        </div>
      </div>

      {/* Tabla de sensores */}
      <div className="sensors-section">
        <h2 className="section-title">Listado de Sensores</h2>
        <TableDataset
          columns={tableColumns}
          data={sensors}
          isLoading={isLoading}
          emptyMessage="No se encontraron sensores asociados. Asegúrate de tener una estación asignada y sensores registrados."
        />
      </div>
    </div>
  );
}

