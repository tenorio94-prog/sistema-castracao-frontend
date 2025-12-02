"use client";

import React, { useState } from "react";
import { Plus, Microscope, CheckCircle, Clock, Eye, Search } from "lucide-react";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FichaExameModal from '@/components/MedicoComponents/FichaExameModal'; 
import VisualizarProntuarioModal from '@/components/MedicoComponents/VisualizarProntuarioModal';

const mockExames = [
  { 
    id: "LAB-881", 
    date: "27/09/2025", 
    status: "Concluído", 
    vet: "Dr. House", 
    petName: "Amora", 
    ownerName: "Marcella",
    examType: "Hemograma Completo",
    results: "Eritrócitos: 6.2 mi/mm³\nHemoglobina: 14 g/dL\nLeucócitos: 9.500 /mm³\nPlaquetas: 280.000 /mm³\n\nBioquímica:\nUreia: 45 mg/dL\nCreatinina: 1.1 mg/dL",
    freeText: "Amostra de boa qualidade."
  },
  { 
    id: "LAB-882", 
    date: "28/09/2025", 
    status: "Processando", 
    vet: "Dra. Cameron", 
    petName: "Thor", 
    ownerName: "João",
    examType: "Ultrassom Abdominal",
    results: "Aguardando laudo do imaginologista...",
    freeText: ""
  },
];

const FichaExameItem = ({ data, onView }: { data: any, onView: (d: any) => void }) => {
  const statusColor = data.status === 'Concluído' 
    ? 'bg-green-50 text-green-700 border-green-100' 
    : 'bg-amber-50 text-amber-700 border-amber-100';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
          <Microscope size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
            {data.examType}
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{data.id}</span>
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span>{data.petName}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{data.date}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor} flex items-center gap-1.5`}>
          {data.status === 'Concluído' ? <CheckCircle size={12} /> : <Clock size={12} />}
          {data.status}
        </span>
        <button 
          onClick={() => onView(data)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <Eye size={16} />
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default function FichasExamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedExame, setSelectedExame] = useState<any>(null);

  const handleView = (ficha: any) => {
    setSelectedExame(ficha);
    setIsViewOpen(true);
  };

  // --- CORREÇÃO: LÓGICA DE FILTRAGEM IMPLEMENTADA ---
  const filteredExames = mockExames.filter(f => 
    f.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.examType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader 
          title="Exames & Laudos"
          description="Gestão de solicitações e resultados laboratoriais."
        />
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Nova Ficha</span>
        </button>
      </div>

      {/* BARRA DE BUSCA PADRONIZADA (CINZA) */}
      <div className="relative w-full md:w-1/2 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por paciente ou tipo de exame..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {/* Uso da lista filtrada em vez da completa */}
        {filteredExames.length > 0 ? (
          filteredExames.map((exame) => (
            <FichaExameItem key={exame.id} data={exame} onView={handleView} />
          ))
        ) : (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-medium">Nenhum exame encontrado.</p>
          </div>
        )}
      </div>

      {/* Modais */}
      <FichaExameModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        patientName="Selecione..." 
        ownerName=""
      />

      <VisualizarProntuarioModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        data={selectedExame} 
        type="Exame" 
      />

    </div>
  );
}