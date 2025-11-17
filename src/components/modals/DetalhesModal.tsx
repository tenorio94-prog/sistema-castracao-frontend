// @/components/modals/DetalhesModal.tsx
"use client";

import React from 'react';
import { X } from 'lucide-react';

// 1. Definição das Props
type DetalhesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // O conteúdo (os detalhes)
};

/**
 * Modal genérico para EXIBIR detalhes.
 * Baseado na lógica do CadastroModal (não fecha ao clicar no fundo).
 */
export default function DetalhesModal({
  isOpen,
  onClose,
  title,
  children,
}: DetalhesModalProps) {
  
  if (!isOpen) {
    return null;
  }

  return (
    // Fundo (overlay)
    <div className="fixed inset-0 bg-white/75 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      
      {/* Conteúdo do Modal */}
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-200"
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo (Campos de Detalhes) */}
        <div className="space-y-3">
          {children}
        </div>
        
        {/* Rodapé */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button" 
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}