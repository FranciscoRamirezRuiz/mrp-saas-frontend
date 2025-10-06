// src/components/common/BulkEditModal.js
import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { API_URL } from '../../api/config';

const BulkEditModal = ({ onClose, onSave, selectedItems }) => {
    const [fieldsToUpdate, setFieldsToUpdate] = useState({
        reorder_point: '',
        location: '',
        unit_of_measure: '',
        lead_time_compra: '',
        lead_time_fabricacion: '',
    });
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const showLeadTimeCompra = useMemo(() =>
        selectedItems.some(item => item.item_type === 'Materia Prima'),
        [selectedItems]
    );
    const showLeadTimeFabricacion = useMemo(() =>
        selectedItems.some(item => ['Producto Intermedio', 'Producto Terminado'].includes(item.item_type)),
        [selectedItems]
    );

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_URL}/settings/`);
                const settings = await response.json();
                setLocations(settings.locations || []);
                setUnits(settings.units_of_measure || []);
            } catch (error) {
                console.error("Error cargando la configuración:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFieldsToUpdate(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const updates = Object.entries(fieldsToUpdate).reduce((acc, [key, value]) => {
            if (value !== '') {
                const isNumeric = ['reorder_point', 'lead_time_compra', 'lead_time_fabricacion'].includes(key);
                acc[key] = isNumeric ? parseInt(value, 10) : value;
            }
            return acc;
        }, {});

        if (Object.keys(updates).length === 0) {
            alert("No se ha modificado ningún campo.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(updates);
            setSuccessMessage('¡Ítems actualizados exitosamente!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            // El error ya se maneja en el componente padre
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Editar {selectedItems.length} Ítems</h2>
                    <button onClick={onClose} disabled={isSaving || successMessage}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                {successMessage ? (
                    <div className="text-center p-4">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4 text-lg font-medium text-gray-700">{successMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Completa solo los campos que deseas actualizar para todos los ítems seleccionados. Los campos vacíos no se modificarán.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Crítico</label>
                                <input
                                    type="number" name="reorder_point" value={fieldsToUpdate.reorder_point} onChange={handleChange}
                                    placeholder="No cambiar" className="p-2 border border-gray-300 rounded-lg w-full mt-1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                <select name="location" value={fieldsToUpdate.location} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1">
                                    <option value="">No cambiar</option>
                                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                                <select name="unit_of_measure" value={fieldsToUpdate.unit_of_measure} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1">
                                    <option value="">No cambiar</option>
                                    {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                                </select>
                            </div>
                            {showLeadTimeCompra && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time Compra</label>
                                    <input
                                        type="number" name="lead_time_compra" value={fieldsToUpdate.lead_time_compra} onChange={handleChange}
                                        placeholder="No cambiar" className="p-2 border border-gray-300 rounded-lg w-full mt-1"
                                    />
                                </div>
                            )}
                            {showLeadTimeFabricacion && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time Fabricación</label>
                                    <input
                                        type="number" name="lead_time_fabricacion" value={fieldsToUpdate.lead_time_fabricacion} onChange={handleChange}
                                        placeholder="No cambiar" className="p-2 border border-gray-300 rounded-lg w-full mt-1"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 pt-6">
                            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors">Cancelar</button>
                            <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                                {isSaving ? 'Guardando...' : `Aplicar a ${selectedItems.length} ítems`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkEditModal;