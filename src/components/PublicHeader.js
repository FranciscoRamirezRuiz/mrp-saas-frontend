// src/components/PublicHeader.js
import React from 'react';
import { Link } from 'react-router-dom';
import './PublicHeader.css'; // Crearemos este archivo ahora

const PublicHeader = () => {
    return (
        <nav className="public-header">
            <div className="public-header-logo">
                <Link to="/">
                    {/* Usamos el logo que ya tienes en 'public' */}
                    <img src="/Icono_PlanFly2.png" alt="PlanFly Logo" style={{ height: '40px' }} />
                </Link>
            </div>
            <ul className="public-header-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/quienes-somos">Quiénes Somos</Link></li>
                <li><Link to="/planes">Planes</Link></li>
                <li><Link to="/reseñas">Reseñas</Link></li>
            </ul>
            <div className="public-header-actions">
                <Link to="/demo" className="btn-demo">
                    Prueba la Demo
                </Link>
                <Link to="/login" className="btn-login">
                    Iniciar Sesión
                </Link>
            </div>
        </nav>
    );
};

export default PublicHeader;