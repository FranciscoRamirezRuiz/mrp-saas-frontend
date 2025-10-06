// src/components/views/PredictionView.js
import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart } from 'recharts';
import { Upload, CheckCircle, AlertTriangle, LineChart as LineChartIcon, Sliders, X } from 'lucide-react';
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


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = new Date(label);
            const formattedDate = date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-semibold">{formattedDate}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value.toFixed(2)}`}</p>
                    ))}
                </div>
            );
        }
        return null;
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
                                    <thead className="bg-gray-100 sticky top-0"><tr>{csvPreview.headers.map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                                    <tbody>{csvPreview.data.map((row, i) => <tr key={i} className="border-t">{csvPreview.headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Mapeo de Columnas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm">Columna de Fecha (ds)</label><select value={columnMap.ds} onChange={e => setColumnMap(p => ({...p, ds: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de Valor (y)</label><select value={columnMap.y} onChange={e => setColumnMap(p => ({...p, y: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
                                <div><label className="text-sm">Columna de SKU</label><select value={columnMap.sku} onChange={e => setColumnMap(p => ({...p, sku: e.target.value}))} className="w-full p-2 border rounded-lg mt-1"><option value="">Seleccionar...</option>{csvPreview.headers.map(h => <option key={h} value={h}>{h}</option>)}</select></div>
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
                        <select value={forecastModel} onChange={(e) => setForecastModel(e.target.value)} className="p-2 border rounded-lg w-full">
                            <option value="prophet">Prophet (Recomendado)</option>
                            <option value="ses">Suavizado Exponencial Simple</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Días a Pronosticar</label>
                        <input type="number" value={forecastPeriods} onChange={(e) => setForecastPeriods(e.target.value)} className="p-2 border rounded-lg w-full" placeholder="Ej. 90"/>
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
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="additive" checked={advancedSettings.seasonality_mode === 'additive'} onChange={handleAdvancedSettingsChange}/> Aditivo</label>
                                    <label className="text-sm"><input type="radio" name="seasonality_mode" value="multiplicative" checked={advancedSettings.seasonality_mode === 'multiplicative'} onChange={handleAdvancedSettingsChange}/> Multiplicativo</label>
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
            
            {activeForecast && (
                <div key={activeForecast.selectedSku} className="space-y-8 animate-fadeIn">
                    <Card title={`Resultados del Pronóstico para ${activeForecast.productName}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Gráfico de Tendencia</h3>
                            {activeForecast.metrics && (
                                <div className="text-xs text-right text-gray-600 bg-gray-50 p-2 rounded-lg border">
                                    <p><strong>Métricas del Modelo:</strong></p>
                                    <p>MAE: <strong>{activeForecast.metrics.mae?.toFixed(2) ?? 'N/A'}</strong></p>
                                    <p>RMSE: <strong>{activeForecast.metrics.rmse?.toFixed(2) ?? 'N/A'}</strong></p>
                                </div>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={activeForecast.forecastData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="historico" name="Ventas Históricas" stroke="#1d4ed8" fill="#3b82f6" fillOpacity={0.6} />
                                <Line type="monotone" dataKey="pronostico" name="Pronóstico" stroke="#16a34a" dot={false}/>
                                <Area type="monotone" dataKey="max" name="Intervalo de Confianza" stroke="none" fill="#e5e7eb" fillOpacity={0.5} data={activeForecast.forecastData.filter(d => d.max !== undefined)} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                    
                    {activeForecast.components && (
                        <Card title="Componentes del Pronóstico">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {activeForecast.components.trend && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Tendencia</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })} /><YAxis domain={['dataMin', 'dataMax']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Tendencia" stroke="#8884d8" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.weekly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Estacionalidad Semanal</h4>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={activeForecast.components.weekly.slice(0, 7)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="ds" tickFormatter={(time) => new Date(time).toLocaleDateString('es-ES', { weekday: 'short' })} /><YAxis domain={['auto', 'auto']} /><Tooltip content={<CustomTooltip />} /><Line type="monotone" dataKey="value" name="Semanal" stroke="#82ca9d" dot={false} /></LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {activeForecast.components.yearly && (
                                    <div>
                                        <h4 className="font-semibold text-center mb-2">Estacionalidad Anual</h4>
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
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default PredictionView;