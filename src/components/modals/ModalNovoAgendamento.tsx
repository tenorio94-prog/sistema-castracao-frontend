// @/components/AtendenteComponents/AgendamentoCard.tsx
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

// 1. Definição do Tipo
type Agendamento = {
  id: number;
  petName: string;
  status: 'Pendente' | 'Concluído' | string; 
  responsavel: string;
  data: string; // Pode ser "AAAA-MM-DD" ou "DD/MM/AAAA"
  hora: string;
  tipo: string;
};

// 2. Props do Componente
type AgendamentoCardProps = {
  agendamento: Agendamento;
};

// Mapeamento de status
const statusStyles: { [key: string]: string } = {
  Pendente: 'bg-blue-100 text-blue-800',
  Concluído: 'bg-gray-100 text-gray-800',
};

// --- FUNÇÃO DE FORMATAÇÃO DE DATA ---
/**
 * Formata uma data de AAAA-MM-DD para DD/MM/AAAA.
 * Se já estiver em DD/MM/AAAA ou outro formato, apenas a retorna.
 */
const formatarData = (dataString: string) => {
  // Verifica se a string contém '-' e tem o formato AAAA-MM-DD
  if (dataString && dataString.includes('-') && dataString.length === 10) { 
    const partes = dataString.split('-');
    if (partes.length === 3) {
      // partes[0] = AAAA, partes[1] = MM, partes[2] = DD
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
  }
  // Retorna o valor original se não for o formato esperado
  return dataString; 
};
// ---------------------------------

export default function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  if (!agendamento) {
    return null;
  }
  
  const { id, petName, status, responsavel, data, hora } = agendamento;
  const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800';

  const handleCheckIn = () => {
    console.log(`Realizando check-in para o agendamento ${id}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-800">{petName}</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
            {status}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          Responsável: <span className="font-medium text-gray-700">{responsavel}</span>
        </span>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            {/* --- CORREÇÃO AQUI --- */}
            {/* Usa a função de formatação */}
            <span>{formatarData(data)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{hora}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleCheckIn}
          className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Check-in
        </button>
        <a 
          href={`/atendente/agendamentos/${id}`}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Ver Detalhes
        </a>
      </div>
    </div>
  );
}