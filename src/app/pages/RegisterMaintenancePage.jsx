import { FileText, Upload, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SensorAPI } from "../../shared/api";
import "./registermaintenance-page.css";

/**
 * Página para registrar un nuevo mantenimiento o calibración de un sensor.
 * @returns {JSX.Element} Componente de la página de registro de mantenimiento.
 */
export default function RegisterMaintenancePage() {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo no debe superar los 10MB.");
        return;
      }
      setCertificateFile(file);
      setError("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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
    <div className="rm-container">
      {/* Header */}
      <div className="rm-header">
        <div className="rm-header-icon">
          <Wrench size={28} />
        </div>
        <div>
          <h1 className="rm-title">Nuevo Mantenimiento</h1>
          <p className="rm-subtitle">
            Registra una actividad de mantenimiento o calibración para un sensor.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="rm-card">
        {error && <div className="rm-error">{error}</div>}
        {success && <div className="rm-success">{success}</div>}

        <form onSubmit={handleSubmit} className="rm-form">
          {/* Selector de Sensor */}
          <div className="rm-group">
            <label className="rm-label">
              Sensor <span className="required">*</span>
            </label>
            {loadingSensors ? (
              <p className="rm-hint">Cargando sensores...</p>
            ) : (
              <select
                name="sensor"
                value={formData.sensor}
                onChange={handleInputChange}
                className="rm-select"
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
            <span className="rm-hint">
              Dispositivo intervenido.
            </span>
          </div>

          {/* Fecha */}
          <div className="rm-group">
            <label className="rm-label">
              Fecha del Mantenimiento <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              name="log_date"
              value={formData.log_date}
              onChange={handleInputChange}
              className="rm-input"
              disabled={isSubmitting}
            />
            <span className="rm-hint">
              Hora exacta de la ejecución.
            </span>
          </div>

          {/* Descripción */}
          <div className="rm-group rm-full-width">
            <label className="rm-label">
              Descripción de Actividades <span className="required">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="rm-textarea"
              placeholder="Describe las actividades realizadas: calibración, limpieza, reemplazo de componentes, etc."
              disabled={isSubmitting}
            />
          </div>

          {/* Upload */}
          <div className="rm-group rm-full-width">
            <label className="rm-label">Certificado de Calibración (PDF)</label>
            <div 
                className={`rm-file-area ${certificateFile ? "has-file" : ""}`}
                onClick={handleUploadClick}
            >
                <div style={{ marginBottom: '12px', color: '#4339F2' }}>
                  <Upload size={32} />
                </div>
                <p className="upload-text">
                  <strong>Haz clic para subir</strong> o arrastra el archivo aquí
                  <br />
                  <small style={{ color: '#64748b' }}>PDF (máx. 10MB)</small>
                </p>
                {certificateFile && (
                  <div style={{ 
                      marginTop: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: '#1e293b',
                      fontWeight: '500'
                  }}>
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
                style={{ display: 'none' }}
                disabled={isSubmitting}
            />
          </div>

          {/* Botones */}
          <div className="rm-actions rm-full-width">
            <button
              type="button"
              onClick={() => navigate("/dashboard/maintenance")}
              className="rm-btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rm-btn-submit"
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
