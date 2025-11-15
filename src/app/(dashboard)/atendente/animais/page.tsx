"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import PetCard from '@/components/AtendenteComponents/PetCard';

// --- DADOS MOCADOS ---
// TODO: Integração Backend: Substituir pelos dados vindos da API
const mockPets = [
  { id: 1, name: 'Max', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula' },
  { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Bruno Costa' },
  { id: 3, name: 'Thor', species: 'Cachorro', breed: 'Golden Retriever', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Carla Dias' },
  { id: 4, name: 'Mia', species: 'Gato', breed: 'Persa', gender: 'Fêmea', weight: '4kg', age: '1 ano', ownerName: 'Daniel Moreira' },
  { id: 5, name: 'Rocky', species: 'Cachorro', breed: 'Bulldog', gender: 'Macho', weight: '12kg', age: '5 anos', ownerName: 'Elisa Fernandes' },
  { id: 6, name: 'Nina', species: 'Cachorro', breed: 'Poodle', gender: 'Fêmea', weight: '8kg', age: '3 anos', ownerName: 'Fábio Guedes' },
];
// ---------------------

export default function PaginaAnimais() {
  // Estado para o filtro de busca
  const [busca, setBusca] = useState('');

  // Estado para a lista de pets
  // TODO: Integração Backend: O estado inicial será [] e será preenchido pelo fetch
  const [pets, setPets] = useState(mockPets);
  const [loading, setLoading] = useState(false);

  // TODO: Integração Backend: Implementar lógica de fetch
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      console.log(`Buscando pets com: busca='${busca}'`);
      
      // Simulação de chamada de API
      // const response = await fetch(`/api/pets?busca=${busca}`);
      // const data = await response.json();
      // setPets(data);

      // Filtrando dados mocados para simulação
      const filtrados = mockPets.filter(pet => 
        pet.name.toLowerCase().includes(busca.toLowerCase()) ||
        pet.ownerName.toLowerCase().includes(busca.toLowerCase())
      );

      setTimeout(() => { // Simula delay da rede
        setPets(filtrados);
        setLoading(false);
      }, 500);
    };

    fetchPets();
  }, [busca]); // Dependência: refaz o fetch ao mudar o termo de busca

  return (
    // O layout pai (AdmLayout) já fornece o padding (p-8)
    <div className="flex flex-col gap-8">

      {/* 1. Cabeçalho da Página (reutilizado) */}
      <PageHeader 
        title="Animais Cadastrados"
        description="Gerencie os pets cadastrados no sistema"
        // Sem botão "Novo" desta vez
      />

      {/* 2. Seção de Busca */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
        <label htmlFor="busca" className="block text-xl font-semibold text-gray-800 mb-4">
          Buscar Pet
        </label>
        <div className="relative">
          <input
            type="text"
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome do pet ou responsável"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 3. Seção da Lista de Pets */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Pets</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${pets.length} pet(s) encontrado(s)`}
        </p>

        {/* Conteúdo da Lista */}
        {loading ? (
          <div className="text-center py-10">
            <p>Carregando...</p>
          </div>
        ) : pets.length > 0 ? (
          // Grid responsivo: 1 coluna no mobile, 2 em tablets, 3 em desktops
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