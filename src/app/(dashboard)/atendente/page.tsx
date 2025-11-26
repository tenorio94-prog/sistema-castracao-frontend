// app/atendente/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, Activity, Plus } from 'lucide-react';
import { toast } from 'sonner';

import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import AgendamentoCard, { Agendamento, Pet, Responsavel } from '@/components/AtendenteComponents/AgendamentoCard';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CadastroModal from '@/components/modals/CadastroModal';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';

import { 
  AppointmentService, 
  AppointmentStatus, 
  ServiceType, 
  STATUS_LABELS, 
  SERVICE_TYPE_LABELS 
} from '@/services/appointment.service';
import { AnimalService, Species, Gender, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';
import { PetOwnerService } from '@/services/petowner.service';
import { UserService } from '@/services/user.service';

// ---------- Helpers de data ----------
const hoje = new Date();
const hojeFormatado = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
// -------------------------------------

// ----- Formulário vazio -----
type AgendamentoForm = {
  animalId: string;
  startTime: string;
  endTime: string;
  serviceType: ServiceType;
  notes: string;
};
const emptyForm: AgendamentoForm = {
  animalId: '',
  startTime: '',
  endTime: '',
  serviceType: ServiceType.triage,
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
// ----------------------------------------------------------

export default function AtendenteDashboardPage() {
  // Estado único: lista completa de agendamentos
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState<AnimalOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Cache de usuários para evitar requisições duplicadas
  const [usersCache, setUsersCache] = useState<Map<number, { completeName: string }>>(new Map());

  // Estados dos modais
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // --- CARREGAMENTO DE DADOS ---
  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAll();
      
      const agendamentosUI: Agendamento[] = data.map(apt => {
        const dataObj = new Date(apt.startTime);
        const statusEnum = apt.status as AppointmentStatus;
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
      console.log('🔍 Iniciando busca de animais...');
      const animais = await AnimalService.getAll();
      console.log('📦 Animais recebidos do backend:', JSON.stringify(animais, null, 2));
      
      // Coletar userIds únicos que precisam ser buscados
      const userIdsToFetch = new Set<number>();
      const newCache = new Map(usersCache);
      
      animais.forEach((animal, index) => {
        console.log(`\n🐾 Animal ${index + 1}:`, {
          id: animal.id,
          name: animal.name,
          petOwnerId: animal.petOwnerId,
          petOwner: animal.petOwner,
          hasUser: !!animal.petOwner?.user,
          userId: animal.petOwner?.userId
        });
        
        if (animal.petOwner?.userId) {
          // Se não tem user aninhado e não está no cache, adiciona para buscar
          if (!animal.petOwner.user && !newCache.has(animal.petOwner.userId)) {
            console.log(`  ➕ Adicionando userId ${animal.petOwner.userId} para busca`);
            userIdsToFetch.add(animal.petOwner.userId);
          } else if (animal.petOwner.user) {
            console.log(`  ✅ Já tem user nested:`, animal.petOwner.user.completeName);
          } else {
            console.log(`  💾 Já está no cache:`, newCache.get(animal.petOwner.userId));
          }
        } else {
          console.log(`  ⚠️ Animal sem petOwner.userId`);
        }
      });
      
      console.log(`\n📊 Total de userIds para buscar: ${userIdsToFetch.size}`);
      console.log('UserIds:', Array.from(userIdsToFetch));
      
      // Buscar usuários em paralelo
      if (userIdsToFetch.size > 0) {
        console.log(`🔍 Buscando dados de ${userIdsToFetch.size} tutores via UserService...`);
        const userPromises = Array.from(userIdsToFetch).map(userId => 
          UserService.getById(userId)
            .then(user => {
              console.log(`  ✅ Usuário ${userId} encontrado:`, user.completeName);
              return { userId, completeName: user.completeName };
            })
            .catch(err => {
              console.error(`  ❌ Erro ao buscar usuário ${userId}:`, err);
              return { userId, completeName: 'Erro ao carregar' };
            })
        );
        
        const users = await Promise.all(userPromises);
        users.forEach(({ userId, completeName }) => {
          newCache.set(userId, { completeName });
        });
        
        setUsersCache(newCache);
        console.log('✅ Cache de tutores atualizado:', newCache.size, 'entradas');
        console.log('Cache completo:', Object.fromEntries(newCache));
      }
      
      // Formatar opções com dados do cache ou do backend
      console.log('\n🏗️ Montando opções de animais...');
      const opcoes: AnimalOption[] = animais.map((a, index) => {
        let ownerName = 'Tutor Desconhecido';
        
        if (a.petOwner) {
          // Prioridade 1: Dados aninhados do backend
          if (a.petOwner.user?.completeName) {
            ownerName = a.petOwner.user.completeName;
            console.log(`  ${index + 1}. ${a.name} - Tutor do backend nested: ${ownerName}`);
          }
          // Prioridade 2: Cache local
          else if (a.petOwner.userId && newCache.has(a.petOwner.userId)) {
            ownerName = newCache.get(a.petOwner.userId)!.completeName;
            console.log(`  ${index + 1}. ${a.name} - Tutor do cache (userId ${a.petOwner.userId}): ${ownerName}`);
          } else {
            console.log(`  ${index + 1}. ${a.name} - ⚠️ Tutor não encontrado (petOwnerId: ${a.petOwnerId}, userId: ${a.petOwner.userId})`);
          }
        } else {
          console.log(`  ${index + 1}. ${a.name} - ⚠️ Sem petOwner`);
        }
        
        return {
          id: a.id,
          name: a.name || 'Sem nome',
          petOwnerId: a.petOwnerId,
          ownerName,
          species: a.species
        };
      });
      
      console.log('\n✅ Opções finais de animais:', opcoes);
      setAnimaisDisponiveis(opcoes);
    } catch (error) {
      console.error('❌ Erro ao carregar animais:', error);
      toast.error('Erro ao carregar lista de animais.');
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    fetchAnimais();
  }, []);

  // Apenas agendamentos de HOJE aparecem na dashboard
  const agendamentosHoje = useMemo(
    () => agendamentos.filter(a => a.data === hojeFormatado),
    [agendamentos]
  );

  // ----- Handlers -----
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

      await AppointmentService.create({
        animalId: parseInt(formData.animalId),
        petOwnerId: animalSelecionado.petOwnerId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType: formData.serviceType,
        status: AppointmentStatus.scheduled,
        notes: formData.notes,
      });
      
      toast.success('Agendamento criado!');
      await fetchAgendamentos();
      handleCloseCadastro();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflito de horário!');
      } else {
        const msg = error.response?.data?.message || 'Erro ao criar agendamento.';
        toast.error(msg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader 
          title="Dashboard Atendente"
          description="Bem-vindo(a) ao sistema de gestão hospitalar"
        />
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <Calendar size={14} className="text-gray-400"/>
          <span>{hojeFormatado}</span>
        </div>
      </div>

      {/* Indicadores de Hoje */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardBaseDash
            title="Atendimentos Hoje"
            value={agendamentosHoje.filter(a => a.backendStatus === AppointmentStatus.scheduled).length}
            subtitle="Aguardando atendimento"
            icon={Calendar} // Passamos o componente Icon, não o elemento JSX
            color="blue"
            trend="Agenda do dia"
          />
          <CardBaseDash
            title="Cirurgias"
            value={agendamentosHoje.filter(a => a.backendServiceType === ServiceType.castrationSurgery).length}
            subtitle="Procedimentos cirúrgicos"
            icon={Activity}
            color="purple"
          />
          <CardBaseDash
            title="Finalizados"
            value={agendamentosHoje.filter(a => a.backendStatus === AppointmentStatus.completed).length}
            subtitle="Animais já atendidos"
            icon={CheckCircle}
            color="green"
          />
        </div>
      </section>

      {/* Atendimentos de Hoje */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Fila de Atendimento</h2>
            <p className="text-sm text-gray-500">Acompanhe o fluxo de pacientes em tempo real.</p>
          </div>
          
          <button
            onClick={handleNovoAgendamento}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium shadow-lg shadow-gray-200 hover:bg-gray-800 hover:shadow-xl transition-all transform active:scale-95"
          >
            <Plus size={16} />
            <span>Novo Agendamento</span>
          </button>
        </div>

        {/* Lista de Atendimentos com AgendamentoCard (apenas de hoje) */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {agendamentosHoje.length > 0 ? (
              agendamentosHoje.map((appt) => (
                <AgendamentoCard
                  key={appt.id}
                  agendamento={appt}
                  onVerDetalhes={handleVerDetalhes}
                />
              ))
            ) : (
               <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                  <Calendar size={48} strokeWidth={1} />
                </div>
                <p className="text-gray-500 font-medium">Agenda livre por hoje</p>
                <p className="text-sm text-gray-400">Nenhum agendamento pendente.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Modais ---------- */}
      <CadastroModal
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSubmit={handleCreateSave}
        title="Novo Agendamento"
        saveText={loadingSubmit ? "Criando..." : "Criar Agendamento"}
      >
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-1">Animal*</label>
          <select
            id="animalId"
            name="animalId"
            value={formData.animalId}
            onChange={handleFormChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione o animal</option>
            {animaisDisponiveis.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.species === 'canine' ? 'Cão' : 'Gato'}) - {a.ownerName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atendimento*</label>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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