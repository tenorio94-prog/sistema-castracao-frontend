"use client";

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AtendimentoCard, { AtendimentoMedicoUI } from '@/components/MedicoComponents/AtendimentoCard';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';

// --- Mocks ---
const mockAtendimentos: AtendimentoMedicoUI[] = [
  {
    id: '1',
    petName: 'Ana',
    species: 'Felino - Persa',
    date: '20/10/2025',
    time: '09:00h',
    type: 'cirurgia',
    veterinarian: 'Dr. House',
    student: 'Emanuel Rodrigues',
    observations: 'Castração eletiva - Preparação pré-operatória completa',
    status: 'Agendado'
  },
  {
    id: '2',
    petName: 'Thor',
    species: 'Canino - Golden',
    date: '21/10/2025',
    time: '10:30h',
    type: 'consulta',
    veterinarian: 'Dr. House',
    observations: 'Vacinação anual e check-up geral',
    status: 'Agendado'
  },
  {
    id: '3',
    petName: 'Luna',
    species: 'Felino - Siamês',
    date: '22/10/2025',
    time: '14:00h',
    type: 'retorno',
    veterinarian: 'Dr. House',
    observations: 'Retirada de pontos',
    status: 'Realizado'
  }
];

// Form Type
type AgendamentoForm = {
  animal: string;
  tipo: string;
  data: string;
  hora: string;
  observacoes: string;
};
const emptyForm: AgendamentoForm = { animal: '', tipo: '', data: '', hora: '', observacoes: '' };

export default function PaginaAtendimentosMedico() {
  const [atendimentos, setAtendimentos] = useState<AtendimentoMedicoUI[]>(mockAtendimentos);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'cirurgias' | 'consultas' | 'retornos'>('todos');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<AgendamentoForm>(emptyForm);

  // Handlers
  const handleVerProntuario = (id: string) => alert(`Abrindo prontuário ID: ${id}`);
  const handlePreencherFicha = (id: string) => alert(`Abrindo ficha ID: ${id}`);

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de criação
    const novo: AtendimentoMedicoUI = {
      id: Math.random().toString(),
      petName: formData.animal, // Mock: assumindo que o nome do animal é o input
      species: 'Espécie Mock',
      date: formData.data.split('-').reverse().join('/'),
      time: formData.hora,
      type: formData.tipo,
      veterinarian: 'Dr. House', // Logado atualmente
      status: 'Agendado',
      observations: formData.observacoes
    };
    setAtendimentos([novo, ...atendimentos]);
    setIsCreateModalOpen(false);
    setFormData(emptyForm);
    alert('Agendamento realizado com sucesso!');
  };

  // Filtragem
  const filteredAtendimentos = atendimentos.filter(item => {
    const matchesSearch = item.petName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'todos' || item.type.toLowerCase().includes(activeTab.slice(0, -1)); // remove 's' final para match simples
    return matchesSearch && matchesTab;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-green-800 tracking-tight">Atendimentos</h1>
        <p className="text-gray-600 mt-1 text-lg">Gerencie sua agenda de consultas, cirurgias e retornos</p>
      </div>

      {/* Barra de Ferramentas */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        
        {/* Busca */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome do animal"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all shadow-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Botão Novo Agendamento (Padrão Preto ADM) */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95 whitespace-nowrap w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex flex-wrap gap-2">
        {(['todos', 'cirurgias', 'consultas', 'retornos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              activeTab === tab 
                ? 'bg-green-700 text-white shadow-md shadow-green-100' 
                : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-800 border border-transparent hover:border-green-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lista de Atendimentos */}
      <div className="space-y-4">
        {filteredAtendimentos.length > 0 ? (
          filteredAtendimentos.map((item, index) => (
            <AtendimentoCard 
              key={index} 
              atendimento={item}
              onVerProntuario={handleVerProntuario}
              onPreencherFicha={handlePreencherFicha}
            />
          ))
        ) : (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-medium">Nenhum atendimento encontrado para os filtros atuais.</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE NOVO AGENDAMENTO (Padrão Atendente) --- */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Novo Agendamento"
        saveText="Agendar"
      >
        <div className="space-y-4">
           {/* Em produção, isso seria um Select buscando animais da API */}
           <FormInput 
             label="Nome do Animal *" 
             name="animal"
             value={formData.animal} 
             onChange={(e) => setFormData({...formData, animal: e.target.value})}
             required
           />
           
           <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tipo de Atendimento *</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-600"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                required
              >
                <option value="">Selecione...</option>
                <option value="consulta">Consulta</option>
                <option value="cirurgia">Cirurgia</option>
                <option value="retorno">Retorno</option>
              </select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Data *" 
                type="date" 
                name="data"
                value={formData.data} 
                onChange={(e) => setFormData({...formData, data: e.target.value})} 
                required 
              />
              <FormInput 
                label="Horário *" 
                type="time" 
                name="hora"
                value={formData.hora} 
                onChange={(e) => setFormData({...formData, hora: e.target.value})} 
                required 
              />
           </div>

           <div>
             <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Observações</label>
             <textarea 
               className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-600 min-h-[100px] resize-none"
               placeholder="Detalhes adicionais..."
               value={formData.observacoes}
               onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
             />
           </div>
        </div>
      </CadastroModal>

    </div>
  );
}