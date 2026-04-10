/**
 * FilterPanel.jsx - Interfaz Universal de Filtros Avanzados
 * 
 * Este componente dinámico genera automáticamente los menús desplegables (dropdowns)
 * basados en las categorías únicas que Crossfilter detecta en el dataset activo.
 * 
 * Comportamiento Contextual Inteligente implementado:
 * - Lee la propiedad `activeTab` para saber en qué pantalla está el usuario.
 */
import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Filter } from 'lucide-react';

export default function FilterPanel({ activeTab }) {
  const { activeDataset, setActiveDataset, filterOptions, activeFilters, filterByDimension } = useDashboard();
  
  if (!filterOptions || Object.keys(filterOptions).length === 0) return null;

  const handleChange = (dimName, e) => {
      const val = e.target.value === '' ? null : e.target.value;
      filterByDimension(dimName, val);
  };

  // We conditionally show controls depending on what has options available
  const hasOptions = (dimName) => filterOptions[dimName] && filterOptions[dimName].length > 0;

  return (
    <div className="bg-darkSidebar border border-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center border border-gray-700">
                    <Filter size={16} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Filtros Avanzados</h3>
            </div>
            
            <div className="md:ml-auto flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Base de Datos:</span>
                <div className="bg-darkBg rounded-lg p-1 border border-gray-800 flex text-xs">
                    <button 
                      onClick={() => setActiveDataset('incidents')}
                      className={`px-4 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'incidents' ? 'bg-accentPurple text-darkBg shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Incidentes
                    </button>
                    <button 
                      onClick={() => setActiveDataset('thefts')}
                      className={`px-4 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'thefts' ? 'bg-accentLime text-darkBg shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Hurtos
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* LOCATION FILTER */}
            {hasOptions('location') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Ubicación (Calle/Avenida)</label>
                    <select 
                        value={activeFilters.location || ''} 
                        onChange={(e) => handleChange('location', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todas las ubicaciones</option>
                        {filterOptions.location.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* TYPE FILTER */}
            {hasOptions('type') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Tipo / Modalidad</label>
                    <select 
                        value={activeFilters.type || ''} 
                        onChange={(e) => handleChange('type', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todos los tipos</option>
                        {filterOptions.type.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* TRANSPORT FILTER */}
            {hasOptions('transport') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Medio de Transporte</label>
                    <select 
                        value={activeFilters.transport || ''} 
                        onChange={(e) => handleChange('transport', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todos los transportes</option>
                        {filterOptions.transport.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* AGE GROUP FILTER */}
            {hasOptions('ageGroup') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Edad (Víctima)</label>
                    <select 
                        value={activeFilters.ageGroup || ''} 
                        onChange={(e) => handleChange('ageGroup', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todas las edades</option>
                        {filterOptions.ageGroup.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* GENDER FILTER */}
            {hasOptions('gender') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Sexo (Víctima)</label>
                    <select 
                        value={activeFilters.gender || ''} 
                        onChange={(e) => handleChange('gender', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todos</option>
                        {filterOptions.gender.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* CRIME SPECIFIC: ARREST */}
            {activeDataset === 'thefts' && hasOptions('arrest') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">¿Hubo Arresto?</label>
                    <select 
                        value={activeFilters.arrest || ''} 
                        onChange={(e) => handleChange('arrest', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todas las opciones</option>
                        {filterOptions.arrest.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* CRIME SPECIFIC: DOMESTIC */}
            {activeDataset === 'thefts' && hasOptions('domestic') && (
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Violencia Doméstica</label>
                    <select 
                        value={activeFilters.domestic || ''} 
                        onChange={(e) => handleChange('domestic', e)}
                        className="w-full bg-darkBg border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-accentLime focus:ring-1 focus:ring-accentLime/50 transition-colors"
                    >
                        <option value="">Todas las opciones</option>
                        {filterOptions.domestic.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    </div>
  );
}
