"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarX, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';
import { AppointmentService, AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { AnimalService, Species, Gender, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

// --- TIPOS ---
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

type AnimalOption = { id: number; name: string; petOwnerId: number; ownerName: string; species: string; };

// --- FUNÇÃO AUXILIAR (A que estava faltando) ---
const formatIsoToInput = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Ajusta o fuso horário para exibir corretamente no input datetime-local
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

export default function PaginaAgendamentos() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<AnimalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAll();
      const agendamentosUI: Agendamento[] = data.map(apt => {
        const dataObj = new Date(apt.startTime);
        const statusEnum = apt.status as AppointmentStatus;
        const statusLabel = STATUS_LABELS[statusEnum] ?? apt.status;
        return {
          id: apt.id, backendId: apt.id, petName: apt.animal?.name || 'Nome indisponível',
          status: statusLabel as any, backendStatus: statusEnum,
          data: dataObj.toLocaleDateString('pt-BR'), hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tipo: apt.serviceType ? SERVICE_TYPE_LABELS[apt.serviceType] : 'N/A', backendServiceType: apt.serviceType || undefined,
          observacoes: apt.notes || '', startTime: apt.startTime, endTime: apt.endTime,
          pet: { id: apt.animal?.id || 0, name: apt.animal?.name || 'N/A', species: apt.animal?.species ? SPECIES_LABELS[apt.animal.species as Species] : 'N/A',
            breed: apt.animal?.breed || 'SRD', gender: apt.animal?.gender ? GENDER_LABELS[apt.animal.gender as Gender] : 'N/A',
            ownerName: apt.petOwner?.user?.completeName || 'N/A', age: '', weight: '' },
          responsavel: { id: apt.petOwner?.id?.toString() || '0', nome: apt.petOwner?.user?.completeName || 'N/A',
            cpf: apt.petOwner?.user?.cpf || 'N/A', telefone: apt.petOwner?.user?.phone || 'N/A',
            email: apt.petOwner?.user?.email || 'N/A', tipo: 'PF', animais: [], senha: '' },
        };
      });
      setAgendamentos(agendamentosUI);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimais = async () => {
    try {
      const animais = await AnimalService.getAll();
      const opcoes: AnimalOption[] = animais.map(a => ({
        id: a.id, name: a.name || 'Sem nome', petOwnerId: a.petOwnerId,
        ownerName: a.petOwner?.user?.completeName || 'Tutor Desconhecido', species: a.species
      }));
      setAnimaisDisponiveis(opcoes);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
    }
  };

  useEffect(() => { fetchAgendamentos(); fetchAnimais(); }, []);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter(ag => {
      const matchBusca = (ag.petName.toLowerCase().includes(busca.toLowerCase()) ||
                          ag.responsavel.nome.toLowerCase().includes(busca.toLowerCase()));
      const matchStatus = () => {
        if (statusFiltro === '') return true;
        if (statusFiltro === 'Castração' || statusFiltro === 'Consulta' || statusFiltro === 'Triagem') return ag.tipo === statusFiltro;
        return Object.values(STATUS_LABELS).includes(statusFiltro);
      };
      return matchBusca && (statusFiltro === '' ? true : matchStatus());
    });
  }, [agendamentos, busca, statusFiltro]);

  // Handlers
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
      await AppointmentService.update(id, { status: AppointmentStatus.completed });
      toast.success('Check-in realizado!');
      await fetchAgendamentos();
      handleCloseDetalhes();
    } catch (error) {
      toast.error('Erro ao realizar check-in.');
    }
  };

  const handleCancelAgendamento = async () => {
    const id = selectedAgendamento?.backendId;
    if (!id) return;
    if (!window.confirm(`Deletar agendamento de ${selectedAgendamento?.petName}?`)) return;
    try {
      await AppointmentService.delete(id);
      toast.success('Agendamento deletado.');
      await fetchAgendamentos();
      handleCloseDetalhes();
    } catch (error) {
      toast.error('Erro ao deletar agendamento.');
    }
  };

  const handleNovoAgendamento = () => {
    setFormData(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalCadastroOpen(true);
  };
  
  const handleCloseCadastro = () => { setIsModalCadastroOpen(false); setFormData(emptyForm); };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (!formData.animalId || !formData.startTime || !formData.endTime) {
        toast.warning('Preencha todos os campos obrigatórios.');
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
      const animalSelecionado = animaisDisponiveis.find(a => a.id === parseInt(formData.animalId));
      if (!animalSelecionado) throw new Error("Animal inválido");
      if (isEditing && editingId) {
        await AppointmentService.update(editingId, {
          startTime: startDate.toISOString(), endTime: endDate.toISOString(),
          serviceType: formData.serviceType, status: formData.status, notes: formData.notes,
        });
        toast.success('Agendamento atualizado!');
      } else {
        await AppointmentService.create({
          animalId: parseInt(formData.animalId), petOwnerId: animalSelecionado.petOwnerId,
          startTime: startDate.toISOString(), endTime: endDate.toISOString(),
          serviceType: formData.serviceType, status: formData.status, notes: formData.notes,
        });
        toast.success('Agendamento criado!');
      }
      await fetchAgendamentos();
      setIsModalCadastroOpen(false);
      setFormData(emptyForm);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflito de horário!');
      } else {
        const msg = error.response?.data?.message || 'Erro ao salvar.';
        toast.error(msg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpenEdit = (agendamento: Agendamento) => {
    const safeServiceType = (agendamento.backendServiceType as unknown as ServiceType) || ServiceType.triage;
    const safeStatus = (agendamento.backendStatus as unknown as AppointmentStatus) || AppointmentStatus.scheduled;

    // Agora a função existe neste escopo!
    setFormData({
      animalId: agendamento.pet.id.toString(),
      startTime: formatIsoToInput(agendamento.startTime || ''),
      endTime: formatIsoToInput(agendamento.endTime || ''),
      serviceType: safeServiceType,
      status: safeStatus,
      notes: agendamento.observacoes || '',
    });
    
    setIsEditing(true);
    setEditingId(agendamento.backendId || null);
    setIsModalCadastroOpen(true);
    handleCloseDetalhes();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader
          title="Gestão de Agendamentos"
          description="Consulte e gerencie todos os agendamentos do sistema."
        />
        
        <button 
          onClick={handleNovoAgendamento}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <AgendamentoFilter
        busca={busca}
        onBuscaChange={setBusca}
        statusFiltro={statusFiltro}
        onStatusChange={setStatusFiltro}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Todos os Agendamentos</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {agendamentosFiltrados.length} registros
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : agendamentosFiltrados.length > 0 ? (
          <div className="space-y-3">
            {agendamentosFiltrados.map(ag => (
              <AgendamentoCard
                key={ag.id}
                agendamento={ag}
                onVerDetalhes={handleVerDetalhes}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <CalendarX size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">Nenhum agendamento encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Tente ajustar os filtros de busca.</p>
          </div>
        )}
      </div>

      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSubmit={handleCreateSave}
        title={isEditing ? "Editar Agendamento" : "Novo Agendamento"}
        saveText={loadingSubmit ? "Salvando..." : (isEditing ? "Atualizar" : "Criar Agendamento")}
      >
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-1">Animal*</label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            required
            disabled={isEditing}
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">Selecione o animal</option>
            {animaisDisponiveis.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.species === 'canine' ? 'Cão' : 'Gato'}) - {a.ownerName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Início*</label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">Término*</label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Observações:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleFormChange}
            rows={4}
            placeholder="Adicione informações sobre o agendamento"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </CadastroModal>

      <ModalDetalhesAgendamento
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        agendamento={selectedAgendamento}
        onCheckIn={handleCheckIn}
        onCancelAgendamento={handleCancelAgendamento}
      >
        {selectedAgendamento && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end w-full">
               {/* BOTÃO CINZA + HOVER VERDE */}
               <button 
                 onClick={() => handleOpenEdit(selectedAgendamento)}
                 className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all w-full flex items-center justify-center gap-2 shadow-sm"
               >
                 <Edit3 size={16} />
                 Editar Agendamento
               </button>
            </div>
         )}
      </ModalDetalhesAgendamento>
    </div>
  );
}