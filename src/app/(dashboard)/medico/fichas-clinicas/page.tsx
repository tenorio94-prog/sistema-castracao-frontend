"use client";

import React, { useState } from "react";
import { Plus, FileText, CheckCircle, Clock, Eye, Search } from "lucide-react";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FichaClinicaModal from '@/components/MedicoComponents/FichaClinicaModal';
import VisualizarProntuarioModal from '@/components/MedicoComponents/VisualizarProntuarioModal';

const mockFichas = [
  { 
    id: "1023", date: "27/09/2025", status: "Aguardando", vet: "João Santos (Est)", petName: "Thor", ownerName: "Carlos Silva",
    tr: '38.5', fc: '100', fr: '24', tpc: '2',
    anamnese: 'Animal com histórico de vômitos há 2 dias. Apatia e recusa alimentar.',
    ectoscopia: 'Desidratação leve (5%). Mucosas levemente pálidas.',
    diagnosis: 'Gastrite aguda a esclarecer.', conduta: 'Fluidoterapia, antiemético e ultrassom abdominal.',
  },
  { 
    id: "1022", date: "26/09/2025", status: "Validada", vet: "Dr. House", petName: "Luna", ownerName: "Ana Maria",
    tr: '39.0', fc: '140', fr: '30', tpc: '1',
    anamnese: 'Retorno para avaliação pós-cirúrgica de OSH.',
    diagnosis: 'Pós-operatório saudável.', conduta: 'Alta médica.',
  },
];

const FichaClinicaItem = ({ data, onView }: { data: any, onView: (d: any) => void }) => {
  const statusColor = data.status === 'Validada' 
    ? 'bg-green-50 text-green-700 border-green-100' 
    : 'bg-amber-50 text-amber-700 border-amber-100';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
            {data.petName}
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{data.id}</span>
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span>{data.date}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{data.vet}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor} flex items-center gap-1.5`}>
          {data.status === 'Validada' ? <CheckCircle size={12} /> : <Clock size={12} />}
          {data.status}
        </span>
        <button 
          onClick={() => onView(data)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye size={16} />
          Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default function FichasClinicasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<any>(null);

  const handleView = (ficha: any) => {
    setSelectedFicha(ficha);
    setIsViewOpen(true);
  };

  const filteredFichas = mockFichas.filter(f => 
    f.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader 
          title="Fichas Clínicas"
          description="Histórico de avaliações e consultas realizadas."
        />
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Nova Ficha</span>
        </button>
      </div>

      {/* BARRA DE BUSCA PADRONIZADA */}
      <div className="relative w-full md:w-1/2 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por paciente ou tutor..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredFichas.map((ficha) => (
          <FichaClinicaItem key={ficha.id} data={ficha} onView={handleView} />
        ))}
      </div>

      <FichaClinicaModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} patientName="Selecione..." ownerName="" animalId={null} />
      <VisualizarProntuarioModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} data={selectedFicha} type="Clinica" />

    </div>
  );
}