// @/components/modals/CadastroModal.tsx
"use client"; 

import { X } from 'lucide-react';
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  const modalRef = useRef<HTMLFormElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Salva o elemento focado antes de abrir o modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      // Foca no primeiro input do modal após abrir
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input, select, textarea') as HTMLElement;
        firstInput?.focus();
      }, 50);
    } else {
      // Restaura o foco ao fechar
      (previousActiveElement.current as HTMLElement)?.focus?.();
    }
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Impede scroll do body quando modal está aberto
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

  // Handler para clique no backdrop
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-9999 p-4 transition-all duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <form 
        ref={modalRef}
        onSubmit={onSubmit}
        className="bg-white p-0 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
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

  // Renderiza no portal para evitar conflitos de z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}