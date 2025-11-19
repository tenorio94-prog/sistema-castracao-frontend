// @/components/AtendenteComponents/PetCard.tsx
"use client";

import React, { useState } from 'react';
import { Dog, Cat, Scale, Calendar, User, FileText, Edit2, Camera } from 'lucide-react';
import CadastroModal from '@/components/modals/CadastroModal';

// Tipos (Fonte da verdade local ou importada)
export type PetStatus = 'Castrado' | 'Em Tratamento' | 'Aguardando Cirurgia' | 'Saudável';

export type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  ownerName: string;
  photo?: string;
  prontuario?: string;
  status?: PetStatus;
};

type PetCardProps = {
  pet: Pet;
  onVerProntuario: (pet: Pet) => void;
  onAtualizarPet: (petAtualizado: Pet) => void;
};

export default function PetCard({ pet, onVerProntuario, onAtualizarPet }: PetCardProps) {
  const { name, species, breed, weight, age, ownerName, photo, prontuario } = pet;

  // Estados de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState(photo || '');
  const [editWeight, setEditWeight] = useState(weight.replace('kg', ''));
  const [editAge, setEditAge] = useState(age.replace(' anos', ''));

  // Helpers Visuais
  const isCat = species.toLowerCase().includes('gato');
  
  const handleSaveEdit = () => {
    const petAtualizado: Pet = {
      ...pet,
      photo: editPhoto,
      weight: `${editWeight}kg`,
      age: `${editAge} anos`,
    };
    onAtualizarPet(petAtualizado);
    setIsEditModalOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col h-full">
        
        {/* Header do Card: Foto e Nome */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              {photo ? (
                <img src={photo} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  {isCat ? <Cat size={32} /> : <Dog size={32} />}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-1">{breed}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isCat ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                {species}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-2 gap-3 mb-5 grow">
          <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
              <Scale size={12} />
              <span className="text-xs font-medium uppercase">Peso</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{weight}</p>
          </div>
          <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
              <Calendar size={12} />
              <span className="text-xs font-medium uppercase">Idade</span>
            </div>
            <p className="text-sm font-semibold text-gray-700">{age}</p>
          </div>
          <div className="col-span-2 bg-gray-50/50 p-2 rounded-lg border border-gray-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                <User size={12} />
                <span className="text-xs font-medium uppercase">Tutor</span>
              </div>
              <p className="text-sm font-semibold text-gray-700 truncate max-w-[180px]">{ownerName}</p>
            </div>
          </div>
        </div>

        {/* Footer de Ações */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
          <button
            onClick={() => onVerProntuario(pet)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FileText size={14} />
            Prontuário
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            title="Editar Informações"
          >
            <Edit2 size={14} />
          </button>
        </div>

      </div>

      {/* Modal de Edição Rápida */}
      <CadastroModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSaveEdit}
        title={`Editar ${name}`}
        saveText="Salvar Alterações"
      >
        <div className="flex flex-col items-center mb-6">
          <label className="cursor-pointer group relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-colors">
              {editPhoto ? (
                <img src={editPhoto} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Camera size={24} />
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <span className="text-xs text-blue-600 font-medium mt-2 block text-center">Alterar foto</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade (anos)</label>
            <input
              type="number"
              value={editAge}
              onChange={(e) => setEditAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </CadastroModal>
    </>
  );
}