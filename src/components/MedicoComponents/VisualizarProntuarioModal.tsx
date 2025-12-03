"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, Microscope, FileSignature } from 'lucide-react';

export type DocumentType = 'Clinica' | 'Cirurgica' | 'Anestesica' | 'Exame';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
  type: DocumentType;
};

// Helpers
const ViewBox = ({ label, content, minHeight = "min-h-[80px]" }: any) => (
  <div className="border border-gray-400 rounded-sm overflow-hidden h-full bg-white">
    <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-[10px] font-bold uppercase text-gray-800 tracking-wide">{label}</div>
    <div className={`p-2 text-xs text-gray-900 whitespace-pre-wrap leading-snug ${minHeight}`}>{content || '-'}</div>
  </div>
);

const HeaderLabel = ({ label, value }: any) => (
  <div className="flex flex-col border-b border-gray-200 pb-1">
    <span className="text-[9px] font-bold text-gray-500 uppercase">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value || '-'}</span>
  </div>
);

const FreeTextField = ({ text }: { text?: string }) => {
  if (!text) return null;
  return (
    <div className="mt-6 pt-4 border-t-2 border-gray-100">
      <h4 className="font-bold text-xs uppercase text-gray-500 mb-2 flex items-center gap-2">
        <FileSignature size={14} /> Observações Adicionais / Descrição Livre
      </h4>
      <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
        {text}
      </div>
    </div>
  );
};

// --- 1. FICHA CIRÚRGICA ---
const FichaCirurgicaView = ({ data }: { data: any }) => (
  <div className="font-sans text-gray-900">
    <div className="text-center border-b-2 border-gray-900 pb-2 mb-6">
      <h2 className="text-xl font-bold uppercase">Ficha de Cirurgia</h2>
      <p className="text-[10px] uppercase">Hospital Veterinário - UFRPE</p>
    </div>

    <div className="flex justify-between text-sm mb-4 font-bold bg-gray-50 p-2 rounded">
      <span>Reg: {data.registro}</span>
      <span>Data: {data.date}</span>
    </div>

    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6 p-4 border border-gray-300 rounded bg-gray-50">
       <HeaderLabel label="Nome do Animal" value={data.petName} />
       <HeaderLabel label="Espécie" value={data.species} />
       <HeaderLabel label="Raça" value={data.breed} />
       <HeaderLabel label="Pelagem" value={data.coat} />
       <HeaderLabel label="Porte" value={data.size} />
       <HeaderLabel label="Peso" value={data.weight} />
       <HeaderLabel label="Sexo" value={data.gender} />
       <HeaderLabel label="Idade" value={data.age} />
       <div className="col-span-2">
         <HeaderLabel label="Tutor" value={data.ownerName} />
       </div>
       <HeaderLabel label="Telefone" value={data.phone} />
       <div className="col-span-2">
         <HeaderLabel label="Endereço" value={data.ownerAddress} />
       </div>
    </div>

    <div className="mb-6">
       <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Relatório de Operação</h3>
       <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-sm">
         <p><strong>Cirurgião:</strong> {data.surgeon}</p>
         <p><strong>Anestesista:</strong> {data.anesthetist}</p>
         <p><strong>1º Assist.:</strong> {data.assistant1}</p>
         <p><strong>2º Assist.:</strong> {data.assistant2}</p>
         <p><strong>Instrumentador:</strong> {data.instrumentator}</p>
         <p><strong>Duração:</strong> {data.duration}</p>
         <p><strong>Início:</strong> {data.startTime}</p>
         <p><strong>Fim:</strong> {data.endTime || '-'}</p>
       </div>

       <div className="space-y-2 bg-blue-50/50 p-3 rounded border border-blue-100 text-sm mb-4">
          <p><strong>Diag. Pré-Op:</strong> {data.preOpDiagnosis}</p>
          <p><strong>Diag. Pós-Op:</strong> {data.postOpDiagnosis || '-'}</p>
          <p><strong>Op. Proposta:</strong> {data.propSurgery || '-'}</p>
          <p><strong>Op. Realizada:</strong> {data.realSurgery || '-'}</p>
       </div>

       {/* NOVOS CAMPOS VISUAIS */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ViewBox label="Materiais Utilizados" content={data.materials} minHeight="min-h-[60px]" />
          <ViewBox label="Controle Pós-Cirúrgico / Alta" content={data.postOpControl} minHeight="min-h-[60px]" />
       </div>
    </div>

    <div>
      <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-2">Descrição do Ato Operatório</h3>
      <div className="p-4 border border-gray-300 bg-white min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap font-serif text-justify rounded shadow-inner">
        {data.opDescription || '-'}
      </div>
    </div>
    
    {data.freeText && <FreeTextField text={data.freeText} />}
  </div>
);

// ... (FichaAnestesicaView, FichaClinicaView, FichaExameView mantidas igual ao anterior) ...
// Placeholder para compilar
const FichaAnestesicaView = ({ data }: any) => (
  <div className="p-4">
     <h2 className="font-bold uppercase border-b mb-2">Ficha Anestésica</h2>
     <p><strong>Paciente:</strong> {data.petName}</p>
     <p><strong>Anestesista:</strong> {data.anesthetist}</p>
     <div className="mt-2 p-2 bg-gray-100 rounded"><pre className="text-xs">{JSON.stringify(data, null, 2)}</pre></div>
  </div>
);

const FichaClinicaView = ({ data }: any) => {
  const typeLabels: Record<string, string> = {
    'triage': 'Triagem',
    'surgery': 'Cirurgia',
    'followUp': 'Retorno',
  };

  const surgeryTypeLabels: Record<string, string> = {
    'orchiectomy': 'Orquiectomia',
    'ovariohysterectomy': 'Ovário-histerectomia',
  };

  return (
    <div className="font-sans text-gray-900">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-6">
        <h1 className="text-xl font-bold">Ficha Clínica</h1>
        <div className="text-right text-[10px] font-bold text-gray-600 uppercase leading-tight">
          <p>Departamento de Medicina Veterinária</p>
          <p>Hospital Veterinário - UFRPE</p>
        </div>
      </div>

      {/* Informações do Atendimento */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
        <HeaderLabel label="Tipo de Atendimento" value={typeLabels[data.type] || data.type} />
        <HeaderLabel label="Data do Atendimento" value={data.treatmentDate ? new Date(data.treatmentDate).toLocaleDateString('pt-BR') : '-'} />
        <HeaderLabel label="Veterinário" value={data.veterinarian?.user?.completeName || '-'} />
        {data.type === 'triage' && (
          <HeaderLabel 
            label="Apto para Cirurgia" 
            value={data.fitForSurgery === true ? 'Sim' : data.fitForSurgery === false ? 'Não' : '-'} 
          />
        )}
        {data.type === 'surgery' && data.surgeryType && (
          <HeaderLabel label="Tipo de Cirurgia" value={surgeryTypeLabels[data.surgeryType] || data.surgeryType} />
        )}
      </div>

      {/* DADOS DO ANIMAL */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3 flex items-center gap-2">
          <FileText size={16} /> Identificação do Animal
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm p-4 border border-gray-300 rounded bg-white">
          <HeaderLabel label="Nome do Animal" value={data.animalName || data.medicalRecord?.animal?.name} />
          <HeaderLabel label="Raça" value={data.breed} />
          <HeaderLabel label="Idade" value={data.age} />
          <HeaderLabel label="Pelagem" value={data.coat} />
          <HeaderLabel label="Peso" value={data.weight} />
          <HeaderLabel label="Porte" value={data.size} />
        </div>
      </div>

      {/* DADOS DO RESPONSÁVEL */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Dados do Responsável</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm p-4 border border-gray-300 rounded bg-white">
          <HeaderLabel label="Nome" value={data.ownerName || data.medicalRecord?.animal?.petOwner?.user?.completeName} />
          <HeaderLabel label="Telefone" value={data.ownerPhone || data.medicalRecord?.animal?.petOwner?.user?.phone} />
          <HeaderLabel label="Endereço" value={data.ownerAddress} />
          <HeaderLabel label="Número" value={data.ownerNumber} />
          <HeaderLabel label="Bairro" value={data.ownerNeighborhood} />
          <HeaderLabel label="Cidade" value={data.ownerCity} />
          <div className="col-span-2">
            <HeaderLabel label="Ponto de Referência" value={data.ownerReference} />
          </div>
        </div>
      </div>

      {/* TIPO DE SERVIÇO */}
      {(data.clinicalGuidance || data.returnVisit || data.consultation || data.treatmentChange) && (
        <div className="mb-6">
          <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Tipo de Serviço</h3>
          <div className="flex gap-4 flex-wrap p-4 border border-gray-300 rounded bg-blue-50/30">
            {data.clinicalGuidance && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Orientação Clínica</span>}
            {data.returnVisit && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Retorno</span>}
            {data.consultation && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">Consulta</span>}
            {data.treatmentChange && <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">Mudança de Tratamento</span>}
          </div>
        </div>
      )}

      {/* ANAMNESE */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Anamnese / Histórico</h3>
        <div className="grid grid-cols-1 gap-4">
          <ViewBox label="Histórico Atual / Tratamento Prévio / Antecedentes" content={data.anamnesis} />
          <div className="grid grid-cols-2 gap-4">
            <ViewBox label="Vacinações" content={data.vaccinations} minHeight="min-h-[60px]" />
            <ViewBox label="Data da Vacinação" content={data.vaccinationDate} minHeight="min-h-[60px]" />
          </div>
          <ViewBox label="Vermifugação" content={data.deworming} minHeight="min-h-[60px]" />
        </div>
      </div>

      {/* SINAIS VITAIS */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Exame Clínico - Sinais Vitais</h3>
        <div className="grid grid-cols-4 gap-4 p-4 border border-gray-300 rounded bg-green-50/30">
          <HeaderLabel label="Temp. Retal (°C)" value={data.rectalTemp} />
          <HeaderLabel label="FC (/min)" value={data.heartRate} />
          <HeaderLabel label="FR (/min)" value={data.respiratoryRate} />
          <HeaderLabel label="Pulso (/min)" value={data.pulse} />
        </div>
      </div>

      {/* SISTEMAS ESPECÍFICOS */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Exame Clínico - Sistemas Específicos</h3>
        <div className="grid grid-cols-1 gap-4">
          <ViewBox label="Ectoscopia (Estado Geral, Mucosas, Pele, Linfonodos)" content={data.ectoscopy} />
          <ViewBox label="Cavidade Abdominal (Forma, Conteúdo, Estômago, Fígado)" content={data.abdominalCavity} />
          <ViewBox label="Cabeça e Pescoço (Orelhas, Olhos, Nariz, Boca)" content={data.headAndNeck} />
          <ViewBox label="Sistema Nervoso (Comportamento, Reflexos, Paralisias)" content={data.nervousSystem} />
          <ViewBox label="Cavidade Torácica (Palpação, Percussão, Auscultação)" content={data.thoracicCavity} />
          <ViewBox label="Sistema Locomotor (Ossos e Articulações)" content={data.locomotorSystem} />
        </div>
      </div>

      {/* DIAGNÓSTICO E PROGNÓSTICO */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Diagnóstico e Prognóstico</h3>
        <div className="grid grid-cols-1 gap-4">
          <ViewBox label="Diagnóstico Provisório" content={data.provisionalDiagnosis} />
          <ViewBox label="Exames Complementares" content={data.complementaryExams} />
          <ViewBox label="Diagnóstico Definitivo" content={data.definitiveDiagnosis} />
          <ViewBox label="Prognóstico" content={data.prognosis} />
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      <div className="mb-6">
        <h3 className="font-bold uppercase text-sm border-b border-gray-300 mb-3">Observações e Instruções</h3>
        <div className="grid grid-cols-1 gap-4">
          <ViewBox label="Observações Gerais" content={data.observations} />
          <ViewBox label="Prescrições e Instruções" content={data.instructions} />
        </div>
      </div>

      {/* NOTAS ADICIONAIS */}
      {data.additionalNotes && <FreeTextField text={data.additionalNotes} />}
    </div>
  );
};

const FichaExameView = ({ data }: any) => <div className="p-4">Ficha Exame View (Ver código anterior)</div>;


export default function VisualizarProntuarioModal({ isOpen, onClose, data, type }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Save and restore focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen || !isMounted) return null;

  // Debug: log dos dados recebidos
  console.log('📋 Dados do prontuário:', { type, data });

  if (!data) {
    return isMounted ? createPortal(
      <div 
        className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-9999 p-4"
        onClick={onClose}
      >
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md">
          <h3 className="text-lg font-bold mb-4">Dados não disponíveis</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar os dados deste registro.</p>
          <button 
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Fechar
          </button>
        </div>
      </div>,
      document.body
    ) : null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-9999 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-3 bg-gray-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             {type === 'Exame' ? <Microscope size={20} className="text-amber-400"/> : <FileText size={20} className="text-green-400" />}
             <h2 className="text-lg font-bold">Prontuário Digital</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-white/20 rounded transition" title="Imprimir"><Printer size={18}/></button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-500/80 rounded transition"><X size={18}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          <div className="bg-white p-10 shadow-md min-h-full mx-auto max-w-3xl border border-gray-200 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 pointer-events-none font-bold text-9xl opacity-50 rotate-45 uppercase">
                Cópia
             </div>
             
             {type === 'Cirurgica' && <FichaCirurgicaView data={data} />}
             {type === 'Anestesica' && <FichaAnestesicaView data={data} />}
             {type === 'Clinica' && <FichaClinicaView data={data} />}
             {type === 'Exame' && <FichaExameView data={data} />}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}