// app/adm/animais/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Dog, Cat, CheckCircle2 } from 'lucide-react'; 

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import PetCard from '@/components/CRUD/PetCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';

import { AnimalService, Animal, CreateAnimalData, UpdateAnimalData } from '@/services/animal.service';
import { PetOwnerService, PetOwner } from '@/services/petowner.service';

// --- CONSTANTES E TIPOS ---
const STATUS_MAP = {
  'COMPLETED': 'Finalizado',
  'PENDING_SCREENING': 'Triagem pendente',
  'PENDING_RETURN': 'Retorno pendente',
  'UNFIT': 'Inapto',
} as const;

const STATUS_REVERSE_MAP = {
  'Finalizado': 'COMPLETED',
  'Triagem pendente': 'PENDING_SCREENING',
  'Retorno pendente': 'PENDING_RETURN',
  'Inapto': 'UNFIT',
} as const;

const SEX_MAP = { 'MALE': 'Macho', 'FEMALE': 'Fêmea' } as const;
const SEX_REVERSE_MAP = { 'Macho': 'MALE', 'Fêmea': 'FEMALE' } as const;

type StatusAnimal = 'Finalizado' | 'Triagem pendente' | 'Retorno pendente' | 'Inapto';
type SexoAnimal = 'Macho' | 'Fêmea';
type EspecieAnimal = 'Cão' | 'Gato' | ''; // Restrição de tipo

type AnimalUI = {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  sexo?: SexoAnimal;
  status?: StatusAnimal;
  responsavelId: string;
  responsavelNome?: string;
  // Foto removida
};

type AnimalForm = {
  nome: string; 
  especie: EspecieAnimal; // Select restrito
  raca: string; 
  idade: string; 
  peso: string; 
  sexo: SexoAnimal; 
  responsavelId: string;
};

const emptyForm: AnimalForm = {
  nome: '', especie: '', raca: '', idade: '', peso: '', sexo: 'Macho', responsavelId: '',
};

// Badge de Status
const StatusBadge: React.FC<{ status?: StatusAnimal }> = ({ status }) => {
  const getClasses = () => {
    switch (status) {
      case 'Finalizado': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Triagem pendente': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Retorno pendente': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Inapto': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-gray-50 text-gray-700 border border-gray-100';
    }
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getClasses()}`}>
      {status || 'N/A'}
    </span>
  );
};

export default function PaginaGestaoAnimais() {
  // --- ESTADOS ---
  const [animais, setAnimais] = useState<AnimalUI[]>([]);
  const [responsaveis, setResponsaveis] = useState<PetOwner[]>([]);
  
  // Estados de Filtro
  const [filterDog, setFilterDog] = useState(false);
  const [filterCat, setFilterCat] = useState(false);
  const [filterCastrated, setFilterCastrated] = useState(false);

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
      const response = await AnimalService.getAll();
      const data = Array.isArray(response) ? response : response.data;
      const animaisFormatados: AnimalUI[] = data.map((animal: Animal) => ({
        id: animal.id,
        nome: animal.name,
        especie: animal.species,
        raca: animal.breed,
        idade: animal.age,
        peso: animal.weight,
        sexo: animal.sex ? SEX_MAP[animal.sex] : undefined,
        status: animal.status ? STATUS_MAP[animal.status] : undefined,
        responsavelId: animal.petOwnerId,
        responsavelNome: animal.petOwner?.name,
      }));
      setAnimais(animaisFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const response = await PetOwnerService.getAll();
      setResponsaveis(Array.isArray(response) ? response : response.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadAnimais(); loadResponsaveis(); }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredAnimais = useMemo(() => {
    return animais.filter(animal => {
      // Normaliza para garantir match (Cão/Gato)
      const especie = animal.especie; 
      
      let speciesMatch = true;
      if (filterDog && filterCat) {
        speciesMatch = especie === 'Cão' || especie === 'Gato';
      } else if (filterDog) {
        speciesMatch = especie === 'Cão';
      } else if (filterCat) {
        speciesMatch = especie === 'Gato';
      }

      let statusMatch = true;
      if (filterCastrated) {
        statusMatch = animal.status === 'Finalizado';
      }

      return speciesMatch && statusMatch;
    });
  }, [animais, filterDog, filterCat, filterCastrated]);

  // --- HANDLERS ---
  
  const handleView = (animal: AnimalUI) => { setSelectedAnimal(animal); setIsViewModalOpen(true); };
  
  const handleEdit = (animal: AnimalUI) => {
    setEditFormData({
      nome: animal.nome, 
      especie: animal.especie as EspecieAnimal, 
      raca: animal.raca || '', 
      idade: animal.idade?.toString() || '',
      peso: animal.peso?.toString() || '', 
      sexo: animal.sexo || 'Macho', 
      responsavelId: animal.responsavelId,
    });
    setSelectedAnimal(animal); setIsEditModalOpen(true);
  };

  const handleDelete = async (animal: AnimalUI) => {
    if (!window.confirm(`Deletar ${animal.nome}?`)) return;
    try {
      setLoading(true); await AnimalService.delete(animal.id); await loadAnimais();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createData: CreateAnimalData = {
        name: createFormData.nome, species: createFormData.especie, breed: createFormData.raca || undefined,
        age: createFormData.idade ? parseInt(createFormData.idade) : undefined,
        weight: createFormData.peso ? parseFloat(createFormData.peso) : undefined,
        sex: SEX_REVERSE_MAP[createFormData.sexo] as any, petOwnerId: createFormData.responsavelId,
      };
      await AnimalService.create(createData); await loadAnimais();
      setIsCreateModalOpen(false); setCreateFormData(emptyForm);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedAnimal) return;
    try {
      setLoading(true);
      const updateData: UpdateAnimalData = {
        name: editFormData.nome, species: editFormData.especie, breed: editFormData.raca || undefined,
        age: editFormData.idade ? parseInt(editFormData.idade) : undefined,
        weight: editFormData.peso ? parseFloat(editFormData.peso) : undefined,
        sex: SEX_REVERSE_MAP[editFormData.sexo] as any, petOwnerId: editFormData.responsavelId,
      };
      await AnimalService.update(selectedAnimal.id, updateData); await loadAnimais();
      setIsEditModalOpen(false); setSelectedAnimal(null);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const columns: ColumnDefinition<AnimalUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Espécie', cell: (item) => <span className="text-gray-600">{item.especie}</span> },
    { header: 'Raça', cell: (item) => <span>{item.raca || '-'}</span> },
    { header: 'Sexo', cell: (item) => <span>{item.sexo || '-'}</span> },
    { header: 'Responsável', cell: (item) => <span className="text-blue-600 font-medium">{item.responsavelNome || '-'}</span> },
    { header: 'Status', cell: (item) => <StatusBadge status={item.status} /> },
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
              <button onClick={() => setFilterCastrated(!filterCastrated)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterCastrated ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <CheckCircle2 size={16} /> Castrados
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
                  breed: animal.raca || '',
                  gender: animal.sexo || '',
                  weight: animal.peso ? `${animal.peso}kg` : 'N/A',
                  age: animal.idade ? `${animal.idade} anos` : 'N/A',
                  ownerName: animal.responsavelNome || '',
                  status: animal.status === 'Finalizado' ? 'Castrado' : 'Em Tratamento',
                  // Foto removida, PetCard deve usar placeholder interno se undefined
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

      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Detalhes: ${selectedAnimal?.nome}`}>
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-gray-400 uppercase">Espécie</label><p className="font-medium">{selectedAnimal?.especie}</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Raça</label><p className="font-medium">{selectedAnimal?.raca}</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Peso</label><p className="font-medium">{selectedAnimal?.peso}kg</p></div>
               <div><label className="text-xs font-bold text-gray-400 uppercase">Idade</label><p className="font-medium">{selectedAnimal?.idade} anos</p></div>
            </div>
            <div className="pt-3 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-400 uppercase">Responsável</label>
               <p className="font-medium text-gray-900">{selectedAnimal?.responsavelNome}</p>
            </div>
         </div>
      </ViewModal>

      {/* --- MODAL DE CADASTRO --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} onSubmit={handleCreateSave} title="Novo Animal" saveText="Cadastrar">
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Nome" name="nome" value={createFormData.nome} onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} required />
            
            {/* Select de Espécie Restrito */}
            <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie *</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                 value={createFormData.especie} 
                 onChange={e => setCreateFormData({...createFormData, especie: e.target.value as EspecieAnimal})}
                 required
               >
                 <option value="">Selecione...</option>
                 <option value="Cão">Cão</option>
                 <option value="Gato">Gato</option>
               </select>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
             <FormInput label="Raça" name="raca" value={createFormData.raca} onChange={e => setCreateFormData({...createFormData, raca: e.target.value})} />
             <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo</label>
                <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" value={createFormData.sexo} onChange={e => setCreateFormData({...createFormData, sexo: e.target.value as SexoAnimal})}>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
             </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Idade (anos)" name="idade" type="number" value={createFormData.idade} onChange={e => setCreateFormData({...createFormData, idade: e.target.value})} />
            <FormInput label="Peso (kg)" name="peso" type="number" step="0.1" value={createFormData.peso} onChange={e => setCreateFormData({...createFormData, peso: e.target.value})} />
         </div>
         <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Responsável</label>
            <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" value={createFormData.responsavelId} onChange={e => setCreateFormData({...createFormData, responsavelId: e.target.value})}>
               <option value="">Selecione...</option>
               {responsaveis.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
         </div>
      </CadastroModal>

      {/* --- MODAL DE EDIÇÃO --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Animal" saveText="Salvar">
          <div className="grid grid-cols-2 gap-4">
             <FormInput label="Nome" name="nome" value={editFormData?.nome || ''} onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} />
             
             {/* Select de Espécie na Edição */}
             <div className="space-y-1">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Espécie *</label>
               <select 
                 className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                 value={editFormData?.especie || ''} 
                 onChange={e => setEditFormData(prev => prev ? {...prev, especie: e.target.value as EspecieAnimal} : null)}
                 required
               >
                 <option value="">Selecione...</option>
                 <option value="Cão">Cão</option>
                 <option value="Gato">Gato</option>
               </select>
             </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <FormInput label="Raça" name="raca" value={editFormData?.raca || ''} onChange={e => setEditFormData(prev => prev ? {...prev, raca: e.target.value} : null)} />
             <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Sexo</label>
                <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" value={editFormData?.sexo} onChange={e => setEditFormData(prev => prev ? {...prev, sexo: e.target.value as SexoAnimal} : null)}>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
             </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Idade (anos)" name="idade" type="number" value={editFormData?.idade || ''} onChange={e => setEditFormData(prev => prev ? {...prev, idade: e.target.value} : null)} />
            <FormInput label="Peso (kg)" name="peso" type="number" step="0.1" value={editFormData?.peso || ''} onChange={e => setEditFormData(prev => prev ? {...prev, peso: e.target.value} : null)} />
         </div>
         <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Responsável</label>
            <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" value={editFormData?.responsavelId} onChange={e => setEditFormData(prev => prev ? {...prev, responsavelId: e.target.value} : null)}>
               <option value="">Selecione...</option>
               {responsaveis.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
         </div>
      </CadastroModal>
    </div>
  );
}