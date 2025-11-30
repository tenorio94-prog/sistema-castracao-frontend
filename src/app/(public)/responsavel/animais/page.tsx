"use client";

import React, { useState, useEffect } from 'react';
import { Search, Dog } from 'lucide-react';
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
          
          // Backend pode retornar 403 se o PetOwner não tiver permissão
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
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : filteredPets.length > 0 ? (
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