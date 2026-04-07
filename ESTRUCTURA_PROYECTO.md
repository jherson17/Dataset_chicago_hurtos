# 📂 Estructura del Proyecto: Medellín Inteligente

Este documento detalla la arquitectura de carpetas y archivos del sistema, separando claramente los componentes de procesamiento de datos en Python/Node de la aplicación visual interactiva en React.

```text
proyecto colombia5.0/
│
├── SRS_Medellin_Inteligente_v1.md       # Especificación de Requerimientos del Sistema (documento inicial)
│
├── datasets/                            # 🗄️ Datos brutos (Raw Data) descargados y pre-procesados en local
│   ├── incidentes_2019_limpio.csv       # Dataset original de incidentes viales cruzados
│   ├── hurtos_2019_limpio.csv           # Dataset original de hurtos registrados
│   ├── victimas_2019_muestra_limpia.csv # Datos demográficos crudos
│   └── calidad_vida_2018_limpio.csv     # Índices multidimensionales por comuna crudos
│
└── dashboard/                           # 🚀 Aplicación React (El Dashboard Visual)
    │
    ├── package.json                     # Listado de librerías instaladas (React, Leaflet, Recharts)
    ├── vite.config.js                   # Configuración del servidor de desarrollo Vite
    ├── postcss.config.js                # Configuración para el motor de TailwindCSS
    ├── index.html                       # Página base de renderizado para el navegador
    │
    ├── scripts/                         # ⚙️ Scripts Locales de Transformación de Datos (ETL)
    │   └── processData.js               # Script en Node.js que devora los CSVs pesados y los 
    │                                    # exporta como GeoJSON optimizados para mapas.
    │
    ├── public/                          # 📦 Archivos estáticos accesibles públicamente
    │   └── data/                        # JSONs ligeros generados por processData.js 
    │       ├── incidentes.geojson       # Contiene coordenadas puras de accidentes
    │       ├── hurtos.geojson           # Contiene modalidades y coordenadas de hurtos
    │       ├── victimas.json            # Array agrupado por género/edad
    │       └── calidad_vida.json        # Array pre-calculado de Comunas
    │
    └── src/                             # 💻 Código Fuente de la Interfaz Web React
        │
        ├── main.jsx                     # Punto de entrada de React (Inicia la app).
        ├── App.jsx                      # Componente Orquestador. Maneja navegación y Tarjetas KPIs.
        ├── index.css                    # Estilos Universales (Colores oscuros y utilidades CSS puras).
        │
        ├── context/                     # 🧠 'El Cerebro' / Motor Lógico
        │   └── DashboardContext.jsx     # Lee los GeoJSON, inicializa el motor 'crossfilter2' y 
        │                                # exporta los datos filtrados globalmente para los demás componentes.
        │
        └── components/                  # 🧩 Fichas visuales modulares ("Archivos Tontos")
            │
            ├── layout/                  # Maqueta Visual
            │   ├── Layout.jsx           # Contenedor Grid css (Barra lateral + Contenido derecho)
            │   ├── Sidebar.jsx          # Menú izquierdo con iconos
            │   ├── Topbar.jsx           # Barra superior con fecha simulada
            │   └── FilterPanel.jsx      # UI Inteligente: Dibuja los selects/dropdowns de datos.
            │
            ├── map/                     # Geografía Dinámica
            │   └── DashboardMap.jsx     # Motor geolocalizado Leaflet. Dibuja los puntos amarillos y violetas.
            │
            └── charts/                  # Gráficos Analíticos
                ├── TimelineChart.jsx    # Dibuja la montaña del tiempo (reacciona a clics de meses).
                ├── DemographicsChart.jsx# Dibuja barras moradas y verdes (género y edades).
                └── QualityOfLifeChart.jsx# Hexágono de telaraña matemática. Reacciona a Barrios.
```

### 💡 Arquitectura Explicada:
El sistema sigue un patrón de **"Flujo de Datos Unidireccional"**:
1. Empieza en la carpeta `datasets/` (archivos inmensos).
2. Se procesan usando `scripts/processData.js` generándolos más delgados dentro de `public/data/`.
3. El archivo `context/DashboardContext.jsx` lee esos datos pulidos hacia la memoria RAM usando "Crossfilter".
4. Finalmente, los archivos dentro de `components/` solo se encargan de **dibujar** esa memoria RAM en colores bonitos (gráficos y mapas), sin hacer peticiones externas.
