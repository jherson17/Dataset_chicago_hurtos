/**
 * DashboardContext.jsx - Motor de Estado Global y Filtrado (El "Cerebro")
 * 
 * Este archivo utiliza el patrón Context API de React junto con la librería 'crossfilter2'
 * para manejar grandes volúmenes de datos espaciales y aplicar filtrado multidimensional ultrarrápido.
 * 
 * Flujo Principal (Clean Architecture):
 * 1. useEffect (Montaje): Descarga los archivos geojson procesados de forma asíncrona (Offline-first strategy).
 * 2. useEffect (Construcción): Cuando el usuario cambia entre 'incidentes' y 'hurtos', este bloque destruye 
 *    los índices en memoria viejos y construye nuevas "dimensiones" (mes, ubicación, género, etc.).
 * 3. Funciones Despachadoras: (filterByMonth, filterByDimension) están envueltas en `useCallback` 
 *    para evitar que React re-renderice la app entera innecesariamente cuando el usuario filtra rápido.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import crossfilter from 'crossfilter2';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [incidentsData, setIncidentsData] = useState([]);
  const [theftsData, setTheftsData] = useState([]);
  
  const [activeDataset, setActiveDataset] = useState('incidents'); // 'incidents' or 'thefts'
  
  // Crossfilter core state
  const [cf, setCf] = useState(null);
  const [dimensions, setDimensions] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [barrioToComunaMap, setBarrioToComunaMap] = useState({});

  // 1. Fetch raw data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inc, the] = await Promise.all([
          fetch('/data/incidentes.geojson').then(r => r.json()),
          fetch('/data/hurtos.geojson').then(r => r.json())
        ]);
        
        // Build Barrio -> Comuna dictionary safely
        const b2c = {};
        if (inc && inc.features) {
            inc.features.forEach(f => {
                const p = f.properties;
                // Since this is Chicago Data, we don't have Comuna, but we can map STREET_NAME to STREET_NAME
                if (p.STREET_NAME) {
                    b2c[p.STREET_NAME.trim()] = p.STREET_NAME.trim();
                }
            });
        }
        setBarrioToComunaMap(b2c);

        setIncidentsData(inc.features || []);
        setTheftsData(the.features || []);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error loading data Context:", err);
      }
    };
    fetchData();
  }, []);

  // 2. Initialize/Update Crossfilter when dataset changes
  useEffect(() => {
    if (!dataLoaded) return;
    
    const currentData = activeDataset === 'incidents' ? incidentsData : theftsData;
    
    const normalizedData = currentData.map(f => {
        const p = f.properties;
        let dateObj = null;
        let location = 'Desconocido';
        let type = 'Desconocido';
        let transport = 'No Aplica';
        let ageGroup = 'No Aplica';
        let gender = 'No Aplica';
        
        if (activeDataset === 'incidents') {
            // Chicago Traffic Crashes Data
            if (p.CRASH_DATE) {
                dateObj = new Date(p.CRASH_DATE); // YYYY-MM-DD HH:MM:SS
            }
            location = p.STREET_NAME || 'Desconocido';
            
            const rawType = p.FIRST_CRASH_TYPE || 'Desconocido';
            const translationMap = {
                'REAR END': 'Choque Trasero',
                'PARKED MOTOR VEHICLE': 'Vehículo Estacionado',
                'ANGLE': 'Choque en Ángulo',
                'TURNING': 'Giro',
                'SIDESWIPE SAME DIRECTION': 'Roce Lateral',
                'SIDESWIPE OPPOSITE DIRECTION': 'Roce Frontal/Lateral',
                'PEDESTRIAN': 'Atropello Peatón',
                'PEDALCYCLIST': 'Atropello Ciclista',
                'FIXED OBJECT': 'Choque Objeto Fijo'
            };
            type = translationMap[rawType] || rawType;
            transport = 'Automotor';
        } else {
            // LA Crime Data
            if (p['DATE OCC']) {
                // If it's just '2020-03-01' without time, we parse it directly
                // Sometimes it has time in 'TIME OCC'. Let's just use DATE OCC for the day.
                dateObj = new Date(p['DATE OCC']);
            }
            location = p['AREA NAME'] || 'Desconocido';
            
            const rawType = p['Crm Cd Desc'] || 'Desconocido';
            if (rawType.includes('STOLEN')) type = 'Robo/Hurto';
            else if (rawType.includes('BURGLARY')) type = 'Asalto a Propiedad';
            else if (rawType.includes('ASSAULT') || rawType.includes('BATTERY')) type = 'Agresión Física';
            else if (rawType.includes('ROBBERY')) type = 'Robo Violento';
            else type = 'Otro Crimen';

            transport = p['Premis Desc'] || 'Desconocido'; // Using premise as transport/location modifier
            
            const rawSex = p['Vict Sex'];
            if (rawSex === 'M') gender = 'Masculino';
            else if (rawSex === 'F') gender = 'Femenino';
            else gender = 'Desconocido/Otro';
            
            const edad = parseInt(p['Vict Age']);
            if (!isNaN(edad) && edad > 0) {
                if (edad < 18) ageGroup = '0-17 años';
                else if (edad < 30) ageGroup = '18-29 años';
                else if (edad < 50) ageGroup = '30-49 años';
                else ageGroup = '50+ años';
            } else {
                ageGroup = 'Sin dato';
            }
        }
        
        return {
            ...f,
            normalizedDate: dateObj,
            month: (dateObj && !isNaN(dateObj)) ? dateObj.getMonth() : null, // 0-11
            location,
            type,
            transport,
            ageGroup,
            gender
        };
    }).filter(d => d.normalizedDate && !isNaN(d.normalizedDate));

    // Setup Crossfilter
    const ndx = crossfilter(normalizedData);
    
    const dims = {
        month: ndx.dimension(d => d.month),
        location: ndx.dimension(d => d.location),
        type: ndx.dimension(d => d.type),
        transport: ndx.dimension(d => d.transport),
        ageGroup: ndx.dimension(d => d.ageGroup),
        gender: ndx.dimension(d => d.gender)
    };

    // Calculate unique options for UI Dropdowns
    const extractOptions = (dim, ignoreList = ['No Aplica', 'Desconocido', 'Sin dato']) => {
        return dim.group().all()
          .filter(g => g.value > 0 && !ignoreList.includes(g.key) && g.key !== null)
          .map(g => g.key)
          .sort();
    };

    const newOptions = {
        location: extractOptions(dims.location),
        type: extractOptions(dims.type),
        transport: extractOptions(dims.transport),
        ageGroup: extractOptions(dims.ageGroup),
        gender: extractOptions(dims.gender)
    };

    setCf(ndx);
    setDimensions(dims);
    setFilterOptions(newOptions);
    setFilteredData(ndx.allFiltered());
    setActiveFilters({});
    
    return () => {
        // Cleanup memory when dataset switches
        Object.values(dims).forEach(d => d.dispose());
        ndx.remove();
    };
  }, [dataLoaded, activeDataset, incidentsData, theftsData]);

  // 3. Filter actions (Wrapped in useCallback to prevent child re-renders)
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

  const filterByMonth = useCallback((monthIndex) => {
      filterByDimension('month', monthIndex);
  }, [filterByDimension]);

  const clearFilters = useCallback(() => {
      if (!dimensions || !cf) return;
      Object.values(dimensions).forEach(d => d.filterAll());
      setActiveFilters({});
      setFilteredData(cf.allFiltered());
  }, [dimensions, cf]);

  // 4. Context Value Memoization
  const contextValue = useMemo(() => ({
      dataLoaded,
      activeDataset,
      setActiveDataset,
      filteredData,
      filterByMonth,
      filterByDimension,
      activeFilters,
      filterOptions,
      clearFilters,
      barrioToComunaMap,
      incidentsData,
      theftsData,
      rawDatasetLength: activeDataset === 'incidents' ? incidentsData.length : theftsData.length
  }), [
      dataLoaded, activeDataset, filteredData, activeFilters,
      filterOptions, barrioToComunaMap, incidentsData, theftsData,
      filterByMonth, filterByDimension, clearFilters
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
        {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
