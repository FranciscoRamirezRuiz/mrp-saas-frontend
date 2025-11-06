// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Estilos ---
import './App.css'; 
import './PublicLayout.css'; 

// --- VISTAS PRIVADAS (LA APP INTERNA) ---
import Header from './components/Header';
import DashboardView from './components/views/DashboardView';
import ItemsView from './components/views/ItemsView';
import BOMView from './components/views/BOMView';
import PredictionView from './components/views/PredictionView';
import PMPView from './components/views/PMPView';
import MRPView from './components/views/MRPView';
import SettingsView from './components/views/SettingsView';
import PlaceholderView from './components/views/PlaceholderView';

// --- VISTAS PÚBLICAS (EL NUEVO LANDING SITE) ---
import PublicHeader from './components/PublicHeader';
import PublicHomeView from './components/views/PublicHomeView'; 
import LoginView from './components/views/LoginView';
import AboutUsView from './components/views/AboutUsView';
import PricingView from './components/views/PricingView';
import ReviewsView from './components/views/ReviewsView';
import DemoView from './components/views/DemoView';
import Footer from './components/Footer'; 
// (Se eliminaron las importaciones de TermsView y PrivacyView)

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // --- ESTADO LEVANTADO (Se mantiene igual) ---
    const [predictionResults, setPredictionResults] = useState([]);
    const [pmpResults, setPmpResults] = useState([]);
    const [mrpResults, setMrpResults] = useState(() => {
        const saved = localStorage.getItem('mrpResults');
        return saved ? JSON.parse(saved) : [];
    });
    const [uploadedItemFiles, setUploadedItemFiles] = useState(() => {
        const saved = localStorage.getItem('uploadedItemFiles');
        return saved ? JSON.parse(saved) : [];
    });
    const [uploadedSalesFiles, setUploadedSalesFiles] = useState(() => {
        const saved = localStorage.getItem('uploadedSalesFiles');
        return saved ? JSON.parse(saved) : [];
    });
    const setAndStoreItemFiles = (files) => {
        setUploadedItemFiles(files);
        localStorage.setItem('uploadedItemFiles', JSON.stringify(files));
    };
    const setAndStoreSalesFiles = (files) => {
        setUploadedSalesFiles(files);
        localStorage.setItem('uploadedSalesFiles', JSON.stringify(files));
    };
    const setAndStoreMrpResults = (results) => {
        setMrpResults(results);
        localStorage.setItem('mrpResults', JSON.stringify(results));
    };
    // --- FIN ESTADO LEVANTADO ---

    const handleLoginSuccess = (newToken) => {
        setToken(newToken);
    };

    const handleLogout = () => {
        setToken(null);
    };

    return (
        <BrowserRouter>
            {!token ? (
                // --- RUTAS PÚBLICAS (Si NO hay token) ---
                <div className="public-layout">
                    <PublicHeader />
                    <main className="public-content">
                        <Routes>
                            <Route path="/" element={<PublicHomeView />} />
                            <Route path="/login" element={<LoginView onLoginSuccess={handleLoginSuccess} />} />
                            <Route path="/quienes-somos" element={<AboutUsView />} />
                            <Route path="/planes" element={<PricingView />} />
                            <Route path="/reseñas" element={<ReviewsView />} />
                            <Route path="/demo" element={<DemoView />} />
                            {/* (Se eliminaron las rutas legales) */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            ) : (
                // --- RUTAS PRIVADAS (Si SÍ hay token) ---
                <div className="app-background flex flex-col h-screen font-sans antialiased">
                    <Header onLogout={handleLogout} />
                    <div className="flex-1 overflow-y-auto">
                        <Routes>
                            <Route path="/dashboard" element={<DashboardView />} />
                            <Route 
                                path="/items" 
                                element={<ItemsView 
                                            uploadedItemFiles={uploadedItemFiles} 
                                            setUploadedItemFiles={setAndStoreItemFiles} 
                                        />} 
                            />
                            <Route path="/bom" element={<BOMView />} />
                            <Route 
                                path="/prediction" 
                                element={<PredictionView 
                                            results={predictionResults} 
                                            setResults={setPredictionResults} 
                                            uploadedSalesFiles={uploadedSalesFiles}
                                            setUploadedSalesFiles={setAndStoreSalesFiles}
                                        />} 
                            />
                            <Route 
                                path="/pmp" 
                                element={<PMPView 
                                            results={pmpResults} 
                                            setResults={setPmpResults} 
                                            skusWithPrediction={predictionResults.map(p => p.selectedSku)} 
                                        />} 
                            />
                            <Route 
                                path="/mrp"
                                element={<MRPView 
                                            pmpResults={pmpResults} 
                                            mrpResults={mrpResults}
                                            setMrpResults={setAndStoreMrpResults}
                                        />} 
                            />
                            <Route path="/settings" element={<SettingsView />} />
                            <Route path="/mrp_products" element={<PlaceholderView title="Plan de Requerimiento de Productos" />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </div>
            )}
        </BrowserRouter>
    );
}

export default App;