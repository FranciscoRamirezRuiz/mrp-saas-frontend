// src/components/views/PlaceholderView.js
import React from 'react';
import Card from '../common/Card';

const PlaceholderView = ({ title }) => (
    <div className="flex items-center justify-center h-full p-8">
        <Card title={title} className="max-w-xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h2>
            <p className="text-lg text-gray-600">
                Este módulo estará disponible próximamente.
            </p>
        </Card>
    </div>
);

export default PlaceholderView;