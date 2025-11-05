// src/components/views/PMPView.js
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, AlertTriangle, Send, Info, Loader } from 'lucide-react';
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import SearchableSelect from '../common/SearchableSelect';
import ConfirmationModal from '../common/ConfirmationModal';

// Componente de Tooltip para descripciones de la tabla
const InfoTooltip = ({ text }) => (
    <span className="group relative ml-1">
        <Info size={14} className="text-gray-400 cursor-pointer" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </span>
    </span>
);

// --- Colores para la leyenda ---
const legendColors = {
    "Stock de Seguridad (Riesgo)": "#ef4444", // Rojo
    "inventario inicial": "#22c55e", // Verde
    "Recepciones Programadas": "#3b82f6", // Azul
    "Producción Planificada": "#06b6d4", // Celeste
    "Inventario Proyectado (Resultado)": "#8b5cf6", // Morado
    "Pronóstico de Demanda": "#f97316", // Naranja
};

// --- Descripciones de los tooltips del GRÁFICO ---
const chartTooltipDescriptions = {
    "Stock de Seguridad (Riesgo)": {
        label: "Stock de Seguridad (Mínimo)",
        description: "Es el nivel mínimo de inventario que queremos mantener para evitar interrupciones o cubrir variaciones inesperadas en la demanda o el suministro. Si el inventario proyectado cae por debajo de este nivel, hay riesgo de desabastecimiento.",
        color: legendColors["Stock de Seguridad (Riesgo)"]
    },
    "inventario inicial": {
        label: "Inventario Inicial (Excedente)",
        description: "Representa el stock disponible al inicio de cada período que excede el Stock de Seguridad. Es un colchón que nos ayuda a cumplir la demanda sin recurrir a producción adicional inmediata.",
        color: legendColors["inventario inicial"]
    },
    "Recepciones Programadas": {
        label: "Recepciones Programadas (Llegadas)",
        description: "Son las cantidades de producto que ya tienen una orden de fabricación o compra en curso y que esperamos recibir en un período específico. Estas ya están comprometidas y no se pueden modificar fácilmente.",
        color: legendColors["Recepciones Programadas"]
    },
    "Producción Planificada": {
        label: "Producción Planificada (Propuesta)",
        description: "Es la cantidad de producto que se propone fabricar en este período para cubrir las necesidades netas (demanda + stock de seguridad) y mantener el inventario proyectado en niveles óptimos. Esta es la cantidad que puedes ajustar manualmente.",
        color: legendColors["Producción Planificada"]
    },
    "Inventario Proyectado (Resultado)": {
        label: "Inventario Proyectado (Final)",
        description: "El nivel de stock estimado al final de cada período, después de considerar el inventario inicial, las recepciones, la producción planificada y la demanda. Es un indicador clave de si estamos cubriendo nuestras necesidades.",
        color: legendColors["Inventario Proyectado (Resultado)"]
    },
    "Pronóstico de Demanda": {
        label: "Pronóstico de Demanda (Esperada)",
        description: "La cantidad de producto que se espera que los clientes soliciten en cada período. Es la base para calcular todas las necesidades de producción y recepciones.",
        color: legendColors["Pronóstico de Demanda"]
    },
};

// --- Componente personalizado para el Tooltip del gráfico ---
const CustomChartTooltip = ({ active, payload, label, safetyStock }) => {
    if (active && payload && payload.length) {
        // Ordena los items para que "Stock de Seguridad (Riesgo)" siempre aparezca primero si está presente
        const sortedPayload = [...payload].sort((a, b) => {
            if (a.dataKey === "Stock de Seguridad (Riesgo)") return -1;
            if (b.dataKey === "Stock de Seguridad (Riesgo)") return 1;
            return 0;
        });

        // Agrupa las barras apiladas para un mejor resumen visual
        const suministroTotal = sortedPayload.filter(item => ["Stock de Seguridad (Riesgo)", "inventario inicial", "Recepciones Programadas", "Producción Planificada"].includes(item.dataKey))
                                              .reduce((sum, item) => sum + item.value, 0);

        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm max-w-xs">
                <p className="font-bold text-gray-900 mb-2 border-b pb-1">📊 {label}</p>
                
                {sortedPayload.map((entry, index) => {
                    const desc = chartTooltipDescriptions[entry.dataKey];
                    if (!desc) return null; // Si no hay descripción, no mostrar

                    return (
                        <div key={`item-${index}`} className="mb-2 last:mb-0">
                            <p className="flex items-center font-semibold text-gray-800">
                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: desc.color || entry.color }}></span>
                                {desc.label}: <span className="ml-1 text-base font-bold" style={{ color: desc.color || entry.color }}>{entry.value}</span>
                            </p>
                            <p className="text-gray-600 text-xs pl-5 leading-tight">{desc.description}</p>
                            {/* Línea de stock de seguridad para Inventario Proyectado */}
                            {entry.dataKey === "Inventario Proyectado (Resultado)" && safetyStock !== undefined && (
                                <p className={`text-xs pl-5 italic mt-1 ${entry.value < safetyStock ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                    {entry.value < safetyStock ? `¡Alerta! Bajo Stock de Seguridad (${safetyStock})` : `Stock Seguridad: ${safetyStock}`}
                                </p>
                            )}
                        </div>
                    );
                })}
                {/* Puedes añadir un resumen de suministro si lo consideras útil */}
                {/* <p className="mt-2 pt-2 border-t text-gray-700 font-medium">Suministro Total: {suministroTotal}</p> */}
            </div>
        );
    }
    return null;
};


const PMPView = ({ results, setResults, skusWithPrediction }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTabId, setActiveTabId] = useState(null);
    const [editablePmpTable, setEditablePmpTable] = useState([]);
    const [orderToLaunch, setOrderToLaunch] = useState(null); // State for confirmation modal

    // --- Estado para la leyenda interactiva ---
    const [visibleDataKeys, setVisibleDataKeys] = useState({
        "Stock de Seguridad (Riesgo)": true,
        "inventario inicial": true,
        "Recepciones Programadas": true,
        "Producción Planificada": true,
        "Inventario Proyectado (Resultado)": true,
        "Pronóstico de Demanda": true,
    });

    const productsWithPrediction = useMemo(() => {
        return allProducts.filter(p => skusWithPrediction.includes(p.sku));
    }, [allProducts, skusWithPrediction]);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/?item_type=Producto Terminado`);
                if (!response.ok) throw new Error('No se pudieron cargar los productos.');
                const finishedProducts = await response.json();
                setAllProducts(finishedProducts);
                if (skusWithPrediction.length > 0) {
                    const firstSku = finishedProducts.find(p => skusWithPrediction.includes(p.sku))?.sku;
                    if (firstSku) setSelectedSku(firstSku);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProducts();
    }, [skusWithPrediction]);

    const handleGeneratePMP = async (skuToGenerate = selectedSku) => {
        if (!skuToGenerate) {
            setError('Por favor, selecciona un producto.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/pmp/calculate/${skuToGenerate}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al generar el PMP.');
            }
            const data = await response.json();
            const product = allProducts.find(p => p.sku === skuToGenerate);
            
            const newPmp = {
                id: `${skuToGenerate}-${Date.now()}`,
                sku: skuToGenerate,
                productName: product ? product.name : skuToGenerate,
                table: data.table.map(row => ({ ...row, product_sku: skuToGenerate })),
                safety_stock: data.safety_stock,
                // Almacenamos el inventario inicial real para el gráfico
                initial_inventory: product ? product.in_stock : 0 
            };

            const existingIndex = results.findIndex(r => r.sku === skuToGenerate);
            if(existingIndex > -1) {
                const updatedResults = [...results];
                updatedResults[existingIndex] = newPmp;
                setResults(updatedResults);
            } else {
                setResults(prev => [...prev, newPmp]);
            }
            setActiveTabId(newPmp.id);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseTab = (pmpId) => {
        setResults(prev => prev.filter(pmp => pmp.id !== pmpId));
        if (activeTabId === pmpId) {
            const remainingTabs = results.filter(pmp => pmp.id !== pmpId);
            setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
        }
    };

    const activePMP = useMemo(() => {
        if (!activeTabId && results.length > 0) {
            return results[0];
        }
        return results.find(r => r.id === activeTabId);
    }, [activeTabId, results]);
    
    useEffect(() => {
        if (activePMP) {
            setEditablePmpTable(JSON.parse(JSON.stringify(activePMP.table)));
        } else {
            setEditablePmpTable([]);
        }
    }, [activePMP]);

    useEffect(() => {
        if (!activeTabId && results.length > 0) {
            setActiveTabId(results[0].id);
        }
    }, [results, activeTabId]);
    
    const handleProductionChange = (index, newValue) => {
        if (!activePMP) return;
        
        const product = allProducts.find(p => p.sku === activePMP.sku);
        if (!product) {
            setError("No se pudo encontrar la información del producto para el recálculo.");
            return;
        }
        
        // Usamos el inventario inicial guardado en el PMP
        const initialInventory = activePMP.initial_inventory || 0;
        const safetyStock = activePMP.safety_stock || 0;
        const newTable = [...editablePmpTable];

        newTable[index] = { 
            ...newTable[index], 
            planned_production_receipt: newValue, 
            is_manual: true
        };

        for (let i = 0; i < newTable.length; i++) {
            const prevInventory = i === 0 ? initialInventory : newTable[i - 1].projected_inventory;
            
            const currentPeriod = { ...newTable[i] };
            currentPeriod.initial_inventory = prevInventory;
            
            const inventoryBeforeProduction = prevInventory 
                                            + currentPeriod.scheduled_receipts 
                                            - currentPeriod.gross_requirements;

            if (i >= index) {
                if (!currentPeriod.is_manual || i === index) {
                    if (inventoryBeforeProduction < safetyStock) {
                        currentPeriod.net_requirements = safetyStock - inventoryBeforeProduction;
                        if (!currentPeriod.is_manual) {
                            const net_req = currentPeriod.net_requirements;
                            const policy = product.politica_lote || 'LxL';
                            const lot_size = product.tamano_lote_fijo || 0;

                            if (policy === 'FOQ' && lot_size > 0) {
                                currentPeriod.planned_production_receipt = Math.ceil(net_req / lot_size) * lot_size;
                            } else {
                                currentPeriod.planned_production_receipt = net_req;
                            }
                        }
                    } else {
                        currentPeriod.net_requirements = 0;
                        if (!currentPeriod.is_manual) {
                            currentPeriod.planned_production_receipt = 0;
                        }
                    }
                }
            }
            
            currentPeriod.projected_inventory = inventoryBeforeProduction + currentPeriod.planned_production_receipt;
            
            newTable[i] = currentPeriod;
        }

        const finalTable = newTable.map(row => {
            const { is_manual, ...rest } = row;
            return rest;
        });

        setEditablePmpTable(finalTable);
    };
    
    const promptLaunchOrder = (periodData) => {
        if (periodData.planned_production_receipt > 0) {
            setOrderToLaunch(periodData);
        }
    };

    const executeLaunchOrder = async () => {
        if (!orderToLaunch || !activePMP) return;

        const { sku } = activePMP;
        const receipt = {
            sku: sku,
            quantity: orderToLaunch.planned_production_receipt,
            due_date: orderToLaunch.start_date,
        };

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/pmp/scheduled-receipts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receipt),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'No se pudo crear la recepción programada.');
            }
            
            await handleGeneratePMP(sku); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setOrderToLaunch(null);
        }
    };

    // --- MODIFICADO: Eliminado 'planned_order_releases' de la tabla ---
    const pmpTableRows = [
        { key: 'initial_inventory', label: 'Inventario Inicial', tooltip: 'Stock disponible al inicio del período.' },
        { key: 'gross_requirements', label: 'Pronóstico de Demanda', tooltip: 'Demanda total esperada para el período.' },
        { key: 'scheduled_receipts', label: 'Recepciones Programadas', tooltip: 'Órdenes de producción ya lanzadas que llegarán este período.' },
        { key: 'projected_inventory', label: 'Inventario Proyectado', tooltip: 'Stock estimado al final del período. (Inv. Inicial + Recepciones + Producción - Demanda)' },
        { key: 'net_requirements', label: 'Necesidades Netas', tooltip: 'Cantidad necesaria para cubrir la demanda y/o el Stock de Seguridad.' },
        { key: 'planned_production_receipt', label: 'Recepción de Producción Planificada', tooltip: 'Cantidad que debe terminarse de producir en este período.' },
        // { key: 'planned_order_releases', label: 'Lanzamiento de Producción Planificado', tooltip: '¡ACCIÓN! Cuándo se debe iniciar este pedido (basado en el Lead Time).' } // <-- Eliminado
    ];

    // --- DATOS DEL GRÁFICO MODIFICADOS ---
    // --- MODIFICADO: Cambiado "Inventario Adicional (Seguro)" a "inventario inicial" ---
    const chartData = useMemo(() => {
        if (!activePMP || editablePmpTable.length === 0) return [];
        
        const safety_stock = activePMP.safety_stock || 0;

        return editablePmpTable.map(period => {
            
            // 1. Barra de "Suministro" (apilada)
            // Barra Roja: Siempre es el valor del stock de seguridad
            const stock_seguridad_rojo = safety_stock;
            
            // Barra Verde: Solo la porción del Inv. Inicial que está POR ENCIMA del stock de seguridad
            const inventario_seguro_verde = Math.max(0, period.initial_inventory - safety_stock);
            
            // Barra Azul: Recepciones Programadas
            const recepciones_azul = period.scheduled_receipts;

            // Barra Celeste: Producción Planificada (la que editas)
            const produccion_celeste = period.planned_production_receipt;

            // 2. Barra de "Resultado" (morada)
            const inventario_proyectado_morado = period.projected_inventory;

            // 3. Línea de "Demanda" (naranja)
            const pronostico_demanda_naranja = period.gross_requirements;

            return {
                period: period.period,
                
                // --- Barra de Suministro (stackId="suministro") ---
                "Stock de Seguridad (Riesgo)": stock_seguridad_rojo,
                "inventario inicial": inventario_seguro_verde, // <-- CAMBIO DE NOMBRE
                "Recepciones Programadas": recepciones_azul,
                "Producción Planificada": produccion_celeste,
                
                // --- Barra de Resultado (independiente) ---
                "Inventario Proyectado (Resultado)": inventario_proyectado_morado,

                // --- Línea de Demanda ---
                "Pronóstico de Demanda": pronostico_demanda_naranja,
            };
        });
    }, [editablePmpTable, activePMP]);


    // --- NUEVO: Funciones para la leyenda interactiva ---
    const toggleDataKey = (key) => {
        setVisibleDataKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const selectAllKeys = () => {
        setVisibleDataKeys(prev => {
            const allVisible = Object.values(prev).every(Boolean);
            const newState = {};
            Object.keys(prev).forEach(key => {
                newState[key] = !allVisible;
            });
            return newState;
        });
    };

    return (
        <div className="p-8 space-y-8">
            {orderToLaunch && (
                <ConfirmationModal
                    message={`¿Estás seguro que deseas cargar una recepción de ${orderToLaunch.planned_production_receipt} unidades para la ${orderToLaunch.period}?`}
                    onConfirm={executeLaunchOrder}
                    onCancel={() => setOrderToLaunch(null)}
                />
            )}

            <Card title="Generar Plan Maestro de Producción (PMP)">
                 <div className="flex items-end gap-4">
                     <div className="flex-grow">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Producto Terminado (con predicción)</label>
                         <SearchableSelect
                             options={productsWithPrediction}
                             value={selectedSku}
                             onChange={setSelectedSku}
                             placeholder="Selecciona un producto..."
                             disabled={productsWithPrediction.length === 0}
                         />
                          {productsWithPrediction.length === 0 && (
                             <p className="text-xs text-red-600 mt-1">No hay productos con predicciones. Por favor, genera un pronóstico primero.</p>
                         )}
                     </div>
                     <button onClick={() => handleGeneratePMP()} disabled={loading || !selectedSku} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                         {loading ? <Loader size={16} className="animate-spin" /> : <Calendar size={16}/>}
                         {loading ? 'Calculando...' : 'Generar / Actualizar PMP'}
                     </button>
                 </div>
                 {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
            </Card>

            {results.length > 0 && (
                <Card title="Planes Maestros Generados">
                     <div className="flex flex-wrap items-center gap-2 border-b-2 border-gray-200 pb-2 mb-6">
                         {results.map(pmp => (
                             <button
                                 key={pmp.id}
                                 onClick={() => setActiveTabId(pmp.id)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                                     activeTabId === pmp.id
                                         ? 'bg-indigo-600 text-white shadow-md'
                                         : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                 }`}
                             >
                                 {pmp.productName}
                                 <X 
                                     size={16} 
                                     className={`p-1 rounded-full ml-1 ${
                                         activeTabId === pmp.id ? 'hover:bg-indigo-700' : 'hover:bg-gray-400'
                                     }`}
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         handleCloseTab(pmp.id);
                                     }} 
                                 />
                             </button>
                         ))}
                     </div>

                     {activePMP && editablePmpTable.length > 0 && (
                         <div key={activePMP.id} className="space-y-8 animate-fadeIn">
                             <h3 className="text-lg font-bold text-gray-800">Detalle del Plan para: <span className="text-indigo-600">{activePMP.productName}</span></h3>
                             
                             {/* ================================================================== */}
                             {/* ===== INICIO DEL GRÁFICO CON LEYENDA INTERACTIVA Y TOOLTIP MEJORADO ===== */}
                             {/* ================================================================== */}
                             <div className="mb-8">
                                 <h4 className="text-md font-semibold text-gray-700 mb-2">Gráfico de Suministro vs. Demanda</h4>
                                 <ResponsiveContainer width="100%" height={400}>
                                     <ComposedChart 
                                         data={chartData} 
                                         margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                                         barCategoryGap="20%" 
                                     >
                                         <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                         <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#333' }} />
                                         <YAxis tick={{ fontSize: 12, fill: '#333' }} />
                                         {/* --- MODIFICADO: Tooltip usa el componente personalizado --- */}
                                         <Tooltip content={<CustomChartTooltip safetyStock={activePMP.safety_stock} />} />
                                         
                                         {/* --- MODIFICADO: Mover Label de ReferenceLine fuera de la zona de solapamiento --- */}
                                         <ReferenceLine 
                                             y={activePMP.safety_stock} 
                                             stroke="#dc2626"
                                             strokeDasharray="5 5"
                                             strokeWidth={2}
                                         >
                                             {/* Position "right" y dy para moverla fuera del gráfico */}
                                             <Label 
                                                value="Stock Seguridad" 
                                                position="right" 
                                                fill="#dc2626" 
                                                dy={-5} // Ajusta verticalmente
                                                dx={10} // Ajusta horizontalmente
                                                fontSize={12} 
                                                fontWeight="bold" 
                                            />
                                         </ReferenceLine>
                                         
                                         {/* --- MODIFICADO: Barras y líneas ahora usan 'hide' --- */}
                                         
                                         {/* 2. BARRA APILADA: Suministro Total (stackId="suministro") */}
                                         <Bar dataKey="Stock de Seguridad (Riesgo)" stackId="suministro" fill={legendColors["Stock de Seguridad (Riesgo)"]} maxBarSize={40} hide={!visibleDataKeys["Stock de Seguridad (Riesgo)"]} />
                                         <Bar dataKey="inventario inicial" stackId="suministro" fill={legendColors["inventario inicial"]} maxBarSize={40} hide={!visibleDataKeys["inventario inicial"]} />
                                         <Bar dataKey="Recepciones Programadas" stackId="suministro" fill={legendColors["Recepciones Programadas"]} maxBarSize={40} hide={!visibleDataKeys["Recepciones Programadas"]} />
                                         <Bar dataKey="Producción Planificada" stackId="suministro" fill={legendColors["Producción Planificada"]} maxBarSize={40} hide={!visibleDataKeys["Producción Planificada"]} />

                                         {/* 3. BARRA INDEPENDIENTE: Resultado */}
                                         <Bar dataKey="Inventario Proyectado (Resultado)" name="Inventario Proyectado" fill={legendColors["Inventario Proyectado (Resultado)"]} maxBarSize={40} hide={!visibleDataKeys["Inventario Proyectado (Resultado)"]} />
                                        
                                         {/* 4. LÍNEA: Demanda */}
                                         <Line 
                                             type="monotone"
                                             dataKey="Pronóstico de Demanda"
                                             stroke={legendColors["Pronóstico de Demanda"]}
                                             strokeWidth={3}
                                             dot={{ r: 5, fill: legendColors["Pronóstico de Demanda"] }}
                                             activeDot={{ r: 8 }}
                                             hide={!visibleDataKeys["Pronóstico de Demanda"]}
                                         />
                                         
                                     </ComposedChart>
                                 </ResponsiveContainer>

                                 {/* --- Leyenda interactiva --- */}
                                 <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-4">
                                     <button
                                        onClick={selectAllKeys}
                                        className="px-3 py-1 text-xs font-semibold text-white bg-gray-700 rounded-full hover:bg-gray-900 transition-colors"
                                    >
                                        {Object.values(visibleDataKeys).every(Boolean) ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                    </button>
                                    {Object.entries(legendColors).map(([key, color]) => (
                                        <div 
                                            key={key} 
                                            onClick={() => toggleDataKey(key)}
                                            className={`flex items-center gap-2 cursor-pointer p-1 rounded-md transition-opacity ${visibleDataKeys[key] ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                        >
                                            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></div>
                                            <span className="text-xs font-medium text-gray-700">{key}</span>
                                        </div>
                                    ))}
                                 </div>
                             </div>
                             {/* ================================================================== */}
                             {/* ===== FIN DEL GRÁFICO ===== */}
                             {/* ================================================================== */}

                             
                             {/* --- TABLA MODIFICADA --- */}
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left border-collapse">
                                     <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                         <tr>
                                             <th className="p-3 font-semibold border border-gray-200 min-w-[250px]">Concepto</th>
                                             {editablePmpTable.map(period => <th key={period.period} className="p-3 font-semibold border border-gray-200 text-center">{period.period}</th>)}
                                         </tr>
                                     </thead>
                                     <tbody>
                                        {pmpTableRows.map(({ key, label, tooltip }) => (
                                            <tr key={key} className={`border-b ${
                                                key === 'projected_inventory' ? 'bg-indigo-50' : 
                                                key === 'planned_production_receipt' ? 'bg-blue-50' : 
                                                'bg-white' // Eliminada la clase para 'planned_order_releases'
                                            }`}>
                                                <td className="p-3 font-medium border border-gray-200 text-gray-800">
                                                    <div className="flex items-center">
                                                        {label}
                                                        <InfoTooltip text={tooltip} />
                                                    </div>
                                                </td>
                                                {editablePmpTable.map((period, i) => {
                                                    const value = period[key];
                                                    const isRisky = key === 'projected_inventory' && value < activePMP.safety_stock;
                                                    
                                                    if (key === 'planned_production_receipt') {
                                                        return (
                                                            <td key={`${key}-${i}`} className={`p-1 border border-gray-200 text-center`}>
                                                                <div className="relative w-24 mx-auto">
                                                                    <input
                                                                        type="number"
                                                                        value={value}
                                                                        onChange={(e) => handleProductionChange(i, parseInt(e.target.value, 10) || 0)}
                                                                        onFocus={(e) => e.target.select()}
                                                                        className="w-full p-1 pr-8 text-center font-semibold bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                                                                    />
                                                                    {value > 0 && (
                                                                        <button 
                                                                            onClick={() => promptLaunchOrder(period)} 
                                                                            title="Lanzar Orden" 
                                                                            className="absolute right-0 top-0 h-full px-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center" 
                                                                            disabled={loading}
                                                                        >
                                                                            <Send size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    
                                                    return (
                                                        <td key={`${key}-${i}`} className={`p-3 border border-gray-200 text-center font-semibold text-gray-800
                                                            ${isRisky ? 'text-red-600 font-bold' : ''} 
                                                            ${key === 'scheduled_receipts' && value > 0 ? 'text-blue-700' : ''}
                                                            ${'' /* Eliminada la lógica de 'planned_order_releases' */}
                                                        `}>
                                                            {value}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                 </table>
                             </div>
                         </div>
                     )}
                </Card>
            )}
        </div>
    );
};

export default PMPView;