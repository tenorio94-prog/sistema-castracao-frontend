"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dog, Calendar, Plus, Zap, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import NovaConsultaModal from '@/components/ResponsavelComponents/NovaConsulta';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';
import ConsultaCard, { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';

import { PetOwnerService } from '@/services/petowner.service';
import { AppointmentService, AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

// Componente Local de Notificação
const NotificationItem = ({ title, desc, type }: { title: string, desc: string, type: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isSuccess = type === 'success';
  return (
    <div className="border border-gray-100 rounded-xl bg-white overflow-hidden transition-all">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSuccess ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}><Bell size={18} /></div>
          <div><h4 className="font-bold text-gray-800 text-sm">{title}</h4>{!isOpen && <p className="text-xs text-gray-500 truncate max-w-[200px]">{desc}</p>}</div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {isOpen && <div className="px-4 pb-4 pt-0 text-sm text-gray-600 border-t border-gray-50 bg-gray-50/30"><div className="mt-3">{desc}</div></div>}
    </div>
  );
};

export default function ResponsavelDashboardPage() {
  const router = useRouter();
  
  // Estados
  const [profile, setProfile] = useState<any>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<ConsultaResponsavelUI[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isNewConsultModalOpen, setIsNewConsultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  // Carregar dados
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil, animais e agendamentos em paralelo
      const [profileData, animalsData, appointmentsData] = await Promise.all([
        PetOwnerService.getMe(),
        PetOwnerService.getMyPets(),
        PetOwnerService.getMyAppointments()
      ]);

      setProfile(profileData);
      setAnimals(animalsData);
      
      // Transformar agendamentos para UI
      const appointmentsUI: ConsultaResponsavelUI[] = appointmentsData.map((apt: any) => {
        const dataObj = new Date(apt.startTime);
        const statusLabel = STATUS_LABELS[apt.status as AppointmentStatus] || 'Agendado';
        
        // Fallback seguro para serviceType (pode vir null ou undefined)
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
      
      setAppointments(appointmentsUI);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (consulta: ConsultaResponsavelUI) => {
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
    try {
      // Validação: Animal selecionado existe
      const animal = animals.find(a => a.id === parseInt(data.animal));
      if (!animal) {
        toast.error('Animal não encontrado. Selecione um animal válido.');
        return;
      }

      // Validação: Profile existe (petOwnerId)
      if (!profile?.id) {
        toast.error('Erro ao identificar responsável. Faça login novamente.');
        return;
      }

      // Criar datas
      const startDate = new Date(data.data + 'T' + data.horario);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      // Validação: Data válida
      if (isNaN(startDate.getTime())) {
        toast.error('Data ou horário inválido');
        return;
      }

      // Validação: Não permitir agendamento no passado
      if (startDate < new Date()) {
        toast.error('Não é possível agendar consultas no passado');
        return;
      }

      // Mapear tipo de consulta para ServiceType do backend
      // Backend aceita: 'triage', 'castrationSurgery', 'postOperative'
      let serviceType: ServiceType;
      
      switch (data.tipo) {
        case 'Castração':
          serviceType = ServiceType.castrationSurgery;
          break;
        case 'Consulta de Retorno':
        case 'Pós-Operatório':
          serviceType = ServiceType.postOperative;
          break;
        case 'Primeira Consulta':
        case 'Triagem':
        default:
          serviceType = ServiceType.triage;
          break;
      }

      // Criar agendamento
      await AppointmentService.create({
        animalId: animal.id,
        petOwnerId: profile.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType: serviceType,
        status: AppointmentStatus.scheduled,
        notes: data.observacoes || ''
      });

      toast.success('Agendamento criado com sucesso!');
      setIsNewConsultModalOpen(false);
      await fetchData();
      
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      
      // Tratamento robusto de erros do NestJS
      let errorMessage = 'Erro ao agendar consulta';
      
      if (error.response?.data) {
        const apiError = error.response.data;
        
        // NestJS retorna arrays de erros de validação (class-validator)
        if (Array.isArray(apiError.message)) {
          errorMessage = apiError.message.join(', ');
        } else if (typeof apiError.message === 'string') {
          errorMessage = apiError.message;
        } else if (apiError.error) {
          errorMessage = apiError.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const mockNotifications = [
    { id: 1, title: 'Bem-vindo!', desc: 'Acompanhe a saúde dos seus pets em um só lugar.', type: 'info' }
  ];

  const upcomingAppointments = appointments
    .filter(a => a.status !== 'Concluído' && a.status !== 'Cancelado')
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Bem vindo(a), <span className="text-green-600">{profile?.user?.completeName?.split(' ')[0] || 'Responsável'}!</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie a saúde dos seus pets em um só lugar.</p>
        </div>
        <div className="hidden md:block text-sm text-gray-400">
           {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash title="Meus Animais" value={animals.length} subtitle="Pets cadastrados" icon={Dog} color="green" />
        <CardBaseDash title="Consultas" value={upcomingAppointments.length} subtitle="Agendamentos futuros" icon={Calendar} color="blue" />
        
        <button 
          onClick={() => {
            if (animals.length === 0) {
              toast.error('Você precisa cadastrar um animal antes de agendar consultas');
              return;
            }
            setIsNewConsultModalOpen(true);
          }} 
          className="group flex flex-col justify-between bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all text-left"
        >
          <div className="flex justify-between items-start w-full">
            <div><p className="text-sm font-medium text-gray-500">Ações Rápidas</p><h3 className="text-xl font-bold text-gray-900 mt-1 group-hover:text-green-700">Nova Consulta</h3></div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors"><Plus size={22} strokeWidth={2.5} /></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wide"><Zap size={14} /><span>Solicitar Agora</span></div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar className="text-green-600" size={20} />Próximas Consultas</h2>
            <button onClick={() => router.push('/responsavel/consultas')} className="text-sm text-green-600 hover:underline font-medium">Ver todas</button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(appt => (
                <ConsultaCard key={appt.id} consulta={appt} onDetalhes={handleOpenDetails} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 font-medium">Nenhum agendamento futuro</p>
              <p className="text-sm text-gray-400 mt-1">Agende uma consulta para seus pets</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Bell className="text-amber-500" size={20} />Notificações</h2>
          <div className="space-y-3">
            {mockNotifications.map(notif => (
              <NotificationItem key={notif.id} title={notif.title} desc={notif.desc} type={notif.type} />
            ))}
          </div>
        </div>
      </div>

      <NovaConsultaModal isOpen={isNewConsultModalOpen} onClose={() => setIsNewConsultModalOpen(false)} onSave={handleSaveConsulta} animais={animals} />
      <DetalhesConsultaModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} data={selectedDetails} onCancel={() => setIsDetailsModalOpen(false)} onConfirm={() => setIsDetailsModalOpen(false)} />
    </div>
  );
}