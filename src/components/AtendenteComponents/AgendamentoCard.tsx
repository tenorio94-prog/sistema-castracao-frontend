// @/components/AtendenteComponents/AgendamentoCard.tsx
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

// --- ATUALIZAÇÃO: "FONTE DA VERDADE" DOS TIPOS ---

export type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  ownerName: string;
};

// 1. TIPO RESPONSAVEL (AGORA COMPLETO E CORRETO)
// Alinhado com o seu formulário de cadastro (admin)
export type Responsavel = {
  id: string;
  tipo: 'PF' | 'ONG';
  nome: string;
  cpf?: string;
  nis?: string;
  cnpj?: string;
  telefone?: string; 
  animais: string[]; 
  senha: string;     
  email?: string;     
  endereco?: string;  
};

export type Agendamento = {
  id: number;
  petName: string;
  status: 'Pendente' | 'Concluído' | string;
  data: string;
  hora: string; 
  tipo: string;
  observacoes?: string;
  pet: Pet; // Pet completo
  responsavel: Responsavel; // Responsavel completo
};
// ------------------------------------------------

// Props do Componente
type AgendamentoCardProps = {
  agendamento: Agendamento;
  onVerDetalhes: (agendamento: Agendamento) => void;
};

// Mapeamento de status
const statusStyles: { [key: string]: string } = {
  Pendente: 'bg-blue-100 text-blue-800',
  Concluído: 'bg-gray-100 text-gray-800',
};

// Função de formatação de data
const formatarData = (dataString: string) => {
  if (dataString && dataString.includes('-') && dataString.length === 10) { 
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString; 
};

export default function AgendamentoCard({ agendamento, onVerDetalhes }: AgendamentoCardProps) {
  if (!agendamento) {
    return null;
  }
  
  const { id, petName, status, responsavel, data, hora, pet } = agendamento;
  const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* (Informações) */}
      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-800">{petName}</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
            {status}
          </span>
        </div>
        {/* 2. Mostra o nome do responsável (o tipo 'Responsavel' importado agora tem 'nome') */}
        <span className="text-sm text-gray-600">
          Responsável: <span className="font-medium text-gray-700">{responsavel.nome}</span>
        </span>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{formatarData(data)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{hora}</span>
          </div>
        </div>
      </div>
      
      {/* Botão Simplificado */}
      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={() => onVerDetalhes(agendamento)} 
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}