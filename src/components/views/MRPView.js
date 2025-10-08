// src/components/views/MRPView.js
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Calendar, ChevronsRight, RefreshCw, Eye, CheckCircle, ShoppingCart, Package, ChevronDown, Info, Loader } from 'lucide-react';
import { API_URL } from '../../api/config.js';
import Card from '../common/Card.js';
import { formatDate } from '../../utils/formatDate.js';

// Helper to get the week number for a given date
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `Semana ${weekNo}, ${d.getUTCFullYear()}`;
};

// --- Sub-componente para la visualización de la línea de tiempo de órdenes ---
const OrdersTimeline = ({ orders, title, icon: Icon, colorClass }) => {
    const [openWeeks, setOpenWeeks] = useState({});

    const groupedByWeek = useMemo(() => {
        return orders.reduce((acc, order) => {
            const orderDate = new Date(order.order_date);
            const weekKey = getWeekNumber(orderDate);
            if (!acc[weekKey]) {
                acc[weekKey] = [];
            }
            acc[weekKey].push(order);
            return acc;
        }, {});
    }, [orders]);

    const sortedWeeks = useMemo(() => Object.keys(groupedByWeek).sort((a, b) => {
        const aDate = new Date(a.split(', ')[1], 0, (parseInt(a.match(/(\d+)/)[0]) - 1) * 7);
        const bDate = new Date(b.split(', ')[1], 0, (parseInt(b.match(/(\d+)/)[0]) - 1) * 7);
        return aDate - bDate;
    }), [groupedByWeek]);

    const toggleWeek = (weekKey) => {
        setOpenWeeks(prev => ({...prev, [weekKey]: !prev[weekKey]}));
    };

    if (orders.length === 0) {
        return <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
            <Icon className={`mx-auto h-8 w-8 ${colorClass}`} />
            <p className="mt-2 text-sm font-semibold">No hay {title.toLowerCase()}.</p>
        </div>;
    }

    return (
        <div className="space-y-3">
             <h3 className={`text-lg font-semibold flex items-center gap-2 ${colorClass}`}>
                <Icon size={20} /> {title} ({orders.length})
            </h3>
            {sortedWeeks.map((weekKey) => (
                <div key={weekKey} className="border rounded-lg overflow-hidden">
                    <button onClick={() => toggleWeek(weekKey)} className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700">{weekKey}</span>
                        <ChevronDown size={20} className={`transition-transform ${openWeeks[weekKey] ? 'rotate-180' : ''}`} />
                    </button>
                    {openWeeks[weekKey] && (
                        <div className="p-3">
                            {groupedByWeek[weekKey].map((item, i) => {
                                const orderDate = new Date(item.order_date);
                                const dueDate = new Date(item.due_date);
                                const leadTime = Math.ceil((dueDate - orderDate) / (1000 * 60 * 60 * 24));

                                return (
                                    <div key={`${item.sku}-${i}`} className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
                                        <div className="col-span-4">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.sku}</p>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <p className="font-bold text-indigo-600 text-lg">{item.quantity.toFixed(2)}</p>
                                        </div>
                                        <div className="col-span-6">
                                            <div className="relative h-6 bg-gray-200 rounded-full">
                                                <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                                                <div className="absolute -top-5 text-xs font-bold text-red-600" style={{left: '0%'}}>{formatDate(item.order_date)}</div>
                                                <div className="absolute -bottom-5 text-xs text-center w-full">{leadTime > 0 ? `${leadTime} días de lead time` : 'Entrega inmediata'}</div>
                                                <div className="absolute -top-5 text-xs font-bold text-green-700" style={{right: '0%'}}>{formatDate(item.due_date)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const ProductionSummary = ({ pmp, onFetchSummary, summaryData, loading, error }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        if (!isOpen && !summaryData) {
            onFetchSummary();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="border rounded-lg mt-4">
            <button
                onClick={handleToggle}
                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
            >
                <div className="flex items-center gap-2">
                    <Info size={16} className="text-gray-600"/>
                    <span className="font-bold text-gray-700">Resumen de Requerimientos para "{pmp.productName}"</span>
                </div>
                <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="p-4 bg-gray-50">
                    {loading && <div className="flex justify-center items-center gap-2 text-gray-600"><Loader size={16} className="animate-spin"/> Cargando resumen...</div>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {summaryData && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                    <p className="text-sm text-gray-500">Total a Producir</p>
                                    <p className="text-xl font-bold text-indigo-600">{summaryData.quantity_to_produce}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                    <p className="text-sm text-gray-500">Lead Time Máximo</p>
                                    <p className="text-xl font-bold text-red-600">{summaryData.longest_lead_time} días</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                    <p className="text-sm text-gray-500">Materias Primas</p>
                                    <p className="text-xl font-bold text-green-600">{summaryData.raw_material_count}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                    <p className="text-sm text-gray-500">Productos Intermedios</p>
                                    <p className="text-xl font-bold text-yellow-600">{summaryData.intermediate_product_count}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Lista de Componentes Requeridos</h4>
                                <div className="overflow-x-auto max-h-64 border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-200 sticky top-0">
                                            <tr>
                                                <th className="p-2">Componente (SKU)</th>
                                                <th className="p-2">Tipo</th>
                                                <th className="p-2 text-right">Cantidad Total</th>
                                                <th className="p-2 text-right">Lead Time Acumulado (días)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {summaryData.components.map(comp => (
                                                <tr key={comp.sku} className="border-b hover:bg-gray-50">
                                                    <td className="p-2 font-medium">{comp.name} ({comp.sku})</td>
                                                    <td className="p-2">{comp.item_type}</td>
                                                    <td className="p-2 text-right font-semibold">{comp.total_quantity.toFixed(2)} {comp.unit_of_measure}</td>
                                                    <td className="p-2 text-right font-semibold">{comp.cumulative_lead_time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const MRPView = ({ pmpResults }) => {
    const [mrpData, setMrpData] = useState({});
    const [calculatingPmpId, setCalculatingPmpId] = useState(null);
    const [visibleResults, setVisibleResults] = useState({});
    const [error, setError] = useState('');
    const [summaryData, setSummaryData] = useState({});
    const [summaryLoading, setSummaryLoading] = useState({});
    const [summaryError, setSummaryError] = useState({});
    const [timelinesOpen, setTimelinesOpen] = useState({});

    const handleCalculateMRP = async (pmpToCalculate) => {
        setCalculatingPmpId(pmpToCalculate.id);
        setError('');

        try {
            const payload = [{ table: pmpToCalculate.table }];
            const response = await fetch(`${API_URL}/mrp/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Error al calcular MRP para ${pmpToCalculate.productName}.`);
            }
            const data = await response.json();
            
            setMrpData(prev => ({ ...prev, [pmpToCalculate.id]: data }));
            setVisibleResults(prev => ({ ...prev, [pmpToCalculate.id]: true }));
            // Automatically fetch summary after calculating MRP
            fetchProductionSummary(pmpToCalculate);
        } catch (err) {
            setError(err.message);
        } finally {
            setCalculatingPmpId(null);
        }
    };
    
    const handleCalculateAll = async () => {
        setCalculatingPmpId('all');
        setError('');
        
        try {
            if (pmpResults.length === 0) throw new Error("No hay Planes Maestros para calcular.");
            
            const payload = pmpResults.map(pmp => ({ table: pmp.table }));
            const response = await fetch(`${API_URL}/mrp/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al calcular MRP global.');
            }
            
            const globalMrpData = await response.json();
            
            setMrpData(prev => ({ ...prev, global: globalMrpData }));
            setVisibleResults(prev => ({...prev, global: true}));
        } catch (err) {
            setError(err.message);
        } finally {
            setCalculatingPmpId(null);
        }
    };
    
    const fetchProductionSummary = async (pmp) => {
        setSummaryLoading(prev => ({ ...prev, [pmp.id]: true }));
        setSummaryError(prev => ({ ...prev, [pmp.id]: null }));

        const totalProduction = pmp.table.reduce((sum, row) => sum + row.planned_production_receipt, 0);

        try {
            const response = await fetch(`${API_URL}/mrp/summary/${pmp.sku}?quantity=${totalProduction}`);
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al obtener el resumen.');
            }
            const data = await response.json();
            setSummaryData(prev => ({ ...prev, [pmp.id]: data }));
        } catch (err) {
            setSummaryError(prev => ({ ...prev, [pmp.id]: err.message }));
        } finally {
            setSummaryLoading(prev => ({ ...prev, [pmp.id]: false }));
        }
    };


    const toggleVisibility = (pmpId) => {
        setVisibleResults(prev => ({ ...prev, [pmpId]: !prev[pmpId] }));
    };

    const toggleTimelines = (pmpId) => {
        setTimelinesOpen(prev => ({...prev, [pmpId]: !prev[pmpId]}));
    };

    return (
        <div className="p-8 space-y-8">
            <Card title="Centro de Planificación de Requerimientos (MRP)">
                <p className="mb-6 text-gray-600">
                    Selecciona un Plan Maestro de Producción (PMP) para generar sus requerimientos de materiales y fabricación, o calcula un plan consolidado para todos los PMPs activos.
                </p>
                {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
                
                <div className="space-y-4">
                    {pmpResults.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">No hay PMPs activos para procesar.</p>
                            <p className="text-sm text-gray-400 mt-2">Ve al módulo de "Plan Maestro" para generar uno.</p>
                        </div>
                    ) : (
                        pmpResults.map(pmp => (
                            <div key={pmp.id} className="border rounded-lg shadow-sm">
                                <div className="p-4 bg-white flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-lg text-indigo-700">{pmp.productName}</p>
                                        <p className="text-sm text-gray-500">Plan Maestro de Producción</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {mrpData[pmp.id] ? (
                                             <span className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                <CheckCircle size={16} /> Calculado
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-sm font-semibold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                                <RefreshCw size={16} className={calculatingPmpId === pmp.id || calculatingPmpId === 'all' ? 'animate-spin' : ''} /> Pendiente
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleCalculateMRP(pmp)}
                                            disabled={!!calculatingPmpId}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700"
                                        >
                                            <ChevronsRight size={16}/>
                                            {calculatingPmpId === pmp.id ? 'Calculando...' : mrpData[pmp.id] ? 'Recalcular' : 'Calcular MRP'}
                                        </button>
                                        {mrpData[pmp.id] && (
                                            <button onClick={() => toggleVisibility(pmp.id)} className="p-2 rounded-lg hover:bg-gray-200">
                                                <Eye size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {visibleResults[pmp.id] && mrpData[pmp.id] && (
                                     <div className="p-4 border-t bg-gray-50 space-y-4">
                                        <ProductionSummary
                                            pmp={pmp}
                                            onFetchSummary={() => fetchProductionSummary(pmp)}
                                            summaryData={summaryData[pmp.id]}
                                            loading={summaryLoading[pmp.id]}
                                            error={summaryError[pmp.id]}
                                        />
                                        
                                        <div className="border rounded-lg">
                                            <button onClick={() => toggleTimelines(pmp.id)} className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Recomendaciones de Órdenes (Semanales)</span>
                                                <ChevronDown size={20} className={`transition-transform ${timelinesOpen[pmp.id] ? 'rotate-180' : ''}`} />
                                            </button>
                                            {timelinesOpen[pmp.id] && (
                                                <div className="p-4 space-y-6">
                                                    <OrdersTimeline orders={mrpData[pmp.id].planned_purchase_orders} title="Recomendaciones de Compra" icon={ShoppingCart} colorClass="text-green-600" />
                                                    <OrdersTimeline orders={mrpData[pmp.id].planned_manufacturing_orders} title="Recomendaciones de Fabricación" icon={Package} colorClass="text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                     </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {pmpResults.length > 1 && (
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan Consolidado</h3>
                        <p className="text-sm text-gray-600 mb-4">Calcula el requerimiento total para todos los PMPs activos en un solo plan.</p>
                        <button
                            onClick={handleCalculateAll}
                            disabled={!!calculatingPmpId}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg disabled:bg-gray-400 hover:bg-gray-800"
                        >
                            <Calendar size={16}/> {calculatingPmpId === 'all' ? 'Calculando...' : 'Calcular Plan Global'}
                        </button>
                         {visibleResults['global'] && mrpData['global'] && (
                             <div className="mt-4 p-4 border bg-gray-50 rounded-lg space-y-6">
                                <h3 className="font-bold text-lg text-gray-800">Resultados del Plan Global Consolidado</h3>
                                <OrdersTimeline orders={mrpData['global'].planned_purchase_orders} title="Recomendaciones de Compra" icon={ShoppingCart} colorClass="text-green-600" />
                                <OrdersTimeline orders={mrpData['global'].planned_manufacturing_orders} title="Recomendaciones de Fabricación" icon={Package} colorClass="text-blue-600" />
                             </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MRPView;