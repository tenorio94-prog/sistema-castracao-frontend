// app/atendente/agendamentos/page.tsx
"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';

// ---------- Mocks ----------
const mockPet1: Pet = { id: 101, name: 'Rex', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula' };
const mockPet2: Pet = { id: 102, name: 'Thor', species: 'Cachorro', breed: 'Golden', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Bruno Costa' };
const mockPet3: Pet = { id: 103, name: 'Nina', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Elisa Fernandes' };

const mockResp1: Responsavel = { id: 'r1', tipo: 'PF', nome: 'Ana Paula', cpf: '111.222.333-44', telefone: '(81) 99999-1111', email: 'ana@email.com', senha: '123', animais: ['Rex'] };
const mockResp2: Responsavel = { id: 'r2', tipo: 'PF', nome: 'Bruno Costa', cpf: '222.333.444-55', telefone: '(81) 99999-2222', email: 'bruno@email.com', senha: '123', animais: ['Thor'] };
const mockResp3: Responsavel = { id: 'r3', tipo: 'PF', nome: 'Elisa Fernandes', cpf: '333.444.555-66', telefone: '(81) 99999-3333', email: 'elisa@email.com', senha: '123', animais: ['Nina'] };

const mockAgendamentosIniciais: Agendamento[] = [
  { id: 1, petName: 'Rex', status: 'Pendente', data: '14/01/2025', hora: '09:00', tipo: 'Castração', pet: mockPet1, responsavel: mockResp1, observacoes: 'Animal dócil, sem restrições.' },
  { id: 2, petName: 'Thor', status: 'Pendente', data: '14/01/2025', hora: '09:30', tipo: 'Consulta', pet: mockPet2, responsavel: mockResp2, observacoes: '' },
  { id: 3, petName: 'Nina', status: 'Concluído', data: '14/01/2025', hora: '11:00', tipo: 'Castração', pet: mockPet3, responsavel: mockResp3, observacoes: 'Cirurgia tranquila.' },
  // agendamento futuro
  { id: 4, petName: 'Rex', status: 'Pendente', data: '25/12/2025', hora: '14:00', tipo: 'Consulta', pet: mockPet1, responsavel: mockResp1, observacoes: '' },
];

// ----- Tipos e estado inicial do formulário -----
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

export default function PaginaAgendamentos() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Estado único: TODOS os agendamentos (qualquer data)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(mockAgendamentosIniciais);

  // Estados dos modais
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);

  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // ----- Filtros de exibição (busca + status) -----
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const matchBusca = (ag.petName.toLowerCase().includes(busca.toLowerCase()) ||
                        ag.responsavel.nome.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus = () => {
      if (statusFiltro === '') return true;
      if (statusFiltro === 'Castração' || statusFiltro === 'Consulta') return ag.tipo === statusFiltro;
      if (statusFiltro === 'Concluído') return ag.status === statusFiltro;
      return false;
    };
    return matchBusca && matchStatus();
  });

  // ----- Handlers dos modais (iguais à dashboard) -----
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

  // ----- Cadastro -----
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
    { id: '101', nome: 'Rex (Ana Paula)' },
    { id: '102', nome: 'Thor (Bruno Costa)' },
    { id: '103', nome: 'Nina (Elisa Fernandes)' },
  ];
  const mockTiposAtendimento = [
    { id: '1', nome: 'Castração' },
    { id: '2', nome: 'Consulta' },
    { id: '3', nome: 'Retorno' },
  ];

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="flex flex-col gap-8 relative">
      <PageHeader
        title="Agendamentos"
        description="Gerencie os agendamentos do hospital"
        buttonLabel="Novo Agendamento"
        onButtonClick={handleNovoAgendamento}
      />

      <AgendamentoFilter
        busca={busca}
        onBuscaChange={setBusca}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Agendamentos</h2>
        <p className="text-sm text-gray-600">{agendamentosFiltrados.length} agendamento(s) encontrado(s)</p>

        {agendamentosFiltrados.length > 0 ? (
          <div className="flex flex-col gap-4">
            {agendamentosFiltrados.map(ag => (
              <AgendamentoCard
                key={ag.id}
                agendamento={ag}
                onVerDetalhes={handleVerDetalhes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>

      {/* ---------- Modais (iguais aos da dashboard) ---------- */}
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
    </div>
  );
}