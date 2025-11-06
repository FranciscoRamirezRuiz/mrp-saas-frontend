// src/components/views/ReviewsView.js
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Star, StarHalf } from 'lucide-react';
import './ReviewsView.css'; // Importamos los nuevos estilos

// --- Datos de Reseñas Inventadas ---
const reviewData = [
    {
        name: 'Carlos Mendoza',
        company: 'CEO, Manufacturas Precisas',
        rating: 5,
        avatar: 'CM',
        text: 'PlanFly ha sido un antes y un después. Redujimos nuestro stock de seguridad en un 30% gracias a la precisión de sus pronósticos. ¡Increíble!'
    },
    {
        name: 'Ana Sofía Vergara',
        company: 'Jefa de Logística, Alimentos del Sur',
        rating: 4.5,
        avatar: 'AV',
        text: 'La implementación fue rapidísima. En menos de una semana, ya estábamos corriendo el MRP para todos nuestros productos terminados. El soporte es excelente.'
    },
    {
        name: 'Javier Torres',
        company: 'Gerente de Producción, MetalMecánica Ltda.',
        rating: 5,
        avatar: 'JT',
        text: 'Lo que más valoro es la visibilidad. Ahora sé exactamente qué material pedir y cuándo. El PMP es claro y fácil de ajustar. 100% recomendado.'
    },
    {
        name: 'Lucía Fernández',
        company: 'Dueña, Textil Creativa',
        rating: 5,
        avatar: 'LF',
        text: 'Como pyme, pensé que estas herramientas eran solo para grandes corporaciones. PlanFly es accesible, intuitivo y me ha ahorrado miles en compras de pánico.'
    },
    {
        name: 'Miguel Ángel Rojas',
        company: 'Director de Operaciones, FarmaIndustria',
        rating: 4.5,
        avatar: 'MR',
        text: 'La gestión de BOMs multinivel es muy robusta. Finalmente dejamos atrás nuestras hojas de Excel de 10.000 filas. Ahora todo está conectado y es automático.'
    },
    {
        name: 'Valeria Guzmán',
        company: 'Ingeniera de Procesos, Plásticos Futuro',
        rating: 5,
        avatar: 'VG',
        text: 'Poder simular la demanda futura y ver el impacto inmediato en nuestro plan de compras es, simplemente, espectacular. Una herramienta fundamental.'
    },
];

// --- Componente para las Estrellas Doradas ---
const StarRating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="star-rating">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} fill="currentColor" size={18} />
            ))}
            {halfStar && <StarHalf key="half" fill="currentColor" size={18} />}
            {[...Array(emptyStars)].map((_, i) => (
                // Estrella vacía, pero del mismo color (dorado) para el borde
                <Star key={`empty-${i}`} size={18} />
            ))}
        </div>
    );
};

// --- Componente de Tarjeta de Reseña ---
const ReviewCard = ({ review, index }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
        // Retraso escalonado para un efecto "cascada"
        // (index % 3) funciona bien para 3 columnas
        delay: (index % 3) * 100, 
    });

    return (
        <div ref={ref} className={`review-card ${inView ? 'is-visible' : ''}`}>
            <StarRating rating={review.rating} />
            <p className="review-text">{review.text}</p>
            <div className="review-author">
                <div className="author-avatar">{review.avatar}</div>
                <div className="author-info">
                    <h5>{review.name}</h5>
                    <p>{review.company}</p>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal de la Página de Reseñas ---
const ReviewsView = () => {
    const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true });

    return (
        <div className="reviews-view">
            {/* Cabecera motivadora */}
            <header ref={headerRef} className={`reviews-header ${headerInView ? 'is-visible' : ''}`}>
                <h1 className="reviews-title">Nuestros clientes aman lo que hacemos</h1>
                <p className="reviews-subtitle">
                    No confíes solo en nuestra palabra. Ve lo que los gerentes de producción, jefes de logística e ingenieros
                    reales opinan sobre cómo PlanFly ha transformado su cadena de suministro.
                </p>
            </header>

            {/* Grid de Reseñas */}
            <main className="reviews-grid">
                {reviewData.map((review, index) => (
                    <ReviewCard key={index} review={review} index={index} />
                ))}
            </main>
        </div>
    );
};

export default ReviewsView;