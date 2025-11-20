"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Dog, Cat, CheckCircle2 } from 'lucide-react'; 

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import PetCard from '@/components/CRUD/PetCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';

import { AnimalService, Animal, CreateAnimalData, UpdateAnimalData, Gender, Species, GENDER_LABELS, SPECIES_LABELS } from '@/services/animal.service';
import { PetOwnerService, PetOwner } from '@/services/petowner.service';

// --- TIPOS ---
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
  
  // Estados de Filtro
  const [filterDog, setFilterDog] = useState(false);
  const [filterCat, setFilterCat] = useState(false);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalUI | null>(null);
  const [editFormData, setEditFormData] = useState<AnimalForm | null>(null);
  const [createFormData, setCreateFormData] = useState<AnimalForm>(emptyForm);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- CARREGAMENTO DE DADOS ---
  const loadAnimais = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnimalService.getAll();
      
      const animaisFormatados: AnimalUI[] = data.map((animal: Animal) => ({
        id: animal.id.toString(),
        nome: animal.name || 'Sem nome',
        especie: SPECIES_LABELS[animal.species],
        raca: animal.breed || 'SRD',
        idadeEstimada: animal.estimatedAge,
        pesoTamanho: animal.sizeWeight,
        sexo: GENDER_LABELS[animal.gender],
        microchip: animal.microchipNumber || 'Não possui',
        responsavelId: animal.petOwnerId.toString(),
        responsavelNome: animal.petOwner?.user?.completeName || 'Sem responsável',
      }));
      
      setAnimais(animaisFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar animais');
      console.error('Erro ao carregar animais:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const data = await PetOwnerService.getAll();
      setResponsaveis(data);
    } catch (err) { 
      console.error('Erro ao carregar responsáveis:', err); 
    }
  };

  useEffect(() => { 
    loadAnimais(); 
    loadResponsaveis(); 
  }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredAnimais = useMemo(() => {
    return animais.filter(animal => {
      let speciesMatch = true;
      
      if (filterDog && filterCat) {
        speciesMatch = animal.especie === 'Cachorro' || animal.especie === 'Gato';
      } else if (filterDog) {
        speciesMatch = animal.especie === 'Cachorro';
      } else if (filterCat) {
        speciesMatch = animal.especie === 'Gato';
      }

      return speciesMatch;
    });
  }, [animais, filterDog, filterCat]);

  // --- HANDLERS ---
  const handleView = (animal: AnimalUI) => { 
    setSelectedAnimal(animal); 
    setIsViewModalOpen(true); 
  };
  
  const handleEdit = (animal: AnimalUI) => {
    // Converter de volta para os enums
    const especieEnum = animal.especie === 'Cachorro' ? Species.dog : Species.cat;
    const sexoEnum = animal.sexo === 'Macho' ? Gender.male : Gender.female;
    
    setEditFormData({
      nome: animal.nome === 'Sem nome' ? '' : animal.nome,
      especie: especieEnum,
      raca: animal.raca === 'SRD' ? '' : animal.raca,
      idadeEstimada: animal.idadeEstimada,
      pesoTamanho: animal.pesoTamanho,
      sexo: sexoEnum,
      microchip: animal.microchip === 'Não possui' ? '' : animal.microchip,
      responsavelId: animal.responsavelId,
    });
    setSelectedAnimal(animal); 
    setIsEditModalOpen(true);
  };

  const handleDelete = async (animal: AnimalUI) => {
    if (!window.confirm(`Deletar ${animal.nome}?`)) return;
    try {
      setLoading(true); 
      await AnimalService.delete(Number(animal.id)); 
      await loadAnimais();
      alert('Animal deletado com sucesso!');
    } catch (err: any) { 
      alert(err.message || 'Erro ao deletar'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validações
      if (!createFormData.especie) {
        alert('Espécie é obrigatória');
        setLoading(false);
        return;
      }
      
      if (!createFormData.sexo) {
        alert('Sexo é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!createFormData.idadeEstimada || createFormData.idadeEstimada.trim() === '') {
        alert('Idade estimada é obrigatória');
        setLoading(false);
        return;
      }
      
      if (!createFormData.pesoTamanho || createFormData.pesoTamanho.trim() === '') {
        alert('Peso/Tamanho é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!createFormData.responsavelId) {
        alert('Responsável é obrigatório');
        setLoading(false);
        return;
      }
      
      const createData: CreateAnimalData = {
        name: createFormData.nome || undefined,
        estimatedAge: createFormData.idadeEstimada,
        species: createFormData.especie as Species,
        gender: createFormData.sexo as Gender,
        sizeWeight: createFormData.pesoTamanho,
        breed: createFormData.raca || undefined,
        microchipNumber: createFormData.microchip || undefined,
        petOwnerId: Number(createFormData.responsavelId),
      };
      
      await AnimalService.create(createData); 
      await loadAnimais();
      setIsCreateModalOpen(false); 
      setCreateFormData(emptyForm);
      alert('Animal cadastrado com sucesso!');
    } catch (err: any) { 
      alert(err.message || 'Erro ao cadastrar'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedAnimal) return;
    
    try {
      setLoading(true);
      
      // Montar objeto apenas com campos modificados
      const updateData: UpdateAnimalData = {};
      
      if (editFormData.nome && editFormData.nome !== (selectedAnimal.nome === 'Sem nome' ? '' : selectedAnimal.nome)) {
        updateData.name = editFormData.nome;
      }
      
      if (editFormData.idadeEstimada && editFormData.idadeEstimada !== selectedAnimal.idadeEstimada) {
        updateData.estimatedAge = editFormData.idadeEstimada;
      }
      
      if (editFormData.pesoTamanho && editFormData.pesoTamanho !== selectedAnimal.pesoTamanho) {
        updateData.sizeWeight = editFormData.pesoTamanho;
      }
      
      if (editFormData.raca !== undefined) {
        updateData.breed = editFormData.raca || undefined;
      }
      
      if (editFormData.microchip !== undefined) {
        updateData.microchipNumber = editFormData.microchip || undefined;
      }
      
      if (editFormData.especie) {
        updateData.species = editFormData.especie as Species;
      }
      
      if (editFormData.sexo) {
        updateData.gender = editFormData.sexo as Gender;
      }
      
      await AnimalService.update(Number(selectedAnimal.id), updateData); 
      await loadAnimais();
      setIsEditModalOpen(false); 
      setSelectedAnimal(null);
      alert('Animal atualizado com sucesso!');
    } catch (err: any) { 
      alert(err.message || 'Erro ao atualizar'); 
    } finally { 
      setLoading(false); 
    }
  };

  const columns: ColumnDefinition<AnimalUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Espécie', cell: (item) => <span className="text-gray-600">{item.especie}</span> },
    { header: 'Raça', cell: (item) => <span className="text-gray-600">{item.raca}</span> },
    { header: 'Sexo', cell: (item) => <span className="text-gray-600">{item.sexo}</span> },
    { header: 'Idade', cell: (item) => <span className="text-gray-600">{item.idadeEstimada}</span> },
    { header: 'Responsável', cell: (item) => <span className="text-blue-600 font-medium">{item.responsavelNome}</span> },
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
        <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
      )}

      <CrudDisplay
        data={filteredAnimais} 
        columns={columns}
        searchPlaceholder="Buscar por nome, espécie ou responsável..."
        emptyMessage="Nenhum animal encontrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}

        extraFilters={
          <>
             <button onClick={() => setFilterDog(!filterDog)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterDog ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Dog size={16} /> Cães
              </button>
              <button onClick={() => setFilterCat(!filterCat)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterCat ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
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
                  status: 'Em Tratamento',
                }}
                onVerProntuario={(pet) => {
                  const animalUI = animais.find(a => a.id === pet.id.toString());
                  if(animalUI) handleView(animalUI);
                }}
                onAtualizarPet={() => {}}
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Detalhes: ${selectedAnimal?.nome}`}>
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-gray-400 uppercase">Espécie</label><p className="font-medium">{selectedAnimal?.especie}</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Raça</label><p className="font-medium">{selectedAnimal?.raca}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-gray-400 uppercase">Sexo</label><p className="font-medium">{selectedAnimal?.sexo}</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Idade Estimada</label><p className="font-medium">{selectedAnimal?.idadeEstimada}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-gray-400 uppercase">Peso/Tamanho</label><p className="font-medium">{selectedAnimal?.pesoTamanho}</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Microchip</label><p className="font-medium">{selectedAnimal?.microchip}</p></div>
            </div>
            <div className="pt-3 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-400 uppercase">Responsável</label>
               <p className="font-medium text-gray-900">{selectedAnimal?.responsavelNome}</p>
            </div>
         </div>
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
           label="Nome (Opcional)" 
           name="nome" 
           value={createFormData.nome} 
           onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} 
           placeholder="Ex: Rex"
         />
         
         <div className="grid grid-cols-2 gap-4">
            {/* Select de Espécie */}
            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie *</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                 value={createFormData.especie} 
                 onChange={e => setCreateFormData({...createFormData, especie: e.target.value as Species})}
                 required
               >
                 <option value="">Selecione...</option>
                 <option value={Species.dog}>Cachorro</option>
                 <option value={Species.cat}>Gato</option>
               </select>
            </div>
            
            {/* Select de Sexo */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo *</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
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
               label="Raça (Opcional)" 
               name="raca" 
               value={createFormData.raca} 
               onChange={e => setCreateFormData({...createFormData, raca: e.target.value})} 
               placeholder="Ex: SRD, Labrador"
             />
             <FormInput 
               label="Microchip (Opcional)" 
               name="microchip" 
               value={createFormData.microchip} 
               onChange={e => setCreateFormData({...createFormData, microchip: e.target.value})} 
               placeholder="Ex: 123456789"
             />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Idade Estimada *" 
              name="idadeEstimada" 
              value={createFormData.idadeEstimada} 
              onChange={e => setCreateFormData({...createFormData, idadeEstimada: e.target.value})} 
              placeholder="Ex: 2 anos, 6 meses"
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
         
         <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Responsável *</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
              value={createFormData.responsavelId} 
              onChange={e => setCreateFormData({...createFormData, responsavelId: e.target.value})}
              required
            >
               <option value="">Selecione...</option>
               {responsaveis.map(r => (
                 <option key={r.id} value={r.id}>
                   {r.user?.completeName || `Responsável #${r.id}`}
                 </option>
               ))}
            </select>
         </div>
      </CadastroModal>

      {/* --- MODAL DE EDIÇÃO --- */}
      <CadastroModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSave} 
        title="Editar Animal" 
        saveText="Salvar"
      >
         <FormInput 
           label="Nome" 
           name="nome" 
           value={editFormData?.nome || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} 
         />
         
         <div className="grid grid-cols-2 gap-4">
            {/* Select de Espécie */}
            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                 value={editFormData?.especie || ''} 
                 onChange={e => setEditFormData(prev => prev ? {...prev, especie: e.target.value as Species} : null)}
               >
                 <option value="">Selecione...</option>
                 <option value={Species.dog}>Cachorro</option>
                 <option value={Species.cat}>Gato</option>
               </select>
            </div>
            
            {/* Select de Sexo */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                  value={editFormData?.sexo || ''} 
                  onChange={e => setEditFormData(prev => prev ? {...prev, sexo: e.target.value as Gender} : null)}
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
         
         <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Responsável (Somente Visualização)</label>
            <input 
              type="text"
              className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none cursor-not-allowed"
              value={responsaveis.find(r => r.id.toString() === editFormData?.responsavelId)?.user?.completeName || 'Não encontrado'}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">O responsável não pode ser alterado após a criação.</p>
         </div>
      </CadastroModal>
    </div>
  );
}
