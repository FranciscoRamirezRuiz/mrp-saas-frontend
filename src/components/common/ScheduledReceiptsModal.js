// src/components/common/ScheduledReceiptsModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Loader } from 'lucide-react';
import { API_URL } from '../../api/config';
import { formatDate } from '../../utils/formatDate';

const ScheduledReceiptsModal = ({ item, onClose }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newQuantity, setNewQuantity] = useState(1);

    useEffect(() => {
        const fetchReceipts = async () => {
            if (!item) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/pmp/scheduled-receipts/${item.sku}`);
                if (!response.ok) throw new Error('No se pudieron cargar las recepciones.');
                const data = await response.json();
                setReceipts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReceipts();
    }, [item]);

    const handleAddReceipt = async (e) => {
        e.preventDefault();
        setError('');
        if (newQuantity <= 0) {
            setError('La cantidad debe ser positiva.');
            return;
        }

        const newReceipt = {
            sku: item.sku,
            quantity: newQuantity,
            due_date: newDate,
        };

        try {
            const response = await fetch(`${API_URL}/pmp/scheduled-receipts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReceipt),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al añadir la recepción.');
            }
            const addedReceipt = await response.json();
            setReceipts(prev => [...prev, addedReceipt].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
            // Reset form
            setNewQuantity(1);
            setNewDate(new Date().toISOString().split('T')[0]);
        } catch (err) {
            setError(err.message);
        }
    };

    // NOTA: No implementaremos eliminación desde aquí, ya que el backend no tiene un endpoint
    // para eliminar recepciones individuales. Se añaden y el PMP/MRP las consumirá.

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Recepciones Programadas</h2>
                        <p className="text-gray-600 font-semibold">{item.name} ({item.sku})</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500" /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna 1: Lista de recepciones */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-indigo-600">Órdenes en Curso</h3>
                        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                            {loading && <div className="flex justify-center items-center"><Loader size={16} className="animate-spin text-gray-500" /></div>}
                            {!loading && receipts.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No hay recepciones programadas para este ítem.</p>
                            )}
                            <ul className="divide-y divide-gray-200">
                                {receipts.map((receipt, index) => (
                                    <li key={index} className="py-3 flex justify-between items-center text-sm">
                                        <div>
                                            <span className="font-semibold text-gray-800">{formatDate(receipt.due_date)}</span>
                                        </div>
                                        <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{receipt.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Columna 2: Añadir nueva recepción */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-indigo-600">Añadir Nueva Recepción</h3>
                        <form onSubmit={handleAddReceipt} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Llegada</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    required
                                    className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(parseInt(e.target.value, 10))}
                                    required
                                    className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black"
                                />
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                <Plus size={16} /> Añadir
                            </button>
                            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduledReceiptsModal;