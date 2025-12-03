"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, CalendarX, Edit3 } from 'lucide-react';

import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import ModalNovoAgendamentoAdm from '@/components/AdmComponents/ModalNovoAgendamentoAdm';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';

import { 
  AppointmentService, 
  AppointmentStatus, 
  ServiceType, 
  STATUS_LABELS, 
  SERVICE_TYPE_LABELS 
} from '@/services/appointment.service';

export default function AgendamentosSection() {
  // --- ESTADOS ---
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [masterAgendamentos, setMasterAgendamentos] = useState<Agendamento[]>([]);
  
  const [loading, setLoading] = useState(false);
  
  // Modais
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // --- LOADERS ---
  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const data = await AppointmentService.getAll();
      const agendamentosUI: Agendamento[] = data.map(apt => {
        const dataObj = new Date(apt.startTime);
        const statusEnum = apt.status as AppointmentStatus;
        return {
          id: apt.id,
          backendId: apt.id,
          petName: apt.animal?.name || 'Nome indisponível',
          status: (STATUS_LABELS[statusEnum] ?? apt.status) as any,
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
            species: 'Canina' as any,
            breed: apt.animal?.breed || 'SRD',
            gender: 'Macho' as any,
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
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  // --- HANDLERS ---
  const agendamentosFiltrados = useMemo(() => {
    return masterAgendamentos.filter(ag => {
      const termo = busca.toLowerCase();
      const matchBusca = ag.petName.toLowerCase().includes(termo) || ag.responsavel.nome.toLowerCase().includes(termo);
      const matchStatus = statusFiltro === '' || 
        (ag.backendStatus && STATUS_LABELS[ag.backendStatus as AppointmentStatus] === statusFiltro) ||
        (ag.tipo === statusFiltro) || (ag.status === statusFiltro);
      return matchBusca && matchStatus;
    });
  }, [busca, statusFiltro, masterAgendamentos]);

  const handleAgendamentoSuccess = () => {
    fetchAgendamentos();
  };

  const handleDelete = async () => {
    if (!selectedAgendamento?.backendId) return;
    
    toast('Cancelar este agendamento?', {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Cancelar Agendamento',
        onClick: async () => {
          try {
            await AppointmentService.delete(selectedAgendamento.backendId!);
            toast.success('Cancelado.');
            fetchAgendamentos();
            setIsModalDetalhesOpen(false);
          } catch (error) {
            toast.error('Erro ao cancelar agendamento.');
          }
        },
      },
      cancel: {
        label: 'Manter',
        onClick: () => {},
      },
    });
  };

  const handleCheckIn = async () => {
    if (selectedAgendamento?.backendId) {
      await AppointmentService.update(selectedAgendamento.backendId, { status: AppointmentStatus.completed });
      toast.success('Check-in realizado!');
      fetchAgendamentos();
      setIsModalDetalhesOpen(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader title="Gerenciar Agendamentos" description="Visualize e controle a agenda da clínica veterinária." />
        <button 
          onClick={() => setIsModalCadastroOpen(true)} 
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus size={18} /> <span>Novo Agendamento</span>
        </button>
      </div>

      <AgendamentoFilter busca={busca} onBuscaChange={setBusca} statusFiltro={statusFiltro} onStatusChange={setStatusFiltro} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Todos os Agendamentos</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{agendamentosFiltrados.length} registros</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : agendamentosFiltrados.length > 0 ? (
          <div className="space-y-3">
            {agendamentosFiltrados.map(ag => (
              <AgendamentoCard key={ag.id} agendamento={ag} onVerDetalhes={(a) => { setSelectedAgendamento(a); setIsModalDetalhesOpen(true); }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <CalendarX size={24} className="text-gray-400 mb-3" />
            <p className="text-gray-900 font-medium">Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>

      {/* Modal Novo Agendamento */}
      <ModalNovoAgendamentoAdm
        isOpen={isModalCadastroOpen}
        onClose={() => setIsModalCadastroOpen(false)}
        onSuccess={handleAgendamentoSuccess}
      />

      <ModalDetalhesAgendamento 
        isOpen={isModalDetalhesOpen} 
        onClose={() => setIsModalDetalhesOpen(false)} 
        agendamento={selectedAgendamento} 
        onCheckIn={handleCheckIn} 
        onCancelAgendamento={handleDelete}
      />
    </div>
  );
}