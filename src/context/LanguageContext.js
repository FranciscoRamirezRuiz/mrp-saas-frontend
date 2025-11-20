import React, { createContext, useState, useContext } from 'react';

// 1. El Diccionario de Traducciones
const translations = {
  es: {
    // Navegación (Header)
    nav_home: "Inicio",
    nav_pricing: "Planes",
    nav_about: "Nosotros",
    nav_reviews: "Reseñas",
    nav_demo: "Demo",
    nav_start: "Comenzar",
    
    // Footer
    footer_slogan: "Planificando el futuro de tu producción, hoy.",
    footer_contact: "Contacto",
    footer_social: "Redes Sociales",
    footer_rights: "Todos los derechos reservados",
    footer_terms: "Términos de Servicio",
    footer_privacy: "Política de Privacidad",
  },
  en: {
    // Navigation (Header)
    nav_home: "Home",
    nav_pricing: "Pricing",
    nav_about: "About Us",
    nav_reviews: "Reviews",
    nav_demo: "Demo",
    nav_start: "Get Started",
    
    // Footer
    footer_slogan: "Planning the future of your production, today.",
    footer_contact: "Contact",
    footer_social: "Social Media",
    footer_rights: "All rights reserved",
    footer_terms: "Terms of Service",
    footer_privacy: "Privacy Policy",
  }
};

// 2. Crear el Contexto
const LanguageContext = createContext();

// 3. Crear el Proveedor (La "Antena" que emite la señal)
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('es'); // 'es' por defecto

  // Función para obtener texto: t('nav_home')
  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 4. Hook personalizado para usarlo fácil en los componentes
export const useLanguage = () => useContext(LanguageContext);