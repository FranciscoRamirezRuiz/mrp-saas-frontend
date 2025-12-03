// src/components/views/LoginView.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import './LoginView.css'; // Importamos los nuevos estilos

// Icono de Google (SVG simple como componente)
const GoogleIcon = () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const LoginView = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hook de animación
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulación de login
        await new Promise(res => setTimeout(res, 1000)); 
        
        if (password === 'admin') {
            const fakeToken = `fake-token-for-${email}`;
            onLoginSuccess(fakeToken);
        } else {
            setError('Email o contraseña incorrectos. (Pista: usa "admin" como contraseña)');
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div ref={ref} className="login-container">
                
                {/* --- Columna Izquierda: Panel de Color --- */}
                <div className={`login-panel ${inView ? 'is-visible' : ''}`}>
                    <img src="/Icono_PlanFly2.png" alt="PlanFly Logo" />
                    <h2>Bienvenido de vuelta</h2>
                    <p>Optimiza tu producción y toma el control total de tu inventario.</p>
                </div>

                {/* --- Columna Derecha: Formulario --- */}
                <div className={`login-form-side ${inView ? 'is-visible' : ''}`}>
                    <h3>Inicia sesión en tu cuenta</h3>
                    
                    {/* Botón de Google */}
                    <button type="button" className="btn-google">
                        <GoogleIcon />
                        Iniciar sesión con Google
                    </button>

                    <div className="divider">O inicia sesión con</div>

                    {/* Formulario de Email/Password */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        {/* Link de Contraseña Olvidada */}
                        <div className="form-links">
                            <Link to="#">¿Perdiste la contraseña?</Link>
                        </div>

                        {/* Botón de Submit */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-submit"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                        
                        {error && (
                            <p className="error-message">{error}</p>
                        )}
                    </form>

                    {/* Link de Registro */}
                    <p className="register-link">
                        ¿No tienes una cuenta? <Link to="/registro">Registrarse</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LoginView;