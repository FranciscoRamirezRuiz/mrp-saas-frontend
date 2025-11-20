// src/components/Footer.js
import React from 'react'; // Ya no necesitamos useState aquí
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Importar el hook
import './Footer.css'; 

const Footer = () => {
  // Usamos el contexto global en lugar de estado local
  const { language, changeLanguage, t } = useLanguage();

  return (
    <footer className="public-footer-static">
      <div className="footer-content-static">
        
        <div className="footer-section-static">
          <img src="/Icono_PlanFly2.png" alt="PlanFly Logo" className="footer-logo-static" />
          {/* Usamos t() para traducir textos */}
          <p>{t('footer_slogan')}</p>
        </div>

        <div className="footer-section-static">
          <h4>{t('footer_contact')}</h4>
          <p>info@planfly.com</p>
          <p>+56 9 1234 5678</p>
          <p>Santiago, Chile</p>
        </div>

        <div className="footer-section-static">
          <h4>{t('footer_social')}</h4>
          <p>Facebook</p>
          <p>LinkedIn</p>
          <p>Instagram</p>
        </div>

      </div>
      
      <div className="footer-bottom-static">
        <p>&copy; {new Date().getFullYear()} PlanFly | {t('footer_rights')}</p>
        
        {/* Selector de Idioma Conectado */}
        <div className="language-selector">
            <Globe size={16} className="globe-icon" />
            <button 
                className={`lang-btn ${language === 'es' ? 'active' : ''}`}
                onClick={() => changeLanguage('es')}
            >
                ES
            </button>
            <span className="lang-separator">|</span>
            <button 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
        </div>

        <p>{t('footer_terms')} | {t('footer_privacy')}</p>
      </div>
    </footer>
  );
};

export default Footer;