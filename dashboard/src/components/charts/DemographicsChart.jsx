import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

export default function DemographicsChart() {
  const { filteredData, activeDataset, dataLoaded } = useDashboard();

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    const counts = { 'Masculino': 0, 'Femenino': 0, 'Otro/Sin dato': 0 };
    
    filteredData.forEach(d => {
        const sexo = (d.gender || '').trim();
        if (sexo.toLowerCase() === 'masculino' || sexo.toLowerCase() === 'hombre') {
            counts['Masculino']++;
        } else if (sexo.toLowerCase() === 'femenino' || sexo.toLowerCase() === 'mujer') {
            counts['Femenino']++;
        } else if (sexo !== 'No Aplica') {
            counts['Otro/Sin dato']++;
        }
    });

    return [
      { name: 'Masculino', count: counts['Masculino'], color: '#8A68FA' },
      { name: 'Femenino', count: counts['Femenino'], color: '#DDF45B' },
      { name: 'Otro/SD', count: counts['Otro/Sin dato'], color: '#C1B2FF' }
    ].filter(d => d.count > 0);
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkBg border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-white font-bold text-lg" style={{ color: payload[0].payload.color }}>
            {payload[0].value} <span className="text-gray-400 text-sm font-normal">víctimas</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!dataLoaded) {
     return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-6 h-6 border-2 border-accentPurple border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-gray-500 text-sm">Cargando demografía...</span>
        </div>
     );
  }

  if (activeDataset === 'incidents') {
     return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-darkBg flex items-center justify-center mb-4 text-gray-500 border border-gray-800">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h4 className="text-white font-bold mb-2">Privacidad de Datos</h4>
            <p className="text-gray-400 text-sm max-w-sm">
                Los registros de incidentes de tránsito no segmentan información demográfica en esta base.
                <br/><br/>
                <span className="text-accentLime">Por favor, cambia la Base de Datos a "Hurtos" en el Panel Superior para analizar este componente.</span>
            </p>
        </div>
     );
  }

  return (
    <div className="w-full h-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D35" vertical={false} />
            <XAxis dataKey="name" stroke="#8A8A8E" axisLine={false} tickLine={false} dy={10} fontSize={12} />
            <YAxis stroke="#8A8A8E" axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#2D2D35', opacity: 0.4 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Bar>
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
