"use client";

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AtendimentoCard, { AtendimentoMedicoUI } from '@/components/MedicoComponents/AtendimentoCard';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import FichaClinicaModal from '@/components/MedicoComponents/FichaClinicaModal';
import HistoricoProntuarioModal from '@/components/MedicoComponents/HistoricoProntuarioModal';

// --- Mocks ---
const mockAtendimentos: AtendimentoMedicoUI[] = [
  {
    id: '1',
    petName: 'Amora',
    species: 'Canino - SRD',
    date: '25/09/2024',
    time: '09:00',
    type: 'Cirurgia',
    veterinarian: 'Dr. Mateus',
    status: 'Realizado'
  },
  {
    id: '2',
    petName: 'Thor',
    species: 'Canino - Golden',
    date: '27/11/2025',
    time: '10:30',
    type: 'Consulta',
    veterinarian: 'Você',
    status: 'Agendado'
  }
];

export default function PaginaAtendimentosMedico() {
  const [atendimentos, setAtendimentos] = useState<AtendimentoMedicoUI[]>(mockAtendimentos);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Todos' | 'Cirurgia' | 'Consulta' | 'Retorno'>('Todos');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ animalId: '', tipo: '', data: '', hora: '', observacoes: '' });

  const [isFichaOpen, setIsFichaOpen] = useState(false);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedOwnerName, setSelectedOwnerName] = useState('');

  const handleVerProntuario = (id: string) => {
    const paciente = atendimentos.find(a => a.id === id);
    setSelectedPatientName(paciente?.petName || 'Paciente');
    setIsProntuarioOpen(true);
  };

  const handlePreencherFicha = (id: string) => {
    const paciente = atendimentos.find(a => a.id === id);
    setSelectedPatientName(paciente?.petName || 'Paciente');
    setSelectedOwnerName("Marcella (Tutor)"); 
    setIsFichaOpen(true);
  };

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Agendamento criado com sucesso!');
    setIsCreateModalOpen(false);
  };

  const filteredAtendimentos = atendimentos.filter(item => 
    item.petName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeTab === 'Todos' || item.type === activeTab)
  );

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
        {filteredAtendimentos.map((item, index) => (
          <AtendimentoCard key={index} atendimento={item} onVerProntuario={handleVerProntuario} onPreencherFicha={handlePreencherFicha} />
        ))}
      </div>

      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Novo Agendamento" saveText="Agendar">
         <FormInput label="Nome do Animal *" name="animal" value={formData.animalId} onChange={() => {}} required />
      </CadastroModal>

      <HistoricoProntuarioModal isOpen={isProntuarioOpen} onClose={() => setIsProntuarioOpen(false)} patientName={selectedPatientName} />
      <FichaClinicaModal isOpen={isFichaOpen} onClose={() => setIsFichaOpen(false)} patientName={selectedPatientName} ownerName={selectedOwnerName} />

    </div>
  );
}