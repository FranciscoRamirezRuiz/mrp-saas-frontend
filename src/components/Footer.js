// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Usaremos el CSS simplificado

const Footer = () => {
  return (
    <footer className="public-footer-static">
      <div className="footer-content-static">
        
        <div className="footer-section-static">
          <img src="/Icono_PlanFly2.png" alt="PlanFly Logo" className="footer-logo-static" />
          <p>Planificando el futuro de tu producción, hoy.</p>
        </div>

        <div className="footer-section-static">
          <h4>Contacto</h4>
          <p>info@planfly.com</p>
          <p>+56 9 1234 5678</p>
          <p>Santiago, Chile</p>
        </div>

        <div className="footer-section-static">
          <h4>Redes Sociales</h4>
          <p>Facebook</p>
          <p>LinkedIn</p>
          <p>Instagram</p>
        </div>

      </div>
      <div className="footer-bottom-static">
        <p>&copy; {new Date().getFullYear()} PlanFly | Todos los derechos reservados</p>
        <p>Términos de Servicio | Política de Privacidad</p>
      </div>
    </footer>
  );
};

export default Footer;