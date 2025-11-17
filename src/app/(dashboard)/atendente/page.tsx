import React from 'react';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import AppointmentCard from '@/components/Dashboard/CardAgendamento'; 
import { Calendar, CheckCircle, Dog, Cross} from 'lucide-react'; 


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


const ActionButton = ({ children, className = 'bg-green-700 hover:bg-green-800' }: { children: React.ReactNode, className?: string }) => (
  <button className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}>
    {children}
  </button>
);


export default function AtendenteDashboardPage() {
  return (
    <>
      {/* SEÇÃO 1: Cabeçalho */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Atendente</h1>
        <p className="text-gray-600 mt-1">Bem-vindo(a) ao sistema de gestão hospitalar</p>
      </header>

      {/* SEÇÃO 2: Indicadores de Hoje */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Indicadores de Hoje</h2>
        <div className="flex flex-wrap gap-6">
          <CardBaseDash
            title="Atendimentos Pendentes do Dia"
            value={mockAppointments.length} 
            subtitle="Agendamentos para hoje"
            icon={<Calendar size={24} />}
          />
          <CardBaseDash
            title="Cirurgias Pendentes"
            value="0" 
            subtitle="Concluídos hoje"
            icon={<Cross size={24} />}
          />
          <CardBaseDash
            title="Animais Atendidos"
            value="0" 
            subtitle="Total de atendimentos hoje"
            icon={<CheckCircle size={24} />}
          />
        </div>
      </section>

      {/* SEÇÃO 3: Atendimentos Hoje */}
      <section>
        {/* Cabeçalho da Seção de Atendimentos */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">Atendimentos de Hoje</h2>
            <p className="text-gray-600 mt-1">Sua agenda de consultas, cirurgias e retornos programados</p>
          </div>
          {/* Este é o botão de referência (bg-green-600) */}
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700 transition-colors">
            Novo Agendamento
          </button>
        </div>

        {/* 2. Lista de Atendimentos */}
        <div className="space-y-4">
          {mockAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              time={appt.time}
              petName={appt.petName}
              service={appt.service}
              details={appt.details}
              status={appt.status}
              statusVariant={appt.statusVariant}
            >
              {/* Estes botões agora usarão o padrão (bg-green-700) */}
              <ActionButton>Ver Prontuário</ActionButton>
              <ActionButton>Preencher Ficha</ActionButton>
            </AppointmentCard>
          ))}
        </div>
      </section>
    </>
  );
}