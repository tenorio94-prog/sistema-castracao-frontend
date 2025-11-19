// app/responsavel/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';
import { Dog, Calendar, Zap, Plus, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';

// ---------- Mocks ----------
const mockUserName = 'Ana Paula';
const mockPet: Pet = { 
  id: 101, 
  name: 'Rex', 
  species: 'Cachorro', 
  breed: 'Labrador', 
  gender: 'Macho', 
  weight: '13kg', 
  age: '3 anos', 
  ownerName: mockUserName 
};

const mockResponsavel: Responsavel = { 
  id: 'r1', 
  tipo: 'PF', 
  nome: mockUserName, 
  cpf: '111.222.333-44', 
  telefone: '(81) 99999-1111', 
  email: 'ana@email.com', 
  senha: '123', 
  animais: ['Rex', 'Mel'] 
};

const mockProximasConsultas: Agendamento[] = [
  { id: 1, petName: 'Rex', status: 'Pendente', data: '2025-11-20', hora: '14:30', tipo: 'Consulta Rotina', pet: mockPet, responsavel: mockResponsavel, observacoes: 'Vacinação anual' },
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

  // Loading inicial simulado
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Cabeçalho e Ação Principal */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader
          title={`Olá, ${mockUserName.split(' ')[0]}`}
          description="Gerencie a saúde dos seus pets em um só lugar."
        />
        
        {/* Botão de Ação Estilizado (igual ao do Atendente) */}
        <button
          onClick={handleNovaConsulta}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium shadow-lg shadow-gray-200 hover:bg-gray-800 hover:shadow-xl transition-all transform active:scale-95"
        >
          <Plus size={16} />
          <span>Solicitar Consulta</span>
        </button>
      </div>

      {/* Indicadores (Cards Renovados) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash
          title="Meus Pets"
          value={mockResponsavel.animais.length}
          subtitle="Animais cadastrados"
          icon={Dog} // Passando a referência do componente, não o JSX
          color="indigo"
        />
        <CardBaseDash
          title="Consultas Futuras"
          value={agendamentos.length}
          subtitle="Agendamentos confirmados"
          icon={Calendar}
          color="blue"
          trend="Próxima: 20/11"
        />
        <CardBaseDash
          title="Status da Conta"
          value="Ativo"
          subtitle="Tudo certo com seu cadastro"
          icon={Activity} // Troquei Zap por Activity para ficar mais profissional
          color="green"
        />
      </section>

      {/* Lista de Próximas Consultas */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Próximas Consultas</h2>
            <p className="text-sm text-gray-500">Acompanhe os agendamentos dos seus animais.</p>
          </div>
        </div>

        <div className="space-y-3">
          {agendamentos.length > 0 ? (
            agendamentos.map(ag => (
              <AgendamentoCard
                key={ag.id}
                agendamento={ag}
                onVerDetalhes={handleVerDetalhes}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Nenhuma consulta agendada</p>
              <button 
                onClick={handleNovaConsulta}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                Agendar agora
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes */}
      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        // Responsável não faz Check-in, então passamos funções vazias ou alertas
        onCheckIn={() => {}} 
        onCancelAgendamento={() => alert('Entre em contato com a clínica para cancelar.')}
      />
    </div>
  );
}