"use client";

import React from 'react';
import { User, Building2, Phone, Mail, Edit2, Trash2, Eye } from 'lucide-react';

// Tipagem da UI (Específica para este card)
export type ResponsavelAdmUI = {
  id: string;
  nome: string;
  tipo: 'Pessoa Física' | 'ONG';
  cpf?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  nis?: string;
};

type ResponsavelCardAdmProps = {
  responsavel: ResponsavelAdmUI;
  onView: (responsavel: ResponsavelAdmUI) => void;
  onEdit: (responsavel: ResponsavelAdmUI) => void;
  onDelete: (responsavel: ResponsavelAdmUI) => void;
};

export default function ResponsavelCardAdm({ responsavel, onView, onEdit, onDelete }: ResponsavelCardAdmProps) {
  const { nome, tipo, email, telefone, cpf, cnpj } = responsavel;
  const isONG = tipo === 'ONG';
  
  const badgeColor = isONG ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
  const iconColor = isONG ? 'text-purple-600' : 'text-blue-600';

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      
      {/* Faixa decorativa */}
      <div className={`absolute top-0 left-0 w-full h-1 ${isONG ? 'bg-purple-500' : 'bg-blue-500'}`}></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isONG ? 'bg-purple-50' : 'bg-blue-50'}`}>
            {isONG ? <Building2 size={24} className={iconColor} /> : <User size={24} className={iconColor} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1" title={nome}>{nome}</h3>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-0.5">
              {isONG ? `CNPJ: ${cnpj || '-'}` : `CPF: ${cpf || '-'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Badge de Tipo */}
      <div className="mb-4">
         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${badgeColor}`}>
            {tipo}
         </span>
      </div>

      {/* Dados de Contato */}
      <div className="space-y-2 mb-5 grow">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px]" title={email}>{email || 'Sem email'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{telefone || 'Sem telefone'}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-3 gap-2 mt-auto border-t border-gray-100 pt-4">
        <button 
          onClick={() => onView(responsavel)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Ver Detalhes"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={() => onEdit(responsavel)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(responsavel)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}