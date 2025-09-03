import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Bell, ChevronDown, PlusCircle, AlertTriangle, X, Edit, MoreVertical, Info, Trash2, Search, FileDown, Upload } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

// --- COMPONENTES --- 
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
    const attributesToString = (attrs) => Object.entries(attrs).map(([key, value]) => `${key}:${value}`).join(', ');
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
            { sku: '', name: '', unit_of_measure: 'Unidades', category: '', in_stock: 0, location: '', reorder_point: 0, reorder_quantity: 0, attributes: '', status: 'Activo', expiration_date: null, item_type: 'Materia Prima' }
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
                <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button></div>
            </form>
        </div></div>
    );
};

const InfoModal = ({ item, onClose }) => ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-gray-800">Información del Ítem</h2><button onClick={onClose}><X size={24} /></button></div><div className="space-y-2 text-gray-700"><p><strong>SKU:</strong> {item.sku}</p><p><strong>Nombre:</strong> {item.name}</p><p><strong>Categoría:</strong> {item.category}</p>{item.expiration_date && <p><strong>Fecha de Vencimiento:</strong> {new Date(item.expiration_date).toLocaleDateString()}</p>}<p><strong>Atributos:</strong> {Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(', ') || 'N/A'}</p></div></div></div>);

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white rounded-lg shadow-xl p-8"><p className="text-lg mb-4">{message}</p><div className="flex justify-end gap-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button></div></div></div>);

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
            {itemToView && <InfoModal item={itemToView} onClose={() => setItemToView(null)} />}
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
                        {/* TABLA ACTUALIZADA CON TODAS LAS COLUMNAS */}
                        <tr>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Categoría</th>
                            <th className="p-3">En Stock</th>
                            <th className="p-3">Ubicación</th>
                            <th className="p-3">Fecha Venc.</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="8" className="text-center p-4">Cargando...</td></tr>) 
                        : error ? (<tr><td colSpan="8" className="text-center text-red-500 p-4">{error}</td></tr>) 
                        : (items.map(item => {
                            const needsReorder = item.reorder_point !== null && item.in_stock <= item.reorder_point;
                            const expirationDate = item.expiration_date ? new Date(item.expiration_date) : null;
                            const today = new Date();
                            today.setHours(0,0,0,0); // Normalizar para comparar solo la fecha
                            const isExpired = expirationDate && expirationDate < today;

                            return (
                            <tr key={item.sku} className={`border-b hover:bg-gray-50 ${needsReorder ? 'bg-yellow-50' : ''} ${isExpired ? 'bg-red-50' : ''}`}>
                                <td className="p-3 font-medium text-gray-900">{item.sku}</td>
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.category}</td>
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

// --- APP PRINCIPAL Y OTROS COMPONENTES ---
const PlaceholderView = ({ title }) => <div className="p-8"><div className="bg-white p-10 rounded-2xl shadow-md text-center"><h2 className="text-2xl font-bold text-gray-800">{title}</h2></div></div>;
const BOMView = () => <PlaceholderView title="Gestión de BOM" />;
function App() {
  const [activeView, setActiveView] = useState('items');
  const getTitle = (view) => ({'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', /*...*/}[view] || 'Dashboard');
  const renderContent = () => {
    switch (activeView) {
      case 'items': return <ItemsView />; case 'bom': return <BOMView />; default: return <PlaceholderView title={getTitle(activeView)} />;
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