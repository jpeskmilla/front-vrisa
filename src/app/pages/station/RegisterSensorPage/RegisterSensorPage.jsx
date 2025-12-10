import { Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SensorAPI, StationAPI } from "../../../../shared/api";
import "./RegisterSensorPage.css";

/**
 * Página para registrar un nuevo sensor.
 * @returns {JSX.Element} Componente de la página de registro de sensor.
 */
export default function RegisterSensorPage() {
  const navigate = useNavigate();

  // Estados del formulario
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [formData, setFormData] = useState({
    model: "",
    manufacturer: "",
    serial_number: "",
    installation_date: "",
    station: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await StationAPI.getStations();
        setStations(data);
      } catch (err) {
        console.error("Error cargando estaciones:", err);
        setError("No se pudieron cargar las estaciones disponibles.");
      } finally {
        setLoadingStations(false);
      }
    };
    loadStations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.model.trim()) {
      setError("Debes ingresar el modelo del sensor.");
      return false;
    }
    if (!formData.manufacturer.trim()) {
      setError("Debes ingresar el fabricante del sensor.");
      return false;
    }
    if (!formData.serial_number.trim()) {
      setError("Debes ingresar el número de serie.");
      return false;
    }
    if (!formData.installation_date) {
      setError("Debes ingresar la fecha de instalación.");
      return false;
    }
    if (!formData.station) {
      setError("Debes seleccionar la estación asociada.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        model: formData.model.trim(),
        manufacturer: formData.manufacturer.trim(),
        serial_number: formData.serial_number.trim(),
        installation_date: formData.installation_date,
        station: formData.station || null,
      };

      await SensorAPI.createSensor(payload);
      setSuccess("Sensor registrado exitosamente.");
      
      setTimeout(() => {
        navigate("/dashboard/stations");
      }, 1500);
    } catch (err) {
      console.error("Error al registrar sensor:", err);
      setError(err.message || "Error al registrar el sensor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rs-container">
      {/* Header */}
      <div className="rs-header">
        <div className="rs-header-icon">
          <Cpu size={28} />
        </div>
        <div>
          <h1 className="rs-title">Registrar Sensor</h1>
          <p className="rs-subtitle">
            Agrega un nuevo sensor a una de tus estaciones de monitoreo.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="rs-card">
        {error && <div className="rs-error">{error}</div>}
        {success && <div className="rs-success">{success}</div>}

        <form onSubmit={handleSubmit} className="rs-form">
          {/* Modelo del Sensor */}
          <div className="rs-group">
            <label className="rs-label">
              Modelo <span className="required">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="rs-input"
              placeholder="Ej: AQ-500, PMS5003, etc."
              disabled={isSubmitting}
            />
            <span className="rs-hint">
              Modelo o referencia del dispositivo.
            </span>
          </div>

          {/* Fabricante */}
          <div className="rs-group">
            <label className="rs-label">
              Fabricante <span className="required">*</span>
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              className="rs-input"
              placeholder="Ej: Plantower, Sensirion, etc."
              disabled={isSubmitting}
            />
            <span className="rs-hint">
              Nombre del fabricante del dispositivo.
            </span>
          </div>

          {/* Número de Serie */}
          <div className="rs-group">
            <label className="rs-label">
              Número de Serie <span className="required">*</span>
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleInputChange}
              className="rs-input"
              placeholder="Ej: SN-2024-001234"
              disabled={isSubmitting}
            />
            <span className="rs-hint">
              Identificador único del sensor.
            </span>
          </div>

          {/* Fecha de Instalación */}
          <div className="rs-group">
            <label className="rs-label">
              Fecha de Instalación <span className="required">*</span>
            </label>
            <input
              type="date"
              name="installation_date"
              value={formData.installation_date}
              onChange={handleInputChange}
              className="rs-input"
              disabled={isSubmitting}
            />
            <span className="rs-hint">
              Fecha en que se instaló el sensor.
            </span>
          </div>

          {/* Selector de Estación */}
          <div className="rs-group">
            <label className="rs-label">
              Estación <span className="required">*</span>
            </label>
            {loadingStations ? (
              <p className="rs-hint">Cargando estaciones...</p>
            ) : (
              <select
                name="station"
                value={formData.station}
                onChange={handleInputChange}
                className="rs-select"
                disabled={isSubmitting}
              >
                <option value="">Selecciona una estación</option>
                {stations.map((station) => (
                  <option key={station.station_id} value={station.station_id}>
                    {station.station_name}
                  </option>
                ))}
              </select>
            )}
            <span className="rs-hint">
              Estación donde se instalará el sensor.
            </span>
          </div>

          {/* Botones */}
          <div className="rs-actions rs-full-width">
            <button
              type="button"
              onClick={() => navigate("/dashboard/stations")}
              className="rs-btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rs-btn-submit"
              disabled={isSubmitting || loadingStations}
            >
              {isSubmitting ? "Guardando..." : "Registrar Sensor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

