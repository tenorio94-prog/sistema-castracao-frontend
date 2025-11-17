// app/atendente/agendamentos/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react';

// Importando os componentes
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import CadastroModal from '@/components/modals/CadastroModal'; 
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento'; 

// (Tipos e Mocks - sem alteração)
type AgendamentoForm = {
  animalId: string;
  tipoAtendimento: string;
  data: string;
  horario: string; 
  observacoes: string;
};

const mockPet1: Pet = { id: 101, name: 'Rex', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula' };
const mockPet2: Pet = { id: 102, name: 'Thor', species: 'Cachorro', breed: 'Golden', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Bruno Costa' };
const mockPet3: Pet = { id: 103, name: 'Nina', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Elisa Fernandes' };

const mockResp1: Responsavel = { id: 'r1', tipo: 'PF', nome: 'Ana Paula', cpf: '111.222.333-44', telefone: '(81) 99999-1111', email: 'ana@email.com', senha: '123', animais: ['Rex'] };
const mockResp2: Responsavel = { id: 'r2', tipo: 'PF', nome: 'Bruno Costa', cpf: '222.333.444-55', telefone: '(81) 99999-2222', email: 'bruno@email.com', senha: '123', animais: ['Thor'] };
const mockResp3: Responsavel = { id: 'r3', tipo: 'PF', nome: 'Elisa Fernandes', cpf: '333.444.555-66', telefone: '(81) 99999-3333', email: 'elisa@email.com', senha: '123', animais: ['Nina'] };

const listaDePetsMocados = [mockPet1, mockPet2, mockPet3];
const listaDeResponsaveisMocados = [mockResp1, mockResp2, mockResp3];

const mockAgendamentos: Agendamento[] = [
  { id: 1, petName: 'Rex', status: 'Pendente' as const, data: '14/01/2025', hora: '09:00', tipo: 'Castração', pet: mockPet1, responsavel: mockResp1, observacoes: 'Animal dócil, sem restrições.' },
  { id: 2, petName: 'Thor', status: 'Pendente' as const, data: '14/01/2025', hora: '09:30', tipo: 'Consulta', pet: mockPet2, responsavel: mockResp2, observacoes: '' },
  { id: 5, petName: 'Nina', status: 'Concluído' as const, data: '14/01/2025', hora: '11:00', tipo: 'Castração', pet: mockPet3, responsavel: mockResp3, observacoes: 'Cirurgia tranquila.' },
];

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

const emptyForm: AgendamentoForm = {
  animalId: '',
  tipoAtendimento: '',
  data: '',
  horario: '',
  observacoes: '',
};
// -------------------------------------------------------------

export default function PaginaAgendamentos() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  
  const [masterAgendamentos, setMasterAgendamentos] = useState<Agendamento[]>(mockAgendamentos);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>(mockAgendamentos);

  const [loading, setLoading] = useState(false); 
  
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // (useEffect - sem alteração)
  useEffect(() => {
    setLoading(true);
    const filtrados = masterAgendamentos.filter(ag => {
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
    
    setTimeout(() => {
      setAgendamentosFiltrados(filtrados);
      setLoading(false);
    }, 500);
  }, [busca, statusFiltro, masterAgendamentos]); 

  // (Handlers de Cadastro - sem alteração)
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { /* ... */ };
  const handleCloseCadastro = () => { /* ... */ };
  const handleCreateSave = async (e: React.FormEvent) => { /* ... */ };
  
  // --- Handlers para o Modal de Detalhes (ATUALIZADO) ---
  
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
    
    setMasterAgendamentos(prev => 
      prev.map(ag => 
        ag.id === selectedAgendamento.id ? { ...ag, status: 'Concluído' } : ag
      )
    );
    alert('Check-in realizado com sucesso!');
    handleCloseDetalhes(); 
  };

  // --- handleEdit REMOVIDO ---
  
  const handleCancelAgendamento = () => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      alert("Agendamento cancelado (simulação).");
      setMasterAgendamentos(prev => prev.filter(ag => ag.id !== selectedAgendamento?.id));
      handleCloseDetalhes();
    }
  };
  // ----------------------------------------------------

  return (
    <div className="flex flex-col gap-8 relative">
      
      {/* (PageHeader, AgendamentoFilter, Lista - sem alteração) */}
      <PageHeader 
        title="Agendamentos"
        description="Gerencie os agendamentos do hospital"
        buttonLabel="Novo Agendamento"
        onButtonClick={() => setIsModalCadastroOpen(true)}
      />
      <AgendamentoFilter
        busca={busca}
        onBuscaChange={setBusca}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
      />
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Agendamentos</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${agendamentosFiltrados.length} agendamento(s) encontrado(s)`}
        </p>
        
        {loading ? (
          <div className="text-center py-10"><p>Carregando...</p></div>
        ) : agendamentosFiltrados.length > 0 ? (
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

      {/* (Modal de Cadastro - sem alteração) */}
      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSubmit={handleCreateSave}
        title="Novo Agendamento"
        saveText="Criar Agendamento"
      >
        {/* (Campos do formulário) */}
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-1">
            Animal*
          </label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o animal</option>
            {mockAnimaisSelect.map(animal => (
              <option key={animal.id} value={animal.id}>{animal.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tipoAtendimento" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Atendimento*
          </label>
          <select
            id="tipoAtendimento"
            name="tipoAtendimento"
            value={formData.tipoAtendimento}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o tipo</option>
            {mockTiposAtendimento.map(tipo => (
              <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data*
            </label>
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
            <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-1">
              Horário*
            </label>
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
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações:
          </label>
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
      
      {/* --- Modal de Detalhes (ATUALIZADO) --- */}
      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        onCheckIn={handleCheckIn}
        // Prop 'onEdit' removida
        onCancelAgendamento={handleCancelAgendamento}
      />
    </div>
  );
}