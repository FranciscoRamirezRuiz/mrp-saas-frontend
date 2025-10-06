// src/components/views/MRPView.js
import React, { useState } from 'react';
import { X, AlertTriangle, ChevronsRight } from 'lucide-react';
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import { formatDate } from '../../utils/formatDate';

const MRPView = ({ pmpResults }) => {
    const [mrpData, setMrpData] = useState([]);
    const [loadingSku, setLoadingSku] = useState(null);
    const [error, setError] = useState('');

    const getWeekPeriodString = (dateStr) => {
        try {
            const date = new Date(dateStr);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
            return `Semana ${weekNo}, ${d.getUTCFullYear()}`;
        } catch {
            return null;
        }
    }

    const handleCalculateMRP = async (pmp) => {
        setLoadingSku(pmp.id);
        setError('');
        try {
            const payload = { table: pmp.table };
            const response = await fetch(`${API_URL}/mrp/timeline/${pmp.sku}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Error al calcular el MRP para ${pmp.sku}`);
            }
            const data = await response.json();

            // --- Lógica para procesar datos del gráfico ---
            const requirementsByPeriod = {};
            pmp.table.forEach(p => {
                requirementsByPeriod[p.period] = 0;
            });

            data.timeline.forEach(item => {
                const period = getWeekPeriodString(item.order_by_date);
                if (requirementsByPeriod.hasOwnProperty(period)) {
                    requirementsByPeriod[period]++;
                }
            });

            const chartData = pmp.table.map(pmpPeriod => ({
                period: pmpPeriod.period.replace('Semana ', 'S').replace(', ', '-'),
                "Demanda Proyectada": pmpPeriod.gross_requirements,
                "Órdenes de Compra": requirementsByPeriod[pmpPeriod.period] || 0
            }));
            // --- FIN ---

            const newMrpData = { ...data, pmpId: pmp.id, chartData }; 

            setMrpData(prev => {
                const existingIndex = prev.findIndex(item => item.pmpId === pmp.id);
                if (existingIndex > -1) {
                    const updatedData = [...prev];
                    updatedData[existingIndex] = newMrpData;
                    return updatedData;
                }
                return [...prev, newMrpData];
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingSku(null);
        }
    };
    
    const handleCloseMrp = (sku) => {
        setMrpData(prev => prev.filter(item => item.product_sku !== sku));
    };

    return (
        <div className="p-8 space-y-8">
            <Card title="1. Seleccionar Plan Maestro de Producción para MRP">
                {pmpResults.length === 0 ? (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                        <p>No hay Planes Maestros de Producción (PMP) generados.</p>
                        <p className="mt-2 text-sm">Por favor, ve al módulo de <strong>Plan Maestro</strong> para crear uno primero.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pmpResults.map(pmp => (
                            <div key={pmp.id} className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                                <h4 className="font-bold text-gray-800">{pmp.productName}</h4>
                                <p className="text-sm text-gray-500 mb-4">{pmp.sku}</p>
                                <button
                                    onClick={() => handleCalculateMRP(pmp)}
                                    disabled={loadingSku === pmp.id}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700"
                                >
                                    <ChevronsRight size={16}/>
                                    {loadingSku === pmp.id ? 'Calculando...' : 'Calcular Requerimiento de Materiales'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
            </Card>

            {mrpData.map(mrp => (
                <Card key={mrp.product_sku} title={`2. Cronograma de Requerimientos para ${mrp.product_name}`}>
                     <button onClick={() => handleCloseMrp(mrp.product_sku)} className="absolute top-4 right-4 p-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600" title="Cerrar Plan">
                        <X size={16}/>
                    </button>

                    <div className="mb-8">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Gráfico Comparativo: Demanda vs. Órdenes de Compra</h4>
                        <ResponsiveContainer width="100%" height={250}>
                             <ComposedChart data={mrp.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Demanda Proyectada" barSize={20} fill="#8884d8" />
                                <Line yAxisId="right" type="monotone" dataKey="Órdenes de Compra" stroke="#82ca9d" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {mrp.timeline.length === 0 ? (
                        <p className="text-center text-gray-500">No se encontraron requerimientos de materiales para las producciones planificadas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-sm text-left">
                               <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                   <tr>
                                       <th className="p-3">Materia Prima (SKU)</th>
                                       <th className="p-3 text-right">Cantidad Requerida</th>
                                       <th className="p-3">Fecha de Orden de Compra</th>
                                       <th className="p-3">Fecha de Recepción Requerida</th>
                                       <th className="p-3">Para Producción del</th>
                                       <th className="p-3 text-center">Lead Time Total</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {mrp.timeline.map((item, index) => (
                                       <tr key={`${item.sku}-${index}`} className="border-b hover:bg-gray-50">
                                           <td className="p-3 font-medium text-gray-900">{item.name} ({item.sku})</td>
                                           <td className="p-3 text-right font-semibold text-indigo-600">{item.required_quantity} {item.unit_of_measure}</td>
                                           <td className="p-3 font-bold text-red-600">{formatDate(item.order_by_date)}</td>
                                           <td className="p-3 text-green-700">{formatDate(item.required_by_date)}</td>
                                           <td className="p-3">{formatDate(item.production_start_date)}</td>
                                           <td className="p-3 text-center">{item.total_lead_time} días</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default MRPView;