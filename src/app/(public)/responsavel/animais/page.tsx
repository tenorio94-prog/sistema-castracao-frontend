"use client";

import React, { useState } from 'react';
import { Search, Dog } from 'lucide-react';
import MyPetCard, { PetResponsavelUI } from '@/components/ResponsavelComponents/MeuPetCard';
import ProntuarioModal from '@/components/ResponsavelComponents/ProntuarioAnimal';
import EditarPetModal from '@/components/ResponsavelComponents/EditarPet';

// --- Mock Data ---
const mockPets: PetResponsavelUI[] = [
  {
    id: '1',
    name: 'Rex',
    species: 'Cão',
    breed: 'Labrador',
    gender: 'Macho',
    age: '3 anos',
    weight: '13kg',
    status: 'Castração Pendente',
    lastConsult: '10/09/2026',
    prontuarioCode: '2025-0001'
  },
  {
    id: '2',
    name: 'Mel',
    species: 'Gato',
    breed: 'Siamês',
    gender: 'Fêmea',
    age: '2 anos',
    weight: '4kg',
    status: 'Saudável',
    lastConsult: '15/08/2025',
    prontuarioCode: '2025-0042'
  }
];

export default function MeusAnimaisPage() {
  const [pets, setPets] = useState<PetResponsavelUI[]>(mockPets);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados dos Modais
  const [selectedPet, setSelectedPet] = useState<PetResponsavelUI | null>(null);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Handlers
  const handleOpenProntuario = (pet: PetResponsavelUI) => {
    setSelectedPet(pet);
    setIsProntuarioOpen(true);
  };

  const handleOpenEdit = (pet: PetResponsavelUI) => {
    setSelectedPet(pet);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (data: { id: string, weight: string, age: string }) => {
    setPets(prev => prev.map(p => p.id === data.id ? { ...p, weight: data.weight, age: data.age } : p));
    // alert('Dados do animal atualizados!'); // Opcional
  };

  const filteredPets = pets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      
      {/* Cabeçalho da Página (Sem botão de Adicionar) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Meus Animais</h1>
          <p className="text-gray-500 mt-1">
            Gerencie o histórico e informações dos seus pets.
          </p>
        </div>
      </div>

      {/* Barra de Filtro */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar pelo nome..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(pet => (
            <MyPetCard 
              key={pet.id} 
              pet={pet} 
              onProntuario={handleOpenProntuario}
              onEditar={handleOpenEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <Dog className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-medium">Nenhum animal encontrado.</p>
          <p className="text-gray-500 text-sm mt-1">Tente buscar por outro nome.</p>
        </div>
      )}

      {/* --- MODAIS --- */}
      <ProntuarioModal 
        isOpen={isProntuarioOpen}
        onClose={() => setIsProntuarioOpen(false)}
        pet={selectedPet}
        responsavelNome="Ana Paula" 
      />

      <EditarPetModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        pet={selectedPet}
        onSave={handleSaveEdit}
      />

    </div>
  );
}