import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, Warehouse, AlertTriangle, RefreshCw, ChevronsRightLeft, Trash2, PlusCircle, Settings, X, Edit2 } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Card from '../common/Card';
import { API_URL } from '../../api/config';

import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import PromptModal from '../common/PromptModal';

const ResponsiveGridLayout = WidthProvider(Responsive);

const KPICard = ({ title, value, icon: Icon, color, tooltip }) => ( <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between border border-gray-200 h-full" title={tooltip}><div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-3xl font-bold text-gray-800">{value}</p></div><div className={`p-3 rounded-full ${color}`}><Icon className="h-6 w-6 text-white" /></div></div> );
const SalesChart = ({ data, color }) => ( <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{fontSize: 10}}/><YAxis /><Tooltip /><Area type="monotone" dataKey="sales" name="Unidades Vendidas" stroke={color} fill={color} /></AreaChart></ResponsiveContainer> );
const ABCAnalysisChart = ({ data }) => ( <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 5 }}><XAxis type="number" hide /><YAxis type="category" dataKey="name" hide /><Tooltip formatter={(value, name) => [value, 'SKUs']} /><Bar dataKey="value" name="Nº de SKUs" background={{ fill: '#eee' }}>{data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart></ResponsiveContainer> );
const InventoryDistributionChart = ({ data }) => { const COLORS = { 'Materia Prima': '#10b981', 'Producto Intermedio': '#f59e0b', 'Producto Terminado': '#3b82f6' }; return ( <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} labelLine={false} label={({ name, percent }) => `${name.substring(0, 10)}...: ${(percent * 100).toFixed(0)}%`}>{data?.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#ccc'} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> ); };


const DashboardView = () => {
    const [widgetData, setWidgetData] = useState({ kpis: {}, sales: [], inventory: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeframe, setTimeframe] = useState(90);
    const [dashboards, setDashboards] = useState(() => JSON.parse(localStorage.getItem('dashboards')) || [{ id: Date.now(), name: 'Dashboard Principal', layouts: {} }]);
    const [activeDashboardId, setActiveDashboardId] = useState(dashboards[0]?.id);
    const [widgetColors, setWidgetColors] = useState(() => JSON.parse(localStorage.getItem('widgetColors')) || {});
    const [widgetNames, setWidgetNames] = useState(() => JSON.parse(localStorage.getItem('widgetNames')) || {});
    const [isAddWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
    const [promptModalState, setPromptModalState] = useState({ isOpen: false });

    const WIDGET_DEFINITIONS = {
        'kpi-turnover': { title: 'Rotación de Inventario', component: KPICard, defaultLayout: { w: 1, h: 1 }},
        'kpi-low-stock': { title: 'Ítems Stock Bajo', component: KPICard, defaultLayout: { w: 1, h: 1 }},
        'kpi-obsolete': { title: 'Ítems Obsoletos', component: KPICard, defaultLayout: { w: 1, h: 1 }},
        'kpi-total-units': { title: 'Total Unidades', component: KPICard, defaultLayout: { w: 1, h: 1 }},
        'sales-chart': { title: `Ventas (últimos ${timeframe} días)`, component: SalesChart, defaultLayout: { w: 2, h: 2 }},
        'abc-analysis': { title: 'Clasificación de Ítems (ABC)', component: ABCAnalysisChart, defaultLayout: { w: 1, h: 2 }},
        'inventory-distribution': { title: 'Distribución de Inventario', component: InventoryDistributionChart, defaultLayout: { w: 1, h: 2 }},
    };

    const fetchData = useCallback(async (days) => {
        try {
            setLoading(true);
            const [kpisRes, salesRes, inventoryRes] = await Promise.all([ fetch(`${API_URL}/dashboard/kpis`), fetch(`${API_URL}/dashboard/sales-over-time?days=${days}`), fetch(`${API_URL}/dashboard/inventory-analysis`), ]);
            if (!kpisRes.ok || !salesRes.ok || !inventoryRes.ok) throw new Error('Faltan datos. Carga Inventario y Ventas.');
            const [kpis, sales, inventory] = await Promise.all([kpisRes.json(), salesRes.json(), inventoryRes.json()]);
            setWidgetData({ kpis, sales: sales.map(d => ({ ...d, date: new Date(d.ds).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) })), inventory });
            setError('');
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(timeframe); }, [timeframe, fetchData]);
    useEffect(() => { localStorage.setItem('dashboards', JSON.stringify(dashboards)); localStorage.setItem('widgetColors', JSON.stringify(widgetColors)); localStorage.setItem('widgetNames', JSON.stringify(widgetNames)); }, [dashboards, widgetColors, widgetNames]);

    const abcAnalysisData = useMemo(() => {
        if (!widgetData.inventory?.abc_analysis) return [];
        const counts = widgetData.inventory.abc_analysis.reduce((acc, item) => { acc[item.class] = (acc[item.class] || 0) + 1; return acc; }, { A: 0, B: 0, C: 0 });
        return [
            { name: 'Clase A', value: counts.A, fill: widgetColors['abc-analysis-A'] || '#10b981' },
            { name: 'Clase B', value: counts.B, fill: widgetColors['abc-analysis-B'] || '#f59e0b' },
            { name: 'Clase C', value: counts.C, fill: widgetColors['abc-analysis-C'] || '#ef4444' },
        ];
    }, [widgetData.inventory, widgetColors]);

    const handleLayoutChange = (layout, newLayouts) => { setDashboards(dashboards.map(d => d.id === activeDashboardId ? { ...d, layouts: newLayouts } : d)); };
    
    const handleAddDashboard = () => {
        setPromptModalState({ isOpen: true, title: 'Crear Nuevo Dashboard', message: 'Introduce un nombre para la nueva pestaña.', inputType: 'text', initialValue: `Dashboard ${dashboards.length + 1}`,
            onSubmit: (name) => {
                if (name) {
                    const newDashboard = { id: Date.now(), name, layouts: {} };
                    setDashboards([...dashboards, newDashboard]);
                    setActiveDashboardId(newDashboard.id);
                }
            }
        });
    };

    const handleRemoveDashboard = (idToRemove) => {
        const dashboardToRemove = dashboards.find(d => d.id === idToRemove);
        setPromptModalState({ isOpen: true, title: 'Eliminar Dashboard', message: `¿Estás seguro de que quieres eliminar "${dashboardToRemove.name}"?`, confirmText: 'Eliminar',
            onSubmit: () => {
                const newDashboards = dashboards.filter(d => d.id !== idToRemove);
                setDashboards(newDashboards);
                if (activeDashboardId === idToRemove) { setActiveDashboardId(newDashboards[0]?.id || null); }
            }
        });
    };
    
    const handleRenameWidget = (widgetId) => {
        const currentName = widgetNames[widgetId] || WIDGET_DEFINITIONS[widgetId].title;
        setPromptModalState({ isOpen: true, title: 'Renombrar Widget', message: 'Introduce el nuevo nombre para el widget.', inputType: 'text', initialValue: currentName,
            onSubmit: (newName) => { if (newName) { setWidgetNames({ ...widgetNames, [widgetId]: newName }); } }
        });
    };

    const handleRemoveWidget = (widgetId) => { setDashboards(currentDashboards => currentDashboards.map(dashboard => { if (dashboard.id === activeDashboardId) { const newLayouts = {}; Object.keys(dashboard.layouts).forEach(breakpoint => { newLayouts[breakpoint] = dashboard.layouts[breakpoint].filter(item => item.i !== widgetId); }); return { ...dashboard, layouts: newLayouts }; } return dashboard; })); };
    
    const handleAddWidget = (widgetId) => { setDashboards(currentDashboards => currentDashboards.map(dashboard => { if (dashboard.id === activeDashboardId) { const currentLayouts = dashboard.layouts || {}; const lgLayout = currentLayouts.lg || []; if (lgLayout.some(item => item.i === widgetId)) return dashboard; const newWidgetLayout = { i: widgetId, x: (lgLayout.length * 2) % 4, y: Infinity, ...WIDGET_DEFINITIONS[widgetId].defaultLayout }; const newLayouts = { ...currentLayouts }; const breakpoints = ['lg', 'md', 'sm', 'xs', 'xxs']; breakpoints.forEach(bp => { newLayouts[bp] = [...(currentLayouts[bp] || []), newWidgetLayout]; }); return { ...dashboard, layouts: newLayouts }; } return dashboard; })); setAddWidgetModalOpen(false); };

    const renderWidget = (widgetId) => {
        const { component: Component } = WIDGET_DEFINITIONS[widgetId];
        const title = widgetNames[widgetId] || WIDGET_DEFINITIONS[widgetId].title;
        let data, props = {};
        switch (widgetId) {
            case 'kpi-turnover': props = { title, value: widgetData.kpis.inventory_turnover, icon: RefreshCw, color: "bg-blue-500" }; break;
            case 'kpi-low-stock': props = { title, value: widgetData.kpis.low_stock_items_count, icon: AlertTriangle, color: "bg-yellow-500" }; break;
            case 'kpi-obsolete': props = { title, value: widgetData.kpis.obsolete_items_count, icon: Trash2, color: "bg-red-500" }; break;
            case 'kpi-total-units': props = { title, value: widgetData.kpis.total_units_in_stock?.toLocaleString(), icon: Warehouse, color: "bg-green-500" }; break;
            case 'sales-chart': data = widgetData.sales; props = { color: widgetColors[widgetId] || '#3b82f6' }; break;
            case 'abc-analysis': data = abcAnalysisData; break;
            case 'inventory-distribution': data = widgetData.inventory?.item_type_distribution; break;
            default: return null;
        }
        return ( <Card title={title} className="h-full flex flex-col relative group"> <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"> <button onClick={() => handleRenameWidget(widgetId)} className="cursor-pointer p-1 bg-gray-200 rounded-full hover:bg-gray-300"><Edit2 size={14} /></button> { (widgetId.includes('chart') || widgetId.includes('distribution')) && <label className="cursor-pointer p-1 bg-gray-200 rounded-full hover:bg-gray-300"><Settings size={14} /><input type="color" value={widgetColors[widgetId] || '#3b82f6'} onChange={(e) => setWidgetColors({...widgetColors, [widgetId]: e.target.value})} className="absolute opacity-0 w-0 h-0"/></label>} <button onClick={() => handleRemoveWidget(widgetId)} className="p-1 bg-red-200 rounded-full hover:bg-red-300"><X size={14} /></button> </div> <div className="drag-handle w-full text-center text-gray-300 cursor-move"><ChevronsRightLeft size={16} className="inline-block"/></div> <div className="flex-grow"> <Component data={data} {...props} /> </div> </Card> );
    };
    
    if (error) return <div className="p-8"><Card title="Dashboard"><p className="text-center text-red-500">{error}</p></Card></div>;
    if (loading) return <div className="p-8"><Card title="Dashboard"><p className="text-center">Cargando datos...</p></Card></div>;

    const currentDashboard = dashboards.find(d => d.id === activeDashboardId);
    
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 border-b border-gray-200">
                    {dashboards.map(d => ( <div key={d.id} className="group relative"> <button onClick={() => setActiveDashboardId(d.id)} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeDashboardId === d.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}> {d.name} </button> {dashboards.length > 1 && <button onClick={() => handleRemoveDashboard(d.id)} className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"> <X size={12} /> </button> } </div> ))}
                    <button onClick={handleAddDashboard} className="p-2 text-gray-500 hover:text-indigo-600"><PlusCircle size={16}/></button>
                </div>
                <div className="flex items-center gap-2">
                    <select value={timeframe} onChange={(e) => setTimeframe(Number(e.target.value))} className="p-2 border rounded-lg text-sm"> <option value={30}>Últimos 30 días</option> <option value={90}>Últimos 90 días</option> <option value={365}>Último Año</option> </select>
                    <button onClick={() => setAddWidgetModalOpen(true)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Añadir Widget</button>
                </div>
            </div>

            <ResponsiveGridLayout layouts={currentDashboard?.layouts || {}} onLayoutChange={handleLayoutChange} breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }} rowHeight={150} draggableHandle=".drag-handle">
                {(currentDashboard?.layouts?.lg || []).map(widget => ( <div key={widget.i}> {renderWidget(widget.i)} </div> ))}
            </ResponsiveGridLayout>

            {isAddWidgetModalOpen && ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"> <h3 className="text-lg font-bold mb-4">Añadir un Widget al Dashboard</h3> <div className="grid grid-cols-2 gap-4"> {Object.entries(WIDGET_DEFINITIONS).map(([id, { title }]) => { const isAdded = currentDashboard?.layouts?.lg?.some(l => l.i === id); return ( <button key={id} onClick={() => handleAddWidget(id)} disabled={isAdded} className="p-4 border rounded-lg text-left disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"> {widgetNames[id] || title} {isAdded && '(Añadido)'} </button> ); })} </div> <button onClick={() => setAddWidgetModalOpen(false)} className="mt-6 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button> </div> </div> )}
            
            <PromptModal {...promptModalState} onClose={() => setPromptModalState({ isOpen: false })} />
        </div>
    );
};

export default DashboardView;

