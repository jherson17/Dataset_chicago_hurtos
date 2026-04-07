/**
 * DashboardMap.jsx - Motor Geoespacial y Capas Base
 * 
 * Este componente es responsable de renderizar los miles de puntos de datos sobre un plano cartográfico.
 * Utiliza 'react-leaflet' (el estándar del ecosistema React para Leaflet.js).
 * 
 * Optimizaciones implementadas para visualización masiva:
 * - Se suscribe a `filteredData` del DashboardContext, así que Leaflet solo 
 *   pinta y elimina los marcadores relevantes instantáneamente.
 * - Utiliza `CircleMarker` (capas vectoriales calculadas en GPU/Canvas) en lugar de imágenes de 
 *   pines SVG pesados, asegurando fluidez a 60FPS sin importar el volumen de nodos filtrados.
 */
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '../../context/DashboardContext';

export default function DashboardMap() {
  const { dataLoaded, filteredData, activeDataset } = useDashboard();

  // Switch center based on dataset (Chicago for Incidents, LA for Crimes)
  const center = activeDataset === 'incidents' ? [41.8781, -87.6298] : [34.0522, -118.2437];

  if (!dataLoaded) {
      return (
        <div className="absolute inset-0 z-[1000] bg-darkSidebar flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-4 border-accentPurple border-t-transparent rounded-full animate-spin"></div>
             <span className="text-white font-medium">Cargando datos espaciales...</span>
          </div>
        </div>
      );
  }

  // Limit rendering count for performance 
  const displayData = filteredData.slice(0, 1500);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden z-0">
      <MapContainer 
        key={activeDataset} // Forces Leaflet to re-mount and recenter when dataset changes
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%', background: '#1C1C1E', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {displayData.map(feature => {
            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length !== 2) return null;
            const lat = coords[1];
            const lon = coords[0];
            
            const isIncident = activeDataset === 'incidents';
            const color = isIncident ? '#DDF45B' : '#8A68FA';
            const fillOpacity = isIncident ? 0.6 : 0.8;
            
            return (
                <CircleMarker
                    key={feature.id || Math.random()}
                    center={[lat, lon]}
                    radius={isIncident ? 3 : 4}
                    pathOptions={{ 
                        color: color, 
                        fillColor: color, 
                        fillOpacity: fillOpacity,
                        weight: 1 
                    }}
                >
                    <Popup>
                        <div className="p-1 min-w-[150px]">
                            <h4 className="font-bold text-gray-800 mb-1 border-b pb-1 text-sm">
                                {isIncident ? 'Incidente de Tráfico' : 'Reporte de Hurto (Crimen)'}
                            </h4>
                            <div className="text-xs text-gray-600 space-y-1 mt-2">
                                {isIncident ? (
                                    <>
                                        <p><span className="font-semibold">Tipo:</span> {feature.properties.FIRST_CRASH_TYPE}</p>
                                        <p><span className="font-semibold">Gravedad:</span> {feature.properties.MOST_SEVERE_INJURY}</p>
                                        <p><span className="font-semibold">Calle/Lugar:</span> {feature.properties.STREET_NAME || 'Desconocido'}</p>
                                        <p><span className="font-semibold">Fecha:</span> {feature.properties.CRASH_DATE}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><span className="font-semibold">Modalidad:</span> {feature.properties['Crm Cd Desc']}</p>
                                        <p><span className="font-semibold">Ubicación Prima:</span> {feature.properties['Premis Desc']}</p>
                                        <p><span className="font-semibold">Área:</span> {feature.properties['AREA NAME'] || 'Desconocido'}</p>
                                        <p><span className="font-semibold">Fecha:</span> {feature.properties['DATE OCC']}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            );
        })}
      </MapContainer>
    </div>
  );
}
