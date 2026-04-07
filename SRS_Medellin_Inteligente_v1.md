**RETO COLOMBIA 5.0**

**MEDELLÍN INTELIGENTE**

Dashboard de Resiliencia Urbana

**Documento de Especificación de Requerimientos de Software**

SRS --- Versión 1.0

  ---------------------------- ------------------------------------------
  **Versión**                  1.0 --- Borrador Inicial

  **Fecha**                    Marzo 2025

  **Cliente**                  Reto Colombia 5.0

  **Clasificación**            Uso Público --- Datos Abiertos Alcaldía de
                               Medellín
  ---------------------------- ------------------------------------------

**1. Introducción**

**1.1 Propósito del Documento**

Este documento define los Requerimientos de Software (SRS) del sistema
\'Medellín Inteligente: Dashboard de Resiliencia Urbana\', desarrollado
en el marco del Reto Colombia 5.0. Su función es establecer con
precisión técnica y funcional las capacidades, restricciones y
comportamientos esperados del sistema, sirviendo como contrato de
entendimiento entre los stakeholders ciudadanos, los líderes
comunitarios y el equipo de desarrollo.

**1.2 Definición del Problema: La Fragmentación de Datos Urbanos**

Medellín genera diariamente cientos de eventos de seguridad, movilidad y
calidad de vida que son capturados por entidades distritales y
almacenados en repositorios públicos. Sin embargo, esta riqueza de datos
permanece invisible para los actores que más la necesitan: los
ciudadanos de a pie y los líderes de las Juntas de Acción Comunal (JAC).

La fragmentación actual se manifiesta en tres dimensiones críticas:

-   Acceso técnico restringido: Los datasets de la Alcaldía están
    disponibles en formatos CSV especializados que requieren
    herramientas de análisis avanzadas, inaccesibles para la mayoría de
    líderes comunitarios.

-   Aislamiento temático: Los datos de incidentes viales, hurtos y
    calidad de vida existen en silos separados, imposibilitando análisis
    de correlación entre seguridad, movilidad y bienestar.

-   Ausencia de geolocalización contextual: Los eventos están
    georeferenciados pero no hay interfaces que los proyecten sobre el
    territorio comunal de forma intuitiva y accionable.

+-----------------------------------------------------------------------+
| **Impacto Cuantificable del Problema**                                |
|                                                                       |
| Con 1.000 registros de hurtos en transporte público, 1.000 incidentes |
| viales y perfiles demográficos de 1.000 víctimas, más indicadores de  |
| 16 comunas urbanas, el sistema tiene capacidad para revelar patrones  |
| ocultos que ningún ciudadano puede detectar manualmente. La distancia |
| entre el dato disponible y la decisión informada es precisamente el   |
| problema que este dashboard resuelve.                                 |
+-----------------------------------------------------------------------+

**1.3 Visión del Sistema: Empoderamiento Ciudadano y JAC**

El Dashboard de Resiliencia Urbana transforma los datos abiertos en
inteligencia territorial accionable. Sus dos audiencias principales se
benefician de formas complementarias:

**Para el Ciudadano Común**

-   Conocer los puntos de mayor riesgo de hurto en su ruta cotidiana en
    transporte público.

-   Identificar los horarios y modalidades de robo más frecuentes en su
    comuna.

-   Comparar la calidad de vida de su comunidad frente a otras en
    indicadores objetivos.

-   Tomar decisiones informadas sobre rutas y medios de transporte.

**Para Líderes de JAC y Tomadores de Decisiones**

-   Sustentar peticiones ante la Alcaldía con evidencia geoespacial y
    estadística robusta.

-   Priorizar intervenciones comunitarias en zonas de alta
    vulnerabilidad vial o delictiva.

-   Cruzar indicadores del Índice Multidimensional de Calidad de Vida
    (IMCV) con eventos de inseguridad para propuestas de política
    pública.

-   Monitorear la distribución demográfica de víctimas para diseñar
    programas focalizados por edad y género.

**1.4 Alcance del Proyecto**

El sistema procesa exclusivamente datos estáticos de la Alcaldía de
Medellín correspondientes al año 2019 (movilidad/seguridad) y 2018
(calidad de vida), entregados como archivos locales. No contempla
integración con APIs en tiempo real en la versión inicial, garantizando
un despliegue rápido, seguro y sin dependencias externas.

**1.5 Definiciones y Acrónimos**

  ------------- ---------------------------------------------------------
  **Término**   **Definición**

  SRS           Software Requirements Specification --- Especificación de
                Requerimientos de Software

  JAC           Junta de Acción Comunal --- organismo cívico de
                participación ciudadana en Colombia

  IMCV          Índice Multidimensional de Calidad de Vida --- indicador
                compuesto por dimensiones de bienestar por comuna

  RF            Requerimiento Funcional --- capacidad observable del
                sistema desde la perspectiva del usuario

  RNF           Requerimiento No Funcional --- atributo de calidad del
                sistema (rendimiento, usabilidad, seguridad)

  MERN          Stack tecnológico: MongoDB, Express.js, React, Node.js

  GeoJSON       Formato estándar para representar estructuras geográficas
                en JSON

  KDE           Kernel Density Estimation --- técnica de mapa de calor
                para visualizar concentración de eventos

  Comuna        División administrativa de Medellín. La ciudad tiene 16
                comunas urbanas y 5 corregimientos rurales
  ------------- ---------------------------------------------------------

**2. Alcance del Sistema**

**2.1 Descripción General**

Medellín Inteligente es una aplicación web de página única (SPA)
construida sobre el stack MERN. Opera en modo offline-first: todos los
datos son preprocesados al momento del build y entregados como archivos
GeoJSON y JSON estáticos. Esto garantiza tiempos de carga inferiores a
200ms y elimina la dependencia de APIs externas en tiempo de ejecución.

**2.2 Arquitectura de Procesamiento de Datos Locales**

El pipeline de datos se ejecuta una sola vez, durante la fase de
preparación del build:

  ----------------- ------------------- -------------------- -----------------------
  **Fase**          **Proceso**         **Entrada**          **Salida**

  1 --- Ingesta     Lectura y           4 archivos CSV       DataFrames limpios en
                    validación de CSVs  fuente               memoria

  2 ---             Geocodificación +   Lat/Long de cada     Campo \'comuna_id\'
  Enriquecimiento   asignación de       evento               normalizado
                    comuna por                               
                    coordenada                               

  3 --- Agregación  Cómputo de KPIs por Registros            Tablas de frecuencia y
                    comuna, hora y      individuales         promedios
                    modalidad                                

  4 ---             Exportación a       Estructuras          Archivos .json en
  Serialización     GeoJSON y JSON      procesadas           /public/data/
                    comprimido                               

  5 --- Bundling    Webpack/Vite        Archivos             Bundle React optimizado
                    incluye archivos    /public/data/        
                    estáticos en el                          
                    bundle                                   
  ----------------- ------------------- -------------------- -----------------------

+-----------------------------------------------------------------------+
| **Ventaja Clave del Procesamiento Local**                             |
|                                                                       |
| Al no depender de APIs externas en runtime, el sistema funciona con   |
| conexión a internet limitada --- condición frecuente en dispositivos  |
| móviles de líderes comunitarios en algunas comunas de Medellín.       |
| Además, los datos ciudadanos nunca salen del dispositivo,             |
| garantizando privacidad por diseño.                                   |
+-----------------------------------------------------------------------+

**2.3 Datasets Incluidos en el Alcance**

  ---------------- ---------------------------------- --------------- ------------ -------------
  **Dataset**      **Archivo**                        **Registros**   **Pillar**   **Cobertura
                                                                                   Temporal**

  Incidentes de    incidentes_2019_limpio.csv         1.000           Movilidad    Año 2019
  Tráfico                                                                          

  Víctimas de      victimas_2019_muestra_limpia.csv   1.000           Movilidad /  Año 2019
  Incidentes                                                          Demografía   

  Hurtos en        hurtos_2019_limpio.csv             1.000           Seguridad    Año 2019
  Transporte                                                                       
  Público                                                                          

  Calidad de Vida  calidad_vida_2018_limpio.csv       16              Contextual / Año 2018
  por Comuna                                                          IMCV         
  ---------------- ---------------------------------- --------------- ------------ -------------

**2.4 Fuera del Alcance (v1.0)**

-   Integración en tiempo real con APIs de Metrópolis, Metro de Medellín
    o Policía Nacional.

-   Autenticación de usuarios y perfiles personalizados.

-   Ingesta de datos de años posteriores a 2019 (funcionalidad prevista
    para v2.0).

-   Módulo de reportes ciudadanos o contenido generado por usuarios.

-   Versión nativa para iOS/Android (la PWA cubre esta necesidad en
    v1.0).

**3. Requerimientos Funcionales**

Los requerimientos funcionales describen el comportamiento observable
del sistema desde la perspectiva de sus usuarios. Cada RF incluye
descripción, entradas, salidas y prioridad de implementación.

**3.1 Mapa Interactivo y Visualización Geoespacial**

  ----------------- ------------------------------------------------------------
  **RF01 ---        
  Visualización     
  Geoespacial con   
  Capas             
  Conmutables**     

  **Descripción**   El sistema desplegará un mapa base de Medellín
                    (OpenStreetMap/Mapbox GL JS) sobre el que el usuario puede
                    activar o desactivar capas de datos independientes: capa de
                    incidentes viales, capa de hurtos en transporte y capa de
                    polígonos de comunas con indicadores IMCV. Los marcadores de
                    eventos soportan clustering automático a niveles de zoom
                    reducido y se expanden al acercar la vista.

  **Entradas**      Archivos GeoJSON preprocesados desde
                    incidentes_2019_limpio.csv y hurtos_2019_limpio.csv.
                    Polígonos GeoJSON de comunas de Medellín (incluidos en el
                    bundle).

  **Salidas**       Mapa interactivo con marcadores coloreados por tipo de
                    evento (naranja: hurto, rojo: incidente vial). Panel lateral
                    con toggle switches para cada capa. Popups informativos al
                    hacer clic en un marcador con: fecha, barrio, tipo de evento
                    y gravedad.

  **Prioridad**     Alta
  ----------------- ------------------------------------------------------------

**3.1.1 Comportamiento de Capas**

-   Capa Incidentes Viales: Muestra puntos para cada uno de los 1.000
    registros de choques y atropellos, diferenciados por clase de
    accidente (choque, atropello, volcamiento) y gravedad (con heridos,
    solo daños, con muertos).

-   Capa Hurtos: Muestra puntos para los 1.000 registros de robo en
    transporte público, diferenciados por medio de transporte (Metro,
    Bus, Autobús).

-   Capa Comunas: Polígonos semitransparentes coloreados por el índice
    Calidad_Vida_Total del IMCV 2018 (escala cromática continua del rojo
    al verde).

-   Mapa de Calor (KDE): Capa opcional que muestra la densidad de
    eventos combinados como heatmap de gradiente.

**3.2 Análisis Demográfico de Víctimas**

  ----------------- ------------------------------------------------------------
  **RF02 ---        
  Análisis          
  Demográfico por   
  Edad y Sexo**     

  **Descripción**   El módulo de análisis demográfico provee visualizaciones
                    interactivas del perfil de las víctimas de incidentes viales
                    registradas en victimas_2019_muestra_limpia.csv. Los
                    gráficos responden a filtros cruzados aplicados desde el
                    mapa o desde los controles del panel.

  **Entradas**      Dataset victimas_2019_muestra_limpia.csv con campos:
                    Fecha_incidente, Comuna, Barrio, Clase_incidente, Condicion
                    (peatón, conductor, pasajero, motociclista), Sexo (M/F),
                    Edad, Latitud, Longitud.

  **Salidas**       Gráfico de pirámide poblacional de víctimas por edad y sexo.
                    Gráfico de dona con distribución por condición (peatón,
                    motociclista, conductor). Gráfico de barras con frecuencia
                    de incidentes por comuna. Tarjetas KPI: total víctimas,
                    promedio de edad, % mujeres víctimas.

  **Prioridad**     Alta
  ----------------- ------------------------------------------------------------

**3.2.1 Controles de Filtro Demográfico**

-   Filtro por rango etario: Slider doble para seleccionar rango de edad
    (0-100 años).

-   Filtro por sexo: Checkboxes Masculino / Femenino / Ambos.

-   Filtro por condición: Dropdown multi-selección con opciones del
    campo Condicion.

-   Filtro por clase de incidente: Checkboxes para Atropello, Choque,
    Otro.

**3.3 Ficha Técnica de Comuna**

  ----------------- ------------------------------------------------------------
  **RF03 --- Panel  
  de Ficha Técnica  
  por Comuna (IMCV  
  2018)**           

  **Descripción**   Al seleccionar una comuna en el mapa o en el selector
                    desplegable, el sistema desplegará un panel lateral con la
                    ficha completa de indicadores del Índice Multidimensional de
                    Calidad de Vida (IMCV) 2018, junto con un resumen
                    estadístico de eventos de seguridad y movilidad para esa
                    unidad territorial.

  **Entradas**      Dataset calidad_vida_2018_limpio.csv con campos: Comuna,
                    Indice_Ambiente, Indice_Movilidad, Indice_Seguridad,
                    Calidad_Vida_Total. Datos filtrados de incidentes y hurtos
                    para la comuna seleccionada.

  **Salidas**       Panel deslizable con gráfico radial (spider chart) de los 4
                    índices IMCV. Posición del ranking de la comuna respecto a
                    las 16 comunas urbanas en cada índice. Totales de incidentes
                    viales y hurtos registrados en 2019 para la comuna.
                    Comparativo con el promedio de todas las comunas.

  **Prioridad**     Alta
  ----------------- ------------------------------------------------------------

**3.3.1 Indicadores IMCV Visualizados**

  -------------------- ------------------ ----------------------------------
  **Campo CSV**        **Etiqueta en UI** **Descripción**

  Indice_Ambiente      Medio Ambiente     Calidad del entorno ambiental:
                                          zonas verdes, contaminación,
                                          gestión de residuos

  Indice_Movilidad     Movilidad          Accesibilidad, infraestructura
                                          vial y conectividad de transporte
                                          público

  Indice_Seguridad     Seguridad          Percepción y realidad de seguridad
                                          ciudadana en el territorio

  Calidad_Vida_Total   Calidad de Vida    Índice compuesto que integra todas
                       Total              las dimensiones del bienestar
  -------------------- ------------------ ----------------------------------

**3.4 Filtros Cruzados**

  ---------------------- ------------------------------------------------------------
  **RF04 --- Sistema de  
  Filtros Cruzados       
  Multidimensionales**   

  **Descripción**        El sistema implementará un motor de filtros cruzados
                         (crossfilter) que permite al usuario aplicar simultáneamente
                         filtros sobre múltiples dimensiones de los datos. Cualquier
                         filtro aplicado en un panel actualiza en cascada todos los
                         demás gráficos y el mapa de forma instantánea, sin recarga
                         de página.

  **Entradas**           Selecciones del usuario en controles de: modalidad de robo
                         (Cosquilleo, Atraco, etc.), medio de transporte (Metro, Bus,
                         Autobús, Taxi), tipo de arma/medio, bien robado, clase de
                         accidente, gravedad, rango de fechas.

  **Salidas**            Actualización sincrónica de: mapa (marcadores filtrados),
                         gráficos demográficos, tarjetas KPI, ficha de comuna.
                         Indicador visual del número de registros activos tras
                         aplicar filtros. Botón \'Restablecer todos los filtros\'.

  **Prioridad**          Alta
  ---------------------- ------------------------------------------------------------

**3.4.1 Dimensiones de Filtro Disponibles**

  ------------------ ---------------------------------- ------------------ ----------------
  **Dimensión**      **Dataset**                        **Valores          **Tipo de
                                                        Ejemplo**          Control**

  Modalidad de hurto hurtos_2019_limpio.csv             Cosquilleo, Atraco Checkbox
                                                        directo, Descuido  multi-select

  Medio de           hurtos_2019_limpio.csv             Metro, Bus,        Tabs / Toggle
  transporte                                            Autobus, Taxi      buttons

  Arma o medio       hurtos_2019_limpio.csv             No, Arma blanca,   Dropdown
                                                        Intimidación       multi-select

  Bien robado        hurtos_2019_limpio.csv             Celular, Cartera,  Checkbox
                                                        Cédula, Dinero     multi-select

  Clase de accidente incidentes_2019_limpio.csv         Choque, Atropello, Checkbox
                                                        Volcamiento        multi-select

  Gravedad del       incidentes_2019_limpio.csv         Con heridos, Solo  Dropdown
  accidente                                             daños, Con muertos single-select

  Rango de fechas    Todos los datasets                 Enero--Diciembre   Date range
                                                        2019               slider

  Condición de       victimas_2019_muestra_limpia.csv   Peatón,            Checkbox
  víctima                                               Motociclista,      multi-select
                                                        Conductor          
  ------------------ ---------------------------------- ------------------ ----------------

**3.5 Requerimientos Funcionales Adicionales**

**RF05 --- Dashboard de KPIs Ejecutivos**

La pantalla principal mostrará un panel de métricas clave (KPI cards)
con los totales agregados de todo el dataset: total hurtos 2019, total
incidentes viales 2019, total víctimas registradas, comuna con mayor
índice de calidad de vida, y comuna con mayor concentración de hurtos.
Las tarjetas incluirán comparativos y tendencias visuales.

**RF06 --- Visualización Temporal**

Un gráfico de línea de tiempo mostrará la distribución mensual y horaria
de hurtos e incidentes a lo largo de 2019. Permitirá identificar picos
estacionales y franjas horarias de mayor riesgo. El usuario podrá
seleccionar un rango temporal en el gráfico para filtrar todos los demás
componentes.

**RF07 --- Exportación de Datos Filtrados**

El usuario podrá exportar la selección activa de datos (tras aplicar
filtros) en formato CSV, para uso en herramientas externas o
presentaciones ante organismos de gobierno. La exportación incluirá
todos los campos del dataset original correspondiente.

**4. Requerimientos No Funcionales**

Los requerimientos no funcionales definen los atributos de calidad del
sistema. Son tan críticos como los funcionales: un dashboard lento, no
accesible en móvil o difícil de usar no cumple su propósito social.

**4.1 Rendimiento**

  --------- ---------------- --------------------------- -------------------------
  **RNF**   **Atributo**     **Criterio de Aceptación**  **Métrica de
                                                         Verificación**

  RNF-01    Tiempo de carga  Carga completa del          Lighthouse Performance
            inicial          dashboard en \< 3 segundos  Score \> 85
                             en 3G                       

  RNF-02    Carga de JSON    Parsing e hidratación de    Performance API:
            locales          todos los datasets en \<    measure(\'data-load\')
                             200ms                       

  RNF-03    Respuesta a      Actualización de todos los  React Profiler --- render
            filtros          gráficos tras un filtro en  time
                             \< 100ms                    

  RNF-04    Rendering del    Renderizado de 1.000        Map \'load\' event
            mapa             marcadores en \< 500ms al   timestamp
                             cargar capa                 

  RNF-05    Bundle size      Bundle JavaScript principal webpack-bundle-analyzer
                             \< 500KB gzipped            
  --------- ---------------- --------------------------- -------------------------

+-----------------------------------------------------------------------+
| **Estrategia de Optimización de Rendimiento**                         |
|                                                                       |
| Para garantizar los tiempos de carga definidos se aplicarán: (1) Code |
| splitting por ruta con React.lazy y Suspense; (2) Web Workers para    |
| procesamiento crossfilter fuera del hilo principal; (3) Canvas        |
| rendering para marcadores del mapa en lugar de SVG DOM cuando el      |
| conteo supere 500; (4) Memoization de componentes con React.memo y    |
| useMemo para evitar re-renders innecesarios.                          |
+-----------------------------------------------------------------------+

**4.2 Usabilidad y Accesibilidad**

  --------- ---------------------- ----------------------------------------------
  **RNF**   **Atributo**           **Criterio de Aceptación**

  RNF-06    Diseño Responsive      Layout funcional en viewports desde 360px
                                   (móvil) hasta 1920px (desktop). Breakpoints:
                                   sm(640px), md(768px), lg(1024px), xl(1280px)
                                   con Tailwind CSS.

  RNF-07    Orientación móvil      Todos los gráficos se reconfiguran en
                                   orientación vertical en pantallas \< 768px. El
                                   mapa ocupa el 100% del ancho en móvil con
                                   panel deslizable desde abajo.

  RNF-08    Accesibilidad WCAG 2.1 Contraste mínimo 4.5:1 para texto sobre fondo.
            AA                     Todos los controles interactivos accesibles
                                   por teclado. Etiquetas ARIA en todos los
                                   gráficos.

  RNF-09    Internacionalización   Toda la interfaz en español colombiano.
                                   Separador decimal: coma. Formato de fecha:
                                   DD/MM/AAAA.

  RNF-10    Onboarding             Tour guiado de 3 pasos al primer acceso
                                   explicando las tres capas del mapa y el
                                   sistema de filtros.
  --------- ---------------------- ----------------------------------------------

**4.3 Arquitectura y Stack Tecnológico**

El sistema se construye sobre el stack MERN con las siguientes
especificaciones técnicas:

  ---------------- ---------------- ------------- -------------------------------
  **Componente**   **Tecnología**   **Versión**   **Justificación**

  Runtime Backend  Node.js          20 LTS        Entorno de ejecución para
                                                  scripts de preprocesamiento de
                                                  datos CSV → JSON

  Framework        Express.js       4.x           Servidor de desarrollo y
  Backend                                         endpoint de configuración.
                                                  Mínimo en producción dado el
                                                  enfoque estático

  Framework        React            18.x          Arquitectura de componentes
  Frontend                                        para UI interactiva. Concurrent
                                                  Mode para rendering no
                                                  bloqueante

  Estilos          Tailwind CSS     3.x           Utility-first CSS optimizado
                                                  para responsive. Tree-shaking
                                                  elimina clases no usadas

  Mapa Interactivo Mapbox GL JS /   2.x / 1.9     Rendering WebGL de tiles y
                   Leaflet                        marcadores. Leaflet como
                                                  fallback sin token

  Gráficos         Recharts + D3.js 2.x / 7.x     Recharts para gráficos
                                                  declarativos en React. D3 para
                                                  visualizaciones custom (spider
                                                  chart)

  Filtros Cruzados crossfilter2     1.5.x         Filtrado multidimensional en
                                                  memoria con complejidad O(n)
                                                  amortizada

  Base de Datos    MongoDB (dev)    7.x           Almacenamiento de sesiones y
                                                  caché en desarrollo. Producción
                                                  usa JSON estáticos

  Build Tool       Vite             5.x           HMR ultrarrápido. Bundle
                                                  optimizado con Rollup

  Testing          Jest + RTL       29.x / 14.x   Unit e integration testing para
                                                  componentes React y funciones
                                                  de transformación
  ---------------- ---------------- ------------- -------------------------------

**4.4 Seguridad**

-   Todos los datos son locales y estáticos: no existe transmisión de
    datos de usuario a servidores externos.

-   Sin almacenamiento de información personal identificable (PII) de
    los usuarios del dashboard.

-   Content Security Policy (CSP) configurado para prevenir XSS. Todos
    los tiles del mapa se sirven sobre HTTPS.

-   Los datos de víctimas son agregados y anonimizados: no existe
    información que permita re-identificar a individuos específicos.

**4.5 Mantenibilidad y Escalabilidad**

-   Arquitectura de componentes con separación clara entre UI, lógica de
    negocio y acceso a datos (patrón Container/Presenter).

-   Scripts de preprocesamiento documentados y parametrizables para
    incorporar nuevos años de datos con un solo comando.

-   Cobertura mínima de tests unitarios: 70% para funciones de
    transformación de datos y componentes críticos.

-   Documentación de API interna con JSDoc. README con instrucciones de
    setup en menos de 5 comandos.

**5. Modelo de Datos**

**5.1 Entidades Principales**

El sistema opera sobre cuatro entidades lógicas derivadas de los
datasets fuente. Estas entidades se relacionan a través del campo
\'COMUNA\' como clave de unión territorial.

**5.1.1 Entidad: EventoVial**

Derivada de incidentes_2019_limpio.csv. Representa un incidente de
tráfico georreferenciado.

  ----------------- -------------------------------------- -------------------------- --------------------
  **Campo**         **Tipo**                               **Fuente CSV**             **Descripción**

  id                String (UUID)                          Generado                   Identificador único
                                                                                      del evento

  fecha_accidente   Date (ISO 8601)                        FECHA_ACCIDENTE            Fecha y hora del
                                                                                      incidente

  comuna            String                                 COMUNA                     Clave de unión con
                                                                                      calidad_vida y
                                                                                      EventoHurto

  barrio            String                                 BARRIO                     Localización a nivel
                                                                                      de barrio

  clase_accidente   Enum:                                  CLASE_ACCIDENTE            Tipología del
                    Choque\|Atropello\|Volcamiento\|Otro                              incidente

  gravedad          Enum: Con heridos\|Solo daños\|Con     GRAVEDAD_ACCIDENTE         Severidad del evento
                    muertos                                                           

  latitud           Float (WGS84)                          LATITUD                    Coordenada
                                                                                      geográfica Y

  longitud          Float (WGS84)                          LONGITUD                   Coordenada
                                                                                      geográfica X

  victimas          Array\<PerfilVictima\>                 victimas_2019_limpio.csv   Relación 1:N con
                                                                                      perfiles de
                                                                                      afectados
  ----------------- -------------------------------------- -------------------------- --------------------

**5.1.2 Entidad: PerfilVictima**

Derivada de victimas_2019_muestra_limpia.csv. Representa el perfil
demográfico de un afectado por incidente vial.

  ----------------- ------------------------------------------- ------------------ --------------------
  **Campo**         **Tipo**                                    **Fuente CSV**     **Descripción**

  id                String (UUID)                               Generado           Identificador único
                                                                                   del perfil

  fecha_incidente   Date                                        Fecha_incidente    Fecha del evento al
                                                                                   que pertenece la
                                                                                   víctima

  comuna            String                                      Comuna             Clave de unión
                                                                                   territorial

  clase_incidente   String                                      Clase_incidente    Tipo de accidente
                                                                                   que generó la
                                                                                   víctima

  condicion         Enum:                                       Condicion          Rol de la víctima en
                    Peatón\|Conductor\|Pasajero\|Motociclista                      el incidente

  sexo              Enum: M\|F                                  Sexo               Sexo biológico
                                                                                   reportado

  edad              Integer (0-120)                             Edad               Edad en años al
                                                                                   momento del
                                                                                   incidente

  latitud           Float                                       Latitud            Coordenada del lugar
                                                                                   del incidente

  longitud          Float                                       Longitud           Coordenada del lugar
                                                                                   del incidente
  ----------------- ------------------------------------------- ------------------ --------------------

**5.1.3 Entidad: EventoHurto**

Derivada de hurtos_2019_limpio.csv. Representa un evento de robo en
transporte público.

  ------------------ --------------------------- ------------------ ---------------------------
  **Campo**          **Tipo**                    **Fuente CSV**     **Descripción**

  id                 String (UUID)               Generado           Identificador único

  fecha_hecho        Date                        fecha_hecho        Fecha y hora del hurto

  barrio             String                      Barrio             Localización a nivel de
                                                                    barrio

  sexo_victima       Enum: M\|F\|Mujer\|Hombre   sexo               Sexo de la víctima del
                                                                    hurto

  edad_victima       Integer                     edad               Edad de la víctima

  medio_transporte   Enum:                       medio_transporte   Vehículo donde ocurrió el
                     Metro\|Bus\|Autobus\|Taxi                      hurto

  modalidad          String                      modalidad          Técnica empleada
                                                                    (Cosquilleo, Atraco, etc.)

  arma_medio         String                      arma_medio         Arma o medio utilizado

  bien_robado        String                      bien               Tipo de bien sustraído

  latitud            Float                       latitud            Coordenada Y del evento

  longitud           Float                       longitud           Coordenada X del evento
  ------------------ --------------------------- ------------------ ---------------------------

**5.1.4 Entidad: IndicadoresComunal**

Derivada de calidad_vida_2018_limpio.csv. Representa el perfil de
calidad de vida agregado de una comuna para el año 2018.

  --------------------- ------------ -------------------- -----------------------
  **Campo**             **Tipo**     **Fuente CSV**       **Descripción**

  comuna                String (PK)  Comuna               Nombre de la comuna.
                                                          Clave primaria y clave
                                                          de unión con eventos
                                                          2019

  indice_ambiente       Float        Indice_Ambiente      Indicador compuesto de
                                                          calidad ambiental

  indice_movilidad      Float        Indice_Movilidad     Indicador compuesto de
                                                          accesibilidad y
                                                          transporte

  indice_seguridad      Float        Indice_Seguridad     Indicador compuesto de
                                                          seguridad ciudadana
                                                          percibida

  calidad_vida_total    Float        Calidad_Vida_Total   Índice compuesto
                                                          general (escala 0-100)

  ranking_calidad       Integer      Calculado            Posición de la comuna
                                                          de 1 (mejor) a 16
                                                          (peor)

  eventos_viales_2019   Integer      Calculado            Total incidentes viales
                                                          en 2019 (JOIN con
                                                          EventoVial)

  eventos_hurto_2019    Integer      Calculado            Total hurtos en
                                                          transporte en 2019
                                                          (JOIN con EventoHurto)
  --------------------- ------------ -------------------- -----------------------

**5.2 Relaciones entre Entidades**

El modelo de datos sigue un esquema estrella (star schema) donde
IndicadoresComunal actúa como tabla de dimensión y los eventos
(EventoVial, EventoHurto, PerfilVictima) son tablas de hechos:

+-----------------------------------------------------------------------+
| **Relaciones Clave del Modelo**                                       |
|                                                                       |
| EventoVial (N) → (1) IndicadoresComunal \[via campo \'COMUNA\'\]      |
| EventoHurto (N) → (1) IndicadoresComunal \[via campo derivado         |
| \'barrio → comuna\'\] PerfilVictima (N) → (1) EventoVial \[via        |
| fecha + coordenadas\] PerfilVictima (N) → (1) IndicadoresComunal      |
| \[via campo \'Comuna\'\] Nota: Dado que hurtos_2019_limpio.csv no     |
| contiene campo COMUNA explícito, la asignación se realiza mediante    |
| spatial join por coordenadas (latitud/longitud) contra los polígonos  |
| de comunas.                                                           |
+-----------------------------------------------------------------------+

**5.3 Estructura de Archivos JSON Generados**

Tras el pipeline de preprocesamiento, los siguientes archivos estáticos
son generados y empaquetados en el bundle:

  --------------------------------------- ---------------------------- ----------------
  **Archivo JSON**                        **Contenido**                **Tamaño
                                                                       Estimado**

  /public/data/eventos_viales.geojson     1.000 features GeoJSON con   \~280 KB
                                          propiedades de EventoVial    

  /public/data/hurtos.geojson             1.000 features GeoJSON con   \~260 KB
                                          propiedades de EventoHurto   

  /public/data/victimas.json              1.000 objetos PerfilVictima  \~180 KB
                                          en array JSON                

  /public/data/comunas_imcv.json          16 objetos                   \~8 KB
                                          IndicadoresComunal con       
                                          campos calculados            

  /public/data/comunas_polygons.geojson   Polígonos GeoJSON de las 16  \~120 KB
                                          comunas urbanas              

  /public/data/kpi_summary.json           Métricas agregadas para KPI  \~4 KB
                                          cards del dashboard          
  --------------------------------------- ---------------------------- ----------------

**6. Descripción de Interfaces de Usuario**

**6.1 Layout Principal**

La interfaz se organiza en tres zonas funcionales que se adaptan al
viewport del dispositivo:

-   Barra Superior (Topbar): Logotipo del proyecto, selector de vista
    principal (Mapa / Análisis / Comunas), indicador de registros
    activos y botón de reset de filtros.

-   Panel Izquierdo (Sidebar --- 320px desktop / drawer móvil):
    Controles de filtros organizados por pilar temático. Se colapsa en
    un drawer deslizable en móvil.

-   Área Central (Main Canvas): Ocupa el espacio restante. Alterna entre
    vista de mapa interactivo y vista de gráficos analíticos.

-   Panel Inferior (Info Panel --- móvil): En dispositivos móviles, la
    ficha de comuna aparece como bottom sheet deslizable.

**6.2 Paleta de Colores y Sistema de Diseño**

  ----------------------- ------------- ----------------------------------------
  **Token**               **Color HEX** **Uso**

  \--color-primary        #1A2E4A       Fondos oscuros, texto principal de marca

  \--color-secondary      #0D7377       Acentos, bordes activos, íconos
                                        primarios

  \--color-accent         #C9A84C       Alertas, highlights, etiquetas de
                                        prioridad alta

  \--color-hurto          #F97316       Marcadores de hurtos en el mapa

  \--color-incidente      #EF4444       Marcadores de incidentes viales

  \--color-commune-low    #16A34A       Comunas con alta calidad de vida

  \--color-commune-high   #DC2626       Comunas con baja calidad de vida

  \--color-surface        #F9FAFB       Fondo de cards y paneles
  ----------------------- ------------- ----------------------------------------

**7. Criterios de Aceptación y Pruebas**

**7.1 Casos de Prueba por Requerimiento**

  ---------- ------------ --------------------------- ------------------------------
  **ID       **RF/RNF**   **Escenario**               **Resultado Esperado**
  Prueba**                                            

  TP-01      RF01         Usuario activa capa de      1.000 marcadores naranja
                          hurtos. Sistema carga       visibles en \< 500ms. Popup
                          dataset y renderiza         con datos correctos al hacer
                          marcadores.                 clic.

  TP-02      RF01         Usuario hace zoom out al    Marcadores se agrupan en
                          nivel 10 (ciudad completa). clusters con conteo numérico.
                                                      Sin lag visual.

  TP-03      RF02         Usuario filtra víctimas por Pirámide demográfica, dona y
                          rango 18-25 años y sexo     KPIs se actualizan mostrando
                          Femenino.                   solo el subconjunto
                                                      seleccionado.

  TP-04      RF03         Usuario hace clic sobre el  Panel lateral muestra:
                          polígono de la comuna       Indice_Ambiente=2.25,
                          \'Popular\' en el mapa.     Indice_Movilidad=1.37,
                                                      Indice_Seguridad=1.74,
                                                      Calidad_Vida_Total=34.75.

  TP-05      RF04         Usuario selecciona          Mapa, gráficos y KPIs muestran
                          modalidad=\'Cosquilleo\' Y  solo hurtos con ambas
                          medio=\'Metro\'             condiciones activas. Contador
                          simultáneamente.            de registros se actualiza.

  TP-06      RNF-02       Sistema carga en            Todos los JSON parseados y
                          dispositivo móvil con 3G    gráficos interactivos en \<
                          (1.5 Mbps).                 200ms desde que el JS está
                                                      disponible.

  TP-07      RNF-06       Acceso desde smartphone     Mapa ocupa 100% ancho. Panel
                          360px de ancho en           de filtros accesible via FAB.
                          orientación vertical.       Gráficos legibles sin scroll
                                                      horizontal.

  TP-08      RF07         Usuario aplica filtros y    Descarga de archivo CSV con
                          presiona \'Exportar CSV\'.  registros filtrados. Columnas
                                                      idénticas al dataset original.
  ---------- ------------ --------------------------- ------------------------------

**7.2 Definición de Hecho (Definition of Done)**

Un requerimiento se considera completado cuando:

1.  El código pasa todos los tests unitarios e integración relacionados
    con el requerimiento.

2.  El feature ha sido revisado por al menos un peer del equipo en code
    review.

3.  El rendimiento medido cumple los criterios de los RNF aplicables.

4.  La interfaz ha sido probada en Chrome, Firefox y Safari (últimas 2
    versiones).

5.  La UI pasa validación de accesibilidad con axe-core (0 violaciones
    críticas).

6.  La documentación del componente (JSDoc) está actualizada.

**8. Roadmap de Implementación**

  ------------ -------------- --------------------------- ---------------------------
  **Sprint**   **Duración**   **Objetivos Clave**         **Entregables**

  Sprint 1     2 semanas      Setup del stack MERN.       Repositorio configurado.
                              Pipeline de datos CSV →     Scripts de
                              JSON. Componente de mapa    preprocesamiento. Mapa
                              base con Mapbox.            básico con 1.000
                                                          marcadores.

  Sprint 2     2 semanas      RF01 completo: capas        Mapa con 3 capas. Panel
                              conmutables y clustering.   lateral de comunas
                              RF03: Ficha de comuna con   funcional con datos IMCV.
                              spider chart.               

  Sprint 3     2 semanas      RF02: Módulo demográfico    Pirámide demográfica
                              completo. RF04: Motor de    interactiva. Sistema de
                              filtros cruzados con        filtros multidimensional
                              crossfilter2.               funcional.

  Sprint 4     2 semanas      RF05-RF07: KPIs, timeline,  Dashboard completo. Bundle
                              exportación. Optimización   \< 500KB. Lighthouse score
                              de rendimiento (RNF-01 a    \> 85.
                              RNF-05).                    

  Sprint 5     1 semana       QA: pruebas de usabilidad   Versión candidata a
                              con líderes comunitarios.   producción. Informe de
                              Correcciones de             pruebas con usuarios
                              accesibilidad y responsive. reales.

  Deploy       3 días         Despliegue en hosting       URL pública. Monitoreo con
                              estático (Vercel/Netlify).  Sentry. Documentación de
                              Configuración de CDN y      usuario final.
                              dominio.                    
  ------------ -------------- --------------------------- ---------------------------

**9. Apéndices**

**9.1 Muestra de Datos por Dataset**

**Dataset: hurtos_2019_limpio.csv (muestra)**

  ----------------- ------------- ---------- ---------------------- --------------- -----------
  **fecha_hecho**   **Barrio**    **sexo**   **medio_transporte**   **modalidad**   **bien**

  16/12/2019 03:00  Terminal de   Mujer      Autobus                Cosquilleo      Peso
                    Transporte                                                      

  13/09/2019 18:30  Prado         Mujer      Metro                  Cosquilleo      Cédula
  ----------------- ------------- ---------- ---------------------- --------------- -----------

**Dataset: incidentes_2019_limpio.csv (muestra)**

  --------------------- ------------ ------------- --------------------- ------------------------
  **FECHA_ACCIDENTE**   **COMUNA**   **BARRIO**    **CLASE_ACCIDENTE**   **GRAVEDAD_ACCIDENTE**

  03/04/2019 20:10      Aranjuez     San Pedro     Choque                Con heridos

  10/05/2019 17:50      La           La Candelaria Atropello             Con heridos
                        Candelaria                                       
  --------------------- ------------ ------------- --------------------- ------------------------

**Dataset: calidad_vida_2018_limpio.csv (muestra)**

  ------------------ --------------------- ---------------------- ---------------------- ------------------------
  **Comuna**         **Indice_Ambiente**   **Indice_Movilidad**   **Indice_Seguridad**   **Calidad_Vida_Total**

  Popular            2.25                  1.37                   1.74                   34.75

  Santa Cruz         2.26                  1.38                   1.79                   37.08
  ------------------ --------------------- ---------------------- ---------------------- ------------------------

**9.2 Referencias**

-   Alcaldía de Medellín --- Portal de Datos Abiertos:
    datos.medellin.gov.co

-   Departamento Administrativo de Planeación --- IMCV 2018: Índice
    Multidimensional de Calidad de Vida

-   Colombia 5.0 --- Reto de Innovación Ciudadana: Bases del concurso y
    lineamientos técnicos

-   OpenStreetMap Foundation --- Datos cartográficos base bajo licencia
    ODbL

-   React Documentation --- react.dev \| Tailwind CSS ---
    tailwindcss.com

-   crossfilter2 --- github.com/crossfilter/crossfilter \| Recharts ---
    recharts.org

**Medellín Inteligente: Dashboard de Resiliencia Urbana** · SRS v1.0 ·
Reto Colombia 5.0 · Datos Abiertos Alcaldía de Medellín
