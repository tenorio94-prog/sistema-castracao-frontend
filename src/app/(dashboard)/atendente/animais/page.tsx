// app/atendente/animais/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Dog, Search, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import PetCard, { Pet } from '@/components/CRUD/PetCard';
import CadastroModal from '@/components/modals/CadastroModal';
import ViewModal from '@/components/modals/ViewModal';
import { AnimalService, Species, Gender, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';
import { PetOwnerService } from '@/services/petowner.service';

// ---------- Tipos ----------
type PetForm = {
  name: string;
  species: Species;
  breed: string;
  gender: Gender;
  sizeWeight: string;
  estimatedAge: string;
  petOwnerId: string;
};

// ---------- Form Vazio ----------
const emptyForm: PetForm = {
  name: '', 
  species: Species.canine, 
  breed: '', 
  gender: Gender.male, 
  sizeWeight: '', 
  estimatedAge: '',
  petOwnerId: ''
};

type PetOwnerOption = { id: number; name: string; };

export default function PaginaAnimais() {
  const [busca, setBusca] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [petOwners, setPetOwners] = useState<PetOwnerOption[]>([]);
  const [formData, setFormData] = useState<PetForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProntuarioModalOpen, setIsProntuarioModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Buscar animais do backend
  const fetchPets = async () => {
    setLoading(true);
    try {
      const data = await AnimalService.getAll();
      
      // Buscar todos os petOwners para fazer o match
      const allPetOwners = await PetOwnerService.getAll();
      
      const petsUI: Pet[] = data.map(a => {
        // Tentar pegar do relacionamento direto primeiro
        let ownerName = a.petOwner?.user?.completeName;
        
        // Se não vier do relacionamento, buscar na lista de petOwners
        if (!ownerName) {
          const owner = allPetOwners.find(po => po.id === a.petOwnerId);
          ownerName = owner?.user?.completeName;
        }
        
        return {
          id: a.id,
          name: a.name || 'N/A',
          species: SPECIES_LABELS[a.species] || a.species,
          breed: a.breed || 'SRD',
          gender: GENDER_LABELS[a.gender] || a.gender,
          weight: a.sizeWeight || 'N/A',
          age: a.estimatedAge || 'N/A',
          ownerName: ownerName || 'Tutor não encontrado',
          prontuario: `${a.id.toString().padStart(4, '0')}`,
        };
      });
      
      setPets(petsUI);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar animais.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetOwners = async () => {
    try {
      const data = await PetOwnerService.getAll();
      const owners: PetOwnerOption[] = data.map(o => ({
        id: o.id,
        name: o.user?.completeName || 'N/A',
      }));
      setPetOwners(owners);
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
    }
  };

  useEffect(() => {
    fetchPets();
    fetchPetOwners();
  }, []);

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

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      if (!formData.name || !formData.petOwnerId || !formData.breed) {
        toast.warning('Preencha todos os campos obrigatórios.');
        setLoadingSubmit(false);
        return;
      }
      
      if (!formData.sizeWeight || !formData.estimatedAge) {
        toast.warning('Preencha peso/tamanho e idade estimada.');
        setLoadingSubmit(false);
        return;
      }

      await AnimalService.create({
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        sizeWeight: formData.sizeWeight,
        estimatedAge: formData.estimatedAge,
        petOwnerId: parseInt(formData.petOwnerId),
      });
      
      toast.success('Animal cadastrado com sucesso!');
      await fetchPets();
      handleCloseCreate();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao cadastrar animal.';
      toast.error(msg);
    } finally {
      setLoadingSubmit(false);
    }
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
        saveText={loadingSubmit ? "Salvando..." : "Salvar Cadastro"}
      >
        <div className="space-y-4">
          {/* Área de Upload de Foto - REMOVIDO TEMPORARIAMENTE */}

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
              <select
                name="species"
                value={formData.species}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {Object.entries(SPECIES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça *</label>
              <input
                name="breed"
                value={formData.breed}
                onChange={handleFormChange}
                required
                placeholder="Ex: SRD, Labrador, Siamês"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                {Object.entries(GENDER_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso/Tamanho *</label>
              <input
                name="sizeWeight"
                type="text"
                value={formData.sizeWeight}
                onChange={handleFormChange}
                required
                placeholder="Ex: 12kg, Grande, Médio"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade Estimada *</label>
              <input
                name="estimatedAge"
                type="text"
                value={formData.estimatedAge}
                onChange={handleFormChange}
                required
                placeholder="Ex: 3 anos, 6 meses"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsável (Tutor) *</label>
              <select
                name="petOwnerId"
                value={formData.petOwnerId}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="">Selecione o tutor</option>
                {petOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>
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