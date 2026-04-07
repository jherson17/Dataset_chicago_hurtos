import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function AIChatAssistant() {
    const { incidentsData, theftsData, filterByDimension } = useDashboard();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! Soy MIA (Medellín Inteligente Assistant). Puedes hacerme preguntas en lenguaje natural sobre la ciudad. Por ejemplo:\n- "¿Cuál es la peor zona para ir en taxi?"\n- "¿Dónde hay más choques de vehículos?"\n- "¿Qué barrio me recomiendas para vivir?"' }
    ]);
    const [input, setInput] = useState('');
    const [qolData, setQolData] = useState([]);
    const messagesEndRef = useRef(null);

    // Fetch Quality of Life data dynamically for the chat agent
    useEffect(() => {
        fetch('/data/calidad_vida.json')
            .then(r => r.json())
            .then(setQolData)
            .catch(console.error);
    }, []);

    // Auto-scroll chat window
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // NLP Engine Logic (Simulated Expanded AI)
    const processQuery = (query) => {
        const q = query.toLowerCase();
        
        // Extract implicit Location targets (Comunas)
        let targetComuna = null;
        const comunas = ["popular", "santa cruz", "manrique", "aranjuez", "castilla", "doce de octubre", "robledo", "villa hermosa", "buenos aires", "la candelaria", "laureles", "la america", "san javier", "el poblado", "guayabal", "belen", "belén"];
        for (let c of comunas) {
            if (q.includes(c)) {
                targetComuna = c === "belén" ? "Belen" : c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }
        
        // 1. Intent: Calidad de Vida (Static Map - Multidimensional)
        if (q.match(/(vivir|recomienda|mejor|peor|calidad de vida|educacion|educación|salud|empleo|trabajo|ambiente|ambiental|movilidad|trafico|seguridad|indice|índice)/)) {
            if (qolData.length === 0) return { text: "Aún estoy analizando los datos de calidad de vida. Intenta en un segundo." };
            
            let focus = 'Total';
            let label = "calidad de vida en general";
            
            if (q.match(/educación|educacion/)) { focus = 'Educación'; label = "educación formativa"; }
            else if (q.match(/salud|medico|hospital/)) { focus = 'Salud'; label = "servicios de salud"; }
            else if (q.match(/empleo|trabajo/)) { focus = 'Empleo'; label = "oportunidades de empleo"; }
            else if (q.match(/ambiente|ambiental/)) { focus = 'Ambiente'; label = "medio ambiente y entorno"; }
            else if (q.match(/movilidad|trafico|transporte/)) { focus = 'Movilidad'; label = "movilidad vehicular"; }
            else if (q.match(/seguridad/)) { focus = 'Seguridad'; label = "seguridad ciudadana"; }
            
            const isWorst = q.match(/(peor|mala|baja|falta|peores)/);
            
            // Replicar las mismas fórmulas visuales del Gráfico Radar
            const getScore = (d, category) => {
                const base = parseFloat(d.Calidad_Vida_Total || 0);
                if (category === 'Ambiente') return parseFloat(d.Indice_Ambiente || 0) * 20;
                if (category === 'Movilidad') return parseFloat(d.Indice_Movilidad || 0) * 20;
                if (category === 'Seguridad') return parseFloat(d.Indice_Seguridad || 0) * 20;
                if (category === 'Educación') return Math.min(100, Math.max(10, base + 14));
                if (category === 'Salud') return Math.min(100, Math.max(10, base + 8));
                if (category === 'Empleo') return Math.min(100, Math.max(10, base - 5));
                return base; // Total Calidad de Vida
            };

            // Si el usuario pregunta por una comuna en específico, evadimos buscar el máximo/mínimo absoluto
            if (targetComuna) {
                const targetData = qolData.find(d => d.Comuna.toLowerCase() === targetComuna.toLowerCase());
                if (targetData) {
                    const score = getScore(targetData, focus).toFixed(1);
                    return {
                        text: `El índice local de **${label}** específicamente en la comuna **${targetData.Comuna}** es de **${score} sobre 100**. ¡He centrado el dashboard en esta zona para que puedas analizar todas sus métricas laterales!`,
                        action: { type: 'filterLocation', payload: targetData.Comuna }
                    };
                }
            }

            let result = qolData[0];
            qolData.forEach(d => {
                // Add fractional base as tie-breaker helper
                const val = getScore(d, focus) + parseFloat(d.Calidad_Vida_Total || 0)*0.001;
                const current = getScore(result, focus) + parseFloat(result.Calidad_Vida_Total || 0)*0.001;
                
                // Ignorar ceros si es 'peor' 
                if (isWorst && val > 0 && val < current) result = d;
                else if (!isWorst && val > current) result = d;
            });
            
            const finalScore = getScore(result, focus).toFixed(1);
            
            // Generate Empathy based on context
            const empathySadBase = ["Lamento informarte esto", "Tristemente, los datos indican que", "Por transparencia, debo decirte que"];
            const empathyHappyBase = ["¡Qué excelente dato!", "Es muy reconfortante saber que", "Te cuento con entusiasmo que"];
            const sadPrefix = empathySadBase[Math.floor(Math.random() * empathySadBase.length)];
            const happyPrefix = empathyHappyBase[Math.floor(Math.random() * empathyHappyBase.length)];
            
            let textOutput = '';
            if (isWorst) {
                 textOutput = `${sadPrefix}, al analizar **${label}**, la comuna **${result.Comuna}** tiene mayores retos. Registra **${finalScore} sobre 100**. Como beneficio, ¡He movido el mapa hacia allí de forma automática!`;
            } else {
                 textOutput = `${happyPrefix}, en excelencia de **${label}**, la comuna **${result.Comuna}** es la líder. Obtuvo un altísimo puntaje de **${finalScore} sobre 100**. ¡He actualizado el dashboard a esta comuna para que la veas!`;
            }
            
            return {
                text: textOutput,
                action: { type: 'filterLocation', payload: result.Comuna }
            };
        }
        
        // 2. Generic Query Engine (Context & Fuzzy Matching)
        const isIncidentQuery = q.match(/(choque|accidente|incidente|tránsito|transito|vial|conducir|manejar|atropell|volcamiento|caida)/) && !q.match(/(robo|hurto|atraco|cosquilleo|ladron|roban|asaltan|fleteo|asalto|arma)/);
        const data = isIncidentQuery ? incidentsData : theftsData;
        const dataName = isIncidentQuery ? "incidentes de tránsito (como choques o atropellos)" : "robos y asaltos";
        
        // Empathy Helpers
        const empathySad = ["Lamento informarte sobre esto", "Tristemente, las métricas señalan que", "Por tu seguridad, te cuento que", "Es preocupante, pero analizando la historia"];
        const empathyHappy = ["¡Excelentes noticias!", "Para tu tranquilidad,", "Te informo con alegría que", "Qué bueno buscar lo positivo. Te cuento que"];
        const getSad = () => empathySad[Math.floor(Math.random() * empathySad.length)];
        const getHappy = () => empathyHappy[Math.floor(Math.random() * empathyHappy.length)];
        
        if (!data || data.length === 0) return { text: "Estoy descargando la base de datos completa de la ciudad. Permíteme un segundo." };

        // Count Totals
        if (q.match(/(cuanto|cuánt|total|cantidad)/)) {
            if (targetComuna) {
                const filteredData = data.filter(f => {
                    const loc = f.properties.Barrio || f.properties.BARRIO || f.properties.COMUNA || '';
                    return loc.toLowerCase().includes(targetComuna.toLowerCase());
                });
                return { 
                    text: `Trasladándonos al área demográfica, tengo registrados un total de **${filteredData.length}** casos documentados de ${dataName} enfocados exclusivamente en **${targetComuna}**.`,
                    action: { type: 'filterLocation', payload: targetComuna }
                };
            }
            return { text: `Tengo registrados actualmente un total volumétrico de **${data.length}** casos oficiales de ${dataName} en la ciudad.` };
        }

        // Gender comparison
        if (q.match(/(hombre|mujer|sexo|g[eé]nero|v[ií]ctima|qui[eé]n)/)) {
            const counts = { 'Hombres': 0, 'Mujeres': 0 };
            data.forEach(f => {
                const s = (f.properties.sexo || f.properties.SEXO || '').toLowerCase();
                if (s.includes('homb') || s.includes('masc')) counts['Hombres']++;
                if (s.includes('muj') || s.includes('femen')) counts['Mujeres']++;
            });
            if (counts['Hombres'] === 0 && counts['Mujeres'] === 0) return `Los reportes paramétricos de ${dataName} no publican información de género específica, posiblemente protegiendo el anonimato y la privacidad.`;
            const mayor = counts['Hombres'] > counts['Mujeres'] ? 'Hombres' : 'Mujeres';
            return `${getSad()}, las víctimas más frecuentes registradas en ${dataName} son los **${mayor}**. Tenemos contabilizadas un pico de ${counts['Hombres']} afectaciones a hombres y ${counts['Mujeres']} a mujeres. Sin embargo, todos estamos expuestos, ¡así que cuídate mucho!`;
        }

        // Time/Month analysis
        if (q.match(/(mes|cuando|época|fecha)/)) {
            const counts = {};
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            data.forEach(f => {
                const dateStr = f.properties.FECHA_ACCIDENTE || f.properties.fecha_hecho;
                if (dateStr) {
                    let m = null;
                    if (dateStr.includes('-')) {
                        const match = dateStr.match(/-(\d{2})-/); // YYYY-MM-DD
                        m = match ? parseInt(match[1]) - 1 : null;
                    } else if (dateStr.includes('/')) {
                        const parts = dateStr.split('/'); // DD/MM/YYYY
                        m = parts.length > 1 ? parseInt(parts[1]) - 1 : null;
                    }
                    if (m !== null && m >= 0 && m <= 11 && !isNaN(m)) counts[m] = (counts[m] || 0) + 1;
                }
            });
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            
            if (sorted.length === 0) return "No tengo información suficiente sobre las fechas para cruzar los meses.";
            
            const peorMes = months[parseInt(sorted[0][0])];
            const mejorMes = months[parseInt(sorted[sorted.length-1][0])];
            
            if (q.match(/(mejor|segur|menos|tranquilo)/)) {
                return `${getHappy()} el mes históricamente más pacífico y prudente para evitar ${dataName} es **${mejorMes}**, con el número más bajo a lo largo del año (${sorted[sorted.length-1][1]} eventos en total).`;
            }
            return `${getSad()}, la temporada que presenta el mayor índice rojo sobre ${dataName} a lo largo del año es el mes de **${peorMes}**, aglomerando ${sorted[0][1]} incidentes críticos. Durante esa época, redoblar tu protección es vital.`;
        }

        // Modality analysis (Thefts only)
        if (q.match(/(modalidad|como roba|tipo de robo|arma|forma)/) && !isIncidentQuery) {
            const counts = {};
            data.forEach(f => {
                const m = f.properties.modalidad || 'No Registrado';
                if (m !== 'No Registrado' && m !== '-' && m !== '0') counts[m] = (counts[m] || 0) + 1;
            });
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            if (sorted.length === 0) return { text: "No hay modalidades específicas definidas en esta base de datos." };
            return { text: `La modalidad delictiva más recurrente de asalto institucionalizada en esta base de datos es **${sorted[0][0].toLowerCase()}** (con ${sorted[0][1]} reportes). Le sigue **${sorted[1][0].toLowerCase()}**.` };
        }

        // Location analysis (Peor zona / mejor zona / transport)
        if (q.match(/(barrio|zona|comuna|sector|donde|lugar|sitio)/) || q.match(/(taxi|bus|metro|moto|pie|caminando)/)) {
             const lookForSafest = q.match(/(segur|mejor|menos|tranquil)/);
             const targetTransportMatch = q.match(/(taxi|bus|metro|moto|pie|caminando)/);
             const targetTransport = targetTransportMatch ? (targetTransportMatch[0] === 'caminando' ? 'pie' : targetTransportMatch[0]) : null;
             
             const counts = {};
             data.forEach(f => {
                 const p = f.properties;
                 if (targetTransport && !isIncidentQuery) {
                     const trans = (p.medio_transporte || '').toLowerCase();
                     if (!trans.includes(targetTransport)) return;
                 }
                 const loc = p.Barrio || p.BARRIO || p.COMUNA || 'Desconocido';
                 counts[loc] = (counts[loc] || 0) + 1;
             });

             const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]).filter(x => x[0] !== 'Desconocido');
             if (sorted.length === 0) return "Por la rareza del filtro no encuentro concentración suficiente de datos allí. ¡Lo siento pero prefiero no darte un dato engañoso!";
             
             const transportAddon = targetTransport ? ` (para quienes se movilizan en ${targetTransport})` : '';

             if (lookForSafest) {
                 const best = sorted[sorted.length - 1]; 
                 return {
                     text: `${getHappy()} filtrando hacia zonas de menor riesgo, el entorno de **${best[0]}** tiene la menor cantidad de ${dataName}${transportAddon} acumulada. ¡He ajustado el mapa allí para que eches un vistazo!`,
                     action: { type: 'filterLocation', payload: best[0] }
                 };
             } else {
                 const worst = sorted[0];
                 const second = sorted.length > 1 ? sorted[1] : null;
                 
                 let res = `${getSad()}, la zona roja con máxima alerta de ${dataName}${transportAddon} es transversal a **${worst[0]}**, con ${worst[1]} siniestros reportados. `;
                 
                 const advice = isIncidentQuery 
                    ? "Maneja a la defensiva. He centrado el mapa en esa zona para que estudies los puntos vehiculares críticos."
                    : "He filtrado todo el dashboard hacia este barrio para que prevengas riesgos navegando su mapa de calor de hurtos.";
                 
                 return {
                     text: res + "\n\n" + advice,
                     action: { type: 'filterLocation', payload: worst[0] }
                 };
             }
        }

        // Fallback catch-all
        return { text: "Tengo acceso a métricas exhaustivas. Intenta preguntarme combinaciones locas como:\n- '¿Cuántos hurtos hay en total?'\n- '¿Cual es la comuna con mejor educación?'\n- '¿Cuál es el mes seguro para evitar choques?'" };
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userInput = input; // capture sync
        const newMessages = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setInput(''); // clear input
        
        // Simulate delay for AI "thinking" to improve user experience
        setTimeout(() => {
            let res = processQuery(userInput);
            if (typeof res === 'string') {
                res = { text: res }; // Legacy string normalization
            }
            
            setMessages(prev => [...prev, { sender: 'bot', text: res.text }]);
            
            // Execute auto context filtering actions driven by AI !!!
            if (res.action && res.action.type === 'filterLocation') {
                filterByDimension('location', res.action.payload);
            }
        }, 800);
    };

    // --- Drag and Drop Logic ---
    const [pos, setPos] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ offsetX: 0, offsetY: 0 });
    const windowRef = useRef(null);

    const handleMouseDown = (e) => {
        if (!windowRef.current) return;
        if (e.target.closest('button')) return; // No arrastrar al intentar cerrar el chat
        
        const rect = windowRef.current.getBoundingClientRect();
        dragRef.current = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
        
        // Solidify pixel position logically just before dragging
        if (pos.x === null) {
            setPos({ x: rect.left, y: rect.top });
        }
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            let newX = e.clientX - dragRef.current.offsetX;
            let newY = e.clientY - dragRef.current.offsetY;
            
            const maxX = window.innerWidth - 50; 
            const maxY = window.innerHeight - 50;
            
            setPos({
                x: Math.max(-300, Math.min(newX, maxX)), 
                y: Math.max(0, Math.min(newY, maxY))
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const containerStyle = pos.x !== null 
        ? { left: `${pos.x}px`, top: `${pos.y}px`, bottom: 'auto', right: 'auto' } 
        : {};

    return (
        <div 
            ref={windowRef}
            className={`fixed z-[9999] ${pos.x === null ? 'bottom-6 right-6' : ''}`}
            style={containerStyle}
        >
            {/* Chat Trigger Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-accentPurple rounded-full flex items-center justify-center text-darkSidebar shadow-2xl hover:scale-105 hover:shadow-accentPurple/30 transition-all cursor-pointer border border-white/10"
                >
                    <MessageSquare size={28} fill="currentColor" />
                    {/* Notification dot */}
                    <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-accentLime rounded-full border-2 border-darkSidebar"></span>
                </button>
            )}

            {/* Chat Window Panel */}
            {isOpen && (
                <div className={`bg-darkSidebar border border-gray-700 w-[350px] md:w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200 ${isDragging ? 'opacity-90 shadow-accentPurple/20 scale-[1.01] transition-transform' : 'slide-in-from-bottom-5'}`}>
                    {/* Header: Draggable handle */}
                    <div 
                        onMouseDown={handleMouseDown}
                        className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700 p-4 flex items-center justify-between shadow-sm cursor-grab active:cursor-grabbing select-none"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accentPurple flex items-center justify-center text-darkBg shadow-inner shadow-black/20">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">IA Medellín Inteligente</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-accentLime rounded-full"></div>
                                    <span className="text-gray-400 text-xs">En línea</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-900/50 p-1.5 rounded-full">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto min-h-[350px] max-h-[450px] bg-darkBg flex flex-col gap-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line shadow-sm
                                    ${m.sender === 'user' 
                                        ? 'bg-accentPurple text-darkBg rounded-2xl rounded-tr-sm font-medium' 
                                        : 'bg-gray-800 text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700'}
                                `}>
                                    {/* Format bold text manually for simple markdown support */}
                                    {m.text.split('**').map((chunk, j) => 
                                        j % 2 === 1 ? <strong key={j} className={m.sender === 'user' ? 'text-black' : 'text-white'}>{chunk}</strong> : chunk
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-gray-800/80 border-t border-gray-700 flex gap-2 items-center">
                        <input 
                            type="text" 
                            className="flex-1 bg-darkBg/50 border border-gray-700 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accentPurple transition-colors"
                            placeholder="Ej. ¿Peor zona para ir en taxi?"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-accentLime text-darkBg hover:scale-105 shadow-lg shadow-accentLime/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Send size={16} className="ml-0.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
