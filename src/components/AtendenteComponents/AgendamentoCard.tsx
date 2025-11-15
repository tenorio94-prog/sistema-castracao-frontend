import { Calendar, Clock } from 'lucide-react';
// import Link from 'next/link'; // Removido para corrigir o build

/**
 * Mapeamento de status para estilos de badge.
 * TODO: Integração Backend: Alinhar nomes de status com o backend.
 */
const statusStyles = {
  Pendente: 'bg-blue-100 text-blue-800',
  Confirmado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
  Concluído: 'bg-gray-100 text-gray-800',
};

/**
 * Componente reutilizável para exibir um único agendamento na lista.
 * * ATUALIZAÇÃO: Substituído <Link> do Next.js por <a> padrão para resolver erro de compilação.
 */
interface Agendamento {
  id: string | number;
  petName: string;
  status: keyof typeof statusStyles;
  responsavel: string;
  data: string;
  hora: string;
}

interface AgendamentoCardProps {
  agendamento: Agendamento;
}

export default function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  
  // --- CORREÇÃO DE ERRO ---
  // Adicionada uma verificação de segurança. Se a prop 'agendamento'
  // for nula ou indefinida, o componente não renderiza,
  // evitando o erro de desestruturação.
  if (!agendamento) {
    return null;
  }
  // --- FIM DA CORREÇÃO ---

  const { id, petName, status, responsavel, data, hora } = agendamento;

  // Estilo do badge baseado no status, com um padrão
  const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800';

  const handleCheckIn = () => {
    // TODO: Integração Backend: Implementar lógica de check-in
    // Esta função faria uma chamada de API para atualizar o status
    // do agendamento com o id: agendamento.id
    console.log(`Realizando check-in para o agendamento ${id}`);
    // Adicionar um modal de confirmação aqui seria ideal
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      
      {/* Informações Principais */}
      <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
        
        {/* Nome do Pet e Status */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-800">{petName}</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
            {status}
          </span>
        </div>

        {/* Responsável */}
        <span className="text-sm text-gray-600">
          Responsável: <span className="font-medium text-gray-700">{responsavel}</span>
        </span>

        {/* Data e Hora */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{data}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{hora}</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
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