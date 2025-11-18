// @/components/modals/CadastroModal.tsx
"use client"; 

import { X } from 'lucide-react';
import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  children: React.ReactNode;
  saveText?: string;
};

export default function CadastroModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  saveText = "Salvar",
}: Props) {
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
      
      <form 
        onSubmit={onSubmit}
        className="bg-white p-0 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho Fixo */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Scroll se necessário */}
        <div className="p-6 overflow-y-auto space-y-5">
          {children}
        </div>
        
        {/* Rodapé Fixo */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-gray-800 hover:shadow-xl transition-all active:scale-95"
          >
            {saveText}
          </button>
        </div>
      </form>
    </div>
  );
}