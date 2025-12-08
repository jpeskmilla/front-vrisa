import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI, InstitutionAPI } from "../../shared/api";
import "./registerstationpage-styles.css";

/**
 * Página de registro para estaciones de monitoreo ambiental.
 * Formulario en dos pasos: información básica y detalles del sensor.
 *
 * @component
 */
export default function RegisterStationPage() {
  const navigate = useNavigate();

  /** @state Paso actual del formulario (1 o 2) */
  const [step, setStep] = useState(1);

  /** @state Manejo de errores del formulario */
  const [error, setError] = useState("");

  /** @state Indicador de carga al enviar el formulario */
  const [loading, setLoading] = useState(false);

  /** @state Lista de instituciones disponibles */
  const [institutions, setInstitutions] = useState([]);

  /** @state Cargando instituciones */
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  /**
   * @state formData - Paso 1: Información básica
   */
  const [basicData, setBasicData] = useState({
    stationName: "",
    geographicLat: "",
    geographicLong: "",
    addressReference: "",
    institutionId: "",
  });

  /**
   * @state formData - Paso 2: Detalles del sensor
   */
  const [sensorData, setSensorData] = useState({
    sensorModel: "",
    sensorManufacturer: "",
    sensorSerial: "",
    calibrationCertificate: null,
  });

  /**
   * Carga las instituciones
   */
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await InstitutionAPI.getInstitutions();
        setInstitutions(data);
      } catch (err) {
        const messages = formatApiErrors(err, "Error al registrar la estación");
        setErrorMessages(messages);
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  /**
   * Maneja los cambios de los inputs del paso 1
   */
  const handleBasicChange = (e) => {
    setBasicData({ ...basicData, [e.target.name]: e.target.value });
  };

  /**
   * Maneja los cambios de los inputs del paso 2
   */
  const handleSensorChange = (e) => {
    setSensorData({ ...sensorData, [e.target.name]: e.target.value });
  };

  /**
   * Maneja la carga del archivo de certificado
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSensorData({ ...sensorData, calibrationCertificate: file });
  };

  /**
   * Valida y avanza al paso 2
   */
  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (!basicData.stationName || !basicData.geographicLat || 
        !basicData.geographicLong || !basicData.institutionId) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    // Validar coordenadas
    const lat = parseFloat(basicData.geographicLat);
    const long = parseFloat(basicData.geographicLong);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("La latitud debe estar entre -90 y 90");
      return;
    }

    if (isNaN(long) || long < -180 || long > 180) {
      setError("La longitud debe estar entre -180 y 180");
      return;
    }

    setStep(2);
  };

  /**
   * Vuelve al paso 1
   */
  const handleBackStep = () => {
    setStep(1);
    setError("");
  };

  /**
   * Envía el formulario completo al backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!sensorData.sensorModel || !sensorData.sensorManufacturer || 
        !sensorData.sensorSerial || !sensorData.calibrationCertificate) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      
      // Datos básicos
      payload.append("station_name", basicData.stationName);
      payload.append("geographic_location_lat", basicData.geographicLat);
      payload.append("geographic_location_long", basicData.geographicLong);
      payload.append("address_reference", basicData.addressReference);
      payload.append("institution_id", basicData.institutionId);

      // Datos del sensor
      payload.append("sensor_model", sensorData.sensorModel);
      payload.append("sensor_manufacturer", sensorData.sensorManufacturer);
      payload.append("sensor_serial", sensorData.sensorSerial);
      payload.append("calibration_certificate", sensorData.calibrationCertificate);

      await AuthAPI.registerStation(payload);

      alert("Estación registrada exitosamente. Espera validación del administrador.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar la estación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="station-container">
      <header className="header">
        <button className="back-button" onClick={() => navigate("/home")}>
          <span>‹</span> Volver
        </button>
        <div className="logo">VriSA</div>
      </header>

      <div className="form-card">
        <h1 className="form-title">Registro de Estación de Monitoreo</h1>
        <p className="form-subtitle">
          Ingresa la información para validar la solicitud como estación de monitoreo.
        </p>
        <p className="form-subtitle">
          {step === 1 
            ? "Paso 1: Información básica de la estación"
            : "Paso 2: Detalles del sensor base"}
        </p>

        {/* Indicador de pasos */}
        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <span>Información básica</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <span>Sensor base</span>
          </div>
        </div>

        {/* PASO 1: Información básica */}
        {step === 1 && (
          <form onSubmit={handleNextStep}>
            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Nombre de la estación
              </label>
              <input
                type="text"
                name="stationName"
                className="form-input"
                placeholder="Ingresa el nombre único de la estación"
                value={basicData.stationName}
                onChange={handleBasicChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Latitud
              </label>
              <input
                type="number"
                step="any"
                name="geographicLat"
                className="form-input"
                placeholder="Ej: 3.451647"
                value={basicData.geographicLat}
                onChange={handleBasicChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Longitud
              </label>
              <input
                type="number"
                step="any"
                name="geographicLong"
                className="form-input"
                placeholder="Ej: -76.531985"
                value={basicData.geographicLong}
                onChange={handleBasicChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Dirección de referencia
              </label>
              <input
                type="text"
                name="addressReference"
                className="form-input"
                placeholder="Opcional: Puntos de referencia visuales"
                value={basicData.addressReference}
                onChange={handleBasicChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Institución asociada
              </label>
              {loadingInstitutions ? (
                <div className="loading-text">Cargando instituciones...</div>
              ) : (
                <select
                  name="institutionId"
                  className="form-input"
                  value={basicData.institutionId}
                  onChange={handleBasicChange}
                  required
                >
                  <option value="">Selecciona una institución</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="submit-button">
              Continuar al paso 2 →
            </button>
          </form>
        )}

        {/* PASO 2: Detalles del sensor */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Modelo del sensor
              </label>
              <input
                type="text"
                name="sensorModel"
                className="form-input"
                placeholder="Modelo técnico del dispositivo"
                value={sensorData.sensorModel}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Fabricante
              </label>
              <input
                type="text"
                name="sensorManufacturer"
                className="form-input"
                placeholder="Fabricante del dispositivo"
                value={sensorData.sensorManufacturer}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Número de serie
              </label>
              <input
                type="text"
                name="sensorSerial"
                className="form-input"
                placeholder="Número de serie único o MAC Address"
                value={sensorData.sensorSerial}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="required">*</span> Certificado de calibración
              </label>
              <input
                type="file"
                accept=".pdf,image/*"
                className="form-input"
                onChange={handleFileUpload}
                required
              />
              <small className="form-hint">
                Documento PDF o imagen que certifique la calibración
              </small>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
                type="button"
                className="back-step-button"
                onClick={handleBackStep}
              >
                ← Volver al paso 1
            </button>

            <button
                type="submit"
                className="submit-button"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}