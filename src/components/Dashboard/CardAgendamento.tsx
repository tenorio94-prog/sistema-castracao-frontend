// app/components/Dashboard/AppointmentCard.tsx

import React from 'react';
import { Clock } from 'lucide-react';

// Propriedades do Card de Agendamento
interface AppointmentCardProps {
  time: string;
  petName: string;
  service: string;
  details: string;
  status: string;
  
  /** Define a cor do badge de status (atualizado para incluir red/orange) */
  statusVariant?: 'blue' | 'gray' | 'green' | 'yellow' | 'red' | 'orange';
  /** Slot para os botões de ação (Ver Prontuário, Iniciar Atendimento, etc.) */
  children: React.ReactNode;
}

/**
 * Retorna a classe de cor correspondente para o badge de status.
 * (ATUALIZADO PARA O ESTILO DA PÁGINA DE ESTOQUE)
 */
function getStatusClasses(variant: AppointmentCardProps['statusVariant']) {
  switch (variant) {
    case 'green':
      return 'bg-green-200 text-green-800';
    case 'yellow':
      return 'bg-yellow-200 text-yellow-800';
    case 'orange': // Para "Retorno pendente"
      return 'bg-orange-200 text-orange-800';
    case 'red': // Para "Inapto"
      return 'bg-red-200 text-red-800';
    case 'gray':
      return 'bg-gray-200 text-gray-800';
    case 'blue':
    default:
      return 'bg-blue-200 text-blue-800';
  }
}

export default function CardAgendamento({
  time,
  petName,
  service,
  details,
  status,
  statusVariant = 'blue',
  children, 
}: AppointmentCardProps) {

  const statusClasses = getStatusClasses(statusVariant);

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-white shadow-sm"
    >
      {/* Lado Esquerdo: Informações do Pet */}
      <div className="flex items-center gap-4">
        
        {/* Bloco de Hora (Neutro) */}
        <div className="bg-gray-100 text-gray-700 p-3 rounded-md text-center w-20">
          <Clock size={16} className="mx-auto mb-1 opacity-80" />
          <p className="font-bold text-lg leading-none">{time}</p>
        </div>
        
        {/* Detalhes */}
        <div>
          <p className="font-bold text-lg text-gray-800">{petName}</p>
          <p className="text-sm text-gray-600">{service}</p>
          <p className="text-sm text-gray-500 mt-1">{details}</p>
        </div>
      </div>
      
      {/* Lado Direito: Status e Ações (Botões) */}
      <div className="flex items-center gap-3">
        
        {/* Badge de Status (ATUALIZADO) */}
        <span 
          className={`text-xs px-3 py-1 rounded-full font-semibold ${statusClasses}`} // Removido 'border', adicionado 'font-semibold'
        >
          {status}
        </span>

        {/* Slot para os Botões */}
        {children}
      </div>
    </div>
  );
}