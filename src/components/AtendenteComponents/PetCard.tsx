import React from 'react';
import { DogIcon } from 'lucide-react';

// 1. Definição do Tipo
type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  ownerName: string;
};

// 2. Props do Componente
type PetCardProps = {
  pet: Pet;
};

const speciesStyles: { [key: string]: string } = {
  Cachorro: 'bg-blue-100 text-blue-800',
  Gato: 'bg-purple-100 text-purple-800',
  Outro: 'bg-gray-100 text-gray-800',
};

export default function PetCard({ pet }: PetCardProps) {
  if (!pet) {
    return null;
  }

  const { id, name, species, breed, gender, weight, age, ownerName } = pet;
  const badgeStyle = speciesStyles[species] || speciesStyles['Outro'];

  const handleEdit = () => {
    // TODO: Lógica para editar
    console.log(`Editar pet: ${id}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <DogIcon size={22} className="text-gray-700" />
          <span className="text-xl font-bold text-gray-800">{name}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
          {species}
        </span>
      </div>
      <div className="flex-grow mb-4 space-y-1.5 text-sm text-gray-600">
        <DetailItem label="Raça" value={breed} />
        <DetailItem label="Sexo" value={gender} />
        <DetailItem label="Peso" value={weight} />
        <DetailItem label="Idade" value={age} />
        <DetailItem label="Responsável" value={ownerName} isOwner={true} />
      </div>
      <div className="flex items-center gap-3 mt-auto">
        <a 
          href={`/atendente/animais/prontuario/${id}`}
          className="flex-1 text-center px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Ver Prontuário
        </a>
        <button 
          onClick={handleEdit}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// Sub-componente com tipagem
function DetailItem({ label, value, isOwner = false }: { label: string, value: string, isOwner?: boolean }) {
  const valueClass = isOwner ? "font-medium text-gray-700" : "text-gray-800";
  return (
    <div>
      <span className="font-medium">{label}: </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}