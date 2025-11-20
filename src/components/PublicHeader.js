// src/components/PublicHeader.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext'; // Importar hook
import './PublicHeader.css';

const PublicHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Obtener la función de traducción del contexto
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const getLinkClass = (path) => {
    const currentPath = decodeURIComponent(location.pathname);
    return currentPath === path ? 'nav-item active' : 'nav-item';
  };

  return (
    <header className={`glass-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo-container">
          <div className="logo-icon" /> 
          <span className="logo-text">PlanFly</span>
        </Link>

        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Reemplazar textos duros por la función t() */}
          <Link to="/" className={getLinkClass('/')}>{t('nav_home')}</Link>
          
          <Link to="/planes" className={getLinkClass('/planes')}>{t('nav_pricing')}</Link>
          
          <Link to="/quienes-somos" className={getLinkClass('/quienes-somos')}>{t('nav_about')}</Link>
          
          <Link to="/reseñas" className={getLinkClass('/reseñas')}>{t('nav_reviews')}</Link>
          
          <Link to="/demo" className={getLinkClass('/demo')}>{t('nav_demo')}</Link>
          
          <div className="mobile-cta-container mobile-only">
             <Link to="/login" className="nav-cta-button">
               {t('nav_start')}
             </Link>
          </div>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="nav-cta-button desktop-only">
            {t('nav_start')}
          </Link>
          
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