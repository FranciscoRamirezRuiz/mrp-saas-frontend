// src/components/views/PredictionView.js
import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Brush, ReferenceLine, Label } from 'recharts';
import { Upload, CheckCircle, AlertTriangle, LineChart as LineChartIcon, Sliders, X, BarChart2, AreaChart as AreaChartLucide, FileText } from 'lucide-react';
import Card from '../common/Card';
import SearchableSelect from '../common/SearchableSelect';
import { API_URL } from '../../api/config';
import { parseCSV } from '../../utils/parseCSV';
import { formatDate } from '../../utils/formatDate';

const PredictionView = ({ results, setResults }) => {
    const [file, setFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState({ headers: [], data: [] });
    const [columnMap, setColumnMap] = useState({ ds: '', y: '', sku: '' });
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    
    const [selectedSku, setSelectedSku] = useState('');
    const [forecastPeriods, setForecastPeriods] = useState(90);
    const [forecastModel, setForecastModel] = useState('prophet');

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedSettings, setAdvancedSettings] = useState({
        changepoint_prior_scale: 0.05,
        seasonality_prior_scale: 10.0,
        seasonality_mode: 'additive',
    });
    
    const [activeTabSku, setActiveTabSku] = useState(null);
    
    // --- NUEVO: Estado para el historial de cargas ---
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // --- NUEVO: Estado para el tipo de gráfico ---
    const [chartType, setChartType] = useState('line'); // 'line' o 'bar'

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/items/?item_type=Producto Terminado`);
                const finishedProducts = await response.json();
                setProducts(finishedProducts);
                if (finishedProducts.length > 0) {
                    setSelectedSku(currentSku => currentSku || finishedProducts[0].sku);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("No se pudieron cargar los productos.");
            }
        };
        fetchProducts();
    }, []);

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


            if (data.summary) {
                const newFileSummary = { ...data.summary, uploadedAt: new Date().toISOString() };
                
                // Prevenir duplicados, actualizar si ya existe (pone el más nuevo al inicio)
                const updatedFiles = [
                    newFileSummary, 
                    ...uploadedFiles.filter(f => f.name !== newFileSummary.name)
                ];

                setUploadedFiles(updatedFiles);
            }
            // --- FIN NUEVO ---

            setTimeout(() => setMessage(''), 5000);
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
                ...sales.map(s => ({ ds: new Date(s.ds), historico: s.y })),
                ...formattedForecast.map(f => ({
                    ds: f.ds, pronostico: f.yhat > 0 ? f.yhat : 0,
                    min: f.yhat_lower > 0 ? f.yhat_lower : 0, max: f.yhat_upper > 0 ? f.yhat_upper : 0
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
            
            const newForecastResult = {
                forecastData: combinedData,
                demandSummary: data.summary,
                metrics: data.metrics,
                components: formattedComponents,
                selectedSku: selectedSku,
                productName: products.find(p => p.sku === selectedSku)?.name || selectedSku,
            };

            setResults(prevResults => {
                const existingIndex = prevResults.findIndex(r => r.selectedSku === selectedSku);
                if (existingIndex > -1) {
                    const updatedResults = [...prevResults];
                    updatedResults[existingIndex] = newForecastResult;
                    return updatedResults;
                } else {
                    return [...prevResults, newForecastResult];
                }
            });
            
            setActiveTabSku(selectedSku);
            setMessage(`Pronóstico para ${selectedSku} generado/actualizado exitosamente.`);
            setTimeout(() => setMessage(''), 5000);

        } catch (error) {
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCloseTab = (skuToClose) => {
        setResults(prev => prev.filter(r => r.selectedSku !== skuToClose));
        if (activeTabSku === skuToClose) {
            const remainingTabs = results.filter(r => r.selectedSku !== skuToClose);
            setActiveTabSku(remainingTabs.length > 0 ? remainingTabs[0].selectedSku : null);
        }
    };
    
    const activeForecast = useMemo(() => {
        if (!activeTabSku) return null;
        return results.find(r => r.selectedSku === activeTabSku);
    }, [activeTabSku, results]);

    // --- NUEVO: Calcular el promedio de ventas históricas ---
    const averageSales = useMemo(() => {
        if (!activeForecast) return 0;
        
        // Filtramos solo los puntos que tienen datos históricos
        const historicalData = activeForecast.forecastData.filter(
            d => d.historico !== undefined && d.historico !== null
        );
        
        if (historicalData.length === 0) return 0;

        // Calculamos la suma y luego el promedio
        const sum = historicalData.reduce((acc, d) => acc + d.historico, 0);
        return sum / historicalData.length;
    }, [activeForecast]);


    // --- NUEVO: Tooltip personalizado y mejorado ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const data = payload[0].payload; // Obtener el objeto de datos completo del punto

            return (
                <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg text-gray-800">
                    <p className="font-bold text-gray-900 mb-2">{formattedDate}</p>
                    {data.historico !== undefined && (
                        <p style={{ color: '#0052cc' }}>
                            <span className="font-semibold">Histórico:</span> {data.historico.toFixed(2)}
                        </p>
                    )}
                    {data.pronostico !== undefined && (
                        <p style={{ color: '#28a745' }}>
                            <span className="font-semibold">Pronóstico:</span> {data.pronostico.toFixed(2)}
                        </p>
                    )}
                    {data.max !== undefined && (
                         <p style={{ color: '#8884d8', fontSize: '0.9em' }}>
                            <span className="font-semibold">Intervalo:</span> {data.min.toFixed(2)} - {data.max.toFixed(2)}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };
    
    // --- NUEVO: Manejador de clic en el gráfico ---
    const handleChartClick = (data) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            console.log('Datos del punto clickeado:', data.activePayload[0].payload);
            // Futura idea: Aquí se podría abrir un modal con más detalles
            // setModalData(data.activePayload[0].payload);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <Card title="1. Cargar y Mapear Historial de Ventas">
                <div className="flex items-center gap-4 mb-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"/>
                </div>

                {csvPreview.headers.length > 0 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Vista Previa de Datos</h3>
                            <div className="overflow-x-auto max-h-48 border rounded-lg">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>{csvPreview.headers.map(h => <th key={h} className="p-2 text-left text-gray-700 font-medium">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="text-gray-800">
                                        {csvPreview.data.map((row, i) => 
                                            <tr key={i} className="border-t">
                                                {csvPreview.headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Mapeo de Columnas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-gray-700">Columna de Fecha (ds)</label>
                                    <select value={columnMap.ds} onChange={e => setColumnMap(p => ({...p, ds: e.target.value}))} className="w-full p-2 border rounded-lg mt-1 bg-white text-black">
                                        <option value="">Seleccionar...</option>
                                        {csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700">Columna de Valor (y)</label>
                                    <select value={columnMap.y} onChange={e => setColumnMap(p => ({...p, y: e.target.value}))} className="w-full p-2 border rounded-lg mt-1 bg-white text-black">
                                        <option value="">Seleccionar...</option>
                                        {csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-700">Columna de SKU</label>
                                    <select value={columnMap.sku} onChange={e => setColumnMap(p => ({...p, sku: e.target.value}))} className="w-full p-2 border rounded-lg mt-1 bg-white text-black">
                                        <option value="">Seleccionar...</option>
                                        {csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleFileUpload} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg disabled:bg-gray-400 hover:bg-indigo-700">
                            <Upload size={16}/> {loading ? 'Procesando...' : 'Confirmar y Cargar Datos'}
                        </button>
                    </div>
                )}
                {message && <p className="mt-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg"><CheckCircle size={16} className="inline mr-2"/>{message}</p>}
                {error && <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg whitespace-pre-wrap"><AlertTriangle size={16} className="inline mr-2"/>{error}</div>}
            </Card>

            {/* --- NUEVO: Resumen de Archivos Cargados --- */}
            {uploadedFiles.length > 0 && (
                <Card title="Historial de Cargas de Ventas">
                    <p className="text-sm text-gray-600 mb-4">
                        Se muestra un resumen de los archivos que has cargado. El sistema fusiona automáticamente los datos de todos los archivos en una única base de datos.
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-600" />
                                        <p className="font-semibold text-gray-800">{file.name}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        Cargado: {formatDate(file.uploadedAt, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <p className="text-gray-500">Filas</p>
                                        <p className="font-medium text-gray-800">{file.rows.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">SKUs Únicos</p>
                                        <p className="font-medium text-gray-800">{file.unique_skus.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Unidades</p>
                                        <p className="font-medium text-gray-800">{file.total_quantity.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Rango de Fechas</p>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(file.min_date)} - {formatDate(file.max_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            
            <Card title="2. Generar Pronóstico de Ventas">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div className="col-span-1 md:col-span-3 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                        <SearchableSelect
                            options={products}
                            value={selectedSku}
                            onChange={setSelectedSku}
                            placeholder="Buscar y seleccionar producto..."
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modelo de Pronóstico</label>
                        <select value={forecastModel} onChange={(e) => setForecastModel(e.target.value)} className="p-2 border rounded-lg w-full bg-white text-black">
                            <option value="prophet">Prophet (Recomendado)</option>
                            <option value="ses">Suavizado Exponencial Simple</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Días a Pronosticar</label>
                        <input type="number" value={forecastPeriods} onChange={(e) => setForecastPeriods(e.target.value)} className="p-2 border rounded-lg w-full bg-white text-black" placeholder="Ej. 90"/>
                     </div>
                </div>

                <div className="mt-4">
                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-indigo-600 mb-4 hover:underline">
                        <Sliders size={16}/> {showAdvanced ? 'Ocultar' : 'Mostrar'} Configuración Avanzada
                    </button>
                    {showAdvanced && forecastModel === 'prophet' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50 mb-4">
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Flexibilidad de Tendencia</label>
                                <input type="range" name="changepoint_prior_scale" min="0.01" max="1.0" step="0.01" value={advancedSettings.changepoint_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                <span className="text-xs text-gray-500">Valor: {advancedSettings.changepoint_prior_scale}</span>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Controla la rapidez con que el modelo se adapta a los cambios en la tendencia. Valores altos son más flexibles.
                                </span>
                            </div>
                             <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Fuerza de Estacionalidad</label>
                                <input type="range" name="seasonality_prior_scale" min="1.0" max="20.0" step="0.5" value={advancedSettings.seasonality_prior_scale} onChange={handleAdvancedSettingsChange} className="w-full"/>
                                 <span className="text-xs text-gray-500">Valor: {advancedSettings.seasonality_prior_scale}</span>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Ajusta la influencia de los patrones estacionales (semanales, anuales).
                                </span>
                            </div>
                            <div className="group relative">
                                <label className="block text-sm font-medium text-gray-700">Modo de Estacionalidad</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="text-sm text-gray-700"><input type="radio" name="seasonality_mode" value="additive" checked={advancedSettings.seasonality_mode === 'additive'} onChange={handleAdvancedSettingsChange}/> Aditivo</label>
                                    <label className="text-sm text-gray-700"><input type="radio" name="seasonality_mode" value="multiplicative" checked={advancedSettings.seasonality_mode === 'multiplicative'} onChange={handleAdvancedSettingsChange}/> Multiplicativo</label>
                                </div>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    'Multiplicativo' si las fluctuaciones estacionales crecen con la tendencia (p.ej. ventas navideñas).
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleGenerateForecast} disabled={loading || !selectedSku} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg disabled:bg-gray-400 hover:bg-green-700">
                    <LineChartIcon size={16}/> {loading ? 'Generando...' : 'Generar o Actualizar Pronóstico'}
                </button>
            </Card>

            {results.length > 0 && (
                 <div className="flex flex-wrap items-center gap-2 border-b-2 border-gray-200 pb-2">
                    {results.map(forecast => (
                        <button
                            key={forecast.selectedSku}
                            onClick={() => setActiveTabSku(forecast.selectedSku)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                                activeTabSku === forecast.selectedSku
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {forecast.productName}
                             <X 
                                size={16} 
                                className={`p-1 rounded-full ml-1 ${
                                    activeTabSku === forecast.selectedSku ? 'hover:bg-indigo-700' : 'hover:bg-gray-400'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseTab(forecast.selectedSku);
                                }} 
                            />
                        </button>
                    ))}
                </div>
            )}
            
            {/* --- SECCIÓN DEL GRÁFICO MODIFICADA --- */}
            {activeForecast && (
                <div key={activeForecast.selectedSku} className="space-y-8 animate-fadeIn">
                    <Card title={`Resultados del Pronóstico para ${activeForecast.productName}`}>
                        <div className="flex justify-between items-start mb-4">
                            {/* Título y Métricas */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Gráfico de Tendencia</h3>
                                {activeForecast.metrics && (
                                    <div className="text-xs text-left text-gray-600 mt-1">
                                        <span className="mr-2"><strong>MAE:</strong> {activeForecast.metrics.mae?.toFixed(2) ?? 'N/A'}</span>
                                        <span><strong>RMSE:</strong> {activeForecast.metrics.rmse?.toFixed(2) ?? 'N/A'}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Controles de Tipo de Gráfico */}
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-gray-600 mr-2">Ver como:</span>
                                <button 
                                    onClick={() => setChartType('line')} 
                                    className={`p-2 rounded-md ${chartType === 'line' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    title="Gráfico de Línea/Área"
                                >
                                    <AreaChartLucide size={16} />
                                </button>
                                <button 
                                    onClick={() => setChartType('bar')} 
                                    className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    title="Gráfico de Barras"
                                >
                                    <BarChart2 size={16} />
                                </button>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart 
                                data={activeForecast.forecastData}
                                onClick={handleChartClick} // <-- Interacción de Clic
                                margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                                <XAxis 
                                    dataKey="ds" 
                                    tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} 
                                    tick={{ fontSize: 12, fill: '#333' }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#333' }} />
                                
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }} />
                                
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                
                                {/* --- LÍNEA DE PROMEDIO AÑADIDA --- */}
                                {averageSales > 0 && (
                                    <ReferenceLine y={averageSales} stroke="red" strokeDasharray="5 5" strokeWidth={2}>
                                        <Label 
                                            value={`Promedio Hist. (${averageSales.toFixed(2)})`} 
                                            position="insideTopRight" 
                                            fill="red" 
                                            fontSize={10}
                                            offsetY={-10} // Desplazamiento para que no se pegue a la línea
                                        />
                                    </ReferenceLine>
                                )}
            
                                {/* --- Intervalo de Confianza (Siempre como Área) --- */}
                                <Area 
                                    type="monotone" 
                                    dataKey="max" 
                                    name="Intervalo de Confianza" 
                                    stroke="none" 
                                    fill="#8884d8" // Color morado sutil
                                    fillOpacity={0.2}
                                    data={activeForecast.forecastData.filter(d => d.max !== undefined)}
                                    activeDot={false}
                                    tooltipType="none"
                                />
                                {/* Área inferior del intervalo (para rellenar) */}
                                <Area 
                                    type="monotone" 
                                    dataKey="min" 
                                    name="_min" // Ocultar de la leyenda
                                    stroke="none" 
                                    fill="#8884d8" // Color morado sutil
                                    fillOpacity={0.2}
                                    data={activeForecast.forecastData.filter(d => d.min !== undefined)}
                                    activeDot={false}
                                    legendType="none" // Ocultar de la leyenda
                                    tooltipType="none" // Ocultar del tooltip
                                />

                                {/* --- Renderizado Condicional del Gráfico --- */}
                                {chartType === 'line' ? (
                                    <>
                                        {/* Histórico como Área */}
                                        <Area 
                                            type="monotone" 
                                            dataKey="historico" 
                                            name="Ventas Históricas" 
                                            stroke="#0052cc" // Azul más oscuro
                                            fill="#007bff" // Azul brillante
                                            fillOpacity={0.6} 
                                            activeDot={{ r: 6, stroke: '#0052cc', fill: 'white', strokeWidth: 2 }}
                                        />
                                        {/* Pronóstico como Línea */}
                                        <Line 
                                            type="monotone" 
                                            dataKey="pronostico" 
                                            name="Pronóstico" 
                                            stroke="#28a745" // Verde brillante
                                            strokeWidth={3}
                                            dot={false}
                                            activeDot={{ r: 6, stroke: '#28a745', fill: 'white', strokeWidth: 2 }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* Histórico como Barras */}
                                        <Bar 
                                            dataKey="historico" 
                                            name="Ventas Históricas" 
                                            fill="#007bff" // Azul brillante
                                            barSize={10}
                                            activeBar={{ fill: '#0052cc' }} // Azul oscuro al pasar el mouse
                                        />
                                        {/* Pronóstico como Barras */}
                                        <Bar 
                                            dataKey="pronostico" 
                                            name="Pronóstico" 
                                            fill="#28a745" // Verde brillante
                                            barSize={10}
                                            activeBar={{ fill: '#1e7e34' }} // Verde oscuro al pasar el mouse
                                        />
                                    </>
                                )}
                                
                                {/* --- Selector de Rango (Brush) --- */}
                                <Brush 
                                    dataKey="ds" 
                                    height={30} 
                                    stroke="#8884d8" 
                                    fill="#f1f1f1"
                                    tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', 'year': '2-digit' })}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                    
                    {activeForecast.components && (
                        <Card title="Componentes del Pronóstico">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {activeForecast.components.trend && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2 text-gray-800">Tendencia</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} /><YAxis domain={['dataMin', 'dataMax']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Tendencia" stroke="#8884d8" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.weekly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2 text-gray-800">Estacionalidad Semanal</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.weekly.slice(0, 7)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Semanal" stroke="#82ca9d" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.yearly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2 text-gray-800">Estacionalidad Anual</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.yearly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Anual" stroke="#ffc658" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                    
                    {activeForecast.demandSummary && (
                        <Card title={`Resumen de Ventas Semanal para ${activeForecast.productName}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="p-3">Periodo</th><th className="p-3">Fecha de Inicio</th><th className="p-3">Fecha de Fin</th><th className="p-3 text-right">Venta Pronosticada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeForecast.demandSummary.map((summaryItem) => (
                                            <tr key={summaryItem.period} className="border-b text-gray-800 hover:bg-gray-50">
                                                <td className="p-3 font-medium">{summaryItem.period}</td>
                                                <td className="p-3">{formatDate(summaryItem.start_date)}</td>
                                                <td className="p-3">{formatDate(summaryItem.end_date)}</td>
                                                <td className="p-3 text-right font-semibold">{summaryItem.total_demand.toLocaleString()} unidades</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default PredictionView;