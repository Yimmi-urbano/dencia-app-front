import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, DivIcon } from 'leaflet';
import React from 'react';

// Crear un ícono personalizado en forma de círculo rojo (para robos)
const redCircleIcon = new DivIcon({
  className: 'custom-marker',
  html: '<div style="background-color: red; opacity:0.35; width: 50px; height: 50px; border-radius: 50%;"></div>',
  iconSize: [50, 50],
  iconAnchor: [20, 20], // Centrar el icono
});

// Crear un ícono personalizado en forma de círculo azul (para extorsiones)
const blueCircleIcon = new DivIcon({
  className: 'custom-marker',
  html: '<div style="background-color: orange; opacity:0.35; width: 50px; height: 50px; border-radius: 50%;"></div>',
  iconSize: [50, 50],
  iconAnchor: [20, 20], // Centrar el icono
});

interface Report {
  _id: string;
  description: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  incidentType: string; // Añadimos el campo 'type' para diferenciar el tipo de incidente
}

interface MapComponentProps {
  reports: Report[];
}

// Componente que maneja el clic en el marcador y ajusta el zoom del mapa
const ZoomableMarker: React.FC<{ report: Report }> = ({ report }) => {
  const map = useMap(); // Obtener el contexto del mapa

  // Función para centrar el mapa en el marcador seleccionado y hacer zoom incremental
  const handleMarkerClick = () => {
    const currentZoom = map.getZoom(); // Obtener el nivel de zoom actual
    const newZoom = Math.min(currentZoom + 2, 18); // Incrementar el zoom en 2 niveles hasta un máximo de 18
    map.setView([report.coordinates.lat, report.coordinates.lon], newZoom); // Ajustar la vista al nuevo zoom
  };

  // Elegir el ícono según el tipo de incidente
  const getIconByIncidentType = (incidentType: string) => {
    return incidentType === 'robo' ? blueCircleIcon :  redCircleIcon; // Rojo para 'robo', azul para 'extorsion'
  };

  return (
    <Marker
      position={[report.coordinates.lat, report.coordinates.lon] as LatLngExpression}
      icon={getIconByIncidentType(report.incidentType)}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup>{report.description}</Popup>
    </Marker>
  );
};

const MapComponent: React.FC<MapComponentProps> = ({ reports }) => {
  const peruPosition: LatLngExpression = [-12.0621065, -77.0365256]; // Coordenadas centradas en Perú

  return (
    <MapContainer center={peruPosition} zoom={7} style={{ width: '100%' }} className="h-[100vh] overflow-hidden">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map((report) => (
        <ZoomableMarker key={report._id} report={report} />
      ))}
    </MapContainer>
  );
};

export default MapComponent;
