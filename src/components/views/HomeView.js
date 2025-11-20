// src/components/views/HomeView.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    BrainCircuit, 
    ClipboardList, 
    Calendar, 
    ShoppingCart, 
    Settings 
} from 'lucide-react';
import './HomeView.css';

const HomeView = () => {
    const navigate = useNavigate();

    // Definición de los módulos con sus colores y rutas
    const modules = [
        { 
            title: 'Dashboard General', 
            desc: 'Visualiza tus KPIs, gráficos de ventas y estado del inventario.', 
            icon: LayoutDashboard, 
            path: '/dashboard', 
            color: 'text-blue-400', 
            bg: 'bg-blue-500/20',
            border: 'border-blue-500/30'
        },
        { 
            title: 'Gestión de Ítems', 
            desc: 'Administra tu inventario, stock crítico y catálogo de productos.', 
            icon: Package, 
            path: '/items', 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30'
        },
        { 
            title: 'Predicción IA', 
            desc: 'Proyecta la demanda futura utilizando inteligencia artificial.', 
            icon: BrainCircuit, 
            path: '/prediction', 
            color: 'text-purple-400', 
            bg: 'bg-purple-500/20',
            border: 'border-purple-500/30'
        },
        { 
            title: 'Listas de Materiales', 
            desc: 'Define las recetas y estructuras (BOM) de tus productos.', 
            icon: ClipboardList, 
            path: '/bom', 
            color: 'text-orange-400', 
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/30'
        },
        { 
            title: 'Plan Maestro (PMP)', 
            desc: 'Programa qué, cuándo y cuánto producir en el tiempo.', 
            icon: Calendar, 
            path: '/pmp', 
            color: 'text-cyan-400', 
            bg: 'bg-cyan-500/20',
            border: 'border-cyan-500/30'
        },
        { 
            title: 'MRP', 
            desc: 'Calcula requerimientos netos y genera órdenes de compra.', 
            icon: ShoppingCart, 
            path: '/mrp', 
            color: 'text-pink-400', 
            bg: 'bg-pink-500/20',
            border: 'border-pink-500/30'
        },
        { 
            title: 'Configuración', 
            desc: 'Ajusta parámetros globales del sistema.', 
            icon: Settings, 
            path: '/settings', 
            color: 'text-gray-400', 
            bg: 'bg-gray-500/20',
            border: 'border-gray-500/30'
        },
    ];

    return (
        <div className="home-view-container">
            {/* Saludo y Título */}
            <div className="welcome-header fade-in-up">
                <h1 className="welcome-title">
                    Hola, <span className="text-gradient">Bienvenido a PlanFly</span>
                </h1>
                <p className="welcome-subtitle">
                    Tu centro de control de producción inteligente. <br/>
                    ¿Por dónde te gustaría comenzar hoy?
                </p>
            </div>

            {/* Grilla de Módulos */}
            <div className="modules-grid fade-in-up delay-100">
                {modules.map((mod, idx) => (
                    <div 
                        key={idx} 
                        className={`module-card glass-panel ${mod.border}`}
                        onClick={() => navigate(mod.path)}
                    >
                        <div className={`icon-wrapper ${mod.bg}`}>
                            <mod.icon size={32} className={mod.color} />
                        </div>
                        <div className="module-info">
                            <h3>{mod.title}</h3>
                            <p>{mod.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeView;