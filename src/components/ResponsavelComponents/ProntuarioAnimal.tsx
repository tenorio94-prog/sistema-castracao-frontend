"use client";

import React from 'react';
import { Dog } from 'lucide-react';
import ViewModal from '@/components/modals/ViewModal';
import { PetResponsavelUI } from './MeuPetCard';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pet: PetResponsavelUI | null;
  responsavelNome: string;
};

export default function ProntuarioModal({ isOpen, onClose, pet, responsavelNome }: Props) {
  if (!isOpen || !pet) return null;

  return (
    <ViewModal isOpen={isOpen} onClose={onClose} title="Prontuário Eletrônico">
      <div className="space-y-6">
        
        {/* Header do Pet */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
             <Dog size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold font-mono">
                {pet.prontuarioCode}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-sm font-medium">{pet.species}</span>
            </div>
          </div>
        </div>

        {/* Grid de Dados */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
           <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Raça</label>
             <p className="font-semibold text-gray-900">{pet.breed}</p>
           </div>
           <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sexo</label>
             <p className="font-semibold text-gray-900">{pet.gender}</p>
           </div>
           <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Idade</label>
             <p className="font-semibold text-gray-900">{pet.age}</p>
           </div>
           <div>
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Peso</label>
             <p className="font-semibold text-gray-900">{pet.weight}</p>
           </div>
           <div className="col-span-2">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Responsável</label>
             <p className="font-semibold text-gray-900">{responsavelNome}</p>
           </div>
        </div>

        {/* Histórico Médico */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mt-2">
           <h4 className="text-xs font-bold text-yellow-700 uppercase mb-1">Histórico Médico</h4>
           <p className="text-sm text-yellow-800/80">
             Nenhum procedimento recente registrado no sistema.
           </p>
        </div>

        {/* O botão 'Fechar' foi removido daqui pois o ViewModal já possui um no rodapé */}
      </div>
    </ViewModal>
  );
}