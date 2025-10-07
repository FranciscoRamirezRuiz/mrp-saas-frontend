// src/components/views/MRPView.js
import React, { useState } from 'react';
import { X, AlertTriangle, ChevronsRight, ShoppingCart, Package, DollarSign, Calendar, Info } from 'lucide-react';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import { formatDate } from '../../utils/formatDate';

const MRPView = ({ pmpResults }) => {
    const [mrpData, setMrpData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'manufacturing'
    const [selectedPmp, setSelectedPmp] = useState(null);

    const handleCalculateMRP = async (pmp) => {
        setLoading(true);
        setError('');
        setMrpData(null);
        setSelectedPmp(pmp);
        try {
            const payload = { table: pmp.table };
            const response = await fetch(`${API_URL}/mrp/calculate/${pmp.sku}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Error al calcular el MRP para ${pmp.sku}`);
            }
            const data = await response.json();
            setMrpData(data);
            setActiveTab('purchases'); // Default to purchases tab after calculation
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const ActionButton = ({ children }) => (
        <button className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
            {children}
        </button>
    );

    const renderOrdersTable = (orders, type) => {
        if (orders.length === 0) {
            return <p className="text-center text-gray-500 py-8">No hay órdenes de {type === 'purchase' ? 'compra' : 'fabricación'} planificadas.</p>;
        }

        const isPurchase = type === 'purchase';

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-3">Ítem (SKU)</th>
                            <th className="p-3 text-right">Cantidad Requerida</th>
                            <th className="p-3">Fecha de Orden</th>
                            <th className="p-3">Fecha Requerida</th>
                            {isPurchase && <th className="p-3">Proveedor</th>}
                            {isPurchase && <th className="p-3 text-right">Costo Estimado</th>}
                            <th className="p-3">Necesario Para</th>
                            <th className="p-3">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((item, index) => (
                            <tr key={`${item.sku}-${index}`} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-900">{item.name} ({item.sku})</td>
                                <td className="p-3 text-right font-semibold text-indigo-600">{item.quantity} {item.unit_of_measure}</td>
                                <td className="p-3 font-bold text-red-600">{formatDate(item.order_date)}</td>
                                <td className="p-3 text-green-700">{formatDate(item.due_date)}</td>
                                {isPurchase && <td className="p-3">{item.supplier || 'N/A'}</td>}
                                {isPurchase && <td className="p-3 text-right">{item.cost ? `$${item.cost.toFixed(2)}` : 'N/A'}</td>}
                                <td className="p-3 text-xs text-gray-500">{item.pegging}</td>
                                <td className="p-3">
                                    <ActionButton>
                                        {isPurchase ? 'Generar OC' : 'Generar OF'}
                                    </ActionButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };


    return (
        <div className="p-8 space-y-8">
            <Card title="1. Seleccionar Plan Maestro de Producción para el Cálculo MRP">
                {pmpResults.length === 0 ? (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                        <p>No hay Planes Maestros de Producción (PMP) generados.</p>
                        <p className="mt-2 text-sm">Por favor, ve al módulo de <strong>Plan Maestro</strong> para crear uno primero.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pmpResults.map(pmp => (
                            <div key={pmp.id} className={`border p-4 rounded-lg shadow-sm transition-all ${selectedPmp?.id === pmp.id ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'}`}>
                                <h4 className="font-bold text-gray-800">{pmp.productName}</h4>
                                <p className="text-sm text-gray-500 mb-4">{pmp.sku}</p>
                                <button
                                    onClick={() => handleCalculateMRP(pmp)}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700"
                                >
                                    <ChevronsRight size={16}/>
                                    {loading && selectedPmp?.id === pmp.id ? 'Calculando...' : 'Calcular MRP para este Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
            </Card>

            {loading && (
                <Card title="Calculando Requerimientos..."><p className="text-center text-gray-500">Por favor espere, estamos procesando el MRP.</p></Card>
            )}

            {mrpData && selectedPmp && (
                <Card title={`2. Resultados del Plan de Requerimientos para ${selectedPmp.productName}`}>
                     <button onClick={() => setMrpData(null)} className="absolute top-4 right-4 p-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600" title="Cerrar Plan">
                        <X size={16}/>
                    </button>
                    
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex space-x-6">
                            <button 
                                onClick={() => setActiveTab('purchases')}
                                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'purchases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <ShoppingCart size={16} /> Plan de Compras (Materias Primas)
                            </button>
                            <button 
                                onClick={() => setActiveTab('manufacturing')}
                                className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'manufacturing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <Package size={16} /> Plan de Fabricación (Productos Intermedios)
                            </button>
                        </nav>
                    </div>

                    <div>
                        {activeTab === 'purchases' && renderOrdersTable(mrpData.planned_purchase_orders, 'purchase')}
                        {activeTab === 'manufacturing' && renderOrdersTable(mrpData.planned_manufacturing_orders, 'manufacturing')}
                    </div>

                </Card>
            )}
        </div>
    );
};

export default MRPView;