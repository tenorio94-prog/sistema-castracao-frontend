import React from 'react';
import { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard'; // Reutilizando o tipo

type CardProximaConsultaProps = {
  agendamento: Agendamento;
  onVerDetalhes: (agendamento: Agendamento) => void;
};

/**
 * Card detalhado para exibir uma próxima consulta no dashboard.
 */
export default function CardProximaConsulta({ agendamento, onVerDetalhes }: CardProximaConsultaProps) {
  const { id, tipo, petName, data, hora, status } = agendamento;

  // Função para formatar a data (reutilizada)
  const formatarData = (dataString: string) => {
    if (dataString && dataString.includes('-') && dataString.length === 10) { 
      const partes = dataString.split('-');
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString; 
  };
  
  const statusStyles: { [key: string]: string } = {
    Pendente: 'bg-green-100 text-green-800',
    Confirmado: 'bg-green-200 text-green-900',
    // Adicione outros status aqui, se necessário
  };
  const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800';


  return (
    <div className={`rounded-lg p-4 shadow-md transition-shadow hover:shadow-lg ${badgeStyle}`}>
      <div className="flex justify-between items-start gap-4">
        {/* Informações da Consulta */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900">{tipo}</h3>
          <p className="text-sm font-medium mt-1">
            Animal: <span className="font-semibold">{petName}</span>
          </p>
          <p className="text-xs mt-1 font-medium">
            {formatarData(data)} às {hora}
          </p>
        </div>

        {/* Botão de Detalhes */}
        <button
          onClick={() => onVerDetalhes(agendamento)}
          className="shrink-0 px-4 py-2 rounded-full border border-gray-600 bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}