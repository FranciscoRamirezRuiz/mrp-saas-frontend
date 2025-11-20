// src/components/views/AboutUsView.js
import React from 'react';
import { useInView } from 'react-intersection-observer';
import './AboutUsView.css'; 

// Componente interno para el miembro del equipo
const TeamMember = ({ name, role, imgSrc, quote, delay }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const animationStyle = inView ? { transitionDelay: `${delay}ms` } : {};

    return (
        <div ref={ref} className={`team-member ${inView ? 'is-visible' : ''}`} style={animationStyle}>
            <div className="team-photo-frame">
                <img src={imgSrc} alt={`Foto de ${name}`} />
            </div>
            <h4>{name}</h4>
            <p>{role}</p>
            <p className="team-member-quote">
                "{quote}"
            </p>
        </div>
    );
};

// Componente principal de la página
const AboutUsView = () => {

    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true });
    const { ref: textRef, inView: textInView } = useInView({ triggerOnce: true, delay: 100 });
    const { ref: visualRef, inView: visualInView } = useInView({ triggerOnce: true, delay: 200 });

    return (
        <div className="about-us-view">
            
            {/* --- Sección 1: Cabecera (Limpia) --- */}
            <section className="about-header">
                <div ref={headerRef} className={`fade-in-up ${headerInView ? 'is-visible' : ''}`}>
                    <h1 className="about-title">Sobre Nosotros</h1>
                    <p className="about-subtitle">
                        Conoce el equipo y la motivación detrás de PlanFly,
                        la herramienta diseñada para optimizar tu producción.
                    </p>
                </div>
            </section>

            {/* --- Sección 2: Nuestro Origen (Imagen Grande y Diseño Moderno) --- */}
            <section className="about-content">
                {/* Columna 1: Texto */}
                <div ref={textRef} className={`about-content-text fade-in-up ${textInView ? 'is-visible' : ''}`}>
                    <h2>Nuestro Origen</h2>
                    <p>
                        Somos un equipo de estudiantes de Ingeniería Civil en Computación, mención Informática,
                        de la Universidad Tecnológica Metropolitana (UTEM).
                    </p>
                    <p>
                        PlanFly nació como nuestro proyecto de tesis, con el objetivo de aplicar nuestros
                        conocimientos en desarrollo de software, inteligencia de negocios y modelos predictivos
                        para resolver un problema real: la compleja gestión de la cadena de suministro en
                        empresas de manufactura.
                    </p>
                </div>
                {/* Columna 2: Imagen Destacada */}
                <div ref={visualRef} className={`about-content-visual fade-in-up ${visualInView ? 'is-visible' : ''}`}>
                    <img 
                        src="/utem.jpg" 
                        alt="Campus UTEM" 
                        className="about-image"
                    />
                </div>
            </section>

            {/* --- Sección 3: El Equipo (Diseño Original Limpio) --- */}
            <section className="team-section">
                <h2 className="team-title">El Equipo</h2>
                <div className="team-grid">
                    <TeamMember 
                        name="Francisco Ramirez" 
                        role="Desarrollador de Tesis"
                        imgSrc="/fr.jpeg"
                        quote="Quisimos ir más allá de la teoría y construir una herramienta real que solucione problemas complejos de producción."
                        delay={100}
                    />
                    <TeamMember 
                        name="Cesar Hernandez" 
                        role="Desarrollador de Tesis"
                        imgSrc="/ch.jpeg"
                        quote="El verdadero poder está en los datos. PlanFly transforma la incertidumbre de la demanda en decisiones inteligentes."
                        delay={200}
                    />
                    <TeamMember 
                        name="Nicolas Porras" 
                        role="Desarrollador de Tesis"
                        imgSrc="/np.jpeg"
                        quote="Nuestro objetivo es que cualquier empresa, sin importar su tamaño, pueda acceder a una planificación de nivel mundial."
                        delay={300}
                    />
                </div>
            </section>

        </div>
    );
};

export default AboutUsView;