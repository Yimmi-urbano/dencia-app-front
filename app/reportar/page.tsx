"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Card, Select, SelectItem, Selection, CardBody, Textarea, Checkbox, Chip, CardFooter, Link } from '@nextui-org/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración del ícono personalizado para el marcador
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para centrar el mapa cuando cambien las coordenadas
const MapCenterer = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15); // Cambia el zoom y mueve el mapa a las nuevas coordenadas
    }
  }, [lat, lng, map]);

  return null;
};

export default function Report() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<Selection>(new Set());
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState(''); // Nueva variable para la dirección
  const [useDeviceLocation, setUseDeviceLocation] = useState(false); // Estado para el checkbox

  useEffect(() => {
    if (useDeviceLocation) {
      // Obtener las coordenadas automáticas del usuario
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            console.error('Error obteniendo la ubicación:', error);
          }
        );
      } else {
        console.error('La geolocalización no está soportada por este navegador.');
      }
    }
  }, [useDeviceLocation]);

  const geocodeAddress = async () => {
    if (!address) {
      alert('Por favor, ingresa una dirección.');
      return;
    }
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: address,
            format: 'json',
            limit: 1
          }
        }
      );
      if (response.data.length > 0) {
        const location = response.data[0];
        setLatitude(parseFloat(location.lat));
        setLongitude(parseFloat(location.lon));
      } else {
        alert('No se encontraron coordenadas para esta dirección.');
      }
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
    }
  };

  const submitReport = async () => {
    if (!latitude || !longitude || incidentType === null || incidentType === 'all') {
      alert('No se pudo obtener la ubicación o seleccionar un tipo de incidente. Intenta nuevamente.');
      return;
    }

    const selectedIncidentType = Array.from(incidentType).join('');

    try {
      await axios.post('https://api-report-denuncias.agencsi.com/api/reports', {
        description,
        incidentType: selectedIncidentType,
        address:address,
        coordinates: { lat: latitude, lon: longitude }
      });
      alert('Denuncia enviada correctamente');
    } catch (error) {
      console.error('Error al enviar la denuncia', error);
    }
  };

  // Función para actualizar las coordenadas cuando el marcador se mueve
  const onMarkerDragEnd = (e: L.DragEndEvent) => {
    const { lat, lng } = e.target.getLatLng();
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <Card className='md:w-[400px] w-[90%] m-auto'>
      <CardBody className='flex flex-col gap-4'>
        <h1 className='font-bold'>Reportar Incidentes</h1>

        {/* Select para el tipo de incidente */}
        <Select
          label="Tipo de Incidente"
          variant="bordered"
          placeholder="Selecciona el tipo de incidente"
          selectedKeys={incidentType}
          onSelectionChange={setIncidentType}
        >
          <SelectItem key="robo">Robo</SelectItem>
          <SelectItem key="extorsion">Extorsión</SelectItem>
        </Select>

        {/* Input para la descripción */}
        <Textarea
          label="Descripción"
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Checkbox para usar la ubicación del dispositivo */}
        <Checkbox
          isSelected={useDeviceLocation}
          onValueChange={setUseDeviceLocation}
        >
          Usar mi ubicación actual
        </Checkbox>

        {/* Input para la dirección, habilitado solo si no se usa la ubicación del dispositivo */}
        {!useDeviceLocation && (
          <>
            <Input
              label="Dirección"
              placeholder="Ingresa la dirección"
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button onClick={geocodeAddress}>Obtener Coordenadas</Button>
          </>
        )}

        {/* Mostrar el estado de selección del checkbox */}
        <p className="text-default-500">
          Usando ubicación automática: {useDeviceLocation ? "Sí" : "No"}
        </p>
        {latitude && longitude && (
          <div className="flex gap-4 w-full">
            <Chip size="sm"><b>Lat:</b> {latitude}</Chip>
            <Chip size="sm"><b>Long:</b> {longitude}</Chip>
          </div>
        )}

        {/* Mapa */}
        {latitude && longitude && (
          <div className='h-[300px]'>
            <MapContainer
              center={[latitude, longitude]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[latitude, longitude]}
                icon={markerIcon}
                draggable={true}
                eventHandlers={{
                  dragend: onMarkerDragEnd, // Actualiza las coordenadas cuando el marcador es movido
                }}
              >
                <Popup>
                  Ubicación actual seleccionada
                </Popup>
              </Marker>
              {/* Componente para centrar el mapa en las nuevas coordenadas */}
              <MapCenterer lat={latitude} lng={longitude} />
            </MapContainer>
          </div>
        )}

        {/* Botón para enviar el reporte */}
        <Button
          onClick={submitReport}
          color='danger'
          disabled={!latitude || !longitude || incidentType === null || incidentType === 'all'}
        >
          Reportar
        </Button>
      </CardBody>
      <CardFooter className='text-center justify-center'>
    
      <Link isBlock showAnchorIcon href="/" className='w-full justify-center m-auto' color="primary">
      Ver mapa de Incidentes
      </Link>
      </CardFooter>
    </Card>
  );
}

