"use client";

import React, { useState, useEffect } from "react";
import { Plus, Scissors, CheckCircle, Clock, Eye, Search, AlertCircle, Loader2 } from "lucide-react";
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
  rawData: SurgicalRecord;
}

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
        const status = record.surgeryEnd ? 'Finalizada' : 'Em Andamento';
        const date = new Date(record.recordDate).toLocaleDateString('pt-BR');

        const petName = record.animalName || record.medicalRecord?.animal?.name || 'Não informado';

        return {
          id: `CIR-${record.id.toString().padStart(3, '0')}`,
          surgicalRecordId: record.id,
          date,
          status,
          cirurgiao: record.surgeon || 'Não informado',
          procedimento: record.performedOperation || record.proposedOperation || 'Procedimento não especificado',
          registro: record.recordNumber || '-',
          petName: petName,
          rawData: record
        };
      });
      
      setFichas(displayFichas);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível carregar as fichas.');
      toast.error('Erro de conexão com o servidor.');
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
    loadFichas(); // Recarrega a lista
  };

  const filteredFichas = fichas.filter(f => 
    f.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.procedimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.registro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <PageHeader title="Fichas Cirúrgicas" description="Registro e controle de procedimentos operatórios." />
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> <span>Nova Ficha</span>
        </button>
      </div>

      <div className="relative w-full md:w-1/2 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por paciente, procedimento ou registro..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
      ) : filteredFichas.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
          <Scissors className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">Nenhuma ficha encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFichas.map((ficha) => (
            <div key={ficha.surgicalRecordId} className="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                   <Scissors size={20} />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-800">{ficha.procedimento}</h4>
                   <div className="flex gap-2 text-xs text-gray-500 mt-1">
                     <span className="font-mono bg-gray-100 px-1 rounded">{ficha.id}</span>
                     <span>• {ficha.petName}</span>
                     <span>• {ficha.date}</span>
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ficha.status === 'Finalizada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                   {ficha.status}
                 </span>
                 <button onClick={() => handleView(ficha)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                   <Eye size={20} />
                 </button>
               </div>
            </div>
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