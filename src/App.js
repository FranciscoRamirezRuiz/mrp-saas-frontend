import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Bell, ChevronDown, AlertTriangle, PlusCircle, X, Edit, MoreVertical, Info, Trash2, Search, FileDown, Upload, GitMerge, Plus, LineChart as LineChartIcon, HelpCircle, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


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

const ItemModal = ({ item, onClose, onSave, itemTypeFilter }) => { 
    const attributesToString = (attrs) => Object.entries(attrs || {}).map(([key, value]) => `${key}:${value}`).join(', ');
    const stringToAttributes = (str) => {
        if (!str) return {};
        try {
            return str.split(',').reduce((acc, pair) => {
                const [key, value] = pair.split(':');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {});
        } catch { return {}; }
    };

    const [formData, setFormData] = useState(
            item ? { ...item, attributes: attributesToString(item.attributes) } : 
            { sku: '', name: '', unit_of_measure: 'Unidades', category: '', in_stock: 0, location: '', reorder_point: 0, reorder_quantity: 0, attributes: '', status: 'Activo', expiration_date: null, item_type: itemTypeFilter ? itemTypeFilter[0] : 'Materia Prima' }
    );

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        const finalData = { ...formData, attributes: stringToAttributes(formData.attributes) };
        onSave(finalData, !!item);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">{item ? 'Editar Ítem' : 'Crear Nuevo Ítem'}</h2><button onClick={onClose}><X size={24} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                <h3 className="font-semibold text-gray-700">Información Esencial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU (N° de Pieza)" required className="p-2 border rounded" disabled={!!item} /><input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre o Descripción" required className="p-2 border rounded" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría" className="p-2 border rounded" /><input name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} placeholder="Unidad de Medida" className="p-2 border rounded" /></div>
                <h3 className="font-semibold text-gray-700 pt-2">Gestión de Stock y Logística</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Ubicación" className="p-2 border rounded" /><input type="number" name="in_stock" value={formData.in_stock} onChange={handleChange} placeholder="En Stock" className="p-2 border rounded" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input type="number" name="reorder_point" value={formData.reorder_point || ''} onChange={handleChange} placeholder="Stock Crítico" className="p-2 border rounded" /><input type="number" name="reorder_quantity" value={formData.reorder_quantity || ''} onChange={handleChange} placeholder="Cantidad a Reordenar" className="p-2 border rounded" /></div>
                <h3 className="font-semibold text-gray-700 pt-2">Atributos y Estado</h3>
                <div><label className="text-sm font-medium text-gray-600">Atributos (ej. color:rojo, talla:M)</label><input name="attributes" value={formData.attributes} onChange={handleChange} placeholder="clave:valor, clave:valor" className="p-2 border rounded w-full mt-1" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded"><option>Activo</option><option>Obsoleto</option><option>Descontinuado</option></select><div><label className="text-sm text-gray-500">Fecha de Vencimiento</label><input type="date" name="expiration_date" value={formData.expiration_date || ''} onChange={handleChange} className="p-2 border rounded w-full" /></div></div>
                <select name="item_type" value={formData.item_type} onChange={handleChange} className="p-2 border rounded w-full">
                    {itemTypeFilter ? 
                        itemTypeFilter.map(type => <option key={type} value={type}>{type}</option>) :
                        (<>
                            <option>Materia Prima</option>
                            <option>Producto Intermedio</option>
                            <option>Producto Terminado</option>
                        </>)
                    }
                </select>
                <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button></div>
            </form>
        </div></div>
    );
};

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-8"><p className="text-lg mb-4">{message}</p><div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button></div></div></div>);

const ItemsView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToView, setItemToView] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [openActionMenu, setOpenActionMenu] = useState(null);
    const actionMenuRef = useRef(null);

    const fetchItems = useCallback(async (query = '') => { try { setLoading(true); const response = await fetch(`${API_URL}/items/?search=${query}`); if (!response.ok) throw new Error('Error al cargar.'); setItems(await response.json()); } catch (err) { setError(err.message); } finally { setLoading(false); }}, []);
    useEffect(() => { fetchItems(); }, [fetchItems]);

    useEffect(() => { const handleClickOutside = (event) => { if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) { setOpenActionMenu(null); }}; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);

    const handleSaveItem = async (itemData, isEditing) => {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_URL}/items/${itemData.sku}` : `${API_URL}/items/`;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemData) });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error al guardar.');
            setIsCreateModalOpen(false); setItemToEdit(null); fetchItems(searchQuery);
        } catch (err) { alert(`Error: ${err.message}`); }
    };
    
    const handleDeleteItem = async (sku) => {
        try {
            const response = await fetch(`${API_URL}/items/${sku}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Error al eliminar.');
            setItemToDelete(null); fetchItems(searchQuery);
        } catch(err) { alert(`Error: ${err.message}`); }
    };
    
    return (
        <div className="p-8">
            {isCreateModalOpen && <ItemModal onClose={() => setIsCreateModalOpen(false)} onSave={handleSaveItem} />}
            {itemToEdit && <ItemModal item={itemToEdit} onClose={() => setItemToEdit(null)} onSave={handleSaveItem} />}
            {itemToView && 
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Información del Ítem</h2>
                            <button onClick={() => setItemToView(null)}><X size={24} /></button>
                        </div>
                        <div className="space-y-2 text-gray-700">
                            <p><strong>SKU:</strong> {itemToView.sku}</p>
                            <p><strong>Nombre:</strong> {itemToView.name}</p>
                            <p><strong>Categoría:</strong> {itemToView.category}</p>
                            {itemToView.expiration_date && <p><strong>Fecha de Vencimiento:</strong> {new Date(itemToView.expiration_date).toLocaleDateString()}</p>}
                            <p><strong>Atributos:</strong> {Object.entries(itemToView.attributes).map(([key, value]) => `${key}: ${value}`).join(', ') || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            }
            {itemToDelete && <ConfirmationModal message={`¿Seguro que quieres eliminar el ítem ${itemToDelete.sku}?`} onConfirm={() => handleDeleteItem(itemToDelete.sku)} onCancel={() => setItemToDelete(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2 w-full md:w-1/3">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchItems(searchQuery)} placeholder="Buscar por SKU o Nombre..." className="p-2 border rounded-md w-full" />
                    <button onClick={() => fetchItems(searchQuery)} className="p-2 bg-blue-600 text-white rounded-md"><Search size={20}/></button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 p-2 border rounded-md text-sm"><FileDown size={16}/>PDF</button>
                    <button className="flex items-center gap-2 p-2 border rounded-md text-sm"><FileDown size={16}/>CSV</button>
                    <button className="flex items-center gap-2 p-2 border rounded-md text-sm"><Upload size={16}/>Importar</button>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 p-2 text-sm font-semibold text-white bg-blue-600 rounded-md">
                        <PlusCircle size={16} />Crear Ítem
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md"><div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="p-3">SKU</th><th className="p-3">Nombre</th><th className="p-3">Categoría</th><th className="p-3">En Stock</th>
                            <th className="p-3">Ubicación</th><th className="p-3">Fecha Venc.</th><th className="p-3">Estado</th><th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="8" className="text-center p-4">Cargando...</td></tr>) 
                        : error ? (<tr><td colSpan="8" className="text-center text-red-500 p-4">{error}</td></tr>) 
                        : (items.map(item => {
                            const needsReorder = item.reorder_point !== null && item.in_stock <= item.reorder_point;
                            const expirationDate = item.expiration_date ? new Date(item.expiration_date) : null;
                            const today = new Date(); today.setHours(0,0,0,0);
                            const isExpired = expirationDate && expirationDate < today;
                            return (
                            <tr key={item.sku} className={`border-b hover:bg-gray-50 ${needsReorder ? 'bg-yellow-50' : ''} ${isExpired ? 'bg-red-50' : ''}`}>
                                <td className="p-3 font-medium text-gray-900">{item.sku}</td><td className="p-3">{item.name}</td><td className="p-3">{item.category}</td>
                                <td className={`p-3 font-semibold ${needsReorder ? 'text-yellow-800' : 'text-gray-800'}`}>{item.in_stock} {item.unit_of_measure}</td>
                                <td className="p-3">{item.location ?? 'N/A'}</td>
                                <td className={`p-3 ${isExpired ? 'text-red-600 font-bold' : ''}`}>{expirationDate ? expirationDate.toLocaleDateString() : 'N/A'}</td>
                                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${ item.status === 'Activo' ? 'bg-green-100 text-green-800' : item.status === 'Obsoleto' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span></td>
                                <td className="p-3 relative">
                                    <button onClick={() => setOpenActionMenu(openActionMenu === item.sku ? null : item.sku)}><MoreVertical size={16}/></button>
                                    {openActionMenu === item.sku && (
                                        <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border">
                                            <button onClick={() => { setItemToView(item); setOpenActionMenu(null); }} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"><Info size={14} className="mr-2"/>Más Información</button>
                                            <button onClick={() => { setItemToEdit(item); setOpenActionMenu(null); }} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"><Edit size={14} className="mr-2"/>Editar</button>
                                            <button onClick={() => { setItemToDelete(item); setOpenActionMenu(null); }} className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"><Trash2 size={14} className="mr-2"/>Eliminar</button>
                                        </div>
                                    )}
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


// --- BOM VIEW ---
const BOMView = () => {
    const [view, setView] = useState('list'); // 'list', 'editor', 'tree'
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
            case 'list':
                return <BOMsTable onEdit={(sku) => handleNavigate('editor', sku)} onCreateNew={() => handleNavigate('editor')} onViewTree={(sku) => handleNavigate('tree', sku)} />;
            case 'editor':
                return <BOMEditor allItems={allItems} bomSku={selectedBomSku} onClose={() => handleNavigate('list')} onCreateNewItem={() => setIsItemModalOpen(true)} />;
            case 'tree':
                 return <BomTreeViewModal sku={selectedBomSku} onClose={() => handleNavigate('list')} />;
            default:
                return null;
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
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
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

// --- PREDICTION VIEW ---
const PredictionView = ({ results, setResults }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    // Local state for UI controls
    const [selectedSku, setSelectedSku] = useState(results?.selectedSku || '');
    const [forecastPeriods, setForecastPeriods] = useState(90);
    const [forecastModel, setForecastModel] = useState('prophet');

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
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };

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
            const response = await fetch(`${API_URL}/sales/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                const errorDetail = data.detail.replace(/\n/g, '<br/>');
                const errorElement = document.createElement('div');
                errorElement.innerHTML = errorDetail;
                setError(errorElement.textContent || errorElement.innerText);
                return;
            }
            setMessage(data.message);
        } catch (error) {
            setError(`Error: ${error.message}`);
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
    
    const handleGenerateForecast = async () => {
        if (!selectedSku) {
            setError('Por favor, selecciona un producto.');
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
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
                    pronostico: f.yhat,
                    min: f.yhat_lower,
                    max: f.yhat_upper
                }))
            ].sort((a, b) => a.ds - b.ds);
            
            // Update shared state in App component
            setResults({
                forecastData: combinedData,
                demandSummary: data.summary,
                metrics: data.metrics,
                selectedSku: selectedSku
            });
            setMessage(`Pronóstico para ${selectedSku} generado exitosamente.`);
        } catch (error) {
            setError(`Error: ${error.message}`);
            setResults(null); // Clear previous results on error
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="p-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">1. Cargar Historial de Ventas</h2>
                <p className="text-sm text-gray-600 mb-4">Sube un archivo CSV con las columnas: `fecha_venta` (AAAA-MM-DD), `id_producto`, `cantidad_vendida`.</p>
                <div className="flex items-center gap-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    <button onClick={handleFileUpload} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md disabled:bg-gray-400">
                        <Upload size={16}/> {loading ? 'Cargando...' : 'Cargar Archivo'}
                    </button>
                </div>
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
                    <button onClick={handleGenerateForecast} disabled={loading || !selectedSku} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-md disabled:bg-gray-400">
                        <LineChartIcon size={16}/> {loading ? 'Generando...' : 'Generar Pronóstico'}
                    </button>
                </div>
            </div>
            
            {results && results.forecastData && results.forecastData.length > 0 && (
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
                         <ComposedChart data={results.forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} />
                            <YAxis />
                            <Tooltip labelFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                            <Legend />
                            <Area type="monotone" dataKey="historico" name="Ventas Históricas" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
                            <Line type="monotone" dataKey="pronostico" name="Pronóstico" stroke="#16a34a" />
                            <Area type="monotone" dataKey="max" name="Intervalo de Confianza" stroke="#9ca3af" fill="#e5e7eb" fillOpacity={0.2} strokeDasharray="5 5" data={results.forecastData.filter(d => d.max !== undefined)} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {results && results.demandSummary && results.demandSummary.length > 0 && (
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

// --- PMP VIEW ---
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
            
            // Initialize the interactive table structure
            const initialTable = data.demand_forecast.map(period => ({
                period: period.period,
                demand: period.total_demand,
                plannedProduction: 0, // Editable field
            }));
            
            // Set results to be managed by this component's state
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
    
    // Recalculate the PMP table whenever the planned production changes
    const handleProductionChange = (index, value) => {
        setResults(prev => {
            const newTableState = [...prev.tableState];
            newTableState[index].plannedProduction = parseInt(value, 10) || 0;
            return { ...prev, tableState: newTableState };
        });
    };
    
    // Perform calculations for display
    const calculatedPmp = React.useMemo(() => {
        if (!results || !results.tableState) return null;

        const { initialData, tableState } = results;
        const calculatedPeriods = [];

        tableState.forEach((period, index) => {
            const initialInventory = index === 0 ? initialData.initial_inventory : calculatedPeriods[index - 1].projectedInventory;
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
                                                        <input 
                                                            type="number"
                                                            value={cellData}
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


// --- MAIN APP & OTHER COMPONENTS ---
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

    return {
      totalSkus: items.length,
      totalUnits,
      lowStockItems,
      obsoleteItems,
    };
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
            setTimeout(() => setMessage(''), 3000); // Hide message after 3 seconds
        } catch (error) {
            setError(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando configuración...</div>;
    if (error || !settings) return <div className="p-8 text-center text-red-500">{error || 'No se pudo cargar la configuración.'}</div>;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Configuración del Sistema</h2>
                
                {/* Company Info Section */}
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

                {/* Production & Inventory Section */}
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
  const [activeView, setActiveView] = useState('pmp');
  // State has been split per module for cleaner management and to fix update bugs.
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

