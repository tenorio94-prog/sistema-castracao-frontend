import React from 'react';
import { LucideIcon } from 'lucide-react';

type CardIndicadorProps = {
  title: string;
  value: number | string;
  Icon: LucideIcon;
  onClick?: () => void;
  className?: string; // Para estilização adicional
};

/**
 * Card genérico para exibir um indicador chave no dashboard.
 */
export default function CardIndicador({ title, value, Icon, onClick, className = '' }: CardIndicadorProps) {
  return (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col justify-between h-full ${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
        <Icon size={20} className="text-green-600" />
      </div>
      <div className="text-4xl font-extrabold text-gray-900 leading-none">
        {value}
      </div>
    </div>
  );
}