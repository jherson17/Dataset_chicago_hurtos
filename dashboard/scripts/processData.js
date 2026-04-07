import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetsPath = '/Users/diegogarzon/Desktop/proyecto_Colombia5/Diego';
const outputPath = path.resolve(__dirname, '../public/data');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

function processCSV(inputFile, outputFile, isGeoJson = false, latCol = 'LAT', lonCol = 'LON') {
    const inputFilePath = path.join(datasetsPath, inputFile);
    console.log(`Processing ${inputFilePath}...`);
    
    if (!fs.existsSync(inputFilePath)) {
        console.error(`File not found: ${inputFilePath}`);
        return;
    }

    const fileStream = fs.createReadStream(inputFilePath, 'utf8');
    
    Papa.parse(fileStream, { 
        header: true, 
        skipEmptyLines: true,
        preview: 30000, // Limit to 30k records for performance
        complete: (parsed) => {
            if (isGeoJson) {
                const features = [];
                parsed.data.forEach((row, index) => {
                    const lat = parseFloat(row[latCol]);
                    const lon = parseFloat(row[lonCol]);
                    
                    if (!isNaN(lat) && !isNaN(lon)) {
                        features.push({
                            type: "Feature",
                            id: index,
                            geometry: {
                                type: "Point",
                                coordinates: [lon, lat] // GeoJSON uses [Longitude, Latitude]
                            },
                            properties: row
                        });
                    }
                });

                const geojson = {
                    type: "FeatureCollection",
                    features: features
                };
                fs.writeFileSync(path.join(outputPath, outputFile), JSON.stringify(geojson));
                console.log(`Created GeoJSON: ${outputFile} (${features.length} valid features)`);
            } else {
                fs.writeFileSync(path.join(outputPath, outputFile), JSON.stringify(parsed.data));
                console.log(`Created JSON: ${outputFile} (${parsed.data.length} records)`);
            }
        },
        error: (err) => {
            console.error(`Error parsing ${inputFile}:`, err);
        }
    });
}

console.log('Starting data processing...');

// Traffic Crashes mapping (Chicago) -> incidentes
processCSV('Traffic_Crashes_Cleaned.csv', 'incidentes.geojson', true, 'LATITUDE', 'LONGITUDE');

// Crime Data mapping (LA) -> hurtos
processCSV('Crime_Data_Cleaned.csv', 'hurtos.geojson', true, 'LAT', 'LON');

