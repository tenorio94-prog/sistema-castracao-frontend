"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Dog, Cat, PawPrint, AlertCircle } from 'lucide-react'; 
import { toast } from 'sonner'; // Usando sonner para feedback melhor que alert()

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import PetCard from '@/components/CRUD/PetCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';

import { 
  AnimalService, 
  Animal, 
  CreateAnimalData, 
  UpdateAnimalData, 
  Gender, 
  Species, 
  GENDER_LABELS, 
  SPECIES_LABELS 
} from '@/services/animal.service';
import { PetOwnerService, PetOwner } from '@/services/petowner.service';
import { UserService } from '@/services/user.service';

// --- TIPOS UI ---
type AnimalUI = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idadeEstimada: string;
  pesoTamanho: string;
  sexo: string;
  microchip: string;
  responsavelId: string;
  responsavelNome: string;
  dataCadastro: string; // Útil para visualização
};

type AnimalForm = {
  nome: string;
  especie: Species | '';
  raca: string;
  idadeEstimada: string;
  pesoTamanho: string;
  sexo: Gender | '';
  microchip: string;
  responsavelId: string;
};

const emptyForm: AnimalForm = {
  nome: '', 
  especie: '', 
  raca: '', 
  idadeEstimada: '', 
  pesoTamanho: '', 
  sexo: '', 
  microchip: '',
  responsavelId: '',
};

export default function PaginaGestaoAnimais() {
  // --- ESTADOS ---
  const [animais, setAnimais] = useState<AnimalUI[]>([]);
  const [responsaveis, setResponsaveis] = useState<PetOwner[]>([]);
  
  // Cache de usuários para evitar requisições duplicadas
  const [usersCache, setUsersCache] = useState<Map<number, { completeName: string }>> (new Map());
  
  // Estados de Filtro UI
  const [filterDog, setFilterDog] = useState(false);
  const [filterCat, setFilterCat] = useState(false);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Seleção
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalUI | null>(null);
  const [editFormData, setEditFormData] = useState<AnimalForm | null>(null);
  const [createFormData, setCreateFormData] = useState<AnimalForm>(emptyForm);
  
  // --- ESTADOS DE CARREGAMENTO SEPARADOS ---
  const [loadingTable, setLoadingTable] = useState(false); // Carrega lista
  const [loadingDetails, setLoadingDetails] = useState(false); // Carrega detalhes/edição
  const [error, setError] = useState<string | null>(null);

  // --- CARREGAMENTO DE DADOS DA TABELA ---
  const loadAnimais = async () => {
    try {
      setLoadingTable(true);
      setError(null);
      const data = await AnimalService.getAll();
      
      console.log('🐾 Animais recebidos do backend:', data);
      console.log('🐾 Exemplo de petOwner:', data[0]?.petOwner);
      console.log('🐾 Exemplo de petOwner.user:', data[0]?.petOwner?.user);
      
      // Coletar userIds únicos que precisam ser buscados
      const userIdsToFetch = new Set<number>();
      const newCache = new Map(usersCache);
      
      data.forEach((animal: Animal) => {
        if (animal.petOwner?.userId) {
          // Se não tem user aninhado e não está no cache, adiciona para buscar
          if (!animal.petOwner.user && !newCache.has(animal.petOwner.userId)) {
            userIdsToFetch.add(animal.petOwner.userId);
          }
        }
      });
      
      // Buscar usuários em paralelo (máximo de eficiência)
      if (userIdsToFetch.size > 0) {
        console.log(`🔍 Buscando dados de ${userIdsToFetch.size} usuários via UserService...`);
        const userPromises = Array.from(userIdsToFetch).map(userId => 
          UserService.getById(userId)
            .then(user => ({ userId, completeName: user.completeName }))
            .catch(err => {
              console.error(`Erro ao buscar usuário ${userId}:`, err);
              return { userId, completeName: 'Erro ao carregar' };
            })
        );
        
        const users = await Promise.all(userPromises);
        users.forEach(({ userId, completeName }) => {
          newCache.set(userId, { completeName });
        });
        
        setUsersCache(newCache);
        console.log('✅ Cache de usuários atualizado:', newCache.size, 'entradas');
      }
      
      // Formatar animais com dados do cache ou do backend
      const animaisFormatados: AnimalUI[] = data.map((animal: Animal) => {
        let responsavelNome = 'Sem responsável vinculado';
        
        if (animal.petOwner) {
          // Prioridade 1: Dados aninhados do backend
          if (animal.petOwner.user?.completeName) {
            responsavelNome = animal.petOwner.user.completeName;
          }
          // Prioridade 2: Cache local
          else if (animal.petOwner.userId && newCache.has(animal.petOwner.userId)) {
            responsavelNome = newCache.get(animal.petOwner.userId)!.completeName;
          }
        }
        
        return {
          id: animal.id.toString(),
          nome: animal.name || 'Sem nome',
          especie: SPECIES_LABELS[animal.species] || animal.species,
          raca: animal.breed || 'SRD',
          idadeEstimada: animal.estimatedAge,
          pesoTamanho: animal.sizeWeight,
          sexo: GENDER_LABELS[animal.gender] || animal.gender,
          microchip: animal.microchipNumber || 'Não informado',
          responsavelId: animal.petOwnerId.toString(),
          responsavelNome,
          dataCadastro: new Date(animal.createdAt).toLocaleDateString('pt-BR'),
        };
      });
      
      setAnimais(animaisFormatados);
    } catch (err: any) {
      const msg = err.message || 'Erro ao carregar animais';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingTable(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const data = await PetOwnerService.getAll();
      setResponsaveis(data);
    } catch (err) { 
      console.error('Erro ao carregar responsáveis para select:', err); 
    }
  };

  useEffect(() => { 
    loadAnimais(); 
    loadResponsaveis(); 
  }, []);

  // --- BUSCAR DETALHES FRESCOS (GET BY ID) ---
  const fetchFullDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const fullData = await AnimalService.getById(Number(id));
      return fullData;
    } catch (error: any) {
      toast.error('Erro ao buscar detalhes atualizados do animal.');
      throw error;
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- HANDLERS DE AÇÃO ---

  const handleView = async (animalUI: AnimalUI) => { 
    try {
      // Busca dados frescos antes de mostrar (importante se alguém editou recentemente)
      const fullData = await fetchFullDetails(animalUI.id);
      
      const animalCompleto: AnimalUI = {
        ...animalUI,
        nome: fullData.name || 'Sem nome',
        microchip: fullData.microchipNumber || 'Não informado',
        raca: fullData.breed || 'SRD',
        pesoTamanho: fullData.sizeWeight,
        idadeEstimada: fullData.estimatedAge,
        responsavelNome: fullData.petOwner?.user?.completeName || animalUI.responsavelNome
      };

      setSelectedAnimal(animalCompleto); 
      setIsViewModalOpen(true); 
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleEdit = async (animalUI: AnimalUI) => {
    try {
      // Busca dados frescos do backend para preencher o formulário
      const fullData = await fetchFullDetails(animalUI.id);

      setEditFormData({
        nome: fullData.name || '',
        especie: fullData.species, // Enum direto do backend (canine/feline)
        raca: fullData.breed || '',
        idadeEstimada: fullData.estimatedAge,
        pesoTamanho: fullData.sizeWeight,
        sexo: fullData.gender, // Enum direto do backend (male/female)
        microchip: fullData.microchipNumber || '',
        responsavelId: fullData.petOwnerId.toString(),
      });
      
      // Precisamos manter o ID para o save
      setSelectedAnimal(animalUI); 
      setIsEditModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (animal: AnimalUI) => {
    if (!window.confirm(`Tem certeza que deseja deletar o animal "${animal.nome}"?`)) return;
    
    try {
      setLoadingTable(true);
      await AnimalService.delete(Number(animal.id));
      
      // Remove apenas o animal deletado da lista local
      setAnimais(prev => prev.filter(a => a.id !== animal.id));
      
      toast.success('Animal deletado com sucesso!');
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao deletar'); 
    } finally { 
      setLoadingTable(false); 
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingTable(true);
      
      // Validações Frontend
      if (!createFormData.especie) throw new Error('Espécie é obrigatória');
      if (!createFormData.sexo) throw new Error('Sexo é obrigatório');
      if (!createFormData.idadeEstimada?.trim()) throw new Error('Idade estimada é obrigatória');
      if (!createFormData.pesoTamanho?.trim()) throw new Error('Peso/Tamanho é obrigatório');
      if (!createFormData.responsavelId) throw new Error('Responsável é obrigatório');
      
      const createData: CreateAnimalData = {
        name: createFormData.nome?.trim() || undefined,
        estimatedAge: createFormData.idadeEstimada.trim(),
        species: createFormData.especie as Species,
        gender: createFormData.sexo as Gender,
        sizeWeight: createFormData.pesoTamanho.trim(),
        breed: createFormData.raca?.trim() || undefined,
        microchipNumber: createFormData.microchip?.trim() || undefined,
        petOwnerId: Number(createFormData.responsavelId),
      };
      
      const novoAnimal = await AnimalService.create(createData);
      
      console.log('🐾 Animal criado:', novoAnimal);
      console.log('🐾 PetOwner incluído:', novoAnimal.petOwner);
      
      // Busca o animal recém-criado com dados completos
      const animalCompleto = await AnimalService.getById(novoAnimal.id);
      
      console.log('🐾 Animal completo após GET:', animalCompleto);
      
      // Determinar nome do responsável (com fallback via UserService)
      let responsavelNome = 'Sem responsável vinculado';
      
      if (animalCompleto.petOwner) {
        if (animalCompleto.petOwner.user?.completeName) {
          // Dados vieram do backend
          responsavelNome = animalCompleto.petOwner.user.completeName;
        } else if (animalCompleto.petOwner.userId) {
          // Buscar via cache ou UserService
          if (usersCache.has(animalCompleto.petOwner.userId)) {
            responsavelNome = usersCache.get(animalCompleto.petOwner.userId)!.completeName;
          } else {
            try {
              const user = await UserService.getById(animalCompleto.petOwner.userId);
              responsavelNome = user.completeName;
              // Atualizar cache
              setUsersCache(prev => new Map(prev).set(user.id, { completeName: user.completeName }));
              console.log('✅ Usuário adicionado ao cache:', user.id);
            } catch (err) {
              console.error('Erro ao buscar usuário:', err);
            }
          }
        }
      }
      
      // Adiciona à lista local sem recarregar tudo
      const animalUI: AnimalUI = {
        id: animalCompleto.id.toString(),
        nome: animalCompleto.name || 'Sem nome',
        especie: SPECIES_LABELS[animalCompleto.species] || animalCompleto.species,
        raca: animalCompleto.breed || 'SRD',
        idadeEstimada: animalCompleto.estimatedAge,
        pesoTamanho: animalCompleto.sizeWeight,
        sexo: GENDER_LABELS[animalCompleto.gender] || animalCompleto.gender,
        microchip: animalCompleto.microchipNumber || 'Não informado',
        responsavelId: animalCompleto.petOwnerId.toString(),
        responsavelNome,
        dataCadastro: new Date(animalCompleto.createdAt).toLocaleDateString('pt-BR'),
      };
      
      setAnimais(prev => [...prev, animalUI]);
      
      setIsCreateModalOpen(false); 
      setCreateFormData(emptyForm);
      toast.success('Animal cadastrado com sucesso!');
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao cadastrar'); 
    } finally { 
      setLoadingTable(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedAnimal) return;
    
    try {
      setLoadingTable(true);
      
      // Montar objeto UpdateAnimalData
      // Importante: Backend espera undefined se não for atualizar
      const updateData: UpdateAnimalData = {};
      
      if (editFormData.nome?.trim()) updateData.name = editFormData.nome.trim();
      if (editFormData.idadeEstimada?.trim()) updateData.estimatedAge = editFormData.idadeEstimada.trim();
      if (editFormData.pesoTamanho?.trim()) updateData.sizeWeight = editFormData.pesoTamanho.trim();
      
      // Campos opcionais que podem ser limpos (string vazia vira undefined no DTO se quisermos limpar?) 
      // Assumindo que string vazia atualiza para vazio ou mantém.
      // Para limpar, o ideal seria enviar null, mas o DTO espera string optional.
      if (editFormData.raca !== undefined) updateData.breed = editFormData.raca.trim();
      if (editFormData.microchip !== undefined) updateData.microchipNumber = editFormData.microchip.trim();
      
      if (editFormData.especie) updateData.species = editFormData.especie as Species;
      if (editFormData.sexo) updateData.gender = editFormData.sexo as Gender;
      
      // Nota: Não enviamos petOwnerId no update pois não é permitido transferir animal por esta rota
      
      const animalAtualizado = await AnimalService.update(Number(selectedAnimal.id), updateData);
      
      console.log('🐾 Animal atualizado:', animalAtualizado);
      
      // Busca dados completos após atualização
      const animalCompleto = await AnimalService.getById(animalAtualizado.id);
      
      // Determinar nome do responsável (com fallback via UserService)
      let responsavelNome = 'Sem responsável vinculado';
      
      if (animalCompleto.petOwner) {
        if (animalCompleto.petOwner.user?.completeName) {
          responsavelNome = animalCompleto.petOwner.user.completeName;
        } else if (animalCompleto.petOwner.userId) {
          if (usersCache.has(animalCompleto.petOwner.userId)) {
            responsavelNome = usersCache.get(animalCompleto.petOwner.userId)!.completeName;
          } else {
            try {
              const user = await UserService.getById(animalCompleto.petOwner.userId);
              responsavelNome = user.completeName;
              setUsersCache(prev => new Map(prev).set(user.id, { completeName: user.completeName }));
            } catch (err) {
              console.error('Erro ao buscar usuário:', err);
            }
          }
        }
      }
      
      // Atualiza apenas o animal modificado na lista
      setAnimais(prev => prev.map(a => 
        a.id === selectedAnimal.id
          ? {
              id: animalCompleto.id.toString(),
              nome: animalCompleto.name || 'Sem nome',
              especie: SPECIES_LABELS[animalCompleto.species] || animalCompleto.species,
              raca: animalCompleto.breed || 'SRD',
              idadeEstimada: animalCompleto.estimatedAge,
              pesoTamanho: animalCompleto.sizeWeight,
              sexo: GENDER_LABELS[animalCompleto.gender] || animalCompleto.gender,
              microchip: animalCompleto.microchipNumber || 'Não informado',
              responsavelId: animalCompleto.petOwnerId.toString(),
              responsavelNome,
              dataCadastro: new Date(animalCompleto.createdAt).toLocaleDateString('pt-BR'),
            }
          : a
      ));
      
      setIsEditModalOpen(false); 
      setSelectedAnimal(null);
      toast.success('Animal atualizado com sucesso!');
    } catch (err: any) { 
      const msg = err.response?.data?.message || err.message;
      toast.error(`Erro ao atualizar: ${msg}`);
    } finally { 
      setLoadingTable(false); 
    }
  };

  // --- FILTRAGEM ---
  const filteredAnimais = useMemo(() => {
    return animais.filter(animal => {
      let speciesMatch = true;
      // Comparando com os labels UI (Cachorro/Gato) ou raw values
      const isDog = animal.especie === 'Cachorro' || animal.especie === Species.canine;
      const isCat = animal.especie === 'Gato' || animal.especie === Species.feline;

      if (filterDog && filterCat) {
        speciesMatch = isDog || isCat;
      } else if (filterDog) {
        speciesMatch = isDog;
      } else if (filterCat) {
        speciesMatch = isCat;
      }

      return speciesMatch;
    });
  }, [animais, filterDog, filterCat]);

  // --- COLUNAS DA TABELA ---
  const columns: ColumnDefinition<AnimalUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Espécie', cell: (item) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${item.especie === 'Cachorro' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
           {item.especie === 'Cachorro' ? <Dog size={12} /> : <Cat size={12} />}
           {item.especie}
        </span>
    )},
    { header: 'Raça', cell: (item) => <span className="text-gray-600 text-sm">{item.raca}</span> },
    { header: 'Sexo', cell: (item) => <span className="text-gray-600 text-sm">{item.sexo}</span> },
    { header: 'Responsável', cell: (item) => <span className="text-blue-600 font-medium text-sm">{item.responsavelNome}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <CrudHeader
        title="Gestão de Animais"
        description="Gerencie todos os pets cadastrados no sistema."
        buttonText="Novo Animal"
        onButtonClick={() => setIsCreateModalOpen(true)}
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
        </div>
      )}

      <CrudDisplay
        data={filteredAnimais}
        columns={columns}
        searchPlaceholder="Buscar por nome, espécie ou responsável..."
        emptyMessage="Nenhum animal encontrado."
        isLoading={loadingTable}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}

        extraFilters={
          <>
             <button onClick={() => setFilterDog(!filterDog)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterDog ? 'bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-orange-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Dog size={16} /> Cães
             </button>
             <button onClick={() => setFilterCat(!filterCat)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterCat ? 'bg-purple-50 border-purple-200 text-purple-700 ring-2 ring-purple-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Cat size={16} /> Gatos
             </button>
          </>
        }

        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((animal) => (
              <PetCard
                key={animal.id}
                pet={{
                  id: Number(animal.id) || 0,
                  name: animal.nome,
                  species: animal.especie,
                  breed: animal.raca,
                  gender: animal.sexo,
                  weight: animal.pesoTamanho,
                  age: animal.idadeEstimada,
                  ownerName: animal.responsavelNome,
                  status: undefined,
                }}
                onVerProntuario={(pet) => {
                  const animalUI = animais.find(a => a.id === pet.id.toString());
                  if(animalUI) handleView(animalUI);
                }}
                onAtualizarPet={(pet) => {
                   const animalUI = animais.find(a => a.id === pet.id.toString());
                   if(animalUI) handleEdit(animalUI);
                }}
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Animal">
         {loadingDetails ? (
             <div className="flex justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
         ) : (
            <div className="space-y-5">
                {/* Cabeçalho com ícone */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center ${selectedAnimal?.especie === 'Cachorro' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                        <PawPrint size={32}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedAnimal?.nome}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-gray-100 text-gray-600">
                            {selectedAnimal?.especie} • {selectedAnimal?.sexo}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Raça</label><p className="font-medium text-gray-800">{selectedAnimal?.raca}</p></div>
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Idade</label><p className="font-medium text-gray-800">{selectedAnimal?.idadeEstimada}</p></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Peso/Porte</label><p className="font-medium text-gray-800">{selectedAnimal?.pesoTamanho}</p></div>
                   <div><label className="text-xs font-bold text-gray-400 uppercase">Microchip</label><p className="font-medium text-gray-800">{selectedAnimal?.microchip}</p></div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <label className="text-xs font-bold text-blue-400 uppercase mb-1 block">Responsável Vinculado</label>
                   <p className="font-bold text-blue-800 text-lg">{selectedAnimal?.responsavelNome}</p>
                   <p className="text-xs text-blue-600 mt-1">Cadastrado em: {selectedAnimal?.dataCadastro}</p>
                </div>
            </div>
         )}
      </ViewModal>

      {/* --- MODAL DE CADASTRO --- */}
      <CadastroModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} 
        onSubmit={handleCreateSave} 
        title="Novo Animal" 
        saveText="Cadastrar"
      >
         <FormInput 
           label="Nome do Animal" 
           name="nome" 
           value={createFormData.nome} 
           onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} 
           placeholder="Ex: Rex, Luna..."
         />
         
         <div className="grid grid-cols-2 gap-4">
            {/* Select de Espécie */}
            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie *</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                 value={createFormData.especie} 
                 onChange={e => setCreateFormData({...createFormData, especie: e.target.value as Species})}
                 required
               >
                 <option value="">Selecione...</option>
                 <option value={Species.canine}>Cachorro</option>
                 <option value={Species.feline}>Gato</option>
               </select>
            </div>
            
            {/* Select de Sexo */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo *</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={createFormData.sexo} 
                  onChange={e => setCreateFormData({...createFormData, sexo: e.target.value as Gender})}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={Gender.male}>Macho</option>
                  <option value={Gender.female}>Fêmea</option>
                </select>
             </div>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
             <FormInput 
               label="Raça" 
               name="raca" 
               value={createFormData.raca} 
               onChange={e => setCreateFormData({...createFormData, raca: e.target.value})} 
               placeholder="Ex: SRD, Labrador"
             />
             <FormInput 
               label="Microchip" 
               name="microchip" 
               value={createFormData.microchip} 
               onChange={e => setCreateFormData({...createFormData, microchip: e.target.value})} 
               placeholder="Opcional"
             />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Idade Estimada *" 
              name="idadeEstimada" 
              value={createFormData.idadeEstimada} 
              onChange={e => setCreateFormData({...createFormData, idadeEstimada: e.target.value})} 
              placeholder="Ex: 2 anos"
              required
            />
            <FormInput 
              label="Peso/Tamanho *" 
              name="pesoTamanho" 
              value={createFormData.pesoTamanho} 
              onChange={e => setCreateFormData({...createFormData, pesoTamanho: e.target.value})} 
              placeholder="Ex: 15kg, Médio"
              required
            />
         </div>
         
         <div className="space-y-1 pt-2">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Responsável (Tutor) *</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={createFormData.responsavelId} 
              onChange={e => setCreateFormData({...createFormData, responsavelId: e.target.value})}
              required
            >
               <option value="">Selecione um responsável...</option>
               {responsaveis.map(r => (
                 <option key={r.id} value={r.id}>
                   {r.user?.completeName} (CPF: {r.user?.cpf || 'N/A'})
                 </option>
               ))}
            </select>
            {responsaveis.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Nenhum responsável encontrado. Cadastre um tutor primeiro.</p>
            )}
         </div>
      </CadastroModal>

      {/* --- MODAL DE EDIÇÃO --- */}
      <CadastroModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSave} 
        title="Editar Animal" 
        saveText="Salvar Alterações"
      >
         <FormInput 
           label="Nome" 
           name="nome" 
           value={editFormData?.nome || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} 
         />
         
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                 value={editFormData?.especie || ''} 
                 onChange={e => setEditFormData(prev => prev ? {...prev, especie: e.target.value as Species} : null)}
               >
                 <option value={Species.canine}>Cachorro</option>
                 <option value={Species.feline}>Gato</option>
               </select>
            </div>
            
            <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                  value={editFormData?.sexo || ''} 
                  onChange={e => setEditFormData(prev => prev ? {...prev, sexo: e.target.value as Gender} : null)}
                >
                  <option value={Gender.male}>Macho</option>
                  <option value={Gender.female}>Fêmea</option>
                </select>
             </div>
         </div>
         
         <div className="grid grid-cols-2 gap-4">
             <FormInput 
               label="Raça" 
               name="raca" 
               value={editFormData?.raca || ''} 
               onChange={e => setEditFormData(prev => prev ? {...prev, raca: e.target.value} : null)} 
             />
             <FormInput 
               label="Microchip" 
               name="microchip" 
               value={editFormData?.microchip || ''} 
               onChange={e => setEditFormData(prev => prev ? {...prev, microchip: e.target.value} : null)} 
             />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Idade Estimada" 
              name="idadeEstimada" 
              value={editFormData?.idadeEstimada || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, idadeEstimada: e.target.value} : null)} 
            />
            <FormInput 
              label="Peso/Tamanho" 
              name="pesoTamanho" 
              value={editFormData?.pesoTamanho || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, pesoTamanho: e.target.value} : null)} 
            />
         </div>
         
         <div className="space-y-1 pt-2">
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Responsável (Não editável)</label>
            <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600">
                {responsaveis.find(r => r.id.toString() === editFormData?.responsavelId)?.user?.completeName || 'Carregando...'}
            </div>
         </div>
      </CadastroModal>
    </div>
  );
}