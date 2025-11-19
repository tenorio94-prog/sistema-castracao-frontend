"use client";

import React from 'react';
import { User, Shield, Stethoscope, GraduationCap, HeartHandshake, Phone, Mail, Edit2, Trash2, Eye, Users } from 'lucide-react';

// Tipagem da UI
export type UsuarioUI = {
  id: string;
  email: string;
  cpf?: string;
  telefone?: string;
  perfil: 'Médico' | 'Atendente' | 'Responsável' | 'Administrador' | 'Estudante' | 'SEMAS';
  crmv?: string;
  endereco?: string;
};

type UsuarioCardProps = {
  usuario: UsuarioUI;
  onView: (usuario: UsuarioUI) => void;
  onEdit: (usuario: UsuarioUI) => void;
  onDelete: (usuario: UsuarioUI) => void;
};

export default function UsuarioCard({ usuario, onView, onEdit, onDelete }: UsuarioCardProps) {
  const { email, perfil, telefone } = usuario;

  // Configuração visual baseada no Perfil
  let config = {
    color: 'bg-gray-50 text-gray-600',
    border: 'bg-gray-500',
    icon: User,
    badge: 'bg-gray-100 text-gray-700'
  };

  switch (perfil) {
    case 'Administrador':
      config = { color: 'bg-slate-100 text-slate-700', border: 'bg-slate-800', icon: Shield, badge: 'bg-slate-800 text-white' };
      break;
    case 'Médico':
      config = { color: 'bg-blue-50 text-blue-600', border: 'bg-blue-500', icon: Stethoscope, badge: 'bg-blue-100 text-blue-700' };
      break;
    case 'Atendente':
      config = { color: 'bg-teal-50 text-teal-600', border: 'bg-teal-500', icon: Users, badge: 'bg-teal-100 text-teal-700' };
      break;
    case 'Responsável':
      config = { color: 'bg-purple-50 text-purple-600', border: 'bg-purple-500', icon: HeartHandshake, badge: 'bg-purple-100 text-purple-700' };
      break;
    case 'Estudante':
      config = { color: 'bg-amber-50 text-amber-600', border: 'bg-amber-500', icon: GraduationCap, badge: 'bg-amber-100 text-amber-700' };
      break;
  }

  const Icon = config.icon;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      
      {/* Faixa decorativa */}
      <div className={`absolute top-0 left-0 w-full h-1 ${config.border}`}></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.color}`}>
            <Icon size={24} />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900 leading-tight truncate" title={email}>{email}</h3>
            <p className="text-xs text-gray-500 mt-0.5">ID: {usuario.id.substring(0, 6)}...</p>
          </div>
        </div>
      </div>

      {/* Badge de Perfil */}
      <div className="mb-4">
         <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${config.badge}`}>
            {perfil}
         </span>
      </div>

      {/* Dados de Contato */}
      <div className="space-y-2 mb-5 grow">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{telefone || 'Sem telefone'}</span>
        </div>
        {usuario.crmv && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-[10px] font-bold bg-gray-100 px-1.5 rounded text-gray-500">CRMV</span>
            <span>{usuario.crmv}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-3 gap-2 mt-auto border-t border-gray-100 pt-4">
        <button 
          onClick={() => onView(usuario)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Ver Detalhes"
        >
          <Eye size={16} />
        </button>
        <button 
          onClick={() => onEdit(usuario)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors"
          title="Editar"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(usuario)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}