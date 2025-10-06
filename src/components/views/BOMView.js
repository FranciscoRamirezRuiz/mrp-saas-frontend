// src/components/views/BOMView.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X, Edit, Trash2, Search, FileDown, Upload, GitMerge, PlusCircle, FilterX, Package, Combine, Component, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';
import ConfirmationModal from '../common/ConfirmationModal';
import SearchableSelect from '../common/SearchableSelect';
import { API_URL } from '../../api/config';

// --- Sub-componente: ItemsTable (Tabla de ítems requeridos) ---
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

// --- Sub-componente: BOMsTable (Lista principal de BOMs) ---
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
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);


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

    const handleBulkDelete = () => {
        setIsBulkDeleteConfirmOpen(true);
    };

    const executeBulkDelete = async () => {
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
        } finally {
            setIsBulkDeleteConfirmOpen(false);
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
            {isBulkDeleteConfirmOpen && (
                <ConfirmationModal
                    message={`¿Seguro que quieres eliminar los ${selectedBoms.length} BOM(s) seleccionados? Esta acción no se puede deshacer.`}
                    onConfirm={executeBulkDelete}
                    onCancel={() => setIsBulkDeleteConfirmOpen(false)}
                />
            )}
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

// --- Sub-componente: BOMEditor (Editor de un BOM específico) ---
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

// --- Sub-componente: BomTreeViewModal (Modal para ver la jerarquía) ---
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

// --- Componente Principal de la Vista BOM ---
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

export default BOMView;
