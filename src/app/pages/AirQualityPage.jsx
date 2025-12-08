import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { Calendar, Filter, RefreshCw, MapPin, Activity } from "lucide-react";
import { InstitutionAPI, UserAPI } from "../../shared/api"; // Asumiendo que UserAPI o InstitutionAPI tienen getStations
import * as MeasurementAPI from "../../shared/api/measurements"; // Importa lo que creamos en el paso 3
import "./dashboard-styles.css"; // Reutilizamos estilos

export default function AirQualityPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    station_id: "",
    variable_code: "PM2.5", // Valor por defecto
    start_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // Ayer
    end_date: new Date().toISOString().split('T')[0] // Hoy
  });

  // Estadísticas calculadas
  const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });

  // 1. Cargar metadatos (Estaciones y Variables) al inicio
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        // Nota: Asegúrate de tener un endpoint para listar estaciones públicas o del usuario
        // Aquí uso una llamada hipotética basada en tu código anterior
        const stationsData = await InstitutionAPI.getInstitutions(); // O un endpoint específico de estaciones
        // Si no tienes endpoint de estaciones directo, filtramos de instituciones o usamos mock por ahora
        // Para el ejemplo, usaré datos mock si no hay API lista, adáptalo a tu backend:
        setStations([
            { id: 1, name: "Estación La Flora" }, 
            { id: 2, name: "Estación Centro" }
        ]); 

        const varsData = await MeasurementAPI.getVariables();
        setVariables(varsData);
        
        // Si hay estaciones, seleccionar la primera por defecto
        if (stationsData.length > 0) {
            // setFilters(prev => ({ ...prev, station_id: stationsData[0].id }));
        }
      } catch (error) {
        console.error("Error cargando metadatos", error);
      }
    };
    loadMetadata();
  }, []);

  // 2. Función para buscar datos
  const fetchData = async () => {
    if (!filters.station_id) {
        alert("Por favor selecciona una estación");
        return;
    }
    setLoading(true);
    try {
      const result = await MeasurementAPI.getHistoricalData(filters);
      
      // Formatear fechas para el gráfico
      const formattedData = result.map(item => ({
        ...item,
        displayDate: new Date(item.measure_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(item.measure_date).toLocaleString()
      }));
      
      setData(formattedData);
      calculateStats(formattedData);
    } catch (error) {
      console.error("Error buscando datos", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Calcular estadísticas simples en el frontend
  const calculateStats = (dataset) => {
    if (dataset.length === 0) {
        setStats({ min: 0, max: 0, avg: 0 });
        return;
    }
    const values = dataset.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    setStats({
        min: Math.min(...values).toFixed(2),
        max: Math.max(...values).toFixed(2),
        avg: (sum / values.length).toFixed(2)
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-brand-500" />
            Análisis de Calidad del Aire
          </h2>
          <p className="text-gray-500">Consulta histórica de sensores y variables</p>
        </div>
        <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
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
                {stations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
                {variables.map(v => (
                    <option key={v.code} value={v.code}>{v.name} ({v.unit})</option>
                ))}
                {/* Fallback si no hay API de variables aún */}
                {variables.length === 0 && (
                    <>
                        <option value="PM2.5">PM2.5</option>
                        <option value="TEMP">Temperatura</option>
                        <option value="HUM">Humedad</option>
                    </>
                )}
            </select>
        </div>

        {/* Fechas */}
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Desde</label>
            <input 
                type="date" 
                name="start_date" 
                value={filters.start_date} 
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
            />
        </div>
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Hasta</label>
            <input 
                type="date" 
                name="end_date" 
                value={filters.end_date} 
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
            />
        </div>
      </div>

      {/* Área de Visualización */}
      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Gráfica Principal (Ocupa 2 columnas) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                <h3 className="font-semibold text-gray-700 mb-6">Tendencia Temporal</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="displayDate" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelStyle={{ color: '#666' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#4F46E5" 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                            name={filters.variable_code}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Tarjetas de Estadísticas (Ocupa 1 columna) */}
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Promedio</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.avg}</p>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">En el periodo</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Valor Máximo</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.max}</p>
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Pico registrado</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 uppercase">Valor Mínimo</h4>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.min}</p>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
            <Filter size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">Selecciona filtros y haz clic en "Actualizar Datos" para visualizar.</p>
        </div>
      )}
    </div>
  );
}