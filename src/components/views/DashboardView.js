// src/components/views/DashboardView.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Warehouse, AlertTriangle, Trash2 } from 'lucide-react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import StatCard from '../common/StatCard';
import { API_URL } from '../../api/config';

const DashboardView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/items/`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los datos del inventario.');
            }
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const dashboardMetrics = useMemo(() => {
        if (!items || items.length === 0) {
            return { totalSkus: 0, totalUnits: 0, lowStockItems: 0, obsoleteItems: 0 };
        }
        
        const totalUnits = items.reduce((sum, item) => sum + item.in_stock, 0);
        const lowStockItems = items.filter(item => 
            item.reorder_point !== null && item.in_stock <= item.reorder_point
        ).length;
        const obsoleteItems = items.filter(item => item.status === 'Obsoleto').length;

        return {
            totalSkus: items.length,
            totalUnits,
            lowStockItems,
            obsoleteItems,
        };
    }, [items]);
    
    // Datos de ejemplo para el gráfico del dashboard
    const chartData = [
        { name: 'Ene', Ventas: 4000, Inventario: 2400 },
        { name: 'Feb', Ventas: 3000, Inventario: 1398 },
        { name: 'Mar', Ventas: 2000, Inventario: 9800 },
        { name: 'Abr', Ventas: 2780, Inventario: 3908 },
        { name: 'May', Ventas: 1890, Inventario: 4800 },
        { name: 'Jun', Ventas: 2390, Inventario: 3800 },
        { name: 'Jul', Ventas: 3490, Inventario: 4300 },
    ];

    return (
        <div className="p-8 space-y-8">
            {loading ? (
                <Card title="Dashboard General"><p className="text-center">Cargando datos...</p></Card>
            ) : error ? (
                <Card title="Dashboard General"><p className="text-center text-red-500">Error: {error}</p></Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total de SKUs" value={dashboardMetrics.totalSkus} icon={Package} colorClass="bg-indigo-600" />
                        <StatCard title="Unidades en Stock" value={dashboardMetrics.totalUnits.toLocaleString()} icon={Warehouse} colorClass="bg-green-600" />
                        <StatCard title="Ítems Stock Bajo" value={dashboardMetrics.lowStockItems} icon={AlertTriangle} colorClass="bg-yellow-600" />
                        <StatCard title="Ítems Obsoletos" value={dashboardMetrics.obsoleteItems} icon={Trash2} colorClass="bg-gray-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Rendimiento Histórico (Ejemplo)">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4338ca" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInventario" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="Ventas" stroke="#4338ca" fillOpacity={1} fill="url(#colorVentas)" />
                                    <Line type="monotone" dataKey="Inventario" stroke="#ec4899" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>
                        
                        <Card title="Alertas de Inventario: Stock Bajo">
                            <div className="overflow-x-auto h-full">
                            {dashboardMetrics.lowStockItems > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-3">SKU</th><th className="p-3">Nombre</th><th className="p-3">Stock Actual</th><th className="p-3">Stock Crítico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items
                                            .filter(item => item.reorder_point !== null && item.in_stock <= item.reorder_point)
                                            .map(item => (
                                                <tr key={item.sku} className="border-b hover:bg-yellow-50">
                                                    <td className="p-3 font-medium text-yellow-800">{item.sku}</td>
                                                    <td className="p-3">{item.name}</td>
                                                    <td className="p-3 font-bold text-red-600">{item.in_stock} {item.unit_of_measure}</td>
                                                    <td className="p-3">{item.reorder_point}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center p-4 text-green-600 font-medium bg-green-50 rounded-lg">No hay ítems en stock crítico. ¡Todo bajo control!</div>
                            )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardView;