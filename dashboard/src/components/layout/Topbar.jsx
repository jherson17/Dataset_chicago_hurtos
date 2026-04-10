import React, { useState } from 'react';
import { Search, Bell, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function Topbar({ title }) {
  const { availableYears, selectedYears, toggleYear } = useDashboard();
  const [showYears, setShowYears] = useState(false);

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-gray-800/50 bg-darkBg/80 backdrop-blur-md sticky top-0 z-10 w-full">
      <div>
        <h2 className="text-2xl font-bold text-white capitalize">{title.replace('-', ' ')}</h2>
        <p className="text-sm text-gray-400 mt-1">Dashboard de Resiliencia Urbana Chicago</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
            <button 
                onClick={() => setShowYears(!showYears)}
                className="hidden md:flex items-center gap-2 bg-darkSidebar px-4 py-2 rounded-full border border-gray-800 hover:border-gray-600 transition-colors"
            >
                <CalendarIcon size={16} className="text-accentPurple" />
                <span className="text-sm text-gray-300">
                    {selectedYears.length === 0 ? 'Seleccionar Año' 
                     : selectedYears.length === 1 ? `Datos ${selectedYears[0]}`
                     : `Datos ${selectedYears.length} Años`}
                </span>
                <ChevronDown size={14} className="text-gray-500"/>
            </button>
            
            {showYears && (
                <div className="absolute top-full mt-2 right-0 bg-darkSidebar border border-gray-700 rounded-lg shadow-xl w-48 p-2 z-50">
                    <div className="text-xs text-gray-400 mb-2 px-2 uppercase font-bold tracking-wider">Años Disponibles</div>
                    {availableYears.map(year => (
                        <label key={year} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-800 rounded cursor-pointer transition-colors">
                            <input 
                                type="checkbox" 
                                checked={selectedYears.includes(year)}
                                onChange={() => toggleYear(year)}
                                className="accent-accentPurple"
                            />
                            <span className="text-sm text-gray-300">{year}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>

    {/* Botones de notificaciones eliminados a petición del usuario */}
      </div>
    </header>
  );
}
