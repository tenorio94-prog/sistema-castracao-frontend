// @/components/AtendenteComponents/PetCard.tsx
"use client";

import React, { useState } from 'react';
import { DogIcon, Camera } from 'lucide-react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';

// Tipos atualizados
type PetStatus = 'Castrado' | 'Primeira Consulta' | 'Retorno Pós-Cirurgia' | 'Aguardando Cirurgia' | 'Sem Procedimentos';

type Pet = {
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
  onAtualizarPet: (petAtualizado: Pet) => void; // Callback para salvar alterações
};

const speciesStyles: { [key: string]: string } = {
  Cachorro: 'bg-blue-100 text-blue-800',
  Gato: 'bg-purple-100 text-purple-800',
  Outro: 'bg-gray-100 text-gray-800',
};

const statusStyles: { [key in PetStatus]: string } = {
  'Castrado': 'bg-green-100 text-green-800',
  'Primeira Consulta': 'bg-blue-100 text-blue-800',
  'Retorno Pós-Cirurgia': 'bg-yellow-100 text-yellow-800',
  'Aguardando Cirurgia': 'bg-orange-100 text-orange-800',
  'Sem Procedimentos': 'bg-gray-100 text-gray-800',
};

export default function PetCard({ pet, onVerProntuario, onAtualizarPet }: PetCardProps) {
  if (!pet) return null;

  const { id, name, species, breed, gender, weight, age, ownerName, photo, status, prontuario } = pet;
  const badgeStyle = speciesStyles[species] || speciesStyles['Outro'];
  const statusBadge = status ? statusStyles[status] : 'bg-gray-100 text-gray-800';

  // Estado do modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPhoto, setEditPhoto] = useState(photo || '');
  const [editWeight, setEditWeight] = useState(weight.replace('kg', ''));
  const [editAge, setEditAge] = useState(age.replace(' anos', ''));

  const handleEditClick = () => {
    setEditPhoto(photo || '');
    setEditWeight(weight.replace('kg', ''));
    setEditAge(age.replace(' anos', ''));
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

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
      <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-col h-full">
        {/* Cabeçalho com foto/espécie */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {photo ? (
              <img src={photo} alt={name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <DogIcon size={22} className="text-gray-700" />
            )}
            <span className="text-xl font-bold text-gray-800">{name}</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
            {species}
          </span>
        </div>

        {/* Status do procedimento */}
        {status && (
          <div className="mb-3">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadge}`}>
              {status}
            </span>
          </div>
        )}

        {/* Dados do pet */}
        <div className="grow mb-4 space-y-1.5 text-sm text-gray-600">
          <DetailItem label="Raça" value={breed} />
          <DetailItem label="Sexo" value={gender} />
          <DetailItem label="Peso" value={weight} />
          <DetailItem label="Idade" value={age} />
          <DetailItem label="Responsável" value={ownerName} isOwner={true} />
          {prontuario && <DetailItem label="Prontuário" value={prontuario} />}
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-3 mt-auto">
          <button
            onClick={() => onVerProntuario(pet)}
            className="flex-1 text-center px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Ver Prontuário
          </button>
          <button
            onClick={handleEditClick}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
        </div>
      </div>

      {/* ---------- Modal de Edição (apenas foto, peso, idade) ---------- */}
      <CadastroModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSubmit={handleSaveEdit}
        title="Editar Pet"
        saveText="Salvar Alterações"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Animal</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {editPhoto && (
            <div className="mt-2 relative inline-block">
              <img src={editPhoto} alt="Preview" className="h-24 w-24 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => setEditPhoto('')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade (anos)</label>
            <input
              type="number"
              value={editAge}
              onChange={(e) => setEditAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </CadastroModal>
    </>
  );
}

function DetailItem({ label, value, isOwner = false }: { label: string; value: string; isOwner?: boolean }) {
  const valueClass = isOwner ? "font-medium text-gray-700" : "text-gray-800";
  return (
    <div>
      <span className="font-medium">{label}: </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}