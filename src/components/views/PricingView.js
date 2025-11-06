// src/components/views/PricingView.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { CheckCircle } from 'lucide-react';
import './PricingView.css'; // Importamos los estilos

// --- Base de Datos de Precios ---
// Aquí definimos los precios en CLP y USD
const priceData = {
    CLP: {
        monthly: {
            basic: 30000,
            pro: 80000,
            corp: 150000,
        },
        'semi-annually': {
            basic: 28500,  // 5% descuento
            pro: 74000,  // 7.5% descuento
            corp: 135000, // 10% descuento
        },
        annually: {
            basic: 27000,  // 10% descuento
            pro: 68000,  // 15% descuento
            corp: 120000, // 20% descuento
        },
    },
    USD: {
        monthly: {
            basic: 35,
            pro: 90,
            corp: 170,
        },
        'semi-annually': {
            basic: 33,   // ~5% descuento
            pro: 83,   // ~7.5% descuento
            corp: 153,  // ~10% descuento
        },
        annually: {
            basic: 31,   // ~10% descuento
            pro: 76,   // ~15% descuento
            corp: 136,  // ~20% descuento
        },
    },
};

// Formateador de moneda (para $1.234 o $1,234.56)
const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat(currency === 'CLP' ? 'es-CL' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};


// --- Componente de Tarjeta de Precio ---
const PriceCard = ({ plan, currency, cycle, delay }) => {
    const { ref, inView } = useInView({ triggerOnce: true, delay });
    
    const price = priceData[currency][cycle][plan.id];
    const discount = {
        'semi-annually': plan.id === 'pro' ? 'Ahorra 7.5%' : plan.id === 'corp' ? 'Ahorra 10%' : 'Ahorra 5%',
        'annually': plan.id === 'pro' ? 'Ahorra 15%' : plan.id === 'corp' ? 'Ahorra 20%' : 'Ahorra 10%',
    };

    return (
        <div ref={ref} className={`price-card ${plan.highlighted ? 'highlighted' : ''} ${inView ? 'is-visible' : ''}`}>
            <div className="price-card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                    {formatCurrency(price, currency)}
                </div>
                <div className="plan-billing-cycle">
                    / usuario / mes
                </div>
                {cycle !== 'monthly' && (
                    <span className="plan-discount">
                        {discount[cycle]}
                    </span>
                )}
            </div>

            <ul className="price-card-features">
                {plan.features.map(feature => (
                    <li key={feature}>
                        <CheckCircle size={16} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Link to="/login" className="btn-select-plan">
                Empezar con {plan.name}
            </Link>
        </div>
    );
};

// --- Componente Principal de la Página de Precios ---
const PricingView = () => {
    const [currency, setCurrency] = useState('CLP');
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly', 'semi-annually', 'annually'
    
    // Animaciones
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true });
    const { ref: controlsRef, inView: controlsInView } = useInView({ triggerOnce: true, delay: 100 });

    const plans = [
        {
            id: 'basic',
            name: 'Básico',
            highlighted: false,
            features: [
                'Predicción de Demanda (1 Modelo)',
                'Gestión de Inventario (Hasta 100 SKUs)',
                'Gestión de BOM (Simple)',
                'Soporte estándar por email',
            ],
        },
        {
            id: 'pro',
            name: 'Profesional',
            highlighted: true,
            features: [
                'Predicción de Demanda (3 Modelos)',
                'Gestión de Inventario (SKUs Ilimitados)',
                'Gestión de BOM (Multinivel)',
                'Cálculo de PMP y MRP',
                'Dashboards Avanzados',
                'Soporte prioritario',
            ],
        },
        {
            id: 'corp',
            name: 'Corporativo',
            highlighted: false,
            features: [
                'Todo en Profesional',
                'Integración API (ERP/CRM)',
                'Soporte dedicado 24/7',
                'Analítica personalizada',
                'Roles de usuario y permisos',
            ],
        },
    ];

    return (
        <div className="pricing-view">
            {/* --- Cabecera --- */}
            <div ref={headerRef} className={`pricing-header ${headerInView ? 'is-visible' : ''}`}>
                <h1 className="pricing-title">Planes simples y transparentes</h1>
                <p className="pricing-subtitle">
                    Elige el plan que se adapta a tus necesidades. Cancela en cualquier momento.
                </p>
            </div>

            {/* --- Controles --- */}
            <div ref={controlsRef} className={`pricing-controls ${controlsInView ? 'is-visible' : ''}`}>
                <div className="currency-selector">
                    <span>Moneda:</span>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="CLP">CLP (Peso Chileno)</option>
                        <option value="USD">USD (Dólar)</option>
                    </select>
                </div>
                
                <div className="billing-toggle">
                    <button 
                        onClick={() => setBillingCycle('monthly')} 
                        className={billingCycle === 'monthly' ? 'active' : ''}
                    >
                        Mensual
                    </button>
                    <button 
                        onClick={() => setBillingCycle('semi-annually')} 
                        className={billingCycle === 'semi-annually' ? 'active' : ''}
                    >
                        Semestral
                    </button>
                    <button 
                        onClick={() => setBillingCycle('annually')} 
                        className={billingCycle === 'annually' ? 'active' : ''}
                    >
                        Anual
                    </button>
                    {/* El slider de fondo que se mueve */}
                    <div className="billing-slider" data-cycle={billingCycle}></div>
                </div>
            </div>

            {/* --- Cuadrícula de Precios --- */}
            <div className="pricing-grid">
                {plans.map((plan, index) => (
                    <PriceCard 
                        key={plan.id}
                        plan={plan} 
                        currency={currency}
                        cycle={billingCycle}
                        delay={300 + index * 100} // Retraso escalonado
                    />
                ))}
            </div>
        </div>
    );
};

export default PricingView;