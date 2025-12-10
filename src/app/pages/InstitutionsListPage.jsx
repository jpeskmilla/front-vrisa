import { Building2, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI } from "../../shared/api";
import TableDataset from "../../shared/components/TableDataset/TableDataset";
import "./dashboard-styles.css";

/**
 * Página de listado de instituciones.
 * Acceso: Solo super_admin.
 * Muestra todas las instituciones registradas con su estado de validación.
 */
export default function InstitutionsListPage() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificación de seguridad
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.primary_role !== "super_admin") {
      alert("Acceso denegado: Se requieren permisos de Super Administrador.");
      navigate("/home");
      return;
    }

    fetchInstitutions();
  }, [navigate]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const data = await InstitutionAPI.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error("Error cargando instituciones:", error);
      alert("Error al cargar las instituciones. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  // Configuración de columnas para TableDataset
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
      className: "text-center",
    },
    {
      header: "Nombre de la Institución",
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
            <Building2 size={20} style={{ color: "#4339F2" }} />
          </div>
          <div>
            <span style={{ fontWeight: "600", color: "#1e293b" }}>
              {row.institute_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Dirección",
      accessorKey: "physic_address",
    },
    {
      header: "Estado de Validación",
      cell: (row) => {
        const isApproved = row.validation_status === "APPROVED";
        const isPending = row.validation_status === "PENDING";

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
              background: isApproved
                ? "#f0fdf4"
                : isPending
                ? "#fef3c7"
                : "#fee2e2",
              color: isApproved
                ? "#15803d"
                : isPending
                ? "#92400e"
                : "#991b1b",
              border: `1px solid ${
                isApproved
                  ? "#bbf7d0"
                  : isPending
                  ? "#fde68a"
                  : "#fecaca"
              }`,
            }}
          >
            {isApproved && <CheckCircle size={14} />}
            {isPending && <Clock size={14} />}
            {isApproved ? "Aprobada" : isPending ? "Pendiente" : "Rechazada"}
          </span>
        );
      },
    },
    {
      header: "Fecha de Registro",
      cell: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "-",
    },
  ];

  return (
    <>
      <div className="content-header">
        <h2>
          <Building2 size={28} style={{ verticalAlign: "middle", marginRight: "8px" }} />
          Instituciones Registradas
        </h2>
        <p>Listado completo de instituciones en el sistema VriSA</p>
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
          data={institutions}
          isLoading={loading}
          emptyMessage="No hay instituciones registradas en el sistema."
        />
      </div>
    </>
  );
}
