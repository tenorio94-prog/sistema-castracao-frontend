"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dog, 
  Stethoscope, 
  CheckCircle, 
  Clock, 
  Activity,
  Play,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import ViewModal from '@/components/modals/ViewModal';
import AgendamentoCard, { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';
import { AppointmentService, Appointment, AppointmentStatus, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

export default function MedicoDashboardPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert backend appointment to UI Agendamento format
  const convertToAgendamento = (appointment: Appointment): Agendamento => {
    const startDate = new Date(appointment.startTime);
    const statusMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.scheduled]: 'Pendente',
      [AppointmentStatus.confirmed]: 'Confirmado',
      [AppointmentStatus.completed]: 'Concluído',
      [AppointmentStatus.canceled]: 'Cancelado',
      [AppointmentStatus.absent]: 'Ausente',
    };

    return {
      id: appointment.id,
      petName: appointment.animal?.name || 'Animal sem nome',
      status: statusMap[appointment.status] || 'Pendente',
      data: startDate.toISOString().split('T')[0],
      hora: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tipo: appointment.serviceType ? SERVICE_TYPE_LABELS[appointment.serviceType] : 'Não especificado',
      observacoes: appointment.notes || 'Sem observações',
      pet: {
        id: appointment.animal?.id || 0,
        name: appointment.animal?.name || 'Sem nome',
        species: appointment.animal ? SPECIES_LABELS[appointment.animal.species as keyof typeof SPECIES_LABELS] : 'Desconhecido',
        breed: appointment.animal?.breed || 'SRD',
        gender: appointment.animal ? GENDER_LABELS[appointment.animal.gender as keyof typeof GENDER_LABELS] : 'Desconhecido',
        weight: '0kg',
        age: '0 anos',
        ownerName: appointment.petOwner?.user?.completeName || 'Desconhecido'
      },
      responsavel: {
        id: appointment.petOwner?.id.toString() || '0',
        tipo: 'PF',
        nome: appointment.petOwner?.user?.completeName || 'Desconhecido',
        animais: [appointment.animal?.name || 'Sem nome'],
        senha: '',
        telefone: appointment.petOwner?.user?.phone || 'Sem telefone',
        email: appointment.petOwner?.user?.email || 'Sem email'
      }
    };
  };

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await AppointmentService.getAll();
        
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = data.filter(apt => {
          const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
          return aptDate === today;
        });
        
        const converted = todayAppointments.map(convertToAgendamento);
        setAgendamentos(converted);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError(err.message || 'Erro ao carregar agendamentos');
        toast.error('Erro ao carregar agendamentos');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // --- Handlers ---
  const handleVerDetalhes = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setIsViewModalOpen(true);
  };

  const handleCloseDetalhes = () => {
    setIsViewModalOpen(false);
    setSelectedAgendamento(null);
  };

  const handleIniciarAtendimento = () => {
    toast.success(`Iniciando atendimento de ${selectedAgendamento?.petName}...`);
    // TODO: Navigate to prontuário page
    handleCloseDetalhes();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500">Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <PageHeader 
        title="Dashboard Médico"
        description="Bem-vindo(a) ao seu painel clínico."
      />

      {/* Cards de KPI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash
          title="Pacientes Hoje"
          value={agendamentos.length} 
          subtitle="Agendados na sua fila"
          icon={Dog} 
          color="blue"
          trend={agendamentos.length > 0 ? "Agenda ativa" : "Sem agendamentos"}
        />
        <CardBaseDash
          title="Cirurgias"
          value={agendamentos.filter(a => a.tipo.includes('Cirurgia')).length}
          subtitle="Procedimentos cirúrgicos"
          icon={Stethoscope}
          color="purple"
        />
        <CardBaseDash
          title="Realizados"
          value={agendamentos.filter(a => a.status === 'Concluído').length} 
          subtitle="Atendimentos concluídos"
          icon={CheckCircle}
          color="green"
        />
      </section>

      {/* Lista de Próximos Atendimentos */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Próximos Atendimentos</h2>
            <p className="text-sm text-gray-500">Pacientes aguardando chamada.</p>
          </div>
        </div>

        <div className="space-y-3">
          {agendamentos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Nenhum agendamento para hoje</p>
              <p className="text-sm text-gray-400 mt-1">Os próximos atendimentos aparecerão aqui</p>
            </div>
          ) : (
            agendamentos.map((appt) => (
              <AgendamentoCard
                key={appt.id}
                agendamento={appt}
                onVerDetalhes={handleVerDetalhes}
              />
            ))
          )}
        </div>
      </section>

      {/* Modal de Ações do Médico (Detalhes + Iniciar) */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseDetalhes}
        title={`Paciente: ${selectedAgendamento?.petName}`}
      >
        <div className="space-y-5">
           {/* Resumo do Paciente */}
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
               <Dog size={28} />
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-900">{selectedAgendamento?.petName}</h3>
               <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                 <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">{selectedAgendamento?.pet.species}</span>
                 <span>•</span>
                 <span>{selectedAgendamento?.pet.breed}</span>
                 <span>•</span>
                 <span>{selectedAgendamento?.pet.age}</span>
               </div>
             </div>
           </div>

           {/* Detalhes do Agendamento */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Procedimento</label>
                 <p className="font-semibold text-gray-900">{selectedAgendamento?.tipo}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Horário</label>
                 <div className="flex items-center gap-2 font-semibold text-gray-900">
                   <Clock size={16} className="text-gray-400"/> 
                   {selectedAgendamento?.hora}
                 </div>
              </div>
           </div>

           <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <label className="text-xs font-bold text-blue-400 uppercase block mb-1">Motivo / Queixa Principal</label>
             <p className="text-blue-900 text-sm leading-relaxed">{selectedAgendamento?.observacoes || 'Nenhuma observação registrada.'}</p>
           </div>

           {/* Ações Principais do Médico */}
           <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
             <button 
               onClick={handleIniciarAtendimento}
               className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
             >
               <Play size={20} fill="currentColor" />
               Iniciar Atendimento
             </button>
           </div>
        </div>
      </ViewModal>
    </div>
  );
}