"use client";

import React from 'react';
import { GraduationCap, Phone, Mail, Edit2, Trash2, Eye } from 'lucide-react';

// Tipagem da UI (Campo 'instituicao' removido)
export type EstudanteUI = {
  id: number;
  userId: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
};

type EstudanteCardProps = {
  estudante: EstudanteUI;
  onView: (estudante: EstudanteUI) => void;
  onEdit: (estudante: EstudanteUI) => void;
  onDelete: (estudante: EstudanteUI) => void;
};

export default function EstudanteCard({ estudante, onView, onEdit, onDelete }: EstudanteCardProps) {
  const { nome, email, telefone, ativo } = estudante;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      
      {/* Faixa decorativa (Âmbar para Estudantes) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1" title={nome}>{nome}</h3>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-0.5">
              Estagiário
            </p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Dados de Contato */}
      <div className="space-y-2 mb-5 grow">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px]" title={email}>{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{telefone || 'Não informado'}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-3 gap-2 mt-auto border-t border-gray-100 pt-4">
        <button 
          onClick={() => onView(estudante)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Ver Detalhes"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={() => onEdit(estudante)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(estudante)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}