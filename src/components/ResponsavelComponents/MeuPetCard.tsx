"use client";

import React from 'react';
import { Dog, Cat, FileText, Edit3, Clock, Weight, Calendar } from 'lucide-react';

export type PetResponsavelUI = {
  id: string;
  name: string;
  species: 'Cão' | 'Gato';
  breed: string;
  gender: 'Macho' | 'Fêmea';
  age: string;
  weight: string;
  status: string;      
  lastConsult: string;
  prontuarioCode: string; // Ex: 2025-0001
};

type Props = {
  pet: PetResponsavelUI;
  onProntuario: (pet: PetResponsavelUI) => void;
  onEditar: (pet: PetResponsavelUI) => void;
};

export default function MyPetCard({ pet, onProntuario, onEditar }: Props) {
  const { name, species, age, weight, status, lastConsult } = pet;

  const Icon = species === 'Gato' ? Cat : Dog;

  return (
    <div className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-300 h-full relative overflow-hidden">
      
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
              {name}
            </h3>
            <span className="text-xs font-medium text-gray-500 block mt-0.5">
              {species}
            </span>
          </div>
        </div>
        
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
          {status}
        </span>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-2 gap-4 mb-6 grow relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Idade</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{age}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Weight size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Peso</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{weight}</p>
        </div>

        <div className="col-span-2 space-y-1 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Última Consulta</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{lastConsult}</p>
        </div>
      </div>

      {/* Novos Botões de Ação */}
      <div className="flex gap-3 mt-auto relative z-10">
        
        {/* Botão Prontuário (Grande, Escuro) */}
        <button 
          onClick={() => onProntuario(pet)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md shadow-gray-200"
        >
          <FileText size={18} />
          Prontuário
        </button>
        
        {/* Botão Editar (Pequeno, Outline) */}
        <button 
          onClick={() => onEditar(pet)}
          className="flex items-center justify-center p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all active:scale-95"
          title="Editar Informações"
        >
          <Edit3 size={20} />
        </button>
      </div>

    </div>
  );
}