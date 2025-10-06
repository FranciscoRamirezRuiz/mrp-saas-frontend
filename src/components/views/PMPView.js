// src/components/views/PMPView.js
import React, { useState, useEffect } from 'react';
import { Calendar, X, FilterX, HelpCircle, AlertTriangle } from 'lucide-react';
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../api/config';
import Card from '../common/Card';

const PMPView = ({ results, setResults }) => {
    const [products, setProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/?item_type=Producto Terminado`);
                if (!response.ok) throw new Error('No se pudieron cargar los productos.');
                const finishedProducts = await response.json();
                setProducts(finishedProducts);
                if (finishedProducts.length > 0) {
                    setSelectedSku(finishedProducts[0].sku);
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchProducts();
    }, []);

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
            const product = products.find(p => p.sku === selectedSku);
            
            const newPmp = {
                id: `${selectedSku}-${Date.now()}`,
                sku: selectedSku,
                productName: product.name,
                initialInventory: product.in_stock,
                table: data.table,
                originalTable: JSON.parse(JSON.stringify(data.table)) 
            };
            
            setResults(prev => [...prev, newPmp]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProductionChange = (pmpId, periodIndex, value) => {
        setResults(prev => prev.map(pmp => {
            if (pmp.id !== pmpId) return pmp;

            const newTable = [...pmp.table];
            newTable[periodIndex].planned_production_receipt = parseInt(value, 10) || 0;

            for (let i = periodIndex; i < newTable.length; i++) {
                const prevInventory = i === 0 ? pmp.initialInventory : newTable[i - 1].projected_inventory;
                
                newTable[i].initial_inventory = prevInventory;
                newTable[i].projected_inventory = 
                    prevInventory + 
                    newTable[i].planned_production_receipt - 
                    newTable[i].gross_requirements;
            }
            
            return { ...pmp, table: newTable };
        }));
    };

    const handleReset = (pmpId) => {
        setResults(prev => prev.map(pmp => {
            if (pmp.id !== pmpId) return pmp;
            return { ...pmp, table: JSON.parse(JSON.stringify(pmp.originalTable)) };
        }));
    };
    
    const handleClose = (pmpId) => {
        setResults(prev => prev.filter(pmp => pmp.id !== pmpId));
    };

    const TooltipHelper = ({ text, children }) => (
        <span className="group relative">
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {text}
            </span>
        </span>
    );
    
    return (
        <div className="p-8 space-y-8">
            <Card title="Generar Plan Maestro de Producción (PMP)">
                 <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto Terminado</label>
                        <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} className="p-2 border rounded-lg w-full">
                             <option value="">Selecciona un producto...</option>
                            {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <button onClick={handleGeneratePMP} disabled={loading || !selectedSku} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                        <Calendar size={16}/> {loading ? 'Calculando...' : 'Generar y Añadir PMP'}
                    </button>
                 </div>
                 {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
            </Card>

            {results.map((pmp) => (
                 <Card key={pmp.id} title={<span>Plan Maestro para: <span className="text-indigo-600">{pmp.productName} ({pmp.sku})</span></span>}>
                     <div className="absolute top-4 right-4 flex items-center gap-2">
                         <button onClick={() => handleReset(pmp.id)} className="p-2 text-sm font-semibold text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300" title="Restablecer Plan">
                            <FilterX size={16}/>
                        </button>
                        <button onClick={() => handleClose(pmp.id)} className="p-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600" title="Cerrar Plan">
                            <X size={16}/>
                        </button>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Gráfico de Demanda vs. Producción</h4>
                        <ResponsiveContainer width="100%" height={250}>
                             <ComposedChart data={pmp.table} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="gross_requirements" name="Demanda Pronosticada" barSize={20} fill="#8884d8" />
                                <Line type="monotone" dataKey="planned_production_receipt" name="Producción Planificada" stroke="#82ca9d" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                 <tr>
                                     <th className="p-3 font-semibold border border-gray-200">Concepto</th>
                                     {pmp.table.map(period => <th key={period.period} className="p-3 font-semibold border border-gray-200 text-center">{period.period}</th>)}
                                 </tr>
                             </thead>
                             <tbody>
                                <tr className="border-b">
                                     <td className="p-3 font-medium border border-gray-200 bg-gray-50 flex items-center gap-1">
                                         Inventario Proyectado
                                         <TooltipHelper text="Inventario esperado al final del período. Se vuelve rojo si es negativo."><HelpCircle size={14} className="text-gray-400 cursor-pointer"/></TooltipHelper>
                                     </td>
                                     {pmp.table.map((period, index) => (
                                         <td key={index} className={`p-3 border border-gray-200 text-center font-semibold ${period.projected_inventory < 0 ? 'bg-red-100 text-red-800' : ''}`}>{period.projected_inventory}</td>
                                     ))}
                                </tr>
                                <tr className="border-b">
                                     <td className="p-3 font-medium border border-gray-200 bg-gray-50 flex items-center gap-1">
                                         Pronóstico de Demanda
                                          <TooltipHelper text="Necesidades brutas según el pronóstico de ventas."><HelpCircle size={14} className="text-gray-400 cursor-pointer"/></TooltipHelper>
                                     </td>
                                     {pmp.table.map((period, index) => <td key={index} className="p-3 border border-gray-200 text-center">{period.gross_requirements}</td>)}
                                </tr>
                                <tr className="border-b">
                                     <td className="p-3 font-medium border border-gray-200 bg-gray-50 flex items-center gap-1">
                                        Producción Planificada
                                         <TooltipHelper text="Cantidad de producción sugerida. Puedes editarla para simular escenarios."><HelpCircle size={14} className="text-gray-400 cursor-pointer"/></TooltipHelper>
                                     </td>
                                     {pmp.table.map((period, index) => {
                                        const isSuggested = pmp.originalTable && period.planned_production_receipt === pmp.originalTable[index].planned_production_receipt;
                                        return (
                                            <td key={index} className={`p-1 border border-gray-200 text-center ${isSuggested ? 'bg-indigo-50' : 'bg-yellow-50'}`}>
                                                <input 
                                                    type="number" 
                                                    value={period.planned_production_receipt}
                                                    onChange={(e) => handleProductionChange(pmp.id, index, e.target.value)}
                                                    className="w-20 p-2 text-center bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </td>
                                        );
                                     })}
                                </tr>
                             </tbody>
                        </table>
                     </div>
                 </Card>
            ))}
        </div>
    );
};

export default PMPView;