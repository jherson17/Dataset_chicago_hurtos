/**
 * DashboardContext.jsx - Motor de Estado Global y Filtrado (El "Cerebro")
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import crossfilter from 'crossfilter2';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [incidentsData, setIncidentsData] = useState([]);
  const [theftsData, setTheftsData] = useState([]);
  
  const [activeDataset, setActiveDataset] = useState('incidents'); // 'incidents' or 'thefts'
  const [selectedYears, setSelectedYears] = useState([2023]);
  const [availableYears] = useState([2018, 2019, 2020, 2021, 2022, 2023, 2024]);
  
  // Crossfilter core state
  const [cf, setCf] = useState(null);
  const [dimensions, setDimensions] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  
  // Cache for years
  const [dataCache, setDataCache] = useState({ incidents: {}, thefts: {} });

  // 1. Fetch dynamico por años
  useEffect(() => {
    const fetchYearsData = async () => {
      setIsLoading(true);
      setFilterOptions({});
      let newCache = { ...dataCache };
      let updated = false;

      const prefix = activeDataset === 'incidents' ? 'crashes' : 'crimes';
      const cacheKey = activeDataset;

      for (const y of selectedYears) {
         if (!newCache[cacheKey][y]) {
             try {
                 const raw = await fetch(`/data/${prefix}_${y}.json`);
                 if (raw.ok) {
                     newCache[cacheKey][y] = await raw.json();
                     updated = true;
                 }
             } catch (e) {
                 console.error(`Failed to load year ${y}:`, e);
             }
         }
      }
      
      if (updated) setDataCache(newCache);

      // Consolidar data del año evitando desbordamiento de pila (Call Stack Exceeded)
      let aggregatedData = [];
      for (const y of selectedYears) {
          if (newCache[cacheKey][y]) {
              aggregatedData = aggregatedData.concat(newCache[cacheKey][y]);
          }
      }

      if (activeDataset === 'incidents') setIncidentsData(aggregatedData);
      else setTheftsData(aggregatedData);
      
      setIsLoading(false);
    };

    fetchYearsData().catch(e => {
        console.error('Fatal fetch error:', e);
        setIsLoading(false);
    });
  }, [activeDataset, selectedYears]);

  // 2. Initialize/Update Crossfilter inside active context
  useEffect(() => {
    if (isLoading) return;
    
    const currentData = activeDataset === 'incidents' ? incidentsData : theftsData;
    if (currentData.length === 0) return;
    
    const normalizedData = currentData.map((d, index) => {
        let base = {
            id: index,
            lat: d.lat,
            lng: d.lng,
            year: d.y,
            month: d.m || 0,
            location: d.loc || 'Desconocido',
            type: d.type || 'Desconocido'
        };

        if (activeDataset === 'incidents') {
            return {
                ...base,
                transport: 'Automotor', // Valor pasivo para incidentes
                ageGroup: 'No Específicado', // Valor pasivo
                gender: 'No Específicado', // Valor pasivo
                arrest: 'No Aplica',
                domestic: 'No Aplica'
            };
        } else {
            return {
                ...base,
                transport: 'No Aplica',
                ageGroup: 'No Aplica',
                gender: 'No Aplica',
                arrest: d.arrest || 'No',
                domestic: d.domestic || 'Crimen Particular'
            };
        }
    });

    const ndx = crossfilter(normalizedData);
    
    const dims = {
        month: ndx.dimension(d => d.month),
        location: ndx.dimension(d => d.location),
        type: ndx.dimension(d => d.type),
        transport: ndx.dimension(d => d.transport),
        ageGroup: ndx.dimension(d => d.ageGroup),
        gender: ndx.dimension(d => d.gender),
        arrest: ndx.dimension(d => d.arrest),
        domestic: ndx.dimension(d => d.domestic)
    };

    const extractOptions = (dim, ignoreList = ['No Aplica', 'Desconocido', 'No Específicado', 'Otro']) => {
        return dim.group().all()
          .filter(g => g.value > 0 && !ignoreList.includes(g.key) && g.key !== null)
          .map(g => g.key)
          .sort();
    };

    setCf(ndx);
    setDimensions(dims);
    setFilterOptions({
        location: extractOptions(dims.location),
        type: extractOptions(dims.type),
        transport: extractOptions(dims.transport),
        ageGroup: extractOptions(dims.ageGroup),
        gender: extractOptions(dims.gender),
        arrest: extractOptions(dims.arrest),
        domestic: extractOptions(dims.domestic)
    });
    setFilteredData(ndx.allFiltered());
    setActiveFilters({});
    
    return () => {
        Object.values(dims).forEach(d => d.dispose());
        ndx.remove();
    };
  }, [isLoading, activeDataset, incidentsData, theftsData]);

  const filterByDimension = useCallback((dimName, val) => {
      const dim = dimensions[dimName];
      if (!dim || !cf) return;
      
      if (val === null || val === '') {
          dim.filterAll();
          setActiveFilters(prev => {
              const newFilters = { ...prev };
              delete newFilters[dimName];
              return newFilters;
          });
      } else {
          dim.filterExact(val);
          setActiveFilters(prev => ({ ...prev, [dimName]: val }));
      }
      setFilteredData(cf.allFiltered());
  }, [dimensions, cf]);

  const filterByMonth = useCallback((monthIndex) => { filterByDimension('month', monthIndex); }, [filterByDimension]);

  const clearFilters = useCallback(() => {
      if (!dimensions || !cf) return;
      Object.values(dimensions).forEach(d => d.filterAll());
      setActiveFilters({});
      setFilteredData(cf.allFiltered());
  }, [dimensions, cf]);

  const toggleYear = useCallback((year) => {
      setSelectedYears(prev => 
          prev.includes(year) && prev.length > 1 ? prev.filter(y => y !== year) : [...prev.filter(y => y !== year), year].sort((a,b)=>a-b)
      );
  }, []);

  const contextValue = useMemo(() => ({
      isLoading,
      activeDataset,
      setActiveDataset,
      selectedYears,
      availableYears,
      toggleYear,
      filteredData,
      filterByMonth,
      filterByDimension,
      activeFilters,
      filterOptions,
      clearFilters,
      incidentsData,
      theftsData,
      rawDatasetLength: activeDataset === 'incidents' ? incidentsData.length : theftsData.length
  }), [
      isLoading, activeDataset, selectedYears, availableYears, toggleYear, filteredData, activeFilters,
      filterOptions, incidentsData, theftsData, filterByMonth, filterByDimension, clearFilters
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
        {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
