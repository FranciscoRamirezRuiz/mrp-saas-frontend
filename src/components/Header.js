// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Home, Package, ClipboardList, BrainCircuit, Calendar, ShoppingCart, Settings, Menu, X, ShoppingBag, Box } from 'lucide-react';

const Header = ({ activeView, setActiveView, onLogoClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const navItems = [
        { name: 'Dashboard', icon: Home, view: 'dashboard' }, 
        { name: 'Gestión de Ítems', icon: Package, view: 'items' }, 
        { name: 'Gestión de BOM', icon: ClipboardList, view: 'bom' },
        { name: 'Predicción', icon: BrainCircuit, view: 'prediction' }, 
        { name: 'Plan Maestro', icon: Calendar, view: 'pmp' }, 
        { 
            name: 'Plan de Requerimientos', icon: ShoppingCart, subItems: [
                { name: 'Requerimiento de Materiales', icon: ShoppingBag, view: 'mrp_materials' },
                { name: 'Req. Productos Intermedios', icon: Box, view: 'mrp_products' },
            ]
        },
        { name: 'Configuración', icon: Settings, view: 'settings' },
    ];
    
    const getTitle = (view) => ({
        'dashboard': 'Dashboard General', 'items': 'Gestión de Ítems e Inventario', 'bom': 'Gestión de Lista de Materiales (BOM)', 
        'prediction': 'Predicción de Demanda', 'pmp': 'Plan Maestro de Producción', 
        'mrp_materials': 'Plan de Requerimiento de Materiales', 'mrp_products': 'Plan de Requerimiento de Productos',
        'settings': 'Configuración'
    }[view] || 'Dashboard');

    const handleNavClick = (view) => {
        setActiveView(view);
        const mainItem = navItems.find(item => item.view === view || (item.subItems && item.subItems.some(sub => sub.view === view)));
        if (!mainItem.subItems) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <header className="relative flex items-center justify-between h-20 bg-slate-900 shadow-lg z-20 sticky top-0 px-4 md:px-8">
            <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={onLogoClick}
            >
                <img 
                    src="Icono_PlanFly2.png" 
                    alt="Logo PlanFly" 
                    className="h-40 w-auto object-contain" 
                />
            </div>
            
            <h2 className="text-2xl font-bold text-white hidden md:block tracking-wider">{getTitle(activeView)}</h2>
            
            <div className="flex items-center space-x-2">
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors duration-200 flex items-center">
                        <Menu className="w-6 h-6 mr-2" />
                        <span className="hidden sm:block text-sm font-semibold">Menú</span>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-2xl py-2 z-30">
                            {navItems.map((item) => (
                                !item.subItems ? (
                                    <button
                                        key={item.view} onClick={() => handleNavClick(item.view)}
                                        className={`w-full text-left flex items-center px-4 py-3 text-sm transition-colors duration-200 ${ activeView === item.view ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100' }`}
                                    >
                                        <item.icon className="h-4 w-4 mr-3" /> {item.name}
                                    </button>
                                ) : (
                                    <div key={item.name} className="border-t">
                                        <p className="flex items-center px-4 py-3 text-sm text-gray-500 font-semibold">
                                            <item.icon className="h-4 w-4 mr-3" /> {item.name}
                                        </p>
                                        {item.subItems.map(subItem => (
                                            <button
                                                key={subItem.view} onClick={() => handleNavClick(subItem.view)}
                                                className={`w-full text-left flex items-center pl-11 pr-4 py-3 text-sm transition-colors duration-200 ${ activeView === subItem.view ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-100' }`}
                                            >
                                                <subItem.icon className="h-4 w-4 mr-3" /> {subItem.name}
                                            </button>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;