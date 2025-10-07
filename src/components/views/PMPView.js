// src/components/views/PMPView.js
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, HelpCircle, AlertTriangle } from 'lucide-react';
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import SearchableSelect from '../common/SearchableSelect';

const PMPView = ({ results, setResults, skusWithPrediction }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTabId, setActiveTabId] = useState(null);

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
                // Si hay productos con predicción, seleccionar el primero por defecto
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


    const handleGeneratePMP = async () => {
        if (!selectedSku) {
            setError('Por favor, selecciona un producto.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/pmp/calculate/${selectedSku}`, { method: 'POST' });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al generar el PMP.');
            }
            const data = await response.json();
            const product = allProducts.find(p => p.sku === selectedSku);
            
            const newPmp = {
                id: `${selectedSku}-${Date.now()}`,
                sku: selectedSku,
                productName: product.name,
                table: data.table.map(row => ({ ...row, product_sku: selectedSku }))
            };

            // Reemplazar si ya existe un PMP para ese SKU
            const existingIndex = results.findIndex(r => r.sku === selectedSku);
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
        if (!activeTabId) return results.length > 0 ? results[0] : null;
        return results.find(r => r.id === activeTabId);
    }, [activeTabId, results]);

    useEffect(() => {
        if (!activeTabId && results.length > 0) {
            setActiveTabId(results[0].id);
        }
    }, [results, activeTabId]);

    return (
        <div className="p-8 space-y-8">
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
                    <button onClick={handleGeneratePMP} disabled={loading || !selectedSku} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                        <Calendar size={16}/> {loading ? 'Calculando...' : 'Generar / Actualizar PMP'}
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

                    {activePMP && (
                         <div key={activePMP.id} className="space-y-8 animate-fadeIn">
                            <h3 className="text-lg font-bold text-gray-800">Detalle del Plan para: <span className="text-indigo-600">{activePMP.productName}</span></h3>
                            <div className="mb-8">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">Gráfico de Venta vs. Producción</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <ComposedChart data={activePMP.table} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="gross_requirements" name="Venta Pronosticada" barSize={20} fill="#8884d8" />
                                        <Line type="monotone" dataKey="planned_production_receipt" name="Producción Planificada" stroke="#82ca9d" strokeWidth={2} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="p-3 font-semibold border border-gray-200">Concepto</th>
                                            {activePMP.table.map(period => <th key={period.period} className="p-3 font-semibold border border-gray-200 text-center">{period.period}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b"><td className="p-3 font-medium border border-gray-200 bg-gray-50">Inventario Proyectado</td>{activePMP.table.map((p, i) => <td key={i} className={`p-3 border border-gray-200 text-center font-semibold ${p.projected_inventory < 0 ? 'text-red-600' : ''}`}>{p.projected_inventory}</td>)}</tr>
                                        <tr className="border-b"><td className="p-3 font-medium border border-gray-200 bg-gray-50">Pronóstico de Venta</td>{activePMP.table.map((p, i) => <td key={i} className="p-3 border border-gray-200 text-center">{p.gross_requirements}</td>)}</tr>
                                        <tr className="border-b"><td className="p-3 font-medium border border-gray-200 bg-gray-50">Producción Planificada</td>{activePMP.table.map((p, i) => <td key={i} className="p-3 border border-gray-200 text-center">{p.planned_production_receipt}</td>)}</tr>
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