// app/responsavel/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';
import { Dog, Calendar, Zap, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';


// ---------- Mocks ----------
const mockUserName = 'Ana Paula';
const mockPet: Pet = { id: 101, name: 'Rex', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: mockUserName };
const mockResponsavel: Responsavel = { id: 'r1', tipo: 'PF', nome: mockUserName, cpf: '111.222.333-44', telefone: '(81) 99999-1111', email: 'ana@email.com', senha: '123', animais: ['Rex', 'Mel'] };

const mockProximasConsultas: Agendamento[] = [
  { id: 1, petName: 'Rex', status: 'Confirmado', data: '2025-11-20', hora: '14:30', tipo: 'Consulta Rotina', pet: mockPet, responsavel: mockResponsavel, observacoes: 'Vacinação anual' },
  { id: 2, petName: 'Mel', status: 'Pendente', data: '2025-12-05', hora: '10:00', tipo: 'Castração', pet: mockPet, responsavel: mockResponsavel, observacoes: 'Cirurgia eletiva' },
];
// ----------------------------

export default function ResponsavelDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockProximasConsultas);

  // Estados dos modais
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // Loading inicial
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Handlers
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsModalDetalhesOpen(true);
  };

  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedAgendamento(null);
  };

  const handleNovaConsulta = () => {
    router.push('/responsavel/agendar');
  };

  if (loading) return <div className="text-center py-10 text-gray-600">Carregando painel...</div>;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Bem-vindo(a), ${mockUserName.split(' ')[0]}!`}
        description="Gerencie seus animais e consultas pelo painel."
        buttonLabel="+ Nova Consulta"
        onButtonClick={handleNovaConsulta}
      />

      {/* Indicadores */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash
          title="Animais Cadastrados"
          value={mockResponsavel.animais.length}
          subtitle="Total de pets"
          icon={<Dog size={24} />}
        />
        <CardBaseDash
          title="Consultas Agendadas"
          value={agendamentos.length}
          subtitle="Próximas consultas"
          icon={<Calendar size={24} />}
        />
        <CardBaseDash
          title="Ações Rápidas"
          value=""
          subtitle="Agendar nova consulta"
          icon={<Zap size={24} />}
        />
      </section>

      {/* Próximas Consultas */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Próximas Consultas</h2>
        <div className="flex flex-col gap-4">
          {agendamentos.map(ag => (
            <AgendamentoCard
              key={ag.id}
              agendamento={ag}
              onVerDetalhes={handleVerDetalhes}
            />
          ))}
        </div>
      </section>

      {/* Modal de Detalhes */}
      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        onCheckIn={() => alert('Check-in não permitido para responsável')}
        onCancelAgendamento={() => alert('Cancelamento não permitido para responsável')}
      />
    </div>
  );
}