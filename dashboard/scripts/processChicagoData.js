import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crimesFile = path.resolve(__dirname, '../../Diego/chicago crimes.csv');
const crashesFile = path.resolve(__dirname, '../../Diego/Traffic_Crashes_Cleaned.csv');
const outputDir = path.resolve(__dirname, '../public/data');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Diccionarios de traducción
const dictionaries = {
    crimeTypes: {
        'THEFT': 'Robo',
        'BATTERY': 'Agresión',
        'CRIMINAL DAMAGE': 'Daño Criminal',
        'NARCOTICS': 'Narcóticos',
        'ASSAULT': 'Asalto',
        'ROBBERY': 'Atraco',
        'MOTOR VEHICLE THEFT': 'Robo de Vehículo',
        'BURGLARY': 'Allanamiento',
        'DECEPTIVE PRACTICE': 'Fraude',
        'WEAPONS VIOLATION': 'Infracción de Armas',
        'OFFENSE INVOLVING CHILDREN': 'Crimen Infantil',
        'HOMICIDE': 'Homicidio'
    },
    locations: {
        'STREET': 'Vía Pública',
        'RESIDENCE': 'Residencia',
        'APARTMENT': 'Apartamento',
        'SIDEWALK': 'Acera/Andén',
        'ALLEY': 'Callejón',
        'GAS STATION': 'Gasolinera',
        'RESTAURANT': 'Restaurante',
        'HOTEL/MOTEL': 'Hotel/Motel'
    },
    crashTypes: {
        'REAR END': 'Choque Trasero',
        'PARKED MOTOR VEHICLE': 'Vehículo Estacionado',
        'ANGLE': 'Impacto Angular',
        'TURNING': 'Giro Provocado',
        'PEDESTRIAN': 'Atropello Peatonal',
        'PEDALCYCLIST': 'Atropello Ciclista',
        'FIXED OBJECT': 'Objeto Fijo',
        'HEAD ON': 'Choque Frontal',
        'OTHER NONCOLLISION': 'Otra No-Colisión',
        'OTHER OBJECT': 'Otro Objeto',
        'OVERTURNED': 'Volcamiento',
        'SIDESWIPE OPPOSITE DIRECTION': 'Roce (Dir. Opuesta)',
        'SIDESWIPE SAME DIRECTION': 'Roce (Misma Dir.)',
        'TRAIN': 'Tren/Ferrocarril'
    }
};

const translate = (dict, key) => {
    if (!key) return null;
    const upper = key.toUpperCase().trim();
    if (dict[upper]) return dict[upper];
    return upper.charAt(0) + upper.slice(1).toLowerCase();
};

async function readCsvAndSave(filePath, parserFn, outputPrefix) {
    if (!fs.existsSync(filePath)) {
        console.error(`¡Falta el archivo ${filePath}! Saltando...`);
        return;
    }

    console.log(`\nComenzando procesamiento de ${outputPrefix}... esto puede tomar un tiempo.`);
    const yearlyData = {};
    let count = 0;

    return new Promise((resolve, reject) => {
        Papa.parse(fs.createReadStream(filePath), {
            header: true,
            skipEmptyLines: true,
            step: function (results) {
                const row = results.data;
                count++;
                if (count % 100000 === 0) process.stdout.write(`... leídas ${count} filas de ${outputPrefix} ...\r`);

                const dataPoint = parserFn(row);
                if (!dataPoint) return;

                const y = dataPoint.y;
                // Filtrar solo 2018-2024 para consistencia frontal y memoria
                if (isNaN(y) || y < 2018 || y > 2024) return;

                if (!yearlyData[y]) yearlyData[y] = [];
                yearlyData[y].push(dataPoint);
            },
            complete: function () {
                console.log(`\n[OK] Lectura finalizada. Procesadas ${count} filas.`);
                for (const y in yearlyData) {
                    const file = path.join(outputDir, `${outputPrefix}_${y}.json`);
                    fs.writeFileSync(file, JSON.stringify(yearlyData[y]));
                    console.log(`Guardado -> ${file} (${yearlyData[y].length} registros)`);
                    yearlyData[y] = null; // Liberar memoria
                }
                resolve();
            },
            error: function (err) {
                console.error('Error in Papa Parse:', err);
                reject(err);
            }
        });
    });
}

const parseCrashes = (row) => {
    const lat = parseFloat(row.LATITUDE);
    const lng = parseFloat(row.LONGITUDE);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

    const dateStr = row.CRASH_DATE;
    if (!dateStr) return null;
    
    let year;
    if (dateStr.includes('-')) year = parseInt(dateStr.split('-')[0]);
    else if (dateStr.includes('/')) year = parseInt(dateStr.split('/')[2].split(' ')[0]);

    if (isNaN(year)) return null;

    // Respetar las variables exactas esperadas por Incidentes
    // old dashboard mapped STREET_NAME -> location, FIRST_CRASH_TYPE -> type
    return {
        y: year,
        lat,
        lng,
        m: parseInt(dateStr.split(/[-/]/)[0]) - 1 || 0, // mes 0-11
        loc: row.STREET_NAME ? 'Calle ' + row.STREET_NAME.trim() : 'Desconocido',
        type: translate(dictionaries.crashTypes, row.FIRST_CRASH_TYPE) || 'Desconocido'
    };
};

const parseCrimes = (row) => {
    const lat = parseFloat(row.Latitude);
    const lng = parseFloat(row.Longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

    const yearStr = row.Year || (row.Date && row.Date.substring(6, 10));
    if (!yearStr) return null;

    const year = parseInt(yearStr);
    if (isNaN(year)) return null;

    // Variables esperadas en el Dashboard para Hurtos
    return {
        y: year,
        lat,
        lng,
        m: row.Date ? parseInt(row.Date.substring(0, 2)) - 1 : 0, 
        loc: translate(dictionaries.locations, row['Location Description']) || 'Otro', // Lugar del hecho
        type: translate(dictionaries.crimeTypes, row['Primary Type']) || 'Otro',
        arrest: row.Arrest === 'true' || row.Arrest === 'TRUE' ? 'Sí' : 'No',
        domestic: row.Domestic === 'true' || row.Domestic === 'TRUE' ? 'Violencia Intrafamiliar' : 'Crimen Particular',
        com: parseInt(row['Community Area']) || 0 // Comuna/Area
    };
};

async function main() {
    try {
        await readCsvAndSave(crashesFile, parseCrashes, 'crashes');
        await readCsvAndSave(crimesFile, parseCrimes, 'crimes');
        console.log('¡Pipeline completado con éxito!');
    } catch (e) {
        console.error('Error catastrófico:', e);
    }
}

main();
