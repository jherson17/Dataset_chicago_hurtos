/**
 * App.jsx - Componente Raíz y Estructura del Dashboard
 * 
 * Este archivo actúa como el esqueleto principal de la aplicación.
 * Sus responsabilidades principales son:
 * 1. Mantener el estado de navegación (pestaña activa: 'dashboard', 'incidents', etc).
 * 2. Renderizar las Tarjetas de Indicadores (KPIs Cards) en la parte superior,
 *    calculando dinámicamente los totales basados en `filteredData` del contexto global.
 * 3. Inyectar dinámicamente las vistas (a través de la variable `content`) 
 *    dependiendo de la selección del usuario en el menú lateral.
 */
import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import FilterPanel from './components/layout/FilterPanel';
import DashboardMap from './components/map/DashboardMap';
import DemographicsChart from './components/charts/DemographicsChart';
import TimelineChart from './components/charts/TimelineChart';
import AIChatAssistant from './components/chat/AIChatAssistant';
import { useDashboard } from './context/DashboardContext';

function TechStackView() {
  return (
    <div className="bg-darkSidebar rounded-2xl border border-gray-800 p-8 flex flex-col shadow-lg min-h-[calc(100vh-8rem)] animate-in fade-in duration-300">
        <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Stack Tecnológico (Data Science & Web App)</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
               El desarrollo íntegro de Medellín Inteligente, incluyendo su asistente de IA, el motor de pre-procesamiento de Big Data y su interfaz reactiva, fue ensamblado con un ecosistema orientado a alta eficiencia <b>(Offline-First)</b>.
            </p>

            <div className="space-y-8 pb-8">
                {/* BACKEND SECTION */}
                <div>
                    <h3 className="text-xl font-bold text-accentPurple mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-accentPurple/20 flex items-center justify-center text-accentPurple">🟢</span>
                        Motor Estático (Node Ecosystem)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentPurple/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">Node.js (v20+)</h4>
                            <p className="text-sm text-gray-400">Pilar fundacional. Sus scripts de arquitectura V8 inyectan, limpian y normalizan de los DataFrames brutos gubernamentales antes siquiera de montar la web.</p>
                        </div>
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentPurple/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">PapaParse & CSV-parser</h4>
                            <p className="text-sm text-gray-400">Entorno de Data-Wrangling lado servidor para fragmentar y serializar más de 65,000 registros transmutándolos a JSON perfectos para la RAM de tu navegador.</p>
                        </div>
                    </div>
                </div>

                {/* FRONTEND SECTION */}
                <div>
                    <h3 className="text-xl font-bold text-accentLime mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-accentLime/20 flex items-center justify-center text-accentLime">⚛️</span>
                        Frontend, Reactividad e Interfaz
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentLime/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">React 19 & Vite 6</h4>
                            <p className="text-sm text-gray-400">Desacople total mediante Context. Renderizado concurrente impulsado por el Bundler Vite garantizando compilación iterativa sub-milisegundo (HMR).</p>
                        </div>
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentLime/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">Tailwind CSS v4</h4>
                            <p className="text-sm text-gray-400">Framework de utilidades que dibuja <i>Glassmorphism</i>, mallas de Grid y animaciones keyframe nativas sin colapsar el CSSOM o DOM.</p>
                        </div>
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentLime/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">Crossfilter2 & Recharts</h4>
                            <p className="text-sm text-gray-400">Motor "SQL Frontend" bidimensional. Toda la geometría poligonal y Time-Series cambia al vuelo bajo manipulación matrícial cruzada.</p>
                        </div>
                        <div className="bg-darkBg/50 p-5 rounded-xl border border-gray-800 hover:border-accentLime/30 transition-colors">
                            <h4 className="text-white font-bold mb-1">Leaflet & React-Leaflet</h4>
                            <p className="text-sm text-gray-400">Instancia geográfica sobre capa oscura de mapas CartoDB. Puntea Data Points vectoriales diametralmente basados en coordenadas lat/lon en tiempo real.</p>
                        </div>
                    </div>
                </div>

                {/* AI SECTION */}
                <div>
                    <h3 className="text-xl font-bold text-accentViolet mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-accentViolet/20 flex items-center justify-center text-accentViolet">🧠</span>
                        NLP Engine (M.I.A)
                    </h3>
                    <div className="bg-gradient-to-r from-darkBg/80 to-darkBg/30 p-5 rounded-xl border border-accentViolet/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-accentViolet/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h4 className="text-white font-bold mb-1 relative z-10">Vanilla JavaScript ES6+ (Fuzzy Matching)</h4>
                        <p className="text-sm text-gray-400 leading-relaxed relative z-10">
                            A diferencia de sistemas costosos como OpenAI o APIs externas, la IA de este dashboard es <b>100% Offline y Segura</b>. Evita el NodeNLP prefiriendo operar expresiones regulares (`RegExp`) altamente optimizadas. Entiende el vocabulario humano local y variaciones (ej. "Atropellaron", "¿Quiénes?") e inyecta <i>*Payloads*</i> de acción al Crossfilter global para mover toda tu interfaz por arte de magia. Solo gasta ~0ms de latido y 0 costo de servidor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

function DashboardOverview() {
  const { activeDataset, setActiveDataset, filteredData, rawDatasetLength, activeFilters, clearFilters, selectedYears } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="h-32 bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col justify-center gap-2 hover:border-accentPurple/50 transition-colors">
            <span className="text-gray-400 text-sm font-medium">{activeDataset === 'incidents' ? 'Incidentes' : 'Hurtos'} Sel.</span>
            <span className="text-3xl font-bold text-white">{filteredData ? filteredData.length.toLocaleString() : 0}</span>
            <span className="text-xs text-accentLime flex items-center gap-1">De {rawDatasetLength ? rawDatasetLength.toLocaleString() : 0} totales</span>
        </div>
        <div className="h-32 bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col justify-center gap-2 hover:border-accentPurple/50 transition-colors">
            <span className="text-gray-400 text-sm font-medium">Filtros Activos</span>
            <div className="flex items-center gap-2">
               <span className="text-3xl font-bold text-white">
                  {Object.keys(activeFilters || {}).length}
               </span>
               {Object.keys(activeFilters || {}).length > 0 && (
                   <button onClick={clearFilters} className="text-xs px-2 py-1 rounded bg-gray-800 text-accentPurple hover:text-white transition-colors ml-2 border border-gray-700">Limpiar Todo</button>
               )}
            </div>
            <span className="text-xs text-gray-400">Datos multidimensionales</span>
        </div>
        <div className="h-32 bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col justify-center gap-2 hover:border-accentPurple/50 transition-colors">
            <span className="text-gray-400 text-sm font-medium">Integración de Datos</span>
            <span className="text-3xl font-bold text-white">100%</span>
            <span className="text-xs text-accentPurple flex items-center gap-1">Crossfilter Activo</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[400px] h-[500px] bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Distribución Geoespacial</h3>
              <div className="bg-darkBg rounded-lg p-1 border border-gray-800 flex text-xs">
                  <button 
                    onClick={() => setActiveDataset('incidents')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'incidents' ? 'bg-accentPurple text-darkBg' : 'text-gray-400 hover:text-white'}`}
                  >
                    Incidentes
                  </button>
                  <button 
                    onClick={() => setActiveDataset('thefts')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'thefts' ? 'bg-accentPurple text-darkBg' : 'text-gray-400 hover:text-white'}`}
                  >
                    Hurtos
                  </button>
              </div>
          </div>
          <div className="w-full flex-1 bg-darkBg/50 rounded-xl flex items-center justify-center border border-gray-800/50 relative">
             <DashboardMap />
          </div>
        </div>
        
        <div className="min-h-[400px] h-[500px] bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Resumen Demográfico</h3>
          <div className="w-full flex-1 bg-darkBg/30 rounded-xl p-4 border border-gray-800/50">
             <DemographicsChart />
          </div>
        </div>
      </div>

      <div className="flex w-full gap-6">
        <div className="flex-1 min-h-[350px] bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Tendencia Temporal (Da clic en un mes para filtrar)</h3>
            <span className="text-xs text-gray-400 bg-darkBg px-3 py-1 rounded-full border border-gray-800">
                {selectedYears && selectedYears.length > 0 ? `Datos ${selectedYears.join(', ')}` : 'Sin datos'}
            </span>
          </div>
          <div className="w-full flex-1 bg-darkBg/30 rounded-xl p-4 border border-gray-800/50">
             <TimelineChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapAndTimelineView() {
  const { activeDataset, setActiveDataset } = useDashboard();
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Explorador Espacial Interactivo</h3>
              <div className="bg-darkBg rounded-lg p-1 border border-gray-800 flex text-xs">
                  <button 
                    onClick={() => setActiveDataset('incidents')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'incidents' ? 'bg-accentPurple text-darkBg' : 'text-gray-400 hover:text-white'}`}
                  >
                    Ver Incidentes de Tránsito
                  </button>
                  <button 
                    onClick={() => setActiveDataset('thefts')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeDataset === 'thefts' ? 'bg-accentPurple text-darkBg' : 'text-gray-400 hover:text-white'}`}
                  >
                    Ver Reportes de Hurtos
                  </button>
              </div>
          </div>
          <div className="w-full flex-1 bg-darkBg/50 rounded-xl flex items-center justify-center border border-gray-800/50 relative">
             <DashboardMap />
          </div>
      </div>
      <div className="h-[250px] bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Filtrado Temporal (Haz clic en un mes para enfocar el mapa)</h3>
          </div>
          <div className="w-full flex-1 bg-darkBg/30 rounded-xl p-4 border border-gray-800/50">
             <TimelineChart />
          </div>
      </div>
    </div>
  );
}

function DemographicsView() {
  return (
    <div className="bg-darkSidebar rounded-2xl border border-gray-800 p-6 flex flex-col shadow-lg h-[calc(100vh-8rem)] min-h-[500px]">
        <h3 className="text-lg font-bold text-white mb-4">Resumen Demográfico de Víctimas Instalado en Base Fija</h3>
        <div className="w-full flex-1 bg-darkBg/30 rounded-xl p-4 border border-gray-800/50 max-w-4xl mx-auto flex">
            <DemographicsChart />
        </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  let content;
  switch (activeTab) {
    case 'dashboard':
      content = <DashboardOverview />;
      break;
    case 'incidents':
      content = <MapAndTimelineView />;
      break;
    case 'demographics':
      content = <DemographicsView />;
      break;
    case 'techstack':
      content = <TechStackView />;
      break;
    default:
      content = <DashboardOverview />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <FilterPanel activeTab={activeTab} />
      {content}
      <AIChatAssistant />
    </Layout>
  );
}

export default App;
