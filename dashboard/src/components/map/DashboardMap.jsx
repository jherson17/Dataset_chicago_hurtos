/**
 * DashboardMap.jsx - Motor Geoespacial y Capas Base
 */
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '../../context/DashboardContext';

export default function DashboardMap() {
  const { isLoading, filteredData, activeDataset } = useDashboard();

  // Siempre centrado en Chicago
  const center = [41.8781, -87.6298];

  if (isLoading) {
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
            const lat = feature.lat;
            const lon = feature.lng;
            if (!lat || !lon) return null;
            
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
                                <p><span className="font-semibold">Tipo:</span> {feature.type}</p>
                                <p><span className="font-semibold">Lugar:</span> {feature.location}</p>
                                <p><span className="font-semibold">Año:</span> {feature.year}</p>
                                {!isIncident && (
                                    <>
                                        <p><span className="font-semibold">Arresto:</span> {feature.arrest}</p>
                                        <p><span className="font-semibold">Tipo Violencia:</span> {feature.domestic}</p>
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
