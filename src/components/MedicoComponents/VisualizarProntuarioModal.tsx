"use client";

import React from 'react';
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
       <HeaderLabel label="Raça/Pelagem" value={`${data.breed || ''} / ${data.coat || ''}`} />
       <HeaderLabel label="Porte/Peso" value={`${data.size || ''} / ${data.weight || ''}`} />
       <HeaderLabel label="Sexo" value={data.gender} />
       <HeaderLabel label="Idade" value={data.age} />
       <HeaderLabel label="Tutor" value={data.ownerName} />
       <HeaderLabel label="Fone" value={data.phone} />
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
         <p><strong>Início:</strong> {data.startTime} <strong>Fim:</strong> {data.endTime}</p>
       </div>

       <div className="space-y-2 bg-blue-50/50 p-3 rounded border border-blue-100 text-sm mb-4">
          <p><strong>Diag. Pré-Op:</strong> {data.preOpDiagnosis}</p>
          <p><strong>Diag. Pós-Op:</strong> {data.postOpDiagnosis}</p>
          <p><strong>Op. Proposta:</strong> {data.propSurgery}</p>
          <p><strong>Op. Realizada:</strong> {data.realSurgery}</p>
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
        {data.opDescription}
      </div>
    </div>
    
    <FreeTextField text={data.freeText} />
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
const FichaClinicaView = ({ data }: any) => <div className="p-4">Ficha Clínica View (Ver código anterior)</div>;
const FichaExameView = ({ data }: any) => <div className="p-4">Ficha Exame View (Ver código anterior)</div>;


export default function VisualizarProntuarioModal({ isOpen, onClose, data, type }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
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
}