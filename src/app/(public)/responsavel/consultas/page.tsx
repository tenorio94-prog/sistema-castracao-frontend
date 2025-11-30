"use client";

import React, { useState, useEffect } from 'react';
import { Plus, CalendarDays, Search, Filter, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import ConsultaCard, { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';
import NovaConsultaModal from '@/components/ResponsavelComponents/NovaConsulta';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';
import { PetOwnerService } from '@/services/petowner.service';
import { AppointmentService, AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<ConsultaResponsavelUI[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Triagem' | 'Castração' | 'Pós-Operatório'>('Todos');
  const [loading, setLoading] = useState(true);

  const [isNewConsultModalOpen, setIsNewConsultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, animalsData, appointmentsData] = await Promise.all([
        PetOwnerService.getMe(),
        PetOwnerService.getMyPets(),
        PetOwnerService.getMyAppointments()
      ]);

      setProfile(profileData);
      setAnimals(animalsData);
      
      const consultasUI: ConsultaResponsavelUI[] = appointmentsData.map((apt: any) => {
        const dataObj = new Date(apt.startTime);
        const statusLabel = STATUS_LABELS[apt.status as AppointmentStatus] || 'Agendado';
        
        const serviceLabel = apt.serviceType && SERVICE_TYPE_LABELS[apt.serviceType as ServiceType]
          ? SERVICE_TYPE_LABELS[apt.serviceType as ServiceType]
          : 'Consulta Geral';

        return {
          id: apt.id.toString(),
          title: serviceLabel,
          petName: apt.animal?.name || 'Animal',
          date: dataObj.toLocaleDateString('pt-BR'),
          time: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          veterinarian: 'Veterinário a definir',
          clinic: 'Clínica Veterinária',
          status: statusLabel as 'Agendado' | 'Concluído' | 'Cancelado' | 'Em Andamento',
          backendData: apt
        };
      });
      
      setConsultas(consultasUI);
    } catch (error: any) {
      console.error('Erro ao carregar consultas:', error);
      
      if (error.message?.includes('401')) {
        toast.error('Sessão expirada', { description: 'Faça login novamente.' });
      } else {
        toast.error('Erro ao carregar consultas', { 
          description: error.message || 'Tente novamente mais tarde.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDetalhes = (consulta: ConsultaResponsavelUI) => {
    const apt = consulta.backendData;
    
    setSelectedDetails({
      id: apt.id,
      protocolo: `#${apt.id.toString().padStart(6, '0')}`,
      status: consulta.status,
      responsavel: {
        nome: profile?.user?.completeName || 'N/A',
        cpf: profile?.user?.cpf || 'N/A',
        telefone: profile?.user?.phone || 'N/A',
        email: profile?.user?.email || 'N/A'
      },
      paciente: {
        nome: apt.animal?.name || 'N/A',
        especie: apt.animal?.species ? SPECIES_LABELS[apt.animal.species as keyof typeof SPECIES_LABELS] : 'N/A',
        raca: apt.animal?.breed || 'SRD',
        sexo: apt.animal?.gender ? GENDER_LABELS[apt.animal.gender as keyof typeof GENDER_LABELS] : 'N/A',
        idade: apt.animal?.estimatedAge || 'N/A',
        peso: apt.animal?.sizeWeight || 'N/A'
      },
      servico: {
        procedimento: consulta.title,
        data: consulta.date,
        horario: consulta.time,
        observacoes: apt.notes || 'Nenhuma observação'
      }
    });
    
    setIsDetailsModalOpen(true);
  };

  const handleSaveConsulta = async (data: any) => {
    // Validações
    const animal = animals.find(a => a.id === parseInt(data.animal));
    if (!animal) {
      toast.error('Animal não selecionado', { description: 'Selecione um animal para continuar.' });
      return;
    }

    if (!data.tipo) {
      toast.error('Tipo obrigatório', { description: 'Selecione o tipo de consulta.' });
      return;
    }

    if (!data.data || !data.horario) {
      toast.error('Data e horário obrigatórios', { description: 'Preencha todos os campos.' });
      return;
    }

    if (!profile?.id) {
      toast.error('Sessão inválida', { description: 'Faça login novamente.' });
      return;
    }

    const startDate = new Date(data.data + 'T' + data.horario);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    if (isNaN(startDate.getTime())) {
      toast.error('Data inválida', { description: 'Verifique a data informada.' });
      return;
    }

    if (startDate < new Date()) {
      toast.error('Data no passado', { description: 'Selecione uma data futura.' });
      return;
    }

    // Mapear tipo para ServiceType do backend
    let serviceType: ServiceType;
    
    switch (data.tipo) {
      case 'Castração':
        serviceType = ServiceType.castrationSurgery;
        break;
      case 'Consulta de Retorno':
      case 'Pós-Operatório':
        serviceType = ServiceType.postOperative;
        break;
      default:
        serviceType = ServiceType.triage;
        break;
    }

    toast.promise(
      AppointmentService.create({
        animalId: animal.id,
        petOwnerId: profile.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType: serviceType,
        status: AppointmentStatus.scheduled,
        notes: data.observacoes || ''
      }),
      {
        loading: 'Criando agendamento...',
        success: () => {
          setIsNewConsultModalOpen(false);
          fetchData();
          return `Consulta para ${animal.name} agendada com sucesso!`;
        },
        error: (err) => {
          console.error('Erro ao criar agendamento:', err);
          const apiError = err.response?.data;
          if (Array.isArray(apiError?.message)) {
            return apiError.message[0];
          }
          return apiError?.message || 'Erro ao agendar consulta';
        }
      }
    );
  };

  const filteredConsultas = consultas.filter(c => {
    const matchesSearch = c.petName.toLowerCase().includes(searchTerm.toLowerCase()) || c.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesType = true;
    if (filterType !== 'Todos') {
      matchesType = c.title.toLowerCase().includes(filterType.toLowerCase());
    }
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Minhas Consultas</h1>
          <p className="text-gray-500 mt-1">Acompanhe seu histórico e próximos agendamentos.</p>
        </div>
        <button onClick={() => setIsNewConsultModalOpen(true)} className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95">
          <Plus size={18} /><span>Novo Agendamento</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative grow sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por animal ou procedimento..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none cursor-pointer hover:bg-gray-50 transition-colors">
            <option value="Todos">Todos os Tipos</option>
            <option value="Triagem">Triagem</option>
            <option value="Castração">Castração</option>
            <option value="Pós-Operatório">Pós-Operatório</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={16} /></div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredConsultas.length > 0 ? (
          filteredConsultas.map((consulta) => (
            <ConsultaCard key={consulta.id} consulta={consulta} onDetalhes={handleDetalhes} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="p-4 bg-gray-50 rounded-full mb-3"><CalendarDays className="text-gray-400" size={32} /></div>
            <p className="text-gray-900 font-medium">Nenhuma consulta encontrada.</p>
            <p className="text-gray-500 text-sm mt-1">{filterType !== 'Todos' ? `Nenhum resultado para "${filterType}".` : 'Agende uma nova consulta para começar.'}</p>
          </div>
        )}
      </div>

      <NovaConsultaModal isOpen={isNewConsultModalOpen} onClose={() => setIsNewConsultModalOpen(false)} onSave={handleSaveConsulta} animais={animals} />
      <DetalhesConsultaModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} data={selectedDetails} onCancel={() => setIsDetailsModalOpen(false)} onConfirm={() => setIsDetailsModalOpen(false)} />
    </div>
  );
}