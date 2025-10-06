// src/App.js
import React, { useState } from 'react';
import Header from './components/Header';
import HomeView from './components/views/HomeView';
import DashboardView from './components/views/DashboardView';
import ItemsView from './components/views/ItemsView';
import BOMView from './components/views/BOMView';
import PredictionView from './components/views/PredictionView';
import PMPView from './components/views/PMPView';
import MRPView from './components/views/MRPView';
import SettingsView from './components/views/SettingsView';
import PlaceholderView from './components/views/PlaceholderView';

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [showHome, setShowHome] = useState(true);
    const [predictionResults, setPredictionResults] = useState([]);
    const [pmpResults, setPmpResults] = useState([]);

    const getTitle = (view) => ({
        'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', 
        'prediction': 'Predicción de Ventas', 'pmp': 'Plan Maestro de Producción', 
        'mrp_materials': 'Plan de Requerimiento de Materiales', 'mrp_products': 'Plan de Requerimiento de Productos',
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
            case 'mrp_materials': return <MRPView pmpResults={pmpResults} />;
            case 'mrp_products': return <PlaceholderView title={getTitle(activeView)} />;
            case 'settings': return <SettingsView />;
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

export default App;