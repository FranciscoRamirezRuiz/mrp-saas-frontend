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
import './App.css'; // Asegúrate de que este import esté presente

function App() {
    const [activeView, setActiveView] = useState('dashboard');
    const [showHome, setShowHome] = useState(true);
    
    // --- ESTADO LEVANTADO ---
    // Mantenemos los resultados de PMP y Predicciones aquí
    const [predictionResults, setPredictionResults] = useState([]);
    const [pmpResults, setPmpResults] = useState([]);
    
    // 1. Mantenemos los resultados del MRP aquí (MODIFICADO: AHORA ES UN ARRAY Y USA LOCALSTORAGE)
    const [mrpResults, setMrpResults] = useState(() => {
        const saved = localStorage.getItem('mrpResults');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Mantenemos el historial de cargas aquí (cargado desde localStorage para persistencia)
    const [uploadedItemFiles, setUploadedItemFiles] = useState(() => {
        const saved = localStorage.getItem('uploadedItemFiles');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [uploadedSalesFiles, setUploadedSalesFiles] = useState(() => {
        const saved = localStorage.getItem('uploadedSalesFiles');
        return saved ? JSON.parse(saved) : [];
    });

    // --- FIN ESTADO LEVANTADO ---

    // Funciones "setter" que también guardan en localStorage
    const setAndStoreItemFiles = (files) => {
        setUploadedItemFiles(files);
        localStorage.setItem('uploadedItemFiles', JSON.stringify(files));
    };

    const setAndStoreSalesFiles = (files) => {
        setUploadedSalesFiles(files);
        localStorage.setItem('uploadedSalesFiles', JSON.stringify(files));
    };

    // --- NUEVA FUNCIÓN PARA GUARDAR MRP RESULTS ---
    const setAndStoreMrpResults = (results) => {
        setMrpResults(results);
        localStorage.setItem('mrpResults', JSON.stringify(results));
    };
    // --- FIN NUEVA FUNCIÓN ---

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
        const skusWithPrediction = predictionResults.map(p => p.selectedSku);

        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'items': return <ItemsView 
                                    uploadedItemFiles={uploadedItemFiles} 
                                    setUploadedItemFiles={setAndStoreItemFiles} 
                                />; 
            case 'bom': return <BOMView />; 
            case 'prediction': return <PredictionView 
                                        results={predictionResults} 
                                        setResults={setPredictionResults} 
                                        uploadedSalesFiles={uploadedSalesFiles}
                                        setUploadedSalesFiles={setAndStoreSalesFiles}
                                    />;
            case 'pmp': return <PMPView 
                                    results={pmpResults} 
                                    setResults={setPmpResults} 
                                    skusWithPrediction={skusWithPrediction} 
                                />;
            case 'mrp_materials': return <MRPView 
                                            pmpResults={pmpResults} 
                                            // --- MODIFICADO: Pasamos los setters correctos ---
                                            mrpResults={mrpResults}
                                            setMrpResults={setAndStoreMrpResults}
                                            // --- FIN MODIFICADO ---
                                        />;
            case 'mrp_products': return <PlaceholderView title={getTitle(activeView)} />;
            case 'settings': return <SettingsView />;
            default: return <PlaceholderView title={getTitle(activeView)} />;
        }
    };
    
    if (showHome) {
        return <HomeView onStart={() => setShowHome(false)} />;
    }

    return (
        // APLICAMOS LA CLASE DE FONDO AQUÍ
        <div className="app-background flex flex-col h-screen font-sans antialiased">
            <Header activeView={activeView} setActiveView={setActiveView} onLogoClick={goToHome} />
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default App;