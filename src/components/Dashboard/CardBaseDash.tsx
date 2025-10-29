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
        
        // ### Estilo do Container Atualizado ###
        // Removido: m-4, border-green-600
        // Adicionado: border (para usar a cor padrão 'border-gray-200')
        <div className="w-80 h-auto border rounded-lg p-4 shadow-sm bg-white">
          
          {/* Seção Superior: Título e Ícone */}
          <div className="flex justify-between items-start mb-2">
            
            {/* Título com nova cor */}
            <p className="text-gray-700 font-medium">{title}</p>
            
            {/* Ícone com nova cor */}
            <div className="w-6 h-6 text-gray-500">
              {icon}
            </div>

          </div>
          
          {/* Seção do Meio: Valor */}
          <div className="mb-1">
            {/* Valor com nova cor e peso */}
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>

          {/* Seção Inferior: Subtítulo (já estava neutro) */}
          <div>
            <p className="text-gray-500 text-sm">{subtitle}</p>
          </div>

        </div>
    );
}