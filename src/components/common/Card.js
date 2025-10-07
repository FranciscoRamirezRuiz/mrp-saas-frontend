// src/components/common/Card.js
import React from 'react';

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-lg hover:shadow-indigo-500/10 transition-shadow duration-300 ${className}`}>
    {title && <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-600 pb-2">{title}</h3>}
    <div className="text-slate-300">
        {children}
    </div>
  </div>
);

export default Card;