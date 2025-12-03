"use client";

import React, { useState, useEffect } from 'react';
import { Search, Dog, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import MyPetCard, { PetResponsavelUI } from '@/components/ResponsavelComponents/MeuPetCard';
import ProntuarioModal from '@/components/ResponsavelComponents/ProntuarioAnimal';
import EditarPetModal from '@/components/ResponsavelComponents/EditarPet';
import { PetOwnerService } from '@/services/petowner.service';
import { AnimalService, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

export default function MeusAnimaisPage() {
  const [pets, setPets] = useState<PetResponsavelUI[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedPet, setSelectedPet] = useState<PetResponsavelUI | null>(null);
  const [isProntuarioOpen, setIsProntuarioOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, animalsData] = await Promise.all([
        PetOwnerService.getMe(),
        PetOwnerService.getMyPets()
      ]);

      setProfile(profileData);
      
      const petsUI: PetResponsavelUI[] = animalsData.map((animal: any) => ({
        id: animal.id.toString(),
        name: animal.name || 'Sem nome',
        species: (animal.species ? SPECIES_LABELS[animal.species as keyof typeof SPECIES_LABELS] : 'Cachorro') as 'Cachorro' | 'Gato',
        breed: animal.breed || 'SRD',
        gender: (animal.gender ? GENDER_LABELS[animal.gender as keyof typeof GENDER_LABELS] : 'Macho') as 'Macho' | 'Fêmea',
        age: animal.estimatedAge || 'N/A',
        weight: animal.sizeWeight || 'N/A',
        status: 'Cadastrado',
        lastConsult: 'N/A',
        prontuarioCode: `2025-${animal.id.toString().padStart(4, '0')}`,
        backendData: animal
      }));
      
      setPets(petsUI);
    } catch (error: any) {
      console.error('Erro ao carregar animais:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Sessão expirada', { 
          description: 'Faça login novamente para continuar.' 
        });
      } else {
        toast.error('Erro ao carregar animais', { 
          description: error.message || 'Tente novamente mais tarde.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleOpenProntuario = (pet: PetResponsavelUI) => {
    setSelectedPet(pet);
    setIsProntuarioOpen(true);
  };

  const handleOpenEdit = (pet: PetResponsavelUI) => {
    setSelectedPet(pet);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (data: { id: string, weight: string, age: string }) => {
    const pet = pets.find(p => p.id === data.id);
    
    toast.promise(
      AnimalService.update(parseInt(data.id), {
        sizeWeight: data.weight,
        estimatedAge: data.age
      }),
      {
        loading: 'Salvando alterações...',
        success: () => {
          setIsEditOpen(false);
          fetchData();
          return `Dados de ${pet?.name || 'animal'} atualizados!`;
        },
        error: (err) => {
          console.error('Erro ao atualizar animal:', err);
          
          if (err.response?.status === 403) {
            return 'Sem permissão para editar este animal';
          }
          
          const errorMsg = err.response?.data?.message;
          return Array.isArray(errorMsg) ? errorMsg[0] : (errorMsg || 'Erro ao atualizar dados');
        }
      }
    );
  };

  const filteredPets = pets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <PawPrint size={24} className="text-green-600/50" />
          </div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Carregando seus pets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-medium text-green-600 mb-1">Área do Tutor</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Meus Animais</h1>
          <p className="text-gray-500 mt-1">
            Gerencie o histórico e informações dos seus pets.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full">
          <Dog size={18} className="text-green-600" />
          <span className="text-sm font-medium text-green-700">{pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}</span>
        </div>
      </header>

      {/* Barra de Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar pelo nome..." 
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Cards */}
      {filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
          <div className="p-4 bg-gray-50 rounded-full mb-3">
            <Dog className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-medium">
            {searchTerm ? 'Nenhum animal encontrado' : 'Nenhum pet cadastrado'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm ? 'Tente buscar por outro nome.' : 'Seus pets aparecerão aqui quando cadastrados.'}
          </p>
        </div>
      )}

      {/* Modais */}
      <ProntuarioModal 
        isOpen={isProntuarioOpen}
        onClose={() => setIsProntuarioOpen(false)}
        pet={selectedPet}
        responsavelNome={profile?.user?.completeName || 'Responsável'} 
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