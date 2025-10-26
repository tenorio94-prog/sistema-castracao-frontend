import React from 'react';

interface AgendamentoCardProps {
  horario: string;
  nomePet: string;
  tipoServico: string;
  descricao: string;
  acoes?: React.ReactNode; // Adicionar Botões postetiormente
}

// Atributos do Card de Agendamento
export default function AgendamentoCard({ 
  horario, 
  nomePet, 
  tipoServico, 
  descricao, 
  acoes 
}: AgendamentoCardProps) {
  
  return (
    <div className="border border-green-700/30 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        
        {/* BLOCO DE HORÁRIO E DETALHES DO AGENDAMENTO*/}
        <div className="flex items-start space-x-4">
          
          {/* Bloco de Horário */}
          <div className="flex flex-col items-center justify-center h-16 w-12 rounded-lg p-1 text-xs text-white
                        bg-gradient-to-b from-blue-300 to-green-300">
            <span className="font-semibold text-sm">{horario}</span>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="pt-1">
            <p className="text-gray-900 font-semibold text-lg">{nomePet}</p>
            <p className="text-gray-700 text-sm mt-0.5">{tipoServico}</p>
            <p className="text-gray-500 text-xs mt-1">{descricao}</p>
          </div>
        </div>

        {/* Lado Direito: botões */}
        <div>
          {acoes}
        </div>

      </div>
    </div>
  );
}