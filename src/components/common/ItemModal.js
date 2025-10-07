// src/components/common/ItemModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_URL } from '../../api/config';

const ItemModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState(item);
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);

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
        const isNumeric = ['reorder_point', 'lead_time_compra', 'lead_time_fabricacion', 'stock_de_seguridad', 'tamano_lote_fijo'].includes(name);
        const finalValue = isNumeric ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Ver / Editar Ítem</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-indigo-600 mb-3">Información General (Solo lectura)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={`SKU: ${formData.sku}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                            <input value={`Nombre: ${formData.name}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                            <input value={`Categoría: ${formData.category}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                            <input value={`Stock Actual: ${formData.in_stock} ${formData.unit_of_measure}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                            <input value={`Tipo: ${formData.item_type}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                            <input value={`Estado: ${formData.status}`} disabled className="p-2 border rounded bg-gray-200 text-sm text-gray-600 font-medium" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Parámetros de Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Crítico (Punto de Reorden)</label>
                                <input type="number" name="reorder_point" value={formData.reorder_point || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock de Seguridad</label>
                                <input type="number" name="stock_de_seguridad" value={formData.stock_de_seguridad || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Parámetros de Planificación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {formData.item_type === 'Materia Prima' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time de Compra (días)</label>
                                    <input type="number" name="lead_time_compra" value={formData.lead_time_compra || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black" />
                                </div>
                            )}
                            {['Producto Intermedio', 'Producto Terminado'].includes(formData.item_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time Fabricación (días)</label>
                                    <input type="number" name="lead_time_fabricacion" value={formData.lead_time_fabricacion || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Política de Lote</label>
                                <select name="politica_lote" value={formData.politica_lote || 'LxL'} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black">
                                    <option className="text-black bg-white" value="LxL">Lote por Lote (LxL)</option>
                                    <option className="text-black bg-white" value="FOQ">Cantidad Fija (FOQ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tamaño de Lote Fijo</label>
                                <input type="number" name="tamano_lote_fijo" value={formData.tamano_lote_fijo || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black" disabled={formData.politica_lote !== 'FOQ'} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Otros Parámetros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                <select name="location" value={formData.location || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black">
                                    <option className="text-black bg-white" value="">Seleccione...</option>
                                    {locations.map(loc => <option className="text-black bg-white" key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                                <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 bg-white text-black">
                                    {units.map(unit => <option className="text-black bg-white" key={unit} value={unit}>{unit}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;