import { Activity, ArrowDown, ArrowUp, ChevronDown, MapPin, RefreshCw, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MeasurementAPI, StationAPI } from "../../shared/api";
import DateRangePicker from "../../shared/components/DateRange/DateRangePicker";
import StatCard from "../../shared/components/StatCard/StatCard";
import { VARIABLE_COLORS } from "../../shared/constants";
import "./airquality-page.css";

/**
 * Página principal de estadísticas de calidad del aire.
 * @returns {JSX.Element} Componente de la página de calidad del aire.
 */
export default function AirQualityPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);
  const [stats, setStats] = useState({min: 0, max: 0, avg: 0});

  // Filtros iniciales
  const [filters, setFilters] = useState({
    station_id: "",
    variable_code: "PM2.5",
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString().split("T")[0],
  });

  // Cargar metadatos (Estaciones y Variables)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [stationsData, varsData] = await Promise.all([StationAPI.getStations(), MeasurementAPI.getVariables()]);

        setStations(stationsData);
        setVariables(varsData);

        if (stationsData.length > 0 && !filters.station_id) {
          setFilters((prev) => ({...prev, station_id: stationsData[0].station_id}));
        }
      } catch (error) {
        console.error("Error cargando metadatos", error);
        // TODO: Mostrar notificación de error al usuario
      }
    };
    loadMetadata();
  }, []);

  // Función para buscar datos históricos
  const fetchData = async () => {
    if (!filters.station_id) {
      alert("Por favor selecciona una estación");
      return;
    }
    setLoading(true);
    try {
      const result = await MeasurementAPI.getHistoricalData(filters);

      const formattedData = result.map((item) => {
        const dateObj = new Date(item.measure_date);
        return {
          ...item,
          // Guardamos el timestamp numérico para el Eje X (Matemático)
          timestamp: dateObj.getTime(),
          // Guardamos los strings para los Tooltips (Visual)
          displayTime: dateObj.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
          displayDate: dateObj.toLocaleDateString([], {day: "2-digit", month: "2-digit"}),
          fullDate: dateObj.toLocaleString(),
        };
      });

      setData(formattedData);
      calculateStats(formattedData);
    } catch (error) {
      console.error("Error buscando datos", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta fetchData automáticamente cuando cambian los filtros
  useEffect(() => {
    if (filters.station_id) {
      fetchData();
    }
  }, [filters]);

  // Función para calcular estadísticas simples
  const calculateStats = (dataset) => {
    if (dataset.length === 0) {
      setStats({min: 0, max: 0, avg: 0});
      return;
    }
    const values = dataset.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    setStats({
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: (sum / values.length).toFixed(2),
    });
  };

  const handleStationChange = (e) => {
    setFilters({...filters, station_id: e.target.value});
  };

  const handleVariableChange = (e) => {
    setFilters({...filters, variable_code: e.target.value});
  };

  const handleDateRangeChange = (start, end) => {
    setFilters({...filters, start_date: start, end_date: end});
  };

  const dateFormatter = (tickItem) => {
    const date = new Date(tickItem);
    // Si el filtro es de más de 24 horas, mostramos Día/Mes + Hora
    // Si es corto, solo Hora
    if (new Date(filters.end_date) - new Date(filters.start_date) > 86400000) {
      return `${date.getDate()}/${date.getMonth() + 1} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
  };

  // Color actual según variable seleccionada
  const currentColor = VARIABLE_COLORS[filters.variable_code] || VARIABLE_COLORS["DEFAULT"];
  // Obtener unidad de la variable seleccionada para mostrar en la gráfica
  const currentUnit = variables.find((v) => v.code === filters.variable_code)?.unit || "";

  const currentVariableObj = variables.find((v) => v.code === filters.variable_code);
  const maxLimit = currentVariableObj ? currentVariableObj.max_expected_value : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* === BARRA DE CONTROLES === */}
      <div className="aq-control-bar">
        {/* Izquierda: Título y Selectores */}
        <div className="aq-controls-left">
          <div className="aq-title-wrapper">
            <Activity className="text-brand-500" size={24} color="#4339F2" />
          </div>

          {/* Select Estación */}
          <div className="aq-input-group">
            <span className="aq-label">Estación</span>
            <div className="aq-select-wrapper">
              <select value={filters.station_id} onChange={handleStationChange} className="aq-select">
                {stations.map((s) => (
                  <option key={s.station_id} value={s.station_id}>
                    {s.station_name}
                  </option>
                ))}
              </select>
              <MapPin className="aq-select-icon" />
            </div>
          </div>

          {/* Select Variable */}
          <div className="aq-input-group">
            <span className="aq-label">Variable</span>
            <div className="aq-select-wrapper">
              <select value={filters.variable_code} onChange={handleVariableChange} className="aq-select" style={{minWidth: "100px"}}>
                {variables.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="aq-select-icon" />
            </div>
          </div>
        </div>

        {/* Derecha: DatePicker y Refresh */}
        <div className="aq-controls-right">
          <DateRangePicker startDate={filters.start_date.slice(0, 16)} endDate={filters.end_date.slice(0, 16)} onChange={handleDateRangeChange} />

          <button onClick={fetchData} disabled={loading} className="aq-refresh-btn" title="Actualizar datos">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ... (El resto del render de la gráfica y stats se mantiene igual) ... */}
      {data.length > 0 ? (
        <div className="space-y-6">
          {" "}
          {/* Contenedor vertical principal */}
          {/* 1. GRÁFICA (Ahora ocupa todo el ancho) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-lg">
                Comportamiento: <span style={{color: currentColor}}>{filters.variable_code}</span>
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">{data.length} puntos de medición</span>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentColor} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  scale="time"
                  tickFormatter={dateFormatter}
                  tick={{fontSize: 11, fill: "#94a3b8"}}
                  minTickGap={50}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis unit={` ${currentUnit}`} tick={{fontSize: 11, fill: "#94a3b8"}} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                {maxLimit > 0 && (
                  <ReferenceLine
                    y={maxLimit}
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      position: "insideTopRight",
                      value: `Límite Máximo: ${maxLimit} ${currentUnit}`,
                      fill: "#EF4444",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                )}
                <Tooltip
                  contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)", padding: "12px"}}
                  labelStyle={{color: "#64748b", fontWeight: "500", marginBottom: "8px", fontSize: "0.85rem"}}
                  itemStyle={{color: currentColor, fontWeight: "bold", fontSize: "1rem"}}
                  formatter={(value) => [`${value} ${currentUnit}`, filters.variable_code]}
                  labelFormatter={(label, payload) => (payload && payload.length > 0 ? payload[0].payload.fullDate : label)}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={currentColor}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={3}
                  activeDot={{r: 6, strokeWidth: 0, fill: currentColor}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* 2. FILA DE ESTADÍSTICAS (Nuevo diseño horizontal) */}
          <div className="stats-grid">
            <StatCard
              label="Promedio"
              value={stats.avg}
              unit={currentUnit}
              icon={<TrendingUp size={24} color="#64748b" />}
              colorClass="bg-gray-100" // Color de fondo del icono
              barColor="#64748b"
            />
            <StatCard label="Máximo Registrado" value={stats.max} unit={currentUnit} icon={<ArrowUp size={24} color="#ef4444" />} colorClass="bg-red-50" barColor="#ef4444" />
            <StatCard label="Mínimo Registrado" value={stats.min} unit={currentUnit} icon={<ArrowDown size={24} color="#10b981" />} colorClass="bg-emerald-50" barColor="#10b981" />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border border-dashed border-gray-200">
          <Activity size={48} className="text-gray-300 mb-4 animate-pulse" />
          <p className="text-gray-500 font-medium">Esperando datos...</p>
        </div>
      )}
    </div>
  );
}
