# Reemplazo de Fuente de Datos: Migración a Crímenes y Accidentes de Chicago

El fin de este plan es adaptar el Dashboard web existente para procesar, visualizar y filtrar los datos de **Crímenes** (`chicago crimes.csv`) y de **Accidentes de Tránsito** (`Traffic_Crashes_Cleaned.csv`), abandonando formalmente la metadata y registros procedentes de Los Ángeles o modelos antiguos. Toda la interfaz y los datos procesados serán traducidos al **español** para los usuarios finales.

## Arquitectura de Carga Dinámica de Datos (Selector de Años)

Para no perder el valor analítico histórico de la inmensa cantidad de datos (evitando que el navegador colapse al cargar 400+ MB de golpe), implementaremos un **sistema de partición por años**:

1. **Preprocesamiento por Bloques:** El script aislará cada CSV y generará archivos estáticos anuales separados (Ej. `crimenes_2021.json`, `crimenes_2022.json`, `accidentes_2021.json`, etc.).
2. **Carga Bajo Demanda en la Interfaz:** El actual indicador en el encabezado de la web que dice visualmente *"Datos 2018 - 2019"* pasará a ser un **Filtro Maestro Multiselección de Años**. 
3. **Flujo de Usuario:** Cuando el usuario decida sumar años a su análisis (o seleccione un rango específico), el Dashboard descargará asíncronamente solo el archivo JSON correspondiente a ese año y lo inyectará en tiempo real en los mapas y gráficos, sin congelar la pantalla.

## Columnas Detectadas y Nuevos Filtros Propuestos (Español)

> [!IMPORTANT]
> **REGLA ESTRICTA DE FILTRADO:**
> Se propone incorporar nuevos descriptores sociodemográficos y operativos **EXCLUSIVAMENTE para la vista de Hurtos (Crímenes)**.
> **Los filtros actuales existentes para "Incidentes" (Accidentes de Tránsito) NO SE MODIFICARÁN** y su interfaz permanecerá intacta tal cual opera en el estado actual. Al cambiar entre las vistas mediante los botones (Incidentes/Hurtos), el sistema controlará qué conjunto de filtros se visualizan.

*(Filtros específicos a implementar SOLO para la base de datos de Hurtos/Crímenes):*

1. **Hubo Arresto (`Arrest`)**: Filtro binario para medir la tasa de efectividad policial en Chicago (*Sí hubo Arresto / No hubo Arresto*).
2. **Entorno Doméstico (`Domestic`)**: Discernir si el crimen corresponde a violencia intrafamiliar frente a incidentes en calle abierta (*Violencia Intrafamiliar / Crimen Particular*).
3. **Lugar de los Hechos (`Location Description`)**: Subdivisión arquitectónica o física. (Ej. *Residencia, Vía Pública, Acera/Andén, Callejón*).
4. **Área Geográfica / Comuna (`Community Area`)**: Segmentación territorial oficial que reemplaza a las comunas antiguas por las 77 áreas de Chicago.

*(Nota: Ciertas clasificaciones universales como el "Tipo/Modalidad del Suceso" se conectarán a sus respectivas bases de manera independiente).*

---

## User Review Required

> [!IMPORTANT]
> **Consolidación del Sistema de Fechas (Carga Diferida)**
> Con esta nueva arquitectura, cuando el usuario ingrese al Dashboard, solo cargará por defecto **un año base de información** (ejemplo: 2023) para que la página abra instantáneamente. Si el usuario quiere analizar más años históricos empalmados, simplemente hará clic en el "Selector de Años" del menú principal y marcará 2022, 2021, etc., lo que concatenará la información.
> 
> He decidido incluir de una vez a los **Accidentes de Tránsito de Chicago (Traffic Crashes)** para que el dashboard cubra tanto crímenes como seguridad vial de forma hiper-robusta. Ambos convivirán usando las mismas tácticas optimizadas.
> ¿Te parece perfecto este flujo donde el usuario elige el volumen de años bajo demanda?

---

## Proposed Changes

### 1. Sistema de Limpieza, Traducción y Partición (Data Wrangling)
#### [NEW] `scripts/processChicagoData.js`
- Script poderoso en NodeJS que leerá exhaustivamente `chicago crimes.csv` y `Traffic_Crashes_Cleaned.csv`.
- Filtrará latitudes/longitudes corruptas.
- Agrupará la información extrayendo el año exacto de cada fila y generará archivos como `public/data/crimes_2020.json`, `public/data/crashes_2020.json`.
- Aplicará un diccionario inteligente interno para traducir todos los descriptores (Inglés a Español).

### 2. Header y Estado Global del Dashboard
#### [MODIFY] `src/components/layout/Header.jsx` (o donde viva la insignia actual de fecha)
- Reemplazar la etiqueta estática de la barra superior *"Datos 2018 - 2019"* por un Dropdown / Modal selector de casillas de verificación (Checkboxes) listando los años disponibles descubiertos por la data.

#### [MODIFY] `src/context/DashboardContext.jsx`
- Modificar el sistema de `fetch` introduciendo una función que combine en tiempo de ejecución múltiples JSON (Ej. si se marcan 2021 y 2022, fetchamos 2 archivos y sumamos sus Dataframes al Crossfilter).
- Mostrar _Spinners_ (indicadores de carga) al despachar un año nuevo.

### 3. Ajuste de Filtros (Filter Panel y Mapa)
#### [MODIFY] `src/components/layout/FilterPanel.jsx`
- Ocultar/Mostrar condicionalmente los filtros si el usuario navega entre ambas bases.
- Para **Incidentes**: Renderizar de forma pasiva los mismos componentes Select HTML y filtros originales, sin alterar variables (se respetará 100% la UI/lógica original).
- Para **Hurtos (Crímenes)**: Inyectar los listados del dataset de Chicago construyendo dinámicamente Selects para: `¿Hubo Arresto?`, `Violencia Doméstica`, `Lugar de los Hechos`.

#### [MODIFY] `src/components/map/DashboardMap.jsx`
- Centrado del encuadre geográfico de la cámara en las coordenadas absolutas de Chicago `(41.8781, -87.6298)`.

#### [MODIFY] `src/components/chat/AIChatAssistant.jsx`
- Transición de identidad: El bot abandonará su rol de "IA Medellín Inteligente" para convertirse en la **"IA Chicago Inteligente"**.
- **Contexto Dimensional:** El bot leerá la data procesada en tiempo real. Esto significa que si el usuario elige el año "2023" en las opciones, el bot SOLO calculará sus respuestas analizando la data de 2023 del set activo (Hurtos o Incidentes).
- **Verificación de Inteligencia (Preguntas de Prueba):** El sistema NLP será programado para responder acertadamente a iteraciones de las siguientes preguntas de prueba:
  1. *"¿Cuántos registros (crímenes/incidentes) hay en los años que tengo seleccionados?"*
  2. *"¿Cuál es el tipo de suceso o modalidad más repetitiva en mi pantalla actual?"*
  3. *"¿En qué entorno o lugares se cometen más estos eventos según los años que veo?"*
  4. *(Para Crímenes)*: *"¿Cuál es la proporción o porcentaje de arrestos realizados en estos datos?"*

---

## Verification Plan

### Automated Tests
- Ejecutar el pipeline de datos `node scripts/processChicagoData.js` observando en consola la creación exitosa fragmentada por décadas/años y confirmación del diccionario al español.
- Prueba cruzada en memoria corriendo `npm run dev`.

### Manual Verification
- Cargar Localhost. Revisar que gráficamente se cargue solo el último año por defecto.
- Cliquear en la insignia de "Años" en la interfaz principal, activar un rango histórico amplio y presenciar visualmente cómo la gráfica de puntos en Leaflet estalla llenándose de histórico, comprobando la estabilidad del Framerate (FPS).
