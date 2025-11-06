// src/components/views/PublicHomeView.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer'; // Importamos el hook
import { BrainCircuit, Calendar, Package, BarChart3, TrendingUp, Zap } from 'lucide-react';
import './PublicHomeView.css'; // Importamos los nuevos estilos que crearemos

// --- Componente reutilizable para las "features cards" ---
// Este componente se animará a sí mismo cuando sea visible
const FeatureCard = ({ icon, title, description, color }) => {
    const { ref, inView } = useInView({
        triggerOnce: true, // La animación solo ocurre una vez
        threshold: 0.1,    // Se activa cuando el 10% es visible
        delay: 150,        // Un pequeño retraso
    });

    // Asigna la clase 'is-visible' cuando entra en la pantalla
    const animationClass = inView ? 'is-visible' : '';

    return (
        // 1. Asignamos el 'ref'
        // 2. Añadimos las clases dinámicas
        <div ref={ref} className={`feature-card feature-card--${color} ${animationClass}`}>
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

// --- Componente principal de la página de inicio ---
const PublicHomeView = () => {
    // Hook de animación para la sección "Hero" (la principal)
    const { ref: heroRef, inView: heroInView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const heroAnimationClass = heroInView ? 'is-visible' : '';

    return (
        <div className="public-home">
            {/* --- Sección 1: Hero --- */}
            <section className="home-hero">
                <div ref={heroRef} className={`hero-content ${heroAnimationClass}`}>
                    <h1 className="hero-title">
                        Tu Planificación de Producción, <br />Simple e Inteligente.
                    </h1>
                    <p className="hero-subtitle">
                        Bienvenido a PlanFly. Deja que nuestros modelos de predicción y MRP te ayuden a optimizar tu inventario y reducir costos.
                    </p>
                    <div className="hero-actions">
                        <Link to="/demo" className="btn btn-primary">
                            Prueba la Demo
                        </Link>
                        <Link to="/planes" className="btn btn-secondary">
                            Ver Planes
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Sección 2: Características (Cuadros de colores) --- */}
            <section className="home-features">
                <div className="features-grid">
                    <FeatureCard
                        color="blue"
                        icon={<BrainCircuit size={32} />}
                        title="Predicción Inteligente"
                        description="Utiliza Prophet y Suavizado Exponencial para pronosticar tu demanda futura con precisión."
                    />
                    <FeatureCard
                        color="green"
                        icon={<Calendar size={32} />}
                        title="Plan Maestro (PMP)"
                        description="Genera tu Plan Maestro de Producción basado en pronósticos, stock de seguridad y recepciones."
                    />
                    <FeatureCard
                        color="purple"
                        icon={<Package size={32} />}
                        title="Cálculo de MRP"
                        description="Explosiona tus Listas de Materiales (BOM) para calcular exactamente qué comprar y cuándo."
                    />
                    <FeatureCard
                        color="orange"
                        icon={<TrendingUp size={32} />}
                        title="Gestión de Inventario"
                        description="Control total sobre tu stock, puntos de reorden, lotes y ubicaciones desde un solo lugar."
                    />
                    <FeatureCard
                        color="cyan"
                        icon={<BarChart3 size={32} />}
                        title="Dashboards Visuales"
                        description="Analiza tu rotación de inventario, clasificación ABC y ventas con gráficos interactivos."
                    />
                    <FeatureCard
                        color="red"
                        icon={<Zap size={32} />}
                        title="Rápida Implementación"
                        description="Importa tus datos desde CSV y comienza a planificar en minutos, no en meses."
                    />
                </div>
            </section>

            {/* --- Sección 3: Call to Action (CTA) --- */}
            <section className="home-cta">
                 <div className="cta-content">
                    <h2>¿Listo para tomar el control de tu cadena de suministro?</h2>
                    <p>Empieza hoy mismo y descubre por qué las empresas eligen PlanFly para optimizar su producción.</p>
                    <Link to="/login" className="btn btn-primary btn-cta">
                        Empezar Ahora
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default PublicHomeView;