// src/components/common/FileUploadModal.js
import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_URL } from '../../api/config';

// --- MODIFICADO: Añadido onUploadSuccess a los props ---
const FileUploadModal = ({ onClose, fetchItems, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleFileUpload = async () => {
        if (!file) {
            setError('Por favor, selecciona un archivo CSV.');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/items/upload`, { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.detail.replace(/\n/g, '<br/>');
                const errorElement = document.createElement('div');
                errorElement.innerHTML = errorDetail;
                setError(errorElement.textContent || errorElement.innerText);
                return;
            }
            setMessage(data.message);
            
            // --- NUEVO: Llamar al callback con el resumen ---
            if (data.summary && onUploadSuccess) {
                onUploadSuccess(data.summary);
            }
            
            fetchItems();
            setTimeout(() => onClose(), 2000);
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Importar Archivo CSV de Ítems</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Sube un archivo CSV con las columnas requeridas: sku, name, category, in_stock, item_type.
                        Opcionalmente, incluye 'Lead Time de Compra', 'Lead Time de Fabricación', 'Stock de Seguridad', 'Punto de Reorden', etc.
                    </p>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                    <button onClick={handleFileUpload} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                        <Upload size={16}/> {loading ? 'Cargando...' : 'Cargar Archivo'}
                    </button>
                    {message && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg"><CheckCircle size={16} className="inline mr-2"/>{message}</p>}
                    {error && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg whitespace-pre-wrap"><AlertTriangle size={16} className="inline mr-2"/>{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;