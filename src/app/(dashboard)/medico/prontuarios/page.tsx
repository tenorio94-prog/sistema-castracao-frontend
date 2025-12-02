"use client";

import React, { useState, useEffect } from "react";
import { Search, FileText, Dog, Cat, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import HistoricoProntuarioModal from '@/components/MedicoComponents/HistoricoProntuarioModal';
import { MedicalRecordService, MedicalRecord } from '@/services/medical-record.service';
import { SPECIES_LABELS } from '@/services/animal.service';

interface PatientUI {
  id: string;
  name: string;
  owner: string;
  age: string;
  species: string;
  breed: string;
  lastVisit: string;
  animalId: number;
  medicalRecordId: number;
}

export default function BuscarProntuarioPage() {
  const [patients, setPatients] = useState<PatientUI[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Todos' | 'Caninos' | 'Felinos'>('Todos');
  const [loading, setLoading] = useState(true);
  
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);

  // Convert medical record to PatientUI
  const convertToPatientUI = (record: MedicalRecord): PatientUI => {
    const lastRecord = record.clinicalRecords?.[0];
    const lastVisit = lastRecord 
      ? new Date(lastRecord.treatmentDate).toLocaleDateString('pt-BR')
      : 'Sem registros';

    return {
      id: record.id.toString(),
      name: record.animal?.name || 'Sem nome',
      owner: record.animal?.petOwner?.user?.completeName || 'Desconhecido',
      age: record.animal?.estimatedAge || 'Desconhecida',
      species: record.animal ? SPECIES_LABELS[record.animal.species as keyof typeof SPECIES_LABELS] : 'Desconhecida',
      breed: record.animal?.breed || 'SRD',
      lastVisit,
      animalId: record.animalId,
      medicalRecordId: record.id
    };
  };

  // Fetch medical records
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const data = await MedicalRecordService.getAll();
        const converted = data.map(convertToPatientUI);
        setPatients(converted);
      } catch (error: any) {
        console.error('Error fetching medical records:', error);
        toast.error('Erro ao carregar prontuários');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  // Handler para abrir o histórico
  const handleOpenProntuario = (patient: PatientUI) => {
    setSelectedPatientName(patient.name);
    setSelectedAnimalId(patient.animalId);
    setIsProntuarioOpen(true);
  };

  // Filtragem
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'Caninos') matchesTab = p.species.includes('Canin');
    if (activeTab === 'Felinos') matchesTab = p.species.includes('Felin');

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
          <p className="text-gray-500">Carregando prontuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="Buscar Prontuário"
        description="Acesse o histórico clínico completo dos pacientes."
      />

      {/* BARRA DE FERRAMENTAS PADRONIZADA */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Busca (Esquerda) */}
        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome do animal, tutor ou registro..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all placeholder-gray-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros (Direita) */}
        <div className="flex p-1 bg-gray-100 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full no-scrollbar">
          {(['Todos', 'Caninos', 'Felinos'] as const).map((tab) => (
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

      {/* Grid de Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-green-200 transition-all duration-200 flex flex-col">
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                  {patient.species.includes('Canin') ? <Dog size={28} /> : <Cat size={28} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{patient.breed} • {patient.age}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 grow">
              <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Responsável</span>
                <span className="font-medium text-gray-900">{patient.owner}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-500">Última Visita</span>
                <span className="font-medium text-gray-900">{patient.lastVisit}</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenProntuario(patient)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-900 hover:text-white transition-all"
            >
              <FileText size={18} />
              Acessar Prontuário
            </button>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 font-medium">Nenhum paciente encontrado.</p>
        </div>
      )}

      <HistoricoProntuarioModal 
        isOpen={isProntuarioOpen}
        onClose={() => setIsProntuarioOpen(false)}
        patientName={selectedPatientName}
        animalId={selectedAnimalId}
      />

    </div>
  );
}