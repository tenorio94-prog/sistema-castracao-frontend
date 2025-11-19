// @/components/AtendenteComponents/ResponsavelCard.tsx
import React from 'react';
import { Phone, Mail, MapPin, Dog, User, Building2, MoreHorizontal } from 'lucide-react';

export type Responsavel = {
  id: string;
  tipo: 'PF' | 'ONG';
  nome: string;
  cpf?: string;
  nis?: string;
  cnpj?: string;
  telefone?: string; 
  animais: string[]; 
  senha: string;     
  email?: string;     
  endereco?: string;  
};

type ResponsavelCardProps = {
  responsavel: Responsavel;
  onVerDetalhes: (responsavel: Responsavel) => void;
};

export default function ResponsavelCard({ responsavel, onVerDetalhes }: ResponsavelCardProps) {
  const { tipo, nome, telefone, email, animais } = responsavel;

  const isONG = tipo === 'ONG';

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200">
      
      {/* Coluna 1: Identidade */}
      <div className="flex items-start gap-4 w-full md:w-1/3 mb-4 md:mb-0">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${isONG ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
          {isONG ? <Building2 size={20} /> : <User size={20} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-base">{nome}</h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isONG ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {tipo}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Dog size={12} />
            {animais.length > 0 ? animais.join(', ') : 'Sem pets cadastrados'}
          </p>
        </div>
      </div>

      {/* Coluna 2: Contato */}
      <div className="flex flex-col gap-1 w-full md:w-1/3 mb-4 md:mb-0 md:pl-4 md:border-l border-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={14} className="text-gray-400" />
          <span>{telefone || 'Sem telefone'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate max-w-[200px]">{email || 'Sem email'}</span>
        </div>
      </div>

      {/* Coluna 3: Ação */}
      <div className="flex justify-end w-full md:w-auto">
        <button 
          onClick={() => onVerDetalhes(responsavel)} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          Ver Perfil
        </button>
      </div>
    </div>
  );
}