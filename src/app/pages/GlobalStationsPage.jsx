import { Activity, MapPin, Radio, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StationAPI } from "../../shared/api";
import TableDataset from "../../shared/components/TableDataset/TableDataset";
import "./dashboard-styles.css";

/**
 * Página de listado de estaciones.
 * Dinámica por rol:
 * - super_admin: Ve todas las estaciones del sistema
 * - institution_head: Ve solo las estaciones de su institución
 */
export default function GlobalStationsPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [pageTitle, setPageTitle] = useState("Estaciones");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsed = JSON.parse(userData);
    const role = parsed.primary_role;
    const institutionId = parsed.institution_id;

    // Verificar acceso: solo super_admin o institution_head
    if (role !== "super_admin" && role !== "institution_head" && !institutionId) {
      alert("Acceso denegado: No tienes permisos para ver esta página.");
      navigate("/home");
      return;
    }

    setUserRole(role);

    // Determinar el título según el rol
    if (role === "super_admin") {
      setPageTitle("Todas las Estaciones");
      fetchStations(); // Sin filtros - trae todas
    } else {
      setPageTitle("Mis Estaciones");
      fetchStations({ institution: institutionId }); // Filtradas por institución
    }
  }, [navigate]);

  const fetchStations = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await StationAPI.getStations(filters);
      setStations(data);
    } catch (error) {
      console.error("Error cargando estaciones:", error);
      alert("Error al cargar las estaciones. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Renderizar badge de estado operativo
  const renderOperativeStatus = (status) => {
    const statusConfig = {
      ACTIVE: {
        label: "Activa",
        icon: <Activity size={14} />,
        bg: "#f0fdf4",
        color: "#15803d",
        border: "#bbf7d0",
      },
      PENDING: {
        label: "Pendiente",
        icon: <Radio size={14} />,
        bg: "#fef3c7",
        color: "#92400e",
        border: "#fde68a",
      },
      INACTIVE: {
        label: "Inactiva",
        icon: <XCircle size={14} />,
        bg: "#fee2e2",
        color: "#991b1b",
        border: "#fecaca",
      },
      MAINTENANCE: {
        label: "Mantenimiento",
        icon: <Radio size={14} />,
        bg: "#ede9fe",
        color: "#6b21a8",
        border: "#ddd6fe",
      },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: "600",
          background: config.bg,
          color: config.color,
          border: `1px solid ${config.border}`,
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Configuración de columnas para TableDataset
  const columns = [
    {
      header: "Nombre de la Estación",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Radio size={20} style={{ color: "#4339F2" }} />
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>
              {row.station_name}
            </span>
            <div style={{ fontSize: "0.8em", color: "#64748b" }}>
              ID: {row.station_id}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Institución",
      cell: (row) => row.institution_name || "Sin institución asignada",
    },
    {
      header: "Estado Operativo",
      cell: (row) => renderOperativeStatus(row.operative_status),
    },
    {
      header: "Ubicación (Lat/Long)",
      cell: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MapPin size={14} style={{ color: "#64748b" }} />
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {row.address_reference || "Sin dirección"}
            </span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            {row.geographic_location_lat?.toFixed(4)},{" "}
            {row.geographic_location_lon?.toFixed(4)}
          </span>
        </div>
      ),
    },
    {
      header: "Manager",
      cell: (row) => {
        if (row.manager_user) {
          return (
            <div>
              <div style={{ fontWeight: "600" }}>{row.manager_user.name}</div>
              <div style={{ fontSize: "0.8em", color: "#64748b" }}>
                {row.manager_user.email}
              </div>
            </div>
          );
        }
        return (
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Sin manager asignado
          </span>
        );
      },
    },
  ];

  return (
    <>
      <div className="content-header">
        <h2>
          <MapPin
            size={28}
            style={{ verticalAlign: "middle", marginRight: "8px" }}
          />
          {pageTitle}
        </h2>
        <p>
          {userRole === "super_admin"
            ? "Listado completo de estaciones en el sistema VriSA"
            : "Estaciones de tu institución"}
        </p>
      </div>

      <div
        className="table-container"
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
        }}
      >
        <TableDataset
          columns={columns}
          data={stations}
          isLoading={loading}
          emptyMessage={
            userRole === "super_admin"
              ? "No hay estaciones registradas en el sistema."
              : "Tu institución no tiene estaciones registradas."
          }
        />
      </div>
    </>
  );
}
