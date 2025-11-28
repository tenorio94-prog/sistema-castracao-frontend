"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Stethoscope, ArrowRight, Syringe, Scissors, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ViewModal from '@/components/modals/ViewModal';
import VisualizarProntuarioModal, { DocumentType } from './VisualizarProntuarioModal';
import { ClinicalRecordService, ClinicalRecord, CLINICAL_RECORD_TYPE_LABELS } from '@/services/medical-record.service';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  animalId: number | null;
};

export default function HistoricoProntuarioModal({ isOpen, onClose, patientName, animalId }: Props) {
  const [viewData, setViewData] = useState<any>(null);
  const [viewType, setViewType] = useState<DocumentType>('Clinica');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch clinical records when modal opens
  useEffect(() => {
    if (isOpen && animalId) {
      const fetchClinicalRecords = async () => {
        try {
          setLoading(true);
          const records = await ClinicalRecordService.getByAnimalId(animalId);
          setClinicalRecords(records);
        } catch (error: any) {
          console.error('Error fetching clinical records:', error);
          
          // Se o erro for 404 (prontuário não encontrado), apenas deixa vazio
          if (error.message.includes('not found') || error.message.includes('404')) {
            console.log('No medical record found for this animal yet');
            setClinicalRecords([]);
          } else {
            // Para outros erros, mostra mensagem
            toast.error('Erro ao carregar histórico clínico');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchClinicalRecords();
    }
  }, [isOpen, animalId]);

  const handleOpenRecord = (record: ClinicalRecord) => {
    // Map clinical record type to DocumentType
    const typeMap: Record<string, DocumentType> = {
      'triage': 'Clinica',
      'surgery': 'Cirurgica',
      'followUp': 'Clinica'
    };

    const docType = typeMap[record.type] || 'Clinica';
    
    setViewData(record);
    setViewType(docType);
    setIsViewerOpen(true);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'surgery': return <Scissors size={16} />;
      case 'triage': return <FileText size={16} />;
      case 'followUp': return <Stethoscope size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'surgery': return 'bg-blue-100 text-blue-700';
      case 'triage': return 'bg-purple-100 text-purple-700';
      case 'followUp': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <ViewModal isOpen={isOpen} onClose={onClose} title={`Prontuário: ${patientName}`}>
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-4">
             <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm">
               <FileText size={24} />
             </div>
             <div>
               <h4 className="font-bold text-gray-900">Histórico Médico</h4>
               <p className="text-xs text-gray-500">Clique em um registro para visualizar a ficha original.</p>
             </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Carregando registros...</p>
              </div>
            ) : clinicalRecords.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 font-medium">Nenhum registro clínico encontrado</p>
              </div>
            ) : (
              clinicalRecords.map((record) => (
                <div 
                  key={record.id} 
                  onClick={() => handleOpenRecord(record)}
                  className="group bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getColor(record.type)}`}>
                      {getIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-gray-800 text-sm">{CLINICAL_RECORD_TYPE_LABELS[record.type]}</h4>
                        <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">
                          {new Date(record.treatmentDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                         <Stethoscope size={10} /> {record.veterinarian?.user?.completeName || 'Veterinário não especificado'}
                      </p>
                      {record.observations && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{record.observations}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </ViewModal>

      <VisualizarProntuarioModal 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
        data={viewData} 
        type={viewType} 
      />
    </>
  );
}