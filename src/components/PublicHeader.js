import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PublicHeader.css';

// import logoImg from '../assets/logo.png'; 

const PublicHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Detectar scroll para cambiar el estilo de la barra
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`glass-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* LOGO */}
        <Link to="/" className="logo-container">
          <div className="logo-icon" /> 
          <span className="logo-text">DemandFlow</span>
        </Link>

        {/* NAVEGACIÓN */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-item">Inicio</Link>
          
          {/* RUTAS EN ESPAÑOL (Coinciden con App.js) */}
          <Link to="/planes" className="nav-item">Planes</Link>
          <Link to="/quienes-somos" className="nav-item">Nosotros</Link>
          <Link to="/reseñas" className="nav-item">Reseñas</Link>
          
          <Link to="/demo" className="nav-item">Demo</Link>
          
          {/* Botón CTA Móvil */}
          <div className="mobile-cta-container mobile-only">
             <Link to="/login" className="nav-cta-button">
               Comenzar
             </Link>
          </div>
        </nav>

        {/* ACCIONES (Escritorio) */}
        <div className="header-actions">
          <Link to="/login" className="nav-cta-button desktop-only">
            Comenzar
          </Link>
          
          {/* Botón Hamburguesa */}
          <button 
            className={`menu-toggle ${mobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;