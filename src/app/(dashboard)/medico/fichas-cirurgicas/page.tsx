"use client";

import React, { useState } from "react";
import { Plus, Scissors, CheckCircle, Clock, Eye } from "lucide-react";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FichaCirurgicaModal from '@/components/MedicoComponents/FichaCirurgicaModal'; // Novo modal
import VisualizarProntuarioModal from '@/components/MedicoComponents/VisualizarProntuarioModal';

// --- Mocks de Fichas Cirúrgicas ---
const mockFichas = [
  { 
    id: "CIR-099", 
    date: "27/09/2025", 
    status: "Em Andamento", 
    cirurgiao: "Dr. House", 
    procedimento: "Ovariohisterectomia (OSH)",
    // Dados Detalhados
    registro: '25059', petName: 'Amora', species: 'Canina', breed: 'SRD', weight: '22kg', ownerName: 'Marcella',
    anesthetist: 'Marina', assistant1: 'João', assistant2: '-', instrumentator: 'Ana',
    startTime: '09:19', endTime: '-', duration: 'Em curso',
    preOpDiagnosis: 'Eletiva', opDescription: 'Procedimento em curso...',
    freeText: 'Animal estável.'
  },
  { 
    id: "CIR-098", 
    date: "25/09/2025", 
    status: "Finalizada", 
    cirurgiao: "Dr. Wilson", 
    procedimento: "Orquiectomia",
    // Dados Detalhados
    registro: '25050', petName: 'Thor', species: 'Canina', breed: 'Golden', weight: '30kg', ownerName: 'Pedro',
    anesthetist: 'Dra. Cuddy', assistant1: '-', assistant2: '-', instrumentator: 'Lucas',
    startTime: '14:00', endTime: '14:45', duration: '45min',
    preOpDiagnosis: 'Eletiva', realSurgery: 'Orquiectomia Bilateral',
    opDescription: 'Incisão pré-escrotal, exposição dos testículos, ligadura do cordão espermático...',
    freeText: 'Recuperação tranquila.'
  },
];

const FichaCirurgicaItem = ({ data, onView }: { data: any, onView: (d: any) => void }) => {
  const statusColor = data.status === 'Finalizada' 
    ? 'bg-green-50 text-green-700 border-green-100' 
    : 'bg-blue-50 text-blue-700 border-blue-100';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
          <Scissors size={24} />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900">{data.procedimento}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">#{data.id}</span>
            <span>•</span>
            <span>{data.date}</span>
            <span>•</span>
            <span>{data.cirurgiao}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColor} flex items-center gap-1.5`}>
          {data.status === 'Finalizada' ? <CheckCircle size={12} /> : <Clock size={12} />}
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

export default function FichasCirurgicasPage() {
  const [fichas, setFichas] = useState(mockFichas);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<any>(null);

  const handleView = (ficha: any) => {
    setSelectedFicha(ficha);
    setIsViewOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader 
          title="Fichas Cirúrgicas"
          description="Relatórios de procedimentos cirúrgicos realizados."
        />
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Registrar Cirurgia</span>
        </button>
      </div>

      <div className="space-y-4">
        {fichas.map((ficha) => (
          <FichaCirurgicaItem key={ficha.id} data={ficha} onView={handleView} />
        ))}
      </div>

      {/* Modal de Preenchimento */}
      <FichaCirurgicaModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        patientName="Selecione..." // Mock
        ownerName=""
      />

      {/* Modal de Visualização */}
      <VisualizarProntuarioModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        data={selectedFicha} 
        type="Cirurgica" 
      />

    </div>
  );
}