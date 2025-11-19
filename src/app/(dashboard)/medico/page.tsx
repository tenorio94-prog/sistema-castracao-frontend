// app/medico/dashboard/page.tsx

import React from 'react';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import { Stethoscope, CheckCircle, Users, CalendarCheck, Dog } from 'lucide-react';
import CardAgendamento from '@/components/Dashboard/CardAgendamento';

// --- Mock Data ---
const mockAppointments = [
  {
    id: 1,
    time: '09:00',
    petName: 'Luna',
    service: 'Cirurgia - Felino',
    details: 'Castração eletiva - Em preparação pré-operatória',
    status: 'Castração',
    statusVariant: 'yellow' as const, 
  },
  {
    id: 2,
    time: '09:30',
    petName: 'Thor',
    service: 'Consulta - Canino',
    details: 'Vacinação anual e check-up',
    status: 'Consulta',
    statusVariant: 'blue' as const,
  },
  {
    id: 3,
    time: '10:00',
    petName: 'Simba',
    service: 'Retorno - Felino',
    details: 'Revisão pós-operatória',
    status: 'Retorno',
    statusVariant: 'gray' as const,
  },
];
// ----------------------------------------------

/** Botão de Ação Padrão (Reutilizado) */
const ActionButton = ({ children, className = 'bg-green-700 hover:bg-green-800' }: { children: React.ReactNode, className?: string }) => (
  <button className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}>
    {children}
  </button>
);


export default function MedicoDashboardPage() {
  return (
    <>
      {/* SEÇÃO 1: Cabeçalho */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-green-700">Dashboard Médico</h1>
        <p className="text-gray-600 mt-1">Bem-vindo(a) ao sistema de gestão hospitalar</p> 
      </header>

      {/* SEÇÃO 2: Indicadores de Hoje */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Seus Indicadores de Hoje</h2>
        
        <div className="flex flex-wrap gap-6">
          <CardBaseDash
            title="Animais Agendados"
            value={mockAppointments.length} 
            subtitle="Aguardando seu atendimento"
            icon={Dog}
          />
          <CardBaseDash
            title="Cirurgias Agendadas"
            value={mockAppointments.filter(a => a.service.includes('Cirurgia')).length}
            subtitle="Cirurgias para hoje"
            icon={Stethoscope}
          />
          <CardBaseDash
            title="Atendimentos Realizados"
            value="0" 
            subtitle="Realizados por você hoje"
            icon={CheckCircle}
          />
          
        </div>
      </section>

      {/* SEÇÃO 3: Próximos Atendimentos */}
      <section>
        {/* Cabeçalho da Seção */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">Próximos Atendimentos</h2>
            <p className="text-gray-600 mt-1">Sua fila de pacientes programados</p>
          </div>
          
          {/* * * AQUI ESTÁ A MUDANÇA:
            * O botão foi substituído para ser idêntico ao "Novo Agendamento".
          */}
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700 transition-colors">
            Novo Agendamento
          </button>
          
        </div>

        {/* Lista de Atendimentos */}
        <div className="space-y-4">
          {mockAppointments.map((appt) => (
            <CardAgendamento
              key={appt.id}
              time={appt.time}
              petName={appt.petName}
              service={appt.service}
              details={appt.details}
              status={appt.status}
              statusVariant={appt.statusVariant}
            >
              {/* Botões do Médico (agora verdes e com novo texto) */}
              <ActionButton>
                Ver Prontuário
              </ActionButton>
              
              <ActionButton>
                Preencher Ficha
              </ActionButton>
              
            </CardAgendamento>
          ))}
        </div>
      </section>
    </>
  );
}