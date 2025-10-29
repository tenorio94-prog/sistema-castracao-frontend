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
  
  /** Define a cor do badge de status */
  statusVariant?: 'blue' | 'gray' | 'green' | 'yellow';
  /** Slot para os botões de ação (Ver Prontuário, Iniciar Atendimento, etc.) */
  children: React.ReactNode;
}

/**
 * Retorna a classe de cor correspondente para o badge de status.
 * (As classes de transparência permanecem as mesmas)
 */
function getStatusClasses(variant: AppointmentCardProps['statusVariant']) {
  switch (variant) {
    case 'green':
      return 'text-green-600 border-green-600/20 bg-green-600/5';
    case 'yellow':
      return 'text-yellow-600 border-yellow-600/20 bg-yellow-600/5';
    case 'gray':
      return 'text-gray-600 border-gray-600/20 bg-gray-600/5';
    case 'blue':
    default:
      return 'text-blue-600 border-blue-600/20 bg-blue-600/5';
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
        
        {/* Bloco de Hora */}
        <div className="bg-green-100 text-green-700 p-3 rounded-md text-center w-20">
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
        
        {/* * * AQUI ESTÁ A MUDANÇA:
          * Aumentando o padding (de px-2.5 py-0.5 para px-3 py-1), 
          * mas mantendo o texto pequeno (text-xs).
        */}
        <span 
          className={`border text-xs px-3 py-1 rounded-full font-medium ${statusClasses}`}
        >
          {status}
        </span>

        {/* Slot para os Botões */}
        {children}
      </div>
    </div>
  );
}