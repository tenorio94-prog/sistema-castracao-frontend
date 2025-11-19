import React from 'react';
import { Clock, MoreHorizontal, PawPrint, User } from 'lucide-react';

// --- TIPOS (Mantidos da sua versão original) ---
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
  pet: Pet;
  responsavel: Responsavel;
};

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onVerDetalhes: (agendamento: Agendamento) => void;
}

export default function AgendamentoCard({ agendamento, onVerDetalhes }: AgendamentoCardProps) {
  const { petName, status, responsavel, hora, tipo } = agendamento;

  // Estilização dinâmica de status
  const statusConfig = {
    Pendente: "bg-amber-50 text-amber-700 border-amber-100",
    Concluído: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Cancelado: "bg-red-50 text-red-700 border-red-100",
  } as const;

  const currentStatusStyle = statusConfig[status as keyof typeof statusConfig] || "bg-gray-50 text-gray-700 border-gray-100";

  return (
    <div className="group flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      
      {/* Esquerda: Identificação do Pet e Dono */}
      <div className="flex items-center gap-4 w-full md:w-1/3 mb-3 md:mb-0">
        <div className="h-12 w-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          <PawPrint size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-base">{petName}</h4>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User size={12} />
            <span>{responsavel.nome.split(' ')[0]}</span> {/* Mostra só o primeiro nome */}
          </div>
        </div>
      </div>

      {/* Centro: Tipo de Atendimento */}
      <div className="w-full md:w-1/4 mb-3 md:mb-0 pl-0 md:pl-4">
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Serviço</p>
        <p className="text-sm font-medium text-gray-700">{tipo}</p>
      </div>

      {/* Direita: Hora, Status e Ação */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6">
        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Clock size={14} />
          <span className="text-sm font-medium">{hora}</span>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${currentStatusStyle}`}>
          {status}
        </span>

        {/* Botão de Ação Discreto */}
        <button 
          onClick={() => onVerDetalhes(agendamento)}
          className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver Detalhes"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}