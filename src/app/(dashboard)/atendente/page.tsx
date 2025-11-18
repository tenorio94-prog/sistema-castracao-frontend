// app/atendente/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';
import { Calendar, CheckCircle, Cross, Plus } from 'lucide-react';

// ---------- Helpers de data ----------
const hoje = new Date();
const hojeFormatado = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
// -------------------------------------

// ----- Mocks alinhados aos tipos existentes -----
const mockPet1: Pet = { id: 101, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Ana Paula' };
const mockPet2: Pet = { id: 102, name: 'Thor', species: 'Cachorro', breed: 'Golden', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Bruno Costa' };
const mockPet3: Pet = { id: 103, name: 'Simba', species: 'Gato', breed: 'Persa', gender: 'Macho', weight: '4kg', age: '3 anos', ownerName: 'Carla Dias' };

const mockResp1: Responsavel = { id: 'r1', tipo: 'PF', nome: 'Ana Paula', cpf: '111.222.333-44', telefone: '(81) 99999-1111', email: 'ana@email.com', senha: '123', animais: ['Luna'] };
const mockResp2: Responsavel = { id: 'r2', tipo: 'PF', nome: 'Bruno Costa', cpf: '222.333.444-55', telefone: '(81) 99999-2222', email: 'bruno@email.com', senha: '123', animais: ['Thor'] };
const mockResp3: Responsavel = { id: 'r3', tipo: 'PF', nome: 'Carla Dias', cpf: '333.444.555-66', telefone: '(81) 99999-3333', email: 'carla@email.com', senha: '123', animais: ['Simba'] };

const mockAgendamentosIniciais: Agendamento[] = [
  { id: 1, petName: 'Luna', status: 'Pendente', data: hojeFormatado, hora: '09:00', tipo: 'Castração', pet: mockPet1, responsavel: mockResp1, observacoes: 'Animal dócil, sem restrições.' },
  { id: 2, petName: 'Thor', status: 'Pendente', data: hojeFormatado, hora: '09:30', tipo: 'Consulta', pet: mockPet2, responsavel: mockResp2, observacoes: '' },
  { id: 3, petName: 'Simba', status: 'Concluído', data: hojeFormatado, hora: '10:00', tipo: 'Retorno', pet: mockPet3, responsavel: mockResp3, observacoes: 'Revisão pós-operatória' },
  // Agendamento futuro (não deve aparecer na dashboard hoje)
  { id: 4, petName: 'Rex', status: 'Pendente', data: '25/12/2025', hora: '14:00', tipo: 'Consulta', pet: { id: 104, name: 'Rex', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Elisa Fernandes' }, responsavel: { id: 'r4', tipo: 'PF', nome: 'Elisa Fernandes', cpf: '444.555.666-77', telefone: '(81) 99999-4444', email: 'elisa@email.com', senha: '123', animais: ['Rex'] }, observacoes: '' },
];
// ---------------------------------------------

// ----- Formulário vazio (mesmo da tela de agendamentos) -----
type AgendamentoForm = {
  animalId: string;
  tipoAtendimento: string;
  data: string;
  horario: string;
  observacoes: string;
};
const emptyForm: AgendamentoForm = {
  animalId: '',
  tipoAtendimento: '',
  data: '',
  horario: '',
  observacoes: '',
};
// ----------------------------------------------------------

export default function AtendenteDashboardPage() {
  // Estado único: lista completa de agendamentos
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentosIniciais);

  // Estados dos modais (iguais à tela de agendamentos)
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // Apenas agendamentos de HOJE aparecem na dashboard
  const agendamentosHoje = useMemo(
    () => agendamentos.filter(a => a.data === hojeFormatado),
    [agendamentos]
  );

  // ----- Handlers (iguais à tela de agendamentos) -----
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsModalDetalhesOpen(true);
  };

  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedAgendamento(null);
  };

  const handleCheckIn = () => {
    if (!selectedAgendamento) return;
    setAgendamentos(prev =>
      prev.map(ag =>
        ag.id === selectedAgendamento.id ? { ...ag, status: 'Concluído' } : ag
      )
    );
    alert('Check-in realizado com sucesso!');
    handleCloseDetalhes();
  };

  const handleCancelAgendamento = () => {
    if (!selectedAgendamento) return;
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      setAgendamentos(prev => prev.filter(ag => ag.id !== selectedAgendamento.id));
      alert('Agendamento cancelado (simulação).');
      handleCloseDetalhes();
    }
  };
  // ----------------------------------------------------

  // ----- Cadastro (modal igual da tela de agendamentos) -----
  const handleNovoAgendamento = () => setIsModalCadastroOpen(true);

  const handleCloseCadastro = () => {
    setIsModalCadastroOpen(false);
    setFormData(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const mockAnimaisSelect = [
    { id: '101', nome: 'Luna (Ana Paula)' },
    { id: '102', nome: 'Thor (Bruno Costa)' },
    { id: '103', nome: 'Simba (Carla Dias)' },
    { id: '104', nome: 'Rex (Elisa Fernandes)' },
  ];
  const mockTiposAtendimento = [
    { id: '1', nome: 'Castração' },
    { id: '2', nome: 'Consulta' },
    { id: '3', nome: 'Retorno' },
  ];

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // Formata data escolhida pelo usuário para DD/MM/AAAA
    const dataFormatada = formData.data.split('-').reverse().join('/');
    const novo: Agendamento = {
      id: Date.now(),
      petName: mockAnimaisSelect.find(a => a.id === formData.animalId)?.nome.split(' ')[0] || '',
      status: 'Pendente',
      data: dataFormatada,
      hora: formData.horario,
      tipo: formData.tipoAtendimento,
      observacoes: formData.observacoes,
      pet: mockPet1, // mock simples
      responsavel: mockResp1, // mock simples
    };
    setAgendamentos(prev => [novo, ...prev]);
    alert('Agendamento criado!');
    handleCloseCadastro();
  };
  // ----------------------------------------------------

  return (
    <>
      {/* Cabeçalho */}
      <PageHeader 
        title="Dashboard Atendente"
        description="Bem-vindo(a) ao sistema de gestão hospitalar"
      />

      {/* Indicadores de Hoje */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Indicadores de Hoje</h2>
        <div className="flex flex-wrap gap-6">
          <CardBaseDash
            title="Atendimentos Pendentes do Dia"
            value={agendamentosHoje.filter(a => a.status === 'Pendente').length}
            subtitle="Agendamentos para hoje"
            icon={<Calendar size={24} />}
          />
          <CardBaseDash
            title="Cirurgias Pendentes"
            value={agendamentosHoje.filter(a => a.tipo === 'Castração' && a.status === 'Pendente').length}
            subtitle="Concluídos hoje"
            icon={<Cross size={24} />}
          />
          <CardBaseDash
            title="Animais Atendidos"
            value={agendamentosHoje.filter(a => a.status === 'Concluído').length}
            subtitle="Total de atendimentos hoje"
            icon={<CheckCircle size={24} />}
          />
        </div>
      </section>

      {/* Atendimentos de Hoje */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">Atendimentos de Hoje</h2>
            <p className="text-gray-600 mt-1">Sua agenda de consultas, cirurgias e retornos programados</p>
          </div>
          <button
            onClick={handleNovoAgendamento}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            <span>Novo Agendamento</span>
          </button>
        </div>

        {/* Lista de Atendimentos com AgendamentoCard (apenas de hoje) */}
        <div className="flex flex-col gap-4">
          {agendamentosHoje.length > 0 ? (
            agendamentosHoje.map((appt) => (
              <AgendamentoCard
                key={appt.id}
                agendamento={appt}
                onVerDetalhes={handleVerDetalhes}
              />
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">Nenhum agendamento para hoje.</p>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Modais (iguais aos da tela de agendamentos) ---------- */}
      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSubmit={handleCreateSave}
        title="Novo Agendamento"
        saveText="Criar Agendamento"
      >
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-1">Animal*</label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o animal</option>
            {mockAnimaisSelect.map(a => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoAtendimento" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atendimento*</label>
          <select
            id="tipoAtendimento"
            name="tipoAtendimento"
            value={formData.tipoAtendimento}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o tipo</option>
            {mockTiposAtendimento.map(t => (
              <option key={t.id} value={t.nome}>{t.nome}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data*</label>
            <input
              id="data"
              name="data"
              type="date"
              value={formData.data}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-1">Horário*</label>
            <input
              id="horario"
              name="horario"
              type="time"
              value={formData.horario}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">Observações:</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleFormChange}
            rows={4}
            placeholder="Adicione informações sobre o agendamento"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </CadastroModal>

      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        onCheckIn={handleCheckIn}
        onCancelAgendamento={handleCancelAgendamento}
      />
    </>
  );
}