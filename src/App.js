import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Bell, ChevronDown, AlertTriangle, PlusCircle, X, Edit, Trash2, Search, FileDown, Upload, GitMerge, Plus, LineChart as LineChartIcon, HelpCircle, ArrowUpDown, FilterX, CheckCircle, Sliders } from 'lucide-react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart } from 'recharts';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const API_URL = 'http://127.0.0.1:8000';

// --- COMPONENTS --- 
const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' }, { name: 'Gestión de Ítems', icon: Package, view: 'items' }, { name: 'Gestión de BOM', icon: ClipboardList, view: 'bom' },
    { name: 'Predicción', icon: BrainCircuit, view: 'prediction' }, { name: 'Plan Maestro', icon: Calendar, view: 'pmp' }, { name: 'Plan de Materiales', icon: ShoppingCart, view: 'mrp' },
    { name: 'Configuración', icon: Settings, view: 'settings' },
  ];
  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-200">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <BrainCircuit className="h-8 w-8 text-white" /><h1 className="ml-3 text-2xl font-bold text-white">DemandFlow</h1>
      </div>
      <nav className="flex-grow px-4 py-6">
        {navItems.map((item) => (
          <button key={item.name} onClick={() => setActiveView(item.view)} className={`flex items-center w-full text-left px-4 py-3 mb-2 text-lg rounded-lg transition-colors duration-200 ${activeView === item.view ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
            <item.icon className="h-6 w-6 mr-4" />{item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};
const Header = ({ title }) => (
  <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-6">
      <button className="relative text-gray-500 hover:text-gray-800"><Bell size={24} /></button>
      <div className="flex items-center"><p className="text-gray-700 font-semibold">Mi Empresa S.A.</p><ChevronDown size={20} className="ml-1 text-gray-500" /></div>
    </div>
  </header>
);

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
        onSave(formData);
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Ver / Editar Ítem</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <h3 className="font-semibold text-gray-700">Información del Ítem (Solo lectura)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={`SKU: ${formData.sku}`} disabled className="p-2 border rounded bg-gray-100" />
                        <input value={`Nombre: ${formData.name}`} disabled className="p-2 border rounded bg-gray-100" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={`Categoría: ${formData.category}`} disabled className="p-2 border rounded bg-gray-100" />
                        <input value={`Stock Actual: ${formData.in_stock}`} disabled className="p-2 border rounded bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={`Tipo: ${formData.item_type}`} disabled className="p-2 border rounded bg-gray-100" />
                         <input value={`Estado: ${formData.status}`} disabled className="p-2 border rounded bg-gray-100" />
                    </div>

                    <h3 className="font-semibold text-gray-700 pt-4">Parámetros Editables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Stock Crítico</label>
                            <input 
                                type="number" 
                                name="reorder_point" 
                                value={formData.reorder_point || ''} 
                                onChange={handleChange} 
                                placeholder="Punto de Reorden" 
                                className="p-2 border rounded w-full mt-1" 
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Ubicación</label>
                            <select name="location" value={formData.location || ''} onChange={handleChange} className="p-2 border rounded w-full mt-1">
                                <option value="">Seleccione...</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div>
                           <label className="text-sm font-medium text-gray-600">Unidad de Medida</label>
                            <select name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} className="p-2 border rounded w-full mt-1">
                                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-8"><p className="text-lg mb-4">{message}</p><div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button></div></div></div>);

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
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Editar {selectedCount} Ítems</h2>
                    <button onClick={onClose} disabled={isSaving || successMessage}><X size={24} /></button>
                </div>
                {successMessage ? (
                    <div className="text-center p-4">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <p className="mt-4 text-lg font-medium text-gray-700">{successMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Completa solo los campos que deseas actualizar para todos los ítems seleccionados. Los campos vacíos no se modificarán.
                        </p>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Stock Crítico (Punto de Reorden)</label>
                            <input
                                type="number"
                                name="reorder_point"
                                value={fieldsToUpdate.reorder_point}
                                onChange={handleChange}
                                placeholder="Dejar vacío para no cambiar"
                                className="p-2 border rounded w-full mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Ubicación</label>
                            <select name="location" value={fieldsToUpdate.location} onChange={handleChange} className="p-2 border rounded w-full mt-1">
                                <option value="">Dejar sin cambiar</option>
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Unidad de Medida</label>
                            <select name="unit_of_measure" value={fieldsToUpdate.unit_of_measure} onChange={handleChange} className="p-2 border rounded w-full mt-1">
                                <option value="">Dejar sin cambiar</option>
                                {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-6">
                            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                            <button type="button" onClick={handleSubmit} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
                                {isSaving ? 'Guardando...' : `Aplicar a ${selectedCount} ítems`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

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
            setItems(await response.json());
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
            fetchItems(searchQuery);
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
            fetchItems(searchQuery);
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
            alert(`Error en la edición masiva: ${err.message || `Falló la actualización para ${err.sku}`}`);
            throw err;
        }
    };

    const sortedItems = useMemo(() => {
        if (!sortConfig.key) return [...items];

        let sortableItems = [...items];
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
        return sortableItems;
    }, [items, sortConfig]);
    
    const requestSort = (key) => {
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            setSortConfig({ key: null, direction: 'ascending' });
        } else if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            setSortConfig({ key, direction: 'descending' });
        } else {
            setSortConfig({ key, direction: 'ascending' });
        }
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
        { label: "SKU", key: "sku" }, { label: "Nombre", key: "name" }, { label: "Categoría", key: "category" },
        { label: "En Stock", key: "in_stock" }, { label: "Unidad", key: "unit_of_measure" }, { label: "Ubicación", key: "location" },
        { label: "Tipo", key: "item_type" }, { label: "Estado", key: "status" },
    ];

    const handlePdfExport = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [exportHeaders.map(h => h.label)],
            body: items.map(item => exportHeaders.map(h => item[h.key] ?? 'N/A')),
        });
        doc.save('inventario.pdf');
    };

    const FileUploadModal = ({ onClose }) => {
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
                if (!response.ok) throw new Error(data.detail || 'Error al cargar el archivo.');
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
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Importar Ítems desde CSV</h2>
                        <button onClick={onClose}><X size={24} /></button>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">El archivo debe contener las columnas: sku, name, category, in_stock, item_type.</p>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        <button onClick={handleFileUpload} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md disabled:bg-gray-400">
                            <Upload size={16}/> {loading ? 'Cargando...' : 'Cargar Archivo'}
                        </button>
                        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
                        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="p-8">
            {itemToEdit && <ItemModal item={itemToEdit} onClose={() => setItemToEdit(null)} onSave={(data) => handleUpdateItem(data, { reorder_point: data.reorder_point, location: data.location, unit_of_measure: data.unit_of_measure })} />}
            {isFileModalOpen && <FileUploadModal onClose={() => setIsFileModalOpen(false)} />}
            {itemToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el ítem ${itemToDelete.sku}?`} onConfirm={() => handleDeleteItem(itemToDelete.sku)} onCancel={() => setItemToDelete(null)} />}
            {isBulkEditModalOpen && <BulkEditModal onClose={() => setIsBulkEditModalOpen(false)} onSave={handleBulkEdit} selectedCount={selectedItems.length} />}

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2 w-full md:w-1/3">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchItems()} placeholder="Buscar por SKU o Nombre..." className="p-2 border rounded-md w-full" />
                    <button onClick={() => fetchItems()} className="p-2 bg-blue-600 text-white rounded-md"><Search size={20}/></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePdfExport} className="flex items-center gap-2 p-2 border rounded-md text-sm"><FileDown size={16}/>PDF</button>
                    <CSVLink data={items} headers={exportHeaders} filename={"inventario.csv"} className="flex items-center gap-2 p-2 border rounded-md text-sm"><FileDown size={16}/>CSV</CSVLink>
                    <button onClick={() => setIsFileModalOpen(true)} className="flex items-center gap-2 p-2 text-sm font-semibold text-white bg-green-600 rounded-md">
                        <Upload size={16}/>Importar Ítems
                    </button>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">Filtrar por Estado</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Obsoleto">Obsoleto</option>
                    </select>
                    <select name="item_type" value={filters.item_type} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">Filtrar por Tipo</option>
                        <option value="Materia Prima">Materia Prima</option>
                        <option value="Producto Intermedio">Producto Intermedio</option>
                        <option value="Producto Terminado">Producto Terminado</option>
                    </select>
                    <select name="unit_of_measure" value={filters.unit_of_measure} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">Unidad de Medida</option>
                        {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                    <select name="location" value={filters.location} onChange={handleFilterChange} className="p-2 border rounded-md">
                        <option value="">Ubicación</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <div className="flex items-center">
                        <input type="checkbox" id="critical_stock" name="critical_stock" checked={filters.critical_stock} onChange={handleFilterChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="critical_stock" className="ml-2 block text-sm text-gray-900">Stock Crítico</label>
                    </div>
                     <button onClick={clearFilters} className="flex items-center justify-center gap-2 p-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md">
                        <FilterX size={16}/>Limpiar Filtros
                    </button>
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 text-blue-800 p-3 rounded-md mb-6 flex justify-between items-center">
                    <span className="font-semibold">{selectedItems.length} ítem(s) seleccionado(s)</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsBulkEditModalOpen(true)} className="flex items-center gap-2 px-3 py-1 text-sm text-blue-800 bg-blue-200 rounded-md font-semibold"><Edit size={14}/>Editar Seleccionados</button>
                        <div className="border-l h-6 border-blue-300"></div>
                        <span className="text-sm">Cambiar estado a:</span>
                        <button onClick={() => handleBulkStatusChange('Activo')} className="px-2 py-1 text-xs bg-green-500 text-white rounded">Activo</button>
                        <button onClick={() => handleBulkStatusChange('Inactivo')} className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">Inactivo</button>
                        <button onClick={() => handleBulkStatusChange('Obsoleto')} className="px-2 py-1 text-xs bg-gray-500 text-white rounded">Obsoleto</button>
                        <div className="border-l h-6 border-blue-300"></div>
                        <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md font-semibold"><Trash2 size={14}/>Eliminar Seleccionados</button>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-md"><div className="overflow-x-auto">
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
                                'Activo': 'bg-green-100 text-green-800', 'Inactivo': 'bg-yellow-100 text-yellow-800',
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
                                     <select value={item.status} onChange={(e) => handleStatusChange(item, e.target.value)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-full w-28 text-center border-none appearance-none cursor-pointer ${statusStyles[item.status] || 'bg-gray-100'}`}
                                        style={{ backgroundImage: 'none' }}>
                                        <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option><option value="Obsoleto">Obsoleto</option>
                                    </select>
                                </td>
                                <td className="p-3 flex gap-4">
                                    <button onClick={() => setItemToEdit(item)} className="text-blue-600 hover:text-blue-800" title="Editar"><Edit size={16}/></button>
                                    <button onClick={() => setItemToDelete(item)} className="text-red-600 hover:text-red-800" title="Eliminar"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                            );
                        }))}
                    </tbody>
                </table>
            </div></div>
        </div>
    );
};

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
    
    const handleSaveItem = async (itemData, isEditing) => {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/items/${itemData.sku}` : `${API_URL}/items/`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemData) });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar.');
            setIsItemModalOpen(false);
            await fetchAllItems();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleNavigate = (targetView, sku = null) => {
        setSelectedBomSku(sku);
        setView(targetView);
    };

    if (loadingItems) return <div className="p-8">Cargando ítems...</div>;

    const renderView = () => {
        switch (view) {
            case 'list': return <BOMsTable onEdit={(sku) => handleNavigate('editor', sku)} onCreateNew={() => handleNavigate('editor')} onViewTree={(sku) => handleNavigate('tree', sku)} />;
            case 'editor': return <BOMEditor allItems={allItems} bomSku={selectedBomSku} onClose={() => handleNavigate('list')} onCreateNewItem={() => setIsItemModalOpen(true)} />;
            case 'tree': return <BomTreeViewModal sku={selectedBomSku} onClose={() => handleNavigate('list')} />;
            default: return null;
        }
    }

    return (
        <>
            {isItemModalOpen && <ItemModal onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} itemTypeFilter={['Producto Terminado', 'Producto Intermedio']} />}
            {renderView()}
        </>
    );
};

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
        <div className="p-8">
            {bomToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el BOM para ${bomToDelete.sku}?`} onConfirm={() => handleDelete(bomToDelete.sku)} onCancel={() => setBomToDelete(null)} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Listas de Materiales (BOM)</h2>
                <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md"><PlusCircle size={16} />Crear BOM</button>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
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
                                    <button onClick={() => onViewTree(bom.sku)} className="text-gray-600 hover:text-gray-800" title="Ver Jerarquía"><GitMerge size={16}/></button>
                                    <button onClick={() => onEdit(bom.sku)} className="text-blue-600 hover:text-blue-800" title="Editar"><Edit size={16}/></button>
                                    <button onClick={() => setBomToDelete(bom)} className="text-red-600 hover:text-red-800" title="Eliminar"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
        </div>
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
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">{bomSku ? `Editando BOM para ${bomSku}` : 'Crear Nuevo BOM'}</h2>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Producto Padre</label>
                    <div className="flex items-center gap-2">
                        <select
                            value={parentItem?.sku || ''}
                            onChange={(e) => setParentItem(availableParents.find(p => p.sku === e.target.value))}
                            disabled={!!bomSku}
                            className="mt-1 block w-full p-2 border rounded-md" >
                            <option value="">Seleccione un producto...</option>
                            {availableParents.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </select>
                         {!bomSku && <button onClick={onCreateNewItem} className="mt-1 px-3 py-2 bg-green-500 text-white rounded-md text-sm"><Plus size={16}/></button>}
                    </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-2">Componentes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr><th className="p-2">Componente (SKU)</th><th className="p-2">Cantidad</th><th className="p-2"></th></tr>
                        </thead>
                        <tbody>
                            {components.map((comp, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">
                                        <select value={comp.item_sku} onChange={(e) => handleComponentChange(index, 'item_sku', e.target.value)} className="w-full p-1 border rounded">
                                            <option value="">Seleccionar...</option>
                                            {availableComponents.map(item => <option key={item.sku} value={item.sku}>{item.name} ({item.sku})</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2"><input type="number" step="0.01" value={comp.quantity} onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)} className="w-24 p-1 border rounded"/></td>
                                    <td className="p-2"><button onClick={() => handleRemoveComponent(index)} className="text-red-500"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button onClick={handleAddComponent} className="mt-4 flex items-center gap-2 text-sm text-blue-600"><Plus size={16}/>Añadir Fila</button>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Volver a la Lista</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Guardar BOM</button>
                </div>
            </div>
        </div>
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
                <ul className="border-l-2 border-gray-200 pl-4">
                    {node.children.map(child => <TreeNode key={child.sku} node={child} />)}
                </ul>
            )}
        </li>
    );

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Jerarquía de BOM: {sku}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? <p>Cargando...</p> : 
                     treeData ? <ul><TreeNode node={treeData} /></ul> : <p>No se encontró información.</p>}
                </div>
            </div>
        </div>
    );
}

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

const PredictionView = ({ results, setResults }) => {
    const [file, setFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState({ headers: [], data: [] });
    const [columnMap, setColumnMap] = useState({ ds: '', y: '', sku: '' });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    
    const [selectedSku, setSelectedSku] = useState(results?.selectedSku || '');
    const [forecastPeriods, setForecastPeriods] = useState(90);
    const [forecastModel, setForecastModel] = useState('prophet');

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedSettings, setAdvancedSettings] = useState({
        changepoint_prior_scale: 0.05,
        seasonality_prior_scale: 10.0,
        seasonality_mode: 'additive',
    });

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
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProducts();
    }, [selectedSku]);

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
                    ds: f.ds, pronostico: f.yhat,
                    min: f.yhat_lower, max: f.yhat_upper
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
            
            setResults({
                forecastData: combinedData,
                demandSummary: data.summary,
                metrics: data.metrics,
                components: formattedComponents,
                selectedSku: selectedSku
            });
            setMessage(`Pronóstico para ${selectedSku} generado exitosamente.`);
        } catch (error) {
            setError(`Error: ${error.message}`);
            setResults(null);
        } finally {
            setLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch { return dateString; }
    };
    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return (
                <div className="bg-white p-3 border rounded-md shadow-lg">
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
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">1. Cargar y Mapear Historial de Ventas</h2>
                <div className="flex items-center gap-4 mb-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>

                {csvPreview.headers.length > 0 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Vista Previa de Datos</h3>
                            <div className="overflow-x-auto max-h-48 border rounded-md">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100 sticky top-0"><tr>{csvPreview.headers.map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                                    <tbody>{csvPreview.data.map((row, i) => <tr key={i} className="border-t">{csvPreview.headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Mapeo de Columnas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm">Columna de Fecha (ds)</label><select value={columnMap.ds} onChange={e => setColumnMap(p => ({...p, ds: e.target.value}))} className="w-full p-2 border rounded mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de Valor (y)</label><select value={columnMap.y} onChange={e => setColumnMap(p => ({...p, y: e.target.value}))} className="w-full p-2 border rounded mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de SKU</label><select value={columnMap.sku} onChange={e => setColumnMap(p => ({...p, sku: e.target.value}))} className="w-full p-2 border rounded mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                            </div>
                        </div>
                        <button onClick={handleFileUpload} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md disabled:bg-gray-400">
                            <Upload size={16}/> {loading ? 'Procesando...' : 'Confirmar y Cargar Datos'}
                        </button>
                    </div>
                )}
                {message && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-md">{message}</p>}
                {error && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-md whitespace-pre-wrap">{error}</div>}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">2. Generar Pronóstico de Demanda</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} className="p-2 border rounded-md w-full">
                            <option value="">Selecciona un producto...</option>
                            {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Pronóstico</label>
                        <select value={forecastModel} onChange={(e) => setForecastModel(e.target.value)} className="p-2 border rounded-md w-full">
                            <option value="prophet">Prophet (Recomendado)</option>
                            <option value="ses">Suavizado Exponencial Simple</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Días a Pronosticar</label>
                        <input type="number" value={forecastPeriods} onChange={(e) => setForecastPeriods(e.target.value)} className="p-2 border rounded-md w-full" placeholder="Ej. 90"/>
                     </div>
                </div>

                <div className="mt-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                        <Sliders size={16}/> {showAdvanced ? 'Ocultar' : 'Mostrar'} Configuración Avanzada
                    </button>
                    {showAdvanced && forecastModel === 'prophet' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-md bg-gray-50 mb-4">
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Flexibilidad de Tendencia</label>
                                <input type="range" name="changepoint_prior_scale" min="0.01" max="1.0" step="0.01" value={advancedSettings.changepoint_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                <span className="text-xs text-gray-500">Valor: {advancedSettings.changepoint_prior_scale}</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Controla la rapidez con que el modelo se adapta a los cambios en la tendencia. Valores altos son más flexibles.
                                </span>
                            </div>
                             <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Fuerza de Estacionalidad</label>
                                <input type="range" name="seasonality_prior_scale" min="1.0" max="20.0" step="0.5" value={advancedSettings.seasonality_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                 <span className="text-xs text-gray-500">Valor: {advancedSettings.seasonality_prior_scale}</span>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Ajusta la influencia de los patrones estacionales (semanales, anuales).
                                </span>
                            </div>
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Modo de Estacionalidad</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="additive" checked={advancedSettings.seasonality_mode === 'additive'} onChange={handleAdvancedSettingsChange}/> Aditivo</label>
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="multiplicative" checked={advancedSettings.seasonality_mode === 'multiplicative'} onChange={handleAdvancedSettingsChange}/> Multiplicativo</label>
                                </div>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                     'Multiplicativo' si las fluctuaciones estacionales crecen con la tendencia (p.ej. ventas navideñas).
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleGenerateForecast} disabled={loading || !selectedSku} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-md disabled:bg-gray-400">
                    <LineChartIcon size={16}/> {loading ? 'Generando...' : 'Generar Pronóstico'}
                </button>
            </div>
            
            {results && results.forecastData && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Pronóstico para {results.selectedSku}</h3>
                        {results.metrics && (
                            <div className="text-xs text-right text-gray-600 bg-gray-50 p-2 rounded-md">
                                <p><strong>Métricas del Modelo:</strong></p>
                                <p>Error Absoluto Medio (MAE): <strong>{results.metrics.mae?.toFixed(2) ?? 'N/A'}</strong></p>
                                <p>Raíz del Error Cuadrático Medio (RMSE): <strong>{results.metrics.rmse?.toFixed(2) ?? 'N/A'}</strong></p>
                            </div>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                         <ComposedChart data={results.forecastData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="historico" name="Ventas Históricas" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
                            <Line type="monotone" dataKey="pronostico" name="Pronóstico" stroke="#16a34a" dot={false}/>
                            <Area type="monotone" dataKey="max" name="Intervalo de Confianza" stroke="none" fill="#e5e7eb" fillOpacity={0.5} data={results.forecastData.filter(d => d.max !== undefined)} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
            
            {results && results.components && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Componentes del Pronóstico</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {results.components.trend && (
                            <div>
                                <h4 className="font-semibold text-center mb-2">Tendencia</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={results.components.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} /><YAxis domain={['dataMin', 'dataMax']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Tendencia" stroke="#8884d8" dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        {results.components.weekly && (
                             <div>
                                <h4 className="font-semibold text-center mb-2">Estacionalidad Semanal</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={results.components.weekly.slice(0, 7)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Semanal" stroke="#82ca9d" dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                         {results.components.yearly && (
                             <div>
                                <h4 className="font-semibold text-center mb-2">Estacionalidad Anual</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={results.components.yearly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Anual" stroke="#ffc658" dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {results && results.demandSummary && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen de Demanda Semanal para {results.selectedSku}</h3>
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
                </div>
            )}
        </div>
    );
};

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
                throw new Error(data.detail || 'Error al generar el PMP.');
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
    
    const calculatedPmp = React.useMemo(() => {
        if (!results || !results.tableState) return null;

        const { initialData, tableState } = results;
        const calculatedPeriods = [];

        tableState.forEach((period, index) => {
            const initialInventory = index === 0 ? initialData.initial_inventory : calculatedPeriods[index - 1].projectedInventory;
            const projectedInventory = initialInventory + period.plannedProduction - period.demand;
            
            calculatedPeriods.push({ ...period, initialInventory, projectedInventory });
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
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Generar Plan Maestro de Producción (PMP)</h2>
                 <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto Terminado</label>
                        <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} className="p-2 border rounded-md w-full">
                             <option value="">Selecciona un producto...</option>
                            {products.map(p => <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>)}
                        </select>
                    </div>
                    <button onClick={handleGeneratePMP} disabled={loading || !selectedSku} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md disabled:bg-gray-400">
                        <Calendar size={16}/> {loading ? 'Cargando...' : 'Generar PMP'}
                    </button>
                 </div>
                 {error && <p className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-md">{error}</p>}
            </div>

            {results && calculatedPmp && (
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Plan Maestro para {results.selectedSku}</h3>
                     </div>
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
                                                        <input type="number" value={cellData}
                                                            onChange={(e) => handleProductionChange(index, e.target.value)}
                                                            className="w-20 p-2 text-center bg-transparent border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                 </div>
            )}
        </div>
    )
};

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

  const dashboardMetrics = React.useMemo(() => {
    if (!items || items.length === 0) {
      return { totalSkus: 0, totalUnits: 0, lowStockItems: 0, obsoleteItems: 0 };
    }
    
    const totalUnits = items.reduce((sum, item) => sum + item.in_stock, 0);
    const lowStockItems = items.filter(item => 
        item.reorder_point !== null && item.in_stock <= item.reorder_point
    ).length;
    const obsoleteItems = items.filter(item => item.status === 'Obsoleto').length;

    return { totalSkus: items.length, totalUnits, lowStockItems, obsoleteItems };
  }, [items]);
  
  if (loading) return <div className="p-8 text-center">Cargando datos del dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full"><Package size={28} className="text-blue-600" /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Total de SKUs</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardMetrics.totalSkus}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full"><ShoppingCart size={28} className="text-green-600" /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Unidades en Stock</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardMetrics.totalUnits}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full"><AlertTriangle size={28} className="text-yellow-600" /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Ítems con Stock Bajo</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardMetrics.lowStockItems}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="bg-gray-100 p-3 rounded-full"><Trash2 size={28} className="text-gray-600" /></div>
            <div>
                <p className="text-gray-500 text-sm font-medium">Ítems Obsoletos</p>
                <p className="text-3xl font-bold text-gray-800">{dashboardMetrics.obsoleteItems}</p>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Alertas de Inventario: Stock Bajo</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
        </div>
      </div>
    </div>
  );
};

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

    if (loading) return <div className="p-8 text-center">Cargando configuración...</div>;
    if (error || !settings) return <div className="p-8 text-center text-red-500">{error || 'No se pudo cargar la configuración.'}</div>;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Configuración del Sistema</h2>
                
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Información de la Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-600">Nombre de la Empresa</label>
                            <input id="company_name" name="company_name" value={settings.company_name} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
                        </div>
                        <div>
                            <label htmlFor="currency_symbol" className="block text-sm font-medium text-gray-600">Símbolo de Moneda</label>
                            <input id="currency_symbol" name="currency_symbol" value={settings.currency_symbol} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4">Producción e Inventario</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="default_lead_time_days" className="block text-sm font-medium text-gray-600">Lead Time de Compra por Defecto (días)</label>
                            <input type="number" id="default_lead_time_days" name="default_lead_time_days" value={settings.default_lead_time_days} onChange={handleChange} className="mt-1 p-2 border rounded-md w-full" />
                        </div>
                        <div className="flex items-center pt-6">
                            <input type="checkbox" id="allow_negative_stock" name="allow_negative_stock" checked={settings.allow_negative_stock} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="allow_negative_stock" className="ml-3 block text-sm text-gray-900">Permitir Stock Negativo</label>
                             <span className="group relative ml-2">
                                <HelpCircle size={16} className="text-gray-400 cursor-pointer"/>
                                <span className="absolute bottom-full mb-2 w-48 p-2 text-xs text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Permite que las cantidades de inventario caigan por debajo de cero. Usar con precaución.
                                </span>
                            </span>
                        </div>
                     </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Parámetros de Ítems</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Ubicaciones de Bodega</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Nueva ubicación" className="p-2 border rounded-md w-full" />
                                <button onClick={() => handleAddToList('locations', newLocation, setNewLocation)} className="p-2 bg-blue-500 text-white rounded-md"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                {settings.locations.map(loc => (
                                    <li key={loc} className="flex justify-between items-center text-sm p-1 bg-gray-50 rounded">
                                        {loc}
                                        <button onClick={() => handleRemoveFromList('locations', loc)} className="text-red-500"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Unidades de Medida</label>
                             <div className="flex items-center gap-2 mt-1">
                                <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Nueva unidad" className="p-2 border rounded-md w-full" />
                                <button onClick={() => handleAddToList('units_of_measure', newUnit, setNewUnit)} className="p-2 bg-blue-500 text-white rounded-md"><Plus size={16}/></button>
                            </div>
                            <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                {settings.units_of_measure.map(unit => (
                                    <li key={unit} className="flex justify-between items-center text-sm p-1 bg-gray-50 rounded">
                                        {unit}
                                        <button onClick={() => handleRemoveFromList('units_of_measure', unit)} className="text-red-500"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4">
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
};

const PlaceholderView = ({ title }) => <div className="p-8"><div className="bg-white p-10 rounded-2xl shadow-md text-center"><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-2">Este módulo estará disponible próximamente.</p></div></div>;

function App() {
  const [activeView, setActiveView] = useState('items');
  const [predictionResults, setPredictionResults] = useState(null);
  const [pmpResults, setPmpResults] = useState(null);

  const getTitle = (view) => ({'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', 'prediction': 'Predicción de Demanda', 'pmp': 'Plan Maestro de Producción', 'mrp': 'Plan de Requerimiento de Materiales', 'settings': 'Configuración'}[view] || 'Dashboard');
  
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
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-80 fixed h-full shadow-lg z-10"><Sidebar activeView={activeView} setActiveView={setActiveView} /></div>
      <main className="flex-1 ml-80 flex flex-col"><Header title={getTitle(activeView)} /><div className="flex-grow overflow-y-auto">{renderContent()}</div></main>
    </div>
  );
}
export default App;
