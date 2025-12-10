import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "./StationsMap.css";

// Configuración de iconos de Leaflet para evitar imágenes rotas
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/**
 * Componente de mapa reutilizable para visualizar estaciones de monitoreo
 * @param {Array} stations - Array de estaciones con geographic_location_lat, geographic_location_long y station_name
 * @param {Array} center - Coordenadas del centro del mapa [lat, lng]. Por defecto: Cali, Colombia
 * @param {Number} zoom - Nivel de zoom inicial. Por defecto: 12
 * @param {String} height - Altura del contenedor del mapa. Por defecto: "300px"
 * @component
 */
export default function StationsMap({
  stations = [],
  center = [3.4516, -76.5320], // Cali, Colombia
  zoom = 12,
  height = "300px"
}) {
  return (
    <div className="stations-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="stations-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          // Validar que la estación tenga coordenadas válidas
          const lat = parseFloat(station.geographic_location_lat);
          const lng = parseFloat(station.geographic_location_long);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Estación ${station.station_name} tiene coordenadas inválidas`);
            return null;
          }

          return (
            <Marker
              key={station.station_id}
              position={[lat, lng]}
            >
              <Popup>
                <div className="station-popup">
                  <h4 className="station-popup-title">{station.station_name}</h4>
                  <p className="station-popup-status">
                    <span
                      className={`status-indicator ${station.status === 'ACTIVE' ? 'active' : 'inactive'}`}
                    ></span>
                    Estado: <strong>{station.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}</strong>
                  </p>
                  {station.address_reference && (
                    <p className="station-popup-address">{station.address_reference}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}