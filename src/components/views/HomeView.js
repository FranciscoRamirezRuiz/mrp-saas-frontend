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
    Settings,
    BookOpen, 
    LogOut,
    ArrowRight 
} from 'lucide-react';
import './HomeView.css';

const HomeView = ({ onLogout }) => {
    const navigate = useNavigate();

    // 9 Módulos exactos para la distribución 3x3
    const modules = [
        { 
            title: 'Dashboard General', 
            desc: 'Visualiza tus KPIs, gráficos de ventas y estado del inventario.', 
            icon: LayoutDashboard, 
            path: '/dashboard', 
            colorClass: 'text-blue-600', 
            bgIcon: 'bg-blue-50',
            borderClass: 'border-blue-600'
        },
        { 
            title: 'Gestión de Ítems', 
            desc: 'Administra tu inventario, stock crítico y catálogo de productos.', 
            icon: Package, 
            path: '/items', 
            colorClass: 'text-emerald-600', 
            bgIcon: 'bg-emerald-50',
            borderClass: 'border-emerald-600'
        },
        { 
            title: 'Predicción IA', 
            desc: 'Proyecta la demanda futura utilizando inteligencia artificial.', 
            icon: BrainCircuit, 
            path: '/prediction', 
            colorClass: 'text-purple-600', 
            bgIcon: 'bg-purple-50',
            borderClass: 'border-purple-600'
        },
        { 
            title: 'Listas de Materiales', 
            desc: 'Define las recetas y estructuras (BOM) de tus productos.', 
            icon: ClipboardList, 
            path: '/bom', 
            colorClass: 'text-orange-600', 
            bgIcon: 'bg-orange-50',
            borderClass: 'border-orange-600'
        },
        { 
            title: 'Plan Maestro (PMP)', 
            desc: 'Programa qué, cuándo y cuánto producir en el tiempo.', 
            icon: Calendar, 
            path: '/pmp', 
            colorClass: 'text-cyan-600', 
            bgIcon: 'bg-cyan-50',
            borderClass: 'border-cyan-600'
        },
        { 
            title: 'MRP', 
            desc: 'Calcula requerimientos netos y genera órdenes de compra.', 
            icon: ShoppingCart, 
            path: '/mrp', 
            colorClass: 'text-pink-600', 
            bgIcon: 'bg-pink-50',
            borderClass: 'border-pink-600'
        },
        { 
            title: 'Configuración', 
            desc: 'Ajusta parámetros globales del sistema.', 
            icon: Settings, 
            path: '/settings', 
            colorClass: 'text-slate-600', 
            bgIcon: 'bg-slate-100',
            borderClass: 'border-slate-500'
        },
        { 
            title: 'Manual de Usuario', 
            desc: 'Accede a la documentación y guías de uso del sistema.', 
            icon: BookOpen, 
            path: '/manual',
            colorClass: 'text-teal-600', 
            bgIcon: 'bg-teal-50',
            borderClass: 'border-teal-600'
        },
        { 
            title: 'Cerrar Sesión', 
            desc: 'Finalizar la sesión actual de forma segura.', 
            icon: LogOut, 
            action: onLogout, 
            colorClass: 'text-red-600', 
            bgIcon: 'bg-red-50',
            borderClass: 'border-red-600'
        },
    ];

    const handleCardClick = (mod) => {
        if (mod.action) {
            mod.action(); 
        } else if (mod.path) {
            navigate(mod.path); 
        }
    };

    return (
        <div className="home-view-container">
            {/* Cabecera */}
            <div className="welcome-header fade-in-up">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200 inline-block mb-8">
                    <h1 className="welcome-title text-slate-900">
                        Hola, <span className="text-indigo-600">Bienvenido a PlanFly</span>
                    </h1>
                    <p className="welcome-subtitle text-slate-600">
                        Tu centro de control de producción inteligente.
                    </p>
                </div>
            </div>

            {/* Grilla 3x3 */}
            <div className="modules-grid fade-in-up delay-100">
                {modules.map((mod, idx) => (
                    <div 
                        key={idx} 
                        className={`
                            module-card-solid 
                            bg-white 
                            border-l-[6px] ${mod.borderClass}
                        `}
                        onClick={() => handleCardClick(mod)}
                    >
                        <div className="flex justify-between items-start mb-4 w-full">
                            <div className={`icon-wrapper-solid ${mod.bgIcon} ${mod.colorClass}`}>
                                <mod.icon size={32} strokeWidth={2} />
                            </div>
                            <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                                <ArrowRight size={24} />
                            </div>
                        </div>

                        <div className="module-info text-left">
                            <h3 className="text-slate-900 font-bold mb-2 group-hover:text-blue-700 transition-colors">
                                {mod.title}
                            </h3>
                            <p className="text-slate-600 text-sm font-medium">
                                {mod.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeView;