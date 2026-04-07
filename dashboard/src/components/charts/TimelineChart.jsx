import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

export default function TimelineChart() {
  const { dataLoaded, filteredData, filterByMonth, activeFilters, activeDataset } = useDashboard();

  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const counts = new Array(12).fill(0);
    
    filteredData.forEach(d => {
      if (d.month !== null) {
        counts[d.month]++;
      }
    });

    return months.map((m, i) => ({
      name: m,
      monthIndex: i,
      count: counts[i]
    }));
  }, [filteredData]);

  const handleChartClick = (state) => {
    if (state && state.activePayload) {
      const monthIdx = state.activePayload[0].payload.monthIndex;
      if (activeFilters.month === monthIdx) {
          filterByMonth(null); // Toggle off filter
      } else {
          filterByMonth(monthIdx); // Set filter
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkBg border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          <p className="text-accentLime font-bold text-sm">
            {payload[0].value} <span className="text-gray-400 font-normal">registros</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!dataLoaded) {
     return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-accentLime border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-gray-500 text-sm">Cargando temporalidad...</span>
        </div>
     );
  }

  const isIncident = activeDataset === 'incidents';
  const color = isIncident ? '#DDF45B' : '#8A68FA';

  return (
    <div className="w-full h-full pb-6 pt-4 cursor-pointer">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            onClick={handleChartClick}
        >
            <defs>
              <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D2D35" vertical={false} />
            <XAxis dataKey="name" stroke="#8A8A8E" axisLine={false} tickLine={false} dy={10} fontSize={12} />
            <YAxis stroke="#8A8A8E" axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2D2D35', strokeWidth: 2, fill: 'transparent' }} />
            <Area type="monotone" dataKey="count" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
        </AreaChart>
        </ResponsiveContainer>
    </div>
  );
}
