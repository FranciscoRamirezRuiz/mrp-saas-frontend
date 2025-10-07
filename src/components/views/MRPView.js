// src/components/views/MRPView.js
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Package, AlertTriangle, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import { formatDate } from '../../utils/formatDate';
import PromptModal from '../common/PromptModal';

const MRPView = ({ pmpResults }) => {
    const [mrpData, setMrpData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('purchases');
    const [isPdfModalOpen, setPdfModalOpen] = useState(false);

    // Generar rangos de fechas para el selector del PDF
    const dateRanges = useMemo(() => {
        const ranges = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const startDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const endDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
            ranges.push({
                label: `${startDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`,
                value: `${startDate.toISOString().split('T')[0]}|${endDate.toISOString().split('T')[0]}`
            });
        }
        return ranges;
    }, []);

    const handleCalculateMRP = async () => {
        setLoading(true);
        setError('');
        setMrpData(null);

        try {
            if (pmpResults.length === 0) {
                throw new Error("No hay Planes Maestros de Producción (PMP) generados para calcular los requerimientos.");
            }
            
            const payload = pmpResults.map(pmp => ({ table: pmp.table }));

            const response = await fetch(`${API_URL}/mrp/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al calcular las recomendaciones de MRP.');
            }
            const data = await response.json();
            setMrpData(data);
        } catch (err) {
            const errorMessage = typeof err.message === 'string' ? err.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = (dateRange) => {
        if (!mrpData || !dateRange) return;
        const [startDate, endDate] = dateRange.split('|');
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Reporte de Recomendaciones MRP', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Período: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 30);

        // Filtrar datos para el PDF
        const purchases = mrpData.planned_purchase_orders.filter(o => o.order_date >= startDate && o.order_date <= endDate);
        const manufacturing = mrpData.planned_manufacturing_orders.filter(o => o.order_date >= startDate && o.order_date <= endDate);

        if (purchases.length > 0) {
            autoTable(doc, {
                startY: 40,
                head: [['Recomendaciones de Compra']],
                body: [],
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] },
            });
            autoTable(doc, {
                head: [['Ítem (SKU)', 'Cantidad', 'Fecha Orden', 'Fecha Requerida']],
                body: purchases.map(o => [
                    `${o.name} (${o.sku})`, 
                    `${o.quantity}`, 
                    formatDate(o.order_date), 
                    formatDate(o.due_date)
                ]),
                startY: (doc).lastAutoTable.finalY,
            });
        }

        if (manufacturing.length > 0) {
             autoTable(doc, {
                startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40,
                head: [['Fabricaciones Recomendadas']],
                body: [],
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] },
            });
            autoTable(doc, {
                head: [['Ítem (SKU)', 'Cantidad', 'Fecha Inicio', 'Fecha Fin']],
                body: manufacturing.map(o => [
                    `${o.name} (${o.sku})`,
                    `${o.quantity}`,
                    formatDate(o.order_date),
                    formatDate(o.due_date)
                ]),
                startY: (doc).lastAutoTable.finalY,
            });
        }
        
        doc.save(`MRP_Recomendaciones_${startDate}_a_${endDate}.pdf`);
    };

    const DateRangeModal = ({ isOpen, onClose, onSubmit }) => {
        const [selectedRange, setSelectedRange] = useState(dateRanges[0]?.value || '');
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Seleccionar Período para PDF</h3>
                    <p className="text-sm text-gray-600 mb-4">Elige el mes que deseas incluir en el reporte.</p>
                    <select 
                        value={selectedRange} 
                        onChange={e => setSelectedRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4 text-black"
                    >
                        {dateRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300">Cancelar</button>
                        <button type="button" onClick={() => onSubmit(selectedRange)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Generar PDF</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrdersTable = (orders, type) => {
        const isPurchase = type === 'purchase';
        const title = isPurchase ? 'Recomendaciones de Compra' : 'Fabricaciones Recomendadas';
        
        if (orders.length === 0) {
            return <p className="text-center text-gray-500 py-8">No hay {title.toLowerCase()} para mostrar.</p>;
        }

        return (
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3">Ítem (SKU)</th>
                                <th className="p-3 text-right">Cantidad</th>
                                <th className="p-3">Fecha de Orden (Lanzamiento)</th>
                                <th className="p-3">Fecha Requerida (Llegada)</th>
                                <th className="p-3">Necesario Para</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((item, index) => (
                                <tr key={`${item.sku}-${index}`} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-900">{item.name} ({item.sku})</td>
                                    <td className="p-3 text-right font-semibold text-indigo-600">{item.quantity}</td>
                                    <td className="p-3 font-bold text-red-600">{formatDate(item.order_date)}</td>
                                    <td className="p-3 text-green-700">{formatDate(item.due_date)}</td>
                                    <td className="p-3 text-xs text-gray-500">{item.pegging}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 space-y-8">
            <Card title="Plan de Requerimiento de Materiales (MRP)">
                <div className="flex flex-col items-center justify-center text-center">
                    <p className="mb-4 text-gray-600">Calcula todas las necesidades de compra y fabricación basadas en los PMP activos.</p>
                    <button
                        onClick={handleCalculateMRP}
                        disabled={loading || pmpResults.length === 0}
                        className="flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700 shadow-lg"
                    >
                        <Calendar size={18}/> {loading ? 'Calculando...' : 'Calcular Todas las Recomendaciones'}
                    </button>
                    {pmpResults.length === 0 && !loading && (
                        <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>
                            No hay PMPs activos. Por favor, crea un Plan Maestro de Producción primero.
                        </p>
                    )}
                     {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
                </div>
            </Card>

            <DateRangeModal isOpen={isPdfModalOpen} onClose={() => setPdfModalOpen(false)} onSubmit={(range) => { setPdfModalOpen(false); handleGeneratePDF(range); }} />

            {(mrpData || loading) && (
                <Card>
                    {loading ? (
                        <p className="text-center text-gray-500 py-8">Calculando recomendaciones...</p>
                    ) : (
                        <>
                            <div className="flex justify-between items-center border-b border-gray-200 mb-4">
                                <nav className="-mb-px flex space-x-6">
                                    <button onClick={() => setActiveTab('purchases')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'purchases' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                                        <ShoppingCart size={16} /> Recomendaciones de Compra ({mrpData.planned_purchase_orders.length})
                                    </button>
                                    <button onClick={() => setActiveTab('manufacturing')} className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'manufacturing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                                        <Package size={16} /> Fabricaciones Recomendadas ({mrpData.planned_manufacturing_orders.length})
                                    </button>
                                </nav>
                                <button
                                    onClick={() => setPdfModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                                >
                                    <Download size={16} /> Generar Reporte PDF
                                </button>
                            </div>
                            <div>
                                {activeTab === 'purchases' && renderOrdersTable(mrpData.planned_purchase_orders, 'purchase')}
                                {activeTab === 'manufacturing' && renderOrdersTable(mrpData.planned_manufacturing_orders, 'manufacturing')}
                            </div>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
};

export default MRPView;