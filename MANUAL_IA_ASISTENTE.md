# 🤖 Manual de Capacidades: M.I.A (Medellín Inteligente Assistant)

Este documento describe el funcionamiento y los alcances del motor de procesamiento de lenguaje natural (NLP-Lite) integrado de forma nativa en tu Dashboard de React.

## 🧠 Arquitectura de la IA (Offline-First)
A diferencia de sistemas como ChatGPT u otras APIs en la nube, M.I.A es un **Motor de Búsqueda Heurística Local** incrustado directamente en el componente `AIChatAssistant.jsx`.

**¿Qué ventajas ofrece esta arquitectura?**
- **Privacidad 100%:** Absolutamente nada de lo que escribe el usuario sale de su computadora hacia servidores externos.
- **Cero Costos:** No cobra por tokens ni requiere membresías de OpenAI u otros servicios corporativos.
- **Latencia Super-Rápida:** Lee instantáneamente los miles de registros de incidentes desde la memoria RAM del propio navegador.

---

## 📊 ¿Qué ofrece y de qué es capaz?

El motor es capaz de analizar cadenas de texto, identificar la **"Intención Central"** del ciudadano, aislar las **Entidades** (palabras clave relacionadas con transporte, fechas o crimen) y aplicar cálculos matemáticos al vuelo.

Actualmente domina 5 áreas de investigación de datos urbanos:

### 1. Índice Multidimensional de Calidad de Vida
Capaz de desglosar subcategorías sociales para recomendar o alertar sobre sectores de Medellín.
- **Soporta variables:** `educación`, `salud`, `vivienda`, `servicios públicos`, `entorno de desarrollo`.
- **Soporta polaridad:** Entiende si el usuario busca lo "mejor" o lo "peor" de la lista.
- **Prompts de Ejemplo:**
  - *"¿Cuál es la comuna con mejor educación?"*
  - *"¿Dónde hay peores servicios públicos y agua?"*
  - *"¿Qué barrio de la ciudad me recomiendas para ir a vivir?"*

### 2. Riesgo Vehicular y Perfil de Transporte
Una función avanzada que cruza las bases de datos de Hurtos con los Medios de Movilización.
- **Soporta transporte:** `taxi`, `bus`, `metro`, `moto`, `pie / caminando`.
- **Prompts de Ejemplo:**
  - *"¿Cuál es la peor zona para ir movilizándose en taxi?"*
  - *"¿Qué barrio tiene más asaltos a gente caminando a pie?"*
  - *"¿Dónde tengo que tener más cuidado si conduzco?"* (Redirige automáticamente a analizar choques vehiculares).

### 3. Frecuencia Temporal (Análisis de Meses)
Agrupa las líneas de tiempo para encontrar la Moda estadística (el pico más alto) de crímenes o choques en el año.
- **Prompts de Ejemplo:**
  - *"¿En qué mes ocurren más accidentes de tránsito?"*
  - *"¿Cuál es el mes históricamente más seguro o con menos robos?"*

### 4. Demografía y Víctimas
Cruza todo el árbol de incidentes para encontrar a las víctimas predominantes clasificándolas por género.
- **Prompts de Ejemplo:**
  - *"¿En accidentes y hurtos, las principales víctimas son hombres o mujeres?"*
  - *"¿A quién atracan más en la calle?"*

### 5. Tipos de Modalidad Delictiva
Recuento instantáneo de los modus-operandi de los infractores.
- **Prompts de Ejemplo:**
  - *"¿Cuál es la modalidad más común de robo en Medellín?"*
  - *"¿Cómo es que asaltan de forma más seguida?"*

---

> **💡 Nota Técnica de Escalabilidad:** Para expandir esta "API" interna y que responda nuevas dudas (por ejemplo, cruzar el tipo de arma o la edad de la víctima con el barrio), un desarrollador solo debe añadir un nuevo bloque genérico `regex` de reconocimiento dentro de la función `processQuery` localizada en el archivo de Chat en React. No se requiere retocar bases de datos relacionales reales.

---

## 💻 Stack Tecnológico (Data Science & Web App)

El desarrollo íntegro de **Medellín Inteligente**, incluyendo este asistente, su motor de pre-procesamiento de datos masivos y su interfaz Reactiva, fue ensamblado con un ecosistema orientado a alta eficiencia (Offline-First).

El *Core* principal se compone de:

### Motor de Procesamiento y Backend Estático (Node Ecosystem)
*   🟢 **Node.js (v20+):** Como pilar fundacional y runtime principal. Fue vital en los scripts de arquitectura analítica (`processData.js`), permitiéndonos usar el potente motor V8 para la ingesta, limpieza de nulos, normalización de campos, y conversión de los DataFrames brutos (archivos CSV corruptos) a un estado geoespacial inmaculado antes siquiera de montar la web.
*   🧩 **PapaParse & Csv-parser:** Entorno de *Data-Wrangling* del lado del servidor/pre-procesamiento para fragmentar y serializar más de 65,000 registros combinados transmutándolos de CSV a estructuras JSON (GeoJSON) perfectas consumibles por un navegador RAM.

### Frontend, Reactividad e Interfaz (Stack M.I.A)
*   ⚛️ **React 19:** Encargado del renderizado concurrente y arquitectónico de toda la aplicación. Todo funciona sobre Hooks (`useState`, `useMemo`, `useCallback`) bajo un ecosistema fuertemente desacoplado mediante el `DashboardContext`.
*   ⚡ **Vite 6:** Nuestra poderosa herramienta de compilación en caliente (*Hot Module Replacement*) que permite iteraciones de desarrollo en nanosegundos sin tener que regrabar el entorno.
*   🎨 **Tailwind CSS v4:** El ecosistema funcional visual que le da estilo Premium al dashboard. Los gradientes envolventes, utilidades como *glassmorphism* (`backdrop-blur`), z-index estructurados (`z-[9999]`), y hasta los estilos sofisticados del panel de mando se logran nativamente.
*   🧠 **Vanilla RegExp (NLP Engine):** El motor intelectual del Chat. Se evitó consumir costosas e inestables APIs externas (OpenAI o endpoints PHP lentos), basándose plenamente en matrices condicionales difusas para hacer "Fuzzy Matching" (entender la raíz de una palabra natural por expresiones regulares).
*   🗺️ **Leaflet + React-Leaflet:** La capa de mapeo satelital oscuro (CartoDB anidado), capaz de superponer con un cluster dinámico miles de burbujas en latitud/longitud reactiva.
*   📈 **Crossfilter2 & Recharts:** *Crossfilter2* indexa la Big Data en el frontend simulando una base de datos multidimensional (como un SQL interno de latencia ultra-baja). Si el ChatBot o el Panel detectan una interacción, *Recharts* se entera automáticamente para pintar diagramas radiales, SVG o un complejo Time-Series Chart sobre meses exactos.
*   🎭 **Lucide-React:** Para estandarizar en alta calidad vectorial las barras de iconos o *avatars* sin estresar la carga de la fuente Web.
