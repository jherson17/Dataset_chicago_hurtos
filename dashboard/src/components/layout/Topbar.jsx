import React from 'react';
import { Search, Bell, Calendar as CalendarIcon } from 'lucide-react';

export default function Topbar({ title, dateRange }) {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-gray-800/50 bg-darkBg/80 backdrop-blur-md sticky top-0 z-10 w-full">
      <div>
        <h2 className="text-2xl font-bold text-white capitalize">{title.replace('-', ' ')}</h2>
        <p className="text-sm text-gray-400 mt-1">Dashboard de Resiliencia Urbana Medellín</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-darkSidebar px-4 py-2 rounded-full border border-gray-800">
            <CalendarIcon size={16} className="text-accentPurple" />
            <span className="text-sm text-gray-300">{dateRange || 'Datos 2018 - 2019'}</span>
        </div>

        <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-darkSidebar flex items-center justify-center text-gray-400 hover:text-white border border-gray-800 hover:border-accentPurple/50 transition-colors">
                <Search size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-darkSidebar flex items-center justify-center text-gray-400 hover:text-white border border-gray-800 hover:border-accentPurple/50 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-accentLime border border-darkSidebar"></span>
            </button>
        </div>
      </div>
    </header>
  );
}
