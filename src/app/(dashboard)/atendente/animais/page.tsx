// app/atendente/animais/page.tsx
"use client";

import React, { useState } from 'react';
import { Plus, Dog, Search, PawPrint } from 'lucide-react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import PetCard, { Pet } from '@/components/CRUD/PetCard';
import CadastroModal from '@/components/modals/CadastroModal';
import ViewModal from '@/components/modals/ViewModal';

// ---------- Tipos ----------
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
  name: '', species: '', breed: '', gender: '', weight: '', age: '', ownerName: '', photo: '', prontuario: '',
};

const mockPets: Pet[] = [
  { id: 1, name: 'Max', species: 'Cachorro', breed: 'Labrador', gender: 'Macho', weight: '13kg', age: '3 anos', ownerName: 'Ana Paula', prontuario: '2025-0001' },
  { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamês', gender: 'Fêmea', weight: '5kg', age: '2 anos', ownerName: 'Bruno Costa', prontuario: '2025-0002' },
  { id: 3, name: 'Thor', species: 'Cachorro', breed: 'Golden Retriever', gender: 'Macho', weight: '15kg', age: '4 anos', ownerName: 'Carla Dias', prontuario: '2025-0003' },
];

export default function PaginaAnimais() {
  const [busca, setBusca] = useState('');
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [formData, setFormData] = useState<PetForm>(emptyForm);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProntuarioModalOpen, setIsProntuarioModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Filtros
  const petsFiltrados = pets.filter(pet =>
    pet.name.toLowerCase().includes(busca.toLowerCase()) ||
    pet.ownerName.toLowerCase().includes(busca.toLowerCase())
  );

  // Handlers
  const handleNovoAnimal = () => { setFormData(emptyForm); setIsCreateModalOpen(true); };
  const handleCloseCreate = () => { setIsCreateModalOpen(false); setFormData(emptyForm); };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result as string }));
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
    handleCloseCreate();
    alert('Animal cadastrado!');
  };

  const handleVerProntuario = (pet: Pet) => { setSelectedPet(pet); setIsProntuarioModalOpen(true); };
  const handleCloseProntuario = () => { setIsProntuarioModalOpen(false); setSelectedPet(null); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader
          title="Animais e Prontuários"
          description="Gerencie o cadastro de pets e histórico médico."
        />
        <button 
          onClick={handleNovoAnimal}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus size={18} />
          <span>Adicionar Animal</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome do pet ou tutor..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* Grid de Pets */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Pets Cadastrados</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {petsFiltrados.length} resultados
          </span>
        </div>

        {petsFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <PawPrint size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">Nenhum pet encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Verifique a ortografia ou cadastre um novo.</p>
          </div>
        )}
      </div>

      {/* ---------- Modal Cadastrar Animal (Mantido) ---------- */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Animal"
        saveText="Salvar Cadastro"
      >
        <div className="space-y-4">
          {/* Área de Upload de Foto */}
          <div className="flex justify-center">
            <label className="cursor-pointer group relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-300 group-hover:border-gray-900 transition-colors flex items-center justify-center">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 font-medium text-center p-2">Adicionar<br/>Foto</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <input
                name="species"
                value={formData.species}
                onChange={handleFormChange}
                required
                placeholder="Ex: Cachorro, Gato"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tutor *</label>
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </CadastroModal>

      {/* ---------- Modal Prontuário (Apenas visualização) ---------- */}
      <ViewModal
        isOpen={isProntuarioModalOpen}
        onClose={handleCloseProntuario}
        title="Prontuário Eletrônico"
      >
        {selectedPet && (
          <div className="space-y-6">
             {/* Cabeçalho do Prontuário */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {selectedPet.photo ? (
                   <img src={selectedPet.photo} alt={selectedPet.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><Dog className="text-gray-400"/></div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">{selectedPet.prontuario}</span>
                  <span>•</span>
                  <span>{selectedPet.species}</span>
                </div>
              </div>
            </div>

            {/* Grid de Dados */}
            <div className="grid grid-cols-2 gap-6">
               <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Raça</label>
                 <p className="font-medium text-gray-800">{selectedPet.breed}</p>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sexo</label>
                 <p className="font-medium text-gray-800">{selectedPet.gender}</p>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Idade</label>
                 <p className="font-medium text-gray-800">{selectedPet.age}</p>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Peso</label>
                 <p className="font-medium text-gray-800">{selectedPet.weight}</p>
               </div>
               <div className="col-span-2">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responsável</label>
                 <p className="font-medium text-gray-800">{selectedPet.ownerName}</p>
               </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Histórico Médico</p>
              <p className="text-sm text-yellow-800">Nenhum procedimento recente registrado no sistema.</p>
            </div>
          </div>
        )}
      </ViewModal>
    </div>
  );
}