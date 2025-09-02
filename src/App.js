import React, { useState, useEffect, useCallback } from 'react';
import { Home, BrainCircuit, Calendar, ShoppingCart, Settings, ChevronDown, Bell, PlusCircle, Trash2, ClipboardList, AlertTriangle, Wrench, Package } from 'lucide-react';

// URL base de la API
const API_URL = 'http://127.0.0.1:8000';

// Componente de Navegación Lateral (Sidebar)
const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, view: 'dashboard' },
    { name: 'Predicción de Demanda', icon: BrainCircuit, view: 'prediction' },
    { name: 'Plan Maestro (PMP)', icon: Calendar, view: 'pmp' },
    { name: 'Plan de Materiales (MRP)', icon: ShoppingCart, view: 'mrp' },
    { name: 'Gestión de BOM', icon: ClipboardList, view: 'bom' },
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

// Componente de Cabecera
const Header = ({ title }) => (
  <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200 sticky top-0 z-10">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <div className="flex items-center space-x-6">
      <button className="relative text-gray-500 hover:text-gray-800"><Bell size={24} /></button>
      <div className="flex items-center"><p className="text-gray-700 font-semibold">Mi Empresa S.A.</p><ChevronDown size={20} className="ml-1 text-gray-500" /></div>
    </div>
  </header>
);

// Componente para la vista de Gestión de BOM
const BOMView = () => {
    const [products, setProducts] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [bomItems, setBomItems] = useState([]);
    const [newMaterial, setNewMaterial] = useState('');
    const [newQuantity, setNewQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [productsRes, materialsRes] = await Promise.all([
                    fetch(`${API_URL}/products/`),
                    fetch(`${API_URL}/materials/`)
                ]);
                const productsData = await productsRes.json();
                const materialsData = await materialsRes.json();

                setProducts(productsData);
                setRawMaterials(materialsData);

                if (productsData.length > 0) setSelectedProduct(productsData[0].id);
                if (materialsData.length > 0) setNewMaterial(materialsData[0].id);
            } catch (err) {
                setError('No se pudieron cargar los datos maestros. Asegúrate de que el backend esté funcionando.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchBom = useCallback(async () => {
        if (!selectedProduct) return;
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_URL}/boms/${selectedProduct}`);
            if (!response.ok) throw new Error('No se pudo cargar la BOM.');
            const data = await response.json();
            setBomItems(data.items);
        } catch (err) {
            setError(err.message);
            setBomItems([]); // Limpiar en caso de error
        } finally {
            setLoading(false);
        }
    }, [selectedProduct]);

    useEffect(() => { fetchBom(); }, [fetchBom]);

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/boms/${selectedProduct}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ material_id: parseInt(newMaterial, 10), quantity: parseInt(newQuantity, 10) })
            });
            if (!response.ok) throw new Error((await response.json()).detail);
            fetchBom();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleRemoveMaterial = async (materialId) => {
        if (window.confirm('¿Estás seguro?')) {
            try {
                await fetch(`${API_URL}/boms/${selectedProduct}/${materialId}`, { method: 'DELETE' });
                fetchBom();
            } catch (err) {
                alert('Error al eliminar el material.');
            }
        }
    };

    if (loading && products.length === 0) return <p>Cargando...</p>;
    if (error) return <div className="p-8 text-red-500"><AlertTriangle className="inline mr-2"/>{error}</div>;

    return (
        <div className="p-8 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Seleccionar Producto</h3>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Lista de Materiales (BOM)</h3>
                    {loading ? <p>Cargando BOM...</p> : 
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b bg-gray-50"><th className="p-4">ID</th><th className="p-4">Nombre</th><th className="p-4">Cantidad</th><th className="p-4">Acciones</th></tr></thead>
                            <tbody>
                                {bomItems.length > 0 ? bomItems.map(({ material, quantity }) => (
                                    <tr key={material.id} className="border-b">
                                        <td className="p-4 font-medium">{material.id}</td><td>{material.name}</td><td>{quantity}</td>
                                        <td><button onClick={() => handleRemoveMaterial(material.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button></td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="p-4 text-center text-gray-500">No hay materiales.</td></tr>}
                            </tbody>
                        </table>
                    </div>}
                </div>
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Añadir Componente</h3>
                    <form onSubmit={handleAddMaterial} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Materia Prima</label>
                            <select value={newMaterial} onChange={e => setNewMaterial(e.target.value)} className="mt-1 block w-full p-2 border rounded-md">
                                {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Cantidad</label>
                            <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} min="1" className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">
                            <PlusCircle size={20} className="mr-2" />Añadir
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Componente para la vista de Plan de Requerimiento de Materiales (MRP)
const MRPView = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [mrpData, setMrpData] = useState(null);
    const [mrpStatus, setMrpStatus] = useState('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products/`);
                const data = await response.json();
                setProducts(data);
                if (data.length > 0) setSelectedProduct(data[0].id);
            } catch (err) {
                setError('No se pudieron cargar los productos.');
            }
        };
        fetchProducts();
    }, []);

    const handleGenerateMRP = async () => {
        if (!selectedProduct) return;
        setMrpStatus('loading');
        setError('');
        const mockProductionPlan = [100, 150, 120]; 
        try {
            const response = await fetch(`${API_URL}/mrp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: parseInt(selectedProduct, 10), production_plan: mockProductionPlan }),
            });
            if (!response.ok) throw new Error((await response.json()).detail);
            const result = await response.json();
            setMrpData(result.mrp_plan);
            setMrpStatus('completed');
        } catch (err) {
            setError(err.message);
            setMrpStatus('error');
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Generar Plan de Materiales (MRP)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium">Producto a Planificar</label>
                        <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="mt-1 block w-full p-2 border rounded-md">
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerateMRP} disabled={mrpStatus === 'loading' || !selectedProduct} className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 h-10 disabled:bg-blue-300">
                        <Wrench size={20} className="mr-2" />
                        {mrpStatus === 'loading' ? 'Calculando...' : 'Calcular MRP'}
                    </button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resultados del Plan de Materiales</h3>
                {mrpStatus === 'idle' && <div className="h-[200px] flex flex-col items-center justify-center text-center text-gray-500 bg-gray-50 rounded-lg"><Package size={48} className="mb-4" /><h4>El plan de materiales aparecerá aquí</h4></div>}
                {mrpStatus === 'error' && <div className="h-[200px] flex flex-col items-center justify-center text-center text-red-600 bg-red-50 rounded-lg"><AlertTriangle size={48} className="mb-4" /><h4>Error</h4><p>{error}</p></div>}
                {mrpStatus === 'completed' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead><tr className="border-b bg-gray-50"><th className="p-4">ID</th><th className="p-4">Nombre</th><th className="p-4">Necesidad Bruta</th><th className="p-4">En Inventario</th><th className="p-4 bg-green-50 text-green-800">A Ordenar</th></tr></thead>
                            <tbody>
                                {mrpData.map((row) => (
                                    <tr key={row.material_id} className="border-b">
                                        <td className="p-4 font-medium">{row.material_id}</td><td>{row.material_name}</td><td>{row.gross_requirement}</td><td>{row.in_stock}</td>
                                        <td className={`p-4 font-bold ${row.net_requirement > 0 ? 'text-green-700 bg-green-50' : ''}`}>{row.net_requirement}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const PlaceholderView = ({ title }) => <div className="p-8"><div className="bg-white p-10 rounded-2xl shadow-md text-center"><h2 className="text-2xl font-bold text-gray-800">{title}</h2></div></div>;

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <PlaceholderView title="Dashboard" />;
      case 'prediction': return <PlaceholderView title="Módulo de Predicción" />;
      case 'pmp': return <PlaceholderView title="Módulo de Plan Maestro (PMP)" />;
      case 'mrp': return <MRPView />;
      case 'bom': return <BOMView />;
      case 'settings': return <PlaceholderView title="Configuración" />;
      default: return <PlaceholderView title="Dashboard" />;
    }
  };
  const getTitle = () => {
      switch (activeView) {
          case 'dashboard': return 'Dashboard General';
          case 'prediction': return 'Predicción de Demanda';
          case 'pmp': return 'Plan Maestro de Producción (PMP)';
          case 'mrp': return 'Plan de Requerimientos (MRP)';
          case 'bom': return 'Gestión de Lista de Materiales (BOM)';
          case 'settings': return 'Configuración de la Cuenta';
          default: return 'Dashboard';
      }
  }
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="w-72 fixed h-full shadow-lg z-10"><Sidebar activeView={activeView} setActiveView={setActiveView} /></div>
      <main className="flex-1 ml-72 flex flex-col">
        <Header title={getTitle()} />
        <div className="flex-grow overflow-y-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;