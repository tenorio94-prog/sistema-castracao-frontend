import React from 'react';
import { Edit2, Trash2, Eye, User, Stethoscope, Shield, HeartHandshake, Users } from 'lucide-react';

// Definição da interface UI atualizada para incluir 'nome'
export interface UsuarioUI {
  id: string;
  nome: string; // Adicionado campo nome
  email: string;
  cpf?: string;
  telefone?: string;
  perfil: 'Médico' | 'Atendente' | 'Responsável' | 'Administrador' | 'SEMAS' | 'Estudante';
  crmv?: string;
  endereco?: string;
}

interface UsuarioCardProps {
  usuario: UsuarioUI;
  onView: (user: UsuarioUI) => void;
  onEdit: (user: UsuarioUI) => void;
  onDelete: (user: UsuarioUI) => void;
}

export default function UsuarioCard({ usuario, onView, onEdit, onDelete }: UsuarioCardProps) {
  
  const getIcon = () => {
    switch (usuario.perfil) {
      case 'Médico': return <Stethoscope size={20} className="text-blue-600" />;
      case 'Responsável': return <HeartHandshake size={20} className="text-purple-600" />;
      case 'Administrador': return <Shield size={20} className="text-slate-600" />;
      default: return <Users size={20} className="text-teal-600" />;
    }
  };

  const getBgColor = () => {
    switch (usuario.perfil) {
      case 'Médico': return 'bg-blue-50 border-blue-100';
      case 'Responsável': return 'bg-purple-50 border-purple-100';
      case 'Administrador': return 'bg-slate-50 border-slate-100';
      default: return 'bg-teal-50 border-teal-100';
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-md ${getBgColor()} border-l-4`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1">{usuario.nome}</h3>
            <p className="text-xs text-gray-500 font-medium">{usuario.perfil}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-400 w-10">Email:</span>
          <span className="truncate flex-1" title={usuario.email}>{usuario.email}</span>
        </div>
        {usuario.cpf && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-400 w-10">CPF:</span>
            <span className="font-mono text-xs">{usuario.cpf}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200/50">
        <button 
          onClick={() => onView(usuario)}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
          title="Visualizar"
        >
          <Eye size={18} />
        </button>
        <button 
          onClick={() => onEdit(usuario)}
          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-white rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
        <button 
          onClick={() => onDelete(usuario)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
          title="Excluir"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}