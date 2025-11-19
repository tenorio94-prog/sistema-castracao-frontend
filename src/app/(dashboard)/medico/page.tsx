"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Dog, 
  Search, 
  Stethoscope, 
  Activity, 
  CheckCircle2,
  FileText,
  ClipboardList,
  Play
} from 'lucide-react';

import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import ViewModal from '@/components/modals/ViewModal';
// Reutilizando o card padrão para consistência visual
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';

// --- Mocks Adaptados para o Tipo Agendamento ---
const mockAppointments: Agendamento[] = [
  {
    id: 1,
    petName: 'Luna',
    status: 'Pendente', // Status para cor amarela/azul
    data: '2023-11-20',
    hora: '09:00',
    tipo: 'Cirurgia - Castração',
    observacoes: 'Jejum de 12h realizado. Animal calmo.',
    pet: { id: 101, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '4kg', age: '2 anos', ownerName: 'Ana' },
    responsavel: { id: 'r1', tipo: 'PF', nome: 'Ana Souza', animais: ['Luna'], senha: '123', telefone: '(81) 98888-1111', email: 'ana@gmail.com' }
  },
  {
    id: 2,
    petName: 'Thor',
    status: 'Confirmado', 
    data: '2023-11-20',
    hora: '09:30',
    tipo: 'Consulta de Rotina',
    observacoes: 'Vacinação anual e check-up geral.',
    pet: { id: 102, name: 'Thor', species: 'Cachorro', breed: 'Golden', gender: 'Macho', weight: '28kg', age: '4 anos', ownerName: 'Carlos' },
    responsavel: { id: 'r2', tipo: 'PF', nome: 'Carlos Silva', animais: ['Thor'], senha: '123', telefone: '(81) 97777-2222', email: 'carlos@gmail.com' }
  },
  {
    id: 3,
    petName: 'Simba',
    status: 'Concluído', 
    data: '2023-11-20',
    hora: '10:00',
    tipo: 'Retorno Pós-Cirúrgico',
    observacoes: 'Revisão de pontos da cirurgia ortopédica.',
    pet: { id: 103, name: 'Simba', species: 'Gato', breed: 'Persa', gender: 'Macho', weight: '5kg', age: '5 anos', ownerName: 'Mariana' },
    responsavel: { id: 'r3', tipo: 'PF', nome: 'Mariana X.', animais: ['Simba'], senha: '123', telefone: '(81) 96666-3333', email: 'mariana@gmail.com' }
  },
];

export default function MedicoDashboardPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAppointments);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // --- Handlers ---
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsViewModalOpen(true);
  };

  const handleCloseDetalhes = () => {
    setIsViewModalOpen(false);
    setSelectedAgendamento(null);
  };

  const handleIniciarAtendimento = () => {
    alert(`Iniciando atendimento de ${selectedAgendamento?.petName}... Redirecionando para prontuário.`);
    handleCloseDetalhes();
  };

  const handleVerProntuario = () => {
    alert(`Abrindo histórico médico de ${selectedAgendamento?.petName}.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <PageHeader 
        title="Dashboard Médico"
        description="Bem-vindo(a) ao sistema de gestão hospitalar."
      />

      {/* Indicadores (KPIs) - CORRIGIDO O ERRO DE BUILD AQUI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash
          title="Animais Agendados"
          value={mockAppointments.length}
          subtitle="Aguardando seu atendimento"
          icon={Dog} // ✅ Passando a referência do componente, sem JSX <Dog />
          color="blue"
          trend="Agenda do dia"
        />
        
        <CardBaseDash
          title="Cirurgias"
          value={mockAppointments.filter(a => a.tipo.includes('Cirurgia')).length}
          subtitle="Procedimentos hoje"
          icon={Stethoscope} // ✅ Passando a referência
          color="purple"
        />

        <CardBaseDash
          title="Realizados"
          value={mockAppointments.filter(a => a.status === 'Concluído').length}
          subtitle="Atendimentos finalizados"
          icon={CheckCircle2} // ✅ Passando a referência
          color="green"
        />
      </section>

      {/* Lista de Próximos Atendimentos */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Próximos Atendimentos</h2>
            <p className="text-sm text-gray-500">Sua fila de pacientes programados.</p>
          </div>
          
          {/* Botão identico ao "Novo Agendamento" mas com função para o médico se necessário (ex: Encaixe) */}
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-green-100 transition-all active:scale-95">
            <Activity size={18} />
            <span>Novo Encaixe</span>
          </button>
        </div>

        <div className="space-y-3">
          {agendamentos.map((appt) => (
            <AgendamentoCard
              key={appt.id}
              agendamento={appt}
              onVerDetalhes={handleVerDetalhes}
            />
          ))}
        </div>
      </section>

      {/* Modal de Ações do Médico */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseDetalhes}
        title={`Paciente: ${selectedAgendamento?.petName}`}
      >
        <div className="space-y-5">
           {/* Resumo do Paciente */}
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
               <Dog size={32} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-900">{selectedAgendamento?.petName}</h3>
               <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                 <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{selectedAgendamento?.pet.species}</span>
                 <span>•</span>
                 <span>{selectedAgendamento?.pet.breed}</span>
                 <span>•</span>
                 <span>{selectedAgendamento?.pet.age}</span>
               </div>
             </div>
           </div>

           {/* Detalhes do Agendamento */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Procedimento</label>
                 <p className="font-semibold text-gray-900">{selectedAgendamento?.tipo}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Horário</label>
                 <div className="flex items-center gap-2 font-semibold text-gray-900">
                   <Clock size={16} className="text-gray-400"/> 
                   {selectedAgendamento?.hora}
                 </div>
              </div>
           </div>

           <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <label className="text-xs font-bold text-blue-400 uppercase block mb-1">Motivo / Queixa Principal</label>
             <p className="text-blue-900 text-sm leading-relaxed">{selectedAgendamento?.observacoes || 'Nenhuma observação registrada.'}</p>
           </div>

           {/* Ações Principais do Médico */}
           <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
             <button 
               onClick={handleIniciarAtendimento}
               className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
             >
               <Play size={20} fill="currentColor" />
               Iniciar Atendimento
             </button>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={handleVerProntuario}
                 className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
               >
                 <FileText size={18} />
                 Ver Prontuário
               </button>
               <button 
                 className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
               >
                 <ClipboardList size={18} />
                 Preencher Ficha
               </button>
             </div>
           </div>
        </div>
      </ViewModal>
    </div>
  );
}