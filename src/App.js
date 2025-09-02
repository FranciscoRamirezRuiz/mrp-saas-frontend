import React, { useState, useEffect, useCallback } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Bell, ChevronDown, PlusCircle, AlertTriangle, X, Edit } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' },
    { name: 'Gestión de Ítems', icon: Package, view: 'items' },
    { name: 'Gestión de BOM', icon: ClipboardList, view: 'bom' },
    { name: 'Predicción', icon: BrainCircuit, view: 'prediction' },
    { name: 'Plan Maestro', icon: Calendar, view: 'pmp' },
    { name: 'Plan de Materiales', icon: ShoppingCart, view: 'mrp' },
    { name: 'Configuración', icon: Settings, view: 'settings' },
  ];
  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-200">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <BrainCircuit className="h-8 w-8 text-white" />
        <h1 className="ml-3 text-2xl font-bold text-white">DemandFlow</h1>
      </div>
      <nav className="flex-grow px-4 py-6">
        {navItems.map((item) => (
          <button key={item.name} onClick={() => setActiveView(item.view)}
            className={`flex items-center w-full text-left px-4 py-3 mb-2 text-lg rounded-lg transition-colors duration-200 ${activeView === item.view ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
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
    const [formData, setFormData] = useState(
        item || {
            sku: '', name: '', unit_of_measure: 'Unidades', category: '',
            in_stock: 0, location: '', reorder_point: 0, reorder_quantity: 0,
            attributes: {}, status: 'Activo', expiration_date: null,
            item_type: 'Materia Prima'
        }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{item ? 'Editar Ítem' : 'Crear Nuevo Ítem'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <h3 className="font-semibold text-gray-700">Información Esencial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU (N° de Pieza)" required className="p-2 border rounded" disabled={!!item} />
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre o Descripción" required className="p-2 border rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="category" value={formData.category} onChange={handleChange} placeholder="Categoría (ej. Repuestos)" className="p-2 border rounded" />
                        <input name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} placeholder="Unidad de Medida" className="p-2 border rounded" />
                    </div>

                    <h3 className="font-semibold text-gray-700 pt-2">Gestión de Stock y Logística</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Ubicación (ej. Bodega A, P3)" className="p-2 border rounded" />
                         <input type="number" name="in_stock" value={formData.in_stock} onChange={handleChange} placeholder="En Stock" className="p-2 border rounded" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="number" name="reorder_point" value={formData.reorder_point || ''} onChange={handleChange} placeholder="Stock Crítico (Reorder Point)" className="p-2 border rounded" />
                        <input type="number" name="reorder_quantity" value={formData.reorder_quantity || ''} onChange={handleChange} placeholder="Cantidad a Reordenar" className="p-2 border rounded" />
                    </div>

                    <h3 className="font-semibold text-gray-700 pt-2">Atributos y Estado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded">
                            <option>Activo</option>
                            <option>Obsoleto</option>
                            <option>Descontinuado</option>
                        </select>
                        <div>
                            <label className="text-sm text-gray-500">Fecha de Vencimiento</label>
                            <input type="date" name="expiration_date" value={formData.expiration_date || ''} onChange={handleChange} className="p-2 border rounded w-full" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Ítem</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ItemsView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/items/`);
            if (!response.ok) throw new Error('Error al cargar los datos.');
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

    const handleSaveItem = async (itemData) => {
        // Limpiar datos opcionales vacíos para que no se envíen como strings vacíos
        const dataToSend = {
            ...itemData,
            location: itemData.location || null,
            reorder_point: itemData.reorder_point ? parseInt(itemData.reorder_point, 10) : null,
            reorder_quantity: itemData.reorder_quantity ? parseInt(itemData.reorder_quantity, 10) : null,
            expiration_date: itemData.expiration_date || null,
            item_type: 'Materia Prima' // Hardcoded por ahora, podría ser parte del formulario
        };

        try {
            const response = await fetch(`${API_URL}/items/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Error al guardar el ítem.');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="p-8">
             {isModalOpen && <ItemModal onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestión de Ítems e Inventario</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                    <PlusCircle size={16} />
                    Crear Ítem
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Categoría</th>
                                <th className="p-3">En Stock</th>
                                <th className="p-3">Stock Crítico</th>
                                <th className="p-3">Ubicación</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                <tr><td colSpan="8" className="text-center p-4">Cargando...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="8" className="text-center text-red-500 p-4">{error}</td></tr>
                            ) : (
                                items.map(item => {
                                    const needsReorder = item.reorder_point !== null && item.in_stock <= item.reorder_point;
                                    return (
                                    <tr key={item.sku} className={`border-b hover:bg-gray-50 ${needsReorder ? 'bg-yellow-100' : 'bg-white'}`}>
                                        <td className="p-3 font-medium text-gray-900">{item.sku}</td>
                                        <td className="p-3">{item.name}</td>
                                        <td className="p-3">{item.category}</td>
                                        <td className={`p-3 font-semibold ${needsReorder ? 'text-yellow-800' : 'text-gray-800'}`}>{item.in_stock} {item.unit_of_measure}</td>
                                        <td className="p-3">{item.reorder_point ?? 'N/A'}</td>
                                        <td className="p-3">{item.location ?? 'N/A'}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                item.status === 'Activo' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Obsoleto' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3"><button className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button></td>
                                    </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PlaceholderView = ({ title }) => <div className="p-8"><div className="bg-white p-10 rounded-2xl shadow-md text-center"><h2 className="text-2xl font-bold text-gray-800">{title}</h2></div></div>;
const BOMView = () => <PlaceholderView title="Gestión de BOM" />;

function App() {
  const [activeView, setActiveView] = useState('items');
  const getTitle = (view) => ({
    'dashboard': 'Dashboard General',
    'items': 'Gestión de Ítems e Inventario',
    'bom': 'Gestión de Lista de Materiales (BOM)',
    'prediction': 'Predicción de Demanda',
    'pmp': 'Plan Maestro de Producción (PMP)',
    'mrp': 'Plan de Requerimientos (MRP)',
    'settings': 'Configuración de la Cuenta',
  }[view] || 'Dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'items': return <ItemsView />;
      case 'bom': return <BOMView />;
      default: return <PlaceholderView title={getTitle(activeView)} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-80 fixed h-full shadow-lg z-10"><Sidebar activeView={activeView} setActiveView={setActiveView} /></div>
      <main className="flex-1 ml-80 flex flex-col">
        <Header title={getTitle(activeView)} />
        <div className="flex-grow overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;