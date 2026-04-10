import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function AIChatAssistant() {
    const { filteredData, activeDataset, selectedYears, filterByDimension } = useDashboard();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! Soy la **IA Chicago Inteligente**. Analizo los datos que tienes en la pantalla basándome en los filtros de años elegidos.\n\nPuedes preguntarme:\n- "¿Cuántos registros hay en los años seleccionados?"\n- "¿Cuál es la modalidad más repetitiva en mi pantalla?"\n- "¿En qué lugares se cometen más estos eventos?"\n- "¿Cuál es la proporción de arrestos?" (Solo crímenes)' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const processQuery = (query) => {
        if (!filteredData || filteredData.length === 0) {
            return { text: "No hay datos cargados en la pantalla actualmente para analizar." };
        }

        const q = query.toLowerCase();
        const isCrime = activeDataset === 'thefts';
        const typeName = isCrime ? 'crímenes/hurtos' : 'incidentes viales';
        const yearsStr = selectedYears.join(', ');

        // 1. Total records
        if (q.match(/(cu[aá]nto|cantidad|total|registro)/)) {
            return { text: `Actualmente tienes seleccionados los años **${yearsStr}**. En este rango de tiempo filtrado, hay un total de **${filteredData.length}** registros de ${typeName} en pantalla.` };
        }

        // 2. Most frequent type/modality
        if (q.match(/(tipo|modalidad|m[aá]s repetitiv|con m[aá]s frecuencia|frecuente)/)) {
            const counts = {};
            filteredData.forEach(f => {
                const t = f.type || 'Desconocido';
                counts[t] = (counts[t] || 0) + 1;
            });
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            if (sorted.length === 0) return { text: "No hay modalidades registradas." };
            
            return { text: `Según la data en pantalla para los años ${yearsStr}, la modalidad más repetitiva es **${sorted[0][0]}** con ${sorted[0][1]} sucesos registrados. Le sigue ${sorted.length > 1 ? sorted[1][0] : 'ninguna otra'}.` };
        }

        // 3. Most frequent location/environment
        if (q.match(/(entorno|lugar|d[oó]nde|calle|ubicaci[oó]n|zona)/)) {
            const counts = {};
            filteredData.forEach(f => {
                const l = f.location || 'Desconocido';
                if (l !== 'Desconocido') counts[l] = (counts[l] || 0) + 1;
            });
            const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            if (sorted.length === 0) return { text: "No encuentro ubicaciones claras en la data actual." };

            return { 
                text: `El entorno o lugar crítico donde ocurren más de estos eventos (durante ${yearsStr}) es **${sorted[0][0]}** con un total de ${sorted[0][1]} apariciones en el registro.`,
                action: { type: 'filterLocation', payload: sorted[0][0] }
            };
        }

        // 4. Arrest proportion (only crimes)
        if (q.match(/(arresto|proporci[oó]n|porcentaje)/)) {
            if (!isCrime) return { text: "El porcentaje de arrestos es un dato que solo está disponible cuando visualizas la base de datos de Crímenes (Hurtos), no en incidentes viales." };
            
            let yes = 0, no = 0;
            filteredData.forEach(f => {
                 if (f.arrest === 'Sí') yes++;
                 else no++;
            });
            const total = yes + no;
            if (total === 0) return { text: "No hay datos de arresto." };
            
            const pct = ((yes / total) * 100).toFixed(1);
            return { text: `Midiendo la efectividad policial en los datos seleccionados (${yearsStr}):\nHubo **${yes} arrestos** reales frente a ${no} crímenes sin arresto.\nEsto representa una tasa de éxito/captura del **${pct}%**.` };
        }

        // Fallback
        return { text: "No entendí muy bien. Intenta algo como:\n- '¿Cual es el tipo de suceso más frecuente?'\n- '¿Cuántos crímenes/incidentes hay?'" };
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userInput = input;
        setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
        setInput('');
        
        setTimeout(() => {
            const res = processQuery(userInput);
            setMessages(prev => [...prev, { sender: 'bot', text: res.text }]);
            
            if (res.action && res.action.type === 'filterLocation') {
                filterByDimension('location', res.action.payload);
            }
        }, 800);
    };

    // --- Drag and Drop Logic --- //
    const [pos, setPos] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ offsetX: 0, offsetY: 0 });
    const windowRef = useRef(null);

    const handleMouseDown = (e) => {
        if (!windowRef.current) return;
        if (e.target.closest('button')) return;
        
        const rect = windowRef.current.getBoundingClientRect();
        dragRef.current = {
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
        
        if (pos.x === null) setPos({ x: rect.left, y: rect.top });
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

        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: false });
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const containerStyle = pos.x !== null ? { left: `${pos.x}px`, top: `${pos.y}px`, bottom: 'auto', right: 'auto' } : {};

    return (
        <div ref={windowRef} className={`fixed z-[9999] ${pos.x === null ? 'bottom-6 right-6' : ''}`} style={containerStyle}>
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-accentPurple rounded-full flex items-center justify-center text-darkSidebar shadow-2xl hover:scale-105 hover:shadow-accentPurple/30 transition-all cursor-pointer border border-white/10"
                >
                    <MessageSquare size={28} fill="currentColor" />
                    <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-accentLime rounded-full border-2 border-darkSidebar"></span>
                </button>
            )}

            {isOpen && (
                <div className={`bg-darkSidebar border border-gray-700 w-[350px] md:w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200 ${isDragging ? 'opacity-90 shadow-accentPurple/20 scale-[1.01] transition-transform' : 'slide-in-from-bottom-5'}`}>
                    <div onMouseDown={handleMouseDown} className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700 p-4 flex items-center justify-between shadow-sm cursor-grab active:cursor-grabbing select-none">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accentPurple flex items-center justify-center text-darkBg shadow-inner shadow-black/20">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">IA Chicago Inteligente</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-accentLime rounded-full"></div>
                                    <span className="text-gray-400 text-xs">Conectado a Datos Reales</span>
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
                                    ${m.sender === 'user' ? 'bg-accentPurple text-darkBg rounded-2xl rounded-tr-sm font-medium' : 'bg-gray-800 text-gray-200 rounded-2xl rounded-tl-sm border border-gray-700'}
                                `}>
                                    {m.text.split('**').map((chunk, j) => j % 2 === 1 ? <strong key={j} className={m.sender === 'user' ? 'text-black' : 'text-white'}>{chunk}</strong> : chunk)}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-gray-800/80 border-t border-gray-700 flex gap-2 items-center">
                        <input 
                            type="text" 
                            className="flex-1 bg-darkBg/50 border border-gray-700 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accentPurple transition-colors"
                            placeholder="Hazme una pregunta aquí..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={!input.trim()} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-accentLime text-darkBg hover:scale-105 shadow-lg shadow-accentLime/20' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                            <Send size={16} className="ml-0.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
