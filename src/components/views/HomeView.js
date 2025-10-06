// src/components/views/HomeView.js
import React from 'react';
import { BrainCircuit, Calendar, Package } from 'lucide-react';

const HomeView = ({ onStart }) => {
    return (
        <div
            className="relative flex flex-col items-center justify-center min-h-screen text-white p-8 overflow-hidden"
            style={{
                backgroundImage: 'url("background_network.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-slate-900/80 z-0"></div>

            <main className="z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
                <section className="text-center my-16 md:my-20">
                    <div className="inline-block filter
                                drop-shadow-[0_0_15px_rgba(79,70,229,0.6)]
                                mb-6
                                transition-all duration-300 ease-in-out
                                hover:scale-105
                                hover:drop-shadow-[0_0_25px_rgba(129,140,248,0.7)]">
                        <img
                            src="Icono_PlanFly2.png"
                            alt="Logo PlanFly"
                            className="w-auto h-72"
                        />
                    </div>

                    <h1
                        className="text-6xl font-bold text-slate-100 tracking-widest uppercase"
                        style={{ fontFamily: '"Bebas Neue", sans-serif' }}
                    >
                        Planifica Hoy Lo Que Tu Empresa Necesitará Mañana
                    </h1>

                    <button
                        onClick={() => onStart()}
                        className="mt-10 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full
                                shadow-lg transition-all duration-300
                                transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                    >
                        Empezar Ahora
                    </button>
                </section>

                <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 my-16 md:my-20">
                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <BrainCircuit className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Predicción Inteligente</h3>
                        <p className="text-slate-300 text-sm">Utilizamos modelos de ML para pronosticar la demanda con precisión, reduciendo el riesgo de stockout o exceso de inventario.</p>
                    </div>

                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <Calendar className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">PMP y MRP Optimizado</h3>
                        <p className="text-slate-300 text-sm">Gestiona tu Plan Maestro de Producción y calcula los requerimientos de materiales en tiempo real.</p>
                    </div>

                    <div className="p-8 bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700
                                   transition-all duration-300 hover:border-indigo-500 hover:scale-[1.02]">
                        <Package className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Visibilidad Total</h3>
                        <p className="text-slate-300 text-sm">Control centralizado del inventario, BOMs y rutas de materiales para una cadena de suministro ágil.</p>
                    </div>
                </section>
            </main>

            <footer className="z-10 w-full max-w-5xl mx-auto py-8 mt-16 border-t border-slate-700
                               flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} PlanFLY. Todos los derechos reservados.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="/#" className="hover:text-white transition-colors">Política de Privacidad</a>
                    <a href="/#" className="hover:text-white transition-colors">Términos de Servicio</a>
                </div>
            </footer>
        </div>
    );
};

export default HomeView;