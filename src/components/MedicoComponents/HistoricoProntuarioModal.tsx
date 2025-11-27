"use client";

import React, { useState } from 'react';
import { FileText, Stethoscope, ArrowRight, Syringe, Scissors } from 'lucide-react';
import ViewModal from '@/components/modals/ViewModal';
import VisualizarProntuarioModal, { DocumentType } from './VisualizarProntuarioModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
};

const historyMock = [
  { 
    id: 103, 
    date: '25/09/2024', 
    type: 'Anestesica' as DocumentType, 
    vet: 'Marina (Anest)', 
    description: 'Anestesia OSH.',
    petName: 'Amora', weight: '22.2kg', asa: 'II', anesthetist: 'Marina', surgeon: 'Mateus',
    pre_fc: '120', pre_fr: '+AQ', pre_mucosas: 'Normo', pre_tpc: '2"', pre_temp: '38.5',
    mpa: ['Butorfanol 0,22ml IM', 'Acepromazina 0,16ml IM'],
    induction: ['Propofol 2mg/kg IV', 'Midazolam 0,2mg/kg IV'],
    intubation: 'Sim', tubeSize: '7.5', maintenanceAgent: 'Isoflurano', maintenanceType: 'Inalatória',
    extubationTime: '10:15', recoveryQuality: 'Rápida / Sem dor', painScore: '0',
    postOpMeds: 'Dexametasona 1mg/kg + Dipirona 25mg/kg',
    freeText: 'Paciente estável durante todo o procedimento.'
  },
  { 
    id: 102, 
    date: '25/09/2024', 
    type: 'Cirurgica' as DocumentType, 
    vet: 'Mateus (Cirurgião)', 
    description: 'Ovariohisterectomia.',
    registro: '25059', petName: 'Amora', species: 'Canina', breed: 'SRD', weight: '22.2kg', gender: 'Fêmea', ownerName: 'Marcella',
    surgeon: 'Mateus', anesthetist: 'Marina', assistant1: 'João', assistant2: '-',
    startTime: '09:19', endTime: '10:06', duration: '47min',
    preOpDiagnosis: 'Eletiva', postOpDiagnosis: 'Ovariohisterectomia realizada',
    propSurgery: 'OSH', realSurgery: 'OSH Terapêutica',
    opDescription: 'Incisão retro-umbilical, localização dos pedículos ovarianos e corpo uterino. Ligaduras com fio absorvível. Síntese da parede abdominal em padrão Sultan.',
    freeText: 'Sem intercorrências.'
  },
  { 
    id: 101, 
    date: '10/09/2024', 
    type: 'Clinica' as DocumentType, 
    vet: 'Dr. House', 
    description: 'Consulta Triagem.',
    petName: 'Amora', ownerName: 'Marcella', dateRaw: '10/09/2024',
    tr: '38.5', fc: '100', fr: '24', tpc: '2',
    anamnese: 'Animal trazido para avaliação pré-cirúrgica. Vacinação em dia.',
    ectoscopia: 'Pele íntegra, sem ectoparasitas. Linfonodos poplíteos e submandibulares normais.',
    abdominal: 'Palpação indolor. Bexiga moderadamente cheia.',
    cabeca: 'Mucosas normocoradas. Dentição completa.',
    neuro: 'Alerta, responsiva a estímulos.',
    torax: 'Ausculta pulmonar limpa bilteralmente.',
    locomotor: 'Sem claudicação.',
    diagProvavel: 'Hígido (ASA I).',
    diagDefinitivo: 'Apto para cirurgia.',
    freeText: 'Solicitado hemograma pré-operatório.'
  }
];

export default function HistoricoProntuarioModal({ isOpen, onClose, patientName }: Props) {
  const [viewData, setViewData] = useState<any>(null);
  const [viewType, setViewType] = useState<DocumentType>('Clinica');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenRecord = (record: any) => {
    // Mapeia description para o visualizador se necessário
    const dataToView = {
      ...record,
      // Garante que description interna do visualizador tenha valor se opDescription não existir
      opDescription: record.type === 'Cirurgica' ? record.opDescription : undefined
    };
    
    setViewData(dataToView);
    setViewType(record.type);
    setIsViewerOpen(true);
  };

  const getIcon = (type: DocumentType) => {
    switch(type) {
      case 'Cirurgica': return <Scissors size={16} />;
      case 'Anestesica': return <Syringe size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getColor = (type: DocumentType) => {
    switch(type) {
      case 'Cirurgica': return 'bg-blue-100 text-blue-700';
      case 'Anestesica': return 'bg-purple-100 text-purple-700';
      default: return 'bg-green-100 text-green-700';
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
            {historyMock.map((record) => (
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
                      <h4 className="font-bold text-gray-800 text-sm">{record.description}</h4>
                      <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">{record.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                       <Stethoscope size={10} /> {record.vet}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
              </div>
            ))}
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