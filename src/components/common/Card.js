// src/components/common/Card.js
import React from 'react';

const Card = ({ title, children, className = '' }) => (
  <div className={`
      bg-white 
      p-6 
      rounded-xl 
      shadow-xl 
      border border-slate-300 
      ${className}
  `}>
    {title && (
      <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">
        {title}
      </h3>
    )}
    {children}
  </div>
);

export default Card;