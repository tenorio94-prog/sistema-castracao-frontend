"use client";

import React, { useState, useEffect } from 'react';

import PageHeader from '@/components/AtendenteComponents/PageHeader';
import PetCard from '@/components/AtendenteComponents/PetCard';
import PageSearchBar from '@/components/AtendenteComponents/BarraDeBusca';

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

// --- DADOS MOCADOS ---
const mockPets: Pet[] = [
  { id: 1, name: 'Max', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula' },
  { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Bruno Costa' },
  { id: 3, name: 'Thor', species: 'Cachorro', breed: 'Golden Retriever', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Carla Dias' },
];
// ---------------------

export default function PaginaAnimais() {
  const [busca, setBusca] = useState('');
  const [pets, setPets] = useState(mockPets);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const filtrados = mockPets.filter(pet => 
      pet.name.toLowerCase().includes(busca.toLowerCase()) ||
      pet.ownerName.toLowerCase().includes(busca.toLowerCase())
    );
    setTimeout(() => {
      setPets(filtrados);
      setLoading(false);
    }, 500);
  }, [busca]); 

  return (
    <div className="flex flex-col gap-8">

      <PageHeader 
        title="Animais Cadastrados"
        description="Gerencie os pets cadastrados no sistema"
        // Sem botão
      />

      <PageSearchBar
        title="Buscar Pet"
        placeholder="Digite o nome do pet ou responsável"
        busca={busca}
        onBuscaChange={setBusca}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Pets</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${pets.length} pet(s) encontrado(s)`}
        </p>

        {loading ? (
          <div className="text-center py-10"><p>Carregando...</p></div>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum pet encontrado.</p>
          </div>
        )}
      </div>

    </div>
  );
}