import { Activity, AlertCircle, Cloud, Droplet, Factory, Flame, Haze, Thermometer, Wind, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MeasurementAPI, UserAPI } from "../../../../shared/api";
import StatCard from "../../../../shared/components/StatCard/StatCard";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aqiData, setAqiData] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [aqiError, setAqiError] = useState(null);

  // Inicialización de usuario (sin cambios)
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const storedData = localStorage.getItem("userData");
        const token = localStorage.getItem("token");

        if (!token || !storedData) {
          navigate("/");
          return;
        }

        const parsedUser = JSON.parse(storedData);
        setUser(parsedUser);

        if (parsedUser.user_id) {
          try {
            const freshUserData = await UserAPI.getUserById(parsedUser.user_id);
            const mergedUser = {
              ...parsedUser,
              ...freshUserData,
              institution_name: freshUserData.institution?.institute_name,
            };
            setUser(mergedUser);
            localStorage.setItem("userData", JSON.stringify(mergedUser));
          } catch (apiError) {
            console.error("Could not fetch fresh user data:", apiError);
          }
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // Carga de AQI
  useEffect(() => {
    const fetchAQI = async () => {
      try {
        setAqiLoading(true);
        const stationId = 1; // TODO: Dinámico
        const data = await MeasurementAPI.getCurrentAQI(stationId);
        setAqiData(data);
        setAqiError(null);
      } catch (error) {
        console.error("Error fetching AQI:", error);
        setAqiError("No se pudo cargar el AQI");
      } finally {
        setAqiLoading(false);
      }
    };

    if (user) {
      fetchAQI();
      const interval = setInterval(fetchAQI, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Colores y lógica para tarjetas
  const ICON_COLOR = "#64748b";
  const COLOR_NORMAL = "#22C55E";
  const COLOR_ALERT = "#EF4444";

  // Helper para obtener datos de un contaminante
  const getPollutantStatus = (key) => {
    if (aqiLoading || !aqiData) {
      return {
        value: "...",
        color: "#e2e8f0",
        label: "Cargando...",
      };
    }

    const value = aqiData.sub_indices?.[key];
    const valDisplay = value !== undefined ? Math.round(value) : "0";

    // Si es el dominante -> Rojo, si no -> Verde
    const isDominant = aqiData.dominant_pollutant === key;

    return {
      value: valDisplay,
      color: isDominant ? COLOR_ALERT : COLOR_NORMAL,
      label: isDominant ? "Dominante" : "Normal",
    };
  };

  // Configuración base de tarjetas
  const metricsConfig = [
    {key: "PM2.5", label: "PM2.5", icon: <Cloud size={24} />},
    {key: "PM10", label: "PM10", icon: <Haze size={24} />},
    {key: "CO", label: "CO (MONÓXIDO)", icon: <Factory size={24} />},
    {key: "NO2", label: "NO2", icon: <Flame size={24} />},
    {key: "SO2", label: "SO2", icon: <Zap size={24} />},
    {key: "O3", label: "OZONO (O3)", icon: <Wind size={24} />},
  ];

  const isCitizen = !user?.belongs_to_organization || user?.requested_role === "citizen";
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  const needsRegistrationCompletion = !isCitizen && !user?.registration_complete && !hasInstitutionAssigned;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {needsRegistrationCompletion && (
        <div className="registration-banner">
          <div className="banner-content">
            <div className="banner-icon">
              <AlertCircle size={24} />
            </div>
            <div className="banner-text">
              <strong>Tu registro está incompleto</strong>
              <p>Completa tu registro para acceder a todas las funcionalidades.</p>
            </div>
            <Link to="/complete-registration" className="banner-btn">
              Completar registro
            </Link>
          </div>
        </div>
      )}

      <main className="dashboard-main">
        <section className="dashboard-content">
          <div className="content-header">
            <h2>Monitor de Calidad del Aire</h2>
            <p className="content-subtitle">Estación: {aqiData?.station_name || "Cargando..."}</p>
          </div>

          <div className="summary-cards">
            {/* AQI */}
            <StatCard
              label="ÍNDICE DE CALIDAD (AQI)"
              value={aqiLoading ? "..." : aqiData ? Math.round(aqiData.aqi) : "--"}
              unit={aqiData?.category || "Sin datos"}
              icon={<Activity size={24} />}
              colorHex={aqiData?.color || "#e2e8f0"}
              statusColor={aqiData?.color} // Texto del mismo color que el AQI
              borderType="full"
            />

            {/* Contaminantes */}
            {metricsConfig.map((metric) => {
              const status = getPollutantStatus(metric.key);
              return (
                <StatCard
                  key={metric.key}
                  label={metric.label}
                  value={status.value}
                  unit={status.label}
                  icon={metric.icon}
                  colorHex={status.color}
                  statusColor={status.color} // Texto de "Normal"/"Dominante" coloreado
                  borderType="left"
                />
              );
            })}

            {/* Variables Climáticas */}
            <StatCard label="TEMPERATURA" value="24°C" unit="Agradable" icon={<Thermometer size={24} color={ICON_COLOR} />} borderType="none" />

            <StatCard label="HUMEDAD" value="68%" unit="Relativa" icon={<Droplet size={24} color={ICON_COLOR} />} borderType="none" />
          </div>

          {/* Sección estaciones... */}
          <div className="stations-section mt-8">
            <h3 className="section-title">Red de Monitoreo</h3>
            <div className="stations-grid">
              <div className="station-card">
                <div className="station-status online"></div>
                <div className="station-info">
                  <h4>{aqiData?.station_name || "Estación Principal"}</h4>
                  <p>Última lectura: {aqiLoading ? "..." : "hace un momento"}</p>
                  <span className="station-aqi" style={{backgroundColor: (aqiData?.color || "#eee") + "40", color: "#333"}}>
                    AQI: {aqiData ? Math.round(aqiData.aqi) : "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
