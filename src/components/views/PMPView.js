// src/components/views/PMPView.js
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, AlertTriangle, Send, Info, Loader } from 'lucide-react';
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, ReferenceLine } from 'recharts';
// CORRECCIÓN: Rutas relativas
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import SearchableSelect from '../common/SearchableSelect';
import ConfirmationModal from '../common/ConfirmationModal';

// NUEVO: Componente de Tooltip (Pop-up)
const InfoTooltip = ({ text }) => (
    <span className="group relative ml-1">
        <Info size={14} className="text-gray-400 cursor-pointer" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
        </span>
    </span>
);

const PMPView = ({ results, setResults, skusWithPrediction }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTabId, setActiveTabId] = useState(null);
    const [editablePmpTable, setEditablePmpTable] = useState([]);
    const [orderToLaunch, setOrderToLaunch] = useState(null); // State for confirmation modal

    const productsWithPrediction = useMemo(() => {
        return allProducts.filter(p => skusWithPrediction.includes(p.sku));
    }, [allProducts, skusWithPrediction]);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // CORREGIDO: Usa API_URL
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
    }, [skusWithPrediction]); // No incluir allProducts aquí

    // CORREGIDO: Lógica de fetch y guardado de PMP
    const handleGeneratePMP = async (skuToGenerate = selectedSku) => {
        if (!skuToGenerate) {
            setError('Por favor, selecciona un producto.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // CORREGIDO: Usa API_URL y método POST
            const response = await fetch(`${API_URL}/pmp/calculate/${skuToGenerate}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // Enviar body vacío o con params si es necesario
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al generar el PMP.');
            }
            // CORREGIDO: Espera un objeto { table: [], safety_stock: 0 }
            const data = await response.json();
            const product = allProducts.find(p => p.sku === skuToGenerate);
            
            const newPmp = {
                id: `${skuToGenerate}-${Date.now()}`,
                sku: skuToGenerate,
                productName: product ? product.name : skuToGenerate,
                // CORREGIDO: Usa data.table
                table: data.table.map(row => ({ ...row, product_sku: skuToGenerate })),
                // CORREGIDO: Usa data.safety_stock
                safety_stock: data.safety_stock 
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
    
    // CORREGIDO: Lógica de recálculo de la tabla PMP
    const handleProductionChange = (index, newValue) => {
        if (!activePMP) return;
        const safetyStock = activePMP.safety_stock || 0;
        const newTable = [...editablePmpTable];

        // Marca la fila como editada manualmente
        newTable[index] = { 
            ...newTable[index], 
            planned_production_receipt: newValue, 
            is_manual: true // Flag para evitar recálculo automático
        };

        // Recalcular hacia adelante desde el índice cambiado
        for (let i = index; i < newTable.length; i++) {
            const product = allProducts.find(p => p.sku === activePMP.sku);
            const initialInventory = product ? product.in_stock : 0;
            const prevInventory = i === 0 ? initialInventory : newTable[i - 1].projected_inventory;
            
            const currentPeriod = { ...newTable[i] };
            currentPeriod.initial_inventory = prevInventory;
            
            const inventoryBeforeProduction = prevInventory 
                                            + currentPeriod.scheduled_receipts 
                                            - currentPeriod.gross_requirements;

            // Solo recalcular si NO fue editado manualmente (o si es el índice actual)
            if (!currentPeriod.is_manual || i === index) {
                if (inventoryBeforeProduction < safetyStock) {
                    currentPeriod.net_requirements = safetyStock - inventoryBeforeProduction;
                    // Solo auto-llenar si no es manual
                    if (!currentPeriod.is_manual) {
                        currentPeriod.planned_production_receipt = currentPeriod.net_requirements;
                    }
                } else {
                    currentPeriod.net_requirements = 0;
                    if (!currentPeriod.is_manual) {
                        currentPeriod.planned_production_receipt = 0;
                    }
                }
            }
            
            currentPeriod.projected_inventory = inventoryBeforeProduction + currentPeriod.planned_production_receipt;
            
            newTable[i] = currentPeriod;
        }

        // Limpiar flags 'is_manual' antes de guardar en el estado
        const finalTable = newTable.map(row => {
            const { is_manual, ...rest } = row;
            return rest;
        });

        setEditablePmpTable(finalTable);
    };
    
    // NUEVO: Funciones para lanzar órdenes (Recepciones Programadas)
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
            due_date: orderToLaunch.start_date, // La fecha de inicio del período es cuándo debe estar listo
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
            
            // Recargar el PMP para que muestre la nueva recepción
            await handleGeneratePMP(sku); 

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setOrderToLaunch(null); // Close modal
        }
    };

    // CORREGIDO: Añadido 'planned_order_releases'
    const pmpTableRows = [
        { key: 'initial_inventory', label: 'Inventario Inicial', tooltip: 'Stock disponible al inicio del período.' },
        { key: 'gross_requirements', label: 'Pronóstico de Demanda', tooltip: 'Demanda total esperada para el período.' },
        { key: 'scheduled_receipts', label: 'Recepciones Programadas', tooltip: 'Órdenes de producción ya lanzadas que llegarán este período.' },
        { key: 'projected_inventory', label: 'Inventario Proyectado', tooltip: 'Stock estimado al final del período. (Inv. Inicial + Recepciones + Producción - Demanda)' },
        { key: 'net_requirements', label: 'Necesidades Netas', tooltip: 'Cantidad necesaria para cubrir la demanda y/o el Stock de Seguridad.' },
        { key: 'planned_production_receipt', label: 'Recepción de Producción Planificada', tooltip: 'Cantidad que debe terminarse de producir en este período.' },
        { key: 'planned_order_releases', label: 'Lanzamiento de Producción Planificado', tooltip: '¡ACCIÓN! Cuándo se debe iniciar este pedido (basado en el Lead Time).' }
    ];

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
                             
                             {/* GRÁFICO CORREGIDO */}
                             <div className="mb-8">
                                 <h4 className="text-md font-semibold text-gray-700 mb-2">Gráfico de Inventario vs. Producción</h4>
                                 <ResponsiveContainer width="100%" height={300}>
                                     <ComposedChart data={editablePmpTable} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                         <CartesianGrid strokeDasharray="3 3" />
                                         <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                         <YAxis />
                                         <Tooltip />
                                         <Legend />
                                         <ReferenceLine 
                                             y={activePMP.safety_stock} 
                                             label={{ value: 'Stock Seguridad', position: 'left', fill: 'red', dy: -5 }} 
                                             stroke="red" 
                                             strokeDasharray="5 5" // Línea punteada
                                             strokeWidth={2} // Más gruesa
                                         />
                                         <Area 
                                             type="monotone" 
                                             dataKey="gross_requirements" 
                                             name="Demanda (Pronóstico)" 
                                             fill="#ef4444" // Rojo
                                             stroke="#dc2626"
                                             fillOpacity={0.3} // Transparencia
                                          />
                                          {/* Lanzamientos (Acción) en VERDE */}
                                         <Bar dataKey="planned_order_releases" name="Lanzamiento Planificado" barSize={20} fill="#22c55e" />
                                         {/* Recepciones (Entradas) en AZUL */}
                                         <Bar dataKey="scheduled_receipts" name="Recepciones Programadas" barSize={20} fill="#3b82f6" />
                                         <Line 
                                             type="monotone" 
                                             dataKey="projected_inventory" 
                                             name="Inventario Proyectado" 
                                             stroke="#8b5cf6" // Morado
                                             strokeWidth={3} 
                                             dot={{ r: 5 }}
                                             activeDot={{ r: 8 }}
                                          />
                                     </ComposedChart>
                                 </ResponsiveContainer>
                             </div>
                             
                             {/* TABLA CORREGIDA */}
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
                                                key === 'planned_order_releases' ? 'bg-green-50' : 'bg-white'
                                            }`}>
                                                <td className="p-3 font-medium border border-gray-200 text-gray-800">
                                                    <div className="flex items-center">
                                                        {label}
                                                        <InfoTooltip text={tooltip} />
                                                    </div>
                                                </td>
                                                {editablePmpTable.map((period, i) => {
                                                    const value = period[key];
                                                    const isNegative = key === 'projected_inventory' && value < activePMP.safety_stock;
                                                    
                                                    if (key === 'planned_production_receipt') {
                                                        return (
                                                            <td key={`${key}-${i}`} className={`p-1 border border-gray-200 text-center`}>
                                                                <div className="relative w-24 mx-auto">
                                                                    <input
                                                                        type="number"
                                                                        value={value}
                                                                        // AQUÍ ESTÁ LA CORRECIÓN: int -> parseInt
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
                                                            ${isNegative ? 'text-red-600 font-bold' : ''} 
                                                            ${key === 'scheduled_receipts' && value > 0 ? 'text-green-700' : ''}
                                                            ${key === 'planned_order_releases' && value > 0 ? 'text-green-700 font-bold' : ''}
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