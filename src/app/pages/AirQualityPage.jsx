import { Filter, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MeasurementAPI, StationAPI } from "../../shared/api";
import "./dashboard-styles.css";

export default function AirQualityPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);

  // Función para obtener la fecha de inicio por defecto (hace 7 días)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  };

  // Filtros iniciales
  const [filters, setFilters] = useState({
    station_id: "",
    variable_code: "PM2.5",
    start_date: getDefaultStartDate(),
    end_date: new Date().toISOString().split("T")[0],
  });

  const [stats, setStats] = useState({min: 0, max: 0, avg: 0});

  // Cargar metadatos (Estaciones y Variables)
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const stationsData = await StationAPI.getStations();
        setStations(stationsData);

        const varsData = await MeasurementAPI.getVariables();
        setVariables(varsData);

        // Seleccionar la primera estación por defecto si existe
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

      // Formatear fechas para que Recharts las entienda bien
      const formattedData = result.map((item) => {
        const dateObj = new Date(item.measure_date);
        return {
          ...item,
          // Formato corto para el eje X (ej: 14:30 o 23/11)
          displayDate: dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}),
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

  // Calcular estadísticas simples
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

  const handleFilterChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value});
  };

  // Obtener unidad de la variable seleccionada para mostrar en la gráfica
  const currentUnit = variables.find((v) => v.code === filters.variable_code)?.unit || "";

  return (
    <div className="p-8 space-y-6">
      {/* Título de la sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Análisis de Calidad del Aire</h2>
          <p className="text-gray-500">Consulta histórica de sensores y variables</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading || !filters.station_id}
          className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          {loading ? "Cargando..." : "Actualizar Datos"}
        </button>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Selector Estación */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <MapPin size={14} /> Estación
          </label>
          <select
            name="station_id"
            value={filters.station_id}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="">Seleccionar...</option>
            {stations.map((s) => (
              <option key={s.station_id} value={s.station_id}>
                {s.station_name} ({s.operative_status})
              </option>
            ))}
          </select>
        </div>

        {/* Selector Variable */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Variable</label>
          <select
            name="variable_code"
            value={filters.variable_code}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
          >
            {variables.map((v) => (
              <option key={v.code} value={v.code}>
                {v.name} ({v.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Desde</label>
          <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Hasta</label>
          <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>

      {/* Área de Visualización */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfica Principal */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
            <h3 className="font-semibold text-gray-700 mb-6">Tendencia Temporal: {filters.variable_code}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayDate" tick={{fontSize: 12}} interval="preserveStartEnd" />
                <YAxis unit={currentUnit} tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip contentStyle={{borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"}} labelStyle={{color: "#666"}} />
                <Area type="monotone" dataKey="value" stroke="#4F46E5" fillOpacity={1} fill="url(#colorValue)" name={`${filters.variable_code} (${currentUnit})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tarjetas de Estadísticas */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Promedio</h4>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.avg} <span className="text-sm font-normal text-gray-500">{currentUnit}</span>
              </p>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">En el periodo seleccionado</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Valor Máximo</h4>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.max} <span className="text-sm font-normal text-gray-500">{currentUnit}</span>
              </p>
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Pico registrado</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Valor Mínimo</h4>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.min} <span className="text-sm font-normal text-gray-500">{currentUnit}</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
          <Filter size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500">
            {filters.station_id
              ? "No hay datos para esta combinación de filtros. Intenta cambiar las fechas."
              : "Selecciona una estación y haz clic en 'Actualizar Datos' para visualizar."}
          </p>
        </div>
      )}
    </div>
  );
}
