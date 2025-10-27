//Componente: Card Base dos Dashboards, com resumo de métricas//

import React from 'react';

// Propriedades do Card
interface CardBaseDashProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode; // Permite passar um componente de ícone
}

export default function CardBaseDash({ title, value, subtitle, icon }: CardBaseDashProps) {
    
    return (
        
        <div className="w-80 h-auto border border-green-600 rounded-lg p-4 m-4 shadow-sm">
          
          {/* Seção Superior: Título e Ícone */}
          <div className="flex justify-between items-start mb-2">
            
            <p className="text-green-800">{title}</p>
            
            <div className="w-6 h-6 text-green-700">
              {icon}
            </div>

          </div>
          
          {/* Seção do Meio: Valor */}
          <div className="mb-1">
            <p className="text-3xl text-green-800">{value}</p>
          </div>

          {/* Seção Inferior: Subtítulo */}
          <div>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>

        </div>
    );
}