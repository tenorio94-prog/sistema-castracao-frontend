"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AtendimentoCard, { AtendimentoMedicoUI } from '@/components/MedicoComponents/AtendimentoCard';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import FichaClinicaModal from '@/components/MedicoComponents/FichaClinicaModal';
import HistoricoProntuarioModal from '@/components/MedicoComponents/HistoricoProntuarioModal';
import { AppointmentService, Appointment, AppointmentStatus, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS } from '@/services/animal.service';

export default function PaginaAtendimentosMedico() {
  const router = useRouter();
  const [atendimentos, setAtendimentos] = useState<AtendimentoMedicoUI[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Todos' | 'Cirurgia' | 'Consulta' | 'Retorno'>('Todos');
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ animalId: '', tipo: '', data: '', hora: '', observacoes: '' });

  const [isFichaOpen, setIsFichaOpen] = useState(false);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedOwnerName, setSelectedOwnerName] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  // Convert backend appointment to UI format
  const convertToAtendimentoUI = (appointment: Appointment): AtendimentoMedicoUI => {
    const startDate = new Date(appointment.startTime);
    const statusMap: Record<AppointmentStatus, string> = {
      [AppointmentStatus.scheduled]: 'Agendado',
      [AppointmentStatus.confirmed]: 'Confirmado',
      [AppointmentStatus.completed]: 'Realizado',
      [AppointmentStatus.canceled]: 'Cancelado',
      [AppointmentStatus.absent]: 'Ausente',
    };

    const typeMap: Record<string, string> = {
      'Triagem': 'Consulta',
      'Cirurgia de Castração': 'Cirurgia',
      'Pós-Operatório': 'Retorno'
    };

    const serviceLabel = appointment.serviceType ? SERVICE_TYPE_LABELS[appointment.serviceType] : 'Consulta';
    const type = typeMap[serviceLabel] || 'Consulta';

    return {
      id: appointment.id.toString(),
      petName: appointment.animal?.name || 'Sem nome',
      species: appointment.animal ? `${SPECIES_LABELS[appointment.animal.species as keyof typeof SPECIES_LABELS]} - ${appointment.animal.breed || 'SRD'}` : 'Desconhecido',
      date: startDate.toLocaleDateString('pt-BR'),
      time: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: type,
      veterinarian: 'Você',
      status: statusMap[appointment.status] || 'Agendado',
      animalId: appointment.animal?.id,
      ownerName: appointment.petOwner?.user?.completeName || 'Desconhecido'
    };
  };

  // Fetch appointments
  useEffect(() => {
    const fetchAtendimentos = async () => {
      try {
        setLoading(true);
        const data = await AppointmentService.getAll();
        const converted = data.map(convertToAtendimentoUI);
        setAtendimentos(converted);
      } catch (error: any) {
        console.error('Error fetching atendimentos:', error);
        toast.error('Erro ao carregar atendimentos');
      } finally {
        setLoading(false);
      }
    };

    fetchAtendimentos();
  }, []);

  const handleVerProntuario = (id: string) => {
    const paciente = atendimentos.find(a => a.id === id);
    if (paciente) {
      setSelectedPatientName(paciente.petName);
      setSelectedAnimalId(paciente.animalId || null);
      setIsProntuarioOpen(true);
    }
  };

  const handlePreencherFicha = (id: string) => {
    const paciente = atendimentos.find(a => a.id === id);
    if (paciente) {
      setSelectedPatientName(paciente.petName);
      setSelectedOwnerName(paciente.ownerName || 'Tutor');
      setSelectedAnimalId(paciente.animalId || null);
      setIsFichaOpen(true);
    }
  };

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/medico/agenda');
  };

  const filteredAtendimentos = atendimentos.filter(item => 
    item.petName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'Todos' || item.type === activeTab)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader 
          title="Meus Atendimentos"
          description="Gerencie sua agenda clínica e procedimentos."
        />
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
          {/* CORREÇÃO VISUAL: Borda cinza e anel cinza suave */}
          <input 
            type="text" 
            placeholder="Buscar paciente pelo nome..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full no-scrollbar">
          {(['Todos', 'Consulta', 'Cirurgia', 'Retorno'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAtendimentos.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-400 font-medium">Nenhum atendimento encontrado</p>
          </div>
        ) : (
          filteredAtendimentos.map((item) => (
            <AtendimentoCard key={item.id} atendimento={item} onVerProntuario={handleVerProntuario} onPreencherFicha={handlePreencherFicha} />
          ))
        )}
      </div>

      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Novo Agendamento" saveText="Agendar">
         <FormInput label="Nome do Animal *" name="animal" value={formData.animalId} onChange={() => {}} required />
      </CadastroModal>

      <HistoricoProntuarioModal isOpen={isProntuarioOpen} onClose={() => setIsProntuarioOpen(false)} patientName={selectedPatientName} animalId={selectedAnimalId} />
      <FichaClinicaModal isOpen={isFichaOpen} onClose={() => setIsFichaOpen(false)} patientName={selectedPatientName} ownerName={selectedOwnerName} animalId={selectedAnimalId} />

    </div>
  );
}