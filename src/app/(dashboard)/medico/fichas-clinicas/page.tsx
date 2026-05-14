"use client";

import React, { useState, useEffect } from "react";
import { Plus, FileText, CheckCircle, Clock, Eye, Search, Loader2, Edit2 } from "lucide-react";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FichaClinicaModal from '@/components/MedicoComponents/FichaClinicaModal';
import VisualizarProntuarioModal from '@/components/MedicoComponents/VisualizarProntuarioModal';
import ClinicalRecordService, { ClinicalRecord } from '@/services/clinical-record.service';
import { toast } from 'sonner';

interface FichaDisplay {
  id: string;
  date: string;
  vet: string;
  petName: string;
  ownerName: string;
  type: string;
  treatmentDate: string;
  originalData: ClinicalRecord;
}

const FichaClinicaItem = ({ data, onView, onEdit }: { data: FichaDisplay, onView: (d: FichaDisplay) => void, onEdit: (d: FichaDisplay) => void }) => {
  const typeColors: Record<string, string> = {
    'triage': 'bg-blue-50 text-blue-700 border-blue-100',
    'surgery': 'bg-purple-50 text-purple-700 border-purple-100',
    'followUp': 'bg-green-50 text-green-700 border-green-100',
  };

  const typeLabels: Record<string, string> = {
    'triage': 'Triagem',
    'surgery': 'Cirurgia',
    'followUp': 'Retorno',
  };

  const colorClass = typeColors[data.type] || 'bg-gray-50 text-gray-700 border-gray-100';
  const typeLabel = typeLabels[data.type] || data.type;

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
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${colorClass} flex items-center gap-1.5`}>
          {typeLabel}
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onView(data)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
            Ver Detalhes
          </button>
          <button 
            onClick={() => onEdit(data)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FichasClinicasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaDisplay | null>(null);
  const [editFicha, setEditFicha] = useState<ClinicalRecord | null>(null);
  const [fichas, setFichas] = useState<FichaDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFichas();
  }, []);

  const loadFichas = async () => {
    try {
      setLoading(true);
      const records = await ClinicalRecordService.getAll();
      
      const formatted: FichaDisplay[] = records.map((record) => ({
        id: record.id.toString(),
        date: new Date(record.treatmentDate).toLocaleDateString('pt-BR'),
        vet: record.veterinarian?.user?.completeName || 'Veterinário',
        petName: record.animalName || record.medicalRecord?.animal?.name || 'Animal',
        ownerName: record.ownerName || record.medicalRecord?.animal?.petOwner?.user?.completeName || 'Responsável',
        type: record.type,
        treatmentDate: record.treatmentDate,
        originalData: record,
      }));

      setFichas(formatted);
    } catch (error: any) {
      console.error('Error loading clinical records:', error);
      toast.error(error.message || 'Erro ao carregar fichas clínicas');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (ficha: FichaDisplay) => {
    try {
      // Busca o registro completo com todas as relações do backend
      const fullRecord = await ClinicalRecordService.getById(parseInt(ficha.id));
      setSelectedFicha({ ...ficha, originalData: fullRecord });
      setIsViewOpen(true);
    } catch (error: any) {
      console.error('Error loading full clinical record:', error);
      // Se falhar, usa os dados que já temos
      setSelectedFicha(ficha);
      setIsViewOpen(true);
      toast.error('Alguns detalhes podem não estar disponíveis');
    }
  };

  const handleEdit = (ficha: FichaDisplay) => {
    setEditFicha(ficha.originalData);
  };

  const handleEditSuccess = () => {
    loadFichas();
    setEditFicha(null);
    toast.success('Ficha clínica atualizada com sucesso!');
  };

  const handleCreateSuccess = () => {
    loadFichas();
    setIsCreateOpen(false);
    toast.success('Ficha clínica criada com sucesso!');
  };

  const filteredFichas = fichas.filter(f => 
    f.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.vet.toLowerCase().includes(searchTerm.toLowerCase())
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

      <div className="relative w-full md:w-1/2 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por paciente, tutor ou veterinário..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : filteredFichas.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            {searchTerm ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha clínica cadastrada'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFichas.map((ficha) => (
            <FichaClinicaItem key={ficha.id} data={ficha} onView={handleView} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <FichaClinicaModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      <FichaClinicaModal 
        isOpen={!!editFicha} 
        onClose={() => setEditFicha(null)}
        onSuccess={handleEditSuccess}
        editData={editFicha || undefined}
      />
      <VisualizarProntuarioModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        data={selectedFicha?.originalData} 
        type="Clinica" 
      />

    </div>
  );
}