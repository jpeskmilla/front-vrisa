import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { InstitutionAPI, SensorAPI, StationAPI } from "../../../../shared/api";
import "./RegisterStationPage.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Componente de marcador interactivo que maneja clicks en el mapa
 * y actualiza las coordenadas del formulario.
 */
function LocationMarker({position, setPosition}) {
  useMapEvents({
    click(e) {
      const {lat, lng} = e.latlng;
      setPosition({lat, lng});
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

/**
 * Componente que controla el movimiento del mapa cuando
 * las coordenadas se actualizan manualmente desde los inputs.
 */
function MapViewController({position}) {
  const map = useMap();

  useEffect(() => {
    if (position && !isNaN(position.lat) && !isNaN(position.lng)) {
      map.flyTo([position.lat, position.lng], map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [position, map]);

  return null;
}

/**
 * Página de registro para estaciones de monitoreo ambiental.
 * Formulario en dos pasos: información básica y detalles del sensor.
 * Incluye un mapa interactivo para selección de ubicación geográfica.
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
   * @state Posición del marcador en el mapa (objeto con lat/lng)
   */
  const [mapPosition, setMapPosition] = useState(null);

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
        console.error("Error cargando instituciones:", err);
        setError("No se pudieron cargar las instituciones.");
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  /**
   * Sincroniza la posición del mapa con los inputs cuando el usuario
   * actualiza las coordenadas manualmente.
   */
  useEffect(() => {
    const lat = parseFloat(basicData.geographicLat);
    const lng = parseFloat(basicData.geographicLong);

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMapPosition({lat, lng});
    }
  }, [basicData.geographicLat, basicData.geographicLong]);

  /**
   * Maneja los cambios de los inputs del paso 1
   */
  const handleBasicChange = (e) => {
    setBasicData({...basicData, [e.target.name]: e.target.value});
  };

  /**
   * Maneja el click en el mapa y actualiza los inputs de coordenadas
   */
  const handleMapClick = (position) => {
    setBasicData({
      ...basicData,
      geographicLat: position.lat.toFixed(6),
      geographicLong: position.lng.toFixed(6),
    });
    setMapPosition(position);
  };

  /**
   * Maneja los cambios de los inputs del paso 2
   */
  const handleSensorChange = (e) => {
    setSensorData({...sensorData, [e.target.name]: e.target.value});
  };

  /**
   * Maneja la carga del archivo de certificado
   */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSensorData({...sensorData, calibrationCertificate: file});
  };

  /**
   * Valida y avanza al paso 2
   */
  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (!basicData.stationName || !basicData.geographicLat || !basicData.geographicLong || !basicData.institutionId) {
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

    if (!sensorData.sensorModel || !sensorData.sensorManufacturer || !sensorData.sensorSerial || !sensorData.calibrationCertificate) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      // payload para crear la estación
      const stationPayload = {
        station_name: basicData.stationName,
        geographic_location_lat: parseFloat(basicData.geographicLat),
        geographic_location_long: parseFloat(basicData.geographicLong),
        address_reference: basicData.addressReference,
        institution_id: basicData.institutionId,
      };

      const stationResponse = await StationAPI.registerStation(JSON.stringify(stationPayload));
      const newStationId = stationResponse.station_id;

      // Crear el Sensor vinculado a la estación
      const sensorPayload = {
        model: sensorData.sensorModel,
        manufacturer: sensorData.sensorManufacturer,
        serial_number: sensorData.sensorSerial,
        installation_date: new Date().toISOString().split("T")[0],
        status: "ACTIVE",
        station: newStationId,
      };
      await SensorAPI.createSensor(sensorPayload);

      alert("Estación registrada exitosamente. Espera validación del administrador.");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar la estación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-station-container">
      <header className="register-station-header">
        <button className="register-station-back-button" onClick={() => navigate("/home")}>
          <span>‹</span> Volver
        </button>
        <div className="register-station-logo">VriSA</div>
      </header>

      <div className="register-station-form-card">
        <h1 className="register-station-form-title">Registro de Estación de Monitoreo</h1>
        <p className="register-station-form-subtitle">Ingresa la información para validar la solicitud como estación de monitoreo.</p>
        <p className="register-station-form-subtitle">{step === 1 ? "Paso 1: Información básica de la estación" : "Paso 2: Detalles del sensor base"}</p>

        {/* Indicador de pasos */}
        <div className="register-station-steps-indicator">
          <div className={`register-station-step ${step >= 1 ? "active" : ""}`}>
            <div className="register-station-step-number">1</div>
            <span>Información básica</span>
          </div>
          <div className="register-station-step-line"></div>
          <div className={`register-station-step ${step >= 2 ? "active" : ""}`}>
            <div className="register-station-step-number">2</div>
            <span>Sensor base</span>
          </div>
        </div>

        {/* PASO 1: Información básica */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="register-station-form">
            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Nombre de la estación
              </label>
              <input
                type="text"
                name="stationName"
                className="register-station-form-input"
                placeholder="Ingresa el nombre único de la estación"
                value={basicData.stationName}
                onChange={handleBasicChange}
                required
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Latitud
              </label>
              <input
                type="number"
                step="any"
                name="geographicLat"
                className="register-station-form-input"
                placeholder="Ej: 3.451647"
                value={basicData.geographicLat}
                onChange={handleBasicChange}
                required
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Longitud
              </label>
              <input
                type="number"
                step="any"
                name="geographicLong"
                className="register-station-form-input"
                placeholder="Ej: -76.531985"
                value={basicData.geographicLong}
                onChange={handleBasicChange}
                required
              />
            </div>

            {/* Mapa interactivo de selección de ubicación */}
            <div className="register-station-form-group">
              <label className="register-station-form-label">Seleccionar ubicación en el mapa</label>
              <div className="register-station-map-container">
                <MapContainer center={[3.4516, -76.532]} zoom={13} scrollWheelZoom={true} className="register-station-leaflet-map">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={mapPosition} setPosition={handleMapClick} />
                  <MapViewController position={mapPosition} />
                </MapContainer>
              </div>
              <small className="register-station-form-hint">Haz clic en el mapa para seleccionar las coordenadas de la estación</small>
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">Dirección de referencia</label>
              <input
                type="text"
                name="addressReference"
                className="register-station-form-input"
                placeholder="Opcional: Puntos de referencia visuales"
                value={basicData.addressReference}
                onChange={handleBasicChange}
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Institución asociada
              </label>
              {loadingInstitutions ? (
                <div className="register-station-loading-text">Cargando instituciones...</div>
              ) : (
                <select name="institutionId" className="register-station-form-input" value={basicData.institutionId} onChange={handleBasicChange} required>
                  <option value="">Selecciona una institución</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.institute_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && <div className="register-station-error-box">{error}</div>}

            <button type="submit" className="register-station-submit-button">
              Continuar al paso 2 →
            </button>
          </form>
        )}

        {/* PASO 2: Detalles del sensor */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="register-station-form">
            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Modelo del sensor
              </label>
              <input
                type="text"
                name="sensorModel"
                className="register-station-form-input"
                placeholder="Modelo técnico del dispositivo"
                value={sensorData.sensorModel}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Fabricante
              </label>
              <input
                type="text"
                name="sensorManufacturer"
                className="register-station-form-input"
                placeholder="Fabricante del dispositivo"
                value={sensorData.sensorManufacturer}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Número de serie
              </label>
              <input
                type="text"
                name="sensorSerial"
                className="register-station-form-input"
                placeholder="Número de serie único o MAC Address"
                value={sensorData.sensorSerial}
                onChange={handleSensorChange}
                required
              />
            </div>

            <div className="register-station-form-group">
              <label className="register-station-form-label">
                <span className="register-station-required">*</span> Certificado de calibración
              </label>
              <input type="file" accept=".pdf,image/*" className="register-station-form-input" onChange={handleFileUpload} required />
              <small className="register-station-form-hint">Documento PDF o imagen que certifique la calibración</small>
            </div>

            {error && <div className="register-station-error-box">{error}</div>}

            <div style={{display: "flex", gap: "10px"}}>
              <button type="button" className="register-station-back-step-button" onClick={handleBackStep}>
                ← Volver al paso 1
              </button>

              <button type="submit" className="register-station-submit-button" disabled={loading} style={{opacity: loading ? 0.7 : 1}}>
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
