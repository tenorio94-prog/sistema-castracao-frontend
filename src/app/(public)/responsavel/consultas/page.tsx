"use client";

import React, { useState, useEffect } from 'react';
import { CalendarDays, Search, Filter, ChevronDown, Clock, PawPrint, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';
import { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';
import { PetOwnerService } from '@/services/petowner.service';
import { AppointmentStatus, ServiceType, STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/services/appointment.service';
import { SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

// Card de consulta inline
const ConsultaListItem = ({ 
  consulta, 
  onDetalhes 
}: { 
  consulta: ConsultaResponsavelUI; 
  onDetalhes: (c: ConsultaResponsavelUI) => void;
}) => {
  const statusColors: Record<string, string> = {
    'Agendado': 'bg-blue-50 text-blue-700 border-blue-200',
    'Em Andamento': 'bg-amber-50 text-amber-700 border-amber-200',
    'Concluído': 'bg-green-50 text-green-700 border-green-200',
    'Cancelado': 'bg-red-50 text-red-700 border-red-200',
  };

  const [dia, mes, ano] = consulta.date.split('/');

  return (
    <div 
      onClick={() => onDetalhes(consulta)}
      className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Data */}
        <div className="shrink-0 text-center bg-gray-50 group-hover:bg-green-50 rounded-xl px-3 py-2 transition-colors min-w-[60px]">
          <span className="block text-2xl font-bold text-gray-900 group-hover:text-green-700">{dia}</span>
          <span className="block text-xs font-medium text-gray-500 uppercase">
            {new Date(parseInt(ano), parseInt(mes) - 1).toLocaleString('pt-BR', { month: 'short' })}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-gray-900">{consulta.title}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[consulta.status] || 'bg-gray-100 text-gray-600'}`}>
              {consulta.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <PawPrint size={14} className="text-gray-400" />
              {consulta.petName}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              {consulta.time}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={20} className="text-gray-300 group-hover:text-green-500 transition-colors shrink-0" />
      </div>
    </div>
  );
};

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<ConsultaResponsavelUI[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, appointmentsData] = await Promise.all([
        PetOwnerService.getMe(),
        PetOwnerService.getMyAppointments()
      ]);

      setProfile(profileData);
      
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
          veterinarian: apt.veterinarian?.user?.completeName || 'A definir',
          clinic: 'Clínica Veterinária Municipal',
          status: statusLabel as 'Agendado' | 'Concluído' | 'Cancelado' | 'Em Andamento',
          backendData: apt
        };
      });

      // Ordenar: próximas primeiro, depois passadas
      consultasUI.sort((a, b) => {
        const dateA = new Date(a.backendData.startTime);
        const dateB = new Date(b.backendData.startTime);
        return dateA.getTime() - dateB.getTime();
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

  // Filtros
  const filteredConsultas = consultas.filter(c => {
    const matchesSearch = c.petName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Separar agendadas e histórico
  const upcomingConsultas = filteredConsultas.filter(c => c.status === 'Agendado' || c.status === 'Em Andamento');
  const pastConsultas = filteredConsultas.filter(c => c.status === 'Concluído' || c.status === 'Cancelado');

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CalendarDays size={24} className="text-green-600/50" />
          </div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Carregando consultas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-medium text-green-600 mb-1">Área do Tutor</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Minhas Consultas</h1>
          <p className="text-gray-500 mt-1">Acompanhe seu histórico e próximos agendamentos.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
          <CalendarDays size={18} className="text-green-600" />
          <span className="text-sm font-medium text-green-700">{consultas.length} {consultas.length === 1 ? 'consulta' : 'consultas'}</span>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por animal ou procedimento..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="relative min-w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Agendado">Agendado</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>

      {/* Lista de Consultas */}
      {filteredConsultas.length > 0 ? (
        <div className="space-y-6">
          {/* Próximas Consultas */}
          {upcomingConsultas.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-green-50/50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays size={18} className="text-green-600" />
                  Próximas Consultas
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {upcomingConsultas.length}
                  </span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {upcomingConsultas.map((consulta) => (
                  <ConsultaListItem key={consulta.id} consulta={consulta} onDetalhes={handleDetalhes} />
                ))}
              </div>
            </section>
          )}

          {/* Histórico */}
          {pastConsultas.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock size={18} className="text-gray-500" />
                  Histórico
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {pastConsultas.length}
                  </span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {pastConsultas.map((consulta) => (
                  <ConsultaListItem key={consulta.id} consulta={consulta} onDetalhes={handleDetalhes} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <CalendarDays className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-medium">Nenhuma consulta encontrada</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm || filterStatus !== 'Todos' 
              ? 'Tente ajustar os filtros de busca.' 
              : 'Suas consultas aparecerão aqui quando agendadas.'}
          </p>
        </div>
      )}

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