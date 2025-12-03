"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dog, 
  Calendar, 
  Bell, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Stethoscope, 
  PawPrint, 
  AlertCircle,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';
import { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';

import { PetOwnerService } from '@/services/petowner.service';
import { AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

// --- Componentes Auxiliares ---

const QuickAction = ({ 
  icon: Icon, 
  label, 
  desc, 
  onClick, 
  color = "green" 
}: { 
  icon: any, 
  label: string, 
  desc: string, 
  onClick: () => void, 
  color?: "green" | "blue" | "purple" 
}) => {
  const colorClasses = {
    green: "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white border-green-200",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-200",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white border-purple-200"
  };

  return (
    <button 
      onClick={onClick}
      className="group flex items-center gap-4 p-5 bg-white border-2 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left w-full transform hover:scale-[1.02]"
    >
      <div className={`p-3.5 rounded-xl transition-all duration-300 border-2 ${colorClasses[color]}`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{label}</h3>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight className="ml-auto text-gray-300 group-hover:text-green-600 transition-all group-hover:translate-x-1 shrink-0" size={20} />
    </button>
  );
};

const ConsultaCardCompact = ({ 
  consulta, 
  onDetalhes 
}: { 
  consulta: ConsultaResponsavelUI; 
  onDetalhes: (c: ConsultaResponsavelUI) => void;
}) => {
  const statusColors: Record<string, string> = {
    'Agendado': 'bg-blue-100 text-blue-700 border-blue-300',
    'Em Andamento': 'bg-amber-100 text-amber-700 border-amber-300',
    'Concluído': 'bg-green-100 text-green-700 border-green-300',
    'Cancelado': 'bg-red-100 text-red-700 border-red-300',
  };

  const [dia, mes] = consulta.date.split('/');
  const mesExtenso = new Date(2025, parseInt(mes) - 1).toLocaleString('pt-BR', { month: 'short' });

  return (
    <div 
      onClick={() => onDetalhes(consulta)}
      className="group bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden transform hover:scale-[1.01]"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-transparent group-hover:bg-green-500 transition-all duration-300" />
      
      <div className="flex items-center gap-4">
        {/* Data */}
        <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-linear-to-br from-gray-50 to-gray-100 group-hover:from-green-50 group-hover:to-green-100 rounded-xl border-2 border-gray-200 group-hover:border-green-300 transition-all duration-300 shadow-sm">
          <span className="text-2xl font-bold text-gray-900 group-hover:text-green-700 leading-none transition-colors">{dia}</span>
          <span className="text-xs font-bold text-gray-500 group-hover:text-green-600 uppercase mt-1 transition-colors">{mesExtenso}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">{consulta.title}</h4>
            <span className={`shrink-0 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-full border-2 ${statusColors[consulta.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
              {consulta.status}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-green-50 rounded-md">
                <PawPrint size={14} className="text-green-600" />
              </div>
              <span className="font-medium truncate max-w-[150px]">{consulta.petName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-md">
                <Clock size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">{consulta.time}</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-gray-50 group-hover:bg-green-100 flex items-center justify-center transition-all duration-300 border-2 border-gray-200 group-hover:border-green-300">
          <ChevronRight size={20} className="text-gray-400 group-hover:text-green-600 transition-all group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

const NotificationCard = ({ title, desc, type }: { title: string; desc: string; type: string }) => {
  const isInfo = type === 'info';
  return (
    <div className={`p-4 rounded-xl border-2 ${isInfo ? 'bg-blue-50/50 border-blue-200' : 'bg-amber-50/50 border-amber-200'} hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-lg shrink-0 ${isInfo ? 'bg-blue-100 text-blue-600 border-2 border-blue-200' : 'bg-amber-100 text-amber-600 border-2 border-amber-200'}`}>
          {isInfo ? <Bell size={18} strokeWidth={2.5} /> : <AlertCircle size={18} strokeWidth={2.5} />}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
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
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  // Carregar dados
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
      
      const appointmentsUI: ConsultaResponsavelUI[] = appointmentsData.map((apt: any) => {
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
          veterinarian: apt.veterinarian?.user?.completeName || 'A definir',
          clinic: 'Clínica Veterinária Municipal',
          status: statusLabel as 'Agendado' | 'Concluído' | 'Cancelado' | 'Em Andamento',
          backendData: apt
        };
      });
      
      // Ordenar por data mais próxima
      appointmentsUI.sort((a, b) => {
        const dateA = new Date(a.backendData.startTime);
        const dateB = new Date(b.backendData.startTime);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(appointmentsUI);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Sessão expirada', { 
          description: 'Faça login novamente para continuar.',
          duration: 5000
        });
      } else if (error.message?.includes('Network') || error.message?.includes('rede')) {
        toast.error('Erro de conexão', { 
          description: 'Verifique sua internet e tente novamente.' 
        });
      } else {
        toast.error('Erro ao carregar dados', { 
          description: error.message || 'Tente novamente mais tarde.' 
        });
      }
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

  // Filtros de agendamentos
  const upcomingAppointments = appointments.filter(a => 
    a.status !== 'Concluído' && a.status !== 'Cancelado'
  );
  
  const completedAppointments = appointments.filter(a => 
    a.status === 'Concluído'
  );

  // Data de hoje formatada
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Dog size={28} className="text-green-600/50" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-bold text-lg animate-pulse mb-1">Carregando seu painel...</p>
          <p className="text-gray-500 text-sm">Por favor, aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full space-y-6 md:space-y-8 animate-in fade-in duration-700 overflow-auto">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-linear-to-r from-green-50 to-green-100 border-2 border-green-200 text-green-700 text-xs font-bold mb-2 shadow-sm">
              <Activity size={14} className="mr-1.5" />
              Painel do Tutor
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Olá, <span className="text-green-600">{profile?.user?.completeName?.split(' ')[0] || 'Responsável'}</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Gerencie a saúde dos seus pets em um só lugar
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white px-5 py-3 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all">
            <Calendar size={18} className="text-green-600"/>
            <span className="capitalize">{dataFormatada}</span>
          </div>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <CardBaseDash 
          title="Meus Pets" 
          value={animals.length} 
          subtitle="Animais cadastrados" 
          icon={Dog} 
          color="green"
        />
        <CardBaseDash 
          title="Agendamentos" 
          value={upcomingAppointments.length} 
          subtitle="Próximos atendimentos" 
          icon={Calendar} 
          color="blue"
        />
        <CardBaseDash 
          title="Histórico" 
          value={completedAppointments.length} 
          subtitle="Consultas realizadas" 
          icon={Stethoscope} 
          color="purple"
        />
      </section>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Próximas Consultas */}
        <section className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Próximas Consultas</h2>
            </div>
            {upcomingAppointments.length > 0 && (
              <button 
                onClick={() => router.push('/responsavel/consultas')} 
                className="text-sm text-green-600 hover:text-green-700 font-bold flex items-center gap-1 hover:gap-2 transition-all group"
              >
                Ver todas
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="p-5 sm:p-6 md:p-7 min-h-[400px]">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map(appt => (
                    <ConsultaCardCompact 
                      key={appt.id} 
                      consulta={appt} 
                      onDetalhes={handleOpenDetails} 
                    />
                  ))}
                  {upcomingAppointments.length > 5 && (
                    <button
                      onClick={() => router.push('/responsavel/consultas')}
                      className="w-full py-3.5 text-sm font-bold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all border-2 border-dashed border-green-300 hover:border-green-400 mt-4 transform hover:scale-[1.01]"
                    >
                      Ver mais {upcomingAppointments.length - 5} consulta(s) →
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-24 h-24 bg-linear-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-5 border-4 border-gray-200 shadow-inner">
                    <Calendar className="text-gray-300" size={40} strokeWidth={2} />
                  </div>
                  <h3 className="text-gray-900 font-bold text-xl mb-2">Nenhuma consulta agendada</h3>
                  <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto leading-relaxed">
                    Você não tem atendimentos previstos para os próximos dias. Agende uma consulta para seus pets.
                  </p>
                  <button
                    onClick={() => router.push('/responsavel/consultas')}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl shadow-green-200 transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    Agendar Consulta
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sidebar - Avisos e Info */}
        <aside className="space-y-6">
          {/* Card de Avisos */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-gray-100 flex items-center gap-2 bg-linear-to-r from-gray-50 to-white">
              <div className="p-1.5 bg-amber-100 rounded-lg border-2 border-amber-200">
                <Bell className="text-amber-600" size={18} strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-gray-900">Avisos Importantes</h3>
            </div>
            <div className="p-4 space-y-3">
              <NotificationCard 
                title="Bem-vindo ao Mymba!" 
                desc="Acompanhe a saúde dos seus pets em um só lugar." 
                type="info" 
              />
              {animals.length === 0 && (
                <NotificationCard 
                  title="Cadastre seus pets" 
                  desc="Adicione seus animais para agendar consultas." 
                  type="warning" 
                />
              )}
            </div>
          </div>

          {/* Meus Pets Quick View */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="px-5 py-4 border-b-2 border-gray-100 flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg border-2 border-green-200">
                  <Dog className="text-green-600" size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-gray-900">Meus Pets</h3>
              </div>
              {animals.length > 0 && (
                <button 
                  onClick={() => router.push('/responsavel/animais')}
                  className="text-xs text-green-600 hover:text-green-700 font-bold uppercase tracking-wide hover:underline"
                >
                  Ver todos
                </button>
              )}
            </div>
            <div className="p-4">
              {animals.length > 0 ? (
                <div className="space-y-2.5">
                  {animals.slice(0, 4).map((animal: any) => (
                    <div 
                      key={animal.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-linear-to-r from-white to-gray-50 border-2 border-gray-100 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group transform hover:scale-[1.02]"
                      onClick={() => router.push('/responsavel/animais')}
                    >
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all border-2 border-green-200 shadow-sm">
                        <PawPrint size={20} className="text-green-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">{animal.name}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          {animal.species === 'canine' ? '🐕 Cachorro' : animal.species === 'feline' ? '🐈 Gato' : animal.species}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-green-600 transition-all group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </div>
                  ))}
                  {animals.length > 4 && (
                    <button
                      onClick={() => router.push('/responsavel/animais')}
                      className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-green-600 transition-colors text-center hover:bg-green-50 rounded-lg"
                    >
                      +{animals.length - 4} outros pet{animals.length - 4 > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-gray-200">
                    <Dog className="text-gray-300" size={28} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3 font-medium">Nenhum pet cadastrado</p>
                  <button
                    onClick={() => router.push('/responsavel/animais')}
                    className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline"
                  >
                    Cadastrar agora →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card de Ajuda */}
          <div className="bg-linear-to-br from-green-600 via-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl shadow-green-300 border-2 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertCircle size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold text-lg">Precisa de ajuda?</h3>
            </div>
            <p className="text-green-50 text-sm mb-5 leading-relaxed">
              Em caso de dúvidas ou emergências, entre em contato com nossa equipe veterinária.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white bg-white/15 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                <MapPin size={18} className="text-green-100 shrink-0" strokeWidth={2.5} />
                <span className="font-semibold">Clínica Veterinária Municipal</span>
              </div>
              <div className="flex items-center gap-3 text-white bg-white/15 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                <Clock size={18} className="text-green-100 shrink-0" strokeWidth={2.5} />
                <span className="font-semibold">Seg-Sex: 8h às 17h</span>
              </div>
              <div className="flex items-center gap-3 text-white bg-white/15 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                <Phone size={18} className="text-green-100 shrink-0" strokeWidth={2.5} />
                <span className="font-semibold">(81) 3183-3000</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal de Detalhes */}
      <DetalhesConsultaModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        data={selectedDetails} 
        onCancel={() => setIsDetailsModalOpen(false)} 
        onConfirm={() => setIsDetailsModalOpen(false)} 
      />
    </div>
  );
}