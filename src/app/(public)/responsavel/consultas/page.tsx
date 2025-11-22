"use client";

import React, { useState } from 'react';
import { Plus, CalendarDays, Search, Filter, ChevronDown } from 'lucide-react';
import ConsultaCard, { ConsultaResponsavelUI } from '@/components/ResponsavelComponents/CardConsulta';
import NovaConsultaModal from '@/components/ResponsavelComponents/NovaConsulta';
import DetalhesConsultaModal, { DetalhesData } from '@/components/ResponsavelComponents/DetalhesConsulta';

// --- Mock Data ---
const mockConsultas: ConsultaResponsavelUI[] = [
  {
    id: '1',
    title: 'Consulta de Rotina',
    petName: 'Rex',
    date: '15/04/2026',
    time: '14:00',
    veterinarian: 'Dra. Maria Silva',
    clinic: 'Unidade Central',
    status: 'Agendado'
  },
  {
    id: '2',
    title: 'Vacinação V10',
    petName: 'Mel',
    date: '20/04/2026',
    time: '09:30',
    veterinarian: 'Dr. João Costa',
    clinic: 'Unidade Boa Viagem',
    status: 'Agendado'
  },
  {
    id: '3',
    title: 'Retorno Cirúrgico',
    petName: 'Thor',
    date: '10/03/2026',
    time: '16:00',
    veterinarian: 'Dra. Carla Dias',
    status: 'Concluído'
  }
];

// --- Mocks para Detalhes ---
const mockFullDetails: DetalhesData = {
  id: 1,
  protocolo: '#123456',
  status: 'Concluído',
  responsavel: { nome: 'Ana Paula', cpf: '123.456.789-00', telefone: '(81) 98888-7777', email: 'ana@email.com' },
  paciente: { nome: 'Rex', especie: 'Cachorro', raca: 'Pastor Alemão', sexo: 'Macho', idade: '5 anos', peso: '30kg' },
  servico: { procedimento: 'Primeira Consulta', data: '14/01/2026', horario: '14:00', observacoes: 'Animal clinicamente saudável.' }
};

export default function ConsultasPage() {
  const [consultas, setConsultas] = useState<ConsultaResponsavelUI[]>(mockConsultas);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Consulta' | 'Castração'>('Todos');

  // Modais
  const [isNewConsultModalOpen, setIsNewConsultModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetalhesData | null>(null);

  // --- Handlers ---
  const handleDetalhes = (consulta: ConsultaResponsavelUI) => {
    // Transformar dados parciais em completos (Mock)
    setSelectedDetails({ 
        ...mockFullDetails, 
        status: consulta.status, 
        servico: { ...mockFullDetails.servico, procedimento: consulta.title, data: consulta.date, horario: consulta.time } 
    });
    setIsDetailsModalOpen(true);
  };

  const handleSaveConsulta = (data: any) => {
    const novaConsulta: ConsultaResponsavelUI = {
      id: Math.random().toString(),
      title: data.tipo, 
      petName: data.animal, 
      date: data.data.split('-').reverse().join('/'), 
      time: data.horario,
      veterinarian: 'A definir',
      status: 'Agendado',
      clinic: 'Unidade Central'
    };
    setConsultas(prev => [novaConsulta, ...prev]);
    setIsNewConsultModalOpen(false);
    alert('Solicitação enviada com sucesso!');
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
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Minhas Consultas</h1>
          <p className="text-gray-500 mt-1">
            Acompanhe seu histórico e próximos agendamentos.
          </p>
        </div>

        <button 
          onClick={() => setIsNewConsultModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Barra de Ferramentas */}
      <div className="flex flex-col sm:flex-row gap-3">
        
        {/* Busca (Ajustada para max-w-md como nas outras telas) */}
        <div className="relative grow sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por animal ou procedimento..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de Tipo (Estilizado e Padronizado) */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Consulta">Consulta</option>
            <option value="Castração">Castração</option>
          </select>
          {/* Ícone de Chevron Customizado */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>

      </div>

      {/* Lista de Cards */}
      <div className="space-y-4">
        {filteredConsultas.length > 0 ? (
          filteredConsultas.map((consulta) => (
            <ConsultaCard 
              key={consulta.id} 
              consulta={consulta} 
              onDetalhes={handleDetalhes}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="p-4 bg-gray-50 rounded-full mb-3">
              <CalendarDays className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-900 font-medium">Nenhuma consulta encontrada.</p>
            <p className="text-gray-500 text-sm mt-1">
              {filterType !== 'Todos' 
                ? `Nenhum resultado para "${filterType}".` 
                : 'Agende uma nova consulta para começar.'}
            </p>
          </div>
        )}
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