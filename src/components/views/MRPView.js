// src/components/views/MRPView.js
import React, { useState, useMemo, useEffect } from 'react';
import { 
    AlertTriangle, ChevronsRight, ShoppingCart, Package, Loader, 
    FileDown, LayoutDashboard, List, ArrowUpDown, CheckCircle, FilterX, X // Añadido X
} from 'lucide-react';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import { formatDate } from '../../utils/formatDate';
import SearchableSelect from '../common/SearchableSelect';
import StatCard from '../common/StatCard';

// --- Componente de Resumen de Producción (Sin cambios) ---
const ProductionSummary = ({ summaryData, loading, error }) => {
    const groupedComponents = useMemo(() => {
        if (!summaryData || !summaryData.components) return {};
        return summaryData.components.reduce((acc, comp) => {
            const type = comp.item_type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(comp);
            return acc;
        }, {});
    }, [summaryData]);

    const componentTypes = {
        'Materia Prima': 'Materias Primas',
        'Producto Intermedio': 'Productos Intermedios',
    };

    if (loading) {
        return <div className="flex justify-center items-center gap-2 text-gray-600 p-4"><Loader size={16} className="animate-spin"/> Cargando resumen...</div>;
    }
    if (error) {
        return <p className="text-red-500 text-sm p-4">{error}</p>;
    }
    if (!summaryData) {
        return <p className="text-gray-500 text-sm p-4">Selecciona un PMP para ver su resumen de requerimientos.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border">
                    <p className="text-sm text-gray-500">Total a Producir</p>
                    <p className="text-2xl font-bold text-indigo-600">{summaryData.quantity_to_produce.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border">
                    <p className="text-sm text-gray-500">Lead Time Máximo</p>
                    <p className="text-2xl font-bold text-red-600">{summaryData.longest_lead_time} días</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border">
                    <p className="text-sm text-gray-500">Materias Primas</p>
                    <p className="text-2xl font-bold text-green-600">{summaryData.raw_material_count}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border">
                    <p className="text-sm text-gray-500">P. Intermedios</p>
                    <p className="text-2xl font-bold text-yellow-600">{summaryData.intermediate_product_count}</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {Object.entries(groupedComponents).map(([type, components]) => (
                    <div key={type}>
                        <h4 className="font-semibold text-gray-700 mb-2">{componentTypes[type] || type} ({components.length})</h4>
                        <div className="overflow-x-auto max-h-64 border rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-200 sticky top-0">
                                    <tr>
                                        <th className="p-2">Componente (SKU)</th>
                                        <th className="p-2 text-right">Cantidad Total</th>
                                        <th className="p-2 text-right">Lead Time Acumulado (días)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white text-gray-800">
                                    {components.map(comp => (
                                        <tr key={comp.sku} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{comp.name} ({comp.sku})</td>
                                            <td className="p-2 text-right font-semibold">{comp.total_quantity.toFixed(2)} {comp.unit_of_measure}</td>
                                            <td className="p-2 text-right font-semibold">{comp.cumulative_lead_time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Tooltip personalizado para el Gantt (Sin cambios) ---
const GanttTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Obtenemos las fechas originales del objeto de datos
        const start = formatDate(data.original_order_date);
        const end = formatDate(data.original_due_date);
        const leadTime = Math.ceil((new Date(data.original_due_date) - new Date(data.original_order_date)) / (1000 * 60 * 60 * 24));

        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
                <p className="font-bold text-gray-800 mb-1">{data.name}</p>
                <p className="text-gray-600"><span className="font-semibold">Tipo:</span> {data.type}</p>
                <p className="text-red-600"><span className="font-semibold">Lanzar:</span> {start}</p>
                <p className="text-green-600"><span className="font-semibold">Recibir:</span> {end}</p>
                <p className="text-gray-600"><span className="font-semibold">Lead Time:</span> {leadTime} días</p>
            </div>
        );
    }
    return null;
};

// --- Gráfico de Gantt (Sin cambios) ---
const MrpGanttChart = ({ data, dateRange }) => {
    const ganttData = useMemo(() => {
        // Volvemos a la lógica de una barra por orden
        return data.map((order, index) => ({
            name: `${order.name} (${order.sku})`, 
            id: `${order.sku}-${order.order_date}-${index}`,
            // Usamos getTime() para los valores numéricos que necesita el gráfico
            timeline: [
                new Date(order.order_date).getTime(),
                new Date(order.due_date).getTime()
            ],
            // Guardamos las fechas originales para el tooltip
            original_order_date: order.order_date,
            original_due_date: order.due_date,
            type: order.item_type === 'Materia Prima' ? 'Compra' : 'Fabricación'
        })).sort((a, b) => a.timeline[0] - b.timeline[0]); // Ordenar por fecha de inicio
    }, [data]);

    const domain = useMemo(() => {
        // Usamos el rango de fechas del filtro para que el eje X sea consistente
        const min = dateRange.min ? new Date(dateRange.min).getTime() : new Date(ganttData[0]?.timeline[0]).getTime();
        const max = dateRange.max ? new Date(dateRange.max).getTime() : new Date(ganttData[ganttData.length - 1]?.timeline[1]).getTime();
        return [min, max];
    }, [ganttData, dateRange]);

    const chartHeight = Math.max(400, ganttData.length * 35); // 35px por barra

    return (
        <div className="overflow-y-auto" style={{ maxHeight: '500px' }}> {/* Contenedor con scroll */}
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={ganttData} layout="vertical" margin={{ left: 100, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        type="number" 
                        domain={domain} 
                        scale="time" 
                        tickFormatter={(ts) => formatDate(ts, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={150}
                        tick={{ fontSize: 10 }} // Letra más pequeña si hay muchos
                        interval={0} // Asegura que se muestren todas las etiquetas
                    />
                    <Tooltip content={<GanttTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                    <Bar dataKey="timeline" minPointSize={2}>
                        {ganttData.map((entry) => (
                            <Cell key={entry.id} fill={entry.type === 'Compra' ? '#10b981' : '#3b82f6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Tabla detallada de órdenes (Sin cambios) ---
const OrdersTable = ({ orders }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'ascending' });

    const sortedOrders = useMemo(() => {
        let sortableItems = [...orders];
        sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key] ?? '';
            const valB = b[sortConfig.key] ?? '';
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [orders, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ children, sortKey }) => (
        <th className="p-3 cursor-pointer hover:bg-gray-200" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown size={14} className={sortConfig.key === sortKey ? 'text-gray-800' : 'text-gray-400'} />
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <SortableHeader sortKey="order_date">Fecha Lanzamiento</SortableHeader>
                        <SortableHeader sortKey="due_date">Fecha Vencimiento</SortableHeader>
                        <SortableHeader sortKey="sku">SKU</SortableHeader>
                        <SortableHeader sortKey="name">Nombre</SortableHeader>
                        <SortableHeader sortKey="item_type">Tipo de Orden</SortableHeader>
                        <SortableHeader sortKey="quantity">Cantidad</SortableHeader>
                    </tr>
                </thead>
                <tbody className="text-gray-800">
                    {sortedOrders.map((order, index) => {
                        const isPurchase = order.item_type === 'Materia Prima';
                        return (
                            <tr key={`${order.sku}-${index}`} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-red-600">{formatDate(order.order_date)}</td>
                                <td className="p-3 font-medium text-green-600">{formatDate(order.due_date)}</td>
                                <td className="p-3 font-semibold">{order.sku}</td>
                                <td className="p-3">{order.name}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPurchase ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {isPurchase ? 'Compra' : 'Fabricación'}
                                    </span>
                                </td>
                                <td className="p-3 font-bold text-indigo-600 text-right">{order.quantity.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


// --- Componente Principal de la Vista MRP (MODIFICADO) ---
const MRPView = ({ pmpResults, mrpResults, setMrpResults }) => { // Recibe props de App.js
    const [selectedPmpId, setSelectedPmpId] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loadingMrp, setLoadingMrp] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [error, setError] = useState('');
    const [summaryError, setSummaryError] = useState('');
    
    // --- NUEVO: Estado para la pestaña activa de MRP (no la sub-pestaña) ---
    const [activeMrpId, setActiveMrpId] = useState(null);

    // Estado para las sub-pestañas (dashboard/list)
    const [activeSubTab, setActiveSubTab] = useState('dashboard');

    // --- Estado para el filtro de fechas ---
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    // --- Estado para el rango min/max de los inputs de fecha ---
    const [dateRange, setDateRange] = useState({ min: '', max: '' });
    
    // Transforma los PMP results para el SearchableSelect
    const pmpOptions = useMemo(() => 
        pmpResults.map(pmp => ({
            sku: pmp.id, // Usamos el ID único del PMP como 'sku' para el selector
            name: pmp.productName,
            item_type: `SKU: ${pmp.sku}`, // Mostramos el SKU real aquí
            unit_of_measure: '' // No es necesario aquí
        })), [pmpResults]
    );
    
    const selectedPmp = useMemo(() => {
        return pmpResults.find(p => p.id === selectedPmpId);
    }, [selectedPmpId, pmpResults]);
    
    // --- MODIFICADO: Lee el resultado de MRP activo desde el array `mrpResults` ---
    const activeMrpResult = useMemo(() => {
        // Si no hay ID activo, pero hay resultados, activa el primero
        if (!activeMrpId && mrpResults.length > 0) {
            setActiveMrpId(mrpResults[0].id);
            return mrpResults[0];
        }
        return mrpResults.find(r => r.id === activeMrpId);
    }, [mrpResults, activeMrpId]);

    // Los datos del MRP activo (órdenes)
    const activeMrpData = useMemo(() => activeMrpResult?.data, [activeMrpResult]);
    // El resumen del PMP asociado a ese MRP
    const activeSummaryData = useMemo(() => activeMrpResult?.summary, [activeMrpResult]);

    // --- Lista base de todas las órdenes generadas (del MRP activo) ---
    const allGeneratedOrders = useMemo(() => {
        if (!activeMrpData) return [];
        return [
            ...activeMrpData.planned_purchase_orders, 
            ...activeMrpData.planned_manufacturing_orders
        ];
    }, [activeMrpData]);

    // --- MODIFICADO: Sincroniza el estado del filtro cuando cambia el *MRP activo* ---
    useEffect(() => {
        if (allGeneratedOrders.length > 0) {
            const minDate = allGeneratedOrders.reduce((min, o) => new Date(o.order_date) < min ? new Date(o.order_date) : min, new Date(allGeneratedOrders[0].order_date));
            const maxDate = allGeneratedOrders.reduce((max, o) => new Date(o.due_date) > max ? new Date(o.due_date) : max, new Date(allGeneratedOrders[0].due_date));
            
            const minDateStr = minDate.toISOString().split('T')[0];
            const maxDateStr = maxDate.toISOString().split('T')[0];
            
            setDateRange({ min: minDateStr, max: maxDateStr });
            // Setea el filtro por defecto al rango total del MRP activo
            setDateFilter({ start: minDateStr, end: maxDateStr });
        } else {
            // Limpia los filtros si no hay resultado
            setDateFilter({ start: '', end: '' });
            setDateRange({ min: '', max: '' });
        }
    }, [allGeneratedOrders]); // Se ejecuta CADA VEZ que `allGeneratedOrders` cambia (o sea, al cambiar de pestaña)

    // Carga el resumen de producción en cuanto se selecciona un PMP
    useEffect(() => {
        const fetchProductionSummary = async () => {
            if (!selectedPmp) {
                setSummary(null);
                setSummaryError('');
                return;
            }

            // Si ya existe un MRP calculado para este PMP, no necesitamos el resumen de "staging"
            const existingMrp = mrpResults.find(r => r.id === selectedPmp.id);
            if (existingMrp) {
                setSummary(null);
                setSummaryError('');
                setActiveMrpId(existingMrp.id); // Activa la pestaña existente
                return;
            }

            setLoadingSummary(true);
            setSummaryError('');
            setSummary(null); // Limpia el resumen anterior

            const totalProduction = selectedPmp.table.reduce((sum, row) => sum + row.planned_production_receipt, 0);
            
            if (totalProduction === 0) {
                 setSummaryError('El PMP seleccionado no tiene producción planificada. No se puede calcular MRP.');
                 setLoadingSummary(false);
                 setSummary(null);
                 return;
            }

            try {
                const response = await fetch(`${API_URL}/mrp/summary/${selectedPmp.sku}?quantity=${totalProduction}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Error al obtener el resumen.');
                }
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setSummaryError(err.message);
            } finally {
                setLoadingSummary(false);
            }
        };

        fetchProductionSummary();
    }, [selectedPmp, mrpResults]); // Depende de mrpResults para saber si debe mostrarse

    // --- NUEVA: Función para cerrar pestañas ---
    const handleCloseTab = (idToClose) => {
        setMrpResults(prev => prev.filter(r => r.id !== idToClose));
        if (activeMrpId === idToClose) {
            const remainingTabs = mrpResults.filter(r => r.id !== idToClose);
            setActiveMrpId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
        }
    };

    // Función para calcular el MRP
    const handleCalculateMRP = async () => {
        if (!selectedPmp || !summary) return; // Requiere el PMP y el resumen

        setLoadingMrp(true);
        setError('');

        try {
            const payload = [{ table: selectedPmp.table }];
            const response = await fetch(`${API_URL}/mrp/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Error al calcular MRP.`);
            }
            const data = await response.json();

            // --- MODIFICADO: Guarda el resultado en el array de App.js ---
            const newMrpResult = {
                id: selectedPmp.id, // El ID único es el ID del PMP del que se origina
                productName: selectedPmp.productName,
                data: data, // El resultado del cálculo (órdenes)
                summary: summary, // El resumen que ya habíamos cargado
            };

            setMrpResults(prev => {
                const existingIndex = prev.findIndex(r => r.id === newMrpResult.id);
                let newResults;
                if (existingIndex > -1) {
                    // Actualiza el existente
                    newResults = [...prev];
                    newResults[existingIndex] = newMrpResult;
                } else {
                    // Añade uno nuevo
                    newResults = [...prev, newMrpResult];
                }
                return newResults;
            });

            setActiveMrpId(newMrpResult.id); // Activa la pestaña
            setActiveSubTab('dashboard'); // Pone por defecto la sub-pestaña de dashboard
            setSummary(null); // Limpia el resumen de "staging"
            // --- FIN MODIFICADO ---
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingMrp(false);
        }
    };
    
    // Función para exportar
    const handleExport = async (format) => {
        if (!selectedPmp) return; // Sigue basándose en el PMP seleccionado (debería ser el activo)
        
        // --- MODIFICADO: Asegurarse de exportar el PMP de la pestaña activa ---
        const pmpToExport = pmpResults.find(p => p.id === activeMrpId);
        if (!pmpToExport) {
            setError('No se encuentra el PMP activo para exportar.');
            return;
        }

        setError('');
        const endpoint = format === 'csv' ? '/mrp/export/csv' : '/mrp/export/pdf';
        
        try {
            const payload = [{ table: pmpToExport.table }];
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Error al exportar ${format.toUpperCase()}.`);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `plan_requerimientos_${pmpToExport.sku}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Handler para el filtro de fecha ---
    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilter(prev => ({ ...prev, [name]: value }));
    };

    // --- Órdenes filtradas por fecha ---
    const filteredOrders = useMemo(() => {
        if (!allGeneratedOrders.length) return [];
        if (!dateFilter.start || !dateFilter.end) {
            return allGeneratedOrders;
        }
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return allGeneratedOrders.filter(order => {
            const orderDate = new Date(order.order_date);
            const dueDate = new Date(order.due_date);
            const startsBeforeEnd = orderDate <= endDate;
            const endsAfterStart = dueDate >= startDate;
            return startsBeforeEnd && endsAfterStart;
        });
    }, [allGeneratedOrders, dateFilter]);

    // --- Gráfico de pastel (basado en las órdenes filtradas) ---
    const pieData = useMemo(() => {
        if (!filteredOrders) return [];
        const purchases = filteredOrders.filter(o => o.item_type === 'Materia Prima').length;
        const manufacturing = filteredOrders.filter(o => o.item_type !== 'Materia Prima').length;
        return [
            { name: 'Recomendación de materias primas', value: purchases, fill: '#10b981' },
            { name: 'Recomendación de fabricación', value: manufacturing, fill: '#3b82f6' }
        ];
    }, [filteredOrders]);


    return (
        <div className="p-8 space-y-6">
            <Card title="Plan de Requerimiento de Materiales (MRP)">
                <p className="mb-4 text-gray-600">
                    Selecciona un Plan Maestro de Producción (PMP) para analizar sus requerimientos y generar las Recomendación de materias primas y fabricación necesarias.
                </p>
                {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
                
                {pmpResults.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">No hay Planes Maestros (PMP) para procesar.</p>
                        <p className="text-sm text-gray-400 mt-2">Ve al módulo de "Plan Maestro" para generar uno.</p>
                    </div>
                ) : (
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Maestro (PMP)</label>
                            <SearchableSelect
                                options={pmpOptions}
                                value={selectedPmpId}
                                onChange={(id) => setSelectedPmpId(id)}
                                placeholder="Selecciona un PMP..."
                            />
                        </div>
                        <button
                            onClick={handleCalculateMRP}
                            disabled={loadingMrp || loadingSummary || !selectedPmp || !!summaryError}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700"
                        >
                            {loadingMrp ? <Loader size={16} className="animate-spin" /> : <ChevronsRight size={16}/>}
                            {loadingMrp ? 'Calculando...' : mrpResults.find(r => r.id === selectedPmpId) ? 'Recalcular MRP' : 'Calcular MRP'}
                        </button>
                    </div>
                )}
            </Card>

            {/* --- Resumen del PMP Seleccionado (Staging Area) --- */}
            {/* --- MODIFICADO: Solo se muestra si hay un PMP seleccionado Y NO existe ya un resultado de MRP para él --- */}
            {selectedPmp && !mrpResults.find(r => r.id === selectedPmpId) && (
                <Card title={`Resumen de Producción para "${selectedPmp.productName}"`}>
                    <ProductionSummary
                        summaryData={summary}
                        loading={loadingSummary}
                        error={summaryError}
                    />
                </Card>
            )}

            {/* --- NUEVO: Barra de Pestañas de Resultados MRP --- */}
            {mrpResults.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-b-2 border-gray-200 pb-2">
                    {mrpResults.map(mrp => (
                        <button
                            key={mrp.id}
                            onClick={() => setActiveMrpId(mrp.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                                activeMrpId === mrp.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {mrp.productName}
                            <X 
                                size={16} 
                                className={`p-1 rounded-full ml-1 ${
                                    activeMrpId === mrp.id ? 'hover:bg-indigo-700' : 'hover:bg-gray-400'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseTab(mrp.id);
                                }} 
                            />
                        </button>
                    ))}
                </div>
            )}


            {/* --- MODIFICADO: Resultados del MRP (Ahora depende del activeMrpId) --- */}
            {activeMrpResult && activeMrpData && activeSummaryData && (
                <div key={activeMrpResult.id} className="space-y-6 animate-fadeIn">
                    
                    {/* --- Card 1: Resumen de Producción del MRP Activo --- */}
                    <Card title={`Resumen de Producción para "${activeMrpResult.productName}"`}>
                        <ProductionSummary
                            summaryData={activeSummaryData}
                            loading={false}
                            error={null}
                        />
                    </Card>

                    {/* --- Card 2: Resultados del Cálculo MRP del MRP Activo --- */}
                    <Card title="Resultados del Cálculo MRP">
                        {/* Pestañas de Navegación (Sub-pestañas) */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="-mb-px flex space-x-6">
                                <button 
                                    onClick={() => setActiveSubTab('dashboard')}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeSubTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <LayoutDashboard size={16} /> Resumen Gráfico
                                </button>
                                <button 
                                    onClick={() => setActiveSubTab('list')}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeSubTab === 'list' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <List size={16} /> Lista Detallada de Órdenes
                                </button>
                            </nav>
                        </div>

                        {/* Filtro de RANGO DE FECHAS */}
                        <div className="p-4 bg-gray-50 border rounded-lg mb-6">
                            <h4 className="font-semibold text-gray-700 mb-3">Filtrar por Rango de Fechas</h4>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-600">Desde (Fecha de Lanzamiento)</label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        name="start"
                                        value={dateFilter.start}
                                        min={dateRange.min}
                                        max={dateRange.max}
                                        onChange={handleDateFilterChange}
                                        className="p-2 border rounded-lg w-full mt-1 bg-white text-black"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-600">Hasta (Fecha de Vencimiento)</label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        name="end"
                                        value={dateFilter.end}
                                        min={dateRange.min}
                                        max={dateRange.max}
                                        onChange={handleDateFilterChange}
                                        className="p-2 border rounded-lg w-full mt-1 bg-white text-black"
                                    />
                                </div>
                                <button 
                                    onClick={() => setDateFilter({ start: dateRange.min, end: dateRange.max })} 
                                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                    title="Limpiar filtro de fechas"
                                >
                                    <FilterX size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Contenido de la Sub-Pestaña */}
                        {activeSubTab === 'dashboard' ? (
                            <div className="space-y-8">
                                {/* KPIs (Totales, no filtrados, leen de activeMrpData) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <StatCard 
                                        title="Recomendación de materias primas (Total)" 
                                        value={activeMrpData.planned_purchase_orders.length} 
                                        icon={ShoppingCart} 
                                        colorClass="bg-green-500" 
                                    />
                                    <StatCard 
                                        title="Recomendación de fabricación (Total)" 
                                        value={activeMrpData.planned_manufacturing_orders.length} 
                                        icon={Package} 
                                        colorClass="bg-blue-500" 
                                    />
                                    <StatCard 
                                        title="Total de Órdenes (Total)" 
                                        value={allGeneratedOrders.length} 
                                        icon={CheckCircle} 
                                        colorClass="bg-indigo-500" 
                                    />
                                </div>

                                {/* Gráficos (Pastel y Gantt) - FILTRADOS */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Órdenes por Tipo (Filtradas)</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie 
                                                    data={pieData} 
                                                    dataKey="value" 
                                                    nameKey="name" 
                                                    cx="50%" 
                                                    cy="50%" 
                                                    outerRadius={80} 
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {pieData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Línea de Tiempo de Órdenes (Filtrada)</h3>
                                        {filteredOrders.length > 0 ? (
                                            <MrpGanttChart 
                                                data={filteredOrders} 
                                                dateRange={{
                                                    min: dateFilter.start || dateRange.min,
                                                    max: dateFilter.end || dateRange.max
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                No hay órdenes en este rango de fechas.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-end gap-2 mb-4">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    >
                                        <FileDown size={14}/> Exportar (Todo)
                                    </button>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        <FileDown size={14}/> Exportar (Todo)
                                    </button>
                                </div>
                                <OrdersTable orders={filteredOrders} />
                            </div>
                        )}

                    </Card>
                </div>
            )}
        </div>
    );
};

export default MRPView;