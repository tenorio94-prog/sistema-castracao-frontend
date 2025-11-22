"use client";

import React from 'react';
import { Stethoscope, Phone, Mail, FileText, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';

// Tipagem alinhada com a página
export type MedicoUI = {
  id: number;
  userId: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  crmv: string;
  especialidade: string;
  ativo: boolean;
};

type MedicoCardProps = {
  medico: MedicoUI;
  onView: (medico: MedicoUI) => void;
  onEdit: (medico: MedicoUI) => void;
  onDelete: (medico: MedicoUI) => void;
};

export default function MedicoCard({ medico, onView, onEdit, onDelete }: MedicoCardProps) {
  const { nome, crmv, especialidade, ativo, telefone, email } = medico;

  // Cores baseadas na especialidade para facilitar identificação visual
  const isCirurgiao = especialidade.toLowerCase().includes('cirurgia');
  const badgeColor = isCirurgiao ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  const iconColor = isCirurgiao ? 'text-purple-600' : 'text-blue-600';

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      
      {/* Faixa decorativa superior */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isCirurgiao ? 'bg-purple-500' : 'bg-blue-500'}`}></div>

      {/* Header: Avatar e Info Principal */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${badgeColor} bg-opacity-20`}>
            <Stethoscope size={28} className={iconColor} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1" title={nome}>{nome}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">CRMV: {crmv}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Especialidade */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${badgeColor}`}>
          {especialidade || 'Clínica Geral'}
        </span>
      </div>

      {/* Informações de Contato */}
      <div className="space-y-2 mb-5 grow">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{telefone || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px]" title={email}>{email}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2 mt-auto border-t border-gray-100 pt-4">
        <button 
          onClick={() => onView(medico)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Ver Detalhes"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={() => onEdit(medico)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(medico)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}