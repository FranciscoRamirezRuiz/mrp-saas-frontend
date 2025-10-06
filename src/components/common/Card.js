// src/components/common/Card.js
import React from 'react';

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transition-shadow duration-300 ${className}`}>
    {title && <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{title}</h3>}
    {children}
  </div>
);

export default Card;