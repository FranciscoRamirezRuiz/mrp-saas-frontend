// src/components/Header.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Menu, 
    X, 
    LayoutDashboard, 
    Package, 
    BrainCircuit, 
    ClipboardList, 
    Calendar, 
    ShoppingCart, 
    Settings,
    LogOut,
    User
} from 'lucide-react';

const Header = ({ onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Enlaces de navegación actualizados con la NUEVA TERMINOLOGÍA
    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/items', label: 'Ítems', icon: Package },
        // CAMBIO: De "Predicción" a "Pronóstico"
        { path: '/prediction', label: 'Pronóstico', icon: BrainCircuit },
        { path: '/bom', label: 'BOM', icon: ClipboardList },
        { path: '/pmp', label: 'PMP', icon: Calendar },
        // MRP se mantiene corto por espacio, pero sabemos que refiere a "Req. de Materiales"
        { path: '/mrp', label: 'MRP', icon: ShoppingCart },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        // CAMBIO: Header Sólido (bg-white), borde gris, sombras sutiles. Sin transparencias.
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 shadow-sm font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    
                    {/* --- LOGO --- */}
                    <div className="flex items-center gap-3">
                        <Link to="/home" className="flex items-center gap-2 group decoration-transparent">
                            {/* Icono del Logo */}
                            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
                                <span className="text-white font-bold text-lg leading-none">P</span>
                            </div>
                            {/* Texto del Logo */}
                            <span className="font-extrabold text-xl text-slate-900 tracking-tight no-underline">
                                Plan<span className="text-indigo-600">Fly</span>
                            </span>
                        </Link>
                    </div>

                    {/* --- NAVEGACIÓN ESCRITORIO --- */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 no-underline
                                    ${isActive(link.path) 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                <link.icon size={18} strokeWidth={2.5} />
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* --- PERFIL / LOGOUT --- */}
                    <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200 ml-2">
                        <Link 
                            to="/settings" 
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
                            title="Configuración"
                        >
                            <Settings size={20} />
                        </Link>
                        
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-indigo-600">
                            <User size={18} strokeWidth={2.5} />
                        </div>

                        <button 
                            onClick={onLogout}
                            className="ml-2 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    {/* --- BOTÓN MENÚ MÓVIL --- */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 hover:text-indigo-600 p-2 rounded-md"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MENÚ MÓVIL (Dropdown) --- */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-200 absolute w-full left-0 shadow-lg">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`
                                    block px-3 py-3 rounded-md text-base font-bold no-underline
                                    ${isActive(link.path)
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon size={20} />
                                    {link.label}
                                </div>
                            </Link>
                        ))}
                        <div className="border-t border-slate-100 my-2 pt-2">
                             <Link
                                to="/settings"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-3 py-3 text-slate-600 font-bold hover:text-indigo-600 no-underline"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings size={20} />
                                    Configuración
                                </div>
                            </Link>
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-3 text-red-600 font-bold hover:bg-red-50 rounded-md flex items-center gap-3"
                            >
                                <LogOut size={20} />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;