'use client'; // Obrigatório para interatividade calendário

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Estilos básicos do calendário
import { ptBR } from 'date-fns/locale';    // Para traduzir o calendário para Português

//SIMULAÇÃO DOS DADOS DE AGENDAMENTO
// Será buscado em nosso banco
const agendamentos = [
  { id: 1, pet: 'Rex', responsavel: 'João', medico: 'Dra. Cecília', status: 'Triagem', horario: '09:00' },
  { id: 2, pet: 'Luna', responsavel: 'Maria', medico: 'Dr. Carlos', status: 'Aguardando', horario: '09:30' },
  { id: 3, pet: 'Thor', responsavel: 'Pedro', medico: 'Dra. Cecília', status: 'Em consulta', horario: '10:00' },
];
// --- FIM DA SIMULAÇÃO ---


// Subcomponente para o Card de Agendamento (baseado na imagem)
function AgendamentoItem({ pet, responsavel, medico, status, horario }: (typeof agendamentos)[0]) {
  
  // Define a cor do status
  const statusCor = {
    'Triagem': 'border-green-300 text-green-700 bg-green-50',
    'Aguardando': 'border-blue-300 text-blue-700 bg-blue-50',
    'Em consulta': 'border-yellow-300 text-yellow-700 bg-yellow-50',
  }[status] || 'border-gray-300 text-gray-700 bg-gray-50';

  return (
    <div className="relative flex items-center justify-between p-4 border-b-2 border-dashed border-gray-200">
      {/* Barra lateral verde */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-600 rounded-l-lg"></div>
      
      {/* Detalhes do Pet */}
      <div className="pl-4">
        <p className="font-semibold text-lg text-gray-800">{pet}</p>
        <p className="text-sm text-gray-600">Responsável: {responsavel}</p>
        <p className="text-sm text-gray-600">Médico: {medico}</p>
      </div>
      
      {/* Horário e Status */}
      <div className="flex flex-col items-end h-full">
        <p className="font-bold text-xl text-gray-800 mb-2">{horario}</p>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusCor}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

// Componente Principal
export default function AgendaDoDia() {
  
  // Pega a data de hoje para ser a data padrão
  const dataDeHoje = new Date();

  // Estado para guardar o dia que o usuário clicar
  const [diaSelecionado, setDiaSelecionado] = useState<Date | undefined>(dataDeHoje);
  
  // Formata a data para "05 de outubro de 2025"
  const subtituloData = diaSelecionado 
    ? diaSelecionado.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Selecione um dia';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Título e Calendário */}
        <div className="md:col-span-1">
          <h3 className="text-2xl font-bold text-gray-800">
            Agenda do Dia
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {subtituloData}
          </p>

          {/* Container do Calendário com a borda tracejada */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
            <DayPicker
              mode="single" // Permite selecionar apenas um dia
              selected={diaSelecionado}
              onSelect={setDiaSelecionado}
              locale={ptBR} // Traduz para português
              
              // --- Estilização com Tailwind ---
              // Isso é o que faz ele ficar parecido com o da imagem
              classNames={{
                root: 'w-full',
                caption: 'flex justify-between items-center mb-2',
                caption_label: 'text-base font-medium text-green-800 underline', // "Outubro"
                nav_button: 'h-6 w-6 text-gray-500 hover:text-green-700',
                head_row: 'flex w-full mt-2',
                head_cell: 'w-full text-xs font-semibold text-gray-500', // Mo, Tu, We...
                row: 'flex w-full mt-2',
                cell: 'flex-1 text-center text-sm p-0',
                day: 'h-8 w-8 rounded-full hover:bg-green-100 transition-all',
                day_selected: 'bg-green-600 text-white font-bold hover:bg-green-700', // Dia selecionado (o verde)
                day_today: 'font-bold text-green-700', // Dia de hoje
                day_outside: 'text-gray-300', // Dias de outros meses
              }}
            />
          </div>
        </div>

        {/* Coluna da Direita: Lista de Agendamentos */}
        <div className="md:col-span-2">
          <h4 className="text-xl font-semibold text-green-700 mb-4">
            Consultas
          </h4>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Aqui você faria um .map() nos dados reais */}
            {agendamentos.map((ag) => (
              <AgendamentoItem key={ag.id} {...ag} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}