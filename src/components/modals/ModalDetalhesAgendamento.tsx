"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, Stethoscope, FileText, CheckCircle2, Ban } from 'lucide-react';
import { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard';

interface ModalDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: Agendamento | null;
  onCheckIn?: () => void;
  onCancelAgendamento?: () => void;
  children?: React.ReactNode; // Propriedade essencial para aceitar o botão de Editar
}

export default function ModalDetalhesAgendamento({
  isOpen,
  onClose,
  agendamento,
  onCheckIn,
  onCancelAgendamento,
  children
}: ModalDetalhesProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Salva o elemento focado antes de abrir o modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    } else {
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

  if (!isOpen || !agendamento) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-white mb-1">{agendamento.petName}</h2>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider">
              {agendamento.pet.species}
            </span>
            <span>•</span>
            <span>{agendamento.pet.breed}</span>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-5">
          
          {/* Status Badge */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
             <span className="text-sm font-medium text-gray-500">Status Atual</span>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${agendamento.status === 'Agendado' ? 'bg-blue-50 text-blue-700' : 
                  agendamento.status === 'Confirmado' ? 'bg-green-50 text-green-700' :
                  agendamento.status === 'Cancelado' ? 'bg-red-50 text-red-700' :
                  agendamento.status === 'Concluído' ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-50 text-gray-600'
                }`}
             >
               {agendamento.status}
             </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                 <Calendar size={14} /> Data
               </div>
               <p className="font-medium text-gray-800">{agendamento.data}</p>
             </div>
             <div className="space-y-1">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                 <Clock size={14} /> Horário
               </div>
               <p className="font-medium text-gray-800">{agendamento.hora}</p>
             </div>
             <div className="col-span-2 space-y-1">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                 <Stethoscope size={14} /> Serviço
               </div>
               <p className="font-medium text-gray-800">{agendamento.tipo}</p>
             </div>
             <div className="col-span-2 space-y-1">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                 <User size={14} /> Responsável
               </div>
               <p className="font-medium text-gray-800">{agendamento.responsavel.nome}</p>
               <p className="text-gray-500 text-xs">{agendamento.responsavel.telefone}</p>
             </div>
          </div>

          {/* Observações */}
          {agendamento.observacoes && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                 <FileText size={14} /> Observações
               </div>
               <p className="text-sm text-gray-700 italic">"{agendamento.observacoes}"</p>
            </div>
          )}

          {/* Botões de Ação Padrão */}
          <div className="pt-2 grid grid-cols-2 gap-3">
             {onCancelAgendamento && (
               <button 
                 onClick={onCancelAgendamento}
                 className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
               >
                 <Ban size={16} /> Cancelar
               </button>
             )}
             
             {onCheckIn && agendamento.status !== 'Concluído' && agendamento.status !== 'Cancelado' && (
               <button 
                 onClick={onCheckIn}
                 className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
               >
                 <CheckCircle2 size={16} /> Check-in
               </button>
             )}
          </div>

          {children}

        </div>
      </div>
    </div>
  );

  // Renderiza no portal para evitar conflitos de z-index
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}