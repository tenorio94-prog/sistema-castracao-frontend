// app/(dashboard)/adm/agendamentos/page.tsx
"use client"; 

import React, { useState, useEffect } from 'react';

import CrudHeader from '@/components/CRUD/CrudHeader'; 
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import CadastroModal from '@/components/modals/CadastroModal'; 
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento'; 

import { AppointmentService, AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { AnimalService, Gender, Species } from '@/services/animal.service';
import { PetOwnerService } from '@/services/petowner.service';

// Mapeamentos para exibição
const speciesLabels: Record<Species, string> = {
  [Species.dog]: 'Cachorro',
  [Species.cat]: 'Gato',
};

const genderLabels: Record<Gender, string> = {
  [Gender.male]: 'Macho',
  [Gender.female]: 'Fêmea',
};

type AgendamentoForm = {
  animalId: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  status: string;
  notes: string;
};

const emptyForm: AgendamentoForm = {
  animalId: '',
  startTime: '',
  endTime: '',
  serviceType: ServiceType.triage,
  status: AppointmentStatus.scheduled,
  notes: '',
};

export default function PaginaAgendamentosAdm() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  
  const [masterAgendamentos, setMasterAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([]);

  const [loading, setLoading] = useState(false); 
  
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<Array<{ id: number; name: string; petOwnerId: number; ownerName: string }>>([]);
  
  // Carregar agendamentos do backend
  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAll();
      const agendamentosUI: Agendamento[] = data.map(apt => {
        const dataObj = new Date(apt.startTime);
        const endTimeObj = new Date(apt.endTime);
        
        return {
          id: apt.id,
          petName: apt.animal?.name || 'N/A',
          status: STATUS_LABELS[apt.status] as any,
          data: dataObj.toLocaleDateString('pt-BR'),
          hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tipo: apt.serviceType ? SERVICE_TYPE_LABELS[apt.serviceType] : 'N/A',
          pet: {
            id: apt.animal?.id || 0,
            name: apt.animal?.name || 'N/A',
            species: apt.animal?.species ? speciesLabels[apt.animal.species as Species] : 'N/A',
            breed: apt.animal?.breed || 'N/A',
            gender: apt.animal?.gender ? genderLabels[apt.animal.gender as Gender] : 'N/A',
            weight: 'N/A',
            age: 'N/A',
            ownerName: apt.petOwner?.user?.completeName || 'N/A',
          },
          responsavel: {
            id: apt.petOwner?.id?.toString() || '0',
            tipo: 'PF',
            nome: apt.petOwner?.user?.completeName || 'N/A',
            cpf: apt.petOwner?.user?.cpf || 'N/A',
            telefone: apt.petOwner?.user?.phone || 'N/A',
            email: apt.petOwner?.user?.email || 'N/A',
            senha: '',
            animais: [],
          },
          observacoes: apt.notes || '',
          backendId: apt.id,
          startTime: apt.startTime,
          endTime: apt.endTime,
          backendStatus: apt.status,
          backendServiceType: apt.serviceType || undefined,
        };
      });
      
      setMasterAgendamentos(agendamentosUI);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      alert('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  // Carregar animais disponíveis
  useEffect(() => {
    const fetchAnimais = async () => {
      try {
        const animais = await AnimalService.getAll();
        const animaisComDono = await Promise.all(
          animais.map(async (animal) => {
            try {
              const petOwner = await PetOwnerService.getById(animal.petOwnerId);
              return {
                id: animal.id,
                name: animal.name || 'Sem nome',
                petOwnerId: animal.petOwnerId,
                ownerName: petOwner.user?.completeName || 'Responsável não encontrado',
              };
            } catch {
              return {
                id: animal.id,
                name: animal.name || 'Sem nome',
                petOwnerId: animal.petOwnerId,
                ownerName: 'Responsável não encontrado',
              };
            }
          })
        );
        setAnimaisDisponiveis(animaisComDono);
      } catch (error) {
        console.error('Erro ao carregar animais:', error);
      }
    };

    fetchAnimais();
  }, []);

  // Filtrar agendamentos
  useEffect(() => {
    setLoading(true);
    const filtrados = masterAgendamentos.filter(ag => {
      const matchBusca = (ag.petName.toLowerCase().includes(busca.toLowerCase()) || 
                          ag.responsavel.nome.toLowerCase().includes(busca.toLowerCase())); 
      const matchStatus = () => {
        if (statusFiltro === '') return true; 
        // Filtrar por tipo de serviço
        if (statusFiltro === 'Triagem') return ag.tipo === 'Triagem';
        if (statusFiltro === 'Cirurgia de Castração') return ag.tipo === 'Cirurgia de Castração';
        if (statusFiltro === 'Pós-Operatório') return ag.tipo === 'Pós-Operatório';
        // Filtrar por status
        if (statusFiltro === 'Agendado') return ag.status === 'Agendado';
        if (statusFiltro === 'Confirmado') return ag.status === 'Confirmado';
        if (statusFiltro === 'Concluído') return ag.status === 'Concluído';
        if (statusFiltro === 'Cancelado') return ag.status === 'Cancelado';
        if (statusFiltro === 'Ausente') return ag.status === 'Ausente';
        return false;
      };
      return matchBusca && matchStatus();
    });
    
    setTimeout(() => {
      setAgendamentosFiltrados(filtrados);
      setLoading(false);
    }, 300);
  }, [busca, statusFiltro, masterAgendamentos]); 

  // Handlers de Cadastro
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseCadastro = () => {
    setIsModalCadastroOpen(false);
    setFormData(emptyForm);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalId || !formData.startTime || !formData.endTime) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate <= startDate) {
      alert('O horário de término deve ser posterior ao horário de início.');
      return;
    }

    const animalSelecionado = animaisDisponiveis.find(a => a.id === parseInt(formData.animalId));
    if (!animalSelecionado) {
      alert('Animal não encontrado.');
      return;
    }

    try {
      await AppointmentService.create({
        animalId: parseInt(formData.animalId),
        petOwnerId: animalSelecionado.petOwnerId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType: formData.serviceType as ServiceType,
        status: formData.status as AppointmentStatus,
        notes: formData.notes || undefined,
      });

      alert('Agendamento criado com sucesso!');
      await fetchAgendamentos();
      handleCloseCadastro();
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      alert(error.response?.data?.message || 'Erro ao criar agendamento. Tente novamente.');
    }
  };
  
  // Handlers de Detalhes
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento); 
    setIsModalDetalhesOpen(true); 
  };

  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedAgendamento(null);
  };

  const handleCheckIn = async () => {
    if (!selectedAgendamento || !selectedAgendamento.backendId) return;

    try {
      await AppointmentService.update(selectedAgendamento.backendId, {
        status: AppointmentStatus.completed,
      });

      alert('Check-in realizado com sucesso!');
      await fetchAgendamentos();
      handleCloseDetalhes();
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      alert('Erro ao fazer check-in. Tente novamente.');
    }
  };

  const handleCancelAgendamento = async () => {
    if (!selectedAgendamento || !selectedAgendamento.backendId) return;

    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await AppointmentService.delete(selectedAgendamento.backendId);
        alert("Agendamento cancelado com sucesso!");
        await fetchAgendamentos();
        handleCloseDetalhes();
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        alert('Erro ao cancelar agendamento. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      
      <CrudHeader 
        title="Gerenciar Agendamentos"
        buttonText="Novo Agendamento"
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

      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSubmit={handleCreateSave}
        title="Novo Agendamento"
        saveText="Criar Agendamento"
      >
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-1">
            Animal*
          </label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o animal</option>
            {animaisDisponiveis.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.name} ({animal.ownerName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Atendimento
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleFormChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Início*
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora de Término*
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
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
