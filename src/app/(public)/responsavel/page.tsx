"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dog, Calendar, Plus, Zap, Bell, ChevronDown, ChevronUp, Info } from 'lucide-react';

import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import NovaConsultaModal from '@/components/ResponsavelComponents/NovaConsulta';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';
// IMPORTANTE: Usando o mesmo card da página de Consultas
import ConsultaCard, { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';
import { maskCPF, maskPhone } from '@/lib/masks';

// Mocks (Adaptados para a interface ConsultaResponsavelUI)
const mockAppointments: ConsultaResponsavelUI[] = [
  {
    id: '1', 
    title: 'Primeira Consulta',
    petName: 'Rex', 
    status: 'Concluído', 
    date: '14/01/2026', 
    time: '14:00',
    veterinarian: 'Dra. Maria Silva',
    clinic: 'Unidade Central'
  },
  {
    id: '2', 
    title: 'Castração',
    petName: 'Mel', 
    status: 'Agendado', 
    date: '01/02/2026', 
    time: '09:30',
    veterinarian: 'Dr. João Costa',
    clinic: 'Unidade Boa Viagem'
  }
];

const mockNotifications = [
  { id: 1, title: 'Rex está pronto para castrar!', desc: 'Os exames foram aprovados. Agende a cirurgia agora mesmo.', type: 'success' },
  { id: 2, title: 'Atualize o peso de Mel', desc: 'Para garantir a dosagem correta na próxima consulta.', type: 'info' },
];

// Mock Detalhes Completo (Para o Modal)
const mockFullDetails: DetalhesData = {
  id: 1,
  protocolo: '#123456',
  status: 'Concluído',
  responsavel: { nome: 'Ana Paula', cpf: '123.456.789-00', telefone: '(81) 98888-7777', email: 'ana@email.com' },
  paciente: { nome: 'Rex', especie: 'Cachorro', raca: 'Pastor Alemão', sexo: 'Macho', idade: '5 anos', peso: '30kg' },
  servico: { procedimento: 'Primeira Consulta', data: '14/01/2026', horario: '14:00', observacoes: 'Animal clinicamente saudável.' }
};

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
  const [isNewConsultModalOpen, setIsNewConsultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  const handleOpenDetails = (consulta: ConsultaResponsavelUI) => {
    // Em produção, você buscaria os dados completos pelo ID
    // Aqui usamos o mock estático para demonstração visual
    setSelectedDetails({ ...mockFullDetails, status: consulta.status, servico: { ...mockFullDetails.servico, procedimento: consulta.title } });
    setIsDetailsModalOpen(true);
  };

  const handleSaveConsulta = (data: any) => {
    alert(`Solicitação enviada para ${data.animal}!`);
    setIsNewConsultModalOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Bem vindo(a), <span className="text-green-600">Ana!</span>
          </h1>
          <p className="text-gray-500 mt-1">Gerencie a saúde dos seus pets em um só lugar.</p>
        </div>
        <div className="hidden md:block text-sm text-gray-400">
           {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash title="Meus Animais" value={3} subtitle="Pets cadastrados" icon={Dog} color="green" />
        <CardBaseDash title="Consultas" value={mockAppointments.length} subtitle="Agendamentos futuros" icon={Calendar} color="blue" />
        
        {/* Card Ação Rápida */}
        <button onClick={() => setIsNewConsultModalOpen(true)} className="group flex flex-col justify-between bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all text-left">
          <div className="flex justify-between items-start w-full">
            <div><p className="text-sm font-medium text-gray-500">Ações Rápidas</p><h3 className="text-xl font-bold text-gray-900 mt-1 group-hover:text-green-700">Nova Consulta</h3></div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors"><Plus size={22} strokeWidth={2.5} /></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wide"><Zap size={14} /><span>Solicitar Agora</span></div>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Próximas Consultas (Usando ConsultaCard) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-green-600" size={20} />
              Próximas Consultas
            </h2>
            <button onClick={() => router.push('/responsavel/consultas')} className="text-sm text-green-600 hover:underline font-medium">Ver todas</button>
          </div>
          <div className="space-y-3">
            {mockAppointments.map(appt => (
              <ConsultaCard 
                key={appt.id} 
                consulta={appt} 
                onDetalhes={handleOpenDetails} 
              />
            ))}
          </div>
        </div>

        {/* Notificações */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Bell className="text-amber-500" size={20} />Notificações</h2>
          <div className="space-y-3">
            {mockNotifications.map(notif => (
              <NotificationItem key={notif.id} title={notif.title} desc={notif.desc} type={notif.type} />
            ))}
          </div>
        </div>
      </div>

      {/* Modais */}
      <NovaConsultaModal 
        isOpen={isNewConsultModalOpen} 
        onClose={() => setIsNewConsultModalOpen(false)} 
        onSave={handleSaveConsulta} 
      />
      
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