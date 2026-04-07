import React from 'react';
import { LayoutDashboard, Map as MapIcon, BarChart2, ShieldAlert, Settings, Cpu } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard },
  { id: 'incidents', label: 'Incidentes y Hurtos', icon: MapIcon },
  { id: 'demographics', label: 'Demografía', icon: BarChart2 },
  { id: 'quality', label: 'Calidad de Vida', icon: ShieldAlert },
  { id: 'techstack', label: 'Arquitectura y Stack', icon: Cpu },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-darkSidebar border-r border-gray-800/80 text-white flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accentPurple to-accentViolet flex items-center justify-center shadow-lg shadow-accentPurple/20">
            <MapIcon size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="tracking-widest text-sm text-gray-400">MEDELLÍN</span>
            <span className="text-accentLime leading-tight text-lg">INTEL</span>
          </div>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">Menú</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-accentPurple/10 to-transparent text-white font-medium border-l-2 border-accentPurple' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:pl-5'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-accentPurple' : 'text-gray-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="bg-darkBg rounded-2xl p-4 border border-gray-800/50 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border-2 border-darkSidebar">
                <span className="text-white text-xs font-bold">MI</span>
                </div>
                <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-white truncate w-24">Invitado</span>
                <span className="text-xs text-accentLime flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accentLime animate-pulse"></span>
                    Sin Conexión
                </span>
                </div>
            </div>
            <Settings size={18} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}
