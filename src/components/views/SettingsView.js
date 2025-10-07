// src/components/views/SettingsView.js
import React, { useState, useEffect } from 'react';
import { Plus, X, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import { API_URL } from '../../api/config';

const SettingsView = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newUnit, setNewUnit] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/settings/`);
                if (!response.ok) throw new Error('No se pudo cargar la configuración.');
                setSettings(await response.json());
            } catch (error) {
                setError('Error al cargar la configuración: ' + error.message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value;
        setSettings(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSave = async () => {
        setMessage('');
        setError('');
        try {
            const response = await fetch(`${API_URL}/settings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!response.ok) throw new Error('Error al guardar la configuración.');
            setMessage('Configuración guardada exitosamente.');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setError(`Error: ${error.message}`);
        }
    };

    const handleAddToList = (listName, value, setValue) => {
        if (!value || settings[listName].includes(value)) return;
        setSettings(prev => ({
            ...prev,
            [listName]: [...prev[listName], value]
        }));
        setValue('');
    };   

    const handleRemoveFromList = (listName, value) => {
        setSettings(prev => ({
            ...prev,
            [listName]: prev[listName].filter(item => item !== value)
        }));
    };

    if (loading) return <div className="p-8 text-center"><Card title="Configuración del Sistema"><p className="text-gray-800">Cargando configuración...</p></Card></div>;
    if (error || !settings) return <div className="p-8 text-center text-red-500"><Card title="Configuración del Sistema"><p>{error || 'No se pudo cargar la configuración.'}</p></Card></div>;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <Card title="Configuración del Sistema">
                
                <div className="mb-8 border-b pb-4">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Información de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                            <input id="company_name" name="company_name" value={settings.company_name} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full bg-white text-black" />
                        </div>
                        <div>
                            <label htmlFor="currency_symbol" className="block text-sm font-medium text-gray-700">Símbolo de Moneda</label>
                            <input id="currency_symbol" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full bg-white text-black" />
                        </div>
                    </div>
                </div>

                <div className="mb-8 border-b pb-4">
                     <h3 className="text-lg font-semibold text-indigo-600 mb-4">Producción e Inventario</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="default_lead_time_days" className="block text-sm font-medium text-gray-700">Lead Time de Compra por Defecto (días)</label>
                            <input type="number" id="default_lead_time_days" name="default_lead_time_days" value={settings.default_lead_time_days} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full bg-white text-black" />
                        </div>
                        <div className="flex items-center pt-6">
                            <input type="checkbox" id="allow_negative_stock" name="allow_negative_stock" checked={settings.allow_negative_stock} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="allow_negative_stock" className="ml-3 block text-sm text-gray-900">Permitir Stock Negativo</label>
                             <span className="group relative ml-2">
                                <HelpCircle size={16} className="text-gray-400 cursor-pointer"/>
                                <span className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Permite que las cantidades de inventario caigan por debajo de cero. Usar con precaución.
                                </span>
                            </span>
                        </div>
                     </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Parámetros de Ítems</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicaciones de Bodega</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Nueva ubicación" className="p-2 border rounded-lg w-full bg-white text-black" />
                                <button onClick={() => handleAddToList('locations', newLocation, setNewLocation)} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                                {settings.locations.map(loc => (
                                    <li key={loc} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg shadow-sm text-gray-800">
                                        {loc}
                                        <button onClick={() => handleRemoveFromList('locations', loc)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidades de Medida</label>
                             <div className="flex items-center gap-2 mt-1">
                                <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Nueva unidad" className="p-2 border rounded-lg w-full bg-white text-black" />
                                <button onClick={() => handleAddToList('units_of_measure', newUnit, setNewUnit)} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                                {settings.units_of_measure.map(unit => (
                                    <li key={unit} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg shadow-sm text-gray-800">
                                        {unit}
                                        <button onClick={() => handleRemoveFromList('units_of_measure', unit)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4">
                    {message && <p className="text-sm text-green-600"><CheckCircle size={16} className="inline mr-1"/>{message}</p>}
                    {error && <p className="text-sm text-red-600"><AlertTriangle size={16} className="inline mr-1"/>{error}</p>}
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Guardar Cambios</button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsView;