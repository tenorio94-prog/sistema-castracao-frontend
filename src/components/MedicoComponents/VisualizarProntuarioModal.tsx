"use client";

import React from 'react';
import { X, Printer, FileText, Microscope } from 'lucide-react';

export type DocumentType = 'Clinica' | 'Cirurgica' | 'Anestesica' | 'Exame';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
  type: DocumentType;
};

// ... (Componentes Auxiliares ViewBox, HeaderLabel, etc. MANTIDOS IGUAIS) ...
const ViewBox = ({ label, content }: any) => (
  <div className="border border-gray-400 rounded-sm overflow-hidden h-full bg-white">
    <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-[10px] font-bold uppercase text-gray-800 tracking-wide">{label}</div>
    <div className="p-2 text-xs text-gray-900 whitespace-pre-wrap leading-snug min-h-[60px]">{content || '-'}</div>
  </div>
);

const HeaderLabel = ({ label, value }: any) => (
  <div className="flex flex-col border-b border-gray-200 pb-1">
    <span className="text-[9px] font-bold text-gray-500 uppercase">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value || '-'}</span>
  </div>
);

// ... (FichaCirurgicaView, FichaAnestesicaView, FichaClinicaView MANTIDOS IGUAIS - Não vou repetir para economizar espaço, mas eles devem estar aqui) ...

// --- NOVO: FICHA DE EXAME ---
const FichaExameView = ({ data }: { data: any }) => (
  <div className="font-sans text-gray-900">
    <div className="text-center border-b-2 border-gray-900 pb-2 mb-6">
      <h2 className="text-xl font-bold uppercase">Ficha de Exame</h2>
      <p className="text-[10px] uppercase font-bold text-gray-500">Laboratório de Patologia - UFRPE</p>
    </div>

    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6 p-4 border border-gray-300 rounded bg-gray-50">
       <HeaderLabel label="Paciente" value={data.petName} />
       <HeaderLabel label="Data" value={data.date} />
       <HeaderLabel label="Tutor" value={data.ownerName} />
       <HeaderLabel label="Veterinário Solicitante" value={data.vet} />
       <HeaderLabel label="Tipo de Exame" value={data.examType} />
    </div>

    <div className="mb-6">
       <h3 className="font-bold uppercase text-sm border-b border-gray-400 mb-2">Resultados / Laudo</h3>
       <div className="p-4 border border-gray-300 bg-white min-h-[300px] text-xs leading-relaxed whitespace-pre-wrap font-mono text-justify">
          {data.results}
       </div>
    </div>

    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
       <p className="text-xs font-bold uppercase text-amber-800 mb-1">Observações Extras</p>
       <p className="text-xs text-gray-600">{data.freeText || "Nenhuma observação registrada."}</p>
    </div>
  </div>
);

// Placeholder das outras views (apenas para o compilador não reclamar neste bloco, mas no seu arquivo final elas devem estar completas)
const FichaCirurgicaView = ({ data }: any) => <div className="p-4">Visualização Cirúrgica (Ver código anterior)</div>;
const FichaAnestesicaView = ({ data }: any) => <div className="p-4">Visualização Anestésica (Ver código anterior)</div>;
const FichaClinicaView = ({ data }: any) => <div className="p-4">Visualização Clínica (Ver código anterior)</div>;


export default function VisualizarProntuarioModal({ isOpen, onClose, data, type }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
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
          <div className="bg-white p-10 shadow-md min-h-full mx-auto max-w-2xl border border-gray-200 relative">
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