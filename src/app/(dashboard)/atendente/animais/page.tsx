// app/atendente/animais/page.tsx
"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import PageSearchBar from '@/components/AtendenteComponents/BarraDeBusca';
import PetCard from '@/components/AtendenteComponents/PetCard';
import CadastroModal from '@/components/modals/CadastroModal';
import ViewModal from '@/components/modals/ViewModal';
import { Plus, Dog } from 'lucide-react';

// ---------- Tipos ----------
type Pet = {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  ownerName: string;
  photo?: string; // URL da foto
  prontuario?: string; // Número do prontuário
};

type PetForm = {
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string;
  age: string;
  ownerName: string;
  photo?: string;
  prontuario?: string;
};

// ---------- Mocks ----------
const emptyForm: PetForm = {
  name: '',
  species: '',
  breed: '',
  gender: '',
  weight: '',
  age: '',
  ownerName: '',
  photo: '',
  prontuario: '',
};

const mockPets: Pet[] = [
  { id: 1, name: 'Max', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula', prontuario: '2025-0001' },
  { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Bruno Costa', prontuario: '2025-0002' },
  { id: 3, name: 'Thor', species: 'Cachorro', breed: 'Golden Retriever', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Carla Dias', prontuario: '2025-0003' },
];

// ---------- Página ----------
export default function PaginaAnimais() {
  const [busca, setBusca] = useState('');
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [formData, setFormData] = useState<PetForm>(emptyForm);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProntuarioModalOpen, setIsProntuarioModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // ----- Filtros -----
  const petsFiltrados = pets.filter(pet =>
    pet.name.toLowerCase().includes(busca.toLowerCase()) ||
    pet.ownerName.toLowerCase().includes(busca.toLowerCase())
  );

  // ----- Handlers -----
  const handleNovoAnimal = () => {
    setFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setFormData(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Pet = {
      ...formData,
      id: Date.now(),
      age: `${formData.age} anos`,
      weight: `${formData.weight}kg`,
      prontuario: formData.prontuario || `2025-${String(pets.length + 1).padStart(4, '0')}`,
    };
    setPets(prev => [novo, ...prev]);
    alert('Animal cadastrado!');
    handleCloseCreate();
  };

  const handleVerProntuario = (pet: Pet) => {
    setSelectedPet(pet);
    setIsProntuarioModalOpen(true);
  };

  const handleCloseProntuario = () => {
    setIsProntuarioModalOpen(false);
    setSelectedPet(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Animais Cadastrados"
        description="Gerencie os pets cadastrados no sistema"
        buttonLabel="Adicionar Animal"
        onButtonClick={handleNovoAnimal}
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
          {petsFiltrados.length} pet(s) encontrado(s)
        </p>

        {petsFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {petsFiltrados.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                onVerProntuario={() => handleVerProntuario(pet)}
                 onAtualizarPet={(petAtualizado) => setPets(prev => prev.map(p => p.id === petAtualizado.id ? petAtualizado : p))}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum pet encontrado.</p>
          </div>
        )}
      </div>

      {/* ---------- Modal Cadastrar Animal ---------- */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Animal"
        saveText="Cadastrar"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto do Animal</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {formData.photo && (
            <img src={formData.photo} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-lg border" />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Prontuário</label>
          <input
            name="prontuario"
            value={formData.prontuario}
            onChange={handleFormChange}
            placeholder="Ex: 2025-0001 (deixe vazio para gerar automático)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
            <input
              name="species"
              value={formData.species}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
            <input
              name="breed"
              value={formData.breed}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option value="Macho">Macho</option>
              <option value="Fêmea">Fêmea</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idade (anos)</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
          <input
            name="ownerName"
            value={formData.ownerName}
            onChange={handleFormChange}
            required
            placeholder="Nome do responsável"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </CadastroModal>

      {/* ---------- Modal Prontuário ---------- */}
      <ViewModal
        isOpen={isProntuarioModalOpen}
        onClose={handleCloseProntuario}
        title={`Prontuário - ${selectedPet?.name}`}
      >
        {selectedPet && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              {selectedPet.photo ? (
                <img src={selectedPet.photo} alt={selectedPet.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <Dog className="w-16 h-16 text-gray-400" />
              )}
              <div>
                <p className="font-bold text-lg text-gray-800">{selectedPet.name}</p>
                <p className="text-gray-500">{selectedPet.breed} • {selectedPet.species}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500">Nº Prontuário</label>
                <p className="text-gray-800">{selectedPet.prontuario}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Idade</label>
                <p className="text-gray-800">{selectedPet.age}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Peso</label>
                <p className="text-gray-800">{selectedPet.weight}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500">Sexo</label>
                <p className="text-gray-800">{selectedPet.gender}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500">Responsável</label>
              <p className="text-gray-800">{selectedPet.ownerName}</p>
            </div>

            {/* Placeholder para histórico futuro */}
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold text-gray-500 mb-2">Histórico de Procedimentos</p>
              <p className="text-gray-500 italic">Nenhum procedimento registrado.</p>
            </div>
          </div>
        )}
      </ViewModal>
    </div>
  );
}