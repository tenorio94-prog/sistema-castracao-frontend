"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';

import { 
  AppointmentService, 
  AppointmentStatus, 
  ServiceType, 
  STATUS_LABELS, 
  SERVICE_TYPE_LABELS,
  Appointment 
} from '@/services/appointment.service';
import { AnimalService, Species, Gender, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';
import { PetOwnerService } from '@/services/petowner.service';
import { UserService } from '@/services/user.service';

// --- TIPOS E CONSTANTES ---

type AgendamentoForm = {
  animalId: string;
  startTime: string; 
  endTime: string;   
  serviceType: ServiceType;
  status: AppointmentStatus;
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

type AnimalOption = {
  id: number;
  name: string;
  petOwnerId: number;
  ownerName: string;
  species: string;
};

const formatIsoToInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

export default function PaginaAgendamentosAdm() {
  // --- ESTADOS ---
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  
  const [masterAgendamentos, setMasterAgendamentos] = useState<Agendamento[]>([]);
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<AnimalOption[]>([]);
  
  // Cache de usuários para evitar requisições duplicadas
  const [usersCache, setUsersCache] = useState<Map<number, { completeName: string }>>(new Map());
  
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  // Modal Cadastro/Edição
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  
  // Modal Detalhes
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // --- CARREGAMENTO DE DADOS ---

  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAll();
      
      const agendamentosUI: Agendamento[] = data.map(apt => {
        const dataObj = new Date(apt.startTime);
        
        // CORREÇÃO DO ERRO DE INDEX TYPE
        // 1. Forçamos o cast para o Enum
        const statusEnum = apt.status as AppointmentStatus;
        // 2. Usamos nullish coalescing (??) para fallback seguro se o enum não existir no objeto
        const statusLabel = STATUS_LABELS[statusEnum] ?? apt.status;
        
        return {
          id: apt.id,
          backendId: apt.id,
          petName: apt.animal?.name || 'Nome indisponível',
          status: statusLabel as any,
          backendStatus: statusEnum,
          data: dataObj.toLocaleDateString('pt-BR'),
          hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tipo: apt.serviceType ? SERVICE_TYPE_LABELS[apt.serviceType] : 'N/A',
          backendServiceType: apt.serviceType || undefined,
          observacoes: apt.notes || '',
          startTime: apt.startTime,
          endTime: apt.endTime,
          
          pet: {
            id: apt.animal?.id || 0,
            name: apt.animal?.name || 'N/A',
            species: apt.animal?.species ? SPECIES_LABELS[apt.animal.species as Species] : 'N/A',
            breed: apt.animal?.breed || 'SRD',
            gender: apt.animal?.gender ? GENDER_LABELS[apt.animal.gender as Gender] : 'N/A',
            ownerName: apt.petOwner?.user?.completeName || 'N/A',
            age: '', weight: ''
          },
          responsavel: {
            id: apt.petOwner?.id?.toString() || '0',
            nome: apt.petOwner?.user?.completeName || 'N/A',
            cpf: apt.petOwner?.user?.cpf || 'N/A',
            telefone: apt.petOwner?.user?.phone || 'N/A',
            email: apt.petOwner?.user?.email || 'N/A',
            tipo: 'PF', animais: [], senha: ''
          },
        };
      });
      
      setMasterAgendamentos(agendamentosUI);
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível carregar a lista de agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimais = async () => {
    try {
      const animais = await AnimalService.getAll();
      
      // Coletar userIds únicos que precisam ser buscados
      const userIdsToFetch = new Set<number>();
      const newCache = new Map(usersCache);
      
      animais.forEach(animal => {
        if (animal.petOwner?.userId) {
          // Se não tem user aninhado e não está no cache, adiciona para buscar
          if (!animal.petOwner.user && !newCache.has(animal.petOwner.userId)) {
            userIdsToFetch.add(animal.petOwner.userId);
          }
        }
      });
      
      // Buscar usuários em paralelo
      if (userIdsToFetch.size > 0) {
        console.log(`🔍 Buscando dados de ${userIdsToFetch.size} tutores via UserService...`);
        const userPromises = Array.from(userIdsToFetch).map(userId => 
          UserService.getById(userId)
            .then(user => ({ userId, completeName: user.completeName }))
            .catch(err => {
              console.error(`Erro ao buscar usuário ${userId}:`, err);
              return { userId, completeName: 'Erro ao carregar' };
            })
        );
        
        const users = await Promise.all(userPromises);
        users.forEach(({ userId, completeName }) => {
          newCache.set(userId, { completeName });
        });
        
        setUsersCache(newCache);
        console.log('✅ Cache de tutores atualizado:', newCache.size, 'entradas');
      }
      
      // Formatar opções com dados do cache ou do backend
      const opcoes: AnimalOption[] = animais.map(a => {
        let ownerName = 'Tutor Desconhecido';
        
        if (a.petOwner) {
          // Prioridade 1: Dados aninhados do backend
          if (a.petOwner.user?.completeName) {
            ownerName = a.petOwner.user.completeName;
          }
          // Prioridade 2: Cache local
          else if (a.petOwner.userId && newCache.has(a.petOwner.userId)) {
            ownerName = newCache.get(a.petOwner.userId)!.completeName;
          }
        }
        
        return {
          id: a.id,
          name: a.name || 'Sem nome',
          petOwnerId: a.petOwnerId,
          ownerName,
          species: a.species
        };
      });
      
      setAnimaisDisponiveis(opcoes);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      toast.error('Erro ao carregar lista de animais disponíveis.');
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    fetchAnimais();
  }, []);

  // --- FILTRAGEM ---
  
  const agendamentosFiltrados = useMemo(() => {
    return masterAgendamentos.filter(ag => {
      const termo = busca.toLowerCase();
      const matchBusca = 
        ag.petName.toLowerCase().includes(termo) || 
        ag.responsavel.nome.toLowerCase().includes(termo) ||
        ag.id.toString().includes(termo);

      const matchStatus = statusFiltro === '' || 
        (ag.backendStatus && STATUS_LABELS[ag.backendStatus as AppointmentStatus] === statusFiltro);
      
      return matchBusca && matchStatus;
    });
  }, [busca, statusFiltro, masterAgendamentos]);

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalCadastroOpen(true);
  };

  const handleOpenEdit = (agendamento: Agendamento) => {
    const safeServiceType = (agendamento.backendServiceType as unknown as ServiceType) || ServiceType.triage;
    const safeStatus = (agendamento.backendStatus as unknown as AppointmentStatus) || AppointmentStatus.scheduled;

    setFormData({
      animalId: agendamento.pet.id.toString(),
      startTime: formatIsoToInput(agendamento.startTime || ''),
      endTime: formatIsoToInput(agendamento.endTime || ''),
      serviceType: safeServiceType,
      status: safeStatus,
      notes: agendamento.observacoes || '',
    });
    
    setIsEditing(true);
    setEditingId(agendamento.backendId || null); // Garante null em vez de undefined
    setIsModalCadastroOpen(true);
    handleCloseDetalhes();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (!formData.animalId || !formData.startTime || !formData.endTime) {
        toast.warning('Preencha os campos obrigatórios: Animal, Início e Término.');
        setLoadingSubmit(false);
        return;
      }

      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);

      if (endDate <= startDate) {
        toast.warning('A data de término deve ser posterior à data de início.');
        setLoadingSubmit(false);
        return;
      }

      const payloadStart = startDate.toISOString();
      const payloadEnd = endDate.toISOString();

      const serviceTypeEnum = formData.serviceType as ServiceType;
      const statusEnum = formData.status as AppointmentStatus;

      if (isEditing && editingId) {
        await AppointmentService.update(editingId, {
          startTime: payloadStart,
          endTime: payloadEnd,
          serviceType: serviceTypeEnum,
          status: statusEnum,
          notes: formData.notes,
        });
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        const animalSelecionado = animaisDisponiveis.find(a => a.id === parseInt(formData.animalId));
        if (!animalSelecionado) throw new Error("Animal inválido");

        await AppointmentService.create({
          animalId: parseInt(formData.animalId),
          petOwnerId: animalSelecionado.petOwnerId,
          startTime: payloadStart,
          endTime: payloadEnd,
          serviceType: serviceTypeEnum,
          status: statusEnum,
          notes: formData.notes,
        });
        toast.success('Agendamento criado com sucesso!');
      }

      await fetchAgendamentos();
      setIsModalCadastroOpen(false);
      setFormData(emptyForm);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      if (error.response?.status === 409) {
        toast.error('Conflito de horário! Já existe um agendamento para este animal neste período.');
      } else {
        const msg = error.response?.data?.message || 'Erro ao salvar agendamento.';
        toast.error(msg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsModalDetalhesOpen(true);
  };

  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedAgendamento(null);
  };

  const handleCheckIn = async () => {
    const id = selectedAgendamento?.backendId;
    if (!id) return;

    try {
      await AppointmentService.update(id, {
        status: AppointmentStatus.completed,
      });
      toast.success('Status atualizado para Concluído!');
      await fetchAgendamentos();
      handleCloseDetalhes();
    } catch (error) {
      toast.error('Erro ao realizar check-in.');
    }
  };

  const handleDelete = async () => {
    const id = selectedAgendamento?.backendId;
    if (!id) return;

    if (!window.confirm(`Deletar agendamento de ${selectedAgendamento?.petName}? Esta ação é irreversível.`)) return;

    try {
      await AppointmentService.delete(id);
      toast.success('Agendamento deletado.');
      await fetchAgendamentos();
      handleCloseDetalhes();
    } catch (error) {
      toast.error('Erro ao deletar agendamento.');
    }
  };

  return (
    <div className="flex flex-col gap-8 relative max-w-7xl mx-auto">
      <CrudHeader 
        title="Gerenciar Agendamentos"
        description="Visualize e controle a agenda da clínica veterinária."
        buttonText="Novo Agendamento"
        onButtonClick={handleOpenCreate}
      />

      <AgendamentoFilter
        busca={busca}
        onBuscaChange={setBusca}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
      />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
           <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
             <CalendarClock size={24} className="text-blue-600"/>
             Lista de Agendamentos
           </h2>
           <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
             {agendamentosFiltrados.length} registros
           </span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : agendamentosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {agendamentosFiltrados.map(ag => (
              <AgendamentoCard 
                key={ag.id} 
                agendamento={ag}
                onVerDetalhes={handleVerDetalhes} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 font-medium">Nenhum agendamento encontrado com os filtros atuais.</p>
          </div>
        )}
      </div>

      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={() => { setIsModalCadastroOpen(false); setFormData(emptyForm); }}
        onSubmit={handleSave}
        title={isEditing ? "Editar Agendamento" : "Novo Agendamento"}
        saveText={loadingSubmit ? "Salvando..." : (isEditing ? "Atualizar" : "Agendar")}
      >
        <div>
          <label htmlFor="animalId" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
            Animal e Tutor *
          </label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            required
            disabled={isEditing}
            className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">Selecione o animal...</option>
            {animaisDisponiveis.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.name} ({animal.species === 'canine' ? 'Cão' : 'Gato'}) - Tutor: {animal.ownerName}
              </option>
            ))}
          </select>
          {isEditing && <p className="text-xs text-gray-400 mt-1">O animal não pode ser alterado na edição.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="serviceType" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Tipo de Serviço
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Status Atual
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Início *
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Término *
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs font-bold text-gray-700 mb-1 uppercase">
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleFormChange}
            rows={3}
            placeholder="Detalhes clínicos ou observações do tutor..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </CadastroModal>
      
      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        onCheckIn={handleCheckIn}
        onCancelAgendamento={handleDelete} 
      >
         {selectedAgendamento && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end w-full">
               <button 
                 onClick={() => handleOpenEdit(selectedAgendamento)}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full"
               >
                 Editar Agendamento
               </button>
            </div>
         )}
      </ModalDetalhesAgendamento>
    </div>
  );
}