import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, X, Edit, Trash2, Search, FileDown, Upload, GitMerge, Plus, LineChart as LineChartIcon, HelpCircle, ArrowUpDown, FilterX, CheckCircle, Warehouse, Menu, ChevronDown, AlertTriangle, PlusCircle, ChevronRight, Component, Combine, Sliders } from 'lucide-react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart } from 'recharts';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// URL base de la API backend
const API_URL = 'http://127.0.0.1:8000';

// --- COMPONENTES ATÓMICOS, DE DISEÑO Y UTILIDADES ---

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-shadow duration-300 ${className}`}>
    {title && <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{title}</h3>}
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card className="flex items-center p-6 space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </Card>
);

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full">
            <p className="text-lg mb-6 text-gray-800">{message}</p>
            <div className="flex justify-end gap-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Confirmar</button>
            </div>
        </div>
    </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder = "Seleccionar...", disabled = false }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({ item_type: '', unit_of_measure: '' });
    const wrapperRef = useRef(null);
    
    const selectedOption = options.find(opt => opt.sku === value);

    const uniqueTypes = useMemo(() => [...new Set(options.map(opt => opt.item_type).filter(Boolean))], [options]);
    const uniqueUnits = useMemo(() => [...new Set(options.map(opt => opt.unit_of_measure).filter(Boolean))], [options]);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            (query === '' || opt.sku.toLowerCase().includes(query.toLowerCase()) || opt.name.toLowerCase().includes(query.toLowerCase())) &&
            (filters.item_type === '' || opt.item_type === filters.item_type) &&
            (filters.unit_of_measure === '' || opt.unit_of_measure === filters.unit_of_measure)
        );
    }, [query, filters, options]);

    const handleSelect = (sku) => {
        onChange(sku);
        setIsOpen(false);
        setQuery('');
        setFilters({ item_type: '', unit_of_measure: '' });
    };
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);


    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-2 border rounded-lg text-left flex justify-between items-center ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            >
                {selectedOption ? (
                    <div className="text-sm">
                        <span className="font-semibold text-gray-800">{selectedOption.name}</span>
                        <span className="text-gray-500 ml-2">({selectedOption.sku})</span>
                    </div>
                ) : <span className="text-gray-500">{placeholder}</span>}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder="Buscar por SKU o nombre..."
                            className="w-full p-2 border rounded-lg mb-2"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="flex gap-2 text-xs">
                            <select 
                                value={filters.item_type} 
                                onChange={e => setFilters(f => ({...f, item_type: e.target.value}))}
                                className="w-1/2 p-1 border rounded"
                            >
                                <option value="">Todo tipo</option>
                                {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <select 
                                value={filters.unit_of_measure}
                                onChange={e => setFilters(f => ({...f, unit_of_measure: e.target.value}))}
                                className="w-1/2 p-1 border rounded"
                            >
                                <option value="">Toda unidad</option>
                                {uniqueUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    <ul>
                        {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                            <li
                                key={opt.sku}
                                onClick={() => handleSelect(opt.sku)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer text-sm"
                            >
                                <div className="font-semibold text-gray-800">{opt.name} ({opt.sku})</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Tipo: <span className="font-medium">{opt.item_type}</span> | Unidad: <span className="font-medium">{opt.unit_of_measure}</span>
                                </div>
                            </li>
                        )) : <li className="p-3 text-sm text-gray-500">No se encontraron ítems.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};

const formatDate = (dateString) => {
    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) {
             const datetime = new Date(dateString);
             return datetime.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { 
        if (typeof dateString === 'string') {
            const parts = dateString.split('T')[0].split('-');
            if (parts.length === 3) {
                 return `${parts[2]}/${parts[1]}`
            }
        }
        return dateString; 
    }
};

const parseCSV = (csvText) => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length === 0) return { headers: [], data: [] };
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
            return obj;
        }, {});
    });
    return { headers, data };
};


// --- COMPONENTE HOME / PANTALLA DE INICIO ---

const HomeView = ({ onStart }) => {
    return (
        <div 
            className="relative flex flex-col items-center justify-center min-h-screen text-white p-8 overflow-hidden"
            style={{ 
                backgroundImage: 'url("background_network.png")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-slate-900/80 z-0"></div> 
            
            <main className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
                <section className="text-center my-16 md:my-20">
                    <div className="inline-block filter 
                                drop-shadow-[0_0_15px_rgba(79,70,229,0.6)] 
                                mb-6 
                                transition-all duration-300 ease-in-out 
                                hover:scale-105 
                                hover:drop-shadow-[0_0_25px_rgba(129,140,248,0.7)]">
                        <img 
                            src="Icono_PlanFly2.png" 
                            alt="Logo PlanFly" 
                            className="w-auto h-72" 
                        />
                    </div>

                    <h1 
                        className="text-6xl font-bold text-slate-100 tracking-widest uppercase"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                        Planifica Hoy Lo Que Tu Empresa Necesitará Mañana
                    </h1>

                    <button
                        onClick={() => onStart()}
                        className="mt-10 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full 
                                shadow-lg transition-all duration-300 
                                transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                    >
                        Empezar Ahora
                    </button>
                </section>

                <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 my-16 md:my-20">
                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <BrainCircuit className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Predicción Inteligente</h3>
                        <p className="text-slate-300 text-sm">Utilizamos modelos de ML para pronosticar la demanda con precisión, reduciendo el riesgo de stockout o exceso de inventario.</p>
                    </div>
                    
                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <Calendar className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">PMP y MRP Optimizado</h3>
                        <p className="text-slate-300 text-sm">Gestiona tu Plan Maestro de Producción y calcula los requerimientos de materiales en tiempo real.</p>
                    </div>

                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <Package className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Visibilidad Total</h3>
                        <p className="text-slate-300 text-sm">Control centralizado del inventario, BOMs y rutas de materiales para una cadena de suministro ágil.</p>
                    </div>
                </section>
            </main>
            
            <footer className="z-10 w-full max-w-5xl mx-auto py-8 mt-16 border-t border-slate-700
                               flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} PlanFLY. Todos los derechos reservados.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="/#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <a href="/#" className="hover:text-white transition-colors">Términos de Servicio</a>
                </div>
            </footer>
        </div>
    );
};

// --- MODALES Y DIÁLOGOS ---

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
        const { name, value, type } = e.target;
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
                            <input value={`SKU: ${formData.sku}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                            <input value={`Nombre: ${formData.name}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                            <input value={`Categoría: ${formData.category}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                            <input value={`Stock Actual: ${formData.in_stock} ${formData.unit_of_measure}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                            <input value={`Tipo: ${formData.item_type}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                            <input value={`Estado: ${formData.status}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Parámetros de Inventario</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Crítico (Punto de Reorden)</label>
                                <input type="number" name="reorder_point" value={formData.reorder_point || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock de Seguridad</label>
                                <input type="number" name="stock_de_seguridad" value={formData.stock_de_seguridad || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Parámetros de Planificación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {formData.item_type === 'Materia Prima' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time de Compra (días)</label>
                                    <input type="number" name="lead_time_compra" value={formData.lead_time_compra || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1" />
                                </div>
                            )}
                            {['Producto Intermedio', 'Producto Terminado'].includes(formData.item_type) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lead Time Fabricación (días)</label>
                                    <input type="number" name="lead_time_fabricacion" value={formData.lead_time_fabricacion || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Política de Lote</label>
                                <select name="politica_lote" value={formData.politica_lote || 'LxL'} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1">
                                    <option value="LxL">Lote por Lote (LxL)</option>
                                    <option value="FOQ">Cantidad Fija (FOQ)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tamaño de Lote Fijo</label>
                                <input type="number" name="tamano_lote_fijo" value={formData.tamano_lote_fijo || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1" disabled={formData.politica_lote !== 'FOQ'} />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-indigo-600 mb-3">Otros Parámetros</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                                <select name="location" value={formData.location || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1">
                                    <option value="">Seleccione...</option>
                                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                                <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1">
                                    {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
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
            // Error is already handled in the parent component
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


const FileUploadModal = ({ onClose, fetchItems }) => {
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
                    <h2 className="text-2xl font-bold text-gray-800">Importar Archivo CSV</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="space-y-4">
                    {/* --- MODIFICADO: Actualizar texto de ayuda para importación --- */}
                    <p className="text-sm text-gray-600">
                        Sube un archivo CSV con las columnas requeridas: sku, name, category, in_stock, item_type.
                        Opcionalmente, incluye 'Lead Time de Compra' y/o 'Lead Time de Fabricación'.
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


// --- VISTA DASHBOARD ---
const DashboardView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/items/`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los datos del inventario.');
            }
            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const dashboardMetrics = useMemo(() => {
        if (!items || items.length === 0) {
            return { totalSkus: 0, totalUnits: 0, lowStockItems: 0, obsoleteItems: 0 };
        }
        
        const totalUnits = items.reduce((sum, item) => sum + item.in_stock, 0);
        const lowStockItems = items.filter(item => 
            item.reorder_point !== null && item.in_stock <= item.reorder_point
        ).length;
        const obsoleteItems = items.filter(item => item.status === 'Obsoleto').length;

        return {
            totalSkus: items.length,
            totalUnits,
            lowStockItems,
            obsoleteItems,
        };
    }, [items]);
    
    // Dummy data for chart in dashboard (since the API doesn't provide this chart data)
    const chartData = [
        { name: 'Ene', Ventas: 4000, Inventario: 2400 },
        { name: 'Feb', Ventas: 3000, Inventario: 1398 },
        { name: 'Mar', Ventas: 2000, Inventario: 9800 },
        { name: 'Abr', Ventas: 2780, Inventario: 3908 },
        { name: 'May', Ventas: 1890, Inventario: 4800 },
        { name: 'Jun', Ventas: 2390, Inventario: 3800 },
        { name: 'Jul', Ventas: 3490, Inventario: 4300 },
    ];


    return (
        <div className="p-8 space-y-8">
            {loading ? (
                <Card title="Dashboard General"><p className="text-center">Cargando datos...</p></Card>
            ) : error ? (
                <Card title="Dashboard General"><p className="text-center text-red-500">Error: {error}</p></Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total de SKUs" value={dashboardMetrics.totalSkus} icon={Package} colorClass="bg-indigo-600" />
                        <StatCard title="Unidades en Stock" value={dashboardMetrics.totalUnits.toLocaleString()} icon={Warehouse} colorClass="bg-green-600" />
                        <StatCard title="Ítems Stock Bajo" value={dashboardMetrics.lowStockItems} icon={AlertTriangle} colorClass="bg-yellow-600" />
                        <StatCard title="Ítems Obsoletos" value={dashboardMetrics.obsoleteItems} icon={Trash2} colorClass="bg-gray-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Rendimiento Histórico (Ejemplo)">
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4338ca" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInventario" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="Ventas" stroke="#4338ca" fillOpacity={1} fill="url(#colorVentas)" />
                                    <Line type="monotone" dataKey="Inventario" stroke="#ec4899" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Card>
                        
                        <Card title="Alertas de Inventario: Stock Bajo">
                            <div className="overflow-x-auto h-full">
                            {dashboardMetrics.lowStockItems > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="p-3">SKU</th><th className="p-3">Nombre</th><th className="p-3">Stock Actual</th><th className="p-3">Stock Crítico</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items
                                            .filter(item => item.reorder_point !== null && item.in_stock <= item.reorder_point)
                                            .map(item => (
                                                <tr key={item.sku} className="border-b hover:bg-yellow-50">
                                                    <td className="p-3 font-medium text-yellow-800">{item.sku}</td>
                                                    <td className="p-3">{item.name}</td>
                                                    <td className="p-3 font-bold text-red-600">{item.in_stock} {item.unit_of_measure}</td>
                                                    <td className="p-3">{item.reorder_point}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center p-4 text-green-600 font-medium bg-green-50 rounded-lg">No hay ítems en stock crítico. ¡Todo bajo control!</div>
                            )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

// --- VISTA GESTIÓN DE ÍTEMS ---
const initialFilters = {
    status: '',
    critical_stock: false,
    item_type: '',
    unit_of_measure: '',
    location: ''
};

const ItemsView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [selectedSkus, setSelectedSkus] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    // --- MODIFICADO: Estado para el modal de confirmación de eliminación masiva ---
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);


    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/settings/`);
            if (!response.ok) throw new Error('Error al cargar la configuración.');
            const settings = await response.json();
            setLocations(settings.locations || []);
            setUnits(settings.units_of_measure || []);
        } catch (err) {
            console.error(err.message);
        }
    }, []);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filters.status) params.append('status', filters.status);
            if (filters.critical_stock) params.append('critical_stock', filters.critical_stock);
            if (filters.item_type) params.append('item_type', filters.item_type);
            if (filters.unit_of_measure) params.append('unit_of_measure', filters.unit_of_measure);
            if (filters.location) params.append('location', filters.location);
            
            const response = await fetch(`${API_URL}/items/?${params.toString()}`);
            if (!response.ok) throw new Error('Error al cargar.');
            const data = await response.json();
            setItems(data);
            setSelectedSkus(prev => prev.filter(sku => data.some(item => item.sku === sku)));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters]);

    useEffect(() => {
        fetchSettings();
        fetchItems();
    }, [fetchItems, fetchSettings]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const clearFilters = () => {
        setFilters(initialFilters);
        setSearchQuery('');
    };

    const handleUpdateItem = async (itemData) => {
        try {
            const { sku, name, category, in_stock, item_type, status, ...fieldsToUpdate } = itemData;

            const response = await fetch(`${API_URL}/items/${itemData.sku}`, { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(fieldsToUpdate) 
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar.');
            setItemToEdit(null); 
            fetchItems();
        } catch (err) { alert(`Error: ${err.message}`); }
    };
    
    const handleStatusChange = (item, newStatus) => {
        const updatePayload = { status: newStatus };
        
        fetch(`${API_URL}/items/${item.sku}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(updatePayload) 
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al actualizar estado.');
            fetchItems();
        })
        .catch(err => alert(`Error: ${err.message}`));
    };

    const handleDeleteItem = async (sku) => {
        try {
            const response = await fetch(`${API_URL}/items/${sku}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Error al eliminar.');
            setItemToDelete(null); 
            setSelectedSkus(prev => prev.filter(id => id !== sku));
            fetchItems();
        } catch(err) { alert(`Error: ${err.message}`); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSkus(items.map(item => item.sku));
        } else {
            setSelectedSkus([]);
        }
    };

    const handleSelectItem = (sku) => {
        setSelectedSkus(prev => 
            prev.includes(sku) ? prev.filter(id => id !== sku) : [...prev, sku]
        );
    };
    
    // --- MODIFICADO: Separar la lógica de confirmación y ejecución de la eliminación masiva ---
    const handleBulkDelete = () => {
        setIsBulkDeleteConfirmOpen(true);
    };

    const executeBulkDelete = async () => {
        try {
            await fetch(`${API_URL}/items/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skus: selectedSkus })
            });
            setSelectedSkus([]);
            fetchItems();
        } catch (err) {
            alert(`Error al eliminar en masa: ${err.message}`);
        } finally {
            setIsBulkDeleteConfirmOpen(false);
        }
    };
    
    const handleBulkStatusChange = async (status) => {
         try {
            await fetch(`${API_URL}/items/bulk-update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skus: selectedSkus, status: status })
            });
            setSelectedSkus([]);
            fetchItems();
        } catch (err) {
            alert(`Error al actualizar estado en masa: ${err.message}`);
        }
    };

    const handleBulkEdit = async (fieldsToUpdate) => {
        try {
            const updatePromises = selectedSkus.map(sku =>
                fetch(`${API_URL}/items/${sku}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fieldsToUpdate),
                }).then(res => {
                    if (!res.ok) {
                        return res.json().then(err => Promise.reject({ sku, detail: err.detail }));
                    }
                    return res.json();
                })
            );
            
            await Promise.all(updatePromises);
            setIsBulkEditModalOpen(false);
            setSelectedSkus([]);
            fetchItems();
        } catch (err) {
            alert(`Error en la edición masiva: ${err.message || 'Falló la actualización para ' + err.sku}`);
            throw err;
        }
    };
    
    const selectedItemsObjects = useMemo(() => 
        items.filter(item => selectedSkus.includes(item.sku)),
        [items, selectedSkus]
    );

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ children, sortKey }) => (
        <th className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown size={14} className={sortConfig.key === sortKey ? 'text-gray-800' : 'text-gray-300'} />
            </div>
        </th>
    );

    // --- MODIFICADO: Añadir nuevos lead times a las cabeceras de exportación ---
    const exportHeaders = [
        { label: "SKU", key: "sku" }, { label: "Nombre", key: "name" }, { label: "Categoría", key: "category" },
        { label: "En Stock", key: "in_stock" }, { label: "Unidad", key: "unit_of_measure" }, { label: "Ubicación", key: "location" },
        { label: "Tipo", key: "item_type" }, { label: "Estado", key: "status" }, 
        { label: "Lead Time de Compra", key: "lead_time_compra" }, 
        { label: "Lead Time de Fabricación", key: "lead_time_fabricacion" }
    ];

    const handlePdfExport = () => {
        const doc = new jsPDF();
        const exportBody = items.map(item => exportHeaders.map(h => item[h.key] ?? 'N/A'));
        autoTable(doc, {
            head: [exportHeaders.map(h => h.label)],
            body: exportBody,
        });
        doc.save('inventario.pdf');
    };
    
    return (
        <div className="p-8">
            {itemToEdit && <ItemModal item={itemToEdit} onClose={() => setItemToEdit(null)} onSave={handleUpdateItem} />}
            {isFileModalOpen && <FileUploadModal onClose={() => setIsFileModalOpen(false)} fetchItems={fetchItems} />}
            {itemToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el ítem ${itemToDelete.sku}?`} onConfirm={() => handleDeleteItem(itemToDelete.sku)} onCancel={() => setItemToDelete(null)} />}
            {isBulkEditModalOpen && <BulkEditModal onClose={() => setIsBulkEditModalOpen(false)} onSave={handleBulkEdit} selectedItems={selectedItemsObjects} />}
            {/* --- MODIFICADO: Renderizar el modal de confirmación --- */}
            {isBulkDeleteConfirmOpen && (
                <ConfirmationModal
                    message={`¿Seguro que quieres eliminar los ${selectedSkus.length} ítems seleccionados? Esta acción no se puede deshacer.`}
                    onConfirm={executeBulkDelete}
                    onCancel={() => setIsBulkDeleteConfirmOpen(false)}
                />
            )}

            <Card title="Gestión de Ítems e Inventario">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-2 w-full md:w-1/3">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchItems()} placeholder="Buscar por SKU o Nombre..." className="p-2 border rounded-lg w-full" />
                        <button onClick={() => fetchItems()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Search size={20}/></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePdfExport} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"><FileDown size={16}/>PDF</button>
                        <CSVLink data={items} headers={exportHeaders} filename={"inventario.csv"} className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"><FileDown size={16}/>CSV</CSVLink>
                        <button onClick={() => setIsFileModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <Upload size={16}/>Importar Ítems
                        </button>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner mb-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-lg">
                            <option value="">Filtrar por Estado</option>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                            <option value="Obsoleto">Obsoleto</option>
                        </select>
                        <select name="item_type" value={filters.item_type} onChange={handleFilterChange} className="p-2 border rounded-lg">
                            <option value="">Filtrar por Tipo</option>
                            <option value="Materia Prima">Materia Prima</option>
                            <option value="Producto Intermedio">Producto Intermedio</option>
                            <option value="Producto Terminado">Producto Terminado</option>
                        </select>
                        <select name="unit_of_measure" value={filters.unit_of_measure} onChange={handleFilterChange} className="p-2 border rounded-lg">
                            <option value="">Unidad de Medida</option>
                            {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                        <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded-lg">
                            <option value="">Ubicación</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <div className="flex items-center">
                            <input type="checkbox" id="critical_stock" name="critical_stock" checked={filters.critical_stock} onChange={handleFilterChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                            <label htmlFor="critical_stock" className="ml-2 block text-sm text-gray-900">Stock Crítico</label>
                        </div>
                         <button onClick={clearFilters} className="flex items-center justify-center gap-2 p-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            <FilterX size={16}/>Limpiar Filtros
                        </button>
                    </div>
                </div>

                {selectedSkus.length > 0 && (
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 p-3 rounded-lg mb-6 flex justify-between items-center">
                        <span className="font-semibold">{selectedSkus.length} ítem(s) seleccionado(s)</span>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsBulkEditModalOpen(true)} className="flex items-center gap-2 px-3 py-1 text-sm text-blue-800 bg-blue-200 rounded-lg font-semibold hover:bg-blue-300"><Edit size={14}/>Editar Seleccionados</button>
                            <div className="border-l h-6 border-blue-300"></div>
                            <span className="text-sm">Cambiar estado a:</span>
                            <button onClick={() => handleBulkStatusChange('Activo')} className="px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600">Activo</button>
                            <button onClick={() => handleBulkStatusChange('Inactivo')} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Inactivo</button>
                            <button onClick={() => handleBulkStatusChange('Obsoleto')} className="px-2 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600">Obsoleto</button>
                            <div className="border-l h-6 border-blue-300"></div>
                            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-lg font-semibold hover:bg-red-200"><Trash2 size={14}/>Eliminar Seleccionados</button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3 w-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedSkus.length > 0 && selectedSkus.length === items.length && items.length > 0} /></th>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Nombre</th>
                                <SortableHeader sortKey="item_type">Tipo de Prod.</SortableHeader>
                                <SortableHeader sortKey="unit_of_measure">En Stock</SortableHeader>
                                <SortableHeader sortKey="location">Ubicación</SortableHeader>
                                <SortableHeader sortKey="status">Estado</SortableHeader>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan="8" className="text-center p-4">Cargando...</td></tr>) 
                            : error ? (<tr><td colSpan="8" className="text-center text-red-500 p-4">{error}</td></tr>) 
                            : (sortedItems.map(item => {
                                const needsReorder = item.reorder_point !== null && item.in_stock <= item.reorder_point;
                                const statusStyles = { 'Activo': 'bg-green-100 text-green-800', 'Inactivo': 'bg-yellow-100 text-yellow-800', 'Obsoleto': 'bg-gray-100 text-gray-800' };
                                return (
                                <tr key={item.sku} className={`border-b hover:bg-gray-50 ${selectedSkus.includes(item.sku) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3"><input type="checkbox" checked={selectedSkus.includes(item.sku)} onChange={() => handleSelectItem(item.sku)} /></td>
                                    <td className="p-3 font-medium text-gray-900">{item.sku}</td><td className="p-3">{item.name}</td>
                                    <td className="p-3 text-gray-500">{item.item_type}</td>
                                    <td className={`p-3 font-semibold ${needsReorder ? 'text-red-600' : 'text-gray-800'}`}>{item.in_stock} {item.unit_of_measure}</td>
                                    <td className="p-3">{item.location ?? 'N/A'}</td>
                                    <td className="p-3 overflow-visible">
                                         <select 
                                            value={item.status} 
                                            onChange={(e) => handleStatusChange(item, e.target.value)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-full w-28 text-center border-none appearance-none cursor-pointer ${statusStyles[item.status] || 'bg-gray-100'}`}
                                            style={{ backgroundImage: 'none' }}
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="Inactivo">Inactivo</option>
                                            <option value="Obsoleto">Obsoleto</option>
                                        </select>
                                    </td>
                                    <td className="p-3 flex gap-4">
                                        <button onClick={() => setItemToEdit(item)} className="text-indigo-600 hover:text-indigo-800" title="Editar"><Edit size={16}/></button>
                                        <button onClick={() => setItemToDelete(item)} className="text-red-600 hover:text-red-800" title="Eliminar"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};


// --- VISTA GESTIÓN BOM ---
const ItemsTable = ({ flatList, itemSearchQuery, setItemSearchQuery }) => {
    const filteredFlatList = useMemo(() => {
        if (!itemSearchQuery) return flatList;
        const queryLower = itemSearchQuery.toLowerCase();
        return flatList.filter(item =>
            item.name.toLowerCase().includes(queryLower) ||
             item.sku.toLowerCase().includes(queryLower)
        );
    }, [flatList, itemSearchQuery]);

    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Buscar por SKU o nombre en la lista..."
                    className="w-full p-2 border rounded-lg"
                />
            </div>
            <div className="border rounded-lg bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-3">Ítem (SKU)</th>
                            <th className="p-3">Tipo de Producto</th>
                            <th className="p-3 text-right">Cantidad Total Requerida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFlatList.map(item => (
                            <tr key={item.sku} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-900">{item.name} ({item.sku})</td>
                                <td className="p-3 text-gray-600">{item.item_type}</td>
                                <td className="p-3 text-right font-semibold text-indigo-600">
                                    {item.total_quantity} {item.unit_of_measure}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BOMsTable = ({ onEdit, onCreateNew, onViewTree }) => {
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bomToDelete, setBomToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ item_type: '' });
    const [selectedBoms, setSelectedBoms] = useState([]);
    const importInputRef = useRef(null);
    
    const [importMessage, setImportMessage] = useState('');
    const [importError, setImportError] = useState('');


    const fetchBoms = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filters.item_type) params.append('item_type', filters.item_type);

            const response = await fetch(`${API_URL}/boms?${params.toString()}`);
            if (!response.ok) throw new Error('Error al cargar BOMs.');
            const data = await response.json();
            setBoms(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters]);
    
    useEffect(() => { fetchBoms(); }, [fetchBoms]);

    const handleDelete = async (sku) => {
        try {
            await fetch(`${API_URL}/boms/${sku}`, { method: 'DELETE' });
            setBomToDelete(null);
            fetchBoms();
        } catch(err) { setImportError(err.message); }
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ item_type: '' });
        setSearchQuery('');
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedBoms(boms.map(bom => bom.sku));
        } else {
            setSelectedBoms([]);
        }
    };

    const handleSelectItem = (sku) => {
        setSelectedBoms(prev =>
            prev.includes(sku) ? prev.filter(id => id !== sku) : [...prev, sku]
        );
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`¿Seguro que quieres eliminar ${selectedBoms.length} BOM(s) seleccionado(s)?`)) {
            try {
                const response = await fetch(`${API_URL}/boms/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skus: selectedBoms })
                });
                if (!response.ok && response.status !== 204) {
                    throw new Error('Error en la eliminación masiva.');
                }
                setSelectedBoms([]);
                fetchBoms();
            } catch (err) {
                setImportError(err.message);
            }
        }
    };
    
    const handleExportClick = () => {
        window.location.href = `${API_URL}/boms/export/csv`;
    };

    const handleImportClick = () => {
        importInputRef.current.click();
    };

    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setImportMessage('');
        setImportError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/boms/import/csv`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'Error desconocido al importar el archivo.');
            }
            setImportMessage(result.message);
            fetchBoms();
            setTimeout(() => setImportMessage(''), 5000);
        } catch (err) {
            setImportError(err.message);
        } finally {
            event.target.value = null;
        }
    };


    return (
        <Card title="Listas de Materiales (BOM)">
            {bomToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el BOM para ${bomToDelete.sku}?`} onConfirm={() => handleDelete(bomToDelete.sku)} onCancel={() => setBomToDelete(null)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                 <div className="md:col-span-1 flex items-center gap-2 w-full md:w-auto">
                     <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && fetchBoms()}
                        placeholder="Buscar por SKU o Nombre..." 
                        className="p-2 border rounded-lg w-full" 
                    />
                    <button onClick={fetchBoms} className="p-2 bg-indigo-600 text-white rounded-lg"><Search size={20}/></button>
                </div>
                <div className="flex items-center gap-2">
                    <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                    <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                        <Upload size={16}/> Importar CSV
                    </button>
                    <button onClick={handleExportClick} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                        <FileDown size={16}/> Exportar CSV
                    </button>
                    <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        <PlusCircle size={16} />Crear BOM
                    </button>
                </div>
            </div>

            {importMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
                    <p className="font-bold">Éxito</p>
                    <p>{importMessage}</p>
                </div>
            )}
            {importError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
                    <div className="flex justify-between items-center">
                        <p className="font-bold">Error en la importación</p>
                        <button onClick={() => setImportError('')}><X size={18} /></button>
                    </div>
                    <p className="whitespace-pre-wrap">{importError}</p>
                </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-xl shadow-inner mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <select name="item_type" value={filters.item_type} onChange={handleFilterChange} className="p-2 border rounded-lg">
                        <option value="">Filtrar por Tipo de Producto</option>
                        <option value="Producto Terminado">Producto Terminado</option>
                        <option value="Producto Intermedio">Producto Intermedio</option>
                    </select>
                    <button onClick={clearFilters} className="flex items-center justify-center gap-2 p-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                        <FilterX size={16}/>Limpiar Filtros
                    </button>
                </div>
            </div>

            {selectedBoms.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 text-blue-800 p-3 rounded-lg mb-6 flex justify-between items-center">
                    <span className="font-semibold">{selectedBoms.length} BOM(s) seleccionado(s)</span>
                    <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-lg font-semibold hover:bg-red-200"><Trash2 size={14}/>Eliminar Seleccionados</button>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-3 w-4">
                                <input 
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={boms.length > 0 && selectedBoms.length === boms.length}
                                    disabled={boms.length === 0}
                                />
                            </th>
                            <th className="p-3">ID (SKU)</th><th className="p-3">Nombre del Producto</th><th className="p-3">Tipo</th><th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="5" className="text-center p-4">Cargando...</td></tr>) :
                        error ? (<tr><td colSpan="5" className="text-center text-red-500 p-4">{error}</td></tr>) :
                        (boms.map(bom => (
                            <tr key={bom.sku} className={`border-b hover:bg-gray-50 ${selectedBoms.includes(bom.sku) ? 'bg-blue-50' : ''}`}>
                                <td className="p-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedBoms.includes(bom.sku)}
                                        onChange={() => handleSelectItem(bom.sku)}
                                    />
                                </td>
                                <td className="p-3 font-medium">{bom.sku}</td>
                                <td className="p-3">{bom.name}</td>
                                <td className="p-3">{bom.item_type}</td>
                                <td className="p-3 flex gap-3">
                                    <button onClick={() => onViewTree(bom.sku)} className="text-gray-600 hover:text-indigo-800" title="Ver Jerarquía"><GitMerge size={16}/></button>
                                    <button onClick={() => onEdit(bom.sku)} className="text-indigo-600 hover:text-indigo-800" title="Editar"><Edit size={16}/></button>
                                    <button onClick={() => setBomToDelete(bom)} className="text-red-600 hover:text-red-800" title="Eliminar"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const BOMEditor = ({ allItems, bomSku, onClose }) => {
    const [parentItemSku, setParentItemSku] = useState(bomSku || null);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);

    const availableParents = useMemo(() => allItems.filter(item => ['Producto Terminado', 'Producto Intermedio'].includes(item.item_type)), [allItems]);
    const availableComponents = useMemo(() => allItems.filter(item => ['Materia Prima', 'Producto Intermedio'].includes(item.item_type)), [allItems]);
    
    useEffect(() => {
        const loadBom = async () => {
            if (bomSku) {
                try {
                    const response = await fetch(`${API_URL}/boms/${bomSku}`);
                    if (response.ok) {
                       const bomData = await response.json();
                       setComponents(bomData.components);
                    }
                } catch (error) { console.error("Error cargando BOM:", error); }
            }
            setLoading(false);
        };
        loadBom();
    }, [bomSku]);

    const handleAddComponent = () => setComponents([...components, { item_sku: '', quantity: 1 }]);
    
    const handleComponentChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = value;
        setComponents(newComponents);
    };

    const handleRemoveComponent = (index) => setComponents(components.filter((_, i) => i !== index));
    
    const handleSave = async () => {
        if (!parentItemSku) { alert("Seleccione un producto padre."); return; }
        const finalComponents = components
            .filter(c => c.item_sku && c.quantity > 0)
            .map(({ item_sku, quantity }) => ({ item_sku, quantity: parseFloat(quantity) }));

        if (finalComponents.length === 0) {
            alert("Debe añadir al menos un componente válido.");
            return;
        }

        const bomData = { product_sku: parentItemSku, components: finalComponents };

        try {
            const response = await fetch(`${API_URL}/boms`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bomData),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar el BOM.');
            onClose();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    if (loading) return <div className="p-8 text-center"><Card title="Editor de BOM">Cargando...</Card></div>

    return (
        <Card title={bomSku ? `Editando BOM para ${bomSku}` : 'Crear Nuevo BOM'}>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto Padre</label>
                <SearchableSelect
                    options={availableParents}
                    value={parentItemSku}
                    onChange={(sku) => setParentItemSku(sku)}
                    placeholder="Buscar y seleccionar un producto padre..."
                    disabled={!!bomSku}
                />
            </div>
            
            {parentItemSku && (
                <>
                    <h3 className="text-lg font-semibold mt-8 mb-3 border-t pt-4 text-indigo-600">Componentes</h3>
                    <div>
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left w-2/3">Componente</th>
                                    <th className="p-3 text-left">Cantidad</th>
                                    <th className="p-3 text-left">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {components.map((comp, index) => {
                                    const componentDetails = allItems.find(item => item.sku === comp.item_sku);
                                    return (
                                    <tr key={index} className="border-b">
                                        <td className="p-2 align-top">
                                            <SearchableSelect
                                                options={availableComponents}
                                                value={comp.item_sku}
                                                onChange={(sku) => handleComponentChange(index, 'item_sku', sku)}
                                                placeholder="Buscar componente..."
                                            />
                                        </td>
                                        <td className="p-2 align-top">
                                            <div className="flex items-center pt-1">
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0.01"
                                                    value={comp.quantity} 
                                                    onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)} 
                                                    className="w-24 p-2 border rounded-lg"
                                                />
                                                {componentDetails && <span className="ml-3 text-gray-500 text-xs font-semibold">{componentDetails.unit_of_measure}</span>}
                                            </div>
                                        </td>
                                        <td className="p-2 align-top">
                                            <button onClick={() => handleRemoveComponent(index)} className="text-red-500 hover:text-red-700 p-2 mt-1" title="Eliminar componente">
                                                <Trash2 size={16}/>
                                            </button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>

                    <button onClick={handleAddComponent} className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        <PlusCircle size={16}/>Añadir Componente
                    </button>
                </>
            )}

            <div className="flex justify-end gap-4 mt-8 border-t pt-6">
                <button onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400">Volver a la Lista</button>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Guardar BOM</button>
            </div>
        </Card>
    );
};

const BomTreeViewModal = ({ sku, onClose }) => {
    const [treeData, setTreeData] = useState(null);
    const [stats, setStats] = useState(null);
    const [flatList, setFlatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tree');
    const [itemSearchQuery, setItemSearchQuery] = useState('');

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const response = await fetch(`${API_URL}/boms/tree/${sku}`);
                if (!response.ok) throw new Error('No se pudo cargar la jerarquía del BOM.');
                const data = await response.json();
                setTreeData(data.tree);
                setStats(data.stats);
                setFlatList(data.flat_list);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [sku]);

    const CollapsibleNode = ({ node, level = 0, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        const hasChildren = node.children && node.children.length > 0;
        const typeIcons = {
            'Producto Terminado': <Package size={14} className="text-indigo-500" />,
            'Producto Intermedio': <Combine size={14} className="text-yellow-500" />,
            'Materia Prima': <Component size={14} className="text-green-500" />
        };
        return (
            <div style={{ marginLeft: level * 20 }}>
                <div 
                    className={`flex items-center p-2 rounded ${hasChildren ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                >
                    {hasChildren ? <ChevronRight size={16} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} /> : <div className="w-4"></div>}
                    <div className="flex items-center gap-2 ml-1">
                        {typeIcons[node.item_type]}
                        <span className="font-semibold">{node.name}</span>
                        <span className="text-gray-500">({node.sku})</span>
                        <span className="text-sm text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                            {node.quantity} {node.unit_of_measure}
                        </span>
                    </div>
                </div>
                {isOpen && hasChildren && (
                    <div className="border-l-2 border-gray-200 pl-2">
                        {node.children.map(child => <CollapsibleNode key={child.sku} node={child} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };
    
    const chartData = stats ? [
        { name: 'Materias Primas', value: stats.count_raw, color: '#22c55e' },
        { name: 'P. Intermedios', value: stats.count_intermediate, color: '#f59e0b' },
        { name: 'P. Terminados', value: stats.count_finished, color: '#3b82f6' }
    ].filter(d => d.value > 0) : [];

    const unitsData = stats ? Object.entries(stats.units_of_measure).map(([name, value]) => ({ name, value })) : [];

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Jerarquía y Desglose de BOM: {sku}</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="max-h-[75vh] overflow-y-auto pr-4">
                    {loading ? <p className="text-center">Cargando...</p> : 
                     (stats && treeData) ? (
                        <div>
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">Resumen del Desglose</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                    <div className="bg-white p-3 rounded-lg shadow-sm"><p className="text-2xl font-bold text-indigo-600">{stats.total_unique_items}</p><p className="text-sm text-gray-500">Ítems Únicos</p></div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm"><p className="text-2xl font-bold text-green-600">{stats.count_raw}</p><p className="text-sm text-gray-500">Materias Primas</p></div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm"><p className="text-2xl font-bold text-yellow-600">{stats.count_intermediate}</p><p className="text-sm text-gray-500">P. Intermedios</p></div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm"><p className="text-2xl font-bold text-gray-600">{Object.keys(stats.units_of_measure).length}</p><p className="text-sm text-gray-500">Tipos de Unidades</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
                                    <div>
                                        <h4 className="font-semibold text-center text-sm mb-2">Composición por Tipo de Ítem</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label>
                                                    {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconSize={10} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-center text-sm mb-2">Ítems por Unidad de Medida</h4>
                                        <ResponsiveContainer width="100%" height={180}>
                                             <BarChart data={unitsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" allowDecimals={false} />
                                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(value) => [value, 'Cantidad']}/>
                                                <Bar dataKey="value" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-gray-200 mb-4">
                                <nav className="-mb-px flex space-x-6">
                                    <button 
                                        onClick={() => setActiveTab('tree')}
                                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'tree' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >Árbol de Jerarquía</button>
                                    <button 
                                        onClick={() => setActiveTab('items')}
                                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    >Lista de Ítems Requeridos</button>
                                </nav>
                            </div>
                            
                            <div>
                                {activeTab === 'tree' && (
                                    <div className="border rounded-lg p-2 bg-white">
                                        <CollapsibleNode node={treeData} defaultOpen={true} />
                                    </div>
                                )}
                                {activeTab === 'items' && (
                                    <ItemsTable 
                                        flatList={flatList} 
                                        itemSearchQuery={itemSearchQuery} 
                                        setItemSearchQuery={setItemSearchQuery} 
                                    />
                                )}
                            </div>
                        </div>
                     ) : <p className="text-center text-red-500">No se encontró información. (Verifique que el producto exista y tenga BOM definido).</p>}
                </div>
            </div>
        </div>
    );
}

const BOMView = () => {
    const [view, setView] = useState('list');
    const [selectedBomSku, setSelectedBomSku] = useState(null);
    const [allItems, setAllItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);

    const fetchAllItems = useCallback(async () => {
        setLoadingItems(true);
        try {
            const response = await fetch(`${API_URL}/items/`);
            if (!response.ok) throw new Error('No se pudieron cargar los ítems');
            setAllItems(await response.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    useEffect(() => {
        fetchAllItems();
    }, [fetchAllItems]);
    
    const handleNavigate = (targetView, sku = null) => {
        setSelectedBomSku(sku);
        setView(targetView);
    };

    if (loadingItems) return <div className="p-8"><Card title="Gestión de Lista de Materiales (BOM)"><p className="text-center">Cargando ítems...</p></Card></div>;

    const renderView = () => {
        switch (view) {
            case 'list':
                return <div className="p-8"><BOMsTable onEdit={(sku) => handleNavigate('editor', sku)} onCreateNew={() => handleNavigate('editor')} onViewTree={(sku) => handleNavigate('tree', sku)} /></div>;
            case 'editor':
                return <div className="p-8"><BOMEditor allItems={allItems} bomSku={selectedBomSku} onClose={() => handleNavigate('list')} /></div>;
            case 'tree':
                 return <BomTreeViewModal sku={selectedBomSku} onClose={() => handleNavigate('list')} />;
            default:
                return null;
        }
    }

    return renderView();
};


// --- VISTA PREDICCIÓN DE DEMANDA ---

const PredictionView = ({ results, setResults }) => {
    const [file, setFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState({ headers: [], data: [] });
    const [columnMap, setColumnMap] = useState({ ds: '', y: '', sku: '' });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    
    const [selectedSku, setSelectedSku] = useState('');
    const [forecastPeriods, setForecastPeriods] = useState(90);
    const [forecastModel, setForecastModel] = useState('prophet');

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedSettings, setAdvancedSettings] = useState({
        changepoint_prior_scale: 0.05,
        seasonality_prior_scale: 10.0,
        seasonality_mode: 'additive',
    });
    
    const [activeTabSku, setActiveTabSku] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/?item_type=Producto Terminado`);
                const finishedProducts = await response.json();
                setProducts(finishedProducts);
                if (finishedProducts.length > 0) {
                    setSelectedSku(currentSku => currentSku || finishedProducts[0].sku);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProducts();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setMessage('');
        setError('');
        setCsvPreview({ headers: [], data: [] });
        setColumnMap({ ds: '', y: '', sku: '' });

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const { headers, data } = parseCSV(text);
            setCsvPreview({ headers, data: data.slice(0, 5) });

            const lowerCaseHeaders = headers.map(h => h.toLowerCase());
            const dsGuess = headers[lowerCaseHeaders.findIndex(h => h.includes('fecha'))] || headers[0] || '';
            const yGuess = headers[lowerCaseHeaders.findIndex(h => h.includes('cantidad'))] || headers[1] || '';
            const skuGuess = headers[lowerCaseHeaders.findIndex(h => h.includes('producto') || h.includes('sku'))] || headers[2] || '';
            setColumnMap({ ds: dsGuess, y: yGuess, sku: skuGuess });
        };
        reader.readAsText(selectedFile);
    };

    const handleFileUpload = async () => {
        if (!file) { setError('Por favor, selecciona un archivo CSV.'); return; }
        if (!columnMap.ds || !columnMap.y || !columnMap.sku) { setError('Por favor, mapea las columnas de fecha, valor y SKU.'); return; }

        setLoading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        
        const params = new URLSearchParams({ dsCol: columnMap.ds, yCol: columnMap.y, skuCol: columnMap.sku });

        try {
            const response = await fetch(`${API_URL}/sales/upload?${params.toString()}`, { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Error al cargar el archivo.');
            setMessage(data.message);
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleAdvancedSettingsChange = (e) => {
        const { name, value, type } = e.target;
        setAdvancedSettings(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleGenerateForecast = async () => {
        if (!selectedSku) { setError('Por favor, selecciona un producto.'); return; }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const salesResponse = await fetch(`${API_URL}/sales/${selectedSku}`);
            let sales = [];
            if (salesResponse.ok) sales = await salesResponse.json();

            const forecastUrl = `${API_URL}/forecast/${selectedSku}?periods=${forecastPeriods}&model_type=${forecastModel}`;
            
            const forecastResponse = await fetch(forecastUrl, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(advancedSettings)
            });
            
            const data = await forecastResponse.json();
            if (!forecastResponse.ok) throw new Error(data.detail || 'Error al generar el pronóstico.');
            
            const formattedForecast = data.forecast.map(d => ({ ...d, ds: new Date(d.ds) }));
            const combinedData = [
                ...sales.map(s => ({ ds: new Date(s.ds + 'T00:00:00'), historico: s.y })),
                ...formattedForecast.map(f => ({
                    ds: f.ds, pronostico: f.yhat > 0 ? f.yhat : 0,
                    min: f.yhat_lower > 0 ? f.yhat_lower : 0, max: f.yhat_upper > 0 ? f.yhat_upper : 0
                }))
            ].sort((a, b) => a.ds - b.ds);
            
            const formattedComponents = {};
            if (data.components) {
                for (const key in data.components) {
                    if (data.components[key]) {
                        formattedComponents[key] = data.components[key].map(d => ({ ...d, ds: new Date(d.ds) }));
                    }
                }
            }
            
            const newForecastResult = {
                forecastData: combinedData,
                demandSummary: data.summary,
                metrics: data.metrics,
                components: formattedComponents,
                selectedSku: selectedSku,
                productName: products.find(p => p.sku === selectedSku)?.name || selectedSku,
            };

            setResults(prevResults => {
                const existingIndex = prevResults.findIndex(r => r.selectedSku === selectedSku);
                if (existingIndex > -1) {
                    const updatedResults = [...prevResults];
                    updatedResults[existingIndex] = newForecastResult;
                    return updatedResults;
                } else {
                    return [...prevResults, newForecastResult];
                }
            });
            
            setActiveTabSku(selectedSku);
            setMessage(`Pronóstico para ${selectedSku} generado/actualizado exitosamente.`);
            setTimeout(() => setMessage(''), 5000);

        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseTab = (skuToClose) => {
        setResults(prev => prev.filter(r => r.selectedSku !== skuToClose));
        if (activeTabSku === skuToClose) {
            const remainingTabs = results.filter(r => r.selectedSku !== skuToClose);
            setActiveTabSku(remainingTabs.length > 0 ? remainingTabs[0].selectedSku : null);
        }
    };
    
    const activeForecast = useMemo(() => {
        if (!activeTabSku) return null;
        return results.find(r => r.selectedSku === activeTabSku);
    }, [activeTabSku, results]);


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{formattedDate}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value.toFixed(2)}`}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 space-y-8">
            <Card title="1. Cargar y Mapear Historial de Ventas">
                <div className="flex items-center gap-4 mb-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                </div>

                {csvPreview.headers.length > 0 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Vista Previa de Datos</h3>
                            <div className="overflow-x-auto max-h-48 border rounded-lg">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100 sticky top-0"><tr>{csvPreview.headers.map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                                    <tbody>{csvPreview.data.map((row, i) => <tr key={i} className="border-t">{csvPreview.headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Mapeo de Columnas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm">Columna de Fecha (ds)</label><select value={columnMap.ds} onChange={e => setColumnMap(p => ({...p, ds: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de Valor (y)</label><select value={columnMap.y} onChange={e => setColumnMap(p => ({...p, y: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de SKU</label><select value={columnMap.sku} onChange={e => setColumnMap(p => ({...p, sku: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                            </div>
                        </div>
                        <button onClick={handleFileUpload} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                            <Upload size={16}/> {loading ? 'Procesando...' : 'Confirmar y Cargar Datos'}
                        </button>
                    </div>
                )}
                {message && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg"><CheckCircle size={16} className="inline mr-2"/>{message}</p>}
                {error && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg whitespace-pre-wrap"><AlertTriangle size={16} className="inline mr-2"/>{error}</div>}
            </Card>
            
            <Card title="2. Generar Pronóstico de Demanda">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div className="col-span-1 md:col-span-3 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <SearchableSelect
                            options={products}
                            value={selectedSku}
                            onChange={setSelectedSku}
                            placeholder="Buscar y seleccionar producto..."
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Pronóstico</label>
                        <select value={forecastModel} onChange={(e) => setForecastModel(e.target.value)} className="p-2 border rounded-lg w-full">
                            <option value="prophet">Prophet (Recomendado)</option>
                            <option value="ses">Suavizado Exponencial Simple</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Días a Pronosticar</label>
                        <input type="number" value={forecastPeriods} onChange={(e) => setForecastPeriods(e.target.value)} className="p-2 border rounded-lg w-full" placeholder="Ej. 90"/>
                     </div>
                </div>

                <div className="mt-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-indigo-600 mb-4 hover:underline">
                        <Sliders size={16}/> {showAdvanced ? 'Ocultar' : 'Mostrar'} Configuración Avanzada
                    </button>
                    {showAdvanced && forecastModel === 'prophet' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50 mb-4">
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Flexibilidad de Tendencia</label>
                                <input type="range" name="changepoint_prior_scale" min="0.01" max="1.0" step="0.01" value={advancedSettings.changepoint_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                <span className="text-xs text-gray-500">Valor: {advancedSettings.changepoint_prior_scale}</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Controla la rapidez con que el modelo se adapta a los cambios en la tendencia. Valores altos son más flexibles.
                                </span>
                            </div>
                             <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Fuerza de Estacionalidad</label>
                                <input type="range" name="seasonality_prior_scale" min="1.0" max="20.0" step="0.5" value={advancedSettings.seasonality_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                 <span className="text-xs text-gray-500">Valor: {advancedSettings.seasonality_prior_scale}</span>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Ajusta la influencia de los patrones estacionales (semanales, anuales).
                                </span>
                            </div>
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Modo de Estacionalidad</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="additive" checked={advancedSettings.seasonality_mode === 'additive'} onChange={handleAdvancedSettingsChange}/> Aditivo</label>
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="multiplicative" checked={advancedSettings.seasonality_mode === 'multiplicative'} onChange={handleAdvancedSettingsChange}/> Multiplicativo</label>
                                </div>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                     'Multiplicativo' si las fluctuaciones estacionales crecen con la tendencia (p.ej. ventas navideñas).
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleGenerateForecast} disabled={loading || !selectedSku} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:bg-gray-400 hover:bg-green-700">
                    <LineChartIcon size={16}/> {loading ? 'Generando...' : 'Generar o Actualizar Pronóstico'}
                </button>
            </Card>

            {results.length > 0 && (
                 <div className="flex flex-wrap items-center gap-2 border-b-2 border-gray-200 pb-2">
                    {results.map(forecast => (
                        <button
                            key={forecast.selectedSku}
                            onClick={() => setActiveTabSku(forecast.selectedSku)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                                activeTabSku === forecast.selectedSku
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {forecast.productName}
                             <X 
                                size={16} 
                                className={`p-1 rounded-full ml-1 ${
                                    activeTabSku === forecast.selectedSku ? 'hover:bg-indigo-700' : 'hover:bg-gray-400'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseTab(forecast.selectedSku);
                                }} 
                            />
                        </button>
                    ))}
                </div>
            )}
            
            {activeForecast && (
                <div key={activeForecast.selectedSku} className="space-y-8 animate-fadeIn">
                    <Card title={`Resultados del Pronóstico para ${activeForecast.productName}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Gráfico de Tendencia</h3>
                            {activeForecast.metrics && (
                                <div className="text-xs text-right text-gray-600 bg-gray-50 p-2 rounded-lg border">
                                    <p><strong>Métricas del Modelo:</strong></p>
                                    <p>MAE: <strong>{activeForecast.metrics.mae?.toFixed(2) ?? 'N/A'}</strong></p>
                                    <p>RMSE: <strong>{activeForecast.metrics.rmse?.toFixed(2) ?? 'N/A'}</strong></p>
                                </div>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={activeForecast.forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="historico" name="Ventas Históricas" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
                                <Line type="monotone" dataKey="pronostico" name="Pronóstico" stroke="#16a34a" dot={false}/>
                                <Area type="monotone" dataKey="max" name="Intervalo de Confianza" stroke="none" fill="#e5e7eb" fillOpacity={0.5} data={activeForecast.forecastData.filter(d => d.max !== undefined)} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                    
                    {activeForecast.components && (
                        <Card title="Componentes del Pronóstico">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {activeForecast.components.trend && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Tendencia</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} /><YAxis domain={['dataMin', 'dataMax']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Tendencia" stroke="#8884d8" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.weekly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Estacionalidad Semanal</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.weekly.slice(0, 7)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Semanal" stroke="#82ca9d" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.yearly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Estacionalidad Anual</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.yearly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Anual" stroke="#ffc658" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                    
                    {activeForecast.demandSummary && (
                        <Card title={`Resumen de Demanda Semanal para ${activeForecast.productName}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="p-3">Periodo</th><th className="p-3">Fecha de Inicio</th><th className="p-3">Fecha de Fin</th><th className="p-3 text-right">Demanda Pronosticada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeForecast.demandSummary.map((summaryItem) => (
                                            <tr key={summaryItem.period} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{summaryItem.period}</td>
                                                <td className="p-3">{formatDate(summaryItem.start_date)}</td>
                                                <td className="p-3">{formatDate(summaryItem.end_date)}</td>
                                                <td className="p-3 text-right font-semibold">{summaryItem.total_demand.toLocaleString()} unidades</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};


// --- VISTA PLAN MAESTRO DE PRODUCCIÓN (PMP) ---

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


// --- ESTRUCTURA PRINCIPAL, HEADER Y APP ---

const Header = ({ activeView, setActiveView, onLogoClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const navItems = [
        { name: 'Dashboard', icon: Home, view: 'dashboard' }, { name: 'Gestión de Ítems', icon: Package, view: 'items' }, { name: 'Gestión de BOM', icon: ClipboardList, view: 'bom' },
        { name: 'Predicción', icon: BrainCircuit, view: 'prediction' }, { name: 'Plan Maestro', icon: Calendar, view: 'pmp' }, { name: 'Plan de Materiales', icon: ShoppingCart, view: 'mrp' },
        { name: 'Configuración', icon: Settings, view: 'settings' },
    ];

    const getTitle = (view) => ({
        'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', 
        'prediction': 'Predicción de Demanda', 'pmp': 'Plan Maestro de Producción', 'mrp': 'Plan de Requerimiento de Materiales', 
        'settings': 'Configuración'
    }[view] || 'Dashboard');


    const handleNavClick = (view) => {
        setActiveView(view);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <header className="relative flex items-center justify-between h-20 bg-slate-900 shadow-lg z-20 sticky top-0 px-4 md:px-8">
            <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={onLogoClick}
            >
                <img 
                    src="Icono_PlanFly2.png" 
                    alt="Logo PlanFly" 
                    className="h-40 w-auto object-contain" 
                />
            </div>
            
            <h2 className="text-2xl font-bold text-white hidden md:block tracking-wider">{getTitle(activeView)}</h2>
            
            <div className="flex items-center space-x-2">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-200 flex items-center">
                        <Menu className="w-6 h-6 mr-2" />
                        <span className="hidden sm:block text-sm font-semibold">Menú</span>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-2xl py-2 z-30">
                            <p className="text-gray-900 font-bold px-4 py-2 border-b">Navegación</p>
                            {navItems.map((item) => (
                                <button
                                    key={item.view}
                                    onClick={() => handleNavClick(item.view)}
                                    className={`w-full text-left flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                                        activeView === item.view ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <item.icon className="h-4 w-4 mr-3" />
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};


function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [showHome, setShowHome] = useState(true);
    const [predictionResults, setPredictionResults] = useState([]);
    const [pmpResults, setPmpResults] = useState([]);

    const getTitle = (view) => ({
        'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', 
        'prediction': 'Predicción de Demanda', 'pmp': 'Plan Maestro de Producción', 'mrp': 'Plan de Requerimiento de Materiales', 
        'settings': 'Configuración'
    }[view] || 'Dashboard');

    const goToHome = () => {
        setShowHome(true);
        setActiveView('dashboard');
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'items': return <ItemsView />; 
            case 'bom': return <BOMView />; 
            case 'prediction': return <PredictionView results={predictionResults} setResults={setPredictionResults} />;
            case 'pmp': return <PMPView results={pmpResults} setResults={setPmpResults} />;
            case 'settings': return <SettingsView />;
            case 'mrp': return <PlaceholderView title={getTitle(activeView)} />;
            default: return <PlaceholderView title={getTitle(activeView)} />;
        }
    };
    
    if (showHome) {
        return <HomeView onStart={() => setShowHome(false)} />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans antialiased text-gray-800">
            <Header activeView={activeView} setActiveView={setActiveView} onLogoClick={goToHome} />
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

// --- VISTA CONFIGURACIÓN ---
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

    if (loading) return <div className="p-8 text-center"><Card title="Configuración del Sistema"><p>Cargando configuración...</p></Card></div>;
    if (error || !settings) return <div className="p-8 text-center text-red-500"><Card title="Configuración del Sistema"><p>{error || 'No se pudo cargar la configuración.'}</p></Card></div>;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <Card title="Configuración del Sistema">
                
                <div className="mb-8 border-b pb-4">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Información de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                            <input id="company_name" name="company_name" value={settings.company_name} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full" />
                        </div>
                        <div>
                            <label htmlFor="currency_symbol" className="block text-sm font-medium text-gray-700">Símbolo de Moneda</label>
                            <input id="currency_symbol" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full" />
                        </div>
                    </div>
                </div>

                <div className="mb-8 border-b pb-4">
                     <h3 className="text-lg font-semibold text-indigo-600 mb-4">Producción e Inventario</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="default_lead_time_days" className="block text-sm font-medium text-gray-700">Lead Time de Compra por Defecto (días)</label>
                            <input type="number" id="default_lead_time_days" name="default_lead_time_days" value={settings.default_lead_time_days} onChange={handleChange} className="mt-1 p-2 border rounded-lg w-full" />
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
                                <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Nueva ubicación" className="p-2 border rounded-lg w-full" />
                                <button onClick={() => handleAddToList('locations', newLocation, setNewLocation)} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                                {settings.locations.map(loc => (
                                    <li key={loc} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg shadow-sm">
                                        {loc}
                                        <button onClick={() => handleRemoveFromList('locations', loc)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidades de Medida</label>
                             <div className="flex items-center gap-2 mt-1">
                                <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Nueva unidad" className="p-2 border rounded-lg w-full" />
                                <button onClick={() => handleAddToList('units_of_measure', newUnit, setNewUnit)} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                                {settings.units_of_measure.map(unit => (
                                    <li key={unit} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg shadow-sm">
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


// --- VISTA PLACEHOLDER ---
const PlaceholderView = ({ title }) => (
    <div className="flex items-center justify-center h-full p-8">
        <Card title={title} className="max-w-xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600">
                Este módulo estará disponible próximamente.
            </p>
        </Card>
    </div>
);

export default App;