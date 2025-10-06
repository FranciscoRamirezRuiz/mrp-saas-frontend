// src/components/views/ItemsView.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Edit, Trash2, Search, FileDown, Upload, ArrowUpDown, FilterX } from 'lucide-react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_URL } from '../../api/config';
import Card from '../common/Card';
import ItemModal from '../common/ItemModal';
import FileUploadModal from '../common/FileUploadModal';
import ConfirmationModal from '../common/ConfirmationModal';
import BulkEditModal from '../common/BulkEditModal';

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

export default ItemsView;