// src/components/views/DemoView.js
import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { CheckCircle, Zap, BrainCircuit, Calendar } from 'lucide-react';
import './DemoView.css'; // Importamos los nuevos estilos

// --- Componente del Formulario ---
const DemoForm = () => {
    // Estados para el formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [message, setMessage] = useState('');
    // Estado para mostrar el mensaje de éxito
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí es donde enviarías los datos a tu backend o a un servicio
        // Por ahora, solo simulamos el éxito
        console.log("Datos del formulario:", { name, email, company, message });
        setIsSubmitted(true);
    };

    // Si el formulario ya se envió, muestra el mensaje de éxito
    if (isSubmitted) {
        return (
            <div className="success-message">
                <h3>¡Gracias, {name}!</h3>
                <p>Hemos recibido tu solicitud. Uno de nuestros especialistas se pondrá en contacto contigo pronto para agendar la demo.</p>
            </div>
        );
    }

    // Si no, muestra el formulario
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Nombre Completo</label>
                <input 
                    type="text" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Correo Electrónico (Empresarial)</label>
                <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="company">Nombre de la Empresa</label>
                <input 
                    type="text" 
                    id="company" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required 
                />
            </div>
            <div className="form-group">
                <label htmlFor="message">¿En qué podemos ayudarte? (Opcional)</label>
                <textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ej: 'Me interesa probar el módulo de predicción...'"
                />
            </div>
            <button type="submit" className="btn-submit">
                Solicitar mi Demo
            </button>
        </form>
    );
};


// --- Componente Principal de la Página de Demo ---
const DemoView = () => {
    // Animaciones
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true });
    const { ref: infoRef, inView: infoInView } = useInView({ triggerOnce: true, delay: 150 });
    const { ref: formRef, inView: formInView } = useInView({ triggerOnce: true, delay: 300 });

    return (
        <div className="demo-view">
            {/* Cabecera */}
            <header ref={headerRef} className={`demo-header ${headerInView ? 'is-visible' : ''}`}>
                <h1 className="demo-title">Solicita una Demo Personalizada</h1>
                <p className="demo-subtitle">
                    Descubre de primera mano cómo PlanFly puede optimizar tu producción.
                    Rellena el formulario y agendaremos una demostración gratuita.
                </p>
            </header>

            {/* Contenido (2 Columnas) */}
            <main className="demo-content">
                
                {/* Columna Izquierda: Información */}
                <div ref={infoRef} className={`demo-info ${infoInView ? 'is-visible' : ''}`}>
                    <h2>¿Qué verás en la demo?</h2>
                    <p>
                        Un especialista te guiará a través de las funciones clave de PlanFly,
                        aplicadas a un caso de uso similar al de tu industria.
                    </p>
                    <ul className="demo-features-list">
                        <li>
                            <BrainCircuit size={20} />
                            <span>El poder de los modelos de predicción en acción.</span>
                        </li>
                        <li>
                            <Calendar size={20} />
                            <span>Cómo crear un Plan Maestro de Producción (PMP) en minutos.</span>
                        </li>
                        <li>
                            <CheckCircle size={20} />
                            <span>El cálculo de MRP y la explosión de materiales (BOM).</span>
                        </li>
                        <li>
                            <Zap size={20} />
                            <span>Importación de datos rápida y sin fricción.</span>
                        </li>
                    </ul>
                </div>

                {/* Columna Derecha: Formulario */}
                <div ref={formRef} className={`demo-form-container ${formInView ? 'is-visible' : ''}`}>
                    <DemoForm />
                </div>
            </main>
        </div>
    );
};

export default DemoView;