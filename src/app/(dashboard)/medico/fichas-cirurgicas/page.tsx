"use client";

import React, { useState, useEffect } from "react";
import { Plus, Scissors, CheckCircle, Clock, Eye, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FichaCirurgicaModal from '@/components/MedicoComponents/FichaCirurgicaModal'; 
import VisualizarProntuarioModal from '@/components/MedicoComponents/VisualizarProntuarioModal';
import { SurgicalRecordService, SurgicalRecord } from '@/services/surgical-record.service';

interface FichaDisplay {
  id: string;
  surgicalRecordId: number;
  date: string;
  status: string;
  cirurgiao: string;
  procedimento: string;
  registro: string;
  petName: string;
  species: string;
  breed: string;
  coat: string;
  size: string;
  gender: string;
  age: string;
  weight: string;
  ownerName: string;
  phone: string;
  ownerAddress: string;
  anesthetist: string;
  assistant1: string;
  assistant2: string;
  instrumentator: string;
  duration: string;
  startTime: string;
  endTime?: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  propSurgery: string;
  realSurgery?: string;
  materials: string;
  postOpControl: string;
  opDescription: string;
  freeText: string;
  rawData: SurgicalRecord;
}

const FichaCirurgicaItem = ({ data, onView }: { data: FichaDisplay, onView: (d: FichaDisplay) => void }) => {
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
            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">#{data.registro}</span>
            <span>•</span>
            <span>{data.petName}</span>
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
        <button onClick={() => onView(data)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
          <Eye size={16} /> Ver Detalhes
        </button>
      </div>
    </div>
  );
};

export default function FichasCirurgicasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<FichaDisplay | null>(null);
  const [fichas, setFichas] = useState<FichaDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFichas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const records = await SurgicalRecordService.getAll();
      
      const displayFichas: FichaDisplay[] = records.map((record) => {
        // Determinar status baseado em se a cirurgia foi finalizada
        const status = record.surgeryEnd ? 'Finalizada' : 'Em Andamento';
        
        // Formatar data
        const date = new Date(record.recordDate).toLocaleDateString('pt-BR');
        
        // Formatar hora de início
        const startTime = record.surgeryStart 
          ? new Date(record.surgeryStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '-';
        
        // Formatar hora de fim
        const endTime = record.surgeryEnd
          ? new Date(record.surgeryEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : undefined;

        // Mapear espécie
        const speciesMap: Record<string, string> = {
          'canine': 'Canino',
          'feline': 'Felino'
        };
        
        // Mapear gênero
        const genderMap: Record<string, string> = {
          'male': 'Macho',
          'female': 'Fêmea'
        };

        return {
          id: `CIR-${record.id.toString().padStart(3, '0')}`,
          surgicalRecordId: record.id,
          date,
          status,
          cirurgiao: record.surgeon || 'Não informado',
          procedimento: record.performedOperation || record.proposedOperation || 'Procedimento não especificado',
          registro: record.recordNumber || record.id.toString(),
          petName: record.animalName || record.medicalRecord?.animal?.name || 'Não informado',
          species: record.species || (record.medicalRecord?.animal?.species ? speciesMap[record.medicalRecord.animal.species] : 'Não informada'),
          breed: record.breed || record.medicalRecord?.animal?.breed || 'SRD',
          coat: record.coat || '',
          size: record.size || '',
          gender: record.gender || (record.medicalRecord?.animal?.gender ? genderMap[record.medicalRecord.animal.gender] : ''),
          age: record.age || record.medicalRecord?.animal?.estimatedAge || '',
          weight: record.weight || record.medicalRecord?.animal?.sizeWeight || 'Não informado',
          ownerName: record.ownerName || record.medicalRecord?.animal?.petOwner?.user?.completeName || 'Não informado',
          phone: record.ownerPhone || record.medicalRecord?.animal?.petOwner?.user?.phone || '',
          ownerAddress: record.ownerAddress || record.medicalRecord?.animal?.petOwner?.fullAddress || '',
          anesthetist: record.anesthetist || 'Não informado',
          assistant1: record.firstAssistant || '',
          assistant2: record.secondAssistant || '',
          instrumentator: record.instrumentator || '',
          duration: record.duration || '',
          startTime,
          endTime,
          preOpDiagnosis: record.preoperativeDiagnosis || 'Não informado',
          postOpDiagnosis: record.postoperativeDiagnosis || '',
          propSurgery: record.proposedOperation || '',
          realSurgery: record.performedOperation || undefined,
          materials: record.materialsUsed || '',
          postOpControl: record.postoperativeControl || '',
          opDescription: record.operationDescription || 'Sem descrição',
          freeText: record.additionalObservations || '',
          rawData: record
        };
      });
      
      setFichas(displayFichas);
      console.log('📋 Fichas cirúrgicas carregadas:', displayFichas.length);
    } catch (err: any) {
      console.error('❌ Erro ao carregar fichas:', err);
      setError(err.message || 'Erro ao carregar fichas cirúrgicas');
      toast.error('Erro ao carregar fichas cirúrgicas', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFichas();
  }, []);

  const handleView = (ficha: FichaDisplay) => {
    setSelectedFicha(ficha);
    setIsViewOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    loadFichas();
    toast.success('Ficha cirúrgica criada com sucesso!');
  };

  const filteredFichas = fichas.filter(f => 
    f.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cirurgiao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.registro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader title="Fichas Cirúrgicas" description="Relatórios de procedimentos cirúrgicos realizados." />
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500">Carregando fichas cirúrgicas...</p>
        </div>
      </div>
    );
  }

  if (error && fichas.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader title="Fichas Cirúrgicas" description="Relatórios de procedimentos cirúrgicos realizados." />
        <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
          <AlertCircle className="text-red-500" size={48} />
          <p className="text-lg text-gray-600">{error}</p>
          <button 
            onClick={loadFichas}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader title="Fichas Cirúrgicas" description="Relatórios de procedimentos cirúrgicos realizados." />
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> <span>Registrar Cirurgia</span>
        </button>
      </div>

      <div className="relative w-full md:w-1/2 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por paciente, procedimento, cirurgião ou registro..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredFichas.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Scissors className="text-gray-300" size={64} />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Nenhuma ficha encontrada com esses critérios' : 'Nenhuma ficha cirúrgica registrada ainda'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFichas.map((ficha) => (
            <FichaCirurgicaItem key={ficha.surgicalRecordId} data={ficha} onView={handleView} />
          ))}
        </div>
      )}

      <FichaCirurgicaModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={handleCreateSuccess}
      />
      <VisualizarProntuarioModal 
        isOpen={isViewOpen} 
        onClose={() => setIsViewOpen(false)} 
        data={selectedFicha?.rawData} 
        type="Cirurgica" 
      />
    </div>
  );
}