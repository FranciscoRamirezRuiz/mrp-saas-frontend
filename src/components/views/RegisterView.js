// src/components/views/RegisterView.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { Check, X, AlertCircle, XCircle } from 'lucide-react'; 
import './RegisterView.css';

const GoogleIcon = () => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="google-icon-svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const RegisterView = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        businessType: '',
        otherBusinessType: '', // <--- NUEVO CAMPO EN EL ESTADO
        password: '',
        confirmPassword: ''
    });
    
    const [passwordStrength, setPasswordStrength] = useState(0); 
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    const calculateStrength = (pass) => {
        if (!pass) return 0;
        let score = 1; 
        if (pass.length >= 8) score += 1;
        if (pass.length >= 12) score += 1;

        let varietyCount = 0;
        if (/[a-z]/.test(pass)) varietyCount++;
        if (/[A-Z]/.test(pass)) varietyCount++;
        if (/[0-9]/.test(pass)) varietyCount++;
        if (/[^A-Za-z0-9]/.test(pass)) varietyCount++;

        if (varietyCount >= 2) score += 1; 
        if (varietyCount >= 3 && pass.length >= 10) score += 1; 

        return Math.min(score, 4);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordStrength(calculateStrength(value));
        }
    };

    const handleClearField = (fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: '' }));
        if (fieldName === 'password') setPasswordStrength(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Por favor, asegúrate de que las contraseñas coincidan.');
            return;
        }
        
        if (passwordStrength < 2) {
            setError('La contraseña es demasiado débil. Intenta hacerla más larga o compleja.');
            return;
        }

        // Preparar datos finales (si eligió "otro", usamos el campo específico)
        const finalData = {
            ...formData,
            businessType: formData.businessType === 'otro' ? formData.otherBusinessType : formData.businessType
        };

        setLoading(true);
        
        setTimeout(() => {
            console.log("Datos enviados:", finalData);
            setLoading(false);
            alert("¡Cuenta creada exitosamente!");
        }, 1500);
    };

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0: return '#e5e7eb';
            case 1: return '#ef4444';
            case 2: return '#f59e0b';
            case 3: return '#3b82f6';
            case 4: return '#22c55e';
            default: return '#e5e7eb';
        }
    };
    
    const getStrengthLabel = () => {
        switch (passwordStrength) {
            case 0: return '';
            case 1: return 'Débil';
            case 2: return 'Regular';
            case 3: return 'Buena';
            case 4: return 'Fuerte';
            default: return '';
        }
    };

    const hasPasswordMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

    return (
        <div className="register-wrapper">
            <div ref={ref} className="register-container">
                <div className={`register-panel ${inView ? 'is-visible' : ''}`}>
                    <img src="/Icono_PlanFly2.png" alt="PlanFly Logo" />
                    <h2>Únete a PlanFly</h2>
                    <p>Comienza a optimizar tu cadena de suministro hoy mismo.</p>
                </div>

                <div className={`register-form-side ${inView ? 'is-visible' : ''}`}>
                    <h3>Crea tu cuenta gratuita</h3>
                    
                    <button type="button" className="btn-google">
                        <GoogleIcon /> Registrarse con Google
                    </button>

                    <div className="divider">O regístrate con tu email</div>

                    <form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div className="form-group">
                            <label htmlFor="fullName">Nombre Completo</label>
                            <div className="relative-input-container">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej. Juan Pérez"
                                    className="pr-10"
                                />
                                {formData.fullName && (
                                    <button 
                                        type="button"
                                        className="clear-input-btn"
                                        onClick={() => handleClearField('fullName')}
                                        tabIndex="-1"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Correo */}
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <div className="relative-input-container">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="nombre@empresa.com"
                                    className="pr-10"
                                />
                                {formData.email && (
                                    <button 
                                        type="button"
                                        className="clear-input-btn"
                                        onClick={() => handleClearField('email')}
                                        tabIndex="-1"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tipo de Negocio */}
                        <div className="form-group">
                            <label htmlFor="businessType">Tipo de Negocio</label>
                            <select 
                                name="businessType" 
                                value={formData.businessType} 
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                <option value="manufactura">Manufactura</option>
                                <option value="retail">Retail / Comercio</option>
                                <option value="distribucion">Distribución y Logística</option>
                                <option value="alimentos">Alimentos y Bebidas</option>
                                <option value="farmaceutica">Farmacéutica</option>
                                <option value="otro">Otro</option> {/* Opción que dispara el nuevo campo */}
                            </select>
                        </div>

                        {/* --- CAMPO CONDICIONAL: Especifique (Solo si selecciona 'otro') --- */}
                        {formData.businessType === 'otro' && (
                            <div className="form-group fade-in-field">
                                <label htmlFor="otherBusinessType">Especifique el tipo de negocio</label>
                                <div className="relative-input-container">
                                    <input
                                        type="text"
                                        name="otherBusinessType"
                                        value={formData.otherBusinessType}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej. Consultoría, Servicios..."
                                        className="pr-10"
                                        autoFocus // Foco automático al aparecer
                                    />
                                    {formData.otherBusinessType && (
                                        <button 
                                            type="button"
                                            className="clear-input-btn"
                                            onClick={() => handleClearField('otherBusinessType')}
                                            tabIndex="-1"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contraseña */}
                        <div className="form-group">
                            <label htmlFor="password">Crear Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            {formData.password && (
                                <div className="password-strength-container">
                                    <div className="strength-bar-bg">
                                        <div 
                                            className="strength-bar-fill" 
                                            style={{ 
                                                width: `${(passwordStrength / 4) * 100}%`,
                                                backgroundColor: getStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span className="strength-label" style={{ color: getStrengthColor() }}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <div className="relative-input-container">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={hasPasswordMismatch ? 'input-error pr-10' : 'pr-10'}
                                />
                                {formData.confirmPassword && (
                                    <div className="validation-icon">
                                        {!hasPasswordMismatch ? 
                                            <Check size={18} className="text-green-500" /> : 
                                            <X size={18} className="text-red-500" />
                                        }
                                    </div>
                                )}
                            </div>
                            {hasPasswordMismatch && (
                                <p className="input-alert-message">
                                    Las contraseñas no coinciden.
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? 'Creando cuenta...' : 'Registrarse'}
                        </button>
                        
                        {error && (
                            <div className="error-message flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                    </form>

                    <p className="login-link">
                        ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;