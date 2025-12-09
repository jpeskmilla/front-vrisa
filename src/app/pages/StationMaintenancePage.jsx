import { FileText, Upload, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SensorAPI } from "../../shared/api";
import "./maintenance-page.css";

/**
 * Página de Formulario para crear un nuevo registro de mantenimiento.
 * @returns {JSX.Element} Componente del formulario de mantenimiento.
 */
export default function StationMaintenancePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados del formulario
  const [sensors, setSensors] = useState([]);
  const [loadingSensors, setLoadingSensors] = useState(true);
  const [formData, setFormData] = useState({
    sensor: "",
    log_date: "",
    description: "",
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar sensores al montar
  useEffect(() => {
    const loadSensors = async () => {
      try {
        const data = await SensorAPI.getSensors();
        setSensors(data);
      } catch (err) {
        console.error("Error cargando sensores:", err);
        setError("No se pudieron cargar los sensores disponibles.");
      } finally {
        setLoadingSensors(false);
      }
    };

    loadSensors();
  }, []);

  /**
   * Maneja cambios en los inputs del formulario.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  /**
   * Maneja la selección del archivo PDF.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF.");
        return;
      }
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo no debe superar los 10MB.");
        return;
      }
      setCertificateFile(file);
      setError("");
    }
  };

  /**
   * Abre el selector de archivos.
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Valida el formulario antes de enviar.
   */
  const validateForm = () => {
    if (!formData.sensor) {
      setError("Debes seleccionar un sensor.");
      return false;
    }
    if (!formData.log_date) {
      setError("Debes indicar la fecha del mantenimiento.");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Debes ingresar una descripción del mantenimiento.");
      return false;
    }
    return true;
  };

  /**
   * Envía el formulario al backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("sensor", formData.sensor);
      payload.append("log_date", new Date(formData.log_date).toISOString());
      payload.append("description", formData.description);
      
      if (certificateFile) {
        payload.append("certificate_file", certificateFile);
      }

      await SensorAPI.createMaintenanceLog(payload);
      
      setSuccess("Registro de mantenimiento creado exitosamente.");
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate("/dashboard/maintenance");
      }, 1500);
    } catch (err) {
      console.error("Error al crear registro:", err);
      setError(err.message || "Error al crear el registro de mantenimiento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maintenance-form-container">
      {/* Header */}
      <div className="maintenance-header">
        <div className="header-content">
          <div className="header-icon">
            <Wrench size={24} />
          </div>
          <div>
            <h1 className="maintenance-title">Nuevo Mantenimiento</h1>
            <p className="maintenance-subtitle">
              Registra una actividad de mantenimiento o calibración para un sensor.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="form-card">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Selector de Sensor */}
          <div className="form-section">
            <label className="form-label">
              Sensor <span className="required">*</span>
            </label>
            {loadingSensors ? (
              <p className="form-hint">Cargando sensores...</p>
            ) : (
              <select
                name="sensor"
                value={formData.sensor}
                onChange={handleInputChange}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="">Selecciona un sensor</option>
                {sensors.map((sensor) => (
                  <option key={sensor.sensor_id} value={sensor.sensor_id}>
                    {sensor.model} - S/N: {sensor.serial_number}
                  </option>
                ))}
              </select>
            )}
            <span className="form-hint">
              Selecciona el sensor al que se realizó el mantenimiento.
            </span>
          </div>

          {/* Fecha del Mantenimiento */}
          <div className="form-section">
            <label className="form-label">
              Fecha del Mantenimiento <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              name="log_date"
              value={formData.log_date}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
            <span className="form-hint">
              Indica cuándo se realizó la actividad de mantenimiento.
            </span>
          </div>

          {/* Descripción */}
          <div className="form-section">
            <label className="form-label">
              Descripción de Actividades <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe las actividades realizadas: calibración, limpieza, reemplazo de componentes, etc."
              disabled={isSubmitting}
            />
            <span className="form-hint">
              Detalla las actividades realizadas durante el mantenimiento.
            </span>
          </div>

          {/* Upload de Certificado */}
          <div className="form-section">
            <label className="form-label">Certificado de Calibración (PDF)</label>
            <div className="file-upload-wrapper">
              <div
                className={`file-upload-area ${certificateFile ? "has-file" : ""}`}
                onClick={handleUploadClick}
              >
                <div className="upload-icon">
                  <Upload size={24} />
                </div>
                <p className="upload-text">
                  <strong>Haz clic para subir</strong> o arrastra el archivo aquí
                  <br />
                  <small>PDF (máx. 10MB)</small>
                </p>
                {certificateFile && (
                  <div className="file-name">
                    <FileText size={16} />
                    {certificateFile.name}
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="file-input"
                disabled={isSubmitting}
              />
            </div>
            <span className="form-hint">
              Opcional: Adjunta el certificado de calibración o documento de respaldo.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/dashboard/maintenance")}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || loadingSensors}
            >
              {isSubmitting ? "Guardando..." : "Registrar Mantenimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

