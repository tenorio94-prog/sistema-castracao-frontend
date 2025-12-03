"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarX, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';
import AgendamentoFilter from '@/components/AtendenteComponents/FiltroAgendamento';
import ModalNovoAgendamentoAtendente from '@/components/AtendenteComponents/ModalNovoAgendamentoAtendente';
import ModalDetalhesAgendamento from '@/components/modals/ModalDetalhesAgendamento';
import { AppointmentService, AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { AnimalService, Species, Gender, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

export default function PaginaAgendamentos() {
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
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

  useEffect(() => { fetchAgendamentos(); }, []);

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
  const handleAgendamentoSuccess = () => {
    fetchAgendamentos();
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
    
    toast(`Deletar agendamento de ${selectedAgendamento?.petName}?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Deletar',
        onClick: async () => {
          try {
            await AppointmentService.delete(id);
            toast.success('Agendamento deletado.');
            await fetchAgendamentos();
            handleCloseDetalhes();
          } catch (error) {
            toast.error('Erro ao deletar agendamento.');
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleNovoAgendamento = () => {
    setIsModalCadastroOpen(true);
  };
  
  const handleCloseCadastro = () => { 
    setIsModalCadastroOpen(false); 
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

      {/* Modal Novo Agendamento */}
      <ModalNovoAgendamentoAtendente
        isOpen={isModalCadastroOpen}
        onClose={handleCloseCadastro}
        onSuccess={handleAgendamentoSuccess}
      />

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