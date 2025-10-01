import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Bell, X, Edit, Info, Trash2, Search, FileDown, Upload, GitMerge, Plus, LineChart as LineChartIcon, HelpCircle, ArrowUpDown, FilterX, CheckCircle, Factory, Warehouse, TrendingUp, DollarSign, Menu, Clock, ChevronDown, AlertTriangle, PlusCircle } from 'lucide-react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// URL base de la API backend
const API_URL = 'http://127.0.0.1:8000';

// --- COMPONENTES ATÓMICOS Y DE DISEÑO ---
const IconButton = ({ icon: Icon, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 text-gray-700 ${className}`}
  >
    <Icon className="w-5 h-5" />
  </button>
);

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-shadow duration-300 ${className}`}>
    {title && <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{title}</h3>}
    {children}
  </div>
);

// StatCard: Usa Icon directamente para evitar el error de `no-undef`.
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

// --- COMPONENTE HOME / PANTALLA DE INICIO (Diseño Creativo y Futurista con Imagen de Fondo) ---

const HomeView = ({ onStart }) => {
    return (
        <div 
            className="relative flex flex-col items-center justify-center min-h-screen text-white p-8 overflow-hidden"
            style={{ 
                // CORRECCIÓN: Se añadió url("...") para que el navegador cargue la imagen.
                backgroundImage: 'url("background_network.png")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Superposición oscura para mejorar la legibilidad del contenido */}
            <div className="absolute inset-0 bg-slate-900/80 z-0"></div> 
            
            <main className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
        {/* Sección Principal (Hero) */}
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

    {/* CAMBIO: Aplicada la fuente "Bebas Neue" y estilos de titular */}
    <h1 
        className="text-6xl font-bold text-slate-100 tracking-widest uppercase"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
    >
        Planifica Hoy 
        <h1 
        className="text-6xl font-bold text-slate-100 tracking-widest uppercase"
        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
    ></h1>
        Lo Que Tu Empresa Necesitará Mañana
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

                {/* Sección de Características */}
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

                {/* Sección de Testimonios */}
                <section className="w-full max-w-2xl my-16 md:my-20 text-center">
                    <h2 className="text-2xl font-bold mb-8">Lo que dicen nuestros clientes</h2>
                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700">
                        <p className="italic text-slate-200">"PlanFLY transformó nuestra cadena de suministro. La precisión de sus pronósticos nos ha ahorrado miles en exceso de inventario."</p>
                        <p className="mt-4 font-semibold text-indigo-400">- Director de Operaciones, Tech Solutions Inc.</p>
                    </div>
                </section>
            </main>
            
            {/* Pie de Página (Footer) */}
            <footer className="z-10 w-full max-w-5xl mx-auto py-8 mt-16 border-t border-slate-700
                               flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} PlanFLY. Todos los derechos reservados.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
                </div>
            </footer>
        </div>
    );
};
// --- MODALES Y UTILIDADES (Integrados) ---

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
        const finalValue = name === 'reorder_point' ? parseInt(value, 10) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        onSave(formData, { reorder_point: formData.reorder_point, location: formData.location, unit_of_measure: formData.unit_of_measure, status: formData.status });
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Ver / Editar Ítem</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <h3 className="font-semibold text-indigo-600">Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <input value={`SKU: ${formData.sku}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                        <input value={`Nombre: ${formData.name}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                        <input value={`Categoría: ${formData.category}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                        <input value={`Stock Actual: ${formData.in_stock} ${formData.unit_of_measure}`} disabled className="p-2 border rounded bg-gray-100 text-sm" />
                    </div>

                    <h3 className="font-semibold text-indigo-600 pt-4">Parámetros Editables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Crítico</label>
                            <input 
                                type="number" 
                                name="reorder_point" 
                                value={formData.reorder_point || ''} 
                                onChange={handleChange} 
                                placeholder="Punto de Reorden" 
                                className="p-2 border border-gray-300 rounded-lg w-full mt-1 focus:ring-indigo-500 focus:border-indigo-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                            <select name="location" value={formData.location || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">Seleccione...</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Unidad de Medida</label>
                            <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg w-full mt-1 focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="Obsoleto">Obsoleto</option>
                            </select>
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

const BulkEditModal = ({ onClose, onSave, selectedCount }) => {
    const [fieldsToUpdate, setFieldsToUpdate] = useState({
        reorder_point: '',
        location: '',
        unit_of_measure: ''
    });
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
                acc[key] = key === 'reorder_point' ? parseInt(value, 10) : value;
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
                    <h2 className="text-2xl font-bold text-gray-800">Editar {selectedCount} Ítems</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Crítico (Punto de Reorden)</label>
                                <input
                                    type="number"
                                    name="reorder_point"
                                    value={fieldsToUpdate.reorder_point}
                                    onChange={handleChange}
                                    placeholder="No cambiar"
                                    className="p-2 border border-gray-300 rounded-lg w-full mt-1"
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
                        </div>
                        <div className="flex justify-end gap-4 pt-6">
                            <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors">Cancelar</button>
                            <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                                {isSaving ? 'Guardando...' : `Aplicar a ${selectedCount} ítems`}
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
                    <p className="text-sm text-gray-600">Sube un archivo CSV con las columnas: sku, name, category, in_stock, item_type.</p>
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

// Utility for date formatting (used in Prediction and PMP)
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
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [locations, setLocations] = useState([]);
    const [units, setUnits] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
            setSelectedItems(prev => prev.filter(sku => data.some(item => item.sku === sku)));
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

    const handleUpdateItem = async (itemData, fieldsToUpdate) => {
        try {
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
        handleUpdateItem(item, { status: newStatus });
    };

    const handleDeleteItem = async (sku) => {
        try {
            const response = await fetch(`${API_URL}/items/${sku}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Error al eliminar.');
            setItemToDelete(null); 
            setSelectedItems(prev => prev.filter(id => id !== sku));
            fetchItems();
        } catch(err) { alert(`Error: ${err.message}`); }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(items.map(item => item.sku));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (sku) => {
        setSelectedItems(prev => 
            prev.includes(sku) ? prev.filter(id => id !== sku) : [...prev, sku]
        );
    };
    
    const handleBulkDelete = async () => {
        if (window.confirm(`¿Seguro que quieres eliminar ${selectedItems.length} ítems seleccionados?`)) {
            try {
                await fetch(`${API_URL}/items/bulk-delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skus: selectedItems })
                });
                setSelectedItems([]);
                fetchItems();
            } catch (err) {
                alert(`Error al eliminar en masa: ${err.message}`);
            }
        }
    };
    
    const handleBulkStatusChange = async (status) => {
         try {
            await fetch(`${API_URL}/items/bulk-update-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skus: selectedItems, status: status })
            });
            setSelectedItems([]);
            fetchItems();
        } catch (err) {
            alert(`Error al actualizar estado en masa: ${err.message}`);
        }
    };

    const handleBulkEdit = async (fieldsToUpdate) => {
        try {
            const updatePromises = selectedItems.map(sku =>
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
            setSelectedItems([]);
            fetchItems();
        } catch (err) {
            // Se usa concatenación simple para evitar errores de escape
            alert(`Error en la edición masiva: ${err.message || 'Falló la actualización para ' + err.sku}`);
            throw err;
        }
    };


    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
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


    const exportHeaders = [
        { label: "SKU", key: "sku" },
        { label: "Nombre", key: "name" },
        { label: "Categoría", key: "category" },
        { label: "En Stock", key: "in_stock" },
        { label: "Unidad", key: "unit_of_measure" },
        { label: "Ubicación", key: "location" },
        { label: "Tipo", key: "item_type" },
        { label: "Estado", key: "status" },
    ];

    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [exportHeaders.map(h => h.label)],
            body: items.map(item => exportHeaders.map(h => item[h.key] ?? 'N/A')),
        });
        doc.save('inventario.pdf');
    };
    
    return (
        <div className="p-8">
            {itemToEdit && <ItemModal item={itemToEdit} onClose={() => setItemToEdit(null)} onSave={handleUpdateItem} />}
            {isFileModalOpen && <FileUploadModal onClose={() => setIsFileModalOpen(false)} fetchItems={fetchItems} />}
            {itemToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el ítem ${itemToDelete.sku}?`} onConfirm={() => handleDeleteItem(itemToDelete.sku)} onCancel={() => setItemToDelete(null)} />}
            {isBulkEditModalOpen && <BulkEditModal onClose={() => setIsBulkEditModalOpen(false)} onSave={handleBulkEdit} selectedCount={selectedItems.length} />}

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

                {selectedItems.length > 0 && (
                    <div className="bg-blue-100 border border-blue-300 text-blue-800 p-3 rounded-lg mb-6 flex justify-between items-center">
                        <span className="font-semibold">{selectedItems.length} ítem(s) seleccionado(s)</span>
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
                                <th className="p-3 w-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedItems.length > 0 && selectedItems.length === items.length && items.length > 0} /></th>
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
                                const statusStyles = {
                                    'Activo': 'bg-green-100 text-green-800',
                                    'Inactivo': 'bg-yellow-100 text-yellow-800',
                                    'Obsoleto': 'bg-gray-100 text-gray-800',                               
                                };
                                return (
                                <tr key={item.sku} className={`border-b hover:bg-gray-50 ${selectedItems.includes(item.sku) ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3"><input type="checkbox" checked={selectedItems.includes(item.sku)} onChange={() => handleSelectItem(item.sku)} /></td>
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
                                        <button 
                                            onClick={() => setItemToEdit(item)} 
                                            className="text-indigo-600 hover:text-indigo-800" 
                                            title="Editar">
                                            <Edit size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => setItemToDelete(item)} 
                                            className="text-red-600 hover:text-red-800" 
                                            title="Eliminar">
                                            <Trash2 size={16}/>
                                        </button>
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
const BOMsTable = ({ onEdit, onCreateNew, onViewTree }) => {
    const [boms, setBoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bomToDelete, setBomToDelete] = useState(null);

    const fetchBoms = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/boms`);
            if (!response.ok) throw new Error('Error al cargar BOMs.');
            setBoms(await response.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => { fetchBoms(); }, [fetchBoms]);

    const handleDelete = async (sku) => {
        try {
            await fetch(`${API_URL}/boms/${sku}`, { method: 'DELETE' });
            setBomToDelete(null);
            fetchBoms();
        } catch(err) { alert(`Error: ${err.message}`); }
    };
    
    return (
        <Card title="Listas de Materiales (BOM)">
            {bomToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el BOM para ${bomToDelete.sku}?`} onConfirm={() => handleDelete(bomToDelete.sku)} onCancel={() => setBomToDelete(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">BOMs Existentes</h2>
                <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"><PlusCircle size={16} />Crear BOM</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-3">ID (SKU)</th><th className="p-3">Nombre del Producto</th><th className="p-3">Tipo</th><th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="4" className="text-center p-4">Cargando...</td></tr>) :
                        error ? (<tr><td colSpan="4" className="text-center text-red-500 p-4">{error}</td></tr>) :
                        (boms.map(bom => (
                            <tr key={bom.sku} className="border-b hover:bg-gray-50">
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

const BOMEditor = ({ allItems, bomSku, onClose, onCreateNewItem }) => {
    const [parentItem, setParentItem] = useState(null);
    const [components, setComponents] = useState([]);

    const availableParents = allItems.filter(item => ['Producto Terminado', 'Producto Intermedio'].includes(item.item_type));
    const availableComponents = allItems.filter(item => ['Materia Prima', 'Producto Intermedio'].includes(item.item_type));
    
    useEffect(() => {
        const loadBom = async () => {
            if (bomSku) {
                const parent = allItems.find(i => i.sku === bomSku);
                setParentItem(parent);
                try {
                    const response = await fetch(`${API_URL}/boms/${bomSku}`);
                    if (response.ok) {
                       const bomData = await response.json();
                       setComponents(bomData.components);
                    }
                } catch (error) { console.error("Error cargando BOM:", error); }
            }
        };
        loadBom();
    }, [bomSku, allItems]);

    const handleAddComponent = () => setComponents([...components, { item_sku: '', quantity: 1 }]);
    
    const handleComponentChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = value;
        setComponents(newComponents);
    };

    const handleRemoveComponent = (index) => setComponents(components.filter((_, i) => i !== index));
    
    const handleSave = async () => {
        if (!parentItem) { alert("Seleccione un producto padre."); return; }
        const finalComponents = components
            .filter(c => c.item_sku && c.quantity > 0)
            .map(({ item_sku, quantity }) => ({ item_sku, quantity: parseFloat(quantity) }));

        const bomData = { product_sku: parentItem.sku, components: finalComponents };

        try {
            const response = await fetch(`${API_URL}/boms`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bomData),
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar el BOM.');
            alert('BOM guardado exitosamente');
            onClose();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    return (
        <Card title={bomSku ? `Editando BOM para ${bomSku}` : 'Crear Nuevo BOM'}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Producto Padre</label>
                <div className="flex items-center gap-2">
                    <select
                        value={parentItem?.sku || ''}
                        onChange={(e) => setParentItem(availableParents.find(p => p.sku === e.target.value))}
                        disabled={!!bomSku}
                        className="mt-1 block w-full p-2 border rounded-lg" >
                        <option value="">Seleccione un producto...</option>
                        {availableParents.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                    </select>
                     {!bomSku && <button onClick={onCreateNewItem} className="mt-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"><Plus size={16}/></button>}
                </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-2 text-indigo-600">Componentes</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr><th className="p-2">Componente (SKU)</th><th className="p-2">Cantidad</th><th className="p-2"></th></tr>
                    </thead>
                    <tbody>
                        {components.map((comp, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">
                                    <select value={comp.item_sku} onChange={(e) => handleComponentChange(index, 'item_sku', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="">Seleccionar...</option>
                                        {availableComponents.map(item => <option key={item.sku} value={item.sku}>{item.name} ({item.sku})</option>)}
                                    </select>
                                </td>
                                <td className="p-2"><input type="number" step="0.01" value={comp.quantity} onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)} className="w-24 p-2 border border-gray-300 rounded-lg"/></td>
                                <td className="p-2"><button onClick={() => handleRemoveComponent(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={handleAddComponent} className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"><Plus size={16}/>Añadir Fila</button>

            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors">Volver a la Lista</button>
                <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Guardar BOM</button>
            </div>
        </Card>
    );
};

const BomTreeViewModal = ({ sku, onClose }) => {
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const response = await fetch(`${API_URL}/boms/tree/${sku}`);
                if (!response.ok) throw new Error('No se pudo cargar la jerarquía del BOM.');
                setTreeData(await response.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTree();
    }, [sku]);

    const TreeNode = ({ node }) => (
        <li className="ml-6 mt-2">
            <div className="flex items-center">
                <span className="font-semibold">{node.name} ({node.sku})</span>
                <span className="ml-2 text-gray-600">- {node.quantity} {node.unit_of_measure}</span>
            </div>
            {node.children && node.children.length > 0 && (
                <ul className="border-l-2 border-gray-300 pl-4">
                    {node.children.map(child => <TreeNode key={child.sku} node={child} />)}
                </ul>
            )}
        </li>
    );

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Jerarquía de BOM: {sku}</h2>
                    <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-red-500"/></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pt-4">
                    {loading ? <p className="text-center">Cargando...</p> : 
                     treeData ? <ul><TreeNode node={treeData} /></ul> : <p className="text-center text-red-500">No se encontró información. (Verifique que el producto exista y tenga BOM definido).</p>}
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
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

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
    
    const handleSaveItem = async (itemData, fieldsToUpdate) => {
        const method = itemData.sku ? 'PUT' : 'POST';
        const url = itemData.sku ? `${API_URL}/items/${itemData.sku}` : `${API_URL}/items/`;
        const body = itemData.sku ? fieldsToUpdate : itemData;
        
        try {
            const response = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(body) 
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar.');
            setIsItemModalOpen(false);
            await fetchAllItems();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

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
                return <div className="p-8"><BOMEditor allItems={allItems} bomSku={selectedBomSku} onClose={() => handleNavigate('list')} onCreateNewItem={() => setIsItemModalOpen(true)} /></div>;
            case 'tree':
                 return <BomTreeViewModal sku={selectedBomSku} onClose={() => handleNavigate('list')} />;
            default:
                return null;
        }
    }

    return (
        <>
            {/* itemTypeFilter is removed since ItemModal is universal, it's just used to trigger creation dialog if needed */}
            {isItemModalOpen && <ItemModal item={{}} onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} />}
            {renderView()}
        </>
    );
};


// --- VISTA PREDICCIÓN DE DEMANDA ---

const PredictionView = ({ results, setResults }) => {
    const [file, setFile] = useState(null);
    const [salesUploadMessage, setSalesUploadMessage] = useState('');
    const [salesUploadError, setSalesUploadError] = useState('');
    const [salesLoading, setSalesLoading] = useState(false);
    
    const [products, setProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState(results?.selectedSku || '');
    const [forecastPeriods, setForecastPeriods] = useState(90);
    const [forecastModel, setForecastModel] = useState('prophet');
    const [forecastLoading, setForecastLoading] = useState(false);
    const [forecastError, setForecastError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/`);
                const allItems = await response.json();
                const relevantProducts = allItems.filter(item => ['Producto Terminado', 'Producto Intermedio'].includes(item.item_type));
                setProducts(relevantProducts);
                if (relevantProducts.length > 0 && !selectedSku) {
                    setSelectedSku(relevantProducts[0].sku);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setForecastError("No se pudieron cargar los productos.");
            }
        };
        fetchProducts();
    }, [selectedSku]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSalesUploadMessage('');
        setSalesUploadError('');
    };

    const handleSalesFileUpload = async () => {
        if (!file) {
            setSalesUploadError('Por favor, selecciona un archivo CSV.');
            return;
        }
        setSalesLoading(true);
        setSalesUploadMessage('');
        setSalesUploadError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/sales/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.detail.replace(/\n/g, '<br/>');
                const errorElement = document.createElement('div');
                errorElement.innerHTML = errorDetail;
                setSalesUploadError(errorElement.textContent || errorElement.innerText);
                return;
            }
            setSalesUploadMessage(data.message);
        } catch (error) {
            setSalesUploadError(`Error: ${error.message}`);
        } finally {
            setSalesLoading(false);
        }
    };
    
    const handleGenerateForecast = async () => {
        if (!selectedSku) {
            setForecastError('Por favor, selecciona un producto.');
            return;
        }
        setForecastLoading(true);
        setForecastError('');

        try {
            // Fetch existing sales data for combining with forecast
            const salesResponse = await fetch(`${API_URL}/sales/${selectedSku}`);
            let sales = [];
            if (salesResponse.ok) {
                sales = await salesResponse.json();
            }

            const forecastUrl = `${API_URL}/forecast/${selectedSku}?periods=${forecastPeriods}&model_type=${forecastModel}`;
            const forecastResponse = await fetch(forecastUrl, { method: 'POST' });
            
            const data = await forecastResponse.json();
            if (!forecastResponse.ok) {
                throw new Error(data.detail || 'Error al generar el pronóstico.');
            }

            const formattedForecast = data.forecast.map(d => ({ ...d, ds: new Date(d.ds) }));
            
            const combinedData = [
                ...sales.map(s => ({ ds: new Date(s.ds + 'T00:00:00'), historico: s.y })),
                ...formattedForecast.map(f => ({
                    ds: f.ds,
                    pronostico: f.yhat > 0 ? f.yhat : 0, 
                    min: f.yhat_lower > 0 ? f.yhat_lower : 0, 
                    max: f.yhat_upper > 0 ? f.yhat_upper : 0 
                }))
            ].sort((a, b) => a.ds - b.ds);
            
            setResults({
                forecastData: combinedData,
                demandSummary: data.summary,
                metrics: data.metrics,
                selectedSku: selectedSku
            });
        } catch (error) {
            setForecastError(`Error: ${error.message}`);
            setResults(null); 
        } finally {
            setForecastLoading(false);
        }
    };
    
    return (
        <div className="p-8 space-y-8">
            <Card title="1. Cargar Historial de Ventas">
                <p className="text-sm text-gray-600 mb-4">Sube un archivo CSV con las columnas: `fecha_venta` (AAAA-MM-DD), `id_producto`, `cantidad_vendida`.</p>
                <div className="flex items-center gap-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                    <button onClick={handleSalesFileUpload} disabled={salesLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                        <Upload size={16}/> {salesLoading ? 'Cargando...' : 'Cargar Historial'}
                    </button>
                </div>
                {salesUploadMessage && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg"><CheckCircle size={16} className="inline mr-2"/>{salesUploadMessage}</p>}
                {salesUploadError && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg whitespace-pre-wrap"><AlertTriangle size={16} className="inline mr-2"/>{salesUploadError}</div>}
            </Card>

            <Card title="2. Generar Pronóstico de Demanda">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} className="p-2 border rounded-lg w-full">
                            <option value="">Selecciona un producto...</option>
                            {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </select>
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
                    <button onClick={handleGenerateForecast} disabled={forecastLoading || !selectedSku} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:bg-gray-400 hover:bg-green-700">
                        <LineChartIcon size={16}/> {forecastLoading ? 'Generando...' : 'Generar Pronóstico'}
                    </button>
                </div>
                 {forecastError && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg whitespace-pre-wrap"><AlertTriangle size={16} className="inline mr-2"/>{forecastError}</div>}
            </Card>
            
            {results && results.forecastData && results.forecastData.length > 0 && (
                <>
                <Card title={`Resultados del Pronóstico para ${results.selectedSku}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Gráfico de Tendencia</h3>
                        {results.metrics && (
                            <div className="text-xs text-right text-gray-600 bg-gray-50 p-2 rounded-lg border">
                                <p><strong>Métricas del Modelo:</strong></p>
                                <p>Error Absoluto Medio (MAE): <strong>{results.metrics.mae?.toFixed(2) ?? 'N/A'}</strong></p>
                                <p>Raíz del Error Cuadrático Medio (RMSE): <strong>{results.metrics.rmse?.toFixed(2) ?? 'N/A'}</strong></p>
                            </div>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                         <ComposedChart data={results.forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ds" tickFormatter={(time) => formatDate(time)} />
                            <YAxis />
                            <Tooltip labelFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                            <Legend />
                            <Area type="monotone" dataKey="historico" name="Ventas Históricas" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
                            <Line type="monotone" dataKey="pronostico" name="Pronóstico" stroke="#16a34a" />
                            <Area type="monotone" dataKey="max" name="Intervalo de Confianza" stroke="#9ca3af" fill="#e5e7eb" fillOpacity={0.2} strokeDasharray="5 5" data={results.forecastData.filter(d => d.max !== undefined)} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>
                <Card title={`Resumen de Demanda Semanal para ${results.selectedSku}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="p-3">Periodo</th><th className="p-3">Fecha de Inicio</th><th className="p-3">Fecha de Fin</th><th className="p-3 text-right">Demanda Pronosticada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.demandSummary.map((summaryItem) => (
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
                </>
            )}
        </div>
    );
};


// --- VISTA PLAN MAESTRO DE PRODUCCIÓN (PMP) ---

const PMPView = ({ results, setResults }) => {
    const [products, setProducts] = useState([]);
    const [selectedSku, setSelectedSku] = useState(results?.selectedSku || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/`);
                const allItems = await response.json();
                const finishedProducts = allItems.filter(item => item.item_type === 'Producto Terminado');
                setProducts(finishedProducts);
                if (finishedProducts.length > 0 && !selectedSku) {
                    setSelectedSku(finishedProducts[0].sku);
                }
            } catch (err) {
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProducts();
    }, [selectedSku]);

    const handleGeneratePMP = async () => {
        if (!selectedSku) {
            setError('Por favor, selecciona un producto.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/pmp/initial-data/${selectedSku}`, { method: 'POST' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Error al generar el PMP. Asegúrate de tener stock y pronóstico.');
            }
            
            const initialTable = data.demand_forecast.map(period => ({
                period: period.period,
                demand: period.total_demand,
                plannedProduction: 0,
            }));
            
            setResults({
                initialData: data,
                tableState: initialTable,
                selectedSku: selectedSku,
            });

        } catch (err) {
            setError(err.message);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };
    
    const handleProductionChange = (index, value) => {
        setResults(prev => {
            const newTableState = [...prev.tableState];
            newTableState[index].plannedProduction = parseInt(value, 10) || 0;
            return { ...prev, tableState: newTableState };
        });
    };
    
    const calculatedPmp = useMemo(() => {
        if (!results || !results.tableState) return null;

        const { initialData, tableState } = results;
        const calculatedPeriods = [];

        tableState.forEach((period, index) => {
            const initialInventory = index === 0 
                ? initialData.initial_inventory 
                : calculatedPeriods[index - 1].projectedInventory;
            
            const projectedInventory = initialInventory + period.plannedProduction - period.demand;
            
            calculatedPeriods.push({
                ...period,
                initialInventory,
                projectedInventory
            });
        });

        return {
            headers: calculatedPeriods.map(p => p.period),
            rows: {
                'Inventario Inicial': calculatedPeriods.map(p => p.initialInventory),
                'Pronostico': calculatedPeriods.map(p => p.demand),
                'Producción Planificada': calculatedPeriods.map(p => p.plannedProduction),
                'Inventario Proyectado': calculatedPeriods.map(p => p.projectedInventory),
            }
        };

    }, [results]);


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
                        <Calendar size={16}/> {loading ? 'Cargando...' : 'Generar PMP'}
                    </button>
                 </div>
                 {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg"><AlertTriangle size={16} className="inline mr-2"/>{error}</p>}
            </Card>

            {results && calculatedPmp && (
                 <Card title={`Matriz del PMP para ${results.selectedSku}`}>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                 <tr>
                                     <th className="p-3 font-semibold border border-gray-200">Concepto</th>
                                     {calculatedPmp.headers.map(header => <th key={header} className="p-3 font-semibold border border-gray-200 text-center">{header}</th>)}
                                 </tr>
                             </thead>
                             <tbody>
                                 {Object.entries(calculatedPmp.rows).map(([rowName, rowData]) => (
                                     <tr key={rowName} className="border-b">
                                         <td className="p-3 font-medium border border-gray-200 bg-gray-50">{rowName}</td>
                                         {rowData.map((cellData, index) => {
                                            if (rowName === 'Producción Planificada') {
                                                return (
                                                    <td key={index} className="p-1 border border-gray-200 text-center bg-yellow-50">
                                                        <input 
                                                            type="number"
                                                            value={cellData}
                                                            onChange={(e) => handleProductionChange(index, e.target.value)}
                                                            className="w-20 p-2 text-center bg-transparent border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                        />
                                                    </td>
                                                );
                                            }

                                            let cellClass = "p-3 border border-gray-200 text-center";
                                            if (rowName === 'Inventario Proyectado' && cellData < 0) {
                                                cellClass += " bg-red-100 text-red-800 font-bold";
                                            }
                                            return <td key={index} className={cellClass}>{cellData}</td>
                                         })}
                                     </tr>
                                 ))}
                             </tbody>
                        </table>
                     </div>
                 </Card>
            )}
        </div>
    )
};

// --- COMPONENTE DE ESTRUCTURA PRINCIPAL (Header y App) ---

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
        // CAMBIO 1: La barra del encabezado ahora es más angosta (h-20)
        <header className="relative flex items-center justify-between h-20 bg-slate-900 shadow-lg z-20 sticky top-0 px-4 md:px-8">
            <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={onLogoClick}
            >
                <img 
                    src="Icono_PlanFly2.png" 
                    alt="Logo PlanFly" 
                    // CAMBIO 2: El logo ahora es mucho más grande (h-40) y sobresale de la barra
                    className="h-40 w-auto object-contain" 
                />
            </div>
            
            <h2 className="text-2xl font-bold text-white md:block tracking-wider">{getTitle(activeView)}</h2>
            
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
    const [predictionResults, setPredictionResults] = useState(null);
    const [pmpResults, setPmpResults] = useState(null);

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
            case 'settings': return <SettingsView />;
            case 'pmp': return <PMPView results={pmpResults} setResults={setPmpResults} />;
            case 'mrp': return <PlaceholderView title={getTitle(activeView)} />;
            default: return <PlaceholderView title={getTitle(activeView)} />;
        }
    };
    
    // Simulación de transición (sin react-spring)
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
                
                {/* Company Info Section */}
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

                {/* Production & Inventory Section */}
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

                {/* Gestión de Listas Desplegables */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4">Parámetros de Ítems</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gestión de Ubicaciones */}
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
                        {/* Gestión de Unidades de Medida */}
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
                Esta módulo estará disponible próximamente.
            </p>
        </Card>
    </div>
);

export default App;
