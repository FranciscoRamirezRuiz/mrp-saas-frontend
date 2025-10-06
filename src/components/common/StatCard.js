// src/components/common/StatCard.js
import React from 'react';
import Card from './Card';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card className="flex items-center p-6 space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </Card>
);

export default StatCard;