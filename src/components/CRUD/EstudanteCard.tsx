import React from 'react';
import { Edit2, Trash2, Eye, GraduationCap } from 'lucide-react';

export interface EstudanteUI {
  id: number;
  userId: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  ativo: boolean;
  matricula?: string; // Campo opcional para matrícula
}

interface EstudanteCardProps {
  estudante: EstudanteUI;
  onView: (estudante: EstudanteUI) => void;
  onEdit: (estudante: EstudanteUI) => void;
  onDelete: (estudante: EstudanteUI) => void;
}

export default function EstudanteCard({ estudante, onView, onEdit, onDelete }: EstudanteCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:shadow-md hover:border-amber-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1">{estudante.nome}</h3>
            <p className="text-xs text-gray-500">Estudante</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${estudante.ativo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {estudante.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-400 w-12">Email:</span>
          <span className="truncate flex-1" title={estudante.email}>{estudante.email}</span>
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-gray-400 w-12">Tel:</span>
          <span>{estudante.telefone || '-'}</span>
        </div>
        {estudante.matricula && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-400 w-12">Matr:</span>
            <span className="font-mono text-xs">{estudante.matricula}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button onClick={() => onView(estudante)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Detalhes">
          <Eye size={18} />
        </button>
        <button onClick={() => onEdit(estudante)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
          <Edit2 size={18} />
        </button>
        <button onClick={() => onDelete(estudante)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}