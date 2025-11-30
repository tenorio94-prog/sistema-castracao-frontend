"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Printer, Microscope, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  ownerName?: string;
};

// Componentes de Papel (Reutilizados)
const PaperLine = ({ label, value, placeholder, width = "w-full", className="" }: any) => (
  <div className={`flex items-end gap-1 ${className}`}>
    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">{label}:</span>
    <input 
      type="text" 
      className={`border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-amber-600 focus:outline-none placeholder:text-gray-300 ${width}`}
      defaultValue={value}
      placeholder={placeholder}
    />
  </div>
);

const LinedTextArea = ({ label, rows = 10 }: any) => (
  <div className="mt-4">
    <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0 border-b border-gray-400 pb-1">{label}</label>
    <div 
      className="w-full border-x border-b border-gray-300 bg-white"
      style={{
        backgroundImage: 'linear-gradient(transparent 23px, #e5e7eb 24px)',
        backgroundSize: '100% 24px',
        lineHeight: '24px'
      }}
    >
      <textarea 
        className="w-full bg-transparent border-none focus:ring-0 text-sm leading-6 px-2 text-blue-900 resize-none outline-none overflow-hidden font-medium"
        rows={rows}
      />
    </div>
  </div>
);

export default function FichaExameModal({ isOpen, onClose, patientName, ownerName }: Props) {
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

  const handleSave = () => {
    toast.success("Ficha de exame salva com sucesso!");
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-9999 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="bg-gray-100 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Microscope className="text-amber-600" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Ficha de Exame</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Printer size={20}/></button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-gray-500"><X size={20}/></button>
          </div>
        </div>

        {/* Corpo (Papel) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[900px] min-h-[1100px] text-gray-900 relative">
            
            {/* Cabeçalho Institucional */}
            <div className="text-center border-b-2 border-gray-900 pb-2 mb-6">
               <h1 className="text-xl font-bold uppercase">Solicitação / Resultado de Exame</h1>
               <p className="text-[10px] font-bold text-gray-600 uppercase">Laboratório de Patologia Clínica - UFRPE</p>
            </div>

            <div className="space-y-3 text-sm mb-8">
               <div className="flex justify-end"><PaperLine label="Data" width="w-32" placeholder="__/__/____"/></div>
               
               {/* Identificação */}
               <div className="grid grid-cols-12 gap-4">
                  <PaperLine label="Nome do animal" value={patientName} className="col-span-6" />
                  <PaperLine label="Espécie" className="col-span-3" />
                  <PaperLine label="Raça" className="col-span-3" />
               </div>
               <div className="grid grid-cols-12 gap-4">
                  <PaperLine label="Tutor" value={ownerName} className="col-span-8" />
                  <PaperLine label="Registro Nº" className="col-span-4" />
               </div>
               <div className="grid grid-cols-12 gap-4 mt-2">
                  <PaperLine label="Solicitante (Vet)" className="col-span-6" />
                  <PaperLine label="Laboratório" className="col-span-6" />
               </div>
            </div>

            {/* Detalhes do Exame */}
            <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Exame(s)</label>
               <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Hemograma</label>
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Bioquímico</label>
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Parasitológico</label>
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Urinálise</label>
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Citologia</label>
                  <label className="flex gap-1.5 items-center cursor-pointer"><input type="checkbox" className="accent-amber-600"/> Outros</label>
               </div>
            </div>

            {/* Laudo */}
            <div className="mt-6">
               <LinedTextArea label="RESULTADOS / LAUDO TÉCNICO" rows={15} />
            </div>

            {/* Campo Extra */}
            <div className="mt-8 pt-6 border-t-4 border-double border-gray-300">
               <LinedTextArea label="OBSERVAÇÕES ADICIONAIS / DESCRIÇÃO LIVRE" rows={6} />
            </div>

            {/* Área de Anexo */}
            <div className="mt-8 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-400 hover:bg-gray-50 hover:border-amber-400 transition-colors cursor-pointer">
                <UploadCloud size={32} className="mb-2" />
                <p className="text-xs font-bold uppercase">Anexar Imagem ou PDF do Resultado</p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200">Cancelar</button>
          <button onClick={handleSave} className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-lg flex items-center gap-2 active:scale-95">
            <Save size={18} /> Salvar Exame
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}