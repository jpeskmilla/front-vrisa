import { Activity, AlertCircle, Cloud, Droplet, Factory, Flame, Haze, MapPin, Thermometer, Wind, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MeasurementAPI, StationAPI, UserAPI } from "../../../../shared/api";
import { Select } from "../../../../shared/components/Input";
import StationsMap from "../../../../shared/components/Map/StationsMap";
import StatCard from "../../../../shared/components/StatCard/StatCard";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para AQI (Global o por estación)
  const [aqiData, setAqiData] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  
  // Estado para Mediciones Recientes (Valores crudos)
  const [latestMeasurements, setLatestMeasurements] = useState(null);
  const [latestLoading, setLatestLoading] = useState(true);

  const [stationsList, setStationsList] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState("");

  // Cargar lista de estaciones al iniciar
  useEffect(() => {
    const loadStations = async () => {
      try {
        const data = await StationAPI.getStations({status: "ACTIVE"});
        setStationsList(data);
      } catch (e) {
        console.error("Error loading stations", e);
      }
    };
    loadStations();
  }, []);

  // Inicialización de usuario
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const storedData = localStorage.getItem("userData");
        const token = localStorage.getItem("token");

        if (!token || !storedData) {
          navigate("/");
          return;
        }
        setUser(JSON.parse(storedData));
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [navigate]);

  // Carga periódica de Datos
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setAqiLoading(true);
        setLatestLoading(true);

        const stationIdParam = selectedStationId || null;

        const [aqiResponse, latestResponse] = await Promise.all([
          MeasurementAPI.getCurrentAQI(stationIdParam),
          MeasurementAPI.getLatestMeasurements(stationIdParam)
        ]);

        setAqiData(aqiResponse);
        setLatestMeasurements(latestResponse);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setAqiLoading(false);
        setLatestLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000); // Actualizar cada 30s
      return () => clearInterval(interval);
    }
  }, [user, selectedStationId]);

  // Constantes de color
  const ICON_COLOR = "#64748b";
  const COLOR_NORMAL = "#22C55E";
  const COLOR_ALERT = "#EF4444";

  /**
   * Helper para obtener datos de un contaminante desde latestMeasurements.
   * Si no hay medición reciente, intenta usar el AQI como fallback visual, o muestra "--".
   */
  const getPollutantStatus = (key) => {
    if (latestLoading || aqiLoading) {
      return { value: "...", unit: "", color: "#e2e8f0", label: "Cargando..." };
    }

    // Intentar obtener el valor real crudo
    const measurement = latestMeasurements?.[key];
    
    if (measurement && measurement.value !== undefined) {
        // Determinar estado basado en si es el contaminante dominante del AQI
        const isDominant = aqiData?.dominant_pollutant === key;
        
        return {
            value: measurement.value.toFixed(1), // Mostrar 1 decimal
            unit: measurement.unit,
            color: isDominant ? COLOR_ALERT : COLOR_NORMAL,
            label: isDominant ? "Dominante" : "Normal"
        };
    }

    // Fallback: Si no hay medición cruda, mostrar "--"
    return {
      value: "--",
      unit: "",
      color: "#e2e8f0",
      label: "Sin datos",
    };
  };

  // Configuración de tarjetas
  const metricsConfig = [
    {key: "PM2.5", label: "PM2.5", icon: <Cloud size={24} />},
    {key: "PM10", label: "PM10", icon: <Haze size={24} />},
    {key: "CO", label: "CO (MONÓXIDO)", icon: <Factory size={24} />},
    {key: "NO2", label: "NO2", icon: <Flame size={24} />},
    {key: "SO2", label: "SO2", icon: <Zap size={24} />},
    {key: "O3", label: "OZONO (O3)", icon: <Wind size={24} />},
  ];

  // Helper para variables climáticas
  const getClimateData = (key) => {
      const m = latestMeasurements?.[key];
      if(m) return { value: Math.round(m.value), unit: m.unit };
      return { value: "--", unit: "" };
  };

  const stationOptions = [
    {value: "", label: "Todas las estaciones (Ciudad)"},
    ...stationsList.map((st) => ({
      value: st.station_id,
      label: st.station_name,
    })),
  ];

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  const temp = getClimateData("TEMP");
  const hum = getClimateData("HUM");

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <section className="dashboard-content">
          <div className="content-header flex justify-between items-center">
            <div>
              <h2>Monitor de Calidad del Aire</h2>
              <p className="content-subtitle">
                Viendo: {aqiData?.station_name || "Cargando..."}
              </p>
            </div>
            <div style={{width: "280px"}}>
              <Select 
                value={selectedStationId} 
                onChange={(e) => setSelectedStationId(e.target.value)} 
                options={stationOptions} 
                icon={MapPin} 
              />
            </div>
          </div>

          <div className="summary-cards">
            {/* Tarjeta AQI */}
            <StatCard
              label="ÍNDICE DE CALIDAD (AQI)"
              value={aqiLoading ? "..." : aqiData ? Math.round(aqiData.aqi) : "--"}
              unit={aqiData?.category || "Sin datos"}
              icon={<Activity size={24} />}
              colorHex={aqiData?.color || "#e2e8f0"}
              statusColor={aqiData?.color}
              borderType="full"
            />

            {/* Tarjetas de Contaminantes */}
            {metricsConfig.map((metric) => {
              const status = getPollutantStatus(metric.key);
              return (
                <StatCard
                  key={metric.key}
                  label={metric.label}
                  value={status.value}
                  unit={status.unit}
                  icon={metric.icon}
                  colorHex={status.color}
                  statusColor={status.color}
                  borderType="left"
                />
              );
            })}

            {/* Variables Climáticas */}
            <StatCard 
                label="TEMPERATURA" 
                value={`${temp.value}°C`} 
                unit="Ambiente" 
                icon={<Thermometer size={24} color={ICON_COLOR} />} 
                borderType="none" 
            />
            <StatCard 
                label="HUMEDAD" 
                value={`${hum.value}%`} 
                unit="Relativa" 
                icon={<Droplet size={24} color={ICON_COLOR} />} 
                borderType="none" 
            />
          </div>
          
          {/* Sección estaciones con mapa */}
          <div className="stations-section mt-8">
            <h3 className="section-title">Red de Monitoreo</h3>
              <div className="stations-layout">
              <div className="stations-info">
                <div className="station-card">
                  <div className="station-status online"></div>
                  <div className="station-info">
                    <h4>{aqiData?.station_name || "Estación Principal"}</h4>
                    <p>Estado AQI Actual</p>
                    <span className="station-aqi" style={{backgroundColor: (aqiData?.color || "#eee") + "40", color: "#333"}}>
                      AQI: {aqiData ? Math.round(aqiData.aqi) : "--"}
                    </span>
                  </div>
                </div>
                <div className="stations-summary">
                  <p className="summary-text">
                    <strong>{stationsList.length}</strong> estaciones activas
                  </p>
                  <p className="summary-subtext">Monitoreo en tiempo real</p>
                </div>
              </div>
              <div className="stations-map">
                <StationsMap stations={stationsList} height="100%" zoom={13} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
